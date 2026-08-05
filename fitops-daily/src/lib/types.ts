export type ExerciseStatus =
  | "planned"
  | "done"
  | "partial"
  | "skipped"
  | "pain";

export type SessionStatus = "planned" | "done" | "partial" | "skipped";

export type ScheduleMode = "calendar" | "rotating";

export type SourceMatchType =
  | "exact"
  | "close variation"
  | "base movement"
  | "exact article";

export type WorkoutCode = "A" | "B" | "C" | "RECOVERY";

/** How hard each catalog exercise should feel in Today / Routine. */
export type DifficultyMode = "modified" | "normal" | "advanced";

export type ActiveProgram = "military" | "alternate" | "custom";

export type SexPreference = "female" | "male" | "unspecified";

export interface Profile {
  id: string;
  displayName: string;
  timezone: string;
  scheduleMode: ScheduleMode;
  preferredReminderTime: string | null;
}

export interface Exercise {
  id: string;
  slug: string;
  name: string;
  category: string;
  equipment: string;
  primaryMuscles: string[];
  description: string;
  shortCue: string;
  commonMistake: string;
  regression: string;
  progression: string;
  sourceName: string;
  sourceUrl: string;
  sourceMatchType: SourceMatchType;
  sourceNotes: string;
  /** Official/accredited demo on YouTube for in-app playback. */
  videoYoutubeId: string;
}

/** Modified or advanced presentation of a catalog exercise. */
export interface ExerciseVariant {
  name: string;
  shortCue: string;
  description: string;
  videoYoutubeId: string;
  /** Multiply the workout-item target (e.g. 0.7 easier, 1.25 harder). */
  targetScale: number;
}

export interface CustomWorkoutExercise {
  slug: string;
  targetCount: number;
  targetUnit: string;
  notes: string;
}

export interface CustomWorkoutDay {
  code: "A" | "B" | "C";
  title: string;
  focus: string;
  exercises: CustomWorkoutExercise[];
}

export interface CustomWorkout {
  id: string;
  name: string;
  summary: string;
  updatedAt: string;
  days: CustomWorkoutDay[];
}

/** Persisted body-goal planner form fields. */
export interface CalculatorDraft {
  sex: SexPreference;
  heightIn: string;
  currentWeightLb: string;
  currentBmi: string;
  goalWeightLb: string;
  waistIn: string;
  chestIn: string;
  hipsIn: string;
  goalWaistIn: string;
  goalFocus: "fat_loss" | "muscle_gain" | "recomp" | "endurance";
  daysPerWeek: string;
  experience: "beginner" | "intermediate";
}

export interface WorkoutDay {
  id: string;
  code: WorkoutCode;
  weekday: number | null;
  title: string;
  focus: string;
  sortOrder: number;
}

export interface WorkoutItem {
  id: string;
  workoutDayId: string;
  exerciseId: string;
  orderIndex: number;
  targetCount: number;
  targetUnit: string;
  notes: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutDayId: string | null;
  workoutCode: WorkoutCode;
  scheduledDate: string;
  status: SessionStatus;
  minutes: number | null;
  effortRpe: number | null;
  completedAt: string | null;
  notes: string;
}

export interface SessionExerciseLog {
  id: string;
  sessionId: string;
  workoutItemId: string;
  status: ExerciseStatus;
  completedCount: number | null;
  notes: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  entryDate: string;
  body: string;
  mood: number | null;
  energy: number | null;
  soreness: number | null;
  smallWin: string;
  completed: string;
  hard: string;
  adjust: string;
}

export interface Quote {
  id: string;
  quoteText: string;
  author: string;
  category: string;
}

export interface DailyQuote {
  id: string;
  userId: string;
  quoteId: string;
  quoteDate: string;
}

export interface EnrichedWorkoutItem extends WorkoutItem {
  exercise: Exercise;
}

export interface EnrichedSessionLog extends SessionExerciseLog {
  item: EnrichedWorkoutItem;
}
