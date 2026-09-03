import "server-only";

/**
 * Patient files are shown inline in the admin panel; the ASCII fallback keeps
 * browsers happy when the original name contains Persian characters.
 */
export function buildAttachmentHeaders({
  contentType,
  fileName,
  size,
}: {
  contentType: string;
  fileName: string;
  size: number;
}) {
  const asciiFallback = fileName.replace(/[^\x20-\x7e]/g, "_").replace(/["]/g, "");

  return {
    "Cache-Control": "private, no-store",
    "Content-Disposition": `inline; filename="${asciiFallback || "file"}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    "Content-Length": String(size),
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
  };
}
