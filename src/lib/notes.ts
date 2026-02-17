const STORAGE_KEY = "ashi-gymverse-notes";

export interface NoteEntry {
  questionPreview: string;
  note: string;
  insights?: string;
  updatedAt: string;
}

function questionKey(q: string): string {
  return q.slice(0, 120).trim();
}

export function getNote(question: string): NoteEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, NoteEntry>;
    return map[questionKey(question)] ?? null;
  } catch {
    return null;
  }
}

export function saveNote(
  question: string,
  note: string,
  insights?: string
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map = (raw ? JSON.parse(raw) : {}) as Record<string, NoteEntry>;
    const key = questionKey(question);
    const existing = map[key];
    map[key] = {
      questionPreview: question.slice(0, 80).trim() + (question.length > 80 ? "…" : ""),
      note,
      insights: insights ?? existing?.insights ?? "",
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function getAllNotes(): NoteEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const map = JSON.parse(raw) as Record<string, NoteEntry>;
    return Object.values(map);
  } catch {
    return [];
  }
}

export function updateNoteByPreview(
  questionPreview: string,
  updates: { note?: string; insights?: string }
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map = (raw ? JSON.parse(raw) : {}) as Record<string, NoteEntry>;
    for (const key of Object.keys(map)) {
      if (map[key].questionPreview === questionPreview) {
        if (updates.note !== undefined) map[key].note = updates.note;
        if (updates.insights !== undefined) map[key].insights = updates.insights;
        map[key].updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
        return;
      }
    }
  } catch {
    // ignore
  }
}

export function getAllNotesWithPreviews(): Array<NoteEntry & { storageKey: string }> {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const map = JSON.parse(raw) as Record<string, NoteEntry>;
    return Object.entries(map).map(([storageKey, entry]) => ({ ...entry, storageKey }));
  } catch {
    return [];
  }
}

export function updateNoteByStorageKey(
  storageKey: string,
  updates: { note?: string; insights?: string }
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map = (raw ? JSON.parse(raw) : {}) as Record<string, NoteEntry>;
    if (!(storageKey in map)) return;
    if (updates.note !== undefined) map[storageKey].note = updates.note;
    if (updates.insights !== undefined) map[storageKey].insights = updates.insights;
    map[storageKey].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}
