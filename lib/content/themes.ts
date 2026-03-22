import { SUBJECT_DEFINITIONS } from "@/lib/content/subjects";
import type { SubjectId } from "@/lib/engine/types";

export const THEME_TAXONOMY_VERSION = "v1";

export const THEME_IDS = [
  "clarity",
  "timing",
  "hidden_factors",
  "decision",
  "change",
  "environment_change",
  "support",
  "delay",
  "closure",
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
  "financial_pressure",
  "unexpected_gain",
  "cashflow",
  "investment_caution",
  "business_growth",
  "debt",
  "shared_resources",
  "financial_independence",
  "relocation",
  "family_tension",
  "caregiving",
  "household_stability",
  "children",
  "repair_or_renovation",
  "protection",
  "independence_at_home",
  "friendship",
  "social_tension",
  "group_dynamics",
  "networks",
  "gossip_or_hidden_factors",
  "belonging",
  "healing",
  "patterns",
  "self_trust",
  "transition",
  "independence",
  "grounding",
  "energy",
  "recovery",
  "stress_load",
  "routine",
  "rest",
  "wellbeing",
  "behavior",
  "bonding",
  "comfort",
  "inspiration",
  "creative_block",
  "momentum",
  "visibility",
  "collaboration",
  "craft",
  "risk",
  "completion",
  "planning",
  "delays",
  "safe_travel",
  "opportunity",
  "documents",
  "study_path",
  "applications",
  "exams",
  "qualification",
  "mentorship",
  "skill_building",
  "focus",
  "intuition",
  "alignment",
  "sacred_timing",
  "signs",
  "discernment",
  "practice",
  "audience",
  "shared_purpose",
  "collective_support",
  "group_tension",
  "participation",
  "contracts",
  "deadlines",
  "approvals",
  "bureaucracy",
  "compliance",
  "disputes",
  "resolution",
  "vocation",
  "right_path",
  "meaning",
  "long_term_direction",
  "service",
  "calling_shift",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];
export type ThemeSelection = "auto" | ThemeId;

export interface ThemeDefinition {
  id: ThemeId;
  displayLabel: string;
  description: string;
  allowedSubjects: SubjectId[];
  aliases: string[];
  active: boolean;
}

export interface ThemeBoundaryGuard {
  id: string;
  left: ThemeId;
  right: ThemeId;
  boundary: string;
}

export interface ThemeWeight {
  id: ThemeId;
  label: string;
  weight: number;
}

export interface ThemeRetrievalRules {
  hardMatch: Array<"subject_id" | "technique">;
  softWeighting: Array<
    "theme_explicit_selection" | "theme_inferred_weight" | "theme_alias_match" | "effect_tags" | "tone_preference" | "positional_relevance"
  >;
  downrankOrExclude: string[];
}

const THEME_SET = new Set<string>(THEME_IDS);

const LABEL_OVERRIDES: Partial<Record<ThemeId, string>> = {
  ending_or_separation: "Ending or Separation",
  third_party: "Third-Party Influence",
  self_trust: "Self Trust",
  stress_load: "Stress Load",
  safe_travel: "Safe Travel",
  long_term_direction: "Long-Term Direction",
};

