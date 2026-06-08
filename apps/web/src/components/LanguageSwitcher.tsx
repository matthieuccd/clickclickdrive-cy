"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

import type { Locale } from "@/lib/types";

interface SlugPair {
  el: string;
  en: string;
}

interface Props {
  schoolPairs: SlugPair[];
  articlePairs: SlugPair[];
  cityPairs: SlugPair[];
  className?: string;
}

export function LanguageSwitcher({
  schoolPairs,
  articlePairs,
  cityPairs,
  className,
}: Props) {
  const locale = useLocale() as Locale;
  const otherLocale: Locale = locale === "el" ? "en" : "el";
  const otherLabel = locale === "el" ? "EN" : "ΕΛ";
  // next/navigation usePathname returns the real browser URL (e.g.
  // "/en/blog/how-to-get-driving-licence-cyprus-foreigner"), not the
  // next-intl canonical template ("/arthra/[slug]").
  const rawPath = usePathname();

  const schoolMap = makeMap(schoolPairs, locale);
  const articleMap = makeMap(articlePairs, locale);
  const cityMap = makeMap(cityPairs, locale);

  const altHref = buildAltHref(rawPath, locale, otherLocale, schoolMap, articleMap, cityMap);

  return (
    <NextLink
      href={altHref}
      className={className}
      aria-label={otherLocale === "el" ? "Ελληνικά" : "English"}
    >
      {otherLabel}
    </NextLink>
  );
}

function makeMap(pairs: SlugPair[], currentLocale: Locale): Record<string, string> {
  const map: Record<string, string> = {};
  for (const p of pairs) {
    map[currentLocale === "el" ? p.el : p.en] = currentLocale === "el" ? p.en : p.el;
  }
  return map;
}

function buildAltHref(
  rawPath: string,
  currentLocale: Locale,
  target: Locale,
  schoolMap: Record<string, string>,
  articleMap: Record<string, string>,
  cityMap: Record<string, string>,
): string {
  // Strip the /en prefix (localePrefix = "as-needed": only English is prefixed)
  const path =
    currentLocale === "en" && rawPath.startsWith("/en")
      ? rawPath.slice(3) || "/"
      : rawPath;

  const pre = target === "el" ? "" : "/en";

  // School/city detail — Greek: /scholes-odigon/<slug>, English: /driving-schools/<slug>
  const schoolSeg = currentLocale === "el" ? "scholes-odigon" : "driving-schools";
  const schoolMatch = path.match(new RegExp(`^\\/${schoolSeg}\\/([^/?#]+)\\/?$`));
  if (schoolMatch) {
    const slug = decodeURIComponent(schoolMatch[1]);
    const altSlug = cityMap[slug] ?? schoolMap[slug] ?? slug;
    return `${pre}/${target === "el" ? "scholes-odigon" : "driving-schools"}/${altSlug}`;
  }
  if (path === `/${schoolSeg}` || path === `/${schoolSeg}/`) {
    return `${pre}/${target === "el" ? "scholes-odigon" : "driving-schools"}`;
  }

  // Article detail — Greek: /arthra/<slug>, English: /blog/<slug>
  const articleSeg = currentLocale === "el" ? "arthra" : "blog";
  const articleMatch = path.match(new RegExp(`^\\/${articleSeg}\\/([^/?#]+)\\/?$`));
  if (articleMatch) {
    const slug = decodeURIComponent(articleMatch[1]);
    const altSlug = articleMap[slug] ?? slug;
    return `${pre}/${target === "el" ? "arthra" : "blog"}/${altSlug}`;
  }
  if (path === `/${articleSeg}` || path === `/${articleSeg}/`) {
    return `${pre}/${target === "el" ? "arthra" : "blog"}`;
  }

  // Static pages
  const privacySeg = currentLocale === "el" ? "aporrito" : "privacy";
  if (path === `/${privacySeg}` || path === `/${privacySeg}/`) {
    return target === "el" ? "/aporrito" : "/en/privacy";
  }
  const termsSeg = currentLocale === "el" ? "oroi" : "terms";
  if (path === `/${termsSeg}` || path === `/${termsSeg}/`) {
    return target === "el" ? "/oroi" : "/en/terms";
  }

  return target === "el" ? "/" : "/en";
}
