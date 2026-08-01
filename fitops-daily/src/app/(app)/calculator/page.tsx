"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calculator as CalcIcon, Loader2, Sparkles } from "lucide-react";
import { useFitOps } from "@/components/providers/fitops-provider";
import { SafetyNotice } from "@/components/fitops/safety-notice";
import { WatchExampleButton } from "@/components/fitops/exercise-video-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getExerciseBySlug } from "@/lib/data/seed";
import { computeBmi, type GeneratedRegimen } from "@/lib/calculator/types";
import { cn } from "@/lib/utils";

type Focus = "fat_loss" | "muscle_gain" | "recomp" | "endurance";

function num(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export default function CalculatorPage() {
  const { state, saveAlternateRegimen, setActiveProgram } = useFitOps();
  const [sex, setSex] = useState<"female" | "male" | "unspecified">(
    "unspecified",
  );
  const [heightIn, setHeightIn] = useState("68");
  const [currentWeightLb, setCurrentWeightLb] = useState("185");
  const [currentBmi, setCurrentBmi] = useState("");
  const [goalWeightLb, setGoalWeightLb] = useState("175");
  const [waistIn, setWaistIn] = useState("");
  const [chestIn, setChestIn] = useState("");
  const [hipsIn, setHipsIn] = useState("");
  const [goalWaistIn, setGoalWaistIn] = useState("");
  const [goalFocus, setGoalFocus] = useState<Focus>("recomp");
  const [daysPerWeek, setDaysPerWeek] = useState("3");
  const [experience, setExperience] = useState<"beginner" | "intermediate">(
    "beginner",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [regimen, setRegimen] = useState<GeneratedRegimen | null>(
    state.alternateRegimen,
  );
  const [savedFlash, setSavedFlash] = useState(false);

  const liveBmi = useMemo(() => {
    const h = num(heightIn);
    const w = num(currentWeightLb);
    if (!h || !w) return null;
    return computeBmi(w, h);
  }, [heightIn, currentWeightLb]);

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        sex,
        heightIn: num(heightIn),
        currentWeightLb: num(currentWeightLb),
        currentBmi: num(currentBmi) ?? liveBmi,
        currentMeasurements: {
          waistIn: num(waistIn) ?? null,
          chestIn: num(chestIn) ?? null,
          hipsIn: num(hipsIn) ?? null,
        },
        goalWeightLb: num(goalWeightLb),
        goalMeasurements: {
          waistIn: num(goalWaistIn) ?? null,
        },
        goalFocus,
        daysPerWeek: Number(daysPerWeek),
        experience,
      };

      const res = await fetch("/api/calculator/regimen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not generate regimen");
      }
      setRegimen(data.regimen);
      setAiEnabled(Boolean(data.aiEnabled));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  function saveAsAlternate() {
    if (!regimen) return;
    saveAlternateRegimen(regimen);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fit-accent)]">
          Calculator
        </p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight md:text-3xl">
          <CalcIcon className="size-7 text-[var(--fit-primary)]" />
          Body goal planner
        </h1>
        <p className="mt-1 text-sm text-[var(--fit-muted)]">
          Enter current and goal metrics. The backend builds an alternate
          regimen for your starting point — optional AI when configured, with a
          solid rules engine otherwise.
        </p>
      </header>

      <SafetyNotice compact />

      <form
        onSubmit={onGenerate}
        className="space-y-4 rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Sex (optional)">
            <select
              className={selectClass}
              value={sex}
              onChange={(e) => setSex(e.target.value as typeof sex)}
            >
              <option value="unspecified">Unspecified</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </Field>
          <Field label="Experience">
            <select
              className={selectClass}
              value={experience}
              onChange={(e) =>
                setExperience(e.target.value as typeof experience)
              }
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
            </select>
          </Field>
          <Field label="Height (inches)">
            <Input
              inputMode="decimal"
              value={heightIn}
              onChange={(e) => setHeightIn(e.target.value)}
              required
              className="bg-[var(--fit-bg)]"
            />
          </Field>
          <Field label="Current weight (lb)">
            <Input
              inputMode="decimal"
              value={currentWeightLb}
              onChange={(e) => setCurrentWeightLb(e.target.value)}
              required
              className="bg-[var(--fit-bg)]"
            />
          </Field>
          <Field
            label={`Current BMI${liveBmi != null ? ` (auto ${liveBmi})` : ""}`}
          >
            <Input
              inputMode="decimal"
              value={currentBmi}
              onChange={(e) => setCurrentBmi(e.target.value)}
              placeholder={liveBmi != null ? String(liveBmi) : "Optional"}
              className="bg-[var(--fit-bg)]"
            />
          </Field>
          <Field label="Goal weight (lb)">
            <Input
              inputMode="decimal"
              value={goalWeightLb}
              onChange={(e) => setGoalWeightLb(e.target.value)}
              required
              className="bg-[var(--fit-bg)]"
            />
          </Field>
          <Field label="Current waist (in)">
            <Input
              inputMode="decimal"
              value={waistIn}
              onChange={(e) => setWaistIn(e.target.value)}
              className="bg-[var(--fit-bg)]"
            />
          </Field>
          <Field label="Goal waist (in)">
            <Input
              inputMode="decimal"
              value={goalWaistIn}
              onChange={(e) => setGoalWaistIn(e.target.value)}
              className="bg-[var(--fit-bg)]"
            />
          </Field>
          <Field label="Current chest (in)">
            <Input
              inputMode="decimal"
              value={chestIn}
              onChange={(e) => setChestIn(e.target.value)}
              className="bg-[var(--fit-bg)]"
            />
          </Field>
          <Field label="Current hips (in)">
            <Input
              inputMode="decimal"
              value={hipsIn}
              onChange={(e) => setHipsIn(e.target.value)}
              className="bg-[var(--fit-bg)]"
            />
          </Field>
          <Field label="Goal focus">
            <select
              className={selectClass}
              value={goalFocus}
              onChange={(e) => setGoalFocus(e.target.value as Focus)}
            >
              <option value="recomp">Recomp / general</option>
              <option value="fat_loss">Fat loss</option>
              <option value="muscle_gain">Muscle gain</option>
              <option value="endurance">Endurance</option>
            </select>
          </Field>
          <Field label="Days per week">
            <select
              className={selectClass}
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(e.target.value)}
            >
              {[3, 4, 5, 6].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {error && <p className="text-sm text-[var(--fit-alert)]">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Generate alternate regimen
            </>
          )}
        </Button>
      </form>

      {regimen && (
        <section className="space-y-4">
          <div className="rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--fit-muted)]">
                  Suggested alternate ·{" "}
                  {regimen.generatedBy === "ai" ? "AI" : "Rules engine"}
                  {regimen.generatedBy === "rules" && aiEnabled === false
                    ? " (set OPENAI_API_KEY for AI)"
                    : ""}
                </p>
                <h2 className="mt-1 text-xl font-semibold">{regimen.name}</h2>
                <p className="mt-1 text-sm text-[var(--fit-muted)]">
                  {regimen.summary}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={saveAsAlternate}>
                  {savedFlash ? "Saved" : "Use as alternate plan"}
                </Button>
                {state.alternateRegimen && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveProgram("military")}
                  >
                    Prefer military plan
                  </Button>
                )}
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <Stat
                label="Profile"
                value={regimen.bodyProfile.replace(/_/g, " ")}
              />
              <Stat
                label="Focus"
                value={regimen.goalFocus.replace(/_/g, " ")}
              />
              <Stat
                label="Workouts/wk"
                value={String(regimen.weeklyTargetWorkouts)}
              />
              <Stat
                label="Horizon"
                value={`${regimen.estimatedWeeks} weeks`}
              />
            </dl>
            <ul className="mt-3 space-y-1.5 text-sm text-[var(--fit-muted)]">
              {regimen.coachingNotes.map((note) => (
                <li key={note} className="rounded-lg bg-[var(--fit-bg)] px-3 py-2">
                  {note}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-[var(--fit-muted)]">
              {regimen.safetyNote}
            </p>
          </div>

          {regimen.days.map((day) => (
            <div
              key={day.code}
              className="space-y-3 rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4"
            >
              <div>
                <p className="text-xs text-[var(--fit-muted)]">
                  {day.weekdayHint} · {day.code}
                </p>
                <h3 className="font-semibold">{day.title}</h3>
                <p className="text-sm text-[var(--fit-muted)]">{day.focus}</p>
              </div>
              <ul className="space-y-2">
                {day.exercises.map((ex) => {
                  const catalog = getExerciseBySlug(ex.slug);
                  return (
                    <li
                      key={`${day.code}-${ex.slug}`}
                      className="rounded-lg border border-[var(--fit-border)] px-3 py-2"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/exercise/${ex.slug}`}
                            className="font-medium hover:text-[var(--fit-primary)]"
                          >
                            {ex.name}
                          </Link>
                          <p className="text-sm font-semibold tabular-nums text-[var(--fit-primary)]">
                            {ex.targetCount} {ex.targetUnit}
                          </p>
                          {ex.notes && (
                            <p className="text-xs text-[var(--fit-muted)]">
                              {ex.notes}
                            </p>
                          )}
                        </div>
                        {catalog?.videoYoutubeId && (
                          <WatchExampleButton
                            exerciseName={catalog.name}
                            videoYoutubeId={catalog.videoYoutubeId}
                            sourceName={catalog.sourceName}
                          />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

const selectClass =
  "flex h-9 w-full rounded-lg border border-[var(--fit-border)] bg-[var(--fit-bg)] px-3 text-sm";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-xs text-[var(--fit-muted)]">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--fit-bg)] px-3 py-2">
      <dt className="text-[11px] uppercase tracking-wide text-[var(--fit-muted)]">
        {label}
      </dt>
      <dd className={cn("mt-0.5 font-medium capitalize")}>{value}</dd>
    </div>
  );
}
