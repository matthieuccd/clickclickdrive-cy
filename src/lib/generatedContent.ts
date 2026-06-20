import fs from "node:fs";
import path from "node:path";

import type { Locale } from "./types";

/**
 * Reads the per-school SEO markdown produced by scraper/generate_content.py.
 * Returns null when the file does not yet exist (the dev/build flow tolerates
 * missing content - pages render a programmatic fallback instead).
 */

const GENERATED_DIR = path.join(
  process.cwd(),
  "scraper",
  "data",
  "generated",
);

export function loadSchoolContent(
  schoolId: string,
  locale: Locale,
): string | null {
  const filePath = path.join(GENERATED_DIR, `${schoolId}_${locale}.md`);
  if (!fs.existsSync(filePath)) return null;
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}
