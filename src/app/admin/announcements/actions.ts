"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-session";
import { getPrisma } from "@/lib/prisma";

export type AnnouncementActionState = {
  message?: string;
  success?: boolean;
};

type AnnouncementTranslationMap = Record<
  "EN" | "AR",
  { description: string; title: string } | null
>;

function getString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function parseAnnouncementTranslations(
  raw: string,
): AnnouncementTranslationMap | "invalid" {
  const emptyTranslations: AnnouncementTranslationMap = { AR: null, EN: null };
  if (!raw) return emptyTranslations;

  try {
    const value = JSON.parse(raw) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return "invalid";
    }

    return (["EN", "AR"] as const).reduce<AnnouncementTranslationMap>(
      (translations, locale) => {
        const entry = (value as Record<string, unknown>)[locale.toLowerCase()];
        if (entry === undefined || entry === null) return translations;
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
          throw new Error("Invalid translation");
        }

        const translation = entry as Record<string, unknown>;
        const title =
          typeof translation.title === "string" ? translation.title.trim() : "";
        const description =
          typeof translation.description === "string"
            ? translation.description.trim()
            : "";
        if (!title && !description) return translations;
        if (
          !title ||
          title.length > 200 ||
          !description ||
          description.length > 10_000
        ) {
          throw new Error("Invalid translation");
        }

        translations[locale] = { description, title };
        return translations;
      },
      emptyTranslations,
    );
  } catch {
    return "invalid";
  }
}

async function persistAnnouncementTranslations(
  announcementId: string,
  translations: AnnouncementTranslationMap,
) {
  const prisma = getPrisma();
  await Promise.all(
    (["EN", "AR"] as const).map(async (locale) => {
      const translation = translations[locale];
      if (!translation) {
        await prisma.announcementTranslation.deleteMany({
          where: { announcementId, locale },
        });
        return;
      }

      await prisma.announcementTranslation.upsert({
        where: { announcementId_locale: { announcementId, locale } },
        create: { announcementId, locale, ...translation },
        update: translation,
      });
    }),
  );
}

async function requireAdmin() {
  const session = await getAdminSession();
  return session?.role === "ADMIN" ? session : null;
}

function revalidateAnnouncementPaths() {
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function saveAnnouncement(_previousState: AnnouncementActionState, formData: FormData): Promise<AnnouncementActionState> {
  if (!(await requireAdmin())) {
    return { message: "دسترسی شما برای مدیریت اطلاعیه‌ها معتبر نیست." };
  }

  const id = getString(formData, "id");
  const title = getString(formData, "title");
  const description = getString(formData, "description");
  const translations = parseAnnouncementTranslations(
    getString(formData, "translationsJson"),
  );
  const isActive = formData.get("status") === "active";

  if (!title || title.length > 200 || !description || description.length > 10_000 || translations === "invalid" || (id && !isValidUuid(id))) {
    return { message: "عنوان و توضیحات اطلاعیه را بررسی کنید." };
  }

  const prisma = getPrisma();
  try {
    if (id) {
      await prisma.announcement.update({ data: { description, isActive, publishedAt: isActive ? new Date() : undefined, title }, where: { id } });
      await persistAnnouncementTranslations(id, translations);
    } else {
      const announcement = await prisma.announcement.create({
        data: { description, isActive, publishedAt: new Date(), title },
        select: { id: true },
      });
      await persistAnnouncementTranslations(announcement.id, translations);
    }
  } catch {
    return { message: "ذخیره اطلاعیه انجام نشد. دوباره تلاش کنید." };
  }

  revalidateAnnouncementPaths();
  return { message: isActive ? "اطلاعیه منتشر شد." : "اطلاعیه غیرفعال ذخیره شد.", success: true };
}

export async function toggleAnnouncementStatus(id: string, isActive: boolean): Promise<AnnouncementActionState> {
  if (!(await requireAdmin()) || !isValidUuid(id)) {
    return { message: "درخواست تغییر وضعیت معتبر نیست." };
  }

  try {
    await getPrisma().announcement.update({ data: { isActive: !isActive, publishedAt: !isActive ? new Date() : undefined }, where: { id } });
  } catch {
    return { message: "تغییر وضعیت اطلاعیه انجام نشد." };
  }

  revalidateAnnouncementPaths();
  return { message: isActive ? "اطلاعیه از صفحه نخست برداشته شد." : "اطلاعیه منتشر شد.", success: true };
}

export async function deleteAnnouncement(id: string): Promise<AnnouncementActionState> {
  if (!(await requireAdmin()) || !isValidUuid(id)) {
    return { message: "درخواست حذف معتبر نیست." };
  }

  try {
    await getPrisma().announcement.delete({ where: { id } });
  } catch {
    return { message: "حذف اطلاعیه انجام نشد." };
  }

  revalidateAnnouncementPaths();
  return { message: "اطلاعیه حذف شد.", success: true };
}
