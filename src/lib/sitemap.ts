import fs from "node:fs";
import path from "node:path";

import { routing } from "@/i18n/routing";
import { BEST_OF_CITIES, bestOfSourceFiles } from "@/lib/bestOf";
import { AUTHORS } from "@/lib/authors";
import { BLOG_ARTICLES, BLOG_CATEGORIES, type BlogArticle } from "@/lib/blog";
import { getArticleDates } from "@/lib/dates";
import { lastModifiedDay, schoolsDataFile } from "@/lib/gitDates";
import { getAllSchools } from "@/lib/schools";
import { SITE_HOST } from "@/lib/seo";
import { citySlug } from "@/lib/slugs";
import { CITIES, type Locale } from "@/lib/types";
import { getArticleVideos, type ArticleVideo } from "@/lib/videos";

import { defaultLocale, locales } from "../../i18n.config";

/**
 * sitemap.xml generator.
 *
 * Pages are DISCOVERED, not listed: every `page.tsx` under src/app/[locale] is
 * a route; its localized URL comes from `routing.pathnames`; dynamic routes are
 * expanded from their data source. A dynamic route this file has no expander
 * for, or a page missing from `routing.pathnames`, throws at build time so a
 * new page can never be silently left out of the sitemap.
 *
 * URL convention: `trailingSlash: false` (see next.config.ts), so no inner URL has a
 * trailing slash. The homepage is written `https://host/`, the same URL as the bare host.
 *
 * lastmod (date-only, YYYY-MM-DD, omitted when no reliable date exists):
 *   - articles:              modified date if set, else published date
 *   - listing pages:         newest relevant article date if later than git
 *   - everything else:       last git commit touching the page's own source
 *                            file(s) plus the shared data files it renders
 */

const ROOT = process.cwd();
const APP_DIR = "src/app/[locale]";

interface Page {
  paths: Record<Locale, string>;
  lastmod: Record<Locale, string | null>;
  priority: number;
  videos: Record<Locale, ArticleVideo[]>;
}

type PathnameEntry = string | Record<string, string>;
const PATHNAMES = routing.pathnames as Record<string, PathnameEntry>;

// --- helpers ---------------------------------------------------------------

function maxDay(...days: (string | null)[]): string | null {
  let best: string | null = null;
  for (const d of days) if (d && (!best || d > best)) best = d;
  return best;
}

function perLocale<T>(fn: (l: Locale) => T): Record<Locale, T> {
  return { el: fn("el"), en: fn("en") } as Record<Locale, T>;
}

/** Public path for an internal route in one locale (Greek bare, English under /en). */
function localizedPath(internal: string, locale: Locale, slug?: string): string {
  const entry = PATHNAMES[internal];
  if (entry === undefined) {
    throw new Error(
      `[sitemap] route "${internal}" has a page.tsx but no entry in routing.pathnames (src/i18n/routing.ts).`,
    );
  }
  const template = typeof entry === "string" ? entry : entry[locale];
  const p = slug === undefined ? template : template.replace("[slug]", slug);
  if (locale === defaultLocale) return p;
  return p === "/" ? `/${locale}` : `/${locale}${p}`;
}

function pageFile(route: string): string {
  return `${APP_DIR}${route === "/" ? "" : route}/page.tsx`;
}

const publishedArticles = BLOG_ARTICLES.filter(
  (a) => getArticleDates(a).published,
);

function newestArticleDay(filter?: (a: BlogArticle) => boolean): string | null {
  return maxDay(
    ...publishedArticles
      .filter((a) => !filter || filter(a))
      .map((a) => getArticleDates(a).lastModified),
  );
}

const NO_VIDEOS = perLocale<ArticleVideo[]>(() => []);

// --- route discovery -------------------------------------------------------

/** Internal route of every page.tsx under src/app/[locale], e.g. "/arthra/[slug]". */
function discoverRoutes(): string[] {
  const routes: string[] = [];
  const walk = (dir: string, segments: string[]) => {
    for (const entry of fs.readdirSync(path.join(/*turbopackIgnore: true*/ ROOT, dir), {
      withFileTypes: true,
    })) {
      if (entry.isDirectory()) {
        const isGroup = /^\(.*\)$/.test(entry.name);
        walk(`${dir}/${entry.name}`, isGroup ? segments : [...segments, entry.name]);
      } else if (/^page\.(tsx|ts|jsx|js)$/.test(entry.name)) {
        routes.push(segments.length ? `/${segments.join("/")}` : "/");
      }
    }
  };
  walk(APP_DIR, []);
  return routes.sort();
}

// --- static routes ---------------------------------------------------------

function staticPage(route: string): Page {
  const page = pageFile(route);
  const paths = perLocale((l) => localizedPath(route, l));
  const make = (
    priority: number,
    files: (l: Locale) => string[],
    listing?: () => string | null,
  ): Page => ({
    paths,
    priority,
    lastmod: perLocale((l) => maxDay(lastModifiedDay(files(l)), listing?.() ?? null)),
    videos: NO_VIDEOS,
  });

  if (route === "/") {
    // Home renders featured schools, the latest articles and the `home` copy.
    return make(
      1.0,
      (l) => [page, schoolsDataFile(), `messages/${l}.json`],
      () => newestArticleDay(),
    );
  }
  if (route === "/scholes-odigon") {
    return make(0.8, () => [page, schoolsDataFile()]);
  }
  if (route === "/arthra") {
    return make(0.6, () => [page], () => newestArticleDay());
  }
  if (route === "/aporrito" || route === "/oroi") {
    return make(0.3, () => [page]);
  }
  const bestOf = Object.values(BEST_OF_CITIES).find(
    (c) => c.pathEl === paths.el,
  );
  if (bestOf) {
    return make(0.8, (l) => bestOfSourceFiles(bestOf, l));
  }
  // A new static page: included automatically with a neutral priority.
  return make(0.5, () => [page]);
}

