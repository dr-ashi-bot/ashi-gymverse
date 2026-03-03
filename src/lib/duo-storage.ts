/** Duolingo-style: hearts, streak, daily goal */

const HEARTS_KEY = "ashi-duo-hearts";
const STREAK_DATE_KEY = "ashi-duo-last-date";
const STREAK_COUNT_KEY = "ashi-duo-streak";
const DAILY_GOAL_DATE_KEY = "ashi-duo-goal-date";
const DAILY_GOAL_COUNT_KEY = "ashi-duo-goal-count";

const MAX_HEARTS = 5;
const DAILY_GOAL_TARGET = 5;

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function getStoredHearts(): number {
  if (typeof window === "undefined") return MAX_HEARTS;
  try {
    const v = localStorage.getItem(HEARTS_KEY);
    if (v == null) return MAX_HEARTS;
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n >= 0 && n <= MAX_HEARTS ? n : MAX_HEARTS;
  } catch {
    return MAX_HEARTS;
  }
}

export function getHearts(): number {
  return getStoredHearts();
}

export function setHearts(n: number): void {
  if (typeof window === "undefined") return;
  const v = Math.max(0, Math.min(MAX_HEARTS, Math.floor(n)));
  localStorage.setItem(HEARTS_KEY, String(v));
}

export function loseHeart(): void {
  const h = getStoredHearts();
  setHearts(h - 1);
}

export function refillHearts(): void {
  setHearts(MAX_HEARTS);
}

export function getStreak(): number {
  if (typeof window === "undefined") return 0;
  try {
    const last = localStorage.getItem(STREAK_DATE_KEY);
    const count = parseInt(localStorage.getItem(STREAK_COUNT_KEY) ?? "0", 10);
    const today = todayStr();
    if (!last) return 0;
    const lastDate = new Date(last + "T12:00:00");
    const todayDate = new Date(today + "T12:00:00");
    const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / 86400000);
    if (diffDays === 0) return count;
    if (diffDays === 1) return count;
    return 0;
  } catch {
    return 0;
  }
}

export function recordPracticeDay(): void {
  if (typeof window === "undefined") return;
  const today = todayStr();
  const last = localStorage.getItem(STREAK_DATE_KEY);
  const raw = parseInt(localStorage.getItem(STREAK_COUNT_KEY) ?? "0", 10);
  const count = Number.isFinite(raw) ? raw : 0;
  const lastDate = last ? new Date(last + "T12:00:00") : null;
  const todayDate = new Date(today + "T12:00:00");
  const diffDays = lastDate
    ? Math.round((todayDate.getTime() - lastDate.getTime()) / 86400000)
    : 1;

  if (diffDays === 0) return;
  if (diffDays === 1) {
    localStorage.setItem(STREAK_DATE_KEY, today);
    localStorage.setItem(STREAK_COUNT_KEY, String(count + 1));
  } else {
    localStorage.setItem(STREAK_DATE_KEY, today);
    localStorage.setItem(STREAK_COUNT_KEY, "1");
  }
}

export function getDailyGoal(): { done: number; target: number } {
  if (typeof window === "undefined") return { done: 0, target: DAILY_GOAL_TARGET };
  try {
    const date = localStorage.getItem(DAILY_GOAL_DATE_KEY);
    const today = todayStr();
    if (date !== today) return { done: 0, target: DAILY_GOAL_TARGET };
    const done = parseInt(localStorage.getItem(DAILY_GOAL_COUNT_KEY) ?? "0", 10);
    return { done: Math.max(0, done), target: DAILY_GOAL_TARGET };
  } catch {
    return { done: 0, target: DAILY_GOAL_TARGET };
  }
}

export function incrementDailyGoal(): void {
  if (typeof window === "undefined") return;
  const today = todayStr();
  const date = localStorage.getItem(DAILY_GOAL_DATE_KEY);
  if (date !== today) {
    localStorage.setItem(DAILY_GOAL_DATE_KEY, today);
    localStorage.setItem(DAILY_GOAL_COUNT_KEY, "1");
  } else {
    const raw = parseInt(localStorage.getItem(DAILY_GOAL_COUNT_KEY) ?? "0", 10);
    const n = Number.isFinite(raw) ? raw : 0;
    localStorage.setItem(DAILY_GOAL_COUNT_KEY, String(n + 1));
  }
}

export const DAILY_GOAL_TARGET_NUM = DAILY_GOAL_TARGET;
