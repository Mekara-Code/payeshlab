import type { Metadata } from "next";
import { Geist_Mono, Vazirmatn } from "next/font/google";
import { DictionaryProvider } from "@/components/i18n/dictionary-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import { getContentLocaleInfo } from "@/lib/content-locale";
import { getSelectedContentLocale } from "@/lib/content-locale-server";
import { getDictionary } from "@/lib/dictionaries";
import { getOpenGraphLocale, getSiteUrl, toAbsoluteUrl } from "@/lib/seo";
import "./globals.css";

const vazirmatn = Vazirmatn({
  display: "swap",
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  weight: "variable",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getSelectedContentLocale();
  const dictionary = getDictionary(locale);
  const title = dictionary["metadata.title"];
  const description = dictionary["metadata.description"];
  const keywords = dictionary["seo.keywords"].split(",").map((keyword) => keyword.trim());
  const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;

  return {
    applicationName: title,
    authors: [{ name: title }],
    description,
    formatDetection: { address: false, email: false, telephone: false },
    keywords,
    metadataBase: getSiteUrl(),
    openGraph: {
      description,
      images: [{ alt: title, url: toAbsoluteUrl("/background-hq.png") }],
      locale: getOpenGraphLocale(locale),
      siteName: title,
      title,
      type: "website",
      url: toAbsoluteUrl("/"),
    },
    robots: {
      follow: true,
      googleBot: {
        follow: true,
        index: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
      index: true,
    },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [toAbsoluteUrl("/background-hq.png")],
      title,
    },
    verification: googleVerification ? { google: googleVerification } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getSelectedContentLocale();
  const localeInfo = getContentLocaleInfo(locale);
  const dictionary = getDictionary(locale);

  return (
    <html className={`${vazirmatn.variable} ${geistMono.variable} h-full antialiased`} dir={localeInfo.direction} lang={localeInfo.languageTag}>
      <body className="min-h-full flex flex-col">
        <DictionaryProvider dictionary={dictionary} locale={locale}>
          <ToastProvider>{children}</ToastProvider>
        </DictionaryProvider>
      </body>
    </html>
  );
}
