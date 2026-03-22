import { CARD_BY_ID } from "@/lib/content/cards";
import { HOUSE_BY_ID } from "@/lib/content/houses";
import { isSubjectId } from "@/lib/content/subjects";
import { isThemeId } from "@/lib/content/themes";
import { INTERPRETATION_TECHNIQUES, INTERPRETATION_TONES } from "@/lib/content/interpretation/model";
import { normalizeTextFingerprint } from "@/lib/content/interpretation/families/shared";
import type {
  InterpretationEntry,
  InterpretationTechnique,
  InterpretationValidationIssue,
  InterpretationValidationResult,
} from "@/lib/content/interpretation/model";

const VALID_TECHNIQUES = new Set(INTERPRETATION_TECHNIQUES);
const VALID_TONES = new Set(INTERPRETATION_TONES);
const VALID_SIGNIFICATOR_MODES = new Set(["self", "other", "relationship", "open"]);
const VALID_DIAGONAL_LINES = new Set(["nwse", "nesw", "primary", "secondary"]);
const VALID_KNIGHT_ANCHORS = new Set(["significator", "querent", "counterpart", "key_card"]);
const VALID_PROXIMITY_DISTANCES = new Set(["near", "medium", "far"]);

const DETERMINISTIC_LANGUAGE_PATTERN =
  /\b(will|always|never|guarantee|guaranteed|certainly|definitely|must happen|destined|fated)\b/i;

const POSITIVE_SIGNAL_PATTERN = /\b(clarity|support|progress|stability|success|trust|opportunity|alignment)\b/gi;
const NEGATIVE_SIGNAL_PATTERN = /\b(conflict|delay|obstacle|burden|stress|loss|risk|uncertain|depletion)\b/gi;

function issue(
  list: InterpretationValidationIssue[],
  entryId: string,
  level: "error" | "warning",
  code: string,
  message: string,
): void {
  list.push({ entryId, level, code, message });
}

function isSentenceShaped(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed.length) return false;
  return /^[A-Z]/.test(trimmed) && /[.!?]$/.test(trimmed);
}

function countMatches(input: string, pattern: RegExp): number {
  const matches = input.match(pattern);
  return matches ? matches.length : 0;
}

function validateTechniqueKey(entry: InterpretationEntry, warnings: InterpretationValidationIssue[], errors: InterpretationValidationIssue[]): void {
  const { technique, techniqueKey, appliesTo } = entry;
  if (technique === "card") {
    const expected = `card:${appliesTo.cardId}`;
    if (techniqueKey !== expected) issue(errors, entry.id, "error", "technique_key_mismatch", `Expected ${expected} for card entry.`);
    return;
  }
  if (technique === "house") {
    const expected = `house:${appliesTo.houseId}`;
    if (techniqueKey !== expected) issue(errors, entry.id, "error", "technique_key_mismatch", `Expected ${expected} for house entry.`);
    return;
  }
  if (technique === "pair") {
    const [a, b] = appliesTo.cardA < appliesTo.cardB ? [appliesTo.cardA, appliesTo.cardB] : [appliesTo.cardB, appliesTo.cardA];
    const expected = `pair:${a}-${b}`;
    if (techniqueKey !== expected) issue(errors, entry.id, "error", "technique_key_mismatch", `Expected ${expected} for pair entry.`);
    return;
  }
  if (technique === "diagonal") {
    const expected = `diagonal:${appliesTo.line}`;
    if (techniqueKey !== expected) issue(errors, entry.id, "error", "technique_key_mismatch", `Expected ${expected} for diagonal entry.`);
    return;
  }
  if (technique === "knighting") {
    const expected = `knighting:${appliesTo.anchor}`;
    if (techniqueKey !== expected) issue(errors, entry.id, "error", "technique_key_mismatch", `Expected ${expected} for knighting entry.`);
    return;
  }
  if (technique === "proximity") {
    const expected = `proximity:${appliesTo.distance}`;
    if (techniqueKey !== expected) issue(errors, entry.id, "error", "technique_key_mismatch", `Expected ${expected} for proximity entry.`);
    return;
  }
  if (technique === "significator") {
    const expected = `significator:${appliesTo.mode}`;
    if (techniqueKey !== expected) issue(errors, entry.id, "error", "technique_key_mismatch", `Expected ${expected} for significator entry.`);
    return;
  }
}

function validateAppliesTo(entry: InterpretationEntry, errors: InterpretationValidationIssue[]): void {
  if (entry.technique === "card" && !CARD_BY_ID.has(entry.appliesTo.cardId)) {
    issue(errors, entry.id, "error", "invalid_card_reference", `Unknown card id ${entry.appliesTo.cardId}.`);
  }
  if (entry.technique === "house" && !HOUSE_BY_ID.has(entry.appliesTo.houseId)) {
    issue(errors, entry.id, "error", "invalid_house_reference", `Unknown house id ${entry.appliesTo.houseId}.`);
  }
  if (entry.technique === "pair") {
    if (!CARD_BY_ID.has(entry.appliesTo.cardA) || !CARD_BY_ID.has(entry.appliesTo.cardB)) {
      issue(errors, entry.id, "error", "invalid_pair_reference", "Pair references unknown cards.");
    }
    if (entry.appliesTo.cardA === entry.appliesTo.cardB) {
      issue(errors, entry.id, "error", "invalid_pair_reference", "Pair cannot use the same card twice.");
    }
  }
  if (entry.technique === "diagonal" && !VALID_DIAGONAL_LINES.has(entry.appliesTo.line)) {
    issue(errors, entry.id, "error", "invalid_diagonal_line", `Unknown diagonal line ${entry.appliesTo.line}.`);
  }
  if (entry.technique === "knighting" && !VALID_KNIGHT_ANCHORS.has(entry.appliesTo.anchor)) {
    issue(errors, entry.id, "error", "invalid_knight_anchor", `Unknown knighting anchor ${entry.appliesTo.anchor}.`);
  }
  if (entry.technique === "proximity" && !VALID_PROXIMITY_DISTANCES.has(entry.appliesTo.distance)) {
    issue(errors, entry.id, "error", "invalid_proximity_distance", `Unknown proximity distance ${entry.appliesTo.distance}.`);
  }
  if (entry.technique === "significator" && !VALID_SIGNIFICATOR_MODES.has(entry.appliesTo.mode)) {
    issue(errors, entry.id, "error", "invalid_significator_mode", `Unknown significator mode ${entry.appliesTo.mode}.`);
  }
}

