# Deploy to Vercel (Hobby)

1. **Login and deploy**
   ```bash
   npx vercel login
   npx vercel --prod
   ```
   Follow the prompts to link the project (or create new). You’ll get a URL like `https://ashi-gymverse-xxx.vercel.app`.

2. **Environment variables**  
   In [Vercel Dashboard](https://vercel.com/dashboard) → your project → **Settings** → **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` (from `.env.local`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from `.env.local`)
   - `OPENAI_API_KEY` (from `.env.local`)

   Then trigger a **Redeploy** so the build uses them.

3. **Hobby plan**  
   In **Settings** → **General**, confirm the plan is **Hobby** (free).
