"""Fetch blog hero images from Unsplash.

Two modes:

1. Per-article fetch (`--slug X --query Y`): downloads one Unsplash image
   matching `query` and saves to `apps/web/public/blog/<slug>/hero.jpg`.
2. Ensure the project's generic fallback (`--default-hero`): downloads one
   Unsplash image with the hardcoded query "cyprus road driving car" and
   saves to `apps/web/public/blog/default-hero.jpg`.

If `UNSPLASH_ACCESS_KEY` is missing or the API call fails, the script
returns a non-zero exit code. School photos are NEVER used as a fallback
(intentional — the old school-photo fallback was removed because school
images are private business assets and have no place on editorial pages).

Usage
-----
    export UNSPLASH_ACCESS_KEY=...
    uv run python -m scraper.fetch_blog_hero --default-hero
    uv run python -m scraper.fetch_blog_hero \\
        --slug how-to-get-driving-licence-cyprus-foreigner \\
        --query "cyprus driving licence road"
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
WEB_PUBLIC = PROJECT_ROOT / "apps" / "web" / "public"

DEFAULT_HERO_QUERY = "cyprus road driving car"
DEFAULT_HERO_PATH = WEB_PUBLIC / "blog" / "default-hero.jpg"


def fetch_unsplash(query: str, dest: Path) -> bool:
    """Try Unsplash search → first result → download to `dest`.

    Returns True on success, False on any failure (missing key, API error,
    no results, download error). Caller decides what to do on failure.
    """
    api_key = os.environ.get("UNSPLASH_ACCESS_KEY")
    if not api_key:
        print(
            "[hero] UNSPLASH_ACCESS_KEY not set — "
            "cannot fetch an Unsplash image.",
            file=sys.stderr,
        )
        return False

    url = (
        "https://api.unsplash.com/search/photos"
        f"?query={urllib.parse.quote(query)}&per_page=10&orientation=landscape"
    )
    req = urllib.request.Request(
        url, headers={"Authorization": f"Client-ID {api_key}"}
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            payload = json.loads(r.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError) as exc:
        print(f"[hero] Unsplash search failed: {exc}", file=sys.stderr)
        return False

    results = payload.get("results") or []
    if not results:
        print(
            f"[hero] Unsplash returned no results for query: {query!r}",
            file=sys.stderr,
        )
        return False

    photo = results[0]
    image_url = (photo.get("urls") or {}).get("regular")
    if not image_url:
        print("[hero] Unsplash result missing urls.regular", file=sys.stderr)
        return False

    try:
        with urllib.request.urlopen(image_url, timeout=30) as r:
            data = r.read()
    except (HTTPError, URLError, TimeoutError) as exc:
        print(f"[hero] Unsplash image download failed: {exc}", file=sys.stderr)
        return False

    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    print(
        f"[hero] saved Unsplash photo by "
        f"{(photo.get('user') or {}).get('name')} "
        f"({photo.get('id')}) → {dest.relative_to(PROJECT_ROOT)}"
    )
    return True


def main(argv: list[str] | None = None) -> int:
    if DOTENV_PATH.exists():
        load_dotenv(DOTENV_PATH, override=False)

    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--default-hero",
        action="store_true",
        help=(
            "Ensure apps/web/public/blog/default-hero.jpg exists, "
            "fetching it from Unsplash with the hardcoded query."
        ),
    )
    ap.add_argument(
        "--slug",
        help="Article slug — destination folder for per-article hero.",
    )
    ap.add_argument(
        "--query",
        help="Unsplash search query for per-article hero.",
    )
    ap.add_argument(
        "--force",
        action="store_true",
        help="Re-download even if the destination already exists.",
    )
    args = ap.parse_args(argv)

    if args.default_hero:
        if DEFAULT_HERO_PATH.exists() and not args.force:
            print(
                f"[hero] {DEFAULT_HERO_PATH.relative_to(PROJECT_ROOT)} "
                "already exists — skipping (use --force to refetch)."
            )
            return 0
        ok = fetch_unsplash(DEFAULT_HERO_QUERY, DEFAULT_HERO_PATH)
        return 0 if ok else 1

    if not args.slug or not args.query:
        ap.error(
            "Either pass --default-hero, or pass --slug and --query for a "
            "per-article fetch."
        )

    dest = WEB_PUBLIC / "blog" / args.slug / "hero.jpg"
    if dest.exists() and not args.force:
        print(
            f"[hero] {dest.relative_to(PROJECT_ROOT)} already exists — "
            "skipping (use --force to refetch)."
        )
        return 0
    ok = fetch_unsplash(args.query, dest)
    if not ok:
        print(
            "[hero] could not source the image. The site's runtime falls "
            "back to /blog/default-hero.jpg automatically; re-run with the "
            "key once available.",
            file=sys.stderr,
        )
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