function validateText(entry: InterpretationEntry, warnings: InterpretationValidationIssue[]): void {
  const texts = [entry.text.primary, ...entry.text.variants];
  texts.forEach((line, index) => {
    if (!isSentenceShaped(line)) {
      issue(warnings, entry.id, "warning", "sentence_shape", `Text line ${index + 1} should start with uppercase and end with punctuation.`);
    }
    if (DETERMINISTIC_LANGUAGE_PATTERN.test(line) && !entry.safety.deterministicLanguage) {
      issue(warnings, entry.id, "warning", "deterministic_language", "Deterministic language detected in a non-deterministic entry.");
    }
  });

  if (entry.text.summary && !isSentenceShaped(entry.text.summary)) {
    issue(warnings, entry.id, "warning", "sentence_shape", "Summary should start with uppercase and end with punctuation.");
  }

  const fingerprints = texts.map((line) => normalizeTextFingerprint(line));
  if (new Set(fingerprints).size !== fingerprints.length) {
    issue(warnings, entry.id, "warning", "duplicate_phrasing", "Duplicate phrasing detected across primary and variants.");
  }

  const corpus = texts.join(" ");
  const positiveSignals = countMatches(corpus, POSITIVE_SIGNAL_PATTERN);
  const negativeSignals = countMatches(corpus, NEGATIVE_SIGNAL_PATTERN);
  if (entry.ranking.polarity === "constructive" && negativeSignals >= positiveSignals + 2) {
    issue(warnings, entry.id, "warning", "polarity_text_conflict", "Constructive polarity appears to conflict with negative wording.");
  }
  if (entry.ranking.polarity === "challenging" && positiveSignals >= negativeSignals + 2) {
    issue(warnings, entry.id, "warning", "polarity_text_conflict", "Challenging polarity appears to conflict with positive wording.");
  }
}

function validateRanking(entry: InterpretationEntry, warnings: InterpretationValidationIssue[], errors: InterpretationValidationIssue[]): void {
  if (entry.ranking.confidence < 0 || entry.ranking.confidence > 1) {
    issue(errors, entry.id, "error", "invalid_confidence", "Confidence must be in range 0..1.");
  }
  if (entry.ranking.intensity < 1 || entry.ranking.intensity > 5) {
    issue(errors, entry.id, "error", "invalid_intensity", "Intensity must be in range 1..5.");
  }
  entry.ranking.tone.forEach((tone) => {
    if (!VALID_TONES.has(tone)) {
      issue(errors, entry.id, "error", "invalid_tone", `Unknown tone tag ${tone}.`);
    }
  });
  if (entry.ranking.effect.length === 0) {
    issue(warnings, entry.id, "warning", "missing_effect_tags", "At least one effect tag is recommended.");
  }
}

function validateMetaAndSafety(entry: InterpretationEntry, warnings: InterpretationValidationIssue[], errors: InterpretationValidationIssue[]): void {
  if (entry.meta.weight <= 0) {
    issue(errors, entry.id, "error", "invalid_weight", "Meta weight must be greater than zero.");
  }
  if (!entry.meta.version.trim()) {
    issue(errors, entry.id, "error", "missing_version", "Meta version is required.");
  }
  if (!entry.safety.entertainmentOnly) {
    issue(warnings, entry.id, "warning", "safety_flag", "entertainmentOnly should remain true for interpretation entries.");
  }
}

function validateReferences(entry: InterpretationEntry, errors: InterpretationValidationIssue[]): void {
  if (!VALID_TECHNIQUES.has(entry.technique as InterpretationTechnique)) {
    issue(errors, entry.id, "error", "invalid_technique", `Unknown technique ${entry.technique}.`);
  }
  if (!isSubjectId(entry.subjectId)) {
    issue(errors, entry.id, "error", "invalid_subject", `Unknown subject id ${entry.subjectId}.`);
  }
  entry.themeIds.forEach((themeId) => {
    if (!isThemeId(themeId)) {
      issue(errors, entry.id, "error", "invalid_theme", `Unknown theme id ${themeId}.`);
    }
  });
}

export function validateInterpretationEntries(entries: InterpretationEntry[]): InterpretationValidationResult {
  const errors: InterpretationValidationIssue[] = [];
  const warnings: InterpretationValidationIssue[] = [];
  const seenIds = new Set<string>();

  entries.forEach((entry) => {
    if (seenIds.has(entry.id)) {
      issue(errors, entry.id, "error", "duplicate_id", "Entry id must be unique.");
      return;
    }
    seenIds.add(entry.id);

    validateReferences(entry, errors);
    validateTechniqueKey(entry, warnings, errors);
    validateAppliesTo(entry, errors);
    validateRanking(entry, warnings, errors);
    validateMetaAndSafety(entry, warnings, errors);
    validateText(entry, warnings);
  });

  return { errors, warnings };
}
