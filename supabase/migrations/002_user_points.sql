-- Points balance per user (earn for correct, lose on 2nd wrong or reveal).
-- Run in Supabase SQL Editor if the table doesn't exist.

CREATE TABLE IF NOT EXISTS public.user_points (
  user_id TEXT PRIMARY KEY,
  points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.user_points IS 'Total points for Ashi; used for puppy unlocks and reveal cost';
