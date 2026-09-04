"use client";

/* eslint-disable @next/next/no-img-element -- Object URLs and dynamic uploaded assets are previewed here. */

import { useEffect, useRef, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createGalleryMedia,
  deleteGalleryMedia,
  toggleGalleryMedia,
  updateGalleryMedia,
  type GalleryActionState,
} from "@/app/admin/gallery/actions";
import { useToast } from "@/components/ui/toast-provider";
import type { GalleryMediaData } from "@/lib/gallery-data";

export type ManagedGalleryMedia = GalleryMediaData & {
  isActive: boolean;
  updatedAt: string;
};

type ModalMode = "create" | "edit" | null;
type MediaType = "IMAGE" | "VIDEO";

const initialState: GalleryActionState = {};
const maxImageBytes = 10 * 1024 * 1024;
const maxVideoBytes = 64 * 1024 * 1024;
const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const acceptedVideoTypes = new Set(["video/mp4", "video/webm"]);

function Icon({ children, className = "size-5" }: { children: React.ReactNode; className?: string }) {
  return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">{children}</svg>;
}

function PlusIcon() {
  return <Icon><path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /></Icon>;
}

function PhotoIcon() {
  return <Icon><rect height="14" rx="2" stroke="currentColor" strokeWidth="1.8" width="18" x="3" y="5" /><path d="m7 15 3-3 2.5 2.5 2-2L18 16M8 9h.01" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></Icon>;
}

function VideoIcon() {
  return <Icon><rect height="14" rx="2" stroke="currentColor" strokeWidth="1.8" width="18" x="3" y="5" /><path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" /></Icon>;
}

function EditIcon() {
  return <Icon className="size-4"><path d="m14.7 5.1 4.2 4.2M5 19l4.1-.9L19 8.2a1.5 1.5 0 0 0 0-2.1l-1.1-1.1a1.5 1.5 0 0 0-2.1 0L5.9 14.9 5 19Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></Icon>;
}

function TrashIcon() {
  return <Icon className="size-4"><path d="M4 7h16m-10 4v5m4-5v5M9 7l.7-2h4.6l.7 2m-9 0 .8 12h10.4L18 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></Icon>;
}

function CloseIcon() {
  return <Icon><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /></Icon>;
}

function UploadIcon() {
  return <Icon className="size-6"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 15.5v2.25A2.25 2.25 0 0 0 7.25 20h9.5A2.25 2.25 0 0 0 19 17.75V15.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></Icon>;
}

function PlayIcon() {
  return <Icon className="size-5"><path d="m9 7 7 5-7 5V7Z" fill="currentColor" /></Icon>;
}

function revokeUrl(url: string | null) {
  if (url) URL.revokeObjectURL(url);
}

