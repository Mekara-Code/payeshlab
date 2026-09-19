import { notFound } from "next/navigation";
import { SiteNavigation } from "@/components/navigation/site-navigation";
import { PreparationGrid } from "@/components/preparations/preparation-grid";
import { PreparationPagination } from "@/components/preparations/preparation-pagination";
import { PreparationListJsonLd } from "@/components/seo/preparation-json-ld";
import { SiteFooter } from "@/components/site-footer";
import { getSelectedContentLocale } from "@/lib/content-locale-server";
import { getDictionary } from "@/lib/dictionaries";
import { translate } from "@/lib/dictionaries/types";
import {
  getPublishedPreparations,
  PREPARATIONS_PER_PAGE,
} from "@/lib/public-articles";
import { getSiteSettings } from "@/lib/site-settings";

/**
 * One page of the preparation archive. `/test-preparation` renders page 1 and
 * `/test-preparation/page/[page]` renders the rest, so every page of the list
 * has its own crawlable URL instead of a query string.
 */
export async function PreparationArchive({ page }: { page: number }) {
  const locale = await getSelectedContentLocale();
  const [archive, settings] = await Promise.all([
    getPublishedPreparations(page, locale),
    getSiteSettings(),
  ]);

  // A page number past the last one must not answer 200 with the final page's
  // content; that would be a duplicate of a URL Google already has.
  if (page > 1 && archive.page !== page) notFound();

  const dictionary = getDictionary(locale);
  const t = (key: string, values?: Record<string, number | string>) =>
    translate(dictionary, key, values);
  const numberFormatter = new Intl.NumberFormat(
    locale === "fa" ? "fa-IR" : locale === "ar" ? "ar-EG" : "en-US",
  );
  const title = t("preparation.listTitle");

  return (
    <main className="min-h-dvh bg-[#f7fbfb] text-slate-950">
      <PreparationListJsonLd
        description={t("preparation.listDescription")}
        homeLabel={t("preparation.breadcrumbHome")}
        items={archive.items}
        page={archive.page}
        pageSize={PREPARATIONS_PER_PAGE}
        title={title}
      />
      <SiteNavigation />

      <header className="overflow-hidden bg-[radial-gradient(circle_at_85%_15%,rgba(45,212,191,0.22),transparent_28%),linear-gradient(135deg,#edf9f8,#f8ffff)] px-5 pb-14 pt-28 sm:px-10 sm:pb-20 sm:pt-36 lg:px-20 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <span className="inline-flex rounded-full bg-teal-500 px-4 py-2 text-sm font-extrabold text-white">
            {t("preparation.badge")}
          </span>
          <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end lg:gap-16">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-black leading-[1.3] tracking-[-0.06em] text-slate-950 sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-slate-600 sm:text-lg sm:leading-9">
                {t("preparation.listDescription")}
              </p>
              {archive.pageCount > 1 ? (
                <p className="mt-4 text-sm font-bold text-teal-500">
                  {t("preparation.pageHeading", {
                    page: numberFormatter.format(archive.page),
                    pageCount: numberFormatter.format(archive.pageCount),
                  })}
                </p>
              ) : null}
            </div>

            <div className="rounded-tl-[3rem] rounded-br-[3rem] bg-slate-950 p-6 text-white sm:p-7">
              <p className="text-sm font-bold text-teal-200">
                {t("preparation.countLabel")}
              </p>
              <p className="mt-3 text-4xl font-black tracking-[-0.06em]">
                {numberFormatter.format(archive.total)}
              </p>
              <p className="mt-2 text-sm font-medium leading-7 text-slate-300">
                {t("preparation.countDescription")}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section
        aria-labelledby="preparation-archive-title"
        className="bg-white px-5 py-14 sm:px-10 sm:py-20 lg:px-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            className="text-2xl font-black tracking-[-0.05em] text-slate-950 sm:text-3xl"
            id="preparation-archive-title"
          >
            {t("preparation.listHeading")}
          </h2>

          {archive.items.length > 0 ? (
            <>
              <div className="mt-8 sm:mt-10">
                <PreparationGrid
                  items={archive.items}
                  locale={locale}
                  readCta={t("preparation.readCta")}
                  readLabel={(itemTitle) => t("preparation.read", { title: itemTitle })}
                />
              </div>
              <PreparationPagination
                label={t("preparation.pagination")}
                locale={locale}
                nextLabel={t("preparation.nextPage")}
                page={archive.page}
                pageCount={archive.pageCount}
                pageLabel={(value) =>
                  t("preparation.goToPage", { page: numberFormatter.format(value) })
                }
                previousLabel={t("preparation.previousPage")}
              />
            </>
          ) : (
            <div className="mt-8 rounded-tr-[2.5rem] rounded-bl-[2.5rem] bg-slate-50 px-6 py-14 text-center sm:px-10">
              <p className="text-base font-extrabold text-slate-800">
                {t("preparation.empty")}
              </p>
              <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-7 text-slate-600">
                {t("preparation.emptyDescription")}
              </p>
            </div>
          )}
        </div>
      </section>

      <SiteFooter settings={settings} />
    </main>
  );
}
