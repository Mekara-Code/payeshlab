export const workingDays = [
  { id: "SATURDAY", label: "شنبه" },
  { id: "SUNDAY", label: "یکشنبه" },
  { id: "MONDAY", label: "دوشنبه" },
  { id: "TUESDAY", label: "سه‌شنبه" },
  { id: "WEDNESDAY", label: "چهارشنبه" },
  { id: "THURSDAY", label: "پنجشنبه" },
  { id: "FRIDAY", label: "جمعه" },
] as const;

export type WorkingDayId = (typeof workingDays)[number]["id"];

export function isWorkingDayId(value: string): value is WorkingDayId {
  return workingDays.some((day) => day.id === value);
}

export function getWorkingDayLabel(value: string) {
  return workingDays.find((day) => day.id === value)?.label ?? "شنبه";
}

export function formatWorkingDayRange(startDay: string, endDay: string) {
  const startLabel = getWorkingDayLabel(startDay);
  const endLabel = getWorkingDayLabel(endDay);
  return startDay === endDay ? startLabel : `${startLabel} تا ${endLabel}`;
}
