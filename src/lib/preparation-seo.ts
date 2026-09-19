import "server-only";

import type { Metadata } from "next";
import { getSelectedContentLocale } from "@/lib/content-locale-server";
import { getDictionary } from "@/lib/dictionaries";
import { translate } from "@/lib/dictionaries/types";
import { getPublishedPreparations } from "@/lib/public-articles";
import { createSeoMetadata } from "@/lib/seo";

/**
 * Metadata for one page of the preparation archive. Every page carries a
 * self-referencing canonical — page 2 is its own URL, not a duplicate of
 * page 1 — and pages past the last one are marked `noindex` because they
 * render a 404.
 */
export async function createPreparationArchiveMetadata(
  page: number,
): Promise<Metadata> {
  const locale = await getSelectedContentLocale();
  const dictionary = getDictionary(locale);
  const t = (key: string, values?: Record<string, number | string>) =>
    translate(dictionary, key, values);
  const archive = await getPublishedPreparations(page, locale);

  if (page > 1 && archive.page !== page) {
    return {
      robots: { follow: false, index: false },
      title: t("seo.preparationTitle"),
    };
  }

  const numberFormatter = new Intl.NumberFormat(
    locale === "fa" ? "fa-IR" : locale === "ar" ? "ar-EG" : "en-US",
  );

  return createSeoMetadata({
    description: t("seo.preparationDescription"),
    keywords: [
      ...dictionary["seo.keywords"].split(",").map((keyword) => keyword.trim()),
      t("preparation.listTitle"),
      t("preparation.trigger"),
    ],
    locale,
    path: page > 1 ? `/test-preparation/page/${page}` : "/test-preparation",
    title:
      page > 1
        ? t("preparation.pageMetaTitle", { page: numberFormatter.format(page) })
        : t("seo.preparationTitle"),
  });
}
