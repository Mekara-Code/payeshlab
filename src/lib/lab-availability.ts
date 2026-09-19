import {
  getJalaliWeekDayId,
  getTehranParts,
  jalaliToGregorian,
  jalaliToJulianDay,
  julianDayToJalali,
  tehranWallClockToTimestamp,
  toJalaliKey,
  gregorianToJalali,
} from "@/lib/jalali";
import { workingDays, type WorkingDayId } from "@/lib/working-hours";

/** Fridays are the weekly closure of the laboratory and are never bookable. */
export const alwaysClosedWeekDays: readonly WorkingDayId[] = ["FRIDAY"];

export type LabScheduleRule = {
  endDay: WorkingDayId;
  endTime: string;
  startDay: WorkingDayId;
  startTime: string;
};

export type LabStatus = {
  /** Timestamp at which the open/closed state flips, when it is known. */
  changesAtMs: number | null;
  isHoliday: boolean;
  isOpen: boolean;
  isWeeklyClosure: boolean;
  /** Server timestamp the status was computed from, used to sync viewer clocks. */
  nowMs: number;
  todayDate: string;
  todayWeekDay: WorkingDayId;
};

const MINUTE_MS = 60_000;
const DAY_MINUTES = 1_440;

function toMinutes(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return null;

  return Number(match[1]) * 60 + Number(match[2]);
}

function weekDayIndex(day: WorkingDayId) {
  return workingDays.findIndex((item) => item.id === day);
}

/** Day ranges wrap around the week, e.g. Wednesday → Monday. */
function isWeekDayInRange(
  day: WorkingDayId,
  startDay: WorkingDayId,
  endDay: WorkingDayId,
) {
  const start = weekDayIndex(startDay);
  const end = weekDayIndex(endDay);
  const current = weekDayIndex(day);
  if (start < 0 || end < 0 || current < 0) return false;

  return (current - start + 7) % 7 <= (end - start + 7) % 7;
}

type Interval = { endMs: number; startMs: number };

function mergeIntervals(intervals: Interval[]) {
  const sorted = [...intervals].sort((first, second) => first.startMs - second.startMs);
  const merged: Interval[] = [];

  for (const interval of sorted) {
    const previous = merged[merged.length - 1];
    if (previous && interval.startMs <= previous.endMs) {
      previous.endMs = Math.max(previous.endMs, interval.endMs);
      continue;
    }
    merged.push({ ...interval });
  }

  return merged;
}

/**
 * Builds the concrete opening intervals around `nowMs` from the weekly rules,
 * skipping holidays and the weekly closure. Intervals belong to the day they
 * start on, so an overnight shift keeps running past midnight.
 */
function buildIntervals({
  holidays,
  nowMs,
  workingHours,
}: {
  holidays: ReadonlySet<string>;
  nowMs: number;
  workingHours: readonly LabScheduleRule[];
}) {
  const tehranNow = getTehranParts(nowMs);
  const todayJalali = gregorianToJalali(
    tehranNow.year,
    tehranNow.month,
    tehranNow.day,
  );
  const todayJulianDay = jalaliToJulianDay(
    todayJalali.year,
    todayJalali.month,
    todayJalali.day,
  );
  const intervals: Interval[] = [];

  for (let offset = -1; offset <= 8; offset += 1) {
    const date = julianDayToJalali(todayJulianDay + offset);
    const dateKey = toJalaliKey(date.year, date.month, date.day);
    const weekDay = getJalaliWeekDayId(date.year, date.month, date.day);
    if (holidays.has(dateKey) || alwaysClosedWeekDays.includes(weekDay)) continue;

    const gregorian = jalaliToGregorian(date.year, date.month, date.day);

    for (const rule of workingHours) {
      if (!isWeekDayInRange(weekDay, rule.startDay, rule.endDay)) continue;

      const startMinutes = toMinutes(rule.startTime);
      const endMinutes = toMinutes(rule.endTime);
      if (startMinutes === null || endMinutes === null) continue;

      // An end that is not after the start rolls over to the next day.
      const span =
        endMinutes > startMinutes
          ? endMinutes - startMinutes
          : endMinutes - startMinutes + DAY_MINUTES;
      const startMs = tehranWallClockToTimestamp({
        day: gregorian.day,
        hour: Math.trunc(startMinutes / 60),
        minute: startMinutes % 60,
        month: gregorian.month,
        year: gregorian.year,
      });

      intervals.push({ endMs: startMs + span * MINUTE_MS, startMs });
    }
  }

  return mergeIntervals(intervals);
}

export function computeLabStatus({
  holidays,
  nowMs,
  workingHours,
}: {
  holidays: readonly string[];
  nowMs: number;
  workingHours: readonly LabScheduleRule[];
}): LabStatus {
  const holidaySet = new Set(holidays);
  const tehranNow = getTehranParts(nowMs);
  const todayJalali = gregorianToJalali(
    tehranNow.year,
    tehranNow.month,
    tehranNow.day,
  );
  const todayDate = toJalaliKey(
    todayJalali.year,
    todayJalali.month,
    todayJalali.day,
  );
  const todayWeekDay = getJalaliWeekDayId(
    todayJalali.year,
    todayJalali.month,
    todayJalali.day,
  );
  const intervals = buildIntervals({ holidays: holidaySet, nowMs, workingHours });
  const current = intervals.find(
    (interval) => interval.startMs <= nowMs && nowMs < interval.endMs,
  );
  const next = intervals.find((interval) => interval.startMs > nowMs);

  return {
    changesAtMs: current ? current.endMs : (next?.startMs ?? null),
    isHoliday: holidaySet.has(todayDate),
    isOpen: Boolean(current),
    isWeeklyClosure: alwaysClosedWeekDays.includes(todayWeekDay),
    nowMs,
    todayDate,
    todayWeekDay,
  };
}

/** Reads the server clock once and resolves the status from it. */
export function getCurrentLabStatus(options: {
  holidays: readonly string[];
  workingHours: readonly LabScheduleRule[];
}) {
  return computeLabStatus({ ...options, nowMs: Date.now() });
}

export function splitDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1_000));

  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor(totalSeconds / 3_600) % 24,
    minutes: Math.floor(totalSeconds / 60) % 60,
    seconds: totalSeconds % 60,
    totalSeconds,
  };
}
