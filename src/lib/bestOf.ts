import fs from "node:fs";
import path from "node:path";

import { getSchoolsByCity } from "@/lib/schools";
import type { CyprusCity, DrivingSchool, Locale } from "@/lib/types";

export interface BestOfCityConfig {
  city: CyprusCity;
  pathEl: string;
  pathEn: string;
  cityEl: string;
  cityElAcc: string;
  cityKey: string;
}

export const BEST_OF_CITIES: Record<string, BestOfCityConfig> = {
  nicosia: {
    city: "Nicosia",
    pathEl: "/kalytera-scholes-odigon-lefkosia",
    pathEn: "/en/best-driving-schools-nicosia",
    cityEl: "Λευκωσία",
    cityElAcc: "Λευκωσία",
    cityKey: "nicosia",
  },
  limassol: {
    city: "Limassol",
    pathEl: "/kalytera-scholes-odigon-lemesos",
    pathEn: "/en/best-driving-schools-limassol",
    cityEl: "Λεμεσός",
    cityElAcc: "Λεμεσό",
    cityKey: "limassol",
  },
  larnaca: {
    city: "Larnaca",
    pathEl: "/kalytera-scholes-odigon-larnaka",
    pathEn: "/en/best-driving-schools-larnaca",
    cityEl: "Λάρνακα",
    cityElAcc: "Λάρνακα",
    cityKey: "larnaca",
  },
  paphos: {
    city: "Paphos",
    pathEl: "/kalytera-scholes-odigon-pafos",
    pathEn: "/en/best-driving-schools-paphos",
    cityEl: "Πάφος",
    cityElAcc: "Πάφο",
    cityKey: "paphos",
  },
  paralimni: {
    city: "Paralimni",
    pathEl: "/kalytera-scholes-odigon-paralimni",
    pathEn: "/en/best-driving-schools-paralimni",
    cityEl: "Παραλίμνι",
    cityElAcc: "Παραλίμνι",
    cityKey: "paralimni",
  },
};

export interface BestOfContent {
  intro?: string;
  closing?: string;
  faq?: Array<{ q: string; a: string }>;
  schools?: Record<string, string>;
}

export function loadBestOfContent(cityKey: string, locale: Locale): BestOfContent {
  const filePath = path.join(
    process.cwd(),
    "scraper",
    "data",
    "best-of",
    `${cityKey}_${locale}.json`,
  );
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as BestOfContent;
  } catch {
    return {};
  }
}

const MIN_REVIEWS = 10;

export function rankedSchools(city: CyprusCity): DrivingSchool[] {
  const byRating = (a: DrivingSchool, b: DrivingSchool) => {
    const rd = (b.rating ?? 0) - (a.rating ?? 0);
    if (rd !== 0) return rd;
    return (b.review_count ?? 0) - (a.review_count ?? 0);
  };

  const eligible = [...getSchoolsByCity(city)]
    .filter((s) => s.rating !== null && (s.review_count ?? 0) >= MIN_REVIEWS)
    .sort(byRating)
    .slice(0, 10);

  // Fallback: city has too few qualifying schools - include all rated schools
  if (eligible.length === 0) {
    return [...getSchoolsByCity(city)]
      .filter((s) => s.rating !== null)
      .sort(byRating)
      .slice(0, 10);
  }

  return eligible;
}

export function heroImagePath(cityKey: string): string | null {
  const abs = path.join(process.cwd(), "public", "best-of", cityKey, "hero.jpg");
  return fs.existsSync(abs) ? `/best-of/${cityKey}/hero.jpg` : null;
}

export function schoolPhotoPath(schoolId: string): string | null {
  const abs = path.join(process.cwd(), "public", "schools", schoolId, "1.jpg");
  return fs.existsSync(abs) ? `/schools/${schoolId}/1.jpg` : null;
}
