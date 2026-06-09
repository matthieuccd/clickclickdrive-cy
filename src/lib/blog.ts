import fs from "node:fs";
import path from "node:path";

import type { CyprusCity, Locale } from "./types";

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
  publishedDate: string;
  modifiedDate: string;
  author: string;
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
    heroImageAlt_el:
      "Κυπριακή ύπαιθρος με δρόμο που οδηγεί στα βουνά",
    heroImageAlt_en: "Cyprus countryside road leading toward the mountains",
    publishedDate: "2026-06-08",
    modifiedDate: "2026-06-08",
    author: "ClickClickDrive Cyprus",
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
    title_en: "How to Get a Driving Licence in Cyprus — Step by Step",
    excerpt_el:
      "Ολοκληρωμένος οδηγός για το δίπλωμα οδήγησης στην Κύπρο. Από την εκπαιδευτική άδεια ως την πρακτική εξέταση, βήμα προς βήμα.",
    excerpt_en:
      "The complete guide to getting a driving licence in Cyprus. From the learner's licence to the practical test, step by step.",
    metaDescription_el:
      "Πώς να βγάλεις δίπλωμα οδήγησης στην Κύπρο βήμα προς βήμα. Εκπαιδευτική άδεια, θεωρητική και πρακτική εξέταση.",
    metaDescription_en:
      "How to get a driving licence in Cyprus step by step. Learner's licence, theory test, and practical test explained.",
    heroImagePath: "/blog/pws-na-vgaleis-diploma-odigisis-stin-kypro/hero.jpg",
    heroImageAlt_el: "Εκπαιδευτής οδήγησης και μαθητής σε αυτοκίνητο κατά τη διάρκεια μαθήματος",
    heroImageAlt_en: "Driving instructor and student in car during a lesson",
    publishedDate: "2026-06-09",
    modifiedDate: "2026-06-09",
    author: "ClickClickDrive Cyprus",
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
    heroImageAlt_el: "Σχολή οδηγών με αυτοκίνητα έξω",
    heroImageAlt_en: "Driving school building with cars outside",
    publishedDate: "2026-06-09",
    modifiedDate: "2026-06-09",
    author: "ClickClickDrive Cyprus",
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
    heroImageAlt_el: "Βρετανική άδεια οδήγησης στο ταμπλό αυτοκινήτου",
    heroImageAlt_en: "UK driving licence on a car dashboard",
    publishedDate: "2026-06-09",
    modifiedDate: "2026-06-09",
    author: "ClickClickDrive Cyprus",
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
    title_en: "EU Driving Licence in Cyprus — Do You Need to Exchange It",
    excerpt_el:
      "Χρειάζεται να ανταλλάξετε την ευρωπαϊκή σας άδεια; Τι ισχύει, τι έγγραφα χρειάζεστε και ποια είναι η προθεσμία.",
    excerpt_en:
      "Do you need to swap your EU licence for a Cypriot one? What the rules are, what documents you need, and what the deadline is.",
    metaDescription_el:
      "Ανταλλαγή ευρωπαϊκής άδειας οδήγησης στην Κύπρο. Διαδικασία, έγγραφα, προθεσμία.",
    metaDescription_en:
      "EU driving licence exchange in Cyprus. Process, documents, and deadline explained.",
    heroImagePath: "/blog/anallagi-adeias-ee-kypros/hero.jpg",
    heroImageAlt_el: "Ευρωπαϊκές άδειες οδήγησης στο τραπέζι",
    heroImageAlt_en: "European driving licences on a table",
    publishedDate: "2026-06-09",
    modifiedDate: "2026-06-09",
    author: "ClickClickDrive Cyprus",
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
    title_en: "Category B Driving Licence Cyprus — Everything You Need to Know",
    excerpt_el:
      "Τι καλύπτει η κατηγορία Β, πώς αποκτάται και τι επιτρέπει να οδηγείς στην Κύπρο.",
    excerpt_en:
      "What Category B covers, how to get it, and what it allows you to drive in Cyprus.",
    metaDescription_el:
      "Κατηγορία Β άδεια οδήγησης στην Κύπρο. Τι καλύπτει, εξετάσεις, ισχύς και ανανέωση.",
    metaDescription_en:
      "Category B driving licence in Cyprus. What it covers, tests required, validity and renewal.",
    heroImagePath: "/blog/katigoria-b-adeia-odigisis-kypros/hero.jpg",
    heroImageAlt_el: "Αυτοκίνητο σε κυπριακό δρόμο κατά τη διάρκεια πρακτικής εξέτασης",
    heroImageAlt_en: "Car on a Cyprus road during a practical driving test",
    publishedDate: "2026-06-09",
    modifiedDate: "2026-06-09",
    author: "ClickClickDrive Cyprus",
    relatedCity: null,
    relatedSlugs: [
      "how-to-get-driving-licence-cyprus-step-by-step",
      "driving-lesson-cost-cyprus",
      "how-to-get-driving-licence-cyprus-foreigner",
    ],
  },
];

// --- hero image resolution -----------------------------------------------

/** Site-wide fallback hero, downloaded by scraper/fetch_blog_hero.py
 *  --default-hero from Unsplash query "cyprus road driving car". */
export const FALLBACK_BLOG_HERO = "/blog/default-hero.jpg";

/**
 * If the article's per-piece hero exists on disk under public/, return its
 * path; otherwise return the site-wide fallback. School photos are NEVER
 * used as blog heroes (they are private business assets — the old fallback
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
