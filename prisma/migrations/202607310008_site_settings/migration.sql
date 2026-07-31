-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" VARCHAR(32) NOT NULL,
    "laboratoryName" VARCHAR(160),
    "shortDescription" VARCHAR(500),
    "instagramUrl" TEXT,
    "whatsappUrl" TEXT,
    "telegramUrl" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SitePhone" (
    "id" UUID NOT NULL,
    "settingsId" VARCHAR(32) NOT NULL,
    "label" VARCHAR(80),
    "phone" VARCHAR(40) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SitePhone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteAddress" (
    "id" UUID NOT NULL,
    "settingsId" VARCHAR(32) NOT NULL,
    "title" VARCHAR(100),
    "address" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SitePhone_settingsId_sortOrder_idx" ON "SitePhone"("settingsId", "sortOrder");

-- CreateIndex
CREATE INDEX "SiteAddress_settingsId_sortOrder_idx" ON "SiteAddress"("settingsId", "sortOrder");

-- AddForeignKey
ALTER TABLE "SitePhone" ADD CONSTRAINT "SitePhone_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "SiteSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteAddress" ADD CONSTRAINT "SiteAddress_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "SiteSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
