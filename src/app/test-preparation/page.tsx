import type { Metadata } from "next";
import { PreparationArchive } from "@/components/preparations/preparation-archive";
import { createPreparationArchiveMetadata } from "@/lib/preparation-seo";

export function generateMetadata(): Promise<Metadata> {
  return createPreparationArchiveMetadata(1);
}

export default function TestPreparationPage() {
  return <PreparationArchive page={1} />;
}
