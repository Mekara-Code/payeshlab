-- CreateEnum
CREATE TYPE "JobApplicationStatus" AS ENUM ('PENDING', 'REVIEWED', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "SiteSettings" DROP COLUMN "telegramUrl",
ADD COLUMN "rubikaUrl" TEXT,
ADD COLUMN "eitaaUrl" TEXT,
ADD COLUMN "surveyFormUrl" TEXT;

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" UUID NOT NULL,
    "firstName" VARCHAR(80) NOT NULL,
    "lastName" VARCHAR(80) NOT NULL,
    "fatherName" VARCHAR(80),
    "identityNumber" VARCHAR(20),
    "nationalCode" VARCHAR(10) NOT NULL,
    "birthDate" VARCHAR(10) NOT NULL,
    "birthPlace" VARCHAR(100),
    "issuePlace" VARCHAR(100),
    "gender" VARCHAR(10) NOT NULL,
    "maritalStatus" VARCHAR(16) NOT NULL,
    "nationality" VARCHAR(60),
    "militaryStatus" VARCHAR(20),
    "exemptionType" VARCHAR(120),
    "healthStatus" VARCHAR(20),
    "healthNote" VARCHAR(200),
    "email" VARCHAR(254),
    "address" TEXT,
    "homePhone" VARCHAR(20),
    "mobile" VARCHAR(11) NOT NULL,
    "emergencyPhone" VARCHAR(20),
    "spouseName" VARCHAR(120),
    "spouseJob" VARCHAR(120),
    "spousePhone" VARCHAR(20),
    "sonsCount" INTEGER,
    "daughtersCount" INTEGER,
    "dependents" JSONB NOT NULL DEFAULT '[]',
    "referees" JSONB NOT NULL DEFAULT '[]',
    "educations" JSONB NOT NULL DEFAULT '[]',
    "workExperiences" JSONB NOT NULL DEFAULT '[]',
    "trainingCourses" JSONB NOT NULL DEFAULT '[]',
    "competencies" JSONB NOT NULL DEFAULT '[]',
    "foreignLanguages" JSONB NOT NULL DEFAULT '[]',
    "referralSource" VARCHAR(40),
    "referralDetail" VARCHAR(160),
    "canProvideConsent" BOOLEAN,
    "isCurrentlyEmployed" BOOLEAN,
    "currentWorkplace" TEXT,
    "plansFurtherStudy" BOOLEAN,
    "furtherStudyField" VARCHAR(120),
    "furtherStudyTime" VARCHAR(120),
    "plansEmigration" BOOLEAN,
    "emigrationCountry" VARCHAR(80),
    "emigrationTime" VARCHAR(120),
    "insuranceHistory" VARCHAR(80),
    "insuranceNumber" VARCHAR(40),
    "expectedSalary" VARCHAR(80),
    "availableFrom" VARCHAR(80),
    "cooperationDuration" VARCHAR(120),
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "additionalSkills" TEXT,
    "favoriteHobby" VARCHAR(160),
    "favoriteArt" VARCHAR(160),
    "admiredPeople" VARCHAR(200),
    "readingHabit" VARCHAR(80),
    "lastBook" VARCHAR(160),
    "traits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "goodEmployeeTraits" TEXT,
    "goodManagerTraits" TEXT,
    "bestAchievement" TEXT,
    "roleModel" TEXT,
    "selfPaidTraining" VARCHAR(20),
    "achievementStory" TEXT,
    "resumeName" VARCHAR(255),
    "resumeStoredName" VARCHAR(64),
    "status" "JobApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_resumeStoredName_key" ON "JobApplication"("resumeStoredName");

-- CreateIndex
CREATE INDEX "JobApplication_status_createdAt_idx" ON "JobApplication"("status", "createdAt");

-- CreateIndex
CREATE INDEX "JobApplication_createdAt_idx" ON "JobApplication"("createdAt");
