-- CreateTable
CREATE TABLE "SiteWorkingHour" (
    "id" UUID NOT NULL,
    "settingsId" VARCHAR(32) NOT NULL,
    "label" VARCHAR(80) NOT NULL,
    "hours" VARCHAR(100) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteWorkingHour_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiteWorkingHour_settingsId_sortOrder_idx" ON "SiteWorkingHour"("settingsId", "sortOrder");

-- AddForeignKey
ALTER TABLE "SiteWorkingHour" ADD CONSTRAINT "SiteWorkingHour_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "SiteSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
