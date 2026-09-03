export const CONTENT_LOCALE_COOKIE = "payesh-content-locale";

export const contentLocales = ["fa", "en", "ar"] as const;

export type ContentLocale = (typeof contentLocales)[number];

export const contentLocaleOptions: Array<{
  code: ContentLocale;
  direction: "ltr" | "rtl";
  languageTag: string;
}> = [
  { code: "fa", direction: "rtl", languageTag: "fa" },
  { code: "en", direction: "ltr", languageTag: "en" },
  { code: "ar", direction: "rtl", languageTag: "ar" },
];

export function isContentLocale(value: string): value is ContentLocale {
  return contentLocales.includes(value as ContentLocale);
}

export function parseContentLocale(value: string | undefined): ContentLocale {
  return value && isContentLocale(value) ? value : "fa";
}

export function getContentLocaleInfo(locale: ContentLocale) {
  return contentLocaleOptions.find((option) => option.code === locale) ?? contentLocaleOptions[0];
}

export function toDatabaseContentLocale(locale: ContentLocale) {
  return locale.toUpperCase() as "FA" | "EN" | "AR";
}
