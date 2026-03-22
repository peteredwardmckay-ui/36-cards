import type { SubjectId } from "@/lib/engine/types";

interface PublicSubjectDefinition {
  id: SubjectId;
  displayLabel: string;
  defaultThemes: string[];
}

const PUBLIC_SUBJECT_DEFINITIONS: PublicSubjectDefinition[] = [
  {
    id: "general_reading",
    displayLabel: "General Reading",
    defaultThemes: ["clarity", "timing", "hidden_factors", "decision", "change", "support", "delay", "closure"],
  },
  {
    id: "love",
    displayLabel: "Love",
    defaultThemes: [
      "new_connection",
      "flirtation",
      "communication",
      "trust",
      "distance",
      "commitment",
      "reconciliation",
      "third_party",
      "conflict",
      "ending_or_separation",
      "closure",
      "timing",
    ],
  },
  {
    id: "work",
    displayLabel: "Work",
    defaultThemes: [
      "job_search",
      "promotion",
      "workplace_politics",
      "leadership",
      "burnout",
      "contract_matters",
      "career_change",
      "recognition",
      "boundaries",
      "stability",
    ],
  },
  {
    id: "money",
    displayLabel: "Money",
    defaultThemes: [
      "financial_pressure",
      "unexpected_gain",
      "cashflow",
      "investment_caution",
      "business_growth",
      "debt",
      "shared_resources",
      "financial_independence",
      "timing",
    ],
  },
  {
    id: "home_family",
    displayLabel: "Home & Family",
    defaultThemes: [
      "relocation",
      "family_tension",
      "caregiving",
      "household_stability",
      "children",
      "repair_or_renovation",
      "protection",
      "independence_at_home",
      "closure",
    ],
  },
  {
    id: "friends_social",
    displayLabel: "Friends & Social",
    defaultThemes: [
      "friendship",
      "social_tension",
      "reconciliation",
      "group_dynamics",
      "networks",
      "gossip_or_hidden_factors",
      "belonging",
      "boundaries",
      "support",
    ],
  },
  {
    id: "personal_growth",
    displayLabel: "Personal Growth",
    defaultThemes: [
      "boundaries",
      "healing",
      "clarity",
      "decision",
      "patterns",
      "self_trust",
      "transition",
      "independence",
      "grounding",
      "protection",
    ],
  },
  {
    id: "health",
    displayLabel: "Health",
    defaultThemes: ["energy", "recovery", "stress_load", "support", "routine", "rest", "stability", "timing"],
  },
  {
    id: "pets",
    displayLabel: "Pets",
    defaultThemes: ["wellbeing", "behavior", "bonding", "routine", "environment_change", "recovery", "comfort", "protection"],
  },
  {
    id: "creative",
    displayLabel: "Creative",
    defaultThemes: ["inspiration", "creative_block", "momentum", "visibility", "recognition", "collaboration", "craft", "risk", "completion"],
  },
  {
    id: "travel",
    displayLabel: "Travel",
    defaultThemes: ["planning", "delays", "safe_travel", "relocation", "distance", "opportunity", "documents", "timing"],
  },
  {
    id: "education",
    displayLabel: "Education",
    defaultThemes: [
      "study_path",
      "applications",
      "exams",
      "qualification",
      "mentorship",
      "skill_building",
      "completion",
      "focus",
      "timing",
    ],
  },
  {
    id: "spiritual",
    displayLabel: "Spiritual",
    defaultThemes: ["intuition", "alignment", "trust", "sacred_timing", "signs", "discernment", "practice", "protection"],
  },
  {
    id: "community",
    displayLabel: "Community",
    defaultThemes: ["belonging", "audience", "shared_purpose", "collective_support", "group_tension", "visibility", "participation", "networks"],
  },
  {
    id: "legal_admin",
    displayLabel: "Legal / Admin",
    defaultThemes: ["documents", "contracts", "deadlines", "approvals", "bureaucracy", "compliance", "disputes", "resolution"],
  },
  {
    id: "purpose_calling",
    displayLabel: "Purpose / Calling",
    defaultThemes: ["vocation", "alignment", "right_path", "meaning", "long_term_direction", "service", "calling_shift", "commitment"],
  },
];

const PUBLIC_SUBJECT_MAP = new Map(PUBLIC_SUBJECT_DEFINITIONS.map((subject) => [subject.id, subject]));

const THEME_LABEL_OVERRIDES: Record<string, string> = {
  ending_or_separation: "Ending or Separation",
  third_party: "Third-Party Influence",
  self_trust: "Self Trust",
  stress_load: "Stress Load",
  safe_travel: "Safe Travel",
  long_term_direction: "Long-Term Direction",
};

function themeDisplayLabel(themeId: string): string {
  const override = THEME_LABEL_OVERRIDES[themeId];
  if (override) return override;

  return themeId
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");
}

export const PUBLIC_SUBJECT_UI_GRID_ORDER: SubjectId[][] = [
  ["general_reading", "love", "work", "money"],
  ["home_family", "friends_social", "personal_growth", "health"],
  ["pets", "creative", "travel", "education"],
  ["spiritual", "community", "legal_admin", "purpose_calling"],
];

export function isPublicSubjectId(value: string): value is SubjectId {
  return PUBLIC_SUBJECT_MAP.has(value as SubjectId);
}

export function getPublicSubjectDefinition(subjectId: SubjectId): { id: SubjectId; displayLabel: string } {
  const subject = PUBLIC_SUBJECT_MAP.get(subjectId);
  if (!subject) {
    throw new Error(`Unknown subject id: ${subjectId}`);
  }

  return {
    id: subject.id,
    displayLabel: subject.displayLabel,
  };
}

export function getPublicSubjectThemes(subjectId: SubjectId): Array<{ id: string; displayLabel: string }> {
  const subject = PUBLIC_SUBJECT_MAP.get(subjectId);
  if (!subject) {
    return [];
  }

  return subject.defaultThemes.map((id) => ({
    id,
    displayLabel: themeDisplayLabel(id),
  }));
}

export function normalizePublicThemeSelection(
  subjectId: SubjectId,
  rawSelection: string | undefined | null,
): "auto" | string {
  if (!rawSelection || rawSelection === "auto") return "auto";

  const allowed = PUBLIC_SUBJECT_MAP.get(subjectId)?.defaultThemes ?? [];
  return allowed.includes(rawSelection) ? rawSelection : "auto";
}
