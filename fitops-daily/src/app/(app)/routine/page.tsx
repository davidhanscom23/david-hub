"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExerciseCard } from "@/components/fitops/exercise-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EXERCISES,
  WORKOUT_DAYS,
  getExerciseById,
  getItemsForDay,
} from "@/lib/data/seed";
import { useFitOps } from "@/components/providers/fitops-provider";

export default function RoutinePage() {
  const { state } = useFitOps();
  const [tab, setTab] = useState("A");

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

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-[var(--fit-surface)] p-1">
          {days.map((d) => (
            <TabsTrigger key={d.code} value={d.code} className="flex-none">
              {d.title.replace("Workout ", "")}
            </TabsTrigger>
          ))}
          <TabsTrigger value="RECOVERY" className="flex-none">
            Recovery
          </TabsTrigger>
          <TabsTrigger value="ALL" className="flex-none">
            All Exercises
          </TabsTrigger>
        </TabsList>

        {days.map((day) => {
          const items = getItemsForDay(day.id);
          return (
            <TabsContent key={day.code} value={day.code} className="space-y-3">
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
                  <ExerciseCard
                    key={item.id}
                    exercise={exercise}
                    item={item}
                  />
                );
              })}
            </TabsContent>
          );
        })}

        <TabsContent value="RECOVERY" className="space-y-3">
          <div className="rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
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
        </TabsContent>

        <TabsContent value="ALL" className="space-y-2">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
