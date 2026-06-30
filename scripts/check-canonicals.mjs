/**
 * Crawls a sample of pages on localhost:3001 in both locales and asserts
 * that <link rel="canonical"> matches the page's own URL.
 *
 * Usage: node scripts/check-canonicals.mjs
 */

const BASE = "http://localhost:3001";
const PROD = "https://clickclickdrive-cyprus.com";

// [fetch path, expected canonical path in production domain]
const PAGES = [
  ["/", "/"],
  ["/en", "/en"],
  ["/arthra", "/arthra"],
  ["/en/blog", "/en/blog"],
  ["/aporrito", "/aporrito"],
  ["/en/privacy", "/en/privacy"],
  ["/oroi", "/oroi"],
  ["/en/terms", "/en/terms"],
  ["/scholes-odigon", "/scholes-odigon"],
  ["/en/driving-schools", "/en/driving-schools"],
  ["/kalytera-scholes-odigon-lefkosia", "/kalytera-scholes-odigon-lefkosia"],
  ["/en/best-driving-schools-nicosia", "/en/best-driving-schools-nicosia"],
  ["/kalytera-scholes-odigon-lemesos", "/kalytera-scholes-odigon-lemesos"],
  ["/en/best-driving-schools-limassol", "/en/best-driving-schools-limassol"],
];

function extractCanonical(html) {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  return m ? m[1] : null;
}

let passed = 0;
let failed = 0;

for (const [path, expectedCanonicalPath] of PAGES) {
  const url = `${BASE}${path}`;
  // Canonical always uses the production domain — compare as full URL.
  const expectedCanonical = expectedCanonicalPath === "/"
    ? PROD
    : `${PROD}${expectedCanonicalPath}`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    const html = await res.text();
    const canonical = extractCanonical(html);
    if (!canonical) {
      console.error(`FAIL [no canonical found] ${url}`);
      failed++;
    } else if (canonical === expectedCanonical) {
      console.log(`PASS ${path} → ${canonical}`);
      passed++;
    } else {
      console.error(`FAIL ${path}`);
      console.error(`     expected:  ${expectedCanonical}`);
      console.error(`     got:       ${canonical}`);
      failed++;
    }
  } catch (err) {
    console.error(`ERROR ${url}: ${err.message}`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
