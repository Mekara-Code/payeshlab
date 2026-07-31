"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-session";
import { getPrisma } from "@/lib/prisma";

export type SlideshowActionState = {
  message?: string;
  success?: boolean;
};

const MAX_SLIDE_IMAGE_SIZE = 6 * 1024 * 1024;
const imageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type SavedSlideImage = {
  filePath: string;
  imageUrl: string;
};

function getString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function hasValidImageSignature(bytes: Uint8Array, type: keyof typeof imageTypes) {
  if (type === "image/png") {
    return bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
  }

  if (type === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  return bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
}

async function saveSlideImage(file: FormDataEntryValue | null): Promise<{ error?: string; savedImage?: SavedSlideImage }> {
  if (!file || typeof file === "string" || file.size === 0) {
    return { error: "تصویر اسلاید را انتخاب کنید." };
  }

  if (!(file.type in imageTypes) || file.size > MAX_SLIDE_IMAGE_SIZE) {
    return { error: "تصویر باید PNG، JPG یا WebP و حداکثر ۶ مگابایت باشد." };
  }

  const imageType = file.type as keyof typeof imageTypes;
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasValidImageSignature(bytes, imageType)) {
    return { error: "فایل انتخاب‌شده یک تصویر معتبر نیست." };
  }

  const fileName = `${randomUUID()}.${imageTypes[imageType]}`;
  const storageDirectory = join(process.cwd(), "public", "uploads", "slideshow");
  const filePath = join(storageDirectory, fileName);
  await mkdir(storageDirectory, { recursive: true });
  await writeFile(filePath, bytes, { flag: "wx" });

  return { savedImage: { filePath, imageUrl: `/uploads/slideshow/${fileName}` } };
}

async function isAuthorizedAdmin() {
  const session = await getAdminSession();
  return session?.role === "ADMIN";
}

function isValidSlideId(id: string) {
  return /^[0-9a-f-]{36}$/i.test(id);
}

async function removeSlideImage(imageUrl: string) {
  const imagePrefix = "/uploads/slideshow/";
  if (!imageUrl.startsWith(imagePrefix)) return;

  const fileName = imageUrl.slice(imagePrefix.length);
  if (!/^[0-9a-f-]{36}\.(?:jpg|png|webp)$/i.test(fileName)) return;

  await unlink(join(process.cwd(), "public", "uploads", "slideshow", fileName)).catch(() => undefined);
}

export async function createSlideshowSlide(_previousState: SlideshowActionState, formData: FormData): Promise<SlideshowActionState> {
  if (!(await isAuthorizedAdmin())) {
    return { message: "دسترسی شما برای ثبت اسلاید معتبر نیست." };
  }

  const altText = getString(formData, "altText");
  const title = getString(formData, "title") || null;
  const subtitle = getString(formData, "subtitle") || null;
  if (!altText || altText.length > 160 || (title && title.length > 120) || (subtitle && subtitle.length > 240)) {
    return { message: "عنوان، توضیح و متن جایگزین اسلاید را بررسی کنید." };
  }

  let savedImage: SavedSlideImage;
  try {
    const upload = await saveSlideImage(formData.get("slideImage"));
    if (upload.error || !upload.savedImage) return { message: upload.error ?? "تصویر اسلاید معتبر نیست." };
    savedImage = upload.savedImage;
  } catch {
    return { message: "آپلود تصویر اسلاید انجام نشد. دوباره تلاش کنید." };
  }

  try {
    const prisma = getPrisma();
    const lastSlide = await prisma.slideshowSlide.aggregate({ _max: { sortOrder: true } });
    await prisma.slideshowSlide.create({
      data: {
        altText,
        imageUrl: savedImage.imageUrl,
        isActive: formData.get("isActive") === "on",
        sortOrder: (lastSlide._max.sortOrder ?? 0) + 10,
        subtitle,
        title,
      },
    });
  } catch {
    await unlink(savedImage.filePath).catch(() => undefined);
    return { message: "اسلاید ثبت نشد. دوباره تلاش کنید." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { message: "اسلاید با موفقیت ثبت شد.", success: true };
}

export async function updateSlideshowSlide(id: string, formData: FormData): Promise<SlideshowActionState> {
  if (!(await isAuthorizedAdmin()) || !isValidSlideId(id)) {
    return { message: "درخواست ویرایش اسلاید معتبر نیست." };
  }

  const altText = getString(formData, "altText");
  const title = getString(formData, "title") || null;
  const subtitle = getString(formData, "subtitle") || null;
  if (!altText || altText.length > 160 || (title && title.length > 120) || (subtitle && subtitle.length > 240)) {
    return { message: "عنوان، توضیح و متن جایگزین اسلاید را بررسی کنید." };
  }

  const prisma = getPrisma();
  const currentSlide = await prisma.slideshowSlide.findUnique({ where: { id } }).catch(() => null);
  if (!currentSlide) return { message: "این اسلاید پیدا نشد یا قبلاً حذف شده است." };

  const imageFile = formData.get("slideImage");
  let savedImage: SavedSlideImage | undefined;
  if (imageFile && typeof imageFile !== "string" && imageFile.size > 0) {
    try {
      const upload = await saveSlideImage(imageFile);
      if (upload.error || !upload.savedImage) return { message: upload.error ?? "تصویر اسلاید معتبر نیست." };
      savedImage = upload.savedImage;
    } catch {
      return { message: "آپلود تصویر اسلاید انجام نشد. دوباره تلاش کنید." };
    }
  }

  try {
    await prisma.slideshowSlide.update({
      data: {
        altText,
        imageUrl: savedImage?.imageUrl ?? currentSlide.imageUrl,
        isActive: formData.get("isActive") === "on",
        subtitle,
        title,
      },
      where: { id },
    });
  } catch {
    if (savedImage) await unlink(savedImage.filePath).catch(() => undefined);
    return { message: "ویرایش اسلاید انجام نشد. دوباره تلاش کنید." };
  }

  if (savedImage) await removeSlideImage(currentSlide.imageUrl);
  revalidatePath("/");
  revalidatePath("/admin");
  return { message: "اسلاید با موفقیت ویرایش شد.", success: true };
}

export async function deleteSlideshowSlide(id: string): Promise<SlideshowActionState> {
  if (!(await isAuthorizedAdmin()) || !isValidSlideId(id)) {
    return { message: "درخواست حذف اسلاید معتبر نیست." };
  }

  const prisma = getPrisma();
  const slide = await prisma.slideshowSlide.findUnique({ where: { id } }).catch(() => null);
  if (!slide) return { message: "این اسلاید پیدا نشد یا قبلاً حذف شده است." };

  try {
    await prisma.slideshowSlide.delete({ where: { id } });
  } catch {
    return { message: "حذف اسلاید انجام نشد. دوباره تلاش کنید." };
  }

  await removeSlideImage(slide.imageUrl);
  revalidatePath("/");
  revalidatePath("/admin");
  return { message: "اسلاید حذف شد.", success: true };
}

export async function toggleSlideshowSlide(id: string, isActive: boolean): Promise<SlideshowActionState> {
  if (!(await isAuthorizedAdmin()) || !isValidSlideId(id)) {
    return { message: "درخواست تغییر وضعیت معتبر نیست." };
  }

  try {
    await getPrisma().slideshowSlide.update({
      data: { isActive: !isActive },
      where: { id },
    });
  } catch {
    return { message: "وضعیت اسلاید تغییر نکرد. دوباره تلاش کنید." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { message: isActive ? "نمایش اسلاید در صفحه نخست متوقف شد." : "اسلاید در صفحه نخست فعال شد.", success: true };
}
