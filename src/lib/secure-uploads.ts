import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Patient documents never live under `public/`; they are written outside the
 * served directory and streamed back only through admin-authenticated routes.
 */
const storageRoot = join(process.cwd(), "private-uploads");

export const secureUploadFolders = {
  prescriptions: "prescriptions",
  resumes: "resumes",
  testResults: "test-results",
} as const;

export type SecureUploadFolder =
  (typeof secureUploadFolders)[keyof typeof secureUploadFolders];

export const pdfUploadTypes = { "application/pdf": "pdf" } as const;
export const prescriptionUploadTypes = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type UploadType = keyof typeof prescriptionUploadTypes;

const storedNamePattern = /^[0-9a-f-]{36}\.(?:jpg|pdf|png|webp)$/i;
const contentTypeByExtension: Record<string, string> = {
  jpg: "image/jpeg",
  pdf: "application/pdf",
  png: "image/png",
  webp: "image/webp",
};

function hasValidSignature(bytes: Uint8Array, type: UploadType) {
  if (type === "application/pdf") {
    return bytes.length >= 5 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d;
  }

  if (type === "image/png") {
    return bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
  }

  if (type === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  return bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
}

export function sanitizeUploadName(value: string, fallback: string) {
  const cleaned = Array.from(value)
    .filter((character) => {
      const code = character.codePointAt(0) ?? 0;
      return code > 31 && code !== 127;
    })
    .join("")
    .replace(/[\\/]/g, " ")
    .trim()
    .slice(0, 255);

  return cleaned || fallback;
}

export function getStoredFileContentType(storedName: string) {
  const extension = storedName.split(".").pop()?.toLowerCase() ?? "";
  return contentTypeByExtension[extension] ?? "application/octet-stream";
}

export async function saveSecureUpload(
  file: FormDataEntryValue | null,
  {
    allowedTypes,
    folder,
    maxSize,
  }: {
    allowedTypes: Record<string, string>;
    folder: SecureUploadFolder;
    maxSize: number;
  },
): Promise<{ error?: string; storedName?: string }> {
  if (!file || typeof file === "string" || file.size === 0) {
    return { error: "فایلی انتخاب نشده است." };
  }

  if (!(file.type in allowedTypes) || file.size > maxSize) {
    return { error: "قالب یا حجم فایل انتخاب‌شده مجاز نیست." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasValidSignature(bytes, file.type as UploadType)) {
    return { error: "محتوای فایل با قالب اعلام‌شده هم‌خوانی ندارد." };
  }

  const storedName = `${randomUUID()}.${allowedTypes[file.type]}`;
  const folderPath = join(storageRoot, folder);
  await mkdir(folderPath, { recursive: true });
  await writeFile(join(folderPath, storedName), bytes, { flag: "wx" });

  return { storedName };
}

export async function readSecureUpload(
  folder: SecureUploadFolder,
  storedName: string,
) {
  if (!storedNamePattern.test(storedName)) return null;

  return readFile(join(storageRoot, folder, storedName)).catch(() => null);
}

export async function removeSecureUpload(
  folder: SecureUploadFolder,
  storedName: string | null,
) {
  if (!storedName || !storedNamePattern.test(storedName)) return;

  await unlink(join(storageRoot, folder, storedName)).catch(() => undefined);
}
