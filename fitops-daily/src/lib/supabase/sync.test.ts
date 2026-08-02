import { describe, expect, it } from "vitest";
import { defaultState } from "@/lib/data/store";
import {
  applyCloudPayload,
  hasTrainingData,
  isCloudAppPayload,
  preferRemoteOverLocal,
  toCloudPayload,
} from "@/lib/supabase/sync";

describe("supabase sync helpers", () => {
  it("round-trips cloud payloads", () => {
    const local = {
      ...defaultState({ id: "user-1" }),
      authenticated: true,
      authMode: "supabase" as const,
      email: "a@b.com",
      cloudUpdatedAt: "2026-08-01T12:00:00.000Z",
      sessions: [
        {
          id: "sess-1",
          userId: "user-1",
          workoutDayId: "day-a",
          workoutCode: "A" as const,
          scheduledDate: "2026-08-01",
          status: "done" as const,
          minutes: 30,
          effortRpe: 7,
          completedAt: "2026-08-01T12:30:00.000Z",
          notes: "",
        },
      ],
    };
    const payload = toCloudPayload(local);
    expect(isCloudAppPayload(payload)).toBe(true);
    const restored = applyCloudPayload("user-1", "a@b.com", payload);
    expect(restored.sessions).toHaveLength(1);
    expect(restored.sessions[0].id).toBe("sess-1");
    expect(restored.authMode).toBe("supabase");
    expect(hasTrainingData(restored)).toBe(true);
  });

  it("prefers newer remote state", () => {
    const local = {
      ...defaultState({ id: "user-1" }),
      cloudUpdatedAt: "2026-08-01T10:00:00.000Z",
      sessions: [
        {
          id: "old",
          userId: "user-1",
          workoutDayId: null,
          workoutCode: "A" as const,
          scheduledDate: "2026-08-01",
          status: "planned" as const,
          minutes: null,
          effortRpe: null,
          completedAt: null,
          notes: "",
        },
      ],
    };
    const remote = toCloudPayload({
      ...local,
      cloudUpdatedAt: "2026-08-01T12:00:00.000Z",
    });
    expect(preferRemoteOverLocal(local, remote)).toBe(true);
    expect(
      preferRemoteOverLocal(
        { ...local, cloudUpdatedAt: "2026-08-01T13:00:00.000Z" },
        remote,
      ),
    ).toBe(false);
    expect(
      preferRemoteOverLocal({ ...local, cloudUpdatedAt: null }, remote),
    ).toBe(false);
  });

  it("rejects invalid payloads", () => {
    expect(isCloudAppPayload(null)).toBe(false);
    expect(isCloudAppPayload({ version: 1 })).toBe(false);
  });
});
