import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type {
  GeneratedReading,
  ReadingStyle,
  SignificatorMode,
  SubjectId,
} from "@/lib/engine/types";
import {
  buildReadingStateFromFixture,
  composeDeterministicReading,
  readingBody,
  readingFingerprint,
  type ReadingHarnessFixture,
} from "@/tests/helpers/readingHarness";

interface FrozenSubjectSweep {
  subjectId: SubjectId;
  significatorMode: SignificatorMode;
  quickQuestion: string;
  deepQuestion: string;
}

interface ExtractedSections {
  openingFrame: string | null;
  centerFocus: string | null;
  houses: string | null;
  nearbyPair: string | null;
  synthesis: string | null;
  conclusion: string;
}

interface PatternHit {
  label: string;
  matches: string[];
}

interface AuditRow {
  caseId: string;
  subjectId: SubjectId;
  readingStyle: ReadingStyle;
  fingerprint: string;
  wordCount: number;
  sectionIds: string[];
  missingSections: string[];
  grammarCollisions: string[];
  bannedPhraseHits: string[];
  softSeamHits: PatternHit[];
  sections: ExtractedSections;
}

const FROZEN_SUBJECT_SWEEP: FrozenSubjectSweep[] = [
  {
    subjectId: "general_reading",
    significatorMode: "open",
    quickQuestion: "What should I understand about the next three months overall?",
    deepQuestion: "Where is the real pressure around me right now, and what is beginning to move?",
  },
  {
    subjectId: "love",
    significatorMode: "relationship",
    quickQuestion: "What is the real shape of this relationship over the next three months?",
    deepQuestion: "Where is the real pressure in this relationship, and what is beginning to move?",
  },
  {
    subjectId: "money",
    significatorMode: "self",
    quickQuestion: "What is the real shape of my finances over the next three months?",
    deepQuestion: "Where is the real pressure in my financial picture, and what is beginning to move?",
  },
  {
    subjectId: "home_family",
    significatorMode: "self",
    quickQuestion: "What is the real shape of home and family over the next three months?",
    deepQuestion: "Where is the real pressure in home and family, and what is beginning to move?",
  },
  {
    subjectId: "work",
    significatorMode: "self",
    quickQuestion: "What is the real shape of my work path over the next three months?",
    deepQuestion: "Where is the real pressure in my work, and what is beginning to move?",
  },
  {
    subjectId: "purpose_calling",
    significatorMode: "open",
    quickQuestion: "What is the real shape of my calling over the next three months?",
    deepQuestion: "Where is the real pressure in my calling, and what is beginning to move?",
  },
  {
    subjectId: "legal_admin",
    significatorMode: "self",
    quickQuestion: "What is the real shape of this formal process over the next three months?",
    deepQuestion: "Where is the real pressure in this formal process, and what is beginning to move?",
  },
  {
    subjectId: "personal_growth",
    significatorMode: "self",
    quickQuestion: "What is the real shape of my inner growth over the next three months?",
    deepQuestion: "Where is the real pressure in my inner growth, and what is beginning to move?",
  },
  {
    subjectId: "health",
    significatorMode: "self",
    quickQuestion: "What is the real shape of my recovery over the next three months?",
    deepQuestion: "Where is the real pressure in my recovery, and what is beginning to move?",
  },
  {
    subjectId: "travel",
    significatorMode: "self",
    quickQuestion: "What is the real shape of this trip over the next three months?",
    deepQuestion: "Where is the real pressure in this trip, and what is beginning to move?",
  },
  {
    subjectId: "education",
    significatorMode: "self",
    quickQuestion: "What is the real shape of this learning path over the next three months?",
    deepQuestion: "Where is the real pressure in this learning path, and what is beginning to move?",
  },
  {
    subjectId: "creative",
    significatorMode: "self",
    quickQuestion: "What is the real shape of my creative path over the next three months?",
    deepQuestion: "Where is the real pressure in my creative work, and what is beginning to move?",
  },
];

const GRAMMAR_COLLISION_PATTERNS: Array<[string, RegExp]> = [
  ["collision_to_to", /\bto to\b/i],
  ["collision_the_the", /\bthe the\b/i],
  ["collision_double_center", /\bis central is central\b|\bare central is central\b/i],
];

const BANNED_PHRASE_PATTERNS: Array<[string, RegExp]> = [
  ["debug_subject_id", /\bsubject_id\b/i],
  ["debug_technique_key", /\btechnique_key\b/i],
  ["debug_significator_mode", /\bsignificator mode\b/i],
  ["debug_near_proximity", /\bnear proximity\b/i],
];

