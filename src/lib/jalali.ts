import { jalaliMonths } from "@/lib/patient-identity";

/**
 * Jalali (Solar Hijri) calendar helpers plus Tehran wall-clock utilities.
 *
 * The conversion uses the 33-year leap cycle breakpoints of the Birashk/Khayyam
 * algorithm, which is exact for Jalali years 1178–3177, so no date library is
 * needed on either the server or the client.
 */

export const TEHRAN_TIME_ZONE = "Asia/Tehran";

/** Week day ids in Jalali order, so index 0 is Saturday. */
export const jalaliWeekDayIds = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
] as const;

export type JalaliDate = { day: number; month: number; year: number };
export type GregorianDate = { day: number; month: number; year: number };

const leapBreaks = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192,
  2262, 2324, 2394, 2456, 3178,
];

export const MIN_JALALI_YEAR = 1300;
export const MAX_JALALI_YEAR = 1500;

function div(a: number, b: number) {
  return Math.trunc(a / b);
}

function mod(a: number, b: number) {
  return a - Math.trunc(a / b) * b;
}

function jalaliLeapOffset(year: number) {
  let previousBreak = leapBreaks[0];
  let jump = 0;

  if (year < previousBreak || year >= leapBreaks[leapBreaks.length - 1]) {
    throw new RangeError(`Unsupported Jalali year: ${year}`);
  }

  for (let index = 1; index < leapBreaks.length; index += 1) {
    const breakpoint = leapBreaks[index];
    jump = breakpoint - previousBreak;
    if (year < breakpoint) break;
    previousBreak = breakpoint;
  }

  return { jump, yearsSinceBreak: year - previousBreak };
}

/** Number of years since the last leap year in the running 33-year cycle. */
function jalaliLeapIndex(year: number) {
  const { jump, yearsSinceBreak } = jalaliLeapOffset(year);
  const normalized =
    jump - yearsSinceBreak < 6
      ? yearsSinceBreak - jump + div(jump + 4, 33) * 33
      : yearsSinceBreak;
  const leap = mod(mod(normalized + 1, 33) - 1, 4);

  return leap === -1 ? 4 : leap;
}

export function isJalaliLeapYear(year: number) {
  return jalaliLeapIndex(year) === 0;
}

