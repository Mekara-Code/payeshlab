export type SlideshowSlideData = {
  altText: string;
  id: string;
  imageUrl: string;
  isActive?: boolean;
  sortOrder: number;
  subtitle: string | null;
  title: string | null;
};

export const defaultSlideshowSlides: SlideshowSlideData[] = [
  {
    id: "default-lab-slide",
    imageUrl: "/background.png",
    altText: "محیط آزمایشگاه پایش",
    title: "دقت امروز، سلامت فردا",
    subtitle: "آزمایش‌های تخصصی با استانداردهای جهانی، تیمی متعهد و پاسخ‌دهی آنلاین.",
    sortOrder: 10,
  },
];
