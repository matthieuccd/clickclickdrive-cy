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

const JSONL_PATH = path.join(
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
  if (!fs.existsSync(JSONL_PATH)) {
    console.warn(
      `[schools] ${JSONL_PATH} not found — run the scraper to populate it.`,
    );
    cache = [];
    return cache;
  }
  const text = fs.readFileSync(JSONL_PATH, "utf8");
  cache = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as DrivingSchool);
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
