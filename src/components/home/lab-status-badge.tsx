"use client";

import { useLabStatus } from "@/components/home/lab-status-provider";
import { useTranslations } from "@/components/i18n/dictionary-provider";

/**
 * Live "open / closed" pill. Renders nothing outside a {@link LabStatusProvider}
 * so the hero keeps working on pages that do not load the schedule.
 */
export function LabStatusBadge({ className = "" }: { className?: string }) {
  const labStatus = useLabStatus();
  const { t } = useTranslations();

  if (!labStatus) return null;

  const { isOpen } = labStatus.status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-black ${
        isOpen
          ? "bg-emerald-100 text-emerald-700"
          : "bg-rose-100 text-rose-700"
      } ${className}`}
      role="status"
    >
      <span className="relative flex size-2">
        <span
          aria-hidden="true"
          className={`absolute inline-flex size-full rounded-full opacity-70 ${
            isOpen ? "animate-ping bg-emerald-500" : "bg-rose-500"
          }`}
        />
        <span
          aria-hidden="true"
          className={`relative inline-flex size-2 rounded-full ${
            isOpen ? "bg-emerald-600" : "bg-rose-600"
          }`}
        />
      </span>
      {isOpen ? t("labStatus.open") : t("labStatus.closed")}
    </span>
  );
}
