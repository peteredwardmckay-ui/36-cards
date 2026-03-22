import { describe, expect, it } from "vitest";
import { SUBJECT_DEFINITIONS } from "@/lib/content/subjects";
import {
  THEME_DEFINITIONS,
  THEME_IDS,
  SUBJECT_THEME_ORDER,
  inferThemeWeights,
  normalizeThemeSelection,
  resolveThemeForReading,
} from "@/lib/content/themes";

describe("theme taxonomy", () => {
  it("keeps canonical ids unique", () => {
    expect(THEME_IDS.length).toBeGreaterThan(100);
    expect(new Set(THEME_IDS).size).toBe(THEME_IDS.length);
    expect(THEME_DEFINITIONS).toHaveLength(THEME_IDS.length);
  });

  it("preserves canonical ordering under each subject", () => {
    SUBJECT_DEFINITIONS.forEach((subject) => {
      expect(SUBJECT_THEME_ORDER[subject.id]).toEqual(subject.defaultThemes);
    });
  });

  it("keeps subject boundary by normalizing invalid theme selections", () => {
    expect(normalizeThemeSelection("work", "study_path")).toBe("auto");
    expect(normalizeThemeSelection("education", "study_path")).toBe("study_path");
    expect(normalizeThemeSelection("pets", "environment_change")).toBe("environment_change");
    expect(normalizeThemeSelection("pets", "change")).toBe("auto");
    expect(normalizeThemeSelection("love", "nonexistent_theme")).toBe("auto");
  });

  it("infers weighted themes within selected subject scope only", () => {
    const inferred = inferThemeWeights("I am burned out and dealing with office politics at work", "work", 3);
    expect(inferred.length).toBeGreaterThan(0);
    const ids = inferred.map((item) => item.id);
    expect(ids).toContain("workplace_politics");
    expect(ids.every((themeId) => SUBJECT_THEME_ORDER.work.includes(themeId))).toBe(true);
  });

  it("resolves explicit theme selection over inferred weights", () => {
    const resolved = resolveThemeForReading({
      subjectId: "money",
      selectedThemeId: "debt",
      question: "I got a windfall and need to manage it",
    });
    expect(resolved.mode).toBe("explicit");
    expect(resolved.resolvedThemeId).toBe("debt");
    expect(resolved.inferred[0]?.id).toBe("debt");
  });

  it("applies subject-specific context notes for shared themes", () => {
    const travelDocuments = resolveThemeForReading({
      subjectId: "travel",
      selectedThemeId: "documents",
      question: "Do I have all my visa and itinerary details ready?",
    });
    expect(travelDocuments.subjectContextNote).toContain("tickets, visas, itineraries");

    const legalDocuments = resolveThemeForReading({
      subjectId: "legal_admin",
      selectedThemeId: "documents",
      question: "How should I handle contracts and filing paperwork?",
    });
    expect(legalDocuments.subjectContextNote).toContain("contracts, forms, filings");
  });

  it("promotes auto theme to explicit subject default when question is blank", () => {
    const resolved = resolveThemeForReading({
      subjectId: "work",
      selectedThemeId: "auto",
      question: "   ",
    });

    expect(resolved.mode).toBe("explicit");
    expect(resolved.selection).toBe("job_search");
    expect(resolved.resolvedThemeId).toBe("job_search");
    expect(resolved.subjectContextNote).toContain("Theme chosen from subject defaults.");
  });
});
