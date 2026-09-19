/* eslint-disable @next/next/no-img-element -- The optional cover image is administrator-configured. */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody, getPlainText } from "@/components/articles/article-body";
import { SiteNavigation } from "@/components/navigation/site-navigation";
import { PreparationGrid } from "@/components/preparations/preparation-grid";
import { PreparationJsonLd } from "@/components/seo/preparation-json-ld";
import { SiteFooter } from "@/components/site-footer";
import type { ContentLocale } from "@/lib/content-locale";
import { getSelectedContentLocale } from "@/lib/content-locale-server";
import { getDictionary } from "@/lib/dictionaries";
import { translate } from "@/lib/dictionaries/types";
import {
  getPublishedPreparationBySlug,
  getPublishedPreparations,
  getPublishedPreparationSlugs,
  type PublicArticleBlock,
} from "@/lib/public-articles";
import { createSeoMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/site-settings";

type PreparationPageProps = {
  params: Promise<{ slug: string }>;
};

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path d="M19 12H5m6-6-6 6 6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <rect height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" width="16" x="4" y="5" />
      <path d="M8 3v4m8-4v4M4 10h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.8v4.5l3 1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path d="m20 13-7 7L4 11V4h7l9 9Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="8.5" cy="8.5" fill="currentColor" r="1.1" />
    </svg>
  );
}

