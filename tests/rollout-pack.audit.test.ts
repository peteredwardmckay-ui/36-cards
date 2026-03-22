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

interface RolloutSubjectSweep {
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

const ROLLOUT_SUBJECT_SWEEP: Record<string, RolloutSubjectSweep> = {
  friends_social: {
    subjectId: "friends_social",
    significatorMode: "self",
    quickQuestion: "What is the real shape of my friendships and social world over the next three months?",
    deepQuestion: "Where is the real pressure in my friendships and social world, and what is beginning to move?",
  },
  pets: {
    subjectId: "pets",
    significatorMode: "self",
    quickQuestion: "What is the real shape of this animal care situation over the next three months?",
    deepQuestion: "Where is the real pressure in caring for this animal, and what is beginning to move?",
  },
  spiritual: {
    subjectId: "spiritual",
    significatorMode: "self",
    quickQuestion: "What is the real shape of this spiritual path over the next three months?",
    deepQuestion: "Where is the real pressure in this spiritual path, and what is beginning to move?",
  },
  community: {
    subjectId: "community",
    significatorMode: "self",
    quickQuestion: "What is the real shape of my place in this community over the next three months?",
    deepQuestion: "Where is the real pressure in this community field, and what is beginning to move?",
  },
};

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

function readActiveRolloutSubjectId(): SubjectId {
  const requestedSubjectId = process.env.ROLLOUT_SUBJECT_ID;
  if (requestedSubjectId) {
    if (!(requestedSubjectId in ROLLOUT_SUBJECT_SWEEP)) {
      throw new Error(`Unknown rollout subject "${requestedSubjectId}" from ROLLOUT_SUBJECT_ID`);
    }
    return requestedSubjectId as SubjectId;
  }

  const todoPath = path.join(process.cwd(), "TODO.md");
  const todo = fs.readFileSync(todoPath, "utf8");
  const match = todo.match(/^- Active pack:\s*([a-z_]+)\s*$/m);
  const subjectId = match?.[1] ?? "friends_social";
  if (!(subjectId in ROLLOUT_SUBJECT_SWEEP)) {
    throw new Error(`Unknown active rollout pack "${subjectId}" in ${todoPath}`);
  }
  return subjectId as SubjectId;
}

function buildSweepFixtures(subject: RolloutSubjectSweep): ReadingHarnessFixture[] {
  return [
    {
      seed: `rollout-${subject.subjectId}-quick`,
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
      seed: `rollout-${subject.subjectId}-deep`,
      question: subject.deepQuestion,
      subjectId: subject.subjectId,
      interpretationThemeId: "auto",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: subject.significatorMode,
    },
  ];
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

function writeReport(rows: AuditRow[]): void {
  const reportsDir = path.join(process.cwd(), "reports");
  fs.mkdirSync(reportsDir, { recursive: true });

  const hardFailures = rows.filter(
    (row) =>
      row.missingSections.length > 0 ||
      row.grammarCollisions.length > 0 ||
      row.bannedPhraseHits.length > 0,
  );
  const softCases = rows.filter((row) => row.softSeamHits.length > 0);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  const markdown = [
    "# Rollout Pack Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Cases: ${rows.length}`,
    `Hard failures: ${hardFailures.length}`,
    `Cases with soft seams: ${softCases.length}`,
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
    ...Array.from(
      rows
        .flatMap((row) => row.softSeamHits.map((hit) => hit.label))
        .reduce((map, label) => map.set(label, (map.get(label) ?? 0) + 1), new Map<string, number>())
        .entries(),
    )
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([label, count]) => `| ${label} | ${count} |`),
    "",
    "## Flagged Cases",
    "",
    ...(softCases.length > 0 ? softCases.map((row) => markdownForRow(row)).flat() : ["No soft seams detected.", ""]),
  ].join("\n");

  const json = JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      cases: rows.length,
      hardFailures: hardFailures.length,
      softCases: softCases.length,
      rows,
    },
    null,
    2,
  );

  fs.writeFileSync(path.join(reportsDir, "rollout-pack-regression-latest.md"), markdown);
  fs.writeFileSync(path.join(reportsDir, "rollout-pack-regression-latest.json"), json);
  fs.writeFileSync(path.join(reportsDir, `rollout-pack-regression-${timestamp}.md`), markdown);
  fs.writeFileSync(path.join(reportsDir, `rollout-pack-regression-${timestamp}.json`), json);
}

describe("rollout pack audit", () => {
  it("writes a targeted audit for the active rollout pack and preserves hard quality bars", () => {
    const activeSubjectId = readActiveRolloutSubjectId();
    const subject = ROLLOUT_SUBJECT_SWEEP[activeSubjectId];
    const rows = buildSweepFixtures(subject).map((fixture, index) => {
      const state = buildReadingStateFromFixture(fixture, index);
      const reading = composeDeterministicReading(state, state.createdAt);
      const body = readingBody(reading);

      const row: AuditRow = {
        caseId: fixture.seed,
        subjectId: fixture.subjectId,
        readingStyle: fixture.readingStyle ?? "quick",
        fingerprint: readingFingerprint(reading),
        wordCount: reading.wordCount,
        sectionIds: reading.sections.map((section) => section.id),
        missingSections: missingSections(reading, fixture.readingStyle ?? "quick"),
        grammarCollisions: collectPatternMatches(body, /\bto to\b|\bthe the\b|\bis central is central\b|\bare central is central\b/gi),
        bannedPhraseHits: collectHits(body, BANNED_PHRASE_PATTERNS).flatMap((hit) => hit.matches),
        softSeamHits: collectHits(body, SOFT_SEAM_PATTERNS),
        sections: extractSections(reading, fixture.readingStyle ?? "quick"),
      };

      return row;
    });

    writeReport(rows);

    const hardFailures = rows.filter(
      (row) =>
        row.missingSections.length > 0 ||
        row.grammarCollisions.length > 0 ||
        row.bannedPhraseHits.length > 0,
    );

    const grammarLabels = collectHits(
      rows.map((row) => [row.sections.centerFocus, row.sections.houses, row.sections.nearbyPair, row.sections.synthesis, row.sections.conclusion].filter(Boolean).join(" ")).join(" "),
      GRAMMAR_COLLISION_PATTERNS,
    );
    const bannedLabels = collectHits(
      rows.map((row) => [row.sections.centerFocus, row.sections.houses, row.sections.nearbyPair, row.sections.synthesis, row.sections.conclusion].filter(Boolean).join(" ")).join(" "),
      BANNED_PHRASE_PATTERNS,
    );

    expect(hardFailures, `hard failures present in active rollout pack ${activeSubjectId}`).toHaveLength(0);
    expect(grammarLabels, `grammar collisions detected in active rollout pack ${activeSubjectId}`).toHaveLength(0);
    expect(bannedLabels, `banned debug phrases detected in active rollout pack ${activeSubjectId}`).toHaveLength(0);

    // eslint-disable-next-line no-console
    console.log(
      `[rollout-pack-audit] subject=${activeSubjectId} cases=${rows.length} hard=0 softCases=${
        rows.filter((row) => row.softSeamHits.length > 0).length
      }`,
    );
  });
});
