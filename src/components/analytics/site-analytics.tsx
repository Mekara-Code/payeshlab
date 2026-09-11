"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { usePathname } from "next/navigation";

const googleAnalyticsId = "G-FEEMBW4FVZ";

function isUntrackedPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/**
 * gtag.js checks `window["ga-disable-<id>"]` before sending every hit. Once the
 * script has loaded on a public page it stays loaded, so a later client-side
 * navigation into /admin would otherwise be reported. The flag must be set
 * before GA notices the URL change.
 */
function syncTrackingOptOut(pathname: string) {
  Object.assign(window, { [`ga-disable-${googleAnalyticsId}`]: isUntrackedPath(pathname) });
}

if (typeof window !== "undefined") {
  syncTrackingOptOut(window.location.pathname);
  // Registered before gtag.js loads, so it runs ahead of GA's own history listener on back/forward.
  window.addEventListener("popstate", () => syncTrackingOptOut(window.location.pathname));
}

export function SiteAnalytics() {
  const pathname = usePathname();

  // Runs during render, before Next.js pushes the new URL into history on link and router navigations.
  if (typeof window !== "undefined") syncTrackingOptOut(pathname);

  // Admin pages opened directly never download gtag.js at all.
  return isUntrackedPath(pathname) ? null : <GoogleAnalytics gaId={googleAnalyticsId} />;
}
