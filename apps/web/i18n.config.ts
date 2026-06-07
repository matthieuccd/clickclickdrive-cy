/**
 * ClickClickDrive Cyprus — i18n configuration.
 *
 * Greek (`el`) is the primary locale for the Republic of Cyprus.
 * English (`en`) is the fallback / secondary locale (widely spoken; used by
 * expats, tourists, and the British community).
 *
 * No German content despite the parent brand — this market ships el + en only.
 */

export const locales = ["el", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "el";
export const fallbackLocale: Locale = "en";

/**
 * Locale metadata for the UI (language switcher, hreflang tags, etc.).
 */
export const localeConfig: Record<
  Locale,
  {
    label: string;
    nativeLabel: string;
    htmlLang: string;
    hreflang: string;
    dir: "ltr" | "rtl";
    dateFormat: string;
    currency: "EUR";
  }
> = {
  el: {
    label: "Greek",
    nativeLabel: "Ελληνικά",
    htmlLang: "el-CY",
    hreflang: "el-CY",
    dir: "ltr",
    dateFormat: "dd/MM/yyyy",
    currency: "EUR",
  },
  en: {
    label: "English",
    nativeLabel: "English",
    htmlLang: "en-CY",
    hreflang: "en-CY",
    dir: "ltr",
    dateFormat: "dd/MM/yyyy",
    currency: "EUR",
  },
};

/**
 * URL prefix strategy: the default locale (Greek) is served at the bare path
 * (e.g. `/`), and English is prefixed (`/en/...`). Cypriot users land on the
 * Greek site by default; English speakers can opt in.
 */
export const localePrefix = "as-needed" as const;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function resolveLocale(input: string | undefined | null): Locale {
  if (input && isLocale(input)) return input;
  return defaultLocale;
}

const i18nConfig = {
  locales,
  defaultLocale,
  fallbackLocale,
  localePrefix,
  localeConfig,
} as const;

export default i18nConfig;
