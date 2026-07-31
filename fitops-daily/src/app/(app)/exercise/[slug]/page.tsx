"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ExerciseSourceBadge } from "@/components/fitops/exercise-source-badge";
import { WatchExampleButton } from "@/components/fitops/exercise-video-modal";
import { useFitOps } from "@/components/providers/fitops-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  WORKOUT_DAYS,
  WORKOUT_ITEMS,
  getExerciseBySlug,
} from "@/lib/data/seed";
import { formatTarget } from "@/lib/workout/logic";
import { cn } from "@/lib/utils";

export default function ExerciseDetailPage() {
  const params = useParams<{ slug: string }>();
  const { state, setExerciseNote } = useFitOps();
  const base = getExerciseBySlug(params.slug);
  const [saved, setSaved] = useState(false);

  if (!base) {
    return (
      <div className="space-y-3">
        <p>Exercise not found.</p>
        <Link
          href="/routine"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Back to routine
        </Link>
      </div>
    );
  }

  const override = state.sourceOverrides[base.id];
  const exercise = {
    ...base,
    sourceUrl: override?.sourceUrl ?? base.sourceUrl,
    sourceName: override?.sourceName ?? base.sourceName,
    sourceMatchType:
      (override?.sourceMatchType as typeof base.sourceMatchType) ??
      base.sourceMatchType,
  };

  const usages = WORKOUT_ITEMS.filter((i) => i.exerciseId === exercise.id).map(
    (item) => {
      const day = WORKOUT_DAYS.find((d) => d.id === item.workoutDayId)!;
      return { day, item };
    },
  );

  const note = state.exerciseNotes[exercise.id] ?? "";

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/routine"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 mb-2",
          )}
        >
          ← Routine
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {exercise.name}
          </h1>
          <ExerciseSourceBadge matchType={exercise.sourceMatchType} />
        </div>
        <p className="mt-2 text-sm text-[var(--fit-muted)]">
          {exercise.primaryMuscles.join(" · ")} · Equipment:{" "}
          {exercise.equipment}
        </p>
      </div>

      <section className="rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4 space-y-3">
        <h2 className="font-semibold">Used on</h2>
        <ul className="space-y-2">
          {usages.map(({ day, item }) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-lg bg-[var(--fit-bg)] px-3 py-2 text-sm"
            >
              <span>
                {day.title} · #{item.orderIndex}
              </span>
              <span className="font-semibold text-[var(--fit-primary)]">
                {formatTarget(item.targetCount, item.targetUnit)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
        <h2 className="font-semibold">How to do it</h2>
        <p className="text-sm leading-relaxed text-[var(--fit-muted)]">
          {exercise.description}
        </p>
        <Detail label="Form cue" value={exercise.shortCue} />
        <Detail label="Common mistake" value={exercise.commonMistake} />
        <Detail label="Regression" value={exercise.regression} />
        <Detail label="Progression" value={exercise.progression} />
      </section>

      <section className="space-y-3 rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
        <h2 className="font-semibold">Accredited source</h2>
        <p className="text-sm text-[var(--fit-muted)]">
          {exercise.sourceName} · {exercise.sourceMatchType}
          {exercise.sourceNotes ? ` · ${exercise.sourceNotes}` : ""}
        </p>
        <div className="flex flex-wrap gap-2">
          <WatchExampleButton
            exerciseName={exercise.name}
            videoYoutubeId={exercise.videoYoutubeId}
            sourceName={exercise.sourceName}
            className="h-10"
          />
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
        <Label htmlFor="personal-notes">Personal notes</Label>
        <Textarea
          id="personal-notes"
          className="min-h-24 bg-[var(--fit-bg)]"
          value={note}
          onChange={(e) => setExerciseNote(exercise.id, e.target.value)}
          placeholder="Cues that work for you, substitutions, equipment notes…"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 1500);
          }}
        >
          {saved ? "Saved" : "Save notes"}
        </Button>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--fit-muted)]">
        {label}
      </p>
      <p className="mt-1 text-sm text-[var(--fit-text)]">{value}</p>
    </div>
  );
}
