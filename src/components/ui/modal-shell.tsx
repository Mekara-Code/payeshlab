"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";
import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const subscribeToPortal = () => () => {};
const getPortalContainer = () => document.body;
const getServerPortalContainer = () => null;
const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

export type ModalShellProps = {
  children: ReactNode;
  closeLabel: string;
  description?: string;
  /** CSS selector for the field that should receive focus when the dialog opens. */
  initialFocusSelector?: string;
  dir?: "ltr" | "rtl";
  eyebrow?: string;
  id: string;
  isOpen: boolean;
  maxWidthClassName?: string;
  onClose: () => void;
  title: string;
};

/**
 * Centered, responsive dialog with a backdrop, focus trap, Escape handling and
 * body scroll lock. The body scrolls on its own so tall forms stay usable on
 * small screens.
 */
export function ModalShell({
  children,
  closeLabel,
  description,
  dir,
  eyebrow,
  id,
  initialFocusSelector,
  isOpen,
  maxWidthClassName = "max-w-2xl",
  onClose,
  title,
}: ModalShellProps) {
  const portalContainer = useSyncExternalStore(
    subscribeToPortal,
    getPortalContainer,
    getServerPortalContainer,
  );
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion() ?? false;

  useEffect(() => {
    if (!isOpen) return;

    returnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
      );
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
    const frame = window.requestAnimationFrame(() => {
      const firstField = initialFocusSelector
        ? dialogRef.current?.querySelector<HTMLElement>(initialFocusSelector)
        : dialogRef.current?.querySelector<HTMLElement>(
            'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])',
          );
      (firstField ?? closeButtonRef.current)?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [initialFocusSelector, isOpen, onClose]);

  if (!portalContainer) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-5"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            aria-label={closeLabel}
            className="absolute inset-0 cursor-default bg-slate-950/85 backdrop-blur-md"
            onClick={onClose}
            tabIndex={-1}
            type="button"
          />

          <motion.section
            animate={{ opacity: 1, scale: 1, y: 0 }}
            aria-labelledby={`${id}-title`}
            aria-modal="true"
            className={`relative flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_32px_88px_rgba(15,23,42,0.34)] sm:max-h-[min(90dvh,54rem)] sm:rounded-[2rem] ${maxWidthClassName}`}
            dir={dir}
            exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.985, y: shouldReduceMotion ? 0 : 12 }}
            id={id}
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.975, y: shouldReduceMotion ? 0 : 18 }}
            ref={dialogRef}
            role="dialog"
            transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 pb-4 pt-5 sm:px-7 sm:pb-5 sm:pt-6">
              <div className="min-w-0">
                {eyebrow ? (
                  <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-extrabold text-teal-500">
                    {eyebrow}
                  </span>
                ) : null}
                <h2
                  className="mt-2 text-xl font-black tracking-[-0.04em] text-slate-950 sm:text-2xl"
                  id={`${id}-title`}
                >
                  {title}
                </h2>
                {description ? (
                  <p className="mt-1.5 text-sm font-medium leading-6 text-slate-600">
                    {description}
                  </p>
                ) : null}
              </div>
              <button
                aria-label={closeLabel}
                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition duration-200 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-500 active:scale-95"
                onClick={onClose}
                ref={closeButtonRef}
                type="button"
              >
                <CloseIcon />
              </button>
            </header>

            {children}
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    portalContainer,
  );
}
