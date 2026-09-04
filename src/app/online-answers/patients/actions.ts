"use server";

import { grantPatientResultDownloadAccess } from "@/lib/patient-result-access";
import {
  isValidMobileNumber,
  isValidNationalCode,
  toDigitsOnly,
} from "@/lib/patient-identity";
import { getPrisma } from "@/lib/prisma";

export type PatientResultLookupState = {
  error?: "invalidIdentity" | "notFound" | "temporary";
  results?: Array<{
    createdAt: string;
    fileName: string;
    fileSize: number;
    id: string;
  }>;
};

function getString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function findPatientTestResult(
  _previousState: PatientResultLookupState,
  formData: FormData,
): Promise<PatientResultLookupState> {
  const nationalCode = toDigitsOnly(getString(formData, "nationalCode"));
  const mobile = toDigitsOnly(getString(formData, "mobile"));

  if (!isValidNationalCode(nationalCode) || !isValidMobileNumber(mobile)) {
    return { error: "invalidIdentity" };
  }

  try {
    const results = await getPrisma().patientTestResult.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        fileName: true,
        fileSize: true,
        id: true,
      },
      where: { mobile, nationalCode },
    });

    if (results.length === 0) return { error: "notFound" };

    if (!(await grantPatientResultDownloadAccess(results.map((result) => result.id)))) {
      return { error: "temporary" };
    }

    return {
      results: results.map((result) => ({
        createdAt: result.createdAt.toISOString(),
        fileName: result.fileName,
        fileSize: result.fileSize,
        id: result.id,
      })),
    };
  } catch {
    return { error: "temporary" };
  }
}
