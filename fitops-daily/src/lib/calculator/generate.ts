import { EXERCISES } from "@/lib/data/seed";
import type {
  BodyProfile,
  CalculatorInput,
  GeneratedDay,
  GeneratedExercise,
  GeneratedRegimen,
  GoalFocus,
} from "@/lib/calculator/types";
import {
  classifyBodyProfile,
  computeBmi,
  inferPrimaryGoal,
} from "@/lib/calculator/types";

type CatalogPick = {
  slug: string;
  count: number;
  unit: string;
  notes: string;
};

function bySlug(slug: string): GeneratedExercise {
  const ex = EXERCISES.find((e) => e.slug === slug);
  if (!ex) {
    return {
      slug,
      name: slug,
      targetCount: 10,
      targetUnit: "reps",
      notes: "",
    };
  }
  return {
    slug: ex.slug,
    name: ex.name,
    targetCount: 10,
    targetUnit: "reps",
    notes: "",
  };
}

function pick(items: CatalogPick[]): GeneratedExercise[] {
  return items.map((item) => {
    const base = bySlug(item.slug);
    return {
      ...base,
      targetCount: item.count,
      targetUnit: item.unit,
      notes: item.notes,
    };
  });
}

function scaleCount(
  count: number,
  experience: CalculatorInput["experience"],
  profile: BodyProfile,
  focus: GoalFocus,
): number {
  let next = count;
  if (experience === "beginner") next = Math.round(next * 0.85);
  if (profile === "higher_bmi_focus" || profile === "lean_build") {
    next = Math.round(next * 0.9);
  }
  if (focus === "endurance") next = Math.round(next * 1.1);
  if (focus === "muscle_gain") next = Math.max(8, Math.round(next * 0.95));
  return Math.max(6, next);
}

function dayTemplates(focus: GoalFocus): Omit<GeneratedDay, "exercises">[] {
  if (focus === "fat_loss") {
    return [
      {
        code: "ALT-A",
        title: "Conditioning Circuit",
        focus: "Full-body density",
        weekdayHint: "Day 1",
      },
      {
        code: "ALT-B",
        title: "Strength + Core",
        focus: "Push/pull + midline",
        weekdayHint: "Day 2",
      },
      {
        code: "ALT-C",
        title: "Legs + Steady Effort",
        focus: "Lower body + brisk finish",
        weekdayHint: "Day 3",
      },
    ];
  }
  if (focus === "muscle_gain") {
    return [
      {
        code: "ALT-A",
        title: "Upper Strength",
        focus: "Push + pull volume",
        weekdayHint: "Day 1",
      },
      {
        code: "ALT-B",
        title: "Lower Strength",
        focus: "Hinge, squat, calves",
        weekdayHint: "Day 2",
      },
      {
        code: "ALT-C",
        title: "Full Body Builder",
        focus: "Compound mix + core",
        weekdayHint: "Day 3",
      },
    ];
  }
  if (focus === "endurance") {
    return [
      {
        code: "ALT-A",
        title: "Engine Day",
        focus: "Continuous bodyweight work",
        weekdayHint: "Day 1",
      },
      {
        code: "ALT-B",
        title: "Core Endurance",
        focus: "Planks + controlled abs",
        weekdayHint: "Day 2",
      },
      {
        code: "ALT-C",
        title: "Legs + Carryover",
        focus: "Lunges, step-ups, calves",
        weekdayHint: "Day 3",
      },
    ];
  }
  return [
    {
      code: "ALT-A",
      title: "Recomp Push Focus",
      focus: "Upper body + core",
      weekdayHint: "Day 1",
    },
    {
      code: "ALT-B",
      title: "Recomp Conditioning",
      focus: "Full-body metabolic",
      weekdayHint: "Day 2",
    },
    {
      code: "ALT-C",
      title: "Recomp Legs + Pull",
      focus: "Posterior chain + rows",
      weekdayHint: "Day 3",
    },
  ];
}

