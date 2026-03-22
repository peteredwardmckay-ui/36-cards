import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { resolveThemeForReading } from "@/lib/content/themes";
import { getDomainForSubject, inferSubjectFromQuestion } from "@/lib/engine/context";
import { composeReading } from "@/lib/engine/compose";
import { buildGrandTableauLayout } from "@/lib/engine/gt";
import {
  PAIR_SELECTION_DELTA,
  buildGrandTableauPairCandidates,
  buildThreeCardPairCandidates,
  rankPairCandidates,
  selectTopPair,
} from "@/lib/engine/pairSelection";
import { applyThreePileCut, buildRitualSeedMaterial, performRifflePasses } from "@/lib/engine/shuffle";
import type { InterpretationTechnique } from "@/lib/content/interpretation";
import {
  INTERPRETATION_ENTRIES,
  queryInterpretationEntries,
  getInterpretationCoverageReport,
} from "@/lib/content/interpretation";
import type { ReadingState, SetupState, SignificatorMode, SpreadType, SubjectId } from "@/lib/engine/types";
import { createReadingState } from "@/lib/state/storage";

interface MatrixCase {
  caseId: string;
  subjectId: SubjectId;
  interpretationThemeId: string;
  spreadType: SpreadType;
  question: string;
  threeCardMode: SetupState["threeCardMode"];
  significatorMode: SignificatorMode;
}

interface SelectedEntryRecord {
  technique: InterpretationTechnique;
  entryId: string;
  techniqueKey: string;
  score: number;
  selectedText: string;
  summary: string | null;
  alternatives: Array<{ entryId: string; techniqueKey: string; score: number }>;
}

interface RankingConcern {
  type: "pair" | "significator" | "template";
  message: string;
  selectedKey: string;
  strongerKey: string;
  delta: number;
}

interface ReadingAuditRow {
  caseId: string;
  setup: MatrixCase;
  resolvedSubjectId: SubjectId;
  resolvedThemeId: string | null;
  resolvedThemeLabel: string | null;
  selectedEntries: SelectedEntryRecord[];
  rankingConcerns: RankingConcern[];
  weakSummaryLines: string[];
  repeatedPhrasesInReading: string[];
  finalText: string;
  wordCount: number;
}

interface FrequencyStat {
  entryId: string;
  technique: InterpretationTechnique;
  count: number;
}

