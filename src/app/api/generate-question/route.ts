import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import { TOPICS, ALLOWED_QUESTION_NAMES } from "@/lib/constants";

function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey: key });
}

type Difficulty = "easy" | "medium" | "hard";

function pickRandomTopicId(): string {
  const idx = Math.floor(Math.random() * TOPICS.length);
  return TOPICS[idx].id;
}

interface GeneratedQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  hint: string;
  explanation: string;
  difficulty?: Difficulty;
}

function getTopicLabel(topicId: string): string {
  const t = TOPICS.find((x) => x.id === topicId);
  return t ? t.label : topicId;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get("user_id");
  const current_topic = searchParams.get("current_topic") ?? pickRandomTopicId();
  const hint_difficulty = searchParams.get("hint_difficulty") as Difficulty | null;

  if (!user_id) {
    return NextResponse.json(
      { error: "Missing user_id" },
      { status: 400 }
    );
  }

  return handleGenerate(user_id, current_topic, hint_difficulty ?? undefined);
}

export async function POST(request: NextRequest) {
  let body: {
    user_id?: string;
    current_topic?: string;
    hint_difficulty?: Difficulty;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { user_id, current_topic: rawTopic, hint_difficulty } = body;
  if (!user_id) {
    return NextResponse.json(
      { error: "Missing user_id" },
      { status: 400 }
    );
  }
  const current_topic = rawTopic ?? pickRandomTopicId();
  return handleGenerate(user_id, current_topic, hint_difficulty);
}

async function handleGenerate(
  user_id: string,
  current_topic: string,
  hint_difficulty?: Difficulty
): Promise<NextResponse> {
  try {
    const masteryScore = await getMasteryScore(user_id, current_topic);

    let difficulty: Difficulty =
      masteryScore < 0.4 ? "easy" : masteryScore > 0.8 ? "hard" : "medium";
    if (hint_difficulty) {
      difficulty = hint_difficulty;
    }

    const topicLabel = getTopicLabel(current_topic);

    const systemPrompt = `You are Coach Sparky, an adaptive tutor for Ashi. Use a friendly, enthusiastic gymnastics-coach tone with occasional emojis 🤸‍♀️.

CRITICAL RULES:
- Generate exactly ONE question with exactly ONE correct answer. The answer must be unambiguous and fact-based.
- You MUST output exactly 4 options. The correct_answer MUST be exactly one of those 4 option strings (character-for-character).
- Do not invent facts, dates, or numbers. For math use simple integers and clear operations. For reading use short, clear passages and one definite best answer.
- No trick questions or subjective answers. The correct answer should be verifiable from the question and standard curriculum.

Context: Topic = ${topicLabel}. Difficulty = ${difficulty}.
- easy: One clear step, simple numbers or one sentence.
- medium: Two steps or one short passage with one clear answer.
- hard: Multiple steps or a short passage with inference; still one definite answer.

Theme: You may use gym or puppy-themed word problems when it fits the topic.

NAMES: Use ONLY these names for any people or characters in the question: ${ALLOWED_QUESTION_NAMES.join(", ")}. Do not use any other names.

Output: Return valid JSON only, no markdown. Shape:
{
  "question": "string",
  "options": ["exact option A text", "exact option B text", "exact option C text", "exact option D text"],
  "correct_answer": "must be exactly one of the four options above",
  "hint": "one sentence Socratic hint",
  "explanation": "short explanation of why the answer is correct"
}`;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate one ${difficulty} question for: ${topicLabel}. Mastery: ${masteryScore.toFixed(2)}.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(raw) as GeneratedQuestion;
    if (
      typeof parsed.question !== "string" ||
      !Array.isArray(parsed.options) ||
      parsed.options.length !== 4 ||
      typeof parsed.correct_answer !== "string" ||
      typeof parsed.hint !== "string" ||
      typeof parsed.explanation !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid question shape from OpenAI" },
        { status: 502 }
      );
    }

    const correctTrimmed = parsed.correct_answer.trim();
    const match = parsed.options.some(
      (o: string) => o.trim().toLowerCase() === correctTrimmed.toLowerCase()
    );
    if (!match) {
      parsed.correct_answer = parsed.options[0];
      parsed.explanation =
        parsed.explanation + " (Answer key aligned to first option.)";
    }

    return NextResponse.json({
      question: parsed.question,
      options: parsed.options,
      correct_answer: parsed.correct_answer,
      hint: parsed.hint,
      explanation: parsed.explanation,
      difficulty,
      topic_id: current_topic,
    });
  } catch (err) {
    console.error("[generate-question]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

async function getMasteryScore(
  user_id: string,
  current_topic: string
): Promise<number> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_progress")
    .select("mastery_score")
    .eq("user_id", user_id)
    .eq("topic", current_topic)
    .maybeSingle();

  if (error) {
    console.warn("[generate-question] Supabase mastery fetch failed:", error.message);
    return 0.5;
  }

  const score = data?.mastery_score;
  if (typeof score !== "number" || score < 0 || score > 1) {
    return 0.5;
  }
  return score;
}
