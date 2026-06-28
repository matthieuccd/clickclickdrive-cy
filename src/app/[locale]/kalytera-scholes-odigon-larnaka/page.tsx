import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { BestOfCityPage } from "@/components/BestOfCityPage";
import { BEST_OF_CITIES, heroImagePath, rankedSchools } from "@/lib/bestOf";
import { buildAlternates, siteUrl } from "@/lib/seo";
import type { Locale } from "@/lib/types";

const CONFIG = BEST_OF_CITIES.larnaca;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const n = rankedSchools(CONFIG.city).length;
  const hero = heroImagePath(CONFIG.cityKey);
  const cityName = locale === "el" ? CONFIG.cityElAcc : CONFIG.city;
  const title =
    locale === "el"
      ? `Οι ${n} Καλύτερες Σχολές Οδηγών στη(ν) ${cityName} 2026`
      : `Best ${n} Driving Schools in ${CONFIG.city} 2026`;
  const description =
    locale === "el"
      ? `Κατάταξη και αξιολογήσεις για ${n} σχολές οδηγών στη(ν) ${cityName}. Διευθύνσεις, τηλέφωνα και φωτογραφίες.`
      : `Ranked list of ${n} driving schools in ${CONFIG.city}. Ratings, addresses, phones, and photos.`;
  return {
    title,
    description: description.slice(0, 150),
    alternates: buildAlternates({ pathEl: CONFIG.pathEl, pathEn: CONFIG.pathEn }),
    openGraph: {
      title: `Οι ${n} Καλύτερες Σχολές Οδηγών στη(ν) ${CONFIG.cityElAcc} 2026`,
      description: `Κατάταξη και αξιολογήσεις για ${n} σχολές οδηγών στη(ν) ${CONFIG.cityElAcc}. Διευθύνσεις, τηλέφωνα και φωτογραφίες.`,
      url: siteUrl(CONFIG.pathEl),
      type: "article",
      locale: "el_CY",
      ...(hero ? { images: [{ url: siteUrl(hero), width: 1600, height: 900 }] } : {}),
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  return <BestOfCityPage config={CONFIG} locale={rawLocale as Locale} />;
}
