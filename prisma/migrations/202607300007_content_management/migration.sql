-- CreateEnum
CREATE TYPE "ArticleType" AS ENUM ('ARTICLE', 'NEWS');

-- AlterTable
ALTER TABLE "Article" ADD COLUMN "type" "ArticleType" NOT NULL DEFAULT 'ARTICLE';

-- CreateTable
CREATE TABLE "Announcement" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- Replace the article listing index with a content-type-aware index.
DROP INDEX "Article_status_publishedAt_idx";
CREATE INDEX "Article_type_status_publishedAt_idx" ON "Article"("type", "status", "publishedAt");

-- CreateIndex
CREATE INDEX "Announcement_isActive_publishedAt_idx" ON "Announcement"("isActive", "publishedAt");
