"""Generate long-form blog articles for the Cyprus marketplace.

Pattern mirrors scraper/generate_content.py: one Anthropic API call per
(article, locale). Saves raw Markdown to scraper/data/blog/{article_id}_{locale}.md.

The article registry lives in this file (ARTICLES list). Add an entry per
article. The Next.js side mirrors the article metadata in
apps/web/src/lib/blog.ts; keep the article IDs in sync.

Usage
-----
    export ANTHROPIC_API_KEY=sk-ant-...
    uv run python -m scraper.generate_blog \\
        --article-id how-to-get-driving-licence-cyprus-foreigner
    uv run python -m scraper.generate_blog --locale el            # all articles, Greek only
    uv run python -m scraper.generate_blog --overwrite            # regenerate everything
"""

from __future__ import annotations

import argparse
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

import structlog
from dotenv import load_dotenv

log = structlog.get_logger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DOTENV_PATH = PROJECT_ROOT / ".env"
BLOG_DIR = PROJECT_ROOT / "scraper" / "data" / "blog"

Locale = Literal["el", "en"]
LOCALES: tuple[Locale, Locale] = ("el", "en")

DEFAULT_MODEL = "claude-sonnet-4-6"


# ----------------------------------------------------------------------- article


@dataclass(frozen=True)
class ArticleSpec:
    id: str
    topic_el: str
    topic_en: str
    title_el: str
    title_en: str
    audience_el: str
    audience_en: str
    # Cyprus-specific facts the model must thread in. Plain language, no fluff.
    facts: tuple[str, ...]
    # Six to eight section titles. The model uses these as H2 anchors.
    sections_el: tuple[str, ...]
    sections_en: tuple[str, ...]
    # Internal link targets (path, anchor text) the model MUST weave in.
    internal_links_el: tuple[tuple[str, str], ...]
    internal_links_en: tuple[tuple[str, str], ...]


