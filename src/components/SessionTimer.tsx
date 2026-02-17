"use client";

import { useEffect, useState } from "react";

const SESSION_SECONDS = 30 * 60; // 30 minutes
const BREAK_SECONDS = 5 * 60; // 5 minutes
const STORAGE_SESSION_ENDS = "ashi-gymverse-session-ends";
const STORAGE_BREAK_ENDS = "ashi-gymverse-break-ends";

type Phase = "session" | "break" | "ready";

interface SessionTimerProps {
  onStartNewSession?: () => void;
}

export default function SessionTimer({ onStartNewSession }: SessionTimerProps) {
  const [phase, setPhase] = useState<Phase>("session");
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (phase === "ready") return;

    const sessionEnds = typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_SESSION_ENDS) : null;
    const breakEnds = typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_BREAK_ENDS) : null;
    const sessionEndTime = sessionEnds ? parseInt(sessionEnds, 10) : null;
    const breakEndTime = breakEnds ? parseInt(breakEnds, 10) : null;

    const now = Date.now();

    if (breakEndTime && now < breakEndTime) {
      setPhase("break");
      setRemainingSeconds(Math.max(0, Math.round((breakEndTime - now) / 1000)));
      const interval = setInterval(() => {
        const left = Math.max(0, Math.round((breakEndTime - Date.now()) / 1000));
        setRemainingSeconds(left);
        if (left <= 0) {
          setPhase("ready");
          sessionStorage.removeItem(STORAGE_BREAK_ENDS);
          sessionStorage.removeItem(STORAGE_SESSION_ENDS);
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }

    if (breakEndTime && now >= breakEndTime) {
      setPhase("ready");
      setRemainingSeconds(0);
      sessionStorage.removeItem(STORAGE_BREAK_ENDS);
      sessionStorage.removeItem(STORAGE_SESSION_ENDS);
      return;
    }

    if (sessionEndTime && now >= sessionEndTime) {
      const breakEndsAt = now + BREAK_SECONDS * 1000;
      sessionStorage.setItem(STORAGE_BREAK_ENDS, String(breakEndsAt));
      setPhase("break");
      setRemainingSeconds(BREAK_SECONDS);
      const interval = setInterval(() => {
        const left = Math.max(0, Math.round((breakEndsAt - Date.now()) / 1000));
        setRemainingSeconds(left);
        if (left <= 0) {
          setPhase("ready");
          sessionStorage.removeItem(STORAGE_BREAK_ENDS);
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }

    const endTime = sessionEndTime ?? now + SESSION_SECONDS * 1000;
    if (!sessionEndTime) sessionStorage.setItem(STORAGE_SESSION_ENDS, String(endTime));

    setRemainingSeconds(Math.max(0, Math.round((endTime - Date.now()) / 1000)));
    const interval = setInterval(() => {
      const left = Math.max(0, Math.round((endTime - Date.now()) / 1000));
      setRemainingSeconds(left);
      if (left <= 0) {
        const breakEndsAt = Date.now() + BREAK_SECONDS * 1000;
        sessionStorage.setItem(STORAGE_BREAK_ENDS, String(breakEndsAt));
        setPhase("break");
        setRemainingSeconds(BREAK_SECONDS);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [phase === "ready" ? "ready" : "running"]);

  const startNewSession = () => {
    onStartNewSession?.();
    const endTime = Date.now() + SESSION_SECONDS * 1000;
    sessionStorage.setItem(STORAGE_SESSION_ENDS, String(endTime));
    sessionStorage.removeItem(STORAGE_BREAK_ENDS);
    setPhase("session");
    setRemainingSeconds(SESSION_SECONDS);
  };

  if (phase === "ready") {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-amber-950/95 px-6"
        role="alert"
        aria-live="polite"
      >
        <div className="rounded-2xl bg-amber-100 p-8 text-center shadow-2xl max-w-md">
          <span className="text-5xl" aria-hidden>🤸‍♀️</span>
          <h2 className="mt-4 text-2xl font-bold text-amber-900">Break over!</h2>
          <p className="mt-2 text-amber-800">
            Ready for another 30-minute session? Tap below to start.
          </p>
          <button
            type="button"
            onClick={startNewSession}
            className="mt-6 rounded-xl bg-amber-500 px-6 py-3 font-bold text-amber-900 shadow-lg hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-700"
          >
            Start new session
          </button>
        </div>
      </div>
    );
  }

  if (phase === "break") {
    const m = Math.floor((remainingSeconds ?? 0) / 60);
    const s = (remainingSeconds ?? 0) % 60;
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-amber-950/95 px-6"
        role="alert"
        aria-live="polite"
      >
        <div className="rounded-2xl bg-amber-100 p-8 text-center shadow-2xl max-w-md">
          <span className="text-5xl" aria-hidden>☕</span>
          <h2 className="mt-4 text-2xl font-bold text-amber-900">Session over!</h2>
          <p className="mt-2 text-amber-800">
            Take a 5-minute break. You can start a new session when the timer ends.
          </p>
          <p className="mt-4 text-3xl font-mono font-bold text-amber-900">
            {m}:{String(s).padStart(2, "0")}
          </p>
        </div>
      </div>
    );
  }

  const progress =
    remainingSeconds !== null
      ? ((SESSION_SECONDS - remainingSeconds) / SESSION_SECONDS) * 100
      : 0;

  return (
    <div className="w-full px-4">
      <div
        className="h-4 w-full overflow-hidden rounded-full bg-amber-200 shadow-inner"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Session time remaining (balance beam)"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1 text-center text-sm font-medium text-amber-900">
        Balance Beam · {remainingSeconds !== null ? `${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, "0")} left` : "—"}
      </p>
    </div>
  );
}
