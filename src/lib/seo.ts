import "server-only";

import type { Metadata } from "next";
import type { ContentLocale } from "@/lib/content-locale";

const fallbackSiteUrl = "http://localhost:3000";

function toValidUrl(value: string) {
  return new URL(value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`);
}

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    fallbackSiteUrl;

  return toValidUrl(configuredUrl);
}

export function toAbsoluteUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return new URL(path, getSiteUrl()).toString();
}

export function getOpenGraphLocale(locale: ContentLocale) {
  return locale === "fa" ? "fa_IR" : locale === "ar" ? "ar_SA" : "en_US";
}

type SeoMetadataOptions = {
  description: string;
  image?: string | null;
  keywords: string[];
  locale: ContentLocale;
  path: string;
  title: string;
  type?: "article" | "website";
};

export function createSeoMetadata({
  description,
  image,
  keywords,
  locale,
  path,
  title,
  type = "website",
}: SeoMetadataOptions): Metadata {
  const url = toAbsoluteUrl(path);
  const imageUrl = toAbsoluteUrl(image ?? "/background-hq.png");

  return {
    alternates: { canonical: url },
    description,
    keywords,
    openGraph: {
      description,
      images: [{ alt: title, url: imageUrl }],
      locale: getOpenGraphLocale(locale),
      siteName: "Payesh Axin Pathology Laboratory",
      title,
      type,
      url,
    },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [imageUrl],
      title,
    },
  };
}
