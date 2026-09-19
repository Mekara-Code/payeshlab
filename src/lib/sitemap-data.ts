import "server-only";

import { getPrisma } from "@/lib/prisma";
import {
  getDefaultPublicArticles,
  PREPARATIONS_PER_PAGE,
} from "@/lib/public-articles";
import { SITE_SETTINGS_ID } from "@/lib/site-settings";
import { getDefaultSlideshowSlides } from "@/lib/slideshow-data";

export type SitemapArticle = {
  imageUrl: string | null;
  lastModified: Date;
  slug: string;
};

export type SitemapLaboratoryTest = {
  lastModified: Date;
  slug: string;
};

export type SitemapGalleryMedia = {
  altText: string;
  createdAt: Date;
  description: string | null;
  lastModified: Date;
  mediaUrl: string;
  posterUrl: string | null;
  title: string;
  type: "IMAGE" | "VIDEO";
};

export type SitemapPreparations = {
  items: SitemapArticle[];
  /** Number of archive pages, mirroring the page size used by the public route. */
  pageCount: number;
};

export type SitemapContent = {
  articles: SitemapArticle[];
  gallery: SitemapGalleryMedia[];
  homeImages: string[];
  homeLastModified: Date | undefined;
  /** Empty when no guide is published, so the archive stays out of the sitemap. */
  preparations: SitemapPreparations;
  settingsLastModified: Date | undefined;
  tests: SitemapLaboratoryTest[];
};

async function safely<T, F>(query: () => Promise<T>, fallback: F): Promise<T | F> {
  try {
    return await query();
  } catch {
    return fallback;
  }
}

export function latestDate(dates: Array<Date | null | undefined>) {
  return dates.reduce<Date | undefined>(
    (latest, date) => (date && (!latest || date > latest) ? date : latest),
    undefined,
  );
}

const translationTimestamps = { select: { updatedAt: true } } as const;

async function getSitemapArticles(): Promise<SitemapArticle[]> {
  const articles = await safely(
    () =>
      getPrisma().article.findMany({
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        select: {
          featuredImage: true,
          slug: true,
          translations: translationTimestamps,
          updatedAt: true,
        },
        where: { status: "PUBLISHED", type: "ARTICLE" },
      }),
    null,
  );

  // A failed query must not advertise placeholder URLs in place of real ones.
  if (!articles) return [];

  // Mirrors the public pages, which render the built-in articles until real ones are published.
  if (articles.length === 0) {
    return getDefaultPublicArticles("fa").map((article) => ({
      imageUrl: article.imageUrl,
      lastModified: new Date(article.publishedAt),
      slug: article.slug,
    }));
  }

  return articles.map((article) => ({
    imageUrl: article.featuredImage,
    lastModified:
      latestDate([article.updatedAt, ...article.translations.map((translation) => translation.updatedAt)]) ??
      article.updatedAt,
    slug: article.slug,
  }));
}

async function getSitemapPreparations(): Promise<SitemapPreparations> {
  const preparations = await safely(
    () =>
      getPrisma().article.findMany({
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        select: {
          featuredImage: true,
          slug: true,
          translations: translationTimestamps,
          updatedAt: true,
        },
        where: { status: "PUBLISHED", type: "PREPARATION" },
      }),
    null,
  );

  // A failed query must not advertise URLs the site may not actually serve.
  if (!preparations || preparations.length === 0) {
    return { items: [], pageCount: 0 };
  }

  return {
    items: preparations.map((preparation) => ({
      imageUrl: preparation.featuredImage,
      lastModified:
        latestDate([
          preparation.updatedAt,
          ...preparation.translations.map((translation) => translation.updatedAt),
        ]) ?? preparation.updatedAt,
      slug: preparation.slug,
    })),
    pageCount: Math.ceil(preparations.length / PREPARATIONS_PER_PAGE),
  };
}

async function getSitemapLaboratoryTests(): Promise<SitemapLaboratoryTest[]> {
  const tests = await safely(
    () =>
      getPrisma().laboratoryTest.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { slug: true, updatedAt: true },
        where: { isActive: true },
      }),
    [],
  );

  return tests.map((test) => ({ lastModified: test.updatedAt, slug: test.slug }));
}

async function getSitemapGalleryMedia(): Promise<SitemapGalleryMedia[]> {
  const media = await safely(
    () =>
      getPrisma().galleryMedia.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        select: {
          altText: true,
          createdAt: true,
          description: true,
          mediaUrl: true,
          posterUrl: true,
          title: true,
          type: true,
          updatedAt: true,
        },
        where: { isActive: true },
      }),
    [],
  );

  return media.map(({ updatedAt, ...item }) => ({ ...item, lastModified: updatedAt }));
}

async function getSettingsLastModified() {
  const settings = await safely(
    () =>
      getPrisma().siteSettings.findUnique({
        select: {
          addresses: { select: { updatedAt: true } },
          phoneNumbers: { select: { updatedAt: true } },
          updatedAt: true,
          workingHours: { select: { updatedAt: true } },
        },
        where: { id: SITE_SETTINGS_ID },
      }),
    null,
  );

  if (!settings) return undefined;

  return latestDate([
    settings.updatedAt,
    ...settings.addresses.map((address) => address.updatedAt),
    ...settings.phoneNumbers.map((phone) => phone.updatedAt),
    ...settings.workingHours.map((workingHour) => workingHour.updatedAt),
  ]);
}

async function getHomeSections() {
  const prisma = getPrisma();
  const latestUpdate = { _max: { updatedAt: true } } as const;
  // Aggregates span inactive rows too, so hiding a section item also moves the date forward.
  const [slides, departments, ...sectionUpdates] = await Promise.all([
    safely(
      () =>
        prisma.slideshowSlide.findMany({
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: { imageUrl: true },
          where: { isActive: true },
        }),
      null,
    ),
    safely(
      () =>
        prisma.labDepartment.findMany({
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: { imageUrl: true },
          where: { isActive: true },
        }),
      [],
    ),
    safely(() => prisma.slideshowSlide.aggregate(latestUpdate), null),
    safely(() => prisma.labDepartment.aggregate(latestUpdate), null),
    safely(() => prisma.announcement.aggregate(latestUpdate), null),
    safely(() => prisma.insurance.aggregate(latestUpdate), null),
  ]);
  const heroImages =
    slides && slides.length > 0
      ? slides.map((slide) => slide.imageUrl)
      : getDefaultSlideshowSlides("fa").map((slide) => slide.imageUrl);

  return {
    images: [
      ...heroImages,
      ...departments.flatMap((department) => (department.imageUrl ? [department.imageUrl] : [])),
    ],
    lastModified: latestDate(sectionUpdates.map((update) => update?._max.updatedAt)),
  };
}

export async function getSitemapContent(): Promise<SitemapContent> {
  const [articles, tests, gallery, preparations, settingsLastModified, home] =
    await Promise.all([
      getSitemapArticles(),
      getSitemapLaboratoryTests(),
      getSitemapGalleryMedia(),
      getSitemapPreparations(),
      getSettingsLastModified(),
      getHomeSections(),
    ]);

  return {
    articles,
    gallery,
    homeImages: [...new Set(home.images)],
    // The home page also lists the latest articles and the footer contact details.
    homeLastModified: latestDate([
      home.lastModified,
      settingsLastModified,
      ...articles.map((article) => article.lastModified),
    ]),
    preparations,
    settingsLastModified,
    tests,
  };
}
