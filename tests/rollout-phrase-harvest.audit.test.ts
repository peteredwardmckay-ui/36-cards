import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildGrandTableauLayout, findCardPosition } from "@/lib/engine/gt";
import { createMulberry32, hashStringToInt } from "@/lib/engine/rng";
import { synthesizeGrandTableauNarrative } from "@/lib/engine/tableauSynthesis";
import type { Domain, GTLayout, ReadingStyle, SignificatorMode, SubjectId } from "@/lib/engine/types";
import {
  buildReadingStateFromFixture,
  type ReadingHarnessFixture,
} from "@/tests/helpers/readingHarness";

interface RolloutSubjectSweep {
  subjectId: SubjectId;
  significatorMode: SignificatorMode;
  quickQuestion: string;
  deepQuestion: string;
}

interface HarvestFinding {
  phrase: string;
  label: "opening" | "pressure";
  caseId: string;
  subjectId: SubjectId;
  readingStyle: ReadingStyle;
  focusCardId: number;
  focusPosition: number;
  gtLayout: GTLayout;
  suspicious: boolean;
}

interface PhraseAggregate {
  phrase: string;
  label: "opening" | "pressure";
  count: number;
  suspicious: boolean;
  examples: HarvestFinding[];
}

const requestedHarvestCasesPerStyle = Number.parseInt(process.env.HARVEST_CASES_PER_STYLE ?? "48", 10);
const HARVEST_CASES_PER_STYLE = Number.isFinite(requestedHarvestCasesPerStyle) && requestedHarvestCasesPerStyle > 0
  ? requestedHarvestCasesPerStyle
  : 48;
const MAX_EXAMPLES_PER_PHRASE = 5;

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

const KNOWN_GOOD_PHRASES = new Set([
  "reliable support beginning to show itself more clearly",
]);

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

function buildHarvestFixtures(subject: RolloutSubjectSweep): ReadingHarnessFixture[] {
  const fixtures: ReadingHarnessFixture[] = [];

  for (let index = 0; index < HARVEST_CASES_PER_STYLE; index += 1) {
    fixtures.push({
      seed: `harvest-${subject.subjectId}-quick-${index}`,
      question: subject.quickQuestion,
      subjectId: subject.subjectId,
      interpretationThemeId: "auto",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "quick",
      includeHouses: false,
      significatorMode: subject.significatorMode,
    });

    fixtures.push({
      seed: `harvest-${subject.subjectId}-deep-${index}`,
      question: subject.deepQuestion,
      subjectId: subject.subjectId,
      interpretationThemeId: "auto",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: subject.significatorMode,
    });
  }

  return fixtures;
}

function narrativeMeaningDomain(subjectId: SubjectId): Domain {
  if (subjectId === "love") return "love";
  if (subjectId === "work") return "work";
  return "general";
}

function inferSignificatorCard(
  layout: ReturnType<typeof buildGrandTableauLayout>,
  mode: SignificatorMode,
): number {
  const querentPos = findCardPosition(layout, 29);
  const counterpartPos = findCardPosition(layout, 28);

  if (mode === "other") return 28;
  if (mode === "relationship") return 29;
  if (mode === "open") {
    if (querentPos && counterpartPos && counterpartPos < querentPos) {
      return 28;
    }
  }
  return 29;
}

function normalizeBulletPhrase(input: string): string {
  return input
    .replace(/^What helps most is\s+/i, "")
    .replace(/^The main strain is\s+/i, "")
    .trim();
}

function isSuspiciousPhrase(phrase: string): boolean {
  const normalized = phrase.toLowerCase();
  if (KNOWN_GOOD_PHRASES.has(normalized)) {
    return false;
  }
  return SUSPICIOUS_PHRASE_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function collectFindings(fixture: ReadingHarnessFixture, index: number): HarvestFinding[] {
  const state = buildReadingStateFromFixture(fixture, index);
  const gtLayout = state.setup.gtLayout ?? "4x9";
  const layout = buildGrandTableauLayout(state.layout, gtLayout);
  const focusCardId = inferSignificatorCard(layout, state.setup.significatorMode ?? "self");
  const focusPosition = findCardPosition(layout, focusCardId) ?? 1;
  const meaningDomain = narrativeMeaningDomain(fixture.subjectId);
  const rng = createMulberry32(
    hashStringToInt(
      [
        "phrase-harvest",
        fixture.seed,
        fixture.readingStyle ?? "quick",
        focusCardId,
        focusPosition,
        state.layout.join(","),
      ].join("|"),
    ),
  );

  const synthesis = synthesizeGrandTableauNarrative({
    layout,
    focusPosition,
    gtLayout,
    subjectId: fixture.subjectId,
    domain: meaningDomain,
    random: rng.next,
  });

  return [
    {
      bullet: synthesis.openingBullet,
      label: "opening" as const,
    },
    {
      bullet: synthesis.pressureBullet,
      label: "pressure" as const,
    },
  ]
    .filter((item): item is { bullet: string; label: "opening" | "pressure" } => Boolean(item.bullet))
    .map((item) => {
      const phrase = normalizeBulletPhrase(item.bullet);
      return {
        phrase,
        label: item.label,
        caseId: fixture.seed,
        subjectId: fixture.subjectId,
        readingStyle: fixture.readingStyle ?? "quick",
        focusCardId,
        focusPosition,
        gtLayout,
        suspicious: isSuspiciousPhrase(phrase),
      };
    });
}

function aggregateFindings(findings: HarvestFinding[]): PhraseAggregate[] {
  const byPhrase = new Map<string, PhraseAggregate>();

  findings.forEach((finding) => {
    const key = `${finding.label}::${finding.phrase.toLowerCase()}`;
    const existing = byPhrase.get(key);
    if (existing) {
      existing.count += 1;
      if (existing.examples.length < MAX_EXAMPLES_PER_PHRASE) {
        existing.examples.push(finding);
      }
      return;
    }

    byPhrase.set(key, {
      phrase: finding.phrase,
      label: finding.label,
      count: 1,
      suspicious: finding.suspicious,
      examples: [finding],
    });
  });

  return Array.from(byPhrase.values()).sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }
    if (left.label !== right.label) {
      return left.label.localeCompare(right.label);
    }
    return left.phrase.localeCompare(right.phrase);
  });
}

