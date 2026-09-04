"use server";

import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { ArticleStatus } from "@/generated/prisma/client";
import { getAdminSession } from "@/lib/admin-session";
import { isValidAdminImageUpload, saveAdminImageAsWebp } from "@/lib/admin-image-uploads";
import { getPrisma } from "@/lib/prisma";

const MAX_BLOCKS = 100;
const MAX_ARTICLE_IMAGE_SIZE = 5 * 1024 * 1024;
const VALID_BLOCK_TYPES = new Set([
  "paragraph",
  "heading",
  "list",
  "quote",
  "table",
]);
const CONTENT_TYPES = new Set(["ARTICLE", "NEWS", "PREPARATION"]);
const articleImageDirectory = join(
  process.cwd(),
  "public",
  "uploads",
  "article-images",
);

export type ManagedContentType = "ARTICLE" | "NEWS" | "PREPARATION";

export type ArticleActionState = {
  message?: string;
  success?: boolean;
};

type ArticleBlock = {
  content: string;
  id: string;
  type: "paragraph" | "heading" | "list" | "quote" | "table";
};

type SavedArticleImage = {
  filePath: string;
  imageUrl: string;
};

type ArticleTranslationInput = {
  content: ArticleBlock[];
  excerpt: string | null;
  metaDescription: string | null;
  tags: string[];
  title: string;
};

type ArticleTranslationMap = Record<"EN" | "AR", ArticleTranslationInput | null>;

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function getString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function parseContentType(value: string): ManagedContentType | null {
  return CONTENT_TYPES.has(value) ? (value as ManagedContentType) : null;
}

function isValidTableContent(content: string) {
  try {
    const rows = JSON.parse(content) as unknown;
    return (
      Array.isArray(rows) &&
      rows.length > 0 &&
      rows.length <= 20 &&
      rows.every(
        (row) =>
          Array.isArray(row) &&
          row.length > 0 &&
          row.length <= 12 &&
          row.every((cell) => typeof cell === "string" && cell.length <= 2_000),
      )
    );
  } catch {
    return false;
  }
}

function parseBlocks(raw: string): ArticleBlock[] | null {
  try {
    const blocks = JSON.parse(raw) as unknown;
    if (
      !Array.isArray(blocks) ||
      blocks.length === 0 ||
      blocks.length > MAX_BLOCKS
    ) {
      return null;
    }

    const validBlocks = blocks.every((block) => {
      if (!block || typeof block !== "object") return false;
      const value = block as Record<string, unknown>;
      return (
        typeof value.id === "string" &&
        typeof value.content === "string" &&
        value.content.length <= 10_000 &&
        typeof value.type === "string" &&
        VALID_BLOCK_TYPES.has(value.type) &&
        (value.type !== "table" || isValidTableContent(value.content))
      );
    });

    return validBlocks ? (blocks as ArticleBlock[]) : null;
  } catch {
    return null;
  }
}

function hasReadableBlockContent(blocks: ArticleBlock[]) {
  return blocks.some((block) =>
    block.content
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .trim(),
  );
}

function parseStringList(raw: string, limit: number, maxLength: number) {
  try {
    const values = JSON.parse(raw) as unknown;
    if (!Array.isArray(values)) return [];
    return Array.from(
      new Set(
        values
          .filter((value): value is string => typeof value === "string")
          .map((value) => value.trim())
          .filter((value) => value.length > 0 && value.length <= maxLength),
      ),
    ).slice(0, limit);
  } catch {
    return [];
  }
}

function parseArticleTranslations(raw: string): ArticleTranslationMap | "invalid" {
  const emptyTranslations: ArticleTranslationMap = { AR: null, EN: null };
  if (!raw) return emptyTranslations;

  try {
    const value = JSON.parse(raw) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return "invalid";
    }

    return (["EN", "AR"] as const).reduce<ArticleTranslationMap>(
      (translations, locale) => {
        const entry = (value as Record<string, unknown>)[locale.toLowerCase()];
        if (entry === undefined || entry === null) return translations;
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
          throw new Error("Invalid translation");
        }

        const translation = entry as Record<string, unknown>;
        const title =
          typeof translation.title === "string" ? translation.title.trim() : "";
        const content = Array.isArray(translation.content)
          ? parseBlocks(JSON.stringify(translation.content))
          : null;
        const excerpt =
          typeof translation.excerpt === "string"
            ? translation.excerpt.trim().slice(0, 2_000) || null
            : null;
        const metaDescription =
          typeof translation.metaDescription === "string"
            ? translation.metaDescription.trim().slice(0, 160) || null
            : null;
        const tags = Array.isArray(translation.tags)
          ? parseStringList(JSON.stringify(translation.tags), 12, 40)
          : [];
        const hasContent = Boolean(
          title ||
            excerpt ||
            metaDescription ||
            tags.length ||
            (content && content.some((block) => block.content.trim())),
        );

        if (!hasContent) return translations;
        if (!title || title.length > 200 || !content) {
          throw new Error("Invalid translation");
        }

        translations[locale] = { content, excerpt, metaDescription, tags, title };
        return translations;
      },
      emptyTranslations,
    );
  } catch {
    return "invalid";
  }
}

