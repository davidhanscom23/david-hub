# Military Workout App: Cursor Build Brief

Personal build spec for a private workout routine, exercise reference, accountability, and daily journal app.

## 1. Product Summary

Build a private, mobile-first web app that helps me follow the decoded "military workout" routine from my reference image. The app should show the workout for the current day, let me mark exercises and workouts complete, link to accredited exercise demonstrations, save daily journal notes, and show a daily fitness or health quote.

Working app name: **FitOps Daily**

Primary users:

- Me, as the owner of the app.
- Future optional users can be supported later, but the MVP should be private and simple.

Primary goal:

- Help me know what to do today, how to do each movement safely, and whether I actually followed through.

Non-goals for MVP:

- No social feed.
- No calorie tracking.
- No macro tracking.
- No AI coach required for the first version.
- No complex periodization beyond the workout plan below.

Important health note to show in the app:

> This app is for personal fitness tracking and general education. Stop if you feel sharp pain, dizziness, chest pain, or unusual shortness of breath. Ask a qualified medical or fitness professional before starting a new program, especially if you have injuries or health conditions.

## 2. Recommended Stack

Use this stack because it fits Cursor, Supabase, GitHub, and Vercel cleanly:

- **Frontend/App:** Next.js App Router, TypeScript, React
- **Styling:** Tailwind CSS + shadcn/ui
- **Icons:** lucide-react
- **Database:** Supabase Postgres
- **Auth:** Supabase Auth
- **Hosting:** Vercel
- **Source Control:** GitHub
- **Forms:** react-hook-form + zod
- **Dates:** date-fns
- **Charts:** Recharts
- **Testing:** Vitest for utilities, Playwright for end-to-end checks

Suggested create command:

```bash
npx create-next-app@latest fitops-daily --ts --tailwind --eslint --app --src-dir
```

Install:

```bash
npm install @supabase/supabase-js @supabase/ssr lucide-react date-fns zod react-hook-form @hookform/resolvers recharts
npx shadcn@latest init
```

Add useful shadcn/ui components:

```bash
npx shadcn@latest add button card checkbox dialog dropdown-menu input label progress select separator sheet tabs textarea toast
```

## 3. Product Decisions

Default MVP decisions:

- The app is private and requires login.
- Use Supabase email/password auth and optionally magic links.
- Default schedule follows the original guide:
  - Monday: Workout A
  - Tuesday: Workout B
  - Wednesday: Workout C
  - Thursday through Sunday: recovery, catch-up, journaling, and optional walk/mobility
- The app should also support a future "rotating mode" where workouts A, B, and C cycle on any day I train.
- The first screen after login should be **Today**, not a landing page.
- The daily quote should be saved for that calendar date so it does not change every refresh.
- Use America/New_York as the default timezone, but store it in my profile.

Decisions to confirm later:

- Whether Thursday through Sunday should be full rest days or optional repeat/catch-up days.
- Whether I want browser reminders, email reminders, or no reminders.
- Whether the app should stay single-user forever or support invited family/training partners later.

## 4. Core User Stories

As the app owner, I want to:

- Log in privately.
- Open the app and immediately see today's routine.
- See each exercise name, target reps/time, short form cues, and a reference link.
- Open an accredited exercise demo/reference page for each movement.
- Mark each exercise complete, partial, skipped, or pain/problem.
- Mark the whole workout complete.
- Save daily journal notes.
- See today's motivational quote.
- See my weekly completion progress and streak.
- Review past workouts and journal notes.
- Edit source links later if I find a better accredited demo.

## 5. Main App Navigation

Use a bottom nav on mobile and a simple sidebar/top nav on desktop:

- **Today**
- **Routine**
- **Journal**
- **Progress**
- **Settings**

Do not make a marketing homepage. If logged out, show a clean sign-in screen. If logged in, go straight to `/today`.

## 6. Pages and Views

### `/today`

The main daily dashboard.

Must show:

- Today's date and workout status
- Daily quote
- Workout name for today
- Recovery/catch-up card if today is not Monday, Tuesday, or Wednesday
- Exercise checklist
- "Start Workout" or "Continue Workout" button
- Workout completion button
- Journal note field for today's entry
- Small weekly progress strip

