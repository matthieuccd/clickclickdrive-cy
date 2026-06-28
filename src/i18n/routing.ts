import { defineRouting } from "next-intl/routing";

import {
  defaultLocale,
  localePrefix,
  locales,
} from "../../i18n.config";

/**
 * Bridges the project-level i18n.config.ts into next-intl's routing shape,
 * AND sets up locale-specific pathnames so:
 *
 *   internal canonical (matches src/app/[locale]/<path>)  →  rendered URL
 *   /scholes-odigon                el → /scholes-odigon          en → /en/driving-schools
 *   /scholes-odigon/[slug]         el → /scholes-odigon/<slug>   en → /en/driving-schools/<slug>
 *   /aporrito                      el → /aporrito                en → /en/privacy
 *   /oroi                          el → /oroi                    en → /en/terms
 *
 * The internal app router uses the Greek-canonical pathnames; middleware
 * rewrites between the user-facing localized URL and this canonical form.
 * Slug VALUES differ per locale - pass slug_el for the Greek link and
 * slug_en for the English link explicitly via `getPathname`.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix,
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/scholes-odigon": {
      el: "/scholes-odigon",
      en: "/driving-schools",
    },
    "/scholes-odigon/[slug]": {
      el: "/scholes-odigon/[slug]",
      en: "/driving-schools/[slug]",
    },
    "/arthra": {
      el: "/arthra",
      en: "/blog",
    },
    "/arthra/[slug]": {
      el: "/arthra/[slug]",
      en: "/blog/[slug]",
    },
    "/aporrito": {
      el: "/aporrito",
      en: "/privacy",
    },
    "/oroi": {
      el: "/oroi",
      en: "/terms",
    },
    "/arthrografoi/[slug]": {
      el: "/arthrografoi/[slug]",
      en: "/authors/[slug]",
    },
    "/kalytera-scholes-odigon-lefkosia": {
      el: "/kalytera-scholes-odigon-lefkosia",
      en: "/best-driving-schools-nicosia",
    },
    "/kalytera-scholes-odigon-lemesos": {
      el: "/kalytera-scholes-odigon-lemesos",
      en: "/best-driving-schools-limassol",
    },
    "/kalytera-scholes-odigon-larnaka": {
      el: "/kalytera-scholes-odigon-larnaka",
      en: "/best-driving-schools-larnaca",
    },
    "/kalytera-scholes-odigon-pafos": {
      el: "/kalytera-scholes-odigon-pafos",
      en: "/best-driving-schools-paphos",
    },
    "/kalytera-scholes-odigon-paralimni": {
      el: "/kalytera-scholes-odigon-paralimni",
      en: "/best-driving-schools-paralimni",
    },
  },
});
