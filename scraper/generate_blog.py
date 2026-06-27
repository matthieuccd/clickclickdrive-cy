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
    # The model places {{widget:<widget_id>}} at a sensible point in the body.
    #
    # CHECKLIST — only set widget_id when an interactive tool genuinely adds
    # value for the reader. Ask: "would a real person use this to make a
    # decision, calculate something, or self-assess?" If no, leave it empty.
    #
    # Available widgets and when to use them:
    #   "price-calculator"  → articles about cost/fees (lesson prices, total
    #                         licence cost). DO NOT use on rule/law articles.
    #   "theory-quiz"       → theory test prep articles. Self-assessment only.
    #   "time-estimator"    → timeline articles ("how long does it take?").
    #                         Only when the answer depends on user variables.
    #
    # Default: "" (no widget). Most articles should NOT have a widget.
    widget_id: str = ""
    # Infographic type for the inline SVG. Empty = no infographic.
    infographic_type: str = ""
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
            "Τι χρειάζεστε για να ξεκινήσετε",
            "Η εκπαιδευτική άδεια: το πρώτο βήμα",
            "Τα μαθήματα οδήγησης",
            "Η θεωρητική εξέταση",
            "Η πρακτική εξέταση",
            "Μετά το δίπλωμα: τι πρέπει να ξέρετε",
        ),
        sections_en=(
            "What you need before you start",
            "The learner's licence: your first step",
            "Your driving lessons",
            "The theory test",
            "The practical test",
            "After you pass: what you need to know",
        ),
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
            "Τα επίσημα τέλη του Τμήματος Οδικών Μεταφορών",
            "Κόστος μαθημάτων οδήγησης",
            "Ιατρικό πιστοποιητικό και μεταφράσεις",
            "Πόσο πληρώνετε αν αποτύχετε",
            "Κόστος για πολίτες ΕΕ",
            "Κόστος για πολίτες εκτός ΕΕ",
            "Πώς να μειώσετε το κόστος",
        ),
        sections_en=(
            "The Department of Road Transport official fees",
            "Driving lesson costs",
            "Medical certificate and translation costs",
            "What a failed test costs you",
            "Cost for EU citizens",
            "Cost for non-EU nationals",
            "How to keep your total costs down",
        ),
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
            "Τι άλλαξε μετά το Brexit",
            "Ισχύει η βρετανική άδεια στην Κύπρο σήμερα",
            "Διμερείς συμφωνίες Κύπρου και Ηνωμένου Βασιλείου",
            "Τα έγγραφα που χρειάζεστε",
            "Πρέπει να κάνετε εξετάσεις",
            "Το πλεονέκτημα της αριστερής οδήγησης",
            "Βήμα προς βήμα για Βρετανούς οδηγούς",
        ),
        sections_en=(
            "What Brexit changed for UK licence holders in Cyprus",
            "Is your UK licence currently valid in Cyprus",
            "The bilateral agreement between Cyprus and the UK",
            "Documents UK drivers need to bring",
            "Do you need to sit a test",
            "The left-hand advantage UK drivers already have",
            "Step by step for UK citizens in Cyprus",
        ),
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
            "Μπορείτε να οδηγείτε με ευρωπαϊκή άδεια στην Κύπρο",
            "Γιατί οι περισσότεροι κάτοικοι ΕΕ επιλέγουν ανταλλαγή",
            "Η διαδικασία ανταλλαγής βήμα προς βήμα",
            "Τα έγγραφα για την ανταλλαγή",
            "Τι γίνεται με την παλιά σας άδεια",
            "Η προθεσμία και τι συμβαίνει αν τη χάσετε",
            "Ανταλλαγή αν η άδεια ΕΕ έχει λήξει",
        ),
        sections_en=(
            "Can you drive in Cyprus on an EU licence",
            "Why most EU residents choose to exchange",
            "The exchange process step by step",
            "Documents you need to bring",
            "What happens to your original EU licence",
            "The deadline and what happens if you miss it",
            "Exchanging when your EU licence has expired",
        ),
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
            "Τι είναι η κατηγορία Β",
            "Ηλικία και βασικές προϋποθέσεις",
            "Η εκπαιδευτική άδεια κατηγορίας Β",
            "Τα μαθήματα: τι καλύπτουν",
            "Η θεωρητική εξέταση κατηγορίας Β",
            "Η πρακτική εξέταση κατηγορίας Β",
            "Ρυμούλκηση με κατηγορία Β στην Κύπρο",
            "Ισχύς και ανανέωση",
        ),
        sections_en=(
            "What Category B covers",
            "The minimum age and requirements",
            "The learner's licence for Category B",
            "Your lessons: what they cover",
            "The Category B theory test",
            "The Category B practical test",
            "Towing with a Category B licence in Cyprus",
            "Validity and renewal of your Cyprus Category B licence",
        ),
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
            "Πώς λειτουργεί το σύστημα διπλωμάτων στην Κύπρο",
            "Ποιος δικαιούται και ποια είναι η ελάχιστη ηλικία",
            "Η εκπαιδευτική άδεια: το πρώτο επίσημο βήμα",
            "Τα μαθήματα οδήγησης: τι να περιμένετε",
            "Η θεωρητική εξέταση: τι καλύπτει και πώς να περάσετε",
            "Η πρακτική εξέταση: τι γίνεται την ημέρα",
            "Κατηγορίες αδειών, ισχύς και ανανέωση",
            "Αν έχετε ήδη ξένη άδεια οδήγησης",
        ),
        sections_en=(
            "How the Cyprus driving licence system works",
            "Who can apply and the minimum age",
            "The learner's licence: your first official step",
            "Driving lessons: what to expect",
            "The theory test: what it covers and how to pass",
            "The practical test: what happens on the day",
            "Licence categories, validity, and renewal",
            "If you already hold a foreign driving licence",
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
        infographic_type="licence-steps",
        inline_image_queries=(
            "driving instructor lesson student car cyprus",
            "computer theory test driving exam screen",
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
- Καμία παύλα em πουθενά. Ποτέ. Χρησιμοποίησε παύλα (-), τελείες ή κόμματα.
- Καμία H3. Μόνο H2 (## ) για τις ενότητες και ## Συχνές Ερωτήσεις για το FAQ.
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
- Πρώτα η παράγραφος ΑΠΑΝΤΗΣΗ (βλ. παραπάνω).
- Μετά εισαγωγική παράγραφος χωρίς επικεφαλίδα. 3 με 5 προτάσεις, περίπου 90 λέξεις.
- Μετά, ΑΚΡΙΒΩΣ 8 ενότητες σε H2. ΚΑΘΕ ενότητα ΠΡΕΠΕΙ να έχει 250 με 350 λέξεις.
  Χρησιμοποίησε πρόζα ή λίστες ανάλογα με το τι εξυπηρετεί το περιεχόμενο.
- Τελική παράγραφος χωρίς επικεφαλίδα, περίπου 80 λέξεις. Συνοψίζει χωρίς
  να λέει «εν κατακλείδι» ή κάτι παρόμοιο.
- ΤΕΛΕΥΤΑΙΟ: ενότητα ## Συχνές Ερωτήσεις με ΑΚΡΙΒΩΣ 5 ερωτήσεις-απαντήσεις.
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

ANSWER FIRST
- The VERY FIRST paragraph of the article must be a direct 2-3 sentence answer
  to the core question of the article. Write it BEFORE any heading.
- This paragraph does not restate the H1 title and is not the meta description.
  It gives the reader immediate practical value.
- If an ANSWER is supplied in the instructions, copy it verbatim as the first
  paragraph. If none is supplied, write your own.

STRUCTURE
- Plain Markdown. No front-matter. No H1. The page renders its own H1.
- First: the ANSWER paragraph (see above).
- Then an intro paragraph with no heading. 2 to 4 sentences. Hook the reader.
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

    answer = article.answer_el if locale == "el" else article.answer_en
    answer_block = f"\nANSWER (copy this verbatim as your first paragraph):\n{answer}" if answer else ""

    widget_block = (
        f"\nWIDGET: Place the token {{{{widget:{article.widget_id}}}}} once in the "
        "article body at a natural break (after a relevant section, not inside a list)."
    ) if article.widget_id else ""

    infographic_block = (
        f"\nINFOGRAPHIC: Place the token {{{{infographic:{article.infographic_type}}}}} "
        "once in the article body, immediately after the first or second H2 section."
    ) if article.infographic_type else ""

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
{widget_block}{infographic_block}{word_count_reminder}
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
    return p.parse_args(argv)


if __name__ == "__main__":
    raise SystemExit(main())