async function persistArticleTranslations(
  articleId: string,
  translations: ArticleTranslationMap,
) {
  const prisma = getPrisma();
  await Promise.all(
    (["EN", "AR"] as const).map(async (locale) => {
      const translation = translations[locale];
      if (!translation) {
        await prisma.articleTranslation.deleteMany({
          where: { articleId, locale },
        });
        return;
      }

      await prisma.articleTranslation.upsert({
        where: { articleId_locale: { articleId, locale } },
        create: { articleId, locale, ...translation },
        update: translation,
      });
    }),
  );
}

async function saveArticleImage(
  file: FormDataEntryValue | null,
): Promise<{ error?: string; savedImage?: SavedArticleImage }> {
  if (!file || typeof file === "string" || file.size === 0) return {};

  if (!isValidAdminImageUpload(file, MAX_ARTICLE_IMAGE_SIZE)) {
    return {
      error: "تصویر شاخص باید PNG، JPG یا WebP و حداکثر ۵ مگابایت باشد.",
    };
  }

  return {
    savedImage: await saveAdminImageAsWebp(file, {
      directory: articleImageDirectory,
      maxHeight: 1920,
      maxInputBytes: MAX_ARTICLE_IMAGE_SIZE,
      maxWidth: 1920,
      urlPrefix: "/uploads/article-images",
    }),
  };
}

async function removeStoredArticleImage(imageUrl: string | null) {
  const fileName = imageUrl?.match(
    /^\/uploads\/article-images\/([0-9a-f-]{36}\.(?:jpg|png|webp))$/i,
  )?.[1];
  if (!fileName) return;

  await unlink(join(articleImageDirectory, fileName)).catch(() => undefined);
}

async function requireAdmin() {
  const session = await getAdminSession();
  return session?.role === "ADMIN" ? session : null;
}

function revalidateContentPaths(...slugs: Array<string | null | undefined>) {
  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath("/test-preparation");
  revalidatePath("/admin");
  slugs.forEach((slug) => {
    if (slug && slug !== "test-preparation") {
      revalidatePath(`/articles/${slug}`);
    }
  });
}

