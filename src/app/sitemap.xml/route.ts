import { buildSitemapXml } from "@/lib/sitemap";

// Generated once at build time: lastmod comes from git history, which is not
// available to a serverless function at request time.
export const dynamic = "force-static";

export function GET() {
  return new Response(buildSitemapXml(), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
