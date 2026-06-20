"""Generate editorial content for the 'Best Driving Schools' city pages.

Usage:
    python -m scraper.generate_best_of [--cities nicosia limassol ...] [--locale el en] [--force]

Outputs:
    scraper/data/best-of/{city}_{locale}.json  - structured content (intro, school paragraphs, closing, FAQ)

Hero images are downloaded separately via scraper/download_hero_images.py.

Content format:
    {
        "intro": "One strong sentence...",
        "schools": {"school_id": "100-150 word paragraph..."},
        "closing": "300+ word closing paragraph...",
        "faq": [{"q": "...", "a": "..."}, ...]
    }

Requires:
    ANTHROPIC_API_KEY  - for Claude content generation
"""

from __future__ import annotations

import argparse
import json
import os
import time
from pathlib import Path

import anthropic
import structlog
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")
log = structlog.get_logger(__name__)

CITIES: dict[str, dict] = {
    "nicosia": {"el": "Λευκωσία", "en": "Nicosia", "el_acc": "Λευκωσία", "en_city": "Nicosia"},
    "limassol": {"el": "Λεμεσός", "en": "Limassol", "el_acc": "Λεμεσό", "en_city": "Limassol"},
    "larnaca": {"el": "Λάρνακα", "en": "Larnaca", "el_acc": "Λάρνακα", "en_city": "Larnaca"},
    "paphos": {"el": "Πάφος", "en": "Paphos", "el_acc": "Πάφο", "en_city": "Paphos"},
    "paralimni": {"el": "Παραλίμνι", "en": "Paralimni", "el_acc": "Παραλίμνι", "en_city": "Paralimni"},
}

CITY_NAME_TO_KEY = {
    "Nicosia": "nicosia",
    "Limassol": "limassol",
    "Larnaca": "larnaca",
    "Paphos": "paphos",
    "Paralimni": "paralimni",
}

OUTPUT_DIR = Path(__file__).parent / "data" / "best-of"


def load_schools_for_city(city_key: str) -> list[dict]:
    """Load and rank schools for a city from the enriched JSONL."""
    jsonl = Path(__file__).parent / "output" / "schools_enriched.jsonl"
    if not jsonl.exists():
        jsonl = Path(__file__).parent / "output" / "schools.jsonl"
    if not jsonl.exists():
        return []

    city_name = CITIES[city_key]["en"]
    schools = []
    with open(jsonl) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            s = json.loads(line)
            if s.get("location", {}).get("city") == city_name and s.get("rating") is not None:
                schools.append(s)

    schools.sort(
        key=lambda s: (-(s.get("rating") or 0), -(s.get("review_count") or 0))
    )
    return schools[:10]


def school_summary_lines(schools: list[dict], locale: str) -> str:
    lines = []
    for i, s in enumerate(schools, 1):
        name = (
            (s.get("name_el") or s.get("name_en") or s.get("name", ""))
            if locale == "el"
            else (s.get("name_en") or s.get("name_el") or s.get("name", ""))
        )
        rating = s.get("rating")
        reviews = s.get("review_count")
        addr = (s.get("location") or {}).get("formatted_address", "")
        r_str = f"{rating}/5 ({reviews} reviews)" if rating and reviews else "no rating"
        lines.append(f"{i}. ID:{s['id']} | {name} | {r_str} | {addr[:60]}")
    return "\n".join(lines) if lines else "(no schools found)"


EL_SYSTEM = """Είσαι ειδικός συντάκτης SEO για κυπριακή πλατφόρμα σχολών οδηγών.
Γράφεις σαφές, χρήσιμο περιεχόμενο για τοπική αναζήτηση. Ύφος: τοπικός κυπριακός δημοσιογράφος.
Κανόνες γραφής:
- Καμία παύλα em (—). Ποτέ. Χρησιμοποίησε παύλα (-), τελείες ή κόμματα.
- Χωρίς φράσεις-filler: "επιπλέον", "εν κατακλείδι", "αξίζει να σημειωθεί", "εξαιρετικός", "μοναδικός".
- Επίπεδο δυσκολίας Flesch-Kincaid 8 ή κάτω - απλές προτάσεις.
- Αναφορές σε έτος: 2026.
- Μόνο JSON output."""

EN_SYSTEM = """You are an SEO copywriter for a Cyprus driving school marketplace.
Write clear, useful content for local search. Style: local Cyprus journalist.
Writing rules:
- Never use em dashes (—). Use a regular hyphen (-) or rewrite the sentence.
- No filler phrases: furthermore, moreover, in conclusion, it is worth noting, excellent, unique.
- Flesch-Kincaid grade 8 or below - short sentences.
- All year references: 2026.
- CRITICAL: All school names must be written in Latin characters only. Never use Greek characters anywhere in your output. If a school name is in Greek (e.g. Σχολή Οδηγών), transliterate it to Latin characters (e.g. Scholi Odigon). This rule applies to every field: intro, school paragraphs, closing, and FAQ.
- Output JSON only."""


