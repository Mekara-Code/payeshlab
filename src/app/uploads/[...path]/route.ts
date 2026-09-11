import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { Readable } from "node:stream";

/**
 * Next.js indexes `public` once when the production server starts, so images
 * and videos uploaded from the admin panel afterwards would 404 until the next
 * restart. Files present at startup are still served by Next.js itself; only
 * the ones missing from that index fall through to this handler. The image
 * optimizer resolves local URLs through the same router, so it is covered too.
 */
const uploadsRoot = resolve(process.cwd(), "public", "uploads");

// Only formats the admin uploaders produce. SVG is deliberately excluded: it can carry scripts.
const contentTypes = new Map([
  [".avif", "image/avif"],
  [".gif", "image/gif"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".mp4", "video/mp4"],
  [".png", "image/png"],
  [".webm", "video/webm"],
  [".webp", "image/webp"],
]);

export const dynamic = "force-dynamic";

function notFound() {
  return new Response("Not Found", { status: 404 });
}

function resolveUploadPath(segments: string[]) {
  const hasUnsafeSegment = segments.some(
    (segment) => !segment || segment === "." || segment === ".." || /[\\/\0]/.test(segment),
  );
  if (hasUnsafeSegment) return null;

  const filePath = resolve(uploadsRoot, ...segments);
  return filePath.startsWith(`${uploadsRoot}${sep}`) ? filePath : null;
}

type ByteRange = { end: number; start: number };

/**
 * Video players seek with `Range` requests (Safari refuses to play without
 * them). Only single ranges are honoured; anything else gets the whole file,
 * which the spec allows.
 */
function parseRange(header: string | null, size: number): ByteRange | "unsatisfiable" | null {
  const match = header?.trim().match(/^bytes=(\d*)-(\d*)$/);
  if (!match || (!match[1] && !match[2])) return null;

  const [, startText, endText] = match;
  const range: ByteRange = startText
    ? { end: endText ? Math.min(Number(endText), size - 1) : size - 1, start: Number(startText) }
    : { end: size - 1, start: Math.max(size - Number(endText), 0) };

  return range.start > range.end || range.start >= size ? "unsatisfiable" : range;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  const filePath = resolveUploadPath(segments);
  const contentType = filePath ? contentTypes.get(extname(filePath).toLowerCase()) : undefined;
  if (!filePath || !contentType) return notFound();

  const stats = await stat(filePath).catch(() => null);
  if (!stats?.isFile() || stats.size === 0) return notFound();

  const etag = `W/"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}"`;
  const headers = new Headers({
    "Accept-Ranges": "bytes",
    // Every upload gets a fresh random file name, so a URL never starts serving different bytes.
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Type": contentType,
    ETag: etag,
    "Last-Modified": stats.mtime.toUTCString(),
    "X-Content-Type-Options": "nosniff",
  });

  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { headers, status: 304 });
  }

  const range = parseRange(request.headers.get("range"), stats.size);
  if (range === "unsatisfiable") {
    headers.set("Content-Range", `bytes */${stats.size}`);
    return new Response(null, { headers, status: 416 });
  }

  const { end, start } = range ?? { end: stats.size - 1, start: 0 };
  headers.set("Content-Length", String(end - start + 1));
  if (range) headers.set("Content-Range", `bytes ${start}-${end}/${stats.size}`);

  const body = Readable.toWeb(createReadStream(filePath, { end, start })) as ReadableStream<Uint8Array>;
  return new Response(body, { headers, status: range ? 206 : 200 });
}
