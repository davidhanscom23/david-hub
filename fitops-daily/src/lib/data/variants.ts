import type { DifficultyMode, Exercise, ExerciseVariant, WorkoutItem } from "@/lib/types";

/**
 * Modified / advanced presentations for every catalog exercise.
 * Videos reuse accredited demos from the catalog (or close variations).
 */
export const EXERCISE_VARIANTS: Record<
  string,
  { modified: ExerciseVariant; advanced: ExerciseVariant }
> = {
  "modified-burpee": {
    modified: {
      name: "Bench-Assisted Burpee",
      shortCue: "Hands on a sturdy bench; step back and in — no floor drop.",
      description:
        "Place hands on a bench to reduce load on wrists, shoulders, and knees. Step one foot back at a time, then step in and stand tall.",
      videoYoutubeId: "Ny8JWqh4lNg",
      targetScale: 0.7,
    },
    advanced: {
      name: "Pop-Up Burpee",
      shortCue: "Step or jump back, then add a small hop as you stand.",
      description:
        "Use the standard modified burpee pattern, then add a controlled hop at the top for more power and heart-rate demand.",
      videoYoutubeId: "Ny8JWqh4lNg",
      targetScale: 1.2,
    },
  },
  "alternating-step-up": {
    modified: {
      name: "Low Step-Up",
      shortCue: "Use a low step; drive through the whole foot, alternate slowly.",
      description:
        "Lower box height reduces knee stress. Pause briefly on top for balance before stepping down.",
      videoYoutubeId: "URHdW9js6DM",
      targetScale: 0.75,
    },
    advanced: {
      name: "High Step-Up + Drive",
      shortCue: "Higher step; drive the trailing knee up at the top.",
      description:
        "Raise the step and add a knee drive for more glute and cardio demand. Keep torso tall.",
      videoYoutubeId: "URHdW9js6DM",
      targetScale: 1.25,
    },
  },
  "incline-diamond-push-up": {
    modified: {
      name: "High-Incline Diamond Push-Up",
      shortCue: "Hands in a diamond on a high bench or wall — shorter range.",
      description:
        "A steeper incline (or wall) reduces load while keeping the narrow-hand core challenge.",
      videoYoutubeId: "0JUrOH--Kdk",
      targetScale: 0.7,
    },
    advanced: {
      name: "Low-Incline Diamond Push-Up",
      shortCue: "Lower the incline toward floor height; keep elbows tucked.",
      description:
        "Shallower incline increases difficulty. Maintain diamond hand position and full-body tension.",
      videoYoutubeId: "0JUrOH--Kdk",
      targetScale: 1.25,
    },
  },
  "wide-push-up": {
    modified: {
      name: "Knee Wide Push-Up",
      shortCue: "Knees down, hands wide; lower chest under control.",
      description:
        "Kneeling removes some load for wrists, shoulders, or recovery days while keeping a wide-hand pattern.",
      videoYoutubeId: "WDIpL0pjun0",
      targetScale: 0.7,
    },
    advanced: {
      name: "Tempo Wide Push-Up",
      shortCue: "3-second lower, pause, press up; hands wider than shoulders.",
      description:
        "Slow eccentrics raise difficulty without equipment. Keep hips locked and chest traveling between hands.",
      videoYoutubeId: "WDIpL0pjun0",
      targetScale: 1.2,
    },
  },
  "reverse-crunch": {
    modified: {
      name: "Heel Slide Reverse Crunch",
      shortCue: "Slide heels toward hips with low-back pressed to the floor.",
      description:
        "Smaller range and floor contact reduce lumbar strain while still training lower abs.",
      videoYoutubeId: "wtKWBzDwfIM",
      targetScale: 0.75,
    },
    advanced: {
      name: "Hanging-Style Reverse Crunch",
      shortCue: "Curl pelvis higher; pause at the top without swinging.",
      description:
        "Increase range and add a top pause. Keep the motion from the pelvis, not momentum.",
      videoYoutubeId: "wtKWBzDwfIM",
      targetScale: 1.25,
    },
  },
  "scissor-kick": {
    modified: {
      name: "Supported Scissor Kick",
      shortCue: "Hands under hips; smaller, slower scissors near the floor.",
      description:
        "Hands support the pelvis to protect the low back. Keep amplitude small and controlled.",
      videoYoutubeId: "bxn9FBrt4-A",
      targetScale: 0.7,
    },
    advanced: {
      name: "Flutter Scissor Kick",
      shortCue: "Longer levers, quicker controlled flutter, head lightly lifted.",
      description:
        "Increase pace and lever length while keeping low back glued down. Stop if the back arches.",
      videoYoutubeId: "bxn9FBrt4-A",
      targetScale: 1.25,
    },
  },
  "prone-cobra": {
    modified: {
      name: "Hands-Down Cobra Hold",
      shortCue: "Lift chest slightly with hands lightly on the floor for support.",
      description:
        "Use light hand assist and a shorter hold/rep to build upper-back awareness safely.",
      videoYoutubeId: "keErJXdp2lE",
      targetScale: 0.75,
    },
    advanced: {
      name: "Prone Cobra with Reach",
      shortCue: "Lift chest and reach thumbs toward ceiling; squeeze hard.",
      description:
        "Add an external rotation reach and longer top squeeze for more posterior-chain demand.",
      videoYoutubeId: "keErJXdp2lE",
      targetScale: 1.25,
    },
  },
  "single-leg-glute-bridge": {
    modified: {
      name: "Two-Leg Glute Bridge",
      shortCue: "Both feet planted; drive hips up and squeeze glutes.",
      description:
        "Bilateral bridge reduces single-leg load for knee, hip, or balance limitations.",
      videoYoutubeId: "SKOMwg1JLrU",
      targetScale: 0.8,
    },
    advanced: {
      name: "Single-Leg Bridge March",
      shortCue: "Hold bridge and slowly march feet, keeping hips level.",
      description:
        "Add a march or longer top hold for greater glute and core demand.",
      videoYoutubeId: "SKOMwg1JLrU",
      targetScale: 1.25,
    },
  },
  "step-up": {
    modified: {
      name: "Assisted Low Step-Up",
      shortCue: "Low step; hold a rail lightly if needed for balance.",
      description:
        "Lower height and light support make this joint-friendlier while keeping the pattern.",
      videoYoutubeId: "URHdW9js6DM",
      targetScale: 0.75,
    },
    advanced: {
      name: "Power Step-Up",
      shortCue: "Drive up quickly; optional soft hop off the step.",
      description:
        "Faster concentric drive (and optional hop) increases power without changing the pattern.",
      videoYoutubeId: "URHdW9js6DM",
      targetScale: 1.25,
    },
  },
  "cross-body-mountain-climber": {
    modified: {
      name: "Standing Cross-Body March",
      shortCue: "Stand tall; drive opposite elbow to knee without planking.",
      description:
        "Removes wrist and shoulder load from the plank position while training the cross-body pattern.",
      videoYoutubeId: "MDxfAuBbHHA",
      targetScale: 0.75,
    },
    advanced: {
      name: "Fast Cross-Body Climber",
      shortCue: "High plank; quicker controlled cross-body knee drives.",
      description:
        "Increase tempo while keeping hips quiet. Quality before speed.",
      videoYoutubeId: "MDxfAuBbHHA",
      targetScale: 1.25,
    },
  },
  burpee: {
    modified: {
      name: "Step-Back Burpee",
      shortCue: "Squat, step to plank, step in, stand — no jump required.",
      description:
        "Swap jumps for steps to protect knees and lower impact while keeping conditioning.",
      videoYoutubeId: "Ny8JWqh4lNg",
      targetScale: 0.75,
    },
    advanced: {
      name: "Burpee + Push-Up",
      shortCue: "Full burpee with a push-up at the bottom of each rep.",
      description:
        "Add a push-up in plank for upper-body volume and harder conditioning.",
      videoYoutubeId: "Ny8JWqh4lNg",
      targetScale: 1.2,
    },
  },
  "forearm-plank": {
    modified: {
      name: "Knee Forearm Plank",
      shortCue: "Forearms down, knees down; keep a straight line from head to knees.",
      description:
        "Kneeling plank reduces demand for beginners or back-sensitive days.",
      videoYoutubeId: "mwlp75MS6Rg",
      targetScale: 0.6,
    },
    advanced: {
      name: "Long Forearm Plank",
      shortCue: "Full plank; extend the hold and breathe steadily.",
      description:
        "Longer hold time. Squeeze glutes and brace as if expecting a poke to the belly.",
      videoYoutubeId: "mwlp75MS6Rg",
      targetScale: 1.5,
    },
  },
  "squat-press": {
    modified: {
      name: "Sit-to-Stand Reach",
      shortCue: "Sit to a chair, stand, and reach arms overhead.",
      description:
        "Chair-assisted squat reduces depth demand for knees or balance limits.",
      videoYoutubeId: "UYbsgiiZgao",
      targetScale: 0.75,
    },
    advanced: {
      name: "Jump Squat to Press",
      shortCue: "Explosive squat then reach/press overhead on landing control.",
      description:
        "Add a small jump for power, then finish with a strong overhead reach.",
      videoYoutubeId: "UYbsgiiZgao",
      targetScale: 1.2,
    },
  },
  "squat-thrust": {
    modified: {
      name: "Hands-Elevated Squat Thrust",
      shortCue: "Hands on bench; step feet back and in from a squat.",
      description:
        "Elevated hands reduce wrist and core load while keeping the thrust pattern.",
      videoYoutubeId: "Ny8JWqh4lNg",
      targetScale: 0.75,
    },
    advanced: {
      name: "Squat Thrust + Hop",
      shortCue: "Feet jump back and in; finish with a small hop.",
      description:
        "Replace steps with hops for more intensity. Land softly.",
      videoYoutubeId: "Ny8JWqh4lNg",
      targetScale: 1.25,
    },
  },
  "skater-squat": {
    modified: {
      name: "Supported Lateral Squat",
      shortCue: "Hold a chair; shift side to side with shallow depth.",
      description:
        "Support and shallower depth protect knees while training lateral strength.",
      videoYoutubeId: "h6lET2_DLA0",
      targetScale: 0.75,
    },
    advanced: {
      name: "Deep Skater Squat",
      shortCue: "Lower further on the working leg; hover the trailing knee.",
      description:
        "Increase depth and single-leg demand. Keep hips square.",
      videoYoutubeId: "h6lET2_DLA0",
      targetScale: 1.25,
    },
  },
  "wide-stance-calf-raise": {
    modified: {
      name: "Seated or Dual-Support Calf Raise",
      shortCue: "Hold a wall; rise onto mid-foot slowly, wide stance.",
      description:
        "Add balance support and a shorter range if ankles are stiff or recovering.",
      videoYoutubeId: "8k435cj30gc",
      targetScale: 0.8,
    },
    advanced: {
      name: "Single-Leg Wide Calf Raise",
      shortCue: "Shift most load to one foot; pause at the top.",
      description:
        "Unilateral emphasis and top pauses increase calf demand.",
      videoYoutubeId: "8k435cj30gc",
      targetScale: 1.25,
    },
  },
  "elbow-walkout": {
    modified: {
      name: "Short Incline Walkout",
      shortCue: "Hands on bench; walk out a short distance and return.",
      description:
        "Incline and shorter range reduce core and wrist stress.",
      videoYoutubeId: "6Tv4xTRPtUc",
      targetScale: 0.7,
    },
    advanced: {
      name: "Full Floor Walkout",
      shortCue: "Walk hands out to a long plank, pause, walk back.",
      description:
        "Longer walkout and floor height increase anti-extension demand.",
      videoYoutubeId: "6Tv4xTRPtUc",
      targetScale: 1.25,
    },
  },
  "good-morning-hip-hinge": {
    modified: {
      name: "Seated or Soft-Knee Hinge",
      shortCue: "Soft knees; hinge until you feel hamstrings, then stand.",
      description:
        "Shallower hinge with soft knees for sensitive backs or beginners.",
      videoYoutubeId: "Daq-wJMUnes",
      targetScale: 0.75,
    },
    advanced: {
      name: "Loaded-Tempo Good Morning",
      shortCue: "Slow 3-count hinge; squeeze glutes to stand tall.",
      description:
        "Slower tempo and fuller hinge range increase posterior-chain work.",
      videoYoutubeId: "Daq-wJMUnes",
      targetScale: 1.25,
    },
  },
  "sit-up-or-crunch": {
    modified: {
      name: "Dead-Bug Curl",
      shortCue: "On back; gently curl shoulders while opposite arm/leg reach.",
      description:
        "Dead-bug style curl protects the neck and spine versus full sit-ups.",
      videoYoutubeId: "QFLftqPWjoI",
      targetScale: 0.75,
    },
    advanced: {
      name: "Full Sit-Up",
      shortCue: "Curl all the way to seated; lower with control.",
      description:
        "Full range sit-up for more demand. Anchor feet only if needed.",
      videoYoutubeId: "QFLftqPWjoI",
      targetScale: 1.2,
    },
  },
  "bent-knee-leg-raise": {
    modified: {
      name: "Heel Tap March",
      shortCue: "Knees bent; alternate tapping heels lightly to the floor.",
      description:
        "Smaller marches keep abs working with less hip-flexor and back stress.",
      videoYoutubeId: "wtKWBzDwfIM",
      targetScale: 0.75,
    },
    advanced: {
      name: "Straight-Leg Raise",
      shortCue: "Extend legs more; lower slowly without arching the back.",
      description:
        "Longer levers raise difficulty. Abort the set if the low back lifts.",
      videoYoutubeId: "wtKWBzDwfIM",
      targetScale: 1.25,
    },
  },
  "inverted-row": {
    modified: {
      name: "High-Angle Inverted Row",
      shortCue: "Set the bar/TRX higher so your body is more upright.",
      description:
        "A higher angle reduces load for shoulders or early strength phases.",
      videoYoutubeId: "hXTc1mDnZCw",
      targetScale: 0.75,
    },
    advanced: {
      name: "Feet-Forward Inverted Row",
      shortCue: "Walk feet forward to flatten the body; pause at the top.",
      description:
        "More horizontal body angle increases difficulty. Squeeze shoulder blades.",
      videoYoutubeId: "hXTc1mDnZCw",
      targetScale: 1.25,
    },
  },
  "side-lunge": {
    modified: {
      name: "Shallow Side Lunge to Box",
      shortCue: "Short lateral step; sit lightly toward a chair if needed.",
      description:
        "Reduce depth and add a target sit for knee-friendly lateral work.",
      videoYoutubeId: "vwK7vZNQwUI",
      targetScale: 0.75,
    },
    advanced: {
      name: "Deep Side Lunge",
      shortCue: "Longer step, deeper hip sit, strong push back to center.",
      description:
        "Increase depth and stretch demand. Keep the trailing leg straighter.",
      videoYoutubeId: "vwK7vZNQwUI",
      targetScale: 1.25,
    },
  },
  "walking-lunge": {
    modified: {
      name: "Supported Static Lunge",
      shortCue: "Hold a rail; split stance and lower a comfortable amount.",
      description:
        "Static supported lunges remove walking balance demand for injuries or rehab.",
      videoYoutubeId: "UInwcEa5BH4",
      targetScale: 0.75,
    },
    advanced: {
      name: "Walking Lunge with Pulse",
      shortCue: "Each step, add a small pulse at the bottom before advancing.",
      description:
        "Pulses increase time under tension. Keep front knee tracking over mid-foot.",
      videoYoutubeId: "UInwcEa5BH4",
      targetScale: 1.2,
    },
  },
  "plank-shoulder-tap": {
    modified: {
      name: "Incline Shoulder Tap",
      shortCue: "Hands on bench; tap opposite shoulder with minimal hip sway.",
      description:
        "Incline plank taps reduce wrist and core load while teaching anti-rotation.",
      videoYoutubeId: "MDxfAuBbHHA",
      targetScale: 0.75,
    },
    advanced: {
      name: "Slow Plank Shoulder Tap",
      shortCue: "Floor plank; 2-second pause each tap, feet closer together.",
      description:
        "Slower taps and narrower feet increase stability demand.",
      videoYoutubeId: "MDxfAuBbHHA",
      targetScale: 1.25,
    },
  },
};