const SOFT_SEAM_PATTERNS: Array<[string, RegExp]> = [
  ["generic_coffin_fallback", /\brelease an outdated pattern gracefully\b/i],
  ["generic_child_fallback", /\bfresh perspective can reset stale assumptions\b/i],
  ["generic_bear_fallback", /\bresources, authority, and stewardship must be managed\b/i],
  ["generic_ship_fallback", /\btravel, trade, and distance shape perspective\b/i],
  ["response_wrapper", /\ban encouraging response in [a-z]/i],
  ["support_wrapper", /\b(?:support and loyalty|reliable support)\s+(?:in|under|around)\s+/i],
  ["clarity_wrapper", /\bclarity and visible progress\s+(?:in|under|around)\s+/i],
  ["values_wrapper", /\bwhat genuinely matters\s+(?:in|under|around)\s+/i],
  ["hold_wrapper", /\bwhat can(?: still)? hold\s+(?:in|under|around)\s+/i],
  ["recognition_wrapper", /\b(?:closure, ending, or rest|fog or uncertainty)\s+in recognition cycle\b/i],
  ["position_wrapper", /\byour own position\s+(?:in|under|around|moving through)\s+/i],
  ["other_side_wrapper", /\bthe other person's field\s+(?:in|under|around|moving through)\s+/i],
];

function buildSweepFixtures(): ReadingHarnessFixture[] {
  return FROZEN_SUBJECT_SWEEP.flatMap((subject) => [
    {
      seed: `frozen-${subject.subjectId}-quick`,
      question: subject.quickQuestion,
      subjectId: subject.subjectId,
      interpretationThemeId: "auto",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "quick",
      includeHouses: false,
      significatorMode: subject.significatorMode,
    },
    {
      seed: `frozen-${subject.subjectId}-deep`,
      question: subject.deepQuestion,
      subjectId: subject.subjectId,
      interpretationThemeId: "auto",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: subject.significatorMode,
    },
  ]);
}

function findSectionBody(reading: GeneratedReading, id: string): string | null {
  return reading.sections.find((section) => section.id === id)?.body ?? null;
}

function extractSections(reading: GeneratedReading, readingStyle: ReadingStyle): ExtractedSections {
  if (readingStyle === "quick") {
    const background = findSectionBody(reading, "background");
    const timing = findSectionBody(reading, "timing");
    return {
      openingFrame: null,
      centerFocus: findSectionBody(reading, "center"),
      houses: null,
      nearbyPair: findSectionBody(reading, "pair"),
      synthesis: [background, timing].filter(Boolean).join("\n\n") || null,
      conclusion: reading.conclusion,
    };
  }

  return {
    openingFrame: findSectionBody(reading, "opening-frame"),
    centerFocus: findSectionBody(reading, "center-significator"),
    houses: findSectionBody(reading, "houses-overlay"),
    nearbyPair: null,
    synthesis: findSectionBody(reading, "opening-frame"),
    conclusion: reading.conclusion,
  };
}

function missingSections(reading: GeneratedReading, readingStyle: ReadingStyle): string[] {
  const has = (id: string) => reading.sections.some((section) => section.id === id);
  if (readingStyle === "quick") {
    const missing = ["center", "pair"].filter((id) => !has(id));
    if (!has("background") && !has("timing")) {
      missing.push("background/timing");
    }
    return missing;
  }
  return ["opening-frame", "center-significator", "houses-overlay"].filter((id) => !has(id));
}

function collectPatternMatches(text: string, pattern: RegExp): string[] {
  const globalPattern = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
  const matches = Array.from(text.matchAll(globalPattern), (match) => match[0].trim());
  return [...new Set(matches)];
}

function collectHits(text: string, patterns: Array<[string, RegExp]>): PatternHit[] {
  return patterns
    .map(([label, pattern]) => ({
      label,
      matches: collectPatternMatches(text, pattern),
    }))
    .filter((hit) => hit.matches.length > 0);
}

function markdownForRow(row: AuditRow): string {
  const lines: string[] = [
    `### ${row.caseId}`,
    `- Subject: \`${row.subjectId}\``,
    `- Style: \`${row.readingStyle}\``,
    `- Fingerprint: \`${row.fingerprint}\``,
    `- Soft seams: ${row.softSeamHits.length}`,
    "",
  ];

  if (row.softSeamHits.length > 0) {
    lines.push("Soft seam hits:");
    row.softSeamHits.forEach((hit) => {
      lines.push(`- \`${hit.label}\`: ${hit.matches.join(" | ")}`);
    });
    lines.push("");
  }

  if (row.sections.centerFocus) {
    lines.push("Center Focus:");
    lines.push(row.sections.centerFocus);
    lines.push("");
  }
  if (row.sections.houses) {
    lines.push("Houses:");
    lines.push(row.sections.houses);
    lines.push("");
  }
  if (row.sections.nearbyPair) {
    lines.push("Nearby Pair:");
    lines.push(row.sections.nearbyPair);
    lines.push("");
  }
  if (row.sections.synthesis) {
    lines.push("Synthesis / Opening Frame:");
    lines.push(row.sections.synthesis);
    lines.push("");
  }
  lines.push("Conclusion:");
  lines.push(row.sections.conclusion);
  lines.push("");

  return lines.join("\n");
}

describe("frozen pack regression audit", () => {
  it("writes a targeted frozen-pack sweep report and preserves hard quality bars", () => {
    const fixtures = buildSweepFixtures();

    const rows = fixtures.map((fixture, index): AuditRow => {
      const state = buildReadingStateFromFixture(fixture, index);
      const reading = composeDeterministicReading(state, 1765000000000 + index * 101);
      const fullBody = readingBody(reading);
      const extracted = extractSections(reading, fixture.readingStyle ?? "quick");
      const reviewSurface = [
        extracted.openingFrame,
        extracted.centerFocus,
        extracted.houses,
        extracted.nearbyPair,
        extracted.synthesis,
        extracted.conclusion,
      ]
        .filter(Boolean)
        .join("\n\n");

      return {
        caseId: fixture.seed,
        subjectId: fixture.subjectId,
        readingStyle: fixture.readingStyle ?? "quick",
        fingerprint: readingFingerprint(reading),
        wordCount: reading.wordCount,
        sectionIds: reading.sections.map((section) => section.id),
        missingSections: missingSections(reading, fixture.readingStyle ?? "quick"),
        grammarCollisions: GRAMMAR_COLLISION_PATTERNS
          .filter(([, pattern]) => pattern.test(fullBody))
          .map(([label]) => label),
        bannedPhraseHits: BANNED_PHRASE_PATTERNS
          .filter(([, pattern]) => pattern.test(fullBody))
          .map(([label]) => label),
        softSeamHits: collectHits(reviewSurface, SOFT_SEAM_PATTERNS),
        sections: extracted,
      };
    });

    const rowsWithSoftSeams = rows.filter((row) => row.softSeamHits.length > 0);
    const hardFailureRows = rows.filter(
      (row) => row.missingSections.length > 0 || row.grammarCollisions.length > 0 || row.bannedPhraseHits.length > 0,
    );

    const softSeamSummary = rows
      .flatMap((row) => row.softSeamHits.map((hit) => hit.label))
      .reduce<Record<string, number>>((acc, label) => {
        acc[label] = (acc[label] ?? 0) + 1;
        return acc;
      }, {});

    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalCases: rows.length,
        hardFailureCount: hardFailureRows.length,
        softSeamCaseCount: rowsWithSoftSeams.length,
        softSeamSummary,
      },
      rows,
    };

    const markdownLines = [
      "# Frozen Pack Regression Audit",
      "",
      `Generated: ${report.generatedAt}`,
      `Cases: ${report.summary.totalCases}`,
      `Hard failures: ${report.summary.hardFailureCount}`,
      `Cases with soft seams: ${report.summary.softSeamCaseCount}`,
      "",
      "## Summary",
      "",
      "| Case | Subject | Style | Soft Seams | Hard Issues | Fingerprint |",
      "| --- | --- | --- | ---: | ---: | --- |",
      ...rows.map(
        (row) =>
          `| ${row.caseId} | ${row.subjectId} | ${row.readingStyle} | ${row.softSeamHits.length} | ${
            row.missingSections.length + row.grammarCollisions.length + row.bannedPhraseHits.length
          } | ${row.fingerprint} |`,
      ),
      "",
      "## Soft Seam Labels",
      "",
      "| Label | Count |",
      "| --- | ---: |",
      ...Object.entries(softSeamSummary)
        .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
        .map(([label, count]) => `| ${label} | ${count} |`),
      "",
      "## Flagged Cases",
      "",
      ...(rowsWithSoftSeams.length > 0
        ? rowsWithSoftSeams.map((row) => markdownForRow(row))
        : ["No soft seam hits detected in the tracked sections."]),
    ];

    const reportsDir = path.resolve(process.cwd(), "reports");
    fs.mkdirSync(reportsDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    fs.writeFileSync(
      path.join(reportsDir, `frozen-pack-regression-${timestamp}.json`),
      JSON.stringify(report, null, 2),
    );
    fs.writeFileSync(path.join(reportsDir, "frozen-pack-regression-latest.json"), JSON.stringify(report, null, 2));
    fs.writeFileSync(path.join(reportsDir, `frozen-pack-regression-${timestamp}.md`), markdownLines.join("\n"));
    fs.writeFileSync(path.join(reportsDir, "frozen-pack-regression-latest.md"), markdownLines.join("\n"));

    console.log(
      `[frozen-pack-regression] cases=${report.summary.totalCases} hard=${report.summary.hardFailureCount} softCases=${report.summary.softSeamCaseCount}`,
    );

    expect(hardFailureRows).toHaveLength(0);
  });
});
