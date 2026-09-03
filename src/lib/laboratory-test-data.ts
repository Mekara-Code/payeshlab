import { getPrisma } from "@/lib/prisma";

export type PublicLaboratoryTest = {
  description: string | null;
  id: string;
  name: string;
  samplingInformation: string | null;
  slug: string;
};

export type PublicLaboratoryTestDetail = PublicLaboratoryTest & {
  clinicalSignificance: string | null;
  limitations: string | null;
  resultInterpretation: string | null;
};

export async function getPublishedLaboratoryTests(): Promise<PublicLaboratoryTest[]> {
  try {
    return await getPrisma().laboratoryTest.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        description: true,
        id: true,
        name: true,
        samplingInformation: true,
        slug: true,
      },
      where: { isActive: true },
    });
  } catch {
    return [];
  }
}

export async function getPublishedLaboratoryTestBySlug(
  slug: string,
): Promise<PublicLaboratoryTestDetail | null> {
  try {
    return await getPrisma().laboratoryTest.findFirst({
      select: {
        clinicalSignificance: true,
        description: true,
        id: true,
        limitations: true,
        name: true,
        resultInterpretation: true,
        samplingInformation: true,
        slug: true,
      },
      where: { isActive: true, slug },
    });
  } catch {
    return null;
  }
}
