"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-session";
import { getPrisma } from "@/lib/prisma";
import { removeSecureUpload, secureUploadFolders } from "@/lib/secure-uploads";

export type HomeSamplingAdminState = {
  message?: string;
  success?: boolean;
};

async function isAuthorizedAdmin() {
  const session = await getAdminSession();
  return session?.role === "ADMIN";
}

function isValidRequestId(id: string) {
  return /^[0-9a-f-]{36}$/i.test(id);
}

export async function setHomeSamplingRequestCompleted(
  id: string,
  isCompleted: boolean,
): Promise<HomeSamplingAdminState> {
  if (!(await isAuthorizedAdmin()) || !isValidRequestId(id)) {
    return { message: "درخواست تغییر وضعیت معتبر نیست." };
  }

  try {
    await getPrisma().homeSamplingRequest.update({
      data: {
        completedAt: isCompleted ? new Date() : null,
        status: isCompleted ? "COMPLETED" : "PENDING",
      },
      where: { id },
    });
  } catch {
    return { message: "وضعیت درخواست تغییر نکرد. دوباره تلاش کنید." };
  }

  revalidatePath("/admin");
  return {
    message: isCompleted
      ? "درخواست به وضعیت «انجام شد» تغییر کرد."
      : "درخواست دوباره در انتظار پیگیری قرار گرفت.",
    success: true,
  };
}

export async function deleteHomeSamplingRequest(
  id: string,
): Promise<HomeSamplingAdminState> {
  if (!(await isAuthorizedAdmin()) || !isValidRequestId(id)) {
    return { message: "درخواست حذف معتبر نیست." };
  }

  const prisma = getPrisma();
  const request = await prisma.homeSamplingRequest
    .findUnique({ where: { id } })
    .catch(() => null);
  if (!request) {
    return { message: "این درخواست پیدا نشد یا قبلاً حذف شده است." };
  }

  try {
    await prisma.homeSamplingRequest.delete({ where: { id } });
  } catch {
    return { message: "حذف درخواست انجام نشد. دوباره تلاش کنید." };
  }

  await removeSecureUpload(
    secureUploadFolders.prescriptions,
    request.prescriptionStoredName,
  );
  revalidatePath("/admin");
  return { message: "درخواست حذف شد.", success: true };
}
