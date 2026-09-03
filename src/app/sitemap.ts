import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/lib/public-articles";
import { getPublishedLaboratoryTests } from "@/lib/laboratory-test-data";
import { getSiteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [articles, tests] = await Promise.all([
    getPublishedArticles(100, "fa"),
    getPublishedLaboratoryTests(),
  ]);
  const staticPages: MetadataRoute.Sitemap = [
    { changeFrequency: "weekly", priority: 1, url: new URL("/", siteUrl).toString() },
    { changeFrequency: "monthly", priority: 0.8, url: new URL("/about", siteUrl).toString() },
    { changeFrequency: "monthly", priority: 0.9, url: new URL("/contact", siteUrl).toString() },
    { changeFrequency: "weekly", priority: 0.8, url: new URL("/articles", siteUrl).toString() },
    { changeFrequency: "weekly", priority: 0.8, url: new URL("/tests", siteUrl).toString() },
  ];

  return [
    ...staticPages,
    ...articles.map((article) => ({
      changeFrequency: "monthly" as const,
      lastModified: article.publishedAt,
      priority: 0.7,
      url: new URL(`/articles/${encodeURIComponent(article.slug)}`, siteUrl).toString(),
    })),
    ...tests.map((test) => ({
      changeFrequency: "monthly" as const,
      priority: 0.7,
      url: new URL(`/tests/${encodeURIComponent(test.slug)}`, siteUrl).toString(),
    })),
  ];
}
