import { describe, expect, it } from "vitest";
import { CARD_MEANINGS } from "@/lib/content/cards";
import { HOUSE_MEANINGS } from "@/lib/content/houses";
import { getPairMeaning, PAIR_MEANINGS } from "@/lib/content/pairs";

describe("Content repository", () => {
  it("has all 36 cards with required variant counts", () => {
    expect(CARD_MEANINGS).toHaveLength(36);
    CARD_MEANINGS.forEach((card) => {
      expect(card.coreVariants.length).toBeGreaterThanOrEqual(6);
      expect(card.domainVariants.general.length).toBeGreaterThan(0);
      expect(card.domainVariants.love.length).toBeGreaterThan(0);
      expect(card.domainVariants.work.length).toBeGreaterThan(0);
      expect(card.techniqueSnippets.knighting.length).toBeGreaterThanOrEqual(2);
      expect(card.techniqueSnippets.diagonal.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("has 36 house meanings", () => {
    expect(HOUSE_MEANINGS).toHaveLength(36);
  });

  it("contains at least 200 high-signal pair meanings", () => {
    expect(PAIR_MEANINGS.length).toBeGreaterThanOrEqual(200);
  });

  it("includes the curated Wave 1A love pair overrides", () => {
    const expectedPairs: Array<[number, number]> = [
      [6, 24],
      [6, 25],
      [12, 27],
      [19, 28],
      [23, 24],
      [25, 28],
      [28, 30],
    ];

    expectedPairs.forEach(([a, b]) => {
      const meaning = getPairMeaning(a, b);
      expect(meaning).not.toBeNull();
      expect(meaning?.meanings.love.length ?? 0).toBeGreaterThan(40);
    });
  });

  it("includes the first Wave 1B money-oriented pair overrides in the general slot", () => {
    const expectedPairs: Array<[number, number]> = [
      [6, 34],
      [6, 35],
      [23, 34],
      [25, 34],
      [27, 34],
      [33, 34],
    ];

    expectedPairs.forEach(([a, b]) => {
      const meaning = getPairMeaning(a, b);
      expect(meaning).not.toBeNull();
      expect(meaning?.meanings.general.length ?? 0).toBeGreaterThan(50);
    });
  });

  it("includes the first Wave 1D work-oriented pair overrides", () => {
    const expectedPairs: Array<[number, number]> = [
      [19, 33],
      [21, 26],
      [28, 29],
      [12, 27],
      [14, 15],
    ];

    expectedPairs.forEach(([a, b]) => {
      const meaning = getPairMeaning(a, b);
      expect(meaning).not.toBeNull();
      expect(meaning?.meanings.work.length ?? 0).toBeGreaterThan(35);
    });
  });
});
