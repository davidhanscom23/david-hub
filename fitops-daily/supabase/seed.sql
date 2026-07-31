-- FitOps Daily seed data
-- Run after 001_schema.sql in the Supabase SQL editor (service role).

insert into public.programs (id, name, description, is_template)
values (
  '11111111-1111-1111-1111-111111111111',
  'Military 3-Day Bodyweight',
  'Decoded military-style A/B/C plan',
  true
);

insert into public.workout_days (id, program_id, code, weekday, title, focus, sort_order) values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', 'A', 1, 'Workout A', 'Upper body + core', 1),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111', 'B', 2, 'Workout B', 'Conditioning + legs', 2),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111', 'C', 3, 'Workout C', 'Back + core + legs', 3),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111', 'RECOVERY', null, 'Recovery / Catch-Up', 'Walk, mobility, journaling', 4);

insert into public.quote_bank (quote_text, author, category, source_type, active) values
('Show up first. Momentum can meet you there.', 'FitOps Daily', 'fitness', 'original', true),
('Small reps done honestly beat perfect plans postponed.', 'FitOps Daily', 'fitness', 'original', true),
('Strength is built in ordinary minutes.', 'FitOps Daily', 'fitness', 'original', true),
('Do the next clean rep.', 'FitOps Daily', 'fitness', 'original', true),
('Your body hears consistency louder than intensity.', 'FitOps Daily', 'fitness', 'original', true),
('Start where you are. Track what you do. Build from there.', 'FitOps Daily', 'fitness', 'original', true),
('The win is not drama. The win is follow-through.', 'FitOps Daily', 'fitness', 'original', true),
('Move today so tomorrow has better options.', 'FitOps Daily', 'fitness', 'original', true),
('Discipline gets easier when the first step is obvious.', 'FitOps Daily', 'fitness', 'original', true),
('You do not need a perfect day to keep a promise.', 'FitOps Daily', 'fitness', 'original', true),
('Good training is attention plus patience.', 'FitOps Daily', 'fitness', 'original', true),
('The body adapts to what you repeat.', 'FitOps Daily', 'fitness', 'original', true),
('One session is a vote for the person you are becoming.', 'FitOps Daily', 'fitness', 'original', true),
('The goal is progress you can live with.', 'FitOps Daily', 'fitness', 'original', true),
('Control the rep you are in.', 'FitOps Daily', 'fitness', 'original', true),
('Energy follows action more often than action follows energy.', 'FitOps Daily', 'fitness', 'original', true),
('Make the healthy choice visible.', 'FitOps Daily', 'fitness', 'original', true),
('Consistency is a quiet form of confidence.', 'FitOps Daily', 'fitness', 'original', true),
('Keep the standard small enough to keep.', 'FitOps Daily', 'fitness', 'original', true),
('Recovery is part of the program.', 'FitOps Daily', 'fitness', 'original', true);

-- Full exercise + workout_item catalog is also shipped in the app at
-- src/lib/data/seed.ts for local demo mode. To load the same catalog into
-- Postgres, run: npm run seed:sql
-- which writes supabase/seed_exercises.sql from the TypeScript source of truth.
