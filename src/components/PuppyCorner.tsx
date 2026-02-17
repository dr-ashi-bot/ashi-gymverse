"use client";

import {
  getUnlockedPuppyCount,
  getPointsToNextPuppy,
  getPointsAtPreviousThreshold,
  PUPPY_POINT_THRESHOLDS,
  PUPPY_NAMES,
} from "@/lib/constants";
import { getMaxPointsEver } from "@/lib/points-storage";

const MAX_PUPPIES = 6;
const PUPPY_EMOJIS = ["🐶", "🦴", "🐕", "🧸", "🐾", "⭐"];

interface PuppyCornerProps {
  totalPoints: number;
}

export default function PuppyCorner({ totalPoints }: PuppyCornerProps) {
  const count = Math.min(
    getUnlockedPuppyCount(Math.max(0, totalPoints)),
    MAX_PUPPIES
  );
  const maxEver = getMaxPointsEver();
  const nextThreshold = getPointsToNextPuppy(totalPoints);
  const prevThreshold = getPointsAtPreviousThreshold(totalPoints);
  const hasNextPuppy = nextThreshold != null;
  const progressToNext = hasNextPuppy
    ? (totalPoints - prevThreshold) / (nextThreshold - prevThreshold)
    : 1;

  return (
    <section
      className="rounded-2xl border-2 border-amber-700/50 bg-gradient-to-b from-amber-50 to-rose-50/70 p-5 shadow-lg"
      aria-label="Ashi's pups"
    >
      <h3 className="text-center text-sm font-bold uppercase tracking-wide text-amber-800">
        🐕 Ashi&apos;s puppy store
      </h3>
      <p className="mt-1 text-center text-xs text-amber-700">
        Pups you&apos;ve ever adopted stay here — earn points to keep them with you
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: MAX_PUPPIES }, (_, i) => {
          const threshold = PUPPY_POINT_THRESHOLDS[i];
          const owned = totalPoints >= threshold;
          const everAcquired = maxEver >= threshold;
          const name = PUPPY_NAMES[i];
          return (
            <div
              key={i}
              className={`rounded-xl border-2 p-3 text-center transition-all ${
                owned
                  ? "border-amber-500 bg-amber-100/90 shadow-md"
                  : everAcquired
                    ? "border-amber-300 bg-amber-50/80 opacity-90"
                    : "border-amber-200 bg-white/60 opacity-70"
              }`}
            >
              <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-3xl ${
                  owned ? "bg-amber-200" : everAcquired ? "bg-amber-100" : "bg-amber-100"
                }`}
              >
                {everAcquired ? PUPPY_EMOJIS[i] : "🐾"}
              </div>
              <p
                className={`mt-1.5 font-semibold ${
                  owned ? "text-amber-900" : everAcquired ? "text-amber-700" : "text-amber-600"
                }`}
              >
                {name}
              </p>
              <p className="text-xs text-amber-600">
                {owned ? "✓ with you" : everAcquired ? `earn ${threshold} to keep` : `${threshold} pts`}
              </p>
            </div>
          );
        })}
      </div>

      {/* Progress to next puppy */}
      {hasNextPuppy && (
        <div className="mt-4">
          <p className="mb-1 text-center text-xs font-medium text-amber-800">
            Next pup ({PUPPY_NAMES[count]}) at {nextThreshold} pts
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-amber-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-400 transition-all duration-500"
              style={{ width: `${Math.min(100, progressToNext * 100)}%` }}
              role="progressbar"
              aria-valuenow={Math.round(progressToNext * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progress to ${PUPPY_NAMES[count]}`}
            />
          </div>
          <p className="mt-1 text-center text-xs text-amber-700">
            {totalPoints} / {nextThreshold} pts
          </p>
        </div>
      )}

      {!hasNextPuppy && (
        <p className="mt-3 text-center text-sm font-medium text-amber-800">
          🎉 All six pups are yours! Keep points up so they stay.
        </p>
      )}

      <p className="mt-3 text-center text-sm font-bold text-amber-900">
        {totalPoints} pts
      </p>
    </section>
  );
}
