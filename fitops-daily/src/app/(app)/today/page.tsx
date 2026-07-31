"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Quote } from "lucide-react";
import { ExerciseCard } from "@/components/fitops/exercise-card";
import { JournalEditor } from "@/components/fitops/journal-editor";
import { SafetyNotice } from "@/components/fitops/safety-notice";
import { WeeklyCompletionStrip } from "@/components/fitops/weekly-completion-strip";
import {
  useEnrichedLogs,
  useFitOps,
} from "@/components/providers/fitops-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getWorkoutDayByCode } from "@/lib/data/seed";
import { formatDisplayDate } from "@/lib/workout/logic";
import type { WorkoutCode, WorkoutSession } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function TodayPage() {
  const {
    ready,
    today,
    state,
    getOrCreateSession,
    setExerciseStatus,
    setSessionStatus,
    getQuoteForDate,
  } = useFitOps();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [started, setStarted] = useState(false);
  const [minutes, setMinutes] = useState("");
  const [rpe, setRpe] = useState("");

  useEffect(() => {
    if (!ready || !today) return;
    const s = getOrCreateSession(today);
    setSession(s);
    setStarted(s.status !== "planned");
    setMinutes(s.minutes?.toString() ?? "");
    setRpe(s.effortRpe?.toString() ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, today]);

  const quote = useMemo(
    () => (today ? getQuoteForDate(today) : { text: "", author: "" }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [today, state.dailyQuotes],
  );

  const enriched = useEnrichedLogs(session);
  const day = session ? getWorkoutDayByCode(session.workoutCode) : null;
  const isRecovery = session?.workoutCode === "RECOVERY";

  const missed = useMemo(() => {
    if (!isRecovery || !today) return [];
    const codes: WorkoutCode[] = ["A", "B", "C"];
    return codes
      .map((code) => {
        const d = getWorkoutDayByCode(code)!;
        const done = state.sessions.some(
          (s) =>
            s.workoutCode === code &&
            (s.status === "done" || s.status === "partial") &&
            s.scheduledDate >= weekMonday(today) &&
            s.scheduledDate <= today,
        );
        return done ? null : d;
      })
      .filter(Boolean);
  }, [isRecovery, state.sessions, today]);

  if (!ready || !session) {
    return <p className="text-sm text-[var(--fit-muted)]">Loading today…</p>;
  }

  function refreshSession(code?: WorkoutCode) {
    const s = getOrCreateSession(today, code);
    setSession(s);
    setStarted(true);
  }

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fit-accent)]">
          Today
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {formatDisplayDate(today)}
        </h1>
        <p className="text-sm text-[var(--fit-muted)]">
          {day?.title}
          {day?.focus ? ` · ${day.focus}` : ""} ·{" "}
          <span className="capitalize">{session.status}</span>
        </p>
      </header>

      <blockquote className="rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
        <div className="flex gap-3">
          <Quote className="mt-0.5 size-5 shrink-0 text-[var(--fit-accent)]" />
          <div>
            <p className="text-base leading-relaxed text-[var(--fit-text)]">
              {quote.text}
            </p>
            <p className="mt-2 text-xs text-[var(--fit-muted)]">
              — {quote.author}
            </p>
          </div>
        </div>
      </blockquote>

      <WeeklyCompletionStrip sessions={state.sessions} today={today} />

      {isRecovery ? (
        <section className="space-y-4 rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
          <div>
            <h2 className="text-lg font-semibold">Recovery / Catch-Up Day</h2>
            <p className="mt-1 text-sm text-[var(--fit-muted)]">
              Optional walk, mobility, journaling, or catch up a missed workout.
            </p>
          </div>
          <ul className="space-y-2 text-sm text-[var(--fit-text)]">
            <li className="rounded-lg bg-[var(--fit-bg)] px-3 py-2">
              Optional 20 minute walk
            </li>
            <li className="rounded-lg bg-[var(--fit-bg)] px-3 py-2">
              Optional 5 minute mobility
            </li>
            <li className="rounded-lg bg-[var(--fit-bg)] px-3 py-2">
              Prompt journal entry below
            </li>
          </ul>
          {missed.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Missed this week</p>
              {missed.map((d) => (
                <div
                  key={d!.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--fit-border)] px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{d!.title}</p>
                    <p className="text-xs text-[var(--fit-muted)]">{d!.focus}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => refreshSession(d!.code as WorkoutCode)}
                  >
                    Do this today
                  </Button>
                </div>
              ))}
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => {
              setSessionStatus(session.id, { status: "done", minutes: 20 });
              setSession({ ...session, status: "done" });
            }}
          >
            Mark recovery complete
          </Button>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {!started ? (
              <Button
                size="lg"
                onClick={() => {
                  setStarted(true);
                }}
              >
                Start Workout
              </Button>
            ) : (
              <Button size="lg" variant="secondary" disabled>
                Continue Workout
              </Button>
            )}
            <Link
              href="/routine"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              View full routine
            </Link>
          </div>

          {(started || session.status !== "planned") && (
            <div className="space-y-3">
              {enriched.map(({ item, exercise, log }) =>
                log ? (
                  <ExerciseCard
                    key={item.id}
                    exercise={exercise}
                    item={item}
                    log={log}
                    onStatusChange={(status) =>
                      setExerciseStatus(log.id, status)
                    }
                    onNotesChange={(notes) =>
                      setExerciseStatus(log.id, log.status, notes)
                    }
                  />
                ) : null,
              )}
            </div>
          )}

          <div className="space-y-3 rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
            <h3 className="font-semibold">Finish workout</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="minutes">Minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  min={1}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="mt-1.5 bg-[var(--fit-bg)]"
                />
              </div>
              <div>
                <Label htmlFor="rpe">Effort (RPE 1–10)</Label>
                <Input
                  id="rpe"
                  type="number"
                  min={1}
                  max={10}
                  value={rpe}
                  onChange={(e) => setRpe(e.target.value)}
                  className="mt-1.5 bg-[var(--fit-bg)]"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  setSessionStatus(session.id, {
                    status: "done",
                    minutes: minutes ? Number(minutes) : null,
                    effortRpe: rpe ? Number(rpe) : null,
                  });
                  setSession({ ...session, status: "done" });
                }}
              >
                Mark workout complete
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSessionStatus(session.id, {
                    status: "partial",
                    minutes: minutes ? Number(minutes) : null,
                    effortRpe: rpe ? Number(rpe) : null,
                  });
                  setSession({ ...session, status: "partial" });
                }}
              >
                Mark partial
              </Button>
            </div>
          </div>
        </section>
      )}

      <JournalEditor entryDate={today} compact={isRecovery} />
      <SafetyNotice compact />
    </div>
  );
}

function weekMonday(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}
