import { getAdminSession } from "@/lib/admin-session";
import { getPrisma } from "@/lib/prisma";
import {
  getStoredFileContentType,
  readSecureUpload,
  secureUploadFolders,
} from "@/lib/secure-uploads";
import { buildAttachmentHeaders } from "@/lib/secure-file-response";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (session?.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return new Response("Not Found", { status: 404 });
  }

  const result = await getPrisma()
    .patientTestResult.findUnique({
      select: { fileName: true, storedName: true },
      where: { id },
    })
    .catch(() => null);
  if (!result) {
    return new Response("Not Found", { status: 404 });
  }

  const file = await readSecureUpload(
    secureUploadFolders.testResults,
    result.storedName,
  );
  if (!file) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(new Uint8Array(file), {
    headers: buildAttachmentHeaders({
      contentType: getStoredFileContentType(result.storedName),
      fileName: result.fileName,
      size: file.byteLength,
    }),
  });
}
