import { HeroStatistics } from "@/components/hero/hero-content";
import { HomeSlideshow } from "@/components/hero/home-slideshow";
import { InsuranceSlider } from "@/components/hero/insurance-slider";
import { LabDepartments } from "@/components/home/lab-departments";
import { HomeSampleCollection } from "@/components/home/home-sample-collection";
import { NewsAndAnnouncements } from "@/components/home/news-and-announcements";
import { PayeshArticles } from "@/components/home/payesh-articles";
import { SiteFooter } from "@/components/site-footer";
import { LocalBusinessJsonLd } from "@/components/seo/local-business-json-ld";
import { SiteNavigation } from "@/components/navigation/site-navigation";
import { ScrollScene } from "@/components/motion/scroll-scene";
import { StaggerItem, StaggerScene } from "@/components/motion/stagger-scene";
import { defaultInsurances, type InsurancePartner } from "@/lib/insurance-data";
import { getDefaultLabDepartments, type LabDepartmentData } from "@/lib/lab-department-data";
import {
  getDefaultAnnouncements,
  getDefaultNews,
  type AnnouncementItem,
  type NewsItem,
} from "@/lib/news-data";
import { getPrisma } from "@/lib/prisma";
import { getPublishedArticles } from "@/lib/public-articles";
import { getSelectedContentLocale } from "@/lib/content-locale-server";
import { getDictionary } from "@/lib/dictionaries";
import { translate } from "@/lib/dictionaries/types";
import { createSeoMetadata } from "@/lib/seo";
import {
  toDatabaseContentLocale,
  type ContentLocale,
} from "@/lib/content-locale";
import { getDefaultSlideshowSlides, type SlideshowSlideData } from "@/lib/slideshow-data";
import { getSiteSettings } from "@/lib/site-settings";
import { formatWorkingHourRange } from "@/lib/working-hours";

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

async function getHomepageSlides(locale: ContentLocale): Promise<SlideshowSlideData[]> {
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

    return slides.length > 0 ? slides : getDefaultSlideshowSlides(locale);
  } catch {
    return getDefaultSlideshowSlides(locale);
  }
}

async function getHomepageDepartments(locale: ContentLocale): Promise<LabDepartmentData[]> {
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

    return departments.length > 0 ? departments : getDefaultLabDepartments(locale);
  } catch {
    return getDefaultLabDepartments(locale);
  }
}

async function getHomepageNews(locale: ContentLocale): Promise<NewsItem[]> {
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
        translations: {
          select: { excerpt: true, title: true },
          where: { locale: toDatabaseContentLocale(locale) },
        },
      },
      take: 8,
      where: { status: "PUBLISHED", type: "NEWS" },
    });

    const news = articles.map((article) => {
      const translation = article.translations[0];
      return {
      excerpt:
        translation?.excerpt ??
        article.excerpt ??
        translate(getDictionary(locale), "defaults.newsExcerpt"),
      id: article.id,
      imageUrl: article.featuredImage,
      publishedAt: (article.publishedAt ?? article.createdAt).toISOString(),
      title: translation?.title ?? article.title,
    };
    });

    return news.length > 0 ? news : getDefaultNews(locale);
  } catch {
    return getDefaultNews(locale);
  }
}

async function getHomepageAnnouncements(
  locale: ContentLocale,
): Promise<AnnouncementItem[]> {
  try {
    const announcements = await getPrisma().announcement.findMany({
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: {
        description: true,
        id: true,
        publishedAt: true,
        title: true,
        translations: {
          select: { description: true, title: true },
          where: { locale: toDatabaseContentLocale(locale) },
        },
      },
      take: 8,
      where: { isActive: true },
    });

    return announcements.length > 0
      ? announcements.map((announcement) => {
          const translation = announcement.translations[0];
          return {
          date: announcement.publishedAt.toISOString(),
          description: translation?.description ?? announcement.description,
          id: announcement.id,
          title: translation?.title ?? announcement.title,
        };
        })
      : getDefaultAnnouncements(locale);
  } catch {
    return getDefaultAnnouncements(locale);
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getSelectedContentLocale();
  const dictionary = getDictionary(locale);

  return createSeoMetadata({
    description: translate(dictionary, "seo.homeDescription"),
    keywords: dictionary["seo.keywords"].split(",").map((keyword) => keyword.trim()),
    locale,
    path: "/",
    title: translate(dictionary, "seo.homeTitle"),
  });
}

export default async function Home() {
  const locale = await getSelectedContentLocale();
  const dictionary = getDictionary(locale);
  const t = (key: string) => translate(dictionary, key);
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
    getHomepageSlides(locale),
    getHomepageDepartments(locale),
    getHomepageNews(locale),
    getHomepageAnnouncements(locale),
    getPublishedArticles(8, locale),
    getSiteSettings(),
  ]);
  const heroContactDetails = {
    addresses: settings.addresses.map(({ address, id, title }) => ({
      address,
      id,
      title,
    })),
    workingHours: settings.workingHours.map((workingHour) => ({
      id: workingHour.id,
      label: formatWorkingHourRange(workingHour, locale),
    })),
  };

  return (
    <main className="relative bg-[#f7fbfb]" id="home">
      <LocalBusinessJsonLd settings={settings} />
      <a
        className="sr-only fixed left-4 top-4 z-[60] rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white focus:not-sr-only focus:outline-2 focus:outline-offset-4 focus:outline-teal-400"
        href="#main-content"
      >
        {t("skipNavigation")}
      </a>
      <SiteNavigation />
      <HomeSlideshow contactDetails={heroContactDetails} slides={slides} />

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

          <section className="mx-auto mt-14 max-w-4xl rounded-[2rem] border border-teal-100 bg-[#f7fbfb] px-6 py-8 text-center sm:mt-16 sm:px-10 sm:py-10">
            <h2 className="text-2xl font-black leading-9 tracking-[-0.05em] text-slate-950 sm:text-3xl">
              {t("seo.homeContentTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-sm font-medium leading-8 text-slate-600 sm:text-base">
              {t("seo.homeContentDescription")}
            </p>
          </section>

          <StaggerScene className="mt-14 border-t border-teal-100 pt-12 sm:mt-16 sm:pt-14">
            <StaggerItem className="mb-7 text-center sm:mb-9">
              <span className="inline-flex rounded-full bg-teal-500/10 px-4 py-2 text-sm font-extrabold text-teal-500">
                {t("stats.badge")}
              </span>
              <h3 className="mt-4 text-2xl font-black tracking-[-0.05em] text-slate-950 sm:text-3xl">
                {t("stats.label")}
              </h3>
            </StaggerItem>
            <StaggerItem>
              <HeroStatistics />
            </StaggerItem>
          </StaggerScene>
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
import type { Metadata } from "next";