const BASE_CASES: MatrixCase[] = [
  {
    caseId: "general_gt",
    subjectId: "general_reading",
    interpretationThemeId: "auto",
    spreadType: "grand-tableau",
    question: "What should I know about the next three months overall?",
    threeCardMode: "past-present-future",
    significatorMode: "open",
  },
  {
    caseId: "general_3card",
    subjectId: "general_reading",
    interpretationThemeId: "clarity",
    spreadType: "three-card",
    question: "What is the clearest way to approach this week?",
    threeCardMode: "situation-challenge-advice",
    significatorMode: "self",
  },
  {
    caseId: "love_gt",
    subjectId: "love",
    interpretationThemeId: "commitment",
    spreadType: "grand-tableau",
    question: "How is this relationship developing and what needs care?",
    threeCardMode: "past-present-future",
    significatorMode: "relationship",
  },
  {
    caseId: "love_3card",
    subjectId: "love",
    interpretationThemeId: "communication",
    spreadType: "three-card",
    question: "What should I focus on in my current romantic dynamic?",
    threeCardMode: "situation-challenge-advice",
    significatorMode: "relationship",
  },
  {
    caseId: "work_gt",
    subjectId: "work",
    interpretationThemeId: "burnout",
    spreadType: "grand-tableau",
    question: "How can I navigate workload pressure and politics at work?",
    threeCardMode: "past-present-future",
    significatorMode: "self",
  },
  {
    caseId: "work_3card",
    subjectId: "work",
    interpretationThemeId: "workplace_politics",
    spreadType: "three-card",
    question: "What is happening in my team dynamics this month?",
    threeCardMode: "situation-challenge-advice",
    significatorMode: "self",
  },
  {
    caseId: "money_gt",
    subjectId: "money",
    interpretationThemeId: "financial_pressure",
    spreadType: "grand-tableau",
    question: "How can I stabilize my finances while planning ahead?",
    threeCardMode: "past-present-future",
    significatorMode: "self",
  },
  {
    caseId: "money_3card",
    subjectId: "money",
    interpretationThemeId: "cashflow",
    spreadType: "three-card",
    question: "What is the near-term trajectory of my income and expenses?",
    threeCardMode: "past-present-future",
    significatorMode: "self",
  },
  {
    caseId: "home_gt",
    subjectId: "home_family",
    interpretationThemeId: "repair_or_renovation",
    spreadType: "grand-tableau",
    question: "What needs attention in my household and family rhythm?",
    threeCardMode: "past-present-future",
    significatorMode: "self",
  },
  {
    caseId: "growth_3card",
    subjectId: "personal_growth",
    interpretationThemeId: "self_trust",
    spreadType: "three-card",
    question: "How do I strengthen confidence in my next decision?",
    threeCardMode: "situation-challenge-advice",
    significatorMode: "self",
  },
  {
    caseId: "travel_gt",
    subjectId: "travel",
    interpretationThemeId: "documents",
    spreadType: "grand-tableau",
    question: "How is my upcoming trip unfolding, especially documents and timing?",
    threeCardMode: "past-present-future",
    significatorMode: "self",
  },
  {
    caseId: "legal_gt",
    subjectId: "legal_admin",
    interpretationThemeId: "documents",
    spreadType: "grand-tableau",
    question: "What should I watch in contracts and formal paperwork now?",
    threeCardMode: "past-present-future",
    significatorMode: "self",
  },
  {
    caseId: "purpose_gt",
    subjectId: "purpose_calling",
    interpretationThemeId: "commitment",
    spreadType: "grand-tableau",
    question: "How do I commit to the path that feels deeply aligned?",
    threeCardMode: "past-present-future",
    significatorMode: "open",
  },
  {
    caseId: "purpose_3card",
    subjectId: "purpose_calling",
    interpretationThemeId: "right_path",
    spreadType: "three-card",
    question: "What is the next right step in my calling?",
    threeCardMode: "past-present-future",
    significatorMode: "open",
  },
];

