import { describe, expect, it } from "vitest";
import {
  buildGrandTableauLayout,
  getCartouchePlacements,
  getKnightPositions,
  getDiagonalLine,
  classifyDistance,
  getProximityBuckets,
  getGTCoord,
  getGTPlacementCoord,
} from "@/lib/engine/gt";

describe("Grand Tableau computations", () => {
  const layout = buildGrandTableauLayout(Array.from({ length: 36 }, (_, index) => index + 1));
  const cartoucheLayout = buildGrandTableauLayout(Array.from({ length: 36 }, (_, index) => index + 1), "4x8+4");

  it("maps houses 1..36 to layout positions", () => {
    expect(layout).toHaveLength(36);
    expect(layout[0].houseId).toBe(1);
    expect(layout[35].houseId).toBe(36);
    expect(layout[0].cardId).toBe(1);
    expect(layout[35].cardId).toBe(36);
  });

  it("returns valid knight moves", () => {
    const knightsFrom19 = getKnightPositions(19);
    expect(knightsFrom19.length).toBeGreaterThan(0);
    expect(knightsFrom19.every((pos) => pos >= 1 && pos <= 36)).toBe(true);
  });

  it("computes diagonals through a position", () => {
    const diagonalA = getDiagonalLine(14, "nwse");
    const diagonalB = getDiagonalLine(14, "nesw");

    expect(diagonalA.includes(14)).toBe(true);
    expect(diagonalB.includes(14)).toBe(true);
    expect(diagonalA.length).toBeGreaterThan(2);
    expect(diagonalB.length).toBeGreaterThan(2);
  });

  it("classifies proximity using near/medium/far rules", () => {
    expect(classifyDistance(19, 20)).toBe("near");
    expect(classifyDistance(19, 3)).toBe("medium");
    expect(classifyDistance(19, 8)).toBe("far");
  });

  it("returns proximity buckets with all cards represented except self", () => {
    const buckets = getProximityBuckets(19, layout);
    const total = buckets.near.length + buckets.medium.length + buckets.far.length;
    expect(total).toBe(35);
  });

  it("maps final positions in 4x9 layout", () => {
    const coord35 = getGTCoord(35);
    const coord36 = getGTCoord(36);
    expect(coord35).toEqual({ row: 3, col: 7 });
    expect(coord36).toEqual({ row: 3, col: 8 });
  });

  it("maps 4x8+4 coordinates with cartouche zone", () => {
    expect(getGTPlacementCoord(32, "4x8+4")).toEqual({ row: 3, col: 7, zone: "main" });
    expect(getGTPlacementCoord(33, "4x8+4")).toEqual({ row: 4, col: 0, zone: "cartouche" });
    expect(getGTPlacementCoord(36, "4x8+4")).toEqual({ row: 4, col: 3, zone: "cartouche" });
    expect(getGTCoord(33, "4x8+4")).toBeNull();
  });

  it("extracts four cartouche cards in 4x8+4 layout", () => {
    const cartouche = getCartouchePlacements(cartoucheLayout);
    expect(cartouche).toHaveLength(4);
    expect(cartouche.map((placement) => placement.position)).toEqual([33, 34, 35, 36]);
    expect(cartouche.map((placement) => placement.zone)).toEqual(["cartouche", "cartouche", "cartouche", "cartouche"]);
  });
});
