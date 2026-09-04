import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import type { ManagedLaboratoryTest } from "@/components/admin/laboratory-test-manager";
import type { ManagedAnnouncement } from "@/components/admin/announcement-manager";
import type { ManagedArticle } from "@/components/admin/article-editor";
import type { ManagedHomeSamplingRequest } from "@/components/admin/home-sampling-manager";
import type { ManagedJobApplication } from "@/components/admin/job-application-manager";
import type { ManagedTestResult } from "@/components/admin/test-result-manager";
import type { ManagedGalleryMedia } from "@/components/admin/gallery-manager";
import { getAdminSession } from "@/lib/admin-session";
import type { InsurancePartner } from "@/lib/insurance-data";
import type { LabDepartmentData } from "@/lib/lab-department-data";
import {
  emptyCompetency,
  emptyDependent,
  emptyEducation,
  emptyForeignLanguage,
  emptyReferee,
  emptyTrainingCourse,
  emptyWorkExperience,
  parseRows,
} from "@/lib/job-application";
import { getPrisma } from "@/lib/prisma";
import type { SlideshowSlideData } from "@/lib/slideshow-data";
import { getSiteSettings } from "@/lib/site-settings";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  let insurances: Array<
    InsurancePartner & { isActive: boolean; updatedAt: string }
  > = [];
  let departments: Array<
    LabDepartmentData & { isActive: boolean; updatedAt: string }
  > = [];
  let slides: Array<
    SlideshowSlideData & { isActive: boolean; updatedAt: string }
  > = [];
  let galleryMedia: ManagedGalleryMedia[] = [];
  let articles: Array<
    ManagedArticle & { type: "ARTICLE" | "NEWS" | "PREPARATION" }
  > = [];
  let announcements: ManagedAnnouncement[] = [];
  let tests: ManagedLaboratoryTest[] = [];
  let testResults: ManagedTestResult[] = [];
  let samplingRequests: ManagedHomeSamplingRequest[] = [];
  let jobApplications: ManagedJobApplication[] = [];
  const settings = await getSiteSettings();

  try {
    const managedInsurances = await getPrisma().insurance.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        isActive: true,
        logoUrl: true,
        name: true,
        slug: true,
        sortOrder: true,
        updatedAt: true,
      },
    });
    insurances = managedInsurances.map((insurance) => ({
      ...insurance,
      updatedAt: insurance.updatedAt.toISOString(),
    }));
  } catch {
    // The admin can still access the panel while a new database migration is being applied.
  }

  try {
    const managedDepartments = await getPrisma().labDepartment.findMany({
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: {
        description: true,
        descriptionAr: true,
        descriptionEn: true,
        id: true,
        imageUrl: true,
        isActive: true,
        sortOrder: true,
        title: true,
        titleAr: true,
        titleEn: true,
        updatedAt: true,
      },
    });
    departments = managedDepartments.map((department) => ({
      ...department,
      updatedAt: department.updatedAt.toISOString(),
    }));
  } catch {
    // The admin can still access the panel while a new database migration is being applied.
  }

  try {
    const managedSlides = await getPrisma().slideshowSlide.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        altText: true,
        id: true,
        imageUrl: true,
        isActive: true,
        sortOrder: true,
        subtitle: true,
        title: true,
        updatedAt: true,
      },
    });
    slides = managedSlides.map((slide) => ({
      ...slide,
      updatedAt: slide.updatedAt.toISOString(),
    }));
  } catch {
    // The admin can still access the panel while a new database migration is being applied.
  }

  try {
    const managedGalleryMedia = await getPrisma().galleryMedia.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        altText: true,
        createdAt: true,
        description: true,
        id: true,
        isActive: true,
        mediaUrl: true,
        posterUrl: true,
        sortOrder: true,
        title: true,
        type: true,
        updatedAt: true,
      },
    });
    galleryMedia = managedGalleryMedia.map((media) => ({
      ...media,
      createdAt: media.createdAt.toISOString(),
      updatedAt: media.updatedAt.toISOString(),
    }));
  } catch {
    // The admin can still access the panel while a new database migration is being applied.
  }

  try {
    const managedTests = await getPrisma().laboratoryTest.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        clinicalSignificance: true,
        description: true,
        id: true,
        isActive: true,
        limitations: true,
        name: true,
        resultInterpretation: true,
        samplingInformation: true,
        slug: true,
        sortOrder: true,
        updatedAt: true,
      },
    });
    tests = managedTests.map((test) => ({
      ...test,
      updatedAt: test.updatedAt.toISOString(),
    }));
  } catch {
    // The admin can still access the panel while a new database migration is being applied.
  }

  try {
    const managedResults = await getPrisma().patientTestResult.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        createdAt: true,
        fileName: true,
        fileSize: true,
        id: true,
        nationalCode: true,
        patientName: true,
      },
    });
    testResults = managedResults.map((result) => ({
      ...result,
      createdAt: result.createdAt.toISOString(),
    }));
  } catch {
    // The admin can still access the panel while a new database migration is being applied.
  }

  try {
    const managedRequests = await getPrisma().homeSamplingRequest.findMany({
      orderBy: [{ createdAt: "desc" }],
    });
    samplingRequests = managedRequests.map((request) => ({
      address: request.address,
      birthDate: request.birthDate,
      completedAt: request.completedAt?.toISOString() ?? null,
      createdAt: request.createdAt.toISOString(),
      description: request.description,
      firstName: request.firstName,
      hasPrescription: Boolean(request.prescriptionStoredName),
      id: request.id,
      isPersonalRequest: request.isPersonalRequest,
      lastName: request.lastName,
      mobile: request.mobile,
      nationalCode: request.nationalCode,
      phone: request.phone,
      prescriptionName: request.prescriptionName,
      primaryInsurance: request.primaryInsurance,
      status: request.status,
      supplementaryInsurance: request.supplementaryInsurance,
    }));
  } catch {
    // The admin can still access the panel while a new database migration is being applied.
  }

  try {
    const managedApplications = await getPrisma().jobApplication.findMany({
      orderBy: [{ createdAt: "desc" }],
    });
    jobApplications = managedApplications.map((application) => ({
      achievementStory: application.achievementStory,
      additionalSkills: application.additionalSkills,
      address: application.address,
      admiredPeople: application.admiredPeople,
      adminNote: application.adminNote,
      availableFrom: application.availableFrom,
      bestAchievement: application.bestAchievement,
      birthDate: application.birthDate,
      birthPlace: application.birthPlace,
      canProvideConsent: application.canProvideConsent,
      competencies: parseRows(application.competencies, emptyCompetency),
      cooperationDuration: application.cooperationDuration,
      createdAt: application.createdAt.toISOString(),
      currentWorkplace: application.currentWorkplace,
      daughtersCount: application.daughtersCount,
      dependents: parseRows(application.dependents, emptyDependent),
      educations: parseRows(application.educations, emptyEducation),
      email: application.email,
      emergencyPhone: application.emergencyPhone,
      emigrationCountry: application.emigrationCountry,
      emigrationTime: application.emigrationTime,
      exemptionType: application.exemptionType,
      expectedSalary: application.expectedSalary,
      fatherName: application.fatherName,
      favoriteArt: application.favoriteArt,
      favoriteHobby: application.favoriteHobby,
      firstName: application.firstName,
      foreignLanguages: parseRows(
        application.foreignLanguages,
        emptyForeignLanguage,
      ),
      furtherStudyField: application.furtherStudyField,
      furtherStudyTime: application.furtherStudyTime,
      gender: application.gender,
      goodEmployeeTraits: application.goodEmployeeTraits,
      goodManagerTraits: application.goodManagerTraits,
      hasResume: Boolean(application.resumeStoredName),
      healthNote: application.healthNote,
      healthStatus: application.healthStatus,
      homePhone: application.homePhone,
      id: application.id,
      identityNumber: application.identityNumber,
      insuranceHistory: application.insuranceHistory,
      insuranceNumber: application.insuranceNumber,
      isCurrentlyEmployed: application.isCurrentlyEmployed,
      issuePlace: application.issuePlace,
      lastBook: application.lastBook,
      lastName: application.lastName,
      maritalStatus: application.maritalStatus,
      militaryStatus: application.militaryStatus,
      mobile: application.mobile,
      nationalCode: application.nationalCode,
      nationality: application.nationality,
      plansEmigration: application.plansEmigration,
      plansFurtherStudy: application.plansFurtherStudy,
      readingHabit: application.readingHabit,
      referees: parseRows(application.referees, emptyReferee),
      referralDetail: application.referralDetail,
      referralSource: application.referralSource,
      roleModel: application.roleModel,
      selfPaidTraining: application.selfPaidTraining,
      sonsCount: application.sonsCount,
      specialties: application.specialties,
      spouseJob: application.spouseJob,
      spouseName: application.spouseName,
      spousePhone: application.spousePhone,
      status: application.status,
      trainingCourses: parseRows(
        application.trainingCourses,
        emptyTrainingCourse,
      ),
      traits: application.traits,
      workExperiences: parseRows(
        application.workExperiences,
        emptyWorkExperience,
      ),
    }));
  } catch {
    // The admin can still access the panel while a new database migration is being applied.
  }

  try {
    const managedArticles = await getPrisma().article.findMany({
      orderBy: [{ updatedAt: "desc" }],
      select: {
        categories: { select: { name: true } },
        content: true,
        excerpt: true,
        featuredImage: true,
        id: true,
        metaDescription: true,
        slug: true,
        status: true,
        tags: true,
        title: true,
        type: true,
        translations: {
          select: {
            content: true,
            excerpt: true,
            locale: true,
            metaDescription: true,
            tags: true,
            title: true,
          },
        },
        updatedAt: true,
      },
    });

    articles = managedArticles.map((article) => ({
      categories: article.categories.map((category) => category.name),
      content: article.content,
      excerpt: article.excerpt,
      featuredImage: article.featuredImage,
      id: article.id,
      metaDescription: article.metaDescription,
      slug: article.slug,
      status: article.status,
      tags: article.tags,
      title: article.title,
      type: article.type,
      translations: article.translations,
      updatedAt: article.updatedAt.toISOString(),
    }));
  } catch {
    // The admin can still access the panel while a new database migration is being applied.
  }

  try {
    const managedAnnouncements = await getPrisma().announcement.findMany({
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: {
        description: true,
        id: true,
        isActive: true,
        publishedAt: true,
        title: true,
        translations: {
          select: { description: true, locale: true, title: true },
        },
        updatedAt: true,
      },
    });

    announcements = managedAnnouncements.map((announcement) => ({
      ...announcement,
      publishedAt: announcement.publishedAt.toISOString(),
      updatedAt: announcement.updatedAt.toISOString(),
    }));
  } catch {
    // The admin can still access the panel while a new database migration is being applied.
  }

  return (
    <AdminDashboard
      announcements={announcements}
      articles={articles}
      departments={departments}
      email={session.email}
      galleryMedia={galleryMedia}
      insurances={insurances}
      jobApplications={jobApplications}
      samplingRequests={samplingRequests}
      settings={settings}
      slides={slides}
      testResults={testResults}
      tests={tests}
    />
  );
}