export function GalleryManager({ media }: { media: ManagedGalleryMedia[] }) {
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingMedia, setEditingMedia] = useState<ManagedGalleryMedia | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>("IMAGE");
  const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null);
  const [selectedPosterFile, setSelectedPosterFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState("");
  const [posterError, setPosterError] = useState("");
  const [state, setState] = useState<GalleryActionState>(initialState);
  const [isPending, startTransition] = useTransition();
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();
  const isModalOpen = modalMode !== null;
  const isEditing = modalMode === "edit" && editingMedia !== null;

  useEffect(() => () => revokeUrl(mediaPreview), [mediaPreview]);

  useEffect(() => () => revokeUrl(posterPreview), [posterPreview]);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  function clearFiles() {
    revokeUrl(mediaPreview);
    revokeUrl(posterPreview);
    setSelectedMediaFile(null);
    setSelectedPosterFile(null);
    setMediaPreview(null);
    setPosterPreview(null);
    setMediaError("");
    setPosterError("");
    if (mediaInputRef.current) mediaInputRef.current.value = "";
    if (posterInputRef.current) posterInputRef.current.value = "";
  }

  function selectMedia(file: File | undefined) {
    if (!file) return;
    const isImage = mediaType === "IMAGE";
    const valid = isImage
      ? acceptedImageTypes.has(file.type) && file.size <= maxImageBytes
      : acceptedVideoTypes.has(file.type) && file.size <= maxVideoBytes;
    if (!valid) {
      setMediaError(isImage ? "فقط JPG، PNG یا WebP تا ۱۰ مگابایت قابل بارگذاری است." : "فقط MP4 یا WebM تا ۶۴ مگابایت قابل بارگذاری است.");
      return;
    }
    revokeUrl(mediaPreview);
    setSelectedMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setMediaError("");
  }

  function selectPoster(file: File | undefined) {
    if (!file) return;
    if (!acceptedImageTypes.has(file.type) || file.size > maxImageBytes) {
      setPosterError("پوستر باید JPG، PNG یا WebP و حداکثر ۱۰ مگابایت باشد.");
      return;
    }
    revokeUrl(posterPreview);
    setSelectedPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
    setPosterError("");
  }

  function changeType(type: MediaType) {
    if (type === mediaType) return;
    revokeUrl(mediaPreview);
    setSelectedMediaFile(null);
    setMediaPreview(null);
    setMediaError("");
    if (mediaInputRef.current) mediaInputRef.current.value = "";
    if (type === "IMAGE") {
      revokeUrl(posterPreview);
      setSelectedPosterFile(null);
      setPosterPreview(null);
      setPosterError("");
      if (posterInputRef.current) posterInputRef.current.value = "";
    }
    setMediaType(type);
  }

  function openCreateModal() {
    clearFiles();
    setState(initialState);
    setEditingMedia(null);
    setMediaType("IMAGE");
    setModalMode("create");
  }

  function openEditModal(item: ManagedGalleryMedia) {
    clearFiles();
    setState(initialState);
    setEditingMedia(item);
    setMediaType(item.type);
    setModalMode("edit");
  }

  function closeModal() {
    if (isPending) return;
    clearFiles();
    setState(initialState);
    setEditingMedia(null);
    setModalMode(null);
  }

  function submitMedia(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isEditing && !selectedMediaFile) {
      const message = "فایل اصلی رسانه را انتخاب کنید.";
      setState({ message });
      toast(message, { variant: "error" });
      return;
    }

    const formData = new FormData(event.currentTarget);
    if (selectedMediaFile) formData.set("mediaFile", selectedMediaFile);
    if (selectedPosterFile) formData.set("posterFile", selectedPosterFile);
    startTransition(async () => {
      const result = isEditing && editingMedia
        ? await updateGalleryMedia(editingMedia.id, formData)
        : await createGalleryMedia(initialState, formData);
      setState(result);
      if (!result.success) {
        toast(result.message ?? "ثبت رسانه انجام نشد.", { variant: "error" });
        return;
      }
      toast(result.message ?? "تغییرات با موفقیت ثبت شد.", { variant: "success" });
      closeModal();
      router.refresh();
    });
  }

  function toggleMedia(item: ManagedGalleryMedia) {
    startTransition(async () => {
      const result = await toggleGalleryMedia(item.id, item.isActive);
      if (result.message) toast(result.message, { variant: result.success ? "success" : "error" });
      if (result.success) router.refresh();
    });
  }

  function deleteMedia(item: ManagedGalleryMedia) {
    if (!window.confirm(`از حذف «${item.title}» مطمئن هستید؟ فایل رسانه نیز پاک می‌شود.`)) return;
    startTransition(async () => {
      const result = await deleteGalleryMedia(item.id);
      if (result.message) toast(result.message, { variant: result.success ? "success" : "error" });
      if (result.success) router.refresh();
    });
  }

  const displayedMediaUrl = mediaPreview ?? editingMedia?.mediaUrl ?? null;
  const displayedPosterUrl = posterPreview ?? editingMedia?.posterUrl ?? null;

  return (
    <section className="pb-8" dir="rtl">
      <div className="rounded-[1.75rem] border border-teal-100 bg-[linear-gradient(120deg,#ffffff,rgba(240,253,250,0.86))] p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-teal-500/10 px-3 py-1.5 text-xs font-extrabold text-teal-500">رسانه‌های عمومی سایت</span>
            <h2 className="mt-4 text-2xl font-black tracking-[-0.05em] text-slate-950 sm:text-3xl">مدیریت گالری عکس و فیلم</h2>
            <p className="mt-3 text-sm font-medium leading-7 text-slate-600 sm:text-base">تصاویر در هنگام ثبت به WebP کم‌حجم و بدون متادیتا تبدیل می‌شوند. برای ویدئو، MP4 یا WebM معتبر بارگذاری کنید و در صورت نیاز پوستر جداگانه بگذارید.</p>
          </div>
          <button aria-expanded={isModalOpen} aria-haspopup="dialog" className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-teal-500 px-4 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(13,148,136,0.22)] transition duration-200 hover:bg-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500" onClick={openCreateModal} type="button"><PlusIcon />افزودن رسانه</button>
        </div>
      </div>

      {media.length > 0 ? <section aria-label="فهرست رسانه‌های گالری" className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {media.map((item) => <article className="overflow-hidden rounded-[1.5rem] border border-white bg-white shadow-[0_14px_32px_rgba(15,23,42,0.05)]" key={item.id}>
          <div className="relative aspect-[4/3] bg-slate-100">
            {item.type === "IMAGE" ? <img alt={item.altText} className="size-full object-cover" src={item.mediaUrl} /> : <>
              {item.posterUrl ? <img alt="" className="size-full object-cover" src={item.posterUrl} /> : <div className="grid size-full place-items-center bg-slate-900 text-white"><VideoIcon /></div>}
              <span className="absolute inset-0 grid place-items-center bg-slate-950/20 text-white"><span className="grid size-12 place-items-center rounded-full bg-white/90 text-slate-950 shadow-lg"><PlayIcon /></span></span>
            </>}
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-950/70 px-2.5 py-1.5 text-xs font-extrabold text-white backdrop-blur">{item.type === "IMAGE" ? <PhotoIcon /> : <VideoIcon />}{item.type === "IMAGE" ? "عکس" : "ویدئو"}</span>
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="line-clamp-2 text-lg font-black text-slate-950">{item.title}</h3>{item.description ? <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-slate-600">{item.description}</p> : null}</div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold ${item.isActive ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{item.isActive ? "فعال" : "غیرفعال"}</span></div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><span className="text-xs font-bold text-slate-500">اولویت {item.sortOrder}</span><div className="flex flex-wrap gap-2"><button className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-extrabold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} onClick={() => openEditModal(item)} type="button"><EditIcon />ویرایش</button><button className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-extrabold text-rose-700 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} onClick={() => deleteMedia(item)} type="button"><TrashIcon />حذف</button></div></div>
            <button className="mt-3 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-extrabold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} onClick={() => toggleMedia(item)} type="button">{item.isActive ? "توقف نمایش در گالری" : "فعال‌سازی نمایش در گالری"}</button>
          </div>
        </article>)}
      </section> : <p className="mt-5 rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm font-bold leading-7 text-slate-600">هنوز رسانه‌ای در گالری ثبت نشده است. با افزودن عکس یا ویدئو شروع کنید.</p>}

      {isModalOpen ? <div aria-label="پنجره مدیریت رسانه" className="admin-modal-scrim fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-slate-950/45 p-3 backdrop-blur-[2px] sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
        <form aria-describedby="gallery-form-description" aria-labelledby="gallery-form-title" className="admin-modal-panel max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-[0_24px_72px_rgba(15,23,42,0.28)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[2.5rem] sm:p-7" key={editingMedia?.id ?? "create"} onSubmit={submitMedia} role="dialog" aria-modal="true">
          <div className="sticky top-0 z-10 -mx-5 -mt-5 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-5 pb-5 pt-5 backdrop-blur sm:-mx-7 sm:-mt-7 sm:px-7 sm:pt-7"><div><p className="text-xs font-black tracking-wide text-teal-500">{isEditing ? "ویرایش رسانه" : "رسانه جدید"}</p><h3 className="mt-2 text-xl font-black tracking-[-0.04em] text-slate-950 sm:text-2xl" id="gallery-form-title">{isEditing ? "ویرایش اطلاعات و فایل رسانه" : "افزودن عکس یا ویدئو"}</h3><p className="mt-2 text-sm font-medium leading-6 text-slate-600" id="gallery-form-description">اطلاعات دسترس‌پذیر، اولویت نمایش و وضعیت انتشار را مشخص کنید.</p></div><button aria-label="بستن پنجره" className="grid size-11 shrink-0 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} onClick={closeModal} type="button"><CloseIcon /></button></div>

          <div className="grid gap-5 pt-6">
            <fieldset><legend className="text-sm font-extrabold text-slate-800">نوع رسانه <span className="text-rose-700">*</span></legend><div className="mt-2 grid gap-3 sm:grid-cols-2"><label className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 transition ${mediaType === "IMAGE" ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 bg-white text-slate-700 hover:border-teal-200"}`}><input checked={mediaType === "IMAGE"} className="sr-only" name="type" onChange={() => changeType("IMAGE")} type="radio" value="IMAGE" /><PhotoIcon />عکس</label><label className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 transition ${mediaType === "VIDEO" ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 bg-white text-slate-700 hover:border-teal-200"}`}><input checked={mediaType === "VIDEO"} className="sr-only" name="type" onChange={() => changeType("VIDEO")} type="radio" value="VIDEO" /><VideoIcon />ویدئو</label></div></fieldset>

            <div><p className="text-sm font-extrabold text-slate-800" id="gallery-media-label">فایل {mediaType === "IMAGE" ? "عکس" : "ویدئو"} {!isEditing ? <span className="text-rose-700">*</span> : <span className="font-medium text-slate-500">(برای حفظ فایل فعلی، خالی بگذارید)</span>}</p><input accept={mediaType === "IMAGE" ? "image/jpeg,image/png,image/webp" : "video/mp4,video/webm"} className="sr-only" id="gallery-media" name="mediaFile" onChange={(event: ChangeEvent<HTMLInputElement>) => selectMedia(event.target.files?.[0])} ref={mediaInputRef} type="file" /><label aria-describedby="gallery-media-help" aria-labelledby="gallery-media-label" className="relative mt-2 flex min-h-52 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-4 transition hover:border-teal-300 hover:bg-teal-50/50 sm:min-h-72" htmlFor="gallery-media">{displayedMediaUrl ? mediaType === "IMAGE" ? <img alt={selectedMediaFile ? "پیش‌نمایش تصویر انتخاب‌شده" : editingMedia?.altText ?? "تصویر گالری"} className="absolute inset-0 size-full object-cover" src={displayedMediaUrl} /> : <video className="absolute inset-0 size-full object-cover" controls={Boolean(selectedMediaFile)} poster={displayedPosterUrl ?? undefined} preload="metadata" src={displayedMediaUrl} /> : <span className="flex max-w-sm flex-col items-center text-center"><span className="grid size-14 place-items-center rounded-2xl bg-teal-500 text-white shadow-[0_10px_20px_rgba(13,148,136,0.2)]"><UploadIcon /></span><span className="mt-4 text-sm font-extrabold text-slate-800">فایل را اینجا رها کنید یا انتخاب کنید</span></span>}{displayedMediaUrl ? <span className="relative self-end rounded-full bg-slate-950/70 px-3 py-1.5 text-xs font-extrabold text-white backdrop-blur">{selectedMediaFile ? selectedMediaFile.name : "برای جایگزینی فایل، کلیک کنید"}</span> : null}</label><p className="mt-2 text-xs font-medium text-slate-500" id="gallery-media-help">{mediaType === "IMAGE" ? "JPG، PNG یا WebP تا ۱۰ مگابایت؛ بعد از ثبت، تصویر به WebP فشرده می‌شود." : "MP4 یا WebM تا ۶۴ مگابایت؛ در تولید بهتر است از نسخهٔ کم‌حجم و بهینه استفاده شود."}</p>{mediaError ? <p className="mt-2 text-sm font-bold text-rose-700" role="alert">{mediaError}</p> : null}</div>

            {mediaType === "VIDEO" ? <div><p className="text-sm font-extrabold text-slate-800" id="gallery-poster-label">پوستر ویدئو <span className="font-medium text-slate-500">(اختیاری)</span></p><input accept="image/jpeg,image/png,image/webp" className="sr-only" id="gallery-poster" name="posterFile" onChange={(event: ChangeEvent<HTMLInputElement>) => selectPoster(event.target.files?.[0])} ref={posterInputRef} type="file" /><label aria-describedby="gallery-poster-help" aria-labelledby="gallery-poster-label" className="relative mt-2 flex min-h-36 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-4 transition hover:border-teal-300 hover:bg-teal-50/50" htmlFor="gallery-poster">{displayedPosterUrl ? <img alt="پیش‌نمایش پوستر ویدئو" className="absolute inset-0 size-full object-cover" src={displayedPosterUrl} /> : <span className="flex items-center gap-2 text-sm font-extrabold text-slate-700"><PhotoIcon />انتخاب پوستر ویدئو</span>}</label><p className="mt-2 text-xs font-medium text-slate-500" id="gallery-poster-help">پوستر هم با همان سامانه به WebP فشرده می‌شود.</p>{isEditing && editingMedia?.posterUrl && !selectedPosterFile ? <label className="mt-2 flex min-h-11 cursor-pointer items-center gap-2 text-sm font-bold text-rose-700"><input className="size-4 accent-rose-700" name="removePoster" type="checkbox" />حذف پوستر فعلی</label> : null}{posterError ? <p className="mt-2 text-sm font-bold text-rose-700" role="alert">{posterError}</p> : null}</div> : null}

            <div className="grid gap-4 sm:grid-cols-2"><div><label className="text-sm font-extrabold text-slate-800" htmlFor="gallery-title">عنوان <span className="text-rose-700">*</span></label><input className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" defaultValue={editingMedia?.title ?? ""} id="gallery-title" maxLength={160} name="title" placeholder="مثلاً بخش پذیرش آزمایشگاه" required /></div><div><label className="text-sm font-extrabold text-slate-800" htmlFor="gallery-alt">متن جایگزین <span className="text-rose-700">*</span></label><input className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" defaultValue={editingMedia?.altText ?? ""} id="gallery-alt" maxLength={240} name="altText" placeholder="توضیح دقیق برای کاربران و موتورهای جست‌وجو" required /></div></div>
            <div><label className="text-sm font-extrabold text-slate-800" htmlFor="gallery-description">توضیح <span className="font-medium text-slate-500">(اختیاری)</span></label><textarea className="mt-2 min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-base font-medium leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" defaultValue={editingMedia?.description ?? ""} id="gallery-description" maxLength={1200} name="description" placeholder="توضیح کوتاهی از این لحظه یا فضای آزمایشگاه" /></div>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)] sm:items-end"><div><label className="text-sm font-extrabold text-slate-800" htmlFor="gallery-sort-order">اولویت نمایش</label><input className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base font-medium text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" defaultValue={editingMedia?.sortOrder ?? ""} id="gallery-sort-order" inputMode="numeric" maxLength={7} name="sortOrder" placeholder="خودکار" /></div><label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-extrabold text-slate-700"><input className="size-4 accent-teal-600" defaultChecked={editingMedia?.isActive ?? true} name="isActive" type="checkbox" />نمایش این رسانه در گالری عمومی</label></div>
            {state.message && !state.success ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700" role="alert">{state.message}</p> : null}
            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5"><button className="min-h-12 rounded-xl px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} onClick={closeModal} type="button">انصراف</button><button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-500 px-5 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(13,148,136,0.22)] transition hover:bg-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} type="submit">{isPending ? "در حال ذخیره…" : isEditing ? "ذخیره تغییرات" : "ثبت در گالری"}</button></div>
          </div>
        </form>
      </div> : null}
    </section>
  );
}
