"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { JournalEditor } from "@/components/fitops/journal-editor";
import { useFitOps } from "@/components/providers/fitops-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function JournalPage() {
  const { state, today } = useFitOps();
  const [selected, setSelected] = useState(today);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const entries = useMemo(() => {
    return [...state.journals]
      .filter((j) => {
        if (from && j.entryDate < from) return false;
        if (to && j.entryDate > to) return false;
        return true;
      })
      .sort((a, b) => b.entryDate.localeCompare(a.entryDate));
  }, [state.journals, from, to]);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fit-accent)]">
          Journal
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          History
        </h1>
        <p className="mt-1 text-sm text-[var(--fit-muted)]">
          Mood, energy, soreness, and notes by day.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="from">From</Label>
          <Input
            id="from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1.5 bg-[var(--fit-surface)]"
          />
        </div>
        <div>
          <Label htmlFor="to">To</Label>
          <Input
            id="to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1.5 bg-[var(--fit-surface)]"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setSelected(today)}
            className={cn(
              "w-full rounded-lg border px-3 py-2 text-left text-sm",
              selected === today
                ? "border-[var(--fit-primary)] bg-[var(--fit-primary)] text-white"
                : "border-[var(--fit-border)] bg-[var(--fit-surface)]",
            )}
          >
            Today
          </button>
          {entries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setSelected(entry.entryDate)}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-left text-sm",
                selected === entry.entryDate
                  ? "border-[var(--fit-primary)] bg-[var(--fit-primary)] text-white"
                  : "border-[var(--fit-border)] bg-[var(--fit-surface)]",
              )}
            >
              <p className="font-medium">
                {format(parseISO(`${entry.entryDate}T12:00:00`), "MMM d, yyyy")}
              </p>
              <p
                className={cn(
                  "mt-0.5 line-clamp-1 text-xs",
                  selected === entry.entryDate
                    ? "text-white/80"
                    : "text-[var(--fit-muted)]",
                )}
              >
                {entry.smallWin || entry.body || "No notes yet"}
              </p>
            </button>
          ))}
          {entries.length === 0 && (
            <p className="text-sm text-[var(--fit-muted)]">
              No journal entries in this range yet.
            </p>
          )}
        </div>

        <JournalEditor entryDate={selected || today} />
      </div>
    </div>
  );
}
