import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { ThemeId } from "@/lib/content/themes";
import type { ReadingHarnessFixture } from "@/tests/helpers/readingHarness";
import {
  buildReadingStateFromFixture,
  composeDeterministicReading,
  readingBody,
  readingFingerprint,
} from "@/tests/helpers/readingHarness";

interface QuickReadabilityFixture {
  id: string;
  fixture: ReadingHarnessFixture;
  expectedThemeId: ThemeId;
}

const RAW_SYNTHESIS_LABELS = [
  "values and love",
  "resources and flow",
  "grace, goodwill, or invitation",
  "clarity and success",
  "clarity and visible progress",
  "support and loyalty",
  "erosion and stress",
  "communication and nerves",
  "your own field",
  "the public field",
  "the public or social field",
  "the meaningful burden",
  "the answer point",
  "incoming movement or news",
  "movement, distance, or transition",
  "closure, ending, or rest",
  "complication or mixed motives",
  "caution and self-interest",
  "obstacle or delay",
  "structure, distance, or institution",
  "repetition and tension",
  "slow growth and rooting",
  "a newly forming situation",
  "heart, value, or feeling",
  "power or resource control",
  "guidance and signal",
  "house house",
] as const;

const QUICK_QUESTION_BY_SUBJECT = {
  general_reading: "What should I understand about this situation right now?",
  love: "What should I understand about this relationship dynamic?",
  community: "What should I understand about my place in this community right now?",
  friends_social: "What should I understand about this friendship or social situation right now?",
  work: "What should I understand about this work situation right now?",
  legal_admin: "What should I understand about this process right now?",
  purpose_calling: "What should I understand about my path right now?",
  travel: "What should I understand about this travel situation right now?",
  education: "What should I understand about this study path right now?",
  creative: "What should I understand about this creative project right now?",
  money: "What should I understand about my financial situation right now?",
  home_family: "What should I understand about this home and family situation right now?",
  personal_growth: "What should I understand about my own growth right now?",
  health: "What should I understand about my wellbeing right now?",
  pets: "What should I understand about my pet right now?",
  spiritual: "What should I understand about this spiritual process right now?",
} as const;

const QUICK_FIXTURES: QuickReadabilityFixture[] = [
  {
    id: "quick_general_reading_decision_gt",
    fixture: {
      seed: "quick-readability-general-reading-decision-gt",
      question: QUICK_QUESTION_BY_SUBJECT.general_reading,
      subjectId: "general_reading",
      interpretationThemeId: "decision",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "quick",
      includeHouses: false,
      significatorMode: "self",
    },
    expectedThemeId: "decision",
  },
  {
    id: "quick_love_communication_gt",
    fixture: {
      seed: "quick-readability-love-communication-gt",
      question: QUICK_QUESTION_BY_SUBJECT.love,
      subjectId: "love",
      interpretationThemeId: "communication",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "quick",
      includeHouses: false,
      significatorMode: "relationship",
    },
    expectedThemeId: "communication",
  },
  {
    id: "quick_work_burnout_gt",
    fixture: {
      seed: "quick-readability-work-burnout-gt",
      question: QUICK_QUESTION_BY_SUBJECT.work,
      subjectId: "work",
      interpretationThemeId: "burnout",
      spreadType: "grand-tableau",
      gtLayout: "4x8+4",
      readingStyle: "quick",
      includeHouses: false,
      significatorMode: "self",
    },
    expectedThemeId: "burnout",
  },
  {
    id: "quick_money_cashflow_gt",
    fixture: {
      seed: "quick-readability-money-cashflow-gt",
      question: QUICK_QUESTION_BY_SUBJECT.money,
      subjectId: "money",
      interpretationThemeId: "cashflow",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "quick",
      includeHouses: false,
      significatorMode: "self",
    },
    expectedThemeId: "cashflow",
  },
  {
    id: "quick_home_family_household_stability_gt",
    fixture: {
      seed: "quick-readability-home-family-household-stability-gt",
      question: QUICK_QUESTION_BY_SUBJECT.home_family,
      subjectId: "home_family",
      interpretationThemeId: "household_stability",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "quick",
      includeHouses: false,
      significatorMode: "self",
    },
    expectedThemeId: "household_stability",
  },
  {
    id: "quick_personal_growth_boundaries_gt",
    fixture: {
      seed: "quick-readability-personal-growth-boundaries-gt",
      question: QUICK_QUESTION_BY_SUBJECT.personal_growth,
      subjectId: "personal_growth",
      interpretationThemeId: "boundaries",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "quick",
      includeHouses: false,
      significatorMode: "self",
    },
    expectedThemeId: "boundaries",
  },
  {
    id: "quick_health_support_three_card",
    fixture: {
      seed: "quick-readability-health-support-3card",
      question: QUICK_QUESTION_BY_SUBJECT.health,
      subjectId: "health",
      interpretationThemeId: "support",
      spreadType: "three-card",
      threeCardMode: "situation-challenge-advice",
      readingStyle: "quick",
      includeHouses: false,
      significatorMode: "self",
    },
    expectedThemeId: "support",
  },
  {
    id: "quick_creative_visibility_three_card",
    fixture: {
      seed: "quick-readability-creative-visibility-3card",
      question: QUICK_QUESTION_BY_SUBJECT.creative,
      subjectId: "creative",
      interpretationThemeId: "visibility",
      spreadType: "three-card",
      threeCardMode: "past-present-future",
      readingStyle: "quick",
      includeHouses: false,
      significatorMode: "self",
    },
    expectedThemeId: "visibility",
  },
];

