"use client";

import { DIFFICULTY_OPTIONS } from "@/lib/data/variants";
import type { DifficultyMode } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DifficultyPicker({
  value,
  onChange,
  compact = false,
}: {
  value: DifficultyMode;
  onChange: (mode: DifficultyMode) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)]",
        compact ? "p-2" : "p-4",
      )}
    >
      {!compact ? (
        <div className="mb-3">
          <h2 className="font-semibold">Exercise difficulty</h2>
          <p className="mt-1 text-sm text-[var(--fit-muted)]">
            Swaps every move for a modified, normal, or advanced version —
            including demo videos and adjusted targets.
          </p>
        </div>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-3">
        {DIFFICULTY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-lg px-3 py-2.5 text-left transition-colors",
              value === opt.value
                ? "bg-[var(--fit-primary)] text-white"
                : "bg-[var(--fit-bg)] text-[var(--fit-muted)] hover:text-[var(--fit-text)]",
            )}
          >
            <span className="block text-sm font-semibold">{opt.label}</span>
            {!compact ? (
              <span
                className={cn(
                  "mt-0.5 block text-xs",
                  value === opt.value ? "text-white/85" : "text-[var(--fit-muted)]",
                )}
              >
                {opt.hint}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