Exercise card fields:

- Exercise name
- Target, such as `31 reps` or `1 minute`
- Short cue, such as "Brace core. Step or jump back. Land softly."
- Source button: `View Demo`
- Status selector: planned, done, partial, skipped, pain
- Optional notes

### `/routine`

Shows the full weekly plan.

Views:

- Monday
- Tuesday
- Wednesday
- Recovery Days
- All Exercises

Each exercise should be clickable and open an exercise detail view.

### `/exercise/[slug]`

Exercise detail page.

Must show:

- Exercise name
- Day(s) used
- Target reps/time
- Equipment
- Primary muscles
- Beginner-friendly description
- Form cues
- Common mistakes
- Regression
- Progression
- Accredited source link
- Source match type: exact, close variation, or base movement
- Personal notes field

Do not embed videos unless the source allows it. Opening the official NASM/ACE page in a new tab is acceptable and safer for licensing.

### `/journal`

Journal history.

Must show:

- Calendar or list of entries
- Mood, energy, soreness, and notes
- Filter by date range
- Edit a past note

Daily journal prompts:

- What did I complete today?
- How did my body feel?
- What was hard?
- What is one small win?
- Anything to adjust next time?

### `/progress`

Accountability dashboard.

Must show:

- Current streak
- Workouts completed this week
- Completion rate by week
- Calendar heatmap
- Most recent journal note
- Exercise pain/problem flags
- Average effort/RPE

Helpful but optional:

- "Best consistency week"
- "Longest streak"
- "Most skipped exercises"

### `/settings`

Must support:

- Display name
- Timezone
- Schedule mode: calendar mode or rotating mode
- Preferred reminder time, saved for future use
- Edit source links
- Export my data as CSV/JSON
- Delete account/data with confirmation

## 7. Workout Plan Seed Data

Use this as the default program. The counts come from the decoded guide.

### Monday: Workout A

| Order | Exercise | Target | Unit | Notes |
|---:|---|---:|---|---|
| 1 | Modified Burpee | 31 | reps | Step-back version allowed |
| 2 | Alternating Step-Up | 24 | total reps | Count both legs together |
| 3 | Incline Diamond Push-Up | 16 | reps | Incline, narrow/diamond hands |
| 4 | Wide Push-Up | 22 | reps | Hands wider than shoulders |
| 5 | Reverse Crunch | 15 | reps | Curl pelvis, do not swing legs |
| 6 | Scissor Kick | 15 | each side | Keep low back controlled |
| 7 | Prone Cobra | 19 | reps | Squeeze shoulder blades |
| 8 | Single-Leg Glute Bridge | 21 | total reps | Alternate sides or split evenly |

### Tuesday: Workout B

| Order | Exercise | Target | Unit | Notes |
|---:|---|---:|---|---|
| 1 | Step-Up | 16 | total reps | Use sturdy step/bench |
| 2 | Cross-Body Mountain Climber | 22 | total reps | Knee drives toward opposite elbow |
| 3 | Burpee | 20 | reps | Full version if able |
| 4 | Forearm Plank | 1 | minute | Hold straight line |
| 5 | Squat Press | 20 | reps | Bodyweight squat to overhead reach; optional light dumbbells later |
| 6 | Squat Thrust | 20 | reps | Plank in/out, no push-up required |
| 7 | Skater Squat | 17 | total reps | Controlled side-to-side/single-leg pattern |
| 8 | Wide-Stance Calf Raise | 18 | reps | Feet wide, rise under control |

### Wednesday: Workout C

| Order | Exercise | Target | Unit | Notes |
|---:|---|---:|---|---|
| 1 | Elbow Walkout | 18 | reps | Walk between forearm/high plank or walk hands out |
| 2 | Good Morning / Hip Hinge | 16 | reps | Hinge at hips, neutral back |
| 3 | Sit-Up or Crunch | 22 | reps | Crunch is the beginner default |
| 4 | Bent-Knee Leg Raise | 20 | reps | Knees bent, controlled lower |
| 5 | Inverted Row | 18 | reps | Requires sturdy table/bar/TRX |
| 6 | Side Lunge | 18 | total reps | Alternate sides |
| 7 | Walking Lunge | 17 | total reps | Forward lunge steps |
| 8 | Plank Shoulder Tap | 18 | total taps | Minimize hip sway |

