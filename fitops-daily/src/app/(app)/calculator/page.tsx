"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calculator as CalcIcon, Loader2, Sparkles } from "lucide-react";
import { useFitOps } from "@/components/providers/fitops-provider";
import { SafetyNotice } from "@/components/fitops/safety-notice";
import { WatchExampleButton } from "@/components/fitops/exercise-video-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getExerciseBySlug } from "@/lib/data/seed";
import { computeBmi, type GeneratedRegimen } from "@/lib/calculator/types";
import type { CalculatorDraft, SexPreference } from "@/lib/types";
import { cn } from "@/lib/utils";

function num(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export default function CalculatorPage() {
  const {
    state,
    saveAlternateRegimen,
    setActiveProgram,
    setCalculatorDraft,
  } = useFitOps();
  const draft = state.calculatorDraft;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [regimen, setRegimen] = useState<GeneratedRegimen | null>(
    state.alternateRegimen,
  );
  const [savedFlash, setSavedFlash] = useState(false);

  function patchDraft(patch: Partial<CalculatorDraft>) {
    setCalculatorDraft(patch);
  }

  const liveBmi = useMemo(() => {
    const h = num(draft.heightIn);
    const w = num(draft.currentWeightLb);
    if (!h || !w) return null;
    return computeBmi(w, h);
  }, [draft.heightIn, draft.currentWeightLb]);

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        sex: draft.sex,
        heightIn: num(draft.heightIn),
        currentWeightLb: num(draft.currentWeightLb),
        currentBmi: num(draft.currentBmi) ?? liveBmi,
        currentMeasurements: {
          waistIn: num(draft.waistIn) ?? null,
          chestIn: num(draft.chestIn) ?? null,
          hipsIn: num(draft.hipsIn) ?? null,
        },
        goalWeightLb: num(draft.goalWeightLb),
        goalMeasurements: {
          waistIn: num(draft.goalWaistIn) ?? null,
        },
        goalFocus: draft.goalFocus,
        daysPerWeek: Number(draft.daysPerWeek),
        experience: draft.experience,
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
          Enter current and goal metrics. Your choices (including sex) save with
          your account. The backend builds an alternate regimen — optional AI
          when configured, rules engine otherwise.
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
              value={draft.sex}
              onChange={(e) =>
                patchDraft({ sex: e.target.value as SexPreference })
              }
            >
              <option value="unspecified">Unspecified</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </Field>
          <Field label="Experience">
            <select
              className={selectClass}
              value={draft.experience}
              onChange={(e) =>
                patchDraft({
                  experience: e.target.value as CalculatorDraft["experience"],
                })
              }
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
            </select>
          </Field>
          <Field label="Height (inches)">
            <Input
              inputMode="decimal"
              value={draft.heightIn}
              onChange={(e) => patchDraft({ heightIn: e.target.value })}
              required
              className="bg-[var(--fit-bg)]"
            />
          </Field>
          <Field label="Current weight (lb)">
            <Input
              inputMode="decimal"
              value={draft.currentWeightLb}
              onChange={(e) => patchDraft({ currentWeightLb: e.target.value })}
              required
              className="bg-[var(--fit-bg)]"
            />
          </Field>
          <Field
            label={`Current BMI${liveBmi != null ? ` (auto ${liveBmi})` : ""}`}
          >
            <Input
              inputMode="decimal"
              value={draft.currentBmi}
              onChange={(e) => patchDraft({ currentBmi: e.target.value })}
              placeholder={liveBmi != null ? String(liveBmi) : "Optional"}
              className="bg-[var(--fit-bg)]"
            />
          </Field>
          <Field label="Goal weight (lb)">
            <Input
              inputMode="decimal"
              value={draft.goalWeightLb}
              onChange={(e) => patchDraft({ goalWeightLb: e.target.value })}
              required
              className="bg-[var(--fit-bg)]"
            />
          </Field>
          <Field label="Current waist (in)">
            <Input
              inputMode="decimal"
              value={draft.waistIn}
              onChange={(e) => patchDraft({ waistIn: e.target.value })}
              className="bg-[var(--fit-bg)]"
            />
          </Field>
          <Field label="Goal waist (in)">
            <Input
              inputMode="decimal"
              value={draft.goalWaistIn}
              onChange={(e) => patchDraft({ goalWaistIn: e.target.value })}
              className="bg-[var(--fit-bg)]"
            />
          </Field>
          <Field label="Current chest (in)">
            <Input
              inputMode="decimal"
              value={draft.chestIn}
              onChange={(e) => patchDraft({ chestIn: e.target.value })}
              className="bg-[var(--fit-bg)]"
            />
          </Field>
          <Field label="Current hips (in)">
            <Input
              inputMode="decimal"
              value={draft.hipsIn}
              onChange={(e) => patchDraft({ hipsIn: e.target.value })}
              className="bg-[var(--fit-bg)]"
            />
          </Field>
          <Field label="Goal focus">
            <select
              className={selectClass}
              value={draft.goalFocus}
              onChange={(e) =>
                patchDraft({
                  goalFocus: e.target.value as CalculatorDraft["goalFocus"],
                })
              }
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
              value={draft.daysPerWeek}
              onChange={(e) => patchDraft({ daysPerWeek: e.target.value })}
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
                  const exercise = getExerciseBySlug(ex.slug);
                  return (
                    <li
                      key={`${day.code}-${ex.slug}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--fit-bg)] px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{ex.name}</p>
                        <p className="text-xs text-[var(--fit-muted)]">
                          {ex.targetCount} {ex.targetUnit}
                          {ex.notes ? ` · ${ex.notes}` : ""}
                        </p>
                      </div>
                      {exercise ? (
                        <WatchExampleButton
                          exerciseName={exercise.name}
                          videoYoutubeId={exercise.videoYoutubeId}
                          sourceName={exercise.sourceName}
                        />
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>
      )}

      <p className="text-center text-sm text-[var(--fit-muted)]">
        Prefer picking your own moves?{" "}
        <Link href="/build" className="font-medium text-[var(--fit-primary)]">
          Build a custom workout
        </Link>
      </p>
    </div>
  );
}

const selectClass = cn(
  "mt-1.5 flex h-9 w-full rounded-lg border border-[var(--fit-border)] bg-[var(--fit-bg)] px-3 text-sm",
);

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--fit-bg)] px-3 py-2">
      <dt className="text-xs text-[var(--fit-muted)]">{label}</dt>
      <dd className="font-medium capitalize">{value}</dd>
    </div>
  );
}
