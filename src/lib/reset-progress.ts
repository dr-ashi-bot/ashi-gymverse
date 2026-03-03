/**
 * Clears all local progress: points, hearts, streak, daily goal,
 * session history, concepts to revise, notes, and session timer.
 * Safe to call from client only (uses window).
 */
export function resetAllProgress(): void {
  if (typeof window === "undefined") return;

  const keys = [
    "ashi-gymverse-points",
    "ashi-gymverse-max-points-ever",
    "ashi-gymverse-session-history",
    "ashi-gymverse-concepts-to-revise",
    "ashi-gymverse-notes",
    "ashi-duo-hearts",
    "ashi-duo-last-date",
    "ashi-duo-streak",
    "ashi-duo-goal-date",
    "ashi-duo-goal-count",
  ];

  keys.forEach((key) => localStorage.removeItem(key));

  const sessionKeys = [
    "ashi-gymverse-session-ends",
    "ashi-gymverse-break-ends",
  ];
  sessionKeys.forEach((key) => sessionStorage.removeItem(key));
}
