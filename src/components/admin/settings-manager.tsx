"use client";

import {
  type FormEvent,
  type ReactNode,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  clearLaboratoryIdentity,
  createSiteAddress,
  createSitePhone,
  createSiteWorkingHour,
  deleteSiteAddress,
  deleteSiteHoliday,
  deleteSitePhone,
  deleteSiteWorkingHour,
  clearTechnicalManagerImage,
  searchIranLocations,
  saveLaboratoryIdentity,
  saveSiteHolidayMonth,
  saveSiteLinks,
  saveSiteLocation,
  saveTechnicalManager,
  updateSiteAddress,
  updateSitePhone,
  updateSiteWorkingHour,
  type LocationSearchState,
  type SettingsActionState,
} from "@/app/admin/settings/actions";
import { ClockTimePickerModal } from "@/components/admin/clock-time-picker-modal";
import { HolidayCalendarModal } from "@/components/admin/holiday-calendar-modal";
import { HolidayListModal } from "@/components/admin/holiday-list-modal";
import { LocationPicker } from "@/components/admin/location-picker";
import { useConfirm } from "@/components/ui/confirm-provider";
import { EitaaIcon } from "@/components/icons/eitaa-icon";
import { RubikaIcon } from "@/components/icons/rubika-icon";
import { useActionToast } from "@/components/ui/use-action-toast";
import { useToast } from "@/components/ui/toast-provider";
import { defaultCeoMessage } from "@/lib/site-settings-content";
import type {
  SiteHolidayData,
  SiteSettingsData,
  SiteWorkingHourData,
} from "@/lib/site-settings";
import {
  formatWorkingHourRange,
  getWorkingDayLabel,
  getWorkingTimePeriodLabel,
  workingDays,
  workingTimePeriods,
} from "@/lib/working-hours";

function BuildingIcon() {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <path
        d="M4 21V5.5A1.5 1.5 0 0 1 5.5 4h8A1.5 1.5 0 0 1 15 5.5V21M15 9h3.5A1.5 1.5 0 0 1 20 10.5V21M2 21h20M8 8h3M8 12h3M8 16h3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M8.5 3.5 6.6 4.4c-.9.4-1.4 1.4-1.1 2.3 1.5 5.4 5.7 9.6 11.1 11.1.9.3 1.9-.2 2.3-1.1l.9-1.9c.4-.8.1-1.8-.7-2.3l-2.4-1.4a1.8 1.8 0 0 0-2.1.2l-1 1c-1.9-1-3.5-2.6-4.5-4.5l1-1a1.8 1.8 0 0 0 .2-2.1L9.8 4.2a1.8 1.8 0 0 0-1.3-.7Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7.5V12l3 2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <rect
        height="16"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
        width="18"
        x="3"
        y="5"
      />
      <path
        d="M3 10h18M8 3v4M16 3v4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M20 10c0 5-8 10.5-8 10.5S4 15 4 10a8 8 0 1 1 16 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <circle
        cx="10.8"
        cy="10.8"
        r="6.3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m16 16 4 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <rect
        height="16"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.8"
        width="16"
        x="4"
        y="4"
      />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.9" fill="currentColor" r="1" />
    </svg>
  );
}

function SurveyIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M6 3.5h9l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M14 3.5V8h5M8.5 12.5l1.4 1.4 2.6-2.6M8.5 17l1.4 1.4 2.6-2.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M9.1 8.1c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.5.6c.5 1 1.2 1.7 2.2 2.2l.6-.5c.2-.2.4-.2.7-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3 0 .6-.5.8-.4.2-.9.3-1.4.1-2.7-.9-4.8-3-5.7-5.7-.2-.5-.1-1 .1-1.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M4 7h16M10 11v6M14 11v6M9 7l1-3h4l1 3m3 0-1 13H7L6 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function BadgeIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M9 3h6l.6 2.1 2.1-.6 1.5 2.6-1.5 1.6 1.5 1.6-1.5 2.6-2.1-.6L15 15H9l-.6-2.1-2.1.6-1.5-2.6L6.3 9.3 4.8 7.7l1.5-2.6 2.1.6L9 3Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="M8.5 15 7 21.5l5-2.3 5 2.3L15.5 15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function PortraitIcon() {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M4.5 20c.9-3.7 3.9-5.5 7.5-5.5s6.6 1.8 7.5 5.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

const inputClassName =
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10";
const panelClassName =
  "rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)] sm:p-7";

function toCoordinate(value: string) {
  const coordinate = Number(value);
  return value && Number.isFinite(coordinate) ? coordinate : null;
}

type WorkingHourValues = Pick<
  SiteWorkingHourData,
  | "endDay"
  | "endPeriod"
  | "endTime"
  | "startDay"
  | "startPeriod"
  | "startTime"
>;
type WorkingHourTimeField = "startTime" | "endTime";

const defaultWorkingHourValues: WorkingHourValues = {
  endDay: "THURSDAY",
  endPeriod: "NIGHT",
  endTime: "20:00",
  startDay: "SATURDAY",
  startPeriod: "MORNING",
  startTime: "08:00",
};

const initialSettingsActionState: SettingsActionState = {};

const acceptedManagerImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const maxManagerImageBytes = 6 * 1024 * 1024;

