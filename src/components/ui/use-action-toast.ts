"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/toast-provider";

type ActionMessageState = {
  message?: string;
  success?: boolean;
};

type ActionToastTitles = {
  error?: string;
  success?: string;
};

export function useActionToast(
  state: ActionMessageState,
  titles: ActionToastTitles = {},
) {
  const { toast } = useToast();
  /* Each action result is a fresh object, so tracking the state itself keeps
     repeated actions with the very same message toasting every time. */
  const lastState = useRef<ActionMessageState | null>(null);

  useEffect(() => {
    if (lastState.current === state) return;
    lastState.current = state;

    const message = state.message?.trim();
    if (!message) return;

    toast(message, {
      title: state.success ? titles.success : titles.error,
      variant: state.success ? "success" : "error",
    });
  }, [state, titles.error, titles.success, toast]);
}