def build_prompt_el(city_key: str, schools: list[dict]) -> str:
    info = CITIES[city_key]
    name = info["el"]
    name_acc = info["el_acc"]
    summary = school_summary_lines(schools, "el")
    return f"""Γράψε περιεχόμενο για τη σελίδα "Καλύτερες Σχολές Οδηγών στη(ν) {name_acc} 2026".

Σχολές (με ID, ταξινομημένες από υψηλότερη αξιολόγηση):
{summary}

Γράψε ένα JSON αντικείμενο με αυτή τη δομή:
{{
  "intro": "Μία ισχυρή εισαγωγική πρόταση για τις σχολές οδηγών στη(ν) {name_acc}.",
  "schools": {{
    "<id>": "100-150 λέξεις για αυτή τη σχολή (συγκεκριμένες πληροφορίες, τοποθεσία, τι ξεχωρίζει)."
  }},
  "closing": "Μία παράγραφος 300+ λέξεων με τοπικές πληροφορίες για οδήγηση στη(ν) {name_acc}: γειτονιές, συνθήκες δρόμων, κυκλοφορία, συμβουλές για τις εξετάσεις, τι κάνει την πόλη ξεχωριστή για εκπαίδευση οδηγών.",
  "faq": [
    {{"q": "Ερώτηση 1 για άδεια οδήγησης στη(ν) {name_acc};", "a": "Απάντηση 1."}},
    {{"q": "Ερώτηση 2;", "a": "Απάντηση 2."}},
    {{"q": "Ερώτηση 3;", "a": "Απάντηση 3."}},
    {{"q": "Ερώτηση 4;", "a": "Απάντηση 4."}},
    {{"q": "Ερώτηση 5;", "a": "Απάντηση 5."}}
  ]
}}

Οδηγίες:
- Συμπεριέλαβε παράγραφο για ΚΑΘΕ σχολή που αναφέρεται (χρησιμοποίησε το ID ως κλειδί).
- Ελάχιστο 1200 λέξεις συνολικά.
- Μόνο JSON, χωρίς markdown γύρω από αυτό."""


def build_prompt_en(city_key: str, schools: list[dict]) -> str:
    info = CITIES[city_key]
    name = info["en"]
    summary = school_summary_lines(schools, "en")
    return f"""Write content for the page "Best Driving Schools in {name} 2026".

Schools (with ID, ranked by highest rating):
{summary}

Write a JSON object with this structure:
{{
  "intro": "One strong opening sentence about driving schools in {name}.",
  "schools": {{
    "<id>": "100-150 words about this school (specific info, location, what stands out)."
  }},
  "closing": "One paragraph of 300+ words with local information about driving in {name}: neighbourhoods, road conditions, traffic patterns, test tips, what makes the city unique for driver training.",
  "faq": [
    {{"q": "Question 1 about getting a licence in {name}?", "a": "Answer 1."}},
    {{"q": "Question 2?", "a": "Answer 2."}},
    {{"q": "Question 3?", "a": "Answer 3."}},
    {{"q": "Question 4?", "a": "Answer 4."}},
    {{"q": "Question 5?", "a": "Answer 5."}}
  ]
}}

Instructions:
- Include a paragraph for EVERY school listed (use the ID as the key).
- Minimum 1200 words total.
- All school names must be in Latin characters only — never Greek. Transliterate any Greek name.
- Output JSON only, no markdown wrapper."""


def generate_content(city_key: str, locale: str, client: anthropic.Anthropic) -> dict:
    schools = load_schools_for_city(city_key)
    system = EL_SYSTEM if locale == "el" else EN_SYSTEM
    prompt = build_prompt_el(city_key, schools) if locale == "el" else build_prompt_en(city_key, schools)

    log.info("generate_best_of.claude", city=city_key, locale=locale)
    for attempt in range(3):
        message = client.messages.create(
            model="claude-opus-4-7",
            max_tokens=8192,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = message.content[0].text.strip()
        # Strip any markdown code fences
        if raw.startswith("```"):
            raw = raw.split("```", 2)[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.rsplit("```", 1)[0].strip()
        try:
            data = json.loads(raw)
            break
        except json.JSONDecodeError as exc:
            log.warning("generate_best_of.json_error", city=city_key, attempt=attempt + 1, error=str(exc))
            if attempt == 2:
                raise
    else:
        raise RuntimeError(f"Failed to get valid JSON for {city_key}/{locale} after 3 attempts")
    # Sanitise em dashes just in case
    def clean(v):
        if isinstance(v, str):
            return v.replace("—", "-")
        if isinstance(v, list):
            return [clean(i) for i in v]
        if isinstance(v, dict):
            return {k: clean(val) for k, val in v.items()}
        return v

    return clean(data)


def run(cities: list[str], locales: list[str], force: bool) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    anthropic_key = os.environ.get("ANTHROPIC_API_KEY")
    if not anthropic_key:
        raise SystemExit("ANTHROPIC_API_KEY is not set")
    client = anthropic.Anthropic(api_key=anthropic_key)

    for city_key in cities:
        for locale in locales:
            out_path = OUTPUT_DIR / f"{city_key}_{locale}.json"
            if not force and out_path.exists():
                log.info("generate_best_of.skip_existing", path=str(out_path))
                continue

            content = generate_content(city_key, locale, client)
            out_path.write_text(json.dumps(content, ensure_ascii=False, indent=2), encoding="utf-8")
            log.info("generate_best_of.saved", path=str(out_path))
            time.sleep(1)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate best-of city page content")
    parser.add_argument(
        "--cities",
        nargs="+",
        choices=list(CITIES.keys()),
        default=list(CITIES.keys()),
    )
    parser.add_argument(
        "--locale",
        nargs="+",
        choices=["el", "en"],
        default=["el", "en"],
        dest="locales",
    )
    parser.add_argument("--force", action="store_true", help="Overwrite existing files")
    args = parser.parse_args()
    run(args.cities, args.locales, args.force)


if __name__ == "__main__":
    main()
