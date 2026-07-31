"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarHeatmap } from "@/components/fitops/calendar-heatmap";
import { WeeklyCompletionStrip } from "@/components/fitops/weekly-completion-strip";
import { useFitOps } from "@/components/providers/fitops-provider";
import { WORKOUT_ITEMS, getExerciseById } from "@/lib/data/seed";
import {
  averageRpe,
  calculateStreak,
  completionRateByWeek,
  weeklyCompletion,
  weekDates,
} from "@/lib/workout/logic";
import { format, parseISO } from "date-fns";

export default function ProgressPage() {
  const { state, today } = useFitOps();
  const sessions = state.sessions;

  const streak = useMemo(
    () => calculateStreak(sessions, today),
    [sessions, today],
  );
  const week = useMemo(
    () => weeklyCompletion(sessions, weekDates(today)),
    [sessions, today],
  );
  const byWeek = useMemo(
    () => completionRateByWeek(sessions, 8, today),
    [sessions, today],
  );
  const avg = useMemo(() => averageRpe(sessions), [sessions]);

  const recentJournal = useMemo(
    () =>
      [...state.journals].sort((a, b) =>
        b.entryDate.localeCompare(a.entryDate),
      )[0],
    [state.journals],
  );

  const painFlags = useMemo(() => {
    return state.logs
      .filter((l) => l.status === "pain")
      .map((l) => {
        const item = WORKOUT_ITEMS.find((i) => i.id === l.workoutItemId);
        const exercise = item ? getExerciseById(item.exerciseId) : null;
        const session = sessions.find((s) => s.id === l.sessionId);
        return {
          id: l.id,
          name: exercise?.name ?? "Exercise",
          date: session?.scheduledDate ?? "",
          notes: l.notes,
        };
      })
      .slice(0, 8);
  }, [state.logs, sessions]);

  const skipped = useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of state.logs) {
      if (log.status !== "skipped") continue;
      const item = WORKOUT_ITEMS.find((i) => i.id === log.workoutItemId);
      const exercise = item ? getExerciseById(item.exerciseId) : null;
      if (!exercise) continue;
      counts.set(exercise.name, (counts.get(exercise.name) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [state.logs]);

  const longestStreak = useMemo(() => {
    // Approximate by scanning all done dates with the same calendar streak logic
    // anchored on each done day — good enough for MVP.
    const dates = [
      ...new Set(
        sessions
          .filter(
            (s) =>
              (s.status === "done" || s.status === "partial") &&
              s.workoutCode !== "RECOVERY",
          )
          .map((s) => s.scheduledDate),
      ),
    ].sort();
    let best = streak;
    for (const d of dates) {
      best = Math.max(best, calculateStreak(sessions, d));
    }
    return best;
  }, [sessions, streak]);

  const bestWeek = useMemo(() => {
    if (byWeek.length === 0) return null;
    return [...byWeek].sort((a, b) => b.completed - a.completed)[0];
  }, [byWeek]);

  const chartData = byWeek.map((w) => ({
    week: format(parseISO(`${w.weekStart}T12:00:00`), "MMM d"),
    completed: w.completed,
    target: w.target,
  }));

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fit-accent)]">
          Progress
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          Accountability
        </h1>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Current streak" value={`${streak}`} suffix="workouts" />
        <Stat
          label="This week"
          value={`${week.completed}/${week.target}`}
          suffix="complete"
        />
        <Stat
          label="Average RPE"
          value={avg == null ? "—" : String(avg)}
          suffix={avg == null ? "no data" : "effort"}
        />
      </div>

      <WeeklyCompletionStrip sessions={sessions} today={today} />
      <CalendarHeatmap sessions={sessions} today={today} />

      <div className="rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--fit-muted)]">
          Completion by week
        </p>
        <div className="mt-3 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3ddd0" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="completed" fill="#3F5D46" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--fit-muted)]">
            Longest streak
          </p>
          <p className="mt-1 text-2xl font-semibold">{longestStreak}</p>
        </div>
        <div className="rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--fit-muted)]">
            Best consistency week
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {bestWeek
              ? `${bestWeek.completed}/${bestWeek.target}`
              : "—"}
          </p>
          {bestWeek && (
            <p className="text-xs text-[var(--fit-muted)]">
              Week of{" "}
              {format(parseISO(`${bestWeek.weekStart}T12:00:00`), "MMM d")}
            </p>
          )}
        </div>
      </div>

      <section className="rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
        <h2 className="font-semibold">Most recent journal</h2>
        {recentJournal ? (
          <div className="mt-2 text-sm text-[var(--fit-muted)]">
            <p className="font-medium text-[var(--fit-text)]">
              {format(
                parseISO(`${recentJournal.entryDate}T12:00:00`),
                "EEEE, MMM d",
              )}
            </p>
            <p className="mt-1">
              {recentJournal.smallWin ||
                recentJournal.body ||
                "Entry saved without notes."}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-[var(--fit-muted)]">
            No journal notes yet.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
        <h2 className="font-semibold">Pain / problem flags</h2>
        {painFlags.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--fit-muted)]">
            No pain flags recorded.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {painFlags.map((f) => (
              <li
                key={f.id}
                className="rounded-lg bg-[var(--fit-alert)]/8 px-3 py-2 text-sm"
              >
                <span className="font-medium text-[var(--fit-alert)]">
                  {f.name}
                </span>
                {f.date ? ` · ${f.date}` : ""}
                {f.notes ? ` — ${f.notes}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      {skipped.length > 0 && (
        <section className="rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
          <h2 className="font-semibold">Most skipped exercises</h2>
          <ul className="mt-2 space-y-1 text-sm text-[var(--fit-muted)]">
            {skipped.map(([name, count]) => (
              <li key={name}>
                {name} · {count}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--fit-muted)]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-[var(--fit-muted)]">{suffix}</p>
    </div>
  );
}
