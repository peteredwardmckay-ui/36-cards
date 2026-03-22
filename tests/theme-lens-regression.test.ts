import { describe, expect, it } from "vitest";
import type { SubjectId } from "@/lib/engine/types";
import {
  buildReadingStateFromFixture,
  composeDeterministicReading,
  readingBody,
  type ReadingHarnessFixture,
} from "@/tests/helpers/readingHarness";

const CASES_PER_STYLE = 24;

const GENERIC_RAW_SYNTHESIS_LABELS = [
  "values and love",
  "resources and flow",
  "grace, goodwill, or invitation",
  "clarity and success",
  "clarity and visible progress",
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

const SUBJECT_FIXTURES: Record<"community" | "friends_social", { quickQuestion: string; deepQuestion: string }> = {
  community: {
    quickQuestion: "What is the real shape of my place in this community over the next three months?",
    deepQuestion: "Where is the real pressure in this community field, and what is beginning to move?",
  },
  friends_social: {
    quickQuestion: "What is the real shape of my friendships and social world over the next three months?",
    deepQuestion: "Where is the real pressure in my friendships and social world, and what is beginning to move?",
  },
};

const FORBIDDEN_SUBSTRINGS: Record<"community" | "friends_social", string[]> = {
  community: [
    "guidance and signal in clarity and success",
    "mixed motives and defensive positioning complicating the wider field",
    "your place in the wider field being met with more welcome, goodwill, or receptivity",
    "your place in the wider field finding steadier footing that can actually hold",
    "with solution, certainty, and unlock close to the surface",
    "keeps caution, where",
  ],
  friends_social: [
    "documents and messages under clarity and success",
    "emotional weather or recognition under fog or uncertainty",
    "nervous communication moving through what is hidden",
    "the public or social field moving through fog or uncertainty",
    "your own social position becoming more visible in the group field",
    "more room beginning to open around your own social position",
    "your own social position gaining more room to move",
    "obstacle or delay in obstruction",
    "heart + ring emphasizes value-based commitment.",
    "keeps caution, where",
    "with solution, certainty, and unlock close to the surface",
  ],
};

function buildFixtures(subjectId: "community" | "friends_social"): ReadingHarnessFixture[] {
  const config = SUBJECT_FIXTURES[subjectId];
  const fixtures: ReadingHarnessFixture[] = [];

  for (let index = 0; index < CASES_PER_STYLE; index += 1) {
    fixtures.push({
      seed: `theme-lens-${subjectId}-quick-${index}`,
      question: config.quickQuestion,
      subjectId: subjectId as SubjectId,
      interpretationThemeId: "auto",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "quick",
      includeHouses: false,
      significatorMode: "self",
    });

    fixtures.push({
      seed: `theme-lens-${subjectId}-deep-${index}`,
      question: config.deepQuestion,
      subjectId: subjectId as SubjectId,
      interpretationThemeId: "auto",
      spreadType: "grand-tableau",
      gtLayout: "4x9",
      readingStyle: "deep_dive",
      includeHouses: true,
      significatorMode: "self",
    });
  }

  return fixtures;
}

function renderBodies(subjectId: "community" | "friends_social"): string[] {
  return buildFixtures(subjectId).map((fixture, index) => {
    const state = buildReadingStateFromFixture(fixture, index);
    const reading = composeDeterministicReading(state, state.createdAt);
    return readingBody(reading).toLowerCase();
  });
}

describe("theme-lens regression coverage", () => {
  it("keeps known community synthesis artifacts out of rendered output", () => {
    const bodies = renderBodies("community");

    FORBIDDEN_SUBSTRINGS.community.forEach((snippet) => {
      const normalized = snippet.toLowerCase();
      const hit = bodies.find((body) => body.includes(normalized));
      expect(hit, `Unexpected community regression phrase: ${snippet}`).toBeUndefined();
    });

    GENERIC_RAW_SYNTHESIS_LABELS.forEach((snippet) => {
      const hit = bodies.find((body) => body.includes(snippet));
      expect(hit, `Unexpected raw synthesis label in community output: ${snippet}`).toBeUndefined();
    });
  });

  it("keeps known friends/social synthesis artifacts out of rendered output", () => {
    const bodies = renderBodies("friends_social");

    FORBIDDEN_SUBSTRINGS.friends_social.forEach((snippet) => {
      const normalized = snippet.toLowerCase();
      const hit = bodies.find((body) => body.includes(normalized));
      expect(hit, `Unexpected friends/social regression phrase: ${snippet}`).toBeUndefined();
    });

    GENERIC_RAW_SYNTHESIS_LABELS.forEach((snippet) => {
      const hit = bodies.find((body) => body.includes(snippet));
      expect(hit, `Unexpected raw synthesis label in friends/social output: ${snippet}`).toBeUndefined();
    });
  });
});
