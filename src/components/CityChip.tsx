import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { cityHref } from "@/lib/slugs";
import type { CyprusCity, Locale } from "@/lib/types";

export function CityChip({
  city,
  count,
}: {
  city: CyprusCity;
  count: number;
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  return (
    <Link
      href={cityHref(city, locale)}
      className="group flex flex-col items-start justify-between gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-light text-brand">
        <PinIcon />
      </span>
      <div>
        <div className="text-base font-bold tracking-tight">
          {t(`cities.${city}`)}
        </div>
        <div className="text-sm text-text-muted">
          {t("home.stats.schools", { count })}
        </div>
      </div>
    </Link>
  );
}

function PinIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