/** First Gregorian March day of the given Jalali year (1 Farvardin). */
function jalaliYearMarchDay(year: number) {
  let previousBreak = leapBreaks[0];
  let leapJ = -14;
  let jump = 0;

  if (year < previousBreak || year >= leapBreaks[leapBreaks.length - 1]) {
    throw new RangeError(`Unsupported Jalali year: ${year}`);
  }

  for (let index = 1; index < leapBreaks.length; index += 1) {
    const breakpoint = leapBreaks[index];
    jump = breakpoint - previousBreak;
    if (year < breakpoint) break;
    leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
    previousBreak = breakpoint;
  }

  const yearsSinceBreak = year - previousBreak;
  leapJ += div(yearsSinceBreak, 33) * 8 + div(mod(yearsSinceBreak, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - yearsSinceBreak === 4) leapJ += 1;

  const gregorianYear = year + 621;
  const leapG =
    div(gregorianYear, 4) -
    div((div(gregorianYear, 100) + 1) * 3, 4) -
    150;

  return { gregorianYear, march: 20 + leapJ - leapG };
}

/** Julian day number of a Gregorian date. */
function gregorianToJulianDay(year: number, month: number, day: number) {
  let julianDay =
    div((year + div(month - 8, 6) + 100_100) * 1_461, 4) +
    div(153 * mod(month + 9, 12) + 2, 5) +
    day -
    34_840_408;
  julianDay -= div(div(year + 100_100 + div(month - 8, 6), 100) * 3, 4) - 752;

  return julianDay;
}

function julianDayToGregorian(julianDay: number): GregorianDate {
  let shifted = 4 * julianDay + 139_361_631;
  shifted += div(div(4 * julianDay + 183_187_720, 146_097) * 3, 4) * 4 - 3_908;
  const remainder = div(mod(shifted, 1_461), 4) * 5 + 308;

  return {
    day: div(mod(remainder, 153), 5) + 1,
    month: mod(div(remainder, 153), 12) + 1,
    year: div(shifted, 1_461) - 100_100 + div(8 - (mod(div(remainder, 153), 12) + 1), 6),
  };
}

export function jalaliToJulianDay(year: number, month: number, day: number) {
  const { gregorianYear, march } = jalaliYearMarchDay(year);

  return (
    gregorianToJulianDay(gregorianYear, 3, march) +
    (month - 1) * 31 -
    div(month, 7) * (month - 7) +
    day -
    1
  );
}

export function julianDayToJalali(julianDay: number): JalaliDate {
  const gregorianYear = julianDayToGregorian(julianDay).year;
  let year = gregorianYear - 621;
  const { march } = jalaliYearMarchDay(year);
  const leapIndex = jalaliLeapIndex(year);
  let remaining = julianDay - gregorianToJulianDay(gregorianYear, 3, march);

  if (remaining >= 0) {
    if (remaining <= 185) {
      return {
        day: mod(remaining, 31) + 1,
        month: 1 + div(remaining, 31),
        year,
      };
    }
    remaining -= 186;
  } else {
    year -= 1;
    remaining += 179;
    if (leapIndex === 1) remaining += 1;
  }

  return {
    day: mod(remaining, 30) + 1,
    month: 7 + div(remaining, 30),
    year,
  };
}

export function jalaliToGregorian(
  year: number,
  month: number,
  day: number,
): GregorianDate {
  return julianDayToGregorian(jalaliToJulianDay(year, month, day));
}

export function gregorianToJalali(
  year: number,
  month: number,
  day: number,
): JalaliDate {
  return julianDayToJalali(gregorianToJulianDay(year, month, day));
}

export function getJalaliMonthLength(year: number, month: number) {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isJalaliLeapYear(year) ? 30 : 29;
}

/** Week day index where 0 is Saturday, matching {@link jalaliWeekDayIds}. */
export function getJalaliWeekDayIndex(year: number, month: number, day: number) {
  const gregorian = jalaliToGregorian(year, month, day);
  const weekDay = new Date(
    Date.UTC(gregorian.year, gregorian.month - 1, gregorian.day),
  ).getUTCDay();

  return (weekDay + 1) % 7;
}

export function getJalaliWeekDayId(year: number, month: number, day: number) {
  return jalaliWeekDayIds[getJalaliWeekDayIndex(year, month, day)];
}

export function isValidJalaliParts(year: number, month: number, day: number) {
  return (
    Number.isInteger(year) &&
    Number.isInteger(month) &&
    Number.isInteger(day) &&
    year >= MIN_JALALI_YEAR &&
    year <= MAX_JALALI_YEAR &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= getJalaliMonthLength(year, month)
  );
}

/** Serializes a Jalali date to the `YYYY/MM/DD` form used across the project. */
export function toJalaliKey(year: number, month: number, day: number) {
  return `${year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
}

export function parseJalaliKey(value: string): JalaliDate | null {
  const match = /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return isValidJalaliParts(year, month, day) ? { day, month, year } : null;
}

export function formatJalaliKey(value: string) {
  const parsed = parseJalaliKey(value);
  if (!parsed) return value;

  const monthName = jalaliMonths[parsed.month - 1];
  return `${parsed.day.toLocaleString("fa-IR")} ${monthName} ${parsed.year.toLocaleString("fa-IR", { useGrouping: false })}`;
}

export function getJalaliMonthName(month: number) {
  return jalaliMonths[month - 1] ?? "";
}

type TehranParts = {
  day: number;
  hour: number;
  minute: number;
  month: number;
  second: number;
  year: number;
};

const tehranFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
  minute: "2-digit",
  month: "2-digit",
  second: "2-digit",
  timeZone: TEHRAN_TIME_ZONE,
  year: "numeric",
});

/** Gregorian wall-clock values in Tehran for the given instant. */
export function getTehranParts(timestamp: number): TehranParts {
  const parts = tehranFormatter.formatToParts(new Date(timestamp));
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  return {
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
    month: read("month"),
    second: read("second"),
    year: read("year"),
  };
}

function tehranOffsetMs(timestamp: number) {
  const parts = getTehranParts(timestamp);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return asUtc - Math.floor(timestamp / 1_000) * 1_000;
}

/**
 * Converts a Tehran wall-clock moment to an absolute timestamp. The offset is
 * resolved twice so a future daylight-saving change would still land exactly.
 */
export function tehranWallClockToTimestamp({
  day,
  hour,
  minute,
  month,
  year,
}: {
  day: number;
  hour: number;
  minute: number;
  month: number;
  year: number;
}) {
  const naive = Date.UTC(year, month - 1, day, hour, minute, 0);
  const firstPass = naive - tehranOffsetMs(naive);

  return naive - tehranOffsetMs(firstPass);
}

/** Today in Tehran, read from the clock of whichever runtime calls it. */
export function getCurrentTehranJalali() {
  return getTehranJalaliNow(Date.now());
}

/** Current Tehran date in the Jalali calendar, independent of the viewer clock. */
export function getTehranJalaliNow(timestamp: number) {
  const parts = getTehranParts(timestamp);
  const jalali = gregorianToJalali(parts.year, parts.month, parts.day);

  return {
    ...jalali,
    hour: parts.hour,
    key: toJalaliKey(jalali.year, jalali.month, jalali.day),
    minute: parts.minute,
    second: parts.second,
    weekDayId: getJalaliWeekDayId(jalali.year, jalali.month, jalali.day),
  };
}
