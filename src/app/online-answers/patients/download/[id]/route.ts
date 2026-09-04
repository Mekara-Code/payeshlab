import { getPatientResultDownloadAccess } from "@/lib/patient-result-access";
import { getPrisma } from "@/lib/prisma";
import {
  getStoredFileContentType,
  readSecureUpload,
  secureUploadFolders,
} from "@/lib/secure-uploads";
import { buildAttachmentHeaders } from "@/lib/secure-file-response";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const [resultIds, { id }] = await Promise.all([
    getPatientResultDownloadAccess(),
    context.params,
  ]);
  if (!resultIds?.includes(id)) {
    return new Response("Not Found", { status: 404 });
  }

  const result = await getPrisma()
    .patientTestResult.findUnique({
      select: { fileName: true, storedName: true },
      where: { id },
    })
    .catch(() => null);
  if (!result) return new Response("Not Found", { status: 404 });

  const file = await readSecureUpload(
    secureUploadFolders.testResults,
    result.storedName,
  );
  if (!file) return new Response("Not Found", { status: 404 });

  return new Response(new Uint8Array(file), {
    headers: {
      ...buildAttachmentHeaders({
        contentType: getStoredFileContentType(result.storedName),
        disposition: "attachment",
        fileName: result.fileName,
        size: file.byteLength,
      }),
      "Referrer-Policy": "no-referrer",
    },
  });
}
