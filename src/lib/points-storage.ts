const STORAGE_KEY = "ashi-gymverse-points";
const MAX_POINTS_KEY = "ashi-gymverse-max-points-ever";

export function getStoredPoints(): number {
  if (typeof window === "undefined") return 0;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v == null) return 0;
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function setStoredPoints(points: number): void {
  if (typeof window === "undefined") return;
  try {
    const n = Math.max(0, Math.floor(points));
    localStorage.setItem(STORAGE_KEY, String(n));
    const max = getMaxPointsEver();
    if (n > max) localStorage.setItem(MAX_POINTS_KEY, String(n));
  } catch {
    // ignore
  }
}

export function getMaxPointsEver(): number {
  if (typeof window === "undefined") return 0;
  try {
    const v = localStorage.getItem(MAX_POINTS_KEY);
    if (v == null) return 0;
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}
