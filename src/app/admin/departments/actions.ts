"use server";

import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-session";
import { isValidAdminImageUpload, saveAdminImageAsWebp } from "@/lib/admin-image-uploads";
import { getPrisma } from "@/lib/prisma";

export type LabDepartmentActionState = {
  message?: string;
  success?: boolean;
};

const MAX_DEPARTMENT_IMAGE_SIZE = 6 * 1024 * 1024;
const departmentImageDirectory = join(process.cwd(), "public", "uploads", "lab-departments");

type SavedDepartmentImage = {
  filePath: string;
  imageUrl: string;
};

function getString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function getSortOrder(formData: FormData) {
  const value = Number.parseInt(getString(formData, "sortOrder"), 10);
  return Number.isFinite(value) ? Math.min(Math.max(value, 0), 10_000) : 0;
}

function isValidUuid(value: string) {
  return /^[0-9a-f-]{36}$/i.test(value);
}

function isValidTranslation(title: string, description: string) {
  return title.length <= 100 && description.length <= 1_500 && Boolean(title) === Boolean(description);
}

function isValidDepartment(title: string, description: string, titleAr: string, descriptionAr: string, titleEn: string, descriptionEn: string) {
  return title.length > 0 && title.length <= 100 && description.length > 0 && description.length <= 1_500 && isValidTranslation(titleAr, descriptionAr) && isValidTranslation(titleEn, descriptionEn);
}

async function saveDepartmentImage(file: FormDataEntryValue | null): Promise<{ error?: string; savedImage?: SavedDepartmentImage }> {
  if (!file || typeof file === "string" || file.size === 0) {
    return {};
  }

  if (!isValidAdminImageUpload(file, MAX_DEPARTMENT_IMAGE_SIZE)) {
    return { error: "تصویر خدمت باید PNG، JPG یا WebP و حداکثر ۶ مگابایت باشد." };
  }

  return {
    savedImage: await saveAdminImageAsWebp(file, {
      directory: departmentImageDirectory,
      maxHeight: 1200,
      maxInputBytes: MAX_DEPARTMENT_IMAGE_SIZE,
      maxWidth: 1200,
      urlPrefix: "/uploads/lab-departments",
    }),
  };
}

async function removeStoredDepartmentImage(imageUrl: string | null) {
  const fileName = imageUrl?.match(/^\/uploads\/lab-departments\/([0-9a-f-]{36}\.(?:jpg|png|webp))$/i)?.[1];
  if (!fileName) return;

  await unlink(join(departmentImageDirectory, fileName)).catch(() => undefined);
}

async function isAuthorizedAdmin() {
  const session = await getAdminSession();
  return session?.role === "ADMIN";
}

function revalidateDepartments() {
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function createLabDepartment(_previousState: LabDepartmentActionState, formData: FormData): Promise<LabDepartmentActionState> {
  if (!(await isAuthorizedAdmin())) {
    return { message: "دسترسی شما برای ثبت خدمت معتبر نیست." };
  }

  const title = getString(formData, "title");
  const description = getString(formData, "description");
  const titleAr = getString(formData, "titleAr");
  const descriptionAr = getString(formData, "descriptionAr");
  const titleEn = getString(formData, "titleEn");
  const descriptionEn = getString(formData, "descriptionEn");
  if (!isValidDepartment(title, description, titleAr, descriptionAr, titleEn, descriptionEn)) {
    return { message: "عنوان و توضیح خدمت را در هر زبان کامل و بررسی کنید." };
  }

  let savedImage: SavedDepartmentImage | undefined;
  try {
    const upload = await saveDepartmentImage(formData.get("departmentImage"));
    if (upload.error) return { message: upload.error };
    savedImage = upload.savedImage;
  } catch {
    return { message: "آپلود تصویر خدمت انجام نشد. دوباره تلاش کنید." };
  }

  try {
    await getPrisma().labDepartment.create({
      data: {
        description,
        descriptionAr: descriptionAr || null,
        descriptionEn: descriptionEn || null,
        imageUrl: savedImage?.imageUrl ?? null,
        isActive: formData.get("isActive") === "on",
        sortOrder: getSortOrder(formData),
        title,
        titleAr: titleAr || null,
        titleEn: titleEn || null,
      },
    });
  } catch (error) {
    if (savedImage) await unlink(savedImage.filePath).catch(() => undefined);
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      return { message: "خدمتی با این عنوان قبلاً ثبت شده است." };
    }
    return { message: "خدمت ثبت نشد. دوباره تلاش کنید." };
  }

  revalidateDepartments();
  return { message: "خدمت با موفقیت ثبت شد.", success: true };
}

