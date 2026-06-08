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
}
