"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Layers, Plus, Trash2 } from "lucide-react";
import { useFitOps } from "@/components/providers/fitops-provider";
import { WatchExampleButton } from "@/components/fitops/exercise-video-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EXERCISES } from "@/lib/data/seed";
import {
  createEmptyCustomWorkout,
  emptyCustomDays,
} from "@/lib/workout/resolve";
import type { CustomWorkout, CustomWorkoutExercise } from "@/lib/types";
import { cn } from "@/lib/utils";

type DayCode = "A" | "B" | "C";

export default function BuildPage() {
  const { state, saveCustomWorkout, setActiveProgram } = useFitOps();
  const [dayCode, setDayCode] = useState<DayCode>("A");
  const [name, setName] = useState(state.customWorkout?.name ?? "My custom plan");
  const [draft, setDraft] = useState<CustomWorkout>(
    () =>
      state.customWorkout ?? {
        ...createEmptyCustomWorkout(name),
        days: emptyCustomDays(),
      },
  );
  const [pickSlug, setPickSlug] = useState(EXERCISES[0]?.slug ?? "");
  const [targetCount, setTargetCount] = useState("12");
  const [targetUnit, setTargetUnit] = useState("reps");
  const [savedFlash, setSavedFlash] = useState(false);

  const activeDay = useMemo(
    () => draft.days.find((d) => d.code === dayCode) ?? draft.days[0],
    [draft.days, dayCode],
  );

  function updateDayExercises(exercises: CustomWorkoutExercise[]) {
    setDraft((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.code === dayCode ? { ...d, exercises } : d,
      ),
    }));
  }

  function addExercise() {
    const exercise = EXERCISES.find((e) => e.slug === pickSlug);
    if (!exercise) return;
    const count = Number(targetCount);
    if (!Number.isFinite(count) || count <= 0) return;
    updateDayExercises([
      ...activeDay.exercises,
      {
        slug: exercise.slug,
        targetCount: count,
        targetUnit: targetUnit.trim() || "reps",
        notes: "",
      },
    ]);
  }

  function removeExercise(index: number) {
    updateDayExercises(activeDay.exercises.filter((_, i) => i !== index));
  }

  function moveExercise(index: number, dir: -1 | 1) {
    const next = [...activeDay.exercises];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    updateDayExercises(next);
  }

  function savePlan(activate: boolean) {
    const workout: CustomWorkout = {
      ...draft,
      name: name.trim() || "My custom plan",
      updatedAt: new Date().toISOString(),
    };
    saveCustomWorkout(workout);
    if (activate) setActiveProgram("custom");
    setDraft(workout);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1600);
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fit-accent)]">
          Build
        </p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight md:text-3xl">
          <Layers className="size-7 text-[var(--fit-primary)]" />
          Custom workout
        </h1>
        <p className="mt-1 text-sm text-[var(--fit-muted)]">
          Pick exercises for Workouts A, B, and C, save your plan, then use it
          on Today and Routine.
        </p>
      </header>

      <section className="space-y-3 rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
        <div>
          <Label htmlFor="plan-name">Plan name</Label>
          <Input
            id="plan-name"
            className="mt-1.5 bg-[var(--fit-bg)]"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["A", "B", "C"] as DayCode[]).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setDayCode(code)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium",
                dayCode === code
                  ? "bg-[var(--fit-primary)] text-white"
                  : "bg-[var(--fit-bg)] text-[var(--fit-muted)]",
              )}
            >
              Day {code}
              <span className="ml-1 opacity-80">
                ({draft.days.find((d) => d.code === code)?.exercises.length ?? 0})
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
        <h2 className="font-semibold">Add to Day {dayCode}</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_5rem_6rem_auto]">
          <div>
            <Label htmlFor="exercise">Exercise</Label>
            <select
              id="exercise"
              className="mt-1.5 flex h-9 w-full rounded-lg border border-[var(--fit-border)] bg-[var(--fit-bg)] px-3 text-sm"
              value={pickSlug}
              onChange={(e) => setPickSlug(e.target.value)}
            >
              {EXERCISES.map((ex) => (
                <option key={ex.slug} value={ex.slug}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="count">Count</Label>
            <Input
              id="count"
              className="mt-1.5 bg-[var(--fit-bg)]"
              inputMode="decimal"
              value={targetCount}
              onChange={(e) => setTargetCount(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="unit">Unit</Label>
            <Input
              id="unit"
              className="mt-1.5 bg-[var(--fit-bg)]"
              value={targetUnit}
              onChange={(e) => setTargetUnit(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={addExercise} className="w-full">
              <Plus className="size-4" />
              Add
            </Button>
          </div>
        </div>
        {pickSlug ? (
          <div className="pt-1">
            {(() => {
              const ex = EXERCISES.find((e) => e.slug === pickSlug);
              if (!ex) return null;
              return (
                <WatchExampleButton
                  exerciseName={ex.name}
                  videoYoutubeId={ex.videoYoutubeId}
                  sourceName={ex.sourceName}
                />
              );
            })()}
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Day {dayCode} lineup</h2>
        {activeDay.exercises.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--fit-border)] bg-[var(--fit-surface)] p-4 text-sm text-[var(--fit-muted)]">
            No exercises yet. Add from the catalog above.
          </p>
        ) : (
          <ul className="space-y-2">
            {activeDay.exercises.map((item, index) => {
              const ex = EXERCISES.find((e) => e.slug === item.slug);
              return (
                <li
                  key={`${item.slug}-${index}`}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{ex?.name ?? item.slug}</p>
                    <p className="text-xs text-[var(--fit-muted)]">
                      {item.targetCount} {item.targetUnit}
                    </p>
                  </div>
                  {ex ? (
                    <WatchExampleButton
                      exerciseName={ex.name}
                      videoYoutubeId={ex.videoYoutubeId}
                      sourceName={ex.sourceName}
                    />
                  ) : null}
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveExercise(index, -1)}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveExercise(index, 1)}
                      disabled={index === activeDay.exercises.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeExercise(index)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => savePlan(true)}>
          {savedFlash ? "Saved" : "Save & use this plan"}
        </Button>
        <Button type="button" variant="outline" onClick={() => savePlan(false)}>
          Save only
        </Button>
        {state.customWorkout ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setActiveProgram("military")}
          >
            Switch back to military
          </Button>
        ) : null}
        <Link
          href="/routine"
          className="inline-flex h-9 items-center px-2 text-sm font-medium text-[var(--fit-primary)]"
        >
          View on Routine →
        </Link>
      </div>
    </div>
  );
}
