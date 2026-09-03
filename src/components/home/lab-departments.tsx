"use client";

/* eslint-disable @next/next/no-img-element -- Department imagery is managed by the administrator and may use legacy external URLs. */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState, type KeyboardEvent } from "react";
import { AtmosphereOrbs } from "@/components/decorative/atmosphere-orbs";
import { useTranslations } from "@/components/i18n/dictionary-provider";
import { StaggerItem, StaggerScene } from "@/components/motion/stagger-scene";
import type { LabDepartmentData } from "@/lib/lab-department-data";

function LaboratoryIcon() {
  return <svg aria-hidden="true" className="size-14" fill="none" viewBox="0 0 24 24"><path d="M9 3h6M10 3v6.1L5.6 17a2.5 2.5 0 0 0 2.2 3.7h8.4a2.5 2.5 0 0 0 2.2-3.7L14 9.1V3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.45" /><path d="M8.5 15h7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" /></svg>;
}

function ServiceListIcon({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" className={`size-5 shrink-0 ${className}`} fill="currentColor" stroke="currentColor" strokeLinejoin="round" strokeWidth="0.55" viewBox="0 0 31.719 31.719">
      <path d="M21.558 4.61H10.161c-1.244 0-2.229.976-2.229 2.221v2.441c0 1.028.682 1.896 1.571 2.167v15.364c0 .043.018.086.02.131.097 1.653 1.548 4.785 6.33 4.785 4.428 0 6.076-2.992 6.317-4.574.017-.113.045-.228.045-.342V11.44c.89-.271 1.572-1.139 1.572-2.167V6.831c0-1.245-.986-2.221-2.229-2.221Zm-.027 3.88c0 .424-.344.768-.768.768h-.035a.77.77 0 0 0-.77.768v16.779s-.438 2.661-4.103 2.661c-3.916 0-4.102-2.661-4.102-2.661v-16.78a.768.768 0 0 0-.768-.768h-.036a.768.768 0 0 1-.768-.768V7.633c0-.424.344-.768.768-.768h9.81c.424 0 .768.344.768.768V8.49h.004Z" />
      <path d="M15.857 28.363c2.57 0 2.871-2.148 2.871-2.148v-7.113h-5.742v7.113c.002-.003.126 2.148 2.871 2.148Z" />
      <circle cx="16.249" cy="14.484" r="1.426" />
      <circle cx="14.432" cy="9.555" r="1.427" />
      <circle cx="18.713" cy="1.989" r="1.384" />
      <circle cx="13.826" cy=".822" r=".822" />
    </svg>
  );
}

