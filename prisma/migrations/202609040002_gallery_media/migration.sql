-- CreateEnum
CREATE TYPE "GalleryMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "GalleryMedia" (
    "id" UUID NOT NULL,
    "type" "GalleryMediaType" NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "altText" VARCHAR(240) NOT NULL,
    "description" TEXT,
    "mediaUrl" TEXT NOT NULL,
    "posterUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GalleryMedia_mediaUrl_key" ON "GalleryMedia"("mediaUrl");
CREATE INDEX "GalleryMedia_isActive_sortOrder_idx" ON "GalleryMedia"("isActive", "sortOrder");
CREATE INDEX "GalleryMedia_createdAt_idx" ON "GalleryMedia"("createdAt");
