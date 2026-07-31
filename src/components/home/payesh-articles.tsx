/* eslint-disable @next/next/no-img-element -- Article images are administrator-configured URLs. */

import Link from "next/link";
import { ArticleTitleOrbs } from "@/components/decorative/article-title-orbs";
import { AtmosphereOrbs } from "@/components/decorative/atmosphere-orbs";
import type { PublicArticle } from "@/lib/public-articles";

function formatPersianDate(dateValue: string) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateValue));
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={`size-5 ${className}`} fill="none" viewBox="0 0 24 24">
      <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function articleTileClass(index: number) {
  const tilePosition = index % 4;
  const roundedCorner = ["rounded-tr-4xl", "rounded-tl-4xl", "rounded-br-4xl", "rounded-bl-4xl"][tilePosition];
  const spanClass = tilePosition === 0 || tilePosition === 3 ? "sm:col-span-2" : "";

  return `rounded-sm ${roundedCorner} ${spanClass}`;
}

type PayeshArticlesProps = {
  articles: PublicArticle[];
  articleTitleOrbs?: boolean;
  maxArticles?: number;
  showAllLink?: boolean;
  title?: string;
};

export function PayeshArticles({ articleTitleOrbs = false, articles, maxArticles = 4, showAllLink = true, title = "مجله پایش" }: PayeshArticlesProps) {
  const visibleArticles = articles.slice(0, maxArticles);

  return (
    <section aria-labelledby="payesh-articles-title" className="scroll-mt-28 bg-white px-5 py-16 sm:px-10 sm:py-20 lg:px-20 lg:py-28" id="articles">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative isolate max-w-2xl overflow-hidden">
            <AtmosphereOrbs className="absolute -right-8 -top-7 h-28 w-48 opacity-40 sm:h-36 sm:w-60" scale={1.08} />
            <div className="relative z-10">
              <span className="inline-flex rounded-full bg-teal-500/10 px-4 py-2 text-sm font-extrabold text-teal-500">دانش برای سلامت</span>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl" id="payesh-articles-title">{title}</h2>
              <p className="mt-3 text-sm font-medium leading-7 text-slate-600 sm:text-base">تازه‌ترین راهنمایی‌ها و نکته‌های کاربردی آزمایشگاه پایش، برای انتخاب‌های آگاهانه‌تر در مسیر سلامت.</p>
            </div>
          </div>
          {showAllLink ? (
            <Link className="group inline-flex min-h-12 w-fit items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-teal-500 transition-[background-color,color,transform] duration-200 hover:-translate-y-0.5 hover:bg-teal-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 active:translate-y-0" href="/articles">
              مشاهده همه مقالات
              <ArrowIcon className="transition-transform duration-200 group-hover:-translate-x-1 motion-reduce:transition-none" />
            </Link>
          ) : null}
        </div>

        <div className="grid auto-rows-[14.5rem] grid-cols-1 gap-3 sm:auto-rows-[15rem] sm:grid-cols-2 sm:gap-4 lg:auto-rows-[21rem] lg:grid-cols-3 lg:gap-5">
          {visibleArticles.map((article, index) => (
            <article className={`group relative min-h-0 overflow-hidden ${articleTileClass(index)}`} key={article.id}>
              <img alt={article.title} className="absolute inset-0 size-full object-cover transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:scale-[1.03] trantion-colors motion-reduce:group-hover:scale-100" decoding="async" loading="lazy" src={article.imageUrl ?? "/background-hq.png"} />
              <div className="relative flex h-full flex-col justify-between text-white ">
                <div className="flex items-start justify-between gap-3">
                  <span className="m-4 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-extrabold text-white/90 backdrop-blur-sm">مقالهٔ پایش</span>
                  <time className="m-4 text-left text-[11px] font-extrabold text-white [text-shadow:0_1px_5px_rgb(15_23_42_/_0.9)]" dateTime={article.publishedAt}>{formatPersianDate(article.publishedAt)}</time>
                </div>
                <div className="relative overflow-hidden bg-teal-500 p-4">
                  {articleTitleOrbs ? <ArticleTitleOrbs /> : null}
                  <div className="relative z-10">
                    <h3 className={`font-black leading-6 tracking-[-0.03em] ${index % 4 === 0 ? "text-xl sm:text-2xl sm:leading-8" : index % 4 === 3 ? "text-base sm:text-lg sm:leading-7" : "text-sm sm:text-base"}`}>{article.title}</h3>
                    {index % 4 === 0 || index % 4 === 3 ? <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-white sm:text-sm sm:leading-6">{article.excerpt}</p> : null}
                  </div>
                </div>
              </div>
              <Link
                aria-label={`مطالعهٔ مقالهٔ ${article.title}`}
                className="absolute inset-0 z-20 rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
                href={`/articles/${article.slug}`}
              >
                <span className="sr-only">مطالعهٔ مقالهٔ {article.title}</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
