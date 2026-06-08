import { getTranslations, setRequestLocale } from "next-intl/server";

import { CityChip } from "@/components/CityChip";
import { SchoolCard } from "@/components/SchoolCard";
import { SearchBar } from "@/components/SearchBar";
import { Link } from "@/i18n/navigation";
import {
  getAllSchools,
  getCityCounts,
  getFeaturedSchools,
} from "@/lib/schools";
import { CITIES } from "@/lib/types";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const total = getAllSchools().length;
  const counts = getCityCounts();
  const featured = getFeaturedSchools(6);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-light/60 via-background to-background">
        <div className="mx-auto max-w-6xl px-4 pt-12 pb-16 sm:px-6 sm:pt-20 sm:pb-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl md:text-6xl">
              {t("home.heroTitle")}
            </h1>
            <p className="mt-5 text-lg text-text-secondary sm:text-xl">
              {t("home.heroSubtitle")}
            </p>
          </div>
          <div className="mt-8 max-w-2xl">
            <SearchBar locale={locale} />
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Dot /> {t("home.stats.schools", { count: total })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Dot /> {t("home.stats.cities", { count: CITIES.length })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Dot /> {t("home.stats.free")}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("home.popularCities")}
          </h2>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {CITIES.map((c) => (
            <CityChip key={c} city={c} count={counts[c]} />
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("home.featuredSchools")}
            </h2>
            <Link
              href="/schools"
              className="text-sm font-semibold text-brand hover:text-brand-dark"
            >
              {t("home.viewAll")} →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((s) => (
              <SchoolCard key={s.id} school={s} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function Dot() {
  return (
    <span
      aria-hidden="true"
      className="h-1.5 w-1.5 rounded-full bg-brand"
    />
  );
}
