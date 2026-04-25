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

interface CuratedThemeLensFixture {
  id: string;
  fixture: ReadingHarnessFixture;
  expectedThemeId: ThemeId;
  expectedFingerprint: string;
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

function stableFixtureNonce(id: string): number {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 1000000;
}

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

const CURATED_FIXTURES: CuratedThemeLensFixture[] = [
  {
    id: "community_visibility_deep",
    fixture: {
      seed: "curated-theme-lens-community-visibility",
      question: DEEP_QUESTION_BY_SUBJECT.community,
      subjectId: "community",
      interpretationThemeId: "visibility",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "visibility",
    expectedFingerprint: "577a86ad9856594ab3a4",
  },
  {
    id: "friends_social_gossip_or_hidden_factors_deep",
    fixture: {
      seed: "curated-theme-lens-friends-social-gossip",
      question: DEEP_QUESTION_BY_SUBJECT.friends_social,
      subjectId: "friends_social",
      interpretationThemeId: "gossip_or_hidden_factors",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "gossip_or_hidden_factors",
    expectedFingerprint: "f5da96f115a2f7f0a6c9",
  },
  {
    id: "friends_social_networks_deep",
    fixture: {
      seed: "curated-theme-lens-friends-social-networks",
      question: DEEP_QUESTION_BY_SUBJECT.friends_social,
      subjectId: "friends_social",
      interpretationThemeId: "networks",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "networks",
    expectedFingerprint: "a4fef836c2b6691c67df",
  },
  {
    id: "work_workplace_politics_deep",
    fixture: {
      seed: "curated-theme-lens-work-workplace-politics",
      question: DEEP_QUESTION_BY_SUBJECT.work,
      subjectId: "work",
      interpretationThemeId: "workplace_politics",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "workplace_politics",
    expectedFingerprint: "b25f01f2d889b8c75b79",
  },
  {
    id: "legal_admin_approvals_deep",
    fixture: {
      seed: "curated-theme-lens-legal-admin-approvals",
      question: DEEP_QUESTION_BY_SUBJECT.legal_admin,
      subjectId: "legal_admin",
      interpretationThemeId: "approvals",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "approvals",
    expectedFingerprint: "a3dfa5fa49baaf7f423e",
  },
  {
    id: "purpose_calling_long_term_direction_deep",
    fixture: {
      seed: "curated-theme-lens-purpose-long-term-direction",
      question: DEEP_QUESTION_BY_SUBJECT.purpose_calling,
      subjectId: "purpose_calling",
      interpretationThemeId: "long_term_direction",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "open",
    },
    expectedThemeId: "long_term_direction",
    expectedFingerprint: "17e3ba143a39eb207a33",
  },
  {
    id: "travel_delays_deep",
    fixture: {
      seed: "curated-theme-lens-travel-delays",
      question: DEEP_QUESTION_BY_SUBJECT.travel,
      subjectId: "travel",
      interpretationThemeId: "delays",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "delays",
    expectedFingerprint: "2e3406d22994641c4b56",
  },
  {
    id: "education_applications_deep",
    fixture: {
      seed: "curated-theme-lens-education-applications",
      question: DEEP_QUESTION_BY_SUBJECT.education,
      subjectId: "education",
      interpretationThemeId: "applications",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "applications",
    expectedFingerprint: "c9bd0fc4255923be2dca",
  },
  {
    id: "creative_visibility_deep",
    fixture: {
      seed: "curated-theme-lens-creative-visibility",
      question: DEEP_QUESTION_BY_SUBJECT.creative,
      subjectId: "creative",
      interpretationThemeId: "visibility",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "visibility",
    expectedFingerprint: "6b4c75ba56382aa39ded",
  },
  {
    id: "money_financial_pressure_deep",
    fixture: {
      seed: "curated-theme-lens-money-financial-pressure",
      question: DEEP_QUESTION_BY_SUBJECT.money,
      subjectId: "money",
      interpretationThemeId: "financial_pressure",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "financial_pressure",
    expectedFingerprint: "429de3c356ea81c7f0ee",
  },
  {
    id: "home_family_family_tension_deep",
    fixture: {
      seed: "curated-theme-lens-home-family-tension",
      question: DEEP_QUESTION_BY_SUBJECT.home_family,
      subjectId: "home_family",
      interpretationThemeId: "family_tension",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "family_tension",
    expectedFingerprint: "f0aa57ca97060bbf5d17",
  },
  {
    id: "personal_growth_self_trust_deep",
    fixture: {
      seed: "curated-theme-lens-personal-growth-self-trust",
      question: DEEP_QUESTION_BY_SUBJECT.personal_growth,
      subjectId: "personal_growth",
      interpretationThemeId: "self_trust",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "self_trust",
    expectedFingerprint: "225ae9995b99525d4c4d",
  },
  {
    id: "health_stress_load_deep",
    fixture: {
      seed: "curated-theme-lens-health-stress-load",
      question: DEEP_QUESTION_BY_SUBJECT.health,
      subjectId: "health",
      interpretationThemeId: "stress_load",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "stress_load",
    expectedFingerprint: "8a64e50a44d8623a6086",
  },
  {
    id: "pets_behavior_deep",
    fixture: {
      seed: "curated-theme-lens-pets-behavior",
      question: DEEP_QUESTION_BY_SUBJECT.pets,
      subjectId: "pets",
      interpretationThemeId: "behavior",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "behavior",
    expectedFingerprint: "69a30144c94ba57b9983",
  },
  {
    id: "spiritual_discernment_deep",
    fixture: {
      seed: "curated-theme-lens-spiritual-discernment",
      question: DEEP_QUESTION_BY_SUBJECT.spiritual,
      subjectId: "spiritual",
      interpretationThemeId: "discernment",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "open",
    },
    expectedThemeId: "discernment",
    expectedFingerprint: "9be7b8545b033c13b4be",
  },
  {
    id: "general_reading_clarity_deep",
    fixture: {
      seed: "curated-theme-lens-general-reading-clarity",
      question: DEEP_QUESTION_BY_SUBJECT.general_reading,
      subjectId: "general_reading",
      interpretationThemeId: "clarity",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "clarity",
    expectedFingerprint: "0563599f20b55613ab57",
  },
  {
    id: "love_commitment_deep",
    fixture: {
      seed: "curated-theme-lens-love-commitment",
      question: DEEP_QUESTION_BY_SUBJECT.love,
      subjectId: "love",
      interpretationThemeId: "commitment",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    },
    expectedThemeId: "commitment",
    expectedFingerprint: "93f5da56766aa5232e6a",
  },
];

describe("curated theme-lens fixtures", () => {
  it("keeps the exact community and friends/social theme-lens paths stable", () => {
    const rows = CURATED_FIXTURES.map((entry) => {
      const fixtureNonce = stableFixtureNonce(entry.id);
      const timestampMs = 1763000000000 + fixtureNonce * 1000;
      const state = buildReadingStateFromFixture(entry.fixture, fixtureNonce);
      const reading = composeDeterministicReading(state, timestampMs);
      const sectionIds = reading.sections.map((section) => section.id);
      const fullBody = readingBody(reading);

      expect(reading.themeOverlay?.resolvedThemeId, `${entry.id} resolved theme`).toBe(entry.expectedThemeId);
      expect(sectionIds).toContain("opening-frame");
      expect(sectionIds).toContain("houses-overlay");
      expect(sectionIds.at(-1), `${entry.id} closes with key threads`).toBe("key-threads");
      expect(fullBody.toLowerCase(), `${entry.id} should avoid raw association leaks`).not.toContain("keeps caution, where");
      expect(fullBody.toLowerCase(), `${entry.id} should avoid raw fallback tails`).not.toContain("close to the surface");
      expect(fullBody.toLowerCase(), `${entry.id} should avoid raw key tails`).not.toContain(
        "with solution, certainty, and unlock close to the surface",
      );
      RAW_SYNTHESIS_LABELS.forEach((label) => {
        expect(fullBody.toLowerCase(), `${entry.id} should avoid raw synthesis label: ${label}`).not.toContain(label);
      });

      return {
        id: entry.id,
        subjectId: entry.fixture.subjectId,
        interpretationThemeId: entry.fixture.interpretationThemeId,
        resolvedThemeId: reading.themeOverlay?.resolvedThemeId ?? null,
        expectedFingerprint: entry.expectedFingerprint,
        actualFingerprint: readingFingerprint(reading),
        wordCount: reading.wordCount,
        sectionIds,
        intro: reading.intro,
        conclusion: reading.conclusion,
        body: fullBody,
      };
    });

    const reportsDir = path.resolve(process.cwd(), "reports");
    fs.mkdirSync(reportsDir, { recursive: true });
    fs.writeFileSync(path.join(reportsDir, "theme-lens-curated-latest.json"), JSON.stringify(rows, null, 2));

    rows.forEach((row) => {
      expect(row.actualFingerprint, row.id).toBe(row.expectedFingerprint);
    });
  });
});
