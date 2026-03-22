import type { CardPlacement, GTLayout } from "@/lib/engine/types";

export interface GTCoord {
  row: number;
  col: number;
}

export interface GTPlacementCoord extends GTCoord {
  zone: "main" | "cartouche";
}

interface GTLayoutMeta {
  mainRows: number;
  mainCols: number;
  cartoucheStart: number | null;
  cartoucheCount: number;
}

const GT_LAYOUT_META: Record<GTLayout, GTLayoutMeta> = {
  "4x9": {
    mainRows: 4,
    mainCols: 9,
    cartoucheStart: null,
    cartoucheCount: 0,
  },
  "4x8+4": {
    mainRows: 4,
    mainCols: 8,
    cartoucheStart: 33,
    cartoucheCount: 4,
  },
};

const KNIGHT_OFFSETS: Array<[number, number]> = [
  [-2, -1],
  [-2, 1],
  [-1, -2],
  [-1, 2],
  [1, -2],
  [1, 2],
  [2, -1],
  [2, 1],
];

const ADJACENT_OFFSETS: Array<[number, number]> = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

export function getGTMainDimensions(gtLayout: GTLayout = "4x9"): { rows: number; cols: number } {
  const meta = GT_LAYOUT_META[gtLayout];
  return {
    rows: meta.mainRows,
    cols: meta.mainCols,
  };
}

export function getGTMainCardCount(gtLayout: GTLayout = "4x9"): number {
  const meta = GT_LAYOUT_META[gtLayout];
  return meta.mainRows * meta.mainCols;
}

export function getGTMainPositions(gtLayout: GTLayout = "4x9"): number[] {
  const count = getGTMainCardCount(gtLayout);
  return Array.from({ length: count }, (_, index) => index + 1);
}

export function getCartouchePositions(gtLayout: GTLayout = "4x9"): number[] {
  const meta = GT_LAYOUT_META[gtLayout];
  if (!meta.cartoucheStart || meta.cartoucheCount === 0) return [];
  return Array.from({ length: meta.cartoucheCount }, (_, index) => meta.cartoucheStart! + index);
}

export function getGTPlacementCoord(position: number, gtLayout: GTLayout = "4x9"): GTPlacementCoord | null {
  const meta = GT_LAYOUT_META[gtLayout];
  const mainCardCount = meta.mainRows * meta.mainCols;

  if (position >= 1 && position <= mainCardCount) {
    const zeroBased = position - 1;
    return {
      row: Math.floor(zeroBased / meta.mainCols),
      col: zeroBased % meta.mainCols,
      zone: "main",
    };
  }

  if (meta.cartoucheStart && position >= meta.cartoucheStart && position < meta.cartoucheStart + meta.cartoucheCount) {
    return {
      row: meta.mainRows,
      col: position - meta.cartoucheStart,
      zone: "cartouche",
    };
  }

  return null;
}

export function getGTCoord(position: number, gtLayout: GTLayout = "4x9"): GTCoord | null {
  const placement = getGTPlacementCoord(position, gtLayout);
  if (!placement || placement.zone !== "main") {
    return null;
  }
  return { row: placement.row, col: placement.col };
}

export function getGTPositionFromCoord(row: number, col: number, gtLayout: GTLayout = "4x9"): number | null {
  const meta = GT_LAYOUT_META[gtLayout];
  if (row < 0 || row >= meta.mainRows || col < 0 || col >= meta.mainCols) {
    return null;
  }

  return row * meta.mainCols + col + 1;
}

export function buildGrandTableauLayout(deck: number[], gtLayout: GTLayout = "4x9"): CardPlacement[] {
  const cards = deck.slice(0, 36);
  return cards.map((cardId, index) => {
    const position = index + 1;
    const coord = getGTPlacementCoord(position, gtLayout);
    if (!coord) {
      throw new Error(`Missing coordinate for position ${position}`);
    }

    return {
      position,
      cardId,
      houseId: position,
      row: coord.row,
      col: coord.col,
      zone: coord.zone,
    };
  });
}

export function getCartouchePlacements(layout: CardPlacement[]): CardPlacement[] {
  return layout.filter((placement) => placement.zone === "cartouche").sort((a, b) => a.position - b.position);
}

export function getKnightPositions(position: number, gtLayout: GTLayout = "4x9"): number[] {
  const coord = getGTCoord(position, gtLayout);
  if (!coord) {
    return [];
  }

  return KNIGHT_OFFSETS
    .map(([dr, dc]) => getGTPositionFromCoord(coord.row + dr, coord.col + dc, gtLayout))
    .filter((candidate): candidate is number => candidate !== null);
}

function collectDirectional(position: number, dr: number, dc: number, gtLayout: GTLayout): number[] {
  const start = getGTCoord(position, gtLayout);
  if (!start) {
    return [];
  }

  const output: number[] = [];
  let row = start.row + dr;
  let col = start.col + dc;

  while (true) {
    const next = getGTPositionFromCoord(row, col, gtLayout);
    if (!next) {
      break;
    }
    output.push(next);
    row += dr;
    col += dc;
  }

  return output;
}

