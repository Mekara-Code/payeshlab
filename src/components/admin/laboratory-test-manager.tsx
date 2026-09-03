"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  deleteLaboratoryTest,
  saveLaboratoryTest,
  toggleLaboratoryTestStatus,
} from "@/app/admin/tests/actions";
import { useToast } from "@/components/ui/toast-provider";

export type ManagedLaboratoryTest = {
  clinicalSignificance: string | null;
  description: string | null;
  id: string;
  isActive: boolean;
  limitations: string | null;
  name: string;
  resultInterpretation: string | null;
  samplingInformation: string | null;
  slug: string;
  sortOrder: number;
  updatedAt: string;
};

const pageSize = 30;

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/["']/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function PlusIcon() {
  return <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /></svg>;
}

function EditIcon() {
  return <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24"><path d="m14.5 5.5 4 4M4 20l4.2-.8L19.5 7.9a1.4 1.4 0 0 0 0-2l-1.4-1.4a1.4 1.4 0 0 0-2 0L4.8 15.8 4 20Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

function TrashIcon() {
  return <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24"><path d="M5 7h14M10 11v6M14 11v6M8 7l1-3h6l1 3M7 7l1 13h8l1-13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

function LaboratoryIcon() {
  return <svg aria-hidden="true" className="size-8" fill="none" viewBox="0 0 24 24"><path d="M9 3h6M10 3v6.1L5.6 17a2.5 2.5 0 0 0 2.2 3.7h8.4a2.5 2.5 0 0 0 2.2-3.7L14 9.1V3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /><path d="M8.5 15h7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" /></svg>;
}

function FormField({
  defaultValue,
  helper,
  label,
  name,
  rows = 5,
}: {
  defaultValue?: string | null;
  helper?: string;
  label: string;
  name: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="text-sm font-extrabold text-slate-800" htmlFor={`test-${name}`}>
        {label}
      </label>
      <textarea
        className="mt-2 min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-base font-medium leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
        defaultValue={defaultValue ?? ""}
        id={`test-${name}`}
        maxLength={12000}
        name={name}
        rows={rows}
      />
      {helper ? <p className="mt-2 text-xs font-medium leading-5 text-slate-500">{helper}</p> : null}
    </div>
  );
}

function TestForm({
  test,
  onCancel,
  onSaved,
}: {
  test?: ManagedLaboratoryTest;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [isSlugEdited, setIsSlugEdited] = useState(Boolean(test));
  const { toast } = useToast();
  const isEditing = Boolean(test);

  function submitTest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await saveLaboratoryTest({}, formData);
      if (result.success) {
        onSaved();
      } else if (result.message) {
        toast(result.message, { variant: "error" });
      }
    });
  }

  return (
    <form className="mt-6 grid gap-5 rounded-[1.5rem] border border-teal-100 bg-white/90 p-4 shadow-sm sm:grid-cols-2 sm:p-5" onSubmit={submitTest}>
      {test ? <input name="id" type="hidden" value={test.id} /> : null}
      <div>
        <label className="text-sm font-extrabold text-slate-800" htmlFor="test-name">نام آزمایش</label>
        <input
          className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
          defaultValue={test?.name ?? ""}
          id="test-name"
          maxLength={160}
          name="name"
          onChange={(event) => {
            if (!isSlugEdited) {
              const slugField = event.currentTarget.form?.elements.namedItem("slug") as HTMLInputElement | null;
              if (slugField) slugField.value = slugify(event.currentTarget.value);
            }
          }}
          required
        />
      </div>
      <div>
        <label className="text-sm font-extrabold text-slate-800" htmlFor="test-slug">نامک آدرس</label>
        <input
          className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
          defaultValue={test?.slug ?? ""}
          dir="ltr"
          id="test-slug"
          maxLength={180}
          name="slug"
          onChange={() => setIsSlugEdited(true)}
          required
        />
        <p className="mt-2 text-xs font-medium text-slate-500">برای ساخت صفحهٔ اختصاصی هر آزمایش استفاده می‌شود.</p>
      </div>
      <div className="sm:col-span-2">
        <FormField defaultValue={test?.description} helper="معرفی کوتاه و قابل‌فهم آزمایش برای مراجعه‌کننده." label="دربارهٔ آزمایش" name="description" rows={5} />
      </div>
      <FormField defaultValue={test?.samplingInformation} helper="نوع نمونه، حجم موردنیاز، معیار رد نمونه و آمادگی‌های لازم را وارد کنید." label="اطلاعات نمونه‌گیری" name="samplingInformation" rows={6} />
      <FormField defaultValue={test?.clinicalSignificance} label="اهمیت بالینی" name="clinicalSignificance" rows={6} />
      <FormField defaultValue={test?.resultInterpretation} label="تفسیر نتیجه" name="resultInterpretation" rows={6} />
      <FormField defaultValue={test?.limitations} label="محدودیت‌ها و نکات تکمیلی" name="limitations" rows={6} />
      <div>
        <label className="text-sm font-extrabold text-slate-800" htmlFor="test-sortOrder">اولویت نمایش</label>
        <input className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base font-medium text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" defaultValue={test?.sortOrder ?? 0} id="test-sortOrder" max="100000" min="0" name="sortOrder" type="number" />
      </div>
      <label className="flex min-h-12 items-center gap-3 self-end text-sm font-extrabold text-slate-700"><input className="size-5 accent-teal-500" defaultChecked={test?.isActive ?? true} name="isActive" type="checkbox" />نمایش در فهرست عمومی</label>
      <div className="flex flex-wrap gap-3 sm:col-span-2">
        <button className="min-h-12 rounded-xl bg-teal-500 px-5 text-sm font-extrabold text-white transition hover:bg-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} type="submit">{isPending ? "در حال ذخیره…" : isEditing ? "ذخیرهٔ تغییرات" : "ثبت آزمایش"}</button>
        <button className="min-h-12 rounded-xl px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} onClick={onCancel} type="button">انصراف</button>
      </div>
    </form>
  );
}

