import type { MetadataRoute } from "next";
import { getSiteUrl, isSearchIndexingAllowed } from "@/lib/seo";

/**
 * Paths crawlers must never fetch. Pages that are only kept out of the index
 * (such as /online-answers/patients) stay crawlable on purpose: they carry a
 * `noindex` robots meta tag, which a crawler can only honour if it is allowed
 * to fetch the page. Blocking them here could get them indexed as bare URLs.
 *
 * Never add /_next/ here — Google needs the JS and CSS to render the pages.
 */
const privatePaths = [
  // Admin panel, including its login page and protected file downloads.
  "/admin",
  // Patients' result files, served only after identity verification.
  "/online-answers/patients/download/",
];

export default function robots(): MetadataRoute.Robots {
  if (!isSearchIndexingAllowed()) {
    return { rules: { disallow: "/", userAgent: "*" } };
  }

  return {
    rules: {
      allow: "/",
      disallow: privatePaths,
      userAgent: "*",
    },
    sitemap: new URL("/sitemap.xml", getSiteUrl()).toString(),
  };
}
