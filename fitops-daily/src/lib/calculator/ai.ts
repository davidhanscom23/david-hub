import type { CalculatorInput, GeneratedRegimen } from "@/lib/calculator/types";
import {
  catalogSlugSet,
  generateRegimenRules,
  hydrateAiRegimen,
} from "@/lib/calculator/generate";
import { EXERCISES } from "@/lib/data/seed";

function aiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY || process.env.AI_API_KEY);
}

export async function generateRegimenWithOptionalAi(
  input: CalculatorInput,
): Promise<GeneratedRegimen> {
  const fallback = generateRegimenRules(input);
  if (!aiConfigured()) return fallback;

  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY!;
  const baseUrl =
    process.env.OPENAI_BASE_URL?.replace(/\/$/, "") ||
    "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const allowed = EXERCISES.map((e) => ({
    slug: e.slug,
    name: e.name,
    equipment: e.equipment,
  }));

  const system = `You are FitOps Daily's workout planner. Return ONLY valid JSON for an alternate bodyweight regimen.
Rules:
- Use ONLY exercise slugs from the provided catalog.
- Build exactly 3 training days (ALT-A, ALT-B, ALT-C), 5-7 exercises each.
- Prefer joint-friendly regressions for higher BMI or beginners.
- No medical claims. Educational fitness programming only.
- JSON shape:
{
  "name": string,
  "summary": string,
  "bodyProfile": "lean_build"|"athletic_build"|"solid_build"|"higher_bmi_focus",
  "goalFocus": "fat_loss"|"muscle_gain"|"recomp"|"endurance",
  "weeklyTargetWorkouts": number,
  "estimatedWeeks": number,
  "coachingNotes": string[],
  "days": [{
    "code": string,
    "title": string,
    "focus": string,
    "weekdayHint": string,
    "exercises": [{"slug": string, "targetCount": number, "targetUnit": string, "notes": string}]
  }]
}`;

  const user = {
    input,
    catalog: allowed,
    allowedSlugs: [...catalogSlugSet()],
  };

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: JSON.stringify(user) },
        ],
      }),
    });

    if (!res.ok) {
      console.error("AI regimen error", res.status, await res.text());
      return fallback;
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return fallback;
    const parsed = JSON.parse(content) as Partial<GeneratedRegimen>;
    return hydrateAiRegimen(parsed, input, fallback);
  } catch (err) {
    console.error("AI regimen failed", err);
    return fallback;
  }
}
