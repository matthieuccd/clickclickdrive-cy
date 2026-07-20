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

/**
 * The auto-published pipeline (scraper/generate_blog.py auto_generate_spec())
 * picks one of 5 visual templates per article so unattended publishes don't
 * all render the same shape. Each template has its own content fields.
 */
export type AutoInfographicTemplate =
  | "flow"
  | "compare"
  | "versus"
  | "checklist"
  | "timeline";

export interface AutoFlowItem {
  num: string;
  title: string[];
  sub: string[];
}

export interface AutoCompareCard {
  accent: string;
  heading: string[];
  body: string[][];
}

export interface AutoVersusSide {
  heading: string;
  sub: string[];
}

export interface AutoChecklistItem {
  icon: string;
  label: string;
  sub: string;
}

export interface AutoTimelineMilestone {
  label: string;
  sub: string;
}

interface AutoInfographicBase {
  title: string;
  caption: string;
}

export type AutoInfographicContent =
  | (AutoInfographicBase & { template: "flow"; items: AutoFlowItem[] })
  | (AutoInfographicBase & { template: "compare"; cards: AutoCompareCard[] })
  | (AutoInfographicBase & {
      template: "versus";
      left: AutoVersusSide;
      right: AutoVersusSide;
    })
  | (AutoInfographicBase & { template: "checklist"; items: AutoChecklistItem[] })
  | (AutoInfographicBase & {
      template: "timeline";
      milestones: AutoTimelineMilestone[];
    });

export interface AutoInfographicData {
  el: AutoInfographicContent;
  en: AutoInfographicContent;
}
