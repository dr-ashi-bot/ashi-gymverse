# Ashi Gymverse

A gamified learning app for 5th graders.

## Tech stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (icons)
- **Supabase** (database)
- **OpenAI API** (content generation)
- **Framer Motion** (animations)

## Setup

1. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in `.env.local` with your Supabase and OpenAI keys.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```

## Project structure

```
src/
├── app/              # App Router pages and layouts
├── components/       # Reusable UI components
└── lib/              # Utilities and clients
    ├── openai/       # OpenAI API client
    └── supabase/     # Supabase client (browser + server)
```
