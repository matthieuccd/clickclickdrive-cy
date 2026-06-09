import type { CyprusCity, DrivingSchool, Locale } from "./types";

/**
 * Greek city → Latin-transliterated slug. Parity with scraper/slugs.py;
 * static because we only have 5 cities. If a Python-side slug ever changes,
 * update both halves.
 */
const CITY_SLUGS_EL: Record<CyprusCity, string> = {
  Nicosia: "lefkosia",
  Limassol: "lemesos",
  Larnaca: "larnaka",
  Paphos: "pafos",
  Paralimni: "paralimni",
};

const CITY_SLUGS_EN: Record<CyprusCity, string> = {
  Nicosia: "nicosia",
  Limassol: "limassol",
  Larnaca: "larnaca",
  Paphos: "paphos",
  Paralimni: "paralimni",
};

export function citySlug(city: CyprusCity, locale: Locale): string {
  return (locale === "el" ? CITY_SLUGS_EL : CITY_SLUGS_EN)[city];
}

export function schoolSlug(school: DrivingSchool, locale: Locale): string {
  return locale === "el" ? school.slug_el : school.slug_en;
}

/** Public URL for a school, locale-correct including the URL prefix. */
export function schoolHref(school: DrivingSchool, locale: Locale): string {
  return locale === "el"
    ? `/scholes-odigon/${school.slug_el}`
    : `/en/driving-schools/${school.slug_en}`;
}

/** Public URL for a city listing. */
export function cityHref(city: CyprusCity, locale: Locale): string {
  return locale === "el"
    ? `/scholes-odigon/${CITY_SLUGS_EL[city]}`
    : `/en/driving-schools/${CITY_SLUGS_EN[city]}`;
}

export function listingHref(locale: Locale): string {
  return locale === "el" ? "/scholes-odigon" : "/en/driving-schools";
}

/** Best-fit name for a school in a given locale (with the usual fallbacks). */
export function displayName(school: DrivingSchool, locale: Locale): string {
  if (locale === "el") {
    return school.name_el ?? school.name_en ?? school.name;
  }
  return school.name_en ?? school.name_el ?? school.name;
}

/**
 * Reverse: given a URL slug + locale, identify whether it's a city or a school
 * (or neither). Used by the dispatch route at /scholes-odigon/[slug].
 */
export type SlugLookup =
  | { kind: "city"; city: CyprusCity }
  | { kind: "school"; school: DrivingSchool }
  | { kind: "none" };

export function lookupSlug(
  slug: string,
  locale: Locale,
  schools: DrivingSchool[],
): SlugLookup {
  const cityMap = locale === "el" ? CITY_SLUGS_EL : CITY_SLUGS_EN;
  for (const [city, citySlugValue] of Object.entries(cityMap)) {
    if (citySlugValue === slug) {
      return { kind: "city", city: city as CyprusCity };
    }
  }
  const match = schools.find((s) =>
    locale === "el" ? s.slug_el === slug : s.slug_en === slug,
  );
  if (match) return { kind: "school", school: match };
  return { kind: "none" };
}
