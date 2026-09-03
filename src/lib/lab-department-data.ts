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

export function getDefaultLabDepartments(locale: ContentLocale): LabDepartmentData[] {
  const dictionary = getDictionary(locale);
  const t = (key: string) => translate(dictionary, key);

  return [
  {
    id: "department-pathology",
    title: t("defaults.pathologyTitle"),
    description: t("defaults.pathologyDescription"),
    imageUrl: null,
    sortOrder: 10,
  },
  {
    id: "department-hematology",
    title: t("defaults.hematologyTitle"),
    description: t("defaults.hematologyDescription"),
    imageUrl: null,
    sortOrder: 20,
  },
  {
    id: "department-biochemistry",
    title: t("defaults.biochemistryTitle"),
    description: t("defaults.biochemistryDescription"),
    imageUrl: null,
    sortOrder: 30,
  },
  {
    id: "department-microbiology",
    title: t("defaults.microbiologyTitle"),
    description: t("defaults.microbiologyDescription"),
    imageUrl: null,
    sortOrder: 40,
  },
  ];
}
import type { ContentLocale } from "@/lib/content-locale";
import { getDictionary } from "@/lib/dictionaries";
import { translate } from "@/lib/dictionaries/types";
