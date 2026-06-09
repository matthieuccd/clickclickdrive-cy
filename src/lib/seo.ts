import type { CyprusCity, DrivingSchool, Locale } from "./types";

/**
 * The public host. In production this should be set from env, but since the
 * domain is final we can hardcode it for now and override later.
 */
export const SITE_HOST = "https://clickclickdrive.com.cy";

export function siteUrl(path: string): string {
  return `${SITE_HOST}${path.startsWith("/") ? path : `/${path}`}`;
}

// --- LocalBusiness (school detail page) -----------------------------------

export function buildLocalBusinessJsonLd(
  school: DrivingSchool,
  canonicalUrl: string,
) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "DrivingSchool",
    name: school.name,
    "@id": canonicalUrl,
    url: canonicalUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: school.location.formatted_address ?? undefined,
      addressLocality: school.location.city ?? undefined,
      addressCountry: "CY",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: school.location.lat,
      longitude: school.location.lon,
    },
  };
  if (school.phone_e164) data.telephone = school.phone_e164;
  if (school.website) data.sameAs = [school.website];
  if (school.opening_hours.length > 0) {
    data.openingHours = school.opening_hours;
  }
  if (school.rating !== null && school.review_count !== null) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: school.rating,
      reviewCount: school.review_count,
      bestRating: 5,
      worstRating: 1,
    };
  }
  if (school.photo_paths.length > 0) {
    data.image = school.photo_paths.map((p) => siteUrl(p));
  }
  return data;
}

// --- ItemList (city page) -------------------------------------------------

export function buildCityItemListJsonLd(
  city: CyprusCity,
  schools: DrivingSchool[],
  locale: Locale,
  schoolUrlFor: (s: DrivingSchool) => string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name:
      locale === "el"
        ? `Σχολές οδηγών στη(ν) ${city}`
        : `Driving schools in ${city}`,
    numberOfItems: schools.length,
    itemListElement: schools.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: siteUrl(schoolUrlFor(s)),
      name: s.name,
    })),
  };
}

// --- WebSite + SearchAction (homepage) -----------------------------------

export function buildWebSiteJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: siteUrl(locale === "el" ? "/" : "/en"),
    name: "ClickClickDrive Cyprus",
    inLanguage: locale === "el" ? "el-CY" : "en-CY",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: siteUrl(
          locale === "el"
            ? "/scholes-odigon?city={search_term_string}"
            : "/en/driving-schools?city={search_term_string}",
        ),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// --- Metadata helpers (alternates / openGraph) ----------------------------

export interface PageAlternates {
  canonical: string;
  languages: Record<string, string>;
}

export function buildAlternates({
  pathEl,
  pathEn,
}: {
  pathEl: string;
  pathEn: string;
}): PageAlternates {
  // Greek URL is canonical (Cyprus is a Greek-primary market).
  return {
    canonical: siteUrl(pathEl),
    languages: {
      "x-default": siteUrl(pathEl),
      el: siteUrl(pathEl),
      en: siteUrl(pathEn),
    },
  };
}
