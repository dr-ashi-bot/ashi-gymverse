"use client";

import { useState, useEffect } from "react";
import { getNote, saveNote } from "@/lib/notes";

export interface QuestionData {
  question: string;
  options: string[];
  correct_answer: string;
  hint: string;
  explanation: string;
  difficulty?: string;
}

interface QuestionCardProps {
  data: QuestionData;
  selectedOption: string | null;
  hint: string | null;
  isChecking: boolean;
  wrongAttemptCount: number;
  pointsForQuestion: number;
  currentPoints: number;
  revealed: boolean;
  onSelectOption: (option: string) => void;
  onReveal: () => void;
  onOpenReviewNotes: () => void;
}

export default function QuestionCard({
  data,
  selectedOption,
  hint,
  isChecking,
  wrongAttemptCount,
  pointsForQuestion,
  currentPoints,
  revealed,
  onSelectOption,
  onReveal,
  onOpenReviewNotes,
}: QuestionCardProps) {
  const [hintVisible, setHintVisible] = useState(false);
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [askInput, setAskInput] = useState("");
  const [askAnswer, setAskAnswer] = useState<string | null>(null);
  const [askLoading, setAskLoading] = useState(false);

  useEffect(() => {
    setHintVisible(false);
    setAskAnswer(null);
    setAskInput("");
    const n = getNote(data.question);
    setNote(n?.note ?? "");
    setNoteSaved(false);
  }, [data.question]);

  const canRevealFullAnswer =
    !revealed &&
    !isChecking &&
    pointsForQuestion > 0 &&
    currentPoints >= pointsForQuestion &&
    wrongAttemptCount >= 1;

  const showHintAlways = data.hint && !revealed;

  const handleSaveNote = () => {
    saveNote(data.question, note);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleAsk = async () => {
    if (!askInput.trim() || askLoading) return;
    setAskLoading(true);
    setAskAnswer(null);
    try {
      const res = await fetch("/api/ask-about-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: data.question,
          user_question: askInput.trim(),
          options: data.options,
        }),
      });
      const json = await res.json();
      if (res.ok && json.answer) setAskAnswer(json.answer);
      else setAskAnswer("Could not get an answer. Try rephrasing.");
    } catch {
      setAskAnswer("Something went wrong. Try again.");
    } finally {
      setAskLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-amber-700/40 bg-gradient-to-b from-amber-50 to-rose-50/50 p-6 shadow-xl">
      {data.difficulty && (
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-amber-700">
          {data.difficulty} · Worth {pointsForQuestion} pts
        </p>
      )}
      <p className="mb-6 text-center text-lg font-medium leading-snug text-amber-900">
        {data.question}
      </p>

      {/* Always-visible hint */}
      {showHintAlways && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setHintVisible((v) => !v)}
            className="rounded-lg border border-amber-400 bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800"
          >
            {hintVisible ? "Hide hint" : "Show hint"}
          </button>
          {hintVisible && (
            <div className="mt-2 rounded-xl border border-amber-400/60 bg-amber-100/80 px-4 py-3 text-sm text-amber-900">
              💡 {data.hint}
            </div>
          )}
        </div>
      )}

      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        role="group"
        aria-label="Answer options"
      >
        {data.options.map((option) => (
          <button
            key={option}
            type="button"
            disabled={isChecking || revealed}
            onClick={() => onSelectOption(option)}
            className={`flex min-h-[4rem] items-center justify-center rounded-xl border-2 px-6 py-4 text-left font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ${
              revealed && option === data.correct_answer
                ? "border-green-600 bg-green-100"
                : selectedOption === option
                  ? "border-amber-600 bg-amber-200 shadow-md"
                  : "border-amber-300 bg-white hover:border-amber-500 hover:bg-amber-50"
            }`}
          >
            <span className="text-amber-900">{option}</span>
          </button>
        ))}
      </div>

      {/* Hint from check-answer (wrong-answer feedback) */}
      {hint && (
        <div
          className="mt-4 rounded-xl border border-amber-400/60 bg-amber-100/80 px-4 py-3 text-sm text-amber-900"
          role="status"
        >
          <span className="font-medium">💡 Hint: </span>
          {hint}
        </div>
      )}

      {revealed && (
        <div className="mt-4 rounded-xl border border-green-400/60 bg-green-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium text-green-800">✓ Answer: {data.correct_answer}</p>
          <p className="mt-2 text-amber-900">{data.explanation}</p>
        </div>
      )}

      {/* Full answer after first try */}
      {canRevealFullAnswer && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onReveal}
            className="rounded-xl border-2 border-amber-600 bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            Show answer & explanation (−{pointsForQuestion} pts)
          </button>
        </div>
      )}

      {/* Ask about this question */}
      <div className="mt-4 rounded-xl border border-amber-200 bg-white/80 p-4">
        <p className="mb-2 text-sm font-semibold text-amber-800">Ask about this question</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={askInput}
            onChange={(e) => setAskInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="e.g. What does this word mean?"
            className="flex-1 rounded-lg border border-amber-300 px-3 py-2 text-sm"
            disabled={askLoading}
          />
          <button
            type="button"
            onClick={handleAsk}
            disabled={askLoading || !askInput.trim()}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-amber-900 disabled:opacity-50"
          >
            {askLoading ? "…" : "Ask"}
          </button>
        </div>
        {askAnswer && (
          <p className="mt-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-900">
            {askAnswer}
          </p>
        )}
      </div>

      {/* Note for this question */}
      <div className="mt-4 rounded-xl border border-amber-200 bg-white/80 p-4">
        <p className="mb-2 text-sm font-semibold text-amber-800">My note</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Jot down something to remember..."
          className="w-full rounded-lg border border-amber-300 p-2 text-sm"
          rows={2}
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveNote}
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-amber-900"
          >
            Save note
          </button>
          {noteSaved && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </div>

      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={onOpenReviewNotes}
          className="text-sm font-medium text-amber-700 underline hover:no-underline"
        >
          Review my notes
        </button>
      </div>
    </div>
  );
}
