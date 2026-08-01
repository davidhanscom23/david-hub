import { describe, expect, it } from "vitest";
import { generateRegimenRules } from "@/lib/calculator/generate";
import {
  calculatorInputSchema,
  classifyBodyProfile,
  computeBmi,
  inferPrimaryGoal,
} from "@/lib/calculator/types";
import { EXERCISES } from "@/lib/data/seed";

describe("body calculator", () => {
  it("computes BMI", () => {
    expect(computeBmi(180, 70)).toBe(25.8);
  });

  it("classifies body profile from BMI", () => {
    expect(classifyBodyProfile(17)).toBe("lean_build");
    expect(classifyBodyProfile(22)).toBe("athletic_build");
    expect(classifyBodyProfile(27)).toBe("solid_build");
    expect(classifyBodyProfile(32)).toBe("higher_bmi_focus");
  });

  it("infers fat-loss when goal weight drops sharply", () => {
    const input = calculatorInputSchema.parse({
      heightIn: 70,
      currentWeightLb: 210,
      goalWeightLb: 190,
      goalFocus: "recomp",
    });
    expect(inferPrimaryGoal(input, 30)).toBe("fat_loss");
  });

  it("generates a 3-day alternate using catalog slugs only", () => {
    const input = calculatorInputSchema.parse({
      heightIn: 68,
      currentWeightLb: 185,
      goalWeightLb: 175,
      goalFocus: "fat_loss",
      daysPerWeek: 3,
      experience: "beginner",
    });
    const regimen = generateRegimenRules(input);
    expect(regimen.days).toHaveLength(3);
    expect(regimen.generatedBy).toBe("rules");
    const slugs = new Set(EXERCISES.map((e) => e.slug));
    for (const day of regimen.days) {
      expect(day.exercises.length).toBeGreaterThanOrEqual(5);
      for (const ex of day.exercises) {
        expect(slugs.has(ex.slug)).toBe(true);
      }
    }
  });
});
