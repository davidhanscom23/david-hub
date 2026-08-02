"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import type { GeneratedRegimen } from "@/lib/calculator/types";
import type { AuthMode } from "@/lib/auth/storage";
import { clearStateForUser } from "@/lib/auth/storage";
import {
  createLocalAccount,
  getLocalAccountById,
  getLocalSessionUserId,
  setLocalSession,
  verifyLocalAccount,
} from "@/lib/auth/local-accounts";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  clearRemoteAppState,
  hydrateSupabaseState,
  pushAppState,
} from "@/lib/supabase/sync";
import { DEMO_USER_ID, QUOTES, getExerciseById, getItemsForDay } from "@/lib/data/seed";
import {
  clearUserData,
  completeWorkout,
  defaultState,
  ensureDailyQuote,
  ensureSession,
  exportData,
  loadState,
  saveState,
  sessionsToCsv,
  todayInProfileTz,
  touchCloudUpdatedAt,
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
  signupLocal: (input: {
    email: string;
    password: string;
    displayName: string;
  }) => Promise<void>;
  loginLocal: (email: string, password: string) => Promise<void>;
  loginWithSupabaseSession: (input: {
    userId: string;
    email: string | null;
    displayName?: string | null;
  }) => Promise<void>;
  cloudSyncError: string | null;
  logout: () => Promise<void>;
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
  saveAlternateRegimen: (regimen: GeneratedRegimen | null) => void;
  setActiveProgram: (program: "military" | "alternate") => void;
  exportJson: () => string;
  exportCsv: () => string;
  clearAllData: () => void;
}

const FitOpsContext = createContext<FitOpsContextValue | null>(null);

function activateUserState(input: {
  userId: string;
  email: string | null;
  displayName?: string | null;
  authMode: AuthMode;
}): AppState {
  const existing = loadState(input.userId);
  const next: AppState = {
    ...existing,
    authenticated: true,
    authMode: input.authMode,
    email: input.email,
    profile: {
      ...existing.profile,
      id: input.userId,
      displayName:
        input.displayName?.trim() ||
        existing.profile.displayName ||
        input.email?.split("@")[0] ||
        "Operator",
    },
  };
  saveState(next);
  return next;
}