// --- dynamic routes --------------------------------------------------------

function dynamicPages(route: string): Page[] {
  const page = pageFile(route);

  if (route === "/scholes-odigon/[slug]") {
    // One route serves both city listings and school detail pages.
    const cities: Page[] = CITIES.map((c) => ({
      paths: perLocale((l) => localizedPath(route, l, citySlug(c, l))),
      lastmod: perLocale(() =>
        lastModifiedDay([page, schoolsDataFile(), "src/lib/cityContent.ts"]),
      ),
      priority: 0.8,
      videos: NO_VIDEOS,
    }));
    const schools: Page[] = getAllSchools().map((s) => ({
      paths: perLocale((l) =>
        localizedPath(route, l, l === "el" ? s.slug_el : s.slug_en),
      ),
      lastmod: perLocale((l) =>
        lastModifiedDay([
          page,
          schoolsDataFile(),
          `scraper/data/generated/${s.id}_${l}.md`,
        ]),
      ),
      priority: 0.6,
      videos: NO_VIDEOS,
    }));
    return [...cities, ...schools];
  }

  if (route === "/arthra/[slug]") {
    // One route serves both blog category pages and articles.
    const categories: Page[] = BLOG_CATEGORIES.map((c) => ({
      paths: perLocale((l) =>
        localizedPath(route, l, l === "el" ? c.slug_el : c.slug_en),
      ),
      lastmod: perLocale(() =>
        maxDay(
          lastModifiedDay([page]),
          newestArticleDay((a) => a.categoryId === c.id),
        ),
      ),
      priority: 0.5,
      videos: NO_VIDEOS,
    }));
    const articles: Page[] = publishedArticles.map((a) => {
      const day = getArticleDates(a).lastModified;
      return {
        paths: perLocale((l) =>
          localizedPath(route, l, l === "el" ? a.slug_el : a.slug_en),
        ),
        lastmod: perLocale(() => day),
        priority: 0.7,
        videos: perLocale((l) => getArticleVideos(a, l)),
      };
    });
    return [...categories, ...articles];
  }

  if (route === "/arthrografoi/[slug]") {
    return Object.values(AUTHORS).map((author) => ({
      paths: perLocale((l) => localizedPath(route, l, author.slug)),
      lastmod: perLocale(() =>
        maxDay(
          lastModifiedDay([page, "src/lib/authors.ts"]),
          newestArticleDay((a) => a.authorSlug === author.slug),
        ),
      ),
      priority: 0.4,
      videos: NO_VIDEOS,
    }));
  }

  throw new Error(
    `[sitemap] dynamic route "${route}" has no expander in src/lib/sitemap.ts (dynamicPages). Add one so its URLs reach the sitemap.`,
  );
}

// --- entries ---------------------------------------------------------------

export interface SitemapEntry {
  loc: string;
  lastmod: string | null;
  priority: number;
  videos: ArticleVideo[];
}

const url = (p: string) => `${SITE_HOST}${p}`;

export function getSitemapEntries(): SitemapEntry[] {
  const pages = discoverRoutes().flatMap((route) =>
    route.includes("[") ? dynamicPages(route) : [staticPage(route)],
  );

  const entries: SitemapEntry[] = [];
  for (const page of pages) {
    for (const l of locales) {
      entries.push({
        loc: url(page.paths[l]),
        lastmod: page.lastmod[l],
        priority: page.priority,
        videos: page.videos[l],
      });
    }
  }

  const home = `${SITE_HOST}/`;
  return entries.sort((a, b) =>
    a.loc === home ? -1 : b.loc === home ? 1 : a.loc < b.loc ? -1 : a.loc > b.loc ? 1 : 0,
  );
}

// --- XML -------------------------------------------------------------------

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function videoXml(v: ArticleVideo): string {
  return [
    "<video:video>",
    `<video:thumbnail_loc>${esc(v.thumbnailUrl)}</video:thumbnail_loc>`,
    `<video:title>${esc(v.title)}</video:title>`,
    `<video:description>${esc(v.description)}</video:description>`,
    `<video:player_loc>${esc(v.playerUrl)}</video:player_loc>`,
    ...(v.durationSeconds !== null
      ? [`<video:duration>${v.durationSeconds}</video:duration>`]
      : []),
    `<video:publication_date>${v.publicationDate}</video:publication_date>`,
    "</video:video>",
  ].join("\n");
}

export function buildSitemapXml(): string {
  const body = getSitemapEntries().map((e) =>
    [
      "<url>",
      `<loc>${esc(e.loc)}</loc>`,
      ...(e.lastmod ? [`<lastmod>${e.lastmod}</lastmod>`] : []),
      "<changefreq>monthly</changefreq>",
      `<priority>${e.priority.toFixed(1)}</priority>`,
      ...e.videos.map(videoXml),
      "</url>",
    ].join("\n"),
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">',
    ...body,
    "</urlset>",
    "",
  ].join("\n");
}