function exerciseBlocks(
  focus: GoalFocus,
  experience: CalculatorInput["experience"],
  profile: BodyProfile,
): CatalogPick[][] {
  const s = (n: number) => scaleCount(n, experience, profile, focus);

  if (focus === "fat_loss") {
    return [
      [
        { slug: "modified-burpee", count: s(20), unit: "reps", notes: "Step-back OK" },
        { slug: "squat-thrust", count: s(16), unit: "reps", notes: "Smooth tempo" },
        { slug: "cross-body-mountain-climber", count: s(24), unit: "total reps", notes: "Keep hips quiet" },
        { slug: "wide-push-up", count: s(14), unit: "reps", notes: "Knees if needed" },
        { slug: "forearm-plank", count: 1, unit: "minute", notes: "Break into 2 holds if needed" },
        { slug: "walking-lunge", count: s(16), unit: "total reps", notes: "Short steps fine" },
      ],
      [
        { slug: "incline-diamond-push-up", count: s(12), unit: "reps", notes: "Higher incline to start" },
        { slug: "inverted-row", count: s(12), unit: "reps", notes: "Table/TRX OK" },
        { slug: "prone-cobra", count: s(15), unit: "reps", notes: "Squeeze shoulder blades" },
        { slug: "reverse-crunch", count: s(14), unit: "reps", notes: "No swinging" },
        { slug: "plank-shoulder-tap", count: s(16), unit: "total taps", notes: "Wide feet for balance" },
        { slug: "side-lunge", count: s(14), unit: "total reps", notes: "Controlled depth" },
      ],
      [
        { slug: "step-up", count: s(16), unit: "total reps", notes: "Sturdy step" },
        { slug: "good-morning-hip-hinge", count: s(14), unit: "reps", notes: "Soft knees" },
        { slug: "single-leg-glute-bridge", count: s(16), unit: "total reps", notes: "Or two-leg bridge" },
        { slug: "wide-stance-calf-raise", count: s(16), unit: "reps", notes: "Slow lower" },
        { slug: "sit-up-or-crunch", count: s(16), unit: "reps", notes: "Crunch default" },
        { slug: "scissor-kick", count: s(12), unit: "each side", notes: "Keep low back down" },
      ],
    ];
  }

  if (focus === "muscle_gain") {
    return [
      [
        { slug: "wide-push-up", count: s(16), unit: "reps", notes: "Quality reps" },
        { slug: "incline-diamond-push-up", count: s(12), unit: "reps", notes: "Pause at bottom" },
        { slug: "inverted-row", count: s(14), unit: "reps", notes: "Full hang + squeeze" },
        { slug: "prone-cobra", count: s(16), unit: "reps", notes: "2-sec hold at top" },
        { slug: "elbow-walkout", count: s(12), unit: "reps", notes: "Slow transitions" },
        { slug: "plank-shoulder-tap", count: s(16), unit: "total taps", notes: "Minimize sway" },
      ],
      [
        { slug: "alternating-step-up", count: s(18), unit: "total reps", notes: "Drive through heel" },
        { slug: "squat-press", count: s(16), unit: "reps", notes: "Optional light DBs later" },
        { slug: "good-morning-hip-hinge", count: s(14), unit: "reps", notes: "Hinge, don't squat" },
        { slug: "walking-lunge", count: s(16), unit: "total reps", notes: "Tall torso" },
        { slug: "single-leg-glute-bridge", count: s(18), unit: "total reps", notes: "Even sides" },
        { slug: "wide-stance-calf-raise", count: s(18), unit: "reps", notes: "Full range" },
      ],
      [
        { slug: "burpee", count: s(12), unit: "reps", notes: "Use modified if needed" },
        { slug: "skater-squat", count: s(14), unit: "total reps", notes: "Short range OK" },
        { slug: "side-lunge", count: s(14), unit: "total reps", notes: "Sit hips back" },
        { slug: "inverted-row", count: s(12), unit: "reps", notes: "Second pull set" },
        { slug: "bent-knee-leg-raise", count: s(14), unit: "reps", notes: "Controlled lower" },
        { slug: "forearm-plank", count: 1, unit: "minute", notes: "Brace hard" },
      ],
    ];
  }

  if (focus === "endurance") {
    return [
      [
        { slug: "modified-burpee", count: s(24), unit: "reps", notes: "Steady pace" },
        { slug: "squat-thrust", count: s(20), unit: "reps", notes: "No rush" },
        { slug: "cross-body-mountain-climber", count: s(28), unit: "total reps", notes: "Breathing rhythm" },
        { slug: "walking-lunge", count: s(20), unit: "total reps", notes: "Continuous" },
        { slug: "forearm-plank", count: 1, unit: "minute", notes: "Accumulate time" },
      ],
      [
        { slug: "elbow-walkout", count: s(16), unit: "reps", notes: "Smooth" },
        { slug: "sit-up-or-crunch", count: s(20), unit: "reps", notes: "Easy neck" },
        { slug: "reverse-crunch", count: s(16), unit: "reps", notes: "Slow" },
        { slug: "scissor-kick", count: s(14), unit: "each side", notes: "Higher legs if needed" },
        { slug: "plank-shoulder-tap", count: s(20), unit: "total taps", notes: "Quiet hips" },
      ],
      [
        { slug: "step-up", count: s(20), unit: "total reps", notes: "Even cadence" },
        { slug: "side-lunge", count: s(18), unit: "total reps", notes: "Stay light" },
        { slug: "squat-press", count: s(18), unit: "reps", notes: "Breath out on stand" },
        { slug: "wide-stance-calf-raise", count: s(20), unit: "reps", notes: "Pump under control" },
        { slug: "prone-cobra", count: s(16), unit: "reps", notes: "Upper-back endurance" },
      ],
    ];
  }

  // recomp
  return [
    [
      { slug: "wide-push-up", count: s(16), unit: "reps", notes: "Solid set" },
      { slug: "incline-diamond-push-up", count: s(12), unit: "reps", notes: "Triceps focus" },
      { slug: "prone-cobra", count: s(16), unit: "reps", notes: "Posture" },
      { slug: "reverse-crunch", count: s(14), unit: "reps", notes: "Quality" },
      { slug: "forearm-plank", count: 1, unit: "minute", notes: "Brace" },
      { slug: "plank-shoulder-tap", count: s(16), unit: "total taps", notes: "Stable" },
    ],
    [
      { slug: "modified-burpee", count: s(18), unit: "reps", notes: "Keep form" },
      { slug: "squat-thrust", count: s(16), unit: "reps", notes: "No push-up required" },
      { slug: "cross-body-mountain-climber", count: s(22), unit: "total reps", notes: "Controlled" },
      { slug: "squat-press", count: s(16), unit: "reps", notes: "Smooth" },
      { slug: "skater-squat", count: s(14), unit: "total reps", notes: "Balance first" },
      { slug: "sit-up-or-crunch", count: s(16), unit: "reps", notes: "Crunch OK" },
    ],
    [
      { slug: "good-morning-hip-hinge", count: s(14), unit: "reps", notes: "Neutral back" },
      { slug: "walking-lunge", count: s(16), unit: "total reps", notes: "Alternate" },
      { slug: "single-leg-glute-bridge", count: s(16), unit: "total reps", notes: "Hips level" },
      { slug: "inverted-row", count: s(12), unit: "reps", notes: "Pull chest up" },
      { slug: "bent-knee-leg-raise", count: s(14), unit: "reps", notes: "No arching" },
      { slug: "wide-stance-calf-raise", count: s(16), unit: "reps", notes: "Pause top" },
    ],
  ];
}

