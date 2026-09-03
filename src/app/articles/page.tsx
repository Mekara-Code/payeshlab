import { ArticlesMagazineHero } from "@/components/articles/articles-magazine-hero";
import { PayeshArticles } from "@/components/home/payesh-articles";
import { SiteNavigation } from "@/components/navigation/site-navigation";
import { getSelectedContentLocale } from "@/lib/content-locale-server";
import { getDictionary } from "@/lib/dictionaries";
import { translate } from "@/lib/dictionaries/types";
import { createSeoMetadata } from "@/lib/seo";
import { SiteFooter } from "@/components/site-footer";
import { getPublishedArticles } from "@/lib/public-articles";
import { getSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getSelectedContentLocale();
  const dictionary = getDictionary(locale);

  return createSeoMetadata({
    description: translate(dictionary, "seo.articlesDescription"),
    keywords: dictionary["seo.keywords"].split(",").map((keyword) => keyword.trim()),
    locale,
    path: "/articles",
    title: translate(dictionary, "seo.articlesTitle"),
  });
}

export default async function ArticlesPage() {
  const locale = await getSelectedContentLocale();
  const [articles, settings] = await Promise.all([
    getPublishedArticles(48, locale),
    getSiteSettings(),
  ]);
  const dictionary = getDictionary(locale);
  const t = (key: string, values?: Record<string, number | string>) => translate(dictionary, key, values);
  const articleCount = new Intl.NumberFormat(locale === "fa" ? "fa-IR" : locale === "ar" ? "ar" : "en-US").format(articles.length);

  return (
    <main className="min-h-dvh bg-[#f7fbfb] text-slate-950">
      <SiteNavigation />
      <h1 className="sr-only">{t("articles.title")}</h1>

      <ArticlesMagazineHero articles={articles.slice(0, 5)} />

      <section
        aria-labelledby="magazine-overview-title"
        className="bg-white px-5 py-14 sm:px-10 sm:py-20 lg:px-20 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end lg:gap-16">
          <div>
            <span className="inline-flex rounded-full bg-teal-500/10 px-4 py-2 text-sm font-extrabold text-teal-500">
              {t("articles.badge")}
            </span>
            <h2
              className="mt-5 max-w-xl text-3xl font-black leading-[1.3] tracking-[-0.055em] text-slate-950 sm:text-4xl"
              id="magazine-overview-title"
            >
              {t("articles.overviewHeading")}
            </h2>
            <p className="mt-5 max-w-xl text-sm font-medium leading-8 text-slate-600 sm:text-base">
              {t("articles.overviewDescription")}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-tr-[2.5rem] bg-teal-50 p-5 sm:p-6">
              <span className="font-mono text-xs font-bold text-teal-500">01</span>
              <h3 className="mt-7 text-base font-black text-slate-950">
                {t("articles.practicalTitle")}
              </h3>
              <p className="mt-2 text-xs font-medium leading-6 text-slate-600">
                {t("articles.practicalDescription")}
              </p>
            </article>
            <article className="rounded-tl-[2.5rem] bg-slate-950 p-5 text-white sm:p-6">
              <span className="font-mono text-xs font-bold text-teal-200">02</span>
              <h3 className="mt-7 text-base font-black">{t("articles.expertTitle")}</h3>
              <p className="mt-2 text-xs font-medium leading-6 text-slate-300">
                {t("articles.expertDescription")}
              </p>
            </article>
            <article className="rounded-bl-[2.5rem] bg-teal-500 p-5 text-white sm:p-6">
              <span className="font-mono text-xs font-bold text-teal-100">03</span>
              <h3 className="mt-7 text-base font-black">{t("articles.archiveTitle")}</h3>
              <p className="mt-2 text-xs font-medium leading-6 text-teal-50">
                {t("articles.archiveDescription", { count: articleCount })}
              </p>
            </article>
          </div>
        </div>
      </section>

      <PayeshArticles
        articleTitleOrbs
        articles={articles}
        maxArticles={articles.length}
        showAllLink={false}
        title={t("articles.allTitle")}
      />
      <SiteFooter settings={settings} />
    </main>
  );
}
import type { Metadata } from "next";
