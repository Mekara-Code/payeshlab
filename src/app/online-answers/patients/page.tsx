import type { Metadata } from "next";
import { PatientResultsLookup } from "@/components/online-answers/patient-results-lookup";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavigation } from "@/components/navigation/site-navigation";
import { getSelectedContentLocale } from "@/lib/content-locale-server";
import { getDictionary } from "@/lib/dictionaries";
import { translate } from "@/lib/dictionaries/types";
import { createSeoMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getSelectedContentLocale();
  const dictionary = getDictionary(locale);
  const title = translate(dictionary, "patientResults.metaTitle");

  return {
    ...createSeoMetadata({
      description: translate(dictionary, "patientResults.metaDescription"),
      keywords: [translate(dictionary, "patientResults.title")],
      locale,
      path: "/online-answers/patients",
      title,
    }),
    robots: { follow: false, index: false },
  };
}

export default async function PatientOnlineResultsPage() {
  const settings = await getSiteSettings();
  const locale = await getSelectedContentLocale();
  const dictionary = getDictionary(locale);
  const t = (key: string) => translate(dictionary, key);

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#f7fbfb] text-slate-950">
      <SiteNavigation />
      <header className="relative isolate overflow-hidden px-5 pb-12 pt-32 sm:px-10 sm:pb-16 sm:pt-40 lg:px-20 lg:pb-20 lg:pt-44">
        <div aria-hidden="true" className="absolute -right-32 top-0 -z-10 size-[31rem] rounded-full bg-teal-200/55 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-48 -left-32 -z-10 size-[30rem] rounded-full bg-cyan-100/70 blur-3xl" />
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/90 px-4 py-2 text-xs font-extrabold tracking-wide text-teal-700 shadow-sm"><span aria-hidden="true" className="size-2 rounded-full bg-teal-500" />{t("patientResults.badge")}</span>
          <h1 className="mt-6 text-4xl font-black leading-[1.2] tracking-[-0.06em] text-slate-950 sm:text-5xl">{t("patientResults.title")}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-8 text-slate-600 sm:text-lg sm:leading-9">{t("patientResults.description")}</p>
        </div>
      </header>
      <PatientResultsLookup />
      <SiteFooter settings={settings} />
    </main>
  );
}
