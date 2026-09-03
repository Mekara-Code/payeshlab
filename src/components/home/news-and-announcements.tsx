"use client";

/* eslint-disable @next/next/no-img-element -- News images may be managed from the administrator dashboard. */

import "swiper/css";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { AtmosphereOrbs } from "@/components/decorative/atmosphere-orbs";
import { useTranslations } from "@/components/i18n/dictionary-provider";
import { StaggerItem, StaggerScene } from "@/components/motion/stagger-scene";
import type { AnnouncementItem, NewsItem } from "@/lib/news-data";

const subscribeToPortal = () => () => {};
const getPortalContainer = () => document.body;
const getServerPortalContainer = () => null;

function formatDate(dateValue: string, locale: "ar" | "en" | "fa") {
  const dateLocale =
    locale === "fa"
      ? "fa-IR-u-ca-persian"
      : locale === "ar"
        ? "ar-SA-u-ca-gregory"
        : "en-US";

  return new Intl.DateTimeFormat(dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateValue));
}

function CalendarIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <rect height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" width="16" x="4" y="5" />
      <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function NewsIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M5 4h14v16H5zM8.5 8h7M8.5 12h7M8.5 16h4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

export function NewsAndAnnouncements({ announcements, news }: { announcements: AnnouncementItem[]; news: NewsItem[] }) {
  const shouldReduceMotion = useReducedMotion();
  const { locale, t } = useTranslations();
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);
  const portalContainer = useSyncExternalStore(subscribeToPortal, getPortalContainer, getServerPortalContainer);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const closeAnnouncement = useCallback(() => setSelectedAnnouncement(null), []);

  const openAnnouncement = (announcement: AnnouncementItem, trigger: HTMLButtonElement) => {
    returnFocusRef.current = trigger;
    setSelectedAnnouncement(announcement);
  };

  useEffect(() => {
    if (!selectedAnnouncement) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeAnnouncement();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const focusable = focusableElements ? Array.from(focusableElements) : [];

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    const frame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [closeAnnouncement, selectedAnnouncement]);

  return (
    <>
      <section aria-labelledby="news-and-announcements-title" className="scroll-mt-28 bg-white px-5 py-16 sm:px-10 sm:py-20 lg:px-20 lg:py-28" id="news-and-announcements">
      <StaggerScene className="mx-auto max-w-5xl">
        <StaggerItem className="relative isolate mb-8 overflow-hidden sm:mb-10">
          <AtmosphereOrbs className="absolute -right-8 -top-7 h-28 w-48 opacity-40 sm:h-36 sm:w-60" scale={1.08} />
          <div className="relative z-10 text-center">
            <span className="inline-flex rounded-full bg-teal-500/10 px-4 py-2 text-sm font-extrabold text-teal-500">{t("news.badge")}</span>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl" id="news-and-announcements-title">{t("news.title")}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base">{t("news.description")}</p>
          </div>
        </StaggerItem>

        <StaggerScene className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-8" delay={0.12}>
          <StaggerItem>
            <aside aria-labelledby="announcements-title" className="rounded-[1.9rem] border border-teal-100 bg-[#f7fbfb] p-5 sm:p-6">
            <div className="flex items-center gap-2 text-teal-500">
              <span className="grid size-10 place-items-center rounded-2xl bg-teal-100"><CalendarIcon /></span>
              <div>
                <p className="text-xs font-extrabold text-teal-500">{t("news.stayUpdated")}</p>
                <h3 className="text-lg font-black text-slate-950" id="announcements-title">{t("news.announcements")}</h3>
              </div>
            </div>

            <div className="mt-5 divide-y divide-teal-100">
              {announcements.map((announcement) => (
                <article className="py-4 first:pt-0 last:pb-0" key={announcement.id}>
                  <button
                    aria-controls="announcement-dialog"
                    aria-haspopup="dialog"
                    className="group w-full cursor-pointer rounded-2xl p-2 text-right transition-[background-color,color,transform] duration-200 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 active:scale-[0.99]"
                    onClick={(event) => openAnnouncement(announcement, event.currentTarget)}
                    type="button"
                  >
                    <time className="text-xs font-bold text-teal-500" dateTime={announcement.date}>{formatDate(announcement.date, locale)}</time>
                    <span className="mt-2 block text-sm font-extrabold leading-6 text-slate-800 transition-colors duration-200 group-hover:text-teal-500">{announcement.title}</span>
                  </button>
                </article>
              ))}
            </div>
            </aside>
          </StaggerItem>

          <StaggerItem className="min-w-0">
          <div aria-labelledby="news-title">
            <div className="mb-4 flex items-center gap-2 text-teal-500">
              <span className="grid size-10 place-items-center rounded-2xl bg-teal-100"><NewsIcon /></span>
              <div>
                <p className="text-xs font-extrabold text-teal-500">{t("news.reading")}</p>
                <h3 className="text-lg font-black text-slate-950" id="news-title">{t("news.latest")}</h3>
              </div>
            </div>

            <Swiper
              aria-label={t("news.slider")}
              autoplay={shouldReduceMotion ? false : { delay: 4600, disableOnInteraction: false, pauseOnMouseEnter: true }}
              breakpoints={{
                520: { slidesPerView: 1.3, spaceBetween: 16 },
                768: { slidesPerView: 1.55, spaceBetween: 18 },
                1024: { slidesPerView: 2, spaceBetween: 20 },
              }}
              className="overflow-hidden"
              dir="rtl"
              grabCursor
              loop={news.length > 2}
              modules={[Autoplay]}
              slidesPerView={1.08}
              spaceBetween={14}
              speed={shouldReduceMotion ? 0 : 650}
            >
              {news.map((item, index) => (
                <SwiperSlide className="h-auto" key={item.id}>
                  <article className="flex h-full min-h-[26rem] flex-col rounded-[2rem] bg-[#f7fbfb] p-2 text-slate-950 sm:min-h-[28rem]">
                    <div className="relative aspect-[16/9] shrink-0 overflow-hidden rounded-[1.55rem] bg-teal-100">
                      <img
                        alt=""
                        aria-hidden="true"
                        className="size-full object-cover"
                        loading={index === 0 ? "eager" : "lazy"}
                        src={item.imageUrl ?? "/background-hq.png"}
                      />
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold text-teal-500">
                        <NewsIcon className="size-3.5" />
                        {t("news.health")}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col px-4 pb-5 pt-4 sm:px-5 sm:pb-6 sm:pt-5">
                      <time className="inline-flex w-fit items-center gap-1.5 text-xs font-extrabold text-teal-500" dateTime={item.publishedAt}>
                        <CalendarIcon className="size-3.5" />
                        {formatDate(item.publishedAt, locale)}
                      </time>
                      <h4 className="mt-4 line-clamp-2 text-lg font-black leading-8 tracking-[-0.04em] text-slate-950 sm:text-xl">
                        {item.title}
                      </h4>
                      <p className="mt-3 line-clamp-3 text-sm font-medium leading-7 text-slate-600">
                        {item.excerpt}
                      </p>
                      <span aria-hidden="true" className="mt-auto block h-1.5 w-14 rounded-full bg-teal-500" />
                    </div>
                  </article>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          </StaggerItem>
        </StaggerScene>
      </StaggerScene>

      </section>

      {portalContainer ? createPortal(
        <AnimatePresence>
          {selectedAnnouncement ? (
            <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[300] flex items-end sm:items-center sm:justify-center sm:p-5"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
          >
            <button aria-label={t("news.closeAnnouncement")} className="absolute inset-0 cursor-default bg-slate-950/60 backdrop-blur-[2px]" onClick={closeAnnouncement} tabIndex={-1} type="button" />
            <motion.article
              animate={{ opacity: 1, scale: 1, y: 0 }}
              aria-labelledby="announcement-dialog-title"
              aria-modal="true"
              className="relative w-full overflow-hidden rounded-t-[2rem] bg-white shadow-[0_28px_72px_rgba(15,23,42,0.3)] sm:max-w-xl sm:rounded-[2rem]"
              exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98, y: shouldReduceMotion ? 0 : 16 }}
              id="announcement-dialog"
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98, y: shouldReduceMotion ? 0 : 24 }}
              ref={dialogRef}
              role="dialog"
              transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: "easeOut" }}
            >
              <div className="border-b border-teal-100 bg-[#f7fbfb] px-5 pb-5 pt-6 sm:px-7 sm:pb-6 sm:pt-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <time className="inline-flex rounded-full bg-teal-100 px-3 py-1.5 text-xs font-extrabold text-teal-500" dateTime={selectedAnnouncement.date}>{formatDate(selectedAnnouncement.date, locale)}</time>
                    <h3 className="mt-3 text-xl font-black leading-8 tracking-[-0.04em] text-slate-950 sm:text-2xl" id="announcement-dialog-title">{selectedAnnouncement.title}</h3>
                  </div>
                  <button aria-label={t("common.close")} className="grid size-11 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-600 transition-[background-color,color,transform] duration-200 hover:bg-teal-100 hover:text-teal-500 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-500 active:scale-95" onClick={closeAnnouncement} ref={closeButtonRef} type="button">
                    <CloseIcon />
                  </button>
                </div>
              </div>
              <div className="px-5 py-6 sm:px-7 sm:py-7">
                <p className="text-base font-medium leading-8 text-slate-700">{selectedAnnouncement.description}</p>
              </div>
            </motion.article>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        portalContainer,
      ) : null}
    </>
  );
}
