import { describe, expect, it } from "vitest";
import { EXERCISES } from "@/lib/data/seed";
import { youtubeEmbedSrc } from "@/lib/workout/youtube";

describe("exercise demo videos", () => {
  it("gives every seeded exercise a YouTube demo id", () => {
    expect(EXERCISES.length).toBeGreaterThan(0);
    for (const exercise of EXERCISES) {
      expect(exercise.videoYoutubeId, exercise.slug).toMatch(
        /^[A-Za-z0-9_-]{11}$/,
      );
    }
  });

  it("builds a non-autoplay embed URL", () => {
    const src = youtubeEmbedSrc("mwlp75MS6Rg");
    expect(src).toContain("youtube-nocookie.com/embed/mwlp75MS6Rg");
    expect(src).toContain("autoplay=0");
    expect(src).toContain("playsinline=1");
  });
});
