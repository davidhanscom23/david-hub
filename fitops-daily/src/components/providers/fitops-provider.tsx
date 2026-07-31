"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  ExerciseStatus,
  JournalEntry,
  Profile,
  SessionExerciseLog,
  SessionStatus,
  WorkoutCode,
  WorkoutSession,
} from "@/lib/types";
import { EXERCISES, QUOTES, getExerciseById, getItemsForDay } from "@/lib/data/seed";
import {
  completeWorkout,
  ensureDailyQuote,
  ensureSession,
  exportData,
  loadState,
  saveState,
  sessionsToCsv,
  todayInProfileTz,
  updateExerciseLog,
  updateProfile,
  upsertJournal,
  type AppState,
} from "@/lib/data/store";

interface FitOpsContextValue {
  ready: boolean;
  state: AppState;
  today: string;
  loginDemo: () => void;
  logout: () => void;
  setProfile: (patch: Partial<Profile>) => void;
  getOrCreateSession: (dateStr?: string, code?: WorkoutCode) => WorkoutSession;
  setExerciseStatus: (
    logId: string,
    status: ExerciseStatus,
    notes?: string,
  ) => void;
  setSessionStatus: (
    sessionId: string,
    patch: Partial<
      Pick<WorkoutSession, "status" | "minutes" | "effortRpe" | "notes">
    >,
  ) => void;
  saveJournal: (
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
  ) => void;
  getJournal: (entryDate: string) => JournalEntry | undefined;
  getQuoteForDate: (dateStr: string) => { text: string; author: string };
  getSessionLogs: (sessionId: string) => SessionExerciseLog[];
  setExerciseNote: (exerciseId: string, note: string) => void;
  setSourceOverride: (
    exerciseId: string,
    override: { sourceUrl?: string; sourceName?: string; sourceMatchType?: string },
  ) => void;
  exportJson: () => string;
  exportCsv: () => string;
  clearAllData: () => void;
}

const FitOpsContext = createContext<FitOpsContextValue | null>(null);

export function FitOpsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  const commit = useCallback((next: AppState) => {
    setState(next);
    saveState(next);
  }, []);

  const today = state ? todayInProfileTz(state) : "";

  const value = useMemo<FitOpsContextValue>(() => {
    const safe = state ?? loadState();

    return {
      ready: state !== null,
      state: safe,
      today,
      loginDemo: () => commit({ ...safe, authenticated: true }),
      logout: () => commit({ ...safe, authenticated: false }),
      setProfile: (patch) => commit(updateProfile(safe, patch)),
      getOrCreateSession: (dateStr, code) => {
        const date = dateStr ?? todayInProfileTz(safe);
        const { state: next, session } = ensureSession(safe, date, code);
        const withQuote = ensureDailyQuote(next, date).state;
        commit(withQuote);
        return session;
      },
      setExerciseStatus: (logId, status, notes) => {
        commit(updateExerciseLog(safe, logId, { status, ...(notes !== undefined ? { notes } : {}) }));
      },
      setSessionStatus: (sessionId, patch) => {
        commit(completeWorkout(safe, sessionId, patch));
      },
      saveJournal: (entryDate, patch) => commit(upsertJournal(safe, entryDate, patch)),
      getJournal: (entryDate) =>
        safe.journals.find(
          (j) => j.userId === safe.profile.id && j.entryDate === entryDate,
        ),
      getQuoteForDate: (dateStr) => {
        const { state: next, quoteId } = ensureDailyQuote(safe, dateStr);
        if (next !== safe) commit(next);
        const quote = QUOTES.find((q) => q.id === quoteId) ?? QUOTES[0];
        return { text: quote.quoteText, author: quote.author };
      },
      getSessionLogs: (sessionId) =>
        safe.logs.filter((l) => l.sessionId === sessionId),
      setExerciseNote: (exerciseId, note) =>
        commit({
          ...safe,
          exerciseNotes: { ...safe.exerciseNotes, [exerciseId]: note },
        }),
      setSourceOverride: (exerciseId, override) =>
        commit({
          ...safe,
          sourceOverrides: {
            ...safe.sourceOverrides,
            [exerciseId]: { ...safe.sourceOverrides[exerciseId], ...override },
          },
        }),
      exportJson: () => JSON.stringify(exportData(safe), null, 2),
      exportCsv: () => sessionsToCsv(safe.sessions),
      clearAllData: () => {
        const cleared = loadState();
        const fresh = {
          ...cleared,
          authenticated: false,
          sessions: [],
          logs: [],
          journals: [],
          dailyQuotes: [],
          exerciseNotes: {},
          sourceOverrides: {},
          profile: {
            id: "demo-user",
            displayName: "Operator",
            timezone: "America/New_York",
            scheduleMode: "calendar" as const,
            preferredReminderTime: "07:00",
          },
        };
        localStorage.removeItem("fitops-daily-v1");
        commit(fresh);
      },
    };
  }, [state, today, commit]);

  return (
    <FitOpsContext.Provider value={value}>{children}</FitOpsContext.Provider>
  );
}

export function useFitOps() {
  const ctx = useContext(FitOpsContext);
  if (!ctx) throw new Error("useFitOps must be used within FitOpsProvider");
  return ctx;
}

export function useEnrichedLogs(session: WorkoutSession | null) {
  const { getSessionLogs, state } = useFitOps();
  if (!session || !session.workoutDayId) return [];
  const logs = getSessionLogs(session.id);
  const items = getItemsForDay(session.workoutDayId);
  return items.map((item) => {
    const exercise = getExerciseById(item.exerciseId)!;
    const override = state.sourceOverrides[exercise.id];
    const log = logs.find((l) => l.workoutItemId === item.id);
    return {
      item,
      exercise: {
        ...exercise,
        sourceUrl: override?.sourceUrl ?? exercise.sourceUrl,
        sourceName: override?.sourceName ?? exercise.sourceName,
        sourceMatchType:
          (override?.sourceMatchType as typeof exercise.sourceMatchType) ??
          exercise.sourceMatchType,
      },
      log,
    };
  });
}

export type { SessionStatus };
