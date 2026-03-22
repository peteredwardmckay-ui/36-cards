import { getFullDeck, normalizeRiffleIntensity } from "@/lib/engine/shuffle";
import { isPublicSubjectId, normalizePublicThemeSelection } from "@/lib/content/publicSetupTaxonomy";
import type {
  ReadingState,
  ReadingStyle,
  SetupState,
  SpreadType,
  GTLayout,
  ThreeCardMode,
  SignificatorMode,
  SubjectId,
} from "@/lib/engine/types";

export const READING_STORAGE_KEY = "lenormand-atlas-reading-v1";

export interface SetupInput {
  question: string;
  subjectId: SubjectId;
  interpretationThemeId: string;
  readingStyle: ReadingStyle;
  includeHouses: boolean;
  spreadType: SpreadType;
  gtLayout?: GTLayout;
  threeCardMode: ThreeCardMode;
  themeId: string;
  significatorMode: SignificatorMode;
}

export function getSpreadCardCount(spreadType: SpreadType): number {
  return spreadType === "grand-tableau" ? 36 : 3;
}

export function buildSetupState(input: SetupInput): SetupState {
  return {
    question: input.question.trim(),
    subjectId: input.subjectId,
    interpretationThemeId: normalizePublicThemeSelection(input.subjectId, input.interpretationThemeId),
    readingStyle: input.readingStyle,
    includeHouses: input.includeHouses,
    spreadType: input.spreadType,
    gtLayout: input.gtLayout === "4x8+4" ? "4x8+4" : "4x9",
    threeCardMode: input.threeCardMode,
    themeId: input.themeId,
    significatorMode: input.significatorMode,
  };
}

function normalizeSetupState(raw: Partial<SetupState> | undefined): SetupState {
  const subjectId = isPublicSubjectId(String(raw?.subjectId ?? "")) ? (raw?.subjectId as SubjectId) : "general_reading";

  return {
    question: typeof raw?.question === "string" ? raw.question : "",
    subjectId,
    interpretationThemeId: normalizePublicThemeSelection(
      subjectId,
      typeof raw?.interpretationThemeId === "string" ? raw.interpretationThemeId : "auto",
    ),
    readingStyle: raw?.readingStyle === "deep_dive" ? "deep_dive" : "quick",
    includeHouses: raw?.includeHouses === true,
    spreadType: raw?.spreadType === "three-card" ? "three-card" : "grand-tableau",
    gtLayout: raw?.gtLayout === "4x8+4" ? "4x8+4" : "4x9",
    threeCardMode:
      raw?.threeCardMode === "situation-challenge-advice" ? "situation-challenge-advice" : "past-present-future",
    themeId: typeof raw?.themeId === "string" ? raw.themeId : "botanical-engraving",
    significatorMode:
      raw?.significatorMode === "other" ||
      raw?.significatorMode === "relationship" ||
      raw?.significatorMode === "open"
        ? raw.significatorMode
        : "self",
  };
}

export function createReadingState(input: SetupInput): ReadingState {
  const setup = buildSetupState(input);
  const deck = getFullDeck();
  const cardCount = getSpreadCardCount(setup.spreadType);

  return {
    id: `reading-${Date.now()}`,
    createdAt: Date.now(),
    stage: "ritual",
    setup,
    ritual: {
      intensity: normalizeRiffleIntensity(5),
      interactionTrace: [Date.now()],
      shuffleRun: null,
      cutStep: null,
      locked: false,
    },
    deck,
    layout: deck.slice(0, cardCount),
    revealMap: Array.from({ length: cardCount }, () => false),
    selectedCardPosition: null,
    reading: null,
  };
}

export function loadReadingState(): ReadingState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(READING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReadingState;

    // Backward-compatible hydration for older saves before subject taxonomy v1.
    return {
      ...parsed,
      setup: normalizeSetupState(parsed.setup as Partial<SetupState> | undefined),
      ritual: {
        ...parsed.ritual,
        intensity: normalizeRiffleIntensity(parsed.ritual?.intensity ?? 5),
      },
    };
  } catch {
    return null;
  }
}

export function saveReadingState(state: ReadingState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(READING_STORAGE_KEY, JSON.stringify(state));
}

export function clearReadingState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(READING_STORAGE_KEY);
}

export function updateReadingState(
  current: ReadingState,
  patch: Partial<ReadingState>,
): ReadingState {
  return {
    ...current,
    ...patch,
  };
}

export function resetRevealMap(state: ReadingState): ReadingState {
  const count = getSpreadCardCount(state.setup.spreadType);
  return {
    ...state,
    revealMap: Array.from({ length: count }, () => false),
    selectedCardPosition: null,
  };
}
