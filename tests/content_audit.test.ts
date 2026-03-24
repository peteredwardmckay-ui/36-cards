import { describe, expect, it } from "vitest";
import { buildReadingStateFromFixture, composeDeterministicReading, readingBody } from "@/tests/helpers/readingHarness";
import type { SubjectId } from "@/lib/engine/types";

describe("content audit", () => {
  it("samples across subjects and themes", () => {
    const fixtures = [
      { id: "love_commitment", seed: "audit-01", subjectId: "love" as SubjectId, interpretationThemeId: "commitment" as const, spreadType: "three-card" as const, threeCardMode: "past-present-future" as const, readingStyle: "deep_dive" as const, includeHouses: false, gtLayout: "4x9" as const, significatorMode: "relationship" as const, question: "What is moving in this connection?" },
      { id: "work_burnout", seed: "audit-02", subjectId: "work" as SubjectId, interpretationThemeId: "burnout" as const, spreadType: "three-card" as const, threeCardMode: "situation-challenge-advice" as const, readingStyle: "deep_dive" as const, includeHouses: false, gtLayout: "4x9" as const, significatorMode: "self" as const, question: "What is the real pressure at work?" },
      { id: "health_stress_load", seed: "audit-03", subjectId: "health" as SubjectId, interpretationThemeId: "stress_load" as const, spreadType: "three-card" as const, threeCardMode: "situation-challenge-advice" as const, readingStyle: "deep_dive" as const, includeHouses: false, gtLayout: "4x9" as const, significatorMode: "self" as const, question: "What is draining my energy?" },
      { id: "money_financial_pressure", seed: "audit-04", subjectId: "money" as SubjectId, interpretationThemeId: "financial_pressure" as const, spreadType: "three-card" as const, threeCardMode: "past-present-future" as const, readingStyle: "deep_dive" as const, includeHouses: false, gtLayout: "4x9" as const, significatorMode: "self" as const, question: "What do I need to see about my finances?" },
    ];
    fixtures.forEach((f, i) => {
      const state = buildReadingStateFromFixture(f, i);
      const reading = composeDeterministicReading(state, 1762000000000 + i * 1000);
      console.log(`\n=== ${f.id} ===`);
      reading.sections.filter(s => ["situation","pivot","direction"].includes(s.id)).forEach(s => {
        console.log(`[${s.id}] ${s.body.slice(0, 220)}`);
      });
    });
    expect(true).toBe(true);
  });
});