ARTICLES: tuple[ArticleSpec, ...] = (
    ArticleSpec(
        id="how-to-get-driving-licence-cyprus-foreigner",
        topic_el="Πώς να βγάλετε δίπλωμα οδήγησης στην Κύπρο ως ξένος",
        topic_en="How to get a driving licence in Cyprus as a foreigner",
        title_el="Πώς να βγάλετε δίπλωμα οδήγησης στην Κύπρο ως ξένος",
        title_en="How to get a driving licence in Cyprus as a foreigner",
        audience_el=(
            "Ξένοι που μένουν ή σκοπεύουν να μείνουν στην Κυπριακή Δημοκρατία. "
            "Πολίτες ΕΕ, Βρετανοί μετά το Brexit, και πολίτες τρίτων χωρών."
        ),
        audience_en=(
            "Foreigners living in or moving to the Republic of Cyprus. EU citizens, "
            "Brits after Brexit, and third-country nationals."
        ),
        facts=(
            "The authority that issues driving licences in the Republic of Cyprus is "
            "the Department of Road Transport (Τμήμα Οδικών Μεταφορών), under the "
            "Ministry of Transport, Communications and Works.",
            "Cyprus drives on the LEFT side of the road. Speed limits and distances "
            "are in kilometres and km/h.",
            "The minimum age to hold a Category B (car) licence in Cyprus is 18.",
            "EU and EEA licence holders who become residents in Cyprus can keep "
            "driving on their home licence, but most choose to exchange it for a "
            "Cypriot licence. They typically have a window after taking up residence "
            "to do so without retesting. Check current rules with the Department of "
            "Road Transport because periods can change.",
            "Non-EU licence holders, including UK licence holders after Brexit, may "
            "need a translation of their licence and in some cases must pass a "
            "Cypriot theory or practical test to convert. Bilateral agreements "
            "change over time, so check the current list before applying.",
            "Learner drivers in Cyprus first apply for a Learner's Licence "
            "(εκπαιδευτική άδεια). The car must display red 'L' plates front and rear "
            "while a learner is driving.",
            "The theory test (γραπτή εξέταση) in Cyprus can be taken in Greek or "
            "English. It covers road signs, rules, and safe driving.",
            "The practical test is conducted by an examiner from the Department of "
            "Road Transport. Lessons happen with a licensed instructor in a car with "
            "dual controls.",
            "Lessons typically last 45 minutes. Prices vary by school and city; "
            "shopping around is normal.",
            "Required documents for a foreigner usually include: a valid passport "
            "or ID, proof of residence in Cyprus (rental contract, utility bill, or "
            "yellow slip / ARC), a recent photograph, and a medical certificate "
            "from a doctor. The exact list depends on the candidate's status.",
            "The five main cities are Nicosia (the capital, with the Department of "
            "Road Transport headquarters), Limassol, Larnaca, Paphos, and Paralimni.",
            "The Republic of Cyprus only covers the south. Northern Cyprus (TRNC) "
            "operates a separate licensing system and a Cypriot licence does not "
            "automatically extend there.",
        ),
        sections_el=(
            "Πρώτα τα βασικά για την Κύπρο",
            "Τι ισχύει για άδειες ΕΕ",
            "Τι ισχύει για άδειες εκτός ΕΕ και Βρετανίας",
            "Τα έγγραφα που θα χρειαστείτε",
            "Η εκπαιδευτική άδεια και τα μαθήματα",
            "Η γραπτή εξέταση στα ελληνικά ή στα αγγλικά",
            "Η πρακτική εξέταση",
            "Κόστος, χρόνοι και πρακτικές συμβουλές",
        ),
        sections_en=(
            "The Cyprus basics you need to know",
            "What happens if you hold an EU licence",
            "Drivers from the UK and other non-EU countries",
            "The papers you will need to bring",
            "Your learner's licence and the lessons",
            "The theory test in English or Greek",
            "The practical test day",
            "Cost, timing, and tips before you start",
        ),
        internal_links_el=(
            ("/arthra/anallagi-adeias-ee-kypros", "ανταλλαγή άδειας ΕΕ"),
            ("/arthra/vretaniko-diploma-kypros", "βρετανική άδεια μετά το Brexit"),
            ("/arthra/theoritiki-eksetasi-aglika", "θεωρητική εξέταση στα αγγλικά"),
            ("/scholes-odigon/lefkosia", "σχολές οδηγών στη Λευκωσία"),
            ("/", "ClickClickDrive Κύπρος"),
        ),
        internal_links_en=(
            ("/en/blog/exchange-eu-licence-cyprus", "exchange your EU licence"),
            ("/en/blog/uk-licence-cyprus-after-brexit", "UK licence after Brexit"),
            ("/en/blog/theory-test-cyprus-english", "theory test in English"),
            ("/en/driving-schools/nicosia", "driving schools in Nicosia"),
            ("/en", "ClickClickDrive Cyprus"),
        ),
    ),
)


# ----------------------------------------------------------------------- prompts