function weeksEstimate(input: CalculatorInput, focus: GoalFocus): number {
  const delta = Math.abs(input.goalWeightLb - input.currentWeightLb);
  if (focus === "endurance") return 4;
  if (delta <= 5) return 4;
  if (delta <= 15) return 8;
  return 12;
}

function coachingNotes(
  input: CalculatorInput,
  profile: BodyProfile,
  focus: GoalFocus,
  bmi: number,
): string[] {
  const notes = [
    `Current BMI ≈ ${bmi}. Profile heuristic: ${profile.replace(/_/g, " ")}.`,
    `Primary training bias: ${focus.replace(/_/g, " ")}.`,
    "This alternate plan uses the same accredited exercise library as FitOps Daily, reorganized for your goal.",
    "Keep the original Monday A / Tuesday B / Wednesday C plan anytime you prefer the military template.",
  ];
  if (input.goalWeightLb < input.currentWeightLb) {
    notes.push(
      `Goal is about ${Math.round(input.currentWeightLb - input.goalWeightLb)} lb down — favor consistency over max intensity.`,
    );
  } else if (input.goalWeightLb > input.currentWeightLb) {
    notes.push(
      `Goal is about ${Math.round(input.goalWeightLb - input.currentWeightLb)} lb up — recover well between hard days.`,
    );
  }
  if (profile === "higher_bmi_focus") {
    notes.push(
      "Prefer step-back burpees, incline push-ups, and joint-friendly ranges until movement feels easy.",
    );
  }
  if (input.daysPerWeek > 3) {
    notes.push(
      `You selected ${input.daysPerWeek} days/week — repeat ALT-A/B/C and insert walk/mobility on extras; do not stack two hard days back-to-back at first.`,
    );
  }
  return notes;
}

