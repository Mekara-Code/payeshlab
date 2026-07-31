"use client";

/* eslint-disable @next/next/no-img-element -- Existing records can contain legacy external logos, while newly uploaded images use local paths. */

import { useEffect, useOptimistic, useRef, useState, useTransition, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import { createInsurance, reorderInsurances, toggleInsuranceStatus, updateInsurance, type InsuranceActionState } from "@/app/admin/insurances/actions";
import { useToast } from "@/components/ui/toast-provider";
import { useActionToast } from "@/components/ui/use-action-toast";
import type { InsurancePartner } from "@/lib/insurance-data";

type ManagedInsurance = InsurancePartner & { isActive: boolean };

const initialState: InsuranceActionState = {};

function PlusIcon() {
  return <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /></svg>;
}

function ShieldIcon() {
  return <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><path d="M12 3.5 19 6v5.1c0 4.3-2.8 7.9-7 9.4-4.2-1.5-7-5.1-7-9.4V6l7-2.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /><path d="m9.25 12 1.75 1.75 3.75-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

function UploadIcon() {
  return <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 15.5v2.25A2.25 2.25 0 0 0 7.25 20h9.5A2.25 2.25 0 0 0 19 17.75V15.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

function DragHandleIcon() {
  return <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><path d="M8 7h8M8 12h8M8 17h8" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /><circle cx="5" cy="7" fill="currentColor" r="1" /><circle cx="5" cy="12" fill="currentColor" r="1" /><circle cx="5" cy="17" fill="currentColor" r="1" /></svg>;
}

function PencilIcon() {
  return <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24"><path d="m14.75 5.25 4 4M5 19l3.1-.65L18.3 8.15a2.83 2.83 0 0 0-4-4L4.1 14.35 3.5 17.5 5 19Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

const acceptedLogoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxLogoSize = 2 * 1024 * 1024;

type SortableInsuranceCardProps = {
  insurance: ManagedInsurance;
  isPending: boolean;
  onEdit: (insurance: ManagedInsurance) => void;
  onToggle: (insurance: ManagedInsurance) => void;
};

function SortableInsuranceCard({ insurance, isPending, onEdit, onToggle }: SortableInsuranceCardProps) {
  const { attributes, isDragging, listeners, setActivatorNodeRef, setNodeRef, transform, transition } = useSortable({ id: insurance.id });

  return (
    <article
      className={`rounded-[1.5rem] border border-white bg-white p-5 shadow-[0_14px_32px_rgba(15,23,42,0.05)] transition-shadow duration-200 ${isDragging ? "z-20 opacity-65 shadow-[0_22px_46px_rgba(13,148,136,0.24)]" : "hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]"}`}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-teal-50 text-teal-500">
          {insurance.logoUrl ? <img alt="" className="size-full object-contain p-1.5" src={insurance.logoUrl} /> : <ShieldIcon />}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${insurance.isActive ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{insurance.isActive ? "فعال" : "غیرفعال"}</span>
          <button
            aria-label={`جابجایی ${insurance.name}`}
            className="grid size-11 cursor-grab touch-none place-items-center rounded-xl text-slate-400 transition hover:bg-teal-50 hover:text-teal-500 active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
            disabled={isPending}
            ref={setActivatorNodeRef}
            type="button"
            {...attributes}
            {...listeners}
          >
            <DragHandleIcon />
          </button>
        </div>
      </div>
      <h3 className="mt-4 text-lg font-black text-slate-950">{insurance.name}</h3>
      <p className="mt-1 text-xs font-bold text-slate-500" dir="ltr">/{insurance.slug}</p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className="text-xs font-bold text-slate-500">اولویت {insurance.sortOrder}</span>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-teal-200 px-3 text-sm font-extrabold text-teal-500 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} onClick={() => onEdit(insurance)} type="button"><PencilIcon />ویرایش</button>
          <button className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm font-extrabold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} onClick={() => onToggle(insurance)} type="button">{insurance.isActive ? "توقف نمایش" : "فعال‌سازی"}</button>
        </div>
      </div>
    </article>
  );
}

type InsuranceEditPanelProps = {
  insurance: ManagedInsurance;
  onClose: () => void;
  onSaved: (message: string) => void;
};

function InsuranceEditPanel({ insurance, onClose, onSaved }: InsuranceEditPanelProps) {
  const [editState, setEditState] = useState<InsuranceActionState>(initialState);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState("");
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  useActionToast(editState);

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  function clearSelectedLogo() {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setLogoFile(null);
    setPreviewUrl(null);
    setLogoError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function selectLogo(file: File | undefined) {
    if (!file) return;
    if (!acceptedLogoTypes.has(file.type) || file.size > maxLogoSize) {
      setLogoError("فقط PNG، JPG یا WebP با حجم حداکثر ۲ مگابایت قابل بارگذاری است.");
      return;
    }

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const nextPreviewUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextPreviewUrl;
    setLogoFile(file);
    setPreviewUrl(nextPreviewUrl);
    setLogoError("");
  }

  function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (logoFile) formData.set("logoFile", logoFile);

    startTransition(async () => {
      const result = await updateInsurance(initialState, formData);
      setEditState(result);
      if (result.success) onSaved(result.message ?? "تغییرات بیمه ذخیره شد.");
    });
  }

  const displayedLogo = previewUrl ?? insurance.logoUrl;

  return (
    <section aria-labelledby="insurance-edit-heading" className="mt-6 rounded-[1.5rem] border border-teal-200 bg-teal-50/55 p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold text-teal-500">ویرایش اطلاعات</p>
          <h3 className="mt-1 text-xl font-black text-slate-950" id="insurance-edit-heading">{insurance.name}</h3>
        </div>
        <button className="min-h-11 rounded-xl px-3 text-sm font-extrabold text-slate-600 transition hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500" onClick={onClose} type="button">بستن</button>
      </div>

      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={submitEdit}>
        <input name="id" type="hidden" value={insurance.id} />
        <div className="sm:col-span-2">
          <label className="text-sm font-extrabold text-slate-800" htmlFor={`insurance-edit-name-${insurance.id}`}>نام بیمه</label>
          <input className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" defaultValue={insurance.name} id={`insurance-edit-name-${insurance.id}`} maxLength={100} name="name" required />
          <p className="mt-2 text-xs font-medium text-slate-500">نامک پس از ذخیره‌سازی از نام بیمه به‌صورت خودکار به‌روزرسانی می‌شود.</p>
        </div>

        <div className="sm:col-span-2">
          <p className="text-sm font-extrabold text-slate-800" id={`insurance-edit-logo-label-${insurance.id}`}>لوگوی بیمه <span className="font-medium text-slate-500">(اختیاری)</span></p>
          <input accept="image/jpeg,image/png,image/webp" className="sr-only" id={`insurance-edit-logo-${insurance.id}`} name="logoFile" onChange={(event) => selectLogo(event.target.files?.[0])} ref={fileInputRef} type="file" />
          <label
            aria-labelledby={`insurance-edit-logo-label-${insurance.id}`}
            className={`mt-2 flex min-h-32 cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed p-4 transition duration-200 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-teal-500 ${isDraggingLogo ? "border-teal-500 bg-white shadow-[0_0_0_5px_rgba(20,184,166,0.1)]" : "border-teal-200 bg-white/75 hover:border-teal-400 hover:bg-white"}`}
            htmlFor={`insurance-edit-logo-${insurance.id}`}
            onDragEnter={() => setIsDraggingLogo(true)}
            onDragLeave={() => setIsDraggingLogo(false)}
            onDragOver={(event) => { event.preventDefault(); setIsDraggingLogo(true); }}
            onDrop={(event) => { event.preventDefault(); setIsDraggingLogo(false); selectLogo(event.dataTransfer.files[0]); }}
          >
            {displayedLogo ? <img alt={previewUrl ? "پیش‌نمایش لوگوی جدید" : `لوگوی فعلی ${insurance.name}`} className="size-20 shrink-0 rounded-2xl border border-white bg-white object-contain p-2 shadow-sm" src={displayedLogo} /> : <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-teal-500 text-white shadow-[0_10px_20px_rgba(13,148,136,0.2)]"><UploadIcon /></span>}
            <span className="min-w-0">
              <span className="block text-sm font-extrabold text-slate-800">{previewUrl ? logoFile?.name : displayedLogo ? "برای جایگزینی لوگو، فایل جدید را رها کنید" : "لوگو را اینجا رها کنید"}</span>
              <span className="mt-1 block text-xs font-bold leading-5 text-slate-500">یا برای انتخاب فایل، کلیک کنید</span>
              <span className="mt-1 block text-[11px] font-bold text-teal-500">PNG، JPG یا WebP · حداکثر ۲ مگابایت</span>
            </span>
          </label>
          {previewUrl && <button className="mt-2 min-h-11 rounded-xl px-3 text-sm font-extrabold text-rose-700 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700" onClick={clearSelectedLogo} type="button">انصراف از لوگوی جدید</button>}
          {insurance.logoUrl && !previewUrl && <label className="mt-3 flex min-h-11 items-center gap-3 text-sm font-extrabold text-rose-800"><input className="size-5 accent-rose-700" name="removeLogo" type="checkbox" />حذف لوگوی فعلی</label>}
          {logoError && <p className="mt-2 text-sm font-bold text-rose-700" role="alert">{logoError}</p>}
        </div>

        <label className="flex min-h-12 items-center gap-3 text-sm font-extrabold text-slate-700 sm:col-span-2"><input className="size-5 accent-teal-500" defaultChecked={insurance.isActive} name="isActive" type="checkbox" />نمایش در صفحهٔ نخست</label>
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <button className="min-h-12 rounded-xl bg-teal-500 px-5 text-sm font-extrabold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} type="submit">{isPending ? "در حال ذخیره…" : "ذخیرهٔ تغییرات"}</button>
          <button className="min-h-12 rounded-xl px-4 text-sm font-extrabold text-slate-600 transition hover:bg-white/80" disabled={isPending} onClick={onClose} type="button">انصراف</button>
        </div>
      </form>
    </section>
  );
}

export function InsuranceManager({ insurances }: { insurances: ManagedInsurance[] }) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<ManagedInsurance | null>(null);
  const [createState, setCreateState] = useState<InsuranceActionState>(initialState);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState("");
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isTransitionPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  useActionToast(createState);
  const [optimisticInsurances, setOptimisticInsurances] = useOptimistic(
    insurances,
    (_current: ManagedInsurance[], next: ManagedInsurance[]) => next,
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  function clearLogo() {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setLogoFile(null);
    setPreviewUrl(null);
    setLogoError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function selectLogo(file: File | undefined) {
    if (!file) return;
    if (!acceptedLogoTypes.has(file.type) || file.size > maxLogoSize) {
      setLogoError("فقط PNG، JPG یا WebP با حجم حداکثر ۲ مگابایت قابل بارگذاری است.");
      return;
    }

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const nextPreviewUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextPreviewUrl;
    setLogoFile(file);
    setPreviewUrl(nextPreviewUrl);
    setLogoError("");
  }

  function handleLogoInput(event: ChangeEvent<HTMLInputElement>) {
    selectLogo(event.target.files?.[0]);
  }

  function handleLogoDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDraggingLogo(false);
    selectLogo(event.dataTransfer.files[0]);
  }

  function submitInsurance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (logoFile) formData.set("logoFile", logoFile);

    startTransition(async () => {
      const result = await createInsurance(initialState, formData);
      setCreateState(result);
      if (result.success) {
        formRef.current?.reset();
        clearLogo();
        setIsCreating(false);
        router.refresh();
      }
    });
  }

  function toggleVisibility(insurance: ManagedInsurance) {
    startTransition(async () => {
      const result = await toggleInsuranceStatus(insurance.id, insurance.isActive);
      if (result.message)
        toast(result.message, { variant: result.success ? "success" : "error" });
      if (result.success) router.refresh();
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = optimisticInsurances.findIndex((insurance) => insurance.id === active.id);
    const newIndex = optimisticInsurances.findIndex((insurance) => insurance.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reorderedInsurances = arrayMove(optimisticInsurances, oldIndex, newIndex);
    startTransition(async () => {
      setOptimisticInsurances(reorderedInsurances);
      const result = await reorderInsurances(reorderedInsurances.map((insurance) => insurance.id));
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
            <span className="inline-flex rounded-full bg-teal-500/10 px-3 py-1.5 text-xs font-extrabold text-teal-500">پذیرش و پوشش درمان</span>
            <h2 className="mt-4 text-2xl font-black tracking-[-0.05em] text-slate-950 sm:text-3xl">مدیریت بیمه‌های طرف قرارداد</h2>
            <p className="mt-3 text-sm font-medium leading-7 text-slate-600 sm:text-base">بیمه‌های فعال به‌صورت خودکار در بخش آمار صفحهٔ نخست نمایش داده می‌شوند.</p>
          </div>
          <button aria-expanded={isCreating} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-teal-500 px-4 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(13,148,136,0.22)] transition duration-200 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500" onClick={() => { setCreateState(initialState); setIsCreating((value) => !value); }} type="button"><PlusIcon />افزودن بیمه</button>
        </div>

        {isCreating && (
          <form className="mt-6 grid gap-4 rounded-[1.5rem] border border-teal-100 bg-white/90 p-4 shadow-sm sm:grid-cols-2 sm:p-5" onSubmit={submitInsurance} ref={formRef}>
            <div className="sm:col-span-2">
              <label className="text-sm font-extrabold text-slate-800" htmlFor="insurance-name">نام بیمه</label>
              <input aria-describedby="insurance-slug-help" className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" id="insurance-name" maxLength={100} name="name" placeholder="مثلاً بیمه ایران" required />
              <p className="mt-2 text-xs font-medium text-slate-500" id="insurance-slug-help">نامک به‌صورت خودکار از نام بیمه ساخته می‌شود.</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm font-extrabold text-slate-800" id="insurance-logo-label">لوگوی بیمه <span className="font-medium text-slate-500">(اختیاری)</span></p>
              <input accept="image/jpeg,image/png,image/webp" className="sr-only" id="insurance-logo" name="logoFile" onChange={handleLogoInput} ref={fileInputRef} type="file" />
              <label
                aria-describedby="insurance-logo-help"
                aria-labelledby="insurance-logo-label"
                className={`mt-2 flex min-h-36 cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed p-4 transition duration-200 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-teal-500 ${isDraggingLogo ? "border-teal-500 bg-teal-50/80 shadow-[0_0_0_5px_rgba(20,184,166,0.1)]" : "border-slate-200 bg-slate-50/70 hover:border-teal-300 hover:bg-teal-50/50"}`}
                htmlFor="insurance-logo"
                onDragEnter={() => setIsDraggingLogo(true)}
                onDragLeave={() => setIsDraggingLogo(false)}
                onDragOver={(event) => { event.preventDefault(); setIsDraggingLogo(true); }}
                onDrop={handleLogoDrop}
              >
                {previewUrl ? <img alt="پیش‌نمایش لوگوی انتخاب‌شده" className="size-20 shrink-0 rounded-2xl border border-white bg-white object-contain p-2 shadow-sm" src={previewUrl} /> : <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-teal-500 text-white shadow-[0_10px_20px_rgba(13,148,136,0.2)]"><UploadIcon /></span>}
                <span className="min-w-0">
                  <span className="block text-sm font-extrabold text-slate-800">{previewUrl ? logoFile?.name : "لوگو را اینجا رها کنید"}</span>
                  <span className="mt-1 block text-xs font-bold leading-5 text-slate-500">{previewUrl ? "آمادهٔ بارگذاری امن هنگام ثبت بیمه" : "یا برای انتخاب فایل، کلیک کنید"}</span>
                  <span className="mt-1 block text-[11px] font-bold text-teal-500">PNG، JPG یا WebP · حداکثر ۲ مگابایت</span>
                </span>
              </label>
              <p className="mt-2 text-xs font-medium text-slate-500" id="insurance-logo-help">فایل با نام تصادفی در فضای اختصاصی این سامانه ذخیره می‌شود.</p>
              {previewUrl && <button className="mt-2 min-h-11 rounded-xl px-3 text-sm font-extrabold text-rose-700 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700" onClick={clearLogo} type="button">حذف لوگوی انتخاب‌شده</button>}
              {logoError && <p className="mt-2 text-sm font-bold text-rose-700" role="alert">{logoError}</p>}
            </div>
            <div>
              <label className="text-sm font-extrabold text-slate-800" htmlFor="insurance-order">اولویت نمایش</label>
              <input className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base font-medium text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" defaultValue="0" id="insurance-order" max="10000" min="0" name="sortOrder" type="number" />
            </div>
            <label className="flex min-h-12 items-center gap-3 text-sm font-extrabold text-slate-700 sm:col-span-2"><input className="size-5 accent-teal-500" defaultChecked name="isActive" type="checkbox" />نمایش در صفحهٔ نخست</label>
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button className="min-h-12 rounded-xl bg-teal-500 px-5 text-sm font-extrabold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60" disabled={isTransitionPending} type="submit">{isTransitionPending ? "در حال ثبت…" : "ثبت بیمه"}</button>
              <button className="min-h-12 rounded-xl px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-100" onClick={() => { clearLogo(); setCreateState(initialState); setIsCreating(false); }} type="button">انصراف</button>
            </div>
          </form>
        )}

        {editingInsurance && (
          <InsuranceEditPanel
            insurance={editingInsurance}
            key={editingInsurance.id}
            onClose={() => setEditingInsurance(null)}
            onSaved={(message) => {
              toast(message, { variant: "success" });
              setEditingInsurance(null);
              router.refresh();
            }}
          />
        )}
      </div>

      <section aria-describedby="insurance-order-help" aria-label="فهرست بیمه‌ها" className="mt-5">
        <p className="mb-3 text-sm font-bold text-slate-600" id="insurance-order-help">برای تغییر اولویت، دستگیرهٔ هر کارت را بکشید و رها کنید.</p>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
          <SortableContext items={optimisticInsurances.map((insurance) => insurance.id)} strategy={rectSortingStrategy}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {optimisticInsurances.map((insurance) => <SortableInsuranceCard insurance={insurance} isPending={isTransitionPending} key={insurance.id} onEdit={setEditingInsurance} onToggle={toggleVisibility} />)}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      {optimisticInsurances.length === 0 && <p className="mt-5 rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-5 py-8 text-center text-sm font-bold leading-7 text-slate-600">هنوز بیمه‌ای ثبت نشده است. از دکمهٔ «افزودن بیمه» برای شروع استفاده کنید.</p>}
    </section>
  );
}
