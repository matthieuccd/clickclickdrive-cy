"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";

import type { Locale } from "@/lib/types";

interface SlugPair {
  el: string;
  en: string;
}

interface Props {
  schoolPairs: SlugPair[];
  articlePairs: SlugPair[];
  cityPairs: SlugPair[];
  bestOfPairs: SlugPair[];
  className?: string;
}

export function LanguageSwitcher({
  schoolPairs,
  articlePairs,
  cityPairs,
  bestOfPairs,
  className,
}: Props) {
  const rawPath = usePathname();

  // Derive the current locale purely from the URL path.
  // With localePrefix:"as-needed", /en/... = English; everything else = Greek.
  // This avoids any useLocale() hydration lag that could set the wrong target.
  const isEnglish = rawPath.startsWith("/en/") || rawPath === "/en";
  const target: Locale = isEnglish ? "el" : "en";
  const targetLabel = isEnglish ? "ΕΛ" : "EN";

  const altHref = buildAltHref(rawPath, target, schoolPairs, articlePairs, cityPairs, bestOfPairs);

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

// Bidirectional lookup - works whether `slug` is the el or en variant.
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
  bestOfPairs: SlugPair[],
): string {
  // Strip /en prefix. startsWith("/en/") guards against paths like /entry.
  const path =
    rawPath.startsWith("/en/") ? rawPath.slice(3)
    : rawPath === "/en"       ? "/"
    : rawPath;

  const pre = target === "el" ? "" : "/en";

  // School/city - match either locale's segment so both the user-visible URL
  // (/driving-schools/...) and the internally-rewritten path (/scholes-odigon/...)
  // are handled correctly.
  const schoolMatch = path.match(/^\/(scholes-odigon|driving-schools)\/([^/?#]+)\/?$/);
  if (schoolMatch) {
    const slug = decodeURIComponent(schoolMatch[2]);
    const altSlug = findAlt(slug, [...cityPairs, ...schoolPairs], target) ?? slug;
    return `${pre}/${target === "el" ? "scholes-odigon" : "driving-schools"}/${altSlug}`;
  }
  if (path.match(/^\/(scholes-odigon|driving-schools)\/?$/)) {
    return `${pre}/${target === "el" ? "scholes-odigon" : "driving-schools"}`;
  }

  // Article - match /arthra/<slug> and /blog/<slug>
  const articleMatch = path.match(/^\/(arthra|blog)\/([^/?#]+)\/?$/);
  if (articleMatch) {
    const slug = decodeURIComponent(articleMatch[2]);
    const altSlug = findAlt(slug, articlePairs, target) ?? slug;
    return `${pre}/${target === "el" ? "arthra" : "blog"}/${altSlug}`;
  }
  if (path.match(/^\/(arthra|blog)\/?$/)) {
    return `${pre}/${target === "el" ? "arthra" : "blog"}`;
  }

  // Best-of city pages - /kalytera-scholes-odigon-{slug} ↔ /en/best-driving-schools-{slug}
  const bestOfMatch = path.match(/^\/(kalytera-scholes-odigon|best-driving-schools)-([^/?#]+)\/?$/);
  if (bestOfMatch) {
    const slug = decodeURIComponent(bestOfMatch[2]);
    const altSlug = findAlt(slug, bestOfPairs, target) ?? slug;
    return target === "el"
      ? `/kalytera-scholes-odigon-${altSlug}`
      : `/en/best-driving-schools-${altSlug}`;
  }

  // Static pages - match either locale variant
  if (path === "/aporrito" || path === "/privacy") {
    return target === "el" ? "/aporrito" : "/en/privacy";
  }
  if (path === "/oroi" || path === "/terms") {
    return target === "el" ? "/oroi" : "/en/terms";
  }

  return target === "el" ? "/" : "/en";
}
