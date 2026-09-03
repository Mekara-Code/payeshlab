"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteAnnouncement,
  saveAnnouncement,
  toggleAnnouncementStatus,
  type AnnouncementActionState,
} from "@/app/admin/announcements/actions";
import { useToast } from "@/components/ui/toast-provider";
import { useActionToast } from "@/components/ui/use-action-toast";

type EditorLocale = "fa" | "en" | "ar";
type AnnouncementDraft = { description: string; title: string };

export type ManagedAnnouncement = {
  description: string;
  id: string;
  isActive: boolean;
  publishedAt: string;
  title: string;
  translations: Array<{
    description: string;
    locale: "FA" | "EN" | "AR";
    title: string;
  }>;
  updatedAt: string;
};

const initialState: AnnouncementActionState = {};
const editorLanguageOptions: Array<{ code: EditorLocale; label: string }> = [
  { code: "fa", label: "فارسی" },
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
];

function getEmptyDrafts(): Record<EditorLocale, AnnouncementDraft> {
  return {
    ar: { description: "", title: "" },
    en: { description: "", title: "" },
    fa: { description: "", title: "" },
  };
}

function formatPersianDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function EditIcon() {
  return <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24"><path d="m14.5 5.5 4 4M4 20l4.2-.8L19.5 7.9a1.4 1.4 0 0 0 0-2l-1.4-1.4a1.4 1.4 0 0 0-2 0L4.8 15.8 4 20Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

function BellIcon() {
  return <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24"><path d="M18 10a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

export function AnnouncementManager({ announcements }: { announcements: ManagedAnnouncement[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeLocale, setActiveLocale] = useState<EditorLocale>("fa");
  const [drafts, setDrafts] = useState<Record<EditorLocale, AnnouncementDraft>>(
    getEmptyDrafts,
  );
  const [state, formAction, isPending] = useActionState(saveAnnouncement, initialState);
  const [isManaging, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  useActionToast(state);

  const primaryDraft = drafts.fa;
  const serializedTranslations = useMemo(
    () =>
      JSON.stringify({
        ar: drafts.ar,
        en: drafts.en,
      }),
    [drafts],
  );

  const resetForm = () => {
    setEditingId(null);
    setActiveLocale("fa");
    setDrafts(getEmptyDrafts());
  };

  function updateDraft(field: keyof AnnouncementDraft, value: string) {
    setDrafts((current) => ({
      ...current,
      [activeLocale]: { ...current[activeLocale], [field]: value },
    }));
  }

  function startEditing(announcement: ManagedAnnouncement) {
    const nextDrafts = getEmptyDrafts();
    nextDrafts.fa = {
      description: announcement.description,
      title: announcement.title,
    };
    announcement.translations.forEach((translation) => {
      if (translation.locale === "FA") return;
      const locale = translation.locale.toLowerCase() as Exclude<EditorLocale, "fa">;
      nextDrafts[locale] = {
        description: translation.description,
        title: translation.title,
      };
    });

    setEditingId(announcement.id);
    setActiveLocale("fa");
    setDrafts(nextDrafts);
    window.scrollTo({ behavior: "smooth", top: 0 });
  }

  function runAnnouncementAction(action: () => Promise<AnnouncementActionState>, resetAfterSuccess = false) {
    startTransition(async () => {
      const result = await action();
      if (result.message)
        toast(result.message, { variant: result.success ? "success" : "error" });
      if (result.success) {
        if (resetAfterSuccess) resetForm();
        router.refresh();
      }
    });
  }

  const activeDraft = drafts[activeLocale];

  return (
    <div className="pb-8">
      <form action={formAction} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)] sm:p-7">
        <input name="id" type="hidden" value={editingId ?? ""} />
        <input name="title" type="hidden" value={primaryDraft.title} />
        <input name="description" type="hidden" value={primaryDraft.description} />
        <input name="translationsJson" type="hidden" value={serializedTranslations} />
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-teal-100 text-teal-500"><BellIcon /></span>
            <div>
              <p className="text-xs font-extrabold tracking-wide text-teal-500">مدیریت اطلاع‌رسانی</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">{editingId ? "ویرایش اطلاعیه" : "اطلاعیه جدید"}</h2>
            </div>
          </div>
          {editingId ? <button className="min-h-11 rounded-xl px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-100" onClick={resetForm} type="button">لغو ویرایش</button> : null}
        </div>

        <div aria-label="زبان اطلاعیه" className="mt-5 flex flex-wrap items-center gap-2" role="tablist">
          <span className="ml-1 text-xs font-extrabold text-slate-500">زبان محتوا:</span>
          {editorLanguageOptions.map((option) => {
            const isActive = option.code === activeLocale;
            return (
              <button
                aria-selected={isActive}
                className={`min-h-10 rounded-xl px-4 text-sm font-extrabold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${isActive ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-500"}`}
                key={option.code}
                onClick={() => setActiveLocale(option.code)}
                role="tab"
                type="button"
              >
                {option.label}
              </button>
            );
          })}
          <span className="mr-auto text-xs font-medium text-slate-500">فارسی زبان اصلی است؛ ترجمه‌های خالی نمایش داده نمی‌شوند.</span>
        </div>

        <div className="mt-6 grid gap-5" dir={activeLocale === "en" ? "ltr" : "rtl"}>
          <label className="grid gap-2 text-sm font-black text-slate-950">عنوان اطلاعیه<input className="min-h-12 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" maxLength={200} onChange={(event) => updateDraft("title", event.target.value)} placeholder="عنوان کوتاه و روشن اطلاعیه" required={activeLocale === "fa"} value={activeDraft.title} /></label>
          <label className="grid gap-2 text-sm font-black text-slate-950">توضیحات کامل<textarea className="min-h-40 resize-y rounded-xl border border-slate-200 p-4 text-sm font-medium leading-7 text-slate-800 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" maxLength={10_000} onChange={(event) => updateDraft("description", event.target.value)} placeholder="متنی که کاربران در مودال اطلاعیه می‌خوانند…" required={activeLocale === "fa"} value={activeDraft.description} /></label>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          <button className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60" disabled={isPending} name="status" type="submit" value="inactive">ذخیره غیرفعال</button>
          <button className="min-h-11 rounded-xl bg-teal-500 px-4 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(13,148,136,0.23)] transition hover:bg-teal-500 disabled:opacity-60" disabled={isPending} name="status" type="submit" value="active">{isPending ? "در حال ذخیره…" : editingId ? "به‌روزرسانی و انتشار" : "انتشار اطلاعیه"}</button>
        </div>
      </form>

      <section className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold tracking-wide text-teal-500">فهرست اطلاعیه‌ها</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">اطلاعیه‌های ثبت‌شده</h2>
          </div>
          <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-extrabold text-teal-500">{announcements.length.toLocaleString("fa-IR")} مورد</span>
        </div>

        {announcements.length > 0 ? (
          <div className="mt-5 grid gap-3">
            {announcements.map((announcement) => (
              <article className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between" key={announcement.id}>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${announcement.isActive ? "bg-teal-100 text-teal-500" : "bg-slate-200 text-slate-600"}`}>{announcement.isActive ? "نمایش در صفحه نخست" : "غیرفعال"}</span>
                    <time className="text-xs font-bold text-slate-500" dateTime={announcement.publishedAt}>{formatPersianDate(announcement.publishedAt)}</time>
                  </div>
                  <h3 className="mt-2 truncate text-sm font-black text-slate-900 sm:text-base">{announcement.title}</h3>
                  <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500">{announcement.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-white px-3 text-xs font-extrabold text-teal-500 ring-1 ring-teal-100 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500" onClick={() => startEditing(announcement)} type="button"><EditIcon />ویرایش</button>
                  <button className="min-h-10 rounded-xl bg-white px-3 text-xs font-extrabold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:opacity-60" disabled={isManaging} onClick={() => runAnnouncementAction(() => toggleAnnouncementStatus(announcement.id, announcement.isActive))} type="button">{announcement.isActive ? "غیرفعال کردن" : "انتشار"}</button>
                  <button className="min-h-10 rounded-xl px-3 text-xs font-extrabold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60" disabled={isManaging} onClick={() => runAnnouncementAction(() => deleteAnnouncement(announcement.id), editingId === announcement.id)} type="button">حذف</button>
                </div>
              </article>
            ))}
          </div>
        ) : <p className="mt-5 rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-bold text-slate-500">هنوز اطلاعیه‌ای ثبت نشده است.</p>}
      </section>
    </div>
  );
}
