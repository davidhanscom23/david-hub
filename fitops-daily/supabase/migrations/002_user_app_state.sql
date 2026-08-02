-- Persist each user's FitOps app blob on their profile so training data
-- follows them across devices (Auth alone is not enough).
alter table public.profiles
  add column if not exists app_state jsonb,
  add column if not exists app_state_updated_at timestamptz;

comment on column public.profiles.app_state is
  'Serialized FitOps client state (sessions, journals, preferences, etc.)';
comment on column public.profiles.app_state_updated_at is
  'ISO timestamp of the last app_state write; used for last-write-wins sync';