export function getVariant(
  slug: string,
  mode: DifficultyMode,
): ExerciseVariant | null {
  if (mode === "normal") return null;
  return EXERCISE_VARIANTS[slug]?.[mode] ?? null;
}

export function scaleTarget(count: number, scale: number): number {
  if (count <= 1) {
    // Holds (e.g. 1 minute) — scale and keep one decimal when needed.
    const scaled = Math.round(count * scale * 10) / 10;
    return Math.max(0.5, scaled);
  }
  return Math.max(1, Math.round(count * scale));
}

export function applyDifficultyToExercise(
  exercise: Exercise,
  item: WorkoutItem,
  mode: DifficultyMode,
): { exercise: Exercise; item: WorkoutItem; mode: DifficultyMode } {
  const variant = getVariant(exercise.slug, mode);
  if (!variant) {
    return { exercise, item, mode: "normal" };
  }
  return {
    mode,
    exercise: {
      ...exercise,
      name: variant.name,
      shortCue: variant.shortCue,
      description: variant.description,
      videoYoutubeId: variant.videoYoutubeId,
      regression: exercise.regression,
      progression: exercise.progression,
    },
    item: {
      ...item,
      targetCount: scaleTarget(item.targetCount, variant.targetScale),
      notes: [item.notes, `${mode} variation`].filter(Boolean).join(" · "),
    },
  };
}

export const DIFFICULTY_OPTIONS: {
  value: DifficultyMode;
  label: string;
  hint: string;
}[] = [
  {
    value: "modified",
    label: "Modified",
    hint: "Joint-friendlier options for limitations or recovery",
  },
  {
    value: "normal",
    label: "Normal",
    hint: "Standard FitOps military catalog",
  },
  {
    value: "advanced",
    label: "Advanced",
    hint: "Harder progressions when you want more challenge",
  },
];
