"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-session";
import { getPrisma } from "@/lib/prisma";
import { removeSecureUpload, secureUploadFolders } from "@/lib/secure-uploads";

export type JobApplicationAdminState = {
  message?: string;
  success?: boolean;
};

export type JobApplicationStatusId =
  | "PENDING"
  | "REVIEWED"
  | "APPROVED"
  | "REJECTED";

const statusMessages: Record<JobApplicationStatusId, string> = {
  APPROVED: "درخواست به وضعیت «تأیید شده» تغییر کرد.",
  PENDING: "درخواست دوباره در انتظار بررسی قرار گرفت.",
  REJECTED: "درخواست به وضعیت «رد شده» تغییر کرد.",
  REVIEWED: "درخواست به وضعیت «بررسی شد» تغییر کرد.",
};

async function isAuthorizedAdmin() {
  const session = await getAdminSession();
  return session?.role === "ADMIN";
}

function isValidApplicationId(id: string) {
  return /^[0-9a-f-]{36}$/i.test(id);
}

export async function setJobApplicationStatus(
  id: string,
  status: JobApplicationStatusId,
): Promise<JobApplicationAdminState> {
  if (
    !(await isAuthorizedAdmin()) ||
    !isValidApplicationId(id) ||
    !(status in statusMessages)
  ) {
    return { message: "درخواست تغییر وضعیت معتبر نیست." };
  }

  try {
    await getPrisma().jobApplication.update({
      data: {
        reviewedAt: status === "PENDING" ? null : new Date(),
        status,
      },
      where: { id },
    });
  } catch {
    return { message: "وضعیت درخواست تغییر نکرد. دوباره تلاش کنید." };
  }

  revalidatePath("/admin");
  return { message: statusMessages[status], success: true };
}

export async function saveJobApplicationNote(
  id: string,
  note: string,
): Promise<JobApplicationAdminState> {
  if (!(await isAuthorizedAdmin()) || !isValidApplicationId(id)) {
    return { message: "ثبت یادداشت معتبر نیست." };
  }

  const trimmedNote = note.trim().slice(0, 2_000);

  try {
    await getPrisma().jobApplication.update({
      data: { adminNote: trimmedNote || null },
      where: { id },
    });
  } catch {
    return { message: "یادداشت ذخیره نشد. دوباره تلاش کنید." };
  }

  revalidatePath("/admin");
  return { message: "یادداشت بررسی ذخیره شد.", success: true };
}

export async function deleteJobApplication(
  id: string,
): Promise<JobApplicationAdminState> {
  if (!(await isAuthorizedAdmin()) || !isValidApplicationId(id)) {
    return { message: "درخواست حذف معتبر نیست." };
  }

  const prisma = getPrisma();
  const application = await prisma.jobApplication
    .findUnique({ where: { id } })
    .catch(() => null);
  if (!application) {
    return { message: "این درخواست پیدا نشد یا قبلاً حذف شده است." };
  }

  try {
    await prisma.jobApplication.delete({ where: { id } });
  } catch {
    return { message: "حذف درخواست انجام نشد. دوباره تلاش کنید." };
  }

  await removeSecureUpload(
    secureUploadFolders.resumes,
    application.resumeStoredName,
  );
  revalidatePath("/admin");
  return { message: "درخواست استخدام حذف شد.", success: true };
}
