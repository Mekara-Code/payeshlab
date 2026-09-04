"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useActionState, useState } from "react";
import {
  findPatientTestResult,
  type PatientResultLookupState,
} from "@/app/online-answers/patients/actions";
import { useTranslations } from "@/components/i18n/dictionary-provider";
import { ModalShell } from "@/components/ui/modal-shell";

const initialState: PatientResultLookupState = {};

function ShieldIcon() {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <path d="M12 3.5 19 6v5.2c0 4.4-2.9 7.6-7 9.3-4.1-1.7-7-4.9-7-9.3V6l7-2.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <path d="M5 3.5h9l5 5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M14 3.5V9h5M8 14h8M8 17h5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path d="M12 4v10m0 0 4-4m-4 4-4-4M5 18v1.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg aria-hidden="true" className="size-10 animate-spin text-teal-500 motion-reduce:animate-none" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-20" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}

function formatFileSize(bytes: number, locale: string) {
  const formatter = new Intl.NumberFormat(locale === "fa" ? "fa-IR" : locale === "ar" ? "ar-SA" : "en-US", {
    maximumFractionDigits: 1,
  });
  const megabytes = bytes / (1024 * 1024);
  return megabytes >= 1
    ? `${formatter.format(megabytes)} MB`
    : `${formatter.format(Math.max(1, Math.round(bytes / 1024)))} KB`;
}

function formatUploadedAt(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(
    locale === "fa"
      ? "fa-IR-u-ca-persian"
      : locale === "ar"
        ? "ar-SA"
        : "en-US",
    {
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      month: "long",
      year: "numeric",
    },
  ).format(date);
}

