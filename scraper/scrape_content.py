"""Scrape each school's website and save extracted content.

Reads scraper/output/schools_enriched.jsonl (or schools.jsonl as fallback),
fetches every school's website (when present), and writes one JSON record
per school under scraper/data/content/{school_id}.json - including stubs
for schools that have no website. The content generator (Step 4) then has
a complete file-per-school surface to read from.

Usage:
    uv run python -m scraper.scrape_content
    uv run python -m scraper.scrape_content --limit 5    # test
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import structlog
from dotenv import load_dotenv

from scraper.sources.website_content import scrape_school

log = structlog.get_logger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ENRICHED_JSONL = PROJECT_ROOT / "scraper" / "output" / "schools_enriched.jsonl"
BASE_JSONL = PROJECT_ROOT / "scraper" / "output" / "schools.jsonl"
CONTENT_DIR = PROJECT_ROOT / "scraper" / "data" / "content"


def main(argv: list[str] | None = None) -> int:
    load_dotenv()
    args = _parse_args(argv)

    src = ENRICHED_JSONL if ENRICHED_JSONL.exists() else BASE_JSONL
    schools = [
        json.loads(line)
        for line in src.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    if args.limit:
        schools = schools[: args.limit]

    CONTENT_DIR.mkdir(parents=True, exist_ok=True)
    log.info("scrape.start", n=len(schools), out_dir=str(CONTENT_DIR))

    with_website = success = no_website = failed = 0
    for i, school in enumerate(schools, start=1):
        sid = school["id"]
        website = school.get("website")
        if website:
            with_website += 1
        else:
            no_website += 1

        content = scrape_school(school_id=sid, website=website)
        if content.success:
            success += 1
        elif content.reason and content.reason.startswith("fetch_failed"):
            failed += 1

        path = CONTENT_DIR / f"{sid}.json"
        path.write_text(
            json.dumps(content.to_dict(), ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        log.info(
            "scrape.progress",
            i=i,
            n=len(schools),
            school_id=sid,
            success=content.success,
            reason=content.reason,
        )

    log.info(
        "scrape.done",
        total=len(schools),
        with_website=with_website,
        no_website=no_website,
        success=success,
        failed=failed,
    )
    return 0


def _parse_args(argv: list[str] | None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Scrape school websites")
    p.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Only process the first N schools (for testing).",
    )
    return p.parse_args(argv)


if __name__ == "__main__":
    raise SystemExit(main())
