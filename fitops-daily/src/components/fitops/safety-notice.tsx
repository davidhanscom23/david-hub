import { ShieldAlert } from "lucide-react";
import { SAFETY_NOTICE } from "@/lib/data/seed";

export function SafetyNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "rounded-lg border border-[var(--fit-alert)]/25 bg-[var(--fit-alert)]/8 px-3 py-2 text-xs leading-relaxed text-[var(--fit-muted)]"
          : "flex gap-3 rounded-xl border border-[var(--fit-alert)]/25 bg-[var(--fit-alert)]/8 p-4 text-sm leading-relaxed text-[var(--fit-muted)]"
      }
    >
      {!compact && (
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-[var(--fit-alert)]" />
      )}
      <p>{SAFETY_NOTICE}</p>
    </div>
  );
}
