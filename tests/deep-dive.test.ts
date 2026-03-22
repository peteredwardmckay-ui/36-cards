import { describe, expect, it } from "vitest";
import { analyzeGrandTableauForDeepDive } from "@/lib/engine/deepDive";
import { buildGrandTableauLayout } from "@/lib/engine/gt";
import { composeReading } from "@/lib/engine/compose";
import { createReadingState } from "@/lib/state/storage";
import type { ReadingState } from "@/lib/engine/types";

function buildState(
  overrides: Partial<ReadingState["setup"]> = {},
  layout: number[] | null = null,
): ReadingState {
  const base = createReadingState({
    question: "What should I understand about this transition?",
    subjectId: "general_reading",
    interpretationThemeId: "auto",
    readingStyle: "quick",
    includeHouses: false,
    spreadType: "grand-tableau",
    threeCardMode: "past-present-future",
    themeId: "botanical-engraving",
    significatorMode: "self",
  });

  const nextLayout = layout ?? base.layout;
  return {
    ...base,
    setup: {
      ...base.setup,
      ...overrides,
    },
    stage: "results",
    layout: nextLayout,
    revealMap: Array.from({ length: nextLayout.length }, () => true),
    reading: null,
  };
}

function buildCustomLayout(assignments: Array<[number, number]>): number[] {
  const assignedCards = new Set(assignments.map(([, cardId]) => cardId));
  const remainingCards = Array.from({ length: 36 }, (_, index) => index + 1).filter((cardId) => !assignedCards.has(cardId));

  return Array.from({ length: 36 }, (_, index) => {
    const position = index + 1;
    const assigned = assignments.find(([assignedPosition]) => assignedPosition === position);
    return assigned?.[1] ?? remainingCards.shift()!;
  });
}

describe("deep-dive GT analysis", () => {
  it("computes surroundings, lines, mirrors, clusters, and quadrants", () => {
    const layout = buildGrandTableauLayout(Array.from({ length: 36 }, (_, index) => index + 1));
    const analysis = analyzeGrandTableauForDeepDive(layout, 23);

    expect(analysis.significator.position).toBe(23);
    expect(analysis.surroundings.north?.cardId).toBe(14);
    expect(analysis.surroundings.east?.cardId).toBe(24);
    expect(analysis.surroundings.west?.cardId).toBe(22);
    expect(analysis.rowLine).toHaveLength(9);
    expect(analysis.columnLine).toHaveLength(4);
    expect(analysis.dominantDiagonal.placements.length).toBeGreaterThan(2);
    expect(analysis.mirrors.rowPairs.length).toBeGreaterThan(0);
    expect(analysis.primaryCluster.positions.includes(23)).toBe(true);
    expect(analysis.quadrants).toHaveLength(4);
  });
});

