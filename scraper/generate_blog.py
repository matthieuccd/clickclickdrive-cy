"""Generate long-form blog articles for the Cyprus marketplace.

Pattern mirrors scraper/generate_content.py: one Anthropic API call per
(article, locale). Saves raw Markdown to scraper/data/blog/{article_id}_{locale}.md.

The article registry lives in this file (ARTICLES list). Add an entry per
article. The Next.js side mirrors the article metadata in
src/lib/blog.ts; keep the article IDs in sync.

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
import json as _json
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
    # Optional fixed answer-first summary (2-3 sentences). When supplied the
    # model outputs it verbatim as the very first paragraph. When omitted the
    # model writes its own per the ANSWER block in the system prompt.
    answer_el: str = ""
    answer_en: str = ""
    # Inline widget token to embed in the article body.
    # The model places {{widget:<widget_id>}} after the closing paragraph, before FAQ.
    #
    # Decide: would an interactive tool genuinely help this reader make a
    # decision, calculate something, or self-assess? If yes, set widget_id.
    # If no suitable widget exists yet, build the component in the same commit.
    #
    # Bias toward building. If there is any reasonable case for interactivity,
    # build the widget. Only leave widget_id empty when the article is purely
    # informational with no user variables (e.g. a law explainer with no
    # decisions or calculations the reader needs to make).
    #
    # Currently built:
    #   "price-calculator"  → cost/fees articles (lesson prices, total cost)
    widget_id: str = ""
    # Infographic type for the inline SVG. Empty = no infographic.
    # Placed after closing paragraph, before widget, before FAQ.
    infographic_type: str = ""
    # YouTube video ID to embed after the widget and before the FAQ.
    # If set, emits {{video:<youtube_id>}}. If empty, nothing is emitted.
    youtube_id: str = ""
    # Pexels queries for inline body images (saved as inline-1.jpg, inline-2.jpg, …).
    # publish_next.py fetches these after the hero.
    inline_image_queries: tuple[str, ...] = ()


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
            "Τι πρέπει να ξέρετε πρώτα για την Κύπρο;",
            "Τι ισχύει αν έχετε άδεια ΕΕ;",
            "Τι ισχύει για άδειες εκτός ΕΕ και Βρετανίας;",
            "Ποια έγγραφα θα χρειαστείτε;",
            "Πώς λειτουργεί η εκπαιδευτική άδεια και τα μαθήματα;",
            "Μπορείτε να δώσετε γραπτή εξέταση στα αγγλικά;",
            "Τι γίνεται την ημέρα της πρακτικής εξέτασης;",
            "Πόσο κοστίζει και πόσο καιρό παίρνει;",
        ),
        sections_en=(
            "What are the Cyprus basics you need to know?",
            "What happens if you hold an EU licence?",
            "What rules apply to UK and non-EU licence holders?",
            "What papers do you need to bring?",
            "How do the learner's licence and lessons work?",
            "Can you take the theory test in English or Greek?",
            "What happens on practical test day?",
            "What does it cost and how long does it take?",
        ),
        widget_id="foreigner-path-checker",
        infographic_type="foreigner-documents",
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
    ArticleSpec(
        id="pws-na-vgaleis-diploma-odigisis-stin-kypro",
        topic_el="Πώς να βγάλεις δίπλωμα οδήγησης στην Κύπρο βήμα προς βήμα",
        topic_en="How to get a driving licence in Cyprus step by step",
        title_el="Πώς να βγάλεις δίπλωμα οδήγησης στην Κύπρο",
        title_en="How to Get a Driving Licence in Cyprus - Step by Step",
        audience_el=(
            "Άτομα που ζουν στην Κύπρο και θέλουν να βγάλουν δίπλωμα για πρώτη φορά "
            "ή να κατανοήσουν τη διαδικασία από την αρχή."
        ),
        audience_en=(
            "People living in Cyprus who want to get their first driving licence or "
            "understand the full process from scratch."
        ),
        facts=(
            "The authority that issues driving licences in Cyprus is the Department of "
            "Road Transport (Τμήμα Οδικών Μεταφορών), under the Ministry of Transport.",
            "Minimum age for a Category B (car) licence: 18.",
            "Cyprus drives on the LEFT. Speed limits and distances are in km and km/h.",
            "The first step is to apply for a Learner's Licence (εκπαιδευτική άδεια) "
            "from the Department of Road Transport.",
            "While training, the car must display red L plates front and rear.",
            "Lessons must be with a licensed instructor in a dual-control car.",
            "Lessons typically last 45 minutes. Prices vary by school and city.",
            "The theory test (γραπτή εξέταση) can be taken in Greek or English. It is "
            "computer-based and covers road signs, rules, and safe driving.",
            "The practical test is conducted by a Department of Road Transport examiner "
            "on real public roads.",
            "Required documents include: valid passport or ID, proof of Cyprus residence "
            "(rental contract, utility bill, or yellow slip / ARC), recent photo, "
            "medical certificate from a registered doctor.",
            "The five main cities for Department of Road Transport services: Nicosia, "
            "Limassol, Larnaca, Paphos, Paralimni.",
            "The Republic of Cyprus only covers the south. Northern Cyprus uses a "
            "separate system.",
        ),
        sections_el=(
            "Τι χρειάζεστε για να ξεκινήσετε;",
            "Πώς βγάζετε εκπαιδευτική άδεια;",
            "Πόσα μαθήματα οδήγησης χρειάζεστε;",
            "Πώς είναι η θεωρητική εξέταση;",
            "Τι γίνεται στην πρακτική εξέταση;",
            "Τι γίνεται μετά το δίπλωμα;",
        ),
        sections_en=(
            "What do you need before you start?",
            "How do you get a learner's licence?",
            "How many driving lessons do you need?",
            "What is the theory test like?",
            "What happens at the practical test?",
            "What happens after you pass?",
        ),
        widget_id="price-calculator",
        infographic_type="licence-timeline",
        internal_links_el=(
            ("/arthra/diploma-odigisis-gia-ksenous-stin-kypro", "δίπλωμα για ξένους στην Κύπρο"),
            ("/arthra/anallagi-adeias-ee-kypros", "ανταλλαγή ευρωπαϊκής άδειας"),
            ("/arthra/vretaniko-diploma-kypros", "βρετανική άδεια μετά το Brexit"),
            ("/scholes-odigon/lefkosia", "σχολές οδηγών στη Λευκωσία"),
            ("/", "ClickClickDrive Κύπρος"),
        ),
        internal_links_en=(
            ("/en/blog/how-to-get-driving-licence-cyprus-foreigner", "licence guide for foreigners"),
            ("/en/blog/exchange-eu-licence-cyprus", "exchanging an EU licence"),
            ("/en/blog/uk-licence-cyprus-after-brexit", "UK licence after Brexit"),
            ("/en/driving-schools/nicosia", "driving schools in Nicosia"),
            ("/en", "ClickClickDrive Cyprus"),
        ),
    ),
    ArticleSpec(
        id="poso-kostizei-ekpaideysi-odigisis-kypros",
        topic_el="Πόσο κοστίζει η εκπαίδευση οδήγησης στην Κύπρο",
        topic_en="How much does driving education cost in Cyprus",
        title_el="Πόσο κοστίζει η εκπαίδευση οδήγησης στην Κύπρο",
        title_en="How Much Does Driving Education Cost in Cyprus",
        audience_el=(
            "Άτομα που σχεδιάζουν να βγάλουν δίπλωμα στην Κύπρο και θέλουν να "
            "καταλάβουν τι κοστίζει η όλη διαδικασία."
        ),
        audience_en=(
            "People planning to get a driving licence in Cyprus who want to understand "
            "the full cost of the process before they commit."
        ),
        facts=(
            "The Department of Road Transport charges official fees for applications, "
            "tests, and licences. Candidates should check current amounts directly with "
            "the Department, as fees can change.",
            "Driving lesson prices are not fixed nationally. They vary by school and "
            "by city. Shopping around is normal and sensible.",
            "Lessons typically last 45 minutes each.",
            "Failing a test means paying to rebook. The test booking fee applies again "
            "for each attempt.",
            "A medical certificate from a registered doctor is required to apply. "
            "The doctor charges their own fee for this.",
            "If a foreign licence needs certified translation, the translator charges "
            "a fee. Translation must be by an approved certified translator.",
            "EU citizens exchanging their licence for a Cypriot one pay mainly "
            "administrative fees - no lesson or test costs if the exchange is done "
            "within the window period.",
            "Non-EU nationals going through the full process (learner's licence, "
            "lessons, theory test, practical test) spend significantly more in total.",
            "Many first-time candidates fail the practical test on the first attempt. "
            "Budget for at least one rebook.",
            "Prices in Nicosia, Limassol, Larnaca, Paphos, and Paralimni may differ "
            "from each other. Local schools in each city have their own rates.",
        ),
        sections_el=(
            "Ποια είναι τα επίσημα τέλη του Τμήματος Οδικών Μεταφορών;",
            "Πόσο κοστίζουν τα μαθήματα οδήγησης;",
            "Χρειάζεστε ιατρικό πιστοποιητικό ή μετάφραση;",
            "Πόσο πληρώνετε αν αποτύχετε στη δοκιμασία;",
            "Ποιο είναι το κόστος για πολίτες ΕΕ;",
            "Ποιο είναι το κόστος για πολίτες εκτός ΕΕ;",
            "Πώς μπορείτε να μειώσετε το συνολικό κόστος;",
        ),
        sections_en=(
            "What are the official Department of Road Transport fees?",
            "How much do driving lessons cost?",
            "Do you need a medical certificate or translation?",
            "What does it cost if you fail a test?",
            "What does it cost EU citizens?",
            "What does it cost non-EU nationals?",
            "How can you keep your total costs down?",
        ),
        widget_id="price-calculator",
        infographic_type="cost-breakdown",
        internal_links_el=(
            ("/arthra/pws-na-vgaleis-diploma-odigisis-stin-kypro", "πλήρης οδηγός για δίπλωμα"),
            ("/arthra/anallagi-adeias-ee-kypros", "ανταλλαγή ευρωπαϊκής άδειας"),
            ("/scholes-odigon/lefkosia", "σχολές οδηγών στη Λευκωσία"),
            ("/scholes-odigon/lemesos", "σχολές οδηγών στη Λεμεσό"),
            ("/", "ClickClickDrive Κύπρος"),
        ),
        internal_links_en=(
            ("/en/blog/how-to-get-driving-licence-cyprus-step-by-step", "step-by-step driving licence guide"),
            ("/en/blog/exchange-eu-licence-cyprus", "EU licence exchange"),
            ("/en/driving-schools/nicosia", "driving schools in Nicosia"),
            ("/en/driving-schools/limassol", "driving schools in Limassol"),
            ("/en", "ClickClickDrive Cyprus"),
        ),
    ),
    ArticleSpec(
        id="diploma-odigisis-kypros-uk-citizens-meta-brexit",
        topic_el="Βρετανική άδεια οδήγησης στην Κύπρο μετά το Brexit",
        topic_en="Driving licence in Cyprus for UK citizens after Brexit",
        title_el="Βρετανική άδεια οδήγησης στην Κύπρο μετά το Brexit",
        title_en="Driving Licence in Cyprus for UK Citizens After Brexit",
        audience_el=(
            "Βρετανοί πολίτες που ζουν ή σκοπεύουν να ζήσουν στην Κύπρο και θέλουν "
            "να μάθουν τι ισχύει για την άδεια οδήγησής τους μετά το Brexit."
        ),
        audience_en=(
            "UK citizens living in or moving to Cyprus who want to know what their "
            "driving licence situation is after Brexit."
        ),
        facts=(
            "The UK left the EU on 31 January 2020. From that date, UK licences lost "
            "their automatic EU-equivalent treatment in Cyprus.",
            "Cyprus and the UK may have a bilateral agreement affecting licence "
            "exchange. The status of such agreements can change. Check current rules "
            "directly with the Department of Road Transport before applying.",
            "UK licence holders may need: a certified translation of their UK licence, "
            "and in some cases a Cypriot theory test, practical test, or both, "
            "depending on current bilateral agreement status.",
            "One practical advantage for UK drivers: Cyprus also drives on the LEFT. "
            "UK drivers do not need to retrain for left-hand traffic.",
            "Minimum age for a Category B licence in Cyprus: 18.",
            "The Department of Road Transport (Τμήμα Οδικών Μεταφορών) is the only "
            "authority that can confirm current rules for UK licence holders.",
            "Post-Brexit, a UK licence should be treated as a third-country licence "
            "for exchange purposes in Cyprus.",
            "UK licences use Latin characters, which simplifies translation requirements.",
            "Required documents typically include: valid passport, proof of Cyprus "
            "residence, recent photo, medical certificate, original UK licence, and "
            "a certified translation if required.",
            "A Cypriot licence obtained after exchange is valid across the EU.",
        ),
        sections_el=(
            "Τι άλλαξε μετά το Brexit;",
            "Ισχύει η βρετανική άδεια στην Κύπρο σήμερα;",
            "Τι λέει η διμερής συμφωνία Κύπρου-Ηνωμένου Βασιλείου;",
            "Ποια έγγραφα χρειάζεστε;",
            "Πρέπει να κάνετε εξετάσεις;",
            "Σας βοηθάει η αριστερή οδήγηση;",
            "Ποια είναι η διαδικασία βήμα προς βήμα για Βρετανούς;",
        ),
        sections_en=(
            "What did Brexit change for UK licence holders in Cyprus?",
            "Is your UK licence currently valid in Cyprus?",
            "What does the bilateral agreement between Cyprus and the UK say?",
            "What documents do UK drivers need?",
            "Do you need to sit a test?",
            "Does driving on the left give UK drivers an advantage?",
            "What is the step-by-step process for UK citizens in Cyprus?",
        ),
        widget_id="uk-licence-checker",
        infographic_type="uk-exchange",
        internal_links_el=(
            ("/arthra/diploma-odigisis-gia-ksenous-stin-kypro", "δίπλωμα ξένων στην Κύπρο"),
            ("/arthra/anallagi-adeias-ee-kypros", "ανταλλαγή ευρωπαϊκής άδειας"),
            ("/arthra/pws-na-vgaleis-diploma-odigisis-stin-kypro", "οδηγός για δίπλωμα βήμα προς βήμα"),
            ("/scholes-odigon/lefkosia", "σχολές οδηγών στη Λευκωσία"),
            ("/", "ClickClickDrive Κύπρος"),
        ),
        internal_links_en=(
            ("/en/blog/how-to-get-driving-licence-cyprus-foreigner", "foreigner licence guide for Cyprus"),
            ("/en/blog/exchange-eu-licence-cyprus", "EU licence exchange process"),
            ("/en/blog/how-to-get-driving-licence-cyprus-step-by-step", "step-by-step driving licence guide"),
            ("/en/driving-schools/nicosia", "driving schools in Nicosia"),
            ("/en", "ClickClickDrive Cyprus"),
        ),
    ),
    ArticleSpec(
        id="anallagi-adeias-ee-kypros",
        topic_el="Ανταλλαγή ευρωπαϊκής άδειας οδήγησης στην Κύπρο",
        topic_en="EU driving licence in Cyprus - do you need to exchange it",
        title_el="Ανταλλαγή άδειας ΕΕ στην Κύπρο",
        title_en="EU Driving Licence in Cyprus - Do You Need to Exchange It",
        audience_el=(
            "Πολίτες ΕΕ που έχουν εγκατασταθεί στην Κύπρο και αναρωτιούνται αν "
            "πρέπει να ανταλλάξουν την ευρωπαϊκή τους άδεια με κυπριακή."
        ),
        audience_en=(
            "EU citizens who have moved to Cyprus and are wondering whether they need "
            "to exchange their European driving licence for a Cypriot one."
        ),
        facts=(
            "EU and EEA licence holders living in Cyprus can continue driving legally "
            "on their home-country licence.",
            "No new tests are required to exchange an EU licence for a Cypriot one.",
            "There is a window period after taking up residence in Cyprus during which "
            "the exchange can be made without tests. This period can change - confirm "
            "current deadlines with the Department of Road Transport.",
            "When you exchange, your original EU licence is returned to the issuing "
            "country. You cannot hold both a Cypriot and your original EU licence.",
            "A Cypriot licence is valid across all EU member states.",
            "Practical reasons to exchange: easier for car rental in Cyprus, "
            "simpler for local administrative purposes, quicker replacement if lost.",
            "EU licences issued without expiry dates (lifetime licences) are treated "
            "under special rules - check with the Department.",
            "The exchange is processed at Department of Road Transport offices in "
            "Nicosia, Limassol, Larnaca, Paphos, or Paralimni.",
            "If your EU licence has expired before you apply, the process may be more "
            "complicated and could require tests.",
            "Required documents: valid EU licence (original), proof of Cyprus "
            "residence (yellow slip or equivalent), recent passport photo, "
            "completed application form from the Department.",
        ),
        sections_el=(
            "Μπορείτε να οδηγείτε με ευρωπαϊκή άδεια στην Κύπρο;",
            "Γιατί οι περισσότεροι κάτοικοι ΕΕ επιλέγουν ανταλλαγή;",
            "Ποια είναι η διαδικασία ανταλλαγής βήμα προς βήμα;",
            "Ποια έγγραφα χρειάζεστε για την ανταλλαγή;",
            "Τι γίνεται με την παλιά σας άδεια;",
            "Η προθεσμία και τι συμβαίνει αν τη χάσετε;",
            "Τι γίνεται αν η άδεια ΕΕ σας έχει λήξει;",
        ),
        sections_en=(
            "Can you drive in Cyprus on an EU licence?",
            "Why do most EU residents choose to exchange their licence?",
            "What is the exchange process step by step?",
            "What documents do you need to bring?",
            "What happens to your original EU licence?",
            "What is the deadline and what happens if you miss it?",
            "What if your EU licence has already expired?",
        ),
        widget_id="eu-exchange-checker",
        infographic_type="eu-exchange",
        internal_links_el=(
            ("/arthra/diploma-odigisis-gia-ksenous-stin-kypro", "δίπλωμα για ξένους"),
            ("/arthra/pws-na-vgaleis-diploma-odigisis-stin-kypro", "πλήρης οδηγός για δίπλωμα"),
            ("/arthra/vretaniko-diploma-kypros", "βρετανική άδεια μετά το Brexit"),
            ("/scholes-odigon/lefkosia", "σχολές οδηγών στη Λευκωσία"),
            ("/", "ClickClickDrive Κύπρος"),
        ),
        internal_links_en=(
            ("/en/blog/how-to-get-driving-licence-cyprus-foreigner", "licence guide for foreigners"),
            ("/en/blog/how-to-get-driving-licence-cyprus-step-by-step", "step-by-step licence guide"),
            ("/en/blog/uk-licence-cyprus-after-brexit", "UK licence after Brexit"),
            ("/en/driving-schools/nicosia", "driving schools in Nicosia"),
            ("/en", "ClickClickDrive Cyprus"),
        ),
    ),
    ArticleSpec(
        id="katigoria-b-adeia-odigisis-kypros",
        topic_el="Κατηγορία Β άδεια οδήγησης στην Κύπρο",
        topic_en="Category B driving licence in Cyprus - everything you need to know",
        title_el="Κατηγορία Β άδεια οδήγησης στην Κύπρο",
        title_en="Category B Driving Licence Cyprus - Everything You Need to Know",
        audience_el=(
            "Άτομα στην Κύπρο που θέλουν να καταλάβουν τι σημαίνει κατηγορία Β, "
            "τι καλύπτει και πώς αποκτάται."
        ),
        audience_en=(
            "People in Cyprus who want to understand what Category B means, what it "
            "covers, and how to obtain it."
        ),
        facts=(
            "Category B is the standard passenger car licence. It covers vehicles up "
            "to 3,500 kg and up to 8 passengers (not counting the driver).",
            "Minimum age to apply for Category B in Cyprus: 18.",
            "The first step is a Learner's Licence (εκπαιδευτική άδεια) from the "
            "Department of Road Transport.",
            "Lessons must be with a licensed instructor in a dual-control car. The "
            "car must display red L plates front and rear.",
            "The theory test (γραπτή εξέταση) covers road signs, traffic rules, and "
            "safe driving. It can be taken in Greek or English.",
            "The practical test is conducted by a Department of Road Transport examiner "
            "on real public roads in the candidate's city.",
            "A Cyprus Category B licence is valid across all EU member states.",
            "Towing with Category B: a trailer is allowed up to a combined weight limit. "
            "For heavier trailer combinations, an additional category (BE) may be needed.",
            "Required documents for the application: valid passport or ID, proof of "
            "Cyprus residence, recent photo, medical certificate from a registered doctor.",
            "The five Department of Road Transport offices are in Nicosia (headquarters), "
            "Limassol, Larnaca, Paphos, and Paralimni.",
        ),
        sections_el=(
            "Τι είναι η κατηγορία Β;",
            "Ποια είναι η ελάχιστη ηλικία και οι προϋποθέσεις;",
            "Πώς βγάζετε εκπαιδευτική άδεια κατηγορίας Β;",
            "Τι καλύπτουν τα μαθήματα οδήγησης;",
            "Πώς είναι η θεωρητική εξέταση κατηγορίας Β;",
            "Τι γίνεται στην πρακτική εξέταση κατηγορίας Β;",
            "Μπορείτε να ρυμουλκείτε με κατηγορία Β στην Κύπρο;",
            "Πότε λήγει η άδεια και πότε την ανανεώνετε;",
        ),
        sections_en=(
            "What does Category B cover?",
            "What is the minimum age and what are the requirements?",
            "How do you get a Category B learner's licence?",
            "What do your driving lessons cover?",
            "What is the Category B theory test like?",
            "What happens at the Category B practical test?",
            "Can you tow with a Category B licence in Cyprus?",
            "How long is your Cyprus Category B licence valid and when must you renew?",
        ),
        widget_id="test-readiness-checker",
        infographic_type="category-b-vehicles",
        internal_links_el=(
            ("/arthra/pws-na-vgaleis-diploma-odigisis-stin-kypro", "βήμα προς βήμα οδηγός για δίπλωμα"),
            ("/arthra/diploma-odigisis-gia-ksenous-stin-kypro", "δίπλωμα για ξένους"),
            ("/arthra/anallagi-adeias-ee-kypros", "ανταλλαγή ευρωπαϊκής άδειας"),
            ("/scholes-odigon/lefkosia", "σχολές οδηγών στη Λευκωσία"),
            ("/", "ClickClickDrive Κύπρος"),
        ),
        internal_links_en=(
            ("/en/blog/how-to-get-driving-licence-cyprus-step-by-step", "step-by-step driving licence guide"),
            ("/en/blog/how-to-get-driving-licence-cyprus-foreigner", "licence guide for foreigners"),
            ("/en/blog/exchange-eu-licence-cyprus", "exchanging an EU licence"),
            ("/en/driving-schools/nicosia", "driving schools in Nicosia"),
            ("/en", "ClickClickDrive Cyprus"),
        ),
    ),
    ArticleSpec(
        id="cyprus-driving-licence-complete-guide",
        topic_el="Πώς να βγάλετε δίπλωμα οδήγησης στην Κύπρο: πλήρης οδηγός 2026",
        topic_en="How to get a driving licence in Cyprus: the complete 2026 guide",
        title_el="Πώς να βγάλετε δίπλωμα οδήγησης στην Κύπρο: Πλήρης Οδηγός 2026",
        title_en="How to Get a Driving Licence in Cyprus: Complete 2026 Guide",
        audience_el=(
            "Κάτοικοι Κύπρου - ντόπιοι, μετανάστες και νεοφερμένοι - που θέλουν "
            "ολοκληρωμένο οδηγό για το κυπριακό δίπλωμα από την αρχή. "
            "Στόχος: 2300+ λέξεις εκτός FAQ."
        ),
        audience_en=(
            "Anyone in Cyprus - resident, expat, or newcomer - who wants a definitive "
            "overview of how the Cypriot driving licence system works."
        ),
        facts=(
            "The Department of Road Transport (Τμήμα Οδικών Μεταφορών), under the "
            "Ministry of Transport, Communications and Works, is the only authority "
            "that issues driving licences in the Republic of Cyprus. "
            "Headquarters in Nicosia; offices also in Limassol, Larnaca, Paphos, "
            "and Paralimni.",
            "Cyprus drives on the LEFT. Speed limits and road distances are in "
            "kilometres and km/h.",
            "Minimum age to apply for a Category B (standard passenger car) licence "
            "in Cyprus: 18.",
            "The full process for a new driver: (1) apply for a Learner's Licence "
            "(εκπαιδευτική άδεια) at the Department of Road Transport; (2) complete "
            "driving lessons with a licensed instructor in a dual-control car; "
            "(3) pass the theory test (γραπτή εξέταση); (4) pass the practical test.",
            "While a learner is at the wheel, the car must display red L plates "
            "front and rear at all times.",
            "Lessons typically last 45 minutes each. Prices vary by school and city; "
            "shopping around is normal and advisable.",
            "The theory test is computer-based and can be taken in Greek or English. "
            "It covers road signs, traffic rules, and safe driving behaviour.",
            "The practical test is conducted on real public roads by an examiner "
            "from the Department of Road Transport.",
            "Documents required for a new applicant: valid passport or national ID, "
            "proof of residence in Cyprus (rental contract, utility bill, or yellow "
            "slip / ARC), a recent passport-style photograph, and a medical "
            "certificate from a registered doctor confirming fitness to drive.",
            "EU and EEA citizens living in Cyprus may keep driving on their home "
            "licence indefinitely but have a window after taking up residence to "
            "exchange it for a Cypriot licence without sitting any new tests. "
            "Check the current window period with the Department of Road Transport.",
            "UK licence holders after Brexit are treated as third-country nationals "
            "for exchange purposes. A certified translation and possibly one or both "
            "tests may be required - check current bilateral agreement status with "
            "the Department before applying.",
            "Third-country nationals with licences from countries not on the "
            "recognised list typically go through the full new-driver process: "
            "learner's licence, lessons, theory test, practical test.",
            "Driving licence categories in Cyprus follow EU standards: AM (mopeds), "
            "A1/A2/A (motorcycles by power output), B (passenger cars up to 3,500 kg "
            "and 8 passengers), C (trucks), D (buses), and trailer combinations "
            "BE/CE/DE. Category B is the most common.",
            "A Cyprus Category B licence is valid across all EU member states.",
            "Category B validity: typically until age 70, after which renewal with "
            "medical checks is required. Check current validity rules with the "
            "Department of Road Transport.",
            "The Republic of Cyprus only covers the south of the island. Northern "
            "Cyprus (TRNC) operates a separate licensing system and a Cypriot "
            "licence does not automatically apply there.",
            "Official fees are set by the Department of Road Transport and can "
            "change. Always check current amounts directly with the Department.",
        ),
        sections_el=(
            "Πώς λειτουργεί το σύστημα διπλωμάτων στην Κύπρο;",
            "Ποιος δικαιούται και ποια είναι η ελάχιστη ηλικία;",
            "Πώς βγάζετε εκπαιδευτική άδεια;",
            "Τι να περιμένετε από τα μαθήματα οδήγησης;",
            "Τι καλύπτει η θεωρητική εξέταση και πώς να περάσετε;",
            "Τι γίνεται την ημέρα της πρακτικής εξέτασης;",
            "Ποιες κατηγορίες αδειών υπάρχουν και πότε ανανεώνονται;",
            "Τι γίνεται αν έχετε ήδη ξένη άδεια οδήγησης;",
        ),
        sections_en=(
            "How does the Cyprus driving licence system work?",
            "Who can apply and what is the minimum age?",
            "How do you get a learner's licence?",
            "What should you expect from driving lessons?",
            "What does the theory test cover and how do you pass?",
            "What happens on the day of your practical test?",
            "What are the licence categories, validity, and renewal rules?",
            "What if you already hold a foreign driving licence?",
        ),
        internal_links_el=(
            ("/arthra/pws-na-vgaleis-diploma-odigisis-stin-kypro", "βήμα προς βήμα οδηγός για δίπλωμα"),
            ("/arthra/diploma-odigisis-gia-ksenous-stin-kypro", "δίπλωμα για ξένους στην Κύπρο"),
            ("/arthra/anallagi-adeias-ee-kypros", "ανταλλαγή ευρωπαϊκής άδειας"),
            ("/arthra/vretaniko-diploma-kypros", "βρετανική άδεια μετά το Brexit"),
            ("/arthra/poso-kostizei-ekpaideysi-odigisis-kypros", "κόστος εκπαίδευσης οδήγησης"),
            ("/scholes-odigon/lefkosia", "σχολές οδηγών στη Λευκωσία"),
            ("/", "ClickClickDrive Κύπρος"),
        ),
        internal_links_en=(
            ("/en/blog/how-to-get-driving-licence-cyprus-step-by-step", "step-by-step driving licence guide"),
            ("/en/blog/how-to-get-driving-licence-cyprus-foreigner", "guide for foreigners in Cyprus"),
            ("/en/blog/exchange-eu-licence-cyprus", "exchanging an EU licence"),
            ("/en/blog/uk-licence-cyprus-after-brexit", "UK licence after Brexit"),
            ("/en/blog/driving-lesson-cost-cyprus", "driving lesson costs in Cyprus"),
            ("/en/driving-schools/nicosia", "driving schools in Nicosia"),
            ("/en", "ClickClickDrive Cyprus"),
        ),
        answer_el=(
            "Για να βγάλετε κυπριακό δίπλωμα οδήγησης κατηγορίας Β, πρέπει να ολοκληρώσετε "
            "τέσσερα βήματα: εκπαιδευτική άδεια, μαθήματα με αδειούχο εκπαιδευτή, θεωρητική "
            "εξέταση και πρακτική εξέταση. Η διαδικασία διαρκεί συνήθως τρεις έως έξι μήνες. "
            "Πολίτες ΕΕ μπορούν να ανταλλάξουν την άδειά τους χωρίς εξετάσεις, ενώ υπήκοοι "
            "τρίτων χωρών ακολουθούν συνήθως ολόκληρη τη διαδικασία."
        ),
        answer_en=(
            "To get a Cyprus driving licence, you need to complete four steps: apply for a "
            "learner's licence at the Department of Road Transport, complete lessons with a "
            "licensed instructor, pass the theory test, and pass the practical test. The process "
            "typically takes three to six months for a new driver. EU citizens can exchange their "
            "existing licence without sitting tests; other nationalities should check their status "
            "with the Department."
        ),
        widget_id="price-calculator",
        infographic_type="licence-paths",
        inline_image_queries=(
            "driving instructor lesson student car cyprus",
            "computer theory test driving exam screen",
        ),
    ),
    ArticleSpec(
        id="cyprus-driving-test-2026",
        topic_el="Εξέταση οδήγησης Κύπρος 2026: τι να περιμένεις",
        topic_en="The Cyprus driving test 2026: what to expect",
        title_el="Εξέταση Οδήγησης στην Κύπρο 2026: Τι να Περιμένετε",
        title_en="The Cyprus Driving Test 2026: What to Expect",
        audience_el=(
            "Νέοι οδηγοί στην Κύπρο που ετοιμάζονται για τη θεωρητική ή πρακτική εξέταση "
            "και θέλουν να ξέρουν ακριβώς τι τους περιμένει. "
            "Στόχος: 2000+ λέξεις εκτός FAQ."
        ),
        audience_en=(
            "New drivers in Cyprus preparing for the theory or practical test who want to know "
            "exactly what to expect on the day."
        ),
        facts=(
            "The Department of Road Transport (Τμήμα Οδικών Μεταφορών, ΤΟΜ), under the "
            "Ministry of Transport, Communications and Works, administers both the theory "
            "and practical driving tests in Cyprus.",
            "Before sitting either test, the candidate must hold a valid Learner's Licence "
            "(εκπαιδευτική άδεια) issued by the Department of Road Transport.",
            "The theory test (γραπτή εξέταση) is computer-based. Candidates choose to sit "
            "it in Greek or English.",
            "Theory test content: road signs (πινακίδες), traffic rules and priority, and "
            "safe driving behaviour. No set list of exact questions is published officially.",
            "There is no officially mandated minimum number of lessons before booking the "
            "theory test; the instructor advises when the student is ready.",
            "After passing the theory test, the candidate books the practical test (πρακτική "
            "εξέταση) through their driving school.",
            "The practical test is conducted on real public roads by an official examiner "
            "from the Department of Road Transport. The examiner sits in the car and "
            "observes without intervening unless safety requires it.",
            "During the practical test the candidate must drive in the instructor's "
            "dual-control school car. L plates must be displayed front and rear.",
            "Cyprus drives on the LEFT. The examiner checks steering, signalling, "
            "positioning, speed control, observations at junctions, and compliance with "
            "traffic signals and road signs.",
            "If the candidate fails the practical test, they must wait before rebooking. "
            "Check the current waiting period with the Department of Road Transport.",
            "Test fees are set by the Department of Road Transport and can change. "
            "Always confirm current amounts directly with the Department.",
            "Both tests must be passed to obtain the full Category B driving licence.",
        ),
        sections_el=(
            "Τι περιλαμβάνει η εξέταση οδήγησης στην Κύπρο;",
            "Πότε μπορείτε να δώσετε εξέταση;",
            "Τι ελέγχει η θεωρητική εξέταση και πώς να την περάσετε;",
            "Τι γίνεται στην πρακτική εξέταση;",
            "Τι έγγραφα χρειάζεστε την ημέρα της εξέτασης;",
            "Τι γίνεται αν αποτύχετε;",
            "Πώς να ετοιμαστείτε για επιτυχία;",
        ),
        sections_en=(
            "What does the Cyprus driving test involve?",
            "When can you sit the test?",
            "What does the theory test cover and how do you pass?",
            "What happens during the practical test?",
            "What documents do you need on test day?",
            "What happens if you fail?",
            "How do you prepare to pass first time?",
        ),
        internal_links_el=(
            ("/arthra/pws-na-vgaleis-diploma-odigisis-stin-kypro", "πώς βγάζετε εκπαιδευτική άδεια"),
            ("/arthra/plires-odigos-diploma-odigisis-kypros", "πλήρης οδηγός διπλώματος 2026"),
            ("/arthra/poso-kostizei-ekpaideysi-odigisis-kypros", "κόστος μαθημάτων οδήγησης"),
            ("/scholes-odigon/lefkosia", "σχολές οδηγών στη Λευκωσία"),
            ("/scholes-odigon/lemesos", "σχολές οδηγών στη Λεμεσό"),
            ("/", "ClickClickDrive Κύπρος"),
        ),
        internal_links_en=(
            ("/en/blog/how-to-get-driving-licence-cyprus-step-by-step", "step-by-step driving licence guide"),
            ("/en/blog/cyprus-driving-licence-complete-guide", "complete Cyprus driving licence guide"),
            ("/en/blog/driving-lesson-cost-cyprus", "driving lesson costs in Cyprus"),
            ("/en/driving-schools/nicosia", "driving schools in Nicosia"),
            ("/en/driving-schools/limassol", "driving schools in Limassol"),
            ("/en", "ClickClickDrive Cyprus"),
        ),
        answer_el=(
            "Η εξέταση οδήγησης στην Κύπρο έχει δύο μέρη: θεωρητική και πρακτική. "
            "Η θεωρητική είναι ηλεκτρονική και γίνεται στα ελληνικά ή αγγλικά, "
            "ενώ η πρακτική γίνεται σε δημόσιους δρόμους με εξεταστή του Τμήματος Οδικών Μεταφορών. "
            "Και τις δύο πρέπει να τις περάσετε για να πάρετε δίπλωμα κατηγορίας Β."
        ),
        answer_en=(
            "The Cyprus driving test has two parts: a computer-based theory test and an on-road "
            "practical test. The theory test can be taken in Greek or English and covers road signs, "
            "traffic rules, and safe driving. The practical test takes place on public roads with a "
            "Department of Road Transport examiner, and you must pass both to get your Category B licence."
        ),
        widget_id="test-readiness-checker",
        infographic_type="test-format",
        inline_image_queries=(
            "driving test examiner student car road",
            "computer based theory test driving exam screen",
        ),
    ),
    ArticleSpec(
        id="cyprus-driving-licence-renewal",
        topic_el="Πώς να ανανεώσετε την άδεια οδήγησής σας στην Κύπρο, πότε λήγει και "
        "τι έγγραφα χρειάζεστε",
        topic_en="How to renew a Cyprus driving licence, including when it expires and "
        "what documents you need",
        title_el="Ανανέωση Άδειας Οδήγησης στην Κύπρο: Βήμα Προς Βήμα",
        title_en="Cyprus Driving Licence Renewal: Step-by-Step",
        audience_el=(
            "Κάτοικοι Κύπρου που πλησιάζουν τη λήξη της άδειας οδήγησής τους και "
            "θέλουν να μάθουν πότε λήγει, ποια έγγραφα χρειάζονται και πού να "
            "απευθυνθούν."
        ),
        audience_en=(
            "Cyprus residents approaching their driving licence expiry date who want "
            "to know when it expires, what documents they need, and where to go to "
            "renew it."
        ),
        facts=(
            "Cyprus issues driving licences under EU Directive 2006/126/EC, the same "
            "framework used across all EU member states.",
            "A Category B licence issued to a driver aged 18 and over is generally "
            "valid for 15 years before it needs renewal.",
            "Professional categories like C and D follow separate validity rules; "
            "check the specific period for your category with the Department of "
            "Road Transport (ΤΟΜ).",
            "The expiry date is printed on the front of the licence card, in field 4b.",
            "Renewal is done in person at a Department of Road Transport district "
            "office. There is no fully online renewal process at the time of writing.",
            "Department of Road Transport district offices are located in Nicosia, "
            "Limassol, Larnaca, Paphos, and the government-controlled area of "
            "Famagusta.",
            "Standard renewal documents include the current or expired licence, a "
            "valid passport or ID, a recent passport-style photo meeting official "
            "specifications, a completed application form, and payment of the "
            "renewal fee.",
            "A medical certificate is not always required for a standard Category B "
            "renewal, but it becomes relevant for older drivers and certain "
            "commercial categories.",
            "Driving with an expired licence in Cyprus is a traffic offence and can "
            "result in a fine. The exact penalty can change, so check with the "
            "Department of Road Transport.",
            "Drivers aged 65 and over may need to renew more frequently than the "
            "standard cycle and may need a medical certificate from a doctor "
            "approved by the Department of Road Transport.",
            "Holders of Category C or D licences are subject to different validity "
            "periods and may have mandatory medical requirements regardless of age.",
            "A renewed Cyprus licence is automatically recognised across all EU and "
            "EEA member states through the EU driving licence information network.",
        ),
        sections_el=(
            "Πότε λήγει η άδεια οδήγησης στην Κύπρο;",
            "Ποια έγγραφα χρειάζεστε για ανανέωση άδειας οδήγησης;",
            "Πού και πώς υποβάλλετε αίτηση ανανέωσης;",
            "Πόσο κοστίζει η ανανέωση άδειας οδήγησης στην Κύπρο;",
            "Τι γίνεται αν η άδειά σας έχει ήδη λήξει;",
            "Ειδικές περιπτώσεις: ηλικιωμένοι οδηγοί και ιατρικές απαιτήσεις",
            "Συχνές ερωτήσεις για την ανανέωση άδειας οδήγησης στην Κύπρο",
        ),
        sections_en=(
            "When Does a Cyprus Driving Licence Expire?",
            "What Documents Do You Need to Renew Your Licence?",
            "Where and How Do You Submit a Renewal Application?",
            "How Much Does It Cost to Renew a Cyprus Driving Licence?",
            "What Happens If Your Licence Has Already Expired?",
            "Special Cases: Older Drivers and Medical Requirements",
        ),
        widget_id="renewal-checker",
        infographic_type="renewal-path",
        internal_links_el=(
            ("/arthra/katigoria-b-adeia-odigisis-kypros", "κατηγορία Β άδεια οδήγησης"),
            ("/arthra/anallagi-adeias-ee-kypros", "ανταλλαγή ευρωπαϊκής άδειας στην Κύπρο"),
            ("/arthra/vretaniko-diploma-kypros", "βρετανική άδεια μετά το Brexit"),
            ("/arthra/diploma-odigisis-gia-ksenous-stin-kypro", "δίπλωμα οδήγησης για ξένους στην Κύπρο"),
            ("/arthra/plires-odigos-diploma-odigisis-kypros", "πλήρης οδηγός διπλώματος οδήγησης 2026"),
            ("/", "ClickClickDrive Κύπρος"),
        ),
        internal_links_en=(
            ("/en/blog/cyprus-driving-licence-complete-guide", "complete Cyprus driving licence guide"),
            ("/en/blog/cyprus-driving-licence-categories", "Cyprus driving licence categories"),
            ("/en/blog/exchange-eu-licence-cyprus", "exchanging an EU driving licence in Cyprus"),
            ("/en/blog/how-to-get-driving-licence-cyprus-foreigner", "how to get a Cyprus driving licence as a foreigner"),
            ("/en", "ClickClickDrive Cyprus"),
            ("/en/blog/uk-licence-cyprus-after-brexit", "UK driving licence in Cyprus after Brexit"),
        ),
    ),
    ArticleSpec(
        id="cyprus-driving-licence-fees",
        topic_el="Ανάλυση όλων των επίσημων τελών για άδεια οδήγησης στην Κύπρο το 2026",
        topic_en="A breakdown of every official fee for a Cyprus driving licence in 2026",
        title_el="Τέλη Άδειας Οδήγησης στην Κύπρο (2026)",
        title_en="Cyprus Driving Licence Fees and Costs (2026)",
        audience_el=(
            "Άτομα που σχεδιάζουν να βγάλουν ή να ανανεώσουν άδεια οδήγησης στην "
            "Κύπρο και θέλουν να καταλάβουν όλα τα επίσημα τέλη πριν ξεκινήσουν τη "
            "διαδικασία."
        ),
        audience_en=(
            "People planning to get or renew a Cyprus driving licence who want a "
            "clear picture of every official fee before they start the process."
        ),
        facts=(
            "Cyprus driving licence fees are paid to the Department of Road "
            "Transport (ΤΟΜ) at different stages: application, theory test, "
            "practical test, and licence issuance.",
            "Fee amounts can change, so applicants should always confirm current "
            "figures directly with the Department of Road Transport before paying.",
            "A medical certificate from a registered doctor is a separate, private "
            "cost, not a Department of Road Transport fee.",
            "A standard Category B licence is valid for 15 years or until the "
            "holder turns 70, whichever comes first.",
            "After age 70, renewal must happen more often and requires a medical "
            "certificate each time.",
            "Each test, theory and practical, carries its own fee, and failing a "
            "test means paying the fee again to resit, with no cap on the number "
            "of attempts.",
            "The theory test is computer-based and available in Greek or English "
            "at an authorised Department of Road Transport centre.",
            "A lost, stolen, or badly damaged licence can be replaced for a "
            "separate replacement fee, generally lower than the first-issuance fee; "
            "a police report is needed for theft or loss.",
            "EU and EEA citizens can exchange their home-country licence for a "
            "Cyprus one without retaking tests, though an issuance fee and medical "
            "certificate are still required.",
            "Non-EU citizens may qualify for a direct exchange without tests only "
            "if their home country has a reciprocal agreement with Cyprus; "
            "otherwise they must complete the full theory and practical test "
            "process.",
            "Driving school lesson fees are set independently by each school and "
            "are separate from Department of Road Transport government fees.",
            "Department of Road Transport offices are located in Nicosia, "
            "Limassol, Larnaca, Paphos, and the government-controlled area of "
            "Famagusta, and payment may also be available through the official "
            "government portal in some cases.",
        ),
        sections_el=(
            "Ποια είναι τα επίσημα κυβερνητικά τέλη για νέα άδεια οδήγησης στην Κύπρο το 2026;",
            "Πόσο κοστίζει η ανανέωση άδειας οδήγησης στην Κύπρο;",
            "Τι πληρώνεις για θεωρητική και πρακτική εξέταση στο ΤΟΜ;",
            "Πόσο κοστίζει η αντικατάσταση χαμένης ή κλεμμένης άδειας οδήγησης;",
            "Τέλη ανταλλαγής ευρωπαϊκής ή ξένης άδειας οδήγησης στην Κύπρο",
            "Ποιο είναι το συνολικό κόστος απόκτησης άδειας οδήγησης μαζί με τα μαθήματα;",
            "Πού και πώς πληρώνεις τα τέλη άδειας οδήγησης στην Κύπρο;",
        ),
        sections_en=(
            "What are the official government fees for a new driving licence in Cyprus in 2026?",
            "How much does it cost to renew a Cyprus driving licence?",
            "What do you pay for the theory and practical driving test at TOM?",
            "How much does it cost to replace a lost or stolen Cyprus driving licence?",
            "Fees for exchanging an EU or foreign driving licence in Cyprus",
            "What is the total cost of getting a driving licence including lessons?",
            "Where and how do you pay Cyprus driving licence fees?",
        ),
        widget_id="price-calculator",
        infographic_type="fee-stages",
        internal_links_el=(
            ("/arthra/plires-odigos-diploma-odigisis-kypros", "πλήρη οδηγό διπλώματος οδήγησης 2026"),
            ("/arthra/eksetasi-odigisis-kypros-2026", "εξέταση οδήγησης Κύπρος 2026"),
            ("/arthra/anallagi-adeias-ee-kypros", "ανταλλαγή ευρωπαϊκής άδειας στην Κύπρο"),
            ("/arthra/diploma-odigisis-gia-ksenous-stin-kypro", "δίπλωμα οδήγησης για ξένους στην Κύπρο"),
            ("/arthra/poso-kostizei-ekpaideysi-odigisis-kypros", "κόστος εκπαίδευσης οδήγησης στην Κύπρο"),
            ("/arthra/pws-na-vgaleis-diploma-odigisis-stin-kypro", "πώς βγάζεις δίπλωμα οδήγησης στην Κύπρο"),
        ),
        internal_links_en=(
            ("/en/blog/cyprus-driving-licence-complete-guide", "complete Cyprus driving licence guide"),
            ("/en/blog/how-to-get-driving-licence-cyprus-step-by-step", "step-by-step driving licence guide"),
            ("/en/blog/cyprus-driving-test-2026", "Cyprus driving test guide"),
            ("/en/blog/exchange-eu-licence-cyprus", "exchanging an EU driving licence in Cyprus"),
            ("/en/blog/how-to-get-driving-licence-cyprus-foreigner", "how to get a Cyprus driving licence as a foreigner"),
            ("/en/blog/driving-lesson-cost-cyprus", "driving lesson costs in Cyprus"),
        ),
    ),
    ArticleSpec(
        id="exchange-uk-driving-licence-cyprus",
        topic_el="Η διαδικασία ανταλλαγής βρετανικής άδειας οδήγησης με κυπριακή μετά "
        "το Brexit",
        topic_en="The process for exchanging a UK driving licence for a Cyprus one "
        "after Brexit",
        title_el="Ανταλλαγή Βρετανικής Άδειας Οδήγησης για Κυπριακή",
        title_en="Exchanging a UK Driving Licence for a Cyprus One",
        audience_el=(
            "Βρετανοί κάτοικοι Κύπρου που θέλουν να ανταλλάξουν τη βρετανική τους "
            "άδεια οδήγησης με κυπριακή και να μάθουν τη διαδικασία βήμα προς βήμα."
        ),
        audience_en=(
            "UK residents in Cyprus who want to swap their UK driving licence for a "
            "Cypriot one and need the step-by-step process explained."
        ),
        facts=(
            "Since the Brexit transition period ended on 31 December 2020, UK "
            "driving licences are no longer automatically recognised as EU licences "
            "in Cyprus.",
            "The UK is now treated as a third country, and the Department of Road "
            "Transport (ΤΟΜ) handles UK licence exchanges on a case-by-case basis "
            "rather than a guaranteed like-for-like swap.",
            "To be eligible, the applicant's UK licence must be valid, not expired, "
            "and the applicant must be legally resident in Cyprus with a valid "
            "residency document, such as an MEU1 registration certificate for those "
            "who moved before the end of 2020.",
            "The application must be submitted in person in Cyprus. It cannot be "
            "done remotely or through a third party.",
            "Required documents typically include the original valid UK licence, a "
            "certified Greek translation of it, proof of legal residence, a medical "
            "certificate from a doctor approved in Cyprus, and photo identification.",
            "The Department of Road Transport has offices in Nicosia, Limassol, "
            "Larnaca, and Paphos where the exchange application can be submitted.",
            "Whether a theory test, practical test, or both are required depends on "
            "the individual case; there is no published rule specifying exactly "
            "which applicants must test.",
            "Once the exchange is complete, the original UK licence is surrendered "
            "and sent back to the UK DVLA. The applicant does not get it back.",
            "Exchange fees are set by the Cyprus government and can change, so "
            "applicants should confirm current fees with the Department of Road "
            "Transport before their appointment.",
            "Processing takes time. Even without a test, applicants should expect a "
            "wait of several weeks at minimum from submission to receiving the new "
            "licence.",
            "Applicants who do not qualify for a direct exchange may need to go "
            "through part or all of the standard Cyprus driving licence process, "
            "including the theory and practical tests.",
            "The new Cyprus licence is issued in the standard EU credit-card "
            "format and is valid across EU member states, carrying over the same "
            "vehicle categories as the surrendered UK licence where confirmed by "
            "the Department of Road Transport.",
        ),
        sections_el=(
            "Τι άλλαξε μετά το Brexit για τους κατόχους βρετανικής άδειας στην Κύπρο;",
            "Ποιοι δικαιούνται να ανταλλάξουν βρετανική άδεια με κυπριακή;",
            "Ποια έγγραφα χρειάζονται για την ανταλλαγή;",
            "Πώς γίνεται η διαδικασία βήμα προς βήμα;",
            "Χρειάζεται εξέταση για την ανταλλαγή άδειας;",
            "Πόσο κοστίζει και πόσο διαρκεί η διαδικασία;",
            "Τι γίνεται αν δεν πληροίτε τις προϋποθέσεις για άμεση ανταλλαγή;",
        ),
        sections_en=(
            "What changed after Brexit for UK licence holders in Cyprus?",
            "Who is eligible to exchange a UK driving licence for a Cypriot one?",
            "What documents do you need for the exchange?",
            "How does the step-by-step application process work?",
            "Do you need to take a test to exchange your licence?",
            "How much does it cost and how long does the process take?",
            "What happens if you do not qualify for a direct exchange?",
        ),
        widget_id="uk-licence-checker",
        infographic_type="uk-licence-swap",
        internal_links_el=(
            ("/arthra/anallagi-adeias-ee-kypros", "ανταλλαγή ευρωπαϊκής άδειας στην Κύπρο"),
            ("/arthra/katigoria-b-adeia-odigisis-kypros", "κατηγορία Β άδεια οδήγησης"),
            ("/arthra/diploma-odigisis-gia-ksenous-stin-kypro", "δίπλωμα οδήγησης για ξένους στην Κύπρο"),
            ("/arthra/eksetasi-odigisis-kypros-2026", "εξέταση οδήγησης Κύπρος 2026"),
            ("/arthra/plires-odigos-diploma-odigisis-kypros", "πλήρη οδηγό διπλώματος οδήγησης 2026"),
            ("/arthra/vretaniko-diploma-kypros", "βρετανική άδεια μετά το Brexit"),
        ),
        internal_links_en=(
            ("/en/blog/uk-licence-cyprus-after-brexit", "UK driving licence in Cyprus after Brexit"),
            ("/en/blog/exchange-eu-licence-cyprus", "exchanging an EU driving licence in Cyprus"),
            ("/en/blog/cyprus-driving-licence-categories", "Cyprus driving licence categories"),
            ("/en/blog/cyprus-driving-test-2026", "Cyprus driving test guide"),
            ("/en/blog/how-to-get-driving-licence-cyprus-foreigner", "how to get a Cyprus driving licence as a foreigner"),
            ("/en/blog/cyprus-driving-licence-complete-guide", "complete Cyprus driving licence guide"),
        ),
    ),
    ArticleSpec(
        id="cyprus-driving-licence-renewal-over-70",
        topic_el="Πώς λειτουργεί η ανανέωση άδειας οδήγησης στην Κύπρο για οδηγούς άνω των 70",
        topic_en="How Cyprus driving licence renewal works for drivers over 70",
        title_el="Ανανέωση Άδειας Οδήγησης στην Κύπρο Άνω των 70",
        title_en="Renewing Your Cyprus Driving Licence Over 70",
        audience_el=(
            "Οδηγοί στην Κύπρο που πλησιάζουν ή έχουν ξεπεράσει τα 70 και θέλουν να "
            "καταλάβουν πώς αλλάζει η διαδικασία ανανέωσης, τι ιατρικές εξετάσεις "
            "χρειάζονται και πόσο συχνά πρέπει να ανανεώνουν."
        ),
        audience_en=(
            "Drivers in Cyprus approaching or past 70 who want to understand how the "
            "renewal process changes, what medical checks are required, and how often "
            "they need to renew."
        ),
        facts=(
            "Cyprus applies EU Directive 2006/126/EC, which allows member states to "
            "require more frequent renewals and medical checks for drivers past a "
            "certain age threshold.",
            "Once a driver turns 70, their Cyprus licence is issued for a shorter "
            "validity period than a standard licence, and every renewal after that "
            "requires a medical certificate.",
            "The Department of Road Transport (ΤΟΜ) manages the renewal process, sets "
            "requirements, and issues the licence.",
            "Renewal documents typically include: the current licence, a valid ID or "
            "passport, a completed medical certificate from an approved practitioner, "
            "a recent passport-style photo, and payment of the renewal fee.",
            "The medical certificate must come from a practitioner recognised by the "
            "Department of Road Transport for this purpose; using a doctor who is not "
            "on the approved list means the certificate will not be accepted.",
            "Drivers holding more than one licence category (for example Category B "
            "and BE) need the medical certificate and renewal application to cover "
            "each relevant category.",
            "Renewal applications for drivers over 70 are submitted in person at a "
            "District Transport Office in Nicosia, Limassol, Larnaca, or Paphos.",
            "The exact renewal interval after 70 depends on the medical assessment "
            "outcome and what the Department of Road Transport determines for that "
            "specific case.",
            "Driving on an expired licence is not permitted in Cyprus; drivers must "
            "stop driving on public roads until the new licence is issued.",
            "The medical assessment checks vision, physical fitness (movement, "
            "coordination, use of pedals and steering), and health conditions such as "
            "heart disease, diabetes, epilepsy, and neurological conditions.",
            "The Department of Road Transport can issue a licence with restrictions or "
            "special conditions, such as a requirement to wear corrective lenses, a "
            "restriction to certain vehicle types, a geographic restriction, a "
            "requirement for vehicle adaptations, or a shorter validity period.",
            "Driving in violation of a licence condition, such as driving without "
            "required glasses, is a legal offence in Cyprus.",
        ),
        sections_el=(
            "Γιατί αλλάζει η διαδικασία ανανέωσης για οδηγούς άνω των 70;",
            "Ποια έγγραφα και ιατρικά πιστοποιητικά χρειάζεστε;",
            "Βήμα προς βήμα: Πώς υποβάλλετε αίτηση ανανέωσης στο ΤΟΜ",
            "Πόσο συχνά πρέπει να ανανεώνετε την άδειά σας μετά τα 70;",
            "Τι εξετάζει ο γιατρός και τι να περιμένετε στην ιατρική αξιολόγηση",
            "Μπορεί η άδεια να εκδοθεί με περιορισμούς ή ειδικούς όρους;",
        ),
        sections_en=(
            "Why does the renewal process change for drivers over 70?",
            "What documents and medical certificates do you need?",
            "Step by step: how to submit your renewal application at the Department "
            "of Road Transport",
            "How often must you renew your licence after the age of 70?",
            "What does the medical assessment involve and what should you expect?",
            "Can a licence be issued with restrictions or special conditions?",
        ),
        widget_id="renewal-checker",
        infographic_type="medical-assessment",
        internal_links_el=(
            ("/arthra/katigoria-b-adeia-odigisis-kypros", "κατηγορία Β άδεια οδήγησης"),
            ("/arthra/plires-odigos-diploma-odigisis-kypros", "πλήρης οδηγός διπλώματος οδήγησης 2026"),
            ("/arthra/anallagi-adeias-ee-kypros", "ανταλλαγή ευρωπαϊκής άδειας στην Κύπρο"),
            ("/arthra/vretaniko-diploma-kypros", "βρετανική άδεια μετά το Brexit"),
            ("/scholes-odigon/lefkosia", "σχολές οδηγών στη Λευκωσία"),
            ("/", "ClickClickDrive Κύπρος"),
        ),
        internal_links_en=(
            ("/en/blog/cyprus-driving-licence-categories", "Cyprus driving licence categories"),
            ("/en/blog/exchange-eu-licence-cyprus", "exchanging an EU driving licence in Cyprus"),
            ("/en/blog/uk-licence-cyprus-after-brexit", "UK driving licence in Cyprus after Brexit"),
            ("/en/blog/cyprus-driving-licence-complete-guide", "complete Cyprus driving licence guide"),
            ("/en/driving-schools/nicosia", "driving schools in Nicosia"),
            ("/en", "ClickClickDrive Cyprus"),
        ),
    ),
    ArticleSpec(
        id="drive-cyprus-uk-licence",
        topic_el=(
            "Αν ισχύει η βρετανική άδεια οδήγησης στην Κύπρο, για πόσο καιρό και τι αλλάζει μετά το "
            "Brexit"
        ),
        topic_en=(
            "Whether a UK driving licence is valid in Cyprus, for how long, and what changes after "
            "Brexit"
        ),
        title_el="Μπορώ να Οδηγήσω στην Κύπρο με Βρετανική Άδεια;",
        title_en="Can I Drive in Cyprus With a UK Licence?",
        audience_el=(
            "Βρετανοί πολίτες που επισκέπτονται ή μόλις μετακόμισαν στην Κύπρο και θέλουν να μάθουν "
            "αν ισχύει η βρετανική τους άδεια, για πόσο διάστημα, και πότε πρέπει να την "
            "ανταλλάξουν."
        ),
        audience_en=(
            "UK citizens visiting Cyprus or newly arrived as residents who want to know whether "
            "their UK driving licence is valid, how long it lasts, and when they must exchange it."
        ),
        facts=(
            "A valid UK driving licence is accepted in Cyprus for the full length of a tourist "
            "visit, with no extra permit needed.",
            "The UK left the EU on 31 January 2020, ending the automatic mutual recognition that UK "
            "licences previously enjoyed as EU licences.",
            "Residents, unlike tourists, must exchange their UK licence or obtain a Cypriot licence "
            "within a set period after establishing residency; the exact deadline is set by the "
            "Department of Road Transport and can change.",
            "The Department of Road Transport, known in Cyprus as TOM (Tmima Odikis Metaforas), is "
            "the only body that can issue a Cypriot driving licence and handles all licence "
            "exchanges.",
            "UK residents may need to pass a theory test, a practical test, or both to convert "
            "their licence, depending on current TOM policy, unlike EU licence holders who exchange "
            "without retesting.",
            "The standard Cypriot licence category (Category B) covers vehicles up to 3,500 kg with "
            "up to eight passenger seats, the same scope as a standard UK car licence.",
            "TOM offices for licence exchange are located in the main towns including Nicosia, "
            "Limassol, Larnaca, and Paphos.",
            "An International Driving Permit issued by the UK Post Office is recognised in Cyprus "
            "but does not replace the UK licence and does not remove the requirement to exchange it "
            "once the resident window expires.",
            "Driving on a lapsed licence entitlement in Cyprus can lead to fines and can jeopardise "
            "insurance payouts if an accident occurs.",
            "Cyprus drives on the left, the same as the UK, which makes the physical adjustment "
            "easier for UK drivers than in most other EU countries.",
            "Using a mobile phone while driving is illegal in Cyprus and carries fines; seatbelts "
            "are compulsory for all occupants.",
            "Whether someone counts as a resident rather than a tourist is a legal status, and "
            "insurance cover depends on matching the correct status.",
        ),
        sections_el=(
            "Ισχύει η βρετανική άδεια οδήγησης στην Κύπρο;",
            "Τι αλλάζει μετά το Brexit για κατοίκους;",
            "Για πόσο καιρό μπορώ να οδηγώ ως τουρίστας;",
            "Πότε πρέπει να ανταλλάξω ή να βγάλω κυπριακή άδεια;",
            "Ποια είναι η διαδικασία ανταλλαγής στο ΤΟΜ;",
            "Χρειάζομαι Διεθνές Δίπλωμα Οδήγησης στην Κύπρο;",
            "Επόμενα βήματα: σχολές οδηγών και πρακτικές συμβουλές",
        ),
        sections_en=(
            "Is a UK Driving Licence Valid in Cyprus?",
            "What Changes After Brexit for Residents?",
            "How Long Can I Drive in Cyprus as a Tourist?",
            "When Must I Exchange or Obtain a Cypriot Licence?",
            "What Is the Exchange Process at the Department of Road Transport?",
            "Do I Need an International Driving Permit in Cyprus?",
            "Next Steps: Driving Schools and Practical Tips",
        ),
        widget_id="uk-licence-checker",
        infographic_type="tourist-resident",
        internal_links_el=(
            ("/arthra/plires-odigos-diploma-odigisis-kypros", "πλήρη οδηγό διπλώματος οδήγησης 2026"),
            ("/arthra/anallagi-adeias-ee-kypros", "ανταλλαγή ευρωπαϊκής άδειας στην Κύπρο"),
            ("/arthra/vretaniko-diploma-kypros", "βρετανική άδεια μετά το Brexit"),
            ("/arthra/diploma-odigisis-gia-ksenous-stin-kypro", "δίπλωμα οδήγησης για ξένους στην Κύπρο"),
            ("/arthra/pws-na-vgaleis-diploma-odigisis-stin-kypro", "πώς βγάζεις δίπλωμα οδήγησης στην Κύπρο"),
            ("/scholes-odigon/lefkosia", "σχολές οδηγών στη Λευκωσία"),
        ),
        internal_links_en=(
            ("/en/blog/uk-licence-cyprus-after-brexit", "UK driving licence in Cyprus after Brexit"),
            ("/en/blog/exchange-eu-licence-cyprus", "exchanging an EU driving licence in Cyprus"),
            ("/en/blog/how-to-get-driving-licence-cyprus-foreigner", "how to get a Cyprus driving licence as a foreigner"),
            ("/en/blog/how-to-get-driving-licence-cyprus-step-by-step", "step-by-step driving licence guide"),
            ("/en/blog/cyprus-driving-licence-complete-guide", "complete Cyprus driving licence guide"),
            ("/en/driving-schools/limassol", "driving schools in Limassol"),
        ),
    ),
    ArticleSpec(
        id="cyprus-driving-licence-categories",
        topic_el="Οι κατηγορίες άδειας οδήγησης στην Κύπρο, από μοτοποδήλατα έως φορτηγά και λεωφορεία",
        topic_en="The driving licence categories in Cyprus, from mopeds to trucks and buses",
        title_el="Κατηγορίες Άδειας Οδήγησης στην Κύπρο (Α έως Δ)",
        title_en="Cyprus Driving Licence Categories Explained (A to D)",
        audience_el=(
            "Άτομα στην Κύπρο που θέλουν να καταλάβουν ποια κατηγορία άδειας χρειάζονται, τα "
            "ηλικιακά όρια, και πώς να αποκτήσουν ή να αναβαθμίσουν την άδειά τους."
        ),
        audience_en=(
            "People in Cyprus who want to understand which driving licence category they need, the "
            "age limits, and how to get or upgrade their licence."
        ),
        facts=(
            "Cyprus follows the EU harmonised licence category system set out in Directive "
            "2006/126/EC, fully transposed into national law.",
            "Categories run from AM (mopeds) through A1, A2, and A (motorcycles), to B and BE (cars "
            "and trailers), up to C and D (lorries and buses).",
            "Category B, the standard car licence, covers vehicles up to 3,500 kg with no more than "
            "eight passenger seats; the minimum age is 18.",
            "Category BE lets a Category B holder tow a trailer where the trailer exceeds 750 kg "
            "and the combined vehicle-plus-trailer weight exceeds 3,500 kg.",
            "Category AM covers mopeds and light quadricycles up to 45 km/h from age 16; Category "
            "A1 covers motorcycles up to 125cc and 11 kW, also from age 16; Category A2 covers "
            "motorcycles up to 35 kW from age 18.",
            "Full Category A, the unrestricted motorcycle licence, is reached either via "
            "progressive access (holding A2 for at least two years, from age 20) or direct access "
            "(testing straight for A at age 24).",
            "Category C covers lorries over 3,500 kg, with C1 for 3,500 to 7,500 kg; Category D "
            "covers buses with more than eight passenger seats, with D1 for minibuses of nine to "
            "sixteen seats; both require already holding Category B.",
            "For Category B and above, the licence is valid for ten years; for professional "
            "Categories C and D it is valid for five years and renewal requires a medical "
            "examination.",
            "The Department of Road Transport (TOM) is the sole authority that issues, renews, and "
            "exchanges all driving licence categories in Cyprus.",
            "Professional lorry and bus drivers also need a Driver Certificate of Professional "
            "Competence under EU law, a separate qualification alongside the licence category.",
            "Holders of an EU-issued licence can exchange it for a Cyprus licence without retaking "
            "tests, since the process is mainly paperwork.",
            "Upgrading from one category to another, such as from B to C, does not require "
            "repeating the full process; only the theory and practical tests for the new category "
            "are needed, and the existing licence stays valid throughout.",
        ),
        sections_el=(
            "Ποιες είναι οι κατηγορίες άδειας οδήγησης στην Κύπρο;",
            "Κατηγορίες AM, A1 και A2: Μοτοποδήλατα και μικρές μοτοσυκλέτες",
            "Κατηγορία Α: Η πλήρης άδεια μοτοσυκλέτας",
            "Κατηγορία Β και ΒΕ: Αυτοκίνητα και ρυμουλκά",
            "Κατηγορίες C και D: Φορτηγά, λεωφορεία και επαγγελματικές άδειες",
            "Πώς να επιλέξεις την κατάλληλη κατηγορία για τις ανάγκες σου;",
            "Τι επόμενα βήματα να κάνεις για να αποκτήσεις ή να αναβαθμίσεις την άδειά σου στην "
            "Κύπρο",
        ),
        sections_en=(
            "What are the driving licence categories in Cyprus?",
            "Categories AM, A1 and A2: Mopeds and smaller motorcycles",
            "Category A: The full motorcycle licence",
            "Category B and BE: Cars and trailers",
            "Categories C and D: Trucks, buses, and professional licences",
            "How to choose the right category for your needs",
            "Next steps to get or upgrade your licence in Cyprus",
        ),
        widget_id="category-finder",
        infographic_type="category-overview",
        internal_links_el=(
            ("/arthra/pws-na-vgaleis-diploma-odigisis-stin-kypro", "πώς βγάζεις δίπλωμα οδήγησης στην Κύπρο"),
            ("/arthra/eksetasi-odigisis-kypros-2026", "εξέταση οδήγησης Κύπρος 2026"),
            ("/arthra/katigoria-b-adeia-odigisis-kypros", "κατηγορία Β άδεια οδήγησης"),
            ("/arthra/anallagi-adeias-ee-kypros", "ανταλλαγή ευρωπαϊκής άδειας στην Κύπρο"),
            ("/arthra/poso-kostizei-ekpaideysi-odigisis-kypros", "κόστος εκπαίδευσης οδήγησης στην Κύπρο"),
            ("/arthra/plires-odigos-diploma-odigisis-kypros", "πλήρη οδηγό διπλώματος οδήγησης 2026"),
        ),
        internal_links_en=(
            ("/en/blog/cyprus-driving-licence-complete-guide", "complete Cyprus driving licence guide"),
            ("/en/blog/driving-lesson-cost-cyprus", "driving lesson costs in Cyprus"),
            ("/en/blog/cyprus-driving-test-2026", "Cyprus driving test guide"),
            ("/en/blog/how-to-get-driving-licence-cyprus-step-by-step", "step-by-step driving licence guide"),
            ("/en/blog/exchange-eu-licence-cyprus", "exchanging an EU driving licence in Cyprus"),
            ("/en/blog/how-to-get-driving-licence-cyprus-foreigner", "how to get a Cyprus driving licence as a foreigner"),
        ),
    ),
    ArticleSpec(
        id="cyprus-theory-test-guide",
        topic_el="Πώς λειτουργεί η θεωρητική εξέταση οδήγησης στην Κύπρο και πώς να προετοιμαστείτε",
        topic_en="How the Cyprus driving theory test works and how to prepare to pass it",
        title_el="Θεωρητική Εξέταση Κύπρου: Πώς να Προετοιμαστείτε και να Περάσετε",
        title_en="Cyprus Theory Test: How to Prepare and Pass",
        audience_el=(
            "Υποψήφιοι οδηγοί στην Κύπρο, συμπεριλαμβανομένων ξένων κατοίκων, που ετοιμάζονται για "
            "τη θεωρητική εξέταση και θέλουν να μάθουν τι καλύπτει, πώς να κλείσουν ραντεβού, και "
            "πώς να μελετήσουν στα ελληνικά ή στα αγγλικά."
        ),
        audience_en=(
            "Learner drivers in Cyprus, including foreign residents, preparing for the theory test "
            "who want to know what it covers, how to book it, and how to study in Greek or English."
        ),
        facts=(
            "The theory test is run by the Department of Road Transport (TOM), which sits under the "
            "Ministry of Transport, Communications and Works.",
            "Anyone applying for a first Cyprus driving licence must pass the theory test, "
            "including foreign residents and people who have driven for years in another country.",
            "Candidates need a provisional driving licence, obtained through TOM, before they can "
            "book the theory test.",
            "The test is computer-based, multiple-choice, and sat at an official TOM examination "
            "centre; results are generally available quickly.",
            "The test is offered in both Greek and English, with the same questions and pass mark "
            "in both languages.",
            "Theory test content is drawn entirely from the Highway Code of Cyprus and covers road "
            "signs and markings, traffic rules, safe driving behaviour, basic vehicle maintenance "
            "awareness, and first aid basics.",
            "TOM runs official theory test examination centres in the four main cities: Nicosia, "
            "Limassol, Larnaca, and Paphos.",
            "Candidates must bring valid ID to the exam: a Cyprus identity card for Cypriots and EU "
            "nationals, or a passport plus residence document for non-EU foreign nationals.",
            "Cyprus drives on the left, a legacy of British colonial rule, and the theory test "
            "reflects left-hand traffic rules throughout, including junction and overtaking "
            "questions.",
            "Candidates who fail must wait a specified period, set by TOM, before they can book a "
            "retake, and must pay the exam fee again.",
            "There is no limit on the number of retake attempts, though each attempt costs time and "
            "money.",
            "A theory test pass certificate is valid for a set period during which the candidate "
            "must complete practical training and pass the practical test.",
        ),
        sections_el=(
            "Τι είναι η θεωρητική εξέταση στην Κύπρο και ποιος πρέπει να τη δώσει;",
            "Ποια θέματα καλύπτει η εξέταση;",
            "Πώς είναι δομημένη η εξέταση και τι βαθμολογία χρειάζεστε για να περάσετε;",
            "Πού και πώς κλείνετε ραντεβού για τη θεωρητική εξέταση;",
            "Ποια υλικά μελέτης υπάρχουν στα ελληνικά και στα αγγλικά;",
            "Πώς να προετοιμαστείτε αποτελεσματικά: συμβουλές και στρατηγικές;",
            "Τι γίνεται αν αποτύχετε και πώς να επανεξεταστείτε;",
        ),
        sections_en=(
            "What is the Cyprus theory test and who needs to take it?",
            "What topics does the theory test cover?",
            "How is the test structured and what score do you need to pass?",
            "Where and how do you book the theory test?",
            "What study materials are available in Greek and English?",
            "How to prepare effectively: tips and strategies",
            "What happens if you fail and how do you retake the test?",
        ),
        widget_id="test-readiness-checker",
        infographic_type="theory-topics",
        internal_links_el=(
            ("/arthra/diploma-odigisis-gia-ksenous-stin-kypro", "δίπλωμα οδήγησης για ξένους στην Κύπρο"),
            ("/arthra/pws-na-vgaleis-diploma-odigisis-stin-kypro", "βγάζεις δίπλωμα οδήγησης στην Κύπρο"),
            ("/arthra/katigoria-b-adeia-odigisis-kypros", "κατηγορία Β άδεια οδήγησης"),
            ("/arthra/plires-odigos-diploma-odigisis-kypros", "πλήρης οδηγός διπλώματος οδήγησης 2026"),
            ("/arthra/poso-kostizei-ekpaideysi-odigisis-kypros", "κοστίζει η εκπαίδευση οδήγησης στην Κύπρο"),
            ("/arthra/eksetasi-odigisis-kypros-2026", "εξέταση οδήγησης Κύπρος 2026"),
        ),
        internal_links_en=(
            ("/en/blog/how-to-get-driving-licence-cyprus-step-by-step", "step-by-step driving licence guide"),
            ("/en/blog/cyprus-driving-licence-complete-guide", "complete Cyprus driving licence guide"),
            ("/en/blog/cyprus-driving-test-2026", "Cyprus driving test guide"),
            ("/en/blog/how-to-get-driving-licence-cyprus-foreigner", "how to get a Cyprus driving licence as a foreigner"),
            ("/en/blog/driving-lesson-cost-cyprus", "driving lesson costs in Cyprus"),
            ("/en/blog/cyprus-driving-licence-categories", "Cyprus driving licence categories"),
        ),
    ),
    ArticleSpec(
        id="cyprus-road-signs-guide",
        topic_el="Τα σήματα τροχαίας της Κύπρου που χρειάζεστε να γνωρίζετε για τη θεωρητική εξέταση",
        topic_en="The Cyprus road signs you need to know for the theory test",
        title_el="Σήματα Τροχαίας Κύπρου: Πλήρης Οδηγός για την Εξέταση",
        title_en="Cyprus Road Signs: The Complete Test Guide",
        audience_el=(
            "Υποψήφιοι οδηγοί στην Κύπρο που προετοιμάζονται για το τμήμα σημάτων τροχαίας της "
            "θεωρητικής εξέτασης και θέλουν να μάθουν τις κατηγορίες σημάτων και πώς να τις "
            "μελετήσουν."
        ),
        audience_en=(
            "Learner drivers in Cyprus preparing for the road signs section of the theory test who "
            "want to understand the sign categories and how to study them effectively."
        ),
        facts=(
            "The Cyprus theory test question bank tests sign recognition heavily, and the "
            "Department of Road Transport (TOM) sets the questions.",
            "Cyprus road signs fall into three shape-and-colour categories: mandatory (circular, "
            "red border or blue background), warning (triangular with a red border), and "
            "informational or directional (rectangular or square).",
            "Mandatory signs with a red border on white tell drivers what they must not do, such as "
            "no entry or speed limits; mandatory signs with a blue background tell drivers what "
            "they must do, such as turn left or keep right.",
            "The Stop sign in Cyprus is the international octagonal red design with the word STOP "
            "in white, requiring a complete stop even if the junction looks clear; the Give Way "
            "sign is an inverted triangle with a red border.",
            "Warning signs are triangular with a red border and a white or yellow background, "
            "placed a set distance before a hazard so drivers have time to react.",
            "Informational and directional signs are rectangular or square; colour depends on road "
            "type, with blue on motorways and some urban roads, green on expressways and major "
            "routes, and white on local roads and place names.",
            "Cyprus road signs follow the Vienna Convention on Road Signs and Signals, so they are "
            "broadly aligned with signs used across Europe, though small differences exist from "
            "other countries' versions.",
            "Because Cyprus drives on the left, a legacy of British colonial rule, directional sign "
            "layouts and junction sign placement differ from what drivers from right-hand-traffic "
            "countries expect.",
            "Place names and directional signs on major roads and tourist areas commonly appear in "
            "both Greek and English.",
            "Common exam mistakes include confusing similar-looking mandatory and warning signs, "
            "ignoring supplementary plates beneath a sign, assuming a sign means the same as in the "
            "candidate's home country, and overlooking blue obligation signs.",
            "Some warning signs carry a smaller supplementary plate below them giving extra detail, "
            "such as the distance to the hazard, and these plates are also tested.",
            "The Department of Road Transport publishes official study materials and sample "
            "questions, organised by sign category, as the primary study resource for the theory "
            "test.",
        ),
        sections_el=(
            "Γιατί είναι τόσο σημαντικά τα σήματα τροχαίας για τη θεωρητική εξέταση στην Κύπρο;",
            "Ποια είναι η διαφορά μεταξύ υποχρεωτικών, προειδοποιητικών και πληροφοριακών σημάτων;",
            "Υποχρεωτικά σήματα: ποια πρέπει να γνωρίζεις απέξω;",
            "Προειδοποιητικά σήματα: πώς αναγνωρίζεις τους κινδύνους στον δρόμο;",
            "Πληροφοριακά και κατευθυντήρια σήματα: πώς σε καθοδηγούν στον δρόμο;",
            "Συνηθισμένα λάθη υποψηφίων οδηγών στα σήματα τροχαίας στην Κύπρο",
            "Πώς να προετοιμαστείς αποτελεσματικά για τα σήματα στη θεωρητική εξέταση;",
        ),
        sections_en=(
            "Why are road signs so important for the Cyprus theory test?",
            "What is the difference between mandatory, warning, and informational signs?",
            "Mandatory signs: which ones do you need to know by heart?",
            "Warning signs: how do you recognise road hazards ahead?",
            "Informational and directional signs: how do they guide you on the road?",
            "Common mistakes candidates make on road signs in the Cyprus theory test",
            "How to study road signs effectively for the theory test?",
        ),
        widget_id="sign-category-checker",
        infographic_type="sign-shapes",
        internal_links_el=(
            ("/arthra/pws-na-vgaleis-diploma-odigisis-stin-kypro", "πώς βγάζεις δίπλωμα οδήγησης στην Κύπρο"),
            ("/arthra/katigoria-b-adeia-odigisis-kypros", "κατηγορία Β άδεια οδήγησης"),
            ("/arthra/eksetasi-odigisis-kypros-2026", "εξέταση οδήγησης Κύπρος 2026"),
            ("/scholes-odigon/lefkosia", "σχολές οδηγών στη Λευκωσία"),
            ("/scholes-odigon/lemesos", "σχολές οδηγών στη Λεμεσό"),
            ("/arthra/plires-odigos-diploma-odigisis-kypros", "πλήρη οδηγό διπλώματος οδήγησης 2026"),
        ),
        internal_links_en=(
            ("/en/blog/cyprus-driving-test-2026", "Cyprus driving test guide"),
            ("/en/blog/cyprus-driving-licence-categories", "Cyprus driving licence categories"),
            ("/en/blog/how-to-get-driving-licence-cyprus-step-by-step", "step-by-step driving licence guide"),
            ("/en/driving-schools/nicosia", "driving schools in Nicosia"),
            ("/en/driving-schools/limassol", "driving schools in Limassol"),
            ("/en/blog/cyprus-driving-licence-complete-guide", "complete Cyprus driving licence guide"),
        ),
    ),
    ArticleSpec(
        id="cyprus-driving-licence-requirements",
        topic_el=(
            "Όλες οι προϋποθέσεις για να αποκτήσετε άδεια οδήγησης στην Κύπρο, από ηλικία έως "
            "ιατρικό πιστοποιητικό"
        ),
        topic_en=(
            "All the requirements to get a driving licence in Cyprus, from age to medical "
            "certificate"
        ),
        title_el="Προϋποθέσεις Άδειας Οδήγησης στην Κύπρο",
        title_en="Driving Licence Requirements in Cyprus",
        audience_el=(
            "Έφηβοι, γονείς, και νεοαφιχθέντες ξένοι κάτοικοι στην Κύπρο που θέλουν να μάθουν την "
            "ελάχιστη ηλικία, τα απαιτούμενα έγγραφα, και τις προϋποθέσεις κατοικίας και υγείας "
            "πριν κάνουν αίτηση."
        ),
        audience_en=(
            "Teenagers, parents, and newly arrived foreign residents in Cyprus who want to know the "
            "minimum age, required documents, and residency and medical requirements before "
            "applying."
        ),
        facts=(
            "Applicants can start the licensing process at age 17 with a provisional licence for "
            "accompanied driving, supervised by a driver holding a full Cyprus licence; a full, "
            "independently-driven Category B licence requires age 18.",
            "There is no upper age limit for applying for a first driving licence in Cyprus.",
            "First-time applicants must submit a valid Cyprus ID card or residence permit, a "
            "completed TOM application form, a medical certificate, passport-sized photographs, and "
            "the application fee.",
            "Cyprus only issues driving licences to legal residents; a tourist visa or visitor "
            "stamp does not qualify, and documents relating to the north of the island are not "
            "accepted by the Republic's authorities.",
            "Third-country nationals need a valid residence permit issued by the Migration "
            "Department of Cyprus, not just a passport stamp.",
            "Every first-time applicant must submit a medical certificate from a registered doctor "
            "in Cyprus; the eyesight standard follows EU Directive 2006/126/EC, and corrective "
            "lenses can be noted as a licence condition.",
            "Foreign medical certificates from another country are not accepted; the certificate "
            "has an expiry date, so it should not be obtained too far in advance.",
            "Before taking any driving lesson on a public road, a learner needs a provisional "
            "licence issued by the Department of Road Transport; driving without it is illegal even "
            "with a qualified supervisor present.",
            "All practical lessons must be taken at an officially registered driving school with a "
            "licensed instructor; informal practice with a family member does not count toward "
            "official lesson hours.",
            "EU citizens who already hold a valid licence from another EU member state can often "
            "exchange it for a Cyprus licence without retaking the theory or practical tests; "
            "non-EU nationals generally must complete the full licensing process.",
            "TOM has district offices in Nicosia, Limassol, Larnaca, Paphos, and Famagusta; "
            "applications must be submitted in person, since postal or fully online applications "
            "are not currently available for first-time applicants.",
            "Driving on a provisional licence without a qualified supervising driver is illegal and "
            "can lead to a fine or points on the licence record.",
        ),
        sections_el=(
            "Ποια είναι η ελάχιστη ηλικία για άδεια οδήγησης στην Κύπρο;",
            "Ποια έγγραφα χρειάζεσαι για να κάνεις αίτηση;",
            "Τι ισχύει για την κατοικία και τη νομιμότητα παραμονής;",
            "Ποιες είναι οι ιατρικές προϋποθέσεις;",
            "Ποια είναι η διαδικασία απόκτησης προσωρινής άδειας;",
            "Διαφέρουν οι προϋποθέσεις για ΕΕ και τρίτες χώρες;",
            "Πού υποβάλλεις την αίτησή σου και ποια είναι τα επόμενα βήματα;",
        ),
        sections_en=(
            "What is the minimum age to get a driving licence in Cyprus?",
            "What documents do you need to apply?",
            "What are the residency and legal status requirements?",
            "What are the medical fitness requirements?",
            "What is the process for getting a provisional (learner) licence?",
            "Do requirements differ for EU citizens and non-EU nationals?",
            "Where do you submit your application and what are the next steps?",
        ),
        widget_id="eligibility-checker",
        infographic_type="requirements-checklist",
        internal_links_el=(
            ("/arthra/katigoria-b-adeia-odigisis-kypros", "κατηγορία Β άδεια οδήγησης"),
            ("/arthra/pws-na-vgaleis-diploma-odigisis-stin-kypro", "πώς βγάζεις δίπλωμα οδήγησης στην Κύπρο"),
            ("/arthra/diploma-odigisis-gia-ksenous-stin-kypro", "δίπλωμα οδήγησης για ξένους στην Κύπρο"),
            ("/arthra/poso-kostizei-ekpaideysi-odigisis-kypros", "κόστος εκπαίδευσης οδήγησης στην Κύπρο"),
            ("/arthra/anallagi-adeias-ee-kypros", "ανταλλαγή ευρωπαϊκής άδειας στην Κύπρο"),
            ("/arthra/plires-odigos-diploma-odigisis-kypros", "πλήρη οδηγό διπλώματος οδήγησης 2026"),
        ),
        internal_links_en=(
            ("/en/blog/cyprus-driving-licence-categories", "Cyprus driving licence categories"),
            ("/en/blog/how-to-get-driving-licence-cyprus-step-by-step", "step-by-step driving licence guide"),
            ("/en/blog/how-to-get-driving-licence-cyprus-foreigner", "how to get a Cyprus driving licence as a foreigner"),
            ("/en/blog/driving-lesson-cost-cyprus", "driving lesson costs in Cyprus"),
            ("/en/blog/exchange-eu-licence-cyprus", "exchanging an EU driving licence in Cyprus"),
            ("/en/blog/cyprus-driving-licence-complete-guide", "complete Cyprus driving licence guide"),
        ),
    ),
    ArticleSpec(
        id="book-driving-test-cyprus",
        topic_el="Πώς να κλείσετε θεωρητική και πρακτική εξέταση οδήγησης στην Κύπρο, βήμα προς βήμα",
        topic_en="How to book your theory and practical driving test in Cyprus, step by step",
        title_el="Πώς να Κλείσετε Εξέταση Οδήγησης στην Κύπρο",
        title_en="How to Book Your Driving Test in Cyprus",
        audience_el=(
            "Υποψήφιοι οδηγοί στην Κύπρο που έχουν ολοκληρώσει την εκπαίδευσή τους και θέλουν να "
            "μάθουν πώς να κλείσουν εξέταση, πού γίνονται οι εξετάσεις, και τι να κάνουν αν "
            "χρειαστεί αναβολή ή επανάληψη."
        ),
        audience_en=(
            "Learner drivers in Cyprus who have completed their training and want to know how to "
            "book a test, where tests are held, and what to do if they need to reschedule or "
            "retake."
        ),
        facts=(
            "Driving tests in Cyprus are run by the Department of Road Transport (TOM), which sits "
            "under the Ministry of Transport, Communications and Works.",
            "TOM operates district offices in Nicosia, Limassol, Larnaca, and Paphos, and "
            "candidates are normally assigned to the test centre nearest to where they live or "
            "where their driving school operates.",
            "Before booking either test, a candidate needs a valid learner's permit issued by TOM "
            "and must have completed the minimum required training hours at a licensed driving "
            "school.",
            "Tests can be booked three ways: through a driving school, by phone to the local TOM "
            "district office, or in person at a TOM office.",
            "The theory test is a multiple-choice exam drawn from TOM's official question bank "
            "covering road signs, traffic rules, and safe driving behaviour, sat at a computer "
            "terminal, with results usually given the same day.",
            "The practical test takes place on public roads near the TOM test centre, with an "
            "examiner assessing manoeuvres, control, observation, and rule application.",
            "To book the practical test, a candidate needs their theory test pass certificate in "
            "addition to their learner's permit and ID.",
            "If a candidate fails the theory test, TOM sets a mandatory waiting period before a "
            "retake can be booked; failing the practical test requires completing additional "
            "training hours before rebooking is possible.",
            "Rescheduling before a test should be done with as much notice as possible, since late "
            "cancellations may affect the fee refund.",
            "The test fee must be paid again for every rebooking, whether after a fail or a missed "
            "appointment.",
            "Cyprus's official digital services platform sometimes offers transport-related "
            "services online, but online booking availability for driving tests can change and "
            "should be confirmed directly with TOM.",
            "Northern Cyprus is not covered by TOM or the Republic of Cyprus government; candidates "
            "living in the government-controlled areas must use the TOM centres in Nicosia, "
            "Limassol, Larnaca, or Paphos.",
        ),
        sections_el=(
            "Ποιος είναι υπεύθυνος για τις εξετάσεις οδήγησης στην Κύπρο;",
            "Ποιες προϋποθέσεις πρέπει να πληροίτε πριν κλείσετε εξέταση;",
            "Πώς να κλείσετε θεωρητική εξέταση: βήμα προς βήμα",
            "Πώς να κλείσετε πρακτική εξέταση: βήμα προς βήμα",
            "Πού γίνονται οι εξετάσεις ανά πόλη στην Κύπρο;",
            "Τι κάνετε αν χρειαστεί να αναβάλετε ή να επαναλάβετε εξέταση;",
        ),
        sections_en=(
            "Who is responsible for driving tests in Cyprus?",
            "What are the requirements before you can book a test?",
            "How to book your theory test: step by step",
            "How to book your practical test: step by step",
            "Where are driving tests held across Cyprus?",
            "What to do if you need to reschedule or retake a test",
        ),
        widget_id="test-readiness-checker",
        infographic_type="booking-methods",
        internal_links_el=(
            ("/arthra/plires-odigos-diploma-odigisis-kypros", "πλήρη οδηγό διπλώματος οδήγησης 2026"),
            ("/arthra/pws-na-vgaleis-diploma-odigisis-kypros", "δίπλωμα οδήγησης στην Κύπρο"),
            ("/arthra/poso-kostizei-ekpaideysi-odigisis-kypros", "κόστος εκπαίδευσης οδήγησης στην Κύπρο"),
            ("/arthra/eksetasi-odigisis-kypros-2026", "εξέταση οδήγησης Κύπρος 2026"),
            ("/scholes-odigon/lefkosia", "σχολές οδηγών στη Λευκωσία"),
            ("/scholes-odigon/lemesos", "σχολές οδηγών στη Λεμεσό"),
        ),
        internal_links_en=(
            ("/en/blog/how-to-get-driving-licence-cyprus-step-by-step", "step-by-step driving licence guide"),
            ("/en/blog/driving-lesson-cost-cyprus", "driving lesson costs in Cyprus"),
            ("/en/blog/cyprus-driving-licence-complete-guide", "complete Cyprus driving licence guide"),
            ("/en/blog/cyprus-driving-test-2026", "Cyprus driving test guide"),
            ("/en/driving-schools/nicosia", "driving schools in Nicosia"),
            ("/en/driving-schools/limassol", "driving schools in Limassol"),
        ),
    ),
    ArticleSpec(
        id="international-driving-licence-cyprus",
        topic_el=(
            "Πότε χρειάζεται κάποιος Διεθνή Άδεια Οδήγησης (ΔΑΟ) από την Κύπρο, πώς να κάνει "
            "αίτηση στο ΤΟΜ, και ποιες χώρες τη δέχονται"
        ),
        topic_en=(
            "When you need an International Driving Permit (IDP) from Cyprus, how to apply for "
            "one at TOM, and which countries accept it"
        ),
        title_el="Διεθνής Άδεια Οδήγησης στην Κύπρο: Πότε Χρειάζεστε μία",
        title_en="International Driving Licence in Cyprus: When You Need One",
        audience_el=(
            "Κάτοχοι κυπριακής άδειας οδήγησης που ταξιδεύουν στο εξωτερικό και θέλουν να "
            "μάθουν πότε χρειάζονται Διεθνή Άδεια Οδήγησης, πώς να κάνουν αίτηση στο ΤΟΜ, και "
            "ποιες χώρες την αναγνωρίζουν."
        ),
        audience_en=(
            "Holders of a Cyprus driving licence who are travelling abroad and want to know "
            "when they need an International Driving Permit, how to apply for one at TOM, and "
            "which countries recognise it."
        ),
        facts=(
            "An International Driving Permit (IDP) is not a separate licence; it is a "
            "certified, multi-language translation of a Cyprus driving licence issued by the "
            "Department of Road Transport (TOM).",
            "TOM issues the Cyprus IDP under the 1968 Vienna Convention on Road Traffic, and "
            "TOM itself operates under the Ministry of Transport, Communications and Works.",
            "An IDP is not needed to drive within EU and EEA countries, since EU member states "
            "mutually recognise each other's driving licences.",
            "Countries that are not party to the 1968 Vienna Convention, such as the United "
            "States, Australia, and New Zealand, use the older 1949 Geneva Convention instead, "
            "so IDP acceptance there varies and should be checked with TOM.",
            "Applying for a Cyprus IDP must be done in person at a TOM district office; there "
            "is no online or postal application, and no one else can apply on the applicant's "
            "behalf.",
            "TOM has district offices in Nicosia, Limassol, Larnaca, Paphos, and Famagusta in "
            "the government-controlled area.",
            "Required documents are a valid Cyprus driving licence, a valid passport or "
            "national identity card, a recent passport-size photograph, and payment of the "
            "applicable fee.",
            "The permit is usually issued the same day once the completed documents and fee "
            "are submitted at the district office.",
            "The Cyprus IDP is valid for up to three years from issue, but it can never be "
            "valid beyond the expiry date of the underlying Cyprus driving licence.",
            "The IDP is only valid when carried together with the original Cyprus driving "
            "licence at all times while driving abroad; it has no standalone validity.",
            "Once an IDP expires there is no automatic renewal; a new application must follow "
            "the same process again, with no test required.",
        ),
        sections_el=(
            "Τι είναι η Διεθνής Άδεια Οδήγησης και πότε τη χρειάζεστε;",
            "Πώς εκδίδεται η Διεθνής Άδεια Οδήγησης στην Κύπρο;",
            "Ποια δικαιολογητικά χρειάζονται για την αίτηση στο ΤΟΜ;",
            "Πόσο ισχύει η Κυπριακή Διεθνής Άδεια Οδήγησης;",
            "Ποιες χώρες δέχονται τη Διεθνή Άδεια Οδήγησης από την Κύπρο;",
            "Χρειάζεται Διεθνής Άδεια για οδήγηση στην Κύπρο ως αλλοδαπός;",
            "Συχνές Ερωτήσεις",
        ),
        sections_en=(
            "What Is an International Driving Licence and When Do You Need One?",
            "How to Get an International Driving Permit in Cyprus",
            "What Documents Do You Need to Apply at the Department of Road Transport?",
            "How Long Is the Cyprus International Driving Permit Valid?",
            "Which Countries Accept the Cyprus International Driving Permit?",
            "Do Foreigners Need an International Driving Permit to Drive in Cyprus?",
            "FAQ",
        ),
        widget_id="idp-checker",
        infographic_type="idp-documents",
        internal_links_el=(
            ("/arthra/plires-odigos-diploma-odigisis-kypros", "πλήρη οδηγό διπλώματος οδήγησης 2026"),
            ("/arthra/pws-na-vgaleis-diploma-odigisis-stin-kypro", "πώς βγάζεις δίπλωμα οδήγησης στην Κύπρο"),
            ("/arthra/diploma-odigisis-gia-ksenous-stin-kypro", "δίπλωμα οδήγησης για ξένους στην Κύπρο"),
            ("/arthra/anallagi-adeias-ee-kypros", "ανταλλαγή ευρωπαϊκής άδειας στην Κύπρο"),
            ("/arthra/vretaniko-diploma-kypros", "βρετανική άδεια μετά το Brexit"),
            ("/", "ClickClickDrive Κύπρος"),
        ),
        internal_links_en=(
            ("/en/blog/cyprus-driving-licence-complete-guide", "complete Cyprus driving licence guide"),
            ("/en/blog/how-to-get-driving-licence-cyprus-step-by-step", "step-by-step driving licence guide"),
            ("/en/blog/how-to-get-driving-licence-cyprus-foreigner", "how to get a Cyprus driving licence as a foreigner"),
            ("/en/blog/exchange-eu-licence-cyprus", "exchanging an EU driving licence in Cyprus"),
            ("/en/blog/uk-licence-cyprus-after-brexit", "UK driving licence in Cyprus after Brexit"),
            ("/en", "ClickClickDrive Cyprus"),
        ),
    ),
)


# ----------------------------------------------------------------------- auto-spec

# Pool of live pages available for internal linking in auto-generated specs.
_LINK_POOL_EN: tuple[tuple[str, str], ...] = (
    ("/en/blog/how-to-get-driving-licence-cyprus-foreigner", "how to get a Cyprus driving licence as a foreigner"),
    ("/en/blog/how-to-get-driving-licence-cyprus-step-by-step", "step-by-step driving licence guide"),
    ("/en/blog/driving-lesson-cost-cyprus", "driving lesson costs in Cyprus"),
    ("/en/blog/uk-licence-cyprus-after-brexit", "UK driving licence in Cyprus after Brexit"),
    ("/en/blog/exchange-eu-licence-cyprus", "exchanging an EU driving licence in Cyprus"),
    ("/en/blog/cyprus-driving-licence-categories", "Cyprus driving licence categories"),
    ("/en/blog/cyprus-driving-licence-complete-guide", "complete Cyprus driving licence guide"),
    ("/en/blog/cyprus-driving-test-2026", "Cyprus driving test guide"),
    ("/en/driving-schools/nicosia", "driving schools in Nicosia"),
    ("/en/driving-schools/limassol", "driving schools in Limassol"),
    ("/en/driving-schools/larnaca", "driving schools in Larnaca"),
    ("/en/driving-schools/paphos", "driving schools in Paphos"),
    ("/en", "ClickClickDrive Cyprus"),
)

_LINK_POOL_EL: tuple[tuple[str, str], ...] = (
    ("/arthra/diploma-odigisis-gia-ksenous-stin-kypro", "δίπλωμα οδήγησης για ξένους στην Κύπρο"),
    ("/arthra/pws-na-vgaleis-diploma-odigisis-stin-kypro", "πώς βγάζεις δίπλωμα οδήγησης στην Κύπρο"),
    ("/arthra/poso-kostizei-ekpaideysi-odigisis-kypros", "κόστος εκπαίδευσης οδήγησης στην Κύπρο"),
    ("/arthra/vretaniko-diploma-kypros", "βρετανική άδεια μετά το Brexit"),
    ("/arthra/anallagi-adeias-ee-kypros", "ανταλλαγή ευρωπαϊκής άδειας στην Κύπρο"),
    ("/arthra/katigoria-b-adeia-odigisis-kypros", "κατηγορία Β άδεια οδήγησης"),
    ("/arthra/plires-odigos-diploma-odigisis-kypros", "πλήρης οδηγός διπλώματος οδήγησης 2026"),
    ("/arthra/eksetasi-odigisis-kypros-2026", "εξέταση οδήγησης Κύπρος 2026"),
    ("/scholes-odigon/lefkosia", "σχολές οδηγών στη Λευκωσία"),
    ("/scholes-odigon/lemesos", "σχολές οδηγών στη Λεμεσό"),
    ("/scholes-odigon/larnaka", "σχολές οδηγών στη Λάρνακα"),
    ("/scholes-odigon/pafos", "σχολές οδηγών στην Πάφο"),
    ("/", "ClickClickDrive Κύπρος"),
)


def _build_infographic_payload(infographic_data: dict) -> dict:
    """Remap the flat *_el/*_en fields from auto_generate_spec()'s JSON response
    into the per-locale nested shape the matching Auto*Infographic component
    expects, based on infographic_data["template"].
    """
    template = infographic_data["template"]

    def base(suffix: str) -> dict:
        return {
            "template": template,
            "title": infographic_data[f"title_{suffix}"],
            "caption": infographic_data[f"caption_{suffix}"],
        }

    payload: dict = {}
    for suffix in ("el", "en"):
        entry = base(suffix)
        if template == "flow":
            entry["items"] = [
                {"num": item["num"], "title": item[f"title_{suffix}"], "sub": item[f"sub_{suffix}"]}
                for item in infographic_data["items"]
            ]
        elif template == "compare":
            entry["cards"] = [
                {"accent": card["accent"], "heading": card[f"heading_{suffix}"], "body": card[f"body_{suffix}"]}
                for card in infographic_data["cards"]
            ]
        elif template == "versus":
            entry["left"] = {
                "heading": infographic_data["left"][f"heading_{suffix}"],
                "sub": infographic_data["left"][f"sub_{suffix}"],
            }
            entry["right"] = {
                "heading": infographic_data["right"][f"heading_{suffix}"],
                "sub": infographic_data["right"][f"sub_{suffix}"],
            }
        elif template == "checklist":
            entry["items"] = [
                {"icon": item["icon"], "label": item[f"label_{suffix}"], "sub": item[f"sub_{suffix}"]}
                for item in infographic_data["items"]
            ]
        elif template == "timeline":
            entry["milestones"] = [
                {"label": m[f"label_{suffix}"], "sub": m[f"sub_{suffix}"]}
                for m in infographic_data["milestones"]
            ]
        else:
            raise ValueError(f"Unknown infographic template: {template!r}")
        payload[suffix] = entry

    return payload


def auto_generate_spec(article_id: str, article_data: dict, client) -> "ArticleSpec | None":
    """Call Claude to generate an ArticleSpec for articles not in the ARTICLES tuple.

    Saves a sidecar JSON so publish_next can fetch inline images without the spec
    being in the static registry.
    """
    title_en = article_data.get("title_en", article_id)
    title_el = article_data.get("title_el", title_en)
    keyword = article_data.get("keyword", "")
    cluster = article_data.get("cluster", "")
    excerpt_en = article_data.get("excerpt_en", "")
    excerpt_el = article_data.get("excerpt_el", "")

    pool_en_text = "\n".join(f'  ["{p}", "{a}"]' for p, a in _LINK_POOL_EN)
    pool_el_text = "\n".join(f'  ["{p}", "{a}"]' for p, a in _LINK_POOL_EL)

    prompt = f"""Generate a structured article brief for a Cyprus driving school marketplace blog.

Article ID: {article_id}
Title EN: {title_en}
Title EL: {title_el}
Target keyword: {keyword}
Topic cluster: {cluster}
Excerpt EN: {excerpt_en}
Excerpt EL: {excerpt_el}

Output a single JSON object (no markdown fences, no explanation):

{{
  "topic_el": "<one-sentence Greek description of the article topic>",
  "topic_en": "<one-sentence English description of the article topic>",
  "audience_el": "<who the Greek reader is and what they need. End with: Στόχος: 2000+ λέξεις εκτός FAQ.>",
  "audience_en": "<who the English reader is and what they need>",
  "facts": ["<verified Cyprus-specific fact>", ... 10-12 total],
  "sections_el": ["<H2 heading 1 in Greek>", ... exactly 7 total],
  "sections_en": ["<H2 heading 1 in English>", ... exactly 7 total, parallel to Greek],
  "internal_links_el": [["/path", "anchor text in Greek"], ... pick 5-6 most relevant],
  "internal_links_en": [["/path", "anchor text in English"], ... pick 5-6 most relevant],
  "answer_el": "<2-3 sentence direct answer in simple Greek, no em-dashes>",
  "answer_en": "<2-3 sentence direct answer in plain English, no em-dashes>",
  "widget_id": "<exactly one id from the WIDGET OPTIONS list below, chosen by topical fit>",
  "infographic_data": {{
    "template": "<exactly one of: flow, compare, versus, checklist, timeline - see TEMPLATE GUIDE below>",
    "title_el": "<short Greek infographic title>",
    "title_en": "<short English infographic title>",
    "caption_el": "<one-sentence Greek caption>",
    "caption_en": "<one-sentence English caption>",
    "... PLUS exactly one of the shape-specific blocks below, matching your chosen template. Do not include fields from a different template."
  }},
  "inline_image_queries": ["<Pexels query 1>", "<Pexels query 2>"]
}}

WIDGET OPTIONS (pick exactly one id for "widget_id", matched by topical fit):
- price-calculator: cost/fees estimate via lesson count and price sliders
- uk-licence-checker: UK licence eligibility/test branching
- eu-exchange-checker: EU licence exchange eligibility branching
- foreigner-path-checker: which foreigner process applies
- test-readiness-checker: theory/practical test readiness self-check
- renewal-checker: renewal age/category branching

TEMPLATE GUIDE (choose the ONE that best fits this article's core content, then output ONLY that template's fields inside "infographic_data" alongside template/title/caption):

1. "flow" - a sequential process with ordered steps (e.g. application steps, exam stages). Add:
  "items": [
    {{"num": "1", "title_el": ["line 1", "line 2 optional"], "title_en": [...], "sub_el": [...], "sub_en": [...]}},
    "... exactly 4 items, num values 1 through 4, in order"
  ]

2. "compare" - 3 parallel categories or paths the reader might fall into, not sequential. Add:
  "cards": [
    {{"accent": "<hex color, pick a distinct one per card from #22c55e, #f59e0b, #354354, #4b5d70, #7a8794>", "heading_el": ["line 1", "line 2 optional"], "heading_en": [...], "body_el": [["line 1"], ["line 1", "line 2 optional"]], "body_en": [[...], [...]]}},
    "... exactly 3 cards. body_el/body_en are each an array of 1-2 short bullet groups, each bullet group is itself an array of 1-2 short lines"
  ]

3. "versus" - exactly two contrasting options, a before/after, or a hand-over/receive scenario. Add:
  "left": {{"heading_el": "short label", "heading_en": "short label", "sub_el": ["line 1", "line 2 optional"], "sub_en": [...]}},
  "right": {{"heading_el": "short label", "heading_en": "short label", "sub_el": [...], "sub_en": [...]}}

4. "checklist" - a list of required items, documents, or conditions, not sequential, not comparative. Add:
  "items": [
    {{"icon": "<single emoji>", "label_el": "short label", "label_en": "short label", "sub_el": "one short line", "sub_en": "one short line"}},
    "... 4 to 5 items"
  ]

5. "timeline" - a chronological sequence of milestones or validity periods over time. Add:
  "milestones": [
    {{"label_el": "2-4 words", "label_en": "2-4 words", "sub_el": "2-5 words", "sub_en": "2-5 words"}},
    "... 4 to 5 milestones, in chronological order. Keep these VERY short, they render on one line each"
  ]

RULES:
- facts: true facts about the Republic of Cyprus only. No invented numbers or fees. \
Say "check with the Department of Road Transport (ΤΟΜ)" when fees/rules may change.
- sections: 7 headings each, phrased as questions where natural. Parallel across languages.
- internal_links_el pool (pick 5-6 most relevant to this article):
{pool_el_text}
- internal_links_en pool (pick 5-6 most relevant to this article):
{pool_en_text}
- answers: 2-3 sentences. No em-dashes. Plain language.
- widget_id: never leave this blank. Choose the single best topical match from the \
WIDGET OPTIONS list above. If genuinely nothing fits well, default to "price-calculator".
- infographic_data: pick the template whose shape genuinely fits this article's content \
best, not the same template every time. Use only facts already present in the "facts" \
array above. Do not invent new figures, numbers, or claims that are not already stated \
elsewhere in this JSON.
- inline_image_queries: natural Pexels queries that return photos relevant to this article.
"""

    try:
        raw = _call_anthropic(
            client=client,
            model=DEFAULT_MODEL,
            system_prompt=(
                "You are a content strategist for a Cyprus driving school marketplace. "
                "Output only valid JSON, nothing else."
            ),
            user_prompt=prompt,
        )
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        data = _json.loads(raw)
    except Exception as exc:
        log.error("generate_blog.auto_spec_failed", id=article_id, error=str(exc))
        return None

    try:
        infographic_payload = _build_infographic_payload(data["infographic_data"])
        spec = ArticleSpec(
            id=article_id,
            topic_el=data["topic_el"],
            topic_en=data["topic_en"],
            title_el=title_el,
            title_en=title_en,
            audience_el=data["audience_el"],
            audience_en=data["audience_en"],
            facts=tuple(data["facts"]),
            sections_el=tuple(data["sections_el"]),
            sections_en=tuple(data["sections_en"]),
            internal_links_el=tuple(tuple(p) for p in data["internal_links_el"]),
            internal_links_en=tuple(tuple(p) for p in data["internal_links_en"]),
            answer_el=data.get("answer_el", ""),
            answer_en=data.get("answer_en", ""),
            # widget_id must never be blank; the prompt instructs the model to
            # default to "price-calculator" when nothing else fits.
            widget_id=data["widget_id"],
            # infographic_type stays "auto" for auto-drafted articles: the real
            # per-locale content lives in the {article_id}_infographic.json
            # sidecar below, since infographic_type must otherwise be unique
            # per bespoke component.
            infographic_type="auto",
            inline_image_queries=tuple(data.get("inline_image_queries", [])),
        )
    except (KeyError, TypeError) as exc:
        log.error("generate_blog.auto_spec_parse_failed", id=article_id, error=str(exc))
        return None

    # Write sidecar so publish_next can fetch inline images without spec being in ARTICLES.
    BLOG_DIR.mkdir(parents=True, exist_ok=True)
    sidecar = BLOG_DIR / f"{article_id}_auto_spec.json"
    sidecar.write_text(
        _json.dumps({"inline_image_queries": list(spec.inline_image_queries)}, ensure_ascii=False),
        encoding="utf-8",
    )

    # Write the infographic sidecar (separate from the _auto_spec.json sidecar
    # above) so the generic "auto" infographic renderer has per-locale content.
    infographic_sidecar = BLOG_DIR / f"{article_id}_infographic.json"
    infographic_sidecar.write_text(
        _json.dumps(infographic_payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    log.info("generate_blog.auto_spec_ok", id=article_id)
    return spec


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
- Καμία παύλα em πουθενά. Ποτέ. Χρησιμοποίησε παύλα (-), τελείες ή κόμματα.
- Καμία H3. Μόνο H2 (## ) για τις ενότητες και ## Συχνές Ερωτήσεις για το FAQ.
- Αν ο τίτλος ενότητας είναι διατυπωμένος ως ερώτηση, πρέπει να τελειώνει με ερωτηματικό - ακόμα κι αν ο τίτλος που σου δίνεται δεν το έχει ήδη. Μην βάζεις ερωτηματικό σε επικεφαλίδες που δεν είναι ερωτήσεις.

ΕΙΚΟΝΕΣ
- Όταν οι οδηγίες σου δίνουν ΕΙΚΟΝΕΣ (IMAGES), ενσωμάτωσε κάθε μία στο σώμα
  αμέσως μετά την H2 ενότητα που ταιριάζει καλύτερα. Χρησιμοποίησε αυτή ακριβώς
  τη μορφή (τίποτα άλλο):
  ![Περιγραφικό alt text](path)
  *Λεζάντα μιας πρότασης, via Pexels.com*
- Alt text: περιέγραψε πρώτα τι φαίνεται στην εικόνα (πρόσωπο, αντικείμενο,
  σκηνή), μετά πρόσθεσε μία-δύο λέξεις-κλειδιά. Κάτω από 125 χαρακτήρες.
- Λεζάντα: μία σύντομη πρόταση που περιγράφει τη σκηνή ή τη σχέση της με
  το άρθρο. Τελείωσε με την αναφορά που σου δίνεται.
- Καμία από αυτές τις λέξεις/φράσεις πουθενά: «επιπλέον», «επιπροσθέτως»,
  «αξίζει να σημειωθεί», «εν κατακλείδι», «δεν χρειάζεται να ειπωθεί»,
  «πλοηγηθείτε», «βυθιστείτε», «κρίσιμο», «εξασφαλίστε», «απρόσκοπτο»,
  «σε έναν κόσμο που αλλάζει συνεχώς». Για «επιπλέον χρέωση» πες «έξτρα χρέωση»
  ή «πρόσθετη χρέωση». Για «επίσης» χρησιμοποίησε «και» ή «ακόμα».
- Μην εφεύρεις γεγονότα. Μην βάλεις ακριβείς τιμές ή ποσά αν δεν σου δίνονται.
  Πες κάτι όπως «δείτε την τρέχουσα τιμή στο Τμήμα Οδικών Μεταφορών».

ΛΙΣΤΕΣ
- Χρησιμοποίησε bullet lists ή αριθμημένες λίστες ΠΑΝΤΑ στις παρακάτω
  περιπτώσεις: λίστες εγγράφων που χρειάζεται ο αναγνώστης, βήματα
  διαδικασίας (π.χ. πώς πάρεις εκπαιδευτική άδεια, τι ελέγχει η πρακτική),
  σύνολα 3+ παράλληλων key facts, πρακτικές συμβουλές στο τέλος. Αν μπορείς
  να αριθμήσεις 3+ στοιχεία σε μία φράση, βάλε τα σε λίστα.
- Στόχος: τουλάχιστον 5 ξεχωριστές λίστες στο κείμενο εκτός FAQ.
- Η αφήγηση και η ανάλυση παραμένουν σε πρόζα.

ΑΚΡΙΒΕΙΑ
- Όλα τα γεγονότα πρέπει να ισχύουν για την Κυπριακή Δημοκρατία.
- Όχι Βόρεια Κύπρος. Όχι Γερμανία ή άλλες χώρες εκτός όταν συγκρίνεις.
- Χρησιμοποίησε μόνο τα γεγονότα που σου δίνονται. Αν δεν σου δόθηκε ένας
  αριθμός ή ένα κανονιστικό όριο, μην τον επινοήσεις.

ΑΠΑΝΤΗΣΗ ΠΡΩΤΑ (ANSWER-FIRST)
- Η ΠΡΩΤΗ παράγραφος του άρθρου πρέπει να είναι μια άμεση απάντηση 2-3 προτάσεων
  στο κεντρικό ερώτημα του άρθρου. Γράψτη ΠΡΙΝ από οποιαδήποτε επικεφαλίδα.
- Αυτή η παράγραφος δεν επαναλαμβάνει τον τίτλο H1 και δεν είναι η meta description.
  Είναι μια πρακτική απάντηση που δίνει αμέσως αξία στον αναγνώστη.
- Αν σου δοθεί ΑΠΑΝΤΗΣΗ στις οδηγίες, αντέγραψέ την ακριβώς ως πρώτη παράγραφο.
  Αν δεν σου δοθεί, γράψε τη δική σου.

ΔΟΜΗ
- Καθαρό Markdown. Όχι front-matter, όχι H1. Η σελίδα δίνει δικό της H1.
- ΠΡΩΤΑ: η παράγραφος ΑΠΑΝΤΗΣΗ (βλ. παραπάνω). 2-3 προτάσεις. Χωρίς επικεφαλίδα.
  Η σελίδα ανεβάζει αυτή την παράγραφο και την εμφανίζει ΠΑΝΩ από την εικόνα hero.
- ΔΕΥΤΕΡΟ: Πίνακας Περιεχομένων - απλή λίστα bullet με anchor link σε κάθε H2.
  Κάθε στοιχείο: - [Τίτλος ενότητας](#slug)
  Slug = ο τίτλος πεζά, τα κενά γίνονται παύλες (-), αφαιρούνται απόστροφοι και
  κάθε χαρακτήρας που δεν είναι γράμμα (ελληνικό ή λατινικό), ψηφίο ή παύλα.
  Χωρίς επικεφαλίδα πάνω από τη λίστα. Μόνο τα bullets.
  Η σελίδα ανεβάζει αυτή τη λίστα ΠΑΝΩ από την εικόνα hero, κάτω από την απάντηση.
- Μετά εισαγωγική παράγραφος χωρίς επικεφαλίδα. 3 με 5 προτάσεις, περίπου 90 λέξεις.
  Εδώ αρχίζει το σώμα κάτω από την εικόνα hero.
- Μετά, ΑΚΡΙΒΩΣ 8 ενότητες σε H2. ΚΑΘΕ ενότητα ΠΡΕΠΕΙ να έχει 250 με 350 λέξεις.
  Χρησιμοποίησε πρόζα ή λίστες ανάλογα με το τι εξυπηρετεί το περιεχόμενο.
- Τελική παράγραφος χωρίς επικεφαλίδα, περίπου 80 λέξεις. Συνοψίζει χωρίς
  να λέει «εν κατακλείδι» ή κάτι παρόμοιο.
- ΤΕΛΕΥΤΑΙΟ: ενότητα ## Συχνές Ερωτήσεις με ΑΚΡΙΒΩΣ 5 ερωτήσεις-απαντήσεις.
- Τυχόν tokens INFOGRAPHIC, WIDGET ή VIDEO (αν δίνονται στις οδηγίες) μπαίνουν
  inline μέσα στο σώμα, αμέσως μετά την H2 ενότητα στην οποία ταιριάζουν καλύτερα.
  Κάθε ερώτηση γράφεται έτσι (ΑΚΡΙΒΩΣ αυτή η μορφή, καμία παραλλαγή):
  **Ερώτηση σε μία πρόταση;**
  Απάντηση σε 2-4 προτάσεις πρόζας. Χωρίς bullet στις απαντήσεις.
- ΣΥΝΟΛΟ: 2300 ΛΕΞΕΙΣ ΕΛΑΧΙΣΤΟ χωρίς το FAQ. Με το FAQ τουλάχιστον 2500.

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
- Never use em dashes. Use a regular hyphen (-) or rewrite the sentence instead.
- No H3. Only H2 (## ) for section headings and ## FAQ for the FAQ section.
- If a section heading is phrased as a question, it must end with a question mark (even if the section title provided to you does not already include one). Do not add question marks to headings that are not questions.
- None of these phrases: "furthermore", "moreover", "it is worth noting",
  "in conclusion", "it goes without saying", "it is important to note",
  "navigating", "delve", "crucial", "ensure", "seamless",
  "in today's fast-paced world", "rest assured".
- Do not invent facts. Do not state exact prices or fees if you were not
  given them. Say "check current fees with the Department of Road Transport".

IMAGES
- When IMAGES are provided in the instructions, embed each one in the article
  body at the most natural position, right after the H2 section it best
  illustrates. Use this exact two-line format (nothing else):
  ![Descriptive alt text](path)
  *Caption sentence, via Pexels.com*
- Alt text: describe what is actually visible in the image first (person,
  object, scene), then lightly sprinkle one or two relevant keywords.
  Under 125 characters. No keyword stuffing.
- Caption: one short sentence describing the scene or its relevance to the
  article. End with the attribution already provided.

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

ANSWER FIRST
- The VERY FIRST paragraph of the article must be a direct 2-3 sentence answer
  to the core question of the article. Write it BEFORE any heading.
- This paragraph does not restate the H1 title and is not the meta description.
  It gives the reader immediate practical value.
- If an ANSWER is supplied in the instructions, copy it verbatim as the first
  paragraph. If none is supplied, write your own.

STRUCTURE
- Plain Markdown. No front-matter. No H1. The page renders its own H1.
- FIRST: the ANSWER paragraph (see above). 2-3 sentences. No heading.
  The page template lifts this paragraph and renders it ABOVE the hero image.
- SECOND: Table of Contents - a bullet list with anchor links to every H2 section.
  Each item: - [Section title](#section-title-slug)
  Slug = section title lowercased, spaces become hyphens, remove apostrophes and all
  characters that are not letters, digits, or hyphens.
  No heading above the list. Just the bullets.
  The page template lifts this list and renders it ABOVE the hero image, below the summary.
- Then an intro paragraph with no heading. 2 to 4 sentences. Hook the reader.
  This is where the body starts below the hero image.
- Then 6 to 8 sections in H2. Each section 200 to 300 words. Use prose or
  lists depending on what the content calls for.
- A closing paragraph with no heading, about 80 words. Wraps up without
  saying "in conclusion".
- LAST: a ## FAQ section with EXACTLY 5 questions and answers specific to
  this article. Each Q/A must follow this exact format (no variations):
  **Question in one sentence?**
  Answer in 2-4 sentences of prose. No bullets inside answers.
- INFOGRAPHIC, WIDGET, and VIDEO tokens (if given in the instructions) go inline
  inside the body at the most relevant H2 section (not after the closing paragraph).
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

    answer = article.answer_el if locale == "el" else article.answer_en
    answer_block = f"\nANSWER (copy this verbatim as your first paragraph):\n{answer}" if answer else ""

    # Build inline-images block: read Pexels sidecar if available.
    images_block = ""
    if article.inline_image_queries:
        import json as _json
        lines = []
        for n, query in enumerate(article.inline_image_queries, 1):
            img_path = f"/blog/{article.id}/inline-{n}.jpg"
            sidecar = PROJECT_ROOT / "public" / "blog" / article.id / f"inline-{n}.json"
            if sidecar.exists():
                meta = _json.loads(sidecar.read_text())
                photographer = meta.get("photographer", "")
                attribution = f"Photo by {photographer} via Pexels.com" if photographer else "via Pexels.com"
            else:
                attribution = "via Pexels.com"
            lines.append(
                f'- inline-{n}: path `{img_path}`, subject: "{query}", '
                f'attribution: "{attribution}"'
            )
        images_text = "\n".join(lines)
        images_block = (
            "\nIMAGES: Embed each inline image right after the most relevant H2 "
            "section. Two-line format only: first the ![alt](path), then the "
            "*caption, attribution* line. Do not wrap in a list.\n"
            + images_text
        )

    infographic_block = (
        f"\nINFOGRAPHIC: Place the token {{{{infographic:{article.infographic_type}}}}} "
        "inline in the article body, on its own line between two blank lines, "
        "immediately after whichever H2 section it best illustrates visually. "
        "Do not place it inside a list or inside a sentence."
    ) if article.infographic_type else ""

    widget_block = (
        f"\nWIDGET: Place the token {{{{widget:{article.widget_id}}}}} "
        "inline in the article body, on its own line between two blank lines, "
        "immediately after the H2 section most relevant to it. "
        "Do not place it inside a list or inside a sentence."
    ) if article.widget_id else ""

    video_block = (
        f"\nVIDEO: Place the token {{{{video:{article.youtube_id}}}}} "
        "inline in the article body, on its own line between two blank lines, "
        "at the most natural position, typically after the section it illustrates."
    ) if article.youtube_id else ""

    # EL reminder: model consistently underestimates Greek word count, so add
    # an explicit check-before-submitting note to push sections to 280-350 words.
    word_count_reminder = (
        "\n\nΕΛΕΓΧΟΣ ΠΡΙΝ ΤΕΛΕΙΩΣΕΙΣ: Κάθε ενότητα πρέπει να έχει 280-350 λέξεις. "
        "Αν κάποια ενότητα έχει λιγότερες από 280 λέξεις, γράψε περισσότερο πριν συνεχίσεις "
        "στην επόμενη. Σύνολο εκτός FAQ: 2300+ λέξεις."
    ) if locale == "el" else ""

    return f"""\
{intro_label}

Title (for reference, do not output an H1): {title}
{answer_block}
{header_label}:
{sections_block}

{facts_label}:
{facts_block}

{links_label}:
{links_block}
{images_block}{infographic_block}{widget_block}{video_block}{word_count_reminder}
Now write the article body. Markdown only. No H1.
"""


# ----------------------------------------------------------------------- runner


def main(argv: list[str] | None = None) -> int:
    if DOTENV_PATH.exists():
        load_dotenv(DOTENV_PATH, override=False)
    args = _parse_args(argv)

    articles = list(ARTICLES)
    auto_spec_data: dict | None = None
    if args.article_id:
        articles = [a for a in articles if a.id == args.article_id]
        if not articles:
            if args.article_json:
                try:
                    auto_spec_data = _json.loads(args.article_json)
                except Exception:
                    log.error("generate_blog.bad_article_json", id=args.article_id)
                    return 1
            else:
                log.error("generate_blog.no_article", id=args.article_id)
                return 1

    locales: tuple[Locale, ...] = (args.locale,) if args.locale else LOCALES
    BLOG_DIR.mkdir(parents=True, exist_ok=True)

    client = _make_client()

    if auto_spec_data is not None:
        spec = auto_generate_spec(args.article_id, auto_spec_data, client)
        if spec is None:
            return 1
        articles = [spec]

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
        # Long-form: 2000+ words. Greek Unicode characters tokenize at ~2-3x
        # the rate of Latin text, so Greek articles need significantly more
        # headroom than English ones.
        max_tokens=12000,
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
    md = md.replace("—", " - ")  # em-dash → spaced hyphen
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
    p.add_argument(
        "--article-json", default=None,
        help="Full queue article JSON; used to auto-generate a missing spec on the fly",
    )
    return p.parse_args(argv)


if __name__ == "__main__":
    raise SystemExit(main())