### Recovery Days

Thursday through Sunday default screen:

- Show "Recovery / Catch-Up Day"
- Optional 20 minute walk
- Optional 5 minute mobility
- Prompt journal entry
- Show missed workouts from Monday to Wednesday with a "Do this today" button

## 8. Exercise Reference Source Strategy

Use accredited or professional fitness education sources first:

1. NASM exercise library and NASM resource center
2. ACE Fitness exercise library
3. Mayo Clinic, Cleveland Clinic, or other clinical/health system references if NASM/ACE has no close match

Rules:

- Prefer exact NASM links when available because NASM exercise pages often include video players.
- Use ACE when it is a better movement match than NASM.
- If no exact accredited page exists, use the closest accredited base movement and label it clearly as `base movement` or `close variation`.
- Do not use random influencer videos as default sources.
- Do not download, scrape, or re-host video content.
- Open source pages in a new tab with `rel="noopener noreferrer"`.

## 9. Exercise Reference Seed Data

These links should be stored with the exercise records. Some are exact; others are intentional close references.

| Exercise | Preferred Source | Source URL | Match Type | Notes |
|---|---|---|---|---|
| Modified Burpee | NASM | https://www.nasm.org/resource-center/exercise-library/squat-thrust-burpees | close variation | Use step-back/no-jump regression |
| Alternating Step-Up | ACE | https://www.acefitness.org/resources/everyone/exercise-library/28/step-up/ | exact | Use as controlled step-up demo |
| Incline Diamond Push-Up | NASM | https://www.nasm.org/resource-center/exercise-library/incline-push-up | close variation | Same incline setup, use narrow/diamond hands |
| Wide Push-Up | NASM | https://www.nasm.org/resource-center/exercise-library/push-up | base movement | Same push-up mechanics, wider hands |
| Reverse Crunch | NASM | https://www.nasm.org/resource-center/exercise-library/reverse-crunch-to-knee-up-with-rotation | close variation | Omit rotation for this program |
| Scissor Kick | NASM | https://www.nasm.org/resource-center/exercise-library/dead-bug | base movement | Use for core bracing reference; replace with exact accredited video if found |
| Prone Cobra | NASM | https://www.nasm.org/resource-center/exercise-library/floor-prone-cobra | exact | No equipment |
| Single-Leg Glute Bridge | ACE | https://www.acefitness.org/resources/everyone/exercise-library/145/glute-bridge-single-leg-progression/ | exact | Single-leg bridge progression |
| Step-Up | ACE | https://www.acefitness.org/resources/everyone/exercise-library/28/step-up/ | exact | Raised platform/box |
| Cross-Body Mountain Climber | NASM | https://www.nasm.org/resource-center/exercise-library/straight-arm-plank | base movement | Use plank setup and add cross-body knee drive |
| Burpee | NASM | https://www.nasm.org/resource-center/exercise-library/squat-thrust-burpees | exact | NASM labels squat thrust burpees |
| Forearm Plank | NASM | https://www.nasm.org/resource-center/exercise-library/plank | exact | Time-based hold |
| Squat Press | NASM | https://www.nasm.org/resource-center/exercise-library/prisoner-squat | base movement | Use squat mechanics, add overhead reach/press |
| Squat Thrust | NASM | https://www.nasm.org/resource-center/exercise-library/squat-thrust-burpees | exact | No push-up required for this variation |
| Skater Squat | NASM | https://www.nasm.org/resource-center/exercise-library/single-leg-squat-touchdown | close variation | Similar single-leg control |
| Wide-Stance Calf Raise | NASM | https://www.nasm.org/resource-center/exercise-library/leg-press-calf-raise | base movement | Calf raise mechanics; app should describe standing bodyweight version |
| Elbow Walkout | NASM | https://www.nasm.org/resource-center/exercise-library/plank-walkup | close variation | Similar plank transition |
| Good Morning / Hip Hinge | NASM | https://www.nasm.org/resource-center/exercise-library/good-mornings | base movement | App should default to bodyweight hip hinge |
| Sit-Up or Crunch | ACE | https://www.acefitness.org/resources/everyone/exercise-library/52/crunch/ | exact | Crunch is beginner default |
| Bent-Knee Leg Raise | ACE | https://www.acefitness.org/resources/everyone/exercise-library/238/supine-reverse-marches/ | close variation | Similar bent-knee lower-ab control |
| Inverted Row | NASM | https://blog.nasm.org/three-awesome-row-exercise-variations | exact article | NASM article includes inverted-row technique |
| Side Lunge | ACE | https://www.acefitness.org/resources/everyone/exercise-library/50/side-lunge/ | exact | No equipment |
| Walking Lunge | ACE | https://www.acefitness.org/resources/everyone/exercise-library/94/forward-lunge/ | base movement | Use forward lunge mechanics, repeat as walking reps |
| Plank Shoulder Tap | NASM | https://www.nasm.org/resource-center/exercise-library/straight-arm-plank | base movement | Add alternating shoulder taps from high plank |

