"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESETS = [30, 45, 60, 90] as const;

function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function playChime() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc.stop(ctx.currentTime + 0.55);
    window.setTimeout(() => void ctx.close(), 700);
  } catch {
    // Audio may be blocked; timer UI still completes.
  }
}

export function RestTimer({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState<number>(60);
  const [remaining, setRemaining] = useState<number>(60);
  const [running, setRunning] = useState(false);
  const endAtRef = useRef<number | null>(null);

  const reset = useCallback((secs = duration) => {
    endAtRef.current = null;
    setRunning(false);
    setRemaining(secs);
  }, [duration]);

  const start = useCallback(() => {
    endAtRef.current = Date.now() + remaining * 1000;
    setRunning(true);
  }, [remaining]);

  const pause = useCallback(() => {
    if (endAtRef.current != null) {
      setRemaining(Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000)));
    }
    endAtRef.current = null;
    setRunning(false);
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      if (endAtRef.current == null) return;
      const left = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        endAtRef.current = null;
        setRunning(false);
        playChime();
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [running]);

  function choosePreset(secs: number) {
    setDuration(secs);
    reset(secs);
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--fit-muted)]">
            Between moves
          </p>
          <p className="mt-0.5 text-sm text-[var(--fit-muted)]">
            Guide default: 30–60 seconds
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            if (!open && !running) reset(duration);
          }}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
            open || running
              ? "bg-[var(--fit-primary)] text-white"
              : "border border-[var(--fit-border)] bg-[var(--fit-bg)] text-[var(--fit-text)] hover:border-[var(--fit-primary)]/40",
          )}
          aria-expanded={open}
          aria-controls="rest-timer-panel"
        >
          <Timer className="size-4" />
          {running ? formatSeconds(remaining) : "Rest timer"}
        </button>
      </div>

      {open && (
        <div id="rest-timer-panel" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((secs) => (
              <button
                key={secs}
                type="button"
                onClick={() => choosePreset(secs)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  duration === secs && !running
                    ? "bg-[var(--fit-primary)] text-white"
                    : duration === secs && running
                      ? "bg-[var(--fit-primary)]/80 text-white"
                      : "bg-[var(--fit-bg)] text-[var(--fit-muted)] hover:text-[var(--fit-text)]",
                )}
              >
                {secs}s
              </button>
            ))}
          </div>

          <p
            className={cn(
              "text-center font-semibold tabular-nums tracking-tight",
              remaining === 0
                ? "text-2xl text-[var(--fit-success)]"
                : "text-4xl text-[var(--fit-text)]",
            )}
            aria-live="polite"
          >
            {remaining === 0 ? "Rest done" : formatSeconds(remaining)}
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {!running ? (
              <button
                type="button"
                onClick={() => {
                  if (remaining === 0) reset(duration);
                  start();
                }}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--fit-primary)] px-4 text-sm font-medium text-white"
              >
                <Play className="size-4" />
                {remaining === 0 || remaining === duration ? "Start" : "Resume"}
              </button>
            ) : (
              <button
                type="button"
                onClick={pause}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--fit-border)] bg-[var(--fit-bg)] px-4 text-sm font-medium"
              >
                <Pause className="size-4" />
                Pause
              </button>
            )}
            <button
              type="button"
              onClick={() => reset(duration)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--fit-border)] bg-[var(--fit-bg)] px-4 text-sm font-medium"
            >
              <RotateCcw className="size-4" />
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
