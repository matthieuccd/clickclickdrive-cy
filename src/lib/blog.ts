import fs from "node:fs";
import path from "node:path";

import type { AutoInfographicData, CyprusCity, Locale } from "./types";

/**
 * Blog data layer. The article *body* is Markdown produced by the Python
 * pipeline (scraper/generate_blog.py) and lives in scraper/data/blog/.
 * Everything else (title, slug, category, hero image, publish dates, related
 * city) is metadata declared here so the routes can render without the body
 * file existing yet.
 */

export interface BlogCategory {
  id: string;
  slug_el: string;
  slug_en: string;
  title_el: string;
  title_en: string;
  description_el: string;
  description_en: string;
}

export interface ImageCredit {
  alt_en: string;
  alt_el: string;
  caption_en: string;
  caption_el: string;
}

export interface BlogArticle {
  id: string;
  slug_el: string;
  slug_en: string;
  categoryId: BlogCategory["id"];
  title_el: string;
  title_en: string;
  excerpt_el: string;
  excerpt_en: string;
  metaDescription_el: string;
  metaDescription_en: string;
  heroImagePath: string;
  heroImageAlt_el: string;
  heroImageAlt_en: string;
  heroCaption_en: string;
  heroCaption_el: string;
  /** Per supplementary image metadata, keyed by filename without extension: "image2", "inline-1", "inline-2" */
  imageCredits?: Record<string, ImageCredit>;
  publishedDate: string;
  modifiedDate: string;
  author: string;
  authorSlug: string;
  relatedCity: CyprusCity | null;
  relatedSlugs: string[];
}

export const BLOG_CATEGORIES: readonly BlogCategory[] = [
  {
    id: "foreigners",
    slug_el: "ksenoi-odigoi",
    slug_en: "foreign-drivers",
    title_el: "Ξένοι οδηγοί",
    title_en: "Foreign drivers",
    description_el:
      "Οδηγοί από άλλες χώρες που μένουν στην Κύπρο. Άδειες, μεταφορές, αναγνώριση.",
    description_en:
      "Drivers from other countries who live in Cyprus. Licences, transfers, recognition.",
  },
  {
    id: "theory",
    slug_el: "theoria",
    slug_en: "theory-test",
    title_el: "Θεωρητική εξέταση",
    title_en: "Theory test",
    description_el: "Πώς να ετοιμαστείτε για τη θεωρητική εξέταση οδήγησης.",
    description_en: "How to prepare for the driving theory test.",
  },
  {
    id: "practical",
    slug_el: "praktiki",
    slug_en: "practical-test",
    title_el: "Πρακτική εξέταση",
    title_en: "Practical test",
    description_el: "Τι περιμένει τους υποψήφιους στην πρακτική εξέταση.",
    description_en: "What candidates can expect on the practical test.",
  },
  {
    id: "costs",
    slug_el: "kostos",
    slug_en: "costs",
    title_el: "Κόστος και χρόνοι",
    title_en: "Cost and timing",
    description_el: "Πόσο κοστίζει το δίπλωμα και πόσο διαρκεί η διαδικασία.",
    description_en: "How much a licence costs and how long the process takes.",
  },
  {
    id: "rules",
    slug_el: "kanonismoi",
    slug_en: "rules",
    title_el: "Κανόνες δρόμου",
    title_en: "Road rules",
    description_el: "Οι κανονισμοί του δρόμου στην Κύπρο.",
    description_en: "Cyprus road rules and regulations.",
  },
] as const;

/**
 * Authored article registry. Add a new entry for each piece. The body file
 * lives at scraper/data/blog/{id}_{locale}.md.
 */