export function generateRegimenRules(
  input: CalculatorInput,
): GeneratedRegimen {
  const bmi = input.currentBmi ?? computeBmi(input.currentWeightLb, input.heightIn);
  const profile = classifyBodyProfile(bmi);
  const focus = inferPrimaryGoal(input, bmi);
  const templates = dayTemplates(focus);
  const blocks = exerciseBlocks(focus, input.experience, profile);

  const days: GeneratedDay[] = templates.map((t, i) => ({
    ...t,
    exercises: pick(blocks[i] ?? blocks[0]),
  }));

  const nameByFocus: Record<GoalFocus, string> = {
    fat_loss: "Lean Circuit Alternate",
    muscle_gain: "Strength Builder Alternate",
    recomp: "Recomp Alternate",
    endurance: "Engine Alternate",
  };

  return {
    id: `alt-${Date.now()}`,
    name: nameByFocus[focus],
    summary: `A ${input.daysPerWeek}-day alternate regimen tuned for a ${profile.replace(/_/g, " ")} starting point and a ${focus.replace(/_/g, " ")} goal.`,
    bodyProfile: profile,
    goalFocus: focus,
    weeklyTargetWorkouts: Math.min(input.daysPerWeek, 3),
    estimatedWeeks: weeksEstimate(input, focus),
    days,
    coachingNotes: coachingNotes(input, profile, focus, bmi),
    safetyNote:
      "Educational suggestion only — not medical advice. Stop for sharp pain, dizziness, chest pain, or unusual shortness of breath. Ask a qualified professional before starting if you have injuries or health conditions.",
    generatedBy: "rules",
    createdAt: new Date().toISOString(),
  };
}

export function catalogSlugSet(): Set<string> {
  return new Set(EXERCISES.map((e) => e.slug));
}

export function hydrateAiRegimen(
  raw: Partial<GeneratedRegimen>,
  input: CalculatorInput,
  fallback: GeneratedRegimen,
): GeneratedRegimen {
  const slugs = catalogSlugSet();
  const bmi = input.currentBmi ?? computeBmi(input.currentWeightLb, input.heightIn);
  const days = (raw.days ?? []).length
    ? raw.days!
        .slice(0, 3)
        .map((day, idx) => {
          const fallbackDay = fallback.days[idx] ?? fallback.days[0];
          const exercises = (day.exercises ?? [])
            .filter((e) => e.slug && slugs.has(e.slug))
            .slice(0, 8)
            .map((e) => {
              const catalog = bySlug(e.slug);
              return {
                slug: e.slug,
                name: catalog.name,
                targetCount: Number(e.targetCount) || catalog.targetCount,
                targetUnit: e.targetUnit || catalog.targetUnit,
                notes: e.notes || "",
              };
            });
          return {
            code: day.code || fallbackDay.code,
            title: day.title || fallbackDay.title,
            focus: day.focus || fallbackDay.focus,
            weekdayHint: day.weekdayHint || fallbackDay.weekdayHint,
            exercises: exercises.length ? exercises : fallbackDay.exercises,
          };
        })
    : fallback.days;

  return {
    ...fallback,
    ...raw,
    id: `alt-ai-${Date.now()}`,
    name: raw.name || fallback.name,
    summary: raw.summary || fallback.summary,
    bodyProfile: raw.bodyProfile || classifyBodyProfile(bmi),
    goalFocus: raw.goalFocus || fallback.goalFocus,
    weeklyTargetWorkouts:
      raw.weeklyTargetWorkouts || fallback.weeklyTargetWorkouts,
    estimatedWeeks: raw.estimatedWeeks || fallback.estimatedWeeks,
    days,
    coachingNotes:
      raw.coachingNotes?.length ? raw.coachingNotes : fallback.coachingNotes,
    safetyNote: fallback.safetyNote,
    generatedBy: "ai",
    createdAt: new Date().toISOString(),
  };
}
