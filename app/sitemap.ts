import type { MetadataRoute } from "next";
import { CARD_MEANINGS } from "@/lib/content/cards";
import { HOUSE_MEANINGS } from "@/lib/content/houses";
import { TECHNIQUES } from "@/lib/content/techniques";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://36cards.com";

  const staticRoutes = [
    "",
    "/glossary",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const cardRoutes = CARD_MEANINGS.map((card) => ({
    url: `${base}/glossary/cards/${card.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const houseRoutes = HOUSE_MEANINGS.map((house) => ({
    url: `${base}/glossary/houses/${house.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const techniqueRoutes = TECHNIQUES.map((item) => ({
    url: `${base}/glossary/techniques/${item.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...cardRoutes, ...houseRoutes, ...techniqueRoutes];
}
