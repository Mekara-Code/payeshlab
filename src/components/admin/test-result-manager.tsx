"use client";

import { useActionState, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deletePatientTestResult,
  uploadPatientTestResult,
  type TestResultActionState,
} from "@/app/admin/test-results/actions";
import { AdminModal } from "@/components/admin/admin-modal";
import { useToast } from "@/components/ui/toast-provider";
import { useActionToast } from "@/components/ui/use-action-toast";
import { toDigitsOnly } from "@/lib/patient-identity";

export type ManagedTestResult = {
  createdAt: string;
  fileName: string;
  fileSize: number;
  id: string;
  nationalCode: string;
  patientName: string | null;
};

const initialState: TestResultActionState = {};

function formatPersianDateTime(value: string) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatFileSize(bytes: number) {
  const megabytes = bytes / (1024 * 1024);
  if (megabytes >= 1) {
    return `${megabytes.toLocaleString("fa-IR", { maximumFractionDigits: 1 })} مگابایت`;
  }

  return `${Math.max(1, Math.round(bytes / 1024)).toLocaleString("fa-IR")} کیلوبایت`;
}

function UploadIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path d="M12 16V4m0 0L8 8m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <path d="M5 3.5h9l5 5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M14 3.5V9h5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <circle cx="10.8" cy="10.8" r="5.8" stroke="currentColor" strokeWidth="1.9" />
      <path d="m15.2 15.2 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
    </svg>
  );
}

