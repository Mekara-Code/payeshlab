import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavigation } from "@/components/navigation/site-navigation";
import { getSelectedContentLocale } from "@/lib/content-locale-server";
import { getDictionary } from "@/lib/dictionaries";
import { translate } from "@/lib/dictionaries/types";
import { getPublishedLaboratoryTestBySlug } from "@/lib/laboratory-test-data";
import { createSeoMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/site-settings";

type TestPageProps = { params: Promise<{ slug: string }> };

export const revalidate = 3600;

function ArrowIcon() {
  return <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24"><path d="M19 12H5m6-6-6 6 6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>;
}

function SampleIcon() {
  return <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><path d="M9 3h6M10 3v6.1L5.6 17a2.5 2.5 0 0 0 2.2 3.7h8.4a2.5 2.5 0 0 0 2.2-3.7L14 9.1V3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /><path d="M8.5 15h7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" /></svg>;
}

function normalizeSlug(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateMetadata({ params }: TestPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);
  const locale = await getSelectedContentLocale();
  const dictionary = getDictionary(locale);
  const test = await getPublishedLaboratoryTestBySlug(slug);

  if (!test) {
    return { robots: { follow: false, index: false }, title: translate(dictionary, "tests.notFoundTitle") };
  }

  return createSeoMetadata({
    description: test.description ?? translate(dictionary, "tests.metaDescription"),
    keywords: [
      ...dictionary["seo.keywords"].split(",").map((keyword) => keyword.trim()),
      test.name,
    ],
    locale,
    path: `/tests/${encodeURIComponent(test.slug)}`,
    title: translate(dictionary, "tests.detailMetaTitle", { title: test.name }),
  });
}

export default async function TestPage({ params }: TestPageProps) {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);
  const [locale, test, settings] = await Promise.all([
    getSelectedContentLocale(),
    getPublishedLaboratoryTestBySlug(slug),
    getSiteSettings(),
  ]);
  if (!test) notFound();

  const dictionary = getDictionary(locale);
  const t = (key: string, values?: Record<string, number | string>) => translate(dictionary, key, values);
  const laboratoryName =
    settings.laboratoryName?.trim() || t("tests.defaultLaboratoryName");
  const sections = [
    { content: test.samplingInformation, title: t("tests.samplingInformation"), tone: "bg-teal-50" },
    { content: test.clinicalSignificance, title: t("tests.clinicalSignificance"), tone: "bg-white" },
    { content: test.resultInterpretation, title: t("tests.resultInterpretation"), tone: "bg-slate-50" },
    { content: test.limitations, title: t("tests.limitations"), tone: "bg-amber-50" },
  ].filter((section) => Boolean(section.content));

  return (
    <main className="min-h-dvh bg-[#f7fbfb] text-slate-950">
      <SiteNavigation />
      <article>
        <header className="overflow-hidden bg-[radial-gradient(circle_at_84%_18%,rgba(45,212,191,0.22),transparent_28%),linear-gradient(135deg,#edf9f8,#f8ffff)] px-5 pb-14 pt-28 sm:px-10 sm:pb-20 sm:pt-36 lg:px-20 lg:pb-24">
          <div className="mx-auto max-w-7xl"><Link className="inline-flex min-h-11 items-center gap-2 rounded-2xl px-4 text-sm font-extrabold text-teal-600 transition hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal-500" href="/tests"><ArrowIcon />{t("tests.backToDirectory")}</Link><div className="mt-8 max-w-4xl lg:mt-12"><span className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-4 py-2 text-sm font-extrabold text-white"><SampleIcon />{t("tests.detailBadge")}</span><h1 className="mt-5 text-4xl font-black leading-[1.3] tracking-[-0.06em] text-slate-950 sm:text-5xl lg:text-6xl">{test.name}</h1>{test.description ? <p className="mt-5 max-w-3xl whitespace-pre-line text-base font-medium leading-8 text-slate-600 sm:text-lg sm:leading-9">{test.description}</p> : <p className="mt-5 max-w-3xl text-base font-medium leading-8 text-slate-500 sm:text-lg">{t("tests.noDescription")}</p>}</div></div>
        </header>
        <section className="bg-white px-5 py-14 sm:px-10 sm:py-20 lg:px-20 lg:py-24"><div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10"><div className="grid gap-5">{sections.length > 0 ? sections.map((section) => <section className={`rounded-[1.75rem] p-6 sm:p-8 ${section.tone}`} key={section.title}><h2 className="text-2xl font-black tracking-[-0.045em] text-slate-950">{section.title}</h2><p className="mt-4 whitespace-pre-line text-base font-medium leading-9 text-slate-700">{section.content}</p></section>) : <section className="rounded-[1.75rem] bg-slate-50 p-6 sm:p-8"><h2 className="text-2xl font-black tracking-[-0.045em] text-slate-950">{t("tests.noDetailsTitle")}</h2><p className="mt-4 text-base font-medium leading-8 text-slate-600">{t("tests.noDetailsDescription")}</p></section>}</div><aside className="h-fit rounded-tl-[2.5rem] rounded-br-[2.5rem] bg-slate-950 p-6 text-white sm:p-7 lg:sticky lg:top-28"><p className="text-sm font-medium leading-7 text-slate-300">{t("tests.medicalNote", { laboratoryName })}</p><Link className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-teal-500 px-4 text-sm font-extrabold text-white transition hover:bg-teal-400 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal-300" href="/contact">{t("tests.contactCta")}<ArrowIcon /></Link></aside></div></section>
      </article>
      <SiteFooter settings={settings} />
    </main>
  );
}
