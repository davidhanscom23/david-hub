"use client";

import { cn } from "@/lib/utils";
import type { WorkoutSession } from "@/lib/types";
import { addDays, format, parseISO, startOfWeek } from "date-fns";

export function CalendarHeatmap({
  sessions,
  today,
  weeks = 12,
}: {
  sessions: WorkoutSession[];
  today: string;
  weeks?: number;
}) {
  const end = parseISO(`${today}T12:00:00`);
  const start = startOfWeek(addDays(end, -(weeks - 1) * 7), {
    weekStartsOn: 1,
  });

  const map = new Map<string, string>();
  for (const s of sessions) {
    if (s.workoutCode === "RECOVERY") continue;
    if (s.status === "done" || s.status === "partial") {
      map.set(s.scheduledDate, s.status);
    } else if (s.status === "skipped") {
      map.set(s.scheduledDate, "skipped");
    }
  }

  const days: { date: string; status?: string }[] = [];
  let cursor = start;
  const last = end;
  while (cursor <= last) {
    const date = format(cursor, "yyyy-MM-dd");
    days.push({ date, status: map.get(date) });
    cursor = addDays(cursor, 1);
  }

  return (
    <div className="rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--fit-muted)]">
        Training heatmap
      </p>
      <div className="mt-3 grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto">
        {days.map((d) => (
          <div
            key={d.date}
            title={`${d.date}${d.status ? `: ${d.status}` : ""}`}
            className={cn(
              "size-3 rounded-[3px]",
              d.status === "done" && "bg-[var(--fit-success)]",
              d.status === "partial" && "bg-[var(--fit-accent)]",
              d.status === "skipped" && "bg-[var(--fit-alert)]/50",
              !d.status && "bg-[var(--fit-bg)]",
              d.date === today && "ring-1 ring-[var(--fit-primary)]",
            )}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-[var(--fit-muted)]">
        <Legend color="bg-[var(--fit-success)]" label="Done" />
        <Legend color="bg-[var(--fit-accent)]" label="Partial" />
        <Legend color="bg-[var(--fit-alert)]/50" label="Skipped" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-2.5 rounded-[2px]", color)} />
      {label}
    </span>
  );
}
