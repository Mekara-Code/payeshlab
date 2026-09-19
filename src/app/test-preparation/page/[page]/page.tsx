import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PreparationArchive } from "@/components/preparations/preparation-archive";
import { createPreparationArchiveMetadata } from "@/lib/preparation-seo";
import {
  getPublishedPreparations,
  PREPARATIONS_PER_PAGE,
} from "@/lib/public-articles";

type PreparationArchivePageProps = {
  params: Promise<{ page: string }>;
};

/** Only whole numbers above 1 are pages; `/page/1` belongs to `/test-preparation`. */
function parsePageNumber(value: string) {
  return /^[1-9][0-9]{0,3}$/.test(value) ? Number(value) : null;
}

export async function generateStaticParams() {
  const archive = await getPublishedPreparations(1, "fa", PREPARATIONS_PER_PAGE);

  return Array.from({ length: Math.max(0, archive.pageCount - 1) }, (_, index) => ({
    page: String(index + 2),
  }));
}

export async function generateMetadata({
  params,
}: PreparationArchivePageProps): Promise<Metadata> {
  const { page: rawPage } = await params;
  const page = parsePageNumber(rawPage);

  if (page === null || page === 1) {
    return { robots: { follow: false, index: false } };
  }

  return createPreparationArchiveMetadata(page);
}

export default async function PaginatedTestPreparationPage({
  params,
}: PreparationArchivePageProps) {
  const { page: rawPage } = await params;
  const page = parsePageNumber(rawPage);

  if (page === null) notFound();
  // Keeps a single canonical URL for the first page.
  if (page === 1) redirect("/test-preparation");

  return <PreparationArchive page={page} />;
}
