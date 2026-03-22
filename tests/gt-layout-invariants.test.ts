import { describe, expect, it } from "vitest";
import { analyzeGrandTableauForDeepDive } from "@/lib/engine/deepDive";
import {
  buildGrandTableauLayout,
  getCartouchePositions,
  getGTMainDimensions,
  getGTMainPositions,
  getGTPlacementCoord,
} from "@/lib/engine/gt";

describe("GT layout invariants", () => {
  const orderedDeck = Array.from({ length: 36 }, (_, index) => index + 1);

  it("validates 4x9 mapping invariants", () => {
    const layout = buildGrandTableauLayout(orderedDeck, "4x9");
    const dimensions = getGTMainDimensions("4x9");
    const mainPositions = getGTMainPositions("4x9");
    const cartouchePositions = getCartouchePositions("4x9");

    expect(layout).toHaveLength(36);
    expect(dimensions).toEqual({ rows: 4, cols: 9 });
    expect(mainPositions).toHaveLength(36);
    expect(cartouchePositions).toHaveLength(0);
    expect(layout.every((placement) => placement.zone === "main")).toBe(true);

    const uniqueCoords = new Set(layout.map((placement) => `${placement.row}:${placement.col}`));
    expect(uniqueCoords.size).toBe(36);
    expect(layout.every((placement) => placement.row >= 0 && placement.row < 4)).toBe(true);
    expect(layout.every((placement) => placement.col >= 0 && placement.col < 9)).toBe(true);
  });

  it("validates 4x8+4 mapping invariants", () => {
    const layout = buildGrandTableauLayout(orderedDeck, "4x8+4");
    const dimensions = getGTMainDimensions("4x8+4");
    const mainPositions = getGTMainPositions("4x8+4");
    const cartouchePositions = getCartouchePositions("4x8+4");

    const main = layout.filter((placement) => placement.zone === "main");
    const cartouche = layout.filter((placement) => placement.zone === "cartouche");

    expect(layout).toHaveLength(36);
    expect(dimensions).toEqual({ rows: 4, cols: 8 });
    expect(mainPositions).toHaveLength(32);
    expect(cartouchePositions).toEqual([33, 34, 35, 36]);
    expect(main).toHaveLength(32);
    expect(cartouche).toHaveLength(4);

    expect(main.every((placement) => placement.row >= 0 && placement.row < 4)).toBe(true);
    expect(main.every((placement) => placement.col >= 0 && placement.col < 8)).toBe(true);

    expect(cartouche.every((placement) => placement.row === 4)).toBe(true);
    expect(cartouche.map((placement) => placement.col)).toEqual([0, 1, 2, 3]);

    cartouchePositions.forEach((position) => {
      expect(getGTPlacementCoord(position, "4x8+4")?.zone).toBe("cartouche");
    });
  });

  it("keeps deep-dive main-grid analysis isolated from cartouche", () => {
    const layout = buildGrandTableauLayout(orderedDeck, "4x8+4");
    const analysis = analyzeGrandTableauForDeepDive(layout, 29, "4x8+4");

    expect(analysis.cartoucheCards).toHaveLength(4);
    expect(analysis.cartoucheCards.every((placement) => placement.zone === "cartouche")).toBe(true);

    expect(analysis.rowLine.every((placement) => placement.zone === "main")).toBe(true);
    expect(analysis.columnLine.every((placement) => placement.zone === "main")).toBe(true);
    expect(analysis.dominantDiagonal.placements.every((placement) => placement.zone === "main")).toBe(true);
    expect(analysis.primaryCluster.placements.every((placement) => placement.zone === "main")).toBe(true);
    expect(analysis.secondaryCluster?.placements.every((placement) => placement.zone === "main") ?? true).toBe(true);
    expect(
      analysis.mirrors.rowPairs.every(([left, right]) => left.zone === "main" && right.zone === "main"),
    ).toBe(true);
    expect(
      analysis.mirrors.columnPairs.every(([up, down]) => up.zone === "main" && down.zone === "main"),
    ).toBe(true);
    expect(analysis.quadrants.every((quadrant) => quadrant.placements.every((placement) => placement.zone === "main"))).toBe(
      true,
    );
  });

  it("falls back to a main-grid anchor if a cartouche position is passed as significator", () => {
    const layout = buildGrandTableauLayout(orderedDeck, "4x8+4");
    const analysis = analyzeGrandTableauForDeepDive(layout, 33, "4x8+4");

    expect(analysis.significator.position).toBeLessThanOrEqual(32);
    expect(analysis.rowLine).toHaveLength(8);
    expect(analysis.columnLine).toHaveLength(4);
    expect(analysis.rowLine.every((placement) => placement.position <= 32)).toBe(true);
    expect(analysis.columnLine.every((placement) => placement.position <= 32)).toBe(true);
  });
});
