import { articleTitle, loadArticleBody, type BlogArticle } from "./blog";
import { getArticleDates, toDay } from "./dates";
import type { Locale } from "./types";

/**
 * Single data source for article videos. The `{{video:<youtube_id>}}` token in
 * an article body is the only place a video is declared. Everything that needs
 * video facts reads them from here:
 *
 *   - BlogProse           (renders the embed; uses `videoIdFromBlock`)
 *   - article VideoObject (JSON-LD, via `buildVideoObjectJsonLd`)
 *   - sitemap.xml         (`<video:video>`, via `getArticleVideos`)
 *
 * Optional per-video facts the token cannot carry (a dedicated title,
 * description, exact duration, upload date) go in `VIDEO_META`, keyed by
 * YouTube id. Anything not listed falls back to the article's own title,
 * description and published date. Duration has no fallback and is omitted
 * when unknown (it is optional in both schema.org and the sitemap spec).
 */

export interface VideoMeta {
  title_en?: string;
  title_el?: string;
  description_en?: string;
  description_el?: string;
  /** Whole seconds. */
  durationSeconds?: number;
  /** `YYYY-MM-DD` upload date on YouTube. */
  uploadDate?: string;
}

export const VIDEO_META: Record<string, VideoMeta> = {};

/** Matches one markdown block that is exactly a video token. */
export const VIDEO_TOKEN_RE = /^\{\{video:([^}]+)\}\}$/;

export function videoIdFromBlock(block: string): string | null {
  const m = VIDEO_TOKEN_RE.exec(block.trim());
  return m ? m[1].trim() : null;
}

/** Video ids in document order, de-duplicated. */
export function extractVideoIds(markdown: string): string[] {
  const ids: string[] = [];
  for (const block of markdown.split(/\n{2,}/)) {
    const id = videoIdFromBlock(block);
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

export interface ArticleVideo {
  id: string;
  /** At most 100 characters. */
  title: string;
  /** At most 2048 characters. */
  description: string;
  thumbnailUrl: string;
  playerUrl: string;
  /** Whole seconds, or null when unknown. */
  durationSeconds: number | null;
  /** `YYYY-MM-DD`. */
  publicationDate: string;
}

function clip(text: string, max: number): string {
  const chars = Array.from(text.trim());
  return chars.length <= max ? chars.join("") : chars.slice(0, max - 1).join("") + "…";
}

export function getArticleVideos(
  article: BlogArticle,
  locale: Locale,
): ArticleVideo[] {
  const body = loadArticleBody(article.id, locale);
  if (!body) return [];
  const isEl = locale === "el";
  const fallbackDescription = isEl
    ? article.metaDescription_el
    : article.metaDescription_en;
  const fallbackDate = getArticleDates(article).published;

  const videos: ArticleVideo[] = [];
  for (const id of extractVideoIds(body)) {
    const meta = VIDEO_META[id] ?? {};
    const publicationDate = toDay(meta.uploadDate) ?? fallbackDate;
    if (!publicationDate) continue; // unpublished stub: nothing reliable to say
    const seconds = meta.durationSeconds;
    videos.push({
      id,
      title: clip(
        (isEl ? meta.title_el : meta.title_en) ?? articleTitle(article, locale),
        100,
      ),
      description: clip((isEl ? meta.description_el : meta.description_en) ?? fallbackDescription, 2048),
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      playerUrl: `https://www.youtube-nocookie.com/embed/${id}`,
      durationSeconds:
        typeof seconds === "number" && seconds > 0 ? Math.round(seconds) : null,
      publicationDate,
    });
  }
  return videos;
}

/** Whole seconds to an ISO 8601 duration, e.g. 125 -> "PT2M5S". */
function isoDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${s || (!h && !m) ? `${s}S` : ""}`;
}

export function buildVideoObjectJsonLd(video: ArticleVideo) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    thumbnailUrl: [video.thumbnailUrl],
    uploadDate: video.publicationDate,
    embedUrl: video.playerUrl,
    ...(video.durationSeconds !== null
      ? { duration: isoDuration(video.durationSeconds) }
      : {}),
  };
}
