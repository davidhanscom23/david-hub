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
  WorkoutCode,
  WorkoutSession,
} from "@/lib/types";
import { QUOTES, getExerciseById, getItemsForDay } from "@/lib/data/seed";
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

type Updater = (prev: AppState) => AppState;

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
  ensureQuoteForDate: (dateStr: string) => void;
  getSessionLogs: (sessionId: string) => SessionExerciseLog[];
  setExerciseNote: (exerciseId: string, note: string) => void;
  setSourceOverride: (
    exerciseId: string,
    override: {
      sourceUrl?: string;
      sourceName?: string;
      sourceMatchType?: string;
    },
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

  const commit = useCallback((updater: Updater) => {
    setState((prev) => {
      const base = prev ?? loadState();
      const next = updater(base);
      saveState(next);
      return next;
    });
  }, []);

  const today = state ? todayInProfileTz(state) : "";

  const loginDemo = useCallback(() => {
    setState((prev) => {
      const next = { ...(prev ?? loadState()), authenticated: true };
      saveState(next);
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    setState((prev) => {
      const next = { ...(prev ?? loadState()), authenticated: false };
      saveState(next);
      return next;
    });
  }, []);

  const setProfile = useCallback(
    (patch: Partial<Profile>) => {
      commit((prev) => updateProfile(prev, patch));
    },
    [commit],
  );

  const getOrCreateSession = useCallback(
    (dateStr?: string, code?: WorkoutCode) => {
      let created: WorkoutSession | null = null;
      commit((prev) => {
        const date = dateStr ?? todayInProfileTz(prev);
        const ensured = ensureSession(prev, date, code);
        created = ensured.session;
        return ensureDailyQuote(ensured.state, date).state;
      });
      if (created) return created;
      const base = state ?? loadState();
      const date = dateStr ?? todayInProfileTz(base);
      return ensureSession(base, date, code).session;
    },
    [commit, state],
  );

  const setExerciseStatus = useCallback(
    (logId: string, status: ExerciseStatus, notes?: string) => {
      commit((prev) =>
        updateExerciseLog(prev, logId, {
          status,
          ...(notes !== undefined ? { notes } : {}),
        }),
      );
    },
    [commit],
  );

  const setSessionStatus = useCallback(
    (
      sessionId: string,
      patch: Partial<
        Pick<WorkoutSession, "status" | "minutes" | "effortRpe" | "notes">
      >,
    ) => {
      commit((prev) => completeWorkout(prev, sessionId, patch));
    },
    [commit],
  );

  const saveJournal = useCallback(
    (
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
    ) => {
      commit((prev) => upsertJournal(prev, entryDate, patch));
    },
    [commit],
  );

  const getJournal = useCallback(
    (entryDate: string) => {
      if (!state) return undefined;
      return state.journals.find(
        (j) => j.userId === state.profile.id && j.entryDate === entryDate,
      );
    },
    [state],
  );

  const getQuoteForDate = useCallback(
    (dateStr: string) => {
      const base = state ?? loadState();
      const { quoteId } = ensureDailyQuote(base, dateStr);
      const quote = QUOTES.find((q) => q.id === quoteId) ?? QUOTES[0];
      return { text: quote.quoteText, author: quote.author };
    },
    [state],
  );

  const ensureQuoteForDate = useCallback(
    (dateStr: string) => {
      commit((prev) => ensureDailyQuote(prev, dateStr).state);
    },
    [commit],
  );

  const getSessionLogs = useCallback(
    (sessionId: string) =>
      state ? state.logs.filter((l) => l.sessionId === sessionId) : [],
    [state],
  );

  const setExerciseNote = useCallback(
    (exerciseId: string, note: string) => {
      commit((prev) => ({
        ...prev,
        exerciseNotes: { ...prev.exerciseNotes, [exerciseId]: note },
      }));
    },
    [commit],
  );

  const setSourceOverride = useCallback(
    (
      exerciseId: string,
      override: {
        sourceUrl?: string;
        sourceName?: string;
        sourceMatchType?: string;
      },
    ) => {
      commit((prev) => ({
        ...prev,
        sourceOverrides: {
          ...prev.sourceOverrides,
          [exerciseId]: { ...prev.sourceOverrides[exerciseId], ...override },
        },
      }));
    },
    [commit],
  );

  const exportJson = useCallback(() => {
    return JSON.stringify(exportData(state ?? loadState()), null, 2);
  }, [state]);

  const exportCsv = useCallback(() => {
    return sessionsToCsv((state ?? loadState()).sessions);
  }, [state]);

  const clearAllData = useCallback(() => {
    localStorage.removeItem("fitops-daily-v1");
    const fresh = loadState();
    setState(fresh);
    saveState(fresh);
  }, []);

  const value = useMemo<FitOpsContextValue>(
    () => ({
      ready: state !== null,
      state: state ?? loadState(),
      today,
      loginDemo,
      logout,
      setProfile,
      getOrCreateSession,
      setExerciseStatus,
      setSessionStatus,
      saveJournal,
      getJournal,
      getQuoteForDate,
      ensureQuoteForDate,
      getSessionLogs,
      setExerciseNote,
      setSourceOverride,
      exportJson,
      exportCsv,
      clearAllData,
    }),
    [
      state,
      today,
      loginDemo,
      logout,
      setProfile,
      getOrCreateSession,
      setExerciseStatus,
      setSessionStatus,
      saveJournal,
      getJournal,
      getQuoteForDate,
      ensureQuoteForDate,
      getSessionLogs,
      setExerciseNote,
      setSourceOverride,
      exportJson,
      exportCsv,
      clearAllData,
    ],
  );

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
