"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { AdminModal } from "@/components/admin/admin-modal";
import {
  MAX_JALALI_YEAR,
  MIN_JALALI_YEAR,
  getJalaliMonthLength,
  getJalaliMonthName,
  getJalaliWeekDayIndex,
  getCurrentTehranJalali,
} from "@/lib/jalali";

type CalendarStage = "year" | "month" | "day";

const weekDayLabels = ["ش", "ی", "د", "س", "چ", "پ", "ج"] as const;
const FRIDAY_INDEX = 6;

function formatPersianNumber(value: number) {
  return value.toLocaleString("fa-IR", { useGrouping: false });
}

function StepDots({ stage }: { stage: CalendarStage }) {
  const stages: CalendarStage[] = ["year", "month", "day"];
  const activeIndex = stages.indexOf(stage);

  return (
    <div className="flex items-center gap-1.5" dir="ltr">
      {stages.map((item, index) => (
        <span
          aria-hidden="true"
          className={`h-1.5 rounded-full transition-all duration-300 ${
            index === activeIndex
              ? "w-7 bg-teal-500"
              : index < activeIndex
                ? "w-3 bg-teal-200"
                : "w-3 bg-slate-200"
          }`}
          key={item}
        />
      ))}
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path
        d="m14 6-6 6 6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="size-3.5" fill="none" viewBox="0 0 24 24">
      <path
        d="m5 12.5 4.5 4.5L19 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.6"
      />
    </svg>
  );
}

/**
 * Three-step Jalali calendar (year → month → day) for picking the laboratory
 * closure days. Fridays are rendered as the permanent weekly closure and can
 * not be toggled; already stored days keep a distinct colour from the ones the
 * admin just picked, so the pending change stays readable before saving.
 */
