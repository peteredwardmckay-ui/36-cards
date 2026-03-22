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

interface ReadabilityFixture {
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

const DEEP_QUESTION_BY_SUBJECT = {
  general_reading: "Where is the real pressure in this situation, and what is beginning to move?",
  love: "Where is the real pressure in this relationship, and what is beginning to move?",
  community: "Where is the real pressure in this community field, and what is beginning to move?",
  friends_social: "Where is the real pressure in my friendships and social world, and what is beginning to move?",
  work: "Where is the real pressure at work, and what is beginning to move?",
  legal_admin: "Where is the real pressure in this formal process, and what is beginning to move?",
  purpose_calling: "Where is the real pressure in my calling path, and what is beginning to move?",
  travel: "Where is the real pressure in this travel situation, and what is beginning to move?",
  education: "Where is the real pressure in this education situation, and what is beginning to move?",
  creative: "Where is the real pressure in my creative work, and what is beginning to move?",
  money: "Where is the real pressure in my finances, and what is beginning to move?",
  home_family: "Where is the real pressure in my home and family life, and what is beginning to move?",
  personal_growth: "Where is the real pressure in my personal growth, and what is beginning to move?",
  health: "Where is the real pressure in my wellbeing and energy, and what is beginning to move?",
  pets: "Where is the real pressure around my pet, and what is beginning to move?",
  spiritual: "Where is the real pressure in this spiritual process, and what is beginning to move?",
} as const;

const READABILITY_FIXTURES: ReadabilityFixture[] = [
  {
    id: "general_reading_hidden_factors_deep",
    fixture: {
      seed: "readability-general-reading-hidden-factors",
      question: DEEP_QUESTION_BY_SUBJECT.general_reading,
      subjectId: "general_reading",
      interpretationThemeId: "hidden_factors",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "hidden_factors",
  },
  {
    id: "love_trust_deep",
    fixture: {
      seed: "readability-love-trust",
      question: DEEP_QUESTION_BY_SUBJECT.love,
      subjectId: "love",
      interpretationThemeId: "trust",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "relationship",
    },
    expectedThemeId: "trust",
  },
  {
    id: "community_collective_support_deep",
    fixture: {
      seed: "readability-community-collective-support",
      question: DEEP_QUESTION_BY_SUBJECT.community,
      subjectId: "community",
      interpretationThemeId: "collective_support",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "collective_support",
  },
  {
    id: "friends_social_belonging_deep",
    fixture: {
      seed: "readability-friends-social-belonging",
      question: DEEP_QUESTION_BY_SUBJECT.friends_social,
      subjectId: "friends_social",
      interpretationThemeId: "belonging",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "belonging",
  },
  {
    id: "work_burnout_deep",
    fixture: {
      seed: "readability-work-burnout",
      question: DEEP_QUESTION_BY_SUBJECT.work,
      subjectId: "work",
      interpretationThemeId: "burnout",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "burnout",
  },
  {
    id: "legal_admin_bureaucracy_deep",
    fixture: {
      seed: "readability-legal-admin-bureaucracy",
      question: DEEP_QUESTION_BY_SUBJECT.legal_admin,
      subjectId: "legal_admin",
      interpretationThemeId: "bureaucracy",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "bureaucracy",
  },
  {
    id: "purpose_calling_alignment_deep",
    fixture: {
      seed: "readability-purpose-calling-alignment",
      question: DEEP_QUESTION_BY_SUBJECT.purpose_calling,
      subjectId: "purpose_calling",
      interpretationThemeId: "alignment",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "open",
    },
    expectedThemeId: "alignment",
  },
  {
    id: "travel_documents_deep",
    fixture: {
      seed: "readability-travel-documents",
      question: DEEP_QUESTION_BY_SUBJECT.travel,
      subjectId: "travel",
      interpretationThemeId: "documents",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "documents",
  },
  {
    id: "education_mentorship_deep",
    fixture: {
      seed: "readability-education-mentorship",
      question: DEEP_QUESTION_BY_SUBJECT.education,
      subjectId: "education",
      interpretationThemeId: "mentorship",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "mentorship",
  },
  {
    id: "creative_momentum_deep",
    fixture: {
      seed: "readability-creative-momentum",
      question: DEEP_QUESTION_BY_SUBJECT.creative,
      subjectId: "creative",
      interpretationThemeId: "momentum",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "momentum",
  },
  {
    id: "money_cashflow_deep",
    fixture: {
      seed: "readability-money-cashflow",
      question: DEEP_QUESTION_BY_SUBJECT.money,
      subjectId: "money",
      interpretationThemeId: "cashflow",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "cashflow",
  },
  {
    id: "home_family_caregiving_deep",
    fixture: {
      seed: "readability-home-family-caregiving",
      question: DEEP_QUESTION_BY_SUBJECT.home_family,
      subjectId: "home_family",
      interpretationThemeId: "caregiving",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "caregiving",
  },
  {
    id: "personal_growth_healing_deep",
    fixture: {
      seed: "readability-personal-growth-healing",
      question: DEEP_QUESTION_BY_SUBJECT.personal_growth,
      subjectId: "personal_growth",
      interpretationThemeId: "healing",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "healing",
  },
  {
    id: "health_recovery_deep",
    fixture: {
      seed: "readability-health-recovery",
      question: DEEP_QUESTION_BY_SUBJECT.health,
      subjectId: "health",
      interpretationThemeId: "recovery",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "recovery",
  },
  {
    id: "pets_comfort_deep",
    fixture: {
      seed: "readability-pets-comfort",
      question: DEEP_QUESTION_BY_SUBJECT.pets,
      subjectId: "pets",
      interpretationThemeId: "comfort",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "comfort",
  },
  {
    id: "spiritual_alignment_deep",
    fixture: {
      seed: "readability-spiritual-alignment",
      question: DEEP_QUESTION_BY_SUBJECT.spiritual,
      subjectId: "spiritual",
      interpretationThemeId: "alignment",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "open",
    },
    expectedThemeId: "alignment",
  },
];

describe("theme-lens readability pack", () => {
  it("writes a readable non-curated sample pack and keeps the prose layer clean", () => {
    const rows = READABILITY_FIXTURES.map((entry, index) => {
      const state = buildReadingStateFromFixture(entry.fixture, index + 500);
      const reading = composeDeterministicReading(state, 1764000000000 + index * 137);
      const body = readingBody(reading);
      const lower = body.toLowerCase();
      const rawLabelHits = RAW_SYNTHESIS_LABELS.filter((label) => lower.includes(label));
      const openingFrame = reading.sections.find((section) => section.id === "opening-frame")?.body ?? "";
      const center = reading.sections.find((section) => section.id === "center-significator")?.body ?? "";

      return {
        id: entry.id,
        subjectId: entry.fixture.subjectId,
        interpretationThemeId: entry.fixture.interpretationThemeId,
        resolvedThemeId: reading.themeOverlay?.resolvedThemeId ?? null,
        fingerprint: readingFingerprint(reading),
        wordCount: reading.wordCount,
        expectedThemeId: entry.expectedThemeId,
        rawLabelHits,
        intro: reading.intro,
        openingFrame,
        center,
        conclusion: reading.conclusion,
        body,
      };
    });

    const reportsDir = path.resolve(process.cwd(), "reports");
    fs.mkdirSync(reportsDir, { recursive: true });
    fs.writeFileSync(
      path.join(reportsDir, "theme-lens-readability-pack-latest.json"),
      JSON.stringify(rows, null, 2),
    );

    const markdown = [
      "# Theme-Lens Readability Pack",
      "",
      "Non-curated deep-dive samples for human-read QA.",
      "",
      ...rows.flatMap((row) => [
        `## ${row.id}`,
        "",
        `- subject: \`${row.subjectId}\``,
        `- requested theme: \`${row.interpretationThemeId}\``,
        `- resolved theme: \`${row.resolvedThemeId}\``,
        `- fingerprint: \`${row.fingerprint}\``,
        `- words: \`${row.wordCount}\``,
        "",
        "### Intro",
        "",
        row.intro,
        "",
        "### Opening Frame",
        "",
        row.openingFrame,
        "",
        "### Center / Significator Focus",
        "",
        row.center,
        "",
        "### Conclusion",
        "",
        row.conclusion,
        "",
      ]),
    ].join("\n");

    fs.writeFileSync(path.join(reportsDir, "theme-lens-readability-pack-latest.md"), markdown);

    rows.forEach((row) => {
      expect(row.resolvedThemeId, row.id).toBe(row.expectedThemeId);
      expect(row.rawLabelHits, `${row.id} raw synthesis labels`).toEqual([]);
      expect(row.body, `${row.id} should not leak House House`).not.toMatch(/\bHouse House\b/i);
    });
  });
});
