/* eslint-disable @next/next/no-img-element -- The optional cover image is administrator-configured. */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/articles/article-body";
import { SiteNavigation } from "@/components/navigation/site-navigation";
import { SiteFooter } from "@/components/site-footer";
import { getSelectedContentLocale } from "@/lib/content-locale-server";
import { getDictionary } from "@/lib/dictionaries";
import { translate } from "@/lib/dictionaries/types";
import { getPublishedTestPreparation } from "@/lib/public-articles";
import { createSeoMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/site-settings";

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M19 12H5m6-6-6 6 6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getSelectedContentLocale();
  const dictionary = getDictionary(locale);
  const preparation = await getPublishedTestPreparation(locale);

  if (!preparation) {
    return {
      robots: { follow: false, index: false },
      title: translate(dictionary, "preparation.metaTitle"),
    };
  }

  return createSeoMetadata({
    description:
      preparation.metaDescription ??
      preparation.excerpt ??
      translate(dictionary, "preparation.metaDescription"),
    image: preparation.imageUrl,
    keywords: [
      ...dictionary["seo.keywords"].split(",").map((keyword) => keyword.trim()),
      ...preparation.tags,
    ],
    locale,
    path: "/test-preparation",
    title: preparation.title,
    type: "article",
  });
}

export default async function TestPreparationPage() {
  const locale = await getSelectedContentLocale();
  const [preparation, settings] = await Promise.all([
    getPublishedTestPreparation(locale),
    getSiteSettings(),
  ]);

  if (!preparation) notFound();

  const dictionary = getDictionary(locale);
  const t = (key: string) => translate(dictionary, key);

  return (
    <main className="min-h-dvh bg-[#f7fbfb] text-slate-950">
      <SiteNavigation />

      <article>
        <header className="bg-[#edf9f8] px-5 pb-14 pt-28 sm:px-10 sm:pb-20 sm:pt-36 lg:px-20 lg:pb-24">
          <div className="mx-auto max-w-6xl">
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl px-4 text-sm font-extrabold text-teal-500 transition hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal-500"
              href="/"
            >
              <ArrowIcon />
              {t("preparation.backHome")}
            </Link>

            <div className="mt-9 grid items-center gap-10 lg:mt-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] lg:gap-16">
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
          <div className="mx-auto w-full max-w-[56rem]">
            {preparation.excerpt ? (
              <p className="mb-10 rounded-tr-[2.5rem] rounded-bl-[2.5rem] bg-slate-50 px-6 py-6 text-base font-extrabold leading-8 text-slate-800 sm:mb-12 sm:px-8 sm:py-7 sm:text-lg">
                {preparation.excerpt}
              </p>
            ) : null}
            <ArticleBody blocks={preparation.content} />
          </div>
        </section>
      </article>

      <SiteFooter settings={settings} />
    </main>
  );
}