describe("quick-mode readability pack", () => {
  it("writes a readable quick-mode sample pack and keeps prose clean", () => {
    const rows = QUICK_FIXTURES.map((entry, index) => {
      const state = buildReadingStateFromFixture(entry.fixture, index + 900);
      const reading = composeDeterministicReading(state, 1765000000000 + index * 137);
      const body = readingBody(reading);
      const lower = body.toLowerCase();
      const rawLabelHits = RAW_SYNTHESIS_LABELS.filter((label) => lower.includes(label));

      const quickSections = reading.sections.map((section) => ({
        id: section.id,
        title: section.title,
        body: section.body,
      }));

      return {
        id: entry.id,
        subjectId: entry.fixture.subjectId,
        interpretationThemeId: entry.fixture.interpretationThemeId,
        resolvedThemeId: reading.themeOverlay?.resolvedThemeId ?? null,
        expectedThemeId: entry.expectedThemeId,
        spreadType: entry.fixture.spreadType,
        gtLayout: entry.fixture.gtLayout ?? null,
        fingerprint: readingFingerprint(reading),
        wordCount: reading.wordCount,
        intro: reading.intro,
        rawLabelHits,
        sectionIds: reading.sections.map((section) => section.id),
        sections: quickSections,
        conclusion: reading.conclusion,
        body,
      };
    });

    const reportsDir = path.resolve(process.cwd(), "reports");
    fs.mkdirSync(reportsDir, { recursive: true });
    fs.writeFileSync(
      path.join(reportsDir, "quick-mode-readability-pack-latest.json"),
      JSON.stringify(rows, null, 2),
    );

    const markdown = [
      "# Quick-Mode Readability Pack",
      "",
      "Quick-mode samples for human-read QA.",
      "",
      ...rows.flatMap((row) => [
        `## ${row.id}`,
        "",
        `- subject: \`${row.subjectId}\``,
        `- requested theme: \`${row.interpretationThemeId}\``,
        `- resolved theme: \`${row.resolvedThemeId}\``,
        `- spread: \`${row.spreadType}${row.gtLayout ? ` / ${row.gtLayout}` : ""}\``,
        `- fingerprint: \`${row.fingerprint}\``,
        `- words: \`${row.wordCount}\``,
        "",
        "### Intro",
        "",
        row.intro,
        "",
        "### Sections",
        "",
        ...row.sections.flatMap((section) => [`#### ${section.title}`, "", section.body, ""]),
        "### Conclusion",
        "",
        row.conclusion,
        "",
      ]),
    ].join("\n");

    fs.writeFileSync(path.join(reportsDir, "quick-mode-readability-pack-latest.md"), markdown);

    rows.forEach((row) => {
      expect(row.resolvedThemeId, row.id).toBe(row.expectedThemeId);
      expect(row.rawLabelHits, `${row.id} raw synthesis labels`).toEqual([]);
      expect(row.body, `${row.id} should not leak House House`).not.toMatch(/\bHouse House\b/i);
    });
  });
});
