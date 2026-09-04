import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const MAX_GALLERY_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_GALLERY_VIDEO_BYTES = 64 * 1024 * 1024;

const galleryVideoTypes = new Map([
  ["video/mp4", "mp4"],
  ["video/webm", "webm"],
]);

export const galleryUploadPaths = {
  imagesDirectory: join(process.cwd(), "public", "uploads", "gallery", "images"),
  imagesUrlPrefix: "/uploads/gallery/images",
  postersDirectory: join(process.cwd(), "public", "uploads", "gallery", "posters"),
  postersUrlPrefix: "/uploads/gallery/posters",
  videosDirectory: join(process.cwd(), "public", "uploads", "gallery", "videos"),
  videosUrlPrefix: "/uploads/gallery/videos",
} as const;

export type SavedGalleryVideo = {
  filePath: string;
  videoUrl: string;
};

function hasValidVideoSignature(bytes: Uint8Array, type: string) {
  if (type === "video/webm") {
    return bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
  }

  // ISO Base Media files (including MP4) carry the `ftyp` box at offset 4.
  return bytes.length >= 12 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70;
}

export function isValidGalleryVideoUpload(file: FormDataEntryValue | null) {
  return Boolean(
    file &&
      typeof file !== "string" &&
      file.size > 0 &&
      file.size <= MAX_GALLERY_VIDEO_BYTES &&
      galleryVideoTypes.has(file.type),
  );
}

/**
 * Videos are stored as submitted after MIME, size, and container-signature
 * validation. Unlike photos, recompressing them needs a dedicated transcoder.
 */
export async function saveGalleryVideo(file: FormDataEntryValue): Promise<SavedGalleryVideo> {
  if (!isValidGalleryVideoUpload(file) || typeof file === "string") {
    throw new Error("Invalid video upload");
  }

  const extension = galleryVideoTypes.get(file.type);
  if (!extension) throw new Error("Unsupported video type");

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!hasValidVideoSignature(buffer, file.type)) {
    throw new Error("Invalid video signature");
  }

  const fileName = `${randomUUID()}.${extension}`;
  const filePath = join(galleryUploadPaths.videosDirectory, fileName);
  await mkdir(galleryUploadPaths.videosDirectory, { recursive: true });
  await writeFile(filePath, buffer, { flag: "wx" });

  return {
    filePath,
    videoUrl: `${galleryUploadPaths.videosUrlPrefix}/${fileName}`,
  };
}
