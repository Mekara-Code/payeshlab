"use server";

import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-session";
import { isValidAdminImageUpload, saveAdminImageAsWebp } from "@/lib/admin-image-uploads";
import { getPrisma } from "@/lib/prisma";

export type SlideshowActionState = {
  message?: string;
  success?: boolean;
};

const MAX_SLIDE_IMAGE_SIZE = 6 * 1024 * 1024;
const slideshowImageDirectory = join(process.cwd(), "public", "uploads", "slideshow");

type SavedSlideImage = {
  filePath: string;
  imageUrl: string;
};

function getString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

async function saveSlideImage(file: FormDataEntryValue | null): Promise<{ error?: string; savedImage?: SavedSlideImage }> {
  if (!file || typeof file === "string" || file.size === 0) {
    return { error: "تصویر اسلاید را انتخاب کنید." };
  }

  if (!isValidAdminImageUpload(file, MAX_SLIDE_IMAGE_SIZE)) {
    return { error: "تصویر باید PNG، JPG یا WebP و حداکثر ۶ مگابایت باشد." };
  }

  return {
    savedImage: await saveAdminImageAsWebp(file, {
      directory: slideshowImageDirectory,
      maxHeight: 1920,
      maxInputBytes: MAX_SLIDE_IMAGE_SIZE,
      maxWidth: 1920,
      urlPrefix: "/uploads/slideshow",
    }),
  };
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
