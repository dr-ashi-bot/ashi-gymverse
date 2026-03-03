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
    <main className="min-h-screen bg-duo-gray-bg">
      <header className="sticky top-0 z-40 border-b-2 border-duo-green/20 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <h1 className="text-xl font-extrabold text-duo-gray">Ashi 🤸‍♀️</h1>
          <Link
            href="/"
            className="rounded-2xl bg-duo-green px-5 py-2.5 font-bold text-white hover:bg-duo-green-hover"
          >
            Practice
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <h2 className="mb-6 text-2xl font-extrabold text-duo-gray">My progress</h2>

        <section className="mb-8 rounded-3xl border-2 border-duo-gray/10 bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-bold text-duo-gray">Stats</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-duo-blue/10 p-4 text-center">
              <p className="text-3xl font-extrabold text-duo-blue">{points}</p>
              <p className="text-sm font-bold text-duo-gray-light">XP</p>
            </div>
            <div className="rounded-2xl bg-duo-green/10 p-4 text-center">
              <p className="text-3xl font-extrabold text-duo-green">{pupsNow}</p>
              <p className="text-sm font-bold text-duo-gray-light">Pups with you</p>
            </div>
            <div className="rounded-2xl bg-duo-orange/10 p-4 text-center">
              <p className="text-3xl font-extrabold text-duo-orange">
                {getUnlockedPuppyCount(maxEver)}
              </p>
              <p className="text-sm font-bold text-duo-gray-light">Pups earned</p>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-3xl border-2 border-duo-gray/10 bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-bold text-duo-gray">Previous sessions</h3>
          {sessions.length === 0 ? (
            <p className="text-duo-gray-light">
              Tap &quot;Start new session&quot; after a break to see history here.
            </p>
          ) : (
            <ul className="space-y-3">
              {sessions.slice(0, 15).map((s, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-2xl bg-duo-gray-bg px-4 py-3"
                >
                  <span className="text-sm text-duo-gray">
                    {new Date(s.date).toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })}
                  </span>
                  <span className="font-bold text-duo-gray">
                    {s.points} XP · {s.pups} pups
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border-2 border-duo-gray/10 bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-bold text-duo-gray">Key concepts to revise</h3>
          <p className="mb-4 text-sm text-duo-gray-light">
            From questions you got wrong. Review and try again.
          </p>
          {concepts.length === 0 ? (
            <p className="text-duo-gray-light">No concepts to revise yet. Keep practicing!</p>
          ) : (
            <ul className="space-y-4">
              {concepts.map((c, i) => (
                <li
                  key={i}
                  className="rounded-2xl border-2 border-duo-gray/10 bg-duo-gray-bg p-4"
                >
                  <p className="text-xs font-bold text-duo-gray-light">{c.topicLabel}</p>
                  <p className="mt-1 text-sm font-bold text-duo-gray">
                    {c.questionPreview}
                  </p>
                  <p className="mt-2 text-sm text-duo-gray">💡 {c.hint}</p>
                  <button
                    type="button"
                    onClick={() => handleDismiss(i)}
                    className="mt-2 text-xs font-bold text-duo-blue underline hover:no-underline"
                  >
                    Dismiss
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="mt-12 pb-8 text-center">
          <Link
            href="/admin"
            className="text-xs font-bold text-duo-gray-light underline hover:text-duo-gray hover:no-underline"
          >
            Admin
          </Link>
        </footer>
      </div>
    </main>
  );
}
