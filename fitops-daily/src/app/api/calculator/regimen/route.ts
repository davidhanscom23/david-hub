import { NextResponse } from "next/server";
import { calculatorInputSchema } from "@/lib/calculator/types";
import { computeBmi } from "@/lib/calculator/types";
import { generateRegimenWithOptionalAi } from "@/lib/calculator/ai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = calculatorInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const input = {
      ...parsed.data,
      currentBmi:
        parsed.data.currentBmi ??
        computeBmi(parsed.data.currentWeightLb, parsed.data.heightIn),
    };

    const regimen = await generateRegimenWithOptionalAi(input);
    return NextResponse.json({
      input,
      regimen,
      aiEnabled: Boolean(process.env.OPENAI_API_KEY || process.env.AI_API_KEY),
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
