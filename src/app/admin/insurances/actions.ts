"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-session";
import { getPrisma } from "@/lib/prisma";

export type InsuranceActionState = {
  message?: string;
  success?: boolean;
};

function getString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

const MAX_LOGO_SIZE = 2 * 1024 * 1024;
const logoFileTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type SavedLogo = {
  filePath: string;
  logoUrl: string;
};

function hasValidImageSignature(bytes: Uint8Array, type: keyof typeof logoFileTypes) {
  if (type === "image/png") {
    return bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
  }

  if (type === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  return bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
}

async function saveLogo(file: FormDataEntryValue | null): Promise<{ error?: string; savedLogo?: SavedLogo }> {
  if (!file || typeof file === "string" || file.size === 0) {
    return {};
  }

  if (!(file.type in logoFileTypes) || file.size > MAX_LOGO_SIZE) {
    return { error: "لوگو باید PNG، JPG یا WebP و حداکثر ۲ مگابایت باشد." };
  }

  const imageType = file.type as keyof typeof logoFileTypes;
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasValidImageSignature(bytes, imageType)) {
    return { error: "فایل انتخاب‌شده یک تصویر معتبر نیست." };
  }

  const fileName = `${randomUUID()}.${logoFileTypes[imageType]}`;
  const storageDirectory = join(process.cwd(), "public", "uploads", "insurance-logos");
  const filePath = join(storageDirectory, fileName);
  await mkdir(storageDirectory, { recursive: true });
  await writeFile(filePath, bytes, { flag: "wx" });

  return { savedLogo: { filePath, logoUrl: `/uploads/insurance-logos/${fileName}` } };
}

async function removeStoredLogo(logoUrl: string | null) {
  const fileName = logoUrl?.match(/^\/uploads\/insurance-logos\/([0-9a-f-]{36}\.(?:jpg|png|webp))$/i)?.[1];
  if (!fileName) return;

  const filePath = join(process.cwd(), "public", "uploads", "insurance-logos", fileName);
  await unlink(filePath).catch(() => undefined);
}

async function isAuthorizedAdmin() {
  const session = await getAdminSession();
  return session?.role === "ADMIN";
}

export async function createInsurance(_previousState: InsuranceActionState, formData: FormData): Promise<InsuranceActionState> {
  if (!(await isAuthorizedAdmin())) {
    return { message: "دسترسی شما برای ثبت بیمه معتبر نیست." };
  }

  const name = getString(formData, "name");
  const slug = slugify(getString(formData, "slug") || name);
  const submittedOrder = Number.parseInt(getString(formData, "sortOrder"), 10);
  const sortOrder = Number.isFinite(submittedOrder) ? Math.min(Math.max(submittedOrder, 0), 10_000) : 0;

  if (!name || name.length > 100 || !slug) {
    return { message: "نام و نامک بیمه را بررسی کنید." };
  }

  let savedLogo: SavedLogo | undefined;
  try {
    const upload = await saveLogo(formData.get("logoFile"));
    if (upload.error) return { message: upload.error };
    savedLogo = upload.savedLogo;
  } catch {
    return { message: "آپلود لوگو انجام نشد. دوباره تلاش کنید." };
  }

  try {
    await getPrisma().insurance.create({
      data: {
        isActive: formData.get("isActive") === "on",
        logoUrl: savedLogo?.logoUrl ?? null,
        name,
        slug,
        sortOrder,
      },
    });
  } catch (error) {
    if (savedLogo) {
      await unlink(savedLogo.filePath).catch(() => undefined);
    }
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      return { message: "این نام یا نامک قبلاً ثبت شده است." };
    }
    return { message: "بیمه ثبت نشد. دوباره تلاش کنید." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { message: "بیمه با موفقیت ثبت شد.", success: true };
}

export async function updateInsurance(_previousState: InsuranceActionState, formData: FormData): Promise<InsuranceActionState> {
  const id = getString(formData, "id");
  if (!(await isAuthorizedAdmin()) || !/^[0-9a-f-]{36}$/i.test(id)) {
    return { message: "درخواست ویرایش بیمه معتبر نیست." };
  }

  const name = getString(formData, "name");
  const slug = slugify(name);
  if (!name || name.length > 100 || !slug) {
    return { message: "نام بیمه را بررسی کنید." };
  }

  let currentInsurance: { logoUrl: string | null } | null;
  try {
    currentInsurance = await getPrisma().insurance.findUnique({
      select: { logoUrl: true },
      where: { id },
    });
  } catch {
    return { message: "اطلاعات بیمه دریافت نشد. دوباره تلاش کنید." };
  }

  if (!currentInsurance) {
    return { message: "بیمه موردنظر پیدا نشد." };
  }

  let savedLogo: SavedLogo | undefined;
  try {
    const upload = await saveLogo(formData.get("logoFile"));
    if (upload.error) return { message: upload.error };
    savedLogo = upload.savedLogo;
  } catch {
    return { message: "آپلود لوگوی جدید انجام نشد. دوباره تلاش کنید." };
  }

  const removeLogo = formData.get("removeLogo") === "on";
  const nextLogoUrl = savedLogo?.logoUrl ?? (removeLogo ? null : undefined);

  try {
    await getPrisma().insurance.update({
      data: {
        ...(nextLogoUrl !== undefined ? { logoUrl: nextLogoUrl } : {}),
        isActive: formData.get("isActive") === "on",
        name,
        slug,
      },
      where: { id },
    });
  } catch (error) {
    if (savedLogo) {
      await unlink(savedLogo.filePath).catch(() => undefined);
    }
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      return { message: "این نام یا نامک قبلاً ثبت شده است." };
    }
    return { message: "تغییرات بیمه ذخیره نشد. دوباره تلاش کنید." };
  }

  if (nextLogoUrl !== undefined && currentInsurance.logoUrl !== nextLogoUrl) {
    await removeStoredLogo(currentInsurance.logoUrl);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { message: "تغییرات بیمه با موفقیت ذخیره شد.", success: true };
}

export async function toggleInsuranceStatus(id: string, isActive: boolean): Promise<InsuranceActionState> {
  if (!(await isAuthorizedAdmin()) || !/^[0-9a-f-]{36}$/i.test(id)) {
    return { message: "درخواست تغییر وضعیت معتبر نیست." };
  }

  try {
    await getPrisma().insurance.update({
      data: { isActive: !isActive },
      where: { id },
    });
  } catch {
    return { message: "وضعیت بیمه تغییر نکرد. دوباره تلاش کنید." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { message: isActive ? "نمایش بیمه در صفحه نخست متوقف شد." : "بیمه در صفحه نخست فعال شد.", success: true };
}

export async function reorderInsurances(ids: string[]): Promise<InsuranceActionState> {
  const uniqueIds = [...new Set(ids)];
  if (!(await isAuthorizedAdmin()) || uniqueIds.length !== ids.length || ids.length > 200 || !ids.every((id) => /^[0-9a-f-]{36}$/i.test(id))) {
    return { message: "ترتیب ارسال‌شده معتبر نیست." };
  }

  try {
    await getPrisma().$transaction(
      ids.map((id, index) =>
        getPrisma().insurance.update({
          data: { sortOrder: (index + 1) * 10 },
          where: { id },
        }),
      ),
    );
  } catch {
    return { message: "ترتیب بیمه‌ها ذخیره نشد. دوباره تلاش کنید." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { message: "اولویت نمایش بیمه‌ها ذخیره شد.", success: true };
}
