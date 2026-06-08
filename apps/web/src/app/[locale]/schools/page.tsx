import { getTranslations, setRequestLocale } from "next-intl/server";

import { SchoolCard } from "@/components/SchoolCard";
import { Link } from "@/i18n/navigation";
import { getSchoolsByCity } from "@/lib/schools";
import { CITIES, type CyprusCity } from "@/lib/types";

function isCity(v: string | undefined): v is CyprusCity {
  return v !== undefined && (CITIES as readonly string[]).includes(v);
}

export default async function SchoolsListPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ city?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { city: cityParam } = await searchParams;

  const city = isCity(cityParam) ? cityParam : null;
  const schools = getSchoolsByCity(city);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {city
            ? t("list.titleInCity", { city: t(`cities.${city}`) })
            : t("list.title")}
        </h1>
        <p className="mt-2 text-text-muted">
          {t("list.resultCount", { count: schools.length })}
        </p>
      </header>

      <div
        className="mb-8 flex flex-wrap gap-2"
        role="group"
        aria-label={t("list.filterByCity")}
      >
        <FilterChip active={city === null} href={{ pathname: "/schools" }}>
          {t("cities.all")}
        </FilterChip>
        {CITIES.map((c) => (
          <FilterChip
            key={c}
            active={city === c}
            href={{ pathname: "/schools", query: { city: c } }}
          >
            {t(`cities.${c}`)}
          </FilterChip>
        ))}
      </div>

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
    </div>
  );
}

function FilterChip({
  active,
  href,
  children,
}: {
  active: boolean;
  href: React.ComponentProps<typeof Link>["href"];
  children: React.ReactNode;
}) {
  const base =
    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors";
  const styles = active
    ? "border-brand bg-brand text-white"
    : "border-border bg-surface text-text-secondary hover:border-brand hover:text-brand";
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}
