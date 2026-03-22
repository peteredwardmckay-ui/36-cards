import { isSubjectId } from "@/lib/content/subjects";
import { isThemeId, normalizeThemeSelection } from "@/lib/content/themes";
import { THEMES } from "@/lib/ui/themes";
import { normalizeRiffleIntensity } from "@/lib/engine/shuffle";
import type {
  CardDetailRequestPayload,
  ReadingRequestPayload,
  ReadingStyle,
  ReadingState,
  RitualState,
  SetupState,
  SignificatorMode,
  SpreadType,
  ThreeCardMode,
  GTLayout,
} from "@/lib/engine/types";

const THEME_ID_SET = new Set<string>(THEMES.map((theme) => theme.id));
const MAX_QUESTION_LENGTH = 800;
const VALID_READING_STYLES = new Set<ReadingStyle>(["quick", "deep_dive"]);
const VALID_SPREAD_TYPES = new Set<SpreadType>(["three-card", "grand-tableau"]);
const VALID_GT_LAYOUTS = new Set<GTLayout>(["4x9", "4x8+4"]);
const VALID_THREE_CARD_MODES = new Set<ThreeCardMode>(["past-present-future", "situation-challenge-advice"]);
const VALID_SIGNIFICATOR_MODES = new Set<SignificatorMode>(["self", "other", "relationship", "open"]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isBooleanArray(value: unknown, expectedLength: number): value is boolean[] {
  return Array.isArray(value) && value.length === expectedLength && value.every((item) => typeof item === "boolean");
}

function isValidLayout(value: unknown): value is number[] {
  if (!Array.isArray(value)) return false;
  if (!(value.length === 3 || value.length === 36)) return false;

  const seen = new Set<number>();
  for (const item of value) {
    if (!Number.isInteger(item) || item < 1 || item > 36) return false;
    if (seen.has(item)) return false;
    seen.add(item);
  }

  return true;
}

function isValidSetupState(value: unknown): value is SetupState {
  if (!isPlainObject(value)) return false;

  const question = typeof value.question === "string" ? value.question.trim() : null;
  const subjectId = typeof value.subjectId === "string" ? value.subjectId : null;
  const interpretationThemeId = typeof value.interpretationThemeId === "string" ? value.interpretationThemeId : null;
  const readingStyle = typeof value.readingStyle === "string" ? (value.readingStyle as ReadingStyle) : null;
  const spreadType = typeof value.spreadType === "string" ? (value.spreadType as SpreadType) : null;
  const gtLayout = typeof value.gtLayout === "string" ? (value.gtLayout as GTLayout) : null;
  const threeCardMode = typeof value.threeCardMode === "string" ? (value.threeCardMode as ThreeCardMode) : null;
  const themeId = typeof value.themeId === "string" ? value.themeId : null;
  const significatorMode = typeof value.significatorMode === "string" ? (value.significatorMode as SignificatorMode) : null;

  if (question === null || question.length > MAX_QUESTION_LENGTH) return false;
  if (!subjectId || !isSubjectId(subjectId)) return false;
  if (interpretationThemeId === null) return false;
  if (!readingStyle || !VALID_READING_STYLES.has(readingStyle)) return false;
  if (!spreadType || !VALID_SPREAD_TYPES.has(spreadType)) return false;
  if (!gtLayout || !VALID_GT_LAYOUTS.has(gtLayout)) return false;
  if (!threeCardMode || !VALID_THREE_CARD_MODES.has(threeCardMode)) return false;
  if (!themeId || !THEME_ID_SET.has(themeId)) return false;
  if (!significatorMode || !VALID_SIGNIFICATOR_MODES.has(significatorMode)) return false;
  if (value.includeHouses !== true && value.includeHouses !== false) return false;

  if (interpretationThemeId && interpretationThemeId !== "auto" && !isThemeId(interpretationThemeId)) {
    return false;
  }

  if (normalizeThemeSelection(subjectId, interpretationThemeId) !== interpretationThemeId) {
    return interpretationThemeId === "auto";
  }

  return true;
}

function isValidRitualState(value: unknown): value is RitualState {
  if (!isPlainObject(value)) return false;

  const interactionTrace = value.interactionTrace;
  const cutStep = value.cutStep;
  const shuffleRun = value.shuffleRun;

  if (!Number.isFinite(value.intensity)) return false;
  if (normalizeRiffleIntensity(Number(value.intensity)) !== value.intensity) return false;
  if (!Array.isArray(interactionTrace) || !interactionTrace.every((item) => Number.isFinite(item))) return false;
  if (value.locked !== true && value.locked !== false) return false;
  if (shuffleRun !== null && shuffleRun !== undefined && !isPlainObject(shuffleRun)) return false;
  if (cutStep !== null && cutStep !== undefined && !isPlainObject(cutStep)) return false;

  return true;
}

function isValidBaseReadingRequest(value: unknown): value is ReadingRequestPayload {
  if (!isPlainObject(value)) return false;

  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    value.id.length <= 120 &&
    Number.isFinite(value.createdAt) &&
    isValidSetupState(value.setup) &&
    isValidRitualState(value.ritual) &&
    isValidLayout(value.layout)
  );
}

export function isReadingRequestPayload(value: unknown): value is ReadingRequestPayload {
  return isValidBaseReadingRequest(value);
}

export function isCardDetailRequestPayload(value: unknown): value is CardDetailRequestPayload {
  if (!isValidBaseReadingRequest(value) || !isPlainObject(value)) return false;

  const position = value.position;
  return typeof position === "number" && Number.isInteger(position) && position >= 0 && position < value.layout.length;
}

export function buildReadingStateFromRequest(
  payload: ReadingRequestPayload,
  selectedCardPosition: number | null = null,
): ReadingState {
  const revealMap = Array.from({ length: payload.layout.length }, () => true);

  return {
    id: payload.id,
    createdAt: payload.createdAt,
    stage: "results",
    setup: payload.setup,
    ritual: payload.ritual,
    deck: payload.layout,
    layout: payload.layout,
    revealMap,
    selectedCardPosition,
    reading: null,
  };
}

function hasSafeDeclaredJsonLength(request: Request, maxBytes: number): boolean {
  const rawLength = request.headers.get("content-length");
  if (!rawLength) return true;

  const length = Number(rawLength);
  return Number.isFinite(length) && length >= 0 && length <= maxBytes;
}

export type JsonBodyParseResult =
  | { ok: true; value: unknown }
  | { ok: false; status: 400 | 413; message: string };

export async function parseJsonBodyWithLimit(
  request: Request,
  maxBytes: number,
  tooLargeMessage: string,
): Promise<JsonBodyParseResult> {
  if (!hasSafeDeclaredJsonLength(request, maxBytes)) {
    return { ok: false, status: 413, message: tooLargeMessage };
  }

  if (!request.body) {
    return { ok: false, status: 400, message: "Request body is required." };
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let raw = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        try {
          await reader.cancel();
        } catch {
          // Best-effort cancel to stop reading additional bytes.
        }
        return { ok: false, status: 413, message: tooLargeMessage };
      }

      raw += decoder.decode(value, { stream: true });
    }

    raw += decoder.decode();
  } catch {
    return { ok: false, status: 400, message: "Invalid request body." };
  }

  if (!raw.trim()) {
    return { ok: false, status: 400, message: "Request body is required." };
  }

  try {
    return { ok: true, value: JSON.parse(raw) as unknown };
  } catch {
    return { ok: false, status: 400, message: "Invalid JSON payload." };
  }
}
