import { getPrisma } from "@/lib/prisma";
import {
  toDatabaseContentLocale,
  type ContentLocale,
} from "@/lib/content-locale";
import { getDictionary } from "@/lib/dictionaries";
import { translate } from "@/lib/dictionaries/types";

export type PublicArticle = {
  excerpt: string;
  id: string;
  imageUrl: string | null;
  publishedAt: string;
  slug: string;
  title: string;
};

const articleBlockTypes = [
  "paragraph",
  "heading",
  "list",
  "quote",
  "table",
] as const;

export type PublicArticleBlock = {
  content: string;
  id: string;
  type: (typeof articleBlockTypes)[number];
};

export type PublicArticleDetail = PublicArticle & {
  categories: string[];
  content: PublicArticleBlock[];
  metaDescription: string | null;
  tags: string[];
};

const defaultArticleDefinitions = [
  { id: "sample-article-preparation", slug: "preparing-for-specialized-tests", imageUrl: "/background-hq.png", publishedAt: "2026-07-28T00:00:00.000Z", key: "preparation" },
  { id: "sample-article-quality", slug: "quality-assurance-at-payesh", imageUrl: "/background.png", publishedAt: "2026-07-24T00:00:00.000Z", key: "quality" },
  { id: "sample-article-online-results", slug: "secure-online-results", imageUrl: "/background-hq.png", publishedAt: "2026-07-20T00:00:00.000Z", key: "results" },
  { id: "sample-article-nutrition", slug: "nutrition-and-lab-tests", imageUrl: "/background.png", publishedAt: "2026-07-16T00:00:00.000Z", key: "nutrition" },
  { id: "sample-article-insurance", slug: "insurance-admission-guide", imageUrl: "/background-hq.png", publishedAt: "2026-07-12T00:00:00.000Z", key: "insurance" },
  { id: "sample-article-checkup", slug: "periodic-checkups", imageUrl: "/background.png", publishedAt: "2026-07-08T00:00:00.000Z", key: "checkup" },
  { id: "sample-article-pathology", slug: "pathology-precision", imageUrl: "/background-hq.png", publishedAt: "2026-07-04T00:00:00.000Z", key: "pathology" },
  { id: "sample-article-sampling", slug: "sampling-guide", imageUrl: "/background.png", publishedAt: "2026-06-30T00:00:00.000Z", key: "sampling" },
] as const;

export function getDefaultPublicArticles(locale: ContentLocale): PublicArticle[] {
  const dictionary = getDictionary(locale);

  return defaultArticleDefinitions.map((article) => ({
    ...article,
    excerpt: translate(dictionary, `fallbackArticles.${article.key}Excerpt`),
    title: translate(dictionary, `fallbackArticles.${article.key}Title`),
  }));
}

export async function getPublishedArticles(
  limit = 8,
  locale: ContentLocale = "fa",
): Promise<PublicArticle[]> {
  try {
    const articles = await getPrisma().article.findMany({
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: {
        createdAt: true,
        excerpt: true,
        featuredImage: true,
        id: true,
        publishedAt: true,
        slug: true,
        title: true,
        translations: {
          select: { excerpt: true, title: true },
          where: { locale: toDatabaseContentLocale(locale) },
        },
      },
      take: limit,
      where: { status: "PUBLISHED", type: "ARTICLE" },
    });

    const publishedArticles = articles.map((article) => {
      const translation = article.translations?.[0];
      return {
      excerpt: translation?.excerpt ?? article.excerpt ?? translate(getDictionary(locale), "fallbackArticles.defaultExcerpt"),
      id: article.id,
      imageUrl: article.featuredImage,
      publishedAt: (article.publishedAt ?? article.createdAt).toISOString(),
      slug: article.slug,
      title: translation?.title ?? article.title,
    };
    });

    return publishedArticles.length > 0 ? publishedArticles : getDefaultPublicArticles(locale).slice(0, limit);
  } catch {
    return getDefaultPublicArticles(locale).slice(0, limit);
  }
}

function isArticleBlockType(value: unknown): value is PublicArticleBlock["type"] {
  return typeof value === "string" && articleBlockTypes.includes(value as PublicArticleBlock["type"]);
}

function getArticleBlocks(value: unknown): PublicArticleBlock[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((block) => {
    if (!block || typeof block !== "object") return [];

    const item = block as Record<string, unknown>;
    if (
      typeof item.id !== "string" ||
      typeof item.content !== "string" ||
      !isArticleBlockType(item.type)
    ) {
      return [];
    }

    return [{ content: item.content, id: item.id, type: item.type }];
  });
}

