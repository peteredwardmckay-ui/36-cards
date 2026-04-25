import { describe, it } from "vitest";
import { buildReadingStateFromFixture, composeDeterministicReading, readingBody } from "@/tests/helpers/readingHarness";

const BATCH = [
  // 3-card, varied subjects + themes + modes
  { id:"3c-love-trust-ppf",     sub:"love",          th:"trust",               spread:"three-card", mode:"past-present-future",        seed:"batch-01", ts:1762000000000 },
  { id:"3c-work-burnout-sca",   sub:"work",          th:"burnout",             spread:"three-card", mode:"situation-challenge-advice",  seed:"batch-02", ts:1762001000000 },
  { id:"3c-health-recovery-ppf",sub:"health",        th:"recovery",            spread:"three-card", mode:"past-present-future",        seed:"batch-03", ts:1762002000000 },
  { id:"3c-money-cashflow-sca", sub:"money",         th:"cashflow",            spread:"three-card", mode:"situation-challenge-advice",  seed:"batch-04", ts:1762003000000 },
  { id:"3c-growth-change-ppf",  sub:"personal_growth",th:"change",             spread:"three-card", mode:"past-present-future",        seed:"batch-05", ts:1762004000000 },
  { id:"3c-social-tension-sca", sub:"friends_social",th:"social_tension",      spread:"three-card", mode:"situation-challenge-advice",  seed:"batch-06", ts:1762005000000 },
  { id:"3c-edu-study-ppf",      sub:"education",     th:"study_path",          spread:"three-card", mode:"past-present-future",        seed:"batch-07", ts:1762006000000 },
  { id:"3c-travel-delays-sca",  sub:"travel",        th:"delays",              spread:"three-card", mode:"situation-challenge-advice",  seed:"batch-08", ts:1762007000000 },
  { id:"3c-purpose-align-ppf",  sub:"purpose_calling",th:"alignment",          spread:"three-card", mode:"past-present-future",        seed:"batch-09", ts:1762008000000 },
  { id:"3c-creative-block-sca", sub:"creative",      th:"creative_block",      spread:"three-card", mode:"situation-challenge-advice",  seed:"batch-10", ts:1762009000000 },
  // Quick GT readings
  { id:"gt-love-communication", sub:"love",          th:"communication",       spread:"grand-tableau", seed:"batch-11", ts:1762010000000 },
  { id:"gt-work-leadership",    sub:"work",          th:"leadership",          spread:"grand-tableau", seed:"batch-12", ts:1762011000000 },
  { id:"gt-money-pressure",     sub:"money",         th:"financial_pressure",  spread:"grand-tableau", seed:"batch-13", ts:1762012000000 },
  { id:"gt-growth-boundaries",  sub:"personal_growth",th:"boundaries",         spread:"grand-tableau", seed:"batch-14", ts:1762013000000 },
  { id:"gt-health-stress",      sub:"health",        th:"stress_load",         spread:"grand-tableau", seed:"batch-15", ts:1762014000000 },
];

describe("variety batch", () => {
  it("shows intros, conclusions, and section titles across readings", () => {
    console.log("\n=== INTROS ===");
    BATCH.forEach(({ id, sub, th, spread, mode, seed, ts }) => {
      const state = buildReadingStateFromFixture({
        seed, question: "What do I need to understand right now?",
        subjectId: sub as any, interpretationThemeId: th,
        spreadType: spread as any, threeCardMode: (mode ?? "past-present-future") as any,
        gtLayout: "4x9", readingStyle: "quick", includeHouses: false, significatorMode: "self",
      }, BATCH.indexOf(BATCH.find(b => b.id === id)!));
      const reading = composeDeterministicReading(state, ts);
      console.log(`[${id}] ${reading.intro}`);
    });

    console.log("\n=== CONCLUSIONS ===");
    BATCH.forEach(({ id, sub, th, spread, mode, seed, ts }) => {
      const state = buildReadingStateFromFixture({
        seed, question: "What do I need to understand right now?",
        subjectId: sub as any, interpretationThemeId: th,
        spreadType: spread as any, threeCardMode: (mode ?? "past-present-future") as any,
        gtLayout: "4x9", readingStyle: "quick", includeHouses: false, significatorMode: "self",
      }, BATCH.indexOf(BATCH.find(b => b.id === id)!));
      const reading = composeDeterministicReading(state, ts);
      console.log(`[${id}] ${reading.conclusion}`);
    });

    console.log("\n=== SECTION TITLES (3-card only) ===");
    BATCH.filter(b => b.spread === "three-card").forEach(({ id, sub, th, spread, mode, seed, ts }) => {
      const state = buildReadingStateFromFixture({
        seed, question: "What do I need to understand right now?",
        subjectId: sub as any, interpretationThemeId: th,
        spreadType: spread as any, threeCardMode: (mode ?? "past-present-future") as any,
        gtLayout: "4x9", readingStyle: "quick", includeHouses: false, significatorMode: "self",
      }, BATCH.indexOf(BATCH.find(b => b.id === id)!));
      const reading = composeDeterministicReading(state, ts);
      console.log(`[${id}] ${reading.sections.map(s => s.title).join(" | ")}`);
    });
  });
});
