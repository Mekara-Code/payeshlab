import Link from "next/link";
import type { ContentLocale } from "@/lib/content-locale";

export function preparationPagePath(page: number) {
  return page > 1 ? `/test-preparation/page/${page}` : "/test-preparation";
}

/**
 * First page, last page, and the pages around the current one. `null` marks a
 * gap so the list stays short without ever hiding a reachable neighbour.
 */
function getPageWindow(page: number, pageCount: number): Array<number | null> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set([1, pageCount, page, page - 1, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((value) => pages.add(value));
  if (page >= pageCount - 2) {
    [pageCount - 3, pageCount - 2, pageCount - 1].forEach((value) => pages.add(value));
  }

  const sorted = [...pages]
    .filter((value) => value >= 1 && value <= pageCount)
    .sort((first, second) => first - second);

  return sorted.flatMap((value, index) =>
    index > 0 && value - sorted[index - 1] > 1 ? [null, value] : [value],
  );
}

const linkClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl px-4 text-sm font-extrabold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal-500";

export function PreparationPagination({
  label,
  locale,
  nextLabel,
  page,
  pageCount,
  pageLabel,
  previousLabel,
}: {
  label: string;
  locale: ContentLocale;
  nextLabel: string;
  page: number;
  pageCount: number;
  /** Accessible name for a numbered link, e.g. "go to page 3". */
  pageLabel: (page: number) => string;
  previousLabel: string;
}) {
  if (pageCount <= 1) return null;

  const numberFormatter = new Intl.NumberFormat(
    locale === "fa" ? "fa-IR" : locale === "ar" ? "ar-EG" : "en-US",
  );

  return (
    <nav aria-label={label} className="mt-12 flex justify-center sm:mt-16">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {page > 1 ? (
            <Link
              className={`${linkClass} bg-white text-teal-500 hover:bg-teal-50`}
              href={preparationPagePath(page - 1)}
              rel="prev"
            >
              {previousLabel}
            </Link>
          ) : (
            <span aria-disabled="true" className={`${linkClass} bg-slate-100 text-slate-400`}>
              {previousLabel}
            </span>
          )}
        </li>

        {getPageWindow(page, pageCount).map((value, index) =>
          value === null ? (
            <li aria-hidden="true" className="px-1 text-sm font-black text-slate-400" key={`gap-${index}`}>
              …
            </li>
          ) : (
            <li key={value}>
              {value === page ? (
                <span aria-current="page" className={`${linkClass} bg-teal-500 text-white`}>
                  {numberFormatter.format(value)}
                </span>
              ) : (
                <Link
                  aria-label={pageLabel(value)}
                  className={`${linkClass} bg-white text-slate-700 hover:bg-teal-50 hover:text-teal-500`}
                  href={preparationPagePath(value)}
                >
                  {numberFormatter.format(value)}
                </Link>
              )}
            </li>
          ),
        )}

        <li>
          {page < pageCount ? (
            <Link
              className={`${linkClass} bg-white text-teal-500 hover:bg-teal-50`}
              href={preparationPagePath(page + 1)}
              rel="next"
            >
              {nextLabel}
            </Link>
          ) : (
            <span aria-disabled="true" className={`${linkClass} bg-slate-100 text-slate-400`}>
              {nextLabel}
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
