import { getThemeDefinition, isThemeId } from "@/lib/content/themes";
import type { ThemeId } from "@/lib/content/themes";
import type {
  InterpretationPolarity,
  InterpretationSafetyFlags,
  InterpretationTone,
} from "@/lib/content/interpretation/model";
import type { SubjectId } from "@/lib/engine/types";

const CHALLENGING_CARD_IDS = new Set([6, 7, 8, 10, 11, 14, 21, 23, 36]);
const CONSTRUCTIVE_CARD_IDS = new Set([1, 2, 9, 16, 18, 24, 31, 33, 35]);

export function sentenceCase(input: string): string {
  if (!input.trim()) return "";
  const trimmed = input.trim();
  const first = trimmed[0].toUpperCase();
  const rest = trimmed.slice(1);
  const withPunctuation = /[.!?]$/.test(rest) ? `${first}${rest}` : `${first}${rest}.`;
  return withPunctuation;
}

export function normalizeTextFingerprint(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function rotateSubjectThemes(subjectThemes: string[], seed: number, size = 3): ThemeId[] {
  if (!subjectThemes.length) return [];
  const picked: ThemeId[] = [];
  const capped = Math.min(size, subjectThemes.length);

  for (let offset = 0; offset < capped; offset += 1) {
    const candidate = subjectThemes[(seed + offset) % subjectThemes.length];
    if (isThemeId(candidate) && !picked.includes(candidate)) {
      picked.push(candidate);
    }
  }

  return picked;
}

export function cardPolarity(cardId: number): InterpretationPolarity {
  if (CHALLENGING_CARD_IDS.has(cardId)) return "challenging";
  if (CONSTRUCTIVE_CARD_IDS.has(cardId)) return "constructive";
  return "mixed";
}

export function polarityTones(polarity: InterpretationPolarity): InterpretationTone[] {
  if (polarity === "constructive") return ["supportive", "reflective"];
  if (polarity === "challenging") return ["cautious", "pragmatic"];
  if (polarity === "neutral") return ["grounded", "pragmatic"];
  return ["reflective", "grounded"];
}

export function baseSafetyFlags(): InterpretationSafetyFlags {
  return {
    entertainmentOnly: true,
    noMedicalAdvice: true,
    noLegalAdvice: true,
    noFinancialAdvice: true,
    deterministicLanguage: false,
  };
}

export interface SubjectVoice {
  area: string;
  pressure: string;
  value: string;
  nextMove: string;
}

const SUBJECT_VOICE: Record<SubjectId, SubjectVoice> = {
  general_reading: {
    area: "the wider picture",
    pressure: "what is most active right now",
    value: "clarity before overcommitting",
    nextMove: "one grounded adjustment at a time",
  },
  love: {
    area: "the relationship field",
    pressure: "mutual signals and emotional reciprocity",
    value: "honesty, pacing, and trust",
    nextMove: "clear feeling with consistent action",
  },
  work: {
    area: "the workplace and your role",
    pressure: "pressure, politics, and responsibility",
    value: "credibility, boundaries, and steady execution",
    nextMove: "one practical move that improves conditions",
  },
  money: {
    area: "resources, affordability, and flow",
    pressure: "what is draining or strengthening material stability",
    value: "clear priorities and measured stewardship",
    nextMove: "choices that stabilize flow before expansion",
  },
  home_family: {
    area: "home life and family patterns",
    pressure: "what is shaping the domestic atmosphere",
    value: "protection, steadiness, and honest care",
    nextMove: "small changes that make daily life easier to live in",
  },
  friends_social: {
    area: "friendships and social trust",
    pressure: "tone, reciprocity, and group dynamics",
    value: "clear expectations and genuine support",
    nextMove: "social choices that protect belonging without self-erasure",
  },
  personal_growth: {
    area: "your inner patterning and personal change",
    pressure: "what is ready to be seen more honestly",
    value: "self-trust, boundaries, and grounded reflection",
    nextMove: "one choice that breaks an old loop cleanly",
  },
  health: {
    area: "wellbeing, energy, and recovery",
    pressure: "what is straining pace or support",
    value: "restraint, steadiness, and realistic pacing",
    nextMove: "what helps the system settle rather than spike",
  },
  pets: {
    area: "the animal companion and its care rhythm",
    pressure: "comfort, routine, and environmental cues",
    value: "safety, reassurance, and careful observation",
    nextMove: "small care adjustments that reduce stress",
  },
  creative: {
    area: "the arc from making to reception",
    pressure: "momentum, craft, and audience response",
    value: "coherent expression and protected focus",
    nextMove: "a practical choice that keeps the work moving",
  },
  travel: {
    area: "movement, timing, and logistics",
    pressure: "what affects safe and workable passage",
    value: "preparation, timing, and adaptability",
    nextMove: "the next decision that makes the route cleaner",
  },
  education: {
    area: "study, skill-building, and qualification",
    pressure: "what supports learning or blocks progress",
    value: "focus, repetition, and usable guidance",
    nextMove: "the learning choice that compounds best over time",
  },
  spiritual: {
    area: "inner guidance and symbolic meaning",
    pressure: "what feels intuitively active beneath the surface",
    value: "discernment, trust, and grounded practice",
    nextMove: "one quiet act that keeps you aligned with what feels true",
  },
  community: {
    area: "the wider social arc",
    pressure: "how the wider group is responding",
    value: "visibility, contribution, and reciprocal care",
    nextMove: "the next choice that strengthens your place in the field",
  },
  legal_admin: {
    area: "paperwork, process, and formal obligation",
    pressure: "what must be tracked, clarified, or documented",
    value: "precision, timing, and procedural steadiness",
    nextMove: "the clearest practical step in the process",
  },
  purpose_calling: {
    area: "long-range direction and meaningful fit",
    pressure: "what deepens or weakens alignment",
    value: "integrity, devotion, and right-sized commitment",
    nextMove: "the next step that feels both true and sustainable",
  },
};

export function getSubjectVoice(subjectId: SubjectId): SubjectVoice {
  return SUBJECT_VOICE[subjectId];
}

export function describeThemeFocus(themeIds: ThemeId[], fallback = "the main concern"): string {
  const labels = themeIds
    .slice(0, 2)
    .map((themeId) => getThemeDefinition(themeId).displayLabel.toLowerCase())
    .filter(Boolean);

  if (!labels.length) return fallback;
  if (labels.length === 1) return labels[0];
  return `${labels[0]} and ${labels[1]}`;
}

export function selectSubjectThemesBySignals(
  subjectId: SubjectId,
  subjectThemes: string[],
  signals: string[],
  seed: number,
  size = 3,
): ThemeId[] {
  const allowed = subjectThemes.filter((themeId): themeId is ThemeId => isThemeId(themeId));
  if (!allowed.length) return [];

  const signalText = normalizeTextFingerprint(signals.join(" "));
  const signalWords = new Set(signalText.split(" ").filter((word) => word.length >= 3));

  const scored = allowed
    .map((themeId, index) => {
      const theme = getThemeDefinition(themeId);
      let score = Math.max(0.05, 0.24 - index * 0.01);

      theme.aliases.forEach((alias) => {
        const normalizedAlias = normalizeTextFingerprint(alias);
        if (!normalizedAlias) return;
        if (signalText.includes(normalizedAlias)) {
          score += normalizedAlias.includes(" ") ? 1.45 : 0.7;
        }

        normalizedAlias.split(" ").forEach((token) => {
          if (token.length >= 5 && signalWords.has(token)) {
            score += 0.14;
          }
        });
      });

      theme.description
        .toLowerCase()
        .split(/[^a-z0-9]+/g)
        .filter((token) => token.length >= 6)
        .forEach((token) => {
          if (signalWords.has(token)) {
            score += 0.1;
          }
        });

      return { themeId, score };
    })
    .sort((left, right) => right.score - left.score);

  const selected: ThemeId[] = [];
  scored.forEach(({ themeId, score }) => {
    if (selected.length >= size) return;
    if (score < 0.45) return;
    if (!selected.includes(themeId)) {
      selected.push(themeId);
    }
  });

  const fallback = rotateSubjectThemes(allowed, seed, size + 2);
  fallback.forEach((themeId) => {
    if (selected.length >= size) return;
    if (!selected.includes(themeId)) {
      selected.push(themeId);
    }
  });

  return selected.slice(0, size);
}
