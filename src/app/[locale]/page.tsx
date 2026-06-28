import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ArticleCard } from "@/components/ArticleCard";
import { CityChip } from "@/components/CityChip";
import { JsonLd } from "@/components/JsonLd";
import { SchoolCard } from "@/components/SchoolCard";
import { SearchBar } from "@/components/SearchBar";
import { Link } from "@/i18n/navigation";
import { blogIndexHref, getLatestArticles } from "@/lib/blog";
import {
  getAllSchools,
  getCityCounts,
  getFeaturedSchools,
} from "@/lib/schools";
import { buildAlternates, buildWebSiteJsonLd, siteUrl } from "@/lib/seo";
import { bestOfHref, listingHref } from "@/lib/slugs";
import { CITIES, type Locale } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title =
    locale === "el"
      ? "ClickClickDrive Κύπρος - Σχολές οδηγών"
      : "ClickClickDrive Cyprus - Driving schools";
  const description =
    locale === "el"
      ? "Βρείτε σχολές οδηγών σε όλη την Κύπρο. Συγκρίνετε αξιολογήσεις και ωράρια. Δωρεάν."
      : "Find driving schools across Cyprus. Compare ratings and hours. Free.";
  return {
    title: { absolute: title },
    description,
    alternates: buildAlternates({ pathEl: "/", pathEn: "/" }),
    openGraph: {
      title: "ClickClickDrive Κύπρος - Σχολές οδηγών",
      description: "Βρείτε σχολές οδηγών σε όλη την Κύπρο. Συγκρίνετε αξιολογήσεις και ωράρια. Δωρεάν.",
      url: siteUrl("/"),
      type: "website",
      locale: "el_CY",
      images: [{ url: siteUrl("/logo.svg") }],
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const t = await getTranslations();
  const total = getAllSchools().length;
  const counts = getCityCounts();
  const featured = getFeaturedSchools(5);
  const latestArticles = getLatestArticles(3);
  const jsonLd = buildWebSiteJsonLd(locale);

  return (
    <>
      <JsonLd data={jsonLd} />

      <section className="relative overflow-hidden bg-gradient-to-b from-brand-light/40 via-background to-background">
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
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-text-muted">
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
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("home.popularCities")}
        </h2>
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
            <a
              href={listingHref(locale)}
              className="text-sm font-bold text-brand hover:text-brand-dark"
            >
              {t("home.viewAll")} →
            </a>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((s) => (
              <SchoolCard key={s.id} school={s} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("home.bestByCity")}
            </h2>
            <p className="mt-2 text-text-secondary">
              {t("home.bestByCityLead")}
            </p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {CITIES.map((c) => (
            <a
              key={c}
              href={bestOfHref(c, locale)}
              className="group flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-4 text-center transition hover:border-brand hover:bg-brand-light/10"
            >
              <span className="text-base font-bold text-text-primary group-hover:text-brand">
                {t(`cities.${c}`)}
              </span>
              <span className="mt-1 text-xs text-text-muted">
                {locale === "el" ? "Κορυφαίες σχολές" : "Top schools"}
              </span>
            </a>
          ))}
        </div>
      </section>

      {latestArticles.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t("home.latestArticles")}
              </h2>
              <p className="mt-2 text-text-secondary">
                {t("home.latestArticlesLead")}
              </p>
            </div>
            <a
              href={blogIndexHref(locale)}
              className="text-sm font-bold text-brand hover:text-brand-dark"
            >
              {t("home.viewAllArticles")} →
            </a>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestArticles.map((a) => (
              <ArticleCard key={a.id} article={a} locale={locale} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("home.howItWorks.title")}
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-light font-bold text-brand">
                {n}
              </div>
              <h3 className="mt-4 text-lg font-bold tracking-tight">
                {t(`home.howItWorks.step${n}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {t(`home.howItWorks.step${n}.body`)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Dot() {
  return (
    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand" />
  );
}
