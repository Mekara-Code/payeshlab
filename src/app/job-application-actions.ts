"use server";

import { revalidatePath } from "next/cache";
import {
  emptyCompetency,
  emptyDependent,
  emptyEducation,
  emptyForeignLanguage,
  emptyReferee,
  emptyTrainingCourse,
  emptyWorkExperience,
  genderOptions,
  healthStatusOptions,
  maritalStatusOptions,
  militaryStatusOptions,
  parseRowsJson,
  referralSourceOptions,
  specialtyOptions,
  traitOptions,
} from "@/lib/job-application";
import {
  isValidJalaliDate,
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

export type JobApplicationState = {
  messageKey?: string;
  success?: boolean;
};

const MAX_RESUME_SIZE = 8 * 1024 * 1024;

function getString(formData: FormData, name: string, maxLength = 200) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function getOptionalId(
  formData: FormData,
  name: string,
  options: ReadonlyArray<{ id: string }>,
) {
  const value = getString(formData, name, 40);
  return options.some((option) => option.id === value) ? value : null;
}

function getYesNo(formData: FormData, name: string) {
  const value = getString(formData, name, 10);
  if (value === "YES") return true;
  if (value === "NO") return false;
  return null;
}

function getCount(formData: FormData, name: string) {
  const value = toDigitsOnly(getString(formData, name, 4));
  if (!value) return null;

  const count = Number(value);
  return Number.isInteger(count) && count >= 0 && count <= 30 ? count : null;
}

function getSelectedValues(
  formData: FormData,
  name: string,
  allowed: ReadonlyArray<string>,
) {
  return formData
    .getAll(name)
    .filter(
      (value): value is string =>
        typeof value === "string" && allowed.includes(value),
    )
    .slice(0, allowed.length);
}

export async function submitJobApplication(
  _previousState: JobApplicationState,
  formData: FormData,
): Promise<JobApplicationState> {
  const firstName = getString(formData, "firstName", 80);
  const lastName = getString(formData, "lastName", 80);
  if (!firstName || !lastName) {
    return { messageKey: "careers.errorName" };
  }

  const nationalCode = toDigitsOnly(getString(formData, "nationalCode", 20));
  if (!isValidNationalCode(nationalCode)) {
    return { messageKey: "careers.errorNationalCode" };
  }

  const birthDate = toLatinDigits(getString(formData, "birthDate", 10));
  if (!isValidJalaliDate(birthDate)) {
    return { messageKey: "careers.errorBirthDate" };
  }

  const mobile = toDigitsOnly(getString(formData, "mobile", 20));
  if (!isValidMobileNumber(mobile)) {
    return { messageKey: "careers.errorMobile" };
  }

  const gender = getOptionalId(formData, "gender", genderOptions);
  const maritalStatus = getOptionalId(
    formData,
    "maritalStatus",
    maritalStatusOptions,
  );
  if (!gender || !maritalStatus) {
    return { messageKey: "careers.errorRequiredChoice" };
  }

  const email = getString(formData, "email", 254);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { messageKey: "careers.errorEmail" };
  }

  const resumeFile = formData.get("resume");
  let resumeStoredName: string | null = null;
  let resumeName: string | null = null;

  if (resumeFile && typeof resumeFile !== "string" && resumeFile.size > 0) {
    try {
      const upload = await saveSecureUpload(resumeFile, {
        allowedTypes: prescriptionUploadTypes,
        folder: secureUploadFolders.resumes,
        maxSize: MAX_RESUME_SIZE,
      });
      if (upload.error || !upload.storedName) {
        return { messageKey: "careers.errorResume" };
      }
      resumeStoredName = upload.storedName;
      resumeName = sanitizeUploadName(resumeFile.name, "resume");
    } catch {
      return { messageKey: "careers.errorResume" };
    }
  }

  try {
    await getPrisma().jobApplication.create({
      data: {
        achievementStory: getString(formData, "achievementStory", 2000) || null,
        additionalSkills: getString(formData, "additionalSkills", 1000) || null,
        address: getString(formData, "address", 500) || null,
        admiredPeople: getString(formData, "admiredPeople", 200) || null,
        availableFrom: getString(formData, "availableFrom", 80) || null,
        bestAchievement: getString(formData, "bestAchievement", 2000) || null,
        birthDate,
        birthPlace: getString(formData, "birthPlace", 100) || null,
        canProvideConsent: getYesNo(formData, "canProvideConsent"),
        competencies: parseRowsJson(
          getString(formData, "competenciesJson", 8000),
          emptyCompetency,
        ),
        cooperationDuration:
          getString(formData, "cooperationDuration", 120) || null,
        currentWorkplace: getString(formData, "currentWorkplace", 500) || null,
        daughtersCount: getCount(formData, "daughtersCount"),
        dependents: parseRowsJson(
          getString(formData, "dependentsJson", 8000),
          emptyDependent,
        ),
        educations: parseRowsJson(
          getString(formData, "educationsJson", 8000),
          emptyEducation,
        ),
        email: email || null,
        emergencyPhone: toDigitsOnly(getString(formData, "emergencyPhone", 20)) || null,
        emigrationCountry: getString(formData, "emigrationCountry", 80) || null,
        emigrationTime: getString(formData, "emigrationTime", 120) || null,
        exemptionType: getString(formData, "exemptionType", 120) || null,
        expectedSalary: getString(formData, "expectedSalary", 80) || null,
        fatherName: getString(formData, "fatherName", 80) || null,
        favoriteArt: getString(formData, "favoriteArt", 160) || null,
        favoriteHobby: getString(formData, "favoriteHobby", 160) || null,
        firstName,
        foreignLanguages: parseRowsJson(
          getString(formData, "foreignLanguagesJson", 8000),
          emptyForeignLanguage,
        ),
        furtherStudyField: getString(formData, "furtherStudyField", 120) || null,
        furtherStudyTime: getString(formData, "furtherStudyTime", 120) || null,
        gender,
        goodEmployeeTraits:
          getString(formData, "goodEmployeeTraits", 2000) || null,
        goodManagerTraits:
          getString(formData, "goodManagerTraits", 2000) || null,
        healthNote: getString(formData, "healthNote", 200) || null,
        healthStatus: getOptionalId(formData, "healthStatus", healthStatusOptions),
        homePhone: toDigitsOnly(getString(formData, "homePhone", 20)) || null,
        identityNumber: getString(formData, "identityNumber", 20) || null,
        insuranceHistory: getString(formData, "insuranceHistory", 80) || null,
        insuranceNumber: getString(formData, "insuranceNumber", 40) || null,
        isCurrentlyEmployed: getYesNo(formData, "isCurrentlyEmployed"),
        issuePlace: getString(formData, "issuePlace", 100) || null,
        lastBook: getString(formData, "lastBook", 160) || null,
        lastName,
        maritalStatus,
        militaryStatus: getOptionalId(
          formData,
          "militaryStatus",
          militaryStatusOptions,
        ),
        mobile,
        nationalCode,
        nationality: getString(formData, "nationality", 60) || null,
        plansEmigration: getYesNo(formData, "plansEmigration"),
        plansFurtherStudy: getYesNo(formData, "plansFurtherStudy"),
        readingHabit: getString(formData, "readingHabit", 80) || null,
        referees: parseRowsJson(
          getString(formData, "refereesJson", 8000),
          emptyReferee,
        ),
        referralDetail: getString(formData, "referralDetail", 160) || null,
        referralSource: getOptionalId(
          formData,
          "referralSource",
          referralSourceOptions,
        ),
        resumeName,
        resumeStoredName,
        roleModel: getString(formData, "roleModel", 2000) || null,
        selfPaidTraining: getString(formData, "selfPaidTraining", 20) || null,
        sonsCount: getCount(formData, "sonsCount"),
        specialties: getSelectedValues(formData, "specialties", specialtyOptions),
        spouseJob: getString(formData, "spouseJob", 120) || null,
        spouseName: getString(formData, "spouseName", 120) || null,
        spousePhone: toDigitsOnly(getString(formData, "spousePhone", 20)) || null,
        traits: getSelectedValues(formData, "traits", traitOptions),
        trainingCourses: parseRowsJson(
          getString(formData, "trainingCoursesJson", 8000),
          emptyTrainingCourse,
        ),
        workExperiences: parseRowsJson(
          getString(formData, "workExperiencesJson", 8000),
          emptyWorkExperience,
        ),
      },
    });
  } catch {
    await removeSecureUpload(secureUploadFolders.resumes, resumeStoredName);
    return { messageKey: "careers.errorSubmit" };
  }

  revalidatePath("/admin");
  return { messageKey: "careers.success", success: true };
}
