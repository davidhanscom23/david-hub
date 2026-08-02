import type { AppState } from "@/lib/data/store";
import { defaultState } from "@/lib/data/store";
import { createClient } from "@/lib/supabase/client";
import type { Profile, ScheduleMode } from "@/lib/types";

export const CLOUD_STATE_VERSION = 1 as const;

/** Serializable training payload stored in profiles.app_state */
export interface CloudAppPayload {
  version: typeof CLOUD_STATE_VERSION;
  updatedAt: string;
  profile: Omit<Profile, "id">;
  sessions: AppState["sessions"];
  logs: AppState["logs"];
  journals: AppState["journals"];
  dailyQuotes: AppState["dailyQuotes"];
  exerciseNotes: AppState["exerciseNotes"];
  sourceOverrides: AppState["sourceOverrides"];
  alternateRegimen: AppState["alternateRegimen"];
  activeProgram: AppState["activeProgram"];
}

export interface RemoteProfileRow {
  display_name: string | null;
  timezone: string | null;
  schedule_mode: string | null;
  preferred_reminder_time: string | null;
  app_state: CloudAppPayload | null;
  app_state_updated_at: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isCloudAppPayload(value: unknown): value is CloudAppPayload {
  if (!isRecord(value)) return false;
  if (value.version !== CLOUD_STATE_VERSION) return false;
  if (typeof value.updatedAt !== "string") return false;
  if (!isRecord(value.profile)) return false;
  return (
    Array.isArray(value.sessions) &&
    Array.isArray(value.logs) &&
    Array.isArray(value.journals) &&
    Array.isArray(value.dailyQuotes)
  );
}

export function toCloudPayload(state: AppState): CloudAppPayload {
  const updatedAt = state.cloudUpdatedAt ?? new Date().toISOString();
  return {
    version: CLOUD_STATE_VERSION,
    updatedAt,
    profile: {
      displayName: state.profile.displayName,
      timezone: state.profile.timezone,
      scheduleMode: state.profile.scheduleMode,
      preferredReminderTime: state.profile.preferredReminderTime,
    },
    sessions: state.sessions,
    logs: state.logs,
    journals: state.journals,
    dailyQuotes: state.dailyQuotes,
    exerciseNotes: state.exerciseNotes,
    sourceOverrides: state.sourceOverrides,
    alternateRegimen: state.alternateRegimen,
    activeProgram: state.activeProgram,
  };
}

export function hasTrainingData(state: AppState): boolean {
  return (
    state.sessions.length > 0 ||
    state.journals.length > 0 ||
    state.logs.length > 0 ||
    Object.keys(state.exerciseNotes).length > 0 ||
    state.alternateRegimen !== null
  );
}

export function applyCloudPayload(
  userId: string,
  email: string | null,
  payload: CloudAppPayload,
): AppState {
  const base = defaultState({ id: userId });
  return {
    ...base,
    authenticated: true,
    authMode: "supabase",
    email,
    cloudUpdatedAt: payload.updatedAt,
    profile: {
      id: userId,
      displayName: payload.profile.displayName || base.profile.displayName,
      timezone: payload.profile.timezone || base.profile.timezone,
      scheduleMode: payload.profile.scheduleMode || base.profile.scheduleMode,
      preferredReminderTime:
        payload.profile.preferredReminderTime ??
        base.profile.preferredReminderTime,
    },
    sessions: payload.sessions,
    logs: payload.logs,
    journals: payload.journals,
    dailyQuotes: payload.dailyQuotes,
    exerciseNotes: payload.exerciseNotes ?? {},
    sourceOverrides: payload.sourceOverrides ?? {},
    alternateRegimen: payload.alternateRegimen ?? null,
    activeProgram: payload.activeProgram ?? "military",
  };
}

/** Last-write-wins: prefer the side with the newer cloudUpdatedAt / updatedAt. */
export function preferRemoteOverLocal(
  local: AppState,
  remote: CloudAppPayload | null,
): boolean {
  if (!remote) return false;
  if (!hasTrainingData(local)) return true;
  // Local data without a sync timestamp has not been pushed yet — keep it.
  if (!local.cloudUpdatedAt) return false;
  return remote.updatedAt > local.cloudUpdatedAt;
}

function normalizeReminder(value: string | null): string | null {
  if (!value) return null;
  // Postgres time may come back as HH:MM:SS
  return value.slice(0, 5);
}

export function mergeProfileRow(
  state: AppState,
  row: Pick<
    RemoteProfileRow,
    "display_name" | "timezone" | "schedule_mode" | "preferred_reminder_time"
  >,
): AppState {
  const scheduleMode =
    row.schedule_mode === "calendar" || row.schedule_mode === "rotating"
      ? (row.schedule_mode as ScheduleMode)
      : state.profile.scheduleMode;

  return {
    ...state,
    profile: {
      ...state.profile,
      displayName:
        state.profile.displayName ||
        row.display_name ||
        state.profile.displayName,
      timezone: row.timezone || state.profile.timezone,
      scheduleMode,
      preferredReminderTime:
        normalizeReminder(row.preferred_reminder_time) ??
        state.profile.preferredReminderTime,
    },
  };
}

export async function fetchRemoteProfile(
  userId: string,
): Promise<RemoteProfileRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "display_name, timezone, schedule_mode, preferred_reminder_time, app_state, app_state_updated_at",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const appState = isCloudAppPayload(data.app_state) ? data.app_state : null;
  return {
    display_name: data.display_name,
    timezone: data.timezone,
    schedule_mode: data.schedule_mode,
    preferred_reminder_time: data.preferred_reminder_time,
    app_state: appState,
    app_state_updated_at: data.app_state_updated_at,
  };
}

export async function pushAppState(state: AppState): Promise<void> {
  if (state.authMode !== "supabase") return;
  const supabase = createClient();
  const payload = toCloudPayload(state);
  const { error } = await supabase.from("profiles").upsert(
    {
      id: state.profile.id,
      display_name: state.profile.displayName,
      timezone: state.profile.timezone,
      schedule_mode: state.profile.scheduleMode,
      preferred_reminder_time: state.profile.preferredReminderTime,
      app_state: payload,
      app_state_updated_at: payload.updatedAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) throw error;
}

export async function clearRemoteAppState(userId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      app_state: null,
      app_state_updated_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (error) throw error;
}

export async function hydrateSupabaseState(input: {
  userId: string;
  email: string | null;
  displayName?: string | null;
  local: AppState;
}): Promise<{ state: AppState; shouldPush: boolean }> {
  let remote: RemoteProfileRow | null = null;
  try {
    remote = await fetchRemoteProfile(input.userId);
  } catch {
    remote = null;
  }

  const remotePayload = remote?.app_state ?? null;
  let state: AppState;
  let shouldPush = false;

  if (preferRemoteOverLocal(input.local, remotePayload) && remotePayload) {
    state = applyCloudPayload(input.userId, input.email, remotePayload);
  } else {
    state = {
      ...input.local,
      authenticated: true,
      authMode: "supabase",
      email: input.email,
      profile: {
        ...input.local.profile,
        id: input.userId,
        displayName:
          input.displayName?.trim() ||
          input.local.profile.displayName ||
          input.email?.split("@")[0] ||
          "Operator",
      },
    };
    shouldPush = hasTrainingData(state) || !remotePayload;
  }

  if (remote) {
    state = mergeProfileRow(state, remote);
  } else if (input.displayName?.trim()) {
    state = {
      ...state,
      profile: {
        ...state.profile,
        displayName: state.profile.displayName || input.displayName.trim(),
      },
    };
    shouldPush = true;
  }

  return { state, shouldPush };
}
