import { CARD_MEANINGS } from "@/lib/content/cards";
import type { CardMeaning } from "@/lib/content/cards";
import { SUBJECT_DEFINITIONS } from "@/lib/content/subjects";
import type { SubjectDefinition } from "@/lib/content/subjects";
import type { InterpretationEntry } from "@/lib/content/interpretation/model";
import {
  baseSafetyFlags,
  cardPolarity,
  describeThemeFocus,
  getSubjectVoice,
  polarityTones,
  selectSubjectThemesBySignals,
  sentenceCase,
  type SubjectVoice,
} from "@/lib/content/interpretation/families/shared";

interface CardInterpretationCopy {
  primary: string;
  variants: string[];
  summary: string;
}

function buildTravelCardCopy(
  card: CardMeaning,
  themeFocus: string,
  voice: SubjectVoice,
  domainLine: string,
  secondaryKeyword: string,
): CardInterpretationCopy {
  const primaryTemplates = [
    `In travel questions, ${card.name} puts ${themeFocus} onto the route itself. Here, ${domainLine}`,
    `For travel, ${card.name} shows which part of the journey needs cleaner handling first. Here, ${domainLine}`,
    `When the question is about movement or timing, ${card.name} marks the active stretch of road. Here, ${domainLine}`,
  ];

  return {
    primary: primaryTemplates[card.id % primaryTemplates.length],
    variants: [
      `${card.name} tends to help most in travel matters when you ${card.action}, especially around ${card.keywords[0]} and ${secondaryKeyword}`,
      `The deeper message is that ${card.coreMeaning}, which makes preparation and adaptability more useful than speed alone`,
      `In practical terms, ${card.name} keeps attention on ${voice.area}; keep the journey workable and avoid ${card.caution.toLowerCase()}`,
    ],
    summary: `${card.name} shapes the journey through ${card.keywords[0]}`,
  };
}

function buildLegalAdminCardCopy(
  card: CardMeaning,
  themeFocus: string,
  voice: SubjectVoice,
  domainLine: string,
  secondaryKeyword: string,
): CardInterpretationCopy {
  const primaryTemplates = [
    `In legal or administrative matters, ${card.name} brings ${themeFocus} into the formal record. Here, ${domainLine}`,
    `For paperwork, approvals, or obligations, ${card.name} shows where the process has to hold up under scrutiny. Here, ${domainLine}`,
    `${card.name} turns the issue toward process, proof, or timing. Here, ${domainLine}`,
  ];

  return {
    primary: primaryTemplates[card.id % primaryTemplates.length],
    variants: [
      `${card.name} is strongest here when you ${card.action} and leave a clean trail behind you, especially around ${card.keywords[0]} and ${secondaryKeyword}`,
      `The deeper message is that ${card.coreMeaning}, so what is clear, documented, and timely will usually carry more weight than verbal reassurance`,
      `In this subject, ${card.name} asks for precision without panic inside ${voice.area}; avoid ${card.caution.toLowerCase()}`,
    ],
    summary: `${card.name} shapes the process through ${card.keywords[0]}`,
  };
}

function buildPurposeCallingCardCopy(
  card: CardMeaning,
  themeFocus: string,
  domainLine: string,
  secondaryKeyword: string,
): CardInterpretationCopy {
  const primaryTemplates = [
    `In purpose and calling, ${card.name} brings ${themeFocus} into the question of what can be sustained with integrity. Here, ${domainLine}`,
    `For vocation, ${card.name} shows where the path asks for a truer fit rather than a faster answer. Here, ${domainLine}`,
    `${card.name} presses on the deeper path beneath the immediate choice. Here, ${domainLine}`,
  ];

  return {
    primary: primaryTemplates[card.id % primaryTemplates.length],
    variants: [
      `${card.name} points to the part of the path that needs honest attention first, especially around ${card.keywords[0]} and ${secondaryKeyword}`,
      `The deeper message is that ${card.coreMeaning}, so the right move is usually the one you can keep living with after the mood passes`,
      `In this subject, ${card.name} is strongest when you ${card.action}, rather than letting ${card.caution.toLowerCase()} decide the course`,
    ],
    summary: `${card.name} shapes the path through ${card.keywords[0]}`,
  };
}