SYSTEM_PROMPT_EL = """\
Είσαι Κύπρια δημοσιογράφος, γραμμένη σε εφημερίδα της Κύπρου. Γράφεις για
αναγνώστες με μέτρια γνώση ελληνικών. Έχεις κάνει πραγματική έρευνα στο
Τμήμα Οδικών Μεταφορών και ξέρεις πώς λειτουργεί στην πράξη.

ΦΩΝΗ
- Επίπεδο γυμνασίου. Κοντές προτάσεις. Καθημερινές λέξεις.
- Όπου γίνεται, λέξεις με 3 συλλαβές ή λιγότερες.
- Καμία πρόταση δεν ξεπερνά τις 20 λέξεις. Μέτρα τις.
- Δεν ακούγεσαι σαν μάρκετινγκ. Ακούγεσαι σαν άνθρωπος.

ΑΠΑΓΟΡΕΥΣΕΙΣ
- Καμία παύλα em (—) πουθενά. Ποτέ. Χρησιμοποίησε τελείες ή κόμματα.
- Καμία H3. Μόνο H2 (## ) για τις ενότητες και ## Συχνές Ερωτήσεις για το FAQ.
- Καμία από αυτές τις λέξεις/φράσεις πουθενά: «επιπλέον», «επιπροσθέτως»,
  «αξίζει να σημειωθεί», «εν κατακλείδι», «δεν χρειάζεται να ειπωθεί»,
  «πλοηγηθείτε», «βυθιστείτε», «κρίσιμο», «εξασφαλίστε», «απρόσκοπτο»,
  «σε έναν κόσμο που αλλάζει συνεχώς». Για «επιπλέον χρέωση» πες «έξτρα χρέωση»
  ή «πρόσθετη χρέωση». Για «επίσης» χρησιμοποίησε «και» ή «ακόμα».
- Μην εφεύρεις γεγονότα. Μην βάλεις ακριβείς τιμές ή ποσά αν δεν σου δίνονται.
  Πες κάτι όπως «δείτε την τρέχουσα τιμή στο Τμήμα Οδικών Μεταφορών».

ΛΙΣΤΕΣ
- Χρησιμοποίησε bullet lists ή αριθμημένες λίστες μόνο όπου πραγματικά βοηθούν:
  λίστες εγγράφων, βήματα διαδικασίας, σύντομα key facts. Όχι παντού.
- Η αφήγηση και η ανάλυση παραμένουν σε πρόζα.

ΑΚΡΙΒΕΙΑ
- Όλα τα γεγονότα πρέπει να ισχύουν για την Κυπριακή Δημοκρατία.
- Όχι Βόρεια Κύπρος. Όχι Γερμανία ή άλλες χώρες εκτός όταν συγκρίνεις.
- Χρησιμοποίησε μόνο τα γεγονότα που σου δίνονται. Αν δεν σου δόθηκε ένας
  αριθμός ή ένα κανονιστικό όριο, μην τον επινοήσεις.

ΔΟΜΗ
- Καθαρό Markdown. Όχι front-matter, όχι H1. Η σελίδα δίνει δικό της H1.
- Εισαγωγική παράγραφος χωρίς επικεφαλίδα. 3 με 5 προτάσεις, περίπου 90 λέξεις.
- Μετά, ΑΚΡΙΒΩΣ 8 ενότητες σε H2. ΚΑΘΕ ενότητα ΠΡΕΠΕΙ να έχει 200 με 300 λέξεις.
  Χρησιμοποίησε πρόζα ή λίστες ανάλογα με το τι εξυπηρετεί το περιεχόμενο.
- Τελική παράγραφος χωρίς επικεφαλίδα, περίπου 80 λέξεις. Συνοψίζει χωρίς
  να λέει «εν κατακλείδι» ή κάτι παρόμοιο.
- ΤΕΛΕΥΤΑΙΟ: ενότητα ## Συχνές Ερωτήσεις με ΑΚΡΙΒΩΣ 5 ερωτήσεις-απαντήσεις.
  Κάθε ερώτηση γράφεται έτσι (ΑΚΡΙΒΩΣ αυτή η μορφή, καμία παραλλαγή):
  **Ερώτηση σε μία πρόταση;**
  Απάντηση σε 2-4 προτάσεις πρόζας. Χωρίς bullet στις απαντήσεις.
- ΣΥΝΟΛΟ: 2000 ΛΕΞΕΙΣ ΕΛΑΧΙΣΤΟ χωρίς το FAQ. Με το FAQ τουλάχιστον 2200.

ΕΣΩΤΕΡΙΚΟΙ ΣΥΝΔΕΣΜΟΙ
- Ενσωμάτωσε ΟΛΟΥΣ τους εσωτερικούς συνδέσμους που σου δίνονται μέσα σε προτάσεις.
- Μορφή: [κείμενο αγκίστρωσης](διαδρομή). Όχι σε λίστα.
- Κάθε σύνδεσμος μπαίνει σε διαφορετική παράγραφο και ταιριάζει νοηματικά εκεί.

ΈΞΟΔΟΣ
Δώσε μόνο το κείμενο Markdown. Καμία εξήγηση πριν ή μετά.
"""


