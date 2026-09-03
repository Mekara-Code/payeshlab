/**
 * Shapes and option lists for the employment questionnaire. The repeating
 * sections of the paper form are stored as JSON columns, so the parsers here
 * are shared by the submit action and the admin review screen.
 */

export type SkillLevel = "WEAK" | "AVERAGE" | "GOOD";

export const skillLevelOptions: Array<{ id: SkillLevel; label: string }> = [
  { id: "WEAK", label: "ضعیف" },
  { id: "AVERAGE", label: "متوسط" },
  { id: "GOOD", label: "خوب" },
];

export const genderOptions = [
  { id: "FEMALE", label: "زن" },
  { id: "MALE", label: "مرد" },
] as const;

export const maritalStatusOptions = [
  { id: "SINGLE", label: "مجرد" },
  { id: "MARRIED", label: "متأهل" },
] as const;

export const militaryStatusOptions = [
  { id: "INCLUDED", label: "مشمول" },
  { id: "COMPLETED", label: "پایان خدمت" },
  { id: "EXEMPT", label: "معاف" },
  { id: "NOT_APPLICABLE", label: "مشمول نمی‌شوم" },
] as const;

export const healthStatusOptions = [
  { id: "HEALTHY", label: "سالم" },
  { id: "ISSUE", label: "مشکل جسمانی" },
] as const;

export const referralSourceOptions = [
  { id: "IRANTALENT", label: "IranTalent" },
  { id: "LINKEDIN", label: "Linkedin" },
  { id: "JOBVISION", label: "Jobvision" },
  { id: "JOBINJA", label: "Jobinja" },
  { id: "E_ESTEKHDAM", label: "E-estekhdam" },
  { id: "REFERRAL", label: "معرفی" },
  { id: "OTHER", label: "سایر" },
] as const;

export const specialtyOptions = [
  "مالی و حسابداری",
  "فروش و بازاریابی",
  "تولید محتوا",
  "خدمات",
  "مدیریت",
  "نگهداری",
  "دیجیتال مارکتینگ",
] as const;

export const traitOptions = [
  "درون‌گرا",
  "برون‌گرا",
  "خوش‌بین",
  "دقیق",
  "لجباز",
  "رقابتی",
  "آرام و صبور",
  "محتاط",
  "باثبات",
  "اجتماعی",
  "نتیجه‌گرا",
  "مشتاق و عجول",
  "دنباله‌رو",
  "شوخ‌طبع",
  "رک و صریح",
  "شجاع و جسور",
  "خانواده‌دوست",
  "فداکار",
  "ریسک‌پذیر",
  "تجزیه و تحلیل‌گر",
  "جدی",
] as const;

export const languageSkillFields = [
  { id: "comprehension", label: "درک مطلب" },
  { id: "translation", label: "ترجمه" },
  { id: "speaking", label: "مکالمه" },
  { id: "writing", label: "نگارش" },
] as const;

export type DependentRow = {
  age: string;
  job: string;
  name: string;
  phone: string;
  relation: string;
};

export type RefereeRow = {
  job: string;
  name: string;
  organization: string;
  phone: string;
  relation: string;
};

export type EducationRow = {
  degree: string;
  field: string;
  gpa: string;
  graduationYear: string;
  orientation: string;
  university: string;
};

export type WorkExperienceRow = {
  endDate: string;
  leaveReason: string;
  organization: string;
  phone: string;
  position: string;
  salary: string;
  startDate: string;
};

export type TrainingCourseRow = {
  date: string;
  duration: string;
  hasCertificate: string;
  institute: string;
  title: string;
};

export type CompetencyRow = {
  level: string;
  title: string;
};

export type ForeignLanguageRow = {
  comprehension: string;
  language: string;
  speaking: string;
  translation: string;
  writing: string;
};

export const emptyDependent: DependentRow = { age: "", job: "", name: "", phone: "", relation: "" };
export const emptyReferee: RefereeRow = { job: "", name: "", organization: "", phone: "", relation: "" };
export const emptyEducation: EducationRow = { degree: "", field: "", gpa: "", graduationYear: "", orientation: "", university: "" };
export const emptyWorkExperience: WorkExperienceRow = { endDate: "", leaveReason: "", organization: "", phone: "", position: "", salary: "", startDate: "" };
export const emptyTrainingCourse: TrainingCourseRow = { date: "", duration: "", hasCertificate: "", institute: "", title: "" };
export const emptyCompetency: CompetencyRow = { level: "", title: "" };
export const emptyForeignLanguage: ForeignLanguageRow = { comprehension: "", language: "", speaking: "", translation: "", writing: "" };

const MAX_ROWS = 12;
const MAX_CELL_LENGTH = 160;

function readCell(source: Record<string, unknown>, key: string) {
  const value = source[key];
  return typeof value === "string" ? value.trim().slice(0, MAX_CELL_LENGTH) : "";
}

/** Keeps only the known keys of `template`, so stray JSON never reaches the database. */
export function parseRows<Row extends Record<string, string>>(
  value: unknown,
  template: Row,
): Row[] {
  const rows = Array.isArray(value) ? value : [];

  return rows
    .slice(0, MAX_ROWS)
    .map((row) => {
      const source =
        row && typeof row === "object" ? (row as Record<string, unknown>) : {};

      return Object.keys(template).reduce((parsed, key) => {
        parsed[key as keyof Row] = readCell(source, key) as Row[keyof Row];
        return parsed;
      }, {} as Row);
    })
    .filter((row) => Object.values(row).some((cell) => cell !== ""));
}

export function parseRowsJson<Row extends Record<string, string>>(
  json: string,
  template: Row,
): Row[] {
  try {
    return parseRows(JSON.parse(json), template);
  } catch {
    return [];
  }
}

export function getSkillLevelLabel(level: string) {
  return skillLevelOptions.find((option) => option.id === level)?.label ?? "—";
}

export function getOptionLabel(
  options: ReadonlyArray<{ id: string; label: string }>,
  id: string | null,
) {
  if (!id) return "—";
  return options.find((option) => option.id === id)?.label ?? id;
}
