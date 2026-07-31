import type { Metadata } from "next";
import { Geist_Mono, Vazirmatn } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast-provider";
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

export const metadata: Metadata = {
  description: "آزمایشگاه پاتولوژی پایش اکسین؛ دقت امروز، سلامت فردا.",
  title: "آزمایشگاه پاتولوژی پایش اکسین",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${vazirmatn.variable} ${geistMono.variable} h-full antialiased`} dir="rtl" lang="fa">
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
