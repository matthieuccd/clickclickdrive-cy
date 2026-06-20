"""SEO content generator (Step 4 - the tool, not the content).

For each (school, locale), composes a prompt grounded in real data
(Places signals + scraped website content) and asks Claude to write a
~500-word page following strict editorial rules. Output is Markdown saved
to scraper/data/generated/{school_id}_{locale}.md, one file per page.

The user runs this themselves with their own ANTHROPIC_API_KEY. Estimated
cost at default model + settings: ~$2 for all 110 pages.

Modes
-----
default          fully generate, calling the Anthropic API
--prompts-only   skip the API and dump prompts to data/prompts/ for use
                 with any other tool (or for review before spending tokens)
--limit N        only the first N schools
--school-id ID   one specific school
--locale el|en   one specific locale (default: both)
--model NAME     override model (default: claude-sonnet-4-6)
--overwrite      regenerate even if the .md file already exists

Editorial rules baked in (system prompt)
----------------------------------------
- Flesch-Kincaid grade 8 or below; short sentences, common words.
- Never use em dashes. Use a hyphen (-) or rewrite instead. No bullet points. No "AI tells" (it is worth noting,
  furthermore, moreover, in conclusion, rest assured, navigate the world
  of, ...). No invented facts.
- Journalist voice - sounds like a local writing about their own city.
- Each page weaves in 4 links: previous school in city, next school in
  city, the city listing page, the homepage.

Usage
-----
    export ANTHROPIC_API_KEY=sk-ant-...
    uv run python -m scraper.generate_content --limit 3 --prompts-only
    uv run python -m scraper.generate_content --school-id <id> --locale el
    uv run python -m scraper.generate_content        # all 110 pages
"""

from __future__ import annotations

import argparse
import json
import os
from collections import defaultdict
from pathlib import Path
from typing import Literal

import structlog
from dotenv import load_dotenv

from scraper.slugs import (
    city_slug_el,
    city_slug_en,
    school_slug_el,
    school_slug_en,
)

log = structlog.get_logger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DOTENV_PATH = PROJECT_ROOT / ".env"
ENRICHED = PROJECT_ROOT / "scraper" / "output" / "schools_enriched.jsonl"
CONTENT_DIR = PROJECT_ROOT / "scraper" / "data" / "content"
GENERATED_DIR = PROJECT_ROOT / "scraper" / "data" / "generated"
PROMPTS_DIR = PROJECT_ROOT / "scraper" / "data" / "prompts"

Locale = Literal["el", "en"]
LOCALES: tuple[Locale, Locale] = ("el", "en")

DEFAULT_MODEL = "claude-sonnet-4-6"


# ----------------------------------------------------------------------- prompts


SYSTEM_PROMPT_EL = """\
Είσαι Κύπριος δημοσιογράφος που γράφει για ένα τοπικό περιοδικό. Γράφεις ένα κείμενο
500 λέξεων για μία σχολή οδηγών στην Κύπρο. Στόχος: να βοηθήσεις τον αναγνώστη να
καταλάβει αν η σχολή του ταιριάζει.

ΦΩΝΗ
- Γράψε σε επίπεδο γυμνασίου. Κοντές προτάσεις. Απλές λέξεις. Όπου μπορείς,
  λέξεις με 3 συλλαβές ή λιγότερες.
- Ακούγεσαι σαν άνθρωπος που ζει στην πόλη, όχι σαν διαφημιστής.

ΑΠΑΓΟΡΕΥΕΤΑΙ
- Καμία παύλα em. Χρησιμοποίησε παύλα (-), τελείες ή κόμματα.
- Καμία λίστα με bullets ή αριθμημένα σημεία μέσα στο κείμενο.
- Φράσεις όπως «αξίζει να σημειωθεί», «εν κατακλείδι», «επιπλέον», «επιπροσθέτως»,
  «δεν χρειάζεται να ειπωθεί», «σε έναν κόσμο που αλλάζει συνεχώς».
- Μην εφεύρεις δεδομένα. Αν δεν ξέρεις κάτι, μην το αναφέρεις.

ΒΑΣΗ
- Χρησιμοποίησε όνομα σχολής, πόλη, αξιολόγηση, αριθμό κριτικών, ωράριο.
- Αν υπάρχει κείμενο από την ιστοσελίδα της σχολής, χρησιμοποίησέ το όπως είναι.
- Πρόσφερε την σχολή με το ελληνικό της όνομα.

ΣΥΝΔΕΣΜΟΙ (υποχρεωτικοί, ενσωματωμένοι φυσικά μέσα σε προτάσεις)
- Σύνδεσμος στην προηγούμενη σχολή της ίδιας πόλης.
- Σύνδεσμος στην επόμενη σχολή της ίδιας πόλης.
- Σύνδεσμος στη σελίδα της πόλης.
- Σύνδεσμος στην αρχική σελίδα.

ΜΟΡΦΗ
- Markdown. Μην βάλεις τίτλο H1 - η σελίδα προσθέτει δική της.
- 4 έως 6 σύντομες παραγράφους. Στόχος 480 με 520 λέξεις.
"""


