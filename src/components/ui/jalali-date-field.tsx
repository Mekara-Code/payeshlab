"use client";

import { useMemo } from "react";
import { jalaliMonths } from "@/lib/patient-identity";

function getCurrentJalaliYear() {
  const formatted = new Intl.DateTimeFormat("en-u-ca-persian", {
    year: "numeric",
  }).format(new Date());
  const year = Number.parseInt(formatted, 10);

  return Number.isFinite(year) ? year : 1404;
}

/**
 * Jalali date picker built from three selects; the value is submitted as a
 * hidden `YYYY/MM/DD` field so no date library is needed.
 */
export function JalaliDateField({
  dayLabel,
  fieldClassName,
  monthLabel,
  name,
  onChange,
  required = false,
  value,
  yearLabel,
}: {
  dayLabel: string;
  fieldClassName: string;
  monthLabel: string;
  name: string;
  onChange: (value: string) => void;
  required?: boolean;
  value: string;
  yearLabel: string;
}) {
  const [year = "", month = "", day = ""] = value ? value.split("/") : [];
  const years = useMemo(() => {
    const currentYear = getCurrentJalaliYear();
    return Array.from({ length: 121 }, (_, index) => currentYear - index);
  }, []);
  const days = useMemo(
    () =>
      Array.from(
        { length: Number(month) > 6 ? 30 : 31 },
        (_, index) => index + 1,
      ),
    [month],
  );

  function update(nextYear: string, nextMonth: string, nextDay: string) {
    onChange(
      nextYear && nextMonth && nextDay
        ? `${nextYear}/${nextMonth.padStart(2, "0")}/${nextDay.padStart(2, "0")}`
        : "",
    );
  }

  return (
    <>
      <input name={name} type="hidden" value={value} />
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <select
          aria-label={dayLabel}
          className={fieldClassName}
          onChange={(event) =>
            update(year, month, event.target.value.padStart(2, "0"))
          }
          required={required}
          value={day.replace(/^0/, "") ? String(Number(day)) : ""}
        >
          <option value="">{dayLabel}</option>
          {days.map((dayOption) => (
            <option key={dayOption} value={String(dayOption)}>
              {dayOption.toLocaleString("fa-IR")}
            </option>
          ))}
        </select>
        <select
          aria-label={monthLabel}
          className={fieldClassName}
          onChange={(event) => {
            const nextMonth = event.target.value;
            const nextDay =
              Number(nextMonth) > 6 && Number(day) === 31 ? "" : day;
            update(year, nextMonth ? nextMonth.padStart(2, "0") : "", nextDay);
          }}
          required={required}
          value={month ? String(Number(month)) : ""}
        >
          <option value="">{monthLabel}</option>
          {jalaliMonths.map((monthName, index) => (
            <option key={monthName} value={String(index + 1)}>
              {monthName}
            </option>
          ))}
        </select>
        <select
          aria-label={yearLabel}
          className={fieldClassName}
          onChange={(event) => update(event.target.value, month, day)}
          required={required}
          value={year}
        >
          <option value="">{yearLabel}</option>
          {years.map((yearOption) => (
            <option key={yearOption} value={String(yearOption)}>
              {yearOption.toLocaleString("fa-IR", { useGrouping: false })}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
