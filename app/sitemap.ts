import type { MetadataRoute } from "next";

// Static-export friendly sitemap.xml (single-page site).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://naramcharan.me",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
