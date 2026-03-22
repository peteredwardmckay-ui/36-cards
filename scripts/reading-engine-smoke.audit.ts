import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getSubjectThemes } from "@/lib/content/themes";
import { SUBJECT_DEFINITIONS } from "@/lib/content/subjects";
import { createMulberry32, hashStringToInt } from "@/lib/engine/rng";
import type { GeneratedReading, ReadingStyle, SpreadType, SubjectId } from "@/lib/engine/types";
import {
  buildReadingStateFromFixture,
  composeDeterministicReading,
  readingBody,
  readingFingerprint,
} from "@/tests/helpers/readingHarness";

interface SmokeCaseSetup {
  caseId: string;
  subjectId: SubjectId;
  interpretationThemeId: string;
  spreadType: SpreadType;
  gtLayout: "4x9" | "4x8+4";
  readingStyle: ReadingStyle;
  includeHouses: boolean;
  threeCardMode: "past-present-future" | "situation-challenge-advice";
  question: string;
}

interface SmokeCaseResult {
  caseId: string;
  setup: SmokeCaseSetup;
  fingerprint: string;
  wordCount: number;
  sectionIds: string[];
  grammarCollisions: string[];
  duplicateCardMentions: string[];
  bannedPhraseHits: string[];
  sectionRuleErrors: string[];
  wordBandError: string | null;
}

const BANNED_PHRASE_PATTERNS: Array<[string, RegExp]> = [
  ["core_signal_label", /\bcore signal\b/i],
  ["practical_move_label", /\bpractical move\s*:/i],
  ["diagonal_thread_a", /\bdiagonal thread a\b/i],
  ["diagonal_thread_b", /\bdiagonal thread b\b/i],
  ["near_cards_around", /\bnear cards around\b/i],
  ["significator_mode_debug", /\bsignificator mode\b/i],
  ["near_proximity_debug", /\bnear proximity indicates\b/i],
  ["secondary_diagonal_debug", /\bsecondary diagonal in\b/i],
  ["subject_id_debug", /\bsubject_id\b/i],
  ["technique_key_debug", /\btechnique_key\b/i],
  ["agency_orientation", /\bagency and orientation\b/i],
  ["immediate_message_wrapper", /\bimmediate message is that\b/i],
  ["strongest_interpretive_frame", /\bstrongest interpretive frame\b/i],
  ["using_primary_lens", /\busing [^.]{0,80}\bas the primary lens\b/i],
  ["what_emerges_first_is", /\bwhat emerges first is\b/i],
  ["core_message_is", /\bwhere the core message is\b/i],
];

const GRAMMAR_COLLISION_PATTERNS: Array<[string, RegExp]> = [
  ["collision_center_gravity", /\bare central the center of gravity\b/i],
  ["collision_center_gravity_singular", /\bis central the center of gravity\b/i],
  ["collision_double_central_plural", /\bare central is central\b/i],
  ["collision_double_central_singular", /\bis central is central\b/i],
  ["collision_to_to", /\bto to\b/i],
  ["collision_the_the", /\bthe the\b/i],
];

