"use client";

/* eslint-disable @next/next/no-img-element -- Insurance logos are administrator-configured external URLs. */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { InsurancePartner } from "@/lib/insurance-data";

function ShieldIcon() {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <path d="M12 3.5 19 6v5.1c0 4.3-2.8 7.9-7 9.4-4.2-1.5-7-5.1-7-9.4V6l7-2.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="m9.25 12 1.75 1.75 3.75-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path d="M8 6h11M8 12h11M8 18h11M4.5 6.05h.01M4.5 12.05h.01M4.5 18.05h.01" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
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

function normalizeSearchValue(value: string) {
  return value
    .toLowerCase()
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[‌\s]+/g, " ")
    .trim();
}

function withoutInsurancePrefix(value: string) {
  return value.replace(/^بیمه\s+/, "");
}

function getEditDistance(firstValue: string, secondValue: string) {
  const first = withoutInsurancePrefix(normalizeSearchValue(firstValue));
  const second = withoutInsurancePrefix(normalizeSearchValue(secondValue));
  const rows = Array.from({ length: first.length + 1 }, (_, index) => index);

  for (let column = 1; column <= second.length; column += 1) {
    let previousDiagonal = rows[0];
    rows[0] = column;

    for (let row = 1; row <= first.length; row += 1) {
      const previousRow = rows[row];
      rows[row] = Math.min(
        rows[row] + 1,
        rows[row - 1] + 1,
        previousDiagonal + Number(first[row - 1] !== second[column - 1]),
      );
      previousDiagonal = previousRow;
    }
  }

  return rows[first.length];
}

function getSuggestionScore(name: string, query: string) {
  const normalizedName = withoutInsurancePrefix(normalizeSearchValue(name));
  const normalizedQuery = withoutInsurancePrefix(normalizeSearchValue(query));

  if (normalizedName === normalizedQuery) return -1000;
  if (normalizedName.startsWith(normalizedQuery)) return -500;
  if (normalizedName.includes(normalizedQuery)) return -300;

  return getEditDistance(normalizedName, normalizedQuery);
}

function InsuranceLogo({ logoUrl, name }: Pick<InsurancePartner, "logoUrl" | "name">) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const hasError = failedUrl === logoUrl;

  if (!logoUrl || hasError) {
    return (
      <span aria-hidden="true" className="flex size-full items-center justify-center text-teal-500">
        <ShieldIcon />
      </span>
    );
  }

  return <img alt={`لوگوی ${name}`} className="max-h-full max-w-full object-contain" onError={() => setFailedUrl(logoUrl)} src={logoUrl} />;
}

type InsurancePartnersModalProps = {
  insurances: InsurancePartner[];
};

