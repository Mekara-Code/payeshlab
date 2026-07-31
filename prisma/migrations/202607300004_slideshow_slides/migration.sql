-- CreateTable
CREATE TABLE "SlideshowSlide" (
    "id" UUID NOT NULL,
    "title" VARCHAR(120),
    "subtitle" VARCHAR(240),
    "imageUrl" TEXT NOT NULL,
    "altText" VARCHAR(160) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SlideshowSlide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SlideshowSlide_isActive_sortOrder_idx" ON "SlideshowSlide"("isActive", "sortOrder");
