"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "@/components/i18n/dictionary-provider";

type BrandMarkProps = {
  className?: string;
  laboratoryName?: string | null;
};

export function BrandMark({
  className = "",
  laboratoryName,
}: BrandMarkProps) {
  const { t } = useTranslations();
  const displayedLaboratoryName = laboratoryName?.trim() || t("brand.name");

  return (
    <Link
      aria-label={displayedLaboratoryName}
      className={`group inline-flex items-center gap-3 text-right ${className}`}
      href="/"
    >
      <Image
        alt={t("brand.logoAlt")}
        className="h-14 w-14 shrink-0 object-contain transition-transform duration-300 group-hover:scale-105"
        height={133}
        priority
        src="/payeshlab-logo.png"
        width={130}
      />

      <span className="grid min-w-0 leading-tight">
        <span className="truncate whitespace-nowrap text-[11px] font-extrabold tracking-[-0.04em] text-slate-950 sm:text-base sm:tracking-[-0.03em]">
          {displayedLaboratoryName}
        </span>
        <span className="mt-0.5 truncate whitespace-nowrap text-[10px] font-medium text-slate-500 sm:mt-1 sm:text-xs">
          {t("brand.tagline")}
        </span>
      </span>
    </Link>
  );
}
