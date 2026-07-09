import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

// output:export 下强制静态生成 out/robots.txt。
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
