# ClickClickDrive Cyprus (CCD.cy)

Consumer-facing driving-school discovery marketplace for the Republic of Cyprus. Localized fork of clickclickdrive.de - same product model, new market.

## Product scope

- **What it is**: Marketplace where students search, compare, and book driving schools by location, language, price, and reviews.
- **What it is NOT**: B2B SaaS for schools. No school-management software, no scheduling backend for instructors, no LMS. Discovery + booking only.
- **Domain**: `clickclickdrive-cyprus.com`
- **Reference**: `clickclickdrive.de` (Germany) - mirror the consumer flows, not the operator tooling.

## Market: Cyprus (island-wide)

We cover driving schools across the whole island of Cyprus, including schools in the north. Target cities (lat/lon centroids used by the scraper):

| City          | Greek      | Approx. centroid (lat, lon) |
|---------------|------------|-----------------------------|
| Nicosia       | Λευκωσία   | 35.1856, 33.3823            |
| Limassol      | Λεμεσός    | 34.7071, 33.0226            |
| Larnaca       | Λάρνακα    | 34.9229, 33.6233            |
| Paphos        | Πάφος      | 34.7720, 32.4297            |
| Paralimni     | Παραλίμνι  | 35.0353, 33.9803            |

## Languages

- **Primary**: Greek (`el`) - Cypriot Greek is the dominant local language.
- **Fallback**: English (`en`) - widely spoken, used by expats, tourists, and the British community.
- All user-facing strings ship `el` first, `en` second. No German content (despite the parent brand).

## Data sources

The scraper aggregates driving schools from multiple sources, normalizes, and dedupes:

1. **Google Places API** (`scraper/sources/places.py`) - primary source. Text Search + Nearby Search around each city centroid with the query `σχολή οδηγών` and English fallback `driving school`. Use Place Details for phone, website, hours, reviews.
2. **Local directories** (`scraper/sources/directory_spider.py`) - Scrapling-based spider for Cypriot business directories (e.g., yellowpages.com.cy, cyprusyellowpages, ministry of transport listings). Filled in per-site by adding configs to the registry.
3. **Registry** (`scraper/sources/registry.py`) - central registry of source adapters so `run.py` can iterate without caring about source internals.

### Pipeline

- `pipeline/normalize.py` - phone numbers to E.164 (`+357…`), addresses to a canonical form, Greek/English name pairs, geocoding sanity check (must fall inside Republic of Cyprus bounding box).
- `pipeline/dedupe.py` - fuzzy match across sources (phone match → website host match → name + geo proximity fallback). Output is a unified `DrivingSchool` record per real-world entity.

## Repo layout

```
.
├── CLAUDE.md
├── pyproject.toml
├── apps/
│   └── web/
│       └── i18n.config.ts        # Next.js i18n (el primary, en fallback)
└── scraper/
    ├── run.py                    # Entry point: run all sources → normalize → dedupe → emit JSON
    ├── models.py                 # Pydantic models (DrivingSchool, Location, Review, RawListing)
    ├── sources/
    │   ├── places.py             # Google Places API adapter
    │   ├── directory_spider.py   # Scrapling-based directory spider
    │   └── registry.py           # Source registry
    └── pipeline/
        ├── normalize.py
        └── dedupe.py
```

## Tech stack

- **Scraper**: Python 3.11+, [Scrapling](https://github.com/d4vinci/Scrapling) for resilient HTML scraping, `googlemaps` SDK for Places API, `pydantic` v2 for models, `phonenumbers` for phone normalization, `rapidfuzz` for dedupe.
- **Web** (planned, not yet scaffolded beyond i18n): Next.js, Greek-first i18n via `next-intl` style config.

## Environment

The scraper expects:

- `GOOGLE_PLACES_API_KEY` - required for the Places source.

Put these in a local `.env` file (gitignored). Never commit keys.

## Conventions

- Greek strings: store raw Greek; do not transliterate at ingest. Transliteration (if ever needed) happens at presentation.
- Phone numbers: store E.164. Republic of Cyprus numbers start with `+357`; northern Cyprus schools may use Turkish numbers (`+90`).
