"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-session";
import { getPrisma } from "@/lib/prisma";

export type AnnouncementActionState = {
  message?: string;
  success?: boolean;
};

function getString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
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
  const isActive = formData.get("status") === "active";

  if (!title || title.length > 200 || !description || description.length > 10_000 || (id && !isValidUuid(id))) {
    return { message: "عنوان و توضیحات اطلاعیه را بررسی کنید." };
  }

  const prisma = getPrisma();
  try {
    if (id) {
      await prisma.announcement.update({ data: { description, isActive, publishedAt: isActive ? new Date() : undefined, title }, where: { id } });
    } else {
      await prisma.announcement.create({ data: { description, isActive, publishedAt: new Date(), title } });
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
