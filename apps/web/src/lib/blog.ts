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
      "theory-test-cyprus-english",
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
  "..",
  "..",
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
