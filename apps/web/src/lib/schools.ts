import fs from "node:fs";
import path from "node:path";

import type { CyprusCity, DrivingSchool } from "./types";

/**
 * Build-time data loader.
 *
 * Reads `scraper/output/schools.jsonl` (gitignored, produced by the Python
 * scraper) once per server process and caches the parsed records in memory.
 * The site has no database — this module is the data layer.
 */

// Prefer the enriched JSONL (has photo_paths) when present; fall back to the
// base scrape so a fresh checkout can build without running enrich.py first.
const ENRICHED_PATH = path.join(
  process.cwd(),
  "..",
  "..",
  "scraper",
  "output",
  "schools_enriched.jsonl",
);
const BASE_PATH = path.join(
  process.cwd(),
  "..",
  "..",
  "scraper",
  "output",
  "schools.jsonl",
);

let cache: DrivingSchool[] | null = null;

function loadAll(): DrivingSchool[] {
  if (cache !== null) return cache;
  const sourcePath = fs.existsSync(ENRICHED_PATH)
    ? ENRICHED_PATH
    : fs.existsSync(BASE_PATH)
      ? BASE_PATH
      : null;
  if (sourcePath === null) {
    console.warn(
      "[schools] neither schools_enriched.jsonl nor schools.jsonl found — run the scraper.",
    );
    cache = [];
    return cache;
  }
  const text = fs.readFileSync(sourcePath, "utf8");
  cache = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const raw = JSON.parse(line) as Partial<DrivingSchool>;
      // Default photo_paths to [] for records from the older non-enriched file.
      return { ...raw, photo_paths: raw.photo_paths ?? [] } as DrivingSchool;
    });
  return cache;
}

export function getAllSchools(): DrivingSchool[] {
  return loadAll();
}

export function getSchoolsByCity(
  city: CyprusCity | null | undefined,
): DrivingSchool[] {
  const all = loadAll();
  if (!city) return all;
  return all.filter((s) => s.location.city === city);
}

export function getSchoolById(id: string): DrivingSchool | null {
  return loadAll().find((s) => s.id === id) ?? null;
}

export function getCityCounts(): Record<CyprusCity, number> {
  const counts = {
    Nicosia: 0,
    Limassol: 0,
    Larnaca: 0,
    Paphos: 0,
    Paralimni: 0,
  } satisfies Record<CyprusCity, number>;
  for (const s of loadAll()) {
    if (s.location.city) counts[s.location.city] += 1;
  }
  return counts;
}

export function getFeaturedSchools(limit = 6): DrivingSchool[] {
  // "Featured" = highest weighted rating (rating * log(reviews+1)).
  return [...loadAll()]
    .filter((s) => s.rating !== null && s.review_count !== null)
    .sort((a, b) => {
      const ascore = (a.rating ?? 0) * Math.log((a.review_count ?? 0) + 1);
      const bscore = (b.rating ?? 0) * Math.log((b.review_count ?? 0) + 1);
      return bscore - ascore;
    })
    .slice(0, limit);
}
