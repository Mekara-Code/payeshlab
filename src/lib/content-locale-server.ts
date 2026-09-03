import "server-only";

import { cookies } from "next/headers";
import {
  CONTENT_LOCALE_COOKIE,
  parseContentLocale,
  type ContentLocale,
} from "@/lib/content-locale";

export async function getSelectedContentLocale(): Promise<ContentLocale> {
  const cookieStore = await cookies();
  return parseContentLocale(cookieStore.get(CONTENT_LOCALE_COOKIE)?.value);
}