export const BLOG_ARTICLES: readonly BlogArticle[] = [
  {
    id: "how-to-get-driving-licence-cyprus-foreigner",
    slug_el: "diploma-odigisis-gia-ksenous-stin-kypro",
    slug_en: "how-to-get-driving-licence-cyprus-foreigner",
    categoryId: "foreigners",
    title_el: "Πώς να βγάλετε δίπλωμα οδήγησης στην Κύπρο ως ξένος",
    title_en: "How to get a driving licence in Cyprus as a foreigner",
    excerpt_el:
      "Οδηγός βήμα προς βήμα για ξένους που θέλουν να βγάλουν κυπριακό δίπλωμα. Έγγραφα, εξετάσεις, κόστος και χρόνοι.",
    excerpt_en:
      "A step by step guide for foreigners who want a Cypriot licence. Papers, tests, cost, and timing.",
    metaDescription_el:
      "Οδηγός για ξένους που θέλουν δίπλωμα οδήγησης στην Κύπρο. Έγγραφα, εξετάσεις, κόστος.",
    metaDescription_en:
      "Guide for foreigners who want a Cyprus driving licence. Papers, tests, and cost.",
    heroImagePath: "/blog/how-to-get-driving-licence-cyprus-foreigner/hero.jpg",
    heroImageAlt_en: "Driver's hands on a Volkswagen steering wheel at sunset, green fields visible through the windscreen",
    heroImageAlt_el: "Χέρια οδηγού στο τιμόνι Volkswagen στο ηλιοβασίλεμα με πράσινα χωράφια μπροστά",
    heroCaption_en: "Hands on steering wheel, via Pexels.com",
    heroCaption_el: "Χέρια στο τιμόνι, via Pexels.com",
    imageCredits: {
      "image2": {
        alt_en: "Three Polish EU passports spread out alongside airline boarding passes on a grey fabric surface",
        alt_el: "Τρία πολωνικά διαβατήρια ΕΕ απλωμένα μαζί με κάρτες επιβίβασης αεροπλάνου σε γκρι ύφασμα",
        caption_en: "EU passports and boarding passes, via Pexels.com",
        caption_el: "Διαβατήρια ΕΕ με κάρτες επιβίβασης, via Pexels.com",
      },
    },
    publishedDate: "2026-06-08",
    modifiedDate: "2026-06-08",
    author: "Matthieu Tissot",
    authorSlug: "matthieu",
    relatedCity: "Nicosia",
    relatedSlugs: [
      "exchange-eu-licence-cyprus",
      "uk-licence-cyprus-after-brexit",
      "how-to-get-driving-licence-cyprus-step-by-step",
    ],
  },
  {
    id: "pws-na-vgaleis-diploma-odigisis-stin-kypro",
    slug_el: "pws-na-vgaleis-diploma-odigisis-stin-kypro",
    slug_en: "how-to-get-driving-licence-cyprus-step-by-step",
    categoryId: "foreigners",
    title_el: "Πώς να βγάλεις δίπλωμα οδήγησης στην Κύπρο",
    title_en: "How to Get a Driving Licence in Cyprus - Step by Step",
    excerpt_el:
      "Ολοκληρωμένος οδηγός για το δίπλωμα οδήγησης στην Κύπρο. Από την εκπαιδευτική άδεια ως την πρακτική εξέταση, βήμα προς βήμα.",
    excerpt_en:
      "The complete guide to getting a driving licence in Cyprus. From the learner's licence to the practical test, step by step.",
    metaDescription_el:
      "Πώς να βγάλεις δίπλωμα οδήγησης στην Κύπρο βήμα προς βήμα. Εκπαιδευτική άδεια, θεωρητική και πρακτική εξέταση.",
    metaDescription_en:
      "How to get a driving licence in Cyprus step by step. Learner's licence, theory test, and practical test explained.",
    heroImagePath: "/blog/pws-na-vgaleis-diploma-odigisis-stin-kypro/hero.jpg",
    heroImageAlt_en: "An adult man and a young child sitting together in the driver's seat of a car, viewed through the side window",
    heroImageAlt_el: "Ενήλικας και παιδί καθισμένοι μαζί στη θέση οδηγού αυτοκινήτου, φωτογραφία μέσα από το παράθυρο",
    heroCaption_en: "Adult and child in car, via Pexels.com",
    heroCaption_el: "Ενήλικας και παιδί σε αυτοκίνητο, via Pexels.com",
    imageCredits: {
      "image2": {
        alt_en: "A 50 km/h speed limit sign stacked above a 2 KM distance marker against a clear blue sky",
        alt_el: "Πινακίδα ορίου ταχύτητας 50 χλμ/ώρα με πινακίδα απόστασης 2 ΧΛΜ κάτω, σε καθαρό μπλε ουρανό",
        caption_en: "Speed limit sign on road, via Pexels.com",
        caption_el: "Πινακίδα ορίου ταχύτητας, via Pexels.com",
      },
    },
    publishedDate: "2026-06-09",
    modifiedDate: "2026-06-09",
    author: "Matthieu Tissot",
    authorSlug: "matthieu",
    relatedCity: null,
    relatedSlugs: [
      "how-to-get-driving-licence-cyprus-foreigner",
      "exchange-eu-licence-cyprus",
      "driving-lesson-cost-cyprus",
    ],
  },
  {
    id: "poso-kostizei-ekpaideysi-odigisis-kypros",
    slug_el: "poso-kostizei-ekpaideysi-odigisis-kypros",
    slug_en: "driving-lesson-cost-cyprus",
    categoryId: "costs",
    title_el: "Πόσο κοστίζει η εκπαίδευση οδήγησης στην Κύπρο",
    title_en: "How Much Does Driving Education Cost in Cyprus",
    excerpt_el:
      "Μαθήματα, εξετάσεις και επίσημα τέλη. Όλα όσα κοστίζουν για να βγάλεις δίπλωμα στην Κύπρο.",
    excerpt_en:
      "Lessons, tests, and official fees. Everything that costs money when getting a driving licence in Cyprus.",
    metaDescription_el:
      "Κόστος εκπαίδευσης οδήγησης στην Κύπρο. Μαθήματα, εξετάσεις, ιατρικό πιστοποιητικό και επίσημα τέλη.",
    metaDescription_en:
      "Driving education costs in Cyprus. Lessons, tests, medical certificate, and official fees explained.",
    heroImagePath: "/blog/poso-kostizei-ekpaideysi-odigisis-kypros/hero.jpg",
    heroImageAlt_en: "Blue L-plates mounted on the roofs of two learner driver cars in a car park, with hedgerow behind",
    heroImageAlt_el: "Μπλε πινακίδες Λ τοποθετημένες στις στέγες δύο αυτοκινήτων εκπαιδευόμενων σε χώρο στάθμευσης",
    heroCaption_en: "L-plates on learner cars, via Pexels.com",
    heroCaption_el: "Πινακίδες Λ σε εκπαιδευτικά, via Pexels.com",
    imageCredits: {
      "image2": {
        alt_en: "US dollar bills fanned out on a surface alongside a black calculator and a car key remote",
        alt_el: "Αμερικανικά χαρτονομίσματα απλωμένα σε επιφάνεια δίπλα σε αριθμομηχανή και τηλεχειριστήριο αυτοκινήτου",
        caption_en: "Cash, calculator, and car key, via Pexels.com",
        caption_el: "Χαρτονομίσματα και κλειδί αυτοκινήτου, via Pexels.com",
      },
    },
    publishedDate: "2026-06-09",
    modifiedDate: "2026-06-09",
    author: "Matthieu Tissot",
    authorSlug: "matthieu",
    relatedCity: null,
    relatedSlugs: [
      "how-to-get-driving-licence-cyprus-step-by-step",
      "how-to-get-driving-licence-cyprus-foreigner",
      "category-b-driving-licence-cyprus",
    ],
  },
  {
    id: "diploma-odigisis-kypros-uk-citizens-meta-brexit",
    slug_el: "vretaniko-diploma-kypros",
    slug_en: "uk-licence-cyprus-after-brexit",
    categoryId: "foreigners",
    title_el: "Βρετανική άδεια οδήγησης στην Κύπρο μετά το Brexit",
    title_en: "Driving Licence in Cyprus for UK Citizens After Brexit",
    excerpt_el:
      "Τι ισχύει σήμερα για τους Βρετανούς στην Κύπρο. Έγγραφα, εξετάσεις και αν χρειάζεται ανταλλαγή άδειας.",
    excerpt_en:
      "What the rules are now for UK citizens in Cyprus. Documents, tests, and whether you need to exchange your licence.",
    metaDescription_el:
      "Βρετανική άδεια οδήγησης στην Κύπρο μετά το Brexit. Τι έγγραφα χρειάζεστε και αν πρέπει να κάνετε εξετάσεις.",
    metaDescription_en:
      "UK driving licence in Cyprus after Brexit. What documents you need and whether you must sit a test.",
    heroImagePath: "/blog/diploma-odigisis-kypros-uk-citizens-meta-brexit/hero.jpg",
    heroImageAlt_en: "A UK-registered Hyundai i10 stopped at a red traffic light at a roundabout, seen from behind through a car windscreen",
    heroImageAlt_el: "Αυτοκίνητο Hyundai i10 με βρετανικές πινακίδες σταματημένο σε κόκκινο φανάρι σε κυκλικό κόμβο, φωτογραφία από πίσω",
    heroCaption_en: "UK car at red light, via Pexels.com",
    heroCaption_el: "Βρετανικό αυτοκίνητο στο φανάρι, via Pexels.com",
    imageCredits: {
      "image2": {
        alt_en: "Aerial view of a busy British dual carriageway with left-hand traffic curving through a suburban landscape at dusk",
        alt_el: "Εναέρια άποψη πολυσύχναστης βρετανικής διπλής οδού με κυκλοφορία αριστερής πλευράς σε προαστιακό τοπίο",
        caption_en: "Aerial view of British motorway, via Pexels.com",
        caption_el: "Εναέρια άποψη βρετανικής οδού, via Pexels.com",
      },
    },
    publishedDate: "2026-06-09",
    modifiedDate: "2026-06-09",
    author: "Matthieu Tissot",
    authorSlug: "matthieu",
    relatedCity: null,
    relatedSlugs: [
      "how-to-get-driving-licence-cyprus-foreigner",
      "exchange-eu-licence-cyprus",
      "how-to-get-driving-licence-cyprus-step-by-step",
    ],
  },
  {
    id: "anallagi-adeias-ee-kypros",
    slug_el: "anallagi-adeias-ee-kypros",
    slug_en: "exchange-eu-licence-cyprus",
    categoryId: "foreigners",
    title_el: "Ανταλλαγή άδειας ΕΕ στην Κύπρο",
    title_en: "EU Driving Licence in Cyprus - Do You Need to Exchange It",
    excerpt_el:
      "Χρειάζεται να ανταλλάξετε την ευρωπαϊκή σας άδεια; Τι ισχύει, τι έγγραφα χρειάζεστε και ποια είναι η προθεσμία.",
    excerpt_en:
      "Do you need to swap your EU licence for a Cypriot one? What the rules are, what documents you need, and what the deadline is.",
    metaDescription_el:
      "Ανταλλαγή ευρωπαϊκής άδειας οδήγησης στην Κύπρο. Διαδικασία, έγγραφα, προθεσμία.",
    metaDescription_en:
      "EU driving licence exchange in Cyprus. Process, documents, and deadline explained.",
    heroImagePath: "/blog/anallagi-adeias-ee-kypros/hero.jpg",
    heroImageAlt_en: "Black and white photo of an office desk with a large stack of documents and a pen, keyboard and monitor in the background",
    heroImageAlt_el: "Ασπρόμαυρη φωτογραφία γραφείου με μεγάλη στοίβα εγγράφων και στυλό, πληκτρολόγιο και οθόνη στο βάθος",
    heroCaption_en: "Stack of documents on desk, via Pexels.com",
    heroCaption_el: "Στοίβα εγγράφων σε γραφείο, via Pexels.com",
    imageCredits: {
      "image2": {
        alt_en: "A hand holding an open passport filled with Cyrillic entry and exit stamps, held up in an airport",
        alt_el: "Χέρι που κρατά ανοιχτό διαβατήριο γεμάτο σφραγίδες εισόδου και εξόδου στα κυριλλικά, σε αεροδρόμιο",
        caption_en: "Passport with entry visa stamps, via Pexels.com",
        caption_el: "Διαβατήριο με σφραγίδες εισόδου, via Pexels.com",
      },
    },
    publishedDate: "2026-06-09",
    modifiedDate: "2026-06-09",
    author: "Matthieu Tissot",
    authorSlug: "matthieu",
    relatedCity: null,
    relatedSlugs: [
      "how-to-get-driving-licence-cyprus-foreigner",
      "uk-licence-cyprus-after-brexit",
      "how-to-get-driving-licence-cyprus-step-by-step",
    ],
  },
  {
    id: "katigoria-b-adeia-odigisis-kypros",
    slug_el: "katigoria-b-adeia-odigisis-kypros",
    slug_en: "category-b-driving-licence-cyprus",
    categoryId: "rules",
    title_el: "Κατηγορία Β άδεια οδήγησης στην Κύπρο",
    title_en: "Category B Driving Licence Cyprus - Everything You Need to Know",
    excerpt_el:
      "Τι καλύπτει η κατηγορία Β, πώς αποκτάται και τι επιτρέπει να οδηγείς στην Κύπρο.",
    excerpt_en:
      "What Category B covers, how to get it, and what it allows you to drive in Cyprus.",
    metaDescription_el:
      "Κατηγορία Β άδεια οδήγησης στην Κύπρο. Τι καλύπτει, εξετάσεις, ισχύς και ανανέωση.",
    metaDescription_en:
      "Category B driving licence in Cyprus. What it covers, tests required, validity and renewal.",
    heroImagePath: "/blog/katigoria-b-adeia-odigisis-kypros/hero.jpg",
    heroImageAlt_en: "View through a car windscreen following a blue sedan on a winding tree-lined road in bright sunshine, dried flowers on the dashboard",
    heroImageAlt_el: "Άποψη μέσα από παρμπρίζ που ακολουθεί μπλε σεντάν σε ελικτό δρόμο με δέντρα στον ήλιο, αποξηραμένα λουλούδια στο ταμπλό",
    heroCaption_en: "Car on a winding road, via Pexels.com",
    heroCaption_el: "Αυτοκίνητο σε ελικτό δρόμο, via Pexels.com",
    imageCredits: {
      "image2": {
        alt_en: "A grey car with yellow bonnet markings navigating between orange traffic cones on an outdoor driving test circuit",
        alt_el: "Γκρι αυτοκίνητο με κίτρινες σημάνσεις που κινείται ανάμεσα σε πορτοκαλί κώνους σε υπαίθριο κύκλωμα δοκιμαστικής οδήγησης",
        caption_en: "Car navigating test cones, via Pexels.com",
        caption_el: "Αυτοκίνητο ανάμεσα σε κώνους, via Pexels.com",
      },
    },
    publishedDate: "2026-06-09",
    modifiedDate: "2026-06-09",
    author: "Matthieu Tissot",
    authorSlug: "matthieu",
    relatedCity: null,
    relatedSlugs: [
      "how-to-get-driving-licence-cyprus-step-by-step",
      "driving-lesson-cost-cyprus",
      "how-to-get-driving-licence-cyprus-foreigner",
    ],
  },
  {
    id: "cyprus-driving-licence-complete-guide",
    slug_el: "plires-odigos-diploma-odigisis-kypros",
    slug_en: "cyprus-driving-licence-complete-guide",
    categoryId: "rules",
    title_el: "Πώς να βγάλετε δίπλωμα οδήγησης στην Κύπρο: Πλήρης Οδηγός 2026",
    title_en: "How to Get a Driving Licence in Cyprus: Complete 2026 Guide",
    excerpt_el:
      "Όλα όσα χρειάζεστε για να βγάλετε κυπριακό δίπλωμα οδήγησης το 2026.",
    excerpt_en:
      "Everything you need to know to get a Cyprus driving licence in 2026: rules, steps, costs, and timelines.",
    metaDescription_el:
      "Πλήρης οδηγός 2026 για το δίπλωμα οδήγησης στην Κύπρο. Βήματα, κόστος, εξετάσεις.",
    metaDescription_en:
      "Complete 2026 guide to getting a driving licence in Cyprus. Steps, costs, tests, and requirements.",
    heroImagePath: "/blog/cyprus-driving-licence-complete-guide/hero.jpg",
    heroImageAlt_en: "A winding empty road through a pine forest in the Cyprus mountains, with a metal guardrail on the left and blue sky above",
    heroImageAlt_el: "Ελικτός δρόμος μέσα από πευκόδασος στα κυπριακά βουνά, με μεταλλικό κιγκλίδωμα αριστερά και μπλε ουρανό",
    heroCaption_en: "Mountain road through pine forest, via Pexels.com",
    heroCaption_el: "Ορεινός δρόμος μέσα σε πεύκα, via Pexels.com",
    publishedDate: "2026-06-27",
    modifiedDate: "2026-06-27",
    author: "Matthieu Tissot",
    authorSlug: "matthieu",
    relatedCity: null,
    relatedSlugs: [
      "how-to-get-driving-licence-cyprus-step-by-step",
      "exchange-eu-licence-cyprus",
      "how-to-get-driving-licence-cyprus-foreigner",
    ],
  },
  {
    id: "cyprus-driving-test-2026",
    slug_el: "eksetasi-odigisis-kypros-2026",
    slug_en: "cyprus-driving-test-2026",
    categoryId: "rules",
    title_el: "\u0397 \u0395\u03be\u03ad\u03c4\u03b1\u03c3\u03b7 \u039f\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u03c3\u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf: \u03a4\u03b9 \u03bd\u03b1 \u03a0\u03b5\u03c1\u03b9\u03bc\u03ad\u03bd\u03b5\u03c4\u03b5 \u03c4\u03bf 2026",
    title_en: "The Cyprus Driving Test: What to Expect in 2026",
    excerpt_el:
      "\u03a4\u03b9 \u03b3\u03af\u03bd\u03b5\u03c4\u03b1\u03b9 \u03c4\u03b7\u03bd \u03b7\u03bc\u03ad\u03c1\u03b1 \u03c4\u03b7\u03c2 \u03c0\u03c1\u03b1\u03ba\u03c4\u03b9\u03ba\u03ae\u03c2 \u03b5\u03be\u03ad\u03c4\u03b1\u03c3\u03b7\u03c2 \u03bf\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u03c3\u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf.",
    excerpt_en:
      "What happens on the Cyprus driving test day \u2014 the route, the manoeuvres, and how the examiner scores you.",
    metaDescription_el:
      "\u0395\u03be\u03ad\u03c4\u03b1\u03c3\u03b7 \u03bf\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u039a\u03cd\u03c0\u03c1\u03bf\u03c2 2026: \u03c4\u03b9 \u03bd\u03b1 \u03c0\u03b5\u03c1\u03b9\u03bc\u03ad\u03bd\u03b5\u03c4\u03b5, \u03b7 \u03b4\u03b9\u03b1\u03b4\u03c1\u03bf\u03bc\u03ae \u03ba\u03b1\u03b9 \u03c0\u03ce\u03c2 \u03bd\u03b1 \u03c0\u03c1\u03bf\u03b5\u03c4\u03bf\u03b9\u03bc\u03b1\u03c3\u03c4\u03b5\u03af\u03c4\u03b5.",
    metaDescription_en:
      "Cyprus driving test 2026: what to expect, the route, manoeuvres, and how to prepare.",
    heroImagePath: "/blog/cyprus-driving-test-2026/hero.jpg",
    heroImageAlt_el:
      "\u0395\u03be\u03b5\u03c4\u03b1\u03c3\u03c4\u03ae\u03c2 \u03ba\u03b1\u03b9 \u03c5\u03c0\u03bf\u03c8\u03ae\u03c6\u03b9\u03bf\u03c2 \u03c3\u03b5 \u03b1\u03c5\u03c4\u03bf\u03ba\u03af\u03bd\u03b7\u03c4\u03bf \u03ba\u03b1\u03c4\u03ac \u03c4\u03b7\u03bd \u03b5\u03be\u03ad\u03c4\u03b1\u03c3\u03b7",
    heroImageAlt_en: "Driving test examiner sitting in car with candidate",
    heroCaption_en: "Driving test examiner sitting in car with candidate, via Pexels.com",
    heroCaption_el: "\u0395\u03be\u03b5\u03c4\u03b1\u03c3\u03c4\u03ae\u03c2 \u03ba\u03b1\u03b9 \u03c5\u03c0\u03bf\u03c8\u03ae\u03c6\u03b9\u03bf\u03c2 \u03c3\u03b5 \u03b1\u03c5\u03c4\u03bf\u03ba\u03af\u03bd\u03b7\u03c4\u03bf \u03ba\u03b1\u03c4\u03ac \u03c4\u03b7\u03bd \u03b5\u03be\u03ad\u03c4\u03b1\u03c3\u03b7, via Pexels.com",
    publishedDate: "2026-07-03",
    modifiedDate: "2026-07-03",
    author: "Matthieu Tissot",
    authorSlug: "matthieu",
    relatedCity: null,
    relatedSlugs: [],
  },

  {
    id: "cyprus-driving-licence-renewal",
    slug_el: "ananeosi-adeia-odigisis-kypros",
    slug_en: "cyprus-driving-licence-renewal",
    categoryId: "rules",
    title_el: "\u0391\u03bd\u03b1\u03bd\u03ad\u03c9\u03c3\u03b7 \u0386\u03b4\u03b5\u03b9\u03b1\u03c2 \u039f\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u03c3\u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf: \u0392\u03ae\u03bc\u03b1 \u03a0\u03c1\u03bf\u03c2 \u0392\u03ae\u03bc\u03b1",
    title_en: "Cyprus Driving Licence Renewal: Step-by-Step",
    excerpt_el:
      "\u03a0\u03ce\u03c2 \u03bd\u03b1 \u03b1\u03bd\u03b1\u03bd\u03b5\u03ce\u03c3\u03b5\u03c4\u03b5 \u03c4\u03b7\u03bd \u03ac\u03b4\u03b5\u03b9\u03b1 \u03bf\u03b4\u03ae\u03b3\u03b7\u03c3\u03ae\u03c2 \u03c3\u03b1\u03c2 \u03c3\u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf. \u03a0\u03cc\u03c4\u03b5 \u03bb\u03ae\u03b3\u03b5\u03b9, \u03c4\u03b9 \u03ad\u03b3\u03b3\u03c1\u03b1\u03c6\u03b1 \u03c7\u03c1\u03b5\u03b9\u03ac\u03b6\u03b5\u03c3\u03c4\u03b5.",
    excerpt_en:
      "How to renew your Cyprus driving licence \u2014 when it expires, what documents you need, and where to go.",
    metaDescription_el:
      "\u0391\u03bd\u03b1\u03bd\u03ad\u03c9\u03c3\u03b7 \u03ac\u03b4\u03b5\u03b9\u03b1\u03c2 \u03bf\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u039a\u03cd\u03c0\u03c1\u03bf\u03c2. \u03a0\u03cc\u03c4\u03b5 \u03bb\u03ae\u03b3\u03b5\u03b9, \u03ad\u03b3\u03b3\u03c1\u03b1\u03c6\u03b1 \u03ba\u03b1\u03b9 \u03bf\u03b4\u03b7\u03b3\u03af\u03b5\u03c2 \u03b2\u03ae\u03bc\u03b1 \u03c0\u03c1\u03bf\u03c2 \u03b2\u03ae\u03bc\u03b1.",
    metaDescription_en:
      "Cyprus driving licence renewal guide. When it expires, documents needed, and how to renew step by step.",
    heroImagePath: "/blog/cyprus-driving-licence-renewal/hero.jpg",
    heroImageAlt_el:
      "\u0386\u03c4\u03bf\u03bc\u03bf \u03c0\u03bf\u03c5 \u03c0\u03b1\u03c1\u03b1\u03b4\u03af\u03b4\u03b5\u03b9 \u03ad\u03b3\u03b3\u03c1\u03b1\u03c6\u03b1 \u03c3\u03b5 \u03b3\u03ba\u03b9\u03c3\u03ad \u03a4\u03bc\u03ae\u03bc\u03b1\u03c4\u03bf\u03c2 \u039f\u03b4\u03b9\u03ba\u03ce\u03bd \u039c\u03b5\u03c4\u03b1\u03c6\u03bf\u03c1\u03ce\u03bd",
    heroImageAlt_en: "Person handing over documents at a transport office counter",
    heroCaption_en: "Person handing over documents at a transport office counter, via Pexels.com",
    heroCaption_el: "\u0386\u03c4\u03bf\u03bc\u03bf \u03c0\u03bf\u03c5 \u03c0\u03b1\u03c1\u03b1\u03b4\u03af\u03b4\u03b5\u03b9 \u03ad\u03b3\u03b3\u03c1\u03b1\u03c6\u03b1 \u03c3\u03b5 \u03b3\u03ba\u03b9\u03c3\u03ad \u03a4\u03bc\u03ae\u03bc\u03b1\u03c4\u03bf\u03c2 \u039f\u03b4\u03b9\u03ba\u03ce\u03bd \u039c\u03b5\u03c4\u03b1\u03c6\u03bf\u03c1\u03ce\u03bd, via Pexels.com",
    publishedDate: "2026-07-04",
    modifiedDate: "2026-07-04",
    author: "Matthieu Tissot",
    authorSlug: "matthieu",
    relatedCity: null,
    relatedSlugs: [],
  },

  {
    id: "cyprus-driving-licence-fees",
    slug_el: "teli-adeia-odigisis-kypros",
    slug_en: "cyprus-driving-licence-fees",
    categoryId: "costs",
    title_el: "\u03a4\u03ad\u03bb\u03b7 \u0386\u03b4\u03b5\u03b9\u03b1\u03c2 \u039f\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u03c3\u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf (2026)",
    title_en: "Cyprus Driving Licence Fees and Costs (2026)",
    excerpt_el:
      "\u0391\u03bd\u03b1\u03bb\u03c5\u03c4\u03b9\u03ba\u03ae \u03c0\u03b1\u03c1\u03bf\u03c5\u03c3\u03af\u03b1\u03c3\u03b7 \u03ba\u03ac\u03b8\u03b5 \u03b5\u03c0\u03af\u03c3\u03b7\u03bc\u03bf\u03c5 \u03c4\u03ad\u03bb\u03bf\u03c5\u03c2 \u03b3\u03b9\u03b1 \u03ac\u03b4\u03b5\u03b9\u03b1 \u03bf\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u03c3\u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf \u03c4\u03bf 2026.",
    excerpt_en:
      "A clear breakdown of every official fee you pay when getting or renewing a Cyprus driving licence in 2026.",
    metaDescription_el:
      "\u03a4\u03ad\u03bb\u03b7 \u03ac\u03b4\u03b5\u03b9\u03b1\u03c2 \u03bf\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u039a\u03cd\u03c0\u03c1\u03bf\u03c2 2026. \u0395\u03c0\u03af\u03c3\u03b7\u03bc\u03b1 \u03c4\u03ad\u03bb\u03b7 \u03a4\u039f\u039c, \u03ba\u03cc\u03c3\u03c4\u03bf\u03c2 \u03b5\u03be\u03b5\u03c4\u03ac\u03c3\u03b5\u03c9\u03bd \u03ba\u03b1\u03b9 \u03c3\u03c5\u03bd\u03bf\u03bb\u03b9\u03ba\u03cc \u03ba\u03cc\u03c3\u03c4\u03bf\u03c2.",
    metaDescription_en:
      "Cyprus driving licence fees 2026. Official DoRT fees, test costs, and how much the full process costs.",
    heroImagePath: "/blog/cyprus-driving-licence-fees/hero.jpg",
    heroImageAlt_el:
      "\u0395\u03c0\u03af\u03c3\u03b7\u03bc\u03b1 \u03ad\u03bd\u03c4\u03c5\u03c0\u03b1 \u03ba\u03b1\u03b9 \u03bd\u03bf\u03bc\u03af\u03c3\u03bc\u03b1\u03c4\u03b1 \u03c3\u03b5 \u03b3\u03c1\u03b1\u03c6\u03b5\u03af\u03bf",
    heroImageAlt_en: "Official fee documents and coins on a desk",
    heroCaption_en: "Official fee documents and coins on a desk, via Pexels.com",
    heroCaption_el: "\u0395\u03c0\u03af\u03c3\u03b7\u03bc\u03b1 \u03ad\u03bd\u03c4\u03c5\u03c0\u03b1 \u03ba\u03b1\u03b9 \u03bd\u03bf\u03bc\u03af\u03c3\u03bc\u03b1\u03c4\u03b1 \u03c3\u03b5 \u03b3\u03c1\u03b1\u03c6\u03b5\u03af\u03bf, via Pexels.com",
    publishedDate: "2026-07-04",
    modifiedDate: "2026-07-04",
    author: "Matthieu Tissot",
    authorSlug: "matthieu",
    relatedCity: null,
    relatedSlugs: [],
  },

  {
    id: "exchange-uk-driving-licence-cyprus",
    slug_el: "anallagi-vretanikis-adeias-kypros",
    slug_en: "exchange-uk-driving-licence-cyprus",
    categoryId: "foreigners",
    title_el: "\u0391\u03bd\u03c4\u03b1\u03bb\u03bb\u03b1\u03b3\u03ae \u0392\u03c1\u03b5\u03c4\u03b1\u03bd\u03b9\u03ba\u03ae\u03c2 \u0386\u03b4\u03b5\u03b9\u03b1\u03c2 \u039f\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u03b3\u03b9\u03b1 \u039a\u03c5\u03c0\u03c1\u03b9\u03b1\u03ba\u03ae",
    title_en: "Exchanging a UK Driving Licence for a Cyprus One",
    excerpt_el:
      "\u0397 \u03b4\u03b9\u03b1\u03b4\u03b9\u03ba\u03b1\u03c3\u03af\u03b1 \u03b1\u03bd\u03c4\u03b1\u03bb\u03bb\u03b1\u03b3\u03ae\u03c2 \u03b2\u03c1\u03b5\u03c4\u03b1\u03bd\u03b9\u03ba\u03ae\u03c2 \u03ac\u03b4\u03b5\u03b9\u03b1\u03c2 \u03bf\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u03b3\u03b9\u03b1 \u03ba\u03c5\u03c0\u03c1\u03b9\u03b1\u03ba\u03ae, \u03b2\u03ae\u03bc\u03b1 \u03c0\u03c1\u03bf\u03c2 \u03b2\u03ae\u03bc\u03b1.",
    excerpt_en:
      "The step-by-step process for UK residents in Cyprus who want to swap their UK licence for a Cypriot one.",
    metaDescription_el:
      "\u03a0\u03ce\u03c2 \u03bd\u03b1 \u03b1\u03bd\u03c4\u03b1\u03bb\u03bb\u03ac\u03be\u03b5\u03c4\u03b5 \u03b2\u03c1\u03b5\u03c4\u03b1\u03bd\u03b9\u03ba\u03ae \u03ac\u03b4\u03b5\u03b9\u03b1 \u03b3\u03b9\u03b1 \u03ba\u03c5\u03c0\u03c1\u03b9\u03b1\u03ba\u03ae. \u0388\u03b3\u03b3\u03c1\u03b1\u03c6\u03b1, \u03b4\u03b9\u03b1\u03b4\u03b9\u03ba\u03b1\u03c3\u03af\u03b1 \u03ba\u03b1\u03b9 \u03c4\u03c5\u03c7\u03cc\u03bd \u03b5\u03be\u03b5\u03c4\u03ac\u03c3\u03b5\u03b9\u03c2.",
    metaDescription_en:
      "How to exchange a UK driving licence for a Cyprus one. Documents, process, and what tests you may need.",
    heroImagePath: "/blog/exchange-uk-driving-licence-cyprus/hero.jpg",
    heroImageAlt_el:
      "\u0392\u03c1\u03b5\u03c4\u03b1\u03bd\u03b9\u03ba\u03ae \u03ba\u03b1\u03b9 \u03ba\u03c5\u03c0\u03c1\u03b9\u03b1\u03ba\u03ae \u03ac\u03b4\u03b5\u03b9\u03b1 \u03bf\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u03b4\u03af\u03c0\u03bb\u03b1 \u03b4\u03af\u03c0\u03bb\u03b1",
    heroImageAlt_en: "UK and Cyprus driving licences side by side",
    heroCaption_en: "UK and Cyprus driving licences side by side, via Pexels.com",
    heroCaption_el: "\u0392\u03c1\u03b5\u03c4\u03b1\u03bd\u03b9\u03ba\u03ae \u03ba\u03b1\u03b9 \u03ba\u03c5\u03c0\u03c1\u03b9\u03b1\u03ba\u03ae \u03ac\u03b4\u03b5\u03b9\u03b1 \u03bf\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u03b4\u03af\u03c0\u03bb\u03b1 \u03b4\u03af\u03c0\u03bb\u03b1, via Pexels.com",
    publishedDate: "2026-07-04",
    modifiedDate: "2026-07-04",
    author: "Matthieu Tissot",
    authorSlug: "matthieu",
    relatedCity: null,
    relatedSlugs: [],
  },

  {
    id: "drive-cyprus-uk-licence",
    slug_el: "odigisi-kypros-vretaniki-adeia",
    slug_en: "drive-cyprus-uk-licence",
    categoryId: "foreigners",
    title_el: "\u039c\u03c0\u03bf\u03c1\u03ce \u03bd\u03b1 \u039f\u03b4\u03b7\u03b3\u03ae\u03c3\u03c9 \u03c3\u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf \u03bc\u03b5 \u0392\u03c1\u03b5\u03c4\u03b1\u03bd\u03b9\u03ba\u03ae \u0386\u03b4\u03b5\u03b9\u03b1;",
    title_en: "Can I Drive in Cyprus With a UK Licence?",
    excerpt_el:
      "\u039d\u03b1\u03b9 \u2014 \u03b1\u03bb\u03bb\u03ac \u03b3\u03b9\u03b1 \u03c0\u03cc\u03c3\u03bf \u03ba\u03b1\u03b9 \u03c5\u03c0\u03cc \u03c0\u03bf\u03b9\u03b5\u03c2 \u03c3\u03c5\u03bd\u03b8\u03ae\u03ba\u03b5\u03c2; \u0386\u03bc\u03b5\u03c3\u03b7 \u03b1\u03c0\u03ac\u03bd\u03c4\u03b7\u03c3\u03b7 \u03b3\u03b9\u03b1 \u03c4\u03bf\u03c5\u03c1\u03af\u03c3\u03c4\u03b5\u03c2 \u03ba\u03b1\u03b9 \u03bd\u03b5\u03bf\u03b1\u03c6\u03b9\u03c7\u03b8\u03ad\u03bd\u03c4\u03b5\u03c2.",
    excerpt_en:
      "Yes \u2014 but for how long, and under what conditions? Short answer for tourists and new arrivals.",
    metaDescription_el:
      "\u039c\u03c0\u03bf\u03c1\u03b5\u03af\u03c4\u03b5 \u03bd\u03b1 \u03bf\u03b4\u03b7\u03b3\u03ae\u03c3\u03b5\u03c4\u03b5 \u03c3\u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf \u03bc\u03b5 \u03b2\u03c1\u03b5\u03c4\u03b1\u03bd\u03b9\u03ba\u03ae \u03ac\u03b4\u03b5\u03b9\u03b1; \u039d\u03b1\u03b9 \u2014 \u03bc\u03ac\u03b8\u03b5\u03c4\u03b5 \u03b3\u03b9\u03b1 \u03c0\u03cc\u03c3\u03bf \u03b9\u03c3\u03c7\u03cd\u03b5\u03b9.",
    metaDescription_en:
      "Can you drive in Cyprus with a UK licence? Yes \u2014 here is how long it is valid and when you must exchange.",
    heroImagePath: "/blog/drive-cyprus-uk-licence/hero.jpg",
    heroImageAlt_el:
      "\u03a4\u03bf\u03c5\u03c1\u03af\u03c3\u03c4\u03b1\u03c2 \u03bf\u03b4\u03b7\u03b3\u03b5\u03af \u03b5\u03bd\u03bf\u03b9\u03ba\u03b9\u03b1\u03b6\u03cc\u03bc\u03b5\u03bd\u03bf \u03b1\u03c5\u03c4\u03bf\u03ba\u03af\u03bd\u03b7\u03c4\u03bf \u03c3\u03b5 \u03ba\u03c5\u03c0\u03c1\u03b9\u03b1\u03ba\u03cc \u03b4\u03c1\u03cc\u03bc\u03bf",
    heroImageAlt_en: "Tourist driving a hire car on a Cyprus road",
    heroCaption_en: "Tourist driving a hire car on a Cyprus road, via Pexels.com",
    heroCaption_el: "\u03a4\u03bf\u03c5\u03c1\u03af\u03c3\u03c4\u03b1\u03c2 \u03bf\u03b4\u03b7\u03b3\u03b5\u03af \u03b5\u03bd\u03bf\u03b9\u03ba\u03b9\u03b1\u03b6\u03cc\u03bc\u03b5\u03bd\u03bf \u03b1\u03c5\u03c4\u03bf\u03ba\u03af\u03bd\u03b7\u03c4\u03bf \u03c3\u03b5 \u03ba\u03c5\u03c0\u03c1\u03b9\u03b1\u03ba\u03cc \u03b4\u03c1\u03cc\u03bc\u03bf, via Pexels.com",
    publishedDate: "2026-07-06",
    modifiedDate: "2026-07-06",
    author: "Matthieu Tissot",
    authorSlug: "matthieu",
    relatedCity: null,
    relatedSlugs: [],
  },

  {
    id: "cyprus-driving-licence-categories",
    slug_el: "katigories-adeia-odigisis-kypros",
    slug_en: "cyprus-driving-licence-categories",
    categoryId: "rules",
    title_el: "\u039a\u03b1\u03c4\u03b7\u03b3\u03bf\u03c1\u03af\u03b5\u03c2 \u0386\u03b4\u03b5\u03b9\u03b1\u03c2 \u039f\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u03c3\u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf (\u0391 \u03ad\u03c9\u03c2 \u0394)",
    title_en: "Cyprus Driving Licence Categories Explained (A to D)",
    excerpt_el:
      "\u039a\u03ac\u03b8\u03b5 \u03ba\u03b1\u03c4\u03b7\u03b3\u03bf\u03c1\u03af\u03b1 \u03ac\u03b4\u03b5\u03b9\u03b1\u03c2 \u03bf\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u03c3\u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf. \u0391\u03c5\u03c4\u03bf\u03ba\u03af\u03bd\u03b7\u03c4\u03bf, \u03bc\u03bf\u03c4\u03bf\u03c3\u03c5\u03ba\u03bb\u03ad\u03c4\u03b1, \u03c6\u03bf\u03c1\u03c4\u03b7\u03b3\u03cc, \u03bb\u03b5\u03c9\u03c6\u03bf\u03c1\u03b5\u03af\u03bf.",
    excerpt_en:
      "Every category on the Cyprus driving licence explained \u2014 car, motorcycle, truck, bus, and more.",
    metaDescription_el:
      "\u039a\u03b1\u03c4\u03b7\u03b3\u03bf\u03c1\u03af\u03b5\u03c2 \u03ac\u03b4\u03b5\u03b9\u03b1\u03c2 \u03bf\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u039a\u03cd\u03c0\u03c1\u03bf\u03c2 \u0391 \u03ad\u03c9\u03c2 \u0394. \u03a0\u03bf\u03b9\u03b1 \u03ba\u03b1\u03c4\u03b7\u03b3\u03bf\u03c1\u03af\u03b1 \u03c7\u03c1\u03b5\u03b9\u03ac\u03b6\u03b5\u03c3\u03c4\u03b5 \u03ba\u03b1\u03b9 \u03c0\u03ce\u03c2 \u03bd\u03b1 \u03c4\u03b7\u03bd \u03b1\u03c0\u03bf\u03ba\u03c4\u03ae\u03c3\u03b5\u03c4\u03b5.",
    metaDescription_en:
      "Cyprus driving licence categories A to D explained. Which category you need and how to get each one.",
    heroImagePath: "/blog/cyprus-driving-licence-categories/hero.jpg",
    heroImageAlt_el:
      "\u0394\u03b9\u03ac\u03c6\u03bf\u03c1\u03b1 \u03bf\u03c7\u03ae\u03bc\u03b1\u03c4\u03b1 \u03c3\u03b5 \u03ba\u03c5\u03c0\u03c1\u03b9\u03b1\u03ba\u03cc \u03b4\u03c1\u03cc\u03bc\u03bf",
    heroImageAlt_en: "Different vehicle types on a Cyprus road",
    heroCaption_en: "Different vehicle types on a Cyprus road, via Pexels.com",
    heroCaption_el: "\u0394\u03b9\u03ac\u03c6\u03bf\u03c1\u03b1 \u03bf\u03c7\u03ae\u03bc\u03b1\u03c4\u03b1 \u03c3\u03b5 \u03ba\u03c5\u03c0\u03c1\u03b9\u03b1\u03ba\u03cc \u03b4\u03c1\u03cc\u03bc\u03bf, via Pexels.com",
    publishedDate: "2026-07-08",
    modifiedDate: "2026-07-08",
    author: "Matthieu Tissot",
    authorSlug: "matthieu",
    relatedCity: null,
    relatedSlugs: [],
  },

  {
    id: "cyprus-theory-test-guide",
    slug_el: "theoritiki-eksetasi-kypros-odigos",
    slug_en: "cyprus-theory-test-guide",
    categoryId: "theory",
    title_el: "\u0398\u03b5\u03c9\u03c1\u03b7\u03c4\u03b9\u03ba\u03ae \u0395\u03be\u03ad\u03c4\u03b1\u03c3\u03b7 \u039a\u03cd\u03c0\u03c1\u03bf\u03c5: \u03a0\u03ce\u03c2 \u03bd\u03b1 \u03a0\u03c1\u03bf\u03b5\u03c4\u03bf\u03b9\u03bc\u03b1\u03c3\u03c4\u03b5\u03af\u03c4\u03b5 \u03ba\u03b1\u03b9 \u03bd\u03b1 \u03a0\u03b5\u03c1\u03ac\u03c3\u03b5\u03c4\u03b5",
    title_en: "Cyprus Theory Test: How to Prepare and Pass",
    excerpt_el:
      "\u03a0\u03ce\u03c2 \u03bb\u03b5\u03b9\u03c4\u03bf\u03c5\u03c1\u03b3\u03b5\u03af \u03b7 \u03b8\u03b5\u03c9\u03c1\u03b7\u03c4\u03b9\u03ba\u03ae \u03b5\u03be\u03ad\u03c4\u03b1\u03c3\u03b7 \u03c3\u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf, \u03c4\u03b9 \u03ba\u03b1\u03bb\u03cd\u03c0\u03c4\u03b5\u03b9 \u03ba\u03b1\u03b9 \u03c0\u03ce\u03c2 \u03bd\u03b1 \u03c0\u03c1\u03bf\u03b5\u03c4\u03bf\u03b9\u03bc\u03b1\u03c3\u03c4\u03b5\u03af\u03c4\u03b5.",
    excerpt_en:
      "How the Cyprus theory test works, what it covers, and how to study for it in Greek or English.",
    metaDescription_el:
      "\u0398\u03b5\u03c9\u03c1\u03b7\u03c4\u03b9\u03ba\u03ae \u03b5\u03be\u03ad\u03c4\u03b1\u03c3\u03b7 \u039a\u03cd\u03c0\u03c1\u03bf\u03c2: \u03bc\u03bf\u03c1\u03c6\u03ae, \u03b5\u03c1\u03c9\u03c4\u03ae\u03c3\u03b5\u03b9\u03c2, \u03ba\u03c1\u03ac\u03c4\u03b7\u03c3\u03b7 \u03ba\u03b1\u03b9 \u03c3\u03c5\u03bc\u03b2\u03bf\u03c5\u03bb\u03ad\u03c2 \u03b3\u03b9\u03b1 \u03bd\u03b1 \u03c0\u03b5\u03c1\u03ac\u03c3\u03b5\u03c4\u03b5.",
    metaDescription_en:
      "Cyprus theory test guide 2026. Format, questions, how to book, and tips to pass first time.",
    heroImagePath: "/blog/cyprus-theory-test-guide/hero.jpg",
    heroImageAlt_el:
      "\u0386\u03c4\u03bf\u03bc\u03bf \u03c0\u03bf\u03c5 \u03bc\u03b5\u03bb\u03b5\u03c4\u03ac \u03b3\u03b9\u03b1 \u03b8\u03b5\u03c9\u03c1\u03b7\u03c4\u03b9\u03ba\u03ae \u03b5\u03be\u03ad\u03c4\u03b1\u03c3\u03b7 \u03bf\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2",
    heroImageAlt_en: "Person studying for driving theory test at a computer",
    heroCaption_en: "Person studying for driving theory test at a computer, via Pexels.com",
    heroCaption_el: "\u0386\u03c4\u03bf\u03bc\u03bf \u03c0\u03bf\u03c5 \u03bc\u03b5\u03bb\u03b5\u03c4\u03ac \u03b3\u03b9\u03b1 \u03b8\u03b5\u03c9\u03c1\u03b7\u03c4\u03b9\u03ba\u03ae \u03b5\u03be\u03ad\u03c4\u03b1\u03c3\u03b7 \u03bf\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2, via Pexels.com",
    publishedDate: "2026-07-10",
    modifiedDate: "2026-07-10",
    author: "Matthieu Tissot",
    authorSlug: "matthieu",
    relatedCity: null,
    relatedSlugs: [],
  },

  {
    id: "cyprus-road-signs-guide",
    slug_el: "simata-troxaias-kypros-odigos",
    slug_en: "cyprus-road-signs-guide",
    categoryId: "theory",
    title_el: "\u03a3\u03ae\u03bc\u03b1\u03c4\u03b1 \u03a4\u03c1\u03bf\u03c7\u03b1\u03af\u03b1\u03c2 \u039a\u03cd\u03c0\u03c1\u03bf\u03c5: \u03a0\u03bb\u03ae\u03c1\u03b7\u03c2 \u039f\u03b4\u03b7\u03b3\u03cc\u03c2 \u03b3\u03b9\u03b1 \u03c4\u03b7\u03bd \u0395\u03be\u03ad\u03c4\u03b1\u03c3\u03b7",
    title_en: "Cyprus Road Signs: The Complete Test Guide",
    excerpt_el:
      "\u039a\u03ac\u03b8\u03b5 \u03ba\u03b1\u03c4\u03b7\u03b3\u03bf\u03c1\u03af\u03b1 \u03c3\u03ae\u03bc\u03b1\u03c4\u03bf\u03c2 \u03c4\u03c1\u03bf\u03c7\u03b1\u03af\u03b1\u03c2 \u03c0\u03bf\u03c5 \u03c7\u03c1\u03b5\u03b9\u03ac\u03b6\u03b5\u03c3\u03c4\u03b5 \u03b3\u03b9\u03b1 \u03c4\u03b7 \u03b8\u03b5\u03c9\u03c1\u03b7\u03c4\u03b9\u03ba\u03ae \u03b5\u03be\u03ad\u03c4\u03b1\u03c3\u03b7 \u03c3\u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf.",
    excerpt_en:
      "Every category of Cyprus road sign you need to know for the theory test \u2014 mandatory, warning, and informational.",
    metaDescription_el:
      "\u03a3\u03ae\u03bc\u03b1\u03c4\u03b1 \u03c4\u03c1\u03bf\u03c7\u03b1\u03af\u03b1\u03c2 \u039a\u03cd\u03c0\u03c1\u03bf\u03c5 \u03b3\u03b9\u03b1 \u03c4\u03b7 \u03b8\u03b5\u03c9\u03c1\u03b7\u03c4\u03b9\u03ba\u03ae \u03b5\u03be\u03ad\u03c4\u03b1\u03c3\u03b7. \u038c\u03bb\u03b5\u03c2 \u03bf\u03b9 \u03ba\u03b1\u03c4\u03b7\u03b3\u03bf\u03c1\u03af\u03b5\u03c2 \u03c3\u03b7\u03bc\u03ac\u03c4\u03c9\u03bd.",
    metaDescription_en:
      "Cyprus road signs guide for the theory test. All sign categories with explanations.",
    heroImagePath: "/blog/cyprus-road-signs-guide/hero.jpg",
    heroImageAlt_el:
      "\u03a3\u03ae\u03bc\u03b1\u03c4\u03b1 \u03c4\u03c1\u03bf\u03c7\u03b1\u03af\u03b1\u03c2 \u03c3\u03b5 \u03ba\u03cc\u03bc\u03b2\u03bf \u03c3\u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf",
    heroImageAlt_en: "Cyprus road signs at a junction",
    heroCaption_en: "Cyprus road signs at a junction, via Pexels.com",
    heroCaption_el: "\u03a3\u03ae\u03bc\u03b1\u03c4\u03b1 \u03c4\u03c1\u03bf\u03c7\u03b1\u03af\u03b1\u03c2 \u03c3\u03b5 \u03ba\u03cc\u03bc\u03b2\u03bf \u03c3\u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf, via Pexels.com",
    publishedDate: "2026-07-12",
    modifiedDate: "2026-07-12",
    author: "Matthieu Tissot",
    authorSlug: "matthieu",
    relatedCity: null,
    relatedSlugs: [],
  },

  {
    id: "cyprus-driving-licence-requirements",
    slug_el: "proapaitimena-adeia-odigisis-kypros",
    slug_en: "cyprus-driving-licence-requirements",
    categoryId: "rules",
    title_el: "\u03a0\u03c1\u03bf\u03cb\u03c0\u03bf\u03b8\u03ad\u03c3\u03b5\u03b9\u03c2 \u0386\u03b4\u03b5\u03b9\u03b1\u03c2 \u039f\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u03c3\u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf",
    title_en: "Driving Licence Requirements in Cyprus",
    excerpt_el:
      "\u038c\u03bb\u03b5\u03c2 \u03bf\u03b9 \u03c0\u03c1\u03bf\u03cb\u03c0\u03bf\u03b8\u03ad\u03c3\u03b5\u03b9\u03c2 \u03b3\u03b9\u03b1 \u03ac\u03b4\u03b5\u03b9\u03b1 \u03bf\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u03c3\u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf. \u0397\u03bb\u03b9\u03ba\u03af\u03b1, \u03ad\u03b3\u03b3\u03c1\u03b1\u03c6\u03b1, \u03b9\u03b1\u03c4\u03c1\u03b9\u03ba\u03cc, \u03ba\u03b1\u03c4\u03bf\u03b9\u03ba\u03af\u03b1.",
    excerpt_en:
      "The full list of requirements to get a driving licence in Cyprus \u2014 age, documents, medical, and residency.",
    metaDescription_el:
      "\u03a0\u03c1\u03bf\u03cb\u03c0\u03bf\u03b8\u03ad\u03c3\u03b5\u03b9\u03c2 \u03ac\u03b4\u03b5\u03b9\u03b1\u03c2 \u03bf\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u039a\u03cd\u03c0\u03c1\u03bf\u03c2. \u0397\u03bb\u03b9\u03ba\u03af\u03b1, \u03ad\u03b3\u03b3\u03c1\u03b1\u03c6\u03b1, \u03b9\u03b1\u03c4\u03c1\u03b9\u03ba\u03cc \u03ba\u03b1\u03b9 \u03ba\u03b1\u03c4\u03bf\u03b9\u03ba\u03af\u03b1.",
    metaDescription_en:
      "Driving licence requirements in Cyprus. Age, documents, medical certificate, and residency rules.",
    heroImagePath: "/blog/cyprus-driving-licence-requirements/hero.jpg",
    heroImageAlt_el:
      "\u039b\u03af\u03c3\u03c4\u03b1 \u03b5\u03b3\u03b3\u03c1\u03ac\u03c6\u03c9\u03bd \u03c3\u03b5 \u03b3\u03c1\u03b1\u03c6\u03b5\u03af\u03bf",
    heroImageAlt_en: "Checklist of documents on a desk",
    heroCaption_en: "Checklist of documents on a desk, via Pexels.com",
    heroCaption_el: "\u039b\u03af\u03c3\u03c4\u03b1 \u03b5\u03b3\u03b3\u03c1\u03ac\u03c6\u03c9\u03bd \u03c3\u03b5 \u03b3\u03c1\u03b1\u03c6\u03b5\u03af\u03bf, via Pexels.com",
    publishedDate: "2026-07-14",
    modifiedDate: "2026-07-14",
    author: "Matthieu Tissot",
    authorSlug: "matthieu",
    relatedCity: null,
    relatedSlugs: [],
  },

  {
    id: "book-driving-test-cyprus",
    slug_el: "kratisi-eksetasis-odigisis-kypros",
    slug_en: "book-driving-test-cyprus",
    categoryId: "practical",
    title_el: "\u03a0\u03ce\u03c2 \u03bd\u03b1 \u039a\u03bb\u03b5\u03af\u03c3\u03b5\u03c4\u03b5 \u0395\u03be\u03ad\u03c4\u03b1\u03c3\u03b7 \u039f\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u03c3\u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf",
    title_en: "How to Book Your Driving Test in Cyprus",
    excerpt_el:
      "\u03a0\u03ce\u03c2 \u03bd\u03b1 \u03ba\u03bb\u03b5\u03af\u03c3\u03b5\u03c4\u03b5 \u03b8\u03b5\u03c9\u03c1\u03b7\u03c4\u03b9\u03ba\u03ae \u03ba\u03b1\u03b9 \u03c0\u03c1\u03b1\u03ba\u03c4\u03b9\u03ba\u03ae \u03b5\u03be\u03ad\u03c4\u03b1\u03c3\u03b7 \u03bf\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u03c3\u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf.",
    excerpt_en:
      "How to book both the theory and practical driving tests in Cyprus \u2014 online, by phone, or in person.",
    metaDescription_el:
      "\u03a0\u03ce\u03c2 \u03bd\u03b1 \u03ba\u03bb\u03b5\u03af\u03c3\u03b5\u03c4\u03b5 \u03b5\u03be\u03ad\u03c4\u03b1\u03c3\u03b7 \u03bf\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u03c3\u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf. \u039a\u03c1\u03ac\u03c4\u03b7\u03c3\u03b7 \u03b8\u03b5\u03c9\u03c1\u03b7\u03c4\u03b9\u03ba\u03ae\u03c2 \u03ba\u03b1\u03b9 \u03c0\u03c1\u03b1\u03ba\u03c4\u03b9\u03ba\u03ae\u03c2 \u03b5\u03be\u03ad\u03c4\u03b1\u03c3\u03b7\u03c2.",
    metaDescription_en:
      "How to book your driving test in Cyprus. Theory and practical test booking process explained.",
    heroImagePath: "/blog/book-driving-test-cyprus/hero.jpg",
    heroImageAlt_el:
      "\u0386\u03c4\u03bf\u03bc\u03bf \u03c0\u03bf\u03c5 \u03ba\u03bb\u03b5\u03af\u03bd\u03b5\u03b9 \u03c1\u03b1\u03bd\u03c4\u03b5\u03b2\u03bf\u03cd \u03c3\u03c4\u03bf\u03bd \u03c5\u03c0\u03bf\u03bb\u03bf\u03b3\u03b9\u03c3\u03c4\u03ae",
    heroImageAlt_en: "Person booking an appointment on a computer",
    heroCaption_en: "Person booking an appointment on a computer, via Pexels.com",
    heroCaption_el: "\u0386\u03c4\u03bf\u03bc\u03bf \u03c0\u03bf\u03c5 \u03ba\u03bb\u03b5\u03af\u03bd\u03b5\u03b9 \u03c1\u03b1\u03bd\u03c4\u03b5\u03b2\u03bf\u03cd \u03c3\u03c4\u03bf\u03bd \u03c5\u03c0\u03bf\u03bb\u03bf\u03b3\u03b9\u03c3\u03c4\u03ae, via Pexels.com",
    publishedDate: "2026-07-16",
    modifiedDate: "2026-07-16",
    author: "Matthieu Tissot",
    authorSlug: "matthieu",
    relatedCity: null,
    relatedSlugs: [],
  },

  {
    id: "cyprus-driving-licence-renewal-over-70",
    slug_el: "ananeosi-adeia-ano-70-kypros",
    slug_en: "cyprus-driving-licence-renewal-over-70",
    categoryId: "rules",
    title_el: "\u0391\u03bd\u03b1\u03bd\u03ad\u03c9\u03c3\u03b7 \u0386\u03b4\u03b5\u03b9\u03b1\u03c2 \u039f\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u0386\u03bd\u03c9 \u03c4\u03c9\u03bd 70 \u03c3\u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf",
    title_en: "Renewing Your Cyprus Driving Licence Over 70",
    excerpt_el:
      "\u039f\u03b4\u03b7\u03b3\u03bf\u03af \u03ac\u03bd\u03c9 \u03c4\u03c9\u03bd 70 \u03c3\u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf \u03ad\u03c7\u03bf\u03c5\u03bd \u03c3\u03c5\u03bd\u03c4\u03bf\u03bc\u03cc\u03c4\u03b5\u03c1\u03b5\u03c2 \u03c0\u03b5\u03c1\u03b9\u03cc\u03b4\u03bf\u03c5\u03c2 \u03b1\u03bd\u03b1\u03bd\u03ad\u03c9\u03c3\u03b7\u03c2 \u03ba\u03b1\u03b9 \u03b5\u03c0\u03b9\u03c0\u03bb\u03ad\u03bf\u03bd \u03b5\u03bb\u03ad\u03b3\u03c7\u03bf\u03c5\u03c2.",
    excerpt_en:
      "Drivers over 70 in Cyprus face shorter renewal periods and extra checks. Here is what to expect.",
    metaDescription_el:
      "\u0391\u03bd\u03b1\u03bd\u03ad\u03c9\u03c3\u03b7 \u03ac\u03b4\u03b5\u03b9\u03b1\u03c2 \u03bf\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u03ac\u03bd\u03c9 \u03c4\u03c9\u03bd 70 \u03c3\u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf. \u039c\u03b9\u03ba\u03c1\u03cc\u03c4\u03b5\u03c1\u03b7 \u03b9\u03c3\u03c7\u03cd\u03c2, \u03b9\u03b1\u03c4\u03c1\u03b9\u03ba\u03bf\u03af \u03ad\u03bb\u03b5\u03b3\u03c7\u03bf\u03b9, \u03b4\u03b9\u03b1\u03b4\u03b9\u03ba\u03b1\u03c3\u03af\u03b1.",
    metaDescription_en:
      "Cyprus driving licence renewal over 70. Shorter validity periods, medical checks, and the renewal process.",
    heroImagePath: "/blog/cyprus-driving-licence-renewal-over-70/hero.jpg",
    heroImageAlt_el:
      "\u0397\u03bb\u03b9\u03ba\u03b9\u03c9\u03bc\u03ad\u03bd\u03bf \u03ac\u03c4\u03bf\u03bc\u03bf \u03b5\u03be\u03b5\u03c4\u03ac\u03b6\u03b5\u03b9 \u03ad\u03b3\u03b3\u03c1\u03b1\u03c6\u03b1 \u03c3\u03b5 \u03a4\u03bc\u03ae\u03bc\u03b1 \u039f\u03b4\u03b9\u03ba\u03ce\u03bd \u039c\u03b5\u03c4\u03b1\u03c6\u03bf\u03c1\u03ce\u03bd",
    heroImageAlt_en: "Elderly person reviewing documents in a transport office",
    heroCaption_en: "Elderly person reviewing documents in a transport office, via Pexels.com",
    heroCaption_el: "\u0397\u03bb\u03b9\u03ba\u03b9\u03c9\u03bc\u03ad\u03bd\u03bf \u03ac\u03c4\u03bf\u03bc\u03bf \u03b5\u03be\u03b5\u03c4\u03ac\u03b6\u03b5\u03b9 \u03ad\u03b3\u03b3\u03c1\u03b1\u03c6\u03b1 \u03c3\u03b5 \u03a4\u03bc\u03ae\u03bc\u03b1 \u039f\u03b4\u03b9\u03ba\u03ce\u03bd \u039c\u03b5\u03c4\u03b1\u03c6\u03bf\u03c1\u03ce\u03bd, via Pexels.com",
    publishedDate: "2026-07-18",
    modifiedDate: "2026-07-18",
    author: "Matthieu Tissot",
    authorSlug: "matthieu",
    relatedCity: null,
    relatedSlugs: [],
  },

  {
    id: "international-driving-licence-cyprus",
    slug_el: "diethnis-adeia-odigisis-kypros",
    slug_en: "international-driving-licence-cyprus",
    categoryId: "foreigners",
    title_el: "\u0394\u03b9\u03b5\u03b8\u03bd\u03ae\u03c2 \u0386\u03b4\u03b5\u03b9\u03b1 \u039f\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u03c3\u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf: \u03a0\u03cc\u03c4\u03b5 \u03a7\u03c1\u03b5\u03b9\u03ac\u03b6\u03b5\u03c3\u03c4\u03b5 \u03bc\u03af\u03b1",
    title_en: "International Driving Licence in Cyprus: When You Need One",
    excerpt_el:
      "\u03a0\u03cc\u03c4\u03b5 \u03c7\u03c1\u03b5\u03b9\u03ac\u03b6\u03b5\u03c3\u03c4\u03b5 \u03b4\u03b9\u03b5\u03b8\u03bd\u03ae \u03ac\u03b4\u03b5\u03b9\u03b1 \u03bf\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u03b1\u03c0\u03cc \u03c4\u03b7\u03bd \u039a\u03cd\u03c0\u03c1\u03bf, \u03c0\u03ce\u03c2 \u03bd\u03b1 \u03c4\u03b7\u03bd \u03b1\u03c0\u03bf\u03ba\u03c4\u03ae\u03c3\u03b5\u03c4\u03b5 \u03ba\u03b1\u03b9 \u03c0\u03bf\u03b9\u03b5\u03c2 \u03c7\u03ce\u03c1\u03b5\u03c2 \u03c4\u03b7 \u03b4\u03ad\u03c7\u03bf\u03bd\u03c4\u03b1\u03b9.",
    excerpt_en:
      "When a Cyprus international driving permit is required, how to get one, and which countries accept it.",
    metaDescription_el:
      "\u0394\u03b9\u03b5\u03b8\u03bd\u03ae\u03c2 \u03ac\u03b4\u03b5\u03b9\u03b1 \u03bf\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u039a\u03cd\u03c0\u03c1\u03bf\u03c2. \u03a0\u03cc\u03c4\u03b5 \u03c7\u03c1\u03b5\u03b9\u03ac\u03b6\u03b5\u03c3\u03c4\u03b5, \u03c0\u03ce\u03c2 \u03bd\u03b1 \u03ba\u03ac\u03bd\u03b5\u03c4\u03b5 \u03b1\u03af\u03c4\u03b7\u03c3\u03b7 \u03ba\u03b1\u03b9 \u03c0\u03bf\u03b9\u03b5\u03c2 \u03c7\u03ce\u03c1\u03b5\u03c2 \u03c4\u03b7 \u03b4\u03ad\u03c7\u03bf\u03bd\u03c4\u03b1\u03b9.",
    metaDescription_en:
      "International driving licence in Cyprus. When you need one, how to apply, and which countries accept it.",
    heroImagePath: "/blog/international-driving-licence-cyprus/hero.jpg",
    heroImageAlt_el:
      "\u0394\u03b9\u03b5\u03b8\u03bd\u03ae\u03c2 \u03ac\u03b4\u03b5\u03b9\u03b1 \u03bf\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u03ba\u03b1\u03b9 \u03b4\u03b9\u03b1\u03b2\u03b1\u03c4\u03ae\u03c1\u03b9\u03bf \u03c3\u03b5 \u03c7\u03ac\u03c1\u03c4\u03b7",
    heroImageAlt_en: "International driving permit and passport on a map",
    heroCaption_en: "International driving permit and passport on a map, via Pexels.com",
    heroCaption_el: "\u0394\u03b9\u03b5\u03b8\u03bd\u03ae\u03c2 \u03ac\u03b4\u03b5\u03b9\u03b1 \u03bf\u03b4\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2 \u03ba\u03b1\u03b9 \u03b4\u03b9\u03b1\u03b2\u03b1\u03c4\u03ae\u03c1\u03b9\u03bf \u03c3\u03b5 \u03c7\u03ac\u03c1\u03c4\u03b7, via Pexels.com",
    publishedDate: "2026-07-20",
    modifiedDate: "2026-07-20",
    author: "Matthieu Tissot",
    authorSlug: "matthieu",
    relatedCity: null,
    relatedSlugs: [],
  },

];

