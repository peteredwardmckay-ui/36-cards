import { getCardMeaning } from "@/lib/content/cards";
import { getPairMeaning } from "@/lib/content/pairs";
import {
  getCartouchePlacements,
  getDiagonalLine,
  getGTCoord,
  getGTMainDimensions,
  getGTMainPositions,
  getGTPositionFromCoord,
  getRowPositions,
  getColumnPositions,
} from "@/lib/engine/gt";
import type { CardPlacement, GTLayout } from "@/lib/engine/types";

export interface GTSurroundings {
  north: CardPlacement | null;
  south: CardPlacement | null;
  east: CardPlacement | null;
  west: CardPlacement | null;
  northeast: CardPlacement | null;
  northwest: CardPlacement | null;
  southeast: CardPlacement | null;
  southwest: CardPlacement | null;
}

export interface GTMirrorPairs {
  rowPairs: Array<[CardPlacement, CardPlacement]>;
  columnPairs: Array<[CardPlacement, CardPlacement]>;
}

export interface GTCluster {
  centerPosition: number;
  positions: number[];
  placements: CardPlacement[];
  score: number;
}

export interface GTQuadrantSummary {
  id: "top_left" | "top_right" | "bottom_left" | "bottom_right";
  placements: CardPlacement[];
  score: number;
}

export interface DeepDiveGTAnalysis {
  significator: {
    position: number;
    row: number;
    col: number;
  };
  surroundings: GTSurroundings;
  rowLine: CardPlacement[];
  columnLine: CardPlacement[];
  dominantDiagonal: {
    axis: "nwse" | "nesw";
    placements: CardPlacement[];
  };
  mirrors: GTMirrorPairs;
  primaryCluster: GTCluster;
  secondaryCluster: GTCluster | null;
  quadrants: GTQuadrantSummary[];
  cartoucheCards: CardPlacement[];
}

const CARD_STRENGTH: Record<number, number> = {
  1: 1.5,
  6: 1.4,
  7: 1.7,
  8: 1.8,
  10: 1.8,
  14: 1.5,
  15: 1.6,
  16: 1.5,
  21: 1.8,
  22: 1.7,
  23: 1.6,
  24: 1.8,
  25: 1.6,
  28: 1.9,
  29: 2,
  31: 1.8,
  33: 1.9,
  35: 1.8,
  36: 2,
};

function placementMap(layout: CardPlacement[]): Map<number, CardPlacement> {
  return new Map(layout.map((placement) => [placement.position, placement]));
}

function chebyshevDistance(fromPosition: number, toPosition: number, gtLayout: GTLayout): number {
  const from = getGTCoord(fromPosition, gtLayout);
  const to = getGTCoord(toPosition, gtLayout);
  if (!from || !to) return Number.POSITIVE_INFINITY;
  return Math.max(Math.abs(from.row - to.row), Math.abs(from.col - to.col));
}

function cardStrength(cardId: number): number {
  return CARD_STRENGTH[cardId] ?? 1;
}

function getPlacementAt(layoutMap: Map<number, CardPlacement>, row: number, col: number, gtLayout: GTLayout): CardPlacement | null {
  const position = getGTPositionFromCoord(row, col, gtLayout);
  if (!position) return null;
  return layoutMap.get(position) ?? null;
}

function scoreCluster(placements: CardPlacement[], gtLayout: GTLayout = "4x9"): number {
  const base = placements.reduce((sum, placement) => sum + cardStrength(placement.cardId), 0);

  const keywordCounts = new Map<string, number>();
  placements.forEach((placement) => {
    const keyword = getCardMeaning(placement.cardId).keywords[0]?.toLowerCase().trim();
    if (!keyword) return;
    keywordCounts.set(keyword, (keywordCounts.get(keyword) ?? 0) + 1);
  });
  const repeatedKeywordBonus = Array.from(keywordCounts.values())
    .filter((count) => count > 1)
    .reduce((sum, count) => sum + (count - 1) * 0.8, 0);

  let pairSignalBonus = 0;
  for (let i = 0; i < placements.length; i += 1) {
    for (let j = i + 1; j < placements.length; j += 1) {
      const left = placements[i];
      const right = placements[j];
      if (chebyshevDistance(left.position, right.position, gtLayout) > 1) continue;
      const pair = getPairMeaning(left.cardId, right.cardId);
      pairSignalBonus += (pair?.signal ?? 16) / 20;
    }
  }

  return Number((base + repeatedKeywordBonus + pairSignalBonus).toFixed(4));
}

