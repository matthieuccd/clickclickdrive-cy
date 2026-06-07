"""Pydantic models for the CCD Cyprus scraper.

Two layers:
  - `RawListing`: whatever a source emits before normalization.
  - `DrivingSchool`: the canonical, deduped marketplace record.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

CyprusCity = Literal["Nicosia", "Limassol", "Larnaca", "Paphos", "Paralimni"]


class SourceName(str, Enum):
    GOOGLE_PLACES = "google_places"
    DIRECTORY = "directory"


# Republic of Cyprus bounding box (EU territory only — excludes Northern Cyprus).
# Used by the normalize pipeline to reject out-of-country geocodes.
RoC_BBOX = {
    "min_lat": 34.55,
    "max_lat": 35.20,
    "min_lon": 32.25,
    "max_lon": 34.65,
}


class Location(BaseModel):
    model_config = ConfigDict(frozen=True)

    lat: float
    lon: float
    address: str | None = None
    city: CyprusCity | None = None
    postal_code: str | None = None

    def is_in_republic_of_cyprus(self) -> bool:
        return (
            RoC_BBOX["min_lat"] <= self.lat <= RoC_BBOX["max_lat"]
            and RoC_BBOX["min_lon"] <= self.lon <= RoC_BBOX["max_lon"]
        )


class Review(BaseModel):
    author: str | None = None
    rating: float = Field(ge=0, le=5)
    text: str | None = None
    language: str | None = None
    created_at: datetime | None = None


class RawListing(BaseModel):
    """Whatever a source emits before normalization."""

    source: SourceName
    source_id: str
    name: str
    phone: str | None = None
    website: str | None = None
    email: str | None = None
    address_text: str | None = None
    lat: float | None = None
    lon: float | None = None
    rating: float | None = None
    review_count: int | None = None
    reviews: list[Review] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
    raw: dict = Field(default_factory=dict)


class DrivingSchool(BaseModel):
    """Canonical marketplace record after normalize + dedupe."""

    id: str
    name: str
    name_el: str | None = None
    name_en: str | None = None
    phone_e164: str | None = None
    website: HttpUrl | None = None
    email: str | None = None
    location: Location
    rating: float | None = Field(default=None, ge=0, le=5)
    review_count: int | None = Field(default=None, ge=0)
    reviews: list[Review] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
    sources: list[SourceName] = Field(default_factory=list)
    source_ids: dict[SourceName, str] = Field(default_factory=dict)
