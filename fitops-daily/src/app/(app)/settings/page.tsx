"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SafetyNotice } from "@/components/fitops/safety-notice";
import { useFitOps } from "@/components/providers/fitops-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EXERCISES } from "@/lib/data/seed";
import type { ScheduleMode, SourceMatchType } from "@/lib/types";

export default function SettingsPage() {
  const {
    state,
    setProfile,
    logout,
    exportJson,
    exportCsv,
    clearAllData,
    setSourceOverride,
  } = useFitOps();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editName, setEditName] = useState("");
  const [editMatch, setEditMatch] = useState<SourceMatchType>("exact");

  function download(filename: string, contents: string, type: string) {
    const blob = new Blob([contents], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fit-accent)]">
          Settings
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          Preferences
        </h1>
      </header>

      <section className="space-y-4 rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
        <h2 className="font-semibold">Profile</h2>
        <div>
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            value={state.profile.displayName}
            onChange={(e) => setProfile({ displayName: e.target.value })}
            className="mt-1.5 bg-[var(--fit-bg)]"
          />
        </div>
        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            value={state.profile.timezone}
            onChange={(e) => setProfile({ timezone: e.target.value })}
            className="mt-1.5 bg-[var(--fit-bg)]"
            placeholder="America/New_York"
          />
        </div>
        <div>
          <Label htmlFor="scheduleMode">Schedule mode</Label>
          <select
            id="scheduleMode"
            value={state.profile.scheduleMode}
            onChange={(e) =>
              setProfile({ scheduleMode: e.target.value as ScheduleMode })
            }
            className="mt-1.5 flex h-9 w-full rounded-lg border border-[var(--fit-border)] bg-[var(--fit-bg)] px-3 text-sm"
          >
            <option value="calendar">
              Calendar (Mon A / Tue B / Wed C)
            </option>
            <option value="rotating">
              Rotating (A → B → C on training days)
            </option>
          </select>
        </div>
        <div>
          <Label htmlFor="reminder">Preferred reminder time</Label>
          <Input
            id="reminder"
            type="time"
            value={state.profile.preferredReminderTime ?? ""}
            onChange={(e) =>
              setProfile({ preferredReminderTime: e.target.value || null })
            }
            className="mt-1.5 bg-[var(--fit-bg)]"
          />
          <p className="mt-1 text-xs text-[var(--fit-muted)]">
            Saved for future reminder support. Notifications are not enabled in
            MVP.
          </p>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
        <h2 className="font-semibold">Edit source links</h2>
        <p className="text-sm text-[var(--fit-muted)]">
          Prefer NASM, ACE, or other accredited pages. Open demos in a new tab.
        </p>
        <ul className="max-h-80 space-y-2 overflow-y-auto">
          {EXERCISES.map((ex) => {
            const override = state.sourceOverrides[ex.id];
            const active = editingId === ex.id;
            return (
              <li
                key={ex.id}
                className="rounded-lg border border-[var(--fit-border)] px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{ex.name}</p>
                    <p className="text-xs text-[var(--fit-muted)]">
                      {override?.sourceName ?? ex.sourceName} ·{" "}
                      {override?.sourceMatchType ?? ex.sourceMatchType}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(active ? null : ex.id);
                      setEditUrl(override?.sourceUrl ?? ex.sourceUrl);
                      setEditName(override?.sourceName ?? ex.sourceName);
                      setEditMatch(
                        (override?.sourceMatchType as SourceMatchType) ??
                          ex.sourceMatchType,
                      );
                    }}
                  >
                    {active ? "Close" : "Edit"}
                  </Button>
                </div>
                {active && (
                  <div className="mt-3 space-y-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Source name"
                      className="bg-[var(--fit-bg)]"
                    />
                    <Input
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      placeholder="https://…"
                      className="bg-[var(--fit-bg)]"
                    />
                    <select
                      value={editMatch}
                      onChange={(e) =>
                        setEditMatch(e.target.value as SourceMatchType)
                      }
                      className="flex h-9 w-full rounded-lg border border-[var(--fit-border)] bg-[var(--fit-bg)] px-3 text-sm"
                    >
                      <option value="exact">exact</option>
                      <option value="close variation">close variation</option>
                      <option value="base movement">base movement</option>
                      <option value="exact article">exact article</option>
                    </select>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSourceOverride(ex.id, {
                          sourceUrl: editUrl,
                          sourceName: editName,
                          sourceMatchType: editMatch,
                        });
                        setEditingId(null);
                      }}
                    >
                      Save link
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3 rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
        <h2 className="font-semibold">Export</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              download(
                "fitops-daily-export.json",
                exportJson(),
                "application/json",
              )
            }
          >
            Export JSON
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              download("fitops-daily-sessions.csv", exportCsv(), "text/csv")
            }
          >
            Export CSV
          </Button>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-4">
        <h2 className="font-semibold">Account</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
          >
            Sign out
          </Button>
          {!confirmDelete ? (
            <Button
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
            >
              Delete local data
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={() => {
                clearAllData();
                router.replace("/login");
              }}
            >
              Confirm delete all data
            </Button>
          )}
        </div>
        <p className="text-xs text-[var(--fit-muted)]">
          Demo mode stores data in this browser only. With Supabase connected,
          use the SQL policies and account deletion from your Supabase project
          dashboard for server-side data.
        </p>
      </section>

      <SafetyNotice />
    </div>
  );
}
