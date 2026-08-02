import type {
  DailyQuote,
  ExerciseStatus,
  JournalEntry,
  Profile,
  SessionExerciseLog,
  SessionStatus,
  WorkoutCode,
  WorkoutSession,
} from "@/lib/types";
import type { GeneratedRegimen } from "@/lib/calculator/types";
import type { AuthMode } from "@/lib/auth/storage";
import {
  clearStateForUser,
  loadStateForUser,
  saveStateForUser,
} from "@/lib/auth/storage";
import {
  DEMO_USER_ID,
  EXERCISES,
  QUOTES,
  WORKOUT_DAYS,
  WORKOUT_ITEMS,
  getItemsForDay,
  getWorkoutDayByCode,
} from "@/lib/data/seed";
import {
  getLocalDateString,
  getWorkoutCodeForDate,
  getZonedNow,
  pickStableQuoteIndex,
} from "@/lib/workout/logic";

export interface AppState {
  authenticated: boolean;
  authMode: AuthMode;
  email: string | null;
  profile: Profile;
  sessions: WorkoutSession[];
  logs: SessionExerciseLog[];
  journals: JournalEntry[];
  dailyQuotes: DailyQuote[];
  exerciseNotes: Record<string, string>;
  sourceOverrides: Record<
    string,
    { sourceUrl?: string; sourceName?: string; sourceMatchType?: string }
  >;
  /** Saved alternate regimen from the body calculator. */
  alternateRegimen: GeneratedRegimen | null;
  /** Which plan Today/Routine should emphasize. */
  activeProgram: "military" | "alternate";
}

export function defaultState(overrides?: Partial<Profile>): AppState {
  return {
    authenticated: false,
    authMode: "anonymous",
    email: null,
    profile: {
      id: DEMO_USER_ID,
      displayName: "Operator",
      timezone: "America/New_York",
      scheduleMode: "calendar",
      preferredReminderTime: "07:00",
      ...overrides,
    },
    sessions: [],
    logs: [],
    journals: [],
    dailyQuotes: [],
    exerciseNotes: {},
    sourceOverrides: {},
    alternateRegimen: null,
    activeProgram: "military",
  };
}

function uid(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function loadState(userId?: string | null): AppState {
  if (typeof window === "undefined") return defaultState();
  const saved = loadStateForUser(userId ?? DEMO_USER_ID);
  if (!saved) return defaultState(userId ? { id: userId } : undefined);
  return {
    ...defaultState(userId ? { id: userId } : undefined),
    ...saved,
    profile: {
      ...defaultState().profile,
      ...saved.profile,
      id: userId || saved.profile?.id || DEMO_USER_ID,
    },
  };
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  saveStateForUser(state.profile.id, state);
}

export function clearUserData(userId: string): void {
  clearStateForUser(userId);
}

export function ensureDailyQuote(
  state: AppState,
  dateStr: string,
): { state: AppState; quoteId: string } {
  const existing = state.dailyQuotes.find(
    (q) => q.userId === state.profile.id && q.quoteDate === dateStr,
  );
  if (existing) return { state, quoteId: existing.quoteId };

  const index = pickStableQuoteIndex(dateStr, QUOTES.length);
  const quote = QUOTES[index];
  const row: DailyQuote = {
    id: uid("dq"),
    userId: state.profile.id,
    quoteId: quote.id,
    quoteDate: dateStr,
  };
  return {
    state: { ...state, dailyQuotes: [...state.dailyQuotes, row] },
    quoteId: quote.id,
  };
}

export function ensureSession(
  state: AppState,
  dateStr: string,
  code?: WorkoutCode,
): { state: AppState; session: WorkoutSession } {
  const workoutCode =
    code ??
    getWorkoutCodeForDate(
      new Date(`${dateStr}T12:00:00`),
      state.profile.scheduleMode,
      state.sessions
        .filter((s) => s.status === "done" || s.status === "partial")
        .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate))
        .map((s) => s.workoutCode),
    );

  const day = getWorkoutDayByCode(workoutCode);
  const existing = state.sessions.find(
    (s) =>
      s.userId === state.profile.id &&
      s.scheduledDate === dateStr &&
      (workoutCode === "RECOVERY"
        ? s.workoutCode === "RECOVERY"
        : s.workoutDayId === day?.id),
  );
  if (existing) return { state, session: existing };

  const session: WorkoutSession = {
    id: uid("sess"),
    userId: state.profile.id,
    workoutDayId: day?.id ?? null,
    workoutCode,
    scheduledDate: dateStr,
    status: "planned",
    minutes: null,
    effortRpe: null,
    completedAt: null,
    notes: "",
  };

  let next: AppState = { ...state, sessions: [...state.sessions, session] };

  if (day && workoutCode !== "RECOVERY") {
    const items = getItemsForDay(day.id);
    const newLogs: SessionExerciseLog[] = items.map((item) => ({
      id: uid("log"),
      sessionId: session.id,
      workoutItemId: item.id,
      status: "planned" as ExerciseStatus,
      completedCount: null,
      notes: "",
    }));
    next = { ...next, logs: [...next.logs, ...newLogs] };
  }

  return { state: next, session };
}

