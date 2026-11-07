import type { Locale } from "./types";

/**
 * Single source of truth for article dates. The article page (visible dates),
 * the Article JSON-LD and the sitemap `lastmod` all read through
 * `getArticleDates`, so the three can never disagree.
 *
 * All dates are calendar days in UTC, formatted `YYYY-MM-DD`.
 */

/**
 * Normalises a date-ish string to `YYYY-MM-DD` (UTC), or null when it is empty
 * or not a real calendar date. Date-only input is validated as-is; a full ISO
 * timestamp is converted to its UTC day.
 */
export function toDay(value: string | null | undefined): string | null {
  if (!value) return null;
  const v = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const d = new Date(`${v}T00:00:00Z`);
    return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v
      ? null
      : v;
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

/** Formats a `YYYY-MM-DD` day for display. Always UTC, so it cannot shift a day. */
export function formatDay(day: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "el" ? "el-CY" : "en-CY", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));
}

export interface ArticleDates {
  /** Published day, or null for an unpublished stub. */
  published: string | null;
  /**
   * Day to show as "Updated". Only set when a modified date exists AND is
   * later than the published date (compared by day), else null.
   */
  updated: string | null;
  /**
   * Day for schema `dateModified` and sitemap `lastmod`: the modified date
   * when it is later than the published date, otherwise the published date.
   */
  lastModified: string | null;
}

export function getArticleDates(article: {
  publishedDate: string;
  modifiedDate?: string;
}): ArticleDates {
  const published = toDay(article.publishedDate);
  const modified = toDay(article.modifiedDate);
  // ISO days compare correctly as strings.
  const updated =
    published && modified && modified > published ? modified : null;
  return { published, updated, lastModified: updated ?? published };
}
