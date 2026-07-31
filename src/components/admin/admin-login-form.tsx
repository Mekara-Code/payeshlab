"use client";

import { useActionState, useState } from "react";
import { signInAdmin, type AdminLoginState } from "@/app/admin/login/actions";
import { useActionToast } from "@/components/ui/use-action-toast";

const initialState: AdminLoginState = {};

function EyeIcon({ isVisible }: { isVisible: boolean }) {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      {isVisible ? (
        <>
          <path d="M2.5 12s3.4-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.4 5.5-9.5 5.5S2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.8" />
        </>
      ) : (
        <path d="m3 3 18 18M10.6 6.7A10.7 10.7 0 0 1 12 6.5c6.1 0 9.5 5.5 9.5 5.5a16 16 0 0 1-3.1 3.5M6.1 6.1A15.7 15.7 0 0 0 2.5 12S5.9 17.5 12 17.5c1.2 0 2.3-.2 3.3-.6M9.7 9.7a3.2 3.2 0 0 0 4.5 4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      )}
    </svg>
  );
}

export function AdminLoginForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [state, formAction, isPending] = useActionState(signInAdmin, initialState);
  useActionToast(state);

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <div>
        <label className="mb-2 block text-sm font-extrabold text-slate-800" htmlFor="admin-email">
          ایمیل سازمانی
        </label>
        <input
          autoComplete="username"
          className="min-h-13 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
          dir="ltr"
          id="admin-email"
          inputMode="email"
          name="email"
          placeholder="admin@example.com"
          required
          type="email"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-extrabold text-slate-800" htmlFor="admin-password">
          رمز عبور
        </label>
        <div className="relative">
          <input
            autoComplete="current-password"
            className="min-h-13 w-full rounded-2xl border border-slate-200 bg-white py-3 pl-4 pr-12 text-base font-medium text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
            dir="ltr"
            id="admin-password"
            name="password"
            placeholder="••••••••••••"
            required
            type={isPasswordVisible ? "text" : "password"}
          />
          <button
            aria-label={isPasswordVisible ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-2xl text-slate-500 transition hover:text-teal-500 focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-teal-500"
            onClick={() => setIsPasswordVisible((current) => !current)}
            type="button"
          >
            <EyeIcon isVisible={isPasswordVisible} />
          </button>
        </div>
      </div>

      <button
        className="inline-flex min-h-13 items-center justify-center gap-3 rounded-2xl bg-teal-500 px-5 py-3.5 text-base font-extrabold text-white shadow-[0_18px_32px_rgba(13,148,136,0.25)] transition duration-200 hover:-translate-y-0.5 hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "در حال بررسی امن…" : "ورود امن به پنل"}
      </button>
    </form>
  );
}
