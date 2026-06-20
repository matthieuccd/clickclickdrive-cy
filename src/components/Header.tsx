import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { BLOG_ARTICLES } from "@/lib/blog";
import { BEST_OF_CITIES } from "@/lib/bestOf";
import { getAllSchools } from "@/lib/schools";
import { citySlug } from "@/lib/slugs";
import { CITIES } from "@/lib/types";

import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const t = useTranslations();

  // Slug pairs computed once on the server; serialised to the client
  // LanguageSwitcher so it can map current → other-locale slugs.
  const schoolPairs = getAllSchools().map((s) => ({
    el: s.slug_el,
    en: s.slug_en,
  }));
  const articlePairs = BLOG_ARTICLES.map((a) => ({
    el: a.slug_el,
    en: a.slug_en,
  }));
  const cityPairs = CITIES.map((c) => ({
    el: citySlug(c, "el"),
    en: citySlug(c, "en"),
  }));
  // Suffix after kalytera-scholes-odigon- / best-driving-schools-
  const bestOfPairs = Object.values(BEST_OF_CITIES).map((cfg) => ({
    el: cfg.pathEl.replace("/kalytera-scholes-odigon-", ""),
    en: cfg.pathEn.replace("/best-driving-schools-", ""),
  }));

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
          <LanguageSwitcher
            schoolPairs={schoolPairs}
            articlePairs={articlePairs}
            cityPairs={cityPairs}
            bestOfPairs={bestOfPairs}
            className="rounded-full border border-border-strong px-3 py-1.5 text-sm font-semibold text-text-primary hover:border-brand hover:text-brand transition-colors"
          />
        </nav>
      </div>
    </header>
  );
}