SYSTEM_PROMPT_EN = """\
You are a Cyprus-based journalist writing for a local English-language paper.
You did real research at the Department of Road Transport and you know how it
actually works in practice. Your readers are foreigners living in Cyprus.

VOICE
- Year 8 reading level. Short sentences. Common words.
- Where possible, words with three syllables or fewer.
- No sentence over 20 words. Count them.
- You do not sound like marketing. You sound like a person.

NEVER
- No em-dashes (—) anywhere. Use periods or commas instead.
- No H3. Only H2 (## ) for section headings and ## FAQ for the FAQ section.
- None of these phrases: "furthermore", "moreover", "it is worth noting",
  "in conclusion", "it goes without saying", "it is important to note",
  "navigating", "delve", "crucial", "ensure", "seamless",
  "in today's fast-paced world", "rest assured".
- Do not invent facts. Do not state exact prices or fees if you were not
  given them. Say "check current fees with the Department of Road Transport".

LISTS
- Use bullet lists or numbered lists only where they genuinely help:
  document checklists, step sequences, key facts. Not everywhere.
- Narrative and analysis stay in prose.

ACCURACY
- Every fact must apply to the Republic of Cyprus.
- Not Northern Cyprus. Not Germany or other countries except for honest
  comparison.
- Use only the facts you were given. If a number or a regulatory limit was
  not given to you, do not make one up.

STRUCTURE
- Plain Markdown. No front-matter. No H1. The page renders its own H1.
- An intro paragraph with no heading. 2 to 4 sentences. Hook the reader.
- Then 6 to 8 sections in H2. Each section 200 to 300 words. Use prose or
  lists depending on what the content calls for.
- A closing paragraph with no heading, about 80 words. Wraps up without
  saying "in conclusion".
- LAST: a ## FAQ section with EXACTLY 5 questions and answers specific to
  this article. Each Q/A must follow this exact format (no variations):
  **Question in one sentence?**
  Answer in 2-4 sentences of prose. No bullets inside answers.
- TOTAL: at least 2000 words excluding FAQ. At least 2200 with FAQ.

INTERNAL LINKS
- Weave ALL provided internal links naturally inside sentences.
- Format: [anchor text](path). Never inside a list.
- Each link goes in a different paragraph and fits the topic of that
  paragraph.

OUTPUT
Output only the Markdown body. No explanation before or after.
"""


def build_user_prompt(article: ArticleSpec, locale: Locale) -> str:
    if locale == "el":
        sections = article.sections_el
        links = article.internal_links_el
        title = article.title_el
        topic = article.topic_el
        audience = article.audience_el
        header_label = "ΕΝΟΤΗΤΕΣ (χρησιμοποίησε αυτές ως H2, με αυτή τη σειρά)"
        facts_label = "ΓΕΓΟΝΟΤΑ ΓΙΑ ΤΗΝ ΚΥΠΡΟ (χρησιμοποίησε αυτά, μην εφεύρεις άλλα)"
        links_label = (
            "ΕΣΩΤΕΡΙΚΟΙ ΣΥΝΔΕΣΜΟΙ (μπες ΟΛΟΥΣ. Μορφή [κείμενο](διαδρομή), σε προτάσεις)"
        )
        intro_label = (
            "Γράψε ένα μακρύ άρθρο για: " + topic + "\n"
            "Κοινό: " + audience
        )
    else:
        sections = article.sections_en
        links = article.internal_links_en
        title = article.title_en
        topic = article.topic_en
        audience = article.audience_en
        header_label = "SECTIONS (use as H2, in this order)"
        facts_label = "CYPRUS FACTS (use these, invent nothing else)"
        links_label = (
            "INTERNAL LINKS (use ALL. Format [text](path), inside sentences)"
        )
        intro_label = (
            "Write a long article about: " + topic + "\n"
            "Audience: " + audience
        )

    sections_block = "\n".join(f"- {s}" for s in sections)
    facts_block = "\n".join(f"- {f}" for f in article.facts)
    links_block = "\n".join(f"- {anchor} → {path}" for path, anchor in links)

    return f"""\
{intro_label}

Title (for reference, do not output an H1): {title}

{header_label}:
{sections_block}

{facts_label}:
{facts_block}

{links_label}:
{links_block}

Now write the article body. Markdown only. No H1.
"""