SYSTEM_PROMPT_EN = """\
You are a Cypriot local journalist writing for a community magazine. You write a
500-word feature about one driving school in Cyprus. Goal: help the reader decide
if this school fits them.

VOICE
- High-school reading level. Short sentences. Common words. Aim for words with
  three syllables or fewer where possible.
- You sound like a person who lives in this city, not a marketer.

NEVER
- Never use em dashes. Use a regular hyphen (-) or rewrite the sentence instead.
- No bullet points or numbered lists in the prose.
- No phrases like: "it is worth noting", "in conclusion", "furthermore",
  "moreover", "it goes without saying", "rest assured", "navigate the world of",
  "in today's fast-paced world".
- Do not invent facts. If you don't have a detail, write around it.

GROUND IN DATA
- Use the school name, city, rating, review count, opening hours.
- If website-scraped text is present, use it as-is, don't paraphrase claims.
- Refer to the school by its English name.

REQUIRED LINKS (woven into sentences, not listed)
- A link to the previous school in the same city.
- A link to the next school in the same city.
- A link to the city listing page.
- A link to the homepage.

FORMAT
- Output Markdown only. Do NOT include an H1 - the page already renders one.
- 4 to 6 short paragraphs. Target 480 to 520 words.
"""


def build_user_prompt(
    *,
    school: dict,
    locale: Locale,
    content: dict,
    prev_school: dict | None,
    next_school: dict | None,
) -> str:
    name = (
        (school.get("name_el") if locale == "el" else school.get("name_en"))
        or school.get("name")
        or "(unnamed)"
    )
    city = school["location"]["city"]
    city_label = _city_label(city, locale)
    rating = school.get("rating")
    rev = school.get("review_count")
    phone = school.get("phone_e164")
    addr = school["location"].get("formatted_address")
    hours = school.get("opening_hours") or []

    city_path = _city_path(city, locale)
    home_path = _home_path(locale)
    prev_link = _school_link(prev_school, locale) if prev_school else None
    next_link = _school_link(next_school, locale) if next_school else None

    scraped = ""
    if content.get("success"):
        bits: list[str] = []
        if content.get("title"):
            bits.append(f"Page title: {content['title']}")
        if content.get("headings"):
            bits.append("Headings: " + " | ".join(content["headings"][:4]))
        if content.get("paragraphs"):
            bits.append(
                "Intro paragraphs:\n"
                + "\n".join(content["paragraphs"][:3])
            )
        if content.get("founding_year"):
            bits.append(f"Founding year (from website): {content['founding_year']}")
        if content.get("services_mentioned"):
            bits.append("Services keyword hits: " + ", ".join(content["services_mentioned"]))
        scraped = "\n".join(bits) if bits else "(none extracted)"
    else:
        scraped = f"(no website content - reason: {content.get('reason', 'unknown')})"

    return f"""\
Write the 500-word page for this school. Locale: {locale}.

== School facts ==
Name (rendered): {name}
City: {city_label}
Rating: {rating if rating is not None else "no rating yet"}
Review count: {rev if rev is not None else "-"}
Phone: {phone or "(not listed)"}
Address: {addr or "(not listed)"}
Opening hours:
{_format_hours(hours)}

== Scraped website content ==
{scraped}

== Required links (use these exact paths, link text is your choice) ==
City listing: {city_path}
Homepage: {home_path}
{"Previous school in this city: " + prev_link if prev_link else "Previous school: (none - write around it)"}
{"Next school in this city: " + next_link if next_link else "Next school: (none - write around it)"}

Now write the page.
"""


def _city_label(city: str, locale: Locale) -> str:
    el = {
        "Nicosia": "Λευκωσία",
        "Limassol": "Λεμεσός",
        "Larnaca": "Λάρνακα",
        "Paphos": "Πάφος",
        "Paralimni": "Παραλίμνι",
    }
    return el.get(city, city) if locale == "el" else city


def _city_path(city: str, locale: Locale) -> str:
    if locale == "el":
        return f"/scholes-odigon/{city_slug_el(city)}"
    return f"/en/driving-schools/{city_slug_en(city)}"


def _home_path(locale: Locale) -> str:
    return "/" if locale == "el" else "/en"


def _school_link(school: dict, locale: Locale) -> str:
    sid = school["id"]
    name = school.get("name", "")
    if locale == "el":
        slug = school.get("slug_el") or school_slug_el(school.get("name_el"), name, sid)
        return f"/scholes-odigon/{slug}"
    slug = school.get("slug_en") or school_slug_en(school.get("name_en"), name, sid)
    return f"/en/driving-schools/{slug}"


def _format_hours(hours: list[str]) -> str:
    return "\n".join(f"  - {h}" for h in hours) if hours else "  (not listed)"


# ----------------------------------------------------------------------- runner


