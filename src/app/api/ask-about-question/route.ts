import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey: key });
}

export async function POST(request: NextRequest) {
  let body: { question?: string; user_question?: string; options?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { question, user_question, options } = body;
  if (!question || !user_question?.trim()) {
    return NextResponse.json(
      { error: "Missing question or user_question" },
      { status: 400 }
    );
  }

  const optionsBlock =
    Array.isArray(options) && options.length > 0
      ? `\nAnswer options (do not say which is correct): ${options.join(" | ")}`
      : "";

  const systemPrompt = `You are Coach Sparky, a friendly tutor for Ashi. Answer her question about the problem in a helpful way.
Do NOT give away the correct answer or which option is right. You can explain concepts, definitions, or steps without revealing the answer.`;

  try {
    const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Full context of the question on screen:\n\nProblem: ${question}${optionsBlock}\n\nAshi asks: ${user_question.trim()}`,
        },
      ],
    });

    const answer = completion.choices[0]?.message?.content?.trim();
    return NextResponse.json({
      answer: answer || "I'm not sure how to answer that. Try rephrasing!",
    });
  } catch (err) {
    console.error("[ask-about-question]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
