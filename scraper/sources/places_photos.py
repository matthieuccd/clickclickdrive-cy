"""Google Place Photos source.

Re-queries Place Details for each known place_id requesting only the
`photos` field (legacy Basic SKU, ~$0.017/call), then calls the Place Photos
endpoint (~$0.007/photo) for each photo_reference to download up to
MAX_PHOTOS_PER_SCHOOL image binaries per school.

Saves to {public_dir}/schools/{school_id}/{n}.jpg.

Cache policy note: Google's terms allow caching Places photo bytes for up
to 30 days. The expected ops cadence is a scheduled re-fetch — yearly per
the current call, with the option to drop to monthly without code change.
"""

from __future__ import annotations

import os
from pathlib import Path

import googlemaps
import structlog
from googlemaps.exceptions import ApiError
from tenacity import retry, stop_after_attempt, wait_exponential

log = structlog.get_logger(__name__)

MAX_PHOTOS_PER_SCHOOL = 3
PHOTO_MAX_WIDTH_PX = 1200


class PlacePhotosSource:
    """Fetches photos for a known place_id and saves them under public_dir."""

    def __init__(self, public_dir: Path, api_key: str | None = None) -> None:
        key = api_key or os.environ.get("GOOGLE_PLACES_API_KEY")
        if not key:
            raise RuntimeError(
                "GOOGLE_PLACES_API_KEY is not set. "
                "Add it to .env or pass api_key= explicitly."
            )
        self.client = googlemaps.Client(key=key)
        self.public_dir = public_dir

    def fetch_for(self, place_id: str, school_id: str) -> list[str]:
        """Download up to MAX_PHOTOS_PER_SCHOOL photos for one school.

        Returns the list of public-relative paths actually written
        (e.g. ["/schools/<id>/1.jpg", ...]). Empty list if no photos.
        """
        refs = self._fetch_photo_refs(place_id)
        if not refs:
            log.info("photos.none", place_id=place_id, school_id=school_id)
            return []

        out_dir = self.public_dir / "schools" / school_id
        out_dir.mkdir(parents=True, exist_ok=True)

        saved: list[str] = []
        for i, ref in enumerate(refs[:MAX_PHOTOS_PER_SCHOOL], start=1):
            binary = self._fetch_photo_binary(ref)
            if binary is None:
                continue
            path = out_dir / f"{i}.jpg"
            path.write_bytes(binary)
            saved.append(f"/schools/{school_id}/{i}.jpg")
            log.info(
                "photos.saved", school_id=school_id, idx=i, bytes=len(binary)
            )
        return saved

    # --- internals ------------------------------------------------------

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
    def _fetch_photo_refs(self, place_id: str) -> list[str]:
        # Field is 'photo' (singular) in the legacy Places SDK; the response
        # key is 'photos' (plural) — easy to confuse.
        resp = self.client.place(place_id=place_id, fields=["photo"])
        photos = (resp.get("result") or {}).get("photos") or []
        return [p["photo_reference"] for p in photos if "photo_reference" in p]

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
    def _fetch_photo_binary(self, photo_reference: str) -> bytes | None:
        try:
            chunks = self.client.places_photo(
                photo_reference, max_width=PHOTO_MAX_WIDTH_PX
            )
        except ApiError as exc:
            log.warning(
                "photos.fetch_failed",
                photo_reference=photo_reference[:24],
                error=str(exc),
            )
            return None
        return b"".join(chunks)
