"use client";

import NextLink from "next/link";
import { useLocale } from "next-intl";

import { usePathname } from "@/i18n/navigation";
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
  const canonicalPath = usePathname() ?? "/";

  const schoolMap = makeMap(schoolPairs, locale);
  const articleMap = makeMap(articlePairs, locale);
  const cityMap = makeMap(cityPairs, locale);

  const altHref = buildAltHref(canonicalPath, otherLocale, schoolMap, articleMap, cityMap);

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
  canonicalPath: string,
  target: Locale,
  schoolMap: Record<string, string>,
  articleMap: Record<string, string>,
  cityMap: Record<string, string>,
): string {
  const pre = target === "el" ? "" : "/en";

  const schoolMatch = canonicalPath.match(/^\/scholes-odigon\/([^/?#]+)\/?$/);
  if (schoolMatch) {
    const slug = decodeURIComponent(schoolMatch[1]);
    const altSlug = cityMap[slug] ?? schoolMap[slug] ?? slug;
    const seg = target === "el" ? "scholes-odigon" : "driving-schools";
    return `${pre}/${seg}/${altSlug}`;
  }
  if (canonicalPath === "/scholes-odigon" || canonicalPath === "/scholes-odigon/") {
    return `${pre}/${target === "el" ? "scholes-odigon" : "driving-schools"}`;
  }

  const articleMatch = canonicalPath.match(/^\/arthra\/([^/?#]+)\/?$/);
  if (articleMatch) {
    const slug = decodeURIComponent(articleMatch[1]);
    const altSlug = articleMap[slug] ?? slug;
    return `${pre}/${target === "el" ? "arthra" : "blog"}/${altSlug}`;
  }
  if (canonicalPath === "/arthra" || canonicalPath === "/arthra/") {
    return `${pre}/${target === "el" ? "arthra" : "blog"}`;
  }

  if (canonicalPath === "/aporrito" || canonicalPath === "/aporrito/") {
    return target === "el" ? "/aporrito" : "/en/privacy";
  }
  if (canonicalPath === "/oroi" || canonicalPath === "/oroi/") {
    return target === "el" ? "/oroi" : "/en/terms";
  }

  return target === "el" ? "/" : "/en";
}
