"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SessionTimer from "@/components/SessionTimer";
import QuestionCard from "@/components/QuestionCard";
import type { QuestionData } from "@/components/QuestionCard";
import ConfettiTrigger from "@/components/ConfettiTrigger";
import PuppyCorner from "@/components/PuppyCorner";
import DuoHeader from "@/components/DuoHeader";
import {
  TOPICS,
  DEFAULT_TOPIC_ID,
  type TopicId,
  getPointsForDifficulty,
} from "@/lib/constants";
import { getStoredPoints, setStoredPoints } from "@/lib/points-storage";
import {
  saveSessionToHistory,
  addConceptToRevise,
} from "@/lib/session-storage";
import {
  getHearts,
  loseHeart,
  refillHearts,
  getStreak,
  recordPracticeDay,
  getDailyGoal,
  incrementDailyGoal,
} from "@/lib/duo-storage";
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
  const [hearts, setHeartsState] = useState(() => getHearts());
  const [streak, setStreakState] = useState(() => getStreak());
  const [dailyGoal, setDailyGoalState] = useState(() => getDailyGoal());
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach(clearTimeout);
      timeoutIdsRef.current = [];
    };
  }, []);

  const refreshDuoState = useCallback(() => {
    setHeartsState(getHearts());
    setStreakState(getStreak());
    setDailyGoalState(getDailyGoal());
  }, []);

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
    refreshDuoState();
  }, [fetchPoints, refreshDuoState]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleSelectOption = useCallback(
    async (option: string) => {
      if (!question || isChecking || revealed || hearts <= 0) return;
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
          recordPracticeDay();
          incrementDailyGoal();
          const next =
            typeof data.total_points === "number"
              ? data.total_points
              : typeof data.points_delta === "number"
                ? points + data.points_delta
                : points;
          setPoints(next);
          setStoredPoints(next);
          refreshDuoState();
          const t1 = setTimeout(() => fetchQuestion(), 1200);
          const t2 = setTimeout(() => fetchPoints(), 500);
          timeoutIdsRef.current.push(t1, t2);
        } else {
          loseHeart();
          refreshDuoState();
          setHint(data.hint ?? "Not quite! Try again.");
          setIsCorrect(false);
          setWrongAttemptCount((c) => c + 1);
          const topicLabel =
            TOPICS.find((t) => t.id === topicId)?.label ?? topicId;
          addConceptToRevise({
            topicId,
            topicLabel,
            questionPreview:
              question.question.slice(0, 80) +
              (question.question.length > 80 ? "…" : ""),
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
    [
      question,
      topicId,
      wrongAttemptCount,
      isChecking,
      revealed,
      points,
      hearts,
      fetchQuestion,
      fetchPoints,
      refreshDuoState,
    ]
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
      const t = setTimeout(() => {
        fetchQuestion();
        fetchPoints();
      }, 3000);
      timeoutIdsRef.current.push(t);
    } catch (e) {
      setError("Could not reveal answer. Try again.");
    } finally {
      setIsChecking(false);
    }
  }, [question, topicId, points, isChecking, revealed, fetchQuestion, fetchPoints]);

  const handleStartNewSession = useCallback(() => {
    refillHearts();
    refreshDuoState();
    saveSessionToHistory(points);
  }, [points, refreshDuoState]);

  const pointsForQuestion = question
    ? getPointsForDifficulty(question.difficulty ?? "medium")
    : 0;

  return (
    <main className="min-h-screen bg-duo-gray-bg">
      <DuoHeader
        hearts={hearts}
        streak={streak}
        xp={points}
        dailyGoalDone={dailyGoal.done}
        dailyGoalTarget={dailyGoal.target}
      />

      <div className="border-b border-duo-gray/10 bg-white px-4 py-3">
        <SessionTimer onStartNewSession={handleStartNewSession} />
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        <section className="mb-4">
          <label className="mb-1.5 block text-sm font-bold text-duo-gray">
            Choose a skill
          </label>
          <select
            value={topicId}
            onChange={(e) => setTopicId(e.target.value as TopicId)}
            className="w-full rounded-2xl border-2 border-duo-gray/20 bg-white px-4 py-3 text-duo-gray focus:border-duo-green focus:outline-none focus:ring-2 focus:ring-duo-green/30"
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
          className="overflow-hidden rounded-3xl border-2 border-duo-gray/10 bg-white p-6 shadow-lg"
          aria-label="Question"
        >
          {hearts <= 0 && (
            <div className="mb-4 rounded-2xl bg-duo-red/10 p-4 text-center">
              <p className="font-bold text-duo-red">Out of hearts!</p>
              <p className="mt-1 text-sm text-duo-gray">
                Take a break or start a new session to refill.
              </p>
            </div>
          )}
          {loading && !question && (
            <div className="flex min-h-[280px] items-center justify-center">
              <p className="text-duo-gray">Loading…</p>
            </div>
          )}
          {error && !question && (
            <div
              className="rounded-2xl bg-duo-red/10 p-4 text-center text-duo-red"
              role="alert"
            >
              <p>{error}</p>
              <button
                type="button"
                onClick={fetchQuestion}
                className="mt-2 rounded-2xl bg-duo-red px-4 py-2 font-bold text-white hover:bg-duo-red-hover"
              >
                Try again
              </button>
            </div>
          )}
          {error && question && (
            <div
              className="mb-4 rounded-2xl bg-duo-red/10 p-3 text-center text-sm text-duo-red"
              role="alert"
            >
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
              heartsLeft={hearts}
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
