export type SlideshowSlideData = {
  altText: string;
  id: string;
  imageUrl: string;
  isActive?: boolean;
  sortOrder: number;
  subtitle: string | null;
  title: string | null;
};

export function getDefaultSlideshowSlides(locale: ContentLocale): SlideshowSlideData[] {
  const dictionary = getDictionary(locale);
  const t = (key: string) => translate(dictionary, key);

  return [
  {
    id: "default-lab-slide",
    imageUrl: "/background.png",
    altText: t("defaults.slideAlt"),
    title: t("defaults.slideTitle"),
    subtitle: t("defaults.slideSubtitle"),
    sortOrder: 10,
  },
  ];
}
import type { ContentLocale } from "@/lib/content-locale";
import { getDictionary } from "@/lib/dictionaries";
import { translate } from "@/lib/dictionaries/types";
