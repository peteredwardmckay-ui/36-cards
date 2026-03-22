import type { Domain, SubjectId } from "@/lib/engine/types";

export const SUBJECT_TAXONOMY_VERSION = "v1";

export interface SubjectDefinition {
  id: SubjectId;
  displayLabel: string;
  scope: string;
  includes: string[];
  excludes: string[];
  useWhen: string;
  notes?: string;
  defaultThemes: string[];
  priority: number;
  active: boolean;
  fallbackDomain: Domain;
}

export interface SubjectBoundaryGuard {
  id: string;
  left: SubjectId;
  right: SubjectId;
  leftBoundary: string;
  rightBoundary: string;
}

export interface SubjectRetrievalRules {
  hardMatch: Array<"subject_id" | "technique">;
  softWeighting: Array<"theme_id" | "effect_tags" | "tone_preference" | "intensity" | "positional_relevance">;
  downrankOrExclude: string[];
}

// Canonical v1 subject taxonomy for 36cards.
// Source of truth: authored taxonomy spec (scope/includes/excludes/overlap/UI order).
export const SUBJECT_DEFINITIONS: SubjectDefinition[] = [
  {
    id: "general_reading",
    displayLabel: "General Reading",
    scope: "A broad, non-specialized reading when the user wants an overall picture rather than a single life domain.",
    includes: ["mixed concerns", "unclear focus", "general energy", "overall direction", "what should I know"],
    excludes: ["deep specialization in one domain unless a dominant pattern emerges"],
    useWhen: "Use when no subject is selected, multiple domains are equally active, or the user wants a broad read.",
    notes: "Best default fallback subject.",
    defaultThemes: ["clarity", "timing", "hidden_factors", "decision", "change", "support", "delay", "closure"],
    priority: 1,
    active: true,
    fallbackDomain: "general",
  },
  {
    id: "love",
    displayLabel: "Love",
    scope: "Romantic connection, attraction, partnership, intimacy, emotional reciprocity, and relationship development.",
    includes: ["dating", "exes", "reconciliation", "commitment", "conflict", "chemistry", "emotional distance"],
    excludes: ["friendships unless clearly romanticized", "family bonds unless the user is asking relationally rather than domestically"],
    useWhen: "Use when the question is about romance, a partner, a crush, an ex, or the future of a relationship.",
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
    priority: 2,
    active: true,
    fallbackDomain: "love",
  },
  {
    id: "work",
    displayLabel: "Work",
    scope: "Employment, career environment, job conditions, coworkers, professional direction, and workplace dynamics.",
    includes: ["job search", "current role", "bosses", "office politics", "career advancement", "contracts in an employment context"],
    excludes: ["formal study or training as primary focus", "deeper life purpose beyond practical career questions"],
    useWhen: "Use when the issue centers on a job, workplace, employer, or professional trajectory.",
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
    priority: 3,
    active: true,
    fallbackDomain: "work",
  },
  {
    id: "money",
    displayLabel: "Money",
    scope: "Financial conditions, income, expenses, cashflow, business resources, and material security.",
    includes: ["earnings", "debt", "budgeting pressure", "windfalls", "shared finances", "financial timing"],
    excludes: ["job politics unless money is the core issue", "legal formalities unless primarily financial"],
    useWhen: "Use when the main concern is resources, affordability, flow, or material outcomes.",
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
    priority: 4,
    active: true,
    fallbackDomain: "general",
  },
  {
    id: "home_family",
    displayLabel: "Home & Family",
    scope: "Domestic life, household conditions, relatives, caregiving, family systems, and private living arrangements.",
    includes: ["family tension", "children", "moving house", "domestic repair", "home stability", "autonomy in family life"],
    excludes: ["friendship groups", "pets unless animal care is the primary concern"],
    useWhen: "Use when the question concerns relatives, the household, living situation, or emotional dynamics at home.",
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
    priority: 5,
    active: true,
    fallbackDomain: "general",
  },
  {
    id: "friends_social",
    displayLabel: "Friends & Social",
    scope: "Friendships, social circles, peer dynamics, invitations, social trust, and interpersonal belonging.",
    includes: ["friendship strain", "group dynamics", "social support", "gossip", "exclusion", "reconnection with friends"],
    excludes: ["romance unless clearly romantic", "public civic or collective belonging at scale (use Community)"],
    useWhen: "Use when the issue is about friends, peers, or one's immediate social environment.",
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
    priority: 6,
    active: true,
    fallbackDomain: "general",
  },
  {
    id: "personal_growth",
    displayLabel: "Personal Growth",
    scope: "Inner development, self-awareness, emotional patterning, boundaries, resilience, and personal change.",
    includes: ["healing", "self-trust", "recurring patterns", "decisions", "transition", "grounding"],
    excludes: ["explicitly spiritual or metaphysical framing unless the user is asking that way", "job-specific career outcomes"],
    useWhen: "Use when the question is inward-facing and about development rather than external events alone.",
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
    priority: 7,
    active: true,
    fallbackDomain: "general",
  },
  {
    id: "health",
    displayLabel: "Health",
    scope: "Wellbeing, energy, recovery, stress load, pacing, support, and physical or emotional condition in a non-diagnostic way.",
    includes: ["rest", "recovery rhythm", "strain", "routines", "resilience", "support needs"],
    excludes: ["diagnosis", "medical certainty", "treatment instructions"],
    useWhen: "Use when the user asks about wellbeing, energy, recovery, or body-mind strain.",
    notes: "Must use extra-safe language.",
    defaultThemes: ["energy", "recovery", "stress_load", "support", "routine", "rest", "stability", "timing"],
    priority: 8,
    active: true,
    fallbackDomain: "general",
  },
  {
    id: "pets",
    displayLabel: "Pets",
    scope: "Animal companions, their wellbeing, behavior, routines, bonds, comfort, and care conditions.",
    includes: ["a pet's stress", "recovery", "adjustment", "care rhythm", "emotional bond"],
    excludes: ["broader household issues unless the pet is the focal point"],
    useWhen: "Use when the question is specifically about an animal companion.",
    defaultThemes: ["wellbeing", "behavior", "bonding", "routine", "environment_change", "recovery", "comfort", "protection"],
    priority: 9,
    active: true,
    fallbackDomain: "general",
  },
  {
    id: "creative",
    displayLabel: "Creative",
    scope: "Artistic work, making, writing, design, creative momentum, expression, collaboration, and audience-facing output.",
    includes: ["inspiration", "block", "completion", "visibility", "craft", "experimentation", "recognition of creative work"],
    excludes: ["formal coursework unless learning is primary (use Education)", "abstract vocation questions (use Purpose / Calling)"],
    useWhen: "Use when the question concerns a creative project, artistic output, or making process.",
    defaultThemes: ["inspiration", "creative_block", "momentum", "visibility", "recognition", "collaboration", "craft", "risk", "completion"],
    priority: 10,
    active: true,
    fallbackDomain: "general",
  },
  {
    id: "travel",
    displayLabel: "Travel",
    scope: "Trips, journeys, movement, distance, relocation logistics, timing, and travel-related uncertainty.",
    includes: ["planning", "delays", "documents", "safe movement", "opportunities tied to travel", "temporary journeys"],
    excludes: ["permanent domestic relocation as family/home issue unless travel itself is central"],
    useWhen: "Use when the question is about a trip, journey, transit, or movement between places.",
    defaultThemes: ["planning", "delays", "safe_travel", "relocation", "distance", "opportunity", "documents", "timing"],
    priority: 11,
    active: true,
    fallbackDomain: "general",
  },
  {
    id: "education",
    displayLabel: "Education",
    scope: "Study, training, courses, qualifications, exams, mentorship in a learning context, and skill-building.",
    includes: ["school", "university", "professional development", "accreditation", "tests", "applications", "teachers"],
    excludes: ["workplace advancement unless the focus is the job rather than learning", "creative output unless learning is the core frame"],
    useWhen: "Use when the primary question is about learning, study, or formal/informal education.",
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
    priority: 12,
    active: true,
    fallbackDomain: "general",
  },
  {
    id: "spiritual",
    displayLabel: "Spiritual",
    scope: "Intuition, symbolic meaning, faith, inner guidance, sacred timing, and metaphysical alignment.",
    includes: ["signs", "trust in guidance", "spiritual practice", "inner alignment", "intuitive discernment"],
    excludes: ["general self-development without metaphysical framing", "life vocation without spiritual emphasis"],
    useWhen: "Use when the user is asking in explicitly spiritual, intuitive, or symbolic terms.",
    defaultThemes: ["intuition", "alignment", "trust", "sacred_timing", "signs", "discernment", "practice", "protection"],
    priority: 13,
    active: true,
    fallbackDomain: "general",
  },
  {
    id: "community",
    displayLabel: "Community",
    scope: "Collective belonging, shared spaces, audiences, networks at scale, group participation, and public social fabric.",
    includes: ["neighborhood", "communities of interest", "public belonging", "collaborative circles", "collective support", "wider-group reputation"],
    excludes: ["one-to-one friendship dynamics (use Friends & Social)", "formal institutions unless process is central (use Legal / Admin)"],
    useWhen: "Use when the question concerns belonging to a group, role in a wider network, or collective participation.",
    defaultThemes: ["belonging", "audience", "shared_purpose", "collective_support", "group_tension", "visibility", "participation", "networks"],
    priority: 14,
    active: true,
    fallbackDomain: "general",
  },
  {
    id: "legal_admin",
    displayLabel: "Legal / Admin",
    scope: "Contracts, paperwork, formal obligations, official systems, bureaucratic processes, and compliance.",
    includes: ["documents", "applications", "legal formalities", "deadlines", "approvals", "procedural hurdles"],
    excludes: ["career politics unless paperwork is central", "finances unless the formal process is the main issue"],
    useWhen: "Use when the concern is procedural, institutional, official, or document-driven.",
    notes: "Use practical but non-legal-advice wording.",
    defaultThemes: ["documents", "contracts", "deadlines", "approvals", "bureaucracy", "compliance", "disputes", "resolution"],
    priority: 15,
    active: true,
    fallbackDomain: "general",
  },
  {
    id: "purpose_calling",
    displayLabel: "Purpose / Calling",
    scope: "Vocation, deeper direction, life path, meaningful contribution, and long-range alignment beyond immediate practical outcomes.",
    includes: ["life direction", "existential fit", "vocation", "right path", "sustained meaning", "long-term alignment"],
    excludes: ["ordinary job questions without deeper directional framing", "purely spiritual symbolism without vocation/path emphasis"],
    useWhen: "Use when the user is asking what fits them deeply, what path matters, or whether something aligns with deeper nature.",
    defaultThemes: ["vocation", "alignment", "right_path", "meaning", "long_term_direction", "service", "calling_shift", "commitment"],
    priority: 16,
    active: true,
    fallbackDomain: "general",
  },
];

