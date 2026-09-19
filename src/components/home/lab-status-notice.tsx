"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { useLabStatus } from "@/components/home/lab-status-provider";
import { useTranslations } from "@/components/i18n/dictionary-provider";
import { splitDuration } from "@/lib/lab-availability";
import type { ContentLocale } from "@/lib/content-locale";

const numberLocales: Record<ContentLocale, string> = {
  ar: "ar-EG",
  en: "en-US",
  fa: "fa-IR",
};

function OpenSignIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-7"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.713 7.14977C12.1271 7.13953 12.4545 6.79555 12.4443 6.38146C12.434 5.96738 12.0901 5.63999 11.676 5.65023L11.713 7.14977ZM6.30665 12.193H7.05665C7.05665 12.1874 7.05659 12.1818 7.05646 12.1761L6.30665 12.193ZM6.30665 14.51L6.34575 15.259C6.74423 15.2382 7.05665 14.909 7.05665 14.51H6.30665ZM6.30665 17.6L6.26755 18.349C6.28057 18.3497 6.29361 18.35 6.30665 18.35L6.30665 17.6ZM9.41983 18.35C9.83404 18.35 10.1698 18.0142 10.1698 17.6C10.1698 17.1858 9.83404 16.85 9.41983 16.85V18.35ZM10.9445 6.4C10.9445 6.81421 11.2803 7.15 11.6945 7.15C12.1087 7.15 12.4445 6.81421 12.4445 6.4H10.9445ZM12.4445 4C12.4445 3.58579 12.1087 3.25 11.6945 3.25C11.2803 3.25 10.9445 3.58579 10.9445 4H12.4445ZM11.713 5.65023C11.299 5.63999 10.955 5.96738 10.9447 6.38146C10.9345 6.79555 11.2619 7.13953 11.676 7.14977L11.713 5.65023ZM17.0824 12.193L16.3325 12.1761C16.3324 12.1818 16.3324 12.1874 16.3324 12.193H17.0824ZM17.0824 14.51H16.3324C16.3324 14.909 16.6448 15.2382 17.0433 15.259L17.0824 14.51ZM17.0824 17.6V18.35C17.0954 18.35 17.1084 18.3497 17.1215 18.349L17.0824 17.6ZM13.9692 16.85C13.555 16.85 13.2192 17.1858 13.2192 17.6C13.2192 18.0142 13.555 18.35 13.9692 18.35V16.85ZM10.1688 17.6027C10.1703 17.1885 9.83574 16.8515 9.42153 16.85C9.00732 16.8485 8.67034 17.1831 8.66886 17.5973L10.1688 17.6027ZM10.0848 19.3L10.6322 18.7873L10.6309 18.786L10.0848 19.3ZM13.3023 19.3L12.7561 18.786L12.7549 18.7873L13.3023 19.3ZM14.7182 17.5973C14.7167 17.1831 14.3797 16.8485 13.9655 16.85C13.5513 16.8515 13.2167 17.1885 13.2182 17.6027L14.7182 17.5973ZM9.41788 16.85C9.00366 16.85 8.66788 17.1858 8.66788 17.6C8.66788 18.0142 9.00366 18.35 9.41788 18.35V16.85ZM13.9692 18.35C14.3834 18.35 14.7192 18.0142 14.7192 17.6C14.7192 17.1858 14.3834 16.85 13.9692 16.85V18.35ZM11.676 5.65023C8.198 5.73622 5.47765 8.68931 5.55684 12.2099L7.05646 12.1761C6.99506 9.44664 9.09735 7.21444 11.713 7.14977L11.676 5.65023ZM5.55665 12.193V14.51H7.05665V12.193H5.55665ZM6.26755 13.761C5.0505 13.8246 4.125 14.8488 4.125 16.055H5.625C5.625 15.6136 5.95844 15.2792 6.34575 15.259L6.26755 13.761ZM4.125 16.055C4.125 17.2612 5.0505 18.2854 6.26755 18.349L6.34575 16.851C5.95843 16.8308 5.625 16.4964 5.625 16.055H4.125ZM6.30665 18.35H9.41983V16.85H6.30665V18.35ZM12.4445 6.4V4H10.9445V6.4H12.4445ZM11.676 7.14977C14.2917 7.21444 16.3939 9.44664 16.3325 12.1761L17.8322 12.2099C17.9114 8.68931 15.191 5.73622 11.713 5.65023L11.676 7.14977ZM16.3324 12.193V14.51H17.8324V12.193H16.3324ZM17.0433 15.259C17.4306 15.2792 17.764 15.6136 17.764 16.055H19.264C19.264 14.8488 18.3385 13.8246 17.1215 13.761L17.0433 15.259ZM17.764 16.055C17.764 16.4964 17.4306 16.8308 17.0433 16.851L17.1215 18.349C18.3385 18.2854 19.264 17.2612 19.264 16.055H17.764ZM17.0824 16.85H13.9692V18.35H17.0824V16.85ZM8.66886 17.5973C8.66592 18.4207 8.976 19.2162 9.53861 19.814L10.6309 18.786C10.335 18.4715 10.1673 18.0473 10.1688 17.6027L8.66886 17.5973ZM9.53739 19.8127C10.0977 20.4109 10.8758 20.7529 11.6935 20.7529V19.2529C11.2969 19.2529 10.9132 19.0873 10.6322 18.7873L9.53739 19.8127ZM11.6935 20.7529C12.5113 20.7529 13.2894 20.4109 13.8497 19.8127L12.7549 18.7873C12.4739 19.0873 12.0901 19.2529 11.6935 19.2529V20.7529ZM13.8484 19.814C14.4111 19.2162 14.7211 18.4207 14.7182 17.5973L13.2182 17.6027C13.2198 18.0473 13.0521 18.4715 12.7561 18.786L13.8484 19.814ZM9.41788 18.35H13.9692V16.85H9.41788V18.35Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ClosedSignIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-7"
      fill="currentColor"
      viewBox="0 0 56 56"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M 38.5235 11.1251 L 33.1797 11.1251 L 33.1797 10.9844 L 38.6407 3.7892 C 39.1329 3.1565 39.3204 2.7581 39.3204 2.3361 C 39.3204 1.6094 38.7578 1.1640 37.9844 1.1640 L 30.4610 1.1640 C 29.7578 1.1640 29.2188 1.6329 29.2188 2.3597 C 29.2188 3.1329 29.7578 3.5782 30.4610 3.5782 L 35.5000 3.5782 L 35.5000 3.7188 L 29.9688 10.8907 C 29.4766 11.5235 29.2891 11.8751 29.2891 12.3673 C 29.2891 13.0470 29.8282 13.5392 30.6016 13.5392 L 38.5235 13.5392 C 39.2266 13.5392 39.7422 13.0938 39.7422 12.3204 C 39.7422 11.5938 39.2266 11.1251 38.5235 11.1251 Z M 49.4924 20.0782 L 45.7188 20.0782 L 45.7188 19.9844 L 49.6095 14.8985 C 50.0545 14.3126 50.2422 13.9376 50.2422 13.5157 C 50.2422 12.8360 49.7031 12.4141 48.9766 12.4141 L 43.2344 12.4141 C 42.5782 12.4141 42.0860 12.8595 42.0860 13.5392 C 42.0860 14.2892 42.5782 14.7110 43.2344 14.7110 L 46.6329 14.7110 L 46.6329 14.8048 L 42.7657 19.8907 C 42.3204 20.4532 42.1563 20.8048 42.1563 21.2970 C 42.1563 21.9297 42.6485 22.3985 43.3751 22.3985 L 49.4924 22.3985 C 50.1721 22.3985 50.6406 21.9532 50.6406 21.2501 C 50.6406 20.5470 50.1721 20.0782 49.4924 20.0782 Z M 25.9844 54.8360 C 34.5157 54.8360 41.4531 50.5001 44.5938 43.0001 C 44.9922 42.0626 44.9219 41.2892 44.4531 40.8204 C 44.1016 40.4454 43.3751 40.3985 42.6251 40.7032 C 40.6797 41.4766 38.4297 41.8048 35.9922 41.8048 C 25.4922 41.8048 18.6251 35.1485 18.6251 25.0235 C 18.6251 22.2579 19.1641 19.1876 19.8907 17.7579 C 20.3360 16.8438 20.3360 16.0704 19.9610 15.6017 C 19.5391 15.0860 18.7657 14.9923 17.7578 15.3438 C 10.2813 18.0860 5.3594 25.9141 5.3594 34.6095 C 5.3594 46.2344 14.1251 54.8360 25.9844 54.8360 Z M 39.1563 28.0938 L 35.9453 28.0938 L 35.9453 28.0001 L 39.2500 23.6173 C 39.6719 23.0313 39.8594 22.7032 39.8594 22.3048 C 39.8594 21.6485 39.3438 21.2501 38.6641 21.2501 L 33.6016 21.2501 C 32.9688 21.2501 32.5000 21.6719 32.5000 22.3282 C 32.5000 23.0313 32.9688 23.4297 33.6016 23.4297 L 36.4141 23.4297 L 36.4141 23.5235 L 33.1563 27.8829 C 32.7344 28.4454 32.5704 28.7735 32.5704 29.2188 C 32.5704 29.8282 33.0391 30.2970 33.7188 30.2970 L 39.1563 30.2970 C 39.7891 30.2970 40.2344 29.8517 40.2344 29.1719 C 40.2344 28.5392 39.7891 28.0938 39.1563 28.0938 Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path
        d="m7 7 10 10M17 7 7 17"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function CountdownUnit({
  isOpen,
  label,
  value,
}: {
  isOpen: boolean;
  label: string;
  value: string;
}) {
  return (
    <span className="flex min-w-12 flex-col items-center gap-0.5">
      <bdi
        className={`grid min-h-9 w-full place-items-center rounded-xl px-2 font-mono text-base font-black tabular-nums ${
          isOpen ? "bg-teal-50 text-teal-600" : "bg-rose-50 text-rose-700"
        }`}
        dir="ltr"
      >
        {value}
      </bdi>
      <span className="text-[0.6rem] font-bold text-slate-500">{label}</span>
    </span>
  );
}

