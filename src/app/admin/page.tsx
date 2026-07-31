import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import type { ManagedAnnouncement } from "@/components/admin/announcement-manager";
import type { ManagedArticle } from "@/components/admin/article-editor";
import { getAdminSession } from "@/lib/admin-session";
import type { InsurancePartner } from "@/lib/insurance-data";
import type { LabDepartmentData } from "@/lib/lab-department-data";
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
  let articles: Array<ManagedArticle & { type: "ARTICLE" | "NEWS" }> = [];
  let announcements: ManagedAnnouncement[] = [];
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
      insurances={insurances}
      settings={settings}
      slides={slides}
    />
  );
}
