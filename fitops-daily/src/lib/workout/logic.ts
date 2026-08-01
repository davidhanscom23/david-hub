import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { format, parseISO, startOfWeek, addDays, isSameDay } from "date-fns";
import type {
  ScheduleMode,
  SessionStatus,
  WorkoutCode,
  WorkoutSession,
} from "@/lib/types";

/** Calendar mode: Mon=A, Tue=B, Wed=C, else recovery. */
export function getWorkoutCodeForDate(
  date: Date,
  mode: ScheduleMode = "calendar",
  recentCompletedCodes: WorkoutCode[] = [],
): WorkoutCode {
  if (mode === "rotating") {
    const last = recentCompletedCodes.find((c) => c === "A" || c === "B" || c === "C");
    if (!last) return "A";
    if (last === "A") return "B";
    if (last === "B") return "C";
    return "A";
  }

  const day = date.getDay(); // 0 Sun … 6 Sat (local date components expected)
  if (day === 1) return "A";
  if (day === 2) return "B";
  if (day === 3) return "C";
  return "RECOVERY";
}

export function getLocalDateString(date: Date, timeZone = "America/New_York"): string {
  try {
    return formatInTimeZone(date, timeZone, "yyyy-MM-dd");
  } catch {
    return format(date, "yyyy-MM-dd");
  }
}

export function getZonedNow(timeZone = "America/New_York"): Date {
  try {
    return toZonedTime(new Date(), timeZone);
  } catch {
    return new Date();
  }
}

export function parseLocalDate(dateStr: string): Date {
  return parseISO(`${dateStr}T12:00:00`);
}

export function formatDisplayDate(dateStr: string): string {
  return format(parseLocalDate(dateStr), "EEEE, MMM d");
}

export function formatTarget(count: number, unit: string): string {
  if (unit === "minute" && count === 1) return "1 minute";
  return `${count} ${unit}`;
}

export function weekDates(anchorDateStr: string, timeZone = "America/New_York"): string[] {
  const anchor = parseLocalDate(anchorDateStr);
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(start, i);
    return format(d, "yyyy-MM-dd");
  });
}

export function calculateStreak(
  sessions: Pick<WorkoutSession, "scheduledDate" | "status" | "workoutCode">[],
  todayStr: string,
): number {
  const doneDates = new Set(
    sessions
      .filter(
        (s) =>
          (s.status === "done" || s.status === "partial") &&
          s.workoutCode !== "RECOVERY",
      )
      .map((s) => s.scheduledDate),
  );

  if (doneDates.size === 0) return 0;

  let streak = 0;
  let cursor = parseLocalDate(todayStr);

  // If today isn't done yet, start from yesterday so an in-progress day doesn't break streak.
  if (!doneDates.has(todayStr)) {
    cursor = addDays(cursor, -1);
  }

  // Count consecutive calendar days that have a completed training session,
  // allowing recovery days without a session to continue the chain only when
  // we walk workout-completion weeks. Simpler MVP: count consecutive weeks
  // with at least one completed workout? Brief asks for streak of workouts.
  // Practical streak: consecutive days with completed A/B/C going backward,
  // skipping pure recovery calendar days that have no missed training obligation.
  while (true) {
    const dateStr = format(cursor, "yyyy-MM-dd");
    const code = getWorkoutCodeForDate(cursor, "calendar");
    if (code === "RECOVERY") {
      cursor = addDays(cursor, -1);
      // Don't walk forever — stop after 14 recovery-only days without a hit
      if (streak === 0) {
        const lookbackLimit = addDays(parseLocalDate(todayStr), -21);
        if (cursor < lookbackLimit) break;
      }
      continue;
    }
    if (doneDates.has(dateStr)) {
      streak += 1;
      cursor = addDays(cursor, -1);
      continue;
    }
    break;
  }

  return streak;
}

export function weeklyCompletion(
  sessions: Pick<WorkoutSession, "scheduledDate" | "status" | "workoutCode">[],
  weekDateStrs: string[],
): { completed: number; target: number; rate: number } {
  const weekSet = new Set(weekDateStrs);
  const completed = sessions.filter(
    (s) =>
      weekSet.has(s.scheduledDate) &&
      s.workoutCode !== "RECOVERY" &&
      (s.status === "done" || s.status === "partial"),
  ).length;
  const target = 3;
  return { completed, target, rate: Math.min(1, completed / target) };
}

export function completionRateByWeek(
  sessions: Pick<WorkoutSession, "scheduledDate" | "status" | "workoutCode">[],
  weeksBack = 8,
  todayStr?: string,
): { weekStart: string; completed: number; target: number }[] {
  const today = todayStr ? parseLocalDate(todayStr) : new Date();
  const result: { weekStart: string; completed: number; target: number }[] = [];
  for (let w = weeksBack - 1; w >= 0; w--) {
    const anchor = addDays(today, -w * 7);
    const start = startOfWeek(anchor, { weekStartsOn: 1 });
    const dates = Array.from({ length: 7 }, (_, i) =>
      format(addDays(start, i), "yyyy-MM-dd"),
    );
    const { completed, target } = weeklyCompletion(sessions, dates);
    result.push({ weekStart: format(start, "yyyy-MM-dd"), completed, target });
  }
  return result;
}

export function averageRpe(
  sessions: Pick<WorkoutSession, "effortRpe" | "status">[],
): number | null {
  const values = sessions
    .filter((s) => s.effortRpe != null && (s.status === "done" || s.status === "partial"))
    .map((s) => s.effortRpe as number);
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

export function isSameLocalDay(a: Date, b: Date): boolean {
  return isSameDay(a, b);
}

export function sessionIsComplete(status: SessionStatus): boolean {
  return status === "done" || status === "partial";
}

export function pickStableQuoteIndex(dateStr: string, quoteCount: number): number {
  if (quoteCount <= 0) return 0;
  // One unique quote per calendar day (no repeats within a year) when dateStr
  // is a valid yyyy-MM-dd string; falls back to a stable hash otherwise.
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    const dayOfYear = Math.floor(
      (Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 0)) / 86400000,
    ); // 1..366
    return (dayOfYear - 1) % quoteCount;
  }
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  return hash % quoteCount;
}
