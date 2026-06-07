"""CCD Cyprus scraper entry point.

Pipeline:
  1. Iterate every enabled source (registry).
  2. Normalize each RawListing -> DrivingSchool.
  3. Dedupe across sources.
  4. Emit JSONL to --out path (default scraper/output/schools.jsonl).
     Pass `--out -` to write to stdout instead.

Each output line is a single DrivingSchool record serialized via
pydantic's model_dump_json(). See scraper/models.py for the schema.

Usage:
    uv run python -m scraper.run
    uv run python -m scraper.run --sources google_places
    uv run python -m scraper.run --out -    # stdout
"""

from __future__ import annotations

import argparse
import sys
from collections.abc import Iterator
from pathlib import Path

import structlog
from dotenv import load_dotenv

from scraper.models import DrivingSchool, RawListing, SourceName
from scraper.pipeline.dedupe import dedupe
from scraper.pipeline.normalize import normalize_all
from scraper.sources.registry import iter_sources

log = structlog.get_logger(__name__)

DEFAULT_OUT_PATH = "scraper/output/schools.jsonl"


def main(argv: list[str] | None = None) -> int:
    load_dotenv()
    args = _parse_args(argv)

    enabled = _parse_enabled(args.sources)
    log.info("scrape.start", sources=[s.value for s in (enabled or SourceName)])

    raw = _collect(enabled)
    normalized = normalize_all(raw)
    deduped = dedupe(normalized)

    log.info("scrape.done", schools=len(deduped))
    _emit(deduped, args.out)
    return 0


def _collect(enabled: set[SourceName] | None) -> Iterator[RawListing]:
    for source in iter_sources(enabled):
        log.info("source.start", source=source.name.value)
        count = 0
        for listing in source.fetch():
            count += 1
            yield listing
        log.info("source.done", source=source.name.value, count=count)


def _emit(schools: list[DrivingSchool], out_path: str) -> None:
    if out_path == "-":
        for school in schools:
            sys.stdout.write(school.model_dump_json() + "\n")
        return
    path = Path(out_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        for school in schools:
            fh.write(school.model_dump_json() + "\n")
    log.info("scrape.written", path=str(path), count=len(schools))


def _parse_enabled(value: str | None) -> set[SourceName] | None:
    if not value:
        return None
    names = {v.strip() for v in value.split(",") if v.strip()}
    out: set[SourceName] = set()
    for name in names:
        try:
            out.add(SourceName(name))
        except ValueError as exc:
            valid = ", ".join(s.value for s in SourceName)
            raise SystemExit(f"Unknown source {name!r}. Valid: {valid}") from exc
    return out


def _parse_args(argv: list[str] | None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description="ClickClickDrive Cyprus scraper")
    p.add_argument(
        "--sources",
        help="Comma-separated source names (default: all). "
        f"Valid: {', '.join(s.value for s in SourceName)}",
    )
    p.add_argument(
        "--out",
        help=f"JSONL output path. Use '-' for stdout. Default: {DEFAULT_OUT_PATH}",
        default=DEFAULT_OUT_PATH,
    )
    return p.parse_args(argv)


if __name__ == "__main__":
    raise SystemExit(main())
