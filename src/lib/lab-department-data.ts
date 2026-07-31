export type LabDepartmentData = {
  description: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  id: string;
  imageUrl: string | null;
  isActive?: boolean;
  sortOrder: number;
  title: string;
  titleAr?: string | null;
  titleEn?: string | null;
};

export const defaultLabDepartments: LabDepartmentData[] = [
  {
    id: "department-pathology",
    title: "پاتولوژی",
    description: "بررسی تخصصی نمونه‌های بافتی و سلولی با تکیه بر دقت تشخیصی، گزارش‌نویسی استاندارد و همراهی نزدیک با پزشک معالج.",
    imageUrl: null,
    sortOrder: 10,
  },
  {
    id: "department-hematology",
    title: "هماتولوژی",
    description: "ارزیابی دقیق شاخص‌های خونی و اختلالات مرتبط با خون‌سازی، با کنترل کیفی مستمر برای نتایجی قابل اتکا.",
    imageUrl: null,
    sortOrder: 20,
  },
  {
    id: "department-biochemistry",
    title: "بیوشیمی",
    description: "پایش شاخص‌های حیاتی بدن از جمله قند، چربی، عملکرد کبد و کلیه با تجهیزات به‌روز و فرآیندهای استاندارد.",
    imageUrl: null,
    sortOrder: 30,
  },
  {
    id: "department-microbiology",
    title: "میکروب‌شناسی",
    description: "شناسایی عوامل عفونی و بررسی حساسیت دارویی با رویکردی دقیق، سریع و هماهنگ با نیازهای درمانی بیمار.",
    imageUrl: null,
    sortOrder: 40,
  },
];
