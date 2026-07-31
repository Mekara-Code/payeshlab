"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BrandMark } from "../brand-mark";
import { ChevronDownIcon, CloseIcon, MenuIcon } from "./navigation-icons";
import { navigationItems, onlineAnswerItems } from "./navigation-data";

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
  onClose?: () => void;
  onNavigate: () => void;
  onToggleOnlineAnswers: () => void;
  reduceMotion: boolean | null;
};

function SidebarContent({
  activeHref,
  isOnlineAnswersOpen,
  onClose,
  onNavigate,
  onToggleOnlineAnswers,
  reduceMotion,
}: SidebarContentProps) {
  const onlineAnswersId = "mobile-online-answers";
  const transition = {
    duration: reduceMotion ? 0 : 0.18,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <div className="flex h-full min-h-0 flex-col p-4 sm:p-5">
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 pb-4">
        <BrandMark />
        {onClose && (
          <button
            aria-label="بستن منو"
            className="grid size-12 shrink-0 place-items-center rounded-2xl text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="size-5" />
          </button>
        )}
      </div>

      <nav aria-label="ناوبری اصلی" className="mt-6 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        <div className="grid gap-1 pb-4">
        <p className="px-3 pb-2 text-xs font-extrabold tracking-wide text-slate-500">منوی اصلی</p>
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
            {item.label}
          </a>
          );
        })}
        </div>
      </nav>

      <div className="mt-5 shrink-0 border-t border-slate-200 pt-5">
        <button
          aria-controls={onlineAnswersId}
          aria-expanded={isOnlineAnswersOpen}
          className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl bg-teal-500 px-4 text-right text-sm font-extrabold text-white transition duration-200 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
          onClick={onToggleOnlineAnswers}
          type="button"
        >
          <span>جوابدهی آنلاین</span>
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
                  {item.label}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-auto shrink-0 pt-6 text-xs font-medium leading-5 text-slate-500">
        دقت امروز، سلامت فردا
      </div>
    </div>
  );
}

export function SidebarNavigation() {
  const activePathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isOnlineAnswersOpen, setIsOnlineAnswersOpen] = useState(false);
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
    const desktopMediaQuery = window.matchMedia("(min-width: 1024px)");
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
      <header
        className={`fixed inset-x-0 top-0 z-50 px-4 transition-[padding] duration-300 sm:px-6 lg:hidden ${
          isScrolled ? "pt-3 sm:pt-4" : "pt-4 sm:pt-6"
        }`}
      >
        <div
          className={`flex items-center justify-between gap-3 transition-[background-color,border-radius,box-shadow,padding] duration-300 ${
            isScrolled
              ? "rounded-[1.75rem] bg-white/95 px-3 py-2 shadow-[0_16px_42px_rgba(15,23,42,0.12)] backdrop-blur-xl"
              : ""
          }`}
        >
          <BrandMark className="min-w-0" />
          <button
            aria-controls="mobile-sidebar"
            aria-expanded={isMobileSidebarOpen}
            aria-label="باز کردن منو"
            className="grid size-14 shrink-0 place-items-center rounded-2xl text-slate-700 transition duration-200 hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
            onClick={() => setIsMobileSidebarOpen(true)}
            ref={menuButtonRef}
            type="button"
          >
            <MenuIcon className="size-6" />
          </button>
        </div>
      </header>

      <header
        className={`fixed inset-x-0 top-0 z-50 hidden px-12 transition-[padding] duration-300 lg:block ${
          isScrolled ? "pt-4" : "pt-6"
        }`}
      >
        <div
          className={`mx-auto flex max-w-[1440px] items-center justify-between gap-5 transition-[background-color,border-radius,box-shadow,padding] duration-300 ${
            isScrolled
              ? "rounded-[1.75rem] bg-white/95 px-6 py-3 shadow-[0_16px_42px_rgba(15,23,42,0.12)] backdrop-blur-xl"
              : ""
          }`}
        >
          <BrandMark />
          <nav aria-label="ناوبری اصلی" className="flex items-center gap-5 xl:gap-9">
            {navigationItems.map((item) => {
              const isActive = item.href === activeNavigationHref;

              return (
              <a
                aria-current={isActive ? "page" : undefined}
                className={`group relative py-3 text-sm font-bold transition-colors hover:text-teal-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 ${
                  isActive ? "text-teal-500" : "text-slate-700"
                }`}
                href={item.href}
                key={item.href}
              >
                {item.label}
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
          <div className="relative">
            <button
              aria-controls="desktop-online-answers-menu"
              aria-expanded={isOnlineAnswersOpen}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-teal-500 px-5 py-3 text-sm font-extrabold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
              onClick={() => setIsOnlineAnswersOpen((current) => !current)}
              type="button"
            >
              جوابدهی آنلاین
              <ChevronDownIcon className={`size-4 transition-transform duration-200 ${isOnlineAnswersOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isOnlineAnswersOpen && (
                <motion.section
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  aria-label="سامانه جوابدهی آنلاین"
                  className="absolute left-0 top-full mt-3 w-[min(42rem,calc(100vw-3rem))] origin-top-left rounded-[2rem] border border-white/90 bg-white/95 p-5 text-right shadow-[0_28px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl"
                  exit={{ opacity: 0, scale: 0.98, y: -8 }}
                  id="desktop-online-answers-menu"
                  initial={{ opacity: 0, scale: 0.98, y: -8 }}
                  transition={drawerTransition}
                >
                  <div className="mb-4 border-b border-slate-200 pb-4">
                    <p className="text-base font-black text-slate-950">سامانه جوابدهی آنلاین</p>
                    <p className="mt-1 text-sm font-medium text-slate-600">مسیر مناسب خود را انتخاب کنید.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {onlineAnswerItems.map((item) => (
                      <a
                        className="flex min-h-20 items-center rounded-2xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-extrabold text-slate-800 transition duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                        href={item.href}
                        key={item.href}
                        onClick={() => setIsOnlineAnswersOpen(false)}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[70] lg:hidden"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={drawerTransition}
          >
            <button
              aria-label="بستن منو"
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]"
              onClick={closeMobileSidebar}
              type="button"
            />
            <motion.aside
              animate={{ x: 0 }}
              aria-label="منوی موبایل"
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
                onClose={closeMobileSidebar}
                onNavigate={closeMobileSidebar}
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