def main(argv: list[str] | None = None) -> int:
    # Anchor .env lookup to the project root so this works regardless of CWD.
    # `override=False` lets a shell `export ANTHROPIC_API_KEY=...` take
    # precedence over whatever is in .env - common when rotating keys.
    if DOTENV_PATH.exists():
        load_dotenv(DOTENV_PATH, override=False)
    args = _parse_args(argv)

    schools = _load_schools()
    by_city = _group_by_city_sorted(schools)
    contents = _load_contents(schools)

    if args.school_id:
        schools = [s for s in schools if s["id"] == args.school_id]
    if args.limit:
        schools = schools[: args.limit]

    locales = (args.locale,) if args.locale else LOCALES

    out_dir = PROMPTS_DIR if args.prompts_only else GENERATED_DIR
    out_dir.mkdir(parents=True, exist_ok=True)

    client = None
    if not args.prompts_only:
        client = _make_client()

    done = skipped = failed = 0
    for s in schools:
        city = s["location"]["city"]
        siblings = by_city.get(city, [])
        idx = next((i for i, x in enumerate(siblings) if x["id"] == s["id"]), -1)
        prev_school = siblings[idx - 1] if idx > 0 else None
        next_school = siblings[idx + 1] if 0 <= idx < len(siblings) - 1 else None

        content = contents.get(s["id"], {"success": False, "reason": "not_scraped"})

        for locale in locales:
            ext = "txt" if args.prompts_only else "md"
            out_path = out_dir / f"{s['id']}_{locale}.{ext}"
            if out_path.exists() and not args.overwrite:
                skipped += 1
                continue

            user_prompt = build_user_prompt(
                school=s,
                locale=locale,
                content=content,
                prev_school=prev_school,
                next_school=next_school,
            )
            system_prompt = SYSTEM_PROMPT_EL if locale == "el" else SYSTEM_PROMPT_EN

            if args.prompts_only:
                out_path.write_text(
                    f"### SYSTEM ###\n{system_prompt}\n\n### USER ###\n{user_prompt}\n",
                    encoding="utf-8",
                )
                done += 1
                log.info(
                    "generate.prompt", school_id=s["id"], locale=locale, path=str(out_path)
                )
                continue

            try:
                md = _call_anthropic(
                    client=client,
                    model=args.model,
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                )
            except Exception as exc:
                failed += 1
                log.error(
                    "generate.failed",
                    school_id=s["id"],
                    locale=locale,
                    error=str(exc),
                )
                continue

            out_path.write_text(md, encoding="utf-8")
            done += 1
            log.info("generate.ok", school_id=s["id"], locale=locale, chars=len(md))

    log.info("generate.summary", done=done, skipped=skipped, failed=failed)
    return 0 if failed == 0 else 1


def _make_client():  # noqa: ANN202 - import inside to keep --prompts-only working without the SDK
    try:
        import anthropic
    except ImportError as exc:
        raise SystemExit(
            "anthropic SDK not installed. Run `uv add anthropic` or use --prompts-only."
        ) from exc
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise SystemExit(
            "ANTHROPIC_API_KEY not set.\n"
            f"  Looked for .env at: {DOTENV_PATH} "
            f"({'present' if DOTENV_PATH.exists() else 'missing'})\n"
            "  Either add a non-empty ANTHROPIC_API_KEY=... line to that file,\n"
            "  or `export ANTHROPIC_API_KEY=...` in the shell before running."
        )
    # Pass explicitly so the SDK doesn't have to round-trip through os.environ
    # itself; equivalent in behaviour but makes the source of truth obvious.
    return anthropic.Anthropic(api_key=api_key)


def _call_anthropic(*, client, model: str, system_prompt: str, user_prompt: str) -> str:
    msg = client.messages.create(
        model=model,
        max_tokens=2000,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )
    parts = [b.text for b in msg.content if getattr(b, "type", None) == "text"]
    return "\n".join(parts).strip() + "\n"


def _load_schools() -> list[dict]:
    return [
        json.loads(line)
        for line in ENRICHED.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


def _group_by_city_sorted(schools: list[dict]) -> dict[str, list[dict]]:
    """Group by city; within a city order by rating desc (None last)."""
    by_city: dict[str, list[dict]] = defaultdict(list)
    for s in schools:
        c = s["location"].get("city")
        if c:
            by_city[c].append(s)
    for c in by_city:
        by_city[c].sort(
            key=lambda x: (-(x.get("rating") or -1), -(x.get("review_count") or 0))
        )
    return by_city


def _load_contents(schools: list[dict]) -> dict[str, dict]:
    out: dict[str, dict] = {}
    for s in schools:
        p = CONTENT_DIR / f"{s['id']}.json"
        if p.exists():
            out[s["id"]] = json.loads(p.read_text(encoding="utf-8"))
    return out


def _parse_args(argv: list[str] | None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Generate per-school SEO content")
    p.add_argument("--limit", type=int, default=None)
    p.add_argument("--school-id", default=None)
    p.add_argument("--locale", choices=["el", "en"], default=None)
    p.add_argument("--model", default=DEFAULT_MODEL)
    p.add_argument("--overwrite", action="store_true")
    p.add_argument(
        "--prompts-only",
        action="store_true",
        help="Don't call the API; dump prompts to scraper/data/prompts/.",
    )
    return p.parse_args(argv)


if __name__ == "__main__":
    raise SystemExit(main())
