"""QA gate for generated blog articles.

Checks each markdown file for structural and editorial requirements before
a PR can be opened. Exit 0 = all checks pass. Exit 1 = failures found.

Usage:
    uv run python -m scraper.qa_blog --article-id <id>
    uv run python -m scraper.qa_blog scraper/data/blog/some-article_en.md
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Banned phrases per locale
# ---------------------------------------------------------------------------

_BANNED_EN: list[str] = [
    "furthermore",
    "moreover",
    "it is worth noting",
    "in conclusion",
    "it goes without saying",
    "it is important to note",
    "navigating",
    "delve",
    "crucial",
    "ensure",
    "seamless",
    "in today's fast-paced world",
    "rest assured",
]

_BANNED_EL: list[str] = [
    "επιπλέον",
    "επιπροσθέτως",
    "αξίζει να σημειωθεί",
    "εν κατακλείδι",
    "δεν χρειάζεται να ειπωθεί",
    "πλοηγηθείτε",
    "βυθιστείτε",
    "κρίσιμο",
    "εξασφαλίστε",
    "απρόσκοπτο",
    "σε έναν κόσμο που αλλάζει συνεχώς",
]

_FAQ_HEADING_EN = re.compile(r"^## FAQ\s*$", re.IGNORECASE)
_FAQ_HEADING_EL = re.compile(r"^## Συχνές Ερωτήσεις\s*$")
_FAQ_QUESTION = re.compile(r"^\*\*.+\*\*\s*$")
_H1 = re.compile(r"^# [^#]")
_H3 = re.compile(r"^#{3} ")
_EM_DASH = "—"  # —


def _detect_locale(path: Path) -> str:
    stem = path.stem  # e.g. "some-article_en"
    if stem.endswith("_el"):
        return "el"
    if stem.endswith("_en"):
        return "en"
    raise ValueError(f"Cannot detect locale from filename: {path.name!r} (expected _en or _el suffix)")


def _split_faq(lines: list[str], locale: str) -> tuple[list[str], list[str]]:
    faq_re = _FAQ_HEADING_EL if locale == "el" else _FAQ_HEADING_EN
    for i, line in enumerate(lines):
        if faq_re.match(line):
            return lines[:i], lines[i:]
    return lines, []


def _word_count(lines: list[str]) -> int:
    text = " ".join(lines)
    return len(text.split())


def check_file(path: Path) -> list[str]:
    """Return list of error strings. Empty list means the file passes."""
    errors: list[str] = []
    locale = _detect_locale(path)
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()

    # --- H1 check ---
    h1_lines = [i + 1 for i, ln in enumerate(lines) if _H1.match(ln)]
    if h1_lines:
        errors.append(f"H1 heading found on line(s): {h1_lines} (page renders its own H1)")

    # --- H3 check ---
    h3_lines = [i + 1 for i, ln in enumerate(lines) if _H3.match(ln)]
    if h3_lines:
        errors.append(f"H3 heading found on line(s): {h3_lines} (only H2 allowed)")

    # --- Em-dash check ---
    em_lines = [i + 1 for i, ln in enumerate(lines) if _EM_DASH in ln]
    if em_lines:
        errors.append(f"Em-dash found on line(s): {em_lines} (use hyphen or rewrite)")

    # --- FAQ split ---
    body_lines, faq_lines = _split_faq(lines, locale)

    # --- Word count ---
    body_words = _word_count(body_lines)
    total_words = _word_count(lines)
    if body_words < 1900:
        errors.append(f"Body word count {body_words} < 1900 (excluding FAQ)")
    if total_words < 2100:
        errors.append(f"Total word count {total_words} < 2100")

    # --- FAQ item count ---
    if not faq_lines:
        errors.append("FAQ section not found (expected '## FAQ' or '## Συχνές Ερωτήσεις')")
    else:
        faq_questions = [ln for ln in faq_lines if _FAQ_QUESTION.match(ln)]
        if len(faq_questions) != 5:
            errors.append(f"FAQ has {len(faq_questions)} question(s), expected exactly 5")

    # --- Banned phrases ---
    banned = _BANNED_EL if locale == "el" else _BANNED_EN
    text_lower = text.lower()
    for phrase in banned:
        if phrase.lower() in text_lower:
            errors.append(f"Banned phrase found: {phrase!r}")

    return errors


def check_article(article_id: str, blog_dir: Path) -> dict[str, list[str]]:
    """Check both locales for an article. Returns {locale: [errors]}."""
    results: dict[str, list[str]] = {}
    for locale in ("en", "el"):
        path = blog_dir / f"{article_id}_{locale}.md"
        if not path.exists():
            results[locale] = [f"File not found: {path}"]
        else:
            results[locale] = check_file(path)
    return results


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description="QA gate for generated blog articles")
    p.add_argument("--article-id", default=None, help="Article ID — checks both _en.md and _el.md")
    p.add_argument("files", nargs="*", metavar="FILE", help="One or more markdown files to check")
    p.add_argument(
        "--blog-dir",
        default="scraper/data/blog",
        help="Directory containing blog markdown files (default: scraper/data/blog)",
    )
    return p.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv)
    blog_dir = Path(args.blog_dir)
    all_passed = True

    if args.article_id and args.files:
        print("Error: specify --article-id OR file paths, not both", file=sys.stderr)
        return 2

    if not args.article_id and not args.files:
        print("Error: specify --article-id <id> or one or more file paths", file=sys.stderr)
        return 2

    if args.article_id:
        results = check_article(args.article_id, blog_dir)
        for locale, errors in results.items():
            label = f"{args.article_id}_{locale}.md"
            if errors:
                all_passed = False
                print(f"FAIL {label}")
                for err in errors:
                    print(f"  - {err}")
            else:
                print(f"PASS {label}")
    else:
        for file_str in args.files:
            path = Path(file_str)
            errors = check_file(path)
            if errors:
                all_passed = False
                print(f"FAIL {path.name}")
                for err in errors:
                    print(f"  - {err}")
            else:
                print(f"PASS {path.name}")

    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