export function TestResultManager({ results }: { results: ManagedTestResult[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isManaging, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(
    async (previousState: TestResultActionState, formData: FormData) => {
      const result = await uploadPatientTestResult(previousState, formData);
      if (result.success) {
        formRef.current?.reset();
        setSelectedFileName(null);
        setIsModalOpen(false);
        router.refresh();
      }

      return result;
    },
    initialState,
  );
  useActionToast(state);

  const normalizedQuery = toDigitsOnly(searchQuery) || searchQuery.trim();
  const visibleResults = useMemo(() => {
    if (!normalizedQuery) return results;

    return results.filter(
      (result) =>
        result.nationalCode.includes(normalizedQuery) ||
        (result.patientName ?? "").includes(normalizedQuery),
    );
  }, [normalizedQuery, results]);

  function removeResult(id: string) {
    startTransition(async () => {
      const result = await deletePatientTestResult(id);
      if (result.message) {
        toast(result.message, { variant: result.success ? "success" : "error" });
      }
      if (result.success) router.refresh();
    });
  }

  return (
    <div className="pb-8">
      <section className="rounded-[1.75rem] border border-teal-100 bg-[linear-gradient(120deg,#ffffff,rgba(240,253,250,0.86))] p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)] sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-teal-100 text-teal-500">
              <DocumentIcon />
            </span>
            <div>
              <p className="text-xs font-extrabold tracking-wide text-teal-500">
                بارگذاری جواب بیماران
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-950">
                جواب آزمایش‌ها
              </h2>
              <p className="mt-1.5 text-sm font-medium leading-6 text-slate-600">
                فایل PDF جواب آزمایش را همراه با کد ملی بیمار ثبت کنید.
              </p>
            </div>
          </div>
          <button
            aria-haspopup="dialog"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-teal-500 px-5 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(13,148,136,0.24)] transition duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
            onClick={() => setIsModalOpen(true)}
            type="button"
          >
            <UploadIcon />
            بارگذاری جواب آزمایش
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold tracking-wide text-teal-500">
              بایگانی جواب‌ها
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">
              جواب‌های بارگذاری‌شده
            </h2>
          </div>
          <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-extrabold text-teal-500">
            {results.length.toLocaleString("fa-IR")} مورد
          </span>
        </div>

        {results.length > 0 ? (
          <div className="relative mt-5">
            <label className="sr-only" htmlFor="test-result-search">
              جست‌وجوی جواب آزمایش
            </label>
            <input
              className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-11 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              id="test-result-search"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="جست‌وجو بر اساس کد ملی یا نام بیمار…"
              type="search"
              value={searchQuery}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <SearchIcon />
            </span>
          </div>
        ) : null}

        {visibleResults.length > 0 ? (
          <div className="mt-5 grid gap-3">
            {visibleResults.map((result) => (
              <article
                className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                key={result.id}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-teal-500 ring-1 ring-teal-100">
                    <DocumentIcon />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-teal-100 px-2.5 py-1 font-mono text-[11px] font-extrabold text-teal-800" dir="ltr">
                        {result.nationalCode}
                      </span>
                      <time className="text-xs font-bold text-slate-500" dateTime={result.createdAt}>
                        {formatPersianDateTime(result.createdAt)}
                      </time>
                    </div>
                    <h3 className="mt-2 truncate text-sm font-black text-slate-900 sm:text-base">
                      {result.patientName ?? "بیمار بدون نام ثبت‌شده"}
                    </h3>
                    <p className="mt-1 truncate text-xs font-medium text-slate-500">
                      {result.fileName} · {formatFileSize(result.fileSize)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    className="inline-flex min-h-10 items-center rounded-xl bg-white px-3 text-xs font-extrabold text-teal-500 ring-1 ring-teal-100 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                    href={`/admin/test-results/${result.id}/file`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    مشاهده فایل
                  </a>
                  <button
                    className="min-h-10 rounded-xl px-3 text-xs font-extrabold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                    disabled={isManaging}
                    onClick={() => removeResult(result.id)}
                    type="button"
                  >
                    حذف
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-bold text-slate-500">
            {results.length > 0
              ? "جوابی با این مشخصات پیدا نشد."
              : "هنوز جواب آزمایشی بارگذاری نشده است."}
          </p>
        )}
      </section>

      <AdminModal
        description="کد ملی بیمار و فایل PDF جواب آزمایش را وارد کنید."
        eyebrow="ثبت جواب جدید"
        id="test-result-upload-dialog"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="بارگذاری جواب آزمایش"
      >
        <form action={formAction} className="grid gap-5" ref={formRef}>
          <label className="grid gap-2 text-sm font-black text-slate-950">
            کد ملی بیمار
            <input
              autoComplete="off"
              className="min-h-12 rounded-xl border border-slate-200 px-4 font-mono text-sm font-bold tracking-[0.14em] text-slate-800 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
              dir="ltr"
              inputMode="numeric"
              maxLength={10}
              name="nationalCode"
              placeholder="۰۰۱۲۳۴۵۶۷۸"
              required
            />
            <span className="text-xs font-medium text-slate-500">
              کد ملی ۱۰ رقمی بدون خط تیره وارد شود.
            </span>
          </label>

          <label className="grid gap-2 text-sm font-black text-slate-950">
            نام بیمار (اختیاری)
            <input
              className="min-h-12 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
              maxLength={160}
              name="patientName"
              placeholder="نام و نام خانوادگی بیمار"
            />
          </label>

          <div className="grid gap-2 text-sm font-black text-slate-950">
            فایل جواب آزمایش (PDF)
            <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center transition hover:border-teal-300 hover:bg-teal-50/60 focus-within:border-teal-500">
              <span className="grid size-11 place-items-center rounded-xl bg-white text-teal-500 ring-1 ring-teal-100">
                <UploadIcon />
              </span>
              <span className="text-sm font-extrabold text-slate-700">
                {selectedFileName ?? "برای انتخاب فایل کلیک کنید"}
              </span>
              <span className="text-xs font-medium text-slate-500">
                فقط PDF، حداکثر ۱۵ مگابایت
              </span>
              <input
                accept="application/pdf"
                className="sr-only"
                name="resultFile"
                onChange={(event) =>
                  setSelectedFileName(event.target.files?.[0]?.name ?? null)
                }
                required
                type="file"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-5">
            <button
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
              onClick={() => setIsModalOpen(false)}
              type="button"
            >
              انصراف
            </button>
            <button
              className="min-h-11 rounded-xl bg-teal-500 px-5 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(13,148,136,0.23)] transition hover:-translate-y-0.5 disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "در حال بارگذاری…" : "ثبت جواب آزمایش"}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
