import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const supportedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_INPUT_PIXELS = 40_000_000;

export type SavedAdminImage = {
  filePath: string;
  imageUrl: string;
};

type SaveAdminImageOptions = {
  directory: string;
  maxHeight: number;
  maxInputBytes: number;
  maxWidth: number;
  quality?: number;
  urlPrefix: string;
};

export function isValidAdminImageUpload(
  file: FormDataEntryValue | null,
  maxInputBytes: number,
) {
  return Boolean(
    file &&
      typeof file !== "string" &&
      file.size > 0 &&
      file.size <= maxInputBytes &&
      supportedImageTypes.has(file.type),
  );
}

/**
 * Decodes the uploaded image before writing it, so the stored asset is always
 * a fresh, metadata-free WebP rather than trusting its file extension or MIME type.
 */
export async function saveAdminImageAsWebp(
  file: FormDataEntryValue,
  {
    directory,
    maxHeight,
    maxInputBytes,
    maxWidth,
    quality = 80,
    urlPrefix,
  }: SaveAdminImageOptions,
): Promise<SavedAdminImage> {
  if (!isValidAdminImageUpload(file, maxInputBytes) || typeof file === "string") {
    throw new Error("Invalid image upload");
  }

  const output = await sharp(Buffer.from(await file.arrayBuffer()), {
    failOn: "error",
    limitInputPixels: MAX_INPUT_PIXELS,
  })
    .rotate()
    .resize({
      fit: "inside",
      height: maxHeight,
      width: maxWidth,
      withoutEnlargement: true,
    })
    .webp({ alphaQuality: 100, effort: 4, quality })
    .toBuffer();

  const fileName = `${randomUUID()}.webp`;
  const filePath = join(directory, fileName);
  await mkdir(directory, { recursive: true });
  await writeFile(filePath, output, { flag: "wx" });

  return { filePath, imageUrl: `${urlPrefix}/${fileName}` };
}
