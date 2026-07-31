import type { Exercise, Quote, WorkoutDay, WorkoutItem } from "@/lib/types";

export const DEMO_USER_ID = "demo-user";

export const QUOTES: Quote[] = [
  "Show up first. Momentum can meet you there.",
  "Small reps done honestly beat perfect plans postponed.",
  "Strength is built in ordinary minutes.",
  "Do the next clean rep.",
  "Your body hears consistency louder than intensity.",
  "Start where you are. Track what you do. Build from there.",
  "The win is not drama. The win is follow-through.",
  "Move today so tomorrow has better options.",
  "Discipline gets easier when the first step is obvious.",
  "You do not need a perfect day to keep a promise.",
  "Good training is attention plus patience.",
  "The body adapts to what you repeat.",
  "One session is a vote for the person you are becoming.",
  "The goal is progress you can live with.",
  "Control the rep you are in.",
  "Energy follows action more often than action follows energy.",
  "Make the healthy choice visible.",
  "Consistency is a quiet form of confidence.",
  "Keep the standard small enough to keep.",
  "Recovery is part of the program.",
].map((quoteText, i) => ({
  id: `quote-${i + 1}`,
  quoteText,
  author: "FitOps Daily",
  category: "fitness",
}));

export const WORKOUT_DAYS: WorkoutDay[] = [
  {
    id: "day-a",
    code: "A",
    weekday: 1,
    title: "Workout A",
    focus: "Upper body + core",
    sortOrder: 1,
  },
  {
    id: "day-b",
    code: "B",
    weekday: 2,
    title: "Workout B",
    focus: "Conditioning + legs",
    sortOrder: 2,
  },
  {
    id: "day-c",
    code: "C",
    weekday: 3,
    title: "Workout C",
    focus: "Back + core + legs",
    sortOrder: 3,
  },
  {
    id: "day-recovery",
    code: "RECOVERY",
    weekday: null,
    title: "Recovery / Catch-Up",
    focus: "Walk, mobility, journaling",
    sortOrder: 4,
  },
];

type SeedExercise = Omit<Exercise, "id" | "videoYoutubeId"> & { id?: string };