# ----------------------------------------------------------------------- runner


def main(argv: list[str] | None = None) -> int:
    if DOTENV_PATH.exists():
        load_dotenv(DOTENV_PATH, override=False)
    args = _parse_args(argv)

    articles = list(ARTICLES)
    if args.article_id:
        articles = [a for a in articles if a.id == args.article_id]
        if not articles:
            log.error("generate_blog.no_article", id=args.article_id)
            return 1

    locales: tuple[Locale, ...] = (args.locale,) if args.locale else LOCALES
    BLOG_DIR.mkdir(parents=True, exist_ok=True)

    client = _make_client()

    done = skipped = failed = 0
    for article in articles:
        for locale in locales:
            out_path = BLOG_DIR / f"{article.id}_{locale}.md"
            if out_path.exists() and not args.overwrite:
                skipped += 1
                log.info("generate_blog.skip", id=article.id, locale=locale)
                continue

            system_prompt = SYSTEM_PROMPT_EL if locale == "el" else SYSTEM_PROMPT_EN
            user_prompt = build_user_prompt(article, locale)

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
                    "generate_blog.failed",
                    id=article.id,
                    locale=locale,
                    error=str(exc),
                )
                continue

            md = _post_process(md, locale)
            out_path.write_text(md, encoding="utf-8")
            done += 1
            log.info(
                "generate_blog.ok",
                id=article.id,
                locale=locale,
                chars=len(md),
                path=str(out_path.relative_to(PROJECT_ROOT)),
            )

    log.info("generate_blog.summary", done=done, skipped=skipped, failed=failed)
    return 0 if failed == 0 else 1


def _make_client():  # noqa: ANN202
    try:
        import anthropic
    except ImportError as exc:
        raise SystemExit("anthropic SDK not installed.") from exc
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise SystemExit(
            "ANTHROPIC_API_KEY not set. Add it to .env or `export` it."
        )
    return anthropic.Anthropic(api_key=api_key)


def _call_anthropic(*, client, model: str, system_prompt: str, user_prompt: str) -> str:
    msg = client.messages.create(
        model=model,
        # Long-form: 2000+ words can easily exceed 4k tokens — give plenty of
        # headroom. Sonnet 4.6 handles this comfortably.
        max_tokens=8000,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )
    parts = [b.text for b in msg.content if getattr(b, "type", None) == "text"]
    return "\n".join(parts).strip() + "\n"


# Post-process: belt-and-braces enforcement of the strict editorial rules in
# case the model slips. Strip the em-dash and the banned Greek discourse
# connector that also happens to be the everyday word for "extra/additional".
_GREEK_REPLACEMENTS: tuple[tuple[str, str], ...] = (
    ("Επιπλέον,", "Ακόμα,"),
    ("επιπλέον χρέωση", "πρόσθετη χρέωση"),
    ("επιπλέον χρόνο", "παραπάνω χρόνο"),
    ("επιπλέον", "έξτρα"),
)


def _post_process(md: str, locale: Locale) -> str:
    md = md.replace("—", ",")
    if locale == "el":
        for src, dst in _GREEK_REPLACEMENTS:
            md = md.replace(src, dst)
    return md


def _parse_args(argv: list[str] | None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Generate long-form blog articles")
    p.add_argument("--article-id", default=None)
    p.add_argument("--locale", choices=["el", "en"], default=None)
    p.add_argument("--model", default=DEFAULT_MODEL)
    p.add_argument("--overwrite", action="store_true")
    return p.parse_args(argv)


if __name__ == "__main__":
    raise SystemExit(main())