const DUPLICATE_CARD_MENTION_PATTERNS: Array<[string, RegExp]> = [
  ["duplicate_card_adjacent", /\b([A-Za-z][A-Za-z' -]* \(\d+\))(?:\s*(?:,|and|->)\s*)\1\b/i],
  ["duplicate_card_short_span", /\b([A-Za-z][A-Za-z' -]* \(\d+\))\b.{0,22}\1\b/i],
];

const QUICK_WORD_BANDS: Record<SpreadType, { min: number; max: number }> = {
  "three-card": { min: 170, max: 320 },
  "grand-tableau": { min: 180, max: 420 },
};

const DEEP_WORD_BANDS: Record<SpreadType, { min: number; max: number }> = {
  "three-card": { min: 270, max: 460 },
  "grand-tableau": { min: 620, max: 1120 },
};

function sectionRuleErrors(setup: SmokeCaseSetup, reading: GeneratedReading): string[] {
  const errors: string[] = [];
  const ids = reading.sections.map((section) => section.id);
  const has = (id: string) => ids.includes(id);

  if (setup.readingStyle === "quick" && setup.spreadType === "grand-tableau") {
    if (!has("center")) errors.push("quick-gt-missing-center");
    if (!has("pair")) errors.push("quick-gt-missing-pair");
    if (setup.gtLayout === "4x8+4") {
      if (!has("cartouche")) errors.push("quick-gt-4x8-missing-cartouche");
    } else {
      if (has("cartouche")) errors.push("quick-gt-4x9-has-cartouche");
      if (!has("timing") && !has("background")) errors.push("quick-gt-4x9-missing-timing-or-background");
    }
  }

  if (setup.readingStyle === "deep_dive" && setup.spreadType === "grand-tableau") {
    const required = [
      "opening-frame",
      "center-significator",
      "immediate-surroundings",
      "local-cluster",
      "wider-thread",
      "secondary-zone",
      "key-threads",
    ];
    required.forEach((id) => {
      if (!has(id)) errors.push(`deep-gt-missing-${id}`);
    });
    if (setup.includeHouses && !has("houses-overlay")) errors.push("deep-gt-houses-on-missing-houses-overlay");
    if (!setup.includeHouses && has("houses-overlay")) errors.push("deep-gt-houses-off-has-houses-overlay");
    if (setup.gtLayout === "4x8+4" && !has("cartouche-fate-line")) errors.push("deep-gt-4x8-missing-cartouche");
    if (setup.gtLayout === "4x9" && has("cartouche-fate-line")) errors.push("deep-gt-4x9-has-cartouche");
  }

  if (setup.readingStyle === "deep_dive" && setup.spreadType === "three-card") {
    const required = ["opening-frame", "situation", "pivot", "direction", "key-threads"];
    required.forEach((id) => {
      if (!has(id)) errors.push(`deep-3card-missing-${id}`);
    });
  }

  if (setup.readingStyle === "quick" && setup.spreadType === "three-card") {
    if (!has("situation")) errors.push("quick-3card-missing-situation");
    if (!has("pivot")) errors.push("quick-3card-missing-pivot");
    if (!has("direction")) errors.push("quick-3card-missing-direction");
  }

  return errors;
}

function wordBandError(setup: SmokeCaseSetup, reading: GeneratedReading): string | null {
  const bands = setup.readingStyle === "quick" ? QUICK_WORD_BANDS : DEEP_WORD_BANDS;
  const band = bands[setup.spreadType];
  if (reading.wordCount < band.min || reading.wordCount > band.max) {
    return `word-band-${setup.readingStyle}-${setup.spreadType}-${reading.wordCount}-outside-${band.min}-${band.max}`;
  }
  return null;
}

function buildSmokeSetup(index: number): SmokeCaseSetup {
  const rng = createMulberry32(hashStringToInt(`reading-smoke-${index}`));
  const subject = SUBJECT_DEFINITIONS[rng.nextInt(0, SUBJECT_DEFINITIONS.length - 1)].id;
  const subjectThemes = getSubjectThemes(subject);
  const pickedTheme = subjectThemes[rng.nextInt(0, subjectThemes.length - 1)]?.id ?? "auto";
  const spreadType: SpreadType = rng.next() < 0.62 ? "grand-tableau" : "three-card";
  const gtLayout = spreadType === "grand-tableau" && rng.next() < 0.45 ? "4x8+4" : "4x9";
  const readingStyle: ReadingStyle = rng.next() < 0.5 ? "quick" : "deep_dive";
  const includeHouses = spreadType === "grand-tableau" && readingStyle === "deep_dive" ? rng.next() < 0.5 : false;
  const interpretationThemeId = rng.next() < 0.35 ? "auto" : pickedTheme;
  const threeCardMode = rng.next() < 0.5 ? "past-present-future" : "situation-challenge-advice";
  const question =
    rng.next() < 0.12
      ? ""
      : `What should I understand about ${subject.replaceAll("_", " ")} over the next ${rng.nextInt(2, 6)} months?`;

  return {
    caseId: `smoke-${String(index + 1).padStart(3, "0")}`,
    subjectId: subject,
    interpretationThemeId,
    spreadType,
    gtLayout,
    readingStyle,
    includeHouses,
    threeCardMode,
    question,
  };
}

describe("reading engine smoke audit", () => {
  it("passes 200-case quality thresholds and writes report artifacts", () => {
    const results: SmokeCaseResult[] = [];

    for (let index = 0; index < 200; index += 1) {
      const setup = buildSmokeSetup(index);
      const state = buildReadingStateFromFixture(
        {
          seed: setup.caseId,
          question: setup.question,
          subjectId: setup.subjectId,
          interpretationThemeId: setup.interpretationThemeId,
          spreadType: setup.spreadType,
          gtLayout: setup.gtLayout,
          readingStyle: setup.readingStyle,
          includeHouses: setup.includeHouses,
          threeCardMode: setup.threeCardMode,
          significatorMode: "open",
        },
        index,
      );

      const reading = composeDeterministicReading(state, 1763000000000 + index * 137);
      const body = readingBody(reading);
      const lowercaseBody = body.toLowerCase();

      const grammarCollisions = GRAMMAR_COLLISION_PATTERNS
        .filter(([, pattern]) => pattern.test(body))
        .map(([label]) => label);
      const duplicateCardMentions = DUPLICATE_CARD_MENTION_PATTERNS
        .filter(([, pattern]) => pattern.test(body))
        .map(([label]) => label);
      const bannedPhraseHits = BANNED_PHRASE_PATTERNS
        .filter(([, pattern]) => pattern.test(body))
        .map(([label]) => label);
      const sectionErrors = sectionRuleErrors(setup, reading);
      const wordError = wordBandError(setup, reading);

      results.push({
        caseId: setup.caseId,
        setup,
        fingerprint: readingFingerprint(reading),
        wordCount: reading.wordCount,
        sectionIds: reading.sections.map((section) => section.id),
        grammarCollisions,
        duplicateCardMentions,
        bannedPhraseHits,
        sectionRuleErrors: sectionErrors,
        wordBandError: wordError,
      });
    }

    const grammarCollisionCount = results.filter((row) => row.grammarCollisions.length > 0).length;
    const duplicateCardMentionCount = results.filter((row) => row.duplicateCardMentions.length > 0).length;
    const bannedPhraseCount = results.filter((row) => row.bannedPhraseHits.length > 0).length;
    const sectionRuleViolationCount = results.filter((row) => row.sectionRuleErrors.length > 0).length;
    const wordBandViolationCount = results.filter((row) => row.wordBandError !== null).length;

    const summary = {
      totalCases: results.length,
      grammarCollisionCount,
      duplicateCardMentionCount,
      bannedPhraseCount,
      sectionRuleViolationCount,
      wordBandViolationCount,
    };

    const report = {
      generatedAt: new Date().toISOString(),
      summary,
      failures: results.filter(
        (row) =>
          row.grammarCollisions.length > 0 ||
          row.duplicateCardMentions.length > 0 ||
          row.bannedPhraseHits.length > 0 ||
          row.sectionRuleErrors.length > 0 ||
          row.wordBandError !== null,
      ),
      sample: results.slice(0, 20),
    };

    const reportsDir = path.resolve(process.cwd(), "reports");
    fs.mkdirSync(reportsDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    fs.writeFileSync(
      path.join(reportsDir, `reading-engine-smoke-${timestamp}.json`),
      JSON.stringify(report, null, 2),
    );
    fs.writeFileSync(path.join(reportsDir, "reading-engine-smoke-latest.json"), JSON.stringify(report, null, 2));

    console.log(
      `[reading-engine-smoke] cases=${summary.totalCases} grammar=${summary.grammarCollisionCount} duplicateCards=${summary.duplicateCardMentionCount} banned=${summary.bannedPhraseCount} section=${summary.sectionRuleViolationCount} wordBand=${summary.wordBandViolationCount}`,
    );

    expect(summary.grammarCollisionCount).toBe(0);
    expect(summary.duplicateCardMentionCount).toBe(0);
    expect(summary.bannedPhraseCount).toBe(0);
    expect(summary.sectionRuleViolationCount).toBe(0);
    expect(summary.wordBandViolationCount).toBe(0);
  });
});
