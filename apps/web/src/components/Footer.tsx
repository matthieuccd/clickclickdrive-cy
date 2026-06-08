import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white font-bold text-base">
                CC
              </span>
              <span className="text-base font-bold tracking-tight">
                {t("brand.name")}
              </span>
            </div>
            <p className="mt-3 text-sm text-text-muted">{t("footer.tagline")}</p>
          </div>
          <nav className="flex flex-col gap-2 text-sm text-text-secondary">
            <Link href="/schools" className="hover:text-brand">
              {t("nav.schools")}
            </Link>
          </nav>
        </div>
        <p className="mt-8 border-t border-border pt-6 text-xs text-text-muted">
          {t("footer.copyright", { year })}
        </p>
      </div>
    </footer>
  );
}
