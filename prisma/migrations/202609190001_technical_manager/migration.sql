-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN "technicalManagerName" VARCHAR(160);
ALTER TABLE "SiteSettings" ADD COLUMN "technicalManagerLicenseCode" VARCHAR(40);
ALTER TABLE "SiteSettings" ADD COLUMN "technicalManagerBio" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "technicalManagerImageUrl" TEXT;