function sentenceFingerprint(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function splitSentences(input: string): string[] {
  return input
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function getResolvedSubject(row: MatrixCase): SubjectId {
  if (row.subjectId !== "general_reading") return row.subjectId;
  const inferred = inferSubjectFromQuestion(row.question);
  return inferred === "general_reading" ? row.subjectId : inferred;
}

function buildState(row: MatrixCase, index: number): ReadingState {
  const created = 1730000000000 + index * 11111;
  const baseState = createReadingState({
    question: row.question,
    subjectId: row.subjectId,
    interpretationThemeId: row.interpretationThemeId,
    readingStyle: "quick",
    includeHouses: false,
    spreadType: row.spreadType,
    threeCardMode: row.threeCardMode,
    themeId: "botanical-engraving",
    significatorMode: row.significatorMode,
  });

  const intensity = 3 + (index % 7);
  const interactionTrace = [created + 3, created + 9, created + 17];
  const seedMaterial = buildRitualSeedMaterial({
    readingId: `${baseState.id}-${row.caseId}`,
    createdAt: created,
    question: row.question,
    spreadType: row.spreadType,
    interactionTrace,
    intensity,
  });

  const shuffleRun = performRifflePasses(intensity, seedMaterial, baseState.deck);
  const cutChoice = ((index % 3) + 1) as 1 | 2 | 3;
  const cutStep = applyThreePileCut(shuffleRun.deckAfterShuffle, cutChoice);

  const cardCount = row.spreadType === "grand-tableau" ? 36 : 3;
  const layout = cutStep.deckAfterCut.slice(0, cardCount);

  const state: ReadingState = {
    ...baseState,
    createdAt: created,
    stage: "results",
    setup: {
      ...baseState.setup,
      question: row.question,
      subjectId: row.subjectId,
      interpretationThemeId: row.interpretationThemeId,
      spreadType: row.spreadType,
      threeCardMode: row.threeCardMode,
      significatorMode: row.significatorMode,
    },
    ritual: {
      intensity,
      interactionTrace,
      shuffleRun,
      cutStep,
      locked: true,
    },
    deck: cutStep.deckAfterCut,
    layout,
    revealMap: Array.from({ length: cardCount }, () => true),
    selectedCardPosition: 1,
    reading: null,
  };

  state.reading = composeReading(state);
  return state;
}

function resolveSelectedPairKey(state: ReadingState, resolvedSubjectId: SubjectId): string | null {
  const trace = state.reading?.selectionTrace;
  if (state.setup.spreadType === "grand-tableau") {
    if (trace?.primaryPairKey) {
      return trace.primaryPairKey;
    }

    const gtLayout = state.setup.gtLayout ?? "4x9";
    const layout = buildGrandTableauLayout(state.layout, gtLayout);
    const domain = getDomainForSubject(resolvedSubjectId);
    const candidates = buildGrandTableauPairCandidates(layout, state.setup.significatorMode, gtLayout).candidates;
    return selectTopPair(candidates, domain)?.key ?? null;
  }

  if (trace?.threeCardPairKey) {
    return trace.threeCardPairKey;
  }

  const domain = getDomainForSubject(resolvedSubjectId);
  return selectTopPair(buildThreeCardPairCandidates(state.layout), domain)?.key ?? null;
}

function pickSelectedEntries(state: ReadingState, resolvedSubjectId: SubjectId): SelectedEntryRecord[] {
  const resolvedTheme = resolveThemeForReading({
    subjectId: resolvedSubjectId,
    question: state.setup.question,
    selectedThemeId: state.setup.interpretationThemeId,
  });

  const themeIds = resolvedTheme.resolvedThemeId ? [resolvedTheme.resolvedThemeId] : [];
  const records: SelectedEntryRecord[] = [];

  const cardId = state.layout[0];
  const cardUnits = queryInterpretationEntries({
    subjectId: resolvedSubjectId,
    technique: "card",
    techniqueKey: `card:${cardId}`,
    appliesTo: { cardId },
    themeIds,
    limit: 3,
  });
  if (cardUnits[0]) {
    records.push({
      technique: "card",
      entryId: cardUnits[0].entry.id,
      techniqueKey: cardUnits[0].entry.techniqueKey,
      score: cardUnits[0].score,
      selectedText: cardUnits[0].selectedText,
      summary: cardUnits[0].entry.text.summary ?? null,
      alternatives: cardUnits.slice(1).map((unit) => ({
        entryId: unit.entry.id,
        techniqueKey: unit.entry.techniqueKey,
        score: unit.score,
      })),
    });
  }

  if (state.setup.spreadType === "grand-tableau") {
    const houseUnits = queryInterpretationEntries({
      subjectId: resolvedSubjectId,
      technique: "house",
      techniqueKey: "house:1",
      appliesTo: { houseId: 1 },
      themeIds,
      limit: 3,
    });
    if (houseUnits[0]) {
      records.push({
        technique: "house",
        entryId: houseUnits[0].entry.id,
        techniqueKey: houseUnits[0].entry.techniqueKey,
        score: houseUnits[0].score,
        selectedText: houseUnits[0].selectedText,
        summary: houseUnits[0].entry.text.summary ?? null,
        alternatives: houseUnits.slice(1).map((unit) => ({
          entryId: unit.entry.id,
          techniqueKey: unit.entry.techniqueKey,
          score: unit.score,
        })),
      });
    }
  }

  const selectedPairKey = resolveSelectedPairKey(state, resolvedSubjectId);
  if (selectedPairKey) {
    const [aRaw, bRaw] = selectedPairKey.split("-");
    const a = Number(aRaw);
    const b = Number(bRaw);
    const pairUnits = queryInterpretationEntries({
      subjectId: resolvedSubjectId,
      technique: "pair",
      techniqueKey: `pair:${selectedPairKey}`,
      appliesTo: { cardA: a, cardB: b },
      themeIds,
      limit: 3,
    });
    if (pairUnits[0]) {
      records.push({
        technique: "pair",
        entryId: pairUnits[0].entry.id,
        techniqueKey: pairUnits[0].entry.techniqueKey,
        score: pairUnits[0].score,
        selectedText: pairUnits[0].selectedText,
        summary: pairUnits[0].entry.text.summary ?? null,
        alternatives: pairUnits.slice(1).map((unit) => ({
          entryId: unit.entry.id,
          techniqueKey: unit.entry.techniqueKey,
          score: unit.score,
        })),
      });
    }
  }

  const diagonalUnits = queryInterpretationEntries({
    subjectId: resolvedSubjectId,
    technique: "diagonal",
    techniqueKey: "diagonal:primary",
    appliesTo: { line: "primary" },
    themeIds,
    limit: 3,
  });
  if (diagonalUnits[0]) {
    records.push({
      technique: "diagonal",
      entryId: diagonalUnits[0].entry.id,
      techniqueKey: diagonalUnits[0].entry.techniqueKey,
      score: diagonalUnits[0].score,
      selectedText: diagonalUnits[0].selectedText,
      summary: diagonalUnits[0].entry.text.summary ?? null,
      alternatives: diagonalUnits.slice(1).map((unit) => ({
        entryId: unit.entry.id,
        techniqueKey: unit.entry.techniqueKey,
        score: unit.score,
      })),
    });
  }

  const knightingUnits = queryInterpretationEntries({
    subjectId: resolvedSubjectId,
    technique: "knighting",
    techniqueKey: "knighting:significator",
    appliesTo: { anchor: "significator" },
    themeIds,
    limit: 3,
  });
  if (knightingUnits[0]) {
    records.push({
      technique: "knighting",
      entryId: knightingUnits[0].entry.id,
      techniqueKey: knightingUnits[0].entry.techniqueKey,
      score: knightingUnits[0].score,
      selectedText: knightingUnits[0].selectedText,
      summary: knightingUnits[0].entry.text.summary ?? null,
      alternatives: knightingUnits.slice(1).map((unit) => ({
        entryId: unit.entry.id,
        techniqueKey: unit.entry.techniqueKey,
        score: unit.score,
      })),
    });
  }

  const proximityUnits = queryInterpretationEntries({
    subjectId: resolvedSubjectId,
    technique: "proximity",
    techniqueKey: "proximity:near",
    appliesTo: { distance: "near" },
    contextTags: ["distance:near"],
    themeIds,
    limit: 3,
  });
  if (proximityUnits[0]) {
    records.push({
      technique: "proximity",
      entryId: proximityUnits[0].entry.id,
      techniqueKey: proximityUnits[0].entry.techniqueKey,
      score: proximityUnits[0].score,
      selectedText: proximityUnits[0].selectedText,
      summary: proximityUnits[0].entry.text.summary ?? null,
      alternatives: proximityUnits.slice(1).map((unit) => ({
        entryId: unit.entry.id,
        techniqueKey: unit.entry.techniqueKey,
        score: unit.score,
      })),
    });
  }

  const significatorUnits = queryInterpretationEntries({
    subjectId: resolvedSubjectId,
    technique: "significator",
    techniqueKey: `significator:${state.setup.significatorMode}`,
    appliesTo: { mode: state.setup.significatorMode },
    contextTags: [`significator:${state.setup.significatorMode}`],
    themeIds,
    limit: 3,
  });
  if (significatorUnits[0]) {
    records.push({
      technique: "significator",
      entryId: significatorUnits[0].entry.id,
      techniqueKey: significatorUnits[0].entry.techniqueKey,
      score: significatorUnits[0].score,
      selectedText: significatorUnits[0].selectedText,
      summary: significatorUnits[0].entry.text.summary ?? null,
      alternatives: significatorUnits.slice(1).map((unit) => ({
        entryId: unit.entry.id,
        techniqueKey: unit.entry.techniqueKey,
        score: unit.score,
      })),
    });
  }

  return records;
}

function collectRankingConcerns(state: ReadingState, resolvedSubjectId: SubjectId): RankingConcern[] {
  const concerns: RankingConcern[] = [];
  const resolvedTheme = resolveThemeForReading({
    subjectId: resolvedSubjectId,
    question: state.setup.question,
    selectedThemeId: state.setup.interpretationThemeId,
  });
  const themeIds = resolvedTheme.resolvedThemeId ? [resolvedTheme.resolvedThemeId] : [];
  const domain = getDomainForSubject(resolvedSubjectId);
  const selectedPairKey = resolveSelectedPairKey(state, resolvedSubjectId);

  if (selectedPairKey) {
    const rankedPairs =
      state.setup.spreadType === "grand-tableau"
        ? rankPairCandidates(
            buildGrandTableauPairCandidates(
              buildGrandTableauLayout(state.layout, state.setup.gtLayout ?? "4x9"),
              state.setup.significatorMode,
              state.setup.gtLayout ?? "4x9",
            ).candidates,
            domain,
          )
        : rankPairCandidates(buildThreeCardPairCandidates(state.layout), domain);

    const top = rankedPairs[0];
    const selected = rankedPairs.find((item) => item.key === selectedPairKey);
    if (top && selected && top.key !== selected.key && top.score - selected.score > PAIR_SELECTION_DELTA) {
      concerns.push({
        type: "pair",
        message: "A materially stronger pair candidate outranked the pair used in the reading.",
        selectedKey: selected.key,
        strongerKey: top.key,
        delta: Number((top.score - selected.score).toFixed(3)),
      });
    }
  }

  const significatorVariants = ["self", "other", "relationship", "open"] as const;
  const significatorScores = significatorVariants
    .map((mode) => {
      const units = queryInterpretationEntries({
        subjectId: resolvedSubjectId,
        technique: "significator",
        techniqueKey: `significator:${mode}`,
        appliesTo: { mode },
        contextTags: [`significator:${mode}`],
        themeIds,
        limit: 1,
      });
      return {
        key: `significator:${mode}`,
        score: units[0]?.score ?? -1,
      };
    })
    .sort((left, right) => right.score - left.score);
  const selectedSignificator = `significator:${state.setup.significatorMode}`;
  const topSig = significatorScores[0];
  const selectedSig = significatorScores.find((item) => item.key === selectedSignificator);
  if (topSig && selectedSig && topSig.key !== selectedSig.key && topSig.score - selectedSig.score >= 0.8) {
    concerns.push({
      type: "significator",
      message: "A different significator template ranked materially higher in this context.",
      selectedKey: selectedSig.key,
      strongerKey: topSig.key,
      delta: Number((topSig.score - selectedSig.score).toFixed(3)),
    });
  }

  const diagonalScores = ["primary", "secondary"].map((line) => {
    const units = queryInterpretationEntries({
      subjectId: resolvedSubjectId,
      technique: "diagonal",
      techniqueKey: `diagonal:${line}`,
      appliesTo: { line: line as "primary" | "secondary" },
      themeIds,
      limit: 1,
    });
    return { key: `diagonal:${line}`, score: units[0]?.score ?? -1 };
  }).sort((a, b) => b.score - a.score);
  const selectedDiag = diagonalScores.find((item) => item.key === "diagonal:primary");
  if (diagonalScores[0] && selectedDiag && diagonalScores[0].key !== selectedDiag.key && diagonalScores[0].score - selectedDiag.score >= 0.8) {
    concerns.push({
      type: "template",
      message: "A diagonal template ranked higher than the default primary diagonal choice.",
      selectedKey: selectedDiag.key,
      strongerKey: diagonalScores[0].key,
      delta: Number((diagonalScores[0].score - selectedDiag.score).toFixed(3)),
    });
  }

  return concerns;
}

function weakSummaryLines(row: ReadingAuditRow): string[] {
  const genericLead = /^(this|in this|overall|taken as|pair dynamics|significator mode|themes act as|the strongest)/i;
  return row.finalText
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 20)
    .filter((line) => genericLead.test(line))
    .slice(0, 8);
}

function runAuditMatrix(): {
  rows: ReadingAuditRow[];
  aggregate: Record<string, unknown>;
} {
  const rows: ReadingAuditRow[] = [];
  const selectedCounts = new Map<string, FrequencyStat>();
  const allSentenceCounts = new Map<string, { sentence: string; count: number }>();
  const openingCounts = new Map<string, number>();
  const rankingConcerns: RankingConcern[] = [];

  BASE_CASES.forEach((matrixCase, index) => {
    const state = buildState(matrixCase, index);
    const resolvedSubjectId = getResolvedSubject(matrixCase);
    const resolvedTheme = resolveThemeForReading({
      subjectId: resolvedSubjectId,
      question: matrixCase.question,
      selectedThemeId: matrixCase.interpretationThemeId,
    });

    const selectedEntries = pickSelectedEntries(state, resolvedSubjectId);
    selectedEntries.forEach((record) => {
      const current = selectedCounts.get(record.entryId);
      if (current) {
        current.count += 1;
      } else {
        selectedCounts.set(record.entryId, {
          entryId: record.entryId,
          technique: record.technique,
          count: 1,
        });
      }
    });

    const finalText = [
      state.reading?.intro ?? "",
      ...(state.reading?.sections.map((section) => section.body) ?? []),
      state.reading?.conclusion ?? "",
      state.reading?.disclaimer ?? "",
    ].join(" ");
    const sentences = splitSentences(finalText);
    sentences.forEach((sentence) => {
      const fingerprint = sentenceFingerprint(sentence);
      if (!fingerprint) return;
      const existing = allSentenceCounts.get(fingerprint);
      if (existing) {
        existing.count += 1;
      } else {
        allSentenceCounts.set(fingerprint, { sentence, count: 1 });
      }

      const opening = sentence
        .split(/\s+/)
        .slice(0, 3)
        .join(" ")
        .toLowerCase();
      if (opening.length > 5) {
        openingCounts.set(opening, (openingCounts.get(opening) ?? 0) + 1);
      }
    });

    const concerns = collectRankingConcerns(state, resolvedSubjectId);
    rankingConcerns.push(...concerns);

    const row: ReadingAuditRow = {
      caseId: matrixCase.caseId,
      setup: matrixCase,
      resolvedSubjectId,
      resolvedThemeId: resolvedTheme.resolvedThemeId,
      resolvedThemeLabel: resolvedTheme.resolvedThemeLabel,
      selectedEntries,
      rankingConcerns: concerns,
      weakSummaryLines: [],
      repeatedPhrasesInReading: [],
      finalText,
      wordCount: state.reading?.wordCount ?? 0,
    };

    row.weakSummaryLines = weakSummaryLines(row);
    const rowFingerprints = new Set<string>();
    splitSentences(row.finalText).forEach((sentence) => {
      const fingerprint = sentenceFingerprint(sentence);
      if (!fingerprint || rowFingerprints.has(fingerprint)) return;
      rowFingerprints.add(fingerprint);
      const globalCount = allSentenceCounts.get(fingerprint)?.count ?? 0;
      if (globalCount >= 3) {
        row.repeatedPhrasesInReading.push(sentence);
      }
    });

    rows.push(row);
  });

  const mostFrequent = [...selectedCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const rareUsage = INTERPRETATION_ENTRIES.map((entry) => ({
    entryId: entry.id,
    technique: entry.technique,
    count: selectedCounts.get(entry.id)?.count ?? 0,
    weight: entry.meta.weight,
  }));
  const neverSelected = rareUsage.filter((row) => row.count === 0).sort((a, b) => b.weight - a.weight).slice(0, 40);
  const rarelySelected = rareUsage.filter((row) => row.count === 1).sort((a, b) => b.weight - a.weight).slice(0, 40);

  const repeatedPhrases = [...allSentenceCounts.values()]
    .filter((item) => item.count >= 3)
    .sort((a, b) => b.count - a.count)
    .slice(0, 40);

  const overusedOpenings = [...openingCounts.entries()]
    .filter(([, count]) => count >= 4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([opening, count]) => ({ opening, count }));

  const weakLines = rows
    .flatMap((row) => row.weakSummaryLines.map((line) => ({ caseId: row.caseId, line })))
    .slice(0, 80);

  const coverage = getInterpretationCoverageReport();

  return {
    rows,
    aggregate: {
      sampleCount: rows.length,
      repeatedPhrases,
      overusedOpenings,
      weakSummaryLines: weakLines,
      rankingConcerns,
      mostFrequentEntries: mostFrequent,
      underusedNeverSelected: neverSelected,
      underusedRarelySelected: rarelySelected,
      coverageSnapshot: {
        totalEntries: coverage.totalEntries,
        byTechnique: coverage.byTechnique,
        themesWithZeroEntries: coverage.themesWithZeroEntries,
      },
    },
  };
}

function writeAuditArtifacts() {
  const report = runAuditMatrix();
  const outputDir = path.join(process.cwd(), "reports");
  fs.mkdirSync(outputDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const jsonPath = path.join(outputDir, `runtime-quality-audit-${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");

  const aggregate = report.aggregate as {
    sampleCount: number;
    repeatedPhrases: Array<{ sentence: string; count: number }>;
    overusedOpenings: Array<{ opening: string; count: number }>;
    weakSummaryLines: Array<{ caseId: string; line: string }>;
    rankingConcerns: RankingConcern[];
    mostFrequentEntries: FrequencyStat[];
    underusedNeverSelected: Array<{ entryId: string; technique: string; count: number; weight: number }>;
    underusedRarelySelected: Array<{ entryId: string; technique: string; count: number; weight: number }>;
  };

  const markdownPath = path.join(outputDir, `runtime-quality-audit-${timestamp}.md`);
  const lines: string[] = [];
  lines.push("# Runtime Quality Audit");
  lines.push("");
  lines.push(`- Sample runs: ${aggregate.sampleCount}`);
  lines.push(`- Repeated sentence patterns (>=3): ${aggregate.repeatedPhrases.length}`);
  lines.push(`- Overused sentence openings (>=4): ${aggregate.overusedOpenings.length}`);
  lines.push(`- Ranking concern flags: ${aggregate.rankingConcerns.length}`);
  lines.push("");
  lines.push("## Most Frequent Selected Entries");
  aggregate.mostFrequentEntries.slice(0, 15).forEach((item) => {
    lines.push(`- ${item.entryId} (${item.technique}) x${item.count}`);
  });
  lines.push("");
  lines.push("## Ranking Concerns");
  aggregate.rankingConcerns.slice(0, 30).forEach((concern) => {
    lines.push(`- [${concern.type}] ${concern.message} Selected: ${concern.selectedKey}, stronger: ${concern.strongerKey}, delta=${concern.delta}`);
  });
  lines.push("");
  lines.push("## Repeated Phrases");
  aggregate.repeatedPhrases.slice(0, 20).forEach((item) => {
    lines.push(`- x${item.count}: ${item.sentence}`);
  });
  lines.push("");
  lines.push("## Overused Openings");
  aggregate.overusedOpenings.slice(0, 20).forEach((item) => {
    lines.push(`- x${item.count}: ${item.opening}`);
  });
  lines.push("");
  lines.push("## Weak Summary Lines");
  aggregate.weakSummaryLines.slice(0, 30).forEach((item) => {
    lines.push(`- ${item.caseId}: ${item.line}`);
  });
  lines.push("");
  lines.push("## Underused Entries (Never Selected)");
  aggregate.underusedNeverSelected.slice(0, 20).forEach((item) => {
    lines.push(`- ${item.entryId} (${item.technique}, weight ${item.weight})`);
  });
  lines.push("");
  lines.push("## Underused Entries (Rarely Selected)");
  aggregate.underusedRarelySelected.slice(0, 20).forEach((item) => {
    lines.push(`- ${item.entryId} (${item.technique}, weight ${item.weight})`);
  });
  lines.push("");
  lines.push(`JSON report: ${jsonPath}`);
  fs.writeFileSync(markdownPath, `${lines.join("\n")}\n`, "utf8");

  return { jsonPath, markdownPath, report };
}

describe("runtime quality audit generator", () => {
  it("generates reading-engine audit artifacts", () => {
    const result = writeAuditArtifacts();
    expect(fs.existsSync(result.jsonPath)).toBe(true);
    expect(fs.existsSync(result.markdownPath)).toBe(true);
    expect(result.report.rows.length).toBeGreaterThanOrEqual(12);
  });
});
