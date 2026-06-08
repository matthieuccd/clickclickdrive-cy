"""Enrich schools.jsonl with photo paths.

Reads scraper/output/schools.jsonl, downloads up to 3 photos per school via
Place Photos, and writes the input records back to
scraper/output/schools_enriched.jsonl with a new `photo_paths` field.

Photo binaries land in apps/web/public/schools/{id}/{n}.jpg (served as
/schools/{id}/{n}.jpg by Next.js).

Usage:
    uv run python -m scraper.enrich
    uv run python -m scraper.enrich --limit 5    # test on first 5
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import structlog
from dotenv import load_dotenv

from scraper.sources.places_photos import PlacePhotosSource

log = structlog.get_logger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SCHOOLS_JSONL = PROJECT_ROOT / "scraper" / "output" / "schools.jsonl"
ENRICHED_JSONL = PROJECT_ROOT / "scraper" / "output" / "schools_enriched.jsonl"
PUBLIC_DIR = PROJECT_ROOT / "apps" / "web" / "public"


def main(argv: list[str] | None = None) -> int:
    load_dotenv()
    args = _parse_args(argv)

    photos = PlacePhotosSource(public_dir=PUBLIC_DIR)

    schools = [
        json.loads(line)
        for line in SCHOOLS_JSONL.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    if args.limit:
        schools = schools[: args.limit]
    log.info("enrich.start", n=len(schools), public_dir=str(PUBLIC_DIR))

    out_lines: list[str] = []
    total_photos = 0
    schools_with_photos = 0
    for i, school in enumerate(schools, start=1):
        place_id = (school.get("source_ids") or {}).get("google_places")
        if not place_id:
            log.warning("enrich.no_place_id", school_id=school["id"])
            school["photo_paths"] = []
            out_lines.append(json.dumps(school, ensure_ascii=False))
            continue

        paths = photos.fetch_for(place_id, school["id"])
        school["photo_paths"] = paths
        out_lines.append(json.dumps(school, ensure_ascii=False))
        if paths:
            schools_with_photos += 1
            total_photos += len(paths)
        log.info(
            "enrich.progress",
            i=i,
            n=len(schools),
            school_id=school["id"],
            photos=len(paths),
        )

    ENRICHED_JSONL.write_text(
        "\n".join(out_lines) + "\n", encoding="utf-8"
    )
    log.info(
        "enrich.done",
        path=str(ENRICHED_JSONL),
        schools=len(schools),
        with_photos=schools_with_photos,
        total_photos=total_photos,
    )
    return 0


def _parse_args(argv: list[str] | None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Enrich schools.jsonl with photos")
    p.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Only process the first N schools (for testing).",
    )
    return p.parse_args(argv)


if __name__ == "__main__":
    raise SystemExit(main())
