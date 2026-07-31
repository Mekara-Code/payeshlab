import { HeroStatistics } from "@/components/hero/hero-content";
import { HomeSlideshow } from "@/components/hero/home-slideshow";
import { InsuranceSlider } from "@/components/hero/insurance-slider";
import { LabDepartments } from "@/components/home/lab-departments";
import { HomeSampleCollection } from "@/components/home/home-sample-collection";
import { NewsAndAnnouncements } from "@/components/home/news-and-announcements";
import { PayeshArticles } from "@/components/home/payesh-articles";
import { SiteFooter } from "@/components/site-footer";
import { SidebarNavigation } from "@/components/navigation/sidebar-navigation";
import { ScrollScene } from "@/components/motion/scroll-scene";
import { defaultInsurances, type InsurancePartner } from "@/lib/insurance-data";
import {
  defaultLabDepartments,
  type LabDepartmentData,
} from "@/lib/lab-department-data";
import {
  defaultAnnouncements,
  defaultNews,
  type AnnouncementItem,
  type NewsItem,
} from "@/lib/news-data";
import { getPrisma } from "@/lib/prisma";
import { getPublishedArticles } from "@/lib/public-articles";
import {
  defaultSlideshowSlides,
  type SlideshowSlideData,
} from "@/lib/slideshow-data";
import { getSiteSettings } from "@/lib/site-settings";

async function getHomepageInsurances(): Promise<InsurancePartner[]> {
  try {
    const insurances = await getPrisma().insurance.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        logoUrl: true,
        name: true,
        slug: true,
        sortOrder: true,
      },
      where: { isActive: true },
    });

    return insurances.length > 0 ? insurances : defaultInsurances;
  } catch {
    return defaultInsurances;
  }
}

async function getHomepageSlides(): Promise<SlideshowSlideData[]> {
  try {
    const slides = await getPrisma().slideshowSlide.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        altText: true,
        id: true,
        imageUrl: true,
        sortOrder: true,
        subtitle: true,
        title: true,
      },
      where: { isActive: true },
    });

    return slides.length > 0 ? slides : defaultSlideshowSlides;
  } catch {
    return defaultSlideshowSlides;
  }
}

async function getHomepageDepartments(): Promise<LabDepartmentData[]> {
  try {
    const departments = await getPrisma().labDepartment.findMany({
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: {
        description: true,
        id: true,
        imageUrl: true,
        sortOrder: true,
        title: true,
      },
      where: { isActive: true },
    });

    return departments.length > 0 ? departments : defaultLabDepartments;
  } catch {
    return defaultLabDepartments;
  }
}

async function getHomepageNews(): Promise<NewsItem[]> {
  try {
    const articles = await getPrisma().article.findMany({
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: {
        createdAt: true,
        excerpt: true,
        featuredImage: true,
        id: true,
        publishedAt: true,
        title: true,
      },
      take: 8,
      where: { status: "PUBLISHED", type: "NEWS" },
    });

    const news = articles.map((article) => ({
      excerpt:
        article.excerpt ??
        "آخرین جزئیات و اطلاعات موردنیاز را در این خبر بخوانید.",
      id: article.id,
      imageUrl: article.featuredImage,
      publishedAt: (article.publishedAt ?? article.createdAt).toISOString(),
      title: article.title,
    }));

    return news.length > 0 ? news : defaultNews;
  } catch {
    return defaultNews;
  }
}

async function getHomepageAnnouncements(): Promise<AnnouncementItem[]> {
  try {
    const announcements = await getPrisma().announcement.findMany({
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: { description: true, id: true, publishedAt: true, title: true },
      take: 8,
      where: { isActive: true },
    });

    return announcements.length > 0
      ? announcements.map((announcement) => ({
          date: announcement.publishedAt.toISOString(),
          description: announcement.description,
          id: announcement.id,
          title: announcement.title,
        }))
      : defaultAnnouncements;
  } catch {
    return defaultAnnouncements;
  }
}

export default async function Home() {
  const [
    insurances,
    slides,
    departments,
    news,
    announcements,
    articles,
    settings,
  ] = await Promise.all([
    getHomepageInsurances(),
    getHomepageSlides(),
    getHomepageDepartments(),
    getHomepageNews(),
    getHomepageAnnouncements(),
    getPublishedArticles(),
    getSiteSettings(),
  ]);

  return (
    <main className="relative bg-[#f7fbfb]" id="home">
      <a
        className="sr-only fixed left-4 top-4 z-[60] rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white focus:not-sr-only focus:outline-2 focus:outline-offset-4 focus:outline-teal-400"
        href="#main-content"
      >
        عبور از ناوبری
      </a>
      <SidebarNavigation />
      <HomeSlideshow slides={slides} />

      <section
        className="bg-white px-5 py-16 sm:px-10 sm:py-20 lg:px-20 lg:py-28"
        id="lab-intro"
      >
        <div className="mx-auto max-w-5xl">
          <ScrollScene distance={24}>
            <InsuranceSlider insurances={insurances} />
          </ScrollScene>
          <ScrollScene distance={42}>
            <LabDepartments departments={departments} />
          </ScrollScene>

          <div className="mt-14 border-t border-teal-100 pt-12 sm:mt-16 sm:pt-14">
            <div className="mb-7 text-center sm:mb-9">
              <span className="inline-flex rounded-full bg-teal-500/10 px-4 py-2 text-sm font-extrabold text-teal-500">
                پایش در یک نگاه
              </span>
              <h3 className="mt-4 text-2xl font-black tracking-[-0.05em] text-slate-950 sm:text-3xl">
                آمار آزمایشگاه
              </h3>
            </div>
            <HeroStatistics />
          </div>
          <HomeSampleCollection />
        </div>
      </section>
      <ScrollScene direction="down" distance={42}>
        <NewsAndAnnouncements announcements={announcements} news={news} />
      </ScrollScene>
      <ScrollScene distance={42}>
        <PayeshArticles articleTitleOrbs articles={articles} />
      </ScrollScene>
      <SiteFooter settings={settings} />
    </main>
  );
}
