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
  const target: Locale = locale === "el" ? "en" : "el";
  const targetLabel = locale === "el" ? "EN" : "ΕΛ";
  const rawPath = usePathname();

  const altHref = buildAltHref(
    rawPath,
    target,
    schoolPairs,
    articlePairs,
    cityPairs,
  );

  return (
    <NextLink
      href={altHref}
      className={className}
      aria-label={target === "el" ? "Ελληνικά" : "English"}
    >
      {targetLabel}
    </NextLink>
  );
}

// Bidirectional lookup: works whether `slug` is the el or en variant.
function findAlt(slug: string, pairs: SlugPair[], target: Locale): string | undefined {
  for (const p of pairs) {
    if (p.el === slug) return target === "en" ? p.en : p.el;
    if (p.en === slug) return target === "el" ? p.el : p.en;
  }
  return undefined;
}

function buildAltHref(
  rawPath: string,
  target: Locale,
  schoolPairs: SlugPair[],
  articlePairs: SlugPair[],
  cityPairs: SlugPair[],
): string {
  // Strip /en prefix. Use startsWith("/en/") to avoid clobbering paths like /entry.
  const path =
    rawPath.startsWith("/en/") ? rawPath.slice(3)
    : rawPath === "/en"       ? "/"
    : rawPath;

  const pre = target === "el" ? "" : "/en";

  // School/city detail — match EITHER locale's segment name so we handle both
  // the user-visible URL (/driving-schools/...) and the internally-rewritten
  // canonical path (/scholes-odigon/...) that usePathname may return.
  const schoolMatch = path.match(/^\/(scholes-odigon|driving-schools)\/([^/?#]+)\/?$/);
  if (schoolMatch) {
    const slug = decodeURIComponent(schoolMatch[2]);
    const allSchool = [...cityPairs, ...schoolPairs];
    const altSlug = findAlt(slug, allSchool, target) ?? slug;
    return `${pre}/${target === "el" ? "scholes-odigon" : "driving-schools"}/${altSlug}`;
  }
  if (path.match(/^\/(scholes-odigon|driving-schools)\/?$/)) {
    return `${pre}/${target === "el" ? "scholes-odigon" : "driving-schools"}`;
  }

  // Article detail — match /arthra/<slug> AND /blog/<slug>
  const articleMatch = path.match(/^\/(arthra|blog)\/([^/?#]+)\/?$/);
  if (articleMatch) {
    const slug = decodeURIComponent(articleMatch[2]);
    const altSlug = findAlt(slug, articlePairs, target) ?? slug;
    return `${pre}/${target === "el" ? "arthra" : "blog"}/${altSlug}`;
  }
  if (path.match(/^\/(arthra|blog)\/?$/)) {
    return `${pre}/${target === "el" ? "arthra" : "blog"}`;
  }

  // Static pages — match either locale variant
  if (path === "/aporrito" || path === "/privacy") {
    return target === "el" ? "/aporrito" : "/en/privacy";
  }
  if (path === "/oroi" || path === "/terms") {
    return target === "el" ? "/oroi" : "/en/terms";
  }

  return target === "el" ? "/" : "/en";
}