## 10. Exercise Detail Content

Seed short app-friendly cues. These should not replace the official source links.

| Exercise | Short Cue | Common Mistake | Regression | Progression |
|---|---|---|---|---|
| Modified Burpee | Squat down, step back to plank, step in, stand tall. | Letting hips sag in plank. | Hands on bench. | Add small hop. |
| Alternating Step-Up | Step through heel, stand tall, control down. | Pushing off the floor leg too much. | Lower step. | Add knee drive. |
| Incline Diamond Push-Up | Hands narrow on incline, body straight, lower chest as one piece. | Flaring elbows hard or dropping hips. | Higher incline. | Lower incline. |
| Wide Push-Up | Hands wide, brace, lower chest, press away. | Neck reaching toward floor. | Knees down. | Tempo lowering. |
| Reverse Crunch | Curl hips up using abs, lower with control. | Swinging legs. | Smaller curl. | Add pause at top. |
| Scissor Kick | Brace low back, alternate legs smoothly. | Arching low back. | Keep legs higher. | Lower legs closer to floor. |
| Prone Cobra | Lift chest lightly, thumbs rotate up, squeeze shoulder blades. | Cranking neck up. | Smaller lift. | Longer hold. |
| Single-Leg Glute Bridge | Drive through heel, keep hips level. | Twisting hips. | Two-leg bridge. | Longer top hold. |
| Step-Up | Place full foot on step, stand tall, lower slow. | Knee collapsing inward. | Lower step. | Hold light dumbbells. |
| Cross-Body Mountain Climber | High plank, knee toward opposite elbow, switch. | Bouncing hips high. | Slow taps. | Faster tempo. |
| Burpee | Squat, plank, return, stand or jump. | Landing hard. | Step-back modified burpee. | Add push-up. |
| Forearm Plank | Elbows under shoulders, squeeze glutes, breathe. | Hips sagging. | Knees down. | Longer hold. |
| Squat Press | Squat, stand, reach/press overhead. | Rounding back. | Squat to chair. | Add light dumbbells. |
| Squat Thrust | Hands down, feet back to plank, feet in, stand. | Letting shoulders collapse. | Step feet one at a time. | Add jump. |
| Skater Squat | Shift to one side, control knee, push back up. | Knee diving inward. | Shorter range. | Reach opposite foot behind. |
| Wide-Stance Calf Raise | Feet wide, rise onto balls of feet, lower slow. | Rolling ankles outward. | Hold wall. | Add pause at top. |
| Elbow Walkout | Move between elbow/high plank or walk hands out with control. | Rocking hips side to side. | Fewer steps. | Add pause in plank. |
| Good Morning / Hip Hinge | Soft knees, push hips back, stand by squeezing glutes. | Squatting instead of hinging. | Hands on hips. | Hold light weight. |
| Sit-Up or Crunch | Curl ribs toward pelvis, keep neck relaxed. | Pulling head with hands. | Smaller crunch. | Slow tempo. |
| Bent-Knee Leg Raise | Knees bent, lift hips/legs, lower slowly. | Lower back arching. | One leg at a time. | Extend legs more. |
| Inverted Row | Straight body, pull chest to bar/table, lower with control. | Shrugging shoulders. | Higher bar angle. | Feet farther forward. |
| Side Lunge | Step side, hips back, push through planted foot. | Step too wide. | Smaller step. | Add reach or weight. |
| Walking Lunge | Step forward, lower with control, drive to next step. | Front knee caving inward. | Stationary lunge. | Add light dumbbells. |
| Plank Shoulder Tap | High plank, tap opposite shoulder, keep hips quiet. | Rotating hips. | Wider feet. | Narrow feet. |

