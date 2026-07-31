"use client";

import { weeklyCompletion, weekDates } from "@/lib/workout/logic";
import type { WorkoutSession } from "@/lib/types";
import { cn } from "@/lib/utils";

export function WeeklyCompletionStrip({
  sessions,
  today,
}: {
  sessions: WorkoutSession[];
  today: string;
}) {
  const dates = weekDates(today);
  const { completed, target, rate } = weeklyCompletion(sessions, dates);
  const labels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--fit-muted)]">
            This week
          </p>
          <p className="mt-0.5 text-sm font-semibold">
            {completed}/{target} workouts
          </p>
        </div>
        <p className="text-sm tabular-nums text-[var(--fit-primary)]">
          {Math.round(rate * 100)}%
        </p>
      </div>
      <div className="mt-3 flex gap-1.5">
        {dates.map((d, i) => {
          const session = sessions.find(
            (s) =>
              s.scheduledDate === d &&
              s.workoutCode !== "RECOVERY" &&
              (s.status === "done" || s.status === "partial"),
          );
          const planned = sessions.find(
            (s) => s.scheduledDate === d && s.workoutCode !== "RECOVERY",
          );
          return (
            <div key={d} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] text-[var(--fit-muted)]">
                {labels[i]}
              </span>
              <div
                className={cn(
                  "h-2 w-full rounded-full",
                  session
                    ? "bg-[var(--fit-success)]"
                    : planned
                      ? "bg-[var(--fit-accent)]/50"
                      : d === today
                        ? "bg-[var(--fit-primary)]/30"
                        : "bg-[var(--fit-bg)]",
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
