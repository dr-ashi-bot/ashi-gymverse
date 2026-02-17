# Supabase setup

## Create `user_progress` table

The app uses a `user_progress` table for mastery scores. If you see errors about the table missing:

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**.
2. Run the script in `migrations/001_user_progress.sql` (or paste the SQL below).

```sql
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  mastery_score NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (mastery_score >= 0 AND mastery_score <= 1),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, topic)
);
```

3. Click **Run**. After that, mastery updates on correct answers will persist.

Until the table exists, correct answers still work (confetti, next question); only saving progress is skipped.

## Create `user_points` table

For the points system (earn puppies, reveal cost, 2nd-wrong deduction), create:

```sql
CREATE TABLE IF NOT EXISTS public.user_points (
  user_id TEXT PRIMARY KEY,
  points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Run in the same SQL Editor, then points will persist across sessions.