const exerciseDefs: SeedExercise[] = [
  {
    slug: "modified-burpee",
    name: "Modified Burpee",
    category: "conditioning",
    equipment: "None",
    primaryMuscles: ["Full body", "Core"],
    description:
      "A step-back burpee that builds conditioning without requiring a jump. Squat, place hands down, step to plank, step in, and stand tall.",
    shortCue: "Squat down, step back to plank, step in, stand tall.",
    commonMistake: "Letting hips sag in plank.",
    regression: "Hands on bench.",
    progression: "Add small hop.",
    sourceName: "NASM",
    sourceUrl:
      "https://www.nasm.org/resource-center/exercise-library/squat-thrust-burpees",
    sourceMatchType: "close variation",
    sourceNotes: "Use step-back/no-jump regression",
  },
  {
    slug: "alternating-step-up",
    name: "Alternating Step-Up",
    category: "legs",
    equipment: "Sturdy step or bench",
    primaryMuscles: ["Quads", "Glutes"],
    description:
      "Step onto a sturdy platform, stand tall, then lower with control. Alternate legs and count both sides toward the total.",
    shortCue: "Step through heel, stand tall, control down.",
    commonMistake: "Pushing off the floor leg too much.",
    regression: "Lower step.",
    progression: "Add knee drive.",
    sourceName: "ACE",
    sourceUrl:
      "https://www.acefitness.org/resources/everyone/exercise-library/28/step-up/",
    sourceMatchType: "exact",
    sourceNotes: "Use as controlled step-up demo",
  },
  {
    slug: "incline-diamond-push-up",
    name: "Incline Diamond Push-Up",
    category: "push",
    equipment: "Bench, counter, or wall",
    primaryMuscles: ["Chest", "Triceps", "Shoulders"],
    description:
      "Hands close together in a diamond shape on an incline surface. Keep the body straight and lower the chest as one piece.",
    shortCue:
      "Hands narrow on incline, body straight, lower chest as one piece.",
    commonMistake: "Flaring elbows hard or dropping hips.",
    regression: "Higher incline.",
    progression: "Lower incline.",
    sourceName: "NASM",
    sourceUrl:
      "https://www.nasm.org/resource-center/exercise-library/incline-push-up",
    sourceMatchType: "close variation",
    sourceNotes: "Same incline setup, use narrow/diamond hands",
  },
  {
    slug: "wide-push-up",
    name: "Wide Push-Up",
    category: "push",
    equipment: "None",
    primaryMuscles: ["Chest", "Shoulders", "Core"],
    description:
      "A push-up with hands wider than shoulders. Brace the core, lower the chest, and press away.",
    shortCue: "Hands wide, brace, lower chest, press away.",
    commonMistake: "Neck reaching toward floor.",
    regression: "Knees down.",
    progression: "Tempo lowering.",
    sourceName: "NASM",
    sourceUrl: "https://www.nasm.org/resource-center/exercise-library/push-up",
    sourceMatchType: "base movement",
    sourceNotes: "Same push-up mechanics, wider hands",
  },
  {
    slug: "reverse-crunch",
    name: "Reverse Crunch",
    category: "core",
    equipment: "None",
    primaryMuscles: ["Abs"],
    description:
      "Lie on your back and curl the pelvis toward the ribs using your abs. Lower with control instead of swinging the legs.",
    shortCue: "Curl hips up using abs, lower with control.",
    commonMistake: "Swinging legs.",
    regression: "Smaller curl.",
    progression: "Add pause at top.",
    sourceName: "NASM",
    sourceUrl:
      "https://www.nasm.org/resource-center/exercise-library/reverse-crunch-to-knee-up-with-rotation",
    sourceMatchType: "close variation",
    sourceNotes: "Omit rotation for this program",
  },
  {
    slug: "scissor-kick",
    name: "Scissor Kick",
    category: "core",
    equipment: "None",
    primaryMuscles: ["Abs", "Hip flexors"],
    description:
      "Lie on your back with the low back braced. Alternate legs in a smooth scissor pattern while keeping the torso quiet.",
    shortCue: "Brace low back, alternate legs smoothly.",
    commonMistake: "Arching low back.",
    regression: "Keep legs higher.",
    progression: "Lower legs closer to floor.",
    sourceName: "NASM",
    sourceUrl: "https://www.nasm.org/resource-center/exercise-library/dead-bug",
    sourceMatchType: "base movement",
    sourceNotes:
      "Use for core bracing reference; replace with exact accredited video if found",
  },
  {
    slug: "prone-cobra",
    name: "Prone Cobra",
    category: "pull",
    equipment: "None",
    primaryMuscles: ["Upper back", "Rear shoulders"],
    description:
      "Lie face down, lift the chest lightly, rotate thumbs up, and squeeze the shoulder blades before lowering.",
    shortCue: "Lift chest lightly, thumbs rotate up, squeeze shoulder blades.",
    commonMistake: "Cranking neck up.",
    regression: "Smaller lift.",
    progression: "Longer hold.",
    sourceName: "NASM",
    sourceUrl:
      "https://www.nasm.org/resource-center/exercise-library/floor-prone-cobra",
    sourceMatchType: "exact",
    sourceNotes: "No equipment",
  },
  {
    slug: "single-leg-glute-bridge",
    name: "Single-Leg Glute Bridge",
    category: "legs",
    equipment: "None",
    primaryMuscles: ["Glutes", "Hamstrings"],
    description:
      "Lie on your back, lift one leg, and drive through the planted heel to raise the hips while keeping them level.",
    shortCue: "Drive through heel, keep hips level.",
    commonMistake: "Twisting hips.",
    regression: "Two-leg bridge.",
    progression: "Longer top hold.",
    sourceName: "ACE",
    sourceUrl:
      "https://www.acefitness.org/resources/everyone/exercise-library/145/glute-bridge-single-leg-progression/",
    sourceMatchType: "exact",
    sourceNotes: "Single-leg bridge progression",
  },
  {
    slug: "step-up",
    name: "Step-Up",
    category: "legs",
    equipment: "Sturdy step or bench",
    primaryMuscles: ["Quads", "Glutes"],
    description:
      "Place a full foot on a raised platform, stand tall, then lower slowly. Alternate sides toward the total count.",
    shortCue: "Place full foot on step, stand tall, lower slow.",
    commonMistake: "Knee collapsing inward.",
    regression: "Lower step.",
    progression: "Hold light dumbbells.",
    sourceName: "ACE",
    sourceUrl:
      "https://www.acefitness.org/resources/everyone/exercise-library/28/step-up/",
    sourceMatchType: "exact",
    sourceNotes: "Raised platform/box",
  },
  {
    slug: "cross-body-mountain-climber",
    name: "Cross-Body Mountain Climber",
    category: "conditioning",
    equipment: "None",
    primaryMuscles: ["Core", "Shoulders", "Hip flexors"],
    description:
      "From a high plank, drive one knee toward the opposite elbow, then switch sides with control.",
    shortCue: "High plank, knee toward opposite elbow, switch.",
    commonMistake: "Bouncing hips high.",
    regression: "Slow taps.",
    progression: "Faster tempo.",
    sourceName: "NASM",
    sourceUrl:
      "https://www.nasm.org/resource-center/exercise-library/straight-arm-plank",
    sourceMatchType: "base movement",
    sourceNotes: "Use plank setup and add cross-body knee drive",
  },
  {
    slug: "burpee",
    name: "Burpee",
    category: "conditioning",
    equipment: "None",
    primaryMuscles: ["Full body"],
    description:
      "Squat, move to plank, return, then stand or jump. Use the full version when form stays solid.",
    shortCue: "Squat, plank, return, stand or jump.",
    commonMistake: "Landing hard.",
    regression: "Step-back modified burpee.",
    progression: "Add push-up.",
    sourceName: "NASM",
    sourceUrl:
      "https://www.nasm.org/resource-center/exercise-library/squat-thrust-burpees",
    sourceMatchType: "exact",
    sourceNotes: "NASM labels squat thrust burpees",
  },
  {
    slug: "forearm-plank",
    name: "Forearm Plank",
    category: "core",
    equipment: "None",
    primaryMuscles: ["Core", "Shoulders"],
    description:
      "Hold a straight line on the forearms with elbows under the shoulders. Squeeze glutes and breathe steadily.",
    shortCue: "Elbows under shoulders, squeeze glutes, breathe.",
    commonMistake: "Hips sagging.",
    regression: "Knees down.",
    progression: "Longer hold.",
    sourceName: "NASM",
    sourceUrl: "https://www.nasm.org/resource-center/exercise-library/plank",
    sourceMatchType: "exact",
    sourceNotes: "Time-based hold",
  },
  {
    slug: "squat-press",
    name: "Squat Press",
    category: "full body",
    equipment: "None (optional light dumbbells)",
    primaryMuscles: ["Quads", "Glutes", "Shoulders"],
    description:
      "Bodyweight squat, then reach or press overhead as you stand. Keep the torso upright and the motion smooth.",
    shortCue: "Squat, stand, reach/press overhead.",
    commonMistake: "Rounding back.",
    regression: "Squat to chair.",
    progression: "Add light dumbbells.",
    sourceName: "NASM",
    sourceUrl:
      "https://www.nasm.org/resource-center/exercise-library/prisoner-squat",
    sourceMatchType: "base movement",
    sourceNotes: "Use squat mechanics, add overhead reach/press",
  },
  {
    slug: "squat-thrust",
    name: "Squat Thrust",
    category: "conditioning",
    equipment: "None",
    primaryMuscles: ["Full body", "Core"],
    description:
      "Hands down, feet back to plank, feet in, stand. No push-up required for this variation.",
    shortCue: "Hands down, feet back to plank, feet in, stand.",
    commonMistake: "Letting shoulders collapse.",
    regression: "Step feet one at a time.",
    progression: "Add jump.",
    sourceName: "NASM",
    sourceUrl:
      "https://www.nasm.org/resource-center/exercise-library/squat-thrust-burpees",
    sourceMatchType: "exact",
    sourceNotes: "No push-up required for this variation",
  },
  {
    slug: "skater-squat",
    name: "Skater Squat",
    category: "legs",
    equipment: "None",
    primaryMuscles: ["Glutes", "Quads", "Lateral hips"],
    description:
      "A controlled side-to-side or single-leg pattern. Shift to one side, control the knee, and push back up.",
    shortCue: "Shift to one side, control knee, push back up.",
    commonMistake: "Knee diving inward.",
    regression: "Shorter range.",
    progression: "Reach opposite foot behind.",
    sourceName: "NASM",
    sourceUrl:
      "https://www.nasm.org/resource-center/exercise-library/single-leg-squat-touchdown",
    sourceMatchType: "close variation",
    sourceNotes: "Similar single-leg control",
  },
  {
    slug: "wide-stance-calf-raise",
    name: "Wide-Stance Calf Raise",
    category: "legs",
    equipment: "None",
    primaryMuscles: ["Calves"],
    description:
      "Stand with feet wide, rise onto the balls of the feet, then lower slowly under control.",
    shortCue: "Feet wide, rise onto balls of feet, lower slow.",
    commonMistake: "Rolling ankles outward.",
    regression: "Hold wall.",
    progression: "Add pause at top.",
    sourceName: "NASM",
    sourceUrl:
      "https://www.nasm.org/resource-center/exercise-library/leg-press-calf-raise",
    sourceMatchType: "base movement",
    sourceNotes:
      "Calf raise mechanics; app describes standing bodyweight version",
  },
  {
    slug: "elbow-walkout",
    name: "Elbow Walkout",
    category: "core",
    equipment: "None",
    primaryMuscles: ["Core", "Shoulders"],
    description:
      "Move between elbow and high plank, or walk the hands out with control while keeping the hips steady.",
    shortCue:
      "Move between elbow/high plank or walk hands out with control.",
    commonMistake: "Rocking hips side to side.",
    regression: "Fewer steps.",
    progression: "Add pause in plank.",
    sourceName: "NASM",
    sourceUrl:
      "https://www.nasm.org/resource-center/exercise-library/plank-walkup",
    sourceMatchType: "close variation",
    sourceNotes: "Similar plank transition",
  },
  {
    slug: "good-morning-hip-hinge",
    name: "Good Morning / Hip Hinge",
    category: "posterior chain",
    equipment: "None",
    primaryMuscles: ["Hamstrings", "Glutes", "Back"],
    description:
      "Soft knees, push the hips back with a neutral spine, then stand by squeezing the glutes. Default to bodyweight.",
    shortCue: "Soft knees, push hips back, stand by squeezing glutes.",
    commonMistake: "Squatting instead of hinging.",
    regression: "Hands on hips.",
    progression: "Hold light weight.",
    sourceName: "NASM",
    sourceUrl:
      "https://www.nasm.org/resource-center/exercise-library/good-mornings",
    sourceMatchType: "base movement",
    sourceNotes: "App defaults to bodyweight hip hinge",
  },
  {
    slug: "sit-up-or-crunch",
    name: "Sit-Up or Crunch",
    category: "core",
    equipment: "None",
    primaryMuscles: ["Abs"],
    description:
      "Curl the ribs toward the pelvis with a relaxed neck. Crunch is the beginner default for this program.",
    shortCue: "Curl ribs toward pelvis, keep neck relaxed.",
    commonMistake: "Pulling head with hands.",
    regression: "Smaller crunch.",
    progression: "Slow tempo.",
    sourceName: "ACE",
    sourceUrl:
      "https://www.acefitness.org/resources/everyone/exercise-library/52/crunch/",
    sourceMatchType: "exact",
    sourceNotes: "Crunch is beginner default",
  },
  {
    slug: "bent-knee-leg-raise",
    name: "Bent-Knee Leg Raise",
    category: "core",
    equipment: "None",
    primaryMuscles: ["Abs", "Hip flexors"],
    description:
      "Lie on your back with knees bent. Lift the hips or legs, then lower slowly without arching the low back.",
    shortCue: "Knees bent, lift hips/legs, lower slowly.",
    commonMistake: "Lower back arching.",
    regression: "One leg at a time.",
    progression: "Extend legs more.",
    sourceName: "ACE",
    sourceUrl:
      "https://www.acefitness.org/resources/everyone/exercise-library/238/supine-reverse-marches/",
    sourceMatchType: "close variation",
    sourceNotes: "Similar bent-knee lower-ab control",
  },
  {
    slug: "inverted-row",
    name: "Inverted Row",
    category: "pull",
    equipment: "Sturdy table, bar, or TRX",
    primaryMuscles: ["Back", "Biceps", "Rear shoulders"],
    description:
      "Keep a straight body line and pull the chest toward a bar, table edge, or suspension handles, then lower with control.",
    shortCue: "Straight body, pull chest to bar/table, lower with control.",
    commonMistake: "Shrugging shoulders.",
    regression: "Higher bar angle.",
    progression: "Feet farther forward.",
    sourceName: "NASM",
    sourceUrl:
      "https://blog.nasm.org/three-awesome-row-exercise-variations",
    sourceMatchType: "exact article",
    sourceNotes: "NASM article includes inverted-row technique",
  },
  {
    slug: "side-lunge",
    name: "Side Lunge",
    category: "legs",
    equipment: "None",
    primaryMuscles: ["Glutes", "Quads", "Adductors"],
    description:
      "Step to the side, sit the hips back, then push through the planted foot to return. Alternate sides.",
    shortCue: "Step side, hips back, push through planted foot.",
    commonMistake: "Step too wide.",
    regression: "Smaller step.",
    progression: "Add reach or weight.",
    sourceName: "ACE",
    sourceUrl:
      "https://www.acefitness.org/resources/everyone/exercise-library/50/side-lunge/",
    sourceMatchType: "exact",
    sourceNotes: "No equipment",
  },
  {
    slug: "walking-lunge",
    name: "Walking Lunge",
    category: "legs",
    equipment: "None",
    primaryMuscles: ["Quads", "Glutes"],
    description:
      "Step forward into a lunge, lower with control, then drive into the next step. Keep the torso tall.",
    shortCue: "Step forward, lower with control, drive to next step.",
    commonMistake: "Front knee caving inward.",
    regression: "Stationary lunge.",
    progression: "Add light dumbbells.",
    sourceName: "ACE",
    sourceUrl:
      "https://www.acefitness.org/resources/everyone/exercise-library/94/forward-lunge/",
    sourceMatchType: "base movement",
    sourceNotes: "Use forward lunge mechanics, repeat as walking reps",
  },
  {
    slug: "plank-shoulder-tap",
    name: "Plank Shoulder Tap",
    category: "core",
    equipment: "None",
    primaryMuscles: ["Core", "Shoulders"],
    description:
      "From a high plank, tap the opposite shoulder while keeping the hips as quiet as possible.",
    shortCue: "High plank, tap opposite shoulder, keep hips quiet.",
    commonMistake: "Rotating hips.",
    regression: "Wider feet.",
    progression: "Narrow feet.",
    sourceName: "NASM",
    sourceUrl:
      "https://www.nasm.org/resource-center/exercise-library/straight-arm-plank",
    sourceMatchType: "base movement",
    sourceNotes: "Add alternating shoulder taps from high plank",
  },
];