function writeHarvestReport(subjectId: SubjectId, totalCases: number, aggregates: PhraseAggregate[]): void {
  const reportsDir = path.join(process.cwd(), "reports");
  fs.mkdirSync(reportsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const totalFindings = aggregates.reduce((sum, aggregate) => sum + aggregate.count, 0);
  const suspiciousAggregates = aggregates.filter((aggregate) => aggregate.suspicious);
  const suspiciousFindings = suspiciousAggregates.reduce((sum, aggregate) => sum + aggregate.count, 0);

  const markdown = [
    "# Rollout Phrase Harvest",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Subject: ${subjectId}`,
    `Cases: ${totalCases}`,
    `Phrase hits: ${totalFindings}`,
    `Unique phrases: ${aggregates.length}`,
    `Suspicious hits: ${suspiciousFindings}`,
    `Suspicious phrases: ${suspiciousAggregates.length}`,
    "",
    "## Suspect Phrases",
    "",
    "| Phrase | Label | Count |",
    "| --- | --- | ---: |",
    ...(suspiciousAggregates.length > 0
      ? suspiciousAggregates.map((aggregate) => `| ${aggregate.phrase} | ${aggregate.label} | ${aggregate.count} |`)
      : ["| None detected | none | 0 |"]),
    "",
    "## All Phrases",
    "",
    "| Phrase | Label | Count | Suspicious |",
    "| --- | --- | ---: | --- |",
    ...(aggregates.length > 0
      ? aggregates.map((aggregate) => `| ${aggregate.phrase} | ${aggregate.label} | ${aggregate.count} | ${aggregate.suspicious ? "yes" : "no"} |`)
      : ["| None detected | none | 0 | no |"]),
    "",
    "## Phrase Samples",
    "",
    ...(aggregates.length > 0
      ? aggregates.flatMap((aggregate) => [
          `### ${aggregate.phrase}`,
          `- Label: \`${aggregate.label}\``,
          `- Count: ${aggregate.count}`,
          `- Suspicious: ${aggregate.suspicious ? "yes" : "no"}`,
          ...aggregate.examples.map(
            (example) =>
              `- Example: \`${example.caseId}\` | ${example.readingStyle} | focus card ${example.focusCardId} @ position ${example.focusPosition} (${example.gtLayout})`,
          ),
          "",
        ])
      : ["No suspect phrase samples found.", ""]),
  ].join("\n");

  const json = JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      subjectId,
      totalCases,
      totalFindings,
      totalUniquePhrases: aggregates.length,
      suspiciousFindings,
      suspiciousUniquePhrases: suspiciousAggregates.length,
      aggregates,
    },
    null,
    2,
  );

  const latestMarkdownPath = path.join(reportsDir, "rollout-phrase-harvest-latest.md");
  const latestJsonPath = path.join(reportsDir, "rollout-phrase-harvest-latest.json");
  const datedMarkdownPath = path.join(reportsDir, `rollout-phrase-harvest-${timestamp}.md`);
  const datedJsonPath = path.join(reportsDir, `rollout-phrase-harvest-${timestamp}.json`);

  fs.writeFileSync(latestMarkdownPath, markdown);
  fs.writeFileSync(latestJsonPath, json);
  fs.writeFileSync(datedMarkdownPath, markdown);
  fs.writeFileSync(datedJsonPath, json);
}

describe("rollout phrase harvest audit", () => {
  it("collects direct synthesis phrase inventory for the active rollout pack", () => {
    const subjectId = readActiveRolloutSubjectId();
    const subject = ROLLOUT_SUBJECT_SWEEP[subjectId];
    const fixtures = buildHarvestFixtures(subject);
    const findings = fixtures.flatMap((fixture, index) => collectFindings(fixture, index));
    const aggregates = aggregateFindings(findings);

    writeHarvestReport(subjectId, fixtures.length, aggregates);

    // We always want a report written, even when the suspicious list is empty.
    expect(aggregates.length).toBeGreaterThan(0);

    // Keep the audit visible in CI output without failing on residual phrase inventory.
    // eslint-disable-next-line no-console
    console.log(
      `[rollout-phrase-harvest] subject=${subjectId} cases=${fixtures.length} hits=${findings.length} unique=${aggregates.length} suspicious=${aggregates.filter((aggregate) => aggregate.suspicious).length}`,
    );
  });
});
