"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteJobApplication,
  saveJobApplicationNote,
  setJobApplicationStatus,
  type JobApplicationAdminState,
  type JobApplicationStatusId,
} from "@/app/admin/job-applications/actions";
import { AdminModal } from "@/components/admin/admin-modal";
import { useToast } from "@/components/ui/toast-provider";
import {
  genderOptions,
  getOptionLabel,
  getSkillLevelLabel,
  healthStatusOptions,
  languageSkillFields,
  maritalStatusOptions,
  militaryStatusOptions,
  referralSourceOptions,
  type CompetencyRow,
  type DependentRow,
  type EducationRow,
  type ForeignLanguageRow,
  type RefereeRow,
  type TrainingCourseRow,
  type WorkExperienceRow,
} from "@/lib/job-application";
import { formatJalaliDate } from "@/lib/patient-identity";

export type ManagedJobApplication = {
  achievementStory: string | null;
  additionalSkills: string | null;
  address: string | null;
  admiredPeople: string | null;
  adminNote: string | null;
  availableFrom: string | null;
  bestAchievement: string | null;
  birthDate: string;
  birthPlace: string | null;
  canProvideConsent: boolean | null;
  competencies: CompetencyRow[];
  cooperationDuration: string | null;
  createdAt: string;
  currentWorkplace: string | null;
  daughtersCount: number | null;
  dependents: DependentRow[];
  educations: EducationRow[];
  email: string | null;
  emergencyPhone: string | null;
  emigrationCountry: string | null;
  emigrationTime: string | null;
  exemptionType: string | null;
  expectedSalary: string | null;
  fatherName: string | null;
  favoriteArt: string | null;
  favoriteHobby: string | null;
  firstName: string;
  foreignLanguages: ForeignLanguageRow[];
  furtherStudyField: string | null;
  furtherStudyTime: string | null;
  gender: string;
  goodEmployeeTraits: string | null;
  goodManagerTraits: string | null;
  hasResume: boolean;
  healthNote: string | null;
  healthStatus: string | null;
  homePhone: string | null;
  id: string;
  identityNumber: string | null;
  insuranceHistory: string | null;
  insuranceNumber: string | null;
  isCurrentlyEmployed: boolean | null;
  issuePlace: string | null;
  lastBook: string | null;
  lastName: string;
  maritalStatus: string;
  militaryStatus: string | null;
  mobile: string;
  nationalCode: string;
  nationality: string | null;
  plansEmigration: boolean | null;
  plansFurtherStudy: boolean | null;
  readingHabit: string | null;
  referees: RefereeRow[];
  referralDetail: string | null;
  referralSource: string | null;
  roleModel: string | null;
  selfPaidTraining: string | null;
  sonsCount: number | null;
  specialties: string[];
  spouseJob: string | null;
  spouseName: string | null;
  spousePhone: string | null;
  status: JobApplicationStatusId;
  trainingCourses: TrainingCourseRow[];
  traits: string[];
  workExperiences: WorkExperienceRow[];
};

type StatusFilter = "ALL" | JobApplicationStatusId;

const statusPresentation: Record<
  JobApplicationStatusId,
  { label: string; tone: string }
> = {
  APPROVED: { label: "تأیید شده", tone: "bg-teal-100 text-teal-800" },
  PENDING: { label: "در انتظار بررسی", tone: "bg-amber-100 text-amber-800" },
  REJECTED: { label: "رد شده", tone: "bg-rose-100 text-rose-800" },
  REVIEWED: { label: "بررسی شد", tone: "bg-sky-100 text-sky-800" },
};

const statusFilters: Array<{ id: StatusFilter; label: string }> = [
  { id: "ALL", label: "همه درخواست‌ها" },
  { id: "PENDING", label: "در انتظار بررسی" },
  { id: "REVIEWED", label: "بررسی شد" },
  { id: "APPROVED", label: "تأیید شده" },
  { id: "REJECTED", label: "رد شده" },
];

const statusActions: JobApplicationStatusId[] = [
  "PENDING",
  "REVIEWED",
  "APPROVED",
  "REJECTED",
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

function formatYesNo(value: boolean | null) {
  if (value === null) return "—";
  return value ? "بله" : "خیر";
}

function BriefcaseIcon() {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <rect height="12" rx="2" stroke="currentColor" strokeWidth="1.8" width="18" x="3" y="7" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12h18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
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
      <p className="mt-1 break-words text-sm font-bold leading-6 text-slate-900" dir={dir}>
        {value || "—"}
      </p>
    </div>
  );
}

function DetailSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="mt-5 border-t border-slate-100 pt-5 first:mt-0 first:border-0 first:pt-0">
      <h3 className="mb-3 text-sm font-black text-teal-500">{title}</h3>
      {children}
    </section>
  );
}

function RowTable({
  columns,
  emptyLabel,
  rows,
}: {
  columns: Array<{ id: string; label: string; render?: (value: string) => string }>;
  emptyLabel: string;
  rows: Array<Record<string, string>>;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-2xl bg-slate-50 px-4 py-4 text-center text-xs font-bold text-slate-500">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] border-separate border-spacing-y-2 text-right">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                className="px-3 pb-1 text-xs font-extrabold text-slate-500"
                key={column.id}
                scope="col"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr className="bg-slate-50" key={index}>
              {columns.map((column) => (
                <td
                  className="px-3 py-3 text-xs font-bold text-slate-800 first:rounded-r-2xl last:rounded-l-2xl"
                  key={column.id}
                >
                  {(column.render
                    ? column.render(row[column.id] ?? "")
                    : row[column.id]) || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function JobApplicationManager({
  applications,
}: {
  applications: ManagedJobApplication[];
}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [isManaging, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const pendingCount = applications.filter(
    (application) => application.status === "PENDING",
  ).length;
  const visibleApplications = useMemo(
    () =>
      statusFilter === "ALL"
        ? applications
        : applications.filter(
            (application) => application.status === statusFilter,
          ),
    [applications, statusFilter],
  );
  const selected =
    applications.find((application) => application.id === selectedId) ?? null;

  function openDetails(application: ManagedJobApplication) {
    setSelectedId(application.id);
    setNoteDraft(application.adminNote ?? "");
  }

  function runAction(
    action: () => Promise<JobApplicationAdminState>,
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
              <BriefcaseIcon />
            </span>
            <div>
              <p className="text-xs font-extrabold tracking-wide text-teal-500">
                فرم‌های دریافتی از سایت
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-950">
                درخواست‌های استخدام
              </h2>
              <p className="mt-1.5 text-sm font-medium leading-6 text-slate-600">
                {pendingCount > 0
                  ? `${pendingCount.toLocaleString("fa-IR")} درخواست در انتظار بررسی است.`
                  : "همهٔ درخواست‌ها بررسی شده‌اند."}
              </p>
            </div>
          </div>
          <span className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-extrabold text-teal-500 ring-1 ring-teal-100">
            {applications.length.toLocaleString("fa-IR")} درخواست ثبت‌شده
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

      {visibleApplications.length > 0 ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {visibleApplications.map((application) => (
            <article
              className="flex flex-col rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_14px_32px_rgba(15,23,42,0.05)]"
              key={application.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${statusPresentation[application.status].tone}`}
                >
                  {statusPresentation[application.status].label}
                </span>
                <time className="text-xs font-bold text-slate-500" dateTime={application.createdAt}>
                  {formatPersianDateTime(application.createdAt)}
                </time>
              </div>

              <h3 className="mt-3 truncate text-lg font-black text-slate-950">
                {application.firstName} {application.lastName}
              </h3>

              <dl className="mt-3 grid gap-2 text-xs font-bold text-slate-600">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">کد ملی</dt>
                  <dd className="font-mono tracking-[0.1em]" dir="ltr">
                    {application.nationalCode}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">موبایل</dt>
                  <dd className="font-mono tracking-[0.1em]" dir="ltr">
                    {application.mobile}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">آخرین مقطع</dt>
                  <dd className="truncate">
                    {application.educations[0]?.degree || "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">حقوق درخواستی</dt>
                  <dd className="truncate">{application.expectedSalary || "—"}</dd>
                </div>
              </dl>

              {application.specialties.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {application.specialties.slice(0, 3).map((specialty) => (
                    <span
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold text-slate-600"
                      key={specialty}
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <button
                  aria-haspopup="dialog"
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-white px-3 text-xs font-extrabold text-teal-500 ring-1 ring-teal-100 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                  onClick={() => openDetails(application)}
                  type="button"
                >
                  <EyeIcon />
                  مشاهده
                </button>
                {application.status !== "REVIEWED" ? (
                  <button
                    className="min-h-10 rounded-xl bg-teal-500 px-3 text-xs font-extrabold text-white shadow-[0_10px_20px_rgba(13,148,136,0.2)] transition hover:-translate-y-0.5 disabled:opacity-60"
                    disabled={isManaging}
                    onClick={() =>
                      runAction(() =>
                        setJobApplicationStatus(application.id, "REVIEWED"),
                      )
                    }
                    type="button"
                  >
                    بررسی شد
                  </button>
                ) : null}
                <button
                  className="min-h-10 rounded-xl px-3 text-xs font-extrabold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                  disabled={isManaging}
                  onClick={() =>
                    runAction(
                      () => deleteJobApplication(application.id),
                      selectedId === application.id,
                    )
                  }
                  type="button"
                >
                  حذف
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-12 text-center text-sm font-bold text-slate-500">
          {applications.length > 0
            ? "درخواستی با این وضعیت وجود ندارد."
            : "هنوز درخواست استخدامی ثبت نشده است."}
        </p>
      )}

      <AdminModal
        description={
          selected
            ? `ثبت‌شده در ${formatPersianDateTime(selected.createdAt)}`
            : undefined
        }
        eyebrow="پرسش‌نامه استخدام"
        id="job-application-details-dialog"
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected ? `${selected.firstName} ${selected.lastName}` : "جزئیات درخواست"}
      >
        {selected ? (
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${statusPresentation[selected.status].tone}`}
              >
                {statusPresentation[selected.status].label}
              </span>
              {selected.hasResume ? (
                <a
                  className="inline-flex min-h-9 items-center rounded-xl bg-white px-3 text-xs font-extrabold text-teal-500 ring-1 ring-teal-100 transition hover:bg-teal-50"
                  href={`/admin/job-applications/${selected.id}/resume`}
                  rel="noreferrer"
                  target="_blank"
                >
                  مشاهدهٔ رزومه
                </a>
              ) : null}
              <a
                className="inline-flex min-h-9 items-center rounded-xl bg-white px-3 text-xs font-extrabold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
                href={`tel:${selected.mobile}`}
              >
                تماس با متقاضی
              </a>
            </div>

            <DetailSection title="مشخصات فردی">
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailRow label="نام پدر" value={selected.fatherName ?? ""} />
                <DetailRow label="شماره شناسنامه" value={selected.identityNumber ?? ""} />
                <DetailRow dir="ltr" label="کد ملی" value={selected.nationalCode} />
                <DetailRow label="تاریخ تولد" value={formatJalaliDate(selected.birthDate)} />
                <DetailRow label="محل تولد" value={selected.birthPlace ?? ""} />
                <DetailRow label="محل صدور" value={selected.issuePlace ?? ""} />
                <DetailRow label="جنسیت" value={getOptionLabel(genderOptions, selected.gender)} />
                <DetailRow label="وضعیت تأهل" value={getOptionLabel(maritalStatusOptions, selected.maritalStatus)} />
                <DetailRow label="ملیت" value={selected.nationality ?? ""} />
                <DetailRow
                  label="وضعیت نظام وظیفه"
                  value={`${getOptionLabel(militaryStatusOptions, selected.militaryStatus)}${selected.exemptionType ? ` — ${selected.exemptionType}` : ""}`}
                />
                <DetailRow
                  label="وضعیت جسمانی"
                  value={`${getOptionLabel(healthStatusOptions, selected.healthStatus)}${selected.healthNote ? ` — ${selected.healthNote}` : ""}`}
                />
                <DetailRow dir="ltr" label="پست الکترونیکی" value={selected.email ?? ""} />
                <DetailRow dir="ltr" label="تلفن همراه" value={selected.mobile} />
                <DetailRow dir="ltr" label="تلفن منزل" value={selected.homePhone ?? ""} />
                <DetailRow dir="ltr" label="تماس ضروری" value={selected.emergencyPhone ?? ""} />
              </div>
              <div className="mt-3">
                <DetailRow label="آدرس محل سکونت" value={selected.address ?? ""} />
              </div>
            </DetailSection>

            {selected.maritalStatus === "MARRIED" ? (
              <DetailSection title="اطلاعات همسر و فرزندان">
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailRow label="نام و نام خانوادگی" value={selected.spouseName ?? ""} />
                  <DetailRow label="شغل" value={selected.spouseJob ?? ""} />
                  <DetailRow dir="ltr" label="تلفن" value={selected.spousePhone ?? ""} />
                  <DetailRow
                    label="تعداد فرزند"
                    value={`پسر: ${(selected.sonsCount ?? 0).toLocaleString("fa-IR")} — دختر: ${(selected.daughtersCount ?? 0).toLocaleString("fa-IR")}`}
                  />
                </div>
              </DetailSection>
            ) : null}

            <DetailSection title="افراد تحت تکفل">
              <RowTable
                columns={[
                  { id: "name", label: "نام و نام خانوادگی" },
                  { id: "relation", label: "نسبت" },
                  { id: "age", label: "سن" },
                  { id: "job", label: "شغل" },
                  { id: "phone", label: "شماره تماس" },
                ]}
                emptyLabel="موردی ثبت نشده است."
                rows={selected.dependents}
              />
            </DetailSection>

            <DetailSection title="معرف‌ها">
              <RowTable
                columns={[
                  { id: "name", label: "نام و نام خانوادگی" },
                  { id: "relation", label: "نسبت" },
                  { id: "job", label: "شغل" },
                  { id: "organization", label: "سازمان" },
                  { id: "phone", label: "شماره تماس" },
                ]}
                emptyLabel="موردی ثبت نشده است."
                rows={selected.referees}
              />
            </DetailSection>

            <DetailSection title="سوابق تحصیلی">
              <RowTable
                columns={[
                  { id: "degree", label: "مقطع" },
                  { id: "field", label: "رشته" },
                  { id: "orientation", label: "گرایش" },
                  { id: "university", label: "دانشگاه" },
                  { id: "gpa", label: "معدل" },
                  { id: "graduationYear", label: "سال اخذ" },
                ]}
                emptyLabel="موردی ثبت نشده است."
                rows={selected.educations}
              />
            </DetailSection>

            <DetailSection title="سوابق کاری">
              <RowTable
                columns={[
                  { id: "organization", label: "سازمان" },
                  { id: "position", label: "پست" },
                  { id: "phone", label: "تلفن" },
                  { id: "startDate", label: "شروع" },
                  { id: "endDate", label: "پایان" },
                  { id: "leaveReason", label: "علت خاتمه" },
                  { id: "salary", label: "حقوق" },
                ]}
                emptyLabel="موردی ثبت نشده است."
                rows={selected.workExperiences}
              />
            </DetailSection>

            <DetailSection title="دوره‌های آموزشی">
              <RowTable
                columns={[
                  { id: "title", label: "نام دوره" },
                  { id: "institute", label: "موسسه" },
                  { id: "date", label: "تاریخ" },
                  { id: "duration", label: "مدت" },
                  {
                    id: "hasCertificate",
                    label: "دارای مدرک",
                    render: (value) =>
                      value === "YES" ? "بله" : value === "NO" ? "خیر" : "",
                  },
                ]}
                emptyLabel="موردی ثبت نشده است."
                rows={selected.trainingCourses}
              />
            </DetailSection>

            <DetailSection title="شایستگی‌ها">
              <RowTable
                columns={[
                  { id: "title", label: "عنوان" },
                  { id: "level", label: "میزان تسلط", render: getSkillLevelLabel },
                ]}
                emptyLabel="موردی ثبت نشده است."
                rows={selected.competencies}
              />
            </DetailSection>

            <DetailSection title="زبان‌های خارجی">
              <RowTable
                columns={[
                  { id: "language", label: "زبان" },
                  ...languageSkillFields.map((field) => ({
                    id: field.id,
                    label: field.label,
                    render: getSkillLevelLabel,
                  })),
                ]}
                emptyLabel="موردی ثبت نشده است."
                rows={selected.foreignLanguages}
              />
            </DetailSection>

            <DetailSection title="سایر اطلاعات">
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailRow
                  label="نحوه آشنایی"
                  value={`${getOptionLabel(referralSourceOptions, selected.referralSource)}${selected.referralDetail ? ` — ${selected.referralDetail}` : ""}`}
                />
                <DetailRow label="امکان ارائه رضایت‌نامه" value={formatYesNo(selected.canProvideConsent)} />
                <DetailRow
                  label="اکنون مشغول به کار"
                  value={`${formatYesNo(selected.isCurrentlyEmployed)}${selected.currentWorkplace ? ` — ${selected.currentWorkplace}` : ""}`}
                />
                <DetailRow
                  label="تصمیم به ادامه تحصیل"
                  value={`${formatYesNo(selected.plansFurtherStudy)}${selected.furtherStudyField ? ` — ${selected.furtherStudyField}` : ""}${selected.furtherStudyTime ? ` (${selected.furtherStudyTime})` : ""}`}
                />
                <DetailRow
                  label="تصمیم به مهاجرت"
                  value={`${formatYesNo(selected.plansEmigration)}${selected.emigrationCountry ? ` — ${selected.emigrationCountry}` : ""}${selected.emigrationTime ? ` (${selected.emigrationTime})` : ""}`}
                />
                <DetailRow label="سابقه بیمه" value={selected.insuranceHistory ?? ""} />
                <DetailRow dir="ltr" label="شماره بیمه" value={selected.insuranceNumber ?? ""} />
                <DetailRow label="حقوق درخواستی" value={selected.expectedSalary ?? ""} />
                <DetailRow label="تاریخ امکان همکاری" value={selected.availableFrom ?? ""} />
                <DetailRow label="مدت همکاری موردنظر" value={selected.cooperationDuration ?? ""} />
              </div>
            </DetailSection>

            <DetailSection title="مهارت‌ها و ویژگی‌های شخصی">
              <div className="grid gap-3">
                <DetailRow label="تخصص‌ها" value={selected.specialties.join("، ")} />
                <DetailRow label="ویژگی‌های شخصیتی" value={selected.traits.join("، ")} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailRow label="مهارت‌های جانبی" value={selected.additionalSkills ?? ""} />
                  <DetailRow label="تفریح مورد علاقه" value={selected.favoriteHobby ?? ""} />
                  <DetailRow label="هنر مورد علاقه" value={selected.favoriteArt ?? ""} />
                  <DetailRow label="افراد مشهور مورد علاقه" value={selected.admiredPeople ?? ""} />
                  <DetailRow label="اهل مطالعه" value={selected.readingHabit ?? ""} />
                  <DetailRow label="آخرین کتاب" value={selected.lastBook ?? ""} />
                </div>
              </div>
            </DetailSection>

            <DetailSection title="پرسش‌های تکمیلی">
              <div className="grid gap-3">
                <DetailRow label="ویژگی‌های یک کارمند خوب" value={selected.goodEmployeeTraits ?? ""} />
                <DetailRow label="ویژگی‌های یک مدیر خوب" value={selected.goodManagerTraits ?? ""} />
                <DetailRow label="بهترین دستاورد" value={selected.bestAchievement ?? ""} />
                <DetailRow label="الگوی زندگی" value={selected.roleModel ?? ""} />
                <DetailRow label="تمایل به پرداخت هزینه آموزش" value={selected.selfPaidTraining ?? ""} />
                <DetailRow label="شرح دستاورد" value={selected.achievementStory ?? ""} />
              </div>
            </DetailSection>

            <DetailSection title="ارزیابی و وضعیت">
              <label className="grid gap-2 text-sm font-black text-slate-950">
                یادداشت بررسی
                <textarea
                  className="min-h-24 resize-y rounded-xl border border-slate-200 p-4 text-sm font-medium leading-7 text-slate-800 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  maxLength={2000}
                  onChange={(event) => setNoteDraft(event.target.value)}
                  placeholder="نتیجهٔ مصاحبه یا توضیحات داخلی…"
                  value={noteDraft}
                />
              </label>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  {statusActions
                    .filter((status) => status !== selected.status)
                    .map((status) => (
                      <button
                        className="min-h-10 rounded-xl bg-white px-3 text-xs font-extrabold text-slate-700 ring-1 ring-slate-200 transition hover:bg-teal-50 hover:text-teal-600 disabled:opacity-60"
                        disabled={isManaging}
                        key={status}
                        onClick={() =>
                          runAction(() =>
                            setJobApplicationStatus(selected.id, status),
                          )
                        }
                        type="button"
                      >
                        {statusPresentation[status].label}
                      </button>
                    ))}
                </div>
                <button
                  className="min-h-11 rounded-xl bg-teal-500 px-5 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(13,148,136,0.23)] transition hover:-translate-y-0.5 disabled:opacity-60"
                  disabled={isManaging}
                  onClick={() =>
                    runAction(() => saveJobApplicationNote(selected.id, noteDraft))
                  }
                  type="button"
                >
                  ذخیره یادداشت
                </button>
              </div>
            </DetailSection>
          </div>
        ) : null}
      </AdminModal>
    </div>
  );
}
