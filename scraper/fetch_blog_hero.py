"""Fetch hero / fallback images from Pexels.

Three modes:

1. --default-hero
       Fetch the site-wide blog hero (query "cyprus road driving car")
       → public/blog/default-hero.jpg

2. --school-fallback
       Fetch the site-wide school-card fallback (query "driving school car
       lesson") → public/schools/fallback.jpg

3. --slug X --query Y
       Per-article hero fetch → public/blog/<slug>/hero.jpg

Pexels API
----------
Endpoint: https://api.pexels.com/v1/search?query=...&per_page=1
Auth header: Authorization: <PEXELS_API_KEY>      (raw key, no Bearer prefix)
Response: { photos: [{ id, photographer, src: { original, large2x, large, ... } }] }

We pick `src.large2x` (1880 px wide) when present, falling back to
`src.large`. Next/Image down-scales at serve time anyway, so over-fetching
once at build/refresh time is fine.

School photos are NEVER used as fallback for blog heroes (and vice versa).
The old school-photo fallback for blog heroes was removed deliberately.

Usage
-----
    export PEXELS_API_KEY=...        # or put it in .env
    uv run python -m scraper.fetch_blog_hero --default-hero --force
    uv run python -m scraper.fetch_blog_hero --school-fallback --force
    uv run python -m scraper.fetch_blog_hero \\
        --slug how-to-get-driving-licence-cyprus-foreigner \\
        --query "cyprus driving licence road" --force
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path
from urllib.error import HTTPError, URLError

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DOTENV_PATH = PROJECT_ROOT / ".env"
WEB_PUBLIC = PROJECT_ROOT / "public"

DEFAULT_HERO_QUERY = "cyprus road driving car"
DEFAULT_HERO_PATH = WEB_PUBLIC / "blog" / "default-hero.jpg"

SCHOOL_FALLBACK_QUERY = "driving school car lesson"
SCHOOL_FALLBACK_PATH = WEB_PUBLIC / "schools" / "fallback.jpg"

# Pexels sits behind Cloudflare and 403s the default `Python-urllib/X.Y`
# User-Agent. A real UA gets through cleanly.
USER_AGENT = (
    "Mozilla/5.0 (compatible; ClickClickDriveCY/1.0; +https://clickclickdrive.com.cy)"
)


def fetch_pexels(query: str, dest: Path) -> bool:
    """Search Pexels for one image and download it to `dest`.

    Returns True on success, False on any failure (missing key, API error,
    no results, download error). All failures log to stderr; success logs
    to stdout with attribution.
    """
    api_key = os.environ.get("PEXELS_API_KEY")
    if not api_key:
        print(
            "[hero] PEXELS_API_KEY not set — cannot fetch Pexels image.",
            file=sys.stderr,
        )
        return False

    url = (
        "https://api.pexels.com/v1/search"
        f"?query={urllib.parse.quote(query)}&per_page=1"
    )
    req = urllib.request.Request(
        url,
        headers={"Authorization": api_key, "User-Agent": USER_AGENT},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            payload = json.loads(r.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError) as exc:
        print(f"[hero] Pexels search failed: {exc}", file=sys.stderr)
        return False

    photos = payload.get("photos") or []
    if not photos:
        print(
            f"[hero] Pexels returned no results for query: {query!r}",
            file=sys.stderr,
        )
        return False

    photo = photos[0]
    src = photo.get("src") or {}
    image_url = src.get("large2x") or src.get("large") or src.get("original")
    if not image_url:
        print(
            "[hero] Pexels result has no usable size in src.{large2x,large,original}",
            file=sys.stderr,
        )
        return False

    img_req = urllib.request.Request(image_url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(img_req, timeout=30) as r:
            data = r.read()
    except (HTTPError, URLError, TimeoutError) as exc:
        print(f"[hero] Pexels image download failed: {exc}", file=sys.stderr)
        return False

    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    print(
        f"[hero] saved Pexels photo by {photo.get('photographer')} "
        f"({photo.get('id')}) → {dest.relative_to(PROJECT_ROOT)} "
        f"({len(data):,} bytes)"
    )
    return True


def _maybe_skip(dest: Path, force: bool) -> bool:
    if dest.exists() and not force:
        print(
            f"[hero] {dest.relative_to(PROJECT_ROOT)} already exists — "
            "skipping (use --force to refetch)."
        )
        return True
    return False


def main(argv: list[str] | None = None) -> int:
    if DOTENV_PATH.exists():
        load_dotenv(DOTENV_PATH, override=False)

    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--default-hero",
        action="store_true",
        help=f"Ensure {DEFAULT_HERO_PATH.relative_to(PROJECT_ROOT)} exists.",
    )
    ap.add_argument(
        "--school-fallback",
        action="store_true",
        help=f"Ensure {SCHOOL_FALLBACK_PATH.relative_to(PROJECT_ROOT)} exists.",
    )
    ap.add_argument("--slug", help="Article slug — destination subfolder.")
    ap.add_argument("--query", help="Pexels search query for per-article hero.")
    ap.add_argument(
        "--output-name",
        default="hero.jpg",
        help="Filename to save inside the slug subfolder (default: hero.jpg).",
    )
    ap.add_argument(
        "--force",
        action="store_true",
        help="Re-download even if the destination already exists.",
    )
    args = ap.parse_args(argv)

    if args.default_hero:
        if _maybe_skip(DEFAULT_HERO_PATH, args.force):
            return 0
        return 0 if fetch_pexels(DEFAULT_HERO_QUERY, DEFAULT_HERO_PATH) else 1

    if args.school_fallback:
        if _maybe_skip(SCHOOL_FALLBACK_PATH, args.force):
            return 0
        return 0 if fetch_pexels(SCHOOL_FALLBACK_QUERY, SCHOOL_FALLBACK_PATH) else 1

    if not args.slug or not args.query:
        ap.error(
            "Provide --default-hero, --school-fallback, or both "
            "--slug and --query for a per-article fetch."
        )

    dest = WEB_PUBLIC / "blog" / args.slug / args.output_name
    if _maybe_skip(dest, args.force):
        return 0
    return 0 if fetch_pexels(args.query, dest) else 1


if __name__ == "__main__":
    raise SystemExit(main())
