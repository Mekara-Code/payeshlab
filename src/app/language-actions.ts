"use server";

import { cookies } from "next/headers";
import {
  CONTENT_LOCALE_COOKIE,
  isContentLocale,
  type ContentLocale,
} from "@/lib/content-locale";

export async function setContentLocale(locale: ContentLocale) {
  if (!isContentLocale(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(CONTENT_LOCALE_COOKIE, locale, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
