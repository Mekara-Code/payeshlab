-- CreateTable
CREATE TABLE "LaboratoryTest" (
    "id" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "description" TEXT,
    "clinicalSignificance" TEXT,
    "resultInterpretation" TEXT,
    "samplingInformation" TEXT,
    "limitations" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaboratoryTest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LaboratoryTest_slug_key" ON "LaboratoryTest"("slug");

-- CreateIndex
CREATE INDEX "LaboratoryTest_isActive_sortOrder_idx" ON "LaboratoryTest"("isActive", "sortOrder");
