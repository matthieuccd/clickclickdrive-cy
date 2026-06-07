"""Google Places source.

Strategy:
  - For each Cyprus city centroid, do a Text Search with Greek query
    ("σχολή οδηγών <city>") and English fallback ("driving school <city>").
  - Page through results (Google returns up to 60 per query in 3 pages).
  - For each unique place_id, fetch Place Details for the locked schema:
    name, formatted address, lat/lng, phone, website, rating, review count,
    opening hours.
  - Yield RawListing objects. Filter out anything outside the Republic of
    Cyprus bounding box (i.e. Northern Cyprus / TRNC).

Requires `GOOGLE_PLACES_API_KEY` in the environment.
"""

from __future__ import annotations

import os
import time
from collections.abc import Iterable, Iterator
from dataclasses import dataclass

import googlemaps
import structlog
from googlemaps.exceptions import ApiError
from tenacity import retry, stop_after_attempt, wait_exponential

from scraper.models import RawListing, RoC_BBOX, SourceName

log = structlog.get_logger(__name__)


@dataclass(frozen=True)
class CityCentroid:
    name: str
    lat: float
    lon: float


CYPRUS_CITIES: tuple[CityCentroid, ...] = (
    CityCentroid("Nicosia", 35.1856, 33.3823),
    CityCentroid("Limassol", 34.7071, 33.0226),
    CityCentroid("Larnaca", 34.9229, 33.6233),
    CityCentroid("Paphos", 34.7720, 32.4297),
    CityCentroid("Paralimni", 35.0353, 33.9803),
)

QUERIES_BY_LANG: tuple[tuple[str, str], ...] = (
    ("el", "σχολή οδηγών"),
    ("en", "driving school"),
)

# Place Details field mask — locked to the captured schema.
# Basic SKU: name, formatted_address, geometry/location, opening_hours.
# Contact SKU: international_phone_number, formatted_phone_number, website.
# Atmosphere SKU: rating, user_ratings_total.
DETAIL_FIELDS = (
    "place_id",
    "name",
    "formatted_address",
    "geometry/location",
    "opening_hours",
    "international_phone_number",
    "formatted_phone_number",
    "website",
    "rating",
    "user_ratings_total",
)


def _in_cyprus_bbox(lat: float, lon: float) -> bool:
    return (
        RoC_BBOX["min_lat"] <= lat <= RoC_BBOX["max_lat"]
        and RoC_BBOX["min_lon"] <= lon <= RoC_BBOX["max_lon"]
    )


class GooglePlacesSource:
    """Iterable source: yields RawListing per unique driving school in Cyprus."""

    name = SourceName.GOOGLE_PLACES

    def __init__(self, api_key: str | None = None) -> None:
        key = api_key or os.environ.get("GOOGLE_PLACES_API_KEY")
        if not key:
            raise RuntimeError(
                "GOOGLE_PLACES_API_KEY is not set. "
                "Add it to .env or pass api_key= explicitly."
            )
        self.client = googlemaps.Client(key=key)

    def fetch(self) -> Iterator[RawListing]:
        seen: set[str] = set()
        for city in CYPRUS_CITIES:
            for lang, query in QUERIES_BY_LANG:
                for place_id in self._text_search(city, query, lang):
                    if place_id in seen:
                        continue
                    seen.add(place_id)
                    listing = self._fetch_details(place_id)
                    if listing is None:
                        continue
                    yield listing

    # --- internals ------------------------------------------------------

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
    def _text_search(self, city: CityCentroid, query: str, lang: str) -> Iterable[str]:
        full_query = f"{query} {city.name}"
        log.info("places.text_search", query=full_query, lang=lang)
        resp = self.client.places(
            query=full_query,
            location=(city.lat, city.lon),
            radius=15000,  # meters; covers each city + nearby suburbs
            language=lang,
            region="cy",
        )
        for result in resp.get("results", []):
            yield result["place_id"]

        # Google paginates with next_page_token (up to 3 pages, ~60 results).
        next_token = resp.get("next_page_token")
        while next_token:
            page = self._fetch_next_page(full_query, next_token)
            if page is None:
                break
            for result in page.get("results", []):
                yield result["place_id"]
            next_token = page.get("next_page_token")

    def _fetch_next_page(self, query: str, token: str) -> dict | None:
        """Fetch the next Text Search page.

        Google requires a short delay between issuing a `next_page_token` and
        using it — typically 2 s, but sometimes longer. The error surfaces as
        an `INVALID_REQUEST`, which we treat as "token not ripe yet" and
        retry with backoff. Returns None when the token never matures.
        """
        for delay in (2.0, 3.0, 5.0, 8.0):
            time.sleep(delay)
            try:
                return self.client.places(query=query, page_token=token)
            except ApiError as exc:
                if "INVALID_REQUEST" not in str(exc):
                    raise
                log.info("places.page_token_not_ready", waited=delay)
        log.warning("places.page_token_exhausted", query=query)
        return None

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
    def _fetch_details(self, place_id: str) -> RawListing | None:
        resp = self.client.place(
            place_id=place_id,
            fields=list(DETAIL_FIELDS),
            language="el",
        )
        result = resp.get("result")
        if not result:
            return None

        geom = result.get("geometry", {}).get("location", {})
        lat = geom.get("lat")
        lon = geom.get("lng")
        if lat is None or lon is None:
            log.warning("places.skip_no_geo", place_id=place_id)
            return None
        if not _in_cyprus_bbox(lat, lon):
            # Likely Northern Cyprus / TRNC — out of scope (EU territory only).
            log.info("places.skip_out_of_bbox", place_id=place_id, lat=lat, lon=lon)
            return None

        opening_hours = (result.get("opening_hours") or {}).get("weekday_text") or []

        return RawListing(
            source=SourceName.GOOGLE_PLACES,
            source_id=place_id,
            name=result.get("name", "").strip(),
            phone=result.get("international_phone_number")
            or result.get("formatted_phone_number"),
            website=result.get("website"),
            address_text=result.get("formatted_address"),
            lat=lat,
            lon=lon,
            rating=result.get("rating"),
            review_count=result.get("user_ratings_total"),
            opening_hours=list(opening_hours),
            raw=result,
        )
