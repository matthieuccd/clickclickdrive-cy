import type { CyprusCity, DrivingSchool, Locale } from "./types";

/**
 * The public host. In production this should be set from env, but since the
 * domain is final we can hardcode it for now and override later.
 */
export const SITE_HOST = "https://clickclickdrive-cyprus.com";

export function siteUrl(path: string): string {
  if (path === "/" || path === "") return SITE_HOST;
  return `${SITE_HOST}${path.startsWith("/") ? path : `/${path}`}`;
}

// --- Opening hours helpers ------------------------------------------------

const GREEK_DAY: Record<string, string> = {
  "Δευτέρα": "Mo",
  "Τρίτη": "Tu",
  "Τετάρτη": "We",
  "Πέμπτη": "Th",
  "Παρασκευή": "Fr",
  "Σάββατο": "Sa",
  "Κυριακή": "Su",
};

function to24h(time: string, period: string): string {
  const [hStr, mStr] = time.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr.padStart(2, "0");
  const isAm = period.startsWith("π"); // π.μ. = AM
  if (isAm) {
    if (h === 12) h = 0;
  } else {
    if (h !== 12) h += 12;
  }
  return `${String(h).padStart(2, "0")}:${m}`;
}

// Converts Google Places Greek-localized opening hours to Schema.org format.
// Input:  "Δευτέρα: 8:00 π.μ. – 5:00 μ.μ."  →  Output: "Mo 08:00-17:00"
// Closed: "Σάββατο: Κλειστά"                  →  omitted
function convertOpeningHours(lines: string[]): string[] {
  const result: string[] = [];
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const dayEl = line.slice(0, colonIdx).trim();
    const rest = line.slice(colonIdx + 1).trim();
    const dayCode = GREEK_DAY[dayEl];
    if (!dayCode || rest === "Κλειστά") continue;

    // "8:00 π.μ. – 5:00 μ.μ." - split on en-dash
    const halves = rest.split("–").map((s) => s.trim());
    if (halves.length !== 2) continue;

    const parseHalf = (s: string): string | null => {
      const m = s.match(/(\d+:\d+)\s+(π\.μ\.|μ\.μ\.)/);
      return m ? to24h(m[1], m[2]) : null;
    };
    const open = parseHalf(halves[0]);
    const close = parseHalf(halves[1]);
    if (!open || !close) continue;
    result.push(`${dayCode} ${open}-${close}`);
  }
  return result;
}

// --- Address helpers ------------------------------------------------------

// Splits a Google Places formatted_address into street + postal code.
// e.g. "Archiepiskopou Makariou III 75d, Λευκωσία 1070, Κύπρος"
//   → streetAddress: "Archiepiskopou Makariou III 75d", postalCode: "1070"
function parseStreetAndPostal(formatted: string): {
  streetAddress: string | undefined;
  postalCode: string | undefined;
} {
  const streetAddress = formatted.split(",")[0]?.trim() || undefined;
  const postalMatch = formatted.match(/\b(\d{4})\b/);
  const postalCode = postalMatch?.[1];
  return { streetAddress, postalCode };
}

// --- LocalBusiness (school detail page) -----------------------------------

export function buildLocalBusinessJsonLd(
  school: DrivingSchool,
  canonicalUrl: string,
) {
  const { streetAddress, postalCode } = school.location.formatted_address
    ? parseStreetAndPostal(school.location.formatted_address)
    : { streetAddress: undefined, postalCode: undefined };

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "DrivingSchool",
    name: school.name,
    "@id": canonicalUrl,
    url: canonicalUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress,
      postalCode,
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
  const schemaHours = convertOpeningHours(school.opening_hours);
  if (schemaHours.length > 0) {
    data.openingHours = schemaHours;
  }
  if (school.rating !== null && school.review_count !== null) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: String(school.rating),
      reviewCount: school.review_count,
      bestRating: "5",
      worstRating: "1",
    };
  }
  if (school.photo_paths.length > 0) {
    data.image = school.photo_paths.map((p) => ({
      "@type": "ImageObject",
      url: siteUrl(p),
      width: 800,
      height: 600,
    }));
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

// --- Organization (site-wide) ---------------------------------------------

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_HOST}/#organization`,
    name: "ClickClickDrive Cyprus",
    url: SITE_HOST,
    logo: {
      "@type": "ImageObject",
      url: siteUrl("/logo.svg"),
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: "info@clickclickdrive-cyprus.com",
      contactType: "customer support",
      areaServed: "CY",
    },
    sameAs: ["https://www.clickclickdrive.de"],
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
  locale,
  pathEl,
  pathEn,
}: {
  locale: Locale;
  pathEl: string;
  pathEn: string;
}): PageAlternates {
  return {
    canonical: siteUrl(locale === "el" ? pathEl : pathEn),
    languages: {
      "x-default": siteUrl(pathEl),
      el: siteUrl(pathEl),
      en: siteUrl(pathEn),
    },
  };
}
