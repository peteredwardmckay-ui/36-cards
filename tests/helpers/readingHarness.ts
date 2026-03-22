import crypto from "node:crypto";
import { composeReading } from "@/lib/engine/compose";
import { createMulberry32, hashStringToInt } from "@/lib/engine/rng";
import { createReadingState } from "@/lib/state/storage";
import type {
  GTLayout,
  GeneratedReading,
  ReadingState,
  ReadingStyle,
  SignificatorMode,
  SpreadType,
  SubjectId,
  ThreeCardMode,
} from "@/lib/engine/types";

export interface ReadingHarnessFixture {
  question: string;
  subjectId: SubjectId;
  interpretationThemeId: string;
  spreadType: SpreadType;
  gtLayout?: GTLayout;
  threeCardMode?: ThreeCardMode;
  readingStyle?: ReadingStyle;
  includeHouses?: boolean;
  themeId?: string;
  significatorMode?: SignificatorMode;
  seed: string;
}

export function buildSeededDeck(seedMaterial: string): number[] {
  const rng = createMulberry32(hashStringToInt(seedMaterial));
  const deck = Array.from({ length: 36 }, (_, index) => index + 1);
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = rng.nextInt(0, i);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function buildReadingStateFromFixture(input: ReadingHarnessFixture, index = 0): ReadingState {
  const base = createReadingState({
    question: input.question,
    subjectId: input.subjectId,
    interpretationThemeId: input.interpretationThemeId,
    readingStyle: input.readingStyle ?? "quick",
    includeHouses: input.includeHouses ?? false,
    spreadType: input.spreadType,
    gtLayout: input.gtLayout ?? "4x9",
    threeCardMode: input.threeCardMode ?? "past-present-future",
    themeId: input.themeId ?? "botanical-engraving",
    significatorMode: input.significatorMode ?? "self",
  });

  const createdAt = 1760000000000 + index * 60000;
  const cardCount = input.spreadType === "grand-tableau" ? 36 : 3;
  const deck = buildSeededDeck(`${input.seed}|${index}|${input.spreadType}|${input.gtLayout ?? "4x9"}`);
  const layout = deck.slice(0, cardCount);

  return {
    ...base,
    id: `fixture-${input.seed}-${index}`,
    createdAt,
    stage: "results",
    setup: {
      ...base.setup,
      question: input.question,
      subjectId: input.subjectId,
      interpretationThemeId: input.interpretationThemeId,
      spreadType: input.spreadType,
      gtLayout: input.gtLayout ?? "4x9",
      threeCardMode: input.threeCardMode ?? "past-present-future",
      readingStyle: input.readingStyle ?? "quick",
      includeHouses: input.includeHouses ?? false,
      themeId: input.themeId ?? "botanical-engraving",
      significatorMode: input.significatorMode ?? "self",
    },
    ritual: {
      ...base.ritual,
      intensity: 5,
      interactionTrace: [createdAt + 11, createdAt + 19],
      shuffleRun: null,
      cutStep: null,
      locked: true,
    },
    deck,
    layout,
    revealMap: Array.from({ length: cardCount }, () => true),
    selectedCardPosition: 1,
    reading: null,
  };
}

function withFixedNow<T>(timestampMs: number, fn: () => T): T {
  const originalNow = Date.now;
  Date.now = () => timestampMs;
  try {
    return fn();
  } finally {
    Date.now = originalNow;
  }
}

export function composeDeterministicReading(state: ReadingState, timestampMs: number): GeneratedReading {
  return withFixedNow(timestampMs, () => composeReading(state));
}

export function readingFingerprint(reading: GeneratedReading): string {
  const canonical = JSON.stringify({
    intro: reading.intro,
    sections: reading.sections.map((section) => ({
      id: section.id,
      title: section.title,
      body: section.body,
      technique: section.technique,
    })),
    conclusion: reading.conclusion,
    disclaimer: reading.disclaimer,
    wordCount: reading.wordCount,
    theme: reading.themeOverlay?.resolvedThemeId ?? null,
    mode: reading.themeOverlay?.mode ?? null,
  });

  return crypto.createHash("sha256").update(canonical).digest("hex").slice(0, 20);
}

export function readingBody(reading: GeneratedReading): string {
  return [reading.intro, ...reading.sections.map((section) => section.body), reading.conclusion]
    .join("\n\n")
    .trim();
}
