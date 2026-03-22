import { describe, expect, it } from "vitest";
import {
  INTERPRETATION_ENTRIES,
  getEntriesBySubject,
  getInterpretationCoverageReport,
  queryInterpretationEntries,
  validateInterpretationRepository,
} from "@/lib/content/interpretation";

describe("interpretation content system", () => {
  it("passes schema integrity validation with no errors", () => {
    const validation = validateInterpretationRepository();
    expect(validation.errors).toHaveLength(0);
    expect(INTERPRETATION_ENTRIES.length).toBeGreaterThan(2000);
  });

  it("retrieval uses hard subject + technique + structural target filtering first", () => {
    const units = queryInterpretationEntries({
      subjectId: "travel",
      technique: "house",
      techniqueKey: "house:27",
      appliesTo: { houseId: 27 },
      themeIds: ["documents"],
      limit: 5,
    });

    expect(units.length).toBeGreaterThan(0);
    units.forEach((unit) => {
      expect(unit.entry.subjectId).toBe("travel");
      expect(unit.entry.technique).toBe("house");
      expect(unit.entry.techniqueKey).toBe("house:27");
      expect((unit.entry.appliesTo as { houseId: number }).houseId).toBe(27);
    });
  });

  it("keeps thinner subjects on-domain in card and house phrasing", () => {
    const travelCard = queryInterpretationEntries({
      subjectId: "travel",
      technique: "card",
      techniqueKey: "card:3",
      appliesTo: { cardId: 3 },
      limit: 1,
    });
    expect(travelCard).toHaveLength(1);
    expect(travelCard[0].selectedText.toLowerCase()).toMatch(/travel|journey|route|road|movement/);

    const legalHouse = queryInterpretationEntries({
      subjectId: "legal_admin",
      technique: "house",
      techniqueKey: "house:27",
      appliesTo: { houseId: 27 },
      limit: 1,
    });
    expect(legalHouse).toHaveLength(1);
    expect(legalHouse[0].selectedText.toLowerCase()).toMatch(/formal|procedure|official|process/);

    const purposeCard = queryInterpretationEntries({
      subjectId: "purpose_calling",
      technique: "card",
      techniqueKey: "card:24",
      appliesTo: { cardId: 24 },
      limit: 1,
    });
    expect(purposeCard).toHaveLength(1);
    expect(purposeCard[0].selectedText.toLowerCase()).toMatch(/calling|path|fit|integrity|purpose/);
  });

  it("enforces conditional requirements and suppresses duplicate phrasing", () => {
    const blocked = queryInterpretationEntries({
      subjectId: "work",
      technique: "proximity",
      appliesTo: { distance: "near" },
      contextTags: [],
      limit: 1,
    });
    expect(blocked).toHaveLength(0);

    const eligible = queryInterpretationEntries({
      subjectId: "work",
      technique: "proximity",
      appliesTo: { distance: "near" },
      contextTags: ["distance:near"],
      limit: 2,
    });
    expect(eligible.length).toBeGreaterThan(0);

    const deduped = queryInterpretationEntries({
      subjectId: "work",
      technique: "proximity",
      appliesTo: { distance: "near" },
      contextTags: ["distance:near"],
      usedPhrases: [eligible[0].selectedText],
      limit: 2,
    });
    expect(deduped.length).toBeGreaterThan(0);
    expect(deduped[0].selectedText).not.toBe(eligible[0].selectedText);
  });

  it("flags deterministic language and polarity-text conflicts in validation", () => {
    const seed = getEntriesBySubject("general_reading")[0];
    const invalidEntries = [
      ...INTERPRETATION_ENTRIES,
      {
        ...seed,
        id: "invalid-deterministic",
        text: {
          ...seed.text,
          primary: "This will definitely happen.",
        },
      },
      {
        ...seed,
        id: "invalid-polarity",
        ranking: {
          ...seed.ranking,
          polarity: "constructive" as const,
        },
        text: {
          ...seed.text,
          primary: "Conflict, burden, delay, and loss remain central.",
        },
      },
    ];

    const validation = validateInterpretationRepository(invalidEntries);
    const warningCodes = validation.warnings.map((warning) => warning.code);

    expect(warningCodes).toContain("deterministic_language");
    expect(warningCodes).toContain("polarity_text_conflict");
  });

  it("reports coverage by technique, subject, matrix, and zero-theme usage", () => {
    const coverage = getInterpretationCoverageReport();

    expect(coverage.byTechnique.card).toBe(36 * 16);
    expect(coverage.byTechnique.house).toBe(36 * 16);
    expect(coverage.byTechnique.pair).toBeGreaterThanOrEqual(72 * 16);
    expect(coverage.missingAreas).toHaveLength(0);
    expect(coverage.underpopulatedAreas).toHaveLength(0);
    expect(coverage.themesWithZeroEntries).toHaveLength(0);
  });
});
