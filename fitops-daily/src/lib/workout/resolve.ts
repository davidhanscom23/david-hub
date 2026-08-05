import type {
  ActiveProgram,
  CustomWorkout,
  CustomWorkoutDay,
  WorkoutDay,
  WorkoutItem,
} from "@/lib/types";
import type { AppState } from "@/lib/data/store";
import {
  getExerciseBySlug,
  getItemsForDay,
  WORKOUT_DAYS,
} from "@/lib/data/seed";

export function emptyCustomDays(): CustomWorkoutDay[] {
  return [
    { code: "A", title: "Custom A", focus: "Your picks", exercises: [] },
    { code: "B", title: "Custom B", focus: "Your picks", exercises: [] },
    { code: "C", title: "Custom C", focus: "Your picks", exercises: [] },
  ];
}

export function createEmptyCustomWorkout(name = "My custom plan"): CustomWorkout {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `custom-${Date.now()}`,
    name,
    summary: "User-built A/B/C plan from the FitOps exercise catalog.",
    updatedAt: new Date().toISOString(),
    days: emptyCustomDays(),
  };
}

/** Resolve which workout items Today/Routine should use for a day. */
export function resolveItemsForDay(
  state: Pick<AppState, "activeProgram" | "customWorkout" | "alternateRegimen">,
  day: WorkoutDay,
): WorkoutItem[] {
  if (day.code === "RECOVERY") return [];

  if (state.activeProgram === "custom" && state.customWorkout) {
    const customDay = state.customWorkout.days.find((d) => d.code === day.code);
    if (customDay && customDay.exercises.length > 0) {
      return customDay.exercises
        .map((ex, index) => {
          const exercise = getExerciseBySlug(ex.slug);
          if (!exercise) return null;
          return {
            id: `custom-${state.customWorkout!.id}-${day.code}-${index}`,
            workoutDayId: day.id,
            exerciseId: exercise.id,
            orderIndex: index + 1,
            targetCount: ex.targetCount,
            targetUnit: ex.targetUnit,
            notes: ex.notes,
          } satisfies WorkoutItem;
        })
        .filter((item): item is WorkoutItem => item !== null);
    }
  }

  if (state.activeProgram === "alternate" && state.alternateRegimen) {
    const altDay = state.alternateRegimen.days.find(
      (d) =>
        d.code === day.code ||
        d.code === `ALT-${day.code}` ||
        d.code.endsWith(day.code),
    );
    if (altDay && altDay.exercises.length > 0) {
      return altDay.exercises
        .map((ex, index) => {
          const exercise = getExerciseBySlug(ex.slug);
          if (!exercise) return null;
          return {
            id: `alt-${state.alternateRegimen!.id}-${day.code}-${index}`,
            workoutDayId: day.id,
            exerciseId: exercise.id,
            orderIndex: index + 1,
            targetCount: ex.targetCount,
            targetUnit: ex.targetUnit,
            notes: ex.notes,
          } satisfies WorkoutItem;
        })
        .filter((item): item is WorkoutItem => item !== null);
    }
  }

  return getItemsForDay(day.id);
}

export function dayByCode(code: string): WorkoutDay | undefined {
  return WORKOUT_DAYS.find((d) => d.code === code);
}

export function programLabel(program: ActiveProgram): string {
  if (program === "alternate") return "Alternate plan";
  if (program === "custom") return "Custom plan";
  return "Military A/B/C";
}