export function LaboratoryTestManager({ tests }: { tests: ManagedLaboratoryTest[] }) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingTest, setEditingTest] = useState<ManagedLaboratoryTest | null>(null);
  const [query, setQuery] = useState("");
  const [shownCount, setShownCount] = useState(pageSize);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const filteredTests = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fa-IR");
    if (!normalizedQuery) return tests;
    return tests.filter((test) => `${test.name} ${test.slug}`.toLocaleLowerCase("fa-IR").includes(normalizedQuery));
  }, [query, tests]);
  const visibleTests = filteredTests.slice(0, shownCount);

  function afterSaved() {
    toast(editingTest ? "تغییرات آزمایش ذخیره شد." : "آزمایش جدید ثبت شد.", { variant: "success" });
    setEditingTest(null);
    setIsCreating(false);
    router.refresh();
  }

  function toggleTest(test: ManagedLaboratoryTest) {
    startTransition(async () => {
      const result = await toggleLaboratoryTestStatus(test.id, test.isActive);
      if (result.message) toast(result.message, { variant: result.success ? "success" : "error" });
      if (result.success) router.refresh();
    });
  }

  function removeTest(test: ManagedLaboratoryTest) {
    if (!window.confirm(`آزمایش «${test.name}» حذف شود؟`)) return;
    startTransition(async () => {
      const result = await deleteLaboratoryTest(test.id);
      if (result.message) toast(result.message, { variant: result.success ? "success" : "error" });
      if (result.success) {
        setEditingTest(null);
        router.refresh();
      }
    });
  }

  return (
    <section className="pb-8" dir="rtl">
      <div className="rounded-[1.75rem] border border-teal-100 bg-[linear-gradient(120deg,#ffffff,rgba(240,253,250,0.86))] p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-teal-500/10 px-3 py-1.5 text-xs font-extrabold text-teal-600">راهنمای مراجعه‌کنندگان</span>
            <h2 className="mt-4 text-2xl font-black tracking-[-0.05em] text-slate-950 sm:text-3xl">مدیریت فهرست آزمایش‌ها</h2>
            <p className="mt-3 text-sm font-medium leading-7 text-slate-600 sm:text-base">برای هر آزمایش یک صفحهٔ اختصاصی ساخته می‌شود. اطلاعات نمونه‌گیری، اهمیت بالینی و نکات تفسیر را در همین‌جا ثبت یا ویرایش کنید.</p>
          </div>
          <button aria-expanded={isCreating} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-teal-500 px-4 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(13,148,136,0.22)] transition duration-200 hover:bg-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500" onClick={() => { setEditingTest(null); setIsCreating((value) => !value); }} type="button"><PlusIcon />افزودن آزمایش</button>
        </div>
        {isCreating ? <TestForm onCancel={() => setIsCreating(false)} onSaved={afterSaved} /> : null}
        {editingTest ? <section aria-labelledby="test-edit-heading" className="mt-6 rounded-[1.5rem] border border-teal-200 bg-teal-50/55 p-4 shadow-sm sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-extrabold text-teal-600">ویرایش اطلاعات</p><h3 className="mt-1 text-xl font-black text-slate-950" id="test-edit-heading">{editingTest.name}</h3></div><button className="min-h-11 rounded-xl px-3 text-sm font-extrabold text-slate-600 transition hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500" onClick={() => setEditingTest(null)} type="button">بستن</button></div><TestForm onCancel={() => setEditingTest(null)} onSaved={afterSaved} test={editingTest} /></section> : null}
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_14px_32px_rgba(15,23,42,0.05)] sm:p-5">
        <div className="min-w-[min(100%,18rem)] flex-1"><label className="text-sm font-extrabold text-slate-800" htmlFor="test-search">جست‌وجوی آزمایش</label><input className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10" id="test-search" onChange={(event) => { setQuery(event.target.value); setShownCount(pageSize); }} placeholder="نام آزمایش یا نامک" type="search" value={query} /></div>
        <p className="min-h-12 rounded-xl bg-teal-50 px-4 py-3 text-sm font-extrabold text-teal-700">{filteredTests.length.toLocaleString("fa-IR")} آزمایش</p>
      </div>

      {visibleTests.length > 0 ? <section aria-label="فهرست آزمایش‌ها" className="mt-5 grid gap-3"><div className="hidden grid-cols-[minmax(14rem,1.2fr)_minmax(8rem,.7fr)_auto] gap-4 px-5 text-xs font-extrabold text-slate-500 lg:grid"><span>نام آزمایش</span><span>وضعیت</span><span>عملیات</span></div>{visibleTests.map((test) => <article className="grid gap-4 rounded-[1.35rem] border border-white bg-white p-5 shadow-[0_14px_32px_rgba(15,23,42,0.05)] transition hover:border-teal-100 sm:p-5 lg:grid-cols-[minmax(14rem,1.2fr)_minmax(8rem,.7fr)_auto] lg:items-center" key={test.id}><div className="min-w-0"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-600"><LaboratoryIcon /></span><div className="min-w-0"><h3 className="break-words text-base font-black text-slate-950">{test.name}</h3><a className="mt-1 block truncate text-xs font-bold text-teal-600 underline-offset-4 hover:underline" dir="ltr" href={`/tests/${encodeURIComponent(test.slug)}`} rel="noreferrer" target="_blank">/tests/{test.slug}</a></div></div>{test.description ? <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-slate-600">{test.description}</p> : <p className="mt-3 text-sm font-medium text-slate-400">بدون توضیح</p>}</div><div><span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold ${test.isActive ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{test.isActive ? "فعال و قابل نمایش" : "پیش‌نویس"}</span><p className="mt-2 text-xs font-bold text-slate-500">اولویت {test.sortOrder.toLocaleString("fa-IR")}</p></div><div className="flex flex-wrap gap-2 lg:justify-end"><button className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-teal-200 px-3 text-sm font-extrabold text-teal-600 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} onClick={() => { setIsCreating(false); setEditingTest(test); }} type="button"><EditIcon />ویرایش</button><button className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm font-extrabold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} onClick={() => toggleTest(test)} type="button">{test.isActive ? "توقف نمایش" : "فعال‌سازی"}</button><button aria-label={`حذف ${test.name}`} className="grid size-11 place-items-center rounded-xl border border-rose-100 text-rose-700 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} onClick={() => removeTest(test)} type="button"><TrashIcon /></button></div></article>)}</section> : <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-5 py-10 text-center"><p className="text-sm font-bold text-slate-600">آزمایشی با این جست‌وجو پیدا نشد.</p></div>}
      {filteredTests.length > shownCount ? <div className="mt-5 text-center"><button className="min-h-12 rounded-xl border border-teal-200 bg-white px-5 text-sm font-extrabold text-teal-600 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500" onClick={() => setShownCount((count) => count + pageSize)} type="button">نمایش آزمایش‌های بیشتر</button></div> : null}
    </section>
  );
}
