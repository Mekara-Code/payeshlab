"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { GalleryMediaData } from "@/lib/gallery-data";

type GalleryFilter = "ALL" | "IMAGE" | "VIDEO";

type GalleryCopy = {
  all: string;
  close: string;
  count: string;
  emptyDescription: string;
  emptyTitle: string;
  images: string;
  openMedia: string;
  video: string;
  videos: string;
};

function Icon({ children, className = "size-5" }: { children: React.ReactNode; className?: string }) {
  return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">{children}</svg>;
}

function PhotoIcon() {
  return <Icon><rect height="14" rx="2" stroke="currentColor" strokeWidth="1.8" width="18" x="3" y="5" /><path d="m7 15 3-3 2.5 2.5 2-2L18 16M8 9h.01" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></Icon>;
}

function VideoIcon() {
  return <Icon><rect height="14" rx="2" stroke="currentColor" strokeWidth="1.8" width="18" x="3" y="5" /><path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" /></Icon>;
}

function PlayIcon() {
  return <Icon className="size-6"><path d="m9 7 7 5-7 5V7Z" fill="currentColor" /></Icon>;
}

function CloseIcon() {
  return <Icon><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /></Icon>;
}

function ExpandIcon() {
  return <Icon className="size-5"><path d="M8 4H4v4m12-4h4v4M8 20H4v-4m12 4h4v-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></Icon>;
}