export function InsurancePartnersModal({ insurances }: InsurancePartnersModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion() ?? false;
  const normalizedQuery = normalizeSearchValue(searchQuery);
  const matchingInsurances = useMemo(
    () => (normalizedQuery ? insurances.filter((insurance) => normalizeSearchValue(insurance.name).includes(normalizedQuery)) : insurances),
    [insurances, normalizedQuery],
  );
  const suggestedInsurances = useMemo(() => {
    if (!normalizedQuery) return [];

    return [...insurances]
      .sort((first, second) => getSuggestionScore(first.name, normalizedQuery) - getSuggestionScore(second.name, normalizedQuery))
      .slice(0, 3);
  }, [insurances, normalizedQuery]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openModal = () => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSearchQuery("");
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const focusDialog = () => searchInputRef.current?.focus() ?? closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const focusable = focusableElements ? Array.from(focusableElements) : [];

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    const frame = window.requestAnimationFrame(focusDialog);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [closeModal, isOpen]);

  return (
    <>
      <button
        aria-controls="insurance-partners-dialog"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="inline-flex min-h-11 items-center gap-2 px-1 py-2 text-sm font-extrabold text-teal-500 underline-offset-4 transition-[color,text-decoration-color,transform] duration-200 hover:text-teal-500 hover:underline focus-visible:rounded-sm focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-teal-500 active:scale-[0.98]"
        onClick={openModal}
        type="button"
      >
        <ListIcon />
        مشاهده فهرست بیمه‌ها
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            <button aria-label="بستن فهرست بیمه‌های طرف قرارداد" className="absolute inset-0 cursor-default bg-slate-950/85 backdrop-blur-md" onClick={closeModal} tabIndex={-1} type="button" />

            <motion.section
              animate={{ opacity: 1, scale: 1, y: 0 }}
              aria-labelledby="insurance-partners-title"
              aria-modal="true"
              className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_32px_88px_rgba(15,23,42,0.34)] sm:max-h-[min(86dvh,46rem)] sm:rounded-[2rem]"
              exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.985, y: shouldReduceMotion ? 0 : 12 }}
              id="insurance-partners-dialog"
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.975, y: shouldReduceMotion ? 0 : 18 }}
              ref={dialogRef}
              role="dialog"
              transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 pb-4 pt-5 sm:px-7 sm:pb-5 sm:pt-6">
                <div>
                  <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-extrabold text-teal-500">پوشش درمان</span>
                  <h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-slate-950 sm:text-2xl" id="insurance-partners-title">
                    فهرست بیمه‌های طرف قرارداد
                  </h2>
                  <p className="mt-1.5 text-sm font-medium leading-6 text-slate-600">پذیرش آزمایش‌ها با پوشش بیمه‌های همکار آزمایشگاه پایش.</p>
                </div>
                <button
                  aria-label="بستن مودال"
                  className="flex size-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-[background-color,color,transform] duration-200 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-500 active:scale-95"
                  onClick={closeModal}
                  ref={closeButtonRef}
                  type="button"
                >
                  <CloseIcon />
                </button>
              </header>

              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-3 sm:px-7">
                <p className="text-sm font-bold text-slate-700">بیمه‌های فعال</p>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-teal-500 ring-1 ring-teal-100">{insurances.length.toLocaleString("fa-IR")} مورد</span>
              </div>

              {insurances.length > 0 ? (
                <div className="border-b border-slate-100 px-5 py-4 sm:px-7">
                  <label className="sr-only" htmlFor="insurance-search">جست‌وجوی نام بیمه</label>
                  <div className="relative">
                    <input
                      className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-base font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                      id="insurance-search"
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="نام بیمه را جست‌وجو کنید…"
                      ref={searchInputRef}
                      type="search"
                      value={searchQuery}
                    />
                    <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><SearchIcon /></span>
                    {searchQuery ? (
                      <button aria-label="پاک کردن جست‌وجو" className="absolute left-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500" onClick={() => setSearchQuery("")} type="button"><CloseIcon /></button>
                    ) : null}
                  </div>
                  {normalizedQuery ? <p aria-live="polite" className="mt-2 text-xs font-bold text-slate-500">{matchingInsurances.length.toLocaleString("fa-IR")} نتیجهٔ دقیق پیدا شد.</p> : null}
                </div>
              ) : null}

              <div className="overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
                {insurances.length > 0 ? (
                  <>
                    {normalizedQuery && suggestedInsurances.length > 0 ? (
                      <section aria-labelledby="insurance-suggestions-title" className="mb-6">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h3 className="text-sm font-black text-slate-900" id="insurance-suggestions-title">پیشنهادهای نزدیک</h3>
                          <span className="text-xs font-bold text-teal-500">براساس نام واردشده</span>
                        </div>
                        <ul className="grid gap-2 sm:grid-cols-3" role="list">
                          {suggestedInsurances.map((insurance) => (
                            <li className="flex min-h-20 items-center gap-3 rounded-2xl bg-teal-50/70 p-3" key={`suggestion-${insurance.id}`}>
                              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white p-2 ring-1 ring-teal-100"><InsuranceLogo logoUrl={insurance.logoUrl} name={insurance.name} /></div>
                              <p className="min-w-0 truncate text-sm font-extrabold text-slate-900">{insurance.name}</p>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ) : null}

                    {matchingInsurances.length > 0 ? (
                      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="list">
                    {matchingInsurances.map((insurance, index) => (
                      <motion.li
                        animate={{ opacity: 1, y: 0 }}
                        className="flex min-h-24 items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-50/60"
                        initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 8 }}
                        key={insurance.id}
                        transition={{ delay: shouldReduceMotion ? 0 : Math.min(index * 0.035, 0.21), duration: shouldReduceMotion ? 0 : 0.22, ease: "easeOut" }}
                      >
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-white p-2 ring-1 ring-slate-100">
                          <InsuranceLogo logoUrl={insurance.logoUrl} name={insurance.name} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-extrabold text-slate-900 sm:text-base">{insurance.name}</p>
                          <p className="mt-1 text-xs font-bold text-teal-500">بیمه طرف قرارداد</p>
                        </div>
                      </motion.li>
                    ))}
                      </ul>
                    ) : (
                      <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl bg-slate-50 px-5 text-center">
                        <span className="flex size-12 items-center justify-center rounded-full bg-white text-teal-500 ring-1 ring-teal-100"><SearchIcon /></span>
                        <p className="mt-3 text-sm font-bold text-slate-700">بیمه‌ای با این نام پیدا نشد.</p>
                        <p className="mt-1 text-xs font-medium text-slate-500">پیشنهادهای نزدیک را در بالا بررسی کنید.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex min-h-48 flex-col items-center justify-center text-center">
                    <span className="flex size-14 items-center justify-center rounded-full bg-teal-50 text-teal-500">
                      <ShieldIcon />
                    </span>
                    <p className="mt-4 text-sm font-bold text-slate-700">هنوز بیمه فعالی ثبت نشده است.</p>
                  </div>
                )}
              </div>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
