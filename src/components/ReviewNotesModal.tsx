"use client";

import { useEffect, useState } from "react";
import {
  getAllNotesWithPreviews,
  updateNoteByStorageKey,
  type NoteEntry,
} from "@/lib/notes";

interface ReviewNotesModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ReviewNotesModal({ open, onClose }: ReviewNotesModalProps) {
  const [entries, setEntries] = useState<Array<(NoteEntry & { storageKey: string })>>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");
  const [editInsights, setEditInsights] = useState("");

  useEffect(() => {
    if (open) setEntries(getAllNotesWithPreviews());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const startEdit = (entry: NoteEntry & { storageKey: string }) => {
    setEditingKey(entry.storageKey);
    setEditNote(entry.note);
    setEditInsights(entry.insights ?? "");
  };

  const saveEdit = () => {
    if (editingKey == null) return;
    updateNoteByStorageKey(editingKey, { note: editNote, insights: editInsights });
    setEntries(getAllNotesWithPreviews());
    setEditingKey(null);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-duo-gray/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Review notes"
    >
      <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-3xl border-2 border-duo-gray/10 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b-2 border-duo-gray/10 px-6 py-4">
          <h2 className="text-xl font-extrabold text-duo-gray">Review my notes</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl px-3 py-1.5 font-bold text-duo-gray hover:bg-duo-gray-bg"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <p className="px-6 py-2 text-sm text-duo-gray-light">
          Add insights and things to remember from what you learned.
        </p>
        <div className="overflow-y-auto px-6 pb-6" style={{ maxHeight: "60vh" }}>
          {entries.length === 0 ? (
            <p className="py-8 text-center text-duo-gray-light">No notes yet. Add a note on a question to see it here.</p>
          ) : (
            <ul className="space-y-4">
              {entries.map((entry) => (
                <li
                  key={entry.storageKey}
                  className="rounded-xl border border-duo-gray/10 bg-duo-gray-bg p-4"
                >
                  <p className="text-xs font-medium text-duo-gray-light">
                    {entry.questionPreview}
                  </p>
                  {editingKey === entry.storageKey ? (
                    <div className="mt-3 space-y-2">
                      <label className="block text-xs font-semibold text-duo-gray">
                        Note
                      </label>
                      <textarea
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        className="w-full rounded-lg border border-duo-gray/20 focus:border-duo-green focus:outline-none p-2 text-sm"
                        rows={2}
                      />
                      <label className="block text-xs font-semibold text-duo-gray">
                        Insights / things to remember
                      </label>
                      <textarea
                        value={editInsights}
                        onChange={(e) => setEditInsights(e.target.value)}
                        className="w-full rounded-lg border border-duo-gray/20 focus:border-duo-green focus:outline-none p-2 text-sm"
                        rows={2}
                        placeholder="e.g. Area = length × width"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={saveEdit}
                          className="rounded-lg bg-duo-green px-4 py-2 text-sm font-bold text-white hover:bg-duo-green-hover"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingKey(null)}
                          className="rounded-lg bg-duo-gray-bg px-4 py-2 text-sm font-bold text-duo-gray"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mt-2 text-sm text-duo-gray">{entry.note || "—"}</p>
                      {entry.insights && (
                        <p className="mt-1 text-sm text-duo-gray-light">
                          <span className="font-medium">Remember: </span>
                          {entry.insights}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => startEdit(entry)}
                        className="mt-2 text-sm font-medium text-duo-blue underline hover:no-underline"
                      >
                        Edit
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
