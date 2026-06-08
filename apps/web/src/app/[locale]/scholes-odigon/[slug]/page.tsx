import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { JsonLd } from "@/components/JsonLd";
import { MarkdownProse } from "@/components/MarkdownProse";
import { PhotoGallery } from "@/components/PhotoGallery";
import { RatingStars } from "@/components/RatingStars";
import { SchoolCard } from "@/components/SchoolCard";
import { loadSchoolContent } from "@/lib/generatedContent";
import { getAllSchools, getSchoolsByCity } from "@/lib/schools";
import {
  buildAlternates,
  buildCityItemListJsonLd,
  buildLocalBusinessJsonLd,
  siteUrl,
} from "@/lib/seo";
import {
  cityHref,
  citySlug,
  displayName,
  listingHref,
  lookupSlug,
  schoolHref,
} from "@/lib/slugs";
import { CITIES, type CyprusCity, type Locale } from "@/lib/types";

/**
 * Pre-render the union of city slugs and school slugs for the active locale.
 * Same internal route serves both — disambiguation by lookup.
 *
 * Next 16 passes parent route params to generateStaticParams synchronously
 * (the page component itself receives them as a Promise; the two APIs
 * disagree).
 */
export function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale as Locale;
  const isEl = locale === "el";
  const cityParams = CITIES.map((c) => ({ slug: citySlug(c, locale) }));
  const schoolParams = getAllSchools().map((s) => ({
    slug: isEl ? s.slug_el : s.slug_en,
  }));
  return [...cityParams, ...schoolParams];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const lookup = lookupSlug(slug, locale as Locale, getAllSchools());
  if (lookup.kind === "none") return { title: "Not found" };

  if (lookup.kind === "city") {
    const c = lookup.city;
    const inCity = getSchoolsByCity(c);
    const pathEl = `/scholes-odigon/${citySlug(c, "el")}`;
    const pathEn = `/en/driving-schools/${citySlug(c, "en")}`;
    const cityLabelEl = (
      { Nicosia: "Λευκωσία", Limassol: "Λεμεσός", Larnaca: "Λάρνακα", Paphos: "Πάφος", Paralimni: "Παραλίμνι" } as const
    )[c];
    const title =
      locale === "el"
        ? `Σχολές οδηγών στη(ν) ${cityLabelEl}`
        : `Driving schools in ${c}`;
    const description =
      locale === "el"
        ? `${inCity.length} σχολές οδηγών στη(ν) ${cityLabelEl}. Αξιολογήσεις, ωράρια, τηλέφωνα.`
        : `${inCity.length} driving schools in ${c}. Ratings, opening hours, phone numbers.`;
    return {
      title,
      description,
      alternates: buildAlternates({ pathEl, pathEn }),
      openGraph: {
        title,
        description,
        url: siteUrl(locale === "el" ? pathEl : pathEn),
        type: "website",
        locale: locale === "el" ? "el_CY" : "en_CY",
      },
    };
  }

  const s = lookup.school;
  const name = displayName(s, locale as Locale);
  const cityLabel =
    s.location.city && locale === "el"
      ? (
          { Nicosia: "Λευκωσία", Limassol: "Λεμεσός", Larnaca: "Λάρνακα", Paphos: "Πάφος", Paralimni: "Παραλίμνι" } as const
        )[s.location.city]
      : s.location.city;
  const description =
    locale === "el"
      ? `${name} στη(ν) ${cityLabel}. Αξιολόγηση ${s.rating?.toFixed(1) ?? "—"}, τηλέφωνο, ωράριο.`
      : `${name} in ${cityLabel}. Rating ${s.rating?.toFixed(1) ?? "—"}, phone, opening hours.`;
  const pathEl = `/scholes-odigon/${s.slug_el}`;
  const pathEn = `/en/driving-schools/${s.slug_en}`;
  const ogImage = s.photo_paths[0] ? siteUrl(s.photo_paths[0]) : undefined;
  return {
    title: name,
    description,
    alternates: buildAlternates({ pathEl, pathEn }),
    openGraph: {
      title: name,
      description,
      url: siteUrl(locale === "el" ? pathEl : pathEn),
      type: "website",
      locale: locale === "el" ? "el_CY" : "en_CY",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function DispatchPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const lookup = lookupSlug(slug, locale, getAllSchools());
  if (lookup.kind === "none") notFound();
  if (lookup.kind === "city") {
    return <CityView city={lookup.city} locale={locale} />;
  }
  return <SchoolView school={lookup.school} locale={locale} />;
}

// -------- city view ----------------------------------------------------------

async function CityView({
  city,
  locale,
}: {
  city: CyprusCity;
  locale: Locale;
}) {
  const t = await getTranslations();
  const all = getSchoolsByCity(city);
  // Sort by rating (desc), nulls last; tiebreak by review_count desc.
  const schools = [...all].sort((a, b) => {
    const ar = a.rating ?? -1;
    const br = b.rating ?? -1;
    if (br !== ar) return br - ar;
    return (b.review_count ?? 0) - (a.review_count ?? 0);
  });
  const itemListJsonLd = buildCityItemListJsonLd(city, schools, locale, (s) =>
    schoolHref(s, locale),
  );
  const others = CITIES.filter((c) => c !== city);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd data={itemListJsonLd} />

      <header className="mb-6 sm:mb-8">
        <Link
          href={listingHref(locale)}
          className="text-sm font-semibold text-brand hover:text-brand-dark"
        >
          ← {t("nav.schools")}
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {t("list.titleInCity", { city: t(`cities.${city}`) })}
        </h1>
        <p className="mt-2 text-text-muted">
          {t("list.resultCount", { count: schools.length })}
        </p>
      </header>

      <section className="mb-8 rounded-2xl bg-surface p-6 ring-1 ring-border sm:p-8">
        <p className="text-base leading-relaxed text-text-secondary">
          {t("list.cityIntro", { city: t(`cities.${city}`) })}
        </p>
      </section>

      {schools.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center text-text-muted">
          {t("list.empty")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schools.map((s) => (
            <SchoolCard key={s.id} school={s} />
          ))}
        </div>
      )}

      <section className="mt-16 border-t border-border pt-8">
        <h2 className="mb-4 text-lg font-bold tracking-tight">
          {t("list.otherCities")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {others.map((c) => (
            <Link
              key={c}
              href={cityHref(c, locale)}
              className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-semibold text-text-primary hover:border-brand hover:text-brand"
            >
              {t(`cities.${c}`)}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

// -------- school view --------------------------------------------------------

async function SchoolView({
  school,
  locale,
}: {
  school: typeof getAllSchools extends () => infer R
    ? R extends Array<infer S>
      ? S
      : never
    : never;
  locale: Locale;
}) {
  const t = await getTranslations();
  const name = displayName(school, locale);
  const city = school.location.city;

  const siblings = city
    ? [...getSchoolsByCity(city)].sort((a, b) => {
        const ar = a.rating ?? -1;
        const br = b.rating ?? -1;
        if (br !== ar) return br - ar;
        return (b.review_count ?? 0) - (a.review_count ?? 0);
      })
    : [];
  const idx = siblings.findIndex((s) => s.id === school.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  const canonicalUrl = siteUrl(
    locale === "el"
      ? `/scholes-odigon/${school.slug_el}`
      : `/en/driving-schools/${school.slug_en}`,
  );
  const jsonLd = buildLocalBusinessJsonLd(school, canonicalUrl);
  const seoMd = loadSchoolContent(school.id, locale);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${school.location.lat},${school.location.lon}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <JsonLd data={jsonLd} />

      <Link
        href={city ? cityHref(city, locale) : listingHref(locale)}
        className="text-sm font-semibold text-brand hover:text-brand-dark"
      >
        {t("detail.backToList")}
      </Link>

      <header className="mt-4">
        {city && (
          <Link
            href={cityHref(city, locale)}
            className="inline-block rounded-full bg-brand px-3 py-1 text-xs font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
          >
            {t(`cities.${city}`)}
          </Link>
        )}
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {name}
        </h1>
        {school.rating !== null ? (
          <div className="mt-3 flex items-center gap-3">
            <RatingStars rating={school.rating} size={20} />
            <span className="text-lg font-bold">{school.rating.toFixed(1)}</span>
            {school.review_count !== null && (
              <span className="text-text-muted">
                · {t("card.reviews", { count: school.review_count })}
              </span>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-text-muted">{t("card.noRating")}</p>
        )}
      </header>

      <div className="mt-6">
        <PhotoGallery photos={school.photo_paths} alt={name} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {seoMd ? (
            <section className="rounded-2xl bg-surface p-6 ring-1 ring-border sm:p-8">
              <MarkdownProse markdown={seoMd} />
            </section>
          ) : (
            <FallbackBio school={school} locale={locale} />
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-text-muted">
              {t("detail.contact")}
            </h2>
            <dl className="mt-4 space-y-4 text-sm">
              {school.phone_e164 && (
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-text-muted">
                    {t("detail.phone")}
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={`tel:${school.phone_e164}`}
                      className="text-base font-bold text-brand hover:text-brand-dark"
                    >
                      {school.phone_e164}
                    </a>
                  </dd>
                </div>
              )}
              {school.website && (
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-text-muted">
                    {t("detail.website")}
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={school.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-base font-semibold text-brand hover:text-brand-dark"
                    >
                      {school.website}
                    </a>
                  </dd>
                </div>
              )}
              {school.location.formatted_address && (
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-text-muted">
                    {t("detail.address")}
                  </dt>
                  <dd className="mt-1 text-text-secondary">
                    {school.location.formatted_address}
                  </dd>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm font-semibold text-brand hover:text-brand-dark"
                  >
                    {t("detail.viewOnMap")} →
                  </a>
                </div>
              )}
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-text-muted">
              {t("detail.openingHours")}
            </h2>
            {school.opening_hours.length > 0 ? (
              <ul className="mt-4 divide-y divide-border text-sm">
                {school.opening_hours.map((line) => {
                  const [day, ...rest] = line.split(":");
                  return (
                    <li
                      key={line}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <span className="font-bold text-text-primary">{day}</span>
                      <span className="text-text-secondary">
                        {rest.join(":").trim()}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-text-muted">—</p>
            )}
          </section>
        </aside>
      </div>

      {(prev || next) && (
        <nav className="mt-12 grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
          {prev ? (
            <Link
              href={schoolHref(prev, locale)}
              className="group rounded-2xl border border-border bg-surface p-4 hover:border-brand"
            >
              <span className="text-xs font-bold uppercase tracking-wide text-text-muted">
                ← {t("detail.previousInCity")}
              </span>
              <span className="mt-1 block font-bold text-text-primary group-hover:text-brand">
                {displayName(prev, locale)}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={schoolHref(next, locale)}
              className="group rounded-2xl border border-border bg-surface p-4 text-right hover:border-brand"
            >
              <span className="text-xs font-bold uppercase tracking-wide text-text-muted">
                {t("detail.nextInCity")} →
              </span>
              <span className="mt-1 block font-bold text-text-primary group-hover:text-brand">
                {displayName(next, locale)}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}

async function FallbackBio({
  school,
  locale,
}: {
  school: ReturnType<typeof getAllSchools>[number];
  locale: Locale;
}) {
  const t = await getTranslations();
  const name = displayName(school, locale);
  const city = school.location.city;
  return (
    <section className="rounded-2xl bg-surface p-6 ring-1 ring-border sm:p-8">
      <p className="text-base leading-relaxed text-text-secondary">
        {city
          ? t("detail.fallbackBio", {
              name,
              city: t(`cities.${city}`),
            })
          : t("detail.fallbackBioNoCity", { name })}
      </p>
    </section>
  );
}
