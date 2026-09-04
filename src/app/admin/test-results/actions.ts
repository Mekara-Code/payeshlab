"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-session";
import {
  isValidMobileNumber,
  isValidNationalCode,
  toDigitsOnly,
} from "@/lib/patient-identity";
import { getPrisma } from "@/lib/prisma";
import {
  pdfUploadTypes,
  removeSecureUpload,
  sanitizeUploadName,
  saveSecureUpload,
  secureUploadFolders,
} from "@/lib/secure-uploads";

export type TestResultActionState = {
  message?: string;
  success?: boolean;
};

const MAX_RESULT_FILE_SIZE = 15 * 1024 * 1024;

function getString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

async function isAuthorizedAdmin() {
  const session = await getAdminSession();
  return session?.role === "ADMIN";
}

function isValidResultId(id: string) {
  return /^[0-9a-f-]{36}$/i.test(id);
}

export async function uploadPatientTestResult(
  _previousState: TestResultActionState,
  formData: FormData,
): Promise<TestResultActionState> {
  if (!(await isAuthorizedAdmin())) {
    return { message: "دسترسی شما برای بارگذاری جواب آزمایش معتبر نیست." };
  }

  const nationalCode = toDigitsOnly(getString(formData, "nationalCode"));
  if (!isValidNationalCode(nationalCode)) {
    return { message: "کد ملی بیمار باید ۱۰ رقم و معتبر باشد." };
  }

  const mobile = toDigitsOnly(getString(formData, "mobile"));
  if (!isValidMobileNumber(mobile)) {
    return { message: "شماره موبایل بیمار باید ۱۱ رقم و با ۰۹ شروع شود." };
  }

  const patientName = getString(formData, "patientName") || null;
  if (patientName && patientName.length > 160) {
    return { message: "نام بیمار را حداکثر در ۱۶۰ نویسه وارد کنید." };
  }

  const resultFile = formData.get("resultFile");
  if (!resultFile || typeof resultFile === "string" || resultFile.size === 0) {
    return { message: "فایل جواب آزمایش را انتخاب کنید." };
  }
  if (resultFile.type !== "application/pdf" || resultFile.size > MAX_RESULT_FILE_SIZE) {
    return { message: "فایل جواب باید PDF و حداکثر ۱۵ مگابایت باشد." };
  }

  let storedName: string;
  try {
    const upload = await saveSecureUpload(resultFile, {
      allowedTypes: pdfUploadTypes,
      folder: secureUploadFolders.testResults,
      maxSize: MAX_RESULT_FILE_SIZE,
    });
    if (upload.error || !upload.storedName) {
      return { message: upload.error ?? "فایل جواب آزمایش معتبر نیست." };
    }
    storedName = upload.storedName;
  } catch {
    return { message: "بارگذاری فایل انجام نشد. دوباره تلاش کنید." };
  }

  try {
    await getPrisma().patientTestResult.create({
      data: {
        fileName: sanitizeUploadName(resultFile.name, `${nationalCode}.pdf`),
        fileSize: resultFile.size,
        mobile,
        nationalCode,
        patientName,
        storedName,
      },
    });
  } catch {
    await removeSecureUpload(secureUploadFolders.testResults, storedName);
    return { message: "ثبت جواب آزمایش انجام نشد. دوباره تلاش کنید." };
  }

  revalidatePath("/admin");
  return { message: "جواب آزمایش با موفقیت بارگذاری شد.", success: true };
}

export async function deletePatientTestResult(
  id: string,
): Promise<TestResultActionState> {
  if (!(await isAuthorizedAdmin()) || !isValidResultId(id)) {
    return { message: "درخواست حذف جواب آزمایش معتبر نیست." };
  }

  const prisma = getPrisma();
  const result = await prisma.patientTestResult
    .findUnique({ where: { id } })
    .catch(() => null);
  if (!result) {
    return { message: "این جواب آزمایش پیدا نشد یا قبلاً حذف شده است." };
  }

  try {
    await prisma.patientTestResult.delete({ where: { id } });
  } catch {
    return { message: "حذف جواب آزمایش انجام نشد. دوباره تلاش کنید." };
  }

  await removeSecureUpload(secureUploadFolders.testResults, result.storedName);
  revalidatePath("/admin");
  return { message: "جواب آزمایش حذف شد.", success: true };
}
