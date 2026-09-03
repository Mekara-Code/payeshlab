import type { Metadata } from "next";
import { TestCatalog } from "@/components/tests/test-catalog";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavigation } from "@/components/navigation/site-navigation";
import { getSelectedContentLocale } from "@/lib/content-locale-server";
import { getDictionary } from "@/lib/dictionaries";
import { translate } from "@/lib/dictionaries/types";
import { getPublishedLaboratoryTests } from "@/lib/laboratory-test-data";
import { createSeoMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/site-settings";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getSelectedContentLocale();
  const dictionary = getDictionary(locale);

  return createSeoMetadata({
    description: translate(dictionary, "tests.metaDescription"),
    keywords: [
      ...dictionary["seo.keywords"].split(",").map((keyword) => keyword.trim()),
      translate(dictionary, "tests.title"),
    ],
    locale,
    path: "/tests",
    title: translate(dictionary, "tests.metaTitle"),
  });
}

export default async function TestsPage() {
  const [locale, tests, settings] = await Promise.all([
    getSelectedContentLocale(),
    getPublishedLaboratoryTests(),
    getSiteSettings(),
  ]);
  const dictionary = getDictionary(locale);
  const t = (key: string) => translate(dictionary, key);

  return (
    <main className="min-h-dvh bg-[#f7fbfb] text-slate-950">
      <SiteNavigation />
      <header className="overflow-hidden bg-[radial-gradient(circle_at_85%_15%,rgba(45,212,191,0.22),transparent_28%),linear-gradient(135deg,#edf9f8,#f8ffff)] px-5 pb-14 pt-28 sm:px-10 sm:pb-20 sm:pt-36 lg:px-20 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <span className="inline-flex rounded-full bg-teal-500 px-4 py-2 text-sm font-extrabold text-white">{t("tests.badge")}</span>
          <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end lg:gap-16">
            <div className="max-w-3xl"><h1 className="text-4xl font-black leading-[1.3] tracking-[-0.06em] text-slate-950 sm:text-5xl lg:text-6xl">{t("tests.title")}</h1><p className="mt-5 max-w-2xl text-base font-medium leading-8 text-slate-600 sm:text-lg sm:leading-9">{t("tests.description")}</p></div>
            <div className="rounded-tl-[3rem] rounded-br-[3rem] bg-slate-950 p-6 text-white sm:p-7"><p className="text-sm font-bold text-teal-200">{t("tests.directoryStatLabel")}</p><p className="mt-3 text-4xl font-black tracking-[-0.06em]">{tests.length.toLocaleString("fa-IR")}</p><p className="mt-2 text-sm font-medium leading-7 text-slate-300">{t("tests.directoryStatDescription")}</p></div>
          </div>
        </div>
      </header>
      <TestCatalog tests={tests} />
      <SiteFooter settings={settings} />
    </main>
  );
}
