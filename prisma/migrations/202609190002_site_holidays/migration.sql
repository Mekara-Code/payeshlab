-- CreateTable
CREATE TABLE "SiteHoliday" (
    "id" UUID NOT NULL,
    "settingsId" VARCHAR(32) NOT NULL,
    "date" VARCHAR(10) NOT NULL,
    "title" VARCHAR(120),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteHoliday_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiteHoliday_settingsId_date_idx" ON "SiteHoliday"("settingsId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "SiteHoliday_settingsId_date_key" ON "SiteHoliday"("settingsId", "date");

-- AddForeignKey
ALTER TABLE "SiteHoliday" ADD CONSTRAINT "SiteHoliday_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "SiteSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