export function PatientResultsLookup() {
  const { locale, t } = useTranslations();
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [isResultDismissed, setIsResultDismissed] = useState(false);
  const [state, formAction, isPending] = useActionState(
    findPatientTestResult,
    initialState,
  );

  const errorMessage = state.error
    ? t(`patientResults.error.${state.error}`)
    : null;

  return (
    <>
      <section className="px-5 pb-20 sm:px-10 sm:pb-28 lg:px-20">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-[2rem] border border-teal-100 bg-white shadow-[0_26px_70px_rgba(15,23,42,0.11)] sm:rounded-[2.5rem]">
            <div className="border-b border-teal-100 bg-[linear-gradient(135deg,#f0fdfa,#ecfeff)] px-5 py-6 sm:px-8 sm:py-8">
              <div className="flex items-start gap-4">
                <span className="grid size-13 shrink-0 place-items-center rounded-2xl bg-teal-500 text-white shadow-[0_12px_24px_rgba(13,148,136,0.24)]"><ShieldIcon /></span>
                <div>
                  <h2 className="text-xl font-black tracking-[-0.04em] text-slate-950 sm:text-2xl">{t("patientResults.formTitle")}</h2>
                  <p className="mt-2 max-w-xl text-sm font-medium leading-7 text-slate-600">{t("patientResults.formDescription")}</p>
                </div>
              </div>
            </div>

            <form action={formAction} className="p-5 sm:p-8" onSubmit={() => setIsResultDismissed(false)}>
              <div className="grid gap-5">
                <label className="grid gap-2 text-sm font-black text-slate-950">
                  {t("patientResults.nationalCode")}
                  <input
                    autoComplete="off"
                    className="min-h-13 rounded-2xl border border-slate-200 bg-white px-4 font-mono text-base font-bold tracking-[0.16em] text-slate-900 outline-none transition placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:cursor-wait disabled:bg-slate-50"
                    dir="ltr"
                    disabled={isPending}
                    inputMode="numeric"
                    maxLength={10}
                    name="nationalCode"
                    placeholder="0012345678"
                    required
                  />
                  <span className="text-xs font-medium tracking-normal text-slate-500">{t("patientResults.nationalCodeHint")}</span>
                </label>

                <label className="grid gap-2 text-sm font-black text-slate-950">
                  {t("patientResults.mobile")}
                  <input
                    autoComplete="tel"
                    className="min-h-13 rounded-2xl border border-slate-200 bg-white px-4 font-mono text-base font-bold tracking-[0.12em] text-slate-900 outline-none transition placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:cursor-wait disabled:bg-slate-50"
                    dir="ltr"
                    disabled={isPending}
                    inputMode="tel"
                    maxLength={11}
                    name="mobile"
                    placeholder="09123456789"
                    required
                    type="tel"
                  />
                  <span className="text-xs font-medium tracking-normal text-slate-500">{t("patientResults.mobileHint")}</span>
                </label>
              </div>

              {errorMessage ? <p className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold leading-6 text-rose-800" role="alert">{errorMessage}</p> : null}

              <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-sm text-xs font-medium leading-6 text-slate-500">{t("patientResults.privacyNote")}</p>
                <button className="inline-flex min-h-13 shrink-0 items-center justify-center gap-2 rounded-2xl bg-teal-500 px-6 text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(13,148,136,0.24)] transition duration-200 hover:-translate-y-0.5 hover:bg-teal-600 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-teal-500 disabled:cursor-wait disabled:translate-y-0 disabled:opacity-70 motion-reduce:transition-none" disabled={isPending} type="submit">
                  {isPending ? <span className="size-5 animate-spin rounded-full border-2 border-white/35 border-t-white motion-reduce:animate-none" /> : <DocumentIcon />}
                  {isPending ? t("patientResults.buttonLoading") : t("patientResults.submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <ModalShell
        closeLabel={t("patientResults.close")}
        description={t("patientResults.resultDescription")}
        eyebrow={t("patientResults.resultEyebrow")}
        id="patient-result-ready-dialog"
        initialFocusSelector="#patient-result-download"
        isOpen={Boolean(state.results?.length) && !isPending && !isResultDismissed}
        maxWidthClassName="max-w-2xl"
        onClose={() => setIsResultDismissed(true)}
        title={t("patientResults.resultTitle")}
      >
        {state.results?.length ? <div className="p-5 sm:p-7">
          <p className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-extrabold leading-6 text-teal-900">
            {t("patientResults.resultCount", { count: state.results.length.toLocaleString(locale === "fa" ? "fa-IR" : locale === "ar" ? "ar-SA" : "en-US") })}
          </p>
          <div className="mt-4 grid max-h-[min(48vh,28rem)] gap-3 overflow-y-auto pr-1">
            {state.results.map((result, index) => (
              <article className="rounded-2xl border border-teal-100 bg-teal-50/70 p-4" key={result.id}>
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-teal-600 shadow-sm ring-1 ring-teal-100"><DocumentIcon /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold tracking-wide text-teal-700">{t("patientResults.fileLabel")}</p>
                    <p className="mt-1 break-all text-sm font-black leading-6 text-slate-950">{result.fileName}</p>
                    <p className="mt-1 text-xs font-medium text-slate-600">{t("patientResults.fileSize", { size: formatFileSize(result.fileSize, locale) })}</p>
                    <time className="mt-1.5 block text-xs font-bold text-slate-600" dateTime={result.createdAt}>
                      {t("patientResults.uploadedAt", { date: formatUploadedAt(result.createdAt, locale) })}
                    </time>
                  </div>
                </div>
                <a
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(13,148,136,0.2)] transition duration-200 hover:-translate-y-0.5 hover:bg-teal-600 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-teal-500 motion-reduce:transition-none"
                  download
                  href={`/online-answers/patients/download/${result.id}`}
                  id={index === 0 ? "patient-result-download" : undefined}
                >
                  <DownloadIcon />
                  {t("patientResults.download")}
                </a>
              </article>
            ))}
          </div>
        </div> : null}
      </ModalShell>

      <AnimatePresence>
        {isPending ? <motion.div animate={{ opacity: 1 }} aria-live="assertive" className="fixed inset-0 z-[600] grid place-items-center bg-slate-950/70 p-5 backdrop-blur-sm" exit={{ opacity: 0 }} initial={{ opacity: 0 }} role="status" transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}>
          <motion.div animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-sm rounded-[2rem] bg-white p-7 text-center shadow-[0_28px_80px_rgba(15,23,42,0.3)]" initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.97, y: shouldReduceMotion ? 0 : 10 }} transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}>
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-teal-50"><Spinner /></span>
            <h2 className="mt-5 text-lg font-black text-slate-950">{t("patientResults.loadingTitle")}</h2>
            <p className="mt-2 text-sm font-medium leading-7 text-slate-600">{t("patientResults.loadingDescription")}</p>
          </motion.div>
        </motion.div> : null}
      </AnimatePresence>
    </>
  );
}
