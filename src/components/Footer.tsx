import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { bestOfHref, cityHref, listingHref } from "@/lib/slugs";
import { CITIES, type Locale } from "@/lib/types";

export function Footer() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const year = new Date().getFullYear();
  const allSchools = listingHref(locale);

  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <Image
              src="/logo.svg"
              alt={t("brand.name")}
              width={138}
              height={32}
              className="h-8 w-auto"
            />
            <p className="mt-3 text-sm text-text-muted">
              {t("footer.tagline")}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8 text-sm sm:gap-12">
            <nav className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-text-muted">
                {t("footer.explore")}
              </span>
              <a href={allSchools} className="text-text-primary hover:text-brand">
                {t("nav.schools")}
              </a>
              {CITIES.map((c) => (
                <a
                  key={`city-${c}`}
                  href={cityHref(c, locale)}
                  className="text-text-muted hover:text-brand"
                >
                  {t(`cities.${c}`)}
                </a>
              ))}
            </nav>
            <nav className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-text-muted">
                {t("footer.bestSchools")}
              </span>
              {CITIES.map((c) => (
                <a
                  key={`best-${c}`}
                  href={bestOfHref(c, locale)}
                  className="text-text-primary hover:text-brand"
                >
                  {t("footer.bestSchoolsLink", { city: t(`cities.${c}`) })}
                </a>
              ))}
            </nav>
            <nav className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-text-muted">
                {t("footer.legal")}
              </span>
              <Link href="/aporrito" className="text-text-primary hover:text-brand">
                {t("footer.privacy")}
              </Link>
              <Link href="/oroi" className="text-text-primary hover:text-brand">
                {t("footer.terms")}
              </Link>
            </nav>
          </div>
        </div>
        <p className="mt-8 border-t border-border pt-6 text-xs text-text-muted">
          {t("footer.copyright", { year })}
        </p>
      </div>
    </footer>
  );
}