/**
 * Floating status bar with a live countdown to the next opening or closing.
 * It is driven by the server clock through {@link useLabStatus}.
 */
export function LabStatusNotice() {
  const labStatus = useLabStatus();
  const { locale, t } = useTranslations();
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [isDismissed, setIsDismissed] = useState(false);

  if (!labStatus) return null;

  const { remainingMs, status } = labStatus;
  const { isHoliday, isOpen, isWeeklyClosure } = status;
  const duration = splitDuration(remainingMs ?? 0);
  const numberLocale = numberLocales[locale];
  const formatUnit = (value: number) =>
    value.toLocaleString(numberLocale, {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });
  const hasCountdown = remainingMs !== null && duration.totalSeconds > 0;
  // A closure the visitor cannot infer from the working hours is named in the headline.
  const headline = isOpen
    ? t("labStatus.openTitle")
    : isHoliday
      ? t("labStatus.holidayTitle")
      : isWeeklyClosure
        ? t("labStatus.weeklyClosureTitle")
        : t("labStatus.closedTitle");
  const description = isOpen
    ? t("labStatus.openDescription")
    : isHoliday
      ? t("labStatus.holidayDescription")
      : isWeeklyClosure
        ? t("labStatus.weeklyClosureDescription")
        : hasCountdown
          ? t("labStatus.closedDescription")
          : t("labStatus.closedUnknownDescription");

  return (
    <AnimatePresence>
      {isDismissed ? null : (
        <motion.aside
          animate={{ opacity: 1, y: 0 }}
          aria-label={t("labStatus.title")}
          className="lab-status-notice pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex justify-center px-3 pb-4 sm:px-6 sm:pb-6"
          exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 28 }}
          transition={{
            delay: shouldReduceMotion ? 0 : 0.9,
            duration: shouldReduceMotion ? 0 : 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="pointer-events-auto w-full max-w-2xl overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/95 shadow-[0_22px_60px_rgba(15,23,42,0.22)] backdrop-blur-xl">
            <div className="flex items-start gap-3 p-3.5 sm:gap-4 sm:p-4">
              <span
                className={`relative grid size-11 shrink-0 place-items-center rounded-2xl sm:size-12 ${
                  isOpen ? "bg-teal-50 text-teal-500" : "bg-rose-50 text-rose-600"
                }`}
              >
                {isOpen ? <OpenSignIcon /> : <ClosedSignIcon />}
                <span
                  aria-hidden="true"
                  className={`absolute -top-0.5 -left-0.5 flex size-3 ${
                    isOpen ? "" : "opacity-80"
                  }`}
                >
                  <span
                    className={`absolute inline-flex size-full rounded-full opacity-70 ${
                      isOpen ? "animate-ping bg-teal-400" : "bg-rose-400"
                    }`}
                  />
                  <span
                    className={`relative inline-flex size-3 rounded-full ring-2 ring-white ${
                      isOpen ? "bg-teal-500" : "bg-rose-500"
                    }`}
                  />
                </span>
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    className={`text-sm font-black ${
                      isOpen ? "text-teal-600" : "text-rose-700"
                    }`}
                  >
                    {headline}
                  </h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.6rem] font-black text-slate-500">
                    {t("labStatus.title")}
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold leading-6 text-slate-600">
                  {description}
                </p>

                {hasCountdown ? (
                  <p className="mt-2 text-[0.65rem] font-black text-slate-400">
                    {isOpen
                      ? t("labStatus.openCountdownLead")
                      : t("labStatus.closedCountdownLead")}
                  </p>
                ) : null}

                {hasCountdown ? (
                  // The countdown reads like a clock: hours on the left, seconds on the right.
                  <div
                    className="mt-1.5 flex flex-wrap items-center gap-1.5"
                    dir="ltr"
                  >
                    {duration.days > 0 ? (
                      <CountdownUnit
                        isOpen={isOpen}
                        label={t("labStatus.unitDays")}
                        value={formatUnit(duration.days)}
                      />
                    ) : null}
                    <CountdownUnit
                      isOpen={isOpen}
                      label={t("labStatus.unitHours")}
                      value={formatUnit(duration.hours)}
                    />
                    <CountdownUnit
                      isOpen={isOpen}
                      label={t("labStatus.unitMinutes")}
                      value={formatUnit(duration.minutes)}
                    />
                    <CountdownUnit
                      isOpen={isOpen}
                      label={t("labStatus.unitSeconds")}
                      value={formatUnit(duration.seconds)}
                    />
                  </div>
                ) : null}
              </div>

              <button
                aria-label={t("labStatus.dismiss")}
                className="grid size-9 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                onClick={() => setIsDismissed(true)}
                type="button"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