/** In-app demo videos (YouTube). Prefer NASM form videos linked from the exercise library. */
const VIDEO_YOUTUBE_IDS: Record<string, string> = {
  "modified-burpee": "Ny8JWqh4lNg",
  "alternating-step-up": "URHdW9js6DM",
  "incline-diamond-push-up": "0JUrOH--Kdk",
  "wide-push-up": "WDIpL0pjun0",
  "reverse-crunch": "wtKWBzDwfIM",
  "scissor-kick": "bxn9FBrt4-A",
  "prone-cobra": "keErJXdp2lE",
  "single-leg-glute-bridge": "SKOMwg1JLrU",
  "step-up": "URHdW9js6DM",
  "cross-body-mountain-climber": "MDxfAuBbHHA",
  burpee: "Ny8JWqh4lNg",
  "forearm-plank": "mwlp75MS6Rg",
  "squat-press": "UYbsgiiZgao",
  "squat-thrust": "Ny8JWqh4lNg",
  "skater-squat": "h6lET2_DLA0",
  "wide-stance-calf-raise": "8k435cj30gc",
  "elbow-walkout": "6Tv4xTRPtUc",
  "good-morning-hip-hinge": "Daq-wJMUnes",
  "sit-up-or-crunch": "QFLftqPWjoI",
  "bent-knee-leg-raise": "wtKWBzDwfIM",
  "inverted-row": "hXTc1mDnZCw",
  "side-lunge": "vwK7vZNQwUI",
  "walking-lunge": "UInwcEa5BH4",
  "plank-shoulder-tap": "MDxfAuBbHHA",
};

