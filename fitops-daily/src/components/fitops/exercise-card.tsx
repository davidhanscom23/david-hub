"use client";

import Link from "next/link";
import type { Exercise, ExerciseStatus, SessionExerciseLog, WorkoutItem } from "@/lib/types";
import { formatTarget } from "@/lib/workout/logic";
import { ExerciseSourceBadge } from "@/components/fitops/exercise-source-badge";
import { WatchExampleButton } from "@/components/fitops/exercise-video-modal";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const statuses: { value: ExerciseStatus; label: string }[] = [
  { value: "planned", label: "Planned" },
  { value: "done", label: "Done" },
  { value: "partial", label: "Partial" },
  { value: "skipped", label: "Skipped" },
  { value: "pain", label: "Pain" },
];

export function ExerciseCard({
  exercise,
  item,
  log,
  onStatusChange,
  onNotesChange,
}: {
  exercise: Exercise;
  item: WorkoutItem;
  log?: SessionExerciseLog;
  onStatusChange?: (status: ExerciseStatus) => void;
  onNotesChange?: (notes: string) => void;
}) {
  const status = log?.status ?? "planned";

  return (
    <article
      className={cn(
        "rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4 shadow-[0_1px_0_rgba(31,36,28,0.04)]",
        status === "done" && "border-[var(--fit-success)]/35",
        status === "pain" && "border-[var(--fit-alert)]/45",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/exercise/${exercise.slug}`}
            className="text-base font-semibold tracking-tight text-[var(--fit-text)] hover:text-[var(--fit-primary)]"
          >
            {exercise.name}
          </Link>
          <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--fit-primary)]">
            {formatTarget(item.targetCount, item.targetUnit)}
          </p>
        </div>
        <ExerciseSourceBadge matchType={exercise.sourceMatchType} />
      </div>

      <p className="mt-2 text-sm leading-relaxed text-[var(--fit-muted)]">
        {exercise.shortCue}
      </p>
      {item.notes && (
        <p className="mt-1 text-xs text-[var(--fit-muted)]">{item.notes}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <WatchExampleButton
          exerciseName={exercise.name}
          videoYoutubeId={exercise.videoYoutubeId}
          sourceName={exercise.sourceName}
        />
      </div>

      {onStatusChange && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {statuses.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onStatusChange(s.value)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                status === s.value
                  ? s.value === "pain"
                    ? "bg-[var(--fit-alert)] text-white"
                    : s.value === "done"
                      ? "bg-[var(--fit-success)] text-white"
                      : "bg-[var(--fit-primary)] text-white"
                  : "bg-[var(--fit-bg)] text-[var(--fit-muted)] hover:text-[var(--fit-text)]",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {onNotesChange && (
        <Textarea
          className="mt-3 min-h-16 resize-y bg-[var(--fit-bg)]"
          placeholder="Optional notes"
          value={log?.notes ?? ""}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      )}
    </article>
  );
}
