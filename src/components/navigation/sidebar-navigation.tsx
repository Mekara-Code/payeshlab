"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BrandMark } from "../brand-mark";
import { ChevronDownIcon, CloseIcon, MenuIcon } from "./navigation-icons";
import { navigationItems, onlineAnswerItems } from "./navigation-data";
import { LanguageSwitcher } from "./language-switcher";
import { JobApplicationModal } from "@/components/careers/job-application-modal";
import { EitaaIcon } from "@/components/icons/eitaa-icon";
import { RubikaIcon } from "@/components/icons/rubika-icon";
import { useTranslations } from "@/components/i18n/dictionary-provider";
import { HomeSamplingRequestModal } from "@/components/sampling/home-sampling-request-modal";
import type { ContentLocale } from "@/lib/content-locale";

export type SocialLink = {
  href: string;
  kind: "eitaa" | "instagram" | "rubika" | "whatsapp";
  label: string;
};

function SocialIcon({ kind }: { kind: SocialLink["kind"] }) {
  if (kind === "instagram") {
    return (
      <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
        <rect height="16" rx="4" stroke="currentColor" strokeWidth="1.8" width="16" x="4" y="4" />
        <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.2" cy="6.9" fill="currentColor" r="1" />
      </svg>
    );
  }

  if (kind === "rubika") {
    return <RubikaIcon className="size-4" />;
  }

  if (kind === "eitaa") {
    return <EitaaIcon className="size-4" />;
  }

  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.6Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M9.1 8.1c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.5.6c.5 1 1.2 1.7 2.2 2.2l.6-.5c.2-.2.4-.2.7-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3 0 .6-.5.8-.4.2-.9.3-1.4.1-2.7-.9-4.8-3-5.7-5.7-.2-.5-.1-1 .1-1.4Z" fill="currentColor" />
    </svg>
  );
}

const homeSections = [
  { id: "lab-intro", navigationHref: "/#services" },
  { id: "services", navigationHref: "/#services" },
  { id: "home-sample-collection", navigationHref: "/#services" },
  { id: "news-and-announcements", navigationHref: "/#news-and-announcements" },
  { id: "articles", navigationHref: "/#articles" },
] as const;

type HomeSectionId = (typeof homeSections)[number]["id"];

function getActiveNavigationHref(
  pathname: string,
  activeSection: HomeSectionId | null,
) {
  if (pathname === "/") {
    return (
      homeSections.find((section) => section.id === activeSection)
        ?.navigationHref ?? "/"
    );
  }

  if (pathname === "/articles" || pathname.startsWith("/articles/")) {
    return "/#articles";
  }

  return pathname;
}

type SidebarContentProps = {
  activeHref: string | null;
  isOnlineAnswersOpen: boolean;
  laboratoryName: string | null;
  onClose?: () => void;
  onNavigate: () => void;
  onRequestSampling: () => void;
  onToggleOnlineAnswers: () => void;
  reduceMotion: boolean | null;
};

