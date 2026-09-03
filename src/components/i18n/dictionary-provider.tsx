"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ContentLocale } from "@/lib/content-locale";
import { formatTranslation, type Dictionary, type TranslationValues } from "@/lib/dictionaries/types";

type TranslationContextValue = {
  locale: ContentLocale;
  t: (key: string, values?: TranslationValues) => string;
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

export function DictionaryProvider({
  children,
  dictionary,
  locale,
}: {
  children: ReactNode;
  dictionary: Dictionary;
  locale: ContentLocale;
}) {
  return (
    <TranslationContext.Provider
      value={{
        locale,
        t: (key, values) => formatTranslation(dictionary[key] ?? key, values),
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslations() {
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error("useTranslations must be used within DictionaryProvider.");
  }

  return context;
}
