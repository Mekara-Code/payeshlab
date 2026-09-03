import { getAdminSession } from "@/lib/admin-session";
import { getPrisma } from "@/lib/prisma";
import { buildAttachmentHeaders } from "@/lib/secure-file-response";
import {
  getStoredFileContentType,
  readSecureUpload,
  secureUploadFolders,
} from "@/lib/secure-uploads";

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

  const request = await getPrisma()
    .homeSamplingRequest.findUnique({
      select: { prescriptionName: true, prescriptionStoredName: true },
      where: { id },
    })
    .catch(() => null);
  if (!request?.prescriptionStoredName) {
    return new Response("Not Found", { status: 404 });
  }

  const file = await readSecureUpload(
    secureUploadFolders.prescriptions,
    request.prescriptionStoredName,
  );
  if (!file) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(new Uint8Array(file), {
    headers: buildAttachmentHeaders({
      contentType: getStoredFileContentType(request.prescriptionStoredName),
      fileName: request.prescriptionName ?? request.prescriptionStoredName,
      size: file.byteLength,
    }),
  });
}