export function LabDepartments({ departments }: { departments: LabDepartmentData[] }) {
  const [selectedId, setSelectedId] = useState(departments[0]?.id ?? "");
  const shouldReduceMotion = useReducedMotion();
  const { t } = useTranslations();
  const activeDepartment = departments.find((department) => department.id === selectedId) ?? departments[0];

  if (!activeDepartment) return null;

  function selectByKeyboard(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const lastIndex = departments.length - 1;
    let nextIndex: number | null = null;

    if (event.key === "ArrowDown" || event.key === "ArrowLeft") nextIndex = index === lastIndex ? 0 : index + 1;
    if (event.key === "ArrowUp" || event.key === "ArrowRight") nextIndex = index === 0 ? lastIndex : index - 1;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = lastIndex;
    if (nextIndex === null) return;

    event.preventDefault();
    setSelectedId(departments[nextIndex].id);
    document.getElementById(`lab-department-tab-${departments[nextIndex].id}`)?.focus();
  }

  const tabButtons = (compact = false) => departments.map((department, index) => {
    const isActive = department.id === activeDepartment.id;
    return (
      <button
        aria-controls="lab-department-panel"
        aria-selected={isActive}
        className={`group relative min-h-12 shrink-0 cursor-pointer overflow-hidden rounded-2xl px-4 text-right text-xs font-extrabold outline-none transition-[background-color,border-color,color,transform] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${compact ? "min-w-max" : "w-full"} ${isActive ? "bg-teal-500 text-white ring-1 ring-teal-500/20" : "border border-transparent bg-white text-cyan-700 hover:-translate-y-px hover:border-teal-200 hover:bg-teal-50 hover:text-cyan-800 active:translate-y-0"}`}
        id={`lab-department-tab-${department.id}`}
        key={department.id}
        onClick={() => setSelectedId(department.id)}
        onKeyDown={(event) => selectByKeyboard(event, index)}
        role="tab"
        tabIndex={isActive ? 0 : -1}
        type="button"
      >
        <span className="relative z-10 flex items-center gap-2">
          <ServiceListIcon
            className={`${isActive ? "text-white" : "text-teal-500"} ${shouldReduceMotion ? (isActive ? "scale-110" : "scale-100") : isActive ? "scale-110 transition-transform duration-200 ease-out" : "scale-100 transition-transform duration-200 ease-out group-hover:scale-110"}`}
          />
          <span>{department.title}</span>
        </span>
        <span aria-hidden="true" className={`absolute bottom-3 right-1.5 top-3 w-1 rounded-full transition-[background-color,opacity,transform] duration-200 ${isActive ? "scale-y-100 bg-white/75 opacity-100" : "scale-y-0 bg-teal-500 opacity-0 group-hover:scale-y-100 group-hover:opacity-100"}`} />
      </button>
    );
  });

  return (
    <section aria-labelledby="lab-departments-heading" className="mt-14 scroll-mt-28 border-t border-teal-100 pt-12 sm:mt-16 sm:pt-14" id="services">
      <StaggerScene dir="rtl">
        <StaggerItem className="relative isolate max-w-2xl overflow-hidden">
          <AtmosphereOrbs className="absolute -right-8 -top-2 h-36 w-56 opacity-55 sm:h-44 sm:w-72" scale={1.28} />
          <div className="relative z-10">
            <span className="inline-flex rounded-full bg-teal-500/10 px-4 py-2 text-sm font-extrabold text-teal-500">{t("services.badge")}</span>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.055em] text-slate-950 sm:text-4xl" id="lab-departments-heading">{t("services.title")}</h2>
            <p className="mt-4 text-base font-medium leading-8 text-slate-600 sm:text-lg">{t("services.description")}</p>
          </div>
        </StaggerItem>

        <StaggerItem className="mt-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch lg:gap-12">
          <article aria-labelledby="lab-department-title" className="order-3 flex min-h-64 flex-1 flex-col justify-center py-4 sm:py-6 lg:order-1 lg:py-10">
            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                key={activeDepartment.id}
                transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="inline-flex py-1.5 text-xs font-extrabold text-teal-500">{t("services.specialized")}</span>
                <h3 className="mt-5 text-2xl font-black tracking-[-0.05em] text-slate-950 sm:text-3xl" id="lab-department-title">{activeDepartment.title}</h3>
                <p className="mt-5 text-base font-medium leading-8 text-slate-700 sm:text-lg sm:leading-9">{activeDepartment.description}</p>
                <div aria-hidden="true" className="mt-8 flex items-center gap-3 text-sm font-extrabold text-teal-500"><span className="h-px w-12 bg-teal-500/50" />{t("services.promise")}</div>
              </motion.div>
            </AnimatePresence>
          </article>

          <div aria-label={t("services.select")} className="order-2 -mx-1 overflow-x-auto pb-1 lg:hidden" role="tablist">
            <div className="flex min-w-max gap-2 px-1">{tabButtons(true)}</div>
          </div>

          <div className="order-1 relative min-h-[25rem] flex-[1.2] overflow-visible rounded-[2rem] shadow-[0_26px_70px_rgba(15,23,42,0.14)] sm:min-h-[31rem] lg:order-2 lg:min-h-[34rem]">
            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 overflow-hidden rounded-[2rem] bg-slate-900"
                exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 1.025 }}
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.02 }}
                key={activeDepartment.id}
                transition={{ duration: shouldReduceMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
              >
                {activeDepartment.imageUrl ? <img alt={t("services.imageAlt", { title: activeDepartment.title })} className="size-full object-cover" loading="lazy" src={activeDepartment.imageUrl} /> : <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_22%_18%,rgba(153,246,228,0.58),transparent_26%),radial-gradient(circle_at_72%_78%,rgba(45,212,191,0.28),transparent_32%),linear-gradient(140deg,#0f766e,#134e4a)] text-white"><LaboratoryIcon /></div>}
                <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(105deg,rgba(15,23,42,0.6)_0%,rgba(15,23,42,0.08)_58%,rgba(15,23,42,0.16)_100%)]" />
                <div className="absolute bottom-6 right-6 rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-extrabold text-white backdrop-blur-md sm:bottom-8 sm:right-8">{t("services.imageLabel")}</div>
              </motion.div>
            </AnimatePresence>

            <div aria-label={t("services.select")} className="absolute left-0 top-1/2 z-20 hidden w-60 -translate-x-[55%] -translate-y-1/2 rounded-[1.75rem] border border-teal-100 bg-white p-2.5 ring-1 ring-white/80 lg:flex lg:flex-col lg:gap-1.5" role="tablist">
              {tabButtons()}
            </div>
          </div>
          </div>
        </StaggerItem>
      </StaggerScene>
    </section>
  );
}
