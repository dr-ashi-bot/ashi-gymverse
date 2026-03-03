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
  topic_id?: string;
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
  heartsLeft: number;
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
  heartsLeft,
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

  const disabled = isChecking || revealed || heartsLeft <= 0;

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
    <div className="rounded-3xl bg-white p-6">
      {data.difficulty && (
        <p className="mb-2 text-center text-xs font-bold uppercase tracking-wide text-duo-gray-light">
          {data.difficulty} · +{pointsForQuestion} XP
        </p>
      )}
      <p className="mb-8 text-center text-xl font-bold leading-snug text-duo-gray">
        {data.question}
      </p>

      {showHintAlways && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setHintVisible((v) => !v)}
            className="rounded-2xl border-2 border-duo-gray/20 bg-duo-gray-bg px-4 py-2 text-sm font-bold text-duo-gray hover:border-duo-green hover:bg-duo-green/10"
          >
            {hintVisible ? "Hide hint" : "💡 Hint"}
          </button>
          {hintVisible && (
            <div className="mt-2 rounded-2xl border-2 border-duo-gray/10 bg-duo-gray-bg px-4 py-3 text-sm text-duo-gray">
              {data.hint}
            </div>
          )}
        </div>
      )}

      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        role="group"
        aria-label="Answer options"
      >
        {data.options.map((option) => {
          const isCorrectOption = revealed && option === data.correct_answer;
          const isWrongSelected = revealed && selectedOption === option && option !== data.correct_answer;
          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              onClick={() => onSelectOption(option)}
              className={`flex min-h-[4.5rem] items-center justify-center rounded-2xl border-2 px-6 py-4 text-center font-bold transition-all focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ${
                isCorrectOption
                  ? "border-duo-green bg-duo-green/15 text-duo-green ring-duo-green/30"
                  : isWrongSelected
                    ? "border-duo-red bg-duo-red/10 text-duo-red"
                    : selectedOption === option
                      ? "border-duo-green bg-duo-green text-white ring-duo-green/30"
                      : "border-duo-gray/20 bg-white text-duo-gray hover:border-duo-green hover:bg-duo-green/10"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {hint && (
        <div
          className="mt-4 rounded-2xl border-2 border-duo-orange/30 bg-duo-orange/10 px-4 py-3 text-sm text-duo-gray"
          role="status"
        >
          <span className="font-bold">💡 </span>
          {hint}
        </div>
      )}

      {revealed && (
        <div className="mt-4 rounded-2xl border-2 border-duo-green/30 bg-duo-green/10 px-4 py-3 text-sm text-duo-gray">
          <p className="font-bold text-duo-green">✓ {data.correct_answer}</p>
          <p className="mt-2 text-duo-gray">{data.explanation}</p>
        </div>
      )}

      {canRevealFullAnswer && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onReveal}
            className="rounded-2xl bg-duo-blue px-6 py-3 font-bold text-white hover:bg-duo-blue-hover focus:outline-none focus:ring-4 focus:ring-duo-blue/30"
          >
            Show answer (−{pointsForQuestion} XP)
          </button>
        </div>
      )}

      <div className="mt-6 rounded-2xl border-2 border-duo-gray/10 bg-duo-gray-bg p-4">
        <p className="mb-2 text-sm font-bold text-duo-gray">Ask about this question</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={askInput}
            onChange={(e) => setAskInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="e.g. What does this word mean?"
            className="flex-1 rounded-2xl border-2 border-duo-gray/20 px-4 py-2 text-sm text-duo-gray focus:border-duo-green focus:outline-none"
            disabled={askLoading}
          />
          <button
            type="button"
            onClick={handleAsk}
            disabled={askLoading || !askInput.trim()}
            className="rounded-2xl bg-duo-green px-4 py-2 font-bold text-white hover:bg-duo-green-hover disabled:opacity-50"
          >
            {askLoading ? "…" : "Ask"}
          </button>
        </div>
        {askAnswer && (
          <p className="mt-2 rounded-2xl bg-white p-3 text-sm text-duo-gray">
            {askAnswer}
          </p>
        )}
      </div>

      <div className="mt-4 rounded-2xl border-2 border-duo-gray/10 bg-duo-gray-bg p-4">
        <p className="mb-2 text-sm font-bold text-duo-gray">My note</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Jot down something to remember..."
          className="w-full rounded-2xl border-2 border-duo-gray/20 p-3 text-sm text-duo-gray focus:border-duo-green focus:outline-none"
          rows={2}
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveNote}
            className="rounded-2xl bg-duo-green px-4 py-2 text-sm font-bold text-white hover:bg-duo-green-hover"
          >
            Save
          </button>
          {noteSaved && <span className="text-sm font-medium text-duo-green">Saved!</span>}
        </div>
      </div>

      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={onOpenReviewNotes}
          className="text-sm font-bold text-duo-blue underline hover:no-underline"
        >
          Review my notes
        </button>
      </div>
    </div>
  );
}
