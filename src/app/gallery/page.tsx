import type { Metadata } from "next";
import { MediaGallery } from "@/components/gallery/media-gallery";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavigation } from "@/components/navigation/site-navigation";
import { getSelectedContentLocale } from "@/lib/content-locale-server";
import { getDictionary } from "@/lib/dictionaries";
import { translate } from "@/lib/dictionaries/types";
import { getPublishedGalleryMedia } from "@/lib/gallery-data";
import { createSeoMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/site-settings";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getSelectedContentLocale();
  const dictionary = getDictionary(locale);
  return createSeoMetadata({
    description: translate(dictionary, "seo.galleryDescription"),
    keywords: dictionary["seo.keywords"].split(",").map((keyword) => keyword.trim()),
    locale,
    path: "/gallery",
    title: translate(dictionary, "seo.galleryTitle"),
  });
}

export default async function GalleryPage() {
  const [locale, settings, items] = await Promise.all([
    getSelectedContentLocale(),
    getSiteSettings(),
    getPublishedGalleryMedia(),
  ]);
  const dictionary = getDictionary(locale);
  const t = (key: string) => translate(dictionary, key);

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#f7fbfb] text-slate-950">
      <SiteNavigation />
      <section className="relative isolate overflow-hidden px-5 pb-10 pt-32 sm:px-10 sm:pb-14 sm:pt-40 lg:px-20 lg:pb-16 lg:pt-44">
        <div aria-hidden="true" className="absolute -right-32 top-2 -z-10 size-[29rem] rounded-full bg-teal-200/55 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-52 -left-32 -z-10 size-[31rem] rounded-full bg-cyan-100/65 blur-3xl" />
        <div className="mx-auto max-w-7xl">
          <span className="inline-flex rounded-full border border-teal-200 bg-white/85 px-4 py-2 text-xs font-extrabold tracking-wide text-teal-700 shadow-sm">{t("gallery.badge")}</span>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.18] tracking-[-0.06em] text-slate-950 sm:text-5xl lg:text-6xl">{t("gallery.title")}</h1>
          <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-600 sm:text-lg">{t("gallery.description")}</p>
        </div>
      </section>
      <MediaGallery copy={{ all: t("gallery.all"), close: t("gallery.close"), count: t("gallery.count"), emptyDescription: t("gallery.emptyDescription"), emptyTitle: t("gallery.emptyTitle"), images: t("gallery.images"), openMedia: t("gallery.openMedia"), video: t("gallery.video"), videos: t("gallery.videos") }} items={items} />
      <SiteFooter settings={settings} />
    </main>
  );
}