export async function saveArticle(
  _previousState: ArticleActionState,
  formData: FormData,
): Promise<ArticleActionState> {
  const session = await requireAdmin();
  if (!session) {
    return { message: "دسترسی شما برای مدیریت محتوا معتبر نیست." };
  }

  const id = getString(formData, "id");
  const type = parseContentType(getString(formData, "type"));
  const title = getString(formData, "title");
  const blocks = parseBlocks(getString(formData, "blocksJson"));
  const translations = parseArticleTranslations(
    getString(formData, "translationsJson"),
  );
  const submittedSlug = getString(formData, "slug");
  const slug = type === "PREPARATION" ? "test-preparation" : slugify(submittedSlug || title);
  const status: ArticleStatus =
    formData.get("status") === "published"
      ? ArticleStatus.PUBLISHED
      : ArticleStatus.DRAFT;

  if (
    !type ||
    !title ||
    title.length > 200 ||
    !slug ||
    !blocks ||
    (type === "PREPARATION" &&
      status === ArticleStatus.PUBLISHED &&
      !hasReadableBlockContent(blocks)) ||
    translations === "invalid" ||
    (id && !isValidUuid(id))
  ) {
    return { message: "عنوان، نامک و محتوای موردنیاز را بررسی کنید." };
  }

  const categoryNames = parseStringList(
    getString(formData, "categoriesJson"),
    10,
    80,
  );
  const tags = parseStringList(getString(formData, "tagsJson"), 12, 40);
  const excerpt = getString(formData, "excerpt").slice(0, 2_000) || null;
  const metaDescription =
    getString(formData, "metaDescription").slice(0, 160) || null;
  const prisma = getPrisma();
  let savedImage: SavedArticleImage | undefined;
  let previousSlug: string | null = null;

  if (!id && type === "PREPARATION") {
    const existingPreparation = await prisma.article.findFirst({
      select: { id: true },
      where: { type: "PREPARATION" },
    });
    if (existingPreparation) {
      return { message: "فقط یک راهنمای آمادگی‌های قبل آزمایش می‌تواند ایجاد شود." };
    }
  }

  try {
    const upload = await saveArticleImage(formData.get("featuredImageFile"));
    if (upload.error) return { message: upload.error };
    savedImage = upload.savedImage;
  } catch {
    return { message: "آپلود تصویر شاخص انجام نشد. دوباره تلاش کنید." };
  }

  const featuredImage =
    savedImage?.imageUrl ??
    (getString(formData, "featuredImage").slice(0, 2_000) || null);
  let previousFeaturedImage: string | null = null;

  try {
    if (id) {
      const existing = await prisma.article.findUnique({
        where: { id },
        select: { featuredImage: true, slug: true, type: true },
      });
      if (!existing || existing.type !== type) {
        if (savedImage) await removeStoredArticleImage(savedImage.imageUrl);
        return { message: "محتوای موردنظر برای ویرایش پیدا نشد." };
      }
      previousFeaturedImage = existing.featuredImage;
      previousSlug = existing.slug;
    }

    const categories = await Promise.all(
      categoryNames.map((name) =>
        prisma.articleCategory.upsert({
          where: { name },
          create: {
            name,
            slug: slugify(name) || `category-${crypto.randomUUID()}`,
          },
          update: {},
          select: { id: true },
        }),
      ),
    );

    const data = {
      content: blocks,
      excerpt,
      featuredImage,
      metaDescription,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      slug,
      status,
      tags,
      title,
      type,
    };

    if (id) {
      await prisma.article.update({
        data: { ...data, categories: { set: categories } },
        where: { id },
      });
      await persistArticleTranslations(id, translations);
    } else {
      const article = await prisma.article.create({
        data: {
          ...data,
          authorId: session.userId,
          categories: { connect: categories },
        },
        select: { id: true },
      });
      await persistArticleTranslations(article.id, translations);
    }
  } catch (error) {
    if (savedImage) await removeStoredArticleImage(savedImage.imageUrl);
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { message: "این نامک یا دسته‌بندی قبلاً استفاده شده است." };
    }
    return { message: "ذخیره محتوا انجام نشد. دوباره تلاش کنید." };
  }

  if (previousFeaturedImage && previousFeaturedImage !== featuredImage) {
    await removeStoredArticleImage(previousFeaturedImage);
  }

  revalidateContentPaths(slug, previousSlug);
  const contentLabel =
    type === "PREPARATION"
      ? "راهنمای آمادگی‌های قبل آزمایش"
      : type === "NEWS"
        ? "خبر"
        : "مقاله";
  return {
    message:
      status === "PUBLISHED"
        ? `${contentLabel} منتشر شد.`
        : `پیش‌نویس ${contentLabel} ذخیره شد.`,
    success: true,
  };
}

export async function toggleArticleStatus(
  id: string,
  type: ManagedContentType,
  isPublished: boolean,
): Promise<ArticleActionState> {
  if (!(await requireAdmin()) || !isValidUuid(id) || !parseContentType(type)) {
    return { message: "درخواست تغییر وضعیت معتبر نیست." };
  }

  const prisma = getPrisma();
  const existing = await prisma.article.findUnique({
    where: { id },
    select: { slug: true, type: true },
  });
  if (!existing || existing.type !== type) {
    return { message: "محتوای موردنظر پیدا نشد." };
  }

  try {
    await prisma.article.update({
      data: {
        publishedAt: isPublished ? null : new Date(),
        status: isPublished ? "DRAFT" : "PUBLISHED",
      },
      where: { id },
    });
  } catch {
    return { message: "تغییر وضعیت انجام نشد. دوباره تلاش کنید." };
  }

  revalidateContentPaths(existing.slug);
  return {
    message: isPublished ? "محتوا به پیش‌نویس منتقل شد." : "محتوا منتشر شد.",
    success: true,
  };
}

export async function deleteArticle(
  id: string,
  type: ManagedContentType,
): Promise<ArticleActionState> {
  if (!(await requireAdmin()) || !isValidUuid(id) || !parseContentType(type)) {
    return { message: "درخواست حذف معتبر نیست." };
  }

  const prisma = getPrisma();
  const existing = await prisma.article.findUnique({
    where: { id },
    select: { featuredImage: true, slug: true, type: true },
  });
  if (!existing || existing.type !== type) {
    return { message: "محتوای موردنظر پیدا نشد." };
  }

  try {
    await prisma.article.delete({ where: { id } });
    await removeStoredArticleImage(existing.featuredImage);
  } catch {
    return { message: "حذف محتوا انجام نشد. دوباره تلاش کنید." };
  }

  revalidateContentPaths(existing.slug);
  return { message: "محتوا حذف شد.", success: true };
}