export function updateExerciseLog(
  state: AppState,
  logId: string,
  patch: Partial<Pick<SessionExerciseLog, "status" | "completedCount" | "notes">>,
): AppState {
  return {
    ...state,
    logs: state.logs.map((l) => (l.id === logId ? { ...l, ...patch } : l)),
  };
}

export function completeWorkout(
  state: AppState,
  sessionId: string,
  patch: Partial<
    Pick<WorkoutSession, "status" | "minutes" | "effortRpe" | "notes">
  > = {},
): AppState {
  return {
    ...state,
    sessions: state.sessions.map((s) =>
      s.id === sessionId
        ? {
            ...s,
            status: patch.status ?? "done",
            minutes: patch.minutes ?? s.minutes,
            effortRpe: patch.effortRpe ?? s.effortRpe,
            notes: patch.notes ?? s.notes,
            completedAt: new Date().toISOString(),
          }
        : s,
    ),
  };
}

export function upsertJournal(
  state: AppState,
  entryDate: string,
  patch: Partial<
    Pick<
      JournalEntry,
      | "body"
      | "mood"
      | "energy"
      | "soreness"
      | "smallWin"
      | "completed"
      | "hard"
      | "adjust"
    >
  >,
): AppState {
  const existing = state.journals.find(
    (j) => j.userId === state.profile.id && j.entryDate === entryDate,
  );
  if (existing) {
    return {
      ...state,
      journals: state.journals.map((j) =>
        j.id === existing.id ? { ...j, ...patch } : j,
      ),
    };
  }
  const entry: JournalEntry = {
    id: uid("journal"),
    userId: state.profile.id,
    entryDate,
    body: "",
    mood: null,
    energy: null,
    soreness: null,
    smallWin: "",
    completed: "",
    hard: "",
    adjust: "",
    ...patch,
  };
  return { ...state, journals: [...state.journals, entry] };
}

export function updateProfile(
  state: AppState,
  patch: Partial<Profile>,
): AppState {
  return { ...state, profile: { ...state.profile, ...patch } };
}

export function exportData(state: AppState) {
  return {
    exportedAt: new Date().toISOString(),
    profile: state.profile,
    sessions: state.sessions,
    logs: state.logs,
    journals: state.journals,
    dailyQuotes: state.dailyQuotes,
    exerciseNotes: state.exerciseNotes,
    sourceOverrides: state.sourceOverrides,
    alternateRegimen: state.alternateRegimen,
    activeProgram: state.activeProgram,
    catalog: { exercises: EXERCISES, workoutDays: WORKOUT_DAYS, workoutItems: WORKOUT_ITEMS, quotes: QUOTES },
  };
}

export function todayInProfileTz(state: AppState): string {
  return getLocalDateString(getZonedNow(state.profile.timezone), state.profile.timezone);
}

export function sessionsToCsv(sessions: WorkoutSession[]): string {
  const header = [
    "date",
    "workout",
    "status",
    "minutes",
    "effort_rpe",
    "completed_at",
    "notes",
  ];
  const rows = sessions.map((s) =>
    [
      s.scheduledDate,
      s.workoutCode,
      s.status,
      s.minutes ?? "",
      s.effortRpe ?? "",
      s.completedAt ?? "",
      JSON.stringify(s.notes ?? ""),
    ].join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

export type { SessionStatus, WorkoutCode };
