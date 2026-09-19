"use client";

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
import type { LabStatus } from "@/lib/lab-availability";

export type LabStatusValue = {
  /** Milliseconds until the open/closed state flips, or null when unknown. */
  remainingMs: number | null;
  status: LabStatus;
  /** Tehran-accurate current time, derived from the server clock. */
  tehranNowMs: number;
};

const LabStatusContext = createContext<LabStatusValue | null>(null);
const SYNC_INTERVAL_MS = 300_000;
const MIN_SYNC_GAP_MS = 5_000;

export function useLabStatus() {
  return useContext(LabStatusContext);
}

/**
 * Keeps the open/closed state in sync with the server. The first paint uses the
 * server-rendered status, then the client re-reads `/api/lab-status` and stores
 * the difference between the server clock and the device clock, so the ticking
 * countdown stays correct even when the visitor's own clock is wrong.
 */
export function LabStatusProvider({
  children,
  initialStatus,
}: {
  children: ReactNode;
  initialStatus: LabStatus;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [tehranNowMs, setTehranNowMs] = useState(initialStatus.nowMs);
  const clockOffsetRef = useRef(0);
  const lastSyncAtRef = useRef(0);
  const statusRef = useRef(initialStatus);

  const sync = useCallback(async () => {
    const startedAt = Date.now();
    if (startedAt - lastSyncAtRef.current < MIN_SYNC_GAP_MS) return;
    lastSyncAtRef.current = startedAt;

    try {
      const response = await fetch("/api/lab-status", { cache: "no-store" });
      if (!response.ok) return;

      const next = (await response.json()) as LabStatus;
      if (typeof next?.nowMs !== "number") return;

      // The round trip is split evenly so the offset is not biased by latency.
      const latency = (Date.now() - startedAt) / 2;
      clockOffsetRef.current = next.nowMs + latency - Date.now();
      setStatus(next);
      setTehranNowMs(Date.now() + clockOffsetRef.current);
    } catch {
      // The server-rendered status stays on screen when a refresh fails.
    }
  }, []);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void sync();
    };
    const firstSyncTimer = window.setTimeout(() => void sync(), 0);
    const refreshTimer = window.setInterval(() => void sync(), SYNC_INTERVAL_MS);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(refreshTimer);
      window.clearTimeout(firstSyncTimer);
    };
  }, [sync]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = Date.now() + clockOffsetRef.current;
      setTehranNowMs(current);

      // The state has just flipped, so the next boundary is read from the server.
      const changesAtMs = statusRef.current.changesAtMs;
      if (changesAtMs !== null && current >= changesAtMs) void sync();
    }, 1_000);

    return () => window.clearInterval(timer);
  }, [sync]);

  const value = useMemo<LabStatusValue>(
    () => ({
      remainingMs:
        status.changesAtMs === null
          ? null
          : Math.max(0, status.changesAtMs - tehranNowMs),
      status,
      tehranNowMs,
    }),
    [status, tehranNowMs],
  );

  return (
    <LabStatusContext.Provider value={value}>
      {children}
    </LabStatusContext.Provider>
  );
}
