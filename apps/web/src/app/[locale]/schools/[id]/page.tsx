import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { RatingStars } from "@/components/RatingStars";
import { Link } from "@/i18n/navigation";
import { getAllSchools, getSchoolById } from "@/lib/schools";

export function generateStaticParams() {
  return getAllSchools().map((s) => ({ id: s.id }));
}

export default async function SchoolDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const school = getSchoolById(id);
  if (!school) notFound();

  const displayName =
    locale === "el"
      ? school.name_el ?? school.name_en ?? school.name
      : school.name_en ?? school.name_el ?? school.name;
  const alternateName =
    locale === "el"
      ? school.name_en && school.name_en !== displayName
        ? school.name_en
        : null
      : school.name_el && school.name_el !== displayName
        ? school.name_el
        : null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${school.location.lat},${school.location.lon}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/schools"
        className="inline-block text-sm font-medium text-brand hover:text-brand-dark"
      >
        {t("detail.backToList")}
      </Link>

      <header className="mt-4 rounded-3xl bg-gradient-to-br from-brand-light/70 via-surface to-surface p-6 ring-1 ring-border sm:p-10">
        {school.location.city && (
          <span className="inline-block rounded-full bg-brand px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            {t(`cities.${school.location.city}`)}
          </span>
        )}
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {displayName}
        </h1>
        {alternateName && (
          <p className="mt-1 text-base text-text-muted">{alternateName}</p>
        )}
        {school.rating !== null ? (
          <div className="mt-4 flex items-center gap-3">
            <RatingStars rating={school.rating} size={20} />
            <span className="text-lg font-semibold">
              {school.rating.toFixed(1)}
            </span>
            {school.review_count !== null && (
              <span className="text-text-muted">
                · {t("card.reviews", { count: school.review_count })}
              </span>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-text-muted">{t("card.noRating")}</p>
        )}
      </header>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            {t("detail.contact")}
          </h2>
          <dl className="mt-4 space-y-4 text-sm">
            {school.phone_e164 && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  {t("detail.phone")}
                </dt>
                <dd className="mt-1">
                  <a
                    href={`tel:${school.phone_e164}`}
                    className="text-base font-semibold text-brand hover:text-brand-dark"
                  >
                    {school.phone_e164}
                  </a>
                </dd>
              </div>
            )}
            {school.website && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  {t("detail.website")}
                </dt>
                <dd className="mt-1">
                  <a
                    href={school.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-base font-medium text-brand hover:text-brand-dark"
                  >
                    {school.website}
                  </a>
                </dd>
              </div>
            )}
            {school.location.formatted_address && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  {t("detail.address")}
                </dt>
                <dd className="mt-1 text-text-secondary">
                  {school.location.formatted_address}
                </dd>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-medium text-brand hover:text-brand-dark"
                >
                  {t("detail.viewOnMap")} →
                </a>
              </div>
            )}
          </dl>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
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
                    <span className="font-medium text-text-primary">{day}</span>
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
      </div>
    </div>
  );
}
