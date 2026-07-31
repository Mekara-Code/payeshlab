"use client";

/* eslint-disable @next/next/no-img-element -- The uploader preview uses a browser Blob URL and persisted slide paths are dynamic. */

import { useEffect, useRef, useState, useTransition, type ChangeEvent, type DragEvent, type FormEvent, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createSlideshowSlide,
  deleteSlideshowSlide,
  toggleSlideshowSlide,
  updateSlideshowSlide,
  type SlideshowActionState,
} from "@/app/admin/slideshow/actions";
import { useToast } from "@/components/ui/toast-provider";
import type { SlideshowSlideData } from "@/lib/slideshow-data";

type ManagedSlide = SlideshowSlideData & { isActive: boolean };
type ModalMode = "create" | "edit" | null;

const initialState: SlideshowActionState = {};
const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 6 * 1024 * 1024;

function AddImageIcon() {
  return <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 15.5v2.25A2.25 2.25 0 0 0 7.25 20h9.5A2.25 2.25 0 0 0 19 17.75V15.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

function PlusIcon() {
  return <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /></svg>;
}

function CloseIcon() {
  return <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /></svg>;
}

function EditIcon() {
  return <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24"><path d="m14.7 5.1 4.2 4.2M5 19l4.1-.9L19 8.2a1.5 1.5 0 0 0 0-2.1l-1.1-1.1a1.5 1.5 0 0 0-2.1 0L5.9 14.9 5 19Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

function TrashIcon() {
  return <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24"><path d="M4 7h16m-10 4v5m4-5v5M9 7l.7-2h4.6l.7 2m-9 0 .8 12h10.4L18 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

export function SlideshowManager({ slides }: { slides: ManagedSlide[] }) {
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingSlide, setEditingSlide] = useState<ManagedSlide | null>(null);
  const [, setState] = useState<SlideshowActionState>(initialState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const isModalOpen = modalMode !== null;
  const isEditing = modalMode === "edit" && editingSlide !== null;
  const displayedImageUrl = previewUrl ?? editingSlide?.imageUrl ?? null;

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  function clearImage() {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setImageFile(null);
    setPreviewUrl(null);
    setImageError("");
    setIsDraggingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function selectImage(file: File | undefined) {
    if (!file) return;
    if (!acceptedImageTypes.has(file.type) || file.size > maxImageSize) {
      setImageError("فقط PNG، JPG یا WebP با حجم حداکثر ۶ مگابایت قابل بارگذاری است.");
      return;
    }

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const nextPreviewUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextPreviewUrl;
    setImageFile(file);
    setPreviewUrl(nextPreviewUrl);
    setImageError("");
  }

  function handleImageInput(event: ChangeEvent<HTMLInputElement>) {
    selectImage(event.target.files?.[0]);
  }

  function handleImageDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDraggingImage(false);
    selectImage(event.dataTransfer.files[0]);
  }

  function openCreateModal() {
    clearImage();
    setState(initialState);
    setEditingSlide(null);
    setModalMode("create");
  }

  function openEditModal(slide: ManagedSlide) {
    clearImage();
    setState(initialState);
    setEditingSlide(slide);
    setModalMode("edit");
  }

  function closeModal() {
    if (isPending) return;
    clearImage();
    setState(initialState);
    setEditingSlide(null);
    setModalMode(null);
  }

  function handleModalBackdrop(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) closeModal();
  }

  function submitSlide(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isEditing && !imageFile) {
      const message = "تصویر اسلاید را انتخاب کنید.";
      setState({ message });
      toast(message, { variant: "error" });
      return;
    }

    const formData = new FormData(event.currentTarget);
    if (imageFile) formData.set("slideImage", imageFile);

    startTransition(async () => {
      const result = isEditing && editingSlide
        ? await updateSlideshowSlide(editingSlide.id, formData)
        : await createSlideshowSlide(initialState, formData);
      setState(result);
      if (!result.success) {
        toast(result.message ?? "ثبت اسلاید انجام نشد.", { variant: "error" });
        return;
      }
      if (result.success) {
        toast(result.message ?? "تغییرات با موفقیت ثبت شد.", {
          variant: "success",
        });
        formRef.current?.reset();
        clearImage();
        setEditingSlide(null);
        setModalMode(null);
        router.refresh();
      }
    });
  }

  function toggleSlide(slide: ManagedSlide) {
    startTransition(async () => {
      const result = await toggleSlideshowSlide(slide.id, slide.isActive);
      if (result.message)
        toast(result.message, { variant: result.success ? "success" : "error" });
      if (result.success) router.refresh();
    });
  }

  function deleteSlide(slide: ManagedSlide) {
    if (!window.confirm(`از حذف «${slide.title || "این اسلاید"}» مطمئن هستید؟`)) return;

    startTransition(async () => {
      const result = await deleteSlideshowSlide(slide.id);
      if (result.message)
        toast(result.message, { variant: result.success ? "success" : "error" });
      if (result.success) router.refresh();
    });
  }

  return (
    <section className="pb-8" dir="rtl">
      <div className="rounded-[1.75rem] border border-teal-100 bg-[linear-gradient(120deg,#ffffff,rgba(240,253,250,0.86))] p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-teal-500/10 px-3 py-1.5 text-xs font-extrabold text-teal-500">ویترین صفحهٔ نخست</span>
            <h2 className="mt-4 text-2xl font-black tracking-[-0.05em] text-slate-950 sm:text-3xl">مدیریت اسلایدشو</h2>
            <p className="mt-3 text-sm font-medium leading-7 text-slate-600 sm:text-base">تصاویر و پیام‌های اصلی را برای اسلایدر تمام‌عرض صفحهٔ نخست ثبت کنید.</p>
          </div>
          <button aria-expanded={isModalOpen} aria-haspopup="dialog" className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-teal-500 px-4 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(13,148,136,0.22)] transition duration-200 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500" onClick={openCreateModal} type="button"><PlusIcon />افزودن اسلاید</button>
        </div>
      </div>

      <section aria-label="فهرست اسلایدها" className="mt-5 grid gap-4 lg:grid-cols-2">
        {slides.map((slide) => (
          <article className="overflow-hidden rounded-[1.5rem] border border-white bg-white shadow-[0_14px_32px_rgba(15,23,42,0.05)]" key={slide.id}>
            <div className="relative aspect-[16/8] bg-slate-100"><img alt={slide.altText} className="size-full object-cover" src={slide.imageUrl} /></div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-black text-slate-950">{slide.title || "اسلاید بدون عنوان"}</h3><p className="mt-1 text-sm font-medium leading-6 text-slate-600">{slide.subtitle || "بدون توضیح"}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold ${slide.isActive ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{slide.isActive ? "فعال" : "غیرفعال"}</span></div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <span className="text-xs font-bold text-slate-500">اولویت {slide.sortOrder}</span>
                <div className="flex flex-wrap gap-2">
                  <button className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-extrabold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} onClick={() => openEditModal(slide)} type="button"><EditIcon />ویرایش</button>
                  <button className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-extrabold text-rose-700 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} onClick={() => deleteSlide(slide)} type="button"><TrashIcon />حذف</button>
                  <button className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm font-extrabold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} onClick={() => toggleSlide(slide)} type="button">{slide.isActive ? "توقف نمایش" : "فعال‌سازی"}</button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      {slides.length === 0 && <p className="mt-5 rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-5 py-8 text-center text-sm font-bold leading-7 text-slate-600">هنوز اسلایدی ثبت نشده است. از دکمهٔ «افزودن اسلاید» برای شروع استفاده کنید.</p>}

      {isModalOpen && (
        <div aria-label="پنجرهٔ مدیریت اسلاید" className="admin-modal-scrim fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-slate-950/45 p-3 backdrop-blur-[2px] sm:p-6" onClick={handleModalBackdrop}>
          <form aria-describedby="slide-form-description" aria-labelledby="slide-form-title" className="admin-modal-panel max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-[0_24px_72px_rgba(15,23,42,0.28)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[2.5rem] sm:p-7" key={editingSlide?.id ?? "create"} onSubmit={submitSlide} ref={formRef} role="dialog" aria-modal="true">
            <div className="sticky top-0 z-10 -mx-5 -mt-5 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-5 pb-5 pt-5 backdrop-blur sm:-mx-7 sm:-mt-7 sm:px-7 sm:pt-7">
              <div>
                <p className="text-xs font-black tracking-wide text-teal-500">{isEditing ? "ویرایش اسلاید" : "اسلاید جدید"}</p>
                <h3 className="mt-2 text-xl font-black tracking-[-0.04em] text-slate-950 sm:text-2xl" id="slide-form-title">{isEditing ? "ویرایش اطلاعات اسلاید" : "افزودن اسلاید"}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-600" id="slide-form-description">تصویر عریض بهترین نمایش را در صفحهٔ نخست دارد.</p>
              </div>
              <button aria-label="بستن پنجره" className="grid size-11 shrink-0 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} onClick={closeModal} type="button"><CloseIcon /></button>
            </div>

            <div className="grid gap-5 pt-6">
              <div>
                <p className="text-sm font-extrabold text-slate-800" id="slide-image-label">تصویر اسلاید {!isEditing && <span className="text-rose-700">*</span>}</p>
                <input accept="image/jpeg,image/png,image/webp" className="sr-only" id="slide-image" name="slideImage" onChange={handleImageInput} ref={fileInputRef} type="file" />
                <label
                  aria-describedby="slide-image-help"
                  aria-labelledby="slide-image-label"
                  className={`relative mt-2 flex min-h-48 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-4 transition duration-200 sm:min-h-72 ${isDraggingImage ? "border-teal-500 bg-teal-50/80 shadow-[0_0_0_5px_rgba(20,184,166,0.1)]" : "border-slate-200 bg-slate-50/70 hover:border-teal-300 hover:bg-teal-50/50"}`}
                  htmlFor="slide-image"
                  onDragEnter={() => setIsDraggingImage(true)}
                  onDragLeave={() => setIsDraggingImage(false)}
                  onDragOver={(event) => { event.preventDefault(); setIsDraggingImage(true); }}
                  onDrop={handleImageDrop}
                >
                  {displayedImageUrl ? <img alt={imageFile ? "پیش‌نمایش تصویر انتخاب‌شده" : editingSlide?.altText ?? "تصویر اسلاید"} className="absolute inset-0 size-full object-cover" src={displayedImageUrl} /> : <span className="relative flex max-w-sm flex-col items-center text-center"><span className="grid size-14 place-items-center rounded-2xl bg-teal-500 text-white shadow-[0_10px_20px_rgba(13,148,136,0.2)]"><AddImageIcon /></span><span className="mt-4 text-sm font-extrabold text-slate-800">تصویر را اینجا رها کنید</span><span className="mt-1 text-xs font-bold leading-5 text-slate-500">یا برای انتخاب فایل، کلیک کنید</span></span>}
                  {displayedImageUrl && <span className="relative self-end rounded-full bg-slate-950/70 px-3 py-1.5 text-xs font-extrabold text-white backdrop-blur">{imageFile ? imageFile.name : "برای جایگزینی تصویر، کلیک کنید"}</span>}
                </label>
                <p className="mt-2 text-xs font-medium text-slate-500" id="slide-image-help">PNG، JPG یا WebP تا ۶ مگابایت؛ در حالت ویرایش، تصویر فعلی تا زمان انتخاب تصویر تازه حفظ می‌شود.</p>
                {previewUrl && <button className="mt-2 min-h-11 rounded-xl px-3 text-sm font-extrabold text-rose-700 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700" onClick={clearImage} type="button">لغو تصویر انتخاب‌شده</button>}
                {imageError && <p className="mt-2 text-sm font-bold text-rose-700" role="alert">{imageError}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-extrabold text-slate-800" htmlFor="slide-title">عنوان <span className="font-medium text-slate-500">(اختیاری)</span></label>
                  <input className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" defaultValue={editingSlide?.title ?? ""} id="slide-title" maxLength={120} name="title" placeholder="مثلاً دقت امروز، سلامت فردا" />
                </div>
                <div>
                  <label className="text-sm font-extrabold text-slate-800" htmlFor="slide-alt">متن جایگزین تصویر <span className="text-rose-700">*</span></label>
                  <input className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" defaultValue={editingSlide?.altText ?? ""} id="slide-alt" maxLength={160} name="altText" placeholder="توضیحی کوتاه و دقیق از تصویر" required />
                </div>
              </div>
              <div>
                <label className="text-sm font-extrabold text-slate-800" htmlFor="slide-subtitle">توضیح <span className="font-medium text-slate-500">(اختیاری)</span></label>
                <textarea className="mt-2 min-h-24 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-base font-medium leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" defaultValue={editingSlide?.subtitle ?? ""} id="slide-subtitle" maxLength={240} name="subtitle" placeholder="پیام کوتاه اسلاید برای نمایش روی تصویر" />
              </div>
              <label className="flex min-h-12 items-center gap-3 text-sm font-extrabold text-slate-700"><input className="size-5 accent-teal-500" defaultChecked={editingSlide?.isActive ?? true} name="isActive" type="checkbox" />نمایش در صفحهٔ نخست</label>
              <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center">
                <button className="min-h-12 rounded-xl bg-teal-500 px-5 text-sm font-extrabold text-white transition hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} type="submit">{isPending ? "در حال ثبت…" : isEditing ? "ذخیرهٔ تغییرات" : "ثبت اسلاید"}</button>
                <button className="min-h-12 rounded-xl px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} onClick={closeModal} type="button">انصراف</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
