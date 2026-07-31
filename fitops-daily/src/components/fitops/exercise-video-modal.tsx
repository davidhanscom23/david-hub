"use client";

import { useEffect, useId, useState } from "react";
import { Play, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { youtubeEmbedSrc } from "@/lib/workout/youtube";
import { cn } from "@/lib/utils";

export function ExerciseVideoModal({
  open,
  onOpenChange,
  exerciseName,
  videoYoutubeId,
  sourceName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
  videoYoutubeId: string;
  sourceName: string;
}) {
  const titleId = useId();
  // Remount iframe when reopened so the player fully resets (no leftover playback).
  const [playerKey, setPlayerKey] = useState(0);

  useEffect(() => {
    if (open) setPlayerKey((k) => k + 1);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "max-h-[min(92dvh,920px)] w-[calc(100%-1.25rem)] max-w-lg gap-0 overflow-hidden p-0 sm:max-w-xl",
          "bg-[var(--fit-surface)] text-[var(--fit-text)] ring-[var(--fit-border)]",
        )}
        aria-labelledby={titleId}
      >
        <DialogHeader className="flex flex-row items-start justify-between gap-3 border-b border-[var(--fit-border)] px-4 py-3 pr-12">
          <div className="min-w-0 space-y-1">
            <DialogTitle
              id={titleId}
              className="truncate text-base font-semibold tracking-tight"
            >
              {exerciseName}
            </DialogTitle>
            <DialogDescription className="text-xs text-[var(--fit-muted)]">
              Form example · {sourceName}. Press play when ready.
            </DialogDescription>
          </div>
          <DialogClose
            type="button"
            aria-label="Close video"
            className="absolute top-2.5 right-2.5 inline-flex size-10 items-center justify-center rounded-lg text-[var(--fit-muted)] transition-colors hover:bg-[var(--fit-bg)] hover:text-[var(--fit-text)]"
          >
            <X className="size-5" />
          </DialogClose>
        </DialogHeader>

        <div className="bg-black">
          <div className="relative aspect-video w-full">
            {open && (
              <iframe
                key={playerKey}
                title={`${exerciseName} exercise example`}
                src={youtubeEmbedSrc(videoYoutubeId)}
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function WatchExampleButton({
  exerciseName,
  videoYoutubeId,
  sourceName,
  className,
}: {
  exerciseName: string;
  videoYoutubeId: string;
  sourceName: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--fit-border)] bg-[var(--fit-bg)] px-3 text-sm font-medium text-[var(--fit-text)] transition-colors hover:border-[var(--fit-primary)]/40 hover:bg-[var(--fit-surface)]",
          className,
        )}
      >
        <Play className="size-3.5 fill-current" />
        Watch example
      </button>
      <ExerciseVideoModal
        open={open}
        onOpenChange={setOpen}
        exerciseName={exerciseName}
        videoYoutubeId={videoYoutubeId}
        sourceName={sourceName}
      />
    </>
  );
}
