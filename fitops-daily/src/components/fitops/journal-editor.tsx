"use client";

import { useEffect, useState } from "react";
import { useFitOps } from "@/components/providers/fitops-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const scale = [1, 2, 3, 4, 5];

function ScaleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <Label className="text-xs text-[var(--fit-muted)]">{label}</Label>
      <div className="mt-1.5 flex gap-1.5">
        {scale.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "size-9 rounded-md text-sm font-medium transition-colors",
              value === n
                ? "bg-[var(--fit-primary)] text-white"
                : "bg-[var(--fit-bg)] text-[var(--fit-muted)] hover:text-[var(--fit-text)]",
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function JournalEditor({
  entryDate,
  compact = false,
}: {
  entryDate: string;
  compact?: boolean;
}) {
  const { getJournal, saveJournal } = useFitOps();
  const existing = getJournal(entryDate);
  const [body, setBody] = useState(existing?.body ?? "");
  const [completed, setCompleted] = useState(existing?.completed ?? "");
  const [hard, setHard] = useState(existing?.hard ?? "");
  const [smallWin, setSmallWin] = useState(existing?.smallWin ?? "");
  const [adjust, setAdjust] = useState(existing?.adjust ?? "");
  const [mood, setMood] = useState<number | null>(existing?.mood ?? null);
  const [energy, setEnergy] = useState<number | null>(existing?.energy ?? null);
  const [soreness, setSoreness] = useState<number | null>(
    existing?.soreness ?? null,
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const j = getJournal(entryDate);
    setBody(j?.body ?? "");
    setCompleted(j?.completed ?? "");
    setHard(j?.hard ?? "");
    setSmallWin(j?.smallWin ?? "");
    setAdjust(j?.adjust ?? "");
    setMood(j?.mood ?? null);
    setEnergy(j?.energy ?? null);
    setSoreness(j?.soreness ?? null);
  }, [entryDate, getJournal]);

  function handleSave() {
    saveJournal(entryDate, {
      body,
      completed,
      hard,
      smallWin,
      adjust,
      mood,
      energy,
      soreness,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="space-y-4 rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
      <div>
        <h3 className="text-base font-semibold">Daily journal</h3>
        <p className="mt-0.5 text-sm text-[var(--fit-muted)]">
          One honest note beats a perfect plan.
        </p>
      </div>

      {!compact && (
        <>
          <Field
            label="What did I complete today?"
            value={completed}
            onChange={setCompleted}
          />
          <Field label="What was hard?" value={hard} onChange={setHard} />
          <Field
            label="What is one small win?"
            value={smallWin}
            onChange={setSmallWin}
          />
          <Field
            label="Anything to adjust next time?"
            value={adjust}
            onChange={setAdjust}
          />
        </>
      )}

      <div>
        <Label className="text-xs text-[var(--fit-muted)]">
          How did my body feel?
        </Label>
        <Textarea
          className="mt-1.5 min-h-24 bg-[var(--fit-bg)]"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Notes on energy, soreness, mood…"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ScaleRow label="Mood" value={mood} onChange={setMood} />
        <ScaleRow label="Energy" value={energy} onChange={setEnergy} />
        <ScaleRow label="Soreness" value={soreness} onChange={setSoreness} />
      </div>

      <div className="flex items-center gap-3">
        <Button type="button" onClick={handleSave}>
          Save journal
        </Button>
        {saved && (
          <span className="text-sm text-[var(--fit-success)]">Saved</span>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className="text-xs text-[var(--fit-muted)]">{label}</Label>
      <Textarea
        className="mt-1.5 min-h-16 bg-[var(--fit-bg)]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
