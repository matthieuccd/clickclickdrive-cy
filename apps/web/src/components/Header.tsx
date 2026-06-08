import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const otherLocale = locale === "el" ? "en" : "el";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-white font-bold text-lg tracking-tight">
            CC
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight">
              {t("brand.name")}
            </span>
            <span className="hidden text-xs text-text-muted sm:block">
              {t("brand.tagline")}
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/schools"
            className="hidden text-sm font-medium text-text-secondary hover:text-brand sm:inline"
          >
            {t("nav.schools")}
          </Link>
          <Link
            href="/"
            locale={otherLocale}
            className="rounded-full border border-border-strong px-3 py-1.5 text-sm font-medium text-text-secondary hover:border-brand hover:text-brand transition-colors"
            aria-label={t("nav.switchLanguage")}
          >
            {t("nav.switchLanguage")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
