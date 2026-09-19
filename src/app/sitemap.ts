import type { MetadataRoute } from "next";
import { getSiteUrl, isSearchIndexingAllowed } from "@/lib/seo";
import {
  getSitemapContent,
  latestDate,
  type SitemapGalleryMedia,
} from "@/lib/sitemap-data";

// Refreshed hourly; admin actions also revalidate it the moment content is published.
export const revalidate = 3600;

type SitemapEntry = MetadataRoute.Sitemap[number];
type SitemapVideo = NonNullable<SitemapEntry["videos"]>[number];

// Google's documented limits for video sitemap fields.
const videoTitleMaxLength = 100;
const videoDescriptionMaxLength = 2048;

const xmlEntities: Record<string, string> = {
  '"': "&quot;",
  "&": "&amp;",
  "'": "&apos;",
  "<": "&lt;",
  ">": "&gt;",
};

// Next.js writes sitemap values into the XML verbatim, so anything that can
// contain admin-entered text or query strings is escaped here.
function escapeXml(value: string) {
  return value.replace(/["&'<>]/g, (character) => xmlEntities[character]);
}

function truncate(value: string, maxLength: number) {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;
}

/** Resolves relative paths against the canonical origin and percent-encodes non-ASCII characters. */
function toSitemapUrl(path: string) {
  try {
    const url = new URL(path, getSiteUrl());
    return url.protocol === "http:" || url.protocol === "https:" ? escapeXml(url.toString()) : null;
  } catch {
    return null;
  }
}

function toSitemapUrls(paths: Array<string | null | undefined>) {
  const urls = paths.flatMap((path) => {
    const url = path ? toSitemapUrl(path) : null;
    return url ? [url] : [];
  });

  return [...new Set(urls)];
}

function page(
  path: string,
  options: Omit<SitemapEntry, "images" | "url"> & { images?: Array<string | null | undefined> },
): SitemapEntry {
  const { images, ...entry } = options;
  const imageUrls = toSitemapUrls(images ?? []);

  return {
    ...entry,
    ...(imageUrls.length > 0 ? { images: imageUrls } : {}),
    url: toSitemapUrl(path) ?? path,
  };
}

function toSitemapVideo(item: SitemapGalleryMedia): SitemapVideo[] {
  const contentUrl = toSitemapUrl(item.mediaUrl);
  const thumbnailUrl = item.posterUrl ? toSitemapUrl(item.posterUrl) : null;

  // Google rejects video entries without a thumbnail.
  if (!contentUrl || !thumbnailUrl) return [];

  return [
    {
      content_loc: contentUrl,
      description: escapeXml(truncate(item.description || item.altText || item.title, videoDescriptionMaxLength)),
      family_friendly: "yes",
      publication_date: item.createdAt.toISOString(),
      thumbnail_loc: thumbnailUrl,
      title: escapeXml(truncate(item.title, videoTitleMaxLength)),
    },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Staging and preview deployments are disallowed in robots.txt; an empty sitemap keeps them consistent.
  if (!isSearchIndexingAllowed()) return [];

  const content = await getSitemapContent();
  const preparationLastModified = latestDate(
    content.preparations.items.map((preparation) => preparation.lastModified),
  );
  const galleryImages = content.gallery.filter((item) => item.type === "IMAGE");
  const galleryVideos = content.gallery.filter((item) => item.type === "VIDEO").flatMap(toSitemapVideo);

  return [
    page("/", {
      changeFrequency: "daily",
      images: content.homeImages,
      lastModified: content.homeLastModified,
      priority: 1,
    }),

    // Test catalogue: the pages with the strongest search intent ("<test name> آزمایش").
    page("/tests", {
      changeFrequency: "weekly",
      lastModified: latestDate(content.tests.map((test) => test.lastModified)),
      priority: 0.9,
    }),
    ...content.tests.map((test) =>
      page(`/tests/${encodeURIComponent(test.slug)}`, {
        changeFrequency: "monthly",
        lastModified: test.lastModified,
        priority: 0.8,
      }),
    ),

    // Preparation guides: high search intent ("<test name> آمادگی"), one URL per guide
    // plus every page of the archive so deep pages are still discoverable.
    ...(preparationLastModified
      ? [
          page("/test-preparation", {
            changeFrequency: "weekly",
            lastModified: preparationLastModified,
            priority: 0.9,
          }),
          ...Array.from({ length: Math.max(0, content.preparations.pageCount - 1) }, (_, index) =>
            page(`/test-preparation/page/${index + 2}`, {
              changeFrequency: "weekly",
              lastModified: preparationLastModified,
              priority: 0.5,
            }),
          ),
          ...content.preparations.items.map((preparation) =>
            page(`/test-preparation/${encodeURIComponent(preparation.slug)}`, {
              changeFrequency: "monthly",
              images: [preparation.imageUrl],
              lastModified: preparation.lastModified,
              priority: 0.8,
            }),
          ),
        ]
      : []),

    page("/contact", {
      changeFrequency: "monthly",
      lastModified: content.settingsLastModified,
      priority: 0.8,
    }),

    page("/articles", {
      changeFrequency: "weekly",
      lastModified: latestDate(content.articles.map((article) => article.lastModified)),
      priority: 0.7,
    }),
    ...content.articles.map((article) =>
      page(`/articles/${encodeURIComponent(article.slug)}`, {
        changeFrequency: "monthly",
        images: [article.imageUrl],
        lastModified: article.lastModified,
        priority: 0.7,
      }),
    ),

    page("/about", {
      changeFrequency: "monthly",
      lastModified: content.settingsLastModified,
      priority: 0.6,
    }),

    page("/gallery", {
      changeFrequency: "monthly",
      images: galleryImages.map((item) => item.mediaUrl),
      lastModified: latestDate(content.gallery.map((item) => item.lastModified)),
      priority: 0.5,
      ...(galleryVideos.length > 0 ? { videos: galleryVideos } : {}),
    }),
  ];
}
