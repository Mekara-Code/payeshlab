"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

type ClockTimePickerModalProps = {
  initialValue: string;
  onClose: () => void;
  onSelect: (value: string) => void;
  title: string;
};

function parseTime(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  const hour = match ? Number(match[1]) : 8;
  const minute = match ? Number(match[2]) : 0;

  return {
    hour: Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : 8,
    minute:
      Number.isInteger(minute) && minute >= 0 && minute <= 59
        ? Math.round(minute / 5) * 5 % 60
        : 0,
  };
}

function formatTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatPersianNumber(value: number) {
  return new Intl.NumberFormat("fa-IR", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  }).format(value);
}

function dialPosition(index: number) {
  const angle = (index * 30 - 90) * (Math.PI / 180);
  return {
    left: `${50 + Math.cos(angle) * 40}%`,
    top: `${50 + Math.sin(angle) * 40}%`,
  };
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function ClockTimePickerModal({
  initialValue,
  onClose,
  onSelect,
  title,
}: ClockTimePickerModalProps) {
  const initialTime = parseTime(initialValue);
  const [hour, setHour] = useState(initialTime.hour);
  const [hourPage, setHourPage] = useState(initialTime.hour >= 12 ? 12 : 0);
  const [minute, setMinute] = useState(initialTime.minute);
  const [stage, setStage] = useState<"hour" | "minute">("hour");
  const shouldReduceMotion = useReducedMotion();
  const dialValues =
    stage === "hour"
      ? Array.from({ length: 12 }, (_, index) => hourPage + index)
      : Array.from({ length: 12 }, (_, index) => index * 5);
  const selectedValue = stage === "hour" ? hour : minute;
  const selectedIndex =
    stage === "hour" ? hour % 12 : Math.floor(minute / 5);
  const transition = {
    duration: shouldReduceMotion ? 0 : 0.28,
    ease: [0.16, 1, 0.3, 1] as const,
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const chooseValue = (value: number) => {
    if (stage === "hour") {
      setHour(value);
      setStage("minute");
      return;
    }

    setMinute(value);
  };

  return (
    <motion.div
      animate={{ opacity: 1 }}
      aria-labelledby="clock-time-picker-title"
      aria-modal="true"
      className="fixed inset-0 z-[120] grid place-items-center p-3 sm:p-5"
      initial={{ opacity: 0 }}
      role="dialog"
      transition={transition}
    >
      <button
        aria-label="بستن انتخابگر ساعت"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />

      <motion.section
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col overflow-y-auto rounded-2xl bg-white p-5 text-right sm:max-h-[min(90dvh,43rem)] sm:p-7"
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        transition={transition}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold tracking-wide text-teal-500">
              {stage === "hour" ? "مرحلهٔ ۱ از ۲" : "مرحلهٔ ۲ از ۲"}
            </p>
            <h2
              className="mt-1 text-xl font-black tracking-[-0.04em] text-slate-950"
              id="clock-time-picker-title"
            >
              {title}
            </h2>
          </div>
          <button
            aria-label="بستن"
            className="grid size-11 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
            onClick={onClose}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
          <span className="text-sm font-bold text-slate-600">
            {stage === "hour" ? "ساعت را انتخاب کنید" : "دقیقه را انتخاب کنید"}
          </span>
          <bdi className="font-mono text-xl font-black tracking-tight text-teal-500" dir="ltr">
            {formatPersianNumber(hour)}:{formatPersianNumber(minute)}
          </bdi>
        </div>

        {stage === "hour" ? (
          <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-1.5">
            {[
              { label: "۰۰ تا ۱۱", value: 0 },
              { label: "۱۲ تا ۲۳", value: 12 },
            ].map((option) => (
              <button
                className={`min-h-11 rounded-xl px-3 text-sm font-extrabold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${
                  hourPage === option.value
                    ? "bg-white text-teal-500"
                    : "text-slate-500 hover:text-slate-950"
                }`}
                key={option.value}
                onClick={() => setHourPage(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          <button
            className="mt-5 inline-flex min-h-11 w-fit items-center rounded-xl px-3 text-sm font-extrabold text-teal-500 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
            onClick={() => setStage("hour")}
            type="button"
          >
            اصلاح ساعت
          </button>
        )}

        <div
          aria-label={stage === "hour" ? "صفحهٔ ساعت‌ها" : "صفحهٔ دقیقه‌ها"}
          className="relative mx-auto mt-6 size-[min(17rem,calc(100vw-3.5rem))] rounded-full border border-slate-200 bg-white sm:size-80"
          role="group"
        >
          <span aria-hidden="true" className="absolute inset-[13%] rounded-full border border-slate-100" />
          <span aria-hidden="true" className="absolute inset-[30%] rounded-full bg-teal-50" />
          <span className="absolute left-1/2 top-1/2 h-[35%] w-px -translate-x-1/2 -translate-y-full">
            <motion.span
              animate={{ rotate: selectedIndex * 30 }}
              className="absolute bottom-0 left-0 h-full w-0.5 origin-bottom rounded-full bg-teal-500"
              transition={transition}
            />
          </span>
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500"
          />
          <span className="absolute left-1/2 top-1/2 flex size-[27%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-center text-xs font-black leading-5 text-slate-700">
            {stage === "hour" ? "ساعت" : "دقیقه"}
          </span>

          {dialValues.map((value, index) => {
            const isSelected = selectedValue === value;
            return (
              <button
                aria-label={
                  stage === "hour"
                    ? `انتخاب ساعت ${formatPersianNumber(value)}`
                    : `انتخاب دقیقه ${formatPersianNumber(value)}`
                }
                className={`absolute grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-xs font-black transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 sm:size-11 sm:text-sm ${
                  isSelected
                    ? "bg-teal-500 text-white"
                    : "text-slate-700 hover:bg-teal-50 hover:text-teal-500"
                }`}
                key={value}
                onClick={() => chooseValue(value)}
                style={dialPosition(index)}
                type="button"
              >
                {formatPersianNumber(value)}
              </button>
            );
          })}
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            className="min-h-12 rounded-xl px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
            onClick={onClose}
            type="button"
          >
            انصراف
          </button>
          <button
            className="min-h-12 rounded-xl bg-teal-500 px-5 text-sm font-extrabold text-white transition hover:bg-slate-950 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal-500"
            onClick={() => onSelect(formatTime(hour, minute))}
            type="button"
          >
            تأیید زمان
          </button>
        </div>
      </motion.section>
    </motion.div>
  );
}