function buildCluster(layout: CardPlacement[], centerPosition: number, gtLayout: GTLayout, radius = 1): GTCluster {
  const placements = layout
    .filter((placement) => chebyshevDistance(centerPosition, placement.position, gtLayout) <= radius)
    .sort((a, b) => a.position - b.position);

  return {
    centerPosition,
    positions: placements.map((placement) => placement.position),
    placements,
    score: scoreCluster(placements, gtLayout),
  };
}

function buildMirrors(layout: CardPlacement[], position: number, gtLayout: GTLayout): GTMirrorPairs {
  const layoutByPosition = placementMap(layout);
  const coord = getGTCoord(position, gtLayout);
  if (!coord) {
    return { rowPairs: [], columnPairs: [] };
  }

  const rowPairs: Array<[CardPlacement, CardPlacement]> = [];
  for (let offset = 1; offset < 9; offset += 1) {
    const left = getPlacementAt(layoutByPosition, coord.row, coord.col - offset, gtLayout);
    const right = getPlacementAt(layoutByPosition, coord.row, coord.col + offset, gtLayout);
    if (!left || !right) break;
    rowPairs.push([left, right]);
  }

  const columnPairs: Array<[CardPlacement, CardPlacement]> = [];
  for (let offset = 1; offset < 4; offset += 1) {
    const up = getPlacementAt(layoutByPosition, coord.row - offset, coord.col, gtLayout);
    const down = getPlacementAt(layoutByPosition, coord.row + offset, coord.col, gtLayout);
    if (!up || !down) break;
    columnPairs.push([up, down]);
  }

  return {
    rowPairs,
    columnPairs,
  };
}

function dominantDiagonal(layout: CardPlacement[], position: number, gtLayout: GTLayout): { axis: "nwse" | "nesw"; placements: CardPlacement[] } {
  const layoutByPosition = placementMap(layout);
  const diagonalA = getDiagonalLine(position, "nwse", gtLayout).map((linePos) => layoutByPosition.get(linePos)).filter(Boolean) as CardPlacement[];
  const diagonalB = getDiagonalLine(position, "nesw", gtLayout).map((linePos) => layoutByPosition.get(linePos)).filter(Boolean) as CardPlacement[];

  const scoreA = scoreCluster(diagonalA, gtLayout);
  const scoreB = scoreCluster(diagonalB, gtLayout);

  if (scoreA >= scoreB) {
    return { axis: "nwse", placements: diagonalA };
  }
  return { axis: "nesw", placements: diagonalB };
}

function buildQuadrants(layout: CardPlacement[], gtLayout: GTLayout): GTQuadrantSummary[] {
  const { rows, cols } = getGTMainDimensions(gtLayout);
  const topMax = Math.floor(rows / 2) - 1;
  const leftMax = Math.floor(cols / 2) - 1;
  const main = layout.filter((placement) => placement.zone === "main");

  const topLeft = main.filter((placement) => placement.row <= topMax && placement.col <= leftMax);
  const topRight = main.filter((placement) => placement.row <= topMax && placement.col >= leftMax + 1);
  const bottomLeft = main.filter((placement) => placement.row >= topMax + 1 && placement.col <= leftMax);
  const bottomRight = main.filter((placement) => placement.row >= topMax + 1 && placement.col >= leftMax + 1);

  return [
    { id: "top_left", placements: topLeft, score: scoreCluster(topLeft, gtLayout) },
    { id: "top_right", placements: topRight, score: scoreCluster(topRight, gtLayout) },
    { id: "bottom_left", placements: bottomLeft, score: scoreCluster(bottomLeft, gtLayout) },
    { id: "bottom_right", placements: bottomRight, score: scoreCluster(bottomRight, gtLayout) },
  ];
}