export function getDiagonalLine(position: number, axis: "nwse" | "nesw", gtLayout: GTLayout = "4x9"): number[] {
  if (!getGTCoord(position, gtLayout)) {
    return [];
  }

  if (axis === "nwse") {
    const nw = collectDirectional(position, -1, -1, gtLayout).reverse();
    const se = collectDirectional(position, 1, 1, gtLayout);
    return [...nw, position, ...se];
  }

  const ne = collectDirectional(position, -1, 1, gtLayout).reverse();
  const sw = collectDirectional(position, 1, -1, gtLayout);
  return [...ne, position, ...sw];
}

export function getMainDiagonals(gtLayout: GTLayout = "4x9"): { primary: number[]; secondary: number[] } {
  const { rows, cols } = getGTMainDimensions(gtLayout);
  const diagonalLength = Math.min(rows, cols);

  const primary = Array.from({ length: diagonalLength }, (_, index) =>
    getGTPositionFromCoord(index, index, gtLayout),
  ).filter((candidate): candidate is number => candidate !== null);

  const secondary = Array.from({ length: diagonalLength }, (_, index) =>
    getGTPositionFromCoord(index, cols - 1 - index, gtLayout),
  ).filter((candidate): candidate is number => candidate !== null);

  return {
    primary,
    secondary,
  };
}

export function getAdjacentPositions(position: number, gtLayout: GTLayout = "4x9"): number[] {
  const coord = getGTCoord(position, gtLayout);
  if (!coord) {
    return [];
  }

  return ADJACENT_OFFSETS
    .map(([dr, dc]) => getGTPositionFromCoord(coord.row + dr, coord.col + dc, gtLayout))
    .filter((candidate): candidate is number => candidate !== null);
}

export function classifyDistance(fromPosition: number, toPosition: number, gtLayout: GTLayout = "4x9"): "near" | "medium" | "far" {
  const from = getGTCoord(fromPosition, gtLayout);
  const to = getGTCoord(toPosition, gtLayout);

  if (!from || !to) {
    return "far";
  }

  const chebyshev = Math.max(Math.abs(from.row - to.row), Math.abs(from.col - to.col));

  if (chebyshev <= 1) {
    return "near";
  }

  if (chebyshev <= 2) {
    return "medium";
  }

  return "far";
}

export function getProximityBuckets(
  position: number,
  layout: CardPlacement[],
  gtLayout: GTLayout = "4x9",
): {
  near: CardPlacement[];
  medium: CardPlacement[];
  far: CardPlacement[];
} {
  const near: CardPlacement[] = [];
  const medium: CardPlacement[] = [];
  const far: CardPlacement[] = [];
  const sourceCoord = getGTCoord(position, gtLayout);
  const placements = layout.filter((placement) => placement.zone === "main");

  if (!sourceCoord) {
    placements.forEach((placement) => {
      if (placement.position !== position) {
        far.push(placement);
      }
    });
    return { near, medium, far };
  }

  placements.forEach((placement) => {
    if (placement.position === position) {
      return;
    }

    const bucket = classifyDistance(position, placement.position, gtLayout);
    if (bucket === "near") near.push(placement);
    else if (bucket === "medium") medium.push(placement);
    else far.push(placement);
  });

  return { near, medium, far };
}

export function findCardPosition(layout: CardPlacement[], cardId: number): number | null {
  const found = layout.find((placement) => placement.cardId === cardId);
  return found ? found.position : null;
}

export function positionHasCard(layout: CardPlacement[], position: number, cardId: number): boolean {
  const found = layout.find((placement) => placement.position === position);
  return Boolean(found && found.cardId === cardId);
}

export function getRowPositions(position: number, gtLayout: GTLayout = "4x9"): number[] {
  const coord = getGTCoord(position, gtLayout);
  if (!coord) {
    return [];
  }

  const { cols } = getGTMainDimensions(gtLayout);
  return Array.from({ length: cols }, (_, col) => getGTPositionFromCoord(coord.row, col, gtLayout)).filter(
    (candidate): candidate is number => candidate !== null,
  );
}

export function getColumnPositions(position: number, gtLayout: GTLayout = "4x9"): number[] {
  const coord = getGTCoord(position, gtLayout);
  if (!coord) {
    return [];
  }

  const { rows } = getGTMainDimensions(gtLayout);
  return Array.from({ length: rows }, (_, row) => getGTPositionFromCoord(row, coord.col, gtLayout)).filter(
    (candidate): candidate is number => candidate !== null,
  );
}

export function getPathBetweenPositions(fromPosition: number, toPosition: number, gtLayout: GTLayout = "4x9"): number[] {
  const from = getGTCoord(fromPosition, gtLayout);
  const to = getGTCoord(toPosition, gtLayout);
  if (!from || !to) {
    return [];
  }

  const path = [fromPosition];
  let currentRow = from.row;
  let currentCol = from.col;

  while (currentCol !== to.col) {
    currentCol += currentCol < to.col ? 1 : -1;
    const pos = getGTPositionFromCoord(currentRow, currentCol, gtLayout);
    if (pos) path.push(pos);
  }

  while (currentRow !== to.row) {
    currentRow += currentRow < to.row ? 1 : -1;
    const pos = getGTPositionFromCoord(currentRow, currentCol, gtLayout);
    if (pos) path.push(pos);
  }

  return path;
}
