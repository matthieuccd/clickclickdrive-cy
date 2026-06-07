"""Normalize raw listings into canonical DrivingSchool records.

Responsibilities:
  - Phone -> E.164 (+357...).
  - Drop entries outside Republic of Cyprus bbox (TRNC, mis-geocoded).
  - Infer city from lat/lon (nearest of the 5 target cities).
  - Pick Greek and English names where available.
  - Pass opening_hours through.

Note: dedup happens in `pipeline.dedupe` AFTER normalize, so this stage
keeps one DrivingSchool per RawListing.
"""

from __future__ import annotations

import hashlib
import math
import re
from collections.abc import Iterable, Iterator

import phonenumbers
import structlog

from scraper.models import (
    CyprusCity,
    DrivingSchool,
    Location,
    RawListing,
    RoC_BBOX,
)

log = structlog.get_logger(__name__)

# (lat, lon) for nearest-city inference. Matches scraper/sources/places.py.
CITY_CENTROIDS: dict[CyprusCity, tuple[float, float]] = {
    "Nicosia": (35.1856, 33.3823),
    "Limassol": (34.7071, 33.0226),
    "Larnaca": (34.9229, 33.6233),
    "Paphos": (34.7720, 32.4297),
    "Paralimni": (35.0353, 33.9803),
}

# Greek script range — used to detect whether a name is already Greek.
_GREEK_RE = re.compile(r"[Ͱ-Ͽἀ-῿]")


def normalize_all(listings: Iterable[RawListing]) -> Iterator[DrivingSchool]:
    for raw in listings:
        school = normalize_one(raw)
        if school is not None:
            yield school


def normalize_one(raw: RawListing) -> DrivingSchool | None:
    if raw.lat is None or raw.lon is None:
        log.info("normalize.skip_no_coords", source_id=raw.source_id)
        return None

    if not _in_cyprus(raw.lat, raw.lon):
        log.info(
            "normalize.skip_out_of_country",
            source_id=raw.source_id,
            lat=raw.lat,
            lon=raw.lon,
        )
        return None

    city = nearest_city(raw.lat, raw.lon)
    location = Location(
        lat=raw.lat,
        lon=raw.lon,
        formatted_address=_clean_text(raw.address_text),
        city=city,
    )

    phone_e164 = to_e164(raw.phone)
    name = _clean_text(raw.name) or "(unnamed)"
    name_el, name_en = _split_name_by_script(name)

    return DrivingSchool(
        id=_stable_id(name, phone_e164, raw.lat, raw.lon),
        name=name,
        name_el=name_el,
        name_en=name_en,
        phone_e164=phone_e164,
        website=raw.website if raw.website else None,
        location=location,
        rating=raw.rating,
        review_count=raw.review_count,
        opening_hours=list(raw.opening_hours),
        sources=[raw.source],
        source_ids={raw.source: raw.source_id},
    )


# --- helpers --------------------------------------------------------------


def _in_cyprus(lat: float, lon: float) -> bool:
    return (
        RoC_BBOX["min_lat"] <= lat <= RoC_BBOX["max_lat"]
        and RoC_BBOX["min_lon"] <= lon <= RoC_BBOX["max_lon"]
    )


def nearest_city(lat: float, lon: float) -> CyprusCity:
    best: CyprusCity = "Nicosia"
    best_d = math.inf
    for city, (clat, clon) in CITY_CENTROIDS.items():
        d = _haversine_km(lat, lon, clat, clon)
        if d < best_d:
            best_d = d
            best = city
    return best


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def to_e164(phone: str | None) -> str | None:
    if not phone:
        return None
    try:
        parsed = phonenumbers.parse(phone, "CY")
    except phonenumbers.NumberParseException:
        return None
    if not phonenumbers.is_valid_number(parsed):
        return None
    return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)


def _clean_text(s: str | None) -> str | None:
    if s is None:
        return None
    cleaned = " ".join(s.split())
    return cleaned or None


def _split_name_by_script(name: str) -> tuple[str | None, str | None]:
    """Return (name_el, name_en).

    If the name has two halves separated by a delimiter, route each to the
    script bucket it matches (so input order doesn't matter). Otherwise
    assign the single name to whichever script it's written in.
    """
    for sep in (" / ", " — ", " - ", " | "):
        if sep in name:
            left, right = name.split(sep, 1)
            return _assign_by_script(_clean(left), _clean(right))
    only_one = _clean(name)
    if only_one and _GREEK_RE.search(only_one):
        return only_one, None
    return None, only_one


def _assign_by_script(
    a: str | None, b: str | None
) -> tuple[str | None, str | None]:
    """Sort two name halves into (greek, latin) buckets by script."""
    a_greek = bool(a and _GREEK_RE.search(a))
    b_greek = bool(b and _GREEK_RE.search(b))
    if a_greek and not b_greek:
        return a, b
    if b_greek and not a_greek:
        return b, a
    # Both Greek or both Latin — can't disambiguate, keep input order.
    return a, b


def _clean(s: str) -> str | None:
    s = s.strip()
    return s or None


def _stable_id(name: str, phone: str | None, lat: float, lon: float) -> str:
    basis = f"{name.lower()}|{phone or ''}|{lat:.4f}|{lon:.4f}"
    return hashlib.sha1(basis.encode("utf-8")).hexdigest()[:16]