export const EXERCISES: Exercise[] = exerciseDefs.map((e, i) => ({
  ...e,
  id: `ex-${i + 1}`,
  videoYoutubeId: VIDEO_YOUTUBE_IDS[e.slug],
}));

const bySlug = Object.fromEntries(EXERCISES.map((e) => [e.slug, e]));

type ItemSeed = {
  dayId: string;
  slug: string;
  order: number;
  count: number;
  unit: string;
  notes: string;
};

const itemSeeds: ItemSeed[] = [
  {
    dayId: "day-a",
    slug: "modified-burpee",
    order: 1,
    count: 31,
    unit: "reps",
    notes: "Step-back version allowed",
  },
  {
    dayId: "day-a",
    slug: "alternating-step-up",
    order: 2,
    count: 24,
    unit: "total reps",
    notes: "Count both legs together",
  },
  {
    dayId: "day-a",
    slug: "incline-diamond-push-up",
    order: 3,
    count: 16,
    unit: "reps",
    notes: "Incline, narrow/diamond hands",
  },
  {
    dayId: "day-a",
    slug: "wide-push-up",
    order: 4,
    count: 22,
    unit: "reps",
    notes: "Hands wider than shoulders",
  },
  {
    dayId: "day-a",
    slug: "reverse-crunch",
    order: 5,
    count: 15,
    unit: "reps",
    notes: "Curl pelvis, do not swing legs",
  },
  {
    dayId: "day-a",
    slug: "scissor-kick",
    order: 6,
    count: 15,
    unit: "each side",
    notes: "Keep low back controlled",
  },
  {
    dayId: "day-a",
    slug: "prone-cobra",
    order: 7,
    count: 19,
    unit: "reps",
    notes: "Squeeze shoulder blades",
  },
  {
    dayId: "day-a",
    slug: "single-leg-glute-bridge",
    order: 8,
    count: 21,
    unit: "total reps",
    notes: "Alternate sides or split evenly",
  },
  {
    dayId: "day-b",
    slug: "step-up",
    order: 1,
    count: 16,
    unit: "total reps",
    notes: "Use sturdy step/bench",
  },
  {
    dayId: "day-b",
    slug: "cross-body-mountain-climber",
    order: 2,
    count: 22,
    unit: "total reps",
    notes: "Knee drives toward opposite elbow",
  },
  {
    dayId: "day-b",
    slug: "burpee",
    order: 3,
    count: 20,
    unit: "reps",
    notes: "Full version if able",
  },
  {
    dayId: "day-b",
    slug: "forearm-plank",
    order: 4,
    count: 1,
    unit: "minute",
    notes: "Hold straight line",
  },
  {
    dayId: "day-b",
    slug: "squat-press",
    order: 5,
    count: 20,
    unit: "reps",
    notes: "Bodyweight squat to overhead reach",
  },
  {
    dayId: "day-b",
    slug: "squat-thrust",
    order: 6,
    count: 20,
    unit: "reps",
    notes: "Plank in/out, no push-up required",
  },
  {
    dayId: "day-b",
    slug: "skater-squat",
    order: 7,
    count: 17,
    unit: "total reps",
    notes: "Controlled side-to-side/single-leg pattern",
  },
  {
    dayId: "day-b",
    slug: "wide-stance-calf-raise",
    order: 8,
    count: 18,
    unit: "reps",
    notes: "Feet wide, rise under control",
  },
  {
    dayId: "day-c",
    slug: "elbow-walkout",
    order: 1,
    count: 18,
    unit: "reps",
    notes: "Walk between forearm/high plank or walk hands out",
  },
  {
    dayId: "day-c",
    slug: "good-morning-hip-hinge",
    order: 2,
    count: 16,
    unit: "reps",
    notes: "Hinge at hips, neutral back",
  },
  {
    dayId: "day-c",
    slug: "sit-up-or-crunch",
    order: 3,
    count: 22,
    unit: "reps",
    notes: "Crunch is the beginner default",
  },
  {
    dayId: "day-c",
    slug: "bent-knee-leg-raise",
    order: 4,
    count: 20,
    unit: "reps",
    notes: "Knees bent, controlled lower",
  },
  {
    dayId: "day-c",
    slug: "inverted-row",
    order: 5,
    count: 18,
    unit: "reps",
    notes: "Requires sturdy table/bar/TRX",
  },
  {
    dayId: "day-c",
    slug: "side-lunge",
    order: 6,
    count: 18,
    unit: "total reps",
    notes: "Alternate sides",
  },
  {
    dayId: "day-c",
    slug: "walking-lunge",
    order: 7,
    count: 17,
    unit: "total reps",
    notes: "Forward lunge steps",
  },
  {
    dayId: "day-c",
    slug: "plank-shoulder-tap",
    order: 8,
    count: 18,
    unit: "total taps",
    notes: "Minimize hip sway",
  },
];

export const WORKOUT_ITEMS: WorkoutItem[] = itemSeeds.map((item, i) => ({
  id: `item-${i + 1}`,
  workoutDayId: item.dayId,
  exerciseId: bySlug[item.slug].id,
  orderIndex: item.order,
  targetCount: item.count,
  targetUnit: item.unit,
  notes: item.notes,
}));

export const SAFETY_NOTICE =
  "This app is for personal fitness tracking and general education. Stop if you feel sharp pain, dizziness, chest pain, or unusual shortness of breath. Ask a qualified medical or fitness professional before starting a new program, especially if you have injuries or health conditions.";

export function getExerciseBySlug(slug: string): Exercise | undefined {
  return EXERCISES.find((e) => e.slug === slug);
}

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}

export function getWorkoutDayByCode(code: string): WorkoutDay | undefined {
  return WORKOUT_DAYS.find((d) => d.code === code);
}

export function getItemsForDay(dayId: string): WorkoutItem[] {
  return WORKOUT_ITEMS.filter((i) => i.workoutDayId === dayId).sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );
}
