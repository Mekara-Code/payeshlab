"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/toast-provider";

type ActionMessageState = {
  message?: string;
  success?: boolean;
};

export function useActionToast(state: ActionMessageState) {
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
    toast(message, { variant: state.success ? "success" : "error" });
  }, [state.message, state.success, toast]);
}
