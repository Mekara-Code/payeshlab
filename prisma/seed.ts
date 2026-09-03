import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashAdminPassword, isStrongAdminPassword } from "../src/lib/admin-password";
import { defaultInsurances } from "../src/lib/insurance-data";
import { getDefaultLabDepartments } from "../src/lib/lab-department-data";
import { getDefaultSlideshowSlides } from "../src/lib/slideshow-data";
import laboratoryTests from "../laboratory_tests.json";

async function main() {
  const defaultLabDepartments = getDefaultLabDepartments("fa");
  const defaultSlideshowSlides = getDefaultSlideshowSlides("fa");
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!connectionString || !email || !password) {
    throw new Error("DIRECT_URL, ADMIN_SEED_EMAIL, and ADMIN_SEED_PASSWORD are required for seeding.");
  }

  if (!isStrongAdminPassword(password)) {
    throw new Error("ADMIN_SEED_PASSWORD must be at least 14 characters and include upper/lowercase, number, and symbol.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const existingUser = await prisma.adminUser.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      console.info("Administrator already exists; no credentials were changed.");
    } else {
      await prisma.adminUser.create({
        data: {
          email,
          passwordHash: await hashAdminPassword(password),
          role: "ADMIN",
        },
      });

      console.info("Administrator account created.");
    }

    await Promise.all(
      defaultInsurances.map((insurance) =>
        prisma.insurance.upsert({
          create: {
            logoUrl: insurance.logoUrl,
            name: insurance.name,
            slug: insurance.slug,
            sortOrder: insurance.sortOrder,
          },
          update: {
            isActive: true,
            logoUrl: insurance.logoUrl,
            slug: insurance.slug,
            sortOrder: insurance.sortOrder,
          },
          where: { name: insurance.name },
        }),
      ),
    );
    console.info(`${defaultInsurances.length} insurance partner(s) seeded or updated.`);

    const existingSlides = await prisma.slideshowSlide.count();
    if (existingSlides === 0) {
      const slideshowResult = await prisma.slideshowSlide.createMany({
        data: defaultSlideshowSlides.map((slide) => ({
          altText: slide.altText,
          imageUrl: slide.imageUrl,
          sortOrder: slide.sortOrder,
          subtitle: slide.subtitle,
          title: slide.title,
        })),
      });
      console.info(`${slideshowResult.count} slideshow slide(s) seeded.`);
    } else {
      console.info("Slideshow already has content; no default slides were added.");
    }

    const existingDepartments = await prisma.labDepartment.count();
    if (existingDepartments === 0) {
      const departmentResult = await prisma.labDepartment.createMany({
        data: defaultLabDepartments.map((department) => ({
          description: department.description,
          imageUrl: department.imageUrl,
          sortOrder: department.sortOrder,
          title: department.title,
        })),
      });
      console.info(`${departmentResult.count} laboratory department(s) seeded.`);
    } else {
      console.info("Laboratory departments already have content; no defaults were added.");
    }

    const existingTests = await prisma.laboratoryTest.count();
    if (existingTests === 0) {
      const testResult = await prisma.laboratoryTest.createMany({
        data: laboratoryTests.tests.map((test, index) => ({
          clinicalSignificance: test.clinicalSignificance.trim() || null,
          description: test.description.trim() || null,
          limitations: test.limitations.trim() || null,
          name: test.name.trim(),
          resultInterpretation: test.resultInterpretation.trim() || null,
          samplingInformation: test.samplingInformation.trim() || null,
          slug: test.slug.trim(),
          sortOrder: (index + 1) * 10,
        })),
      });
      console.info(`${testResult.count} laboratory test(s) seeded.`);
    } else {
      console.info("Laboratory tests already have content; no defaults were added.");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
