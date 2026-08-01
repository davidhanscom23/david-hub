import { z } from "zod";

export const measurementSchema = z.object({
  chestIn: z.number().positive().max(80).optional().nullable(),
  waistIn: z.number().positive().max(80).optional().nullable(),
  hipsIn: z.number().positive().max(80).optional().nullable(),
  armsIn: z.number().positive().max(40).optional().nullable(),
});

export const calculatorInputSchema = z.object({
  sex: z.enum(["female", "male", "unspecified"]).default("unspecified"),
  heightIn: z.number().min(48).max(90),
  currentWeightLb: z.number().min(70).max(500),
  currentBmi: z.number().min(10).max(60).optional().nullable(),
  currentMeasurements: measurementSchema.default({}),
  goalWeightLb: z.number().min(70).max(500),
  goalMeasurements: measurementSchema.default({}),
  goalFocus: z
    .enum(["fat_loss", "muscle_gain", "recomp", "endurance"])
    .default("recomp"),
  daysPerWeek: z.number().int().min(3).max(6).default(3),
  experience: z.enum(["beginner", "intermediate"]).default("beginner"),
});

export type CalculatorInput = z.infer<typeof calculatorInputSchema>;
export type Measurements = z.infer<typeof measurementSchema>;

export type GoalFocus = CalculatorInput["goalFocus"];
export type BodyProfile =
  | "lean_build"
  | "athletic_build"
  | "solid_build"
  | "higher_bmi_focus";

export interface GeneratedExercise {
  slug: string;
  name: string;
  targetCount: number;
  targetUnit: string;
  notes: string;
}

export interface GeneratedDay {
  code: string;
  title: string;
  focus: string;
  weekdayHint: string;
  exercises: GeneratedExercise[];
}

export interface GeneratedRegimen {
  id: string;
  name: string;
  summary: string;
  bodyProfile: BodyProfile;
  goalFocus: GoalFocus;
  weeklyTargetWorkouts: number;
  estimatedWeeks: number;
  days: GeneratedDay[];
  coachingNotes: string[];
  safetyNote: string;
  generatedBy: "rules" | "ai";
  createdAt: string;
}

export function computeBmi(weightLb: number, heightIn: number): number {
  if (heightIn <= 0) return 0;
  return Math.round(((703 * weightLb) / (heightIn * heightIn)) * 10) / 10;
}

export function classifyBodyProfile(bmi: number): BodyProfile {
  if (bmi < 18.5) return "lean_build";
  if (bmi < 25) return "athletic_build";
  if (bmi < 30) return "solid_build";
  return "higher_bmi_focus";
}

export function inferPrimaryGoal(
  input: CalculatorInput,
  currentBmi: number,
): GoalFocus {
  const delta = input.goalWeightLb - input.currentWeightLb;
  if (input.goalFocus !== "recomp") return input.goalFocus;
  if (delta <= -8 || currentBmi >= 27) return "fat_loss";
  if (delta >= 8 || currentBmi < 19) return "muscle_gain";
  return "recomp";
}