function formatDate(value: string, locale: ContentLocale) {
  const languageTag =
    locale === "fa"
      ? "fa-IR-u-ca-persian"
      : locale === "ar"
        ? "ar-SA-u-ca-gregory"
        : "en-US";

  return new Intl.DateTimeFormat(languageTag, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function normalizeSlug(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getReadingTime(blocks: PublicArticleBlock[]) {
  const words = blocks.reduce(
    (total, block) => total + getPlainText(block.content).split(/\s+/).filter(Boolean).length,
    0,
  );

  return Math.max(2, Math.ceil(words / 180));
}

export async function generateStaticParams() {
  const slugs = await getPublishedPreparationSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PreparationPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);
  const locale = await getSelectedContentLocale();
  const dictionary = getDictionary(locale);
  const preparation = await getPublishedPreparationBySlug(slug, locale);

  if (!preparation) {
    return {
      robots: { follow: false, index: false },
      title: translate(dictionary, "preparation.notFoundTitle"),
    };
  }

  return createSeoMetadata({
    description:
      preparation.metaDescription ||
      preparation.excerpt ||
      translate(dictionary, "seo.preparationDescription"),
    image: preparation.imageUrl,
    keywords: [
      ...dictionary["seo.keywords"].split(",").map((keyword) => keyword.trim()),
      translate(dictionary, "preparation.listTitle"),
      ...preparation.tags,
    ],
    locale,
    path: `/test-preparation/${encodeURIComponent(preparation.slug)}`,
    title: translate(dictionary, "preparation.detailMetaTitle", {
      title: preparation.title,
    }),
    type: "article",
  });
}

export default async function TestPreparationDetailPage({ params }: PreparationPageProps) {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);
  const locale = await getSelectedContentLocale();
  const [preparation, archive, settings] = await Promise.all([
    getPublishedPreparationBySlug(slug, locale),
    getPublishedPreparations(1, locale, 4),
    getSiteSettings(),
  ]);

  if (!preparation) notFound();

  const dictionary = getDictionary(locale);
  const t = (key: string, values?: Record<string, number | string>) =>
    translate(dictionary, key, values);
  const readingTime = getReadingTime(preparation.content);
  const relatedPreparations = archive.items
    .filter((item) => item.slug !== preparation.slug)
    .slice(0, 3);

  return (
    <main className="min-h-dvh bg-[#f7fbfb] text-slate-950">
      <PreparationJsonLd
        homeLabel={t("preparation.breadcrumbHome")}
        listLabel={t("preparation.listTitle")}
        preparation={preparation}
      />
      <SiteNavigation />

      <article>
        <header className="overflow-hidden bg-[#edf9f8] px-5 pb-14 pt-28 sm:px-10 sm:pb-20 sm:pt-36 lg:px-20 lg:pb-24">
          <div className="mx-auto max-w-7xl">
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl px-4 text-sm font-extrabold text-teal-500 transition hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal-500"
              href="/test-preparation"
            >
              <ArrowIcon />
              {t("preparation.back")}
            </Link>

            <div className="mt-8 grid items-end gap-10 lg:mt-12 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] lg:gap-16">
              <div className="max-w-3xl">
                <span className="inline-flex rounded-full bg-teal-500 px-4 py-2 text-sm font-extrabold text-white">
                  {t("preparation.badge")}
                </span>
                <h1 className="mt-5 text-4xl font-black leading-[1.3] tracking-[-0.06em] text-slate-950 sm:text-5xl lg:text-6xl">
                  {preparation.title}
                </h1>
                {preparation.excerpt ? (
                  <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-slate-600 sm:text-lg sm:leading-9">
                    {preparation.excerpt}
                  </p>
                ) : null}
                <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-bold text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <CalendarIcon />
                    <time dateTime={preparation.publishedAt.slice(0, 10)}>
                      {formatDate(preparation.publishedAt, locale)}
                    </time>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <ClockIcon />
                    {t("preparation.readingTime", { minutes: readingTime })}
                  </span>
                </div>
              </div>

              {preparation.imageUrl ? (
                <figure className="relative aspect-[4/3] overflow-hidden rounded-tr-[4rem] rounded-bl-[4rem] bg-teal-100 sm:rounded-tr-[5rem] sm:rounded-bl-[5rem]">
                  <img
                    alt={preparation.title}
                    className="size-full object-cover"
                    decoding="async"
                    fetchPriority="high"
                    src={preparation.imageUrl}
                  />
                </figure>
              ) : (
                <div className="grid aspect-[4/3] place-items-center rounded-tr-[4rem] rounded-bl-[4rem] bg-teal-100 text-teal-500 sm:rounded-tr-[5rem] sm:rounded-bl-[5rem]">
                  <svg aria-hidden="true" className="size-20" fill="none" viewBox="0 0 24 24">
                    <path d="M9 3h6M10 3v6.1L5.6 17a2.5 2.5 0 0 0 2.2 3.7h8.4a2.5 2.5 0 0 0 2.2-3.7L14 9.1V3M8.5 15h7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="bg-white px-5 py-14 sm:px-10 sm:py-20 lg:px-20 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 2xl:grid-cols-[minmax(0,1fr)_17rem] 2xl:gap-16">
            <div className="mx-auto w-full min-w-0 max-w-[56rem] 2xl:mx-0 2xl:max-w-none">
              {preparation.excerpt ? (
                <p className="mb-10 rounded-tr-[2.5rem] rounded-bl-[2.5rem] bg-slate-50 px-6 py-6 text-base font-extrabold leading-8 text-slate-800 sm:mb-12 sm:px-8 sm:py-7 sm:text-lg">
                  {preparation.excerpt}
                </p>
              ) : null}
              <ArticleBody blocks={preparation.content} />
            </div>

            <aside className="mx-auto h-fit w-full max-w-[56rem] 2xl:sticky 2xl:top-28 2xl:order-2 2xl:mx-0 2xl:max-w-none">
              <div className="rounded-tl-[2.5rem] rounded-br-[2.5rem] bg-teal-50 p-6 sm:p-7">
                <p className="text-xs font-black tracking-wide text-teal-500">
                  {t("preparation.inThisGuide")}
                </p>
                <div className="mt-5 grid gap-4 text-sm font-bold text-slate-700">
                  <span className="inline-flex items-center gap-2 text-teal-500">
                    <ClockIcon />
                    {t("preparation.readingTime", { minutes: readingTime })}
                  </span>
                  {preparation.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {preparation.tags.map((tag) => (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-teal-500"
                          key={tag}
                        >
                          <TagIcon />
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <Link
                  className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-teal-500 px-4 text-sm font-extrabold text-white transition hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal-500"
                  href="/contact"
                >
                  {t("preparation.contactCta")}
                  <ArrowIcon />
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </article>

      {relatedPreparations.length > 0 ? (
        <section
          aria-labelledby="more-preparations-title"
          className="bg-[#f7fbfb] px-5 py-14 sm:px-10 sm:py-20 lg:px-20 lg:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <h2
              className="text-2xl font-black tracking-[-0.05em] text-slate-950 sm:text-3xl"
              id="more-preparations-title"
            >
              {t("preparation.more")}
            </h2>
            <div className="mt-8">
              <PreparationGrid
                items={relatedPreparations}
                locale={locale}
                readCta={t("preparation.readCta")}
                readLabel={(itemTitle) => t("preparation.read", { title: itemTitle })}
              />
            </div>
          </div>
        </section>
      ) : null}

      <SiteFooter settings={settings} />
    </main>
  );
}
