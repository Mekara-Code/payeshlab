-- The patient lookup key is the laboratory reception number instead of a phone number.
-- RenameColumn
ALTER TABLE "PatientTestResult" RENAME COLUMN "mobile" TO "receptionNumber";

-- AlterTable
ALTER TABLE "PatientTestResult" ALTER COLUMN "receptionNumber" SET DATA TYPE VARCHAR(20);

-- RenameIndex
ALTER INDEX "PatientTestResult_nationalCode_mobile_createdAt_idx" RENAME TO "PatientTestResult_nationalCode_receptionNumber_createdAt_idx";
