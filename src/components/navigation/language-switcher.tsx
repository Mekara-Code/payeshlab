"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setContentLocale } from "@/app/language-actions";
import {
  contentLocaleOptions,
  isContentLocale,
  type ContentLocale,
} from "@/lib/content-locale";
import { useTranslations } from "@/components/i18n/dictionary-provider";

export function LanguageSwitcher({ locale }: { locale: ContentLocale }) {
  const [isChanging, startTransition] = useTransition();
  const router = useRouter();
  const { t } = useTranslations();

  return (
    <label className="inline-flex h-9 items-center gap-2 rounded-xl border border-white bg-white px-3 text-xs font-extrabold text-teal-500 sm:text-sm">
      <span>{t("language.label")}</span>
      <select
        aria-label={t("language.label")}
        className="h-8 min-w-0 cursor-pointer bg-transparent font-bold text-teal-500 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-70"
        disabled={isChanging}
        onChange={(event) => {
          const nextLocale = event.target.value;
          if (!isContentLocale(nextLocale)) return;

          startTransition(async () => {
            await setContentLocale(nextLocale);
            router.refresh();
          });
        }}
        value={locale}
      >
        {contentLocaleOptions.map((option) => (
          <option key={option.code} value={option.code}>
            {t(`language.${option.code}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