describe("deep-dive composition", () => {
  it("includes required GT sections in order and omits Houses when disabled", () => {
    const state = buildState({
      readingStyle: "deep_dive",
      includeHouses: false,
      spreadType: "grand-tableau",
    });
    const reading = composeReading(state);
    const sectionIds = reading.sections.map((section) => section.id);

    expect(sectionIds).toEqual([
      "opening-frame",
      "center-significator",
      "immediate-surroundings",
      "local-cluster",
      "wider-thread",
      "secondary-zone",
      "key-threads",
    ]);
    expect(reading.wordCount).toBeGreaterThanOrEqual(650);
    expect(reading.wordCount).toBeLessThanOrEqual(1100);
    const bodyText = [reading.intro, ...reading.sections.map((section) => section.body), reading.conclusion].join(" ");
    expect(bodyText.toLowerCase()).not.toContain("not medical");
    expect(bodyText.toLowerCase()).not.toContain("not legal");
    expect(bodyText.toLowerCase()).not.toContain("not financial");
    expect(reading.sections.find((section) => section.id === "key-threads")?.body.includes("•")).toBe(true);
  });

  it("adds Houses section only when includeHouses is enabled", () => {
    const state = buildState({
      readingStyle: "deep_dive",
      includeHouses: true,
      spreadType: "grand-tableau",
    });
    const reading = composeReading(state);
    const sectionIds = reading.sections.map((section) => section.id);
    const housesIndex = sectionIds.indexOf("houses-overlay");
    const surroundingsIndex = sectionIds.indexOf("immediate-surroundings");

    expect(housesIndex).toBeGreaterThan(-1);
    expect(housesIndex).toBe(surroundingsIndex + 1);
  });

  it("includes Cartouche / Fate Line only for deep-dive 4x8+4", () => {
    const state = buildState({
      readingStyle: "deep_dive",
      includeHouses: false,
      spreadType: "grand-tableau",
      gtLayout: "4x8+4",
    });
    const reading = composeReading(state);
    const sectionIds = reading.sections.map((section) => section.id);
    const cartoucheIndex = sectionIds.indexOf("cartouche-fate-line");
    const secondaryIndex = sectionIds.indexOf("secondary-zone");

    expect(cartoucheIndex).toBeGreaterThan(-1);
    expect(cartoucheIndex).toBe(secondaryIndex + 1);
    expect(reading.sections[cartoucheIndex]?.body.includes("•")).toBe(true);
  });

  it("keeps quick mode path shape unchanged", () => {
    const state = buildState({
      readingStyle: "quick",
      includeHouses: true,
      spreadType: "grand-tableau",
    });
    const reading = composeReading(state);

    expect(reading.sections[0]?.id).toBe("center");
    expect(reading.sections.map((section) => section.id)).not.toContain("houses-overlay");
    expect(reading.sections.map((section) => section.id)).not.toContain("cartouche");
    expect(reading.wordCount).toBeGreaterThanOrEqual(180);
    expect(reading.wordCount).toBeLessThanOrEqual(420);
  });

  it("respects explicit general_reading instead of inferring a narrower subject from the question", () => {
    const state = buildState({
      readingStyle: "quick",
      spreadType: "grand-tableau",
      subjectId: "general_reading",
      question: "What is the real shape of this relationship over the next three months?",
    });
    const reading = composeReading(state);
    const center = reading.sections.find((section) => section.id === "center")?.body ?? "";

    expect(center.toLowerCase()).not.toContain("relationship");
    expect(center.toLowerCase()).not.toContain("relational");
  });

  it("keeps personal_growth deep-dive center framing out of relationship language", () => {
    const state = buildState({
      readingStyle: "deep_dive",
      spreadType: "grand-tableau",
      includeHouses: true,
      subjectId: "personal_growth",
      interpretationThemeId: "boundaries",
      question: "Where is the real pressure in my personal growth right now, and what is beginning to stabilize?",
    });
    const reading = composeReading(state);
    const center = reading.sections.find((section) => section.id === "center-significator")?.body ?? "";

    expect(center.toLowerCase()).not.toContain("bond");
    expect(center.toLowerCase()).not.toContain("relationship");
    expect(center.toLowerCase()).toMatch(/inner process|stance|self-definition/);
  });

  it("keeps health deep-dive center framing in a wellbeing voice", () => {
    const state = buildState({
      readingStyle: "deep_dive",
      spreadType: "grand-tableau",
      includeHouses: true,
      subjectId: "health",
      interpretationThemeId: "recovery",
      question: "Where is the real pressure in my health right now, and what is beginning to stabilize?",
    });
    const reading = composeReading(state);
    const center = reading.sections.find((section) => section.id === "center-significator")?.body ?? "";

    expect(center.toLowerCase()).not.toContain("bond");
    expect(center.toLowerCase()).not.toContain("relationship");
    expect(center.toLowerCase()).toMatch(/wellbeing|body|system|health/);
  });

  it("keeps travel deep-dive framing in route and timing language", () => {
    const state = buildState({
      readingStyle: "deep_dive",
      spreadType: "grand-tableau",
      includeHouses: true,
      subjectId: "travel",
      interpretationThemeId: "delays",
      question: "Where is the real pressure in this travel situation, and what is beginning to move?",
    });
    const reading = composeReading(state);
    const center = reading.sections.find((section) => section.id === "center-significator")?.body ?? "";
    const cluster = reading.sections.find((section) => section.id === "local-cluster")?.body ?? "";

    expect(center.toLowerCase()).not.toContain("self-definition");
    expect(center.toLowerCase()).not.toContain("bond");
    expect(center.toLowerCase()).toMatch(/travel|journey|route|trip|timing/);
    expect(cluster.toLowerCase()).not.toContain("repeated note of health");
  });

  it("keeps education deep-dive framing in study and application language", () => {
    const state = buildState({
      readingStyle: "deep_dive",
      spreadType: "grand-tableau",
      includeHouses: true,
      subjectId: "education",
      interpretationThemeId: "applications",
      question: "Where is the real pressure in this education situation, and what is beginning to move?",
    });
    const reading = composeReading(state);
    const center = reading.sections.find((section) => section.id === "center-significator")?.body ?? "";
    const cluster = reading.sections.find((section) => section.id === "local-cluster")?.body ?? "";

    expect(center.toLowerCase()).not.toContain("bond");
    expect(center.toLowerCase()).not.toContain("self-definition");
    expect(center.toLowerCase()).toMatch(/education|study|learning|application|course|academic/);
    expect(cluster.toLowerCase()).not.toContain("repeated note of self");
  });

  it("keeps creative deep-dive framing in creative-process language", () => {
    const state = buildState({
      readingStyle: "deep_dive",
      spreadType: "grand-tableau",
      includeHouses: true,
      subjectId: "creative",
      interpretationThemeId: "recognition",
      question: "Where is the real pressure in my creative work, and what is beginning to move?",
    });
    const reading = composeReading(state);
    const center = reading.sections.find((section) => section.id === "center-significator")?.body ?? "";
    const cluster = reading.sections.find((section) => section.id === "local-cluster")?.body ?? "";

    expect(center.toLowerCase()).not.toContain("bond");
    expect(center.toLowerCase()).not.toContain("relationship");
    expect(center.toLowerCase()).toMatch(/creative|work|voice|practice|project|making/);
    expect(cluster.toLowerCase()).not.toContain("repeated note of self");
  });

  it("adds quick-mode Cartouche section only in 4x8+4", () => {
    const state = buildState({
      readingStyle: "quick",
      spreadType: "grand-tableau",
      gtLayout: "4x8+4",
    });
    const reading = composeReading(state);

    const cartouche = reading.sections.find((section) => section.id === "cartouche");
    expect(cartouche).toBeDefined();
    expect(cartouche?.title).toBe("Cartouche");
  });

  it("produces deep-dive three-card readings within target range", () => {
    const state = buildState(
      {
        readingStyle: "deep_dive",
        includeHouses: true,
        spreadType: "three-card",
      },
      Array.from({ length: 3 }, (_, index) => index + 1),
    );
    const reading = composeReading(state);
    const sectionIds = reading.sections.map((section) => section.id);

    expect(sectionIds).toEqual(["opening-frame", "situation", "pivot", "direction", "key-threads"]);
    expect(reading.wordCount).toBeGreaterThanOrEqual(280);
    expect(reading.wordCount).toBeLessThanOrEqual(450);
  });

  it("keeps the cited local-cluster pair inside the rendered cluster card list", () => {
    const layout = buildCustomLayout([
      [5, 4],
      [6, 5],
      [7, 6],
      [14, 13],
      [15, 29],
      [16, 18],
      [23, 30],
      [24, 33],
      [25, 11],
    ]);
    const state = buildState(
      {
        readingStyle: "deep_dive",
        includeHouses: false,
        spreadType: "grand-tableau",
      },
      layout,
    );
    const reading = composeReading(state);
    const localCluster = reading.sections.find((section) => section.id === "local-cluster")?.body ?? "";
    const firstSentence = localCluster.split(/(?<=[.!?])\s+/)[0] ?? "";
    const listedRefs = new Set(
      Array.from(firstSentence.matchAll(/[A-Z][A-Za-z]+(?: [A-Z][A-Za-z]+)? \(\d+\)/g), (match) => match[0]),
    );
    const pairMatch = localCluster.match(
      /([A-Z][A-Za-z]+(?: [A-Z][A-Za-z]+)? \(\d+\)) with ([A-Z][A-Za-z]+(?: [A-Z][A-Za-z]+)? \(\d+\)) (?:highlights|suggests that|points toward)/,
    );

    expect(listedRefs).not.toContain("Key (33)");
    expect(pairMatch).not.toBeNull();
    expect(listedRefs).toContain(pairMatch?.[1] ?? "");
    expect(listedRefs).toContain(pairMatch?.[2] ?? "");
  });
});
