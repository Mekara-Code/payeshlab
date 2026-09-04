"use server";

import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import {
  MAX_GALLERY_IMAGE_BYTES,
  galleryUploadPaths,
  isValidGalleryVideoUpload,
  saveGalleryVideo,
} from "@/lib/admin-gallery-uploads";
import { isValidAdminImageUpload, saveAdminImageAsWebp } from "@/lib/admin-image-uploads";
import { getAdminSession } from "@/lib/admin-session";
import { getPrisma } from "@/lib/prisma";

export type GalleryActionState = {
  message?: string;
  success?: boolean;
};

type GalleryMediaType = "IMAGE" | "VIDEO";
type SavedAsset = {
  filePath: string;
  url: string;
};

function getString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function getMediaType(formData: FormData): GalleryMediaType | null {
  const type = getString(formData, "type");
  return type === "IMAGE" || type === "VIDEO" ? type : null;
}

function getSortOrder(formData: FormData) {
  const value = getString(formData, "sortOrder");
  if (!value) return null;
  if (!/^\d{1,7}$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

function isValidMediaId(id: string) {
  return /^[0-9a-f-]{36}$/i.test(id);
}

async function isAuthorizedAdmin() {
  const session = await getAdminSession();
  return session?.role === "ADMIN";
}

function validateDetails(formData: FormData) {
  const altText = getString(formData, "altText");
  const description = getString(formData, "description") || null;
  const title = getString(formData, "title");
  const sortOrder = getSortOrder(formData);

  if (!title || title.length > 160 || !altText || altText.length > 240 || (description && description.length > 1200)) {
    return { error: "عنوان، متن جایگزین و توضیحات را با طول مجاز تکمیل کنید." };
  }
  if (sortOrder === undefined) {
    return { error: "اولویت نمایش باید عددی بین ۰ تا ۹٬۹۹۹٬۹۹۹ باشد." };
  }

  return { altText, description, sortOrder, title };
}

async function saveImage(file: FormDataEntryValue, kind: "image" | "poster"): Promise<SavedAsset> {
  if (!isValidAdminImageUpload(file, MAX_GALLERY_IMAGE_BYTES) || typeof file === "string") {
    throw new Error("Invalid image upload");
  }

  const target = kind === "image"
    ? { directory: galleryUploadPaths.imagesDirectory, urlPrefix: galleryUploadPaths.imagesUrlPrefix }
    : { directory: galleryUploadPaths.postersDirectory, urlPrefix: galleryUploadPaths.postersUrlPrefix };
  const savedImage = await saveAdminImageAsWebp(file, {
    ...target,
    maxHeight: kind === "image" ? 2560 : 1440,
    maxInputBytes: MAX_GALLERY_IMAGE_BYTES,
    maxWidth: kind === "image" ? 2560 : 2560,
    quality: kind === "image" ? 82 : 80,
  });

  return { filePath: savedImage.filePath, url: savedImage.imageUrl };
}

async function saveMedia(file: FormDataEntryValue, type: GalleryMediaType): Promise<SavedAsset> {
  if (type === "IMAGE") return saveImage(file, "image");
  if (!isValidGalleryVideoUpload(file)) throw new Error("Invalid video upload");
  const savedVideo = await saveGalleryVideo(file);
  return { filePath: savedVideo.filePath, url: savedVideo.videoUrl };
}

async function saveOptionalPoster(file: FormDataEntryValue | null) {
  if (!file || typeof file === "string" || file.size === 0) return undefined;
  return saveImage(file, "poster");
}

async function removeGalleryAsset(url: string | null) {
  if (!url) return;

  const directories = [
    { directory: galleryUploadPaths.imagesDirectory, prefix: `${galleryUploadPaths.imagesUrlPrefix}/`, pattern: /^[0-9a-f-]{36}\.webp$/i },
    { directory: galleryUploadPaths.postersDirectory, prefix: `${galleryUploadPaths.postersUrlPrefix}/`, pattern: /^[0-9a-f-]{36}\.webp$/i },
    { directory: galleryUploadPaths.videosDirectory, prefix: `${galleryUploadPaths.videosUrlPrefix}/`, pattern: /^[0-9a-f-]{36}\.(?:mp4|webm)$/i },
  ];
  const target = directories.find((item) => url.startsWith(item.prefix));
  if (!target) return;

  const fileName = url.slice(target.prefix.length);
  if (!target.pattern.test(fileName)) return;
  await unlink(join(target.directory, fileName)).catch(() => undefined);
}

function revalidateGallery() {
  revalidatePath("/gallery");
  revalidatePath("/admin");
  revalidatePath("/sitemap.xml");
}

export async function createGalleryMedia(_previousState: GalleryActionState, formData: FormData): Promise<GalleryActionState> {
  if (!(await isAuthorizedAdmin())) {
    return { message: "دسترسی شما برای ثبت رسانه معتبر نیست." };
  }

  const type = getMediaType(formData);
  const details = validateDetails(formData);
  const mediaFile = formData.get("mediaFile");
  if (!type || "error" in details || !mediaFile || typeof mediaFile === "string" || mediaFile.size === 0) {
    return { message: "error" in details ? details.error : "نوع رسانه و فایل اصلی را انتخاب کنید." };
  }

  let savedMedia: SavedAsset | undefined;
  let savedPoster: SavedAsset | undefined;
  try {
    savedMedia = await saveMedia(mediaFile, type);
    if (type === "VIDEO") savedPoster = await saveOptionalPoster(formData.get("posterFile"));
  } catch {
    await Promise.all([removeGalleryAsset(savedMedia?.url ?? null), removeGalleryAsset(savedPoster?.url ?? null)]);
    return {
      message: type === "IMAGE"
        ? "تصویر باید JPG، PNG یا WebP و حداکثر ۱۰ مگابایت باشد."
        : "ویدئو باید MP4 یا WebM معتبر و حداکثر ۶۴ مگابایت باشد.",
    };
  }
  if (!savedMedia) return { message: "فایل اصلی رسانه ثبت نشد. دوباره تلاش کنید." };

  try {
    const lastMedia = await getPrisma().galleryMedia.aggregate({ _max: { sortOrder: true } });
    await getPrisma().galleryMedia.create({
      data: {
        altText: details.altText,
        description: details.description,
        isActive: formData.get("isActive") === "on",
        mediaUrl: savedMedia.url,
        posterUrl: savedPoster?.url ?? null,
        sortOrder: details.sortOrder ?? (lastMedia._max.sortOrder ?? 0) + 10,
        title: details.title,
        type,
      },
    });
  } catch {
    await Promise.all([removeGalleryAsset(savedMedia.url), removeGalleryAsset(savedPoster?.url ?? null)]);
    return { message: "رسانه ثبت نشد. دوباره تلاش کنید." };
  }

  revalidateGallery();
  return { message: "رسانه با موفقیت به گالری اضافه شد.", success: true };
}

export async function updateGalleryMedia(id: string, formData: FormData): Promise<GalleryActionState> {
  if (!(await isAuthorizedAdmin()) || !isValidMediaId(id)) {
    return { message: "درخواست ویرایش رسانه معتبر نیست." };
  }

  const type = getMediaType(formData);
  const details = validateDetails(formData);
  if (!type || "error" in details) return { message: "error" in details ? details.error : "نوع رسانه را مشخص کنید." };

  const prisma = getPrisma();
  const current = await prisma.galleryMedia.findUnique({ where: { id } }).catch(() => null);
  if (!current) return { message: "این رسانه پیدا نشد یا قبلاً حذف شده است." };

  const uploadedMedia = formData.get("mediaFile");
  const hasNewMedia = Boolean(uploadedMedia && typeof uploadedMedia !== "string" && uploadedMedia.size > 0);
  const removePoster = formData.get("removePoster") === "on";
  if (current.type !== type && !hasNewMedia) {
    return { message: "برای تغییر نوع رسانه، فایل جدید مربوط به نوع انتخاب‌شده را بارگذاری کنید." };
  }

  let savedMedia: SavedAsset | undefined;
  let savedPoster: SavedAsset | undefined;
  try {
    if (hasNewMedia && uploadedMedia && typeof uploadedMedia !== "string") {
      savedMedia = await saveMedia(uploadedMedia, type);
    }
    if (type === "VIDEO") savedPoster = await saveOptionalPoster(formData.get("posterFile"));
  } catch {
    await Promise.all([removeGalleryAsset(savedMedia?.url ?? null), removeGalleryAsset(savedPoster?.url ?? null)]);
    return {
      message: type === "IMAGE"
        ? "تصویر باید JPG، PNG یا WebP و حداکثر ۱۰ مگابایت باشد."
        : "ویدئو باید MP4 یا WebM معتبر و حداکثر ۶۴ مگابایت باشد.",
    };
  }

  try {
    await prisma.galleryMedia.update({
      data: {
        altText: details.altText,
        description: details.description,
        isActive: formData.get("isActive") === "on",
        mediaUrl: savedMedia?.url ?? current.mediaUrl,
        posterUrl: type === "VIDEO" ? savedPoster?.url ?? (removePoster ? null : current.posterUrl) : null,
        sortOrder: details.sortOrder ?? current.sortOrder,
        title: details.title,
        type,
      },
      where: { id },
    });
  } catch {
    await Promise.all([removeGalleryAsset(savedMedia?.url ?? null), removeGalleryAsset(savedPoster?.url ?? null)]);
    return { message: "ویرایش رسانه انجام نشد. دوباره تلاش کنید." };
  }

  if (savedMedia) await removeGalleryAsset(current.mediaUrl);
  if (type !== "VIDEO" || savedPoster || removePoster) await removeGalleryAsset(current.posterUrl);
  revalidateGallery();
  return { message: "رسانه با موفقیت ویرایش شد.", success: true };
}

export async function deleteGalleryMedia(id: string): Promise<GalleryActionState> {
  if (!(await isAuthorizedAdmin()) || !isValidMediaId(id)) {
    return { message: "درخواست حذف رسانه معتبر نیست." };
  }

  const prisma = getPrisma();
  const media = await prisma.galleryMedia.findUnique({ where: { id } }).catch(() => null);
  if (!media) return { message: "این رسانه پیدا نشد یا قبلاً حذف شده است." };

  try {
    await prisma.galleryMedia.delete({ where: { id } });
  } catch {
    return { message: "حذف رسانه انجام نشد. دوباره تلاش کنید." };
  }

  await Promise.all([removeGalleryAsset(media.mediaUrl), removeGalleryAsset(media.posterUrl)]);
  revalidateGallery();
  return { message: "رسانه از گالری حذف شد.", success: true };
}

export async function toggleGalleryMedia(id: string, isActive: boolean): Promise<GalleryActionState> {
  if (!(await isAuthorizedAdmin()) || !isValidMediaId(id)) {
    return { message: "درخواست تغییر وضعیت رسانه معتبر نیست." };
  }

  try {
    await getPrisma().galleryMedia.update({ data: { isActive: !isActive }, where: { id } });
  } catch {
    return { message: "وضعیت رسانه تغییر نکرد. دوباره تلاش کنید." };
  }

  revalidateGallery();
  return {
    message: isActive ? "نمایش رسانه در گالری متوقف شد." : "رسانه در گالری فعال شد.",
    success: true,
  };
}