function WorkingHourFields({
  compact = false,
  onChange,
  onSelectTime,
  values,
}: {
  compact?: boolean;
  onChange: (nextValues: Partial<WorkingHourValues>) => void;
  onSelectTime: (field: WorkingHourTimeField) => void;
  values: WorkingHourValues;
}) {
  const labelClassName = compact
    ? "grid gap-1.5 text-xs font-extrabold text-slate-600"
    : "grid gap-2 text-sm font-bold text-slate-700";

  return (
    <>
      <label className={labelClassName}>
        شروع از:
        <select
          className={inputClassName}
          name="startDay"
          onChange={(event) =>
            onChange({
              startDay: event.target.value as WorkingHourValues["startDay"],
            })
          }
          value={values.startDay}
        >
          {workingDays.map((day) => (
            <option key={day.id} value={day.id}>
              {getWorkingDayLabel(day.id)}
            </option>
          ))}
        </select>
      </label>

      <input name="startTime" type="hidden" value={values.startTime} />
      <button
        aria-label={`انتخاب ساعت شروع؛ ${values.startTime}`}
        className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 text-right text-sm font-extrabold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50/50 hover:text-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
        onClick={() => onSelectTime("startTime")}
        type="button"
      >
        <span className="inline-flex items-center gap-2">
          <ClockIcon />
          ساعت شروع
        </span>
        <bdi className="font-mono text-base font-black text-teal-500" dir="ltr">
          {values.startTime}
        </bdi>
      </button>

      <label className={labelClassName}>
        بازهٔ شروع:
        <select
          className={inputClassName}
          name="startPeriod"
          onChange={(event) =>
            onChange({
              startPeriod: event.target.value as WorkingHourValues["startPeriod"],
            })
          }
          value={values.startPeriod}
        >
          {workingTimePeriods.map((period) => (
            <option key={period.id} value={period.id}>
              {getWorkingTimePeriodLabel(period.id)}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClassName}>
        تا پایان:
        <select
          className={inputClassName}
          name="endDay"
          onChange={(event) =>
            onChange({
              endDay: event.target.value as WorkingHourValues["endDay"],
            })
          }
          value={values.endDay}
        >
          {workingDays.map((day) => (
            <option key={day.id} value={day.id}>
              {getWorkingDayLabel(day.id)}
            </option>
          ))}
        </select>
      </label>

      <input name="endTime" type="hidden" value={values.endTime} />
      <button
        aria-label={`انتخاب ساعت پایان؛ ${values.endTime}`}
        className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 text-right text-sm font-extrabold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50/50 hover:text-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
        onClick={() => onSelectTime("endTime")}
        type="button"
      >
        <span className="inline-flex items-center gap-2">
          <ClockIcon />
          ساعت پایان
        </span>
        <bdi className="font-mono text-base font-black text-teal-500" dir="ltr">
          {values.endTime}
        </bdi>
      </button>

      <label className={labelClassName}>
        بازهٔ پایان:
        <select
          className={inputClassName}
          name="endPeriod"
          onChange={(event) =>
            onChange({
              endPeriod: event.target.value as WorkingHourValues["endPeriod"],
            })
          }
          value={values.endPeriod}
        >
          {workingTimePeriods.map((period) => (
            <option key={period.id} value={period.id}>
              {getWorkingTimePeriodLabel(period.id)}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

function WorkingHourRow({
  isPending,
  onDelete,
  onSave,
  workingHour,
}: {
  isPending: boolean;
  onDelete: (summary: string) => void;
  onSave: (formData: FormData) => void;
  workingHour: SiteWorkingHourData;
}) {
  const [values, setValues] = useState<WorkingHourValues>({
    endDay: workingHour.endDay,
    endPeriod: workingHour.endPeriod,
    endTime: workingHour.endTime,
    startDay: workingHour.startDay,
    startPeriod: workingHour.startPeriod,
    startTime: workingHour.startTime,
  });
  const [timePickerField, setTimePickerField] =
    useState<WorkingHourTimeField | null>(null);
  const workingHourSummary = formatWorkingHourRange(values);

  return (
    <>
      <form
        className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(new FormData(event.currentTarget));
        }}
      >
        <input name="id" type="hidden" value={workingHour.id} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <WorkingHourFields
            compact
            onChange={(nextValues) =>
              setValues((current) => ({ ...current, ...nextValues }))
            }
            onSelectTime={setTimePickerField}
            values={values}
          />
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-bold text-slate-500">
            نمایش در سایت: {workingHourSummary}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="min-h-11 rounded-xl border border-teal-200 bg-white px-4 text-xs font-extrabold text-teal-500 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              ذخیره
            </button>
            <button
              aria-label={`حذف بازهٔ ${workingHourSummary}`}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-extrabold text-rose-700 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:opacity-60"
              disabled={isPending}
              onClick={() => onDelete(workingHourSummary)}
              type="button"
            >
              <TrashIcon />
              حذف
            </button>
          </div>
        </div>
      </form>

      {timePickerField ? (
        <ClockTimePickerModal
          initialValue={values[timePickerField]}
          onClose={() => setTimePickerField(null)}
          onSelect={(value) => {
            setValues((current) => ({
              ...current,
              [timePickerField]: value,
            }));
            setTimePickerField(null);
          }}
          title={
            timePickerField === "startTime"
              ? "انتخاب ساعت شروع"
              : "انتخاب ساعت پایان"
          }
        />
      ) : null}
    </>
  );
}

type SettingsTabId =
  | "identity"
  | "technicalManager"
  | "links"
  | "location"
  | "phones"
  | "addresses"
  | "workingHours";

const settingsTabs: Array<{
  description: string;
  id: SettingsTabId;
  label: string;
}> = [
  {
    description: "نام، توضیح کوتاه و سخن مدیرعامل",
    id: "identity",
    label: "هویت آزمایشگاه",
  },
  {
    description: "عکس، نام، کد نظام پزشکی و معرفی مسئول فنی",
    id: "technicalManager",
    label: "مسئول فنی",
  },
  {
    description: "شبکه‌های اجتماعی و فرم نظرسنجی",
    id: "links",
    label: "لینک‌ها و شبکه‌ها",
  },
  {
    description: "استان، شهر و نقطهٔ نقشه",
    id: "location",
    label: "موقعیت روی نقشه",
  },
  {
    description: "شماره‌های تماس نمایش‌داده‌شده در فوتر",
    id: "phones",
    label: "شماره‌های تماس",
  },
  {
    description: "نشانی شعبه‌ها",
    id: "addresses",
    label: "نشانی‌ها",
  },
  {
    description: "زمان پاسخ‌گویی آزمایشگاه",
    id: "workingHours",
    label: "ساعات کاری",
  },
];

function SaveBar({
  hint,
  isSaving,
  label,
}: {
  hint: string;
  isSaving: boolean;
  label: string;
}) {
  return (
    <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-bold leading-6 text-slate-500">{hint}</p>
      <button
        className="min-h-12 rounded-xl bg-teal-500 px-5 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(13,148,136,0.23)] transition hover:bg-teal-600 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal-500 disabled:opacity-60"
        disabled={isSaving}
        type="submit"
      >
        {isSaving ? "در حال ذخیره…" : label}
      </button>
    </div>
  );
}

function PanelHeader({
  eyebrow,
  icon,
  title,
  tone = "teal",
}: {
  eyebrow: string;
  icon: ReactNode;
  title: string;
  tone?: "amber" | "cyan" | "teal";
}) {
  const tones = {
    amber: { badge: "bg-amber-50 text-amber-800", text: "text-amber-700" },
    cyan: { badge: "bg-cyan-50 text-cyan-800", text: "text-cyan-700" },
    teal: { badge: "bg-teal-50 text-teal-500", text: "text-teal-500" },
  } as const;

  return (
    <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-2xl ${tones[tone].badge}`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className={`text-xs font-extrabold tracking-wide ${tones[tone].text}`}>
          {eyebrow}
        </p>
        <h3 className="mt-1 text-lg font-black text-slate-950">{title}</h3>
      </div>
    </div>
  );
}

export function SettingsManager({ settings }: { settings: SiteSettingsData }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTabId>("identity");
  const [isPending, startTransition] = useTransition();
  const [identityState, saveIdentityAction, isSavingIdentity] = useActionState(
    saveLaboratoryIdentity,
    initialSettingsActionState,
  );
  const [linksState, saveLinksAction, isSavingLinks] = useActionState(
    saveSiteLinks,
    initialSettingsActionState,
  );
  const [locationState, saveLocationAction, isSavingLocation] = useActionState(
    saveSiteLocation,
    initialSettingsActionState,
  );
  const [isLocationSearching, startLocationSearch] = useTransition();
  const [locationSearch, setLocationSearch] = useState<LocationSearchState>({});
  const [newWorkingHour, setNewWorkingHour] =
    useState<WorkingHourValues>(defaultWorkingHourValues);
  const [newWorkingHourPicker, setNewWorkingHourPicker] =
    useState<WorkingHourTimeField | null>(null);
  const [isHolidayCalendarOpen, setIsHolidayCalendarOpen] = useState(false);
  const [isHolidayListOpen, setIsHolidayListOpen] = useState(false);
  const holidayDates = useMemo(
    () => settings.holidays.map((holiday) => holiday.date),
    [settings.holidays],
  );
  const { toast } = useToast();
  const { confirm } = useConfirm();
  useActionToast(identityState, {
    error: "ذخیره انجام نشد",
    success: "هویت آزمایشگاه",
  });
  useActionToast(linksState, {
    error: "ذخیره انجام نشد",
    success: "لینک‌ها و شبکه‌ها",
  });
  useActionToast(locationState, {
    error: "ذخیره انجام نشد",
    success: "موقعیت آزمایشگاه",
  });
  const [technicalManager, setTechnicalManager] = useState({
    bio: settings.technicalManagerBio ?? "",
    licenseCode: settings.technicalManagerLicenseCode ?? "",
    name: settings.technicalManagerName ?? "",
  });
  const [managerImageFile, setManagerImageFile] = useState<File | null>(null);
  const [managerImagePreviewUrl, setManagerImagePreviewUrl] = useState<
    string | null
  >(null);
  const [managerImageError, setManagerImageError] = useState("");
  const [isDraggingManagerImage, setIsDraggingManagerImage] = useState(false);
  const [isSavingManager, startManagerSave] = useTransition();
  const managerImageInputRef = useRef<HTMLInputElement>(null);
  const managerImagePreview =
    managerImagePreviewUrl ?? settings.technicalManagerImageUrl;
  const [identity, setIdentity] = useState({
    ceoMessage: settings.ceoMessage ?? defaultCeoMessage,
    city: settings.city ?? "",
    eitaaUrl: settings.eitaaUrl ?? "",
    instagramUrl: settings.instagramUrl ?? "",
    laboratoryName: settings.laboratoryName ?? "",
    latitude: settings.latitude === null ? "" : String(settings.latitude),
    longitude: settings.longitude === null ? "" : String(settings.longitude),
    province: settings.province ?? "",
    rubikaUrl: settings.rubikaUrl ?? "",
    shortDescription: settings.shortDescription ?? "",
    surveyFormUrl: settings.surveyFormUrl ?? "",
    whatsappUrl: settings.whatsappUrl ?? "",
  });

  useEffect(
    () => () => {
      if (managerImagePreviewUrl) URL.revokeObjectURL(managerImagePreviewUrl);
    },
    [managerImagePreviewUrl],
  );

  function runAction(
    action: () => Promise<SettingsActionState>,
    onSuccess?: () => void,
  ) {
    startTransition(async () => {
      const result = await action();
      if (result.message)
        toast(result.message, { variant: result.success ? "success" : "error" });
      if (result.success) {
        onSuccess?.();
        router.refresh();
      }
    });
  }

  function handleSaveManager(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startManagerSave(async () => {
      const result = await saveTechnicalManager({}, formData);
      if (result.message)
        toast(result.message, { variant: result.success ? "success" : "error" });
      if (!result.success) return;
      /* The stored file is served from its own URL, so the blob preview can go. */
      clearSelectedManagerImage();
      router.refresh();
    });
  }

  function clearSelectedManagerImage() {
    if (managerImagePreviewUrl) URL.revokeObjectURL(managerImagePreviewUrl);
    setManagerImageFile(null);
    setManagerImagePreviewUrl(null);
    setManagerImageError("");
    if (managerImageInputRef.current) managerImageInputRef.current.value = "";
  }

  function selectManagerImage(file: File | undefined) {
    if (!file) return;
    if (
      !acceptedManagerImageTypes.has(file.type) ||
      file.size > maxManagerImageBytes
    ) {
      setManagerImageError(
        "تصویر باید PNG، JPG یا WebP و حداکثر ۶ مگابایت باشد.",
      );
      return;
    }

    if (managerImagePreviewUrl) URL.revokeObjectURL(managerImagePreviewUrl);
    setManagerImageFile(file);
    setManagerImagePreviewUrl(URL.createObjectURL(file));
    setManagerImageError("");
  }

  async function removeManagerImage() {
    const isConfirmed = await confirm({
      confirmLabel: "حذف تصویر",
      description: "تصویر ذخیره‌شدهٔ مسئول فنی از سایت و سرور پاک می‌شود.",
      title: "حذف تصویر مسئول فنی؟",
    });
    if (isConfirmed) runAction(clearTechnicalManagerImage);
  }

  function handleAddPhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    runAction(
      () => createSitePhone({}, new FormData(form)),
      () => form.reset(),
    );
  }

  function handleAddAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    runAction(
      () => createSiteAddress({}, new FormData(form)),
      () => form.reset(),
    );
  }

  function handleAddWorkingHour(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    runAction(
      () => createSiteWorkingHour({}, new FormData(form)),
      () => {
        form.reset();
        setNewWorkingHour(defaultWorkingHourValues);
      },
    );
  }

  async function clearIdentity() {
    const isConfirmed = await confirm({
      confirmLabel: "حذف نام و توضیح",
      description: "نام آزمایشگاه و توضیح کوتاه از فوتر سایت برداشته می‌شود.",
      title: "حذف نام و توضیح؟",
    });
    if (!isConfirmed) return;

    runAction(clearLaboratoryIdentity, () =>
      setIdentity((current) => ({
        ...current,
        laboratoryName: "",
        shortDescription: "",
      })),
    );
  }

  async function removeWorkingHour(id: string, summary: string) {
    const isConfirmed = await confirm({
      confirmLabel: "حذف بازه",
      description: `بازهٔ «${summary}» از ساعات کاری حذف می‌شود.`,
      title: "حذف بازهٔ کاری؟",
    });
    if (isConfirmed) runAction(() => deleteSiteWorkingHour(id));
  }

  function saveHolidayMonth(year: number, month: number, days: number[]) {
    runAction(
      () => saveSiteHolidayMonth(year, month, days),
      () => setIsHolidayCalendarOpen(false),
    );
  }

  async function removeHoliday(holiday: SiteHolidayData, label: string) {
    const isConfirmed = await confirm({
      confirmLabel: "خارج کردن از تعطیلات",
      description: `«${label}» از ایام تعطیل خارج می‌شود و آزمایشگاه در آن روز طبق ساعات کاری باز خواهد بود.`,
      title: "حذف روز تعطیل؟",
    });
    if (isConfirmed) runAction(() => deleteSiteHoliday(holiday.id));
  }

  async function removePhone(id: string, phone: string) {
    const isConfirmed = await confirm({
      confirmLabel: "حذف شماره",
      description: `شمارهٔ ${phone} از فوتر سایت حذف می‌شود.`,
      title: "حذف شماره تماس؟",
    });
    if (isConfirmed) runAction(() => deleteSitePhone(id));
  }

  async function removeAddress(id: string, title: string) {
    const isConfirmed = await confirm({
      confirmLabel: "حذف نشانی",
      description: `«${title}» از فهرست نشانی‌ها حذف می‌شود.`,
      title: "حذف نشانی؟",
    });
    if (isConfirmed) runAction(() => deleteSiteAddress(id));
  }

  function searchLocation() {
    setLocationSearch({});
    startLocationSearch(async () => {
      const result = await searchIranLocations(
        identity.province,
        identity.city,
      );
      setLocationSearch(result);
    });
  }

  function selectLocation(
    result: NonNullable<LocationSearchState["results"]>[number],
  ) {
    setIdentity((current) => ({
      ...current,
      city: result.city ?? current.city,
      latitude: result.latitude.toFixed(6),
      longitude: result.longitude.toFixed(6),
      province: result.province ?? current.province,
    }));
    setLocationSearch({
      message: "موقعیت انتخاب شد. برای نمایش در سایت، این تب را ذخیره کنید.",
    });
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      toast("مرورگر شما امکان دریافت موقعیت را ندارد.", {
        variant: "error",
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setIdentity((current) => ({
          ...current,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        })),
      () =>
        toast("دریافت موقعیت ممکن نشد. مجوز موقعیت را بررسی کنید.", {
          variant: "error",
        }),
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 },
    );
  }

  const activeTabInfo =
    settingsTabs.find((tab) => tab.id === activeTab) ?? settingsTabs[0];

  return (
    <div className="mx-auto max-w-6xl pb-8">
      <section className="rounded-[1.75rem] border border-teal-100 bg-[linear-gradient(120deg,#ffffff,rgba(240,253,250,0.9))] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-teal-100 text-teal-500">
              <BuildingIcon />
            </span>
            <div>
              <p className="text-xs font-extrabold tracking-wide text-teal-500">
                تنظیمات نمایش سایت
              </p>
              <h2 className="mt-1 text-xl font-black tracking-[-0.04em] text-slate-950 sm:text-2xl">
                اطلاعات آزمایشگاه و ارتباط با مراجعه‌کننده
              </h2>
            </div>
          </div>
          <span className="w-fit rounded-full bg-teal-100 px-3 py-1.5 text-xs font-extrabold text-teal-500">
            نمایش خودکار در فوتر
          </span>
        </div>
        <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-slate-600">
          تنظیمات در شش تب جدا شده‌اند و هر تب دکمهٔ ذخیرهٔ خودش را دارد؛ تغییرات
          هر بخش را پیش از رفتن به تب بعدی ذخیره کنید.
        </p>
      </section>

      <div
        aria-label="بخش‌های تنظیمات"
        className="mt-6 flex gap-2 overflow-x-auto pb-1"
        role="tablist"
      >
        {settingsTabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              aria-controls={`settings-panel-${tab.id}`}
              aria-selected={isActive}
              className={`min-h-12 shrink-0 rounded-2xl border px-4 text-sm font-extrabold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${isActive ? "border-teal-200 bg-teal-500 text-white shadow-[0_10px_22px_rgba(13,148,136,0.22)]" : "border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:text-teal-500"}`}
              id={`settings-tab-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs font-bold text-slate-500">
        {activeTabInfo.description}
      </p>

      <div
        aria-labelledby={`settings-tab-${activeTab}`}
        className="mt-4"
        id={`settings-panel-${activeTab}`}
        role="tabpanel"
      >
        {activeTab === "identity" ? (
          <form action={saveIdentityAction} className={panelClassName}>
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-extrabold tracking-wide text-teal-500">
                  هویت آزمایشگاه
                </p>
                <h3 className="mt-1 text-lg font-black text-slate-950">
                  نام، توضیح کوتاه و سخن مدیرعامل
                </h3>
              </div>
              <button
                className="min-h-11 rounded-xl px-4 text-sm font-extrabold text-rose-700 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:opacity-60"
                disabled={isPending || isSavingIdentity}
                onClick={() => void clearIdentity()}
                type="button"
              >
                حذف نام و توضیح
              </button>
            </div>

            <div className="mt-6 grid gap-5">
              <label className="grid gap-2 text-sm font-black text-slate-950">
                نام آزمایشگاه
                <input
                  className={inputClassName}
                  maxLength={160}
                  name="laboratoryName"
                  onChange={(event) =>
                    setIdentity((current) => ({
                      ...current,
                      laboratoryName: event.target.value,
                    }))
                  }
                  placeholder="مثلاً آزمایشگاه پاتولوژی پایش"
                  value={identity.laboratoryName}
                />
              </label>
              <label className="grid gap-2 text-sm font-black text-slate-950">
                توضیح کوتاه
                <textarea
                  className={`${inputClassName} min-h-28 resize-y py-3 leading-7`}
                  maxLength={500}
                  name="shortDescription"
                  onChange={(event) =>
                    setIdentity((current) => ({
                      ...current,
                      shortDescription: event.target.value,
                    }))
                  }
                  placeholder="یک معرفی کوتاه برای نمایش در فوتر سایت"
                  value={identity.shortDescription}
                />
              </label>
              <label className="grid gap-2 text-sm font-black text-slate-950">
                سخن مدیرعامل برای صفحه درباره ما
                <textarea
                  className={`${inputClassName} min-h-72 resize-y py-3 leading-8`}
                  maxLength={5000}
                  name="ceoMessage"
                  onChange={(event) =>
                    setIdentity((current) => ({
                      ...current,
                      ceoMessage: event.target.value,
                    }))
                  }
                  placeholder="متن سخن مدیرعامل"
                  value={identity.ceoMessage}
                />
                <span className="text-xs font-medium leading-6 text-slate-500">
                  برای جدا کردن پاراگراف‌ها یک خط خالی بگذارید. متن در صفحه «درباره ما» نمایش داده می‌شود.
                </span>
              </label>
            </div>

            <SaveBar
              hint="نام و توضیح کوتاه در فوتر و سخن مدیرعامل در صفحهٔ «درباره ما» نمایش داده می‌شود."
              isSaving={isSavingIdentity}
              label="ذخیره هویت آزمایشگاه"
            />
          </form>
        ) : null}

        {activeTab === "technicalManager" ? (
          <form className={panelClassName} onSubmit={handleSaveManager}>
            <PanelHeader
              eyebrow="مسئول فنی آزمایشگاه"
              icon={<BadgeIcon />}
              title="عکس، نام، کد نظام پزشکی و معرفی"
            />

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
              <div className="grid gap-3">
                <span className="text-sm font-black text-slate-950">
                  تصویر مسئول فنی
                </span>
                <label
                  className={`group relative grid aspect-[4/5] w-full cursor-pointer place-items-center overflow-hidden rounded-[1.5rem] border-2 border-dashed bg-slate-50 transition ${isDraggingManagerImage ? "border-teal-400 bg-teal-50" : "border-slate-200 hover:border-teal-300 hover:bg-teal-50/40"}`}
                  onDragLeave={() => setIsDraggingManagerImage(false)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDraggingManagerImage(true);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    setIsDraggingManagerImage(false);
                    selectManagerImage(event.dataTransfer.files[0]);
                  }}
                >
                  {managerImagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Blob previews and dynamic upload paths are not static assets.
                    <img
                      alt="پیش‌نمایش تصویر مسئول فنی"
                      className="absolute inset-0 size-full object-cover"
                      src={managerImagePreview}
                    />
                  ) : (
                    <span className="grid place-items-center gap-2 px-4 text-center">
                      <span className="grid size-12 place-items-center rounded-2xl bg-teal-50 text-teal-500">
                        <PortraitIcon />
                      </span>
                      <span className="text-xs font-extrabold text-slate-600">
                        برای انتخاب تصویر کلیک کنید
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        PNG، JPG یا WebP تا ۶ مگابایت
                      </span>
                    </span>
                  )}
                  <input
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    name="technicalManagerImage"
                    onChange={(event) =>
                      selectManagerImage(event.target.files?.[0])
                    }
                    ref={managerImageInputRef}
                    type="file"
                  />
                </label>
                {managerImageError ? (
                  <p className="text-xs font-bold text-rose-700" role="alert">
                    {managerImageError}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {managerImageFile ? (
                    <button
                      className="min-h-11 rounded-xl border border-slate-200 px-3 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50"
                      onClick={clearSelectedManagerImage}
                      type="button"
                    >
                      لغو تصویر انتخاب‌شده
                    </button>
                  ) : null}
                  {settings.technicalManagerImageUrl && !managerImageFile ? (
                    <button
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-extrabold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                      disabled={isPending || isSavingManager}
                      onClick={() => void removeManagerImage()}
                      type="button"
                    >
                      <TrashIcon />
                      حذف تصویر ذخیره‌شده
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="grid content-start gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-black text-slate-950">
                    نام و نام خانوادگی
                    <input
                      className={inputClassName}
                      maxLength={160}
                      name="technicalManagerName"
                      onChange={(event) =>
                        setTechnicalManager((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder="مثلاً دکتر نگار رضایی"
                      value={technicalManager.name}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-black text-slate-950">
                    کد نظام پزشکی
                    <input
                      className={inputClassName}
                      dir="ltr"
                      inputMode="numeric"
                      maxLength={40}
                      name="technicalManagerLicenseCode"
                      onChange={(event) =>
                        setTechnicalManager((current) => ({
                          ...current,
                          licenseCode: event.target.value,
                        }))
                      }
                      placeholder="۱۲۳۴۵۶"
                      value={technicalManager.licenseCode}
                    />
                  </label>
                </div>
                <label className="grid gap-2 text-sm font-black text-slate-950">
                  درباره مسئول فنی
                  <textarea
                    className={`${inputClassName} min-h-56 resize-y py-3 leading-8`}
                    maxLength={4000}
                    name="technicalManagerBio"
                    onChange={(event) =>
                      setTechnicalManager((current) => ({
                        ...current,
                        bio: event.target.value,
                      }))
                    }
                    placeholder="سوابق تحصیلی، تخصص و تجربهٔ مسئول فنی آزمایشگاه"
                    value={technicalManager.bio}
                  />
                  <span className="text-xs font-medium leading-6 text-slate-500">
                    برای جدا کردن پاراگراف‌ها یک خط خالی بگذارید. این معرفی در
                    صفحهٔ «درباره ما» نمایش داده می‌شود.
                  </span>
                </label>
              </div>
            </div>

            <SaveBar
              hint="با خالی گذاشتن نام، بخش مسئول فنی از صفحهٔ «درباره ما» برداشته می‌شود."
              isSaving={isSavingManager}
              label="ذخیره مسئول فنی"
            />
          </form>
        ) : null}

        {activeTab === "links" ? (
          <form action={saveLinksAction} className={panelClassName}>
            <PanelHeader
              eyebrow="راه‌های ارتباطی"
              icon={<InstagramIcon />}
              title="شبکه‌های اجتماعی و فرم نظرسنجی"
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-black text-slate-950">
                <span className="flex items-center gap-2">
                  <InstagramIcon />
                  اینستاگرام
                </span>
                <input
                  className={inputClassName}
                  dir="ltr"
                  inputMode="url"
                  name="instagramUrl"
                  onChange={(event) =>
                    setIdentity((current) => ({
                      ...current,
                      instagramUrl: event.target.value,
                    }))
                  }
                  placeholder="https://instagram.com/..."
                  type="url"
                  value={identity.instagramUrl}
                />
              </label>
              <label className="grid gap-2 text-sm font-black text-slate-950">
                <span className="flex items-center gap-2">
                  <WhatsAppIcon />
                  واتساپ
                </span>
                <input
                  className={inputClassName}
                  dir="ltr"
                  inputMode="url"
                  name="whatsappUrl"
                  onChange={(event) =>
                    setIdentity((current) => ({
                      ...current,
                      whatsappUrl: event.target.value,
                    }))
                  }
                  placeholder="https://wa.me/..."
                  type="url"
                  value={identity.whatsappUrl}
                />
              </label>
              <label className="grid gap-2 text-sm font-black text-slate-950">
                <span className="flex items-center gap-2">
                  <RubikaIcon />
                  روبیکا
                </span>
                <input
                  className={inputClassName}
                  dir="ltr"
                  inputMode="url"
                  name="rubikaUrl"
                  onChange={(event) =>
                    setIdentity((current) => ({
                      ...current,
                      rubikaUrl: event.target.value,
                    }))
                  }
                  placeholder="https://rubika.ir/..."
                  type="url"
                  value={identity.rubikaUrl}
                />
              </label>
              <label className="grid gap-2 text-sm font-black text-slate-950">
                <span className="flex items-center gap-2">
                  <EitaaIcon />
                  ایتا
                </span>
                <input
                  className={inputClassName}
                  dir="ltr"
                  inputMode="url"
                  name="eitaaUrl"
                  onChange={(event) =>
                    setIdentity((current) => ({
                      ...current,
                      eitaaUrl: event.target.value,
                    }))
                  }
                  placeholder="https://eitaa.com/..."
                  type="url"
                  value={identity.eitaaUrl}
                />
              </label>
              <label className="grid gap-2 text-sm font-black text-slate-950 md:col-span-2">
                <span className="flex items-center gap-2">
                  <SurveyIcon />
                  لینک فرم نظرسنجی
                </span>
                <input
                  className={inputClassName}
                  dir="ltr"
                  inputMode="url"
                  name="surveyFormUrl"
                  onChange={(event) =>
                    setIdentity((current) => ({
                      ...current,
                      surveyFormUrl: event.target.value,
                    }))
                  }
                  placeholder="https://survey.example.com/..."
                  type="url"
                  value={identity.surveyFormUrl}
                />
                <span className="text-xs font-medium text-slate-500">
                  با ثبت این لینک، دکمهٔ «نظرسنجی» در نوار بالای سایت و فوتر نمایش
                  داده می‌شود.
                </span>
              </label>
            </div>

            <SaveBar
              hint="نشانی‌ها باید با https شروع شوند؛ خالی گذاشتن هر فیلد آن را از سایت برمی‌دارد."
              isSaving={isSavingLinks}
              label="ذخیره لینک‌ها"
            />
          </form>
        ) : null}

        {activeTab === "location" ? (
          <form action={saveLocationAction} className={panelClassName}>
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold tracking-wide text-teal-500">
                  موقعیت آزمایشگاه
                </p>
                <h3 className="mt-1 text-lg font-black text-slate-950">
                  انتخاب نقطه روی نقشه
                </h3>
                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                  روی نقشه کلیک کنید یا مختصات را وارد کنید؛ برای زوم با دو انگشت
                  روی موبایل استفاده کنید.
                </p>
              </div>
              <button
                className="min-h-11 shrink-0 rounded-xl border border-teal-200 bg-teal-50 px-4 text-sm font-extrabold text-teal-500 transition hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                onClick={useCurrentLocation}
                type="button"
              >
                استفاده از موقعیت فعلی
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-teal-100 bg-teal-50/50 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    جست‌وجو با استان و شهر
                  </h4>
                  <p className="mt-1 text-xs font-medium leading-6 text-slate-600">
                    نام استان و شهر را وارد کنید، سپس نتیجه درست را انتخاب کنید تا
                    نقطه روی نقشه قرار بگیرد.
                  </p>
                </div>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-teal-500 ring-1 ring-teal-100">
                  <SearchIcon />
                  جست‌وجوی ایران
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
                <label className="grid gap-2 text-sm font-black text-slate-950">
                  استان
                  <input
                    autoComplete="address-level1"
                    className={inputClassName}
                    maxLength={100}
                    name="province"
                    onChange={(event) =>
                      setIdentity((current) => ({
                        ...current,
                        province: event.target.value,
                      }))
                    }
                    placeholder="مثلاً تهران"
                    value={identity.province}
                  />
                </label>
                <label className="grid gap-2 text-sm font-black text-slate-950">
                  شهر
                  <input
                    autoComplete="address-level2"
                    className={inputClassName}
                    maxLength={100}
                    name="city"
                    onChange={(event) =>
                      setIdentity((current) => ({
                        ...current,
                        city: event.target.value,
                      }))
                    }
                    placeholder="مثلاً تهران"
                    value={identity.city}
                  />
                </label>
                <button
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(13,148,136,0.2)] transition hover:bg-teal-600 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal-500 disabled:opacity-60"
                  disabled={
                    isLocationSearching ||
                    (!identity.province.trim() && !identity.city.trim())
                  }
                  onClick={searchLocation}
                  type="button"
                >
                  {isLocationSearching ? (
                    "در حال جست‌وجو…"
                  ) : (
                    <>
                      <SearchIcon />
                      جست‌وجو
                    </>
                  )}
                </button>
              </div>
              {locationSearch.message ? (
                <p
                  className={`mt-3 rounded-xl px-3 py-2.5 text-sm font-bold ${locationSearch.results ? "bg-emerald-50 text-emerald-800" : "bg-white text-slate-700"}`}
                  role="status"
                >
                  {locationSearch.message}
                </p>
              ) : null}
              {locationSearch.results?.length ? (
                <div
                  aria-label="نتایج جست‌وجوی موقعیت"
                  className="mt-3 grid gap-2"
                >
                  {locationSearch.results.map((result) => (
                    <button
                      className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-white bg-white px-3 py-2.5 text-right text-sm font-bold text-slate-800 shadow-sm transition hover:border-teal-300 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                      key={`${result.latitude}-${result.longitude}`}
                      onClick={() => selectLocation(result)}
                      type="button"
                    >
                      <span className="min-w-0 leading-6">
                        {result.displayName}
                      </span>
                      <span className="shrink-0 rounded-lg bg-teal-50 px-2 py-1 text-[11px] font-extrabold text-teal-500">
                        انتخاب
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-black text-slate-950">
                عرض جغرافیایی
                <input
                  className={inputClassName}
                  dir="ltr"
                  inputMode="decimal"
                  max="90"
                  min="-90"
                  name="latitude"
                  onChange={(event) =>
                    setIdentity((current) => ({
                      ...current,
                      latitude: event.target.value,
                    }))
                  }
                  placeholder="35.689200"
                  step="0.000001"
                  type="number"
                  value={identity.latitude}
                />
              </label>
              <label className="grid gap-2 text-sm font-black text-slate-950">
                طول جغرافیایی
                <input
                  className={inputClassName}
                  dir="ltr"
                  inputMode="decimal"
                  max="180"
                  min="-180"
                  name="longitude"
                  onChange={(event) =>
                    setIdentity((current) => ({
                      ...current,
                      longitude: event.target.value,
                    }))
                  }
                  placeholder="51.389000"
                  step="0.000001"
                  type="number"
                  value={identity.longitude}
                />
              </label>
            </div>
            <div className="mt-5">
              <LocationPicker
                latitude={toCoordinate(identity.latitude)}
                longitude={toCoordinate(identity.longitude)}
                onChange={(location) =>
                  setIdentity((current) => ({
                    ...current,
                    latitude: location.latitude.toFixed(6),
                    longitude: location.longitude.toFixed(6),
                  }))
                }
              />
            </div>

            <SaveBar
              hint="عرض و طول جغرافیایی باید با هم پر یا با هم خالی باشند."
              isSaving={isSavingLocation}
              label="ذخیره موقعیت"
            />
          </form>
        ) : null}

        {activeTab === "phones" ? (
          <section className={panelClassName}>
            <PanelHeader
              eyebrow="شماره‌های تماس"
              icon={<PhoneIcon />}
              title="افزودن و مدیریت تلفن‌ها"
              tone="cyan"
            />
            <form
              className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_auto] sm:items-end"
              onSubmit={handleAddPhone}
            >
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                عنوان
                <input
                  className={inputClassName}
                  maxLength={80}
                  name="label"
                  placeholder="پذیرش"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                شماره تلفن
                <input
                  className={inputClassName}
                  dir="ltr"
                  maxLength={40}
                  name="phone"
                  placeholder="021 1234 5678"
                  required
                />
              </label>
              <button
                className="min-h-12 rounded-xl bg-slate-950 px-4 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-60"
                disabled={isPending}
                type="submit"
              >
                افزودن
              </button>
            </form>
            <div className="mt-5 grid gap-3">
              {settings.phoneNumbers.length > 0 ? (
                settings.phoneNumbers.map((phone) => (
                  <form
                    className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_auto_auto] sm:items-end"
                    key={phone.id}
                    onSubmit={(event) => {
                      event.preventDefault();
                      const form = event.currentTarget;
                      runAction(() => updateSitePhone({}, new FormData(form)));
                    }}
                  >
                    <input name="id" type="hidden" value={phone.id} />
                    <label className="grid gap-1.5 text-xs font-extrabold text-slate-600">
                      عنوان
                      <input
                        className={inputClassName}
                        defaultValue={phone.label ?? ""}
                        maxLength={80}
                        name="label"
                      />
                    </label>
                    <label className="grid gap-1.5 text-xs font-extrabold text-slate-600">
                      شماره تلفن
                      <input
                        className={inputClassName}
                        defaultValue={phone.phone}
                        dir="ltr"
                        maxLength={40}
                        name="phone"
                        required
                      />
                    </label>
                    <button
                      className="min-h-12 rounded-xl border border-teal-200 bg-white px-3 text-xs font-extrabold text-teal-500 transition hover:bg-teal-50 disabled:opacity-60"
                      disabled={isPending}
                      type="submit"
                    >
                      ذخیره
                    </button>
                    <button
                      aria-label={`حذف ${phone.phone}`}
                      className="grid min-h-12 min-w-12 place-items-center rounded-xl text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                      disabled={isPending}
                      onClick={() => void removePhone(phone.id, phone.phone)}
                      type="button"
                    >
                      <TrashIcon />
                    </button>
                  </form>
                ))
              ) : (
                <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-500">
                  هنوز شماره تلفنی ثبت نشده است.
                </p>
              )}
            </div>
          </section>
        ) : null}

        {activeTab === "addresses" ? (
          <section className={panelClassName}>
            <PanelHeader
              eyebrow="نشانی‌ها"
              icon={<PinIcon />}
              title="افزودن و مدیریت آدرس‌ها"
              tone="amber"
            />
            <form className="mt-5 grid gap-3" onSubmit={handleAddAddress}>
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                عنوان آدرس
                <input
                  className={inputClassName}
                  maxLength={100}
                  name="title"
                  placeholder="شعبه اصلی"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                متن آدرس
                <textarea
                  className={`${inputClassName} min-h-24 resize-y py-3 leading-6`}
                  maxLength={2_000}
                  name="address"
                  placeholder="نشانی کامل برای نمایش در فوتر"
                  required
                />
              </label>
              <button
                className="min-h-12 justify-self-end rounded-xl bg-slate-950 px-4 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-60"
                disabled={isPending}
                type="submit"
              >
                افزودن آدرس
              </button>
            </form>
            <div className="mt-5 grid gap-3">
              {settings.addresses.length > 0 ? (
                settings.addresses.map((address) => (
                  <form
                    className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3"
                    key={address.id}
                    onSubmit={(event) => {
                      event.preventDefault();
                      const form = event.currentTarget;
                      runAction(() => updateSiteAddress({}, new FormData(form)));
                    }}
                  >
                    <input name="id" type="hidden" value={address.id} />
                    <label className="grid gap-1.5 text-xs font-extrabold text-slate-600">
                      عنوان
                      <input
                        className={inputClassName}
                        defaultValue={address.title ?? ""}
                        maxLength={100}
                        name="title"
                      />
                    </label>
                    <label className="grid gap-1.5 text-xs font-extrabold text-slate-600">
                      آدرس
                      <textarea
                        className={`${inputClassName} min-h-20 resize-y py-3 leading-6`}
                        defaultValue={address.address}
                        maxLength={2_000}
                        name="address"
                        required
                      />
                    </label>
                    <div className="flex justify-end gap-2">
                      <button
                        className="min-h-11 rounded-xl border border-teal-200 bg-white px-4 text-xs font-extrabold text-teal-500 transition hover:bg-teal-50 disabled:opacity-60"
                        disabled={isPending}
                        type="submit"
                      >
                        ذخیره
                      </button>
                      <button
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-extrabold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                        disabled={isPending}
                        onClick={() =>
                          void removeAddress(
                            address.id,
                            address.title || "این نشانی",
                          )
                        }
                        type="button"
                      >
                        <TrashIcon />
                        حذف
                      </button>
                    </div>
                  </form>
                ))
              ) : (
                <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-500">
                  هنوز آدرسی ثبت نشده است.
                </p>
              )}
            </div>
          </section>
        ) : null}

        {activeTab === "workingHours" ? (
          <section className={panelClassName}>
            <PanelHeader
              eyebrow="ساعات کاری"
              icon={<ClockIcon />}
              title="افزودن و مدیریت زمان پاسخ‌گویی"
            />

            <div className="mt-5 rounded-2xl border border-teal-100 bg-teal-50/50 p-4">
              <p className="text-xs font-bold leading-6 text-slate-600">
                ایام تعطیل آزمایشگاه روی وضعیت «باز/بسته» در صفحهٔ نخست اثر
                می‌گذارد. جمعه‌ها همیشه تعطیل هستند.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-teal-500 px-4 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(13,148,136,0.23)] transition hover:bg-teal-600 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal-500"
                  onClick={() => setIsHolidayCalendarOpen(true)}
                  type="button"
                >
                  <CalendarIcon />
                  تنظیم ایام تعطیل
                </button>
                <button
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-teal-200 bg-white px-4 text-sm font-extrabold text-teal-600 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                  onClick={() => setIsHolidayListOpen(true)}
                  type="button"
                >
                  <ListIcon />
                  لیست ایام تعطیل
                  {settings.holidays.length > 0 ? (
                    <span className="grid size-6 place-items-center rounded-full bg-teal-500 text-[0.65rem] font-black text-white">
                      {settings.holidays.length.toLocaleString("fa-IR")}
                    </span>
                  ) : null}
                </button>
              </div>
            </div>

            <HolidayCalendarModal
              holidays={holidayDates}
              isOpen={isHolidayCalendarOpen}
              isSaving={isPending}
              onClose={() => setIsHolidayCalendarOpen(false)}
              onSave={saveHolidayMonth}
            />
            <HolidayListModal
              holidays={settings.holidays}
              isOpen={isHolidayListOpen}
              isPending={isPending}
              onClose={() => setIsHolidayListOpen(false)}
              onDelete={(holiday, label) => void removeHoliday(holiday, label)}
            />

            <form className="mt-5 grid gap-4" onSubmit={handleAddWorkingHour}>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                <WorkingHourFields
                  onChange={(nextValues) =>
                    setNewWorkingHour((current) => ({
                      ...current,
                      ...nextValues,
                    }))
                  }
                  onSelectTime={setNewWorkingHourPicker}
                  values={newWorkingHour}
                />
              </div>
              <div className="flex justify-end">
                <button
                  className="min-h-12 rounded-xl bg-slate-950 px-5 text-sm font-extrabold text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal-500 disabled:opacity-60"
                  disabled={isPending}
                  type="submit"
                >
                  افزودن بازه
                </button>
              </div>
            </form>

            {newWorkingHourPicker ? (
              <ClockTimePickerModal
                initialValue={newWorkingHour[newWorkingHourPicker]}
                onClose={() => setNewWorkingHourPicker(null)}
                onSelect={(value) => {
                  setNewWorkingHour((current) => ({
                    ...current,
                    [newWorkingHourPicker]: value,
                  }));
                  setNewWorkingHourPicker(null);
                }}
                title={
                  newWorkingHourPicker === "startTime"
                    ? "انتخاب ساعت شروع"
                    : "انتخاب ساعت پایان"
                }
              />
            ) : null}

            <div className="mt-5 grid gap-3">
              {settings.workingHours.length > 0 ? (
                settings.workingHours.map((workingHour) => (
                  <WorkingHourRow
                    isPending={isPending}
                    key={workingHour.id}
                    onDelete={(summary) =>
                      void removeWorkingHour(workingHour.id, summary)
                    }
                    onSave={(formData) =>
                      runAction(() => updateSiteWorkingHour({}, formData))
                    }
                    workingHour={workingHour}
                  />
                ))
              ) : (
                <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-500">
                  هنوز ساعات کاری ثبت نشده است.
                </p>
              )}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
