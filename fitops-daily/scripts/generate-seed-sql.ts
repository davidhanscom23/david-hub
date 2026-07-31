import { writeFileSync } from "fs";
import { EXERCISES, WORKOUT_ITEMS } from "../src/lib/data/seed";

function esc(s: string) {
  return s.replace(/'/g, "''");
}

const dayIdMap: Record<string, string> = {
  "day-a": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
  "day-b": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2",
  "day-c": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3",
  "day-recovery": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4",
};

const exIdMap: Record<string, string> = {};
EXERCISES.forEach((e, i) => {
  exIdMap[e.id] = `bbbbbbbb-bbbb-bbbb-bbbb-${String(i + 1).padStart(12, "0")}`;
});

const lines: string[] = ["-- Auto-generated from src/lib/data/seed.ts", ""];
lines.push(
  "insert into public.exercises (id, slug, name, category, equipment, primary_muscles, short_cue, common_mistake, regression, progression, description, source_name, source_url, source_match_type, source_notes) values",
);
EXERCISES.forEach((e, i) => {
  const id = exIdMap[e.id];
  const muscles = `ARRAY[${e.primaryMuscles.map((m) => `'${esc(m)}'`).join(",")}]`;
  const row = `('${id}', '${esc(e.slug)}', '${esc(e.name)}', '${esc(e.category)}', '${esc(e.equipment)}', ${muscles}, '${esc(e.shortCue)}', '${esc(e.commonMistake)}', '${esc(e.regression)}', '${esc(e.progression)}', '${esc(e.description)}', '${esc(e.sourceName)}', '${esc(e.sourceUrl)}', '${esc(e.sourceMatchType)}', '${esc(e.sourceNotes)}')`;
  lines.push(row + (i < EXERCISES.length - 1 ? "," : ";"));
});

lines.push("");
lines.push(
  "insert into public.workout_items (workout_day_id, exercise_id, order_index, target_count, target_unit, notes) values",
);
WORKOUT_ITEMS.forEach((item, i) => {
  const row = `('${dayIdMap[item.workoutDayId]}', '${exIdMap[item.exerciseId]}', ${item.orderIndex}, ${item.targetCount}, '${esc(item.targetUnit)}', '${esc(item.notes)}')`;
  lines.push(row + (i < WORKOUT_ITEMS.length - 1 ? "," : ";"));
});

writeFileSync("supabase/seed_exercises.sql", lines.join("\n") + "\n");
console.log(
  `Wrote supabase/seed_exercises.sql (${EXERCISES.length} exercises, ${WORKOUT_ITEMS.length} items)`,
);
