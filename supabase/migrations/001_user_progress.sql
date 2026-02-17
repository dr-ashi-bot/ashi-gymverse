-- Create user_progress table for storing per-topic mastery scores.
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor) if the table doesn't exist.

CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  mastery_score NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (mastery_score >= 0 AND mastery_score <= 1),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, topic)
);

-- Optional: enable RLS and add a policy if you use Supabase Auth
-- ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can read own progress" ON public.user_progress FOR SELECT USING (auth.uid()::text = user_id);
-- CREATE POLICY "Users can update own progress" ON public.user_progress FOR ALL USING (auth.uid()::text = user_id);

COMMENT ON TABLE public.user_progress IS 'Per-user, per-topic mastery score (0–1) for adaptive question difficulty';
