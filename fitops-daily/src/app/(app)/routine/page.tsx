"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExerciseCard } from "@/components/fitops/exercise-card";
import { RestTimer } from "@/components/fitops/rest-timer";
import {
  EXERCISES,
  WORKOUT_DAYS,
  getExerciseById,
  getItemsForDay,
} from "@/lib/data/seed";
import { useFitOps } from "@/components/providers/fitops-provider";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "A", label: "A" },
  { id: "B", label: "B" },
  { id: "C", label: "C" },
  { id: "RECOVERY", label: "Recovery" },
  { id: "ALL", label: "All Exercises" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function RoutinePage() {
  const { state } = useFitOps();
  const [tab, setTab] = useState<TabId>("A");

  const days = WORKOUT_DAYS.filter((d) => d.code !== "RECOVERY");

  const allExercises = useMemo(() => {
    return EXERCISES.map((exercise) => {
      const override = state.sourceOverrides[exercise.id];
      return {
        ...exercise,
        sourceUrl: override?.sourceUrl ?? exercise.sourceUrl,
        sourceName: override?.sourceName ?? exercise.sourceName,
        sourceMatchType:
          (override?.sourceMatchType as typeof exercise.sourceMatchType) ??
          exercise.sourceMatchType,
      };
    });
  }, [state.sourceOverrides]);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fit-accent)]">
          Routine
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          Weekly plan
        </h1>
        <p className="mt-1 text-sm text-[var(--fit-muted)]">
          Monday A, Tuesday B, Wednesday C. Thursday–Sunday are recovery and
          catch-up.
        </p>
      </header>

      <RestTimer />

      <div
        role="tablist"
        aria-label="Routine views"
        className="flex flex-wrap gap-1 rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-1"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-[var(--fit-primary)] text-white"
                : "text-[var(--fit-muted)] hover:text-[var(--fit-text)]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {days.map((day) => {
        if (tab !== day.code) return null;
        const items = getItemsForDay(day.id);
        return (
          <div key={day.code} className="space-y-3" role="tabpanel">
            <div className="rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
              <h2 className="font-semibold">{day.title}</h2>
              <p className="text-sm text-[var(--fit-muted)]">{day.focus}</p>
            </div>
            {items.map((item) => {
              const base = getExerciseById(item.exerciseId)!;
              const override = state.sourceOverrides[base.id];
              const exercise = {
                ...base,
                sourceUrl: override?.sourceUrl ?? base.sourceUrl,
                sourceName: override?.sourceName ?? base.sourceName,
                sourceMatchType:
                  (override?.sourceMatchType as typeof base.sourceMatchType) ??
                  base.sourceMatchType,
              };
              return (
                <ExerciseCard key={item.id} exercise={exercise} item={item} />
              );
            })}
          </div>
        );
      })}

      {tab === "RECOVERY" && (
        <div
          className="space-y-3 rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4"
          role="tabpanel"
        >
          <h2 className="font-semibold">Recovery / Catch-Up Days</h2>
          <p className="mt-1 text-sm text-[var(--fit-muted)]">
            Thursday through Sunday default to recovery. Optional 20-minute
            walk, 5-minute mobility, journaling, and catch-up for any missed
            A/B/C session.
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="rounded-lg bg-[var(--fit-bg)] px-3 py-2">
              Optional 20 minute walk
            </li>
            <li className="rounded-lg bg-[var(--fit-bg)] px-3 py-2">
              Optional 5 minute mobility
            </li>
            <li className="rounded-lg bg-[var(--fit-bg)] px-3 py-2">
              Journal and review the week
            </li>
          </ul>
        </div>
      )}

      {tab === "ALL" && (
        <div className="space-y-2" role="tabpanel">
          {allExercises.map((exercise) => (
            <Link
              key={exercise.id}
              href={`/exercise/${exercise.slug}`}
              className="flex items-center justify-between rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] px-4 py-3 transition-colors hover:border-[var(--fit-primary)]/40"
            >
              <div>
                <p className="font-medium">{exercise.name}</p>
                <p className="text-xs text-[var(--fit-muted)]">
                  {exercise.primaryMuscles.join(", ")} · {exercise.equipment}
                </p>
              </div>
              <span className="text-xs text-[var(--fit-primary)]">Details</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
