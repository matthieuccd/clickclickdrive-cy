"""Source registry.

Decouples `run.py` from the concrete source classes. Adding a new source =
add an entry to `SOURCE_FACTORIES`. Each factory takes no args and returns
something with a `.fetch() -> Iterator[RawListing]` method.

Factories are intentionally lazy: a heavy source (e.g. Scrapling, which
pulls in browser engines) is only imported when its name is actually
requested via `--sources`. That way `--sources google_places` works on
a machine that doesn't have Scrapling's optional fetcher deps installed.
"""

from __future__ import annotations

from collections.abc import Callable, Iterator
from typing import Protocol

from scraper.models import RawListing, SourceName


class Source(Protocol):
    name: SourceName

    def fetch(self) -> Iterator[RawListing]: ...


SourceFactory = Callable[[], Source]


def _make_google_places() -> Source:
    from scraper.sources.places import GooglePlacesSource

    return GooglePlacesSource()


def _make_directory() -> Source:
    from scraper.sources.directory_spider import DirectorySpider

    return DirectorySpider()


SOURCE_FACTORIES: dict[SourceName, SourceFactory] = {
    SourceName.GOOGLE_PLACES: _make_google_places,
    SourceName.DIRECTORY: _make_directory,
}


def iter_sources(enabled: set[SourceName] | None = None) -> Iterator[Source]:
    """Instantiate and yield each enabled source.

    `enabled=None` means all registered sources.
    """
    for source_name, factory in SOURCE_FACTORIES.items():
        if enabled is not None and source_name not in enabled:
            continue
        yield factory()
