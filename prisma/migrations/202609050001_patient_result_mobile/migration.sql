-- Existing test results are kept intact. New result uploads require a mobile
-- number; historical records without one remain unavailable through the public
-- lookup until their phone number is recorded in the database.
ALTER TABLE "PatientTestResult" ADD COLUMN "mobile" VARCHAR(11);

CREATE INDEX "PatientTestResult_nationalCode_mobile_createdAt_idx"
ON "PatientTestResult"("nationalCode", "mobile", "createdAt");
