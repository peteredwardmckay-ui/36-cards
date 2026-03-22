import { describe, expect, it } from "vitest";
import {
  applyThreePileCut,
  describeCutChoice,
  MAX_RIFFLE_INTENSITY,
  MIN_RIFFLE_INTENSITY,
  normalizeRiffleIntensity,
  performRifflePasses,
  ritualSummaryLine,
} from "@/lib/engine/shuffle";

describe("Ritual shuffle agency", () => {
  it("intensity equals number of riffle passes", () => {
    const run = performRifflePasses(7, "seed-material");
    expect(run.passes).toHaveLength(7);
  });

  it("is deterministic for same seed and intensity", () => {
    const runA = performRifflePasses(5, "same-seed");
    const runB = performRifflePasses(5, "same-seed");
    expect(runA.deckAfterShuffle).toEqual(runB.deckAfterShuffle);
    expect(runA.passes).toEqual(runB.passes);
  });

  it("changes final order when cut choice changes", () => {
    const run = performRifflePasses(5, "cut-seed");
    const cut1 = applyThreePileCut(run.deckAfterShuffle, 1);
    const cut2 = applyThreePileCut(run.deckAfterShuffle, 2);
    expect(cut1.deckAfterCut).not.toEqual(cut2.deckAfterCut);
  });

  it("clamps ritual intensity to the supported range", () => {
    expect(normalizeRiffleIntensity(1)).toBe(MIN_RIFFLE_INTENSITY);
    expect(normalizeRiffleIntensity(99)).toBe(MAX_RIFFLE_INTENSITY);
    expect(performRifflePasses(1, "low-seed").passes).toHaveLength(MIN_RIFFLE_INTENSITY);
    expect(performRifflePasses(99, "high-seed").passes).toHaveLength(MAX_RIFFLE_INTENSITY);
  });

  it("labels the identity cut honestly", () => {
    expect(describeCutChoice(1)).toBe("No cut");
    expect(describeCutChoice(2)).toBe("Pile 2 first");
    expect(describeCutChoice(3)).toBe("Pile 3 first");

    const run = performRifflePasses(5, "summary-seed");
    const cut = applyThreePileCut(run.deckAfterShuffle, 1);
    expect(ritualSummaryLine(run, cut)).toContain("Cut: No cut");
  });
});