## 11. Supabase Data Model

Use generated UUID primary keys. Enable Row Level Security on all user-owned tables.

### Tables

```sql
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text not null default 'America/New_York',
  schedule_mode text not null default 'calendar' check (schedule_mode in ('calendar', 'rotating')),
  preferred_reminder_time time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text,
  is_template boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.workout_days (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  code text not null,
  weekday int,
  title text not null,
  focus text,
  sort_order int not null,
  created_at timestamptz not null default now()
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text,
  equipment text not null default 'None',
  primary_muscles text[] not null default '{}',
  short_cue text,
  common_mistake text,
  regression text,
  progression text,
  source_name text,
  source_url text,
  source_match_type text not null default 'exact' check (source_match_type in ('exact', 'close variation', 'base movement', 'exact article')),
  source_notes text,
  created_at timestamptz not null default now()
);

create table public.workout_items (
  id uuid primary key default gen_random_uuid(),
  workout_day_id uuid not null references public.workout_days(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  order_index int not null,
  target_count numeric not null,
  target_unit text not null,
  notes text,
  created_at timestamptz not null default now(),
  unique(workout_day_id, order_index)
);

create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_day_id uuid references public.workout_days(id) on delete set null,
  scheduled_date date not null,
  status text not null default 'planned' check (status in ('planned', 'done', 'partial', 'skipped')),
  minutes int,
  effort_rpe int check (effort_rpe between 1 and 10),
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, scheduled_date, workout_day_id)
);

create table public.session_exercise_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  workout_item_id uuid not null references public.workout_items(id) on delete cascade,
  status text not null default 'planned' check (status in ('planned', 'done', 'partial', 'skipped', 'pain')),
  completed_count numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(session_id, workout_item_id)
);

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  body text,
  mood int check (mood between 1 and 5),
  energy int check (energy between 1 and 5),
  soreness int check (soreness between 1 and 5),
  small_win text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, entry_date)
);

create table public.quote_bank (
  id uuid primary key default gen_random_uuid(),
  quote_text text not null,
  author text,
  category text not null default 'fitness',
  source_type text not null default 'original' check (source_type in ('original', 'public_domain', 'licensed', 'user_added')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.daily_quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quote_id uuid not null references public.quote_bank(id) on delete restrict,
  quote_date date not null,
  created_at timestamptz not null default now(),
  unique(user_id, quote_date)
);
```

### Row Level Security

Enable RLS:

```sql
alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.session_exercise_logs enable row level security;
alter table public.journal_entries enable row level security;
alter table public.daily_quotes enable row level security;
```

Policies:

```sql
create policy "profiles are owner readable"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles are owner writable"
on public.profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "sessions are owner scoped"
on public.workout_sessions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "journal entries are owner scoped"
on public.journal_entries for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "daily quotes are owner scoped"
on public.daily_quotes for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

Template/reference tables can be public read-only:

```sql
alter table public.exercises enable row level security;
alter table public.programs enable row level security;
alter table public.workout_days enable row level security;
alter table public.workout_items enable row level security;
alter table public.quote_bank enable row level security;

create policy "reference exercises are readable"
on public.exercises for select
using (true);

create policy "quote bank is readable"
on public.quote_bank for select
using (active = true);

create policy "template programs are readable"
on public.programs for select
using (is_template = true or owner_user_id = auth.uid());

create policy "workout days are readable"
on public.workout_days for select
using (true);

