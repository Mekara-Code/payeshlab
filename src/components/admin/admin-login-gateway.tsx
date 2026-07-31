"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

function LockIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <rect height="11" rx="2" stroke="currentColor" strokeWidth="1.8" width="15" x="4.5" y="10" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
    </svg>
  );
}

export function AdminLoginGateway() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  function closeDialog() {
    setIsDialogOpen(false);
  }

  useEffect(() => {
    if (!isDialogOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const triggerElement = triggerRef.current;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      document.getElementById("admin-email")?.focus();
    }, 0);

    function keepFocusInDialog(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [href], select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", keepFocusInDialog);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keepFocusInDialog);
      triggerElement?.focus();
    };
  }, [isDialogOpen]);

  const transition = prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: "easeOut" as const };

  return (
    <main className="relative isolate flex min-h-dvh overflow-hidden px-5 py-8 sm:px-8">

      <div aria-hidden={isDialogOpen} className="relative z-10 m-auto flex w-full max-w-md flex-col items-center text-center">
        <motion.div
          animate={{ opacity: 1, scale: 1, y: 0 }}
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
        >
          <div className="relative grid size-58 place-items-center p-5 sm:size-56 sm:p-6">
            <div aria-hidden="true" className="absolute inset-3" />
            <Image
              alt="لوگوی آزمایشگاه پاتولوژی پایش لب"
              className="relative h-full w-full object-contain "
              height={560}
              priority
              src="/payeshlab-logo.png"
              width={560}
            />
          </div>
        </motion.div>

        <h1 className="mt-8 text-3xl font-black tracking-[-0.055em] text-slate-950 sm:text-4xl">پنل مدیریت پایش لب</h1>
        <p className="mt-3 max-w-sm text-base font-medium leading-7 text-slate-600">برای ورود امن به فضای مدیریت آزمایشگاه، حساب سازمانی خود را تأیید کنید.</p>

        <motion.button
          ref={triggerRef}
          aria-controls="admin-login-dialog"
          aria-expanded={isDialogOpen}
          className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-teal-500 px-6 py-4 text-base font-extrabold text-white shadow-[0_20px_38px_rgba(13,148,136,0.28)] transition hover:-translate-y-0.5 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 active:translate-y-0 sm:max-w-sm"
          onClick={() => setIsDialogOpen(true)}
          type="button"
          whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        >
          <LockIcon />
          ورود به حساب کاربری
        </motion.button>

        <p className="mt-6 text-xs font-bold text-slate-500">Payesh Lab · Secure administrator access</p>
      </div>

      <AnimatePresence>
        {isDialogOpen && (
          <motion.div
            animate={{ opacity: 1 }}
            aria-label="بستن پنجره ورود"
            className="fixed inset-0 z-50 grid overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-[2px] sm:p-8"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) {
                closeDialog();
              }
            }}
            transition={transition}
          >
            <motion.section
              ref={dialogRef}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              aria-describedby="admin-login-description"
              aria-labelledby="admin-login-title"
              aria-modal="true"
              className="relative m-auto w-full max-w-md rounded-[2rem] border border-white/90 bg-white p-6 text-right shadow-[0_35px_100px_rgba(15,23,42,0.34)] sm:p-8"
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 12 }}
              id="admin-login-dialog"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 18 }}
              role="dialog"
              transition={transition}
            >
              <button
                aria-label="بستن پنجره ورود"
                className="absolute left-4 top-4 grid size-12 place-items-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                onClick={closeDialog}
                type="button"
              >
                <CloseIcon />
              </button>

              <div className="pe-12">
                <span className="inline-flex rounded-full bg-teal-50 px-3 py-1.5 text-xs font-extrabold text-teal-500 ring-1 ring-inset ring-teal-500/10">ورود مدیران</span>
                <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-slate-950" id="admin-login-title">خوش آمدید</h2>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-600" id="admin-login-description">مشخصات دسترسی سازمانی خود را وارد کنید.</p>
              </div>

              <div className="mt-7">
                <AdminLoginForm />
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-teal-50 px-4 py-3 text-xs font-bold leading-5 text-teal-500">
                <LockIcon />
                ورود شما با نشست امن سمت سرور محافظت می‌شود.
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
