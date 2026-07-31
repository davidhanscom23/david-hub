-- FitOps Daily schema (from build brief)
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
  description text,
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

alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.session_exercise_logs enable row level security;
alter table public.journal_entries enable row level security;
alter table public.daily_quotes enable row level security;
alter table public.exercises enable row level security;
alter table public.workout_days enable row level security;
alter table public.workout_items enable row level security;
alter table public.quote_bank enable row level security;

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

create policy "session logs via session ownership"
on public.session_exercise_logs for all
using (
  exists (
    select 1 from public.workout_sessions s
    where s.id = session_id and s.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.workout_sessions s
    where s.id = session_id and s.user_id = auth.uid()
  )
);

create policy "journal entries are owner scoped"
on public.journal_entries for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "daily quotes are owner scoped"
on public.daily_quotes for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
