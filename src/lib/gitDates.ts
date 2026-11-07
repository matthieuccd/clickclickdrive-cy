import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * Build-time, git-derived dates for pages that have no authored date field.
 *
 * Server-only (runs `git`). Results are cached per process, so the sitemap
 * costs one `git log` per distinct source file, not per URL.
 *
 * Every function returns null rather than guessing: when git is missing, the
 * directory is not a repository, the clone is shallow (a shallow boundary
 * commit pretends to have touched every file, which would stamp the same date
 * on every page), or the file has no history yet.
 */

const ROOT = process.cwd();

function git(args: string[]): string | null {
  try {
    return execFileSync("git", ["--literal-pathspecs", ...args], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 16 * 1024 * 1024,
    }).trim();
  } catch {
    return null;
  }
}

let historyOk: boolean | undefined;

/** True when git history can be trusted for per-file dates. */
export function gitHistoryAvailable(): boolean {
  if (historyOk === undefined) {
    historyOk =
      git(["rev-parse", "--is-inside-work-tree"]) === "true" &&
      git(["rev-parse", "--is-shallow-repository"]) === "false";
  }
  return historyOk;
}

function unixToDay(ts: string | undefined): string | null {
  const n = Number(ts);
  return ts && Number.isFinite(n)
    ? new Date(n * 1000).toISOString().slice(0, 10)
    : null;
}

const lastCache = new Map<string, string | null>();
const firstCache = new Map<string, string | null>();

/** UTC day of the last commit that touched `file` (repo-relative). */
export function lastCommitDay(file: string): string | null {
  if (!gitHistoryAvailable() || !fs.existsSync(path.join(/*turbopackIgnore: true*/ ROOT, file))) {
    return null;
  }
  if (!lastCache.has(file)) {
    const out = git(["log", "-1", "--format=%ct", "--", file]);
    lastCache.set(file, unixToDay(out || undefined));
  }
  return lastCache.get(file) ?? null;
}

/** UTC day of the commit that first added `file` (repo-relative). */
export function firstCommitDay(file: string): string | null {
  if (!gitHistoryAvailable()) return null;
  if (!firstCache.has(file)) {
    const out = git([
      "log",
      "--follow",
      "--diff-filter=A",
      "--format=%ct",
      "--",
      file,
    ]);
    const lines = (out ?? "").split("\n").filter(Boolean);
    firstCache.set(file, unixToDay(lines[lines.length - 1]));
  }
  return firstCache.get(file) ?? null;
}

/** Newest last-commit day across `files`; null when none has history. */
export function lastModifiedDay(files: string[]): string | null {
  let best: string | null = null;
  for (const f of files) {
    const d = lastCommitDay(f);
    if (d && (!best || d > best)) best = d;
  }
  return best;
}

/**
 * The schools data file the site reads (mirrors the preference order in
 * lib/schools.ts: enriched JSONL first, base scrape as fallback).
 */
export function schoolsDataFile(): string {
  const enriched = "scraper/output/schools_enriched.jsonl";
  return fs.existsSync(path.join(/*turbopackIgnore: true*/ ROOT, enriched))
    ? enriched
    : "scraper/output/schools.jsonl";
}
