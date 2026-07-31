"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ToastVariant = "success" | "error" | "info";

export type ToastOptions = {
  duration?: number;
  title?: string;
  variant?: ToastVariant;
};

type ToastItem = Required<ToastOptions> & {
  id: string;
  message: string;
};

type ToastContextValue = {
  dismissToast: (id: string) => void;
  toast: (message: string, options?: ToastOptions) => string;
};

const ToastContext = createContext<ToastContextValue | null>(null);
const defaultDuration = 5_000;

function ToastIcon({ variant }: { variant: ToastVariant }) {
  if (variant === "success") {
    return (
      <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
        <path
          d="m5.5 12.5 4 4 9-9"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }

  if (variant === "error") {
    return (
      <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 8v4.5M12 16h.01"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 11v4M12 8h.01"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function getToastPresentation(variant: ToastVariant) {
  if (variant === "success")
    return {
      accent: "bg-teal-500",
      icon: "bg-teal-50 text-teal-500",
      title: "انجام شد",
    };
  if (variant === "error")
    return {
      accent: "bg-rose-500",
      icon: "bg-rose-50 text-rose-700",
      title: "نیاز به بررسی دارد",
    };
  return {
    accent: "bg-slate-500",
    icon: "bg-slate-100 text-slate-700",
    title: "اطلاع‌رسانی",
  };
}

function ToastCard({
  onDismiss,
  toast,
}: {
  onDismiss: (id: string) => void;
  toast: ToastItem;
}) {
  const shouldReduceMotion = useReducedMotion();
  const presentation = getToastPresentation(toast.variant);
  const transition = {
    duration: shouldReduceMotion ? 0 : 0.24,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <motion.button
      animate={{ opacity: 1, scale: 1, y: 0 }}
      aria-label={`${toast.title}: ${toast.message}. برای بستن کلیک کنید.`}
      className="relative w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-4 text-right shadow-[0_18px_42px_rgba(15,23,42,0.16)] backdrop-blur-xl transition hover:border-teal-200 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal-500"
      exit={{ opacity: 0, scale: 0.97, y: -10 }}
      initial={{ opacity: 0, scale: 0.97, y: -14 }}
      layout="position"
      onClick={() => onDismiss(toast.id)}
      transition={transition}
      type="button"
    >
      <span className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`grid size-10 shrink-0 place-items-center rounded-xl ${presentation.icon}`}
        >
          <ToastIcon variant={toast.variant} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black text-slate-950">
            {toast.title}
          </span>
          <span className="mt-1 block text-sm font-medium leading-6 text-slate-600">
            {toast.message}
          </span>
        </span>
        <span aria-hidden="true" className="mt-1 text-xs font-bold text-slate-400">
          بستن
        </span>
      </span>
      <motion.span
        animate={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
        className={`absolute inset-x-0 bottom-0 h-1 origin-right ${presentation.accent}`}
        initial={{ scaleX: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : toast.duration / 1_000, ease: "linear" }}
      />
    </motion.button>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<string, number>());

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current.clear();
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, options: ToastOptions = {}) => {
      const trimmedMessage = message.trim();
      if (!trimmedMessage) return "";

      const variant = options.variant ?? "info";
      const duration = Math.max(1_500, options.duration ?? defaultDuration);
      const id = `toast-${++nextId.current}`;
      const nextToast: ToastItem = {
        duration,
        id,
        message: trimmedMessage,
        title: options.title ?? getToastPresentation(variant).title,
        variant,
      };

      setToasts((current) => [...current, nextToast]);
      timers.current.set(id, window.setTimeout(() => dismissToast(id), duration));
      return id;
    },
    [dismissToast],
  );

  const value = useMemo(
    () => ({ dismissToast, toast }),
    [dismissToast, toast],
  );

  return (
    <ToastContext value={value}>
      {children}
      <div
        aria-atomic="false"
        aria-live="polite"
        className="pointer-events-none fixed left-1/2 top-4 z-[220] flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 flex-col gap-3 sm:top-6"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {toasts.map((item) => (
            <div className="pointer-events-auto" key={item.id} role={item.variant === "error" ? "alert" : "status"}>
              <ToastCard onDismiss={dismissToast} toast={item} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context)
    throw new Error("useToast must be used inside ToastProvider.");
  return context;
}
