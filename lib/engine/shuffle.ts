import { clamp, createMulberry32, gaussianRandom, hashStringToInt } from "@/lib/engine/rng";
import type { CutStep, ShufflePassStep, ShuffleRun } from "@/lib/engine/types";

const FULL_DECK = Array.from({ length: 36 }, (_, index) => index + 1);
export const MIN_RIFFLE_INTENSITY = 5;
export const MAX_RIFFLE_INTENSITY = 9;

export function normalizeRiffleIntensity(intensity: number): number {
  if (!Number.isFinite(intensity)) {
    return 5;
  }

  return clamp(Math.round(intensity), MIN_RIFFLE_INTENSITY, MAX_RIFFLE_INTENSITY);
}

function splitNearCenter(deckLength: number, rngSeedMaterial: string): { splitIndex: number; seed: number } {
  const seed = hashStringToInt(rngSeedMaterial);
  const rng = createMulberry32(seed);
  const center = deckLength / 2;
  const gaussianOffset = gaussianRandom(rng, 0, 2.1);
  const jitter = rng.nextInt(-1, 1);
  const splitIndex = clamp(Math.round(center + gaussianOffset + jitter), 8, deckLength - 8);
  return { splitIndex, seed };
}

function riffleInterleave(left: number[], right: number[], seed: number): { deck: number[]; decisions: string } {
  const rng = createMulberry32(seed);
  const leftPile = [...left];
  const rightPile = [...right];
  const merged: number[] = [];
  const decisions: string[] = [];

  while (leftPile.length > 0 || rightPile.length > 0) {
    if (leftPile.length === 0) {
      merged.push(rightPile.shift() as number);
      decisions.push("R");
      continue;
    }

    if (rightPile.length === 0) {
      merged.push(leftPile.shift() as number);
      decisions.push("L");
      continue;
    }

    const total = leftPile.length + rightPile.length;
    const baseChanceLeft = leftPile.length / total;
    const weightedChanceLeft = clamp(baseChanceLeft + (rng.next() - 0.5) * 0.18, 0.15, 0.85);

    if (rng.next() < weightedChanceLeft) {
      merged.push(leftPile.shift() as number);
      decisions.push("L");
    } else {
      merged.push(rightPile.shift() as number);
      decisions.push("R");
    }
  }

  return { deck: merged, decisions: decisions.join("") };
}

export interface RitualSeedContext {
  readingId: string;
  createdAt: number;
  question: string;
  spreadType: string;
  interactionTrace: number[];
  intensity: number;
}

export function buildRitualSeedMaterial(context: RitualSeedContext): string {
  const normalizedIntensity = normalizeRiffleIntensity(context.intensity);
  return [
    context.readingId,
    context.createdAt,
    context.question.trim().toLowerCase(),
    context.spreadType,
    normalizedIntensity,
    ...context.interactionTrace,
  ].join("|");
}

export function performRifflePasses(intensity: number, seedMaterial: string, initialDeck: number[] = FULL_DECK): ShuffleRun {
  const normalizedIntensity = normalizeRiffleIntensity(intensity);
  const normalizedSeed = hashStringToInt(seedMaterial);
  const passes: ShufflePassStep[] = [];
  let deck = [...initialDeck];

  for (let passIndex = 0; passIndex < normalizedIntensity; passIndex += 1) {
    const passSeedMaterial = `${seedMaterial}|pass:${passIndex}|deck:${deck.join(",")}`;
    const { splitIndex, seed } = splitNearCenter(deck.length, passSeedMaterial);
    const left = deck.slice(0, splitIndex);
    const right = deck.slice(splitIndex);
    const interleaveSeed = hashStringToInt(`${passSeedMaterial}|interleave`);
    const interleaveResult = riffleInterleave(left, right, interleaveSeed);

    deck = interleaveResult.deck;

    passes.push({
      passIndex,
      seed,
      splitIndex,
      leftCount: left.length,
      rightCount: right.length,
      interleaveDecisions: interleaveResult.decisions,
    });
  }

  return {
    baseSeedMaterial: seedMaterial,
    normalizedSeed,
    intensity: normalizedIntensity,
    passes,
    deckAfterShuffle: deck,
  };
}

function splitIntoThreePiles(deck: number[]): [number[], number[], number[]] {
  const first = deck.slice(0, 12);
  const second = deck.slice(12, 24);
  const third = deck.slice(24, 36);
  return [first, second, third];
}

export function applyThreePileCut(deck: number[], choice: 1 | 2 | 3): CutStep {
  const piles = splitIntoThreePiles(deck);
  const pileSizes: [number, number, number] = [piles[0].length, piles[1].length, piles[2].length];

  const pileOrder: [1 | 2 | 3, 1 | 2 | 3, 1 | 2 | 3] =
    choice === 1 ? [1, 2, 3] : choice === 2 ? [2, 3, 1] : [3, 1, 2];

  const deckAfterCut = [
    ...piles[pileOrder[0] - 1],
    ...piles[pileOrder[1] - 1],
    ...piles[pileOrder[2] - 1],
  ];

  return {
    choice,
    pileSizes,
    pileOrder,
    deckAfterCut,
  };
}

export function describeCutChoice(choice: 1 | 2 | 3): string {
  return choice === 1 ? "No cut" : `Pile ${choice} first`;
}

export function ritualSummaryLine(shuffleRun: ShuffleRun | null, cutStep: CutStep | null): string {
  if (!shuffleRun || !cutStep) {
    return "Ritual incomplete";
  }

  return `Shuffle: ${shuffleRun.intensity} passes, Cut: ${describeCutChoice(cutStep.choice)}, Seed: ${shuffleRun.normalizedSeed}`;
}

export function getFullDeck(): number[] {
  return [...FULL_DECK];
}
