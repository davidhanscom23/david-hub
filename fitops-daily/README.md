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

## Stack

- Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui
- Supabase Auth + Postgres (optional for local demo)
- Vitest unit tests for schedule/streak helpers

## Quick start (local demo)

```bash
cd fitops-daily
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and choose **Continue in demo mode**.

Demo data is stored in `localStorage` under `fitops-daily-v1`.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_schema.sql` in the SQL editor.
3. Run `supabase/seed.sql`, then `npm run seed:sql` and apply `supabase/seed_exercises.sql`.
4. Copy `.env.example` → `.env.local` and fill:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # server/seed only — never expose to the browser
OPENAI_API_KEY=...              # optional; enables AI regimen generation
```

## Body calculator

`POST /api/calculator/regimen` accepts current/goal weight, height, BMI, measurements, and focus.
Without an API key it uses the deterministic rules engine; with `OPENAI_API_KEY` it asks an OpenAI-compatible model and validates exercises against the FitOps catalog.

Use **Calculator** in the app, then **Use as alternate plan** to view it on **Routine**.

5. Add auth redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://YOUR-DOMAIN/auth/callback`

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
