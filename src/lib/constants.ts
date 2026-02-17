/** Topic id → label for 4th–6th grade LA, Math, Social Studies */
export const TOPICS = [
  { id: "math_4_operations", label: "Math Grade 4 — Operations & Algebra", grade: 4, subject: "math" },
  { id: "math_4_fractions", label: "Math Grade 4 — Fractions & Decimals", grade: 4, subject: "math" },
  { id: "math_5_operations", label: "Math Grade 5 — Operations & Word Problems", grade: 5, subject: "math" },
  { id: "math_5_geometry", label: "Math Grade 5 — Geometry & Measurement", grade: 5, subject: "math" },
  { id: "math_6_ratios", label: "Math Grade 6 — Ratios & Percent", grade: 6, subject: "math" },
  { id: "math_6_expressions", label: "Math Grade 6 — Expressions & Equations", grade: 6, subject: "math" },
  { id: "la_4_reading", label: "Language Arts Grade 4 — Reading Comprehension", grade: 4, subject: "language_arts" },
  { id: "la_4_grammar", label: "Language Arts Grade 4 — Grammar & Vocabulary", grade: 4, subject: "language_arts" },
  { id: "la_5_reading", label: "Language Arts Grade 5 — Reading & Inference", grade: 5, subject: "language_arts" },
  { id: "la_5_writing", label: "Language Arts Grade 5 — Writing & Main Idea", grade: 5, subject: "language_arts" },
  { id: "la_6_reading", label: "Language Arts Grade 6 — Analysis & Evidence", grade: 6, subject: "language_arts" },
  { id: "la_6_vocab", label: "Language Arts Grade 6 — Vocabulary & Context", grade: 6, subject: "language_arts" },
  { id: "ss_4_civics", label: "Social Studies Grade 4 — Civics & Community", grade: 4, subject: "social_studies" },
  { id: "ss_4_geography", label: "Social Studies Grade 4 — Geography & Maps", grade: 4, subject: "social_studies" },
  { id: "ss_5_us_history", label: "Social Studies Grade 5 — U.S. History", grade: 5, subject: "social_studies" },
  { id: "ss_5_economics", label: "Social Studies Grade 5 — Economics Basics", grade: 5, subject: "social_studies" },
  { id: "ss_6_world", label: "Social Studies Grade 6 — World History & Culture", grade: 6, subject: "social_studies" },
  { id: "ss_6_government", label: "Social Studies Grade 6 — Government & Citizenship", grade: 6, subject: "social_studies" },
] as const;

export type TopicId = (typeof TOPICS)[number]["id"];

export const DEFAULT_TOPIC_ID: TopicId = "math_4_operations";

/** Only these names may appear in generated questions (people/characters). */
export const ALLOWED_QUESTION_NAMES = [
  "Ashi",
  "Asritha",
  "Ishanvi",
  "Ammu anna",
  "Venni",
  "Praveen",
  "Sujatha",
  "Usha",
  "Ramesh",
  "Venkateswara",
  "Zoey",
  "Rupali the elephant",
  "Rupali the big bad wolf",
] as const;

/** Points earned/lost by difficulty (same for correct, 2nd wrong, and reveal). */
export const POINTS_BY_DIFFICULTY: Record<string, number> = {
  easy: 5,
  medium: 10,
  hard: 20,
};

/** Total points needed to unlock each puppy (1st, 2nd, … 6th). */
export const PUPPY_POINT_THRESHOLDS = [10, 25, 45, 70, 100, 135];

/** Names for Ashi's pups — they're her pets and can be lost if points drop. */
export const PUPPY_NAMES = [
  "Biscuit",
  "Peanut",
  "Mochi",
  "Pudding",
  "Waffles",
  "Noodle",
] as const;

export function getPointsForDifficulty(difficulty: string): number {
  return POINTS_BY_DIFFICULTY[difficulty] ?? POINTS_BY_DIFFICULTY.medium;
}

export function getUnlockedPuppyCount(points: number): number {
  let count = 0;
  for (const t of PUPPY_POINT_THRESHOLDS) {
    if (points >= t) count++;
  }
  return count;
}

/** Index of next puppy to earn (0–6). 6 means all earned. */
export function getNextPuppyIndex(points: number): number {
  for (let i = 0; i < PUPPY_POINT_THRESHOLDS.length; i++) {
    if (points < PUPPY_POINT_THRESHOLDS[i]) return i;
  }
  return PUPPY_POINT_THRESHOLDS.length;
}

/** Points needed for the next puppy; null if all earned. */
export function getPointsToNextPuppy(points: number): number | null {
  const idx = getNextPuppyIndex(points);
  if (idx >= PUPPY_POINT_THRESHOLDS.length) return null;
  return PUPPY_POINT_THRESHOLDS[idx];
}

/** Start of the range for the "next puppy" progress bar. */
export function getPointsAtPreviousThreshold(points: number): number {
  const idx = getNextPuppyIndex(points);
  if (idx <= 0) return 0;
  return PUPPY_POINT_THRESHOLDS[idx - 1];
}
