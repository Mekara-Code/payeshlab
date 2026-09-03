"use server";

import { revalidatePath } from "next/cache";
import {
  isValidJalaliDate,
  isValidLandlineNumber,
  isValidMobileNumber,
  isValidNationalCode,
  toDigitsOnly,
  toLatinDigits,
} from "@/lib/patient-identity";
import { getPrisma } from "@/lib/prisma";
import {
  prescriptionUploadTypes,
  removeSecureUpload,
  sanitizeUploadName,
  saveSecureUpload,
  secureUploadFolders,
} from "@/lib/secure-uploads";

/**
 * The public form is localised, so the action reports dictionary keys and the
 * client renders them in the visitor's language.
 */
export type HomeSamplingRequestState = {
  messageKey?: string;
  success?: boolean;
};

const MAX_PRESCRIPTION_SIZE = 8 * 1024 * 1024;

function getString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitHomeSamplingRequest(
  _previousState: HomeSamplingRequestState,
  formData: FormData,
): Promise<HomeSamplingRequestState> {
  const firstName = getString(formData, "firstName");
  const lastName = getString(formData, "lastName");
  if (!firstName || firstName.length > 80 || !lastName || lastName.length > 80) {
    return { messageKey: "homeSampling.errorName" };
  }

  const nationalCode = toDigitsOnly(getString(formData, "nationalCode"));
  if (!isValidNationalCode(nationalCode)) {
    return { messageKey: "homeSampling.errorNationalCode" };
  }

  const birthDate = toLatinDigits(getString(formData, "birthDate"));
  if (!isValidJalaliDate(birthDate) || birthDate.length > 10) {
    return { messageKey: "homeSampling.errorBirthDate" };
  }

  const mobile = toDigitsOnly(getString(formData, "mobile"));
  if (!isValidMobileNumber(mobile)) {
    return { messageKey: "homeSampling.errorMobile" };
  }

  const phone = toDigitsOnly(getString(formData, "phone"));
  if (phone && !isValidLandlineNumber(phone)) {
    return { messageKey: "homeSampling.errorPhone" };
  }

  const address = getString(formData, "address");
  const primaryInsurance = getString(formData, "primaryInsurance");
  const supplementaryInsurance = getString(formData, "supplementaryInsurance");
  const description = getString(formData, "description");
  if (
    address.length > 500 ||
    primaryInsurance.length > 100 ||
    supplementaryInsurance.length > 100 ||
    description.length > 2_000
  ) {
    return { messageKey: "homeSampling.errorLength" };
  }

  const prescriptionFile = formData.get("prescription");
  let prescriptionStoredName: string | null = null;
  let prescriptionName: string | null = null;

  if (
    prescriptionFile &&
    typeof prescriptionFile !== "string" &&
    prescriptionFile.size > 0
  ) {
    try {
      const upload = await saveSecureUpload(prescriptionFile, {
        allowedTypes: prescriptionUploadTypes,
        folder: secureUploadFolders.prescriptions,
        maxSize: MAX_PRESCRIPTION_SIZE,
      });
      if (upload.error || !upload.storedName) {
        return { messageKey: "homeSampling.errorPrescription" };
      }
      prescriptionStoredName = upload.storedName;
      prescriptionName = sanitizeUploadName(prescriptionFile.name, "prescription");
    } catch {
      return { messageKey: "homeSampling.errorPrescription" };
    }
  }

  try {
    await getPrisma().homeSamplingRequest.create({
      data: {
        address: address || null,
        birthDate,
        description: description || null,
        firstName,
        isPersonalRequest: formData.get("isPersonalRequest") === "on",
        lastName,
        mobile,
        nationalCode,
        phone: phone || null,
        prescriptionName,
        prescriptionStoredName,
        primaryInsurance: primaryInsurance || null,
        supplementaryInsurance: supplementaryInsurance || null,
      },
    });
  } catch {
    await removeSecureUpload(
      secureUploadFolders.prescriptions,
      prescriptionStoredName,
    );
    return { messageKey: "homeSampling.errorSubmit" };
  }

  revalidatePath("/admin");
  return { messageKey: "homeSampling.success", success: true };
}
