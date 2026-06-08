"""Fetch a single hero image for a blog article and save it under apps/web/public/blog/.

Tries Unsplash first (Search Photos API). Falls back to copying one of the
existing school photos under apps/web/public/schools/<id>/1.jpg if Unsplash is
not reachable, the key is missing, or no results match.

Reads UNSPLASH_ACCESS_KEY from the project-root .env (same pattern as
ANTHROPIC_API_KEY in generate_content.py).

Usage
-----
    uv run python -m scraper.fetch_blog_hero \\
        --slug how-to-get-driving-licence-cyprus-foreigner \\
        --query "cyprus road landscape driving"
"""

from __future__ import annotations

import argparse
import os
import random
import shutil
import sys
import urllib.request
from pathlib import Path
from urllib.error import HTTPError, URLError

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DOTENV_PATH = PROJECT_ROOT / ".env"
WEB_PUBLIC = PROJECT_ROOT / "apps" / "web" / "public"
SCHOOL_PHOTOS_DIR = WEB_PUBLIC / "schools"


def fetch_unsplash(query: str, dest: Path) -> bool:
    api_key = os.environ.get("UNSPLASH_ACCESS_KEY")
    if not api_key:
        print("[hero] UNSPLASH_ACCESS_KEY not set — falling back to school photo.")
        return False

    url = (
        "https://api.unsplash.com/search/photos"
        f"?query={urllib.parse.quote(query)}&per_page=10&orientation=landscape"
    )
    req = urllib.request.Request(url, headers={"Authorization": f"Client-ID {api_key}"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            import json

            payload = json.loads(r.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError) as exc:
        print(f"[hero] Unsplash search failed: {exc}")
        return False

    results = payload.get("results") or []
    if not results:
        print(f"[hero] Unsplash returned no results for query: {query!r}")
        return False

    photo = results[0]
    image_url = (photo.get("urls") or {}).get("regular")
    if not image_url:
        print("[hero] Unsplash result missing urls.regular")
        return False

    try:
        with urllib.request.urlopen(image_url, timeout=30) as r:
            data = r.read()
    except (HTTPError, URLError, TimeoutError) as exc:
        print(f"[hero] Unsplash image download failed: {exc}")
        return False

    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    print(
        f"[hero] saved Unsplash photo by {photo.get('user', {}).get('name')} "
        f"({photo.get('id')}) → {dest.relative_to(PROJECT_ROOT)}"
    )
    return True


def fallback_school_photo(dest: Path) -> bool:
    if not SCHOOL_PHOTOS_DIR.exists():
        print(f"[hero] no school photos directory at {SCHOOL_PHOTOS_DIR}")
        return False
    candidates: list[Path] = []
    for school_dir in SCHOOL_PHOTOS_DIR.iterdir():
        if not school_dir.is_dir():
            continue
        first = school_dir / "1.jpg"
        if first.exists():
            candidates.append(first)
    if not candidates:
        print("[hero] no school photo candidates found")
        return False
    # Deterministic pick so the same article keeps the same fallback image
    # between runs — seed by destination path.
    rng = random.Random(str(dest))
    pick = rng.choice(candidates)
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(pick, dest)
    print(f"[hero] fell back to school photo {pick.relative_to(PROJECT_ROOT)} → {dest.relative_to(PROJECT_ROOT)}")
    return True


def main(argv: list[str] | None = None) -> int:
    if DOTENV_PATH.exists():
        load_dotenv(DOTENV_PATH, override=False)

    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", required=True, help="Article slug — also the destination folder name")
    ap.add_argument("--query", required=True, help="Unsplash search query")
    args = ap.parse_args(argv)

    dest = WEB_PUBLIC / "blog" / args.slug / "hero.jpg"
    if dest.exists():
        print(f"[hero] {dest.relative_to(PROJECT_ROOT)} already exists — skipping.")
        return 0

    if fetch_unsplash(args.query, dest):
        return 0
    if fallback_school_photo(dest):
        return 0
    print("[hero] could not source any image — failing.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
