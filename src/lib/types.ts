export type CyprusCity =
  | "Nicosia"
  | "Limassol"
  | "Larnaca"
  | "Paphos"
  | "Paralimni";

export const CITIES: readonly CyprusCity[] = [
  "Nicosia",
  "Limassol",
  "Larnaca",
  "Paphos",
  "Paralimni",
] as const;

export interface DrivingSchool {
  id: string;
  name: string;
  name_el: string | null;
  name_en: string | null;
  phone_e164: string | null;
  website: string | null;
  location: {
    lat: number;
    lon: number;
    formatted_address: string | null;
    city: CyprusCity | null;
  };
  rating: number | null;
  review_count: number | null;
  opening_hours: string[];
  sources: string[];
  source_ids: Record<string, string>;
  photo_paths: string[];
  /** Per-locale URL slugs computed by scraper/add_slugs.py. */
  slug_el: string;
  slug_en: string;
}

export type Locale = "el" | "en";

export interface AutoInfographicItem {
  num: string;
  title: string[];
  sub: string[];
}

export interface AutoInfographicContent {
  title: string;
  caption: string;
  items: AutoInfographicItem[];
}

export interface AutoInfographicData {
  el: AutoInfographicContent;
  en: AutoInfographicContent;
}
