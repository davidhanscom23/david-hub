"use client";

import { PRESET_PLANS } from "@/lib/data/presets";
import { useFitOps } from "@/components/providers/fitops-provider";
import { cn } from "@/lib/utils";

/**
 * Ready-made plans (Calisthenics, Chair Tai Chi) the user can load with one tap.
 * Selecting one stores it as the active "Alternate plan"; the Military A/B/C
 * plan remains available from the switcher above.
 */
export function PresetPlans() {
  const { state, saveAlternateRegimen } = useFitOps();

  return (
    <section className="space-y-3 rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
      <div>
        <h2 className="font-semibold">Ready-made plans</h2>
        <p className="mt-1 text-sm text-[var(--fit-muted)]">
          Load a different style of training with one tap. It becomes your
          Alternate plan — switch back to Military A/B/C anytime above.
        </p>
      </div>

      <div className="space-y-3">
        {PRESET_PLANS.map((preset) => {
          const isActive =
            state.activeProgram === "alternate" &&
            state.alternateRegimen?.id === preset.id;
          return (
            <div
              key={preset.id}
              className={cn(
                "rounded-lg border p-3",
                isActive
                  ? "border-[var(--fit-primary)] bg-[var(--fit-primary)]/5"
                  : "border-[var(--fit-border)]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{preset.name}</p>
                  <p className="mt-1 text-sm text-[var(--fit-muted)]">
                    {preset.summary}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => saveAlternateRegimen(preset)}
                  disabled={isActive}
                  className={cn(
                    "shrink-0 rounded-lg px-3 py-2 text-sm font-medium",
                    isActive
                      ? "cursor-default bg-[var(--fit-primary)]/10 text-[var(--fit-primary)]"
                      : "bg-[var(--fit-primary)] text-white",
                  )}
                >
                  {isActive ? "Active" : "Use this plan"}
                </button>
              </div>
              <p className="mt-2 text-xs text-[var(--fit-muted)]">
                {preset.days
                  .map((d) => `${d.code}: ${d.title}`)
                  .join("  ·  ")}
              </p>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[var(--fit-muted)]">
        Loading a plan replaces any current Alternate plan (including one from
        the Calculator).
      </p>
    </section>
  );
}