create policy "workout items are readable"
on public.workout_items for select
using (true);
```

Note: Adjust template table write policies for admin/seed scripts. Do not expose service role keys to the browser.

## 12. Quote Bank Seed

Use original quotes to avoid licensing/copyright issues.

```txt
Show up first. Momentum can meet you there.
Small reps done honestly beat perfect plans postponed.
Strength is built in ordinary minutes.
Do the next clean rep.
Your body hears consistency louder than intensity.
Start where you are. Track what you do. Build from there.
The win is not drama. The win is follow-through.
Move today so tomorrow has better options.
Discipline gets easier when the first step is obvious.
You do not need a perfect day to keep a promise.
Good training is attention plus patience.
The body adapts to what you repeat.
One session is a vote for the person you are becoming.
The goal is progress you can live with.
Control the rep you are in.
Energy follows action more often than action follows energy.
Make the healthy choice visible.
Consistency is a quiet form of confidence.
Keep the standard small enough to keep.
Recovery is part of the program.
```

Seed these with `author = 'FitOps Daily'`, `source_type = 'original'`.

## 13. Daily Workout Logic

Calendar mode:

```ts
function getWorkoutCodeForDate(date: Date) {
  const day = date.getDay(); // 0 Sun, 1 Mon, 2 Tue, 3 Wed
  if (day === 1) return 'A';
  if (day === 2) return 'B';
  if (day === 3) return 'C';
  return 'RECOVERY';
}
```

Rotating mode, future option:

- Find most recent completed workout code.
- Suggest the next code in A -> B -> C -> A.
- If no completed workout exists, suggest A.

Daily quote:

- On first load of `/today`, check `daily_quotes` for the signed-in user and date.
- If no row exists, choose a random active quote and insert it.
- Then always show that same row for that date.

## 14. Component Plan

Recommended components:

- `AppShell`
- `BottomNav`
- `TodayHeader`
- `DailyQuoteCard`
- `WorkoutDayCard`
- `ExerciseChecklist`
- `ExerciseCard`
- `ExerciseStatusButton`
- `JournalEditor`
- `ProgressSummary`
- `WeeklyCompletionStrip`
- `CalendarHeatmap`
- `ExerciseSourceBadge`
- `SafetyNotice`

Keep the UI practical and app-like:

- Clear top hierarchy
- Compact cards
- Large tap targets
- No giant marketing hero
- No decorative clutter
- Use icons for actions like complete, journal, source link, progress, settings

## 15. Visual Design Direction

Tone:

- Clean, focused, slightly tactical, not cheesy military cosplay.
- The app should feel calm and usable in the morning before a workout.

Suggested palette:

- Background: `#F7F4ED`
- Surface: `#FFFFFF`
- Text: `#1F241C`
- Muted text: `#66705F`
- Primary: `#3F5D46`
- Accent: `#C89B3C`
- Alert/pain: `#B9503E`
- Success: `#4E8B5A`

Typography:

- Use system font or Inter.
- Avoid oversized headings inside tool panels.
- Make exercise targets very readable.

## 16. Accountability Features

MVP:

- Daily completion status
- Exercise-level completion
- Weekly target: 3 workouts/week
- Streak count
- Calendar history
- Journal prompts
- Pain/problem flag visibility

Phase 2:

- Reminder notifications
- Weekly email summary
- "Missed workout recovery" flow
- Personal bests for plank time or reps
- Optional progress photos, stored privately in Supabase Storage

## 17. Environment Variables

Vercel and local `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Rules:

- `NEXT_PUBLIC_*` variables can be used in browser code.
- `SUPABASE_SERVICE_ROLE_KEY` must only be used in server-side seed/admin scripts.
- Never commit `.env.local`.

## 18. GitHub and Vercel Workflow

1. Create GitHub repo: `fitops-daily`
2. Push the Next.js app to GitHub.
3. Create a Supabase project.
4. Run migrations in Supabase SQL editor or Supabase CLI.
5. Add environment variables to Vercel.
6. Connect Vercel to GitHub.
7. Deploy from `main`.
8. Confirm auth callback URLs:
   - Local: `http://localhost:3000/auth/callback`
   - Production: `https://YOUR-VERCEL-DOMAIN.vercel.app/auth/callback`

