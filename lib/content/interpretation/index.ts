import { buildCardInterpretationEntries } from "@/lib/content/interpretation/families/cards";
import { buildHouseInterpretationEntries } from "@/lib/content/interpretation/families/houses";
import { buildPairInterpretationEntries } from "@/lib/content/interpretation/families/pairs";
import { baseSafetyFlags, sentenceCase } from "@/lib/content/interpretation/families/shared";
import { buildTemplateInterpretationEntries } from "@/lib/content/interpretation/families/templates";
import { buildInterpretationCoverageReport } from "@/lib/content/interpretation/coverage";
import { retrieveInterpretationUnits, suppressContradictoryUnits } from "@/lib/content/interpretation/retrieval";
import { validateInterpretationEntries } from "@/lib/content/interpretation/validation";
import { getCardMeaning } from "@/lib/content/cards";
import { getPairMeaning } from "@/lib/content/pairs";
import { getDomainForSubject } from "@/lib/engine/context";
import type {
  InterpretationCoverageReport,
  InterpretationEntry,
  InterpretationQuery,
  InterpretationTechnique,
  InterpretationValidationResult,
  RetrievedInterpretationUnit,
} from "@/lib/content/interpretation/model";

export * from "@/lib/content/interpretation/model";

function buildInterpretationEntries(): InterpretationEntry[] {
  // Foundation strategy:
  // 1) full card coverage
  // 2) full house coverage
  // 3) reusable technique templates
  // 4) priority high-signal pairs
  return [
    ...buildCardInterpretationEntries(),
    ...buildHouseInterpretationEntries(),
    ...buildTemplateInterpretationEntries(),
    ...buildPairInterpretationEntries(),
  ];
}

export const INTERPRETATION_ENTRIES: InterpretationEntry[] = buildInterpretationEntries();

export function getEntriesByTechnique(technique: InterpretationTechnique): InterpretationEntry[] {
  return INTERPRETATION_ENTRIES.filter((entry) => entry.technique === technique);
}

export function getEntriesBySubject(subjectId: InterpretationEntry["subjectId"]): InterpretationEntry[] {
  return INTERPRETATION_ENTRIES.filter((entry) => entry.subjectId === subjectId);
}

export function queryInterpretationEntries(query: InterpretationQuery): RetrievedInterpretationUnit[] {
  const units = retrieveInterpretationUnits(INTERPRETATION_ENTRIES, query);
  if (units.length > 0 || query.technique !== "pair") {
    return units;
  }

  const appliesTo = query.appliesTo as Partial<{ cardA: number; cardB: number }> | undefined;
  if (typeof appliesTo?.cardA !== "number" || typeof appliesTo?.cardB !== "number") {
    return units;
  }

  const a = appliesTo.cardA;
  const b = appliesTo.cardB;
  const [cardA, cardB] = a < b ? [a, b] : [b, a];
  const left = getCardMeaning(cardA);
  const right = getCardMeaning(cardB);
  const domain = getDomainForSubject(query.subjectId);
  const fromRepository = getPairMeaning(cardA, cardB);
  const primary =
    fromRepository?.meanings[domain] ??
    sentenceCase(
      `${left.name} + ${right.name} blends ${left.keywords[0]} with ${right.keywords[0]}, asking you to ${left.action} while staying aware of ${right.caution}`,
    );
  const summary = sentenceCase(`${left.name} and ${right.name} create a contextual pair bridge`);
  const baseSignal = fromRepository?.signal ?? 18;
  const confidence = Math.min(0.82, 0.58 + baseSignal / 100);
  const intensity = Math.max(2, Math.min(5, Math.round(baseSignal / 8))) as 2 | 3 | 4 | 5;

  const fallbackEntry: InterpretationEntry = {
    id: `pair:${query.subjectId}:${cardA}-${cardB}:fallback`,
    technique: "pair",
    techniqueKey: `pair:${cardA}-${cardB}`,
    subjectId: query.subjectId,
    themeIds: [],
    appliesTo: {
      cardA,
      cardB,
    },
    ranking: {
      tone: ["grounded", "reflective"],
      intensity,
      confidence,
      effect: [left.keywords[0] ?? "pair", right.keywords[0] ?? "context"],
      polarity: fromRepository ? "mixed" : "neutral",
    },
    conditions: {
      prefers: [`subject:${query.subjectId}`],
    },
    text: {
      primary,
      variants: [
        sentenceCase("Use this pair as a context check before locking the final synthesis"),
        sentenceCase("Pair context helps prioritize what to address now versus later"),
      ],
      summary,
    },
    meta: {
      weight: 1.08,
      active: true,
      version: "v1-fallback",
    },
    safety: baseSafetyFlags(),
  };

  return [
    {
      entry: fallbackEntry,
      score: Number((fallbackEntry.meta.weight * 10 + confidence * 2.2).toFixed(4)),
      selectedText: fallbackEntry.text.primary,
    },
  ];
}

export function queryInterpretationEntriesNoContradictions(
  query: InterpretationQuery,
): RetrievedInterpretationUnit[] {
  const units = retrieveInterpretationUnits(INTERPRETATION_ENTRIES, query);
  return suppressContradictoryUnits(units, query.excludePolarity);
}

export function validateInterpretationRepository(
  entries: InterpretationEntry[] = INTERPRETATION_ENTRIES,
): InterpretationValidationResult {
  return validateInterpretationEntries(entries);
}

export function getInterpretationCoverageReport(
  entries: InterpretationEntry[] = INTERPRETATION_ENTRIES,
): InterpretationCoverageReport {
  return buildInterpretationCoverageReport(entries);
}
