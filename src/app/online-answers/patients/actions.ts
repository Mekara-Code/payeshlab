"use server";

import { grantPatientResultDownloadAccess } from "@/lib/patient-result-access";
import {
  isValidNationalCode,
  isValidReceptionNumber,
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
  const receptionNumber = toDigitsOnly(getString(formData, "receptionNumber"));

  if (!isValidNationalCode(nationalCode) || !isValidReceptionNumber(receptionNumber)) {
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
      where: { nationalCode, receptionNumber },
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
