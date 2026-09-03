const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

export const jalaliMonths = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

/** Accepts Persian and Arabic-Indic digits so patients can type in any keyboard layout. */
export function toLatinDigits(value: string) {
  return Array.from(value)
    .map((character) => {
      const persianIndex = persianDigits.indexOf(character);
      if (persianIndex >= 0) return String(persianIndex);

      const arabicIndex = arabicDigits.indexOf(character);
      if (arabicIndex >= 0) return String(arabicIndex);

      return character;
    })
    .join("");
}

export function toDigitsOnly(value: string) {
  return toLatinDigits(value).replace(/[^0-9]/g, "");
}

export function isValidNationalCode(value: string) {
  const code = toDigitsOnly(value);
  if (code.length !== 10 || /^(\d)\1{9}$/.test(code)) return false;

  const checkDigit = Number(code[9]);
  const weightedSum = Array.from(code.slice(0, 9)).reduce(
    (total, digit, index) => total + Number(digit) * (10 - index),
    0,
  );
  const remainder = weightedSum % 11;

  return remainder < 2 ? checkDigit === remainder : checkDigit === 11 - remainder;
}

export function isValidMobileNumber(value: string) {
  return /^09\d{9}$/.test(toDigitsOnly(value));
}

export function isValidLandlineNumber(value: string) {
  const phone = toDigitsOnly(value);
  return phone.length >= 8 && phone.length <= 11;
}

/** Birth dates are collected and stored in the Jalali calendar as `YYYY/MM/DD`. */
export function isValidJalaliDate(value: string) {
  const parts = toLatinDigits(value).split("/");
  if (parts.length !== 3) return false;

  const [year, month, day] = parts.map(Number);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }
  if (year < 1250 || year > 1500 || month < 1 || month > 12 || day < 1) {
    return false;
  }

  const maximumDay = month <= 6 ? 31 : 30;
  return day <= maximumDay;
}

export function formatJalaliDate(value: string) {
  const parts = toLatinDigits(value).split("/");
  if (parts.length !== 3) return value;

  const [year, month, day] = parts.map(Number);
  const monthName = jalaliMonths[month - 1];
  if (!monthName) return value;

  return `${day.toLocaleString("fa-IR")} ${monthName} ${year.toLocaleString("fa-IR", { useGrouping: false })}`;
}
