"""Google Places source.

Strategy:
  - For each Cyprus city centroid, do a Text Search with Greek query
    ("σχολή οδηγών <city>") and English fallback ("driving school <city>").
  - Page through results (Google returns up to 60 per query in 3 pages).
  - For each unique place_id, fetch Place Details for phone, website, hours,
    and reviews.
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
from tenacity import retry, stop_after_attempt, wait_exponential

from scraper.models import RawListing, Review, RoC_BBOX, SourceName

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

# Place Details fields we actually use. Keeps quota cost predictable.
DETAIL_FIELDS = (
    "place_id",
    "name",
    "formatted_address",
    "formatted_phone_number",
    "international_phone_number",
    "website",
    "geometry/location",
    "rating",
    "user_ratings_total",
    "reviews",
    "opening_hours",
    "address_components",
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
            # Token isn't valid immediately — Google requires a short delay.
            time.sleep(2)
            resp = self.client.places(query=full_query, page_token=next_token)
            for result in resp.get("results", []):
                yield result["place_id"]
            next_token = resp.get("next_page_token")

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

        reviews = [
            Review(
                author=r.get("author_name"),
                rating=float(r.get("rating", 0)),
                text=r.get("text"),
                language=r.get("language"),
            )
            for r in (result.get("reviews") or [])
        ]

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
            reviews=reviews,
            raw=result,
        )
