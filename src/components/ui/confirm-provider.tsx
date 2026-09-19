"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from "react";

export type ConfirmOptions = {
  cancelLabel?: string;
  confirmLabel?: string;
  description?: string;
  tone?: "danger" | "neutral";
  title: string;
};

export type PromptOptions = ConfirmOptions & {
  defaultValue?: string;
  inputLabel?: string;
  inputType?: "text" | "url";
  placeholder?: string;
  required?: boolean;
};

type DialogRequest =
  | { kind: "confirm"; options: ConfirmOptions; resolve: (value: boolean) => void }
  | {
      kind: "prompt";
      options: PromptOptions;
      resolve: (value: string | null) => void;
    };

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

const subscribeToPortal = () => () => {};
const getPortalContainer = () => document.body;
const getServerPortalContainer = () => null;

function WarningIcon() {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 4.5 2.8 20h18.4L12 4.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M12 10v4M12 17h.01"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M9.8 9.6a2.2 2.2 0 1 1 2.9 2.1c-.5.2-.7.6-.7 1.1v.5M12 16.5h.01"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function DialogCard({
  onCancel,
  onConfirm,
  request,
}: {
  onCancel: () => void;
  onConfirm: (value: string) => void;
  request: DialogRequest;
}) {
  const { options } = request;
  const isPrompt = request.kind === "prompt";
  const promptOptions = isPrompt ? (options as PromptOptions) : null;
  const [value, setValue] = useState(promptOptions?.defaultValue ?? "");
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion() ?? false;
  const isDanger = options.tone !== "neutral";

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(
        cardRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const frame = window.requestAnimationFrame(() => {
      const field = cardRef.current?.querySelector<HTMLElement>(
        'input, button[data-confirm-action="true"]',
      );
      field?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [onCancel]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (promptOptions?.required && !value.trim()) return;
    onConfirm(value);
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[420] flex items-center justify-center p-4"
      dir="rtl"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        aria-label="بستن"
        className="absolute inset-0 cursor-default bg-slate-950/70 backdrop-blur-sm"
        onClick={onCancel}
        tabIndex={-1}
        type="button"
      />
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        aria-describedby={options.description ? "confirm-dialog-description" : undefined}
        aria-labelledby="confirm-dialog-title"
        aria-modal="true"
        className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] bg-white p-6 text-right shadow-[0_32px_88px_rgba(15,23,42,0.34)]"
        exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.985, y: shouldReduceMotion ? 0 : 10 }}
        initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.975, y: shouldReduceMotion ? 0 : 14 }}
        ref={cardRef}
        role="dialog"
        transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className={`grid size-12 shrink-0 place-items-center rounded-2xl ${isDanger ? "bg-rose-50 text-rose-700" : "bg-teal-50 text-teal-500"}`}
          >
            {isDanger ? <WarningIcon /> : <QuestionIcon />}
          </span>
          <div className="min-w-0 flex-1">
            <h2
              className="text-lg font-black tracking-[-0.03em] text-slate-950"
              id="confirm-dialog-title"
            >
              {options.title}
            </h2>
            {options.description ? (
              <p
                className="mt-2 text-sm font-medium leading-7 text-slate-600"
                id="confirm-dialog-description"
              >
                {options.description}
              </p>
            ) : null}
          </div>
        </div>

        <form className="mt-5 grid gap-4" onSubmit={submit}>
          {promptOptions ? (
            <label className="grid gap-2 text-sm font-extrabold text-slate-700">
              {promptOptions.inputLabel ?? "مقدار"}
              <input
                className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-100"
                dir={promptOptions.inputType === "url" ? "ltr" : undefined}
                onChange={(event) => setValue(event.target.value)}
                placeholder={promptOptions.placeholder}
                type={promptOptions.inputType === "url" ? "url" : "text"}
                value={value}
              />
            </label>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              className="min-h-12 rounded-xl border border-slate-200 px-5 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
              onClick={onCancel}
              type="button"
            >
              {options.cancelLabel ?? "انصراف"}
            </button>
            <button
              className={`min-h-12 rounded-xl px-5 text-sm font-extrabold text-white transition focus-visible:outline-2 focus-visible:outline-offset-3 disabled:opacity-60 ${isDanger ? "bg-rose-600 hover:bg-rose-700 focus-visible:outline-rose-600" : "bg-teal-500 hover:bg-teal-600 focus-visible:outline-teal-500"}`}
              data-confirm-action="true"
              disabled={Boolean(promptOptions?.required) && !value.trim()}
              type="submit"
            >
              {options.confirmLabel ?? (isDanger ? "حذف" : "تأیید")}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<DialogRequest | null>(null);
  const portalContainer = useSyncExternalStore(
    subscribeToPortal,
    getPortalContainer,
    getServerPortalContainer,
  );

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setRequest({ kind: "confirm", options, resolve });
      }),
    [],
  );

  const prompt = useCallback(
    (options: PromptOptions) =>
      new Promise<string | null>((resolve) => {
        setRequest({ kind: "prompt", options, resolve });
      }),
    [],
  );

  const cancel = useCallback(() => {
    setRequest((current) => {
      if (current?.kind === "prompt") current.resolve(null);
      else current?.resolve(false);
      return null;
    });
  }, []);

  const accept = useCallback((value: string) => {
    setRequest((current) => {
      if (current?.kind === "prompt") current.resolve(value.trim());
      else current?.resolve(true);
      return null;
    });
  }, []);

  const value = useMemo(() => ({ confirm, prompt }), [confirm, prompt]);

  return (
    <ConfirmContext value={value}>
      {children}
      {portalContainer
        ? createPortal(
            <AnimatePresence>
              {request ? (
                <DialogCard
                  key="confirm-dialog"
                  onCancel={cancel}
                  onConfirm={accept}
                  request={request}
                />
              ) : null}
            </AnimatePresence>,
            portalContainer,
          )
        : null}
    </ConfirmContext>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context)
    throw new Error("useConfirm must be used inside ConfirmProvider.");
  return context;
}
