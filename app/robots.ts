import type { MetadataRoute } from "next";

// Static-export friendly robots.txt (emitted at build time).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://naramcharan.me/sitemap.xml",
  };
}
