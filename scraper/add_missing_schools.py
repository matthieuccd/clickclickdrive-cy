"""Add directory-sourced schools that have no Google My Business presence.

These schools were found via businesslink.com.cy, cytayellowpages.com.cy,
oncyprus.com, index.cy, and individual school websites.  They are real,
operating driving schools in the Republic of Cyprus that the Google Places
scraper missed because they lack a GMB listing.

Run:
    python -m scraper.add_missing_schools
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from scraper.slugs import school_slug_el, school_slug_en

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ENRICHED = PROJECT_ROOT / "scraper" / "output" / "schools_enriched.jsonl"
BASE = PROJECT_ROOT / "scraper" / "output" / "schools.jsonl"


def _stable_id(name: str, phone: str | None, lat: float, lon: float) -> str:
    basis = f"{name.lower()}|{phone or ''}|{lat:.4f}|{lon:.4f}"
    return hashlib.sha1(basis.encode("utf-8")).hexdigest()[:16]


def _make(
    name: str,
    name_el: str | None,
    name_en: str | None,
    lat: float,
    lon: float,
    city: str,
    formatted_address: str | None = None,
    phone_e164: str | None = None,
    website: str | None = None,
    rating: float | None = None,
    review_count: int | None = None,
) -> dict:
    sid = _stable_id(name, phone_e164, lat, lon)
    return {
        "id": sid,
        "name": name,
        "name_el": name_el,
        "name_en": name_en,
        "phone_e164": phone_e164,
        "website": website,
        "location": {
            "lat": lat,
            "lon": lon,
            "formatted_address": formatted_address,
            "city": city,
        },
        "rating": rating,
        "review_count": review_count,
        "opening_hours": [],
        "sources": ["directory"],
        "source_ids": {},
        "photo_paths": [],
        "slug_el": school_slug_el(name_el, name, sid),
        "slug_en": school_slug_en(name_en, name, sid),
    }


# ---------------------------------------------------------------------------
# All missing schools, grouped by city
# Sources: businesslink.com.cy, cytayellowpages.com.cy, oncyprus.com,
#          index.cy, individual school websites.
# Coordinates are approximate - accurate enough for city-grouping purposes.
# ---------------------------------------------------------------------------

MISSING_SCHOOLS = [
    # ── NICOSIA ────────────────────────────────────────────────────────────
    _make(
        name="Georgiou Driving School",
        name_el=None,
        name_en="Georgiou Driving School",
        lat=35.1560,
        lon=33.3415,
        city="Nicosia",
        formatted_address="Lakatamia, Nicosia, Cyprus",
        phone_e164="+35799644403",
        website="http://www.georgioudrivingschool.com",
    ),
    _make(
        name="Avramis Driving School",
        name_el="Σχολή Οδηγών Αβράμης",
        name_en="Avramis Driving School",
        lat=35.1740,
        lon=33.3691,
        city="Nicosia",
        formatted_address="Arsinois 20, 2031 Nicosia, Cyprus",
        phone_e164="+35796444435",
    ),
    _make(
        name="Apollon Scholi Odigon Ltd",
        name_el="Απόλλων Σχολή Οδηγών ΛΤΔ",
        name_en="Apollon Scholi Odigon Ltd",
        lat=35.1630,
        lon=33.3525,
        city="Nicosia",
        formatted_address="Pentelikou 27, Agios Dometios, Nicosia, Cyprus",
        phone_e164="+35722770215",
    ),
    _make(
        name="Koullis Driving School",
        name_el="Σχολή Οδηγών Κούλλης",
        name_en="Koullis Driving School",
        lat=35.1554,
        lon=33.3462,
        city="Nicosia",
        formatted_address="43 Arch. Kyprianou, Agios Pavlos, Nicosia, Cyprus",
        phone_e164="+35799626806",
        website="http://www.koullis.com.cy",
    ),
    _make(
        name="Σχολή Οδηγών Πάμπος",
        name_el="Σχολή Οδηγών Πάμπος",
        name_en="Pambos Driving School",
        lat=35.1680,
        lon=33.3640,
        city="Nicosia",
        formatted_address="Pythagoras 7, Nicosia, Cyprus",
        phone_e164="+35799637083",
        website="http://www.pambosdrivingschool.com",
    ),
    # ── LIMASSOL ───────────────────────────────────────────────────────────
    _make(
        name="Αλέξης Σχολή Οδηγών",
        name_el="Αλέξης Σχολή Οδηγών",
        name_en="Alexis Driving School",
        lat=34.6951,
        lon=33.0373,
        city="Limassol",
        formatted_address="Κέδρων 13, Αγ. Αθανάσιος, Limassol, Cyprus",
        phone_e164="+35799545732",
    ),
    _make(
        name="A. Pourgouris & K. Neophytou Driving School",
        name_el=None,
        name_en="A. Pourgouris & K. Neophytou Driving School",
        lat=34.6772,
        lon=33.0443,
        city="Limassol",
        formatted_address="26 I. Kranidioti Str., Limassol, Cyprus",
        phone_e164="+35725334600",
    ),
    _make(
        name="Achillis Driving School",
        name_el="Αχιλλής Σχολή Οδηγών",
        name_en="Achillis Driving School",
        lat=34.7002,
        lon=33.0212,
        city="Limassol",
        formatted_address="68 M. Drakou Str., Mesa Gitonia, Limassol, Cyprus",
        phone_e164="+35725723244",
    ),
    _make(
        name="Andronicou Andreas & Irini Driving School",
        name_el=None,
        name_en="Andronicou Andreas & Irini Driving School",
        lat=34.7005,
        lon=33.0215,
        city="Limassol",
        formatted_address="16A Arch. Kyprianou Str., Mesa Gitonia, Limassol, Cyprus",
        phone_e164="+35725722915",
    ),
    _make(
        name="Andronicou Kokos Driving School",
        name_el=None,
        name_en="Andronicou Kokos Driving School",
        lat=34.6770,
        lon=33.0370,
        city="Limassol",
        formatted_address="9A Armodiou Str., Limassol, Cyprus",
        phone_e164="+35725338389",
    ),
    _make(
        name="Aresti Iason Driving School",
        name_el=None,
        name_en="Aresti Iason Driving School",
        lat=34.6735,
        lon=33.0372,
        city="Limassol",
        formatted_address="21 Gladstonos Str., Limassol, Cyprus",
        phone_e164="+35725352283",
    ),
    _make(
        name="Aspris Driving School",
        name_el="Σχολή Οδηγών Άσπρης",
        name_en="Aspris Driving School",
        lat=34.6762,
        lon=33.0478,
        city="Limassol",
        formatted_address="6 Misiaouli & Kavazoglou Str., Limassol, Cyprus",
        phone_e164="+35725358284",
    ),
    _make(
        name="Panikos Panagiotou Driving School",
        name_el="Σχολή Οδηγών Πανίκος Παναγιώτου",
        name_en="Panikos Panagiotou Driving School",
        lat=34.7072,
        lon=33.0130,
        city="Limassol",
        formatted_address="170A Ellados Str., Limassol, Cyprus",
        phone_e164="+35725363300",
    ),
    _make(
        name="Άνθος Σχολή Οδηγών",
        name_el="Άνθος Σχολή Οδηγών",
        name_en="Anthos Scholi Odigon",
        lat=34.6791,
        lon=33.0425,
        city="Limassol",
        formatted_address="12 Kennenty Str., Limassol, Cyprus",
    ),
    # ── LARNACA ────────────────────────────────────────────────────────────
    _make(
        name="G. Phidias Driving School",
        name_el="Σχολή Οδηγών Φειδίας",
        name_en="G. Phidias Driving School",
        lat=34.9185,
        lon=33.6210,
        city="Larnaca",
        formatted_address="Giannou Kranidioti, Larnaca 6046, Cyprus",
        phone_e164="+35799543499",
        rating=5.0,
        review_count=249,
    ),
    _make(
        name="Ammochostos Driving School",
        name_el="Σχολή Οδηγών Αμμόχωστος",
        name_en="Ammochostos Driving School",
        lat=34.9170,
        lon=33.6240,
        city="Larnaca",
        formatted_address="84 Arch. Makariou III Ave., Larnaca, Cyprus",
        phone_e164="+35724639166",
    ),
    _make(
        name="Andronicou Panayiotis Driving School",
        name_el=None,
        name_en="Andronicou Panayiotis Driving School",
        lat=34.9200,
        lon=33.6182,
        city="Larnaca",
        formatted_address="2A Ag. Kendea Str., Larnaca, Cyprus",
        phone_e164="+35724627018",
    ),
    _make(
        name="Antoniou Georgios Driving School",
        name_el=None,
        name_en="Antoniou Georgios Driving School",
        lat=34.9190,
        lon=33.6315,
        city="Larnaca",
        formatted_address="9 D. Akrita Str., Larnaca, Cyprus",
        phone_e164="+35724624503",
    ),
    _make(
        name="Σχολή Οδηγών Αγία Βαρβάρα",
        name_el="Σχολή Οδηγών Αγία Βαρβάρα",
        name_en="Ayia Varvara Driving School",
        lat=34.9773,
        lon=33.8280,
        city="Larnaca",
        formatted_address="Christofi Vasili 17, Xylofagou 7520, Cyprus",
        phone_e164="+35799856965",
    ),
    _make(
        name="Agariou Sergiou Kyriaki Driving School",
        name_el=None,
        name_en="Agariou Sergiou Kyriaki Driving School",
        lat=34.9530,
        lon=33.6270,
        city="Larnaca",
        formatted_address="33C G. Griva Digeni Ave., Dasaki Achnas, Larnaca, Cyprus",
    ),
    _make(
        name="Larnaca Driving School",
        name_el=None,
        name_en="Larnaca Driving School",
        lat=34.9143,
        lon=33.6358,
        city="Larnaca",
        formatted_address="Pandoras 24, Larnaca, Cyprus",
        website="https://larnacadrivingschool.com",
    ),
    # ── PAPHOS ─────────────────────────────────────────────────────────────
    _make(
        name="Σχολή Οδηγών Χούλος",
        name_el="Σχολή Οδηγών Χούλος",
        name_en="Houlos Driving School",
        lat=34.7762,
        lon=32.4237,
        city="Paphos",
        formatted_address="5 Andrea Tselepou, Karavella Bldg Shop 4, 8010 Paphos, Cyprus",
        phone_e164="+35799568353",
    ),
    _make(
        name="Antoniou Yiannakis K Driving School",
        name_el=None,
        name_en="Antoniou Yiannakis K Driving School",
        lat=34.8190,
        lon=32.4381,
        city="Paphos",
        formatted_address="102 Th. Petrou Str., Emba, Paphos, Cyprus",
        phone_e164="+35726971692",
    ),
    _make(
        name="Driving School Paphos",
        name_el=None,
        name_en="Driving School Paphos",
        lat=34.7752,
        lon=32.4203,
        city="Paphos",
        formatted_address="Neapoleos 74, 8020 Paphos, Cyprus",
        website="https://drivingschoolpaphos.com",
    ),
    # ── PARALIMNI ──────────────────────────────────────────────────────────
    _make(
        name="No.1 Driving School",
        name_el=None,
        name_en="No.1 Driving School",
        lat=35.0353,
        lon=33.9803,
        city="Paralimni",
        formatted_address="1st Apriliou KAT2, Paralimni, Cyprus",
        phone_e164="+35723002000",
    ),
]


def main() -> int:
    # Load existing IDs and slugs to detect collisions
    existing_ids: set[str] = set()
    existing_slugs_el: set[str] = set()
    existing_slugs_en: set[str] = set()
    existing_lines: list[str] = []

    src = ENRICHED if ENRICHED.exists() else BASE
    for line in src.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        s = json.loads(line)
        existing_ids.add(s["id"])
        if s.get("slug_el"):
            existing_slugs_el.add(s["slug_el"])
        if s.get("slug_en"):
            existing_slugs_en.add(s["slug_en"])
        existing_lines.append(line)

    added = 0
    skipped = 0
    new_lines: list[str] = []

    for school in MISSING_SCHOOLS:
        sid = school["id"]
        if sid in existing_ids:
            print(f"  SKIP (id clash): {school['name']}")
            skipped += 1
            continue

        # Ensure slug uniqueness - append extra chars if needed
        slug_el = school["slug_el"]
        slug_en = school["slug_en"]
        if slug_el in existing_slugs_el:
            slug_el = f"{slug_el}-{sid[6:10]}"
            school["slug_el"] = slug_el
        if slug_en in existing_slugs_en:
            slug_en = f"{slug_en}-{sid[6:10]}"
            school["slug_en"] = slug_en

        existing_ids.add(sid)
        existing_slugs_el.add(slug_el)
        existing_slugs_en.add(slug_en)
        new_lines.append(json.dumps(school, ensure_ascii=False))
        added += 1
        print(f"  ADD: {school['name']} ({school['location']['city']})")

    if added:
        all_lines = existing_lines + new_lines
        ENRICHED.write_text("\n".join(all_lines) + "\n", encoding="utf-8")
        # Mirror to base schools.jsonl (without photo_paths / slug fields that
        # live only in the enriched file is fine - base is just a fallback)
        print(f"\n✓ Added {added} schools → {ENRICHED}")
    else:
        print("Nothing to add - all schools already present.")

    if skipped:
        print(f"  ({skipped} skipped - already in database)")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
