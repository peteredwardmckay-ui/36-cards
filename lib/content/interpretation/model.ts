import type { ThemeId } from "@/lib/content/themes";
import type { SignificatorMode, SubjectId } from "@/lib/engine/types";

export const INTERPRETATION_CONTENT_VERSION = "v1";

export const INTERPRETATION_TECHNIQUES = [
  "card",
  "house",
  "pair",
  "diagonal",
  "knighting",
  "proximity",
  "significator",
] as const;

export type InterpretationTechnique = (typeof INTERPRETATION_TECHNIQUES)[number];

export const INTERPRETATION_TONES = ["grounded", "reflective", "pragmatic", "supportive", "cautious"] as const;
export type InterpretationTone = (typeof INTERPRETATION_TONES)[number];

export type InterpretationPolarity = "constructive" | "challenging" | "mixed" | "neutral";

export interface InterpretationAppliesToByTechnique {
  card: {
    cardId: number;
  };
  house: {
    houseId: number;
  };
  pair: {
    cardA: number;
    cardB: number;
  };
  diagonal: {
    line: "nwse" | "nesw" | "primary" | "secondary";
  };
  knighting: {
    anchor: "significator" | "querent" | "counterpart" | "key_card";
  };
  proximity: {
    distance: "near" | "medium" | "far";
  };
  significator: {
    mode: SignificatorMode;
  };
}

export type InterpretationAppliesTo = InterpretationAppliesToByTechnique[InterpretationTechnique];

export interface InterpretationRankingTags {
  tone: InterpretationTone[];
  intensity: 1 | 2 | 3 | 4 | 5;
  confidence: number;
  effect: string[];
  polarity: InterpretationPolarity;
}

export interface InterpretationConditions {
  requires?: string[];
  prefers?: string[];
  excludes?: string[];
  boostIf?: string[];
  downrankIf?: string[];
}

export interface InterpretationTextPayload {
  primary: string;
  variants: string[];
  summary?: string;
}

export interface InterpretationMeta {
  weight: number;
  active: boolean;
  version: string;
}

export interface InterpretationSafetyFlags {
  entertainmentOnly: boolean;
  noMedicalAdvice: boolean;
  noLegalAdvice: boolean;
  noFinancialAdvice: boolean;
  deterministicLanguage: boolean;
}

type InterpretationEntryBase<T extends InterpretationTechnique> = {
  id: string;
  technique: T;
  techniqueKey: string;
  subjectId: SubjectId;
  themeIds: ThemeId[];
  appliesTo: InterpretationAppliesToByTechnique[T];
  ranking: InterpretationRankingTags;
  conditions?: InterpretationConditions;
  text: InterpretationTextPayload;
  meta: InterpretationMeta;
  safety: InterpretationSafetyFlags;
};

export type InterpretationEntry = {
  [K in InterpretationTechnique]: InterpretationEntryBase<K>;
}[InterpretationTechnique];

export interface InterpretationQuery {
  subjectId: SubjectId;
  technique: InterpretationTechnique;
  techniqueKey?: string;
  appliesTo?: Partial<InterpretationAppliesTo>;
  themeIds?: ThemeId[];
  effectTags?: string[];
  tone?: InterpretationTone;
  intensity?: number;
  minConfidence?: number;
  contextTags?: string[];
  usedPhrases?: string[];
  excludePolarity?: InterpretationPolarity[];
  limit?: number;
}

export interface RetrievedInterpretationUnit {
  entry: InterpretationEntry;
  score: number;
  selectedText: string;
}

export interface InterpretationValidationIssue {
  entryId: string;
  level: "error" | "warning";
  code: string;
  message: string;
}

export interface InterpretationValidationResult {
  errors: InterpretationValidationIssue[];
  warnings: InterpretationValidationIssue[];
}

export interface InterpretationCoverageReport {
  totalEntries: number;
  byTechnique: Record<InterpretationTechnique, number>;
  bySubject: Record<SubjectId, number>;
  byTechniqueAndSubject: Record<InterpretationTechnique, Record<SubjectId, number>>;
  themeUsage: Record<ThemeId, number>;
  themesWithZeroEntries: ThemeId[];
  missingAreas: Array<{ technique: InterpretationTechnique; subjectId: SubjectId; count: number; reason: string }>;
  underpopulatedAreas: Array<{
    technique: InterpretationTechnique;
    subjectId: SubjectId;
    count: number;
    threshold: number;
    reason: string;
  }>;
}
