"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-session";
import { getPrisma } from "@/lib/prisma";

export type LaboratoryTestActionState = {
  message?: string;
  success?: boolean;
};

const textFieldNames = [
  "clinicalSignificance",
  "description",
  "limitations",
  "resultInterpretation",
  "samplingInformation",
] as const;

function getString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isValidUuid(value: string) {
  return /^[0-9a-f-]{36}$/i.test(value);
}

function toNullableText(value: string) {
  return value || null;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/["']/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getSortOrder(formData: FormData) {
  const value = Number.parseInt(getString(formData, "sortOrder"), 10);
  return Number.isFinite(value) ? Math.min(Math.max(value, 0), 100_000) : 0;
}

function getTestFields(formData: FormData) {
  const name = getString(formData, "name");
  const slug = slugify(getString(formData, "slug") || name);
  const textFields = Object.fromEntries(
    textFieldNames.map((field) => [field, toNullableText(getString(formData, field))]),
  ) as Record<(typeof textFieldNames)[number], string | null>;

  if (!name || name.length > 160 || !slug || slug.length > 180) return null;
  if (textFieldNames.some((field) => (textFields[field]?.length ?? 0) > 12_000)) {
    return null;
  }

  return {
    ...textFields,
    isActive: formData.get("isActive") === "on",
    name,
    slug,
    sortOrder: getSortOrder(formData),
  };
}

async function requireAdmin() {
  const session = await getAdminSession();
  return session?.role === "ADMIN" ? session : null;
}

function revalidateLaboratoryTestPaths(...slugs: Array<string | null | undefined>) {
  revalidatePath("/admin");
  revalidatePath("/tests");
  revalidatePath("/sitemap.xml");
  slugs.forEach((slug) => {
    if (slug) revalidatePath(`/tests/${slug}`);
  });
}

export async function saveLaboratoryTest(
  _previousState: LaboratoryTestActionState,
  formData: FormData,
): Promise<LaboratoryTestActionState> {
  if (!(await requireAdmin())) {
    return { message: "دسترسی شما برای مدیریت آزمایش‌ها معتبر نیست." };
  }

  const id = getString(formData, "id");
  const fields = getTestFields(formData);
  if (!fields || (id && !isValidUuid(id))) {
    return { message: "نام، نامک و اطلاعات آزمایش را بررسی کنید." };
  }

  const prisma = getPrisma();
  let previousSlug: string | null = null;

  try {
    if (id) {
      const existing = await prisma.laboratoryTest.findUnique({
        select: { slug: true },
        where: { id },
      });
      if (!existing) return { message: "آزمایش موردنظر برای ویرایش پیدا نشد." };
      previousSlug = existing.slug;
      await prisma.laboratoryTest.update({ data: fields, where: { id } });
    } else {
      await prisma.laboratoryTest.create({ data: fields });
    }
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { message: "این نامک قبلاً برای آزمایش دیگری ثبت شده است." };
    }
    return { message: "ذخیرهٔ آزمایش انجام نشد. دوباره تلاش کنید." };
  }

  revalidateLaboratoryTestPaths(fields.slug, previousSlug);
  return {
    message: id ? "تغییرات آزمایش ذخیره شد." : "آزمایش جدید ثبت شد.",
    success: true,
  };
}

export async function toggleLaboratoryTestStatus(
  id: string,
  isActive: boolean,
): Promise<LaboratoryTestActionState> {
  if (!(await requireAdmin()) || !isValidUuid(id)) {
    return { message: "درخواست تغییر وضعیت آزمایش معتبر نیست." };
  }

  const prisma = getPrisma();
  const existing = await prisma.laboratoryTest.findUnique({
    select: { slug: true },
    where: { id },
  });
  if (!existing) return { message: "آزمایش موردنظر پیدا نشد." };

  try {
    await prisma.laboratoryTest.update({
      data: { isActive: !isActive },
      where: { id },
    });
  } catch {
    return { message: "تغییر وضعیت آزمایش انجام نشد. دوباره تلاش کنید." };
  }

  revalidateLaboratoryTestPaths(existing.slug);
  return {
    message: isActive ? "نمایش عمومی آزمایش متوقف شد." : "آزمایش برای نمایش عمومی فعال شد.",
    success: true,
  };
}

export async function deleteLaboratoryTest(
  id: string,
): Promise<LaboratoryTestActionState> {
  if (!(await requireAdmin()) || !isValidUuid(id)) {
    return { message: "درخواست حذف آزمایش معتبر نیست." };
  }

  const prisma = getPrisma();
  const existing = await prisma.laboratoryTest.findUnique({
    select: { slug: true },
    where: { id },
  });
  if (!existing) return { message: "آزمایش موردنظر پیدا نشد." };

  try {
    await prisma.laboratoryTest.delete({ where: { id } });
  } catch {
    return { message: "حذف آزمایش انجام نشد. دوباره تلاش کنید." };
  }

  revalidateLaboratoryTestPaths(existing.slug);
  return { message: "آزمایش حذف شد.", success: true };
}
