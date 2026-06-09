import { useTranslations } from "next-intl";

import { cityHref, listingHref } from "@/lib/slugs";
import { CITIES, type Locale } from "@/lib/types";

/**
 * Server-rendered search form. Posts to the locale-correct listing URL with a
 * ?city= param. Selecting a city in the dropdown then submitting navigates
 * straight to that city's page (handled by the listing page that interprets
 * the query string).
 */
export function SearchBar({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const action = listingHref(locale);

  return (
    <form
      action={action}
      method="GET"
      className="w-full rounded-2xl bg-surface p-2 shadow-lg ring-1 ring-border sm:flex sm:items-center sm:gap-2 sm:p-3"
    >
      <label htmlFor="city" className="sr-only">
        {t("home.searchLabel")}
      </label>
      <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3">
        <PinIcon />
        <select
          id="city"
          name="city"
          defaultValue=""
          className="w-full appearance-none bg-transparent text-base text-text-primary outline-none"
        >
          <option value="" disabled>
            {t("home.searchPlaceholder")}
          </option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {t(`cities.${c}`)}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="mt-2 w-full rounded-xl bg-brand px-6 py-3 text-base font-bold text-white shadow-sm transition-colors hover:bg-brand-dark sm:mt-0 sm:w-auto"
      >
        {t("home.searchButton")}
      </button>
    </form>
  );
}

function PinIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-text-muted"
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
