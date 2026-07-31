/* eslint-disable @next/next/no-img-element -- Article images are administrator-configured URLs. */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PayeshArticles } from "@/components/home/payesh-articles";
import { SidebarNavigation } from "@/components/navigation/sidebar-navigation";
import { SiteFooter } from "@/components/site-footer";
import {
  getPublishedArticleBySlug,
  getPublishedArticles,
  type PublicArticleBlock,
} from "@/lib/public-articles";
import { getSiteSettings } from "@/lib/site-settings";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

const allowedRichTextTags = new Set([
  "a",
  "b",
  "br",
  "div",
  "em",
  "i",
  "li",
  "ol",
  "p",
  "s",
  "span",
  "strike",
  "strong",
  "u",
  "ul",
]);

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

function formatPersianDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
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

function getPlainText(value: string) {
  return value
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<\/(?:p|div|li|h[1-6])>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isSafeHref(value: string) {
  return /^(https?:\/\/|mailto:|tel:|\/)/i.test(value);
}

function sanitizeRichText(value: string) {
  return value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(\/)?\s*([a-z0-9]+)([^>]*)>/gi, (tag, closingSlash, rawName, rawAttributes) => {
      const tagName = rawName.toLowerCase();
      if (!allowedRichTextTags.has(tagName)) return "";
      if (closingSlash) return `</${tagName}>`;
      if (tagName === "br") return "<br />";
      if (tagName !== "a") return `<${tagName}>`;

      const hrefMatch = rawAttributes.match(
        /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i,
      );
      const href = (hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "").trim();

      return href && isSafeHref(href)
        ? `<a href="${escapeAttribute(href)}" rel="noreferrer">`
        : "<a>";
    });
}

function getReadingTime(blocks: PublicArticleBlock[]) {
  const words = blocks.reduce((total, block) => total + getPlainText(block.content).split(/\s+/).filter(Boolean).length, 0);
  return Math.max(2, Math.ceil(words / 180));
}

function parseTableRows(value: string) {
  try {
    const rows = JSON.parse(value) as unknown;
    if (!Array.isArray(rows)) return [];

    return rows
      .filter((row): row is unknown[] => Array.isArray(row))
      .slice(0, 20)
      .map((row) => row.slice(0, 12).map((cell) => (typeof cell === "string" ? cell : "")));
  } catch {
    return [];
  }
}

function ArticleRichText({ content, className = "" }: { content: string; className?: string }) {
  const safeContent = sanitizeRichText(content);

  if (!safeContent || !getPlainText(safeContent)) return null;

  return (
    <div
      className={`w-full break-words [overflow-wrap:anywhere] text-base font-medium leading-9 text-slate-700 sm:text-lg sm:leading-9 [&_a]:font-extrabold [&_a]:text-teal-500 [&_a]:underline [&_a]:underline-offset-4 [&_div+_div]:mt-5 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pr-6 [&_p+_p]:mt-5 [&_ul]:my-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pr-6 ${className}`}
      dangerouslySetInnerHTML={{ __html: safeContent }}
    />
  );
}

