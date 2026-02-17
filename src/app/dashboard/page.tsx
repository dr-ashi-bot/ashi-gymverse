"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStoredPoints, getMaxPointsEver } from "@/lib/points-storage";
import {
  getSessionHistory,
  getConceptsToRevise,
  removeConceptToRevise,
  type SessionRecord,
  type ConceptToRevise,
} from "@/lib/session-storage";
import { getUnlockedPuppyCount } from "@/lib/constants";

export default function DashboardPage() {
  const [points, setPoints] = useState(0);
  const [maxEver, setMaxEver] = useState(0);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [concepts, setConcepts] = useState<ConceptToRevise[]>([]);

  useEffect(() => {
    setPoints(getStoredPoints());
    setMaxEver(getMaxPointsEver());
    setSessions(getSessionHistory());
    setConcepts(getConceptsToRevise());
  }, []);

  const handleDismiss = (index: number) => {
    removeConceptToRevise(index);
    setConcepts(getConceptsToRevise());
  };

  const pupsNow = getUnlockedPuppyCount(points);

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-100/90 to-rose-100/80">
      <header className="border-b border-amber-700/20 bg-amber-50/90 py-4 shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4">
          <h1 className="text-2xl font-bold text-amber-900">Ashi Gymverse 🤸‍♀️</h1>
          <Link
            href="/"
            className="rounded-xl bg-amber-500 px-4 py-2 font-semibold text-amber-900 shadow hover:bg-amber-400"
          >
            Practice
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <h2 className="mb-6 text-xl font-bold text-amber-900">My progress</h2>

        <section className="mb-8 rounded-2xl border-2 border-amber-700/30 bg-white/80 p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-semibold text-amber-800">
            This session
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-amber-100 p-4 text-center">
              <p className="text-3xl font-bold text-amber-900">{points}</p>
              <p className="text-sm text-amber-700">Points</p>
            </div>
            <div className="rounded-xl bg-rose-100 p-4 text-center">
              <p className="text-3xl font-bold text-rose-900">{pupsNow}</p>
              <p className="text-sm text-rose-700">Pups with you</p>
            </div>
            <div className="rounded-xl bg-amber-100 p-4 text-center">
              <p className="text-3xl font-bold text-amber-900">
                {getUnlockedPuppyCount(maxEver)}
              </p>
              <p className="text-sm text-amber-700">Pups ever adopted</p>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border-2 border-amber-700/30 bg-white/80 p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-semibold text-amber-800">
            Previous sessions
          </h3>
          {sessions.length === 0 ? (
            <p className="text-amber-600">
              Complete a session and tap &quot;Start new session&quot; after a break to see history here.
            </p>
          ) : (
            <ul className="space-y-3">
              {sessions.slice(0, 15).map((s, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3"
                >
                  <span className="text-sm text-amber-800">
                    {new Date(s.date).toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })}
                  </span>
                  <span className="font-semibold text-amber-900">
                    {s.points} pts · {s.pups} pups
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border-2 border-amber-700/30 bg-white/80 p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-semibold text-amber-800">
            Key concepts to revise
          </h3>
          <p className="mb-4 text-sm text-amber-700">
            Based on questions you got wrong. Review these and try similar questions again.
          </p>
          {concepts.length === 0 ? (
            <p className="text-amber-600">No concepts to revise yet. Keep practicing!</p>
          ) : (
            <ul className="space-y-4">
              {concepts.map((c, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-amber-200 bg-amber-50/80 p-4"
                >
                  <p className="text-xs font-medium text-amber-600">{c.topicLabel}</p>
                  <p className="mt-1 text-sm font-medium text-amber-900">
                    {c.questionPreview}
                  </p>
                  <p className="mt-2 text-sm text-amber-800">💡 {c.hint}</p>
                  <button
                    type="button"
                    onClick={() => handleDismiss(i)}
                    className="mt-2 text-xs text-amber-600 underline hover:no-underline"
                  >
                    Dismiss
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
