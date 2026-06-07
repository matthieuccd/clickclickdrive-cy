"""Source registry.

Decouples `run.py` from the concrete source classes. Adding a new source =
add an entry to `SOURCE_FACTORIES`. Each factory takes no args and returns
something with a `.fetch() -> Iterator[RawListing]` method.
"""

from __future__ import annotations

from collections.abc import Callable, Iterator
from typing import Protocol

from scraper.models import RawListing, SourceName
from scraper.sources.directory_spider import DirectorySpider
from scraper.sources.places import GooglePlacesSource


class Source(Protocol):
    name: SourceName

    def fetch(self) -> Iterator[RawListing]: ...


SourceFactory = Callable[[], Source]


SOURCE_FACTORIES: dict[SourceName, SourceFactory] = {
    SourceName.GOOGLE_PLACES: GooglePlacesSource,
    SourceName.DIRECTORY: DirectorySpider,
}


def iter_sources(enabled: set[SourceName] | None = None) -> Iterator[Source]:
    """Instantiate and yield each enabled source.

    `enabled=None` means all registered sources.
    """
    for source_name, factory in SOURCE_FACTORIES.items():
        if enabled is not None and source_name not in enabled:
            continue
        yield factory()
