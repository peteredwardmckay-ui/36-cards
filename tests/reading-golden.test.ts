import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { ReadingHarnessFixture } from "@/tests/helpers/readingHarness";
import {
  buildReadingStateFromFixture,
  composeDeterministicReading,
  readingBody,
  readingFingerprint,
} from "@/tests/helpers/readingHarness";

interface GoldenFixture {
  id: string;
  fixture: ReadingHarnessFixture;
  expectedFingerprint: string;
}

const GOLDEN_FIXTURES: GoldenFixture[] = [
  {
    id: "quick_3card_general",
    fixture: {
      seed: "golden-01",
      question: "What should I keep in view this week?",
      subjectId: "general_reading",
      interpretationThemeId: "auto",
      spreadType: "three-card",
      threeCardMode: "past-present-future",
      readingStyle: "quick",
      includeHouses: false,
      gtLayout: "4x9",
      significatorMode: "self",
    },
    expectedFingerprint: "357f858b1dff83696906",
  },
  {
    id: "quick_gt_4x9_love",
    fixture: {
      seed: "golden-02",
      question: "What should I understand about this relationship dynamic?",
      subjectId: "love",
      interpretationThemeId: "communication",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "quick",
      includeHouses: false,
      significatorMode: "relationship",
    },
    expectedFingerprint: "f561879fb89237820fa4",
  },
  {
    id: "quick_gt_4x8_cartouche_money",
    fixture: {
      seed: "golden-03",
      question: "How do I stabilize the next phase of finances?",
      subjectId: "money",
      interpretationThemeId: "cashflow",
      spreadType: "grand-tableau",
      gtLayout: "4x8+4",
      readingStyle: "quick",
      includeHouses: false,
      significatorMode: "self",
    },
    expectedFingerprint: "5713e401ada032749b72",
  },
  {
    id: "deep_gt_4x9_houses_off_work",
    fixture: {
      seed: "golden-04",
      question: "How should I handle pressure at work without losing direction?",
      subjectId: "work",
      interpretationThemeId: "burnout",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: false,
      significatorMode: "self",
    },
    expectedFingerprint: "18212e8c94cc9e8f530f",
  },
  {
    id: "deep_gt_4x9_houses_on_work",
    fixture: {
      seed: "golden-05",
      question: "How should I handle pressure at work without losing direction?",
      subjectId: "work",
      interpretationThemeId: "burnout",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedFingerprint: "1616c62022b2b78f4432",
  },
  {
    id: "deep_gt_4x8_houses_off_purpose",
    fixture: {
      seed: "golden-06",
      question: "What is my next aligned move in vocation?",
      subjectId: "purpose_calling",
      interpretationThemeId: "alignment",
      spreadType: "grand-tableau",
      gtLayout: "4x8+4",
      readingStyle: "deep_dive",
      includeHouses: false,
      significatorMode: "open",
    },
    expectedFingerprint: "1af475f3c313a31c1406",
  },
  {
    id: "deep_gt_4x8_houses_on_purpose",
    fixture: {
      seed: "golden-07",
      question: "What is my next aligned move in vocation?",
      subjectId: "purpose_calling",
      interpretationThemeId: "alignment",
      spreadType: "grand-tableau",
      gtLayout: "4x8+4",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "open",
    },
    expectedFingerprint: "fbcf3c3f30277fc53cce",
  },
  {
    id: "quick_3card_health",
    fixture: {
      seed: "golden-08",
      question: "How do I pace recovery this month?",
      subjectId: "health",
      interpretationThemeId: "recovery",
      spreadType: "three-card",
      threeCardMode: "situation-challenge-advice",
      readingStyle: "quick",
      includeHouses: false,
      gtLayout: "4x9",
      significatorMode: "self",
    },
    expectedFingerprint: "2b263de29ddcd8427d6c",
  },
  {
    id: "quick_gt_legal_admin",
    fixture: {
      seed: "golden-09",
      question: "What should I watch in contracts and filings?",
      subjectId: "legal_admin",
      interpretationThemeId: "contracts",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "quick",
      includeHouses: false,
      significatorMode: "self",
    },
    expectedFingerprint: "b4b542a957792201a598",
  },
  {
    id: "quick_3card_purpose",
    fixture: {
      seed: "golden-10",
      question: "What is the right next step for my calling?",
      subjectId: "purpose_calling",
      interpretationThemeId: "right_path",
      spreadType: "three-card",
      threeCardMode: "past-present-future",
      readingStyle: "quick",
      includeHouses: false,
      gtLayout: "4x9",
      significatorMode: "open",
    },
    expectedFingerprint: "7be6044d5a59b57ce1fd",
  },
];

describe("reading golden fingerprints", () => {
  it("matches stable fingerprints across canonical fixtures", () => {
    const rows = GOLDEN_FIXTURES.map((entry, index) => {
      const state = buildReadingStateFromFixture(entry.fixture, index);
      const reading = composeDeterministicReading(state, 1762000000000 + index * 1000);
      return {
        id: entry.id,
        expectedFingerprint: entry.expectedFingerprint,
        actualFingerprint: readingFingerprint(reading),
        wordCount: reading.wordCount,
        sectionIds: reading.sections.map((section) => section.id),
        bodyPreview: readingBody(reading).slice(0, 260),
      };
    });

    const reportsDir = path.resolve(process.cwd(), "reports");
    fs.mkdirSync(reportsDir, { recursive: true });
    fs.writeFileSync(path.join(reportsDir, "reading-golden-latest.json"), JSON.stringify(rows, null, 2));

    rows.forEach((row) => {
      expect(row.actualFingerprint, row.id).toBe(row.expectedFingerprint);
    });
  });
});
