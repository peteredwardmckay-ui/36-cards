import { describe, expect, it } from "vitest";
import {
  SUBJECT_BOUNDARY_GUARDS,
  SUBJECT_DEFINITIONS,
  SUBJECT_UI_GRID_ORDER,
  SUBJECT_UI_ORDER,
} from "@/lib/content/subjects";

describe("subject taxonomy", () => {
  it("has canonical v1 subject count and unique ids", () => {
    expect(SUBJECT_DEFINITIONS).toHaveLength(16);
    const ids = SUBJECT_DEFINITIONS.map((subject) => subject.id);
    expect(new Set(ids).size).toBe(16);
  });

  it("keeps canonical UI order and 4x4 grid", () => {
    expect(SUBJECT_UI_GRID_ORDER).toHaveLength(4);
    SUBJECT_UI_GRID_ORDER.forEach((row) => expect(row).toHaveLength(4));

    const flatGrid = SUBJECT_UI_GRID_ORDER.flat();
    expect(flatGrid).toEqual(SUBJECT_UI_ORDER);
  });

  it("includes required boundary guards", () => {
    const pairs = SUBJECT_BOUNDARY_GUARDS.map((guard) => `${guard.left}:${guard.right}`);
    expect(pairs).toContain("work:education");
    expect(pairs).toContain("work:purpose_calling");
    expect(pairs).toContain("personal_growth:spiritual");
    expect(pairs).toContain("friends_social:community");
    expect(pairs).toContain("home_family:pets");
    expect(pairs).toContain("creative:education");
    expect(pairs).toContain("money:legal_admin");
  });
});