export function FitOpsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydratedUserId = useRef<string | null>(null);
  const hydrateInFlight = useRef<Promise<void> | null>(null);

  const scheduleCloudPush = useCallback((next: AppState) => {
    if (next.authMode !== "supabase") return;
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => {
      void pushAppState(next)
        .then(() => setCloudSyncError(null))
        .catch((err) => {
          setCloudSyncError(
            err instanceof Error
              ? err.message
              : "Could not sync to Supabase. Check that migration 002 is applied.",
          );
        });
    }, 600);
  }, []);

  const applySupabaseUser = useCallback(
    async (input: {
      userId: string;
      email: string | null;
      displayName?: string | null;
    }) => {
      if (hydratedUserId.current === input.userId) return;
      if (hydrateInFlight.current) {
        await hydrateInFlight.current;
        if (hydratedUserId.current === input.userId) return;
      }

      const run = (async () => {
        setLocalSession(null);
        const local = loadState(input.userId);
        const { state: hydrated, shouldPush } = await hydrateSupabaseState({
          userId: input.userId,
          email: input.email,
          displayName: input.displayName,
          local,
        });
        saveState(hydrated);
        setState(hydrated);
        hydratedUserId.current = input.userId;
        if (shouldPush) {
          try {
            const stamped = touchCloudUpdatedAt(hydrated);
            saveState(stamped);
            setState(stamped);
            await pushAppState(stamped);
            setCloudSyncError(null);
          } catch (err) {
            setCloudSyncError(
              err instanceof Error
                ? err.message
                : "Could not sync to Supabase. Check that migration 002 is applied.",
            );
          }
        }
      })();

      hydrateInFlight.current = run;
      try {
        await run;
      } finally {
        if (hydrateInFlight.current === run) hydrateInFlight.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          const { data } = await supabase.auth.getSession();
          const session = data.session;
          if (session?.user && !cancelled) {
            await applySupabaseUser({
              userId: session.user.id,
              email: session.user.email ?? null,
              displayName:
                (session.user.user_metadata?.display_name as string) || null,
            });
            return;
          }
        } catch {
          // Fall through to local session.
        }
      }

      const localId = getLocalSessionUserId();
      if (localId) {
        const account = getLocalAccountById(localId);
        if (account && !cancelled) {
          setState(
            activateUserState({
              userId: account.id,
              email: account.email,
              displayName: account.displayName,
              authMode: "local",
            }),
          );
          return;
        }
        setLocalSession(null);
      }

      if (!cancelled) setState(defaultState());
    }

    void boot();

    if (!isSupabaseConfigured()) return;

    let unsubscribe = () => {};
    try {
      const supabase = createClient();
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (cancelled) return;
        if (event === "SIGNED_OUT") {
          hydratedUserId.current = null;
          return;
        }
        if (
          session?.user &&
          (event === "SIGNED_IN" || event === "INITIAL_SESSION")
        ) {
          void applySupabaseUser({
            userId: session.user.id,
            email: session.user.email ?? null,
            displayName:
              (session.user.user_metadata?.display_name as string) || null,
          });
        }
      });
      unsubscribe = () => data.subscription.unsubscribe();
    } catch {
      // ignore
    }

    return () => {
      cancelled = true;
      unsubscribe();
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [applySupabaseUser]);

  const commit = useCallback(
    (updater: Updater) => {
      setState((prev) => {
        const base = prev ?? defaultState();
        let next = updater(base);
        if (next.authenticated) {
          if (next.authMode === "supabase") {
            next = touchCloudUpdatedAt(next);
            saveState(next);
            scheduleCloudPush(next);
          } else {
            saveState(next);
          }
        }
        return next;
      });
    },
    [scheduleCloudPush],
  );

  const today = state ? todayInProfileTz(state) : "";

  const loginDemo = useCallback(() => {
    const next = activateUserState({
      userId: DEMO_USER_ID,
      email: null,
      displayName: "Operator",
      authMode: "demo",
    });
    setLocalSession(null);
    setState(next);
  }, []);

  const signupLocal = useCallback(
    async (input: {
      email: string;
      password: string;
      displayName: string;
    }) => {
      const account = await createLocalAccount(input);
      setLocalSession(account.id);
      setState(
        activateUserState({
          userId: account.id,
          email: account.email,
          displayName: account.displayName,
          authMode: "local",
        }),
      );
    },
    [],
  );

  const loginLocal = useCallback(async (email: string, password: string) => {
    const account = await verifyLocalAccount(email, password);
    setLocalSession(account.id);
    setState(
      activateUserState({
        userId: account.id,
        email: account.email,
        displayName: account.displayName,
        authMode: "local",
      }),
    );
  }, []);

  const loginWithSupabaseSession = useCallback(
    async (input: {
      userId: string;
      email: string | null;
      displayName?: string | null;
    }) => {
      await applySupabaseUser(input);
    },
    [applySupabaseUser],
  );

  const logout = useCallback(async () => {
    if (pushTimer.current) clearTimeout(pushTimer.current);
    hydratedUserId.current = null;
    setLocalSession(null);
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    setCloudSyncError(null);
    setState(defaultState());
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
      const base = state ?? defaultState();
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
      const base = state ?? defaultState();
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

  const saveAlternateRegimen = useCallback(
    (regimen: GeneratedRegimen | null) => {
      commit((prev) => ({
        ...prev,
        alternateRegimen: regimen,
        activeProgram: regimen ? "alternate" : "military",
      }));
    },
    [commit],
  );

  const setActiveProgram = useCallback(
    (program: "military" | "alternate") => {
      commit((prev) => ({ ...prev, activeProgram: program }));
    },
    [commit],
  );

  const exportJson = useCallback(() => {
    return JSON.stringify(exportData(state ?? defaultState()), null, 2);
  }, [state]);

  const exportCsv = useCallback(() => {
    return sessionsToCsv((state ?? defaultState()).sessions);
  }, [state]);

  const clearAllData = useCallback(() => {
    const userId = state?.profile.id ?? DEMO_USER_ID;
    clearUserData(userId);
    clearStateForUser(userId);
    const authMode = state?.authMode ?? "anonymous";
    const email = state?.email ?? null;
    if (authMode === "supabase") {
      void clearRemoteAppState(userId).catch(() => {
        setCloudSyncError("Local data cleared; cloud clear failed.");
      });
    }
    if (authMode === "local" || authMode === "supabase" || authMode === "demo") {
      const next = activateUserState({
        userId,
        email,
        displayName: state?.profile.displayName,
        authMode,
      });
      setState(next);
      if (authMode === "supabase") scheduleCloudPush(touchCloudUpdatedAt(next));
    } else {
      setState(defaultState());
    }
  }, [scheduleCloudPush, state]);

  const value = useMemo<FitOpsContextValue>(
    () => ({
      ready: state !== null,
      state: state ?? defaultState(),
      today,
      loginDemo,
      signupLocal,
      loginLocal,
      loginWithSupabaseSession,
      cloudSyncError,
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
      saveAlternateRegimen,
      setActiveProgram,
      exportJson,
      exportCsv,
      clearAllData,
    }),
    [
      state,
      today,
      loginDemo,
      signupLocal,
      loginLocal,
      loginWithSupabaseSession,
      cloudSyncError,
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
      saveAlternateRegimen,
      setActiveProgram,
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
