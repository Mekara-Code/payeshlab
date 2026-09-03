export type NewsItem = {
  excerpt: string;
  id: string;
  imageUrl: string | null;
  publishedAt: string;
  title: string;
};

export type AnnouncementItem = {
  date: string;
  description: string;
  id: string;
  title: string;
};

export function getDefaultAnnouncements(locale: ContentLocale): AnnouncementItem[] {
  const dictionary = getDictionary(locale);
  const t = (key: string) => translate(dictionary, key);

  return [
  {
    date: "2026-07-27T00:00:00.000Z",
    description: t("defaults.announcementHoursDescription"),
    id: "sample-announcement-hours",
    title: t("defaults.announcementHoursTitle"),
  },
  {
    date: "2026-07-23T00:00:00.000Z",
    description: t("defaults.announcementInsuranceDescription"),
    id: "sample-announcement-insurance",
    title: t("defaults.announcementInsuranceTitle"),
  },
  {
    date: "2026-07-19T00:00:00.000Z",
    description: t("defaults.announcementResultsDescription"),
    id: "sample-announcement-online-results",
    title: t("defaults.announcementResultsTitle"),
  },
  ];
}

export function getDefaultNews(locale: ContentLocale): NewsItem[] {
  const dictionary = getDictionary(locale);
  const t = (key: string) => translate(dictionary, key);

  return [
  {
    excerpt: t("defaults.newsPreparationDescription"),
    id: "sample-news-preparation",
    imageUrl: "/background-hq.png",
    publishedAt: "2026-07-25T00:00:00.000Z",
    title: t("defaults.newsPreparationTitle"),
  },
  {
    excerpt: t("defaults.newsQualityDescription"),
    id: "sample-news-quality",
    imageUrl: "/background.png",
    publishedAt: "2026-07-18T00:00:00.000Z",
    title: t("defaults.newsQualityTitle"),
  },
  {
    excerpt: t("defaults.newsResultsDescription"),
    id: "sample-news-online-results",
    imageUrl: "/background-hq.png",
    publishedAt: "2026-07-12T00:00:00.000Z",
    title: t("defaults.newsResultsTitle"),
  },
  ];
}
import type { ContentLocale } from "@/lib/content-locale";
import { getDictionary } from "@/lib/dictionaries";
import { translate } from "@/lib/dictionaries/types";