export function HolidayCalendarModal({
  holidays,
  isOpen,
  isSaving,
  onClose,
  onSave,
}: {
  holidays: readonly string[];
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (year: number, month: number, days: number[]) => void;
}) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const today = useMemo(() => getCurrentTehranJalali(), []);
  const [stage, setStage] = useState<CalendarStage>("year");
  const [year, setYear] = useState(today.year);
  const [month, setMonth] = useState(today.month);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const storedDates = useMemo(() => new Set(holidays), [holidays]);
  const years = useMemo(() => {
    const firstYear = Math.max(MIN_JALALI_YEAR, today.year - 1);
    return Array.from({ length: 8 }, (_, index) => firstYear + index).filter(
      (item) => item <= MAX_JALALI_YEAR,
    );
  }, [today.year]);
  const monthDayCount = getJalaliMonthLength(year, month);
  const leadingBlanks = getJalaliWeekDayIndex(year, month, 1);
  const storedDaysOfMonth = useMemo(() => {
    const prefix = `${year}/${String(month).padStart(2, "0")}/`;
    return new Set(
      holidays
        .filter((date) => date.startsWith(prefix))
        .map((date) => Number(date.slice(prefix.length))),
    );
  }, [holidays, month, year]);
  const selectedSet = useMemo(() => new Set(selectedDays), [selectedDays]);
  const addedCount = selectedDays.filter((day) => !storedDaysOfMonth.has(day)).length;
  const removedCount = [...storedDaysOfMonth].filter(
    (day) => !selectedSet.has(day),
  ).length;

  function openYear(nextYear: number) {
    setYear(nextYear);
    setStage("month");
  }

  function openMonth(nextMonth: number) {
    const prefix = `${year}/${String(nextMonth).padStart(2, "0")}/`;
    setMonth(nextMonth);
    setSelectedDays(
      holidays
        .filter((date) => date.startsWith(prefix))
        .map((date) => Number(date.slice(prefix.length)))
        .filter((day) => Number.isInteger(day)),
    );
    setStage("day");
  }

  function toggleDay(day: number) {
    setSelectedDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day],
    );
  }

  function countHolidaysInMonth(monthNumber: number) {
    const prefix = `${year}/${String(monthNumber).padStart(2, "0")}/`;
    return holidays.filter((date) => date.startsWith(prefix)).length;
  }

  const transition = {
    duration: shouldReduceMotion ? 0 : 0.24,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <AdminModal
      description="سال، سپس ماه و در پایان روزهای تعطیل آزمایشگاه را انتخاب کنید."
      eyebrow="تقویم شمسی"
      id="holiday-calendar-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="تنظیم ایام تعطیل"
    >
      <div className="flex items-center justify-between gap-3">
        <StepDots stage={stage} />
        <p className="text-xs font-extrabold text-slate-500">
          {stage === "year"
            ? "مرحلهٔ ۱ از ۳ — انتخاب سال"
            : stage === "month"
              ? "مرحلهٔ ۲ از ۳ — انتخاب ماه"
              : "مرحلهٔ ۳ از ۳ — انتخاب روز"}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2.5">
        <button
          className="inline-flex min-h-9 items-center gap-1 rounded-xl px-2.5 text-xs font-extrabold text-teal-600 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
          onClick={() => setStage("year")}
          type="button"
        >
          {formatPersianNumber(year)}
        </button>
        {stage !== "year" ? (
          <>
            <ChevronIcon />
            <button
              className="inline-flex min-h-9 items-center gap-1 rounded-xl px-2.5 text-xs font-extrabold text-teal-600 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
              onClick={() => setStage("month")}
              type="button"
            >
              {getJalaliMonthName(month)}
            </button>
          </>
        ) : null}
        <span className="ms-auto text-[0.7rem] font-bold text-slate-500">
          امروز: {formatPersianNumber(today.day)} {getJalaliMonthName(today.month)}{" "}
          {formatPersianNumber(today.year)}
        </span>
      </div>

      <AnimatePresence initial={false} mode="wait">
        {stage === "year" ? (
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"
            exit={{ opacity: 0, x: shouldReduceMotion ? 0 : 16 }}
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -16 }}
            key="year"
            transition={transition}
          >
            {years.map((item) => (
              <button
                className={`min-h-14 rounded-2xl border text-base font-black transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${
                  item === year
                    ? "border-teal-500 bg-teal-500 text-white shadow-[0_10px_20px_rgba(13,148,136,0.25)]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50/60 hover:text-teal-600"
                }`}
                key={item}
                onClick={() => openYear(item)}
                type="button"
              >
                {formatPersianNumber(item)}
                {item === today.year ? (
                  <span className="mt-0.5 block text-[0.65rem] font-bold opacity-80">
                    سال جاری
                  </span>
                ) : null}
              </button>
            ))}
          </motion.div>
        ) : null}

        {stage === "month" ? (
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3"
            exit={{ opacity: 0, x: shouldReduceMotion ? 0 : 16 }}
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -16 }}
            key="month"
            transition={transition}
          >
            {Array.from({ length: 12 }, (_, index) => index + 1).map((item) => {
              const count = countHolidaysInMonth(item);
              const isCurrentMonth = item === today.month && year === today.year;

              return (
                <button
                  className={`flex min-h-14 items-center justify-between gap-2 rounded-2xl border px-3.5 text-sm font-extrabold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${
                    item === month
                      ? "border-teal-500 bg-teal-500 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50/60 hover:text-teal-600"
                  }`}
                  key={item}
                  onClick={() => openMonth(item)}
                  type="button"
                >
                  <span className="inline-flex items-center gap-1.5">
                    {getJalaliMonthName(item)}
                    {isCurrentMonth ? (
                      <span className="rounded-full bg-teal-50 px-1.5 py-0.5 text-[0.6rem] font-black text-teal-600">
                        جاری
                      </span>
                    ) : null}
                  </span>
                  {count > 0 ? (
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-rose-50 text-[0.65rem] font-black text-rose-600">
                      {formatPersianNumber(count)}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </motion.div>
        ) : null}

        {stage === "day" ? (
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="mt-4"
            exit={{ opacity: 0, x: shouldReduceMotion ? 0 : 16 }}
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -16 }}
            key="day"
            transition={transition}
          >
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {weekDayLabels.map((label, index) => (
                <span
                  className={`grid h-8 place-items-center rounded-lg text-[0.7rem] font-black ${
                    index === FRIDAY_INDEX
                      ? "bg-rose-50 text-rose-500"
                      : "bg-slate-50 text-slate-500"
                  }`}
                  key={label}
                >
                  {label}
                </span>
              ))}

              {Array.from({ length: leadingBlanks }, (_, index) => (
                <span aria-hidden="true" key={`blank-${index}`} />
              ))}

              {Array.from({ length: monthDayCount }, (_, index) => index + 1).map(
                (day) => {
                  const weekDayIndex = (leadingBlanks + day - 1) % 7;
                  const isFriday = weekDayIndex === FRIDAY_INDEX;
                  const isStored = storedDaysOfMonth.has(day);
                  const isSelected = selectedSet.has(day);
                  const isToday =
                    year === today.year &&
                    month === today.month &&
                    day === today.day;
                  const isPendingAdd = isSelected && !isStored;
                  const isPendingRemove = !isSelected && isStored;

                  const tone = isFriday
                    ? "border-rose-100 bg-rose-50/70 text-rose-400"
                    : isSelected && isStored
                      ? "border-teal-500 bg-teal-500 text-white shadow-[0_8px_16px_rgba(13,148,136,0.25)]"
                      : isPendingAdd
                        ? "border-teal-400 bg-teal-50 text-teal-700"
                        : isPendingRemove
                          ? "border-dashed border-slate-300 bg-white text-slate-400 line-through"
                          : "border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50/60 hover:text-teal-600";

                  return (
                    <button
                      aria-label={
                        isFriday
                          ? `${formatPersianNumber(day)} ${getJalaliMonthName(month)} — جمعه، تعطیل همیشگی`
                          : `${isSelected ? "خارج کردن" : "تعطیل کردن"} ${formatPersianNumber(day)} ${getJalaliMonthName(month)}`
                      }
                      aria-pressed={isFriday ? undefined : isSelected}
                      className={`relative grid aspect-square min-h-10 place-items-center rounded-xl border text-sm font-extrabold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${tone} ${
                        isFriday ? "cursor-not-allowed" : ""
                      } ${isToday ? "ring-2 ring-teal-400 ring-offset-2" : ""}`}
                      disabled={isFriday}
                      key={day}
                      onClick={() => toggleDay(day)}
                      type="button"
                    >
                      {formatPersianNumber(day)}
                      {isSelected && isStored ? (
                        <span className="absolute -top-1 -left-1 grid size-4 place-items-center rounded-full bg-white text-teal-600 shadow">
                          <CheckIcon />
                        </span>
                      ) : null}
                    </button>
                  );
                },
              )}
            </div>

            <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.7rem] font-bold text-slate-500">
              <li className="inline-flex items-center gap-1.5">
                <span className="size-3 rounded-md bg-teal-500" />
                تعطیل ثبت‌شده
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="size-3 rounded-md border border-teal-400 bg-teal-50" />
                تعطیل جدید (ذخیره نشده)
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="size-3 rounded-md border border-dashed border-slate-300 bg-white" />
                حذف از ایام تعطیل
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="size-3 rounded-md bg-rose-100" />
                جمعه، تعطیل همیشگی
              </li>
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-bold leading-6 text-slate-500">
          {stage === "day"
            ? addedCount + removedCount > 0
              ? `${formatPersianNumber(addedCount)} روز اضافه و ${formatPersianNumber(removedCount)} روز حذف می‌شود.`
              : "با انتخاب روزها، تغییرها همین‌جا نمایش داده می‌شود."
            : "جمعه‌ها همیشه تعطیل هستند و نیازی به ثبت ندارند."}
        </p>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {stage !== "year" ? (
            <button
              className="min-h-12 rounded-xl px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
              onClick={() => setStage(stage === "day" ? "month" : "year")}
              type="button"
            >
              مرحلهٔ قبل
            </button>
          ) : null}
          {stage === "day" ? (
            <button
              className="min-h-12 rounded-xl bg-teal-500 px-5 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(13,148,136,0.23)] transition hover:bg-teal-600 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal-500 disabled:opacity-60"
              disabled={isSaving}
              onClick={() => onSave(year, month, selectedDays)}
              type="button"
            >
              {isSaving ? "در حال ذخیره…" : "ثبت ایام تعطیل"}
            </button>
          ) : null}
        </div>
      </div>

      <p className="mt-3 text-[0.7rem] font-bold text-slate-400">
        مجموع ایام تعطیل ثبت‌شده: {formatPersianNumber(storedDates.size)} روز
      </p>
    </AdminModal>
  );
}
