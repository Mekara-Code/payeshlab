import { getPrisma } from "@/lib/prisma";

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

export const defaultPublicArticles: PublicArticle[] = [
  { id: "sample-article-preparation", slug: "preparing-for-specialized-tests", title: "آمادگی پیش از آزمایش‌های تخصصی؛ چند نکته برای نتیجه‌ای دقیق‌تر", excerpt: "راهنمایی کوتاه و کاربردی برای مراجعه آگاهانه‌تر به آزمایشگاه.", imageUrl: "/background-hq.png", publishedAt: "2026-07-28T00:00:00.000Z" },
  { id: "sample-article-quality", slug: "quality-assurance-at-payesh", title: "کنترل کیفیت؛ پشتوانه هر پاسخ قابل اعتماد", excerpt: "نگاهی به مسیر کنترل کیفیت از پذیرش تا گزارش نهایی.", imageUrl: "/background.png", publishedAt: "2026-07-24T00:00:00.000Z" },
  { id: "sample-article-online-results", slug: "secure-online-results", title: "دریافت امن و سریع جواب آزمایش به‌صورت آنلاین", excerpt: "راهنمای استفاده آسان از سامانه پاسخ‌دهی آنلاین.", imageUrl: "/background-hq.png", publishedAt: "2026-07-20T00:00:00.000Z" },
  { id: "sample-article-nutrition", slug: "nutrition-and-lab-tests", title: "تغذیه و نتایج آزمایش؛ آنچه باید بدانید", excerpt: "تأثیر عادت‌های غذایی بر برخی از آزمایش‌های روتین.", imageUrl: "/background.png", publishedAt: "2026-07-16T00:00:00.000Z" },
  { id: "sample-article-insurance", slug: "insurance-admission-guide", title: "راهنمای پذیرش با بیمه‌های طرف قرارداد", excerpt: "مدارک موردنیاز و مراحل پذیرش آسان با بیمه.", imageUrl: "/background-hq.png", publishedAt: "2026-07-12T00:00:00.000Z" },
  { id: "sample-article-checkup", slug: "periodic-checkups", title: "چکاپ دوره‌ای؛ انتخابی آگاهانه برای سلامت فردا", excerpt: "چرا بررسی منظم شاخص‌های سلامت اهمیت دارد؟", imageUrl: "/background.png", publishedAt: "2026-07-08T00:00:00.000Z" },
  { id: "sample-article-pathology", slug: "pathology-precision", title: "دقت در پاتولوژی، اطمینان در تصمیم درمان", excerpt: "نقش فرآیندهای استاندارد در گزارش‌های پاتولوژی.", imageUrl: "/background-hq.png", publishedAt: "2026-07-04T00:00:00.000Z" },
  { id: "sample-article-sampling", slug: "sampling-guide", title: "راهنمای نمونه‌گیری؛ تجربه‌ای آرام و دقیق", excerpt: "چند توصیه ساده پیش از مراجعه برای نمونه‌گیری.", imageUrl: "/background.png", publishedAt: "2026-06-30T00:00:00.000Z" },
];

export async function getPublishedArticles(limit = 8): Promise<PublicArticle[]> {
  try {
    const articles = await getPrisma().article.findMany({
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: { createdAt: true, excerpt: true, featuredImage: true, id: true, publishedAt: true, slug: true, title: true },
      take: limit,
      where: { status: "PUBLISHED", type: "ARTICLE" },
    });

    const publishedArticles = articles.map((article) => ({
      excerpt: article.excerpt ?? "برای مطالعه جزئیات و نکات بیشتر، این مقاله را دنبال کنید.",
      id: article.id,
      imageUrl: article.featuredImage,
      publishedAt: (article.publishedAt ?? article.createdAt).toISOString(),
      slug: article.slug,
      title: article.title,
    }));

    return publishedArticles.length > 0 ? publishedArticles : defaultPublicArticles.slice(0, limit);
  } catch {
    return defaultPublicArticles.slice(0, limit);
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

function getFallbackArticleDetail(article: PublicArticle): PublicArticleDetail {
  return {
    ...article,
    categories: ["مجله پایش"],
    content: [
      {
        content: article.excerpt,
        id: `${article.id}-intro`,
        type: "paragraph",
      },
      {
        content: "آنچه باید بدانید",
        id: `${article.id}-heading`,
        type: "heading",
      },
      {
        content:
          "در این مطلب، نکات کاربردی را به‌صورت روشن و مرحله‌به‌مرحله مرور می‌کنیم تا انتخاب آگاهانه‌تری در مسیر سلامت داشته باشید.",
        id: `${article.id}-body`,
        type: "paragraph",
      },
      {
        content:
          "این مطلب برای آشنایی عمومی تهیه شده است و جایگزین توصیهٔ پزشک یا تفسیر تخصصی آزمایش‌ها نیست.",
        id: `${article.id}-note`,
        type: "quote",
      },
    ],
    metaDescription: article.excerpt,
    tags: ["سلامت", "آزمایشگاه"],
  };
}

export async function getPublishedArticleBySlug(
  slug: string,
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
      },
      where: { slug, status: "PUBLISHED", type: "ARTICLE" },
    });

    if (!article) {
      const fallbackArticle = defaultPublicArticles.find((item) => item.slug === slug);
      return fallbackArticle ? getFallbackArticleDetail(fallbackArticle) : null;
    }

    const baseArticle: PublicArticle = {
      excerpt:
        article.excerpt ??
        "برای مطالعهٔ جزئیات و نکات بیشتر، این مقاله را دنبال کنید.",
      id: article.id,
      imageUrl: article.featuredImage,
      publishedAt: (article.publishedAt ?? article.createdAt).toISOString(),
      slug: article.slug,
      title: article.title,
    };
    const content = getArticleBlocks(article.content);

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
      metaDescription: article.metaDescription,
      tags: article.tags,
    };
  } catch {
    const fallbackArticle = defaultPublicArticles.find((item) => item.slug === slug);
    return fallbackArticle ? getFallbackArticleDetail(fallbackArticle) : null;
  }
}
