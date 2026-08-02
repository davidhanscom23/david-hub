import { describe, expect, it } from "vitest";
import { storageKeyForUser } from "@/lib/auth/storage";

describe("storageKeyForUser", () => {
  it("uses the base key for demo / empty ids", () => {
    expect(storageKeyForUser(null)).toBe("fitops-daily-v1");
    expect(storageKeyForUser(undefined)).toBe("fitops-daily-v1");
    expect(storageKeyForUser("demo-user")).toBe("fitops-daily-v1");
  });

  it("scopes real accounts under their user id", () => {
    expect(storageKeyForUser("abc-123")).toBe("fitops-daily-v1:abc-123");
  });
});
