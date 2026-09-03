"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteHomeSamplingRequest,
  setHomeSamplingRequestCompleted,
  type HomeSamplingAdminState,
} from "@/app/admin/home-sampling/actions";
import { AdminModal } from "@/components/admin/admin-modal";
import { useToast } from "@/components/ui/toast-provider";
import { formatJalaliDate } from "@/lib/patient-identity";

export type ManagedHomeSamplingRequest = {
  address: string | null;
  birthDate: string;
  completedAt: string | null;
  createdAt: string;
  description: string | null;
  firstName: string;
  hasPrescription: boolean;
  id: string;
  isPersonalRequest: boolean;
  lastName: string;
  mobile: string;
  nationalCode: string;
  phone: string | null;
  prescriptionName: string | null;
  primaryInsurance: string | null;
  status: "PENDING" | "COMPLETED";
  supplementaryInsurance: string | null;
};

type StatusFilter = "ALL" | "PENDING" | "COMPLETED";

const statusFilters: Array<{ id: StatusFilter; label: string }> = [
  { id: "ALL", label: "همه درخواست‌ها" },
  { id: "PENDING", label: "در انتظار پیگیری" },
  { id: "COMPLETED", label: "انجام شده" },
];

function formatPersianDateTime(value: string) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function HomeIcon() {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5H9v5H5a1 1 0 0 1-1-1v-8.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path d="m5.5 12.5 4 4 9-9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
    </svg>
  );
}

function DetailRow({
  dir,
  label,
  value,
}: {
  dir?: "ltr" | "rtl";
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-extrabold text-slate-500">{label}</p>
      <p
        className="mt-1 break-words text-sm font-bold leading-6 text-slate-900"
        dir={dir}
      >
        {value}
      </p>
    </div>
  );
}

