/* eslint-disable @next/next/no-img-element -- Guide cover images are administrator-configured URLs. */

import Link from "next/link";
import type { ContentLocale } from "@/lib/content-locale";
import type { PublicArticle } from "@/lib/public-articles";

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

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={`size-5 ${className}`} fill="none" viewBox="0 0 24 24">
      <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function FlaskIcon() {
  return (
    <svg aria-hidden="true" className="size-12" fill="none" viewBox="0 0 24 24">
      <path d="M9 3h6M10 3v6.1L5.6 17a2.5 2.5 0 0 0 2.2 3.7h8.4a2.5 2.5 0 0 0 2.2-3.7L14 9.1V3M8.5 15h7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Cards alternate their rounded corner to match the magazine grid used across
 * the site. The whole card is one link, so each guide is a single crawlable
 * target with descriptive anchor text.
 */
export function PreparationGrid({
  items,
  locale,
  readCta,
  readLabel,
}: {
  items: PublicArticle[];
  locale: ContentLocale;
  readCta: string;
  /** Screen-reader label template containing `{{title}}`, already formatted per item by the caller. */
  readLabel: (title: string) => string;
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
      {items.map((item, index) => (
        <li className="min-w-0" key={item.id}>
          <article className="group h-full">
            <Link
              aria-label={readLabel(item.title)}
              className={`flex h-full flex-col overflow-hidden rounded-sm border border-slate-200 bg-white transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_18px_44px_rgba(15,23,42,0.08)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 ${
                index % 2 === 0 ? "rounded-tr-[2.5rem]" : "rounded-tl-[2.5rem]"
              }`}
              href={`/test-preparation/${encodeURIComponent(item.slug)}`}
            >
              <div className="relative grid h-44 place-items-center overflow-hidden bg-teal-100 text-teal-500">
                {item.imageUrl ? (
                  <img
                    alt=""
                    aria-hidden="true"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                    decoding="async"
                    loading="lazy"
                    src={item.imageUrl}
                  />
                ) : (
                  <FlaskIcon />
                )}
              </div>

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <time
                  className="text-xs font-bold text-teal-500"
                  dateTime={item.publishedAt.slice(0, 10)}
                >
                  {formatDate(item.publishedAt, locale)}
                </time>
                <h3 className="mt-3 text-lg font-black leading-8 tracking-[-0.04em] text-slate-950">
                  {item.title}
                </h3>
                {item.excerpt ? (
                  <p className="mt-3 line-clamp-3 text-sm font-medium leading-7 text-slate-600">
                    {item.excerpt}
                  </p>
                ) : null}
                <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-extrabold text-teal-500">
                  {readCta}
                  <ArrowIcon className="transition-transform duration-200 group-hover:-translate-x-1 motion-reduce:transition-none" />
                </span>
              </div>
            </Link>
          </article>
        </li>
      ))}
    </ul>
  );
}
