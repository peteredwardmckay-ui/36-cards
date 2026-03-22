import { normalizeTextFingerprint } from "@/lib/content/interpretation/families/shared";
import type {
  InterpretationEntry,
  InterpretationPolarity,
  InterpretationQuery,
  InterpretationTechnique,
  RetrievedInterpretationUnit,
} from "@/lib/content/interpretation/model";

const TECHNIQUE_THEME_MULTIPLIER: Record<InterpretationTechnique, number> = {
  card: 1,
  house: 1,
  pair: 0.5,
  diagonal: 0.35,
  knighting: 0.35,
  proximity: 0.4,
  significator: 0.3,
};

const TECHNIQUE_SCORE_BIAS: Record<InterpretationTechnique, number> = {
  card: 0.25,
  house: 0.2,
  pair: 0.35,
  diagonal: -0.3,
  knighting: -0.35,
  proximity: -0.25,
  significator: 0.1,
};

function normalizeTags(values: string[] | undefined): Set<string> {
  return new Set((values ?? []).map((value) => value.trim().toLowerCase()).filter(Boolean));
}

function overlapCount(left: string[] | undefined, right: string[]): number {
  if (!left?.length || !right.length) return 0;
  const rightSet = new Set(right.map((item) => item.toLowerCase()));
  return left.filter((item) => rightSet.has(item.toLowerCase())).length;
}

function matchesTechniqueAndSubject(entry: InterpretationEntry, query: InterpretationQuery): boolean {
  return entry.subjectId === query.subjectId && entry.technique === query.technique && entry.meta.active;
}

function matchesStructuralTarget(entry: InterpretationEntry, query: InterpretationQuery): boolean {
  if (query.techniqueKey && entry.techniqueKey !== query.techniqueKey) {
    return false;
  }

  if (!query.appliesTo) return true;

  if (entry.technique === "pair") {
    const q = query.appliesTo as Partial<{ cardA: number; cardB: number }>;
    const hasPairQuery = typeof q.cardA === "number" || typeof q.cardB === "number";
    if (!hasPairQuery) return true;
    const queryA = typeof q.cardA === "number" ? q.cardA : entry.appliesTo.cardA;
    const queryB = typeof q.cardB === "number" ? q.cardB : entry.appliesTo.cardB;
    const [qa, qb] = queryA < queryB ? [queryA, queryB] : [queryB, queryA];
    const [ea, eb] =
      entry.appliesTo.cardA < entry.appliesTo.cardB
        ? [entry.appliesTo.cardA, entry.appliesTo.cardB]
        : [entry.appliesTo.cardB, entry.appliesTo.cardA];
    return qa === ea && qb === eb;
  }

  return Object.entries(query.appliesTo).every(([key, value]) => {
    if (value === undefined || value === null) return true;
    const entryValue = (entry.appliesTo as Record<string, string | number | boolean>)[key];
    return entryValue === value;
  });
}

function passesHardConditions(entry: InterpretationEntry, query: InterpretationQuery): boolean {
  if (query.minConfidence !== undefined && entry.ranking.confidence < query.minConfidence) {
    return false;
  }

  if (query.excludePolarity?.includes(entry.ranking.polarity)) {
    return false;
  }

  const contextTags = normalizeTags(query.contextTags);
  const requires = entry.conditions?.requires ?? [];
  const excludes = entry.conditions?.excludes ?? [];

  const hasAllRequires = requires.every((tag) => contextTags.has(tag.toLowerCase()));
  if (!hasAllRequires) return false;

  const hasExcludedTag = excludes.some((tag) => contextTags.has(tag.toLowerCase()));
  if (hasExcludedTag) return false;

  return true;
}

function scoreEntry(entry: InterpretationEntry, query: InterpretationQuery): number {
  let score = entry.meta.weight * 10;
  score += TECHNIQUE_SCORE_BIAS[entry.technique] ?? 0;

  const themeScore =
    overlapCount(query.themeIds, entry.themeIds) *
    1.8 *
    (TECHNIQUE_THEME_MULTIPLIER[entry.technique] ?? 1);
  score += themeScore;

  if (query.tone && entry.ranking.tone.includes(query.tone)) {
    score += 1.3;
  }

  if (query.intensity !== undefined) {
    const intensityDelta = Math.abs(query.intensity - entry.ranking.intensity);
    score += Math.max(0, 2 - intensityDelta * 0.5);
  }

  score += entry.ranking.confidence * 2.2;
  score += overlapCount(query.effectTags, entry.ranking.effect) * 0.85;

  const contextTags = normalizeTags(query.contextTags);
  const prefers = entry.conditions?.prefers ?? [];
  const boost = entry.conditions?.boostIf ?? [];
  const downrank = entry.conditions?.downrankIf ?? [];

  score += prefers.filter((tag) => contextTags.has(tag.toLowerCase())).length * 0.35;
  score += boost.filter((tag) => contextTags.has(tag.toLowerCase())).length * 0.6;
  score -= downrank.filter((tag) => contextTags.has(tag.toLowerCase())).length * 0.6;

  return Number(score.toFixed(4));
}

function compareCandidates(
  left: { entry: InterpretationEntry; score: number },
  right: { entry: InterpretationEntry; score: number },
): number {
  const delta = right.score - left.score;
  if (Math.abs(delta) >= 0.001) return delta;

  const confidenceDelta = right.entry.ranking.confidence - left.entry.ranking.confidence;
  if (Math.abs(confidenceDelta) >= 0.001) return confidenceDelta;

  const weightDelta = right.entry.meta.weight - left.entry.meta.weight;
  if (Math.abs(weightDelta) >= 0.001) return weightDelta;

  return left.entry.id.localeCompare(right.entry.id);
}

function pickUnitText(entry: InterpretationEntry, usedFingerprints: Set<string>): string | null {
  const candidates = [entry.text.primary, ...entry.text.variants].map((item) => item.trim()).filter(Boolean);
  for (const candidate of candidates) {
    const fingerprint = normalizeTextFingerprint(candidate);
    if (!usedFingerprints.has(fingerprint)) {
      usedFingerprints.add(fingerprint);
      return candidate;
    }
  }
  return null;
}

export function retrieveInterpretationUnits(
  entries: InterpretationEntry[],
  query: InterpretationQuery,
): RetrievedInterpretationUnit[] {
  const usedFingerprints = new Set(
    (query.usedPhrases ?? []).map((phrase) => normalizeTextFingerprint(phrase)).filter(Boolean),
  );

  const candidates = entries
    .filter((entry) => matchesTechniqueAndSubject(entry, query))
    .filter((entry) => matchesStructuralTarget(entry, query))
    .filter((entry) => passesHardConditions(entry, query))
    .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
    .sort(compareCandidates);

  const units: RetrievedInterpretationUnit[] = [];

  for (const candidate of candidates) {
    if (query.limit && units.length >= query.limit) break;
    const selectedText = pickUnitText(candidate.entry, usedFingerprints);
    if (!selectedText) continue;

    units.push({
      entry: candidate.entry,
      score: candidate.score,
      selectedText,
    });
  }

  return units;
}

export function suppressContradictoryUnits(
  units: RetrievedInterpretationUnit[],
  excludedPolarities: InterpretationPolarity[] = [],
): RetrievedInterpretationUnit[] {
  if (!excludedPolarities.length) return units;
  const excluded = new Set(excludedPolarities);
  return units.filter((unit) => !excluded.has(unit.entry.ranking.polarity));
}