export function HomeSamplingManager({
  requests,
}: {
  requests: ManagedHomeSamplingRequest[];
}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isManaging, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const pendingCount = requests.filter(
    (request) => request.status === "PENDING",
  ).length;
  const visibleRequests = useMemo(
    () =>
      statusFilter === "ALL"
        ? requests
        : requests.filter((request) => request.status === statusFilter),
    [requests, statusFilter],
  );
  const selectedRequest =
    requests.find((request) => request.id === selectedId) ?? null;

  function runRequestAction(
    action: () => Promise<HomeSamplingAdminState>,
    closeDetails = false,
  ) {
    startTransition(async () => {
      const result = await action();
      if (result.message) {
        toast(result.message, { variant: result.success ? "success" : "error" });
      }
      if (result.success) {
        if (closeDetails) setSelectedId(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="pb-8">
      <section className="rounded-[1.75rem] border border-teal-100 bg-[linear-gradient(120deg,#ffffff,rgba(240,253,250,0.86))] p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)] sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-teal-100 text-teal-500">
              <HomeIcon />
            </span>
            <div>
              <p className="text-xs font-extrabold tracking-wide text-teal-500">
                درخواست‌های دریافتی از سایت
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-950">
                نمونه‌گیری در منزل
              </h2>
              <p className="mt-1.5 text-sm font-medium leading-6 text-slate-600">
                {pendingCount > 0
                  ? `${pendingCount.toLocaleString("fa-IR")} درخواست در انتظار پیگیری است.`
                  : "همهٔ درخواست‌ها پیگیری شده‌اند."}
              </p>
            </div>
          </div>
          <span className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-extrabold text-teal-500 ring-1 ring-teal-100">
            {requests.length.toLocaleString("fa-IR")} درخواست ثبت‌شده
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2" role="tablist">
          {statusFilters.map((filter) => {
            const isActive = filter.id === statusFilter;
            return (
              <button
                aria-selected={isActive}
                className={`min-h-10 rounded-xl px-4 text-sm font-extrabold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${
                  isActive
                    ? "bg-teal-500 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-teal-50 hover:text-teal-500"
                }`}
                key={filter.id}
                onClick={() => setStatusFilter(filter.id)}
                role="tab"
                type="button"
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </section>

      {visibleRequests.length > 0 ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {visibleRequests.map((request) => {
            const isCompleted = request.status === "COMPLETED";

            return (
              <article
                className="flex flex-col rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_14px_32px_rgba(15,23,42,0.05)]"
                key={request.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                      isCompleted
                        ? "bg-teal-100 text-teal-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {isCompleted ? "انجام شد" : "در انتظار پیگیری"}
                  </span>
                  <time
                    className="text-xs font-bold text-slate-500"
                    dateTime={request.createdAt}
                  >
                    {formatPersianDateTime(request.createdAt)}
                  </time>
                </div>

                <h3 className="mt-3 truncate text-lg font-black text-slate-950">
                  {request.firstName} {request.lastName}
                </h3>

                <dl className="mt-3 grid gap-2 text-xs font-bold text-slate-600">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-500">کد ملی</dt>
                    <dd className="font-mono tracking-[0.1em]" dir="ltr">
                      {request.nationalCode}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-500">موبایل</dt>
                    <dd className="font-mono tracking-[0.1em]" dir="ltr">
                      {request.mobile}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-500">بیمه پایه</dt>
                    <dd className="truncate">{request.primaryInsurance ?? "—"}</dd>
                  </div>
                </dl>

                {request.address ? (
                  <p className="mt-3 line-clamp-2 text-xs font-medium leading-6 text-slate-500">
                    {request.address}
                  </p>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <button
                    aria-haspopup="dialog"
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-white px-3 text-xs font-extrabold text-teal-500 ring-1 ring-teal-100 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                    onClick={() => setSelectedId(request.id)}
                    type="button"
                  >
                    <EyeIcon />
                    مشاهده
                  </button>
                  <button
                    className={`inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-extrabold transition disabled:opacity-60 ${
                      isCompleted
                        ? "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                        : "bg-teal-500 text-white shadow-[0_10px_20px_rgba(13,148,136,0.2)] hover:-translate-y-0.5"
                    }`}
                    disabled={isManaging}
                    onClick={() =>
                      runRequestAction(() =>
                        setHomeSamplingRequestCompleted(request.id, !isCompleted),
                      )
                    }
                    type="button"
                  >
                    {isCompleted ? null : <CheckIcon />}
                    {isCompleted ? "بازگشت به در انتظار" : "انجام شد"}
                  </button>
                  <button
                    className="min-h-10 rounded-xl px-3 text-xs font-extrabold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                    disabled={isManaging}
                    onClick={() =>
                      runRequestAction(
                        () => deleteHomeSamplingRequest(request.id),
                        selectedId === request.id,
                      )
                    }
                    type="button"
                  >
                    حذف
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-12 text-center text-sm font-bold text-slate-500">
          {requests.length > 0
            ? "درخواستی با این وضعیت وجود ندارد."
            : "هنوز درخواست نمونه‌گیری در منزل ثبت نشده است."}
        </p>
      )}

      <AdminModal
        description={
          selectedRequest
            ? `ثبت‌شده در ${formatPersianDateTime(selectedRequest.createdAt)}`
            : undefined
        }
        eyebrow="جزئیات درخواست"
        id="home-sampling-details-dialog"
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedId(null)}
        title={
          selectedRequest
            ? `${selectedRequest.firstName} ${selectedRequest.lastName}`
            : "جزئیات درخواست"
        }
      >
        {selectedRequest ? (
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${
                  selectedRequest.status === "COMPLETED"
                    ? "bg-teal-100 text-teal-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {selectedRequest.status === "COMPLETED"
                  ? "انجام شد"
                  : "در انتظار پیگیری"}
              </span>
              {selectedRequest.isPersonalRequest ? (
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-extrabold text-slate-700">
                  درخواست شخصی انجام آزمایش
                </span>
              ) : null}
              {selectedRequest.completedAt ? (
                <span className="text-xs font-bold text-slate-500">
                  انجام‌شده در {formatPersianDateTime(selectedRequest.completedAt)}
                </span>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="نام" value={selectedRequest.firstName} />
              <DetailRow label="نام خانوادگی" value={selectedRequest.lastName} />
              <DetailRow
                dir="ltr"
                label="کد ملی"
                value={selectedRequest.nationalCode}
              />
              <DetailRow
                label="تاریخ تولد"
                value={formatJalaliDate(selectedRequest.birthDate)}
              />
              <DetailRow dir="ltr" label="موبایل" value={selectedRequest.mobile} />
              <DetailRow
                dir="ltr"
                label="تلفن ثابت"
                value={selectedRequest.phone ?? "—"}
              />
              <DetailRow
                label="بیمه پایه"
                value={selectedRequest.primaryInsurance ?? "—"}
              />
              <DetailRow
                label="بیمه تکمیلی"
                value={selectedRequest.supplementaryInsurance ?? "—"}
              />
            </div>

            <DetailRow label="نشانی" value={selectedRequest.address ?? "—"} />
            <DetailRow
              label="توضیحات"
              value={selectedRequest.description ?? "—"}
            />

            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-extrabold text-slate-500">تصویر نسخه</p>
              {selectedRequest.hasPrescription ? (
                <a
                  className="mt-2 inline-flex min-h-10 items-center rounded-xl bg-white px-3 text-xs font-extrabold text-teal-500 ring-1 ring-teal-100 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                  href={`/admin/home-sampling/${selectedRequest.id}/prescription`}
                  rel="noreferrer"
                  target="_blank"
                >
                  مشاهده فایل نسخه
                </a>
              ) : (
                <p className="mt-1 text-sm font-bold text-slate-900">
                  نسخه‌ای بارگذاری نشده است.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-5">
              <a
                className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold leading-[2.75rem] text-slate-700 transition hover:bg-slate-50"
                href={`tel:${selectedRequest.mobile}`}
              >
                تماس با بیمار
              </a>
              <button
                className={`min-h-11 rounded-xl px-5 text-sm font-extrabold transition disabled:opacity-60 ${
                  selectedRequest.status === "COMPLETED"
                    ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    : "bg-teal-500 text-white shadow-[0_10px_20px_rgba(13,148,136,0.23)] hover:-translate-y-0.5"
                }`}
                disabled={isManaging}
                onClick={() =>
                  runRequestAction(() =>
                    setHomeSamplingRequestCompleted(
                      selectedRequest.id,
                      selectedRequest.status !== "COMPLETED",
                    ),
                  )
                }
                type="button"
              >
                {selectedRequest.status === "COMPLETED"
                  ? "بازگشت به در انتظار"
                  : "تغییر وضعیت به انجام شد"}
              </button>
            </div>
          </div>
        ) : null}
      </AdminModal>
    </div>
  );
}
