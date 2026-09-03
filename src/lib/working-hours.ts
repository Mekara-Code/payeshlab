import type { ContentLocale } from "@/lib/content-locale";
import { getDictionary } from "@/lib/dictionaries";
import { translate } from "@/lib/dictionaries/types";

export const workingDays = [
  { id: "SATURDAY" },
  { id: "SUNDAY" },
  { id: "MONDAY" },
  { id: "TUESDAY" },
  { id: "WEDNESDAY" },
  { id: "THURSDAY" },
  { id: "FRIDAY" },
] as const;

export type WorkingDayId = (typeof workingDays)[number]["id"];

export const workingTimePeriods = [
  { id: "MORNING" },
  { id: "NOON" },
  { id: "AFTERNOON" },
  { id: "NIGHT" },
] as const;

export type WorkingTimePeriodId = (typeof workingTimePeriods)[number]["id"];

export function isWorkingDayId(value: string): value is WorkingDayId {
  return workingDays.some((day) => day.id === value);
}

export function isWorkingTimePeriodId(
  value: string,
): value is WorkingTimePeriodId {
  return workingTimePeriods.some((period) => period.id === value);
}

export function getWorkingDayLabel(value: string, locale: ContentLocale = "fa") {
  const day = workingDays.find((item) => item.id === value)?.id ?? "SATURDAY";
  return translate(getDictionary(locale), `workingDays.${day}`);
}

export function getWorkingTimePeriodLabel(value: string, locale: ContentLocale = "fa") {
  const period = workingTimePeriods.find((item) => item.id === value)?.id ?? "MORNING";
  return translate(getDictionary(locale), `workingPeriods.${period}`);
}

export function formatWorkingDayRange(startDay: string, endDay: string, locale: ContentLocale = "fa") {
  const startLabel = getWorkingDayLabel(startDay, locale);
  const endLabel = getWorkingDayLabel(endDay, locale);
  return startDay === endDay
    ? startLabel
    : translate(getDictionary(locale), "workingHours.dayRange", { end: endLabel, start: startLabel });
}

export function formatWorkingHourRange({
  endDay,
  endPeriod,
  endTime,
  startDay,
  startPeriod,
  startTime,
}: {
  endDay: string;
  endPeriod: string;
  endTime: string;
  startDay: string;
  startPeriod: string;
  startTime: string;
}, locale: ContentLocale = "fa") {
  return translate(getDictionary(locale), "workingHours.range", {
    days: formatWorkingDayRange(startDay, endDay, locale),
    endPeriod: getWorkingTimePeriodLabel(endPeriod, locale),
    endTime,
    startPeriod: getWorkingTimePeriodLabel(startPeriod, locale),
    startTime,
  });
}