## 19. MVP Build Milestones

### Milestone 1: App Foundation

- Next.js app created
- Tailwind/shadcn installed
- Supabase client configured
- Auth sign-in/sign-out working
- Protected routes working

### Milestone 2: Database and Seed Data

- Supabase tables created
- RLS policies enabled
- Routine seeded
- Exercise source links seeded
- Quote bank seeded

### Milestone 3: Today Page

- Today's workout appears correctly
- Recovery days appear correctly
- Exercise cards show targets and source links
- Journal entry saves
- Daily quote persists

### Milestone 4: Tracking

- Workout session creates/updates
- Exercise statuses save
- Whole workout completion works
- Streak and weekly progress calculate correctly

### Milestone 5: Reference and History

- Routine page works
- Exercise detail pages work
- Journal history works
- Progress page works

### Milestone 6: Polish and Deploy

- Mobile responsive
- Empty/loading/error states
- Accessibility pass
- Playwright smoke test
- Vercel deployment

## 20. Acceptance Criteria

The app is done when:

- I can log in.
- I can see the right workout for Monday, Tuesday, and Wednesday.
- I can see a recovery/catch-up view Thursday through Sunday.
- Every exercise has a source/reference link.
- Source links open official NASM, ACE, or similarly credible pages.
- I can mark exercise completion.
- I can mark the daily workout complete.
- I can save and edit today's journal note.
- The daily quote is stable for the day.
- The Progress page reflects saved workout history.
- Data is private to my Supabase user.
- The app is deployed on Vercel from GitHub.

## 21. Testing Checklist

Unit tests:

- `getWorkoutCodeForDate`
- streak calculation
- weekly completion calculation
- quote selection fallback

End-to-end tests:

- Log in or mock auth session
- Visit `/today`
- Mark one exercise done
- Save journal note
- Mark workout complete
- Visit `/progress`
- Confirm completion appears

Manual tests:

- Mobile viewport
- Desktop viewport
- Source links open correctly
- Logged-out user cannot view private pages
- Journal entry updates instead of duplicating for the same date

## 22. Future Enhancements

- In-app visual diagrams for start/middle/end exercise positions
- Apple Health or wearable integration
- Supabase Storage for progress photos
- Custom routine editor
- Exercise substitution library
- Export printable weekly checklist
- Reminder notifications
- "Travel mode" with no-equipment substitutions
- Form check notes by exercise

## 23. Cursor Prompt To Start Building

Paste this into Cursor after creating/opening the repo:

```txt
You are building FitOps Daily, a private personal workout tracker using Next.js App Router, TypeScript, Tailwind, shadcn/ui, Supabase Auth/Postgres, GitHub, and Vercel.

Use the build brief in outputs/military-workout-app-cursor-build-brief.md as the source of truth.

Build the MVP in this order:
1. Next.js app shell with protected routes.
2. Supabase client/server helpers and auth flow.
3. SQL migrations for the schema in the brief.
4. Seed data for the three-day military workout routine, exercises, accredited source links, and quote bank.
5. Today page with workout checklist, daily quote, and journal editor.
6. Routine, Exercise Detail, Journal, Progress, and Settings pages.
7. Mobile-first polish, loading/error states, and basic tests.

Keep the UI practical, clean, and app-like. The first screen after login should be Today, not a marketing page. Do not scrape or re-host NASM/ACE videos; link to the official source pages in a new tab.
```

## 24. Source Notes

The source strategy is based on the public NASM and ACE exercise libraries:

- NASM Exercise Library: https://www.nasm.org/workout-exercise-guidance
- NASM Resource Center Exercise Library: https://www.nasm.org/resource-center/exercise-library
- ACE Exercise Library: https://www.acefitness.org/resources/everyone/exercise-library/
- ACE describes its library as exercise descriptions and photos for proper form.
- NASM describes its library as step-by-step instruction and video guidance.

Some exercises in the original image were garbled, so this app uses the cleaned exercise names from the earlier guide. For exercises where an exact accredited source was not found, the app should label the source as a base movement or close variation instead of implying it is exact.
