"use client";

import { useMemo } from "react";
import { AdminModal } from "@/components/admin/admin-modal";
import type { SiteHolidayData } from "@/lib/site-settings";
import {
  getCurrentTehranJalali,
  getJalaliMonthName,
  getJalaliWeekDayId,
  parseJalaliKey,
} from "@/lib/jalali";
import { getWorkingDayLabel } from "@/lib/working-hours";

function formatPersianNumber(value: number) {
  return value.toLocaleString("fa-IR", { useGrouping: false });
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M4 7h16M10 11v6M14 11v6M6 7l1 12.2A1.8 1.8 0 0 0 8.8 21h6.4a1.8 1.8 0 0 0 1.8-1.8L18 7M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

/** Cards of the stored closure days, each removable with a single click. */
export function HolidayListModal({
  holidays,
  isOpen,
  isPending,
  onClose,
  onDelete,
}: {
  holidays: readonly SiteHolidayData[];
  isOpen: boolean;
  isPending: boolean;
  onClose: () => void;
  onDelete: (holiday: SiteHolidayData, label: string) => void;
}) {
  const todayKey = useMemo(() => getCurrentTehranJalali().key, []);
  const items = useMemo(
    () =>
      [...holidays]
        .sort((first, second) => first.date.localeCompare(second.date))
        .flatMap((holiday) => {
          const parsed = parseJalaliKey(holiday.date);
          if (!parsed) return [];

          const label = `${formatPersianNumber(parsed.day)} ${getJalaliMonthName(parsed.month)} ${formatPersianNumber(parsed.year)}`;

          return [
            {
              holiday,
              isPast: holiday.date < todayKey,
              isToday: holiday.date === todayKey,
              label,
              weekDayLabel: getWorkingDayLabel(
                getJalaliWeekDayId(parsed.year, parsed.month, parsed.day),
              ),
            },
          ];
        }),
    [holidays, todayKey],
  );

  return (
    <AdminModal
      description="هر کارت یک روز تعطیل است؛ با دکمهٔ سطل زباله آن روز از فهرست خارج می‌شود."
      eyebrow="ایام تعطیل"
      id="holiday-list-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="لیست ایام تعطیل"
    >
      {items.length > 0 ? (
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {items.map((item) => (
            <li
              className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition ${
                item.isToday
                  ? "border-rose-200 bg-rose-50"
                  : item.isPast
                    ? "border-slate-100 bg-slate-50/70"
                    : "border-slate-200 bg-white"
              }`}
              key={item.holiday.id}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-950">
                  {item.label}
                </p>
                <p className="mt-0.5 text-xs font-bold text-slate-500">
                  {item.weekDayLabel}
                  {item.isToday ? " • امروز" : item.isPast ? " • گذشته" : ""}
                </p>
              </div>
              <button
                aria-label={`حذف ${item.label} از ایام تعطیل`}
                className="grid size-11 shrink-0 place-items-center rounded-xl text-rose-600 transition hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:opacity-60"
                disabled={isPending}
                onClick={() => onDelete(item.holiday, item.label)}
                type="button"
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-bold text-slate-500">
          هنوز روز تعطیلی ثبت نشده است. جمعه‌ها به‌صورت پیش‌فرض تعطیل هستند.
        </p>
      )}
    </AdminModal>
  );
}
