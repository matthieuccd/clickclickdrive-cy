"use client";

import { useLocale } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";

/**
 * Switches between el and en preserving the user's current page.
 *
 * `usePathname()` from next-intl returns the *canonical* path (matching the
 * Greek pathname template), e.g.:
 *
 *   /scholes-odigon/scholi-odigon-leykosias-bfd5d8   (current locale el)
 *   /scholes-odigon/nicosia-driving-school-bfd5d8    (current locale en)
 *
 * The static prefix is auto-translated by next-intl when we hand the URL to
 * <Link locale={other}>. The dynamic slug is NOT — it stays verbatim. So we
 * must swap the slug to the equivalent in the target locale before passing
 * it to Link. The slug-pair maps come from the server (Header.tsx).
 */

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
  const pathname = usePathname();

  const schoolMap = makeMap(schoolPairs, locale);
  const articleMap = makeMap(articlePairs, locale);
  const cityMap = makeMap(cityPairs, locale);

  const altPath = computeAltPath(pathname, schoolMap, articleMap, cityMap);

  return (
    <Link
      href={altPath as Parameters<typeof Link>[0]["href"]}
      locale={otherLocale}
      className={className}
      aria-label={otherLocale === "el" ? "Ελληνικά" : "English"}
    >
      {otherLabel}
    </Link>
  );
}

function makeMap(pairs: SlugPair[], currentLocale: Locale): Record<string, string> {
  const map: Record<string, string> = {};
  for (const p of pairs) {
    if (currentLocale === "el") {
      map[p.el] = p.en;
    } else {
      map[p.en] = p.el;
    }
  }
  return map;
}

function computeAltPath(
  canonicalPath: string,
  schoolMap: Record<string, string>,
  articleMap: Record<string, string>,
  cityMap: Record<string, string>,
): string {
  const schoolMatch = canonicalPath.match(/^\/scholes-odigon\/([^/?#]+)\/?$/);
  if (schoolMatch) {
    const slug = decodeURIComponent(schoolMatch[1]);
    if (cityMap[slug]) return `/scholes-odigon/${cityMap[slug]}`;
    if (schoolMap[slug]) return `/scholes-odigon/${schoolMap[slug]}`;
    return canonicalPath;
  }

  const articleMatch = canonicalPath.match(/^\/arthra\/([^/?#]+)\/?$/);
  if (articleMatch) {
    const slug = decodeURIComponent(articleMatch[1]);
    if (articleMap[slug]) return `/arthra/${articleMap[slug]}`;
    return canonicalPath;
  }

  return canonicalPath;
}
