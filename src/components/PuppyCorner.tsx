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
      className="rounded-3xl border-2 border-duo-gray/10 bg-white p-5 shadow-lg"
      aria-label="Ashi's pups"
    >
      <h3 className="text-center text-base font-extrabold text-duo-gray">
        🐕 Puppy store
      </h3>
      <p className="mt-1 text-center text-xs text-duo-gray-light">
        Adopt pups with XP — they stay in your store
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
              className={`rounded-2xl border-2 p-3 text-center transition-all ${
                owned
                  ? "border-duo-green bg-duo-green/10 shadow-md"
                  : everAcquired
                    ? "border-duo-gray/20 bg-duo-gray-bg"
                    : "border-duo-gray/10 bg-duo-gray-bg opacity-70"
              }`}
            >
              <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${
                  owned ? "bg-duo-green/20" : everAcquired ? "bg-white" : "bg-duo-gray/10"
                }`}
              >
                {everAcquired ? PUPPY_EMOJIS[i] : "🐾"}
              </div>
              <p
                className={`mt-1.5 font-bold ${
                  owned ? "text-duo-green" : "text-duo-gray"
                }`}
              >
                {name}
              </p>
              <p className="text-xs text-duo-gray-light">
                {owned ? "✓ with you" : everAcquired ? `${threshold} XP to keep` : `${threshold} XP`}
              </p>
            </div>
          );
        })}
      </div>

      {hasNextPuppy && (
        <div className="mt-4">
          <p className="mb-1 text-center text-xs font-bold text-duo-gray">
            Next: {PUPPY_NAMES[count]} at {nextThreshold} XP
          </p>
          <div className="h-3 w-full overflow-hidden rounded-full bg-duo-gray/10">
            <div
              className="h-full rounded-full bg-duo-green transition-all duration-500"
              style={{
                width: `${Math.max(0, Math.min(100, progressToNext * 100))}%`,
              }}
              role="progressbar"
              aria-valuenow={Math.round(
                Math.max(0, Math.min(100, progressToNext * 100))
              )}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progress to ${PUPPY_NAMES[count]}`}
            />
          </div>
          <p className="mt-1 text-center text-xs text-duo-gray-light">
            {totalPoints} / {nextThreshold} XP
          </p>
        </div>
      )}

      {!hasNextPuppy && (
        <p className="mt-3 text-center text-sm font-bold text-duo-green">
          🎉 All six pups earned!
        </p>
      )}
    </section>
  );
}
