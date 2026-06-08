import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const otherLocale = locale === "el" ? "en" : "el";
  const otherLabel = locale === "el" ? "EN" : "ΕΛ";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-8 sm:py-5">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt={t("brand.name")}
            width={138}
            height={32}
            priority
            className="h-8 w-auto sm:h-10"
          />
          <span className="sr-only">{t("brand.name")}</span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/scholes-odigon"
            className="hidden text-sm font-semibold text-text-primary hover:text-brand sm:inline"
          >
            {t("nav.schools")}
          </Link>
          <Link
            href="/arthra"
            className="hidden text-sm font-semibold text-text-primary hover:text-brand sm:inline"
          >
            {t("nav.blog")}
          </Link>
          <Link
            href="/"
            locale={otherLocale}
            className="rounded-full border border-border-strong px-3 py-1.5 text-sm font-semibold text-text-primary hover:border-brand hover:text-brand transition-colors"
            aria-label={t("nav.switchLanguage")}
          >
            {otherLabel}
          </Link>
        </nav>
      </div>
    </header>
  );
}
