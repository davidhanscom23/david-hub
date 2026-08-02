# FitOps Daily

Private, mobile-first workout tracker for the decoded 3-day military-style bodyweight routine.

## Features

- **Today** — date-aware Workout A/B/C or recovery/catch-up, stable daily quote, exercise checklist, journal
- **Routine** — full weekly plan + all exercises (military or calculator alternate)
- **Calculator** — body metrics → backend-generated alternate regimen (AI when `OPENAI_API_KEY` is set, rules engine otherwise)
- **Exercise detail** — cues, regressions/progressions, in-app demo videos
- **Journal** — mood/energy/soreness + prompts, editable history
- **Progress** — streak, weekly completion, heatmap, RPE, pain flags
- **Settings** — timezone, calendar/rotating schedule, source link edits, CSV/JSON export
- **Accounts** — Supabase Auth + cloud sync so each friend has their own login and history

## Stack

- Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui
- Supabase Auth + Postgres (recommended for sharing with friends)
- Vitest unit tests for schedule/streak helpers

## Connect your Supabase project

1. In the Supabase dashboard → **Project Settings → API**, copy **Project URL** and **anon public** key.
2. Copy `.env.example` → `fitops-daily/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# optional:
# SUPABASE_SERVICE_ROLE_KEY=...   # never expose to the browser
# OPENAI_API_KEY=...              # AI calculator
```

3. In **SQL Editor**, run in order:
   - `supabase/migrations/001_schema.sql` (tables, RLS, signup → profile trigger)
   - `supabase/migrations/002_user_app_state.sql` (cloud sync columns on `profiles`)
   - `supabase/seed.sql`
   - `npm run seed:sql` then apply `supabase/seed_exercises.sql`
4. **Authentication → Providers**: enable **Email**.
5. For a small private invite, turn **Confirm email** off under Auth settings (otherwise friends must click the email link first).
6. **Authentication → URL configuration**:
   - Site URL: `http://localhost:3000` (or your deploy URL)
   - Redirect URLs: `http://localhost:3000/auth/callback` and `https://YOUR-DOMAIN/auth/callback`
7. Start the app:

```bash
cd fitops-daily
npm install
npm run dev
```

Login uses Supabase Auth. Workouts, journals, and settings sync to `profiles.app_state` (RLS: each user only sees their row). Settings shows **Cloud sync: On** when writes succeed.

## Share with friends

1. Deploy with the same `NEXT_PUBLIC_SUPABASE_*` env vars.
2. Send friends the URL → **Create account**.
3. Each person gets their own Auth user + synced training history on any device.

Without Supabase env vars, the app falls back to on-device accounts / demo mode only.

## Quick start (demo only, no Supabase)

```bash
cd fitops-daily
npm install
npm run dev
```

Choose **Continue in demo mode**. Data stays in browser `localStorage` (`fitops-daily-v1`).

## Body calculator

`POST /api/calculator/regimen` accepts current/goal weight, height, BMI, measurements, and focus.
Without an API key it uses the deterministic rules engine; with `OPENAI_API_KEY` it asks an OpenAI-compatible model and validates exercises against the FitOps catalog.

Use **Calculator** in the app, then **Use as alternate plan** to view it on **Routine**.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js |
| `npm run build` | Production build |
| `npm run test` | Vitest unit tests |
| `npm run seed:sql` | Regenerate exercise seed SQL from TypeScript catalog |
| `npm run lint` | ESLint |

## Schedule logic

- **Calendar mode (default):** Mon=A, Tue=B, Wed=C, Thu–Sun=Recovery
- **Rotating mode:** next of A→B→C based on most recent completed workout

Timezone defaults to `America/New_York` (editable in Settings).

## Source of truth

- Build brief: `docs/military-workout-app-cursor-build-brief.md`
- Workbook: `docs/Military_Workout_Guide_Tracker.xlsx`
- Exercise catalog: `src/lib/data/seed.ts`

## Health note

This app is for personal fitness tracking and general education. Stop if you feel sharp pain, dizziness, chest pain, or unusual shortness of breath. Ask a qualified medical or fitness professional before starting a new program.
