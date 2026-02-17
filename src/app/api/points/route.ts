import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json(
      { error: "Missing user_id" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_points")
    .select("points")
    .eq("user_id", user_id)
    .maybeSingle();

  if (error) {
    console.warn("[points] fetch failed:", error.message);
    return NextResponse.json({ points: 0 });
  }

  const points = typeof data?.points === "number" && data.points >= 0 ? data.points : 0;
  return NextResponse.json({ points });
}
