"""Scrape each school's own website for content the SEO generator can use.

Approach: httpx for the fetch, lxml.html for parsing. Scrapling was the
original plan, but 0.4.x ships its `Fetcher` chain wired to playwright +
curl_cffi + chromium binaries (~350 MB), and its parser API drifted between
minor versions - for plain static HTML extraction lxml is faster, smaller,
and stable.

For each school that has a website URL, we save a structured JSON record at
scraper/data/content/{school_id}.json with whatever text we could pull.
For schools without a website (or where the fetch failed), we save a stub
so the content generator (Step 4) knows to fall back to Places-only data.
"""

from __future__ import annotations

import datetime as _dt
import re
from dataclasses import asdict, dataclass, field

import httpx
import lxml.etree
import lxml.html
import structlog

log = structlog.get_logger(__name__)

FETCH_TIMEOUT_SEC = 15.0
USER_AGENT = (
    "Mozilla/5.0 (compatible; ClickClickDriveCY/1.0; +https://clickclickdrive.com.cy)"
)
MAX_PARAGRAPHS = 12
MAX_HEADINGS = 8
RAW_SAMPLE_CHARS = 3000

# Lifted from common Greek + English driving-school vocabulary; used only to
# tag what the school mentions, never to invent claims.
SERVICE_KEYWORDS = (
    "automatic",
    "manual",
    "intensive",
    "theory",
    "practical",
    "simulator",
    "motorcycle",
    "truck",
    "trailer",
    "αυτόματο",
    "θεωρία",
    "πρακτική",
    "ταχύρρυθμο",
    "μηχανή",
    "φορτηγό",
)


@dataclass
class WebsiteContent:
    school_id: str
    website: str | None
    scraped_at: str
    success: bool
    reason: str | None = None
    title: str | None = None
    headings: list[str] = field(default_factory=list)
    paragraphs: list[str] = field(default_factory=list)
    founding_year: int | None = None
    services_mentioned: list[str] = field(default_factory=list)
    raw_text_sample: str | None = None

    def to_dict(self) -> dict:
        return asdict(self)


def scrape_school(school_id: str, website: str | None) -> WebsiteContent:
    """Fetch and extract content from a single school's website.

    Always returns a WebsiteContent - failures are recorded with success=False
    so the generator can read every {school_id}.json without try/except.
    """
    now = _dt.datetime.now(_dt.UTC).isoformat()
    if not website:
        return WebsiteContent(
            school_id=school_id,
            website=None,
            scraped_at=now,
            success=False,
            reason="no_website",
        )

    try:
        with httpx.Client(
            follow_redirects=True,
            timeout=FETCH_TIMEOUT_SEC,
            headers={"User-Agent": USER_AGENT},
        ) as client:
            r = client.get(website)
            r.raise_for_status()
            html = r.text
    except httpx.HTTPError as exc:
        return WebsiteContent(
            school_id=school_id,
            website=website,
            scraped_at=now,
            success=False,
            reason=f"fetch_failed: {exc.__class__.__name__}",
        )

    return _extract(school_id=school_id, website=website, scraped_at=now, html=html)


def _extract(
    school_id: str, website: str, scraped_at: str, html: str
) -> WebsiteContent:
    try:
        doc = lxml.html.fromstring(html)
    except (ValueError, lxml.etree.ParserError) as exc:
        return WebsiteContent(
            school_id=school_id,
            website=website,
            scraped_at=scraped_at,
            success=False,
            reason=f"parse_failed: {exc.__class__.__name__}",
        )

    title_el = doc.find(".//title")
    title = (
        " ".join(title_el.text_content().split()) if title_el is not None else None
    ) or None

    headings: list[str] = []
    for el in doc.xpath("//h1 | //h2"):
        text = " ".join(el.text_content().split())
        if text and text not in headings:
            headings.append(text)
        if len(headings) >= MAX_HEADINGS:
            break

    paragraphs: list[str] = []
    for el in doc.iter("p"):
        text = " ".join(el.text_content().split())
        if len(text) < 30:
            continue
        paragraphs.append(text)
        if len(paragraphs) >= MAX_PARAGRAPHS:
            break

    raw_text = " ".join(headings + paragraphs)
    text_blob_lower = raw_text.lower()
    services = [k for k in SERVICE_KEYWORDS if k.lower() in text_blob_lower]

    founding_year = _extract_founding_year(raw_text)

    return WebsiteContent(
        school_id=school_id,
        website=website,
        scraped_at=scraped_at,
        success=True,
        title=title,
        headings=headings,
        paragraphs=paragraphs,
        founding_year=founding_year,
        services_mentioned=services,
        raw_text_sample=raw_text[:RAW_SAMPLE_CHARS] or None,
    )


_FOUNDING_PATTERNS = (
    # "since 1990", "από το 1990", "established 1990", "ιδρύθηκε το 1990"
    re.compile(r"\bsince\s+(19[5-9]\d|20[0-2]\d)\b", re.I),
    re.compile(r"\bestablished\s+(?:in\s+)?(19[5-9]\d|20[0-2]\d)\b", re.I),
    re.compile(r"\bfounded\s+(?:in\s+)?(19[5-9]\d|20[0-2]\d)\b", re.I),
    re.compile(r"από\s+το\s+(19[5-9]\d|20[0-2]\d)"),
    re.compile(r"ιδρύθηκε\s+το\s+(19[5-9]\d|20[0-2]\d)"),
)


def _extract_founding_year(text: str) -> int | None:
    for pat in _FOUNDING_PATTERNS:
        m = pat.search(text)
        if m:
            return int(m.group(1))
    return None
