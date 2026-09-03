"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "@/components/i18n/dictionary-provider";
import type { PublicLaboratoryTest } from "@/lib/laboratory-test-data";

const pageSize = 36;

function SearchIcon() {
  return <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="5.7" stroke="currentColor" strokeWidth="1.8" /><path d="m15.2 15.2 4.3 4.3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></svg>;
}

function ArrowIcon() {
  return <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>;
}

function SampleIcon() {
  return <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24"><path d="M9 3h6M10 3v6.1L5.6 17a2.5 2.5 0 0 0 2.2 3.7h8.4a2.5 2.5 0 0 0 2.2-3.7L14 9.1V3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /><path d="M8.5 15h7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" /></svg>;
}

export function TestCatalog({ tests }: { tests: PublicLaboratoryTest[] }) {
  const [query, setQuery] = useState("");
  const [shownCount, setShownCount] = useState(pageSize);
  const { t } = useTranslations();
  const filteredTests = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fa-IR");
    if (!normalizedQuery) return tests;
    return tests.filter((test) => `${test.name} ${test.slug}`.toLocaleLowerCase("fa-IR").includes(normalizedQuery));
  }, [query, tests]);
  const visibleTests = filteredTests.slice(0, shownCount);

  return (
    <section aria-labelledby="test-directory-list" className="bg-white px-5 py-14 sm:px-10 sm:py-20 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 border-b border-slate-100 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-teal-600">{t("tests.catalogEyebrow")}</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-slate-950 sm:text-3xl" id="test-directory-list">{t("tests.catalogTitle")}</h2>
          </div>
          <p className="rounded-full bg-teal-50 px-4 py-2 text-sm font-extrabold text-teal-700">{t("tests.resultCount", { count: filteredTests.length.toLocaleString("fa-IR") })}</p>
        </div>

        <div className="mt-7 relative">
          <label className="sr-only" htmlFor="test-catalog-search">{t("tests.searchLabel")}</label>
          <input className="min-h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pr-12 pl-4 text-base font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10" id="test-catalog-search" onChange={(event) => { setQuery(event.target.value); setShownCount(pageSize); }} placeholder={t("tests.searchPlaceholder")} type="search" value={query} />
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-4 grid place-items-center text-slate-500"><SearchIcon /></span>
        </div>

        {visibleTests.length > 0 ? <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleTests.map((test) => <Link className="group flex min-h-48 flex-col rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-[0_14px_32px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal-500" href={`/tests/${encodeURIComponent(test.slug)}`} key={test.id}><span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-600"><SampleIcon /></span><h3 className="mt-5 text-lg font-black leading-7 text-slate-950 group-hover:text-teal-700">{test.name}</h3>{test.description ? <p className="mt-2 line-clamp-2 text-sm font-medium leading-7 text-slate-600">{test.description}</p> : <p className="mt-2 text-sm font-medium leading-7 text-slate-400">{t("tests.noDescription")}</p>}<span className="mt-auto flex min-h-11 items-end gap-2 pt-4 text-sm font-extrabold text-teal-600">{t("tests.viewDetails")}<ArrowIcon /></span></Link>)}</div> : <div className="mt-8 rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center"><h3 className="text-lg font-black text-slate-950">{t("tests.noResultsTitle")}</h3><p className="mt-2 text-sm font-medium leading-7 text-slate-600">{t("tests.noResultsDescription")}</p></div>}
        {filteredTests.length > shownCount ? <div className="mt-8 text-center"><button className="min-h-12 rounded-2xl border border-teal-200 bg-white px-5 text-sm font-extrabold text-teal-600 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal-500" onClick={() => setShownCount((count) => count + pageSize)} type="button">{t("tests.showMore")}</button></div> : null}
      </div>
    </section>
  );
}