export const SUBJECT_BY_ID = new Map(SUBJECT_DEFINITIONS.map((subject) => [subject.id, subject]));

// Canonical UI order (default 4x4 grid order).
export const SUBJECT_UI_ORDER: SubjectId[] = [
  "general_reading",
  "love",
  "work",
  "money",
  "home_family",
  "friends_social",
  "personal_growth",
  "health",
  "pets",
  "creative",
  "travel",
  "education",
  "spiritual",
  "community",
  "legal_admin",
  "purpose_calling",
];

export const SUBJECT_UI_GRID_ORDER: SubjectId[][] = [
  ["general_reading", "love", "work", "money"],
  ["home_family", "friends_social", "personal_growth", "health"],
  ["pets", "creative", "travel", "education"],
  ["spiritual", "community", "legal_admin", "purpose_calling"],
];

// Canonical overlap/boundary guards.
export const SUBJECT_BOUNDARY_GUARDS: SubjectBoundaryGuard[] = [
  {
    id: "work_vs_education",
    left: "work",
    right: "education",
    leftBoundary: "Work = employment, role, workplace dynamics",
    rightBoundary: "Education = learning, study, qualification, training",
  },
  {
    id: "work_vs_purpose_calling",
    left: "work",
    right: "purpose_calling",
    leftBoundary: "Work = practical job reality",
    rightBoundary: "Purpose / Calling = deeper long-term fit and vocation",
  },
  {
    id: "personal_growth_vs_spiritual",
    left: "personal_growth",
    right: "spiritual",
    leftBoundary: "Personal Growth = psychological / emotional development",
    rightBoundary: "Spiritual = intuitive / metaphysical / sacred framing",
  },
  {
    id: "friends_social_vs_community",
    left: "friends_social",
    right: "community",
    leftBoundary: "Friends & Social = immediate peers and personal social life",
    rightBoundary: "Community = broader collective belonging and group role",
  },
  {
    id: "home_family_vs_pets",
    left: "home_family",
    right: "pets",
    leftBoundary: "Home & Family = domestic system overall",
    rightBoundary: "Pets = animal companion as the focal subject",
  },
  {
    id: "creative_vs_education",
    left: "creative",
    right: "education",
    leftBoundary: "Creative = making and expression",
    rightBoundary: "Education = learning and training",
  },
  {
    id: "money_vs_legal_admin",
    left: "money",
    right: "legal_admin",
    leftBoundary: "Money = resource flow and material conditions",
    rightBoundary: "Legal / Admin = official process, paperwork, formal obligations",
  },
  {
    id: "general_reading_guard",
    left: "general_reading",
    right: "general_reading",
    leftBoundary: "General Reading should only dominate when no subject is selected",
    rightBoundary: "or when multiple domains tie, or when a broad overview is explicitly requested",
  },
];

export const SUBJECT_RETRIEVAL_RULES: SubjectRetrievalRules = {
  hardMatch: ["subject_id", "technique"],
  softWeighting: ["theme_id", "effect_tags", "tone_preference", "intensity", "positional_relevance"],
  downrankOrExclude: [
    "Suppress entries that contradict chosen subject.",
    "Suppress entries that duplicate recent phrasing.",
    "Suppress entries that conflict with stronger spread evidence.",
    "Suppress entries that introduce unsupported domain shifts.",
  ],
};

export function getSubjectDefinition(subjectId: SubjectId): SubjectDefinition {
  const subject = SUBJECT_BY_ID.get(subjectId);
  if (!subject) {
    throw new Error(`Unknown subject id: ${subjectId}`);
  }
  return subject;
}

export function getSubjectFallbackDomain(subjectId: SubjectId): Domain {
  return getSubjectDefinition(subjectId).fallbackDomain;
}

export function isSubjectId(value: string): value is SubjectId {
  return SUBJECT_BY_ID.has(value as SubjectId);
}
