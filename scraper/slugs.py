"""URL slug helpers.

Greek slugs are produced by transliterating to Latin (ISO 843 / passport
scheme) and then kebab-casing. We never percent-encode Greek script in URLs;
the rendered path is always pure ASCII a-z0-9-.

This module is the single source of truth - `add_slugs.py` calls it to
write slug_el / slug_en fields into the enriched JSONL, and the Next.js
side just reads those pre-computed values.
"""

from __future__ import annotations

import re
import unicodedata

# Greek → Latin per ISO 843 (and matching Cypriot passport conventions).
# Lowercase only; upper-case input is normalized to lower before lookup.
GREEK_TO_LATIN: dict[str, str] = {
    "α": "a", "β": "v", "γ": "g", "δ": "d", "ε": "e", "ζ": "z",
    "η": "i", "θ": "th", "ι": "i", "κ": "k", "λ": "l", "μ": "m",
    "ν": "n", "ξ": "x", "ο": "o", "π": "p", "ρ": "r", "σ": "s",
    "ς": "s", "τ": "t", "υ": "y", "φ": "f", "χ": "ch", "ψ": "ps",
    "ω": "o",
}

CITY_GREEK_SLUGS: dict[str, str] = {
    "Nicosia": "lefkosia",
    "Limassol": "lemesos",
    "Larnaca": "larnaka",
    "Paphos": "pafos",
    "Paralimni": "paralimni",
}

CITY_ENGLISH_SLUGS: dict[str, str] = {
    "Nicosia": "nicosia",
    "Limassol": "limassol",
    "Larnaca": "larnaca",
    "Paphos": "paphos",
    "Paralimni": "paralimni",
}


def transliterate_el_to_latin(text: str) -> str:
    """Greek + diacritics → plain ASCII Latin (lowercase)."""
    # Decompose so combining accents/tonos can be dropped.
    decomposed = unicodedata.normalize("NFD", text)
    stripped = "".join(c for c in decomposed if not unicodedata.combining(c))
    out: list[str] = []
    for ch in stripped:
        lower = ch.lower()
        if lower in GREEK_TO_LATIN:
            out.append(GREEK_TO_LATIN[lower])
        else:
            out.append(lower)
    return "".join(out)


def _kebab(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def school_slug_el(name_el: str | None, name: str, school_id: str) -> str:
    """Slug for the Greek URL.

    Pulls the Greek name when present, falls back to the raw `name`, then
    transliterates and kebabs. A 6-char id suffix guarantees uniqueness
    against name collisions (two schools called "Σχολή Οδηγών").
    """
    source = name_el or name or "scholi-odigon"
    latin = transliterate_el_to_latin(source)
    base = _kebab(latin) or "scholi-odigon"
    return f"{base}-{school_id[:6]}"


def school_slug_en(name_en: str | None, name: str, school_id: str) -> str:
    source = name_en or name or "driving-school"
    base = _kebab(source) or "driving-school"
    return f"{base}-{school_id[:6]}"


def city_slug_el(city: str) -> str:
    return CITY_GREEK_SLUGS.get(city, _kebab(city))


def city_slug_en(city: str) -> str:
    return CITY_ENGLISH_SLUGS.get(city, _kebab(city))