function SidebarContent({
  activeHref,
  isOnlineAnswersOpen,
  laboratoryName,
  onClose,
  onNavigate,
  onRequestSampling,
  onToggleOnlineAnswers,
  reduceMotion,
}: SidebarContentProps) {
  const { t } = useTranslations();
  const onlineAnswersId = "mobile-online-answers";
  const transition = {
    duration: reduceMotion ? 0 : 0.18,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <div className="flex h-full min-h-0 flex-col p-4 sm:p-5">
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 pb-4">
        <BrandMark laboratoryName={laboratoryName} />
        {onClose && (
          <button
            aria-label={t("navigation.closeMenu")}
            className="grid size-12 shrink-0 place-items-center rounded-2xl text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="size-5" />
          </button>
        )}
      </div>

      <nav aria-label={t("navigation.primary")} className="mt-6 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        <div className="grid gap-1 pb-4">
        <p className="px-3 pb-2 text-xs font-extrabold tracking-wide text-slate-500">{t("navigation.menu")}</p>
        {navigationItems.map((item) => {
          const isActive = item.href === activeHref;

          return (
          <a
            aria-current={isActive ? "page" : undefined}
            className={`flex min-h-12 items-center rounded-2xl px-3 text-sm font-bold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${
              isActive
                ? "bg-teal-50 text-teal-500"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
            }`}
            href={item.href}
            key={item.href}
            onClick={onNavigate}
          >
            {t(item.labelKey)}
          </a>
          );
        })}
        </div>
      </nav>

      <div className="mt-5 shrink-0 border-t border-slate-200 pt-5">
        <button
          aria-haspopup="dialog"
          className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 px-4 text-center text-sm font-extrabold text-teal-600 transition duration-200 hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
          onClick={onRequestSampling}
          type="button"
        >
          {t("homeSampling.trigger")}
        </button>

        <button
          aria-controls={onlineAnswersId}
          aria-expanded={isOnlineAnswersOpen}
          className="mt-2 flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl bg-teal-500 px-4 text-right text-sm font-extrabold text-white transition duration-200 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
          onClick={onToggleOnlineAnswers}
          type="button"
        >
          <span>{t("navigation.onlineAnswers")}</span>
          <ChevronDownIcon className={`size-5 transition-transform duration-200 ${isOnlineAnswersOpen ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence initial={false}>
          {isOnlineAnswersOpen && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 grid gap-1"
              exit={{ opacity: 0, y: -6 }}
              id={onlineAnswersId}
              initial={{ opacity: 0, y: -6 }}
              transition={transition}
            >
              {onlineAnswerItems.map((item) => (
                <a
                  className="flex min-h-12 items-center rounded-2xl px-3 text-sm font-bold text-slate-700 transition duration-200 hover:bg-teal-50 hover:text-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                  href={item.href}
                  key={item.href}
                  onClick={onNavigate}
                >
                  {t(item.labelKey)}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-auto shrink-0 pt-6 text-xs font-medium leading-5 text-slate-500">
        {t("brand.tagline")}
      </div>
    </div>
  );
}

export function SidebarNavigation({
  hasTestPreparation,
  insuranceOptions,
  laboratoryName,
  locale,
  socialLinks,
}: {
  hasTestPreparation: boolean;
  insuranceOptions: string[];
  laboratoryName: string | null;
  locale: ContentLocale;
  socialLinks: SocialLink[];
}) {
  const { t } = useTranslations();
  const activePathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isOnlineAnswersOpen, setIsOnlineAnswersOpen] = useState(false);
  const [isSamplingFormOpen, setIsSamplingFormOpen] = useState(false);
  const [isJobApplicationOpen, setIsJobApplicationOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<HomeSectionId | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const drawerTransition = {
    duration: shouldReduceMotion ? 0 : 0.24,
    ease: [0.22, 1, 0.36, 1] as const,
  };
  const activeNavigationHref = getActiveNavigationHref(
    activePathname,
    activeSection,
  );

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const openSamplingForm = () => {
    setIsMobileSidebarOpen(false);
    setIsOnlineAnswersOpen(false);
    setIsSamplingFormOpen(true);
  };

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileSidebar();
        menuButtonRef.current?.focus();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMobileSidebarOpen]);

  useEffect(() => {
    const desktopMediaQuery = window.matchMedia("(min-width: 1280px)");
    const closeAtDesktopSize = () => {
      if (desktopMediaQuery.matches) {
        closeMobileSidebar();
      }
    };

    closeAtDesktopSize();
    desktopMediaQuery.addEventListener("change", closeAtDesktopSize);

    return () => desktopMediaQuery.removeEventListener("change", closeAtDesktopSize);
  }, []);

  useEffect(() => {
    let animationFrame = 0;

    const updateNavigationState = () => {
      animationFrame = 0;
      setIsScrolled(window.scrollY > 24);

      const activationLine = Math.max(
        112,
        Math.min(window.innerHeight * 0.28, 192),
      );
      const nextActiveSection =
        activePathname === "/"
          ? homeSections.reduce<HomeSectionId | null>((activeSection, section) => {
              const element = document.getElementById(section.id);
              if (!element) return activeSection;

              const bounds = element.getBoundingClientRect();
              return bounds.top <= activationLine && bounds.bottom > activationLine
                ? section.id
                : activeSection;
            }, null)
          : null;

      setActiveSection((current) =>
        current === nextActiveSection ? current : nextActiveSection,
      );
    };

    const handleScroll = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(updateNavigationState);
      }
    };

    updateNavigationState();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [activePathname]);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[60] h-11 bg-teal-500 text-white">
        <div className={`mx-auto flex h-full max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-12 ${socialLinks.length > 0 ? "justify-between" : "justify-end"}`}>
          {socialLinks.length > 0 ? (
            <nav aria-label={t("navigation.social")} className="hidden items-center gap-1 sm:flex">
              {socialLinks.map((socialLink) => (
                <a
                  aria-label={socialLink.label}
                  className="grid size-9 place-items-center rounded-xl text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  href={socialLink.href}
                  key={socialLink.kind}
                  rel="noreferrer"
                  target="_blank"
                >
                  <SocialIcon kind={socialLink.kind} />
                </a>
              ))}
            </nav>
          ) : null}
          <div className="flex shrink-0 items-center gap-2">
            {hasTestPreparation ? (
              <Link
                className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-white bg-white px-3 text-xs font-extrabold text-teal-500 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-sm"
                href="/test-preparation"
              >
                <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
                  <path d="M9 3h6M10 3v6.1L5.6 17a2.5 2.5 0 0 0 2.2 3.7h8.4a2.5 2.5 0 0 0 2.2-3.7L14 9.1V3M8.5 15h7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                </svg>
                <span className="sm:hidden">{t("preparation.triggerShort")}</span>
                <span className="hidden sm:inline">{t("preparation.trigger")}</span>
              </Link>
            ) : null}
            <button
              aria-expanded={isJobApplicationOpen}
              aria-haspopup="dialog"
              className="inline-flex h-9 cursor-pointer touch-manipulation items-center justify-center whitespace-nowrap rounded-xl border border-white bg-white px-3 text-xs font-extrabold text-teal-500 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-sm"
              onClick={() => setIsJobApplicationOpen(true)}
              type="button"
            >
              {t("careers.trigger")}
            </button>
            <LanguageSwitcher locale={locale} />
          </div>
        </div>
      </div>
      <header
        className={`fixed inset-x-0 top-11 z-50 px-4 transition-[padding] duration-300 sm:px-6 xl:hidden ${
          isScrolled ? "pt-3 sm:pt-4" : "pt-4 sm:pt-6"
        }`}
      >
        <div
          className={`flex items-center justify-between gap-2 transition-[background-color,border-radius,box-shadow,padding] duration-300 sm:gap-3 ${
            isScrolled
              ? "rounded-[1.75rem] bg-white/95 px-3 py-2 shadow-[0_16px_42px_rgba(15,23,42,0.12)] backdrop-blur-xl"
              : ""
          }`}
        >
          <BrandMark className="min-w-0 shrink" laboratoryName={laboratoryName} />
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button
              aria-haspopup="dialog"
              aria-label={t("homeSampling.trigger")}
              className="inline-flex min-h-11 items-center whitespace-nowrap rounded-2xl border border-teal-200 bg-teal-50 px-3 text-xs font-extrabold text-teal-600 transition duration-200 hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 sm:px-4 sm:text-sm"
              onClick={openSamplingForm}
              type="button"
            >
              <span className="sm:hidden">{t("homeSampling.triggerShort")}</span>
              <span className="hidden sm:inline">{t("homeSampling.trigger")}</span>
            </button>
            <button
              aria-controls="mobile-sidebar"
              aria-expanded={isMobileSidebarOpen}
              aria-label={t("navigation.openMenu")}
              className="grid size-14 shrink-0 place-items-center rounded-2xl text-slate-700 transition duration-200 hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
              onClick={() => setIsMobileSidebarOpen(true)}
              ref={menuButtonRef}
              type="button"
            >
              <MenuIcon className="size-6" />
            </button>
          </div>
        </div>
      </header>

      <header
        className={`fixed inset-x-0 top-11 z-50 hidden px-6 transition-[padding] duration-300 xl:block 2xl:px-12 ${
          isScrolled ? "pt-4" : "pt-6"
        }`}
      >
        <div
          className={`mx-auto flex max-w-[1440px] items-center justify-between gap-4 transition-[background-color,border-radius,box-shadow,padding] duration-300 2xl:gap-6 ${
            isScrolled
              ? "rounded-[1.75rem] bg-white/95 px-6 py-3 shadow-[0_16px_42px_rgba(15,23,42,0.12)] backdrop-blur-xl"
              : ""
          }`}
        >
          <BrandMark className="shrink-0" laboratoryName={laboratoryName} />
          <nav aria-label={t("navigation.primary")} className="flex min-w-0 items-center gap-4 2xl:gap-8">
            {navigationItems.map((item) => {
              const isActive = item.href === activeNavigationHref;

              return (
              <a
                aria-current={isActive ? "page" : undefined}
                className={`group relative whitespace-nowrap py-3 text-[13px] font-bold transition-colors hover:text-teal-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 2xl:text-sm ${
                  isActive ? "text-teal-500" : "text-slate-700"
                }`}
                href={item.href}
                key={item.href}
              >
                {t(item.labelKey)}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-1 -bottom-px h-0.5 origin-right rounded-full bg-teal-500 transition-transform duration-300 ease-out motion-reduce:transition-none ${
                    isActive
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                  }`}
                />
              </a>
              );
            })}
          </nav>
          <div className="flex shrink-0 items-center gap-2 2xl:gap-3">
            <button
              aria-haspopup="dialog"
              className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-teal-200 bg-white/90 px-4 py-3 text-[13px] font-extrabold text-teal-600 transition duration-200 hover:-translate-y-0.5 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 2xl:px-5 2xl:text-sm"
              onClick={openSamplingForm}
              type="button"
            >
              {t("homeSampling.trigger")}
            </button>

            <div className="relative">
            <button
              aria-controls="desktop-online-answers-menu"
              aria-expanded={isOnlineAnswersOpen}
              className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full bg-teal-500 px-4 py-3 text-[13px] font-extrabold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 2xl:px-5 2xl:text-sm"
              onClick={() => setIsOnlineAnswersOpen((current) => !current)}
              type="button"
            >
              {t("navigation.onlineAnswers")}
              <ChevronDownIcon className={`size-4 transition-transform duration-200 ${isOnlineAnswersOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isOnlineAnswersOpen && (
                <motion.section
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  aria-label={t("navigation.onlineAnswersTitle")}
                  className="absolute left-0 top-full mt-3 w-[min(42rem,calc(100vw-3rem))] origin-top-left rounded-[2rem] border border-white/90 bg-white/95 p-5 text-right shadow-[0_28px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl"
                  exit={{ opacity: 0, scale: 0.98, y: -8 }}
                  id="desktop-online-answers-menu"
                  initial={{ opacity: 0, scale: 0.98, y: -8 }}
                  transition={drawerTransition}
                >
                  <div className="mb-4 border-b border-slate-200 pb-4">
                    <p className="text-base font-black text-slate-950">{t("navigation.onlineAnswersTitle")}</p>
                    <p className="mt-1 text-sm font-medium text-slate-600">{t("navigation.onlineAnswersDescription")}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {onlineAnswerItems.map((item) => (
                      <a
                        className="flex min-h-20 items-center rounded-2xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-extrabold text-slate-800 transition duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                        href={item.href}
                        key={item.href}
                        onClick={() => setIsOnlineAnswersOpen(false)}
                      >
                        {t(item.labelKey)}
                      </a>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <HomeSamplingRequestModal
        insuranceOptions={insuranceOptions}
        isOpen={isSamplingFormOpen}
        onClose={() => setIsSamplingFormOpen(false)}
      />
      <JobApplicationModal
        isOpen={isJobApplicationOpen}
        onClose={() => setIsJobApplicationOpen(false)}
      />

      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[70] xl:hidden"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={drawerTransition}
          >
            <button
              aria-label={t("navigation.closeMenu")}
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]"
              onClick={closeMobileSidebar}
              type="button"
            />
            <motion.aside
              animate={{ x: 0 }}
              aria-label={t("navigation.menu")}
              aria-modal="true"
              className="absolute inset-y-0 left-0 w-[min(21.5rem,calc(100vw-1.25rem))] border-r border-slate-200 bg-white shadow-[20px_0_60px_rgba(15,23,42,0.22)]"
              exit={{ x: "-100%" }}
              id="mobile-sidebar"
              initial={{ x: "-100%" }}
              role="dialog"
              transition={drawerTransition}
            >
              <SidebarContent
                activeHref={activeNavigationHref}
                isOnlineAnswersOpen={isOnlineAnswersOpen}
                laboratoryName={laboratoryName}
                onClose={closeMobileSidebar}
                onNavigate={closeMobileSidebar}
                onRequestSampling={openSamplingForm}
                onToggleOnlineAnswers={() => setIsOnlineAnswersOpen((current) => !current)}
                reduceMotion={shouldReduceMotion}
              />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
