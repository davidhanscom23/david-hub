import { describe, expect, it } from "vitest";
import { EXERCISES } from "@/lib/data/seed";
import {
  EXERCISE_VARIANTS,
  applyDifficultyToExercise,
  scaleTarget,
} from "@/lib/data/variants";
import { youtubeEmbedSrc } from "@/lib/workout/youtube";

describe("exercise difficulty variants", () => {
  it("defines modified and advanced for every catalog exercise", () => {
    for (const exercise of EXERCISES) {
      const variants = EXERCISE_VARIANTS[exercise.slug];
      expect(variants, exercise.slug).toBeTruthy();
      expect(variants.modified.videoYoutubeId).toMatch(/^[A-Za-z0-9_-]{11}$/);
      expect(variants.advanced.videoYoutubeId).toMatch(/^[A-Za-z0-9_-]{11}$/);
      expect(variants.modified.name.length).toBeGreaterThan(3);
      expect(variants.advanced.name.length).toBeGreaterThan(3);
    }
  });

  it("scales targets and swaps demo video for modified mode", () => {
    const exercise = EXERCISES[0];
    const item = {
      id: "item-test",
      workoutDayId: "day-a",
      exerciseId: exercise.id,
      orderIndex: 1,
      targetCount: 20,
      targetUnit: "reps",
      notes: "",
    };
    const resolved = applyDifficultyToExercise(exercise, item, "modified");
    expect(resolved.exercise.name).not.toBe(exercise.name);
    expect(resolved.item.targetCount).toBe(
      scaleTarget(20, EXERCISE_VARIANTS[exercise.slug].modified.targetScale),
    );
    expect(youtubeEmbedSrc(resolved.exercise.videoYoutubeId)).toContain(
      "youtube-nocookie.com",
    );
  });
});