function hasReadableBlockContent(blocks: PublicArticleBlock[]) {
  return blocks.some((block) => {
    if (block.type === "table") {
      try {
        const rows = JSON.parse(block.content) as unknown;
        return Array.isArray(rows) && rows.some(
          (row) => Array.isArray(row) && row.some(
            (cell) => typeof cell === "string" && cell.trim().length > 0,
          ),
        );
      } catch {
        return false;
      }
    }

    return block.content
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .trim().length > 0;
  });
}

function getFallbackArticleDetail(article: PublicArticle, locale: ContentLocale): PublicArticleDetail {
  const dictionary = getDictionary(locale);

  return {
    ...article,
    categories: [translate(dictionary, "articles.defaultCategory")],
    content: [
      {
        content: article.excerpt,
        id: `${article.id}-intro`,
        type: "paragraph",
      },
      {
        content: translate(dictionary, "fallbackArticles.detailHeading"),
        id: `${article.id}-heading`,
        type: "heading",
      },
      {
        content: translate(dictionary, "fallbackArticles.detailBody"),
        id: `${article.id}-body`,
        type: "paragraph",
      },
      {
        content: translate(dictionary, "fallbackArticles.detailNote"),
        id: `${article.id}-note`,
        type: "quote",
      },
    ],
    metaDescription: article.excerpt,
    tags: [translate(dictionary, "fallbackArticles.healthTag"), translate(dictionary, "fallbackArticles.laboratoryTag")],
  };
}

export async function getPublishedArticleBySlug(
  slug: string,
  locale: ContentLocale = "fa",
): Promise<PublicArticleDetail | null> {
  try {
    const article = await getPrisma().article.findFirst({
      select: {
        categories: { select: { name: true } },
        content: true,
        createdAt: true,
        excerpt: true,
        featuredImage: true,
        id: true,
        metaDescription: true,
        publishedAt: true,
        slug: true,
        tags: true,
        title: true,
        translations: {
          select: {
            content: true,
            excerpt: true,
            metaDescription: true,
            tags: true,
            title: true,
          },
          where: { locale: toDatabaseContentLocale(locale) },
        },
      },
      where: { slug, status: "PUBLISHED", type: "ARTICLE" },
    });

    if (!article) {
      const fallbackArticle = getDefaultPublicArticles(locale).find((item) => item.slug === slug);
      return fallbackArticle ? getFallbackArticleDetail(fallbackArticle, locale) : null;
    }

    const translation = article.translations?.[0];
    const baseArticle: PublicArticle = {
      excerpt:
        translation?.excerpt ??
        article.excerpt ??
        translate(getDictionary(locale), "fallbackArticles.defaultExcerpt"),
      id: article.id,
      imageUrl: article.featuredImage,
      publishedAt: (article.publishedAt ?? article.createdAt).toISOString(),
      slug: article.slug,
      title: translation?.title ?? article.title,
    };
    const content = getArticleBlocks(translation?.content ?? article.content);

    return {
      ...baseArticle,
      categories: article.categories.map((category) => category.name),
      content:
        content.length > 0
          ? content
          : [
              {
                content: baseArticle.excerpt,
                id: `${baseArticle.id}-intro`,
                type: "paragraph",
              },
            ],
      metaDescription: translation?.metaDescription ?? article.metaDescription,
      tags: translation?.tags ?? article.tags,
    };
  } catch {
    const fallbackArticle = getDefaultPublicArticles(locale).find((item) => item.slug === slug);
    return fallbackArticle ? getFallbackArticleDetail(fallbackArticle, locale) : null;
  }
}

export async function getPublishedTestPreparation(
  locale: ContentLocale = "fa",
): Promise<PublicArticleDetail | null> {
  try {
    const article = await getPrisma().article.findFirst({
      select: {
        content: true,
        createdAt: true,
        excerpt: true,
        featuredImage: true,
        id: true,
        metaDescription: true,
        publishedAt: true,
        slug: true,
        tags: true,
        title: true,
        translations: {
          select: {
            content: true,
            excerpt: true,
            metaDescription: true,
            tags: true,
            title: true,
          },
          where: { locale: toDatabaseContentLocale(locale) },
        },
      },
      where: { status: "PUBLISHED", type: "PREPARATION" },
    });

    if (!article) return null;

    const translation = article.translations?.[0];
    const translatedContent = getArticleBlocks(translation?.content);
    const primaryContent = getArticleBlocks(article.content);
    const content = hasReadableBlockContent(translatedContent)
      ? translatedContent
      : primaryContent;

    if (!hasReadableBlockContent(content)) return null;

    return {
      categories: [],
      content,
      excerpt: translation?.excerpt ?? article.excerpt ?? "",
      id: article.id,
      imageUrl: article.featuredImage,
      metaDescription: translation?.metaDescription ?? article.metaDescription,
      publishedAt: (article.publishedAt ?? article.createdAt).toISOString(),
      slug: article.slug,
      tags: translation?.tags ?? article.tags,
      title: translation?.title ?? article.title,
    };
  } catch {
    return null;
  }
}
