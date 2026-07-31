"use client";

/* eslint-disable @next/next/no-img-element -- Uploaded department images use local paths, while legacy records can contain external images. */

import { useEffect, useRef, useState, useTransition, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createLabDepartment, toggleLabDepartmentStatus, updateLabDepartment, type LabDepartmentActionState } from "@/app/admin/departments/actions";
import { useToast } from "@/components/ui/toast-provider";
import { useActionToast } from "@/components/ui/use-action-toast";
import type { LabDepartmentData } from "@/lib/lab-department-data";

type ManagedDepartment = LabDepartmentData & { isActive: boolean };

const initialState: LabDepartmentActionState = {};
const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 6 * 1024 * 1024;
const languageTabs = [
  { descriptionField: "description", direction: "rtl", id: "fa", label: "فارسی", titleField: "title" },
  { descriptionField: "descriptionAr", direction: "rtl", id: "ar", label: "العربية", titleField: "titleAr" },
  { descriptionField: "descriptionEn", direction: "ltr", id: "en", label: "English", titleField: "titleEn" },
] as const;

type LanguageId = (typeof languageTabs)[number]["id"];

function PlusIcon() {
  return <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /></svg>;
}

function ImageIcon() {
  return <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24"><rect height="14" rx="2" width="18" x="3" y="5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /><path d="m7 15 3-3 2.5 2.5 2-2L18 16M8 9h.01" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

function PencilIcon() {
  return <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24"><path d="m14.75 5.25 4 4M5 19l3.1-.65L18.3 8.15a2.83 2.83 0 0 0-4-4L4.1 14.35 3.5 17.5 5 19Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

function LaboratoryIcon() {
  return <svg aria-hidden="true" className="size-10" fill="none" viewBox="0 0 24 24"><path d="M9 3h6M10 3v6.1L5.6 17a2.5 2.5 0 0 0 2.2 3.7h8.4a2.5 2.5 0 0 0 2.2-3.7L14 9.1V3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /><path d="M8.5 15h7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" /></svg>;
}

type DepartmentFormProps = {
  department?: ManagedDepartment;
  onCancel: () => void;
  onSaved: (message: string) => void;
};

function DepartmentForm({ department, onCancel, onSaved }: DepartmentFormProps) {
  const [state, setState] = useState<LabDepartmentActionState>(initialState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<LanguageId>("fa");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const isEditing = Boolean(department);
  const formId = department ? `department-${department.id}` : "department-create";
  useActionToast(state);

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  function clearImage() {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setImageFile(null);
    setPreviewUrl(null);
    setImageError("");
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

  function submitDepartment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (imageFile) formData.set("departmentImage", imageFile);

    startTransition(async () => {
      const action = isEditing ? updateLabDepartment : createLabDepartment;
      const result = await action(initialState, formData);
      setState(result);
      if (result.success) onSaved(result.message ?? "تغییرات بخش ذخیره شد.");
    });
  }

  const displayedImage = previewUrl ?? department?.imageUrl;

  return (
    <form className={`grid gap-4 ${isEditing ? "mt-5 sm:grid-cols-2" : "mt-6 rounded-[1.5rem] border border-teal-100 bg-white/90 p-4 shadow-sm sm:grid-cols-2 sm:p-5"}`} onSubmit={submitDepartment}>
      {department ? <input name="id" type="hidden" value={department.id} /> : null}
      <div className="sm:col-span-2">
        <div aria-label="زبان محتوای خدمت" className="flex gap-1 rounded-2xl bg-slate-100 p-1" role="tablist">
          {languageTabs.map((language) => {
            const isActive = activeLanguage === language.id;
            return <button aria-controls={`${formId}-language-${language.id}`} aria-selected={isActive} className={`min-h-11 flex-1 rounded-xl px-3 text-sm font-extrabold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${isActive ? "bg-white text-teal-500 shadow-sm" : "text-slate-500 hover:text-slate-800"}`} key={language.id} onClick={() => setActiveLanguage(language.id)} role="tab" type="button">{language.label}</button>;
          })}
        </div>

        {languageTabs.map((language) => {
          const isActive = activeLanguage === language.id;
          const isPersian = language.id === "fa";
          const title = department?.[language.titleField];
          const description = department?.[language.descriptionField];
          return (
            <div className={`mt-5 ${isActive ? "block" : "hidden"}`} dir={language.direction} id={`${formId}-language-${language.id}`} key={language.id} role="tabpanel">
              <label className="text-sm font-extrabold text-slate-800" htmlFor={`${formId}-${language.id}-title`}>عنوان خدمت {isPersian ? "" : `به زبان ${language.label}`}</label>
              <input className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" defaultValue={title ?? ""} id={`${formId}-${language.id}-title`} maxLength={100} name={language.titleField} placeholder={isPersian ? "مثلاً پاتولوژی" : isActive ? `عنوان خدمت به زبان ${language.label}` : ""} required={isPersian} />
              <label className="mt-4 block text-sm font-extrabold text-slate-800" htmlFor={`${formId}-${language.id}-description`}>توضیح خدمت {isPersian ? "" : `به زبان ${language.label}`}</label>
              <textarea className="mt-2 min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-base font-medium leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" defaultValue={description ?? ""} id={`${formId}-${language.id}-description`} maxLength={1500} name={language.descriptionField} placeholder={isPersian ? "معرفی کوتاه و قابل‌اعتماد از این خدمت" : isActive ? `توضیح خدمت به زبان ${language.label}` : ""} required={isPersian} />
              <p className="mt-2 text-xs font-medium text-slate-500">{isPersian ? "این متن در کادر معرفیِ سمت چپ خدمات تخصصی صفحهٔ نخست نمایش داده می‌شود." : "برای فعال شدن ترجمه، عنوان و توضیح را با هم کامل کنید."}</p>
            </div>
          );
        })}
      </div>

      <div className="sm:col-span-2">
        <p className="text-sm font-extrabold text-slate-800" id={`${formId}-image-label`}>تصویر خدمت <span className="font-medium text-slate-500">(اختیاری)</span></p>
        <input accept="image/jpeg,image/png,image/webp" className="sr-only" id={`${formId}-image`} name="departmentImage" onChange={(event: ChangeEvent<HTMLInputElement>) => selectImage(event.target.files?.[0])} ref={fileInputRef} type="file" />
        <label
          aria-labelledby={`${formId}-image-label`}
          className={`relative mt-2 flex min-h-44 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-4 transition duration-200 sm:min-h-56 ${isDraggingImage ? "border-teal-500 bg-teal-50/80 shadow-[0_0_0_5px_rgba(20,184,166,0.1)]" : "border-slate-200 bg-slate-50/70 hover:border-teal-300 hover:bg-teal-50/50"}`}
          htmlFor={`${formId}-image`}
          onDragEnter={() => setIsDraggingImage(true)}
          onDragLeave={() => setIsDraggingImage(false)}
          onDragOver={(event) => { event.preventDefault(); setIsDraggingImage(true); }}
          onDrop={(event: DragEvent<HTMLLabelElement>) => { event.preventDefault(); setIsDraggingImage(false); selectImage(event.dataTransfer.files[0]); }}
        >
          {displayedImage ? <img alt={previewUrl ? "پیش‌نمایش تصویر جدید خدمت" : `تصویر فعلی ${department?.title ?? "خدمت"}`} className="absolute inset-0 size-full object-cover" src={displayedImage} /> : <span className="relative flex max-w-sm flex-col items-center text-center"><span className="grid size-14 place-items-center rounded-2xl bg-teal-500 text-white shadow-[0_10px_20px_rgba(13,148,136,0.2)]"><ImageIcon /></span><span className="mt-4 text-sm font-extrabold text-slate-800">تصویر خدمت را اینجا رها کنید</span><span className="mt-1 text-xs font-bold leading-5 text-slate-500">یا برای انتخاب فایل، کلیک کنید</span></span>}
          {previewUrl ? <span className="relative self-end rounded-full bg-slate-950/70 px-3 py-1.5 text-xs font-extrabold text-white backdrop-blur">{imageFile?.name}</span> : null}
        </label>
        <p className="mt-2 text-xs font-medium text-slate-500">PNG، JPG یا WebP تا ۶ مگابایت؛ تصویر عمودی یا مربعی برای این خدمت مناسب‌تر است.</p>
        {previewUrl ? <button className="mt-2 min-h-11 rounded-xl px-3 text-sm font-extrabold text-rose-700 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700" onClick={clearImage} type="button">حذف تصویر انتخاب‌شده</button> : null}
        {department?.imageUrl && !previewUrl ? <label className="mt-3 flex min-h-11 items-center gap-3 text-sm font-extrabold text-rose-800"><input className="size-5 accent-rose-700" name="removeImage" type="checkbox" />حذف تصویر فعلی</label> : null}
        {imageError ? <p className="mt-2 text-sm font-bold text-rose-700" role="alert">{imageError}</p> : null}
      </div>

      <div>
        <label className="text-sm font-extrabold text-slate-800" htmlFor={`${formId}-order`}>اولویت نمایش</label>
        <input className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base font-medium text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" defaultValue={department?.sortOrder ?? 0} id={`${formId}-order`} max="10000" min="0" name="sortOrder" type="number" />
      </div>
      <label className="flex min-h-12 items-center gap-3 self-end text-sm font-extrabold text-slate-700"><input className="size-5 accent-teal-500" defaultChecked={department?.isActive ?? true} name="isActive" type="checkbox" />نمایش در صفحهٔ نخست</label>

      <div className="flex flex-wrap gap-3 sm:col-span-2">
        <button className="min-h-12 rounded-xl bg-teal-500 px-5 text-sm font-extrabold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} type="submit">{isPending ? "در حال ذخیره…" : isEditing ? "ذخیرهٔ تغییرات" : "ثبت خدمت"}</button>
        <button className="min-h-12 rounded-xl px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-100" disabled={isPending} onClick={onCancel} type="button">انصراف</button>
      </div>
    </form>
  );
}

export function ServiceManager({ departments }: { departments: ManagedDepartment[] }) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<ManagedDepartment | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  function handleSaved(message: string) {
    toast(message, { variant: "success" });
    setIsCreating(false);
    setEditingDepartment(null);
    router.refresh();
  }

  function toggleDepartment(department: ManagedDepartment) {
    startTransition(async () => {
      const result = await toggleLabDepartmentStatus(department.id, department.isActive);
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
            <span className="inline-flex rounded-full bg-teal-500/10 px-3 py-1.5 text-xs font-extrabold text-teal-500">ویترین تخصص و دقت</span>
            <h2 className="mt-4 text-2xl font-black tracking-[-0.05em] text-slate-950 sm:text-3xl">مدیریت خدمات آزمایشگاه</h2>
            <p className="mt-3 text-sm font-medium leading-7 text-slate-600 sm:text-base">عنوان هر خدمت، توضیح و تصویر اختصاصی آن را تنظیم کنید. خدمات فعال در تب‌های صفحهٔ نخست نمایش داده می‌شوند.</p>
          </div>
          <button aria-expanded={isCreating} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-teal-500 px-4 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(13,148,136,0.22)] transition duration-200 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500" onClick={() => { setEditingDepartment(null); setIsCreating((value) => !value); }} type="button"><PlusIcon />افزودن خدمت</button>
        </div>

        {isCreating ? <DepartmentForm onCancel={() => setIsCreating(false)} onSaved={handleSaved} /> : null}
        {editingDepartment ? <section aria-labelledby="department-edit-heading" className="mt-6 rounded-[1.5rem] border border-teal-200 bg-teal-50/55 p-4 shadow-sm sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-extrabold text-teal-500">ویرایش اطلاعات</p><h3 className="mt-1 text-xl font-black text-slate-950" id="department-edit-heading">{editingDepartment.title}</h3></div><button className="min-h-11 rounded-xl px-3 text-sm font-extrabold text-slate-600 transition hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500" onClick={() => setEditingDepartment(null)} type="button">بستن</button></div><DepartmentForm department={editingDepartment} onCancel={() => setEditingDepartment(null)} onSaved={handleSaved} /></section> : null}
      </div>

      <section aria-label="فهرست خدمات آزمایشگاه" className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {departments.map((department) => (
          <article className="overflow-hidden rounded-[1.5rem] border border-white bg-white shadow-[0_14px_32px_rgba(15,23,42,0.05)]" key={department.id}>
            <div className="relative aspect-[16/8] overflow-hidden bg-[linear-gradient(135deg,#0f766e,#134e4a)] text-white">
              {department.imageUrl ? <img alt={department.title} className="size-full object-cover" src={department.imageUrl} /> : <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_30%_25%,rgba(153,246,228,0.46),transparent_32%),linear-gradient(135deg,#0f766e,#134e4a)]"><LaboratoryIcon /></div>}
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
              <span className={`absolute bottom-3 right-3 rounded-full px-2.5 py-1 text-xs font-extrabold backdrop-blur ${department.isActive ? "bg-emerald-400/90 text-emerald-950" : "bg-white/75 text-slate-700"}`}>{department.isActive ? "فعال" : "غیرفعال"}</span>
            </div>
            <div className="p-5"><h3 className="text-lg font-black text-slate-950">{department.title}</h3><p className="mt-2 text-sm font-medium leading-7 text-slate-600">{department.description}</p><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><span className="text-xs font-bold text-slate-500">اولویت {department.sortOrder}</span><div className="flex flex-wrap gap-2"><button className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-teal-200 px-3 text-sm font-extrabold text-teal-500 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} onClick={() => { setIsCreating(false); setEditingDepartment(department); }} type="button"><PencilIcon />ویرایش</button><button className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm font-extrabold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} onClick={() => toggleDepartment(department)} type="button">{department.isActive ? "توقف نمایش" : "فعال‌سازی"}</button></div></div></div>
          </article>
        ))}
      </section>

      {departments.length === 0 ? <p className="mt-5 rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-5 py-8 text-center text-sm font-bold leading-7 text-slate-600">هنوز خدمتی ثبت نشده است. با «افزودن خدمت» ویترین خدمات آزمایشگاه را کامل کنید.</p> : null}
    </section>
  );
}
