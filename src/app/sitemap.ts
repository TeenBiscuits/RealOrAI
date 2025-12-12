import type { MetadataRoute } from "next";
import { locales, defaultLocale } from "@/i18n/config";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const staticRoutes = ["", "/solo", "/host"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return staticRoutes.flatMap((path) => {
    const localizedUrls: Record<string, string> = Object.fromEntries(
      locales.map((locale) => [
        locale,
        `${siteUrl}${path === "" ? `/${locale}` : `/${locale}${path}`}`,
      ]),
    );

    return locales.map((locale) => {
      const url = localizedUrls[locale];

      return {
        url,
        lastModified: now,
        changeFrequency: "weekly",
        priority: path === "" ? 1 : 0.8,
        alternates: {
          languages: {
            ...localizedUrls,
            "x-default": localizedUrls[defaultLocale],
          },
        },
      };
    });
  });
}
