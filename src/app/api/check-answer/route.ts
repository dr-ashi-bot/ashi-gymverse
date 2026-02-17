import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import { getPointsForDifficulty } from "@/lib/constants";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface CheckAnswerBody {
  user_id: string;
  current_topic: string;
  user_answer?: string;
  correct_answer: string;
  question: string;
  explanation: string;
  difficulty: string;
  is_second_wrong?: boolean;
  action?: "check" | "reveal";
}

function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function POST(request: NextRequest) {
  let body: Partial<CheckAnswerBody>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const {
    user_id,
    current_topic,
    user_answer,
    correct_answer,
    question,
    explanation,
    difficulty,
    is_second_wrong,
    action = "check",
  } = body;

  if (!user_id || !current_topic || !correct_answer || !question) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: user_id, current_topic, correct_answer, question",
      },
      { status: 400 }
    );
  }

  const pointsForQuestion = getPointsForDifficulty(difficulty ?? "medium");

  if (action === "reveal") {
    const { total_points, error: pointsErr } = await updatePoints(
      user_id,
      -pointsForQuestion
    );
    if (pointsErr) {
      console.warn("[check-answer] Points update failed:", pointsErr);
    }
    const payload: Record<string, unknown> = {
      revealed: true,
      explanation: explanation || "See above.",
      correct_answer,
      points_delta: -pointsForQuestion,
    };
    if (pointsErr == null && typeof total_points === "number") payload.total_points = total_points;
    return NextResponse.json(payload);
  }

  const isCorrect =
    user_answer !== undefined &&
    user_answer !== null &&
    normalizeAnswer(String(user_answer)) === normalizeAnswer(correct_answer);

  if (isCorrect) {
    const updateError = await incrementMasteryScore(user_id, current_topic);
    if (updateError) {
      console.warn("[check-answer] Mastery update failed:", updateError);
    }
    const { total_points, error: pointsErr } = await updatePoints(
      user_id,
      pointsForQuestion
    );
    if (pointsErr) {
      console.warn("[check-answer] Points update failed:", pointsErr);
    }
    const payload: Record<string, unknown> = {
      correct: true,
      confetti: true,
      points_delta: pointsForQuestion,
    };
    if (pointsErr == null && typeof total_points === "number") payload.total_points = total_points;
    return NextResponse.json(payload);
  }

  if (is_second_wrong) {
    const { total_points, error: pointsErr } = await updatePoints(
      user_id,
      -pointsForQuestion
    );
    if (pointsErr) {
      console.warn("[check-answer] Points update failed:", pointsErr);
    }
    const basePayload: Record<string, unknown> = {
      correct: false,
      points_delta: -pointsForQuestion,
    };
    if (pointsErr == null && typeof total_points === "number") basePayload.total_points = total_points;
    try {
      const hint = await generateSocraticHint(question, String(user_answer ?? ""));
      return NextResponse.json({ ...basePayload, hint });
    } catch (err) {
      console.error("[check-answer] Hint generation failed:", err);
      return NextResponse.json({
        ...basePayload,
        hint: "Not quite! 🤸‍♀️ Try re-reading the problem and check your steps.",
      });
    }
  }

  try {
    const hint = await generateSocraticHint(question, String(user_answer ?? ""));
    return NextResponse.json({ correct: false, hint });
  } catch (err) {
    console.error("[check-answer] Hint generation failed:", err);
    return NextResponse.json({
      correct: false,
      hint: "Not quite! 🤸‍♀️ Try re-reading the problem and check your steps.",
    });
  }
}

async function generateSocraticHint(
  question: string,
  userAnswer: string
): Promise<string> {
  const systemPrompt = `You are Coach Sparky, an enthusiastic gymnastics-coach tutor for Ashi. Use emojis 🤸‍♀️.
Give a Socratic hint that guides the student without giving away the answer. Do NOT say the correct answer or option letter.
Keep it to 1-2 sentences, encouraging, and point to the concept they might have missed.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Question: ${question}\n\nStudent's answer: ${userAnswer}\n\nGenerate a brief Socratic hint (do not reveal the correct answer).`,
      },
    ],
  });

  const hint = completion.choices[0]?.message?.content?.trim();
  return hint || "Not quite! 🤸‍♀️ Try re-reading the problem and check your steps.";
}

async function incrementMasteryScore(
  user_id: string,
  topic: string
): Promise<string | null> {
  const supabase = createSupabaseServerClient();

  const { data: existing, error: fetchError } = await supabase
    .from("user_progress")
    .select("mastery_score")
    .eq("user_id", user_id)
    .eq("topic", topic)
    .maybeSingle();

  if (fetchError) return fetchError.message;

  const current = existing?.mastery_score;
  const nextScore =
    typeof current === "number" && current >= 0 && current <= 1
      ? Math.min(1, current + 0.1)
      : 0.1;

  if (existing != null) {
    const { error: updateError } = await supabase
      .from("user_progress")
      .update({ mastery_score: nextScore })
      .eq("user_id", user_id)
      .eq("topic", topic);
    if (updateError) return updateError.message;
  } else {
    const { error: insertError } = await supabase
      .from("user_progress")
      .insert({ user_id, topic, mastery_score: nextScore });
    if (insertError) return insertError.message;
  }
  return null;
}

async function updatePoints(
  user_id: string,
  delta: number
): Promise<{ total_points: number | null; error: string | null }> {
  const supabase = createSupabaseServerClient();

  const { data: row, error: fetchError } = await supabase
    .from("user_points")
    .select("points")
    .eq("user_id", user_id)
    .maybeSingle();

  if (fetchError) {
    return { total_points: null, error: fetchError.message };
  }

  const current = typeof row?.points === "number" && row.points >= 0 ? row.points : 0;
  const nextPoints = Math.max(0, current + delta);

  if (row != null) {
    const { error: updateError } = await supabase
      .from("user_points")
      .update({ points: nextPoints, updated_at: new Date().toISOString() })
      .eq("user_id", user_id);
    if (updateError) return { total_points: null, error: updateError.message };
  } else {
    const { error: insertError } = await supabase
      .from("user_points")
      .insert({ user_id, points: nextPoints });
    if (insertError) return { total_points: null, error: insertError.message };
  }
  return { total_points: nextPoints, error: null };
}