const THEME_ALIAS_OVERRIDES: Partial<Record<ThemeId, string[]>> = {
  hidden_factors: ["unknown factors", "blind spot", "behind the scenes"],
  delay: ["hold up", "slowdown", "postponed"],
  new_connection: ["new love", "new person", "someone new"],
  communication: ["talking", "message", "conversation"],
  ending_or_separation: ["breakup", "separation", "parting", "ending"],
  job_search: ["new job", "job hunt", "finding work"],
  workplace_politics: ["office politics", "team politics", "power dynamics"],
  contract_matters: ["employment contract", "terms of role", "job contract"],
  career_change: ["career pivot", "career switch", "new direction at work"],
  financial_pressure: ["money stress", "budget pressure", "financial strain"],
  unexpected_gain: ["windfall", "surprise income", "bonus"],
  cashflow: ["cash flow", "income flow", "money flow"],
  investment_caution: ["investment risk", "market caution", "speculation"],
  shared_resources: ["shared money", "joint finances", "shared budget"],
  financial_independence: ["self-support", "independent income", "financial freedom"],
  household_stability: ["stable home", "household security", "home stability"],
  repair_or_renovation: ["home repairs", "renovation", "fixing house"],
  independence_at_home: ["space at home", "autonomy at home", "domestic boundaries"],
  social_tension: ["friend tension", "social friction", "awkward social dynamic"],
  gossip_or_hidden_factors: ["gossip", "rumors", "social secrecy"],
  patterns: ["recurring pattern", "loop", "repeated behavior"],
  self_trust: ["trust myself", "self belief", "inner trust"],
  environment_change: ["change in environment", "surroundings shift", "home environment shift", "adjustment period"],
  stress_load: ["stress levels", "overload", "strain"],
  wellbeing: ["well-being", "wellness", "overall health"],
  behavior: ["pet behavior", "animal behavior", "behaviour"],
  bonding: ["bond", "attachment", "connection with pet"],
  creative_block: ["artist block", "creative stuck", "writer block"],
  completion: ["finish", "ship project", "wrap up"],
  safe_travel: ["travel safety", "safe journey", "safe trip"],
  documents: ["paperwork", "forms", "official papers"],
  study_path: ["study direction", "learning path", "course path"],
  skill_building: ["develop skills", "build skills", "upskill"],
  sacred_timing: ["divine timing", "sacred timing", "right spiritual time"],
  shared_purpose: ["common mission", "group purpose", "shared mission"],
  collective_support: ["community support", "group support", "collective care"],
  vocation: ["calling", "vocation path", "life work"],
  right_path: ["right direction", "correct path", "true path"],
  long_term_direction: ["long term path", "future direction", "big direction"],
  calling_shift: ["calling change", "purpose shift", "vocation shift"],
};

const THEME_SCOPE_OVERRIDES: Partial<Record<ThemeId, string>> = {
  clarity: "Highlights where clearer information or framing is needed before action.",
  timing: "Focuses on cadence, pacing, and when actions are most effective.",
  hidden_factors: "Surfaces influences that are active but not yet fully visible.",
  decision: "Prioritizes choice quality, criteria, and commitment to a path.",
  environment_change: "Focuses on adaptation to shifts in surroundings, routine context, or care environment.",
  conflict: "Frames tension as information about boundaries, needs, or incentives.",
  ending_or_separation: "Covers closure, parting, and transitions after relational completion.",
  workplace_politics: "Tracks power, influence, and informal dynamics at work.",
  financial_pressure: "Centers affordability, strain, and resource constraints.",
  stress_load: "Assesses cumulative strain and sustainable pacing needs.",
  safe_travel: "Emphasizes practical precautions and secure movement.",
};

function toTitleCase(words: string): string {
  return words
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (word.length <= 2) return word.toUpperCase();
      return `${word[0].toUpperCase()}${word.slice(1)}`;
    })
    .join(" ");
}

function themeDisplayLabel(themeId: ThemeId): string {
  return LABEL_OVERRIDES[themeId] ?? toTitleCase(themeId.replaceAll("_", " "));
}

