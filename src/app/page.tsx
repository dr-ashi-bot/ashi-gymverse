"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import SessionTimer from "@/components/SessionTimer";
import QuestionCard from "@/components/QuestionCard";
import type { QuestionData } from "@/components/QuestionCard";
import ConfettiTrigger from "@/components/ConfettiTrigger";
import PuppyCorner from "@/components/PuppyCorner";
import {
  TOPICS,
  DEFAULT_TOPIC_ID,
  type TopicId,
  getPointsForDifficulty,
} from "@/lib/constants";
import { getStoredPoints, setStoredPoints } from "@/lib/points-storage";
import { saveSessionToHistory, addConceptToRevise } from "@/lib/session-storage";
import ReviewNotesModal from "@/components/ReviewNotesModal";

const DEFAULT_USER_ID = "demo-user";

export default function Home() {
  const [topicId, setTopicId] = useState<TopicId>(DEFAULT_TOPIC_ID);
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wrongAttemptCount, setWrongAttemptCount] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [points, setPoints] = useState(0);
  const [reviewNotesOpen, setReviewNotesOpen] = useState(false);

  const fetchPoints = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/points?user_id=${encodeURIComponent(DEFAULT_USER_ID)}`
      );
      const data = await res.json();
      if (typeof data.points === "number" && data.points >= 0) {
        setPoints(data.points);
        setStoredPoints(data.points);
      }
    } catch {
      const stored = getStoredPoints();
      setPoints(stored);
    }
  }, []);

  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedOption(null);
    setHint(null);
    setIsCorrect(null);
    setWrongAttemptCount(0);
    setRevealed(false);
    try {
      const res = await fetch(
        `/api/generate-question?user_id=${encodeURIComponent(DEFAULT_USER_ID)}&current_topic=${encodeURIComponent(topicId)}`
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed: ${res.status}`);
      }
      const data = (await res.json()) as QuestionData;
      setQuestion(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load question");
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    const stored = getStoredPoints();
    setPoints(stored);
    fetchPoints();
  }, [fetchPoints]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleSelectOption = useCallback(
    async (option: string) => {
      if (!question || isChecking || revealed) return;
      setSelectedOption(option);
      setIsChecking(true);
      setHint(null);
      setError(null);
      try {
        const res = await fetch("/api/check-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: DEFAULT_USER_ID,
            current_topic: topicId,
            user_answer: option,
            correct_answer: question.correct_answer,
            question: question.question,
            explanation: question.explanation,
            difficulty: question.difficulty ?? "medium",
            is_second_wrong: wrongAttemptCount === 1,
            action: "check",
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Something went wrong");
          setIsCorrect(false);
          setIsChecking(false);
          return;
        }
        if (data.correct) {
          setIsCorrect(true);
          const next =
            typeof data.total_points === "number"
              ? data.total_points
              : typeof data.points_delta === "number"
                ? points + data.points_delta
                : points;
          setPoints(next);
          setStoredPoints(next);
          setTimeout(() => fetchQuestion(), 1200);
          setTimeout(() => fetchPoints(), 500);
        } else {
          setHint(data.hint ?? "Not quite! Try again.");
          setIsCorrect(false);
          setWrongAttemptCount((c) => c + 1);
          const topicLabel = TOPICS.find((t) => t.id === topicId)?.label ?? topicId;
          addConceptToRevise({
            topicId,
            topicLabel,
            questionPreview: question.question.slice(0, 80) + (question.question.length > 80 ? "…" : ""),
            hint: data.hint ?? "Review this concept.",
          });
          const next =
            typeof data.total_points === "number"
              ? data.total_points
              : typeof data.points_delta === "number"
                ? Math.max(0, points + data.points_delta)
                : points;
          setPoints(next);
          setStoredPoints(next);
        }
      } catch (e) {
        setError("Could not check answer. Try again.");
        setIsCorrect(false);
      } finally {
        setIsChecking(false);
      }
    },
    [question, topicId, wrongAttemptCount, isChecking, revealed, points, fetchQuestion, fetchPoints]
  );

  const handleReveal = useCallback(async () => {
    if (!question || isChecking || revealed) return;
    const pts = getPointsForDifficulty(question.difficulty ?? "medium");
    if (points < pts) return;
    setIsChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/check-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: DEFAULT_USER_ID,
          current_topic: topicId,
          correct_answer: question.correct_answer,
          question: question.question,
          explanation: question.explanation,
          difficulty: question.difficulty ?? "medium",
          action: "reveal",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setIsChecking(false);
        return;
      }
      setRevealed(true);
      const next =
        typeof data.total_points === "number"
          ? data.total_points
          : typeof data.points_delta === "number"
            ? Math.max(0, points + data.points_delta)
            : points;
      setPoints(next);
      setStoredPoints(next);
      setTimeout(() => {
        fetchQuestion();
        fetchPoints();
      }, 3000);
    } catch (e) {
      setError("Could not reveal answer. Try again.");
    } finally {
      setIsChecking(false);
    }
  }, [question, topicId, points, isChecking, revealed, fetchQuestion, fetchPoints]);

  const pointsForQuestion = question
    ? getPointsForDifficulty(question.difficulty ?? "medium")
    : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-100 via-amber-50/95 to-rose-100/90">
      <header className="border-b-2 border-amber-600/30 bg-gradient-to-r from-amber-100 to-rose-100/80 py-5 shadow-md">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-amber-900 drop-shadow-sm">
              Ashi Gymverse 🤸‍♀️
            </h1>
            <Link
              href="/dashboard"
              className="rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm ring-1 ring-amber-300 hover:bg-amber-50"
            >
              My progress
            </Link>
          </div>
          <div className="mt-4">
            <SessionTimer onStartNewSession={() => saveSessionToHistory(points)} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6">
        <section className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-amber-900">
            Topic
          </label>
          <select
            value={topicId}
            onChange={(e) => setTopicId(e.target.value as TopicId)}
            className="w-full rounded-xl border-2 border-amber-300 bg-white px-4 py-2 text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label="Select topic"
          >
            {TOPICS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </section>

        <section className="mb-6">
          <PuppyCorner totalPoints={points} />
        </section>

        <section
          className="rounded-3xl border-2 border-amber-600/40 bg-white/70 p-6 shadow-xl shadow-amber-200/30"
          aria-label="Gym floor"
        >
          {loading && !question && (
            <div className="flex min-h-[280px] items-center justify-center">
              <p className="text-lg text-amber-800">Loading your question…</p>
            </div>
          )}
          {error && !question && (
            <div className="rounded-xl bg-rose-100 p-4 text-center text-rose-800">
              <p>{error}</p>
              <button
                type="button"
                onClick={fetchQuestion}
                className="mt-2 rounded-lg bg-rose-200 px-4 py-2 font-medium hover:bg-rose-300"
              >
                Try again
              </button>
            </div>
          )}
          {error && question && (
            <div className="mb-4 rounded-xl bg-rose-100 p-3 text-center text-sm text-rose-800">
              {error}
            </div>
          )}
          {question && (
            <QuestionCard
              data={question}
              selectedOption={selectedOption}
              hint={hint}
              isChecking={isChecking}
              wrongAttemptCount={wrongAttemptCount}
              pointsForQuestion={pointsForQuestion}
              currentPoints={points}
              revealed={revealed}
              onSelectOption={handleSelectOption}
              onReveal={handleReveal}
              onOpenReviewNotes={() => setReviewNotesOpen(true)}
            />
          )}
        </section>
      </div>

      <ReviewNotesModal
        open={reviewNotesOpen}
        onClose={() => setReviewNotesOpen(false)}
      />
      <ConfettiTrigger isCorrect={isCorrect} />
    </main>
  );
}
