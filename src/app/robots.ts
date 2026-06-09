import type { MetadataRoute } from "next";

import { SITE_HOST } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_HOST}/sitemap.xml`,
    host: SITE_HOST,
  };
}
