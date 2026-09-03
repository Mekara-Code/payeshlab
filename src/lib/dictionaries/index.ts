import type { ContentLocale } from "@/lib/content-locale";
import { ar } from "./ar";
import { en } from "./en";
import { fa } from "./fa";
import type { Dictionary } from "./types";

const dictionaries: Record<ContentLocale, Dictionary> = { ar, en, fa };

export function getDictionary(locale: ContentLocale) {
  return dictionaries[locale];
}
