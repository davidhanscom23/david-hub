import type { SourceMatchType } from "@/lib/types";
import { cn } from "@/lib/utils";

const labels: Record<SourceMatchType, string> = {
  exact: "Exact",
  "close variation": "Close variation",
  "base movement": "Base movement",
  "exact article": "Exact article",
};

export function ExerciseSourceBadge({
  matchType,
  className,
}: {
  matchType: SourceMatchType;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-[var(--fit-border)] bg-[var(--fit-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--fit-muted)]",
        className,
      )}
    >
      {labels[matchType]}
    </span>
  );
}