export async function updateLabDepartment(_previousState: LabDepartmentActionState, formData: FormData): Promise<LabDepartmentActionState> {
  const id = getString(formData, "id");
  if (!(await isAuthorizedAdmin()) || !isValidUuid(id)) {
    return { message: "درخواست ویرایش خدمت معتبر نیست." };
  }

  const title = getString(formData, "title");
  const description = getString(formData, "description");
  const titleAr = getString(formData, "titleAr");
  const descriptionAr = getString(formData, "descriptionAr");
  const titleEn = getString(formData, "titleEn");
  const descriptionEn = getString(formData, "descriptionEn");
  if (!isValidDepartment(title, description, titleAr, descriptionAr, titleEn, descriptionEn)) {
    return { message: "عنوان و توضیح خدمت را در هر زبان کامل و بررسی کنید." };
  }

  const prisma = getPrisma();
  let currentDepartment: { imageUrl: string | null } | null;
  try {
    currentDepartment = await prisma.labDepartment.findUnique({
      select: { imageUrl: true },
      where: { id },
    });
  } catch {
    return { message: "اطلاعات خدمت دریافت نشد. دوباره تلاش کنید." };
  }

  if (!currentDepartment) {
    return { message: "خدمت موردنظر پیدا نشد." };
  }

  let savedImage: SavedDepartmentImage | undefined;
  try {
    const upload = await saveDepartmentImage(formData.get("departmentImage"));
    if (upload.error) return { message: upload.error };
    savedImage = upload.savedImage;
  } catch {
    return { message: "آپلود تصویر جدید انجام نشد. دوباره تلاش کنید." };
  }

  const removeImage = formData.get("removeImage") === "on";
  const nextImageUrl = savedImage?.imageUrl ?? (removeImage ? null : undefined);

  try {
    await prisma.labDepartment.update({
      data: {
        ...(nextImageUrl !== undefined ? { imageUrl: nextImageUrl } : {}),
        description,
        descriptionAr: descriptionAr || null,
        descriptionEn: descriptionEn || null,
        isActive: formData.get("isActive") === "on",
        sortOrder: getSortOrder(formData),
        title,
        titleAr: titleAr || null,
        titleEn: titleEn || null,
      },
      where: { id },
    });
  } catch (error) {
    if (savedImage) await unlink(savedImage.filePath).catch(() => undefined);
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      return { message: "بخشی با این عنوان قبلاً ثبت شده است." };
    }
    return { message: "تغییرات خدمت ذخیره نشد. دوباره تلاش کنید." };
  }

  if (nextImageUrl !== undefined && currentDepartment.imageUrl !== nextImageUrl) {
    await removeStoredDepartmentImage(currentDepartment.imageUrl);
  }

  revalidateDepartments();
  return { message: "تغییرات خدمت با موفقیت ذخیره شد.", success: true };
}

export async function toggleLabDepartmentStatus(id: string, isActive: boolean): Promise<LabDepartmentActionState> {
  if (!(await isAuthorizedAdmin()) || !isValidUuid(id)) {
    return { message: "درخواست تغییر وضعیت خدمت معتبر نیست." };
  }

  try {
    await getPrisma().labDepartment.update({
      data: { isActive: !isActive },
      where: { id },
    });
  } catch {
    return { message: "وضعیت نمایش خدمت تغییر نکرد. دوباره تلاش کنید." };
  }

  revalidateDepartments();
  return { message: isActive ? "نمایش خدمت در صفحه نخست متوقف شد." : "خدمت در صفحه نخست فعال شد.", success: true };
}
