"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";
import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  submitHomeSamplingRequest,
  type HomeSamplingRequestState,
} from "@/app/home-sampling-actions";
import { useTranslations } from "@/components/i18n/dictionary-provider";
import { useToast } from "@/components/ui/toast-provider";
import { jalaliMonths } from "@/lib/patient-identity";

const subscribeToPortal = () => () => {};
const getPortalContainer = () => document.body;
const getServerPortalContainer = () => null;
const initialState: HomeSamplingRequestState = {};
const otherInsuranceValue = "__other__";

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path d="M12 16V4m0 0L8 8m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function getCurrentJalaliYear() {
  const formatted = new Intl.DateTimeFormat("en-u-ca-persian", {
    year: "numeric",
  }).format(new Date());
  const year = Number.parseInt(formatted, 10);

  return Number.isFinite(year) ? year : 1404;
}

const fieldClassName =
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10";
const labelClassName = "grid gap-2 text-sm font-black text-slate-950";

export function HomeSamplingRequestModal({
  insuranceOptions,
  isOpen,
  onClose,
}: {
  insuranceOptions: string[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslations();
  const { toast } = useToast();
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [primaryInsurance, setPrimaryInsurance] = useState("");
  const [supplementaryInsurance, setSupplementaryInsurance] = useState("");
  const [prescriptionName, setPrescriptionName] = useState<string | null>(null);
  const portalContainer = useSyncExternalStore(
    subscribeToPortal,
    getPortalContainer,
    getServerPortalContainer,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [, formAction, isPending] = useActionState(
    async (previousState: HomeSamplingRequestState, formData: FormData) => {
      const result = await submitHomeSamplingRequest(previousState, formData);

      if (result.messageKey) {
        toast(t(result.messageKey), {
          variant: result.success ? "success" : "error",
        });
      }

      if (result.success) {
        formRef.current?.reset();
        setBirthYear("");
        setBirthMonth("");
        setBirthDay("");
        setPrimaryInsurance("");
        setSupplementaryInsurance("");
        setPrescriptionName(null);
        onClose();
      }

      return result;
    },
    initialState,
  );

  const years = useMemo(() => {
    const currentYear = getCurrentJalaliYear();
    return Array.from({ length: 121 }, (_, index) => currentYear - index);
  }, []);
  const days = useMemo(
    () => Array.from({ length: Number(birthMonth) > 6 ? 30 : 31 }, (_, index) => index + 1),
    [birthMonth],
  );
  const birthDate =
    birthYear && birthMonth && birthDay
      ? `${birthYear}/${birthMonth.padStart(2, "0")}/${birthDay.padStart(2, "0")}`
      : "";

  useEffect(() => {
    if (!isOpen) return;

    returnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
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
    const frame = window.requestAnimationFrame(() => {
      const firstField = dialogRef.current?.querySelector<HTMLInputElement>(
        'input[name="firstName"]',
      );
      (firstField ?? closeButtonRef.current)?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!portalContainer) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-5"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            aria-label={t("homeSampling.close")}
            className="absolute inset-0 cursor-default bg-slate-950/85 backdrop-blur-md"
            onClick={onClose}
            tabIndex={-1}
            type="button"
          />

          <motion.section
            animate={{ opacity: 1, scale: 1, y: 0 }}
            aria-labelledby="home-sampling-title"
            aria-modal="true"
            className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_32px_88px_rgba(15,23,42,0.34)] sm:max-h-[min(90dvh,54rem)] sm:rounded-[2rem]"
            exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.985, y: shouldReduceMotion ? 0 : 12 }}
            id="home-sampling-dialog"
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.975, y: shouldReduceMotion ? 0 : 18 }}
            ref={dialogRef}
            role="dialog"
            transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 pb-4 pt-5 sm:px-7 sm:pb-5 sm:pt-6">
              <div className="min-w-0">
                <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-extrabold text-teal-500">
                  {t("homeSampling.eyebrow")}
                </span>
                <h2
                  className="mt-2 text-xl font-black tracking-[-0.04em] text-slate-950 sm:text-2xl"
                  id="home-sampling-title"
                >
                  {t("homeSampling.title")}
                </h2>
                <p className="mt-1.5 text-sm font-medium leading-6 text-slate-600">
                  {t("homeSampling.description")}
                </p>
              </div>
              <button
                aria-label={t("homeSampling.close")}
                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition duration-200 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-500 active:scale-95"
                onClick={onClose}
                ref={closeButtonRef}
                type="button"
              >
                <CloseIcon />
              </button>
            </header>

            <form
              action={formAction}
              className="overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6"
              ref={formRef}
            >
              <input name="birthDate" type="hidden" value={birthDate} />

              <p className="text-xs font-extrabold tracking-wide text-teal-500">
                {t("homeSampling.sectionGeneral")}
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className={labelClassName}>
                  {t("homeSampling.firstName")}
                  <input
                    autoComplete="given-name"
                    className={fieldClassName}
                    maxLength={80}
                    name="firstName"
                    required
                  />
                </label>
                <label className={labelClassName}>
                  {t("homeSampling.lastName")}
                  <input
                    autoComplete="family-name"
                    className={fieldClassName}
                    maxLength={80}
                    name="lastName"
                    required
                  />
                </label>
                <label className={labelClassName}>
                  {t("homeSampling.nationalCode")}
                  <input
                    autoComplete="off"
                    className={`${fieldClassName} font-mono tracking-[0.14em]`}
                    dir="ltr"
                    inputMode="numeric"
                    maxLength={10}
                    name="nationalCode"
                    required
                  />
                </label>
                <label className={labelClassName}>
                  {t("homeSampling.mobile")}
                  <input
                    autoComplete="tel"
                    className={`${fieldClassName} font-mono tracking-[0.14em]`}
                    dir="ltr"
                    inputMode="tel"
                    maxLength={11}
                    name="mobile"
                    placeholder="09xxxxxxxxx"
                    required
                  />
                </label>
              </div>

              <fieldset className="mt-4">
                <legend className="pb-2 text-sm font-black text-slate-950">
                  {t("homeSampling.birthDate")}
                </legend>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <select
                    aria-label={t("homeSampling.day")}
                    className={fieldClassName}
                    onChange={(event) => setBirthDay(event.target.value)}
                    required
                    value={birthDay}
                  >
                    <option value="">{t("homeSampling.day")}</option>
                    {days.map((day) => (
                      <option key={day} value={String(day)}>
                        {day.toLocaleString("fa-IR")}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label={t("homeSampling.month")}
                    className={fieldClassName}
                    onChange={(event) => {
                      setBirthMonth(event.target.value);
                      if (Number(event.target.value) > 6 && birthDay === "31") {
                        setBirthDay("");
                      }
                    }}
                    required
                    value={birthMonth}
                  >
                    <option value="">{t("homeSampling.month")}</option>
                    {jalaliMonths.map((month, index) => (
                      <option key={month} value={String(index + 1)}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label={t("homeSampling.year")}
                    className={fieldClassName}
                    onChange={(event) => setBirthYear(event.target.value)}
                    required
                    value={birthYear}
                  >
                    <option value="">{t("homeSampling.year")}</option>
                    {years.map((year) => (
                      <option key={year} value={String(year)}>
                        {year.toLocaleString("fa-IR", { useGrouping: false })}
                      </option>
                    ))}
                  </select>
                </div>
              </fieldset>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className={labelClassName}>
                  {t("homeSampling.phone")}
                  <input
                    autoComplete="tel-national"
                    className={`${fieldClassName} font-mono tracking-[0.14em]`}
                    dir="ltr"
                    inputMode="tel"
                    maxLength={11}
                    name="phone"
                  />
                  <span className="text-xs font-medium text-slate-500">
                    {t("homeSampling.optional")}
                  </span>
                </label>
                <label className={labelClassName}>
                  {t("homeSampling.address")}
                  <input
                    autoComplete="street-address"
                    className={fieldClassName}
                    maxLength={500}
                    name="address"
                  />
                  <span className="text-xs font-medium text-slate-500">
                    {t("homeSampling.addressHint")}
                  </span>
                </label>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className={labelClassName}>
                  <label htmlFor="home-sampling-primary-insurance">
                    {t("homeSampling.primaryInsurance")}
                  </label>
                  <select
                    className={fieldClassName}
                    id="home-sampling-primary-insurance"
                    name={primaryInsurance === otherInsuranceValue ? undefined : "primaryInsurance"}
                    onChange={(event) => setPrimaryInsurance(event.target.value)}
                    value={primaryInsurance}
                  >
                    <option value="">{t("homeSampling.selectPlaceholder")}</option>
                    {insuranceOptions.map((insurance) => (
                      <option key={insurance} value={insurance}>
                        {insurance}
                      </option>
                    ))}
                    <option value={otherInsuranceValue}>
                      {t("homeSampling.otherOption")}
                    </option>
                  </select>
                  {primaryInsurance === otherInsuranceValue ? (
                    <input
                      aria-label={t("homeSampling.primaryInsurance")}
                      className={fieldClassName}
                      maxLength={100}
                      name="primaryInsurance"
                      placeholder={t("homeSampling.otherPlaceholder")}
                    />
                  ) : null}
                </div>

                <div className={labelClassName}>
                  <label htmlFor="home-sampling-supplementary-insurance">
                    {t("homeSampling.supplementaryInsurance")}
                  </label>
                  <select
                    className={fieldClassName}
                    id="home-sampling-supplementary-insurance"
                    name={
                      supplementaryInsurance === otherInsuranceValue
                        ? undefined
                        : "supplementaryInsurance"
                    }
                    onChange={(event) => setSupplementaryInsurance(event.target.value)}
                    value={supplementaryInsurance}
                  >
                    <option value="">{t("homeSampling.selectPlaceholder")}</option>
                    {insuranceOptions.map((insurance) => (
                      <option key={insurance} value={insurance}>
                        {insurance}
                      </option>
                    ))}
                    <option value={otherInsuranceValue}>
                      {t("homeSampling.otherOption")}
                    </option>
                  </select>
                  {supplementaryInsurance === otherInsuranceValue ? (
                    <input
                      aria-label={t("homeSampling.supplementaryInsurance")}
                      className={fieldClassName}
                      maxLength={100}
                      name="supplementaryInsurance"
                      placeholder={t("homeSampling.otherPlaceholder")}
                    />
                  ) : null}
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-sm font-black text-slate-950">
                {t("homeSampling.prescription")}
                <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-center transition hover:border-teal-300 hover:bg-teal-50/60 focus-within:border-teal-500">
                  <span className="grid size-10 place-items-center rounded-xl bg-white text-teal-500 ring-1 ring-teal-100">
                    <UploadIcon />
                  </span>
                  <span className="text-sm font-extrabold text-slate-700">
                    {prescriptionName ?? t("homeSampling.chooseFile")}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {t("homeSampling.prescriptionHint")}
                  </span>
                  <input
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="sr-only"
                    name="prescription"
                    onChange={(event) =>
                      setPrescriptionName(event.target.files?.[0]?.name ?? null)
                    }
                    type="file"
                  />
                </label>
              </div>

              <label className={`${labelClassName} mt-4`}>
                {t("homeSampling.notes")}
                <textarea
                  className="min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium leading-7 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  maxLength={2000}
                  name="description"
                  placeholder={t("homeSampling.notesPlaceholder")}
                />
              </label>

              <label className="mt-4 flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <input
                  className="mt-0.5 size-5 shrink-0 accent-teal-500"
                  name="isPersonalRequest"
                  type="checkbox"
                />
                <span className="text-sm font-bold leading-6 text-slate-800">
                  {t("homeSampling.personalRequest")}
                  <span className="mt-1 block text-xs font-medium text-slate-500">
                    {t("homeSampling.personalRequestHint")}
                  </span>
                </span>
              </label>

              <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-medium leading-6 text-slate-500">
                  {t("homeSampling.privacyNote")}
                </p>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
                    onClick={onClose}
                    type="button"
                  >
                    {t("homeSampling.cancel")}
                  </button>
                  <button
                    className="min-h-12 rounded-xl bg-teal-500 px-6 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(13,148,136,0.24)] transition duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 disabled:opacity-60"
                    disabled={isPending}
                    type="submit"
                  >
                    {isPending
                      ? t("homeSampling.submitting")
                      : t("homeSampling.submit")}
                  </button>
                </div>
              </div>
            </form>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    portalContainer,
  );
}
