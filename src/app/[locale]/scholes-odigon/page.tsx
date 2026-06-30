import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { JsonLd } from "@/components/JsonLd";
import { SchoolCard } from "@/components/SchoolCard";
import { Link } from "@/i18n/navigation";
import { getAllSchools, getCityCounts } from "@/lib/schools";
import { buildAlternates, siteUrl } from "@/lib/seo";
import { cityHref } from "@/lib/slugs";
import { CITIES, type Locale } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title =
    locale === "el"
      ? "Όλες οι σχολές οδηγών στην Κύπρο"
      : "All driving schools in Cyprus";
  const description =
    locale === "el"
      ? "Όλες οι σχολές οδηγών σε Λευκωσία, Λεμεσό, Λάρνακα, Πάφο και Παραλίμνι. Αξιολογήσεις και ωράρια."
      : "Every driving school in Nicosia, Limassol, Larnaca, Paphos, and Paralimni. Ratings and opening hours.";
  return {
    title,
    description,
    alternates: buildAlternates({
      locale: locale as Locale,
      pathEl: "/scholes-odigon",
      pathEn: "/en/driving-schools",
    }),
    openGraph: {
      title,
      description,
      url: siteUrl(locale === "el" ? "/scholes-odigon" : "/en/driving-schools"),
      type: "website",
      locale: locale === "el" ? "el_CY" : "en_CY",
    },
  };
}

export default async function ListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ city?: string }>;
}) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const t = await getTranslations();
  const { city: cityParam } = await searchParams;

  // If ?city=… is supplied, redirect concept: we just render filtered.
  const cityFilter =
    cityParam && (CITIES as readonly string[]).includes(cityParam)
      ? (cityParam as (typeof CITIES)[number])
      : null;

  const all = getAllSchools();
  const counts = getCityCounts();
  const schools = cityFilter
    ? all.filter((s) => s.location.city === cityFilter)
    : all;
  const sorted = [...schools].sort((a, b) => {
    const ar = a.rating ?? -1;
    const br = b.rating ?? -1;
    if (br !== ar) return br - ar;
    return (b.review_count ?? 0) - (a.review_count ?? 0);
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {cityFilter
            ? t("list.titleInCity", { city: t(`cities.${cityFilter}`) })
            : t("list.title")}
        </h1>
        <p className="mt-2 text-text-muted">
          {t("list.resultCount", { count: sorted.length })}
        </p>
      </header>

      <div
        className="mb-8 flex flex-wrap gap-2"
        role="group"
        aria-label={t("list.filterByCity")}
      >
        <FilterChip active={cityFilter === null} href="/scholes-odigon" locale={locale}>
          {t("cities.all")}
        </FilterChip>
        {CITIES.map((c) => (
          <FilterChip
            key={c}
            active={cityFilter === c}
            href={cityHref(c, locale)}
            locale={locale}
          >
            {t(`cities.${c}`)}
            <span className="ml-1 text-text-muted">({counts[c]})</span>
          </FilterChip>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center text-text-muted">
          {t("list.empty")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((s) => (
            <SchoolCard key={s.id} school={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  href,
  children,
  locale,
}: {
  active: boolean;
  href: string;
  children: React.ReactNode;
  locale: Locale;
}) {
  const base = "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors";
  const styles = active
    ? "border-brand bg-brand text-white"
    : "border-border bg-surface text-text-primary hover:border-brand hover:text-brand";
  // We use a raw anchor for direct href strings (city URLs are already
  // locale-correct via cityHref); next-intl Link is for canonical paths.
  return (
    <a href={href} className={`${base} ${styles}`}>
      {children}
    </a>
  );
}
