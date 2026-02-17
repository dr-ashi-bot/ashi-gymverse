import { PUPPY_POINT_THRESHOLDS } from "./constants";

const SESSION_HISTORY_KEY = "ashi-gymverse-session-history";
const CONCEPTS_KEY = "ashi-gymverse-concepts-to-revise";

export interface SessionRecord {
  date: string;
  points: number;
  pups: number;
}

export interface ConceptToRevise {
  topicId: string;
  topicLabel: string;
  questionPreview: string;
  hint: string;
  date: string;
}

export function getSessionHistory(): SessionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSION_HISTORY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as SessionRecord[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveSessionToHistory(points: number): void {
  if (typeof window === "undefined") return;
  try {
    let pups = 0;
    for (const t of PUPPY_POINT_THRESHOLDS) {
      if (points >= t) pups++;
    }
    const record: SessionRecord = {
      date: new Date().toISOString(),
      points,
      pups,
    };
    const history = getSessionHistory();
    history.unshift(record);
    const trimmed = history.slice(0, 50);
    localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

export function getConceptsToRevise(): ConceptToRevise[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CONCEPTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as ConceptToRevise[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function addConceptToRevise(entry: Omit<ConceptToRevise, "date">): void {
  if (typeof window === "undefined") return;
  try {
    const list = getConceptsToRevise();
    const newEntry: ConceptToRevise = { ...entry, date: new Date().toISOString() };
    const exists = list.some(
      (c) => c.questionPreview === entry.questionPreview && c.topicId === entry.topicId
    );
    if (!exists) {
      list.unshift(newEntry);
      localStorage.setItem(CONCEPTS_KEY, JSON.stringify(list.slice(0, 100)));
    }
  } catch {
    // ignore
  }
}

export function removeConceptToRevise(index: number): void {
  if (typeof window === "undefined") return;
  try {
    const list = getConceptsToRevise();
    list.splice(index, 1);
    localStorage.setItem(CONCEPTS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}
