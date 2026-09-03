"use client";

/* eslint-disable @next/next/no-img-element -- Article images can be configured from the administrator dashboard. */

import Link from "next/link";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import { useReducedMotion } from "framer-motion";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useTranslations } from "@/components/i18n/dictionary-provider";
import type { PublicArticle } from "@/lib/public-articles";

function formatDate(dateValue: string, locale: "ar" | "en" | "fa") {
  const languageTag = locale === "fa" ? "fa-IR-u-ca-persian" : locale === "ar" ? "ar-SA-u-ca-gregory" : "en-US";

  return new Intl.DateTimeFormat(languageTag, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateValue));
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
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

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <rect
        height="15"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
        width="16"
        x="4"
        y="5"
      />
      <path
        d="M8 3v4m8-4v4M4 10h16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function ArticlesMagazineHero({
  articles,
}: {
  articles: PublicArticle[];
}) {
  const shouldReduceMotion = useReducedMotion();
  const { locale, t } = useTranslations();

  if (articles.length === 0) return null;

  return (
    <section
      aria-label={t("articles.featuredList")}
      className="magazine-hero bg-[#f7fbfb] px-5 pb-1 pt-28 sm:px-10 sm:pt-32 lg:px-20 lg:pt-36"
      id="main-content"
      tabIndex={-1}
    >
      <Swiper
        autoplay={
          shouldReduceMotion
            ? false
            : {
                delay: 5600,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
        }
        className="mx-auto min-h-[38rem] max-w-7xl overflow-hidden rounded-2xl bg-white sm:min-h-[39rem] lg:min-h-[35rem]"
        effect="fade"
        loop={articles.length > 1}
        modules={[Autoplay, EffectFade, Pagination]}
        pagination={{ clickable: true }}
        speed={shouldReduceMotion ? 0 : 680}
      >
        {articles.map((article, index) => (
          <SwiperSlide key={article.id}>
            <article className="grid min-h-[38rem] grid-rows-[minmax(19rem,1.1fr)_minmax(0,0.9fr)] bg-white sm:min-h-[39rem] lg:min-h-[35rem] lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)] lg:grid-rows-1">
              <div className="relative min-h-0 overflow-hidden bg-slate-100">
                <img
                  alt={article.title}
                  className="size-full object-cover"
                  decoding="async"
                  fetchPriority={index === 0 ? "high" : "auto"}
                  loading={index === 0 ? "eager" : "lazy"}
                  src={article.imageUrl ?? "/background-hq.png"}
                />
              </div>

              <div className="relative flex min-h-0 flex-col justify-center bg-white px-6 py-8 text-right sm:px-9 sm:py-10 lg:px-11 lg:py-12">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-teal-500 px-3 py-1.5 text-xs font-extrabold text-white">
                    {t("articles.featured")}
                  </span>
                  <span className="text-xs font-extrabold tracking-[0.12em] text-teal-500">
                    {t("articles.counter", {
                      current: String(index + 1).padStart(2, "0"),
                      total: String(articles.length).padStart(2, "0"),
                    })}
                  </span>
                </div>
                <h2 className="mt-4 line-clamp-3 text-2xl font-black leading-[1.36] tracking-[-0.055em] text-slate-950 sm:text-3xl sm:leading-[1.4] lg:text-4xl">
                  {article.title}
                </h2>
                <p className="mt-4 line-clamp-3 text-sm font-medium leading-7 text-slate-600 sm:text-base sm:leading-8">
                  {article.excerpt}
                </p>

                <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-slate-500">
                  <CalendarIcon />
                  {formatDate(article.publishedAt, locale)}
                </div>

                <Link
                  className="group mt-7 inline-flex min-h-12 w-fit items-center gap-3 rounded-full bg-teal-500 px-5 py-3 text-sm font-extrabold text-white transition-[background-color,color,transform] duration-200 hover:-translate-y-0.5 hover:bg-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 active:translate-y-0 motion-reduce:transition-none"
                  href={`/articles/${article.slug}`}
                >
                  {t("articles.readCta")}
                  <span className="transition-transform duration-200 group-hover:-translate-x-1 motion-reduce:transition-none">
                    <ArrowIcon />
                  </span>
                </Link>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