function bestSecondaryCluster(
  layout: CardPlacement[],
  significatorPosition: number,
  primaryClusterPositions: Set<number>,
  gtLayout: GTLayout,
): GTCluster | null {
  let best: GTCluster | null = null;
  const mainPositions = getGTMainPositions(gtLayout);

  for (const position of mainPositions) {
    if (chebyshevDistance(significatorPosition, position, gtLayout) <= 1) continue;
    const cluster = buildCluster(layout, position, gtLayout, 1);
    const overlapsPrimary = cluster.positions.some((clusterPosition) => primaryClusterPositions.has(clusterPosition));
    if (overlapsPrimary) continue;
    if (!best || cluster.score > best.score) {
      best = cluster;
    }
  }

  return best;
}

export function getImmediateSurroundings(layout: CardPlacement[], position: number, gtLayout: GTLayout = "4x9"): GTSurroundings {
  const layoutByPosition = placementMap(layout);
  const coord = getGTCoord(position, gtLayout);

  if (!coord) {
    return {
      north: null,
      south: null,
      east: null,
      west: null,
      northeast: null,
      northwest: null,
      southeast: null,
      southwest: null,
    };
  }

  return {
    north: getPlacementAt(layoutByPosition, coord.row - 1, coord.col, gtLayout),
    south: getPlacementAt(layoutByPosition, coord.row + 1, coord.col, gtLayout),
    east: getPlacementAt(layoutByPosition, coord.row, coord.col + 1, gtLayout),
    west: getPlacementAt(layoutByPosition, coord.row, coord.col - 1, gtLayout),
    northeast: getPlacementAt(layoutByPosition, coord.row - 1, coord.col + 1, gtLayout),
    northwest: getPlacementAt(layoutByPosition, coord.row - 1, coord.col - 1, gtLayout),
    southeast: getPlacementAt(layoutByPosition, coord.row + 1, coord.col + 1, gtLayout),
    southwest: getPlacementAt(layoutByPosition, coord.row + 1, coord.col - 1, gtLayout),
  };
}

export function analyzeGrandTableauForDeepDive(
  layout: CardPlacement[],
  significatorPosition: number,
  gtLayout: GTLayout = "4x9",
): DeepDiveGTAnalysis {
  const mainLayout = layout.filter((placement) => placement.zone === "main");
  const cartoucheCards = getCartouchePlacements(layout);
  const effectiveSignificatorPosition = mainLayout.some((placement) => placement.position === significatorPosition)
    ? significatorPosition
    : (mainLayout[0]?.position ?? significatorPosition);

  const coord = getGTCoord(effectiveSignificatorPosition, gtLayout);
  if (!coord) {
    throw new Error(`Invalid significator position: ${effectiveSignificatorPosition}`);
  }

  const byPosition = placementMap(mainLayout);
  const rowLine = getRowPositions(effectiveSignificatorPosition, gtLayout)
    .map((position) => byPosition.get(position))
    .filter((placement): placement is CardPlacement => Boolean(placement));
  const columnLine = getColumnPositions(effectiveSignificatorPosition, gtLayout)
    .map((position) => byPosition.get(position))
    .filter((placement): placement is CardPlacement => Boolean(placement));
  const primaryCluster = buildCluster(mainLayout, effectiveSignificatorPosition, gtLayout, 1);
  const secondaryCluster = bestSecondaryCluster(
    mainLayout,
    effectiveSignificatorPosition,
    new Set(primaryCluster.positions),
    gtLayout,
  );

  return {
    significator: {
      position: effectiveSignificatorPosition,
      row: coord.row,
      col: coord.col,
    },
    surroundings: getImmediateSurroundings(mainLayout, effectiveSignificatorPosition, gtLayout),
    rowLine,
    columnLine,
    dominantDiagonal: dominantDiagonal(mainLayout, effectiveSignificatorPosition, gtLayout),
    mirrors: buildMirrors(mainLayout, effectiveSignificatorPosition, gtLayout),
    primaryCluster,
    secondaryCluster,
    quadrants: buildQuadrants(mainLayout, gtLayout),
    cartoucheCards,
  };
}
