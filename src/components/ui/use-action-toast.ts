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
  const lastMessage = useRef<string | null>(null);

  useEffect(() => {
    const message = state.message?.trim();
    if (!message) {
      lastMessage.current = null;
      return;
    }

    const messageKey = `${state.success ? "success" : "error"}:${message}`;
    if (lastMessage.current === messageKey) return;

    lastMessage.current = messageKey;
    toast(message, {
      title: state.success ? titles.success : titles.error,
      variant: state.success ? "success" : "error",
    });
  }, [state.message, state.success, titles.error, titles.success, toast]);
}
