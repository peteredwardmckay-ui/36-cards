import { describe, expect, it } from "vitest";
import { buildGrandTableauLayout } from "@/lib/engine/gt";
import {
  buildGrandTableauPairCandidates,
  buildThreeCardPairCandidates,
  resolvePairMeaningForSubject,
  selectBestPair,
  selectTopPair,
} from "@/lib/engine/pairSelection";
import { buildReadingStateFromFixture, composeDeterministicReading } from "@/tests/helpers/readingHarness";

describe("pair selection helpers", () => {
  it("excludes cartouche cards when building GT pair candidates", () => {
    const layout = buildGrandTableauLayout(Array.from({ length: 36 }, (_, index) => index + 1), "4x8+4");
    const result = buildGrandTableauPairCandidates(layout, "self", "4x8+4");

    expect(result.primaryPos).toBeLessThanOrEqual(32);
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.candidates.every((candidate) => candidate.cardA <= 32 && candidate.cardB <= 32)).toBe(true);
  });

  it("prefers the materially stronger candidate after proximity bias is applied", () => {
    const selected = selectBestPair(
      [
        { cardA: 1, cardB: 2, proximityBias: 0 },
        { cardA: 1, cardB: 27, proximityBias: 10 },
      ],
      "general",
      () => 0,
    );

    expect(selected?.key).toBe("1-27");
    expect(selected?.topBandKeys).toContain("1-27");
  });

  it("records quick-mode pair selection trace for GT and 3-card reads", () => {
    const gtState = buildReadingStateFromFixture(
      {
        seed: "pair-trace-gt",
        question: "What is settling in my finances?",
        subjectId: "money",
        interpretationThemeId: "cashflow",
        spreadType: "grand-tableau",
        gtLayout: "4x8+4",
        readingStyle: "quick",
        includeHouses: false,
        significatorMode: "self",
      },
      0,
    );
    const gtReading = composeDeterministicReading(gtState, 1763000000000);

    const threeCardState = buildReadingStateFromFixture(
      {
        seed: "pair-trace-3",
        question: "What is the next right step in my calling?",
        subjectId: "purpose_calling",
        interpretationThemeId: "right_path",
        spreadType: "three-card",
        threeCardMode: "past-present-future",
        readingStyle: "quick",
        includeHouses: false,
        significatorMode: "open",
      },
      1,
    );
    const threeCardReading = composeDeterministicReading(threeCardState, 1763000001000);

    expect(gtReading.selectionTrace?.primaryPairKey).toBeTruthy();
    expect(gtReading.selectionTrace?.cartouchePairKey ?? null).not.toBeUndefined();
    expect(threeCardReading.selectionTrace?.threeCardPairKey).toBeTruthy();

    const rankedThreeCard = selectTopPair(buildThreeCardPairCandidates(threeCardState.layout), "general");
    expect(rankedThreeCard).toBeTruthy();
  });

  it("uses purpose_calling pair overrides when available", () => {
    const meaning = resolvePairMeaningForSubject(29, 24, "general", "purpose_calling");
    const counterpartMeaning = resolvePairMeaningForSubject(28, 29, "general", "purpose_calling");

    expect(meaning).toMatch(/path/i);
    expect(meaning).toMatch(/deeply true|clearer/i);
    expect(counterpartMeaning).toMatch(/path|boundaries|expectations/i);
  });

  it("uses personal_growth pair overrides when available", () => {
    const clarityMeaning = resolvePairMeaningForSubject(29, 33, "general", "personal_growth");
    const choiceMeaning = resolvePairMeaningForSubject(22, 29, "general", "personal_growth");

    expect(clarityMeaning).toMatch(/growth|clarity|step/i);
    expect(choiceMeaning).toMatch(/choice|road|willing to be/i);
  });

  it("uses health pair overrides when available", () => {
    const recoveryMeaning = resolvePairMeaningForSubject(5, 29, "general", "health");
    const clarityMeaning = resolvePairMeaningForSubject(29, 33, "general", "health");
    const guidanceMeaning = resolvePairMeaningForSubject(16, 29, "general", "health");

    expect(recoveryMeaning).toMatch(/wellbeing|recovery|heal/i);
    expect(clarityMeaning).toMatch(/helps|clarity|next step|recovery/i);
    expect(guidanceMeaning).toMatch(/guidance|pattern|recovery|clearer/i);
  });

  it("uses travel pair overrides when available", () => {
    const routeMeaning = resolvePairMeaningForSubject(21, 29, "general", "travel");
    const clarityMeaning = resolvePairMeaningForSubject(29, 33, "general", "travel");

    expect(routeMeaning).toMatch(/route|delay|blockage|resequencing|trip/i);
    expect(clarityMeaning).toMatch(/clarity|travel|next step|confirmation/i);
  });

  it("uses education pair overrides when available", () => {
    const earlyMeaning = resolvePairMeaningForSubject(13, 29, "general", "education");
    const clarityMeaning = resolvePairMeaningForSubject(29, 33, "general", "education");

    expect(earlyMeaning).toMatch(/learning|study|early/i);
    expect(clarityMeaning).toMatch(/learning|academic|answer|next step/i);
  });

  it("uses creative pair overrides when available", () => {
    const tractionMeaning = resolvePairMeaningForSubject(29, 31, "general", "creative");
    const recognitionMeaning = resolvePairMeaningForSubject(29, 32, "general", "creative");

    expect(tractionMeaning).toMatch(/work|visible|trust|traction|result/i);
    expect(recognitionMeaning).toMatch(/creative|recognition|visibility|seen|weather/i);
  });

  it("uses legal_admin pair overrides when available", () => {
    const approvalMeaning = resolvePairMeaningForSubject(29, 33, "general", "legal_admin");
    const paperworkMeaning = resolvePairMeaningForSubject(14, 27, "general", "legal_admin");

    expect(approvalMeaning).toMatch(/approval|unlock|matter|stage/i);
    expect(paperworkMeaning).toMatch(/paperwork|response|final/i);
  });
});
