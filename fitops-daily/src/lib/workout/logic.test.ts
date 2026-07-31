import { describe, expect, it } from "vitest";
import {
  calculateStreak,
  getWorkoutCodeForDate,
  pickStableQuoteIndex,
  weeklyCompletion,
} from "@/lib/workout/logic";
import type { WorkoutSession } from "@/lib/types";

describe("getWorkoutCodeForDate", () => {
  it("maps Mon/Tue/Wed to A/B/C in calendar mode", () => {
    expect(getWorkoutCodeForDate(new Date("2026-07-27T12:00:00"))).toBe("A"); // Mon
    expect(getWorkoutCodeForDate(new Date("2026-07-28T12:00:00"))).toBe("B"); // Tue
    expect(getWorkoutCodeForDate(new Date("2026-07-29T12:00:00"))).toBe("C"); // Wed
  });

  it("returns RECOVERY for Thu–Sun", () => {
    expect(getWorkoutCodeForDate(new Date("2026-07-30T12:00:00"))).toBe(
      "RECOVERY",
    );
    expect(getWorkoutCodeForDate(new Date("2026-07-31T12:00:00"))).toBe(
      "RECOVERY",
    );
    expect(getWorkoutCodeForDate(new Date("2026-08-01T12:00:00"))).toBe(
      "RECOVERY",
    );
    expect(getWorkoutCodeForDate(new Date("2026-08-02T12:00:00"))).toBe(
      "RECOVERY",
    );
  });

  it("rotates A→B→C based on recent completions", () => {
    expect(getWorkoutCodeForDate(new Date(), "rotating", [])).toBe("A");
    expect(getWorkoutCodeForDate(new Date(), "rotating", ["A"])).toBe("B");
    expect(getWorkoutCodeForDate(new Date(), "rotating", ["B"])).toBe("C");
    expect(getWorkoutCodeForDate(new Date(), "rotating", ["C"])).toBe("A");
  });
});

describe("calculateStreak", () => {
  const session = (
    date: string,
    code: WorkoutSession["workoutCode"],
    status: WorkoutSession["status"],
  ): WorkoutSession => ({
    id: date,
    userId: "u",
    workoutDayId: "d",
    workoutCode: code,
    scheduledDate: date,
    status,
    minutes: 30,
    effortRpe: 7,
    completedAt: null,
    notes: "",
  });

  it("counts consecutive training-day completions", () => {
    const sessions = [
      session("2026-07-27", "A", "done"),
      session("2026-07-28", "B", "done"),
      session("2026-07-29", "C", "partial"),
    ];
    expect(calculateStreak(sessions, "2026-07-29")).toBe(3);
  });

  it("returns 0 with no completions", () => {
    expect(calculateStreak([], "2026-07-31")).toBe(0);
  });
});

describe("weeklyCompletion", () => {
  it("targets 3 workouts per week", () => {
    const week = [
      "2026-07-27",
      "2026-07-28",
      "2026-07-29",
      "2026-07-30",
      "2026-07-31",
      "2026-08-01",
      "2026-08-02",
    ];
    const sessions: Pick<
      WorkoutSession,
      "scheduledDate" | "status" | "workoutCode"
    >[] = [
      { scheduledDate: "2026-07-27", status: "done", workoutCode: "A" },
      { scheduledDate: "2026-07-28", status: "partial", workoutCode: "B" },
    ];
    expect(weeklyCompletion(sessions, week)).toEqual({
      completed: 2,
      target: 3,
      rate: 2 / 3,
    });
  });
});

describe("pickStableQuoteIndex", () => {
  it("is stable for the same date", () => {
    const a = pickStableQuoteIndex("2026-07-31", 20);
    const b = pickStableQuoteIndex("2026-07-31", 20);
    expect(a).toBe(b);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(20);
  });

  it("falls back safely for empty banks", () => {
    expect(pickStableQuoteIndex("2026-07-31", 0)).toBe(0);
  });
});
