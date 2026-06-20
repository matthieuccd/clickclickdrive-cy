"""Dedupe normalized DrivingSchool records across sources.

Matching ladder (first hit wins):
  1. Exact phone match (E.164).
  2. Same website host.
  3. Fuzzy name similarity >= NAME_THRESHOLD AND within GEO_THRESHOLD_KM.

When two records collide we merge: union of sources, prefer non-null fields,
take max review_count (not sum - avoids double-counting Google reviews that
surface in multiple sources).
"""

from __future__ import annotations

import math
from collections.abc import Iterable
from urllib.parse import urlparse

import structlog
from rapidfuzz import fuzz

from scraper.models import DrivingSchool, SourceName

log = structlog.get_logger(__name__)

NAME_THRESHOLD = 88  # rapidfuzz token_set_ratio, 0-100
GEO_THRESHOLD_KM = 0.25  # ~250m: same building / strip mall


def dedupe(schools: Iterable[DrivingSchool]) -> list[DrivingSchool]:
    clusters: list[DrivingSchool] = []
    for incoming in schools:
        match_idx = _find_match(incoming, clusters)
        if match_idx is None:
            clusters.append(incoming)
        else:
            clusters[match_idx] = _merge(clusters[match_idx], incoming)
    return clusters


def _find_match(candidate: DrivingSchool, clusters: list[DrivingSchool]) -> int | None:
    for i, existing in enumerate(clusters):
        if _phones_match(candidate, existing):
            return i
        if _websites_match(candidate, existing):
            return i
        if _name_and_geo_match(candidate, existing):
            return i
    return None


def _phones_match(a: DrivingSchool, b: DrivingSchool) -> bool:
    return bool(a.phone_e164 and b.phone_e164 and a.phone_e164 == b.phone_e164)


def _websites_match(a: DrivingSchool, b: DrivingSchool) -> bool:
    ha, hb = _host(a.website), _host(b.website)
    return bool(ha and hb and ha == hb)


def _host(url: object) -> str | None:
    if url is None:
        return None
    try:
        host = urlparse(str(url)).hostname
    except ValueError:
        return None
    if not host:
        return None
    return host.lower().removeprefix("www.")


def _name_and_geo_match(a: DrivingSchool, b: DrivingSchool) -> bool:
    name_score = fuzz.token_set_ratio(a.name, b.name)
    if name_score < NAME_THRESHOLD:
        return False
    return _haversine_km(a.location.lat, a.location.lon, b.location.lat, b.location.lon) <= GEO_THRESHOLD_KM


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def _merge(existing: DrivingSchool, incoming: DrivingSchool) -> DrivingSchool:
    sources = list({*existing.sources, *incoming.sources})
    source_ids: dict[SourceName, str] = {**existing.source_ids, **incoming.source_ids}

    return existing.model_copy(
        update={
            "name_el": existing.name_el or incoming.name_el,
            "name_en": existing.name_en or incoming.name_en,
            "phone_e164": existing.phone_e164 or incoming.phone_e164,
            "website": existing.website or incoming.website,
            "rating": _pick_rating(existing, incoming),
            "review_count": max(
                existing.review_count or 0, incoming.review_count or 0
            ) or None,
            "opening_hours": existing.opening_hours or list(incoming.opening_hours),
            "sources": sources,
            "source_ids": source_ids,
        }
    )


def _pick_rating(a: DrivingSchool, b: DrivingSchool) -> float | None:
    # Prefer the rating with more review volume.
    ac, bc = a.review_count or 0, b.review_count or 0
    if ac >= bc:
        return a.rating if a.rating is not None else b.rating
    return b.rating if b.rating is not None else a.rating
