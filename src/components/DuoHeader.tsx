"use client";

import Link from "next/link";

interface DuoHeaderProps {
  hearts: number;
  streak: number;
  xp: number;
  dailyGoalDone: number;
  dailyGoalTarget: number;
}

export default function DuoHeader({
  hearts,
  streak,
  xp,
  dailyGoalDone,
  dailyGoalTarget,
}: DuoHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b-2 border-duo-green/20 bg-white px-4 py-3 shadow-sm">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-2xl" aria-hidden>🤸‍♀️</span>
        <span className="text-xl font-extrabold text-duo-gray">Ashi</span>
      </Link>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Hearts */}
        <div
          className="flex items-center gap-0.5"
          title="Hearts"
          aria-label={`${hearts} of 5 hearts`}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`text-2xl ${i <= hearts ? "opacity-100" : "opacity-25 grayscale"}`}
              aria-hidden
            >
              ❤️
            </span>
          ))}
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div
            className="flex items-center gap-1 rounded-full bg-duo-orange px-2.5 py-1"
            aria-label={`${streak}-day streak`}
          >
            <span className="text-lg" aria-hidden>🔥</span>
            <span className="text-sm font-bold text-white">{streak}</span>
          </div>
        )}

        {/* XP */}
        <div
          className="flex items-center gap-1 rounded-full bg-duo-blue px-2.5 py-1"
          aria-label={`${xp} XP`}
        >
          <span className="text-sm font-bold text-white">{xp}</span>
          <span className="text-xs font-medium text-white/90">XP</span>
        </div>

        {/* Daily goal */}
        <div className="hidden items-center gap-1.5 sm:flex">
          <div className="h-2 w-12 overflow-hidden rounded-full bg-duo-gray/20">
            <div
              className="h-full rounded-full bg-duo-green transition-all"
              style={{
                width: `${Math.min(100, (dailyGoalDone / dailyGoalTarget) * 100)}%`,
              }}
            />
          </div>
          <span className="text-xs font-medium text-duo-gray">
            {dailyGoalDone}/{dailyGoalTarget}
          </span>
        </div>

        <Link
          href="/dashboard"
          className="rounded-full bg-duo-gray-bg px-3 py-1.5 text-sm font-bold text-duo-gray hover:bg-duo-gray/10"
        >
          Profile
        </Link>
      </div>
    </header>
  );
}