function buildDefaultCardCopy(
  subject: SubjectDefinition,
  card: CardMeaning,
  voice: SubjectVoice,
  themeFocus: string,
  domainLine: string,
  secondaryKeyword: string,
): CardInterpretationCopy {
  return {
    primary: `In ${subject.displayLabel}, ${card.name} brings ${themeFocus} into ${voice.area} through ${domainLine}`,
    variants: [
      `${card.name} keeps attention on ${card.keywords[0]} and ${secondaryKeyword} in ${voice.area}, where ${voice.pressure} matters more than appearances`,
      `${card.name} works best here when you ${card.action}, while staying aware of ${card.caution.toLowerCase()}`,
      `In ${voice.area}, ${card.coreMeaning}, so ${voice.nextMove} is usually stronger than force`,
    ],
    summary: `${card.name} shapes ${voice.area} through ${card.keywords[0]}`,
  };
}

function buildCardCopy(
  subject: SubjectDefinition,
  card: CardMeaning,
  voice: SubjectVoice,
  themeFocus: string,
  domainLine: string,
  secondaryKeyword: string,
): CardInterpretationCopy {
  switch (subject.id) {
    case "travel":
      return buildTravelCardCopy(card, themeFocus, voice, domainLine, secondaryKeyword);
    case "legal_admin":
      return buildLegalAdminCardCopy(card, themeFocus, voice, domainLine, secondaryKeyword);
    case "purpose_calling":
      return buildPurposeCallingCardCopy(card, themeFocus, domainLine, secondaryKeyword);
    default:
      return buildDefaultCardCopy(subject, card, voice, themeFocus, domainLine, secondaryKeyword);
  }
}

export function buildCardInterpretationEntries(): InterpretationEntry[] {
  const entries: InterpretationEntry[] = [];

  SUBJECT_DEFINITIONS.forEach((subject) => {
    CARD_MEANINGS.forEach((card) => {
      const polarity = cardPolarity(card.id);
      const domainLine = card.domainVariants[subject.fallbackDomain];
      const themes = selectSubjectThemesBySignals(
        subject.id,
        subject.defaultThemes,
        [card.name, card.slug, ...card.keywords, card.coreMeaning, card.action, card.caution, domainLine],
        card.id * 2,
        3,
      );
      const voice = getSubjectVoice(subject.id);
      const themeFocus = describeThemeFocus(themes, "the active question");
      const secondaryKeyword = card.keywords[1] ?? card.keywords[0];
      const copy = buildCardCopy(subject, card, voice, themeFocus, domainLine, secondaryKeyword);

      entries.push({
        id: `card:${subject.id}:${card.id}`,
        technique: "card",
        techniqueKey: `card:${card.id}`,
        subjectId: subject.id,
        themeIds: themes,
        appliesTo: {
          cardId: card.id,
        },
        ranking: {
          tone: polarityTones(polarity),
          intensity: (((card.id - 1) % 5) + 1) as 1 | 2 | 3 | 4 | 5,
          confidence: 0.72,
          effect: [card.keywords[0], card.keywords[1] ?? card.keywords[0]],
          polarity,
        },
        conditions: {
          prefers: [`subject:${subject.id}`],
          downrankIf: polarity === "challenging" ? ["tone:supportive"] : [],
        },
        text: {
          primary: sentenceCase(copy.primary),
          variants: copy.variants.map((variant) => sentenceCase(variant)),
          summary: sentenceCase(copy.summary),
        },
        meta: {
          weight: 1.08,
          active: true,
          version: "v1",
        },
        safety: baseSafetyFlags(),
      });
    });
  });

  return entries;
}