function normalizeTerm(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function uniqueTerms(values: string[]): string[] {
  return Array.from(new Set(values.map(normalizeTerm).filter((item) => item.length > 0)));
}

function baseAliases(themeId: ThemeId): string[] {
  return uniqueTerms([
    themeId,
    themeId.replaceAll("_", " "),
    themeDisplayLabel(themeId),
    ...themeId.split("_"),
    ...(THEME_ALIAS_OVERRIDES[themeId] ?? []),
  ]).filter((term) => term.length >= 3);
}

const ALLOWED_SUBJECT_SET_BY_THEME = THEME_IDS.reduce<Record<ThemeId, Set<SubjectId>>>((acc, themeId) => {
  acc[themeId] = new Set<SubjectId>();
  return acc;
}, {} as Record<ThemeId, Set<SubjectId>>);

SUBJECT_DEFINITIONS.forEach((subject) => {
  subject.defaultThemes.forEach((themeIdRaw) => {
    if (!THEME_SET.has(themeIdRaw)) {
      throw new Error(`Unknown theme id in subject "${subject.id}": ${themeIdRaw}`);
    }
    ALLOWED_SUBJECT_SET_BY_THEME[themeIdRaw as ThemeId].add(subject.id);
  });
});

export const SUBJECT_THEME_ORDER: Record<SubjectId, ThemeId[]> = SUBJECT_DEFINITIONS.reduce(
  (acc, subject) => {
    acc[subject.id] = subject.defaultThemes.map((themeIdRaw) => {
      if (!THEME_SET.has(themeIdRaw)) {
        throw new Error(`Unknown theme id in subject "${subject.id}": ${themeIdRaw}`);
      }
      return themeIdRaw as ThemeId;
    });
    return acc;
  },
  {} as Record<SubjectId, ThemeId[]>,
);

export const THEME_DEFINITIONS: ThemeDefinition[] = THEME_IDS.map((themeId) => {
  const displayLabel = themeDisplayLabel(themeId);
  const allowedSubjects = Array.from(ALLOWED_SUBJECT_SET_BY_THEME[themeId]);
  const description =
    THEME_SCOPE_OVERRIDES[themeId] ??
    `Interpretive lens focused on ${displayLabel.toLowerCase()} signals within the selected subject scope.`;

  return {
    id: themeId,
    displayLabel,
    description,
    allowedSubjects,
    aliases: baseAliases(themeId),
    active: true,
  };
});

export const THEME_BY_ID = new Map(THEME_DEFINITIONS.map((theme) => [theme.id, theme]));

export const THEME_BOUNDARY_GUARDS: ThemeBoundaryGuard[] = [
  {
    id: "work_vs_education_pathing",
    left: "job_search",
    right: "study_path",
    boundary: "Use work-path themes for employment conditions; use education-path themes for learning/qualification context.",
  },
  {
    id: "work_vs_purpose_path",
    left: "career_change",
    right: "right_path",
    boundary: "Career themes cover practical role shifts; purpose themes cover long-range vocation alignment.",
  },
  {
    id: "personal_growth_vs_spiritual",
    left: "healing",
    right: "intuition",
    boundary: "Personal growth is psychological/emotional development; spiritual themes require metaphysical framing.",
  },
  {
    id: "friends_vs_community",
    left: "friendship",
    right: "shared_purpose",
    boundary: "Friends themes stay in immediate peer dynamics; community themes address wider collective participation.",
  },
  {
    id: "money_vs_legal_admin",
    left: "cashflow",
    right: "contracts",
    boundary: "Money themes prioritize resource flow; legal/admin themes prioritize procedural obligations and documents.",
  },
  {
    id: "home_vs_pets",
    left: "household_stability",
    right: "wellbeing",
    boundary: "Home/family themes cover domestic systems; pet themes apply only when the animal companion is focal.",
  },
];

export const THEME_RETRIEVAL_RULES: ThemeRetrievalRules = {
  hardMatch: ["subject_id", "technique"],
  softWeighting: ["theme_explicit_selection", "theme_inferred_weight", "theme_alias_match", "effect_tags", "tone_preference", "positional_relevance"],
  downrankOrExclude: [
    "Suppress themes that are not allowed for the selected subject.",
    "For shared theme IDs, require subject-specific framing instead of cross-domain phrasing.",
    "Suppress unsupported domain shifts when spread evidence is weak.",
    "Suppress repeated theme phrasing already used recently in this reading.",
    "Suppress low-confidence inferred themes when an explicit theme is selected.",
  ],
};

const SHARED_THEME_SUBJECT_CONTEXT: Partial<Record<ThemeId, Partial<Record<SubjectId, string>>>> = {
  documents: {
    travel: "In Travel, documents refers to tickets, visas, itineraries, and movement formalities.",
    legal_admin: "In Legal / Admin, documents refers to contracts, forms, filings, and procedural paperwork.",
  },
  commitment: {
    love: "In Love, commitment refers to relational bond, reciprocity, and partnership intention.",
    purpose_calling: "In Purpose / Calling, commitment refers to sustained devotion to path, craft, and vocation.",
  },
};

export function isThemeId(value: string): value is ThemeId {
  return THEME_SET.has(value);
}

export function getThemeDefinition(themeId: ThemeId): ThemeDefinition {
  const theme = THEME_BY_ID.get(themeId);
  if (!theme) {
    throw new Error(`Unknown theme id: ${themeId}`);
  }
  return theme;
}

export function getSubjectThemes(subjectId: SubjectId): ThemeDefinition[] {
  return SUBJECT_THEME_ORDER[subjectId].map((themeId) => getThemeDefinition(themeId));
}

export function isThemeAllowedForSubject(themeId: ThemeId, subjectId: SubjectId): boolean {
  return ALLOWED_SUBJECT_SET_BY_THEME[themeId].has(subjectId);
}

export function normalizeThemeSelection(subjectId: SubjectId, rawSelection: string | undefined | null): ThemeSelection {
  if (!rawSelection || rawSelection === "auto") return "auto";
  if (!isThemeId(rawSelection)) return "auto";
  return isThemeAllowedForSubject(rawSelection, subjectId) ? rawSelection : "auto";
}

function scoreTheme(question: string, themeId: ThemeId, orderIndex: number): number {
  const normalizedQuestion = normalizeTerm(question);
  if (!normalizedQuestion) return 0;

  const theme = getThemeDefinition(themeId);
  let score = Math.max(0.05, 0.35 - orderIndex * 0.02);

  theme.aliases.forEach((alias) => {
    if (alias.length < 3) return;
    if (normalizedQuestion.includes(alias)) {
      score += alias.includes(" ") ? 1.4 : 0.75;
    }
  });

  const words = new Set(normalizedQuestion.split(" "));
  themeId.split("_").forEach((token) => {
    if (token.length >= 4 && words.has(token)) {
      score += 0.45;
    }
  });

  return Number(score.toFixed(3));
}

export function inferThemeWeights(question: string, subjectId: SubjectId, limit = 5): ThemeWeight[] {
  const ordered = SUBJECT_THEME_ORDER[subjectId];
  if (!ordered.length) return [];

  const scored = ordered.map((themeId, index) => ({
    id: themeId,
    label: getThemeDefinition(themeId).displayLabel,
    weight: scoreTheme(question, themeId, index),
  }));

  const sorted = scored.sort((a, b) => b.weight - a.weight);
  const positive = sorted.filter((item) => item.weight > 0.2);
  const usable = positive.length ? positive : sorted;
  return usable.slice(0, Math.max(1, Math.min(limit, usable.length)));
}

export interface ThemeResolutionInput {
  subjectId: SubjectId;
  question: string;
  selectedThemeId?: string | null;
}

export interface ThemeResolution {
  selection: ThemeSelection;
  mode: "explicit" | "inferred";
  resolvedThemeId: ThemeId | null;
  resolvedThemeLabel: string | null;
  subjectContextNote: string | null;
  inferred: ThemeWeight[];
}

function getThemeSubjectContext(themeId: ThemeId | null, subjectId: SubjectId): string | null {
  if (!themeId) return null;
  return SHARED_THEME_SUBJECT_CONTEXT[themeId]?.[subjectId] ?? null;
}

export function resolveThemeForReading(input: ThemeResolutionInput): ThemeResolution {
  const selection = normalizeThemeSelection(input.subjectId, input.selectedThemeId);
  const inferred = inferThemeWeights(input.question, input.subjectId);
  const normalizedQuestion = normalizeTerm(input.question);
  const isQuestionBlank = normalizedQuestion.length === 0;

  if (selection === "auto" && isQuestionBlank) {
    const defaultThemeId = SUBJECT_THEME_ORDER[input.subjectId][0] ?? null;
    const defaultContext = getThemeSubjectContext(defaultThemeId, input.subjectId);
    const defaultNote = "Theme chosen from subject defaults.";

    if (!defaultThemeId) {
      return {
        selection,
        mode: "inferred",
        resolvedThemeId: null,
        resolvedThemeLabel: null,
        subjectContextNote: defaultNote,
        inferred: [],
      };
    }

    const defaultTheme = getThemeDefinition(defaultThemeId);
    const inferredWithDefault = [
      { id: defaultTheme.id, label: defaultTheme.displayLabel, weight: 1.5 },
      ...inferred.filter((item) => item.id !== defaultTheme.id),
    ].slice(0, 5);

    return {
      selection: defaultTheme.id,
      mode: "explicit",
      resolvedThemeId: defaultTheme.id,
      resolvedThemeLabel: defaultTheme.displayLabel,
      subjectContextNote: defaultContext ? `${defaultNote} ${defaultContext}` : defaultNote,
      inferred: inferredWithDefault,
    };
  }

  if (selection !== "auto") {
    const explicit = getThemeDefinition(selection);
    const inferredWithExplicit = [
      {
        id: explicit.id,
        label: explicit.displayLabel,
        weight: 1.5,
      },
      ...inferred.filter((item) => item.id !== explicit.id),
    ].slice(0, 5);

    return {
      selection,
      mode: "explicit",
      resolvedThemeId: explicit.id,
      resolvedThemeLabel: explicit.displayLabel,
      subjectContextNote: getThemeSubjectContext(explicit.id, input.subjectId),
      inferred: inferredWithExplicit,
    };
  }

  const fallback = inferred[0]?.id ?? SUBJECT_THEME_ORDER[input.subjectId][0] ?? null;
  return {
    selection,
    mode: "inferred",
    resolvedThemeId: fallback,
    resolvedThemeLabel: fallback ? getThemeDefinition(fallback).displayLabel : null,
    subjectContextNote: getThemeSubjectContext(fallback, input.subjectId),
    inferred,
  };
}
