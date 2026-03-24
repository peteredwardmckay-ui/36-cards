import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createMulberry32, hashStringToInt } from "@/lib/engine/rng";
import type { SubjectId, ThreeCardMode } from "@/lib/engine/types";
import {
  buildReadingStateFromFixture,
  composeDeterministicReading,
  type ReadingHarnessFixture,
} from "@/tests/helpers/readingHarness";

const requestedCases = Number.parseInt(process.env.HARVEST_CASES_PER_STYLE ?? "48", 10);
const CASES_PER_STYLE = Number.isFinite(requestedCases) && requestedCases > 0 ? requestedCases : 48;

const SUSPICIOUS_PHRASE_PREFIXES = [
  "a sharp decision or cut",
  "a solution or unlock",
  "a newly forming situation",
  "burden and meaning",
  "caution and self-interest",
  "choice and branching paths",
  "clarity and success",
  "clarity and visible progress",
  "closure, ending, or rest",
  "complication or mixed motives",
  "endurance",
  "fog and uncertainty",
  "guidance",
  "heart, value, or feeling",
  "incoming movement or news",
  "movement, distance, or transition",
  "nervous communication",
  "obstacle or delay",
  "resource flow",
  "social or public life",
  "structure, distance, or institution",
  "support and loyalty",
  "values and love",
  "your own position",
];

const SUBJECTS: SubjectId[] = [
  "work",
  "love",
  "money",
  "home_family",
  "health",
  "travel",
  "education",
  "purpose_calling",
  "legal_admin",
  "friends_social",
  "spiritual",
  "community",
  "pets",
  "personal_growth",
  "creative",
  "general_reading",
];

const THREE_CARD_MODES: ThreeCardMode[] = ["past-present-future", "situation-challenge-advice"];

interface SuspiciousSentence {
  sentence: string;
  prefix: string;
  subjectId: SubjectId;
  mode: ThreeCardMode;
  seed: string;
  section: string;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function isSuspicious(sentence: string): string | null {
  const lower = sentence.toLowerCase();
  for (const prefix of SUSPICIOUS_PHRASE_PREFIXES) {
    if (lower.startsWith(prefix)) {
      return prefix;
    }
  }
  return null;
}

function buildFixtures(subjectId: SubjectId, mode: ThreeCardMode): ReadingHarnessFixture[] {
  const fixtures: ReadingHarnessFixture[] = [];
  const question = `What is the real shape of this ${subjectId} situation over the next three months?`;
  for (let index = 0; index < CASES_PER_STYLE; index += 1) {
    fixtures.push({
      seed: `three-card-audit-${subjectId}-${mode}-${index}`,
      question,
      subjectId,
      interpretationThemeId: "auto",
      spreadType: "three-card",
      threeCardMode: mode,
      readingStyle: "quick",
      includeHouses: false,
      significatorMode: "self",
    });
  }
  return fixtures;
}

function collectSuspicious(
  fixture: ReadingHarnessFixture,
  index: number,
  mode: ThreeCardMode,
): SuspiciousSentence[] {
  const state = buildReadingStateFromFixture(fixture, index);
  const rng = createMulberry32(
    hashStringToInt(["three-card-audit", fixture.seed, index].join("|")),
  );
  const reading = composeDeterministicReading(state, 1760000000000 + index * 60000);

  const textBlocks: Array<{ text: string; section: string }> = [
    { text: reading.intro, section: "intro" },
    ...reading.sections.map((s) => ({ text: s.body, section: s.id })),
    { text: reading.conclusion, section: "conclusion" },
  ];

  const found: SuspiciousSentence[] = [];
  for (const block of textBlocks) {
    for (const sentence of splitSentences(block.text)) {
      const prefix = isSuspicious(sentence);
      if (prefix) {
        found.push({
          sentence,
          prefix,
          subjectId: fixture.subjectId,
          mode,
          seed: fixture.seed,
          section: block.section,
        });
      }
    }
  }
  return found;
}

describe("three-card phrase audit", () => {
  it("produces no sentences starting with raw signal labels", () => {
    const allSuspicious: SuspiciousSentence[] = [];

    for (const subjectId of SUBJECTS) {
      for (const mode of THREE_CARD_MODES) {
        const fixtures = buildFixtures(subjectId, mode);
        for (const [index, fixture] of fixtures.entries()) {
          const found = collectSuspicious(fixture, index, mode);
          allSuspicious.push(...found);
        }
      }
    }

    const reportsDir = path.join(process.cwd(), "reports");
    fs.mkdirSync(reportsDir, { recursive: true });

    const totalCases = SUBJECTS.length * THREE_CARD_MODES.length * CASES_PER_STYLE;
    const markdown = [
      "# Three-Card Phrase Audit",
      "",
      `Generated: ${new Date().toISOString()}`,
      `Cases: ${totalCases}`,
      `Suspicious sentences: ${allSuspicious.length}`,
      "",
      "## Suspicious Sentences",
      "",
      "| Prefix | Subject | Mode | Section | Sentence |",
      "| --- | --- | --- | --- | --- |",
      ...(allSuspicious.length > 0
        ? allSuspicious.map(
            (s) => `| ${s.prefix} | ${s.subjectId} | ${s.mode} | ${s.section} | ${s.sentence.slice(0, 120)} |`,
          )
        : ["| None detected | — | — | — | — |"]),
    ].join("\n");

    fs.writeFileSync(path.join(reportsDir, "three-card-phrase-audit-latest.md"), markdown);

    // eslint-disable-next-line no-console
    console.log(
      `[three-card-phrase-audit] cases=${totalCases} suspicious=${allSuspicious.length}`,
    );

    expect(allSuspicious.length).toBe(0);
  });
});
