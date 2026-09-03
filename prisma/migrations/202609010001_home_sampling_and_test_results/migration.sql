-- CreateEnum
CREATE TYPE "HomeSamplingStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateTable
CREATE TABLE "PatientTestResult" (
    "id" UUID NOT NULL,
    "nationalCode" VARCHAR(10) NOT NULL,
    "patientName" VARCHAR(160),
    "fileName" VARCHAR(255) NOT NULL,
    "storedName" VARCHAR(64) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientTestResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeSamplingRequest" (
    "id" UUID NOT NULL,
    "firstName" VARCHAR(80) NOT NULL,
    "lastName" VARCHAR(80) NOT NULL,
    "nationalCode" VARCHAR(10) NOT NULL,
    "birthDate" VARCHAR(10) NOT NULL,
    "mobile" VARCHAR(11) NOT NULL,
    "phone" VARCHAR(20),
    "address" TEXT,
    "primaryInsurance" VARCHAR(100),
    "supplementaryInsurance" VARCHAR(100),
    "prescriptionName" VARCHAR(255),
    "prescriptionStoredName" VARCHAR(64),
    "description" TEXT,
    "isPersonalRequest" BOOLEAN NOT NULL DEFAULT false,
    "status" "HomeSamplingStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeSamplingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientTestResult_storedName_key" ON "PatientTestResult"("storedName");

-- CreateIndex
CREATE INDEX "PatientTestResult_nationalCode_createdAt_idx" ON "PatientTestResult"("nationalCode", "createdAt");

-- CreateIndex
CREATE INDEX "PatientTestResult_createdAt_idx" ON "PatientTestResult"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "HomeSamplingRequest_prescriptionStoredName_key" ON "HomeSamplingRequest"("prescriptionStoredName");

-- CreateIndex
CREATE INDEX "HomeSamplingRequest_status_createdAt_idx" ON "HomeSamplingRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "HomeSamplingRequest_createdAt_idx" ON "HomeSamplingRequest"("createdAt");