function ArticleBody({ blocks }: { blocks: PublicArticleBlock[] }) {
  return (
    <div className="grid w-full gap-6 sm:gap-8 [&>*]:min-w-0">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const heading = getPlainText(block.content);
          return heading ? (
            <h2 className="pt-4 text-2xl font-black leading-10 tracking-[-0.045em] text-slate-950 sm:pt-5 sm:text-3xl" key={block.id}>
              {heading}
            </h2>
          ) : null;
        }

        if (block.type === "quote") {
          return (
            <blockquote className="rounded-tr-[2.5rem] rounded-bl-[2.5rem] bg-teal-50 px-6 py-7 text-teal-500 sm:px-9 sm:py-9" key={block.id}>
              <span aria-hidden="true" className="block text-5xl font-black leading-none text-teal-500">«</span>
              <ArticleRichText className="mt-3 font-extrabold text-teal-500" content={block.content} />
            </blockquote>
          );
        }

        if (block.type === "table") {
          const rows = parseTableRows(block.content);
          if (rows.length === 0) return null;

          const [header, ...body] = rows;
          return (
            <div className="w-full overflow-x-auto pb-1" key={block.id}>
              <table className="w-full min-w-[34rem] border-separate border-spacing-y-2 text-right text-sm sm:text-base">
                <thead>
                  <tr className="bg-teal-500 text-white">
                    {header.map((cell, cellIndex) => (
                      <th className="px-4 py-3 text-right font-extrabold first:rounded-r-2xl last:rounded-l-2xl" key={`${block.id}-header-${cellIndex}`} scope="col">
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {body.map((row, rowIndex) => (
                    <tr className="bg-slate-50 text-slate-700" key={`${block.id}-row-${rowIndex}`}>
                      {header.map((_, cellIndex) => (
                        <td className="px-4 py-3 font-medium first:rounded-r-2xl last:rounded-l-2xl" key={`${block.id}-${rowIndex}-${cellIndex}`}>
                          {row[cellIndex] ?? "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return <ArticleRichText content={block.content} key={`${block.id}-${index}`} />;
      })}
    </div>
  );
}

export async function generateStaticParams() {
  const articles = await getPublishedArticles(100);
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    return { title: "مقاله یافت نشد | آزمایشگاه پایش" };
  }

  return {
    description: article.metaDescription ?? article.excerpt,
    title: `${article.title} | مجله پایش`,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);
  const [article, allArticles, settings] = await Promise.all([
    getPublishedArticleBySlug(slug),
    getPublishedArticles(8),
    getSiteSettings(),
  ]);

  if (!article) notFound();

  const relatedArticles = allArticles.filter((item) => item.slug !== article.slug).slice(0, 3);
  const readingTime = getReadingTime(article.content);
  const category = article.categories[0] ?? "مجله پایش";

  return (
    <main className="min-h-dvh bg-[#f7fbfb] text-slate-950">
      <SidebarNavigation />

      <article>
        <header className="overflow-hidden bg-[#edf9f8] px-5 pb-14 pt-28 sm:px-10 sm:pb-20 sm:pt-36 lg:px-20 lg:pb-24">
          <div className="mx-auto max-w-7xl">
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl px-4 text-sm font-extrabold text-teal-500 transition hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal-500"
              href="/articles"
            >
              <ArrowIcon />
              بازگشت به مجلهٔ پایش
            </Link>

            <div className="mt-8 grid items-end gap-10 lg:mt-12 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] lg:gap-16">
              <div className="max-w-3xl">
                <span className="inline-flex rounded-full bg-teal-500 px-4 py-2 text-sm font-extrabold text-white">
                  {category}
                </span>
                <h1 className="mt-5 text-4xl font-black leading-[1.3] tracking-[-0.06em] text-slate-950 sm:text-5xl lg:text-6xl">
                  {article.title}
                </h1>
                <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-slate-600 sm:text-lg sm:leading-9">
                  {article.excerpt}
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-bold text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <CalendarIcon />
                    {formatPersianDate(article.publishedAt)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <ClockIcon />
                    حدود {readingTime} دقیقه مطالعه
                  </span>
                </div>
              </div>

              <figure className="relative aspect-[4/3] overflow-hidden rounded-tr-[4rem] rounded-bl-[4rem] bg-teal-100 sm:rounded-tr-[5rem] sm:rounded-bl-[5rem]">
                <img
                  alt={article.title}
                  className="size-full object-cover"
                  decoding="async"
                  fetchPriority="high"
                  src={article.imageUrl ?? "/background-hq.png"}
                />
                <figcaption className="absolute bottom-0 right-0 bg-teal-500 px-5 py-3 text-xs font-extrabold text-white sm:px-6 sm:py-4 sm:text-sm">
                  مجلهٔ پایش
                </figcaption>
              </figure>
            </div>
          </div>
        </header>

        <section className="bg-white px-5 py-14 sm:px-10 sm:py-20 lg:px-20 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 2xl:grid-cols-[minmax(0,1fr)_17rem] 2xl:gap-16">
            <div className="mx-auto w-full min-w-0 max-w-[56rem] 2xl:mx-0 2xl:max-w-none">
              <p className="mb-10 rounded-tr-[2.5rem] rounded-bl-[2.5rem] bg-slate-50 px-6 py-6 text-base font-extrabold leading-8 text-slate-800 sm:mb-12 sm:px-8 sm:py-7 sm:text-lg">
                {article.excerpt}
              </p>
              <ArticleBody blocks={article.content} />
            </div>

            <aside className="mx-auto h-fit w-full max-w-[56rem] 2xl:sticky 2xl:top-28 2xl:order-2 2xl:mx-0 2xl:max-w-none">
              <div className="rounded-tl-[2.5rem] rounded-br-[2.5rem] bg-teal-50 p-6 sm:p-7">
                <p className="text-xs font-black tracking-wide text-teal-500">در این مقاله</p>
                <div className="mt-5 grid gap-4 text-sm font-bold text-slate-700">
                  <span className="inline-flex items-center gap-2 text-teal-500">
                    <ClockIcon />
                    {readingTime} دقیقه مطالعه
                  </span>
                  {article.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-teal-500" key={tag}>
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
                  ارتباط با ما
                  <ArrowIcon />
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </article>

      {relatedArticles.length > 0 ? (
        <PayeshArticles
          articles={relatedArticles}
          maxArticles={relatedArticles.length}
          title="مطالب بیشتر از مجلهٔ پایش"
        />
      ) : null}
      <SiteFooter settings={settings} />
    </main>
  );
}
