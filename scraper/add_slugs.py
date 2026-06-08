"""Add slug_el / slug_en fields to schools_enriched.jsonl in place.

Runs over scraper/output/schools_enriched.jsonl (or schools.jsonl if the
enriched file is missing), computes the locale-specific slugs from
scraper/slugs.py, and writes the file back with the new fields.

Idempotent: existing slug fields are overwritten with freshly computed
values, so changes to slugs.py only take a re-run, not a fresh scrape.
"""

from __future__ import annotations

import json
from pathlib import Path

import structlog

from scraper.slugs import school_slug_el, school_slug_en

log = structlog.get_logger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ENRICHED = PROJECT_ROOT / "scraper" / "output" / "schools_enriched.jsonl"
BASE = PROJECT_ROOT / "scraper" / "output" / "schools.jsonl"


def main() -> int:
    src = ENRICHED if ENRICHED.exists() else BASE
    schools = [
        json.loads(line)
        for line in src.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    log.info("slugs.start", n=len(schools), src=str(src))

    out_lines: list[str] = []
    for s in schools:
        sid = s["id"]
        name = s.get("name", "")
        s["slug_el"] = school_slug_el(s.get("name_el"), name, sid)
        s["slug_en"] = school_slug_en(s.get("name_en"), name, sid)
        out_lines.append(json.dumps(s, ensure_ascii=False))

    # Always write the enriched file — that's the canonical artifact.
    ENRICHED.write_text("\n".join(out_lines) + "\n", encoding="utf-8")
    log.info("slugs.done", path=str(ENRICHED))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
