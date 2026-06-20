"""Download hero images for best-of city pages via the Unsplash search API.

Usage:
    python -m scraper.download_hero_images [--cities nicosia larnaca ...] [--force]

Outputs:
    public/best-of/{city}/hero.jpg

Requires:
    UNSPLASH_API_KEY in environment (or .env file)
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path

import requests
import structlog
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")
log = structlog.get_logger(__name__)

# Per-city search queries — edit these to tune results without re-running all cities
CITY_QUERIES: dict[str, str] = {
    "nicosia": "Nicosia Cyprus old city",
    "limassol": "limassol Cyprus",
    "larnaca": "Larnaca Cyprus salt lake",
    "paphos": "paphos Cyprus",
    "paralimni": "Famagusta Cyprus coast",
}

HERO_DIR_BASE = Path(__file__).parent.parent / "public" / "best-of"
UNSPLASH_SEARCH = "https://api.unsplash.com/search/photos"


def fetch_hero(city: str, api_key: str) -> bytes:
    query = CITY_QUERIES[city]
    resp = requests.get(
        UNSPLASH_SEARCH,
        headers={"Authorization": f"Client-ID {api_key}"},
        params={
            "query": query,
            "orientation": "landscape",
            "per_page": 1,
            "content_filter": "high",
            "order_by": "relevant",
        },
        timeout=15,
    )
    resp.raise_for_status()
    results = resp.json().get("results", [])
    if not results:
        raise RuntimeError(f"No Unsplash results for query: {query!r}")
    photo = results[0]
    description = photo.get("description") or photo.get("alt_description") or "(no description)"
    photographer = photo.get("user", {}).get("name", "(unknown)")
    print(f"  Query     : {query}")
    print(f"  Photo     : {description}")
    print(f"  By        : {photographer}")
    print(f"  Unsplash  : {photo.get('links', {}).get('html', '')}")
    img_resp = requests.get(photo["urls"]["regular"], timeout=30)
    img_resp.raise_for_status()
    return img_resp.content


def download_all(cities: list[str], force: bool = False) -> None:
    api_key = os.environ.get("UNSPLASH_API_KEY", "").strip()
    if not api_key:
        raise SystemExit("UNSPLASH_API_KEY is not set")

    for city in cities:
        hero_path = HERO_DIR_BASE / city / "hero.jpg"
        if not force and hero_path.exists():
            log.info("hero.skip_existing", city=city)
            continue
        hero_path.parent.mkdir(parents=True, exist_ok=True)
        print(f"\n[{city}]")
        data = fetch_hero(city, api_key)
        hero_path.write_bytes(data)
        log.info("hero.saved", city=city, size=len(data), path=str(hero_path))


def main() -> None:
    parser = argparse.ArgumentParser(description="Download hero images for best-of pages")
    parser.add_argument(
        "--cities",
        nargs="+",
        choices=list(CITY_QUERIES.keys()),
        default=list(CITY_QUERIES.keys()),
    )
    parser.add_argument("--force", action="store_true", help="Overwrite existing files")
    args = parser.parse_args()
    download_all(args.cities, args.force)


if __name__ == "__main__":
    main()
