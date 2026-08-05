"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExerciseCard } from "@/components/fitops/exercise-card";
import { DifficultyPicker } from "@/components/fitops/difficulty-picker";
import { RestTimer } from "@/components/fitops/rest-timer";
import {
  EXERCISES,
  WORKOUT_DAYS,
  getExerciseById,
} from "@/lib/data/seed";
import { applyDifficultyToExercise } from "@/lib/data/variants";
import { resolveItemsForDay } from "@/lib/workout/resolve";
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
  const { state, setActiveProgram, setDifficultyMode } = useFitOps();
  const [tab, setTab] = useState<TabId>("A");

  const planView =
    state.activeProgram === "custom" && state.customWorkout
      ? "custom"
      : state.activeProgram === "alternate" && state.alternateRegimen
        ? "alternate"
        : "military";

  const days = WORKOUT_DAYS.filter((d) => d.code !== "RECOVERY");
  const alternate = state.alternateRegimen;
  const custom = state.customWorkout;

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
          Monday A, Tuesday B, Wednesday C. Pick modified / normal / advanced
          for every exercise, or follow a custom / calculator plan.
        </p>
      </header>

      <DifficultyPicker
        value={state.difficultyMode}
        onChange={setDifficultyMode}
        compact
      />

      <div className="flex flex-wrap gap-2 rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-2">
        <button
          type="button"
          onClick={() => setActiveProgram("military")}
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-medium",
            planView === "military"
              ? "bg-[var(--fit-primary)] text-white"
              : "text-[var(--fit-muted)]",
          )}
        >
          Military A/B/C
        </button>
        {alternate ? (
          <button
            type="button"
            onClick={() => setActiveProgram("alternate")}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium",
              planView === "alternate"
                ? "bg-[var(--fit-primary)] text-white"
                : "text-[var(--fit-muted)]",
            )}
          >
            Alternate: {alternate.name}
          </button>
        ) : null}
        {custom ? (
          <button
            type="button"
            onClick={() => setActiveProgram("custom")}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium",
              planView === "custom"
                ? "bg-[var(--fit-primary)] text-white"
                : "text-[var(--fit-muted)]",
            )}
          >
            Custom: {custom.name}
          </button>
        ) : null}
        <Link
          href="/build"
          className="ml-auto self-center px-2 text-xs font-medium text-[var(--fit-primary)]"
        >
          Build custom
        </Link>
      </div>

      <RestTimer />

      {planView === "alternate" && alternate ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
            <h2 className="font-semibold">{alternate.name}</h2>
            <p className="mt-1 text-sm text-[var(--fit-muted)]">
              {alternate.summary}
            </p>
          </div>
          {alternate.days.map((day) => (
            <div
              key={day.code}
              className="space-y-3 rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4"
            >
              <div>
                <p className="text-xs text-[var(--fit-muted)]">
                  {day.weekdayHint} · {day.code}
                </p>
                <h3 className="font-semibold">{day.title}</h3>
                <p className="text-sm text-[var(--fit-muted)]">{day.focus}</p>
              </div>
              <ul className="space-y-2">
                {day.exercises.map((ex) => {
                  const exercise = EXERCISES.find((e) => e.slug === ex.slug);
                  if (!exercise) {
                    return (
                      <li key={ex.slug} className="text-sm">
                        {ex.name} · {ex.targetCount} {ex.targetUnit}
                      </li>
                    );
                  }
                  const item = {
                    id: `alt-${day.code}-${ex.slug}`,
                    workoutDayId: day.code,
                    exerciseId: exercise.id,
                    orderIndex: 0,
                    targetCount: ex.targetCount,
                    targetUnit: ex.targetUnit,
                    notes: ex.notes,
                  };
                  const resolved = applyDifficultyToExercise(
                    exercise,
                    item,
                    state.difficultyMode,
                  );
                  return (
                    <ExerciseCard
                      key={item.id}
                      exercise={resolved.exercise}
                      item={resolved.item}
                    />
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <>
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
            const items = resolveItemsForDay(state, day);
            return (
              <div key={day.code} className="space-y-3" role="tabpanel">
                <div className="rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
                  <h2 className="font-semibold">
                    {planView === "custom" && custom
                      ? `${custom.name} · ${day.title}`
                      : day.title}
                  </h2>
                  <p className="text-sm text-[var(--fit-muted)]">{day.focus}</p>
                </div>
                {items.length === 0 ? (
                  <p className="text-sm text-[var(--fit-muted)]">
                    No exercises for this day yet.{" "}
                    <Link href="/build" className="text-[var(--fit-primary)]">
                      Add some in Build
                    </Link>
                    .
                  </p>
                ) : (
                  items.map((item) => {
                    const base = getExerciseById(item.exerciseId)!;
                    const override = state.sourceOverrides[base.id];
                    const resolved = applyDifficultyToExercise(
                      base,
                      item,
                      state.difficultyMode,
                    );
                    const exercise = {
                      ...resolved.exercise,
                      sourceUrl:
                        override?.sourceUrl ?? resolved.exercise.sourceUrl,
                      sourceName:
                        override?.sourceName ?? resolved.exercise.sourceName,
                      sourceMatchType:
                        (override?.sourceMatchType as typeof base.sourceMatchType) ??
                        resolved.exercise.sourceMatchType,
                    };
                    return (
                      <ExerciseCard
                        key={item.id}
                        exercise={exercise}
                        item={resolved.item}
                      />
                    );
                  })
                )}
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
                  <span className="text-xs text-[var(--fit-primary)]">
                    Details
                  </span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
