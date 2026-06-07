"""Cypriot business-directory spider built on Scrapling.

Scrapling (https://github.com/d4vinci/Scrapling) gives us resilient selectors
that survive minor HTML drift — useful for directory sites that don't ship
machine-readable APIs.

Add one DirectorySite config per target site. The spider iterates listing
pages, follows pagination, opens each detail page, and yields RawListing.

Sites worth seeding (left for the operator to fill in selectors after
inspecting current HTML):
  - https://www.yellowpages.com.cy/
  - https://www.cyprusyellowpages.com/
  - https://www.cyprus.com/ (driving-school directory section)
"""

from __future__ import annotations

from collections.abc import Iterator
from dataclasses import dataclass, field

import structlog
from scrapling import Fetcher
from scrapling.parser import Adaptor

from scraper.models import RawListing, SourceName

log = structlog.get_logger(__name__)


@dataclass
class DirectorySite:
    """Per-site config. Selectors are CSS — Scrapling auto-relocates on drift."""

    site_id: str
    start_urls: list[str]
    listing_card_selector: str
    detail_link_selector: str
    next_page_selector: str | None = None

    detail_name_selector: str = "h1"
    detail_phone_selector: str | None = None
    detail_website_selector: str | None = None
    detail_address_selector: str | None = None
    detail_email_selector: str | None = None

    headers: dict[str, str] = field(default_factory=dict)


# Seed list — selectors are intentionally generic. Tune per site before running.
CYPRUS_DIRECTORIES: tuple[DirectorySite, ...] = (
    DirectorySite(
        site_id="yellowpages_cy",
        start_urls=[
            "https://www.yellowpages.com.cy/en/search/driving-schools",
        ],
        listing_card_selector=".listing-card",
        detail_link_selector="a.listing-title::attr(href)",
        next_page_selector="a.pagination-next::attr(href)",
        detail_name_selector="h1.business-name",
        detail_phone_selector=".business-phone::text",
        detail_website_selector="a.business-website::attr(href)",
        detail_address_selector=".business-address::text",
    ),
)


class DirectorySpider:
    """Iterable source over all configured Cypriot directory sites."""

    name = SourceName.DIRECTORY

    def __init__(self, sites: tuple[DirectorySite, ...] = CYPRUS_DIRECTORIES) -> None:
        self.sites = sites
        # auto_match=True lets Scrapling re-find elements when selectors drift.
        self.fetcher = Fetcher(auto_match=True)

    def fetch(self) -> Iterator[RawListing]:
        for site in self.sites:
            yield from self._crawl_site(site)

    def _crawl_site(self, site: DirectorySite) -> Iterator[RawListing]:
        for start_url in site.start_urls:
            url: str | None = start_url
            page_num = 0
            while url:
                page_num += 1
                log.info("directory.list_page", site=site.site_id, page=page_num, url=url)
                try:
                    page = self.fetcher.get(url, headers=site.headers or None)
                except Exception as exc:
                    log.warning("directory.list_fetch_failed", url=url, error=str(exc))
                    break

                for detail_url in self._extract_detail_urls(page, site):
                    listing = self._scrape_detail(detail_url, site)
                    if listing is not None:
                        yield listing

                url = self._next_url(page, site)

    def _extract_detail_urls(self, page: Adaptor, site: DirectorySite) -> list[str]:
        links = page.css(site.detail_link_selector)
        return [self._absolutize(href, page.url) for href in links if href]

    def _next_url(self, page: Adaptor, site: DirectorySite) -> str | None:
        if not site.next_page_selector:
            return None
        next_href = page.css_first(site.next_page_selector)
        if not next_href:
            return None
        return self._absolutize(str(next_href), page.url)

    def _scrape_detail(self, url: str, site: DirectorySite) -> RawListing | None:
        try:
            page = self.fetcher.get(url, headers=site.headers or None)
        except Exception as exc:
            log.warning("directory.detail_fetch_failed", url=url, error=str(exc))
            return None

        name_el = page.css_first(site.detail_name_selector)
        if not name_el:
            log.info("directory.detail_no_name", url=url)
            return None
        name = name_el.text.strip()

        return RawListing(
            source=SourceName.DIRECTORY,
            source_id=f"{site.site_id}:{url}",
            name=name,
            phone=self._text(page, site.detail_phone_selector),
            website=self._text(page, site.detail_website_selector),
            email=self._text(page, site.detail_email_selector),
            address_text=self._text(page, site.detail_address_selector),
            raw={"url": url, "site_id": site.site_id},
        )

    @staticmethod
    def _text(page: Adaptor, selector: str | None) -> str | None:
        if not selector:
            return None
        match = page.css_first(selector)
        if match is None:
            return None
        return str(match).strip() or None

    @staticmethod
    def _absolutize(href: str, base: str) -> str:
        from urllib.parse import urljoin

        return urljoin(base, href)
