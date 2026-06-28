import type { MetadataRoute } from "next";

import {
  BLOG_ARTICLES,
  BLOG_CATEGORIES,
} from "@/lib/blog";
import { AUTHORS } from "@/lib/authors";
import { getAllSchools } from "@/lib/schools";
import { SITE_HOST } from "@/lib/seo";
import { citySlug } from "@/lib/slugs";
import { CITIES } from "@/lib/types";

const BEST_OF_SLUG_EL: Record<string, string> = {
  Nicosia: "lefkosia",
  Limassol: "lemesos",
  Larnaca: "larnaka",
  Paphos: "pafos",
  Paralimni: "paralimni",
};

const BEST_OF_SLUG_EN: Record<string, string> = {
  Nicosia: "nicosia",
  Limassol: "limassol",
  Larnaca: "larnaca",
  Paphos: "paphos",
  Paralimni: "paralimni",
};

/**
 * Sitemap covering every page in both locales. Greek is canonical; English
 * is announced via the `alternates.languages` map so search engines learn
 * the hreflang siblings from the sitemap directly.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Home
  entries.push({
    url: SITE_HOST,
    lastModified: updated,
    changeFrequency: "weekly",
    priority: 1,
    alternates: {
      languages: {
        "x-default": SITE_HOST,
        el: SITE_HOST,
        en: `${SITE_HOST}/en`,
      },
    },
  });

  // Listing root
  entries.push({
    url: `${SITE_HOST}/scholes-odigon`,
    lastModified: updated,
    changeFrequency: "weekly",
    priority: 0.8,
    alternates: {
      languages: {
        "x-default": `${SITE_HOST}/scholes-odigon`,
        el: `${SITE_HOST}/scholes-odigon`,
        en: `${SITE_HOST}/en/driving-schools`,
      },
    },
  });

  // City pages
  for (const c of CITIES) {
    const el = `${SITE_HOST}/scholes-odigon/${citySlug(c, "el")}`;
    const en = `${SITE_HOST}/en/driving-schools/${citySlug(c, "en")}`;
    entries.push({
      url: el,
      lastModified: updated,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: {
        languages: { "x-default": el, el, en },
      },
    });
  }

  // School detail pages
  for (const s of getAllSchools()) {
    const el = `${SITE_HOST}/scholes-odigon/${s.slug_el}`;
    const en = `${SITE_HOST}/en/driving-schools/${s.slug_en}`;
    entries.push({
      url: el,
      lastModified: updated,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: {
        languages: { "x-default": el, el, en },
      },
    });
  }

  // Blog index
  entries.push({
    url: `${SITE_HOST}/arthra`,
    lastModified: updated,
    changeFrequency: "weekly",
    priority: 0.7,
    alternates: {
      languages: {
        "x-default": `${SITE_HOST}/arthra`,
        el: `${SITE_HOST}/arthra`,
        en: `${SITE_HOST}/en/blog`,
      },
    },
  });

  // Blog categories
  for (const c of BLOG_CATEGORIES) {
    const el = `${SITE_HOST}/arthra/${c.slug_el}`;
    const en = `${SITE_HOST}/en/blog/${c.slug_en}`;
    entries.push({
      url: el,
      lastModified: updated,
      changeFrequency: "weekly",
      priority: 0.5,
      alternates: { languages: { "x-default": el, el, en } },
    });
  }

  // Blog articles
  for (const a of BLOG_ARTICLES) {
    const el = `${SITE_HOST}/arthra/${a.slug_el}`;
    const en = `${SITE_HOST}/en/blog/${a.slug_en}`;
    entries.push({
      url: el,
      lastModified: new Date(a.modifiedDate),
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: { languages: { "x-default": el, el, en } },
    });
  }

  // Best-of city pages
  for (const c of CITIES) {
    const el = `${SITE_HOST}/kalytera-scholes-odigon-${BEST_OF_SLUG_EL[c]}`;
    const en = `${SITE_HOST}/en/best-driving-schools-${BEST_OF_SLUG_EN[c]}`;
    entries.push({
      url: el,
      lastModified: updated,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: { "x-default": el, el, en },
      },
    });
  }

  // Author pages
  for (const author of Object.values(AUTHORS)) {
    const el = `${SITE_HOST}/arthrografoi/${author.slug}`;
    const en = `${SITE_HOST}/en/authors/${author.slug}`;
    entries.push({
      url: el,
      lastModified: updated,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: { languages: { "x-default": el, el, en } },
    });
  }

  // Legal
  for (const [pathEl, pathEn] of [
    ["/aporrito", "/en/privacy"],
    ["/oroi", "/en/terms"],
  ] as const) {
    entries.push({
      url: `${SITE_HOST}${pathEl}`,
      lastModified: updated,
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: {
        languages: {
          "x-default": `${SITE_HOST}${pathEl}`,
          el: `${SITE_HOST}${pathEl}`,
          en: `${SITE_HOST}${pathEn}`,
        },
      },
    });
  }

  return entries;
}
