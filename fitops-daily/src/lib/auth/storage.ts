import type { AppState } from "@/lib/data/store";

const BASE_KEY = "fitops-daily-v1";

export type AuthMode = "anonymous" | "demo" | "local" | "supabase";

export function storageKeyForUser(userId: string | null | undefined): string {
  if (!userId || userId === "demo-user") return BASE_KEY;
  return `${BASE_KEY}:${userId}`;
}

export function loadStateForUser(userId: string | null | undefined): AppState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKeyForUser(userId));
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
}

export function saveStateForUser(
  userId: string | null | undefined,
  state: AppState,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKeyForUser(userId), JSON.stringify(state));
}

export function clearStateForUser(userId: string | null | undefined): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKeyForUser(userId));
}