// --- hero image resolution -----------------------------------------------

/** Site-wide fallback hero, downloaded by scraper/fetch_blog_hero.py
 *  --default-hero from Unsplash query "cyprus road driving car". */
export const FALLBACK_BLOG_HERO = "/blog/default-hero.jpg";

/**
 * If the article's per-piece hero exists on disk under public/, return its
 * path; otherwise return the site-wide fallback. School photos are NEVER
 * used as blog heroes (they are private business assets - the old fallback
 * was removed deliberately).
 */
export function resolveArticleHero(article: BlogArticle): string {
  if (article.heroImagePath) {
    const local = path.join(
      process.cwd(),
      "public",
      article.heroImagePath.replace(/^\//, ""),
    );
    if (fs.existsSync(local)) return article.heroImagePath;
  }
  return FALLBACK_BLOG_HERO;
}

// --- accessors ------------------------------------------------------------

export function getAllArticles(): BlogArticle[] {
  return [...BLOG_ARTICLES].sort(
    (a, b) =>
      new Date(b.publishedDate).getTime() -
      new Date(a.publishedDate).getTime(),
  );
}

export function getLatestArticles(limit = 3): BlogArticle[] {
  return getAllArticles().slice(0, limit);
}

export function findArticleBySlug(
  slug: string,
  locale: Locale,
): BlogArticle | null {
  return (
    BLOG_ARTICLES.find((a) =>
      locale === "el" ? a.slug_el === slug : a.slug_en === slug,
    ) ?? null
  );
}

export function findCategoryBySlug(
  slug: string,
  locale: Locale,
): BlogCategory | null {
  return (
    BLOG_CATEGORIES.find((c) =>
      locale === "el" ? c.slug_el === slug : c.slug_en === slug,
    ) ?? null
  );
}

export function getCategoryById(id: string): BlogCategory | null {
  return BLOG_CATEGORIES.find((c) => c.id === id) ?? null;
}

export function getArticlesByCategory(categoryId: string): BlogArticle[] {
  return getAllArticles().filter((a) => a.categoryId === categoryId);
}

export function articleHref(article: BlogArticle, locale: Locale): string {
  return locale === "el"
    ? `/arthra/${article.slug_el}`
    : `/en/blog/${article.slug_en}`;
}

export function categoryHref(
  category: BlogCategory,
  locale: Locale,
): string {
  return locale === "el"
    ? `/arthra/${category.slug_el}`
    : `/en/blog/${category.slug_en}`;
}

export function blogIndexHref(locale: Locale): string {
  return locale === "el" ? "/arthra" : "/en/blog";
}

export function articleTitle(article: BlogArticle, locale: Locale): string {
  return locale === "el" ? article.title_el : article.title_en;
}

export function articleExcerpt(article: BlogArticle, locale: Locale): string {
  return locale === "el" ? article.excerpt_el : article.excerpt_en;
}

export function categoryTitle(c: BlogCategory, locale: Locale): string {
  return locale === "el" ? c.title_el : c.title_en;
}

// Previous/next within the full article list, ordered by publish date desc.
export function getAdjacent(
  article: BlogArticle,
): { prev: BlogArticle | null; next: BlogArticle | null } {
  const all = getAllArticles();
  const i = all.findIndex((a) => a.id === article.id);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? all[i - 1] : null,
    next: i < all.length - 1 ? all[i + 1] : null,
  };
}

// --- body loader ----------------------------------------------------------

const BLOG_CONTENT_DIR = path.join(
  process.cwd(),
  "scraper",
  "data",
  "blog",
);

export function loadArticleBody(
  articleId: string,
  locale: Locale,
): string | null {
  const file = path.join(BLOG_CONTENT_DIR, `${articleId}_${locale}.md`);
  if (!fs.existsSync(file)) return null;
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

export function loadInfographicData(
  articleId: string,
): AutoInfographicData | undefined {
  const file = path.join(BLOG_CONTENT_DIR, `${articleId}_infographic.json`);
  if (!fs.existsSync(file)) return undefined;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as AutoInfographicData;
  } catch {
    return undefined;
  }
}
