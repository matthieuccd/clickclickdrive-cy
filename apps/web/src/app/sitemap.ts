import type { MetadataRoute } from "next";

import { getAllSchools } from "@/lib/schools";
import { SITE_HOST } from "@/lib/seo";
import { citySlug } from "@/lib/slugs";
import { CITIES } from "@/lib/types";

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
    url: `${SITE_HOST}/`,
    lastModified: updated,
    changeFrequency: "weekly",
    priority: 1,
    alternates: {
      languages: {
        "x-default": `${SITE_HOST}/`,
        el: `${SITE_HOST}/`,
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