export function MediaGallery({ copy, items }: { copy: GalleryCopy; items: GalleryMediaData[] }) {
  const [filter, setFilter] = useState<GalleryFilter>("ALL");
  const [selectedItem, setSelectedItem] = useState<GalleryMediaData | null>(null);
  const filteredItems = useMemo(() => filter === "ALL" ? items : items.filter((item) => item.type === filter), [filter, items]);

  useEffect(() => {
    if (!selectedItem) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedItem(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedItem]);

  const filters: Array<{ id: GalleryFilter; label: string; icon: React.ReactNode }> = [
    { id: "ALL", icon: <ExpandIcon />, label: copy.all },
    { id: "IMAGE", icon: <PhotoIcon />, label: copy.images },
    { id: "VIDEO", icon: <VideoIcon />, label: copy.videos },
  ];

  return (
    <section aria-label={copy.all} className="px-5 pb-20 pt-8 sm:px-10 sm:pb-28 lg:px-20" id="gallery-content">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-center sm:justify-between">
          <div aria-live="polite" className="text-sm font-bold text-slate-600">{copy.count.replace("{{count}}", String(filteredItems.length))}</div>
          <div aria-label={copy.all} className="flex flex-wrap gap-2" role="group">
            {filters.map((item) => {
              const isSelected = filter === item.id;
              return <button aria-pressed={isSelected} className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-extrabold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal-500 ${isSelected ? "border-teal-500 bg-teal-500 text-white shadow-[0_10px_20px_rgba(13,148,136,0.20)]" : "border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"}`} key={item.id} onClick={() => setFilter(item.id)} type="button">{item.icon}{item.label}</button>;
            })}
          </div>
        </div>

        {filteredItems.length > 0 ? <div className="mt-8 grid auto-rows-[13rem] gap-4 sm:auto-rows-[16rem] sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {filteredItems.map((item, index) => {
            const isFeatured = index === 0 && filteredItems.length > 2;
            const loading = index === 0 ? "eager" : "lazy";
            return <button aria-label={`${copy.openMedia}: ${item.title}`} className={`group relative isolate overflow-hidden rounded-[1.75rem] bg-slate-200 text-right shadow-[0_16px_36px_rgba(15,23,42,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.18)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-teal-500 motion-reduce:transition-none ${isFeatured ? "sm:col-span-2 sm:row-span-2" : ""}`} key={item.id} onClick={() => setSelectedItem(item)} type="button">
              {item.type === "IMAGE" ? <Image alt={item.altText} className="object-cover transition duration-500 group-hover:scale-[1.045] motion-reduce:transition-none" fill loading={loading} sizes={isFeatured ? "(min-width: 1024px) 52vw, (min-width: 640px) 66vw, calc(100vw - 2.5rem)" : "(min-width: 1024px) 28vw, (min-width: 640px) 44vw, calc(100vw - 2.5rem)"} src={item.mediaUrl} unoptimized /> : item.posterUrl ? <Image alt="" className="object-cover transition duration-500 group-hover:scale-[1.045] motion-reduce:transition-none" fill loading={loading} sizes={isFeatured ? "(min-width: 1024px) 52vw, (min-width: 640px) 66vw, calc(100vw - 2.5rem)" : "(min-width: 1024px) 28vw, (min-width: 640px) 44vw, calc(100vw - 2.5rem)"} src={item.posterUrl} unoptimized /> : <div className="size-full bg-[radial-gradient(circle_at_30%_20%,#2dd4bf,transparent_40%),linear-gradient(135deg,#0f172a,#164e63)]" />}
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
              {item.type === "VIDEO" ? <span aria-hidden="true" className="absolute left-4 top-4 grid size-12 place-items-center rounded-full bg-white/90 text-slate-950 shadow-lg backdrop-blur transition duration-200 group-hover:scale-105"><PlayIcon /></span> : null}
              <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-slate-950/55 px-2.5 py-1.5 text-xs font-extrabold text-white backdrop-blur">{item.type === "IMAGE" ? <PhotoIcon /> : <VideoIcon />}{item.type === "IMAGE" ? copy.images : copy.video}</span>
              <span className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6"><span className={`block font-black leading-tight ${isFeatured ? "text-xl sm:text-3xl" : "text-lg"}`}>{item.title}</span>{item.description ? <span className="mt-2 line-clamp-2 block text-sm font-medium leading-6 text-white/85">{item.description}</span> : null}</span>
              <span aria-hidden="true" className="absolute bottom-5 left-5 grid size-10 place-items-center rounded-xl border border-white/30 bg-white/10 text-white opacity-0 backdrop-blur transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"><ExpandIcon /></span>
            </button>;
          })}
        </div> : <div className="mt-8 rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-teal-50 text-teal-600"><PhotoIcon /></span><h2 className="mt-5 text-xl font-black text-slate-950">{copy.emptyTitle}</h2><p className="mx-auto mt-3 max-w-md text-sm font-medium leading-7 text-slate-600">{copy.emptyDescription}</p></div>}
      </div>

      {selectedItem ? <div aria-label={selectedItem.title} className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/85 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedItem(null); }} role="dialog" aria-modal="true">
        <div className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_28px_90px_rgba(0,0,0,0.42)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[2rem]">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6"><div className="min-w-0"><p className="text-xs font-extrabold tracking-wide text-teal-600">{selectedItem.type === "IMAGE" ? copy.images : copy.video}</p><h2 className="mt-1 text-lg font-black text-slate-950 sm:text-xl">{selectedItem.title}</h2></div><button aria-label={copy.close} className="grid size-11 shrink-0 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500" onClick={() => setSelectedItem(null)} type="button"><CloseIcon /></button></div>
          <div className="min-h-0 overflow-y-auto bg-slate-950"><div className="relative mx-auto flex min-h-[min(64vh,42rem)] max-w-5xl items-center justify-center">{selectedItem.type === "IMAGE" ? <Image alt={selectedItem.altText} className="object-contain" fill loading="eager" sizes="(min-width: 1024px) 80vw, 100vw" src={selectedItem.mediaUrl} unoptimized /> : <video aria-label={selectedItem.altText} className="max-h-[min(64vh,42rem)] w-full" controls playsInline poster={selectedItem.posterUrl ?? undefined} preload="metadata" src={selectedItem.mediaUrl} />}</div></div>
          {selectedItem.description ? <p className="max-w-4xl px-5 py-4 text-sm font-medium leading-7 text-slate-600 sm:px-6">{selectedItem.description}</p> : null}
        </div>
      </div> : null}
    </section>
  );
}
