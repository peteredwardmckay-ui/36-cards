export type SpreadType = "three-card" | "grand-tableau";
export type GTLayout = "4x9" | "4x8+4";
export type ThreeCardMode = "past-present-future" | "situation-challenge-advice";
export type Domain = "general" | "love" | "work";
export type ReadingStyle = "quick" | "deep_dive";
export type InterpretationThemeSelection = "auto" | string;
export type SubjectId =
  | "general_reading"
  | "love"
  | "work"
  | "money"
  | "home_family"
  | "friends_social"
  | "personal_growth"
  | "health"
  | "pets"
  | "creative"
  | "travel"
  | "education"
  | "spiritual"
  | "community"
  | "legal_admin"
  | "purpose_calling";
export type SignificatorMode = "self" | "other" | "relationship" | "open";

export interface SetupState {
  question: string;
  subjectId: SubjectId;
  interpretationThemeId: InterpretationThemeSelection;
  readingStyle: ReadingStyle;
  includeHouses: boolean;
  spreadType: SpreadType;
  gtLayout: GTLayout;
  threeCardMode: ThreeCardMode;
  themeId: string;
  significatorMode: SignificatorMode;
}

export interface ShufflePassStep {
  passIndex: number;
  seed: number;
  splitIndex: number;
  leftCount: number;
  rightCount: number;
  interleaveDecisions: string;
}

export interface ShuffleRun {
  baseSeedMaterial: string;
  normalizedSeed: number;
  intensity: number;
  passes: ShufflePassStep[];
  deckAfterShuffle: number[];
}

export interface CutStep {
  choice: 1 | 2 | 3;
  pileSizes: [number, number, number];
  pileOrder: [1 | 2 | 3, 1 | 2 | 3, 1 | 2 | 3];
  deckAfterCut: number[];
}

export interface RitualState {
  intensity: number;
  interactionTrace: number[];
  shuffleRun: ShuffleRun | null;
  cutStep: CutStep | null;
  locked: boolean;
}

export interface CardPlacement {
  position: number;
  cardId: number;
  houseId: number;
  row: number;
  col: number;
  zone: "main" | "cartouche";
}

export interface HighlightItem {
  id: string;
  title: string;
  summary: string;
  sectionId: string;
}

export interface NarrativeSection {
  id: string;
  title: string;
  body: string;
  technique: "house" | "diagonal" | "knight" | "proximity" | "significator" | "pair" | "timeline" | "synthesis";
}

export interface GeneratedReading {
  subjectLabel: string;
  intro: string;
  sections: NarrativeSection[];
  highlights: HighlightItem[];
  conclusion: string;
  disclaimer: string;
  wordCount: number;
  generatedAtIso: string;
  ritualSummary: string;
  themeOverlay?: {
    selection: InterpretationThemeSelection;
    mode: "explicit" | "inferred";
    resolvedThemeId: string | null;
    resolvedThemeLabel: string | null;
    subjectContextNote?: string | null;
    inferred: Array<{
      id: string;
      label: string;
      weight: number;
    }>;
  };
  selectionTrace?: {
    primaryPairKey?: string | null;
    primaryPairSelectionBand?: string[];
    cartouchePairKey?: string | null;
    threeCardPairKey?: string | null;
    phraseTemplateIds?: string[];
    phraseTemplateFamilies?: string[];
  };
}

export interface ReadingRequestPayload {
  id: string;
  createdAt: number;
  setup: SetupState;
  ritual: RitualState;
  layout: number[];
}

export interface CardDetail {
  title: string;
  cardSummary: string;
  houseSummary: string;
  connections: string[];
}

export interface CardDetailRequestPayload extends ReadingRequestPayload {
  position: number;
}

export interface ReadingState {
  id: string;
  createdAt: number;
  stage: "setup" | "ritual" | "reveal" | "results";
  setup: SetupState;
  ritual: RitualState;
  deck: number[];
  layout: number[];
  revealMap: boolean[];
  selectedCardPosition: number | null;
  reading: GeneratedReading | null;
}
