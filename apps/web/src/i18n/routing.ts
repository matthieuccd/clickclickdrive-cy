import { defineRouting } from "next-intl/routing";

import {
  defaultLocale,
  localePrefix,
  locales,
} from "../../i18n.config";

/**
 * Bridges the project-level i18n.config.ts (which the scraper / build tooling
 * also reads) into the shape next-intl expects.
 *
 * Greek (`el`) is the default and is served at the bare path because
 * localePrefix is "as-needed"; English is prefixed (`/en/...`).
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix,
});
