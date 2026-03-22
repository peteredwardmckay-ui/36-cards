import { HOUSE_MEANINGS } from "@/lib/content/houses";
import type { HouseMeaning } from "@/lib/content/houses";
import { SUBJECT_DEFINITIONS } from "@/lib/content/subjects";
import type { SubjectDefinition } from "@/lib/content/subjects";
import type { InterpretationEntry, InterpretationPolarity } from "@/lib/content/interpretation/model";
import {
  baseSafetyFlags,
  describeThemeFocus,
  getSubjectVoice,
  polarityTones,
  selectSubjectThemesBySignals,
  sentenceCase,
  type SubjectVoice,
} from "@/lib/content/interpretation/families/shared";

const CHALLENGING_HOUSE_IDS = new Set([6, 8, 10, 11, 21, 23, 36]);
const CONSTRUCTIVE_HOUSE_IDS = new Set([2, 9, 16, 24, 31, 33, 35]);

function housePolarity(houseId: number): InterpretationPolarity {
  if (CHALLENGING_HOUSE_IDS.has(houseId)) return "challenging";
  if (CONSTRUCTIVE_HOUSE_IDS.has(houseId)) return "constructive";
  return "mixed";
}

interface HouseInterpretationCopy {
  primary: string;
  variants: string[];
  summary: string;
}

function buildTravelHouseCopy(house: HouseMeaning, themeFocus: string): HouseInterpretationCopy {
  const primaryTemplates = [
    `${house.name} is where ${themeFocus} has to work in real travel conditions, especially through ${house.shortFocus}`,
    `In travel matters, ${house.name} marks the part of the route where ${house.shortFocus} cannot be improvised`,
    `${house.name} shows where the journey becomes concrete, and where ${house.shortFocus} decides whether movement stays smooth or stalls`,
  ];

  return {
    primary: primaryTemplates[house.id % primaryTemplates.length],
    variants: [
      `${house.description} In travel questions, this is often where timing, access, or documents prove themselves`,
      `${house.name} tends to matter most when the plan looks fine on paper but still has to work in real conditions`,
      `When this house is active, the trip benefits from steadier sequencing because ${house.shortFocus} affects the next workable move`,
    ],
    summary: `${house.name} localizes the journey around ${house.shortFocus}`,
  };
}

function buildLegalAdminHouseCopy(house: HouseMeaning, themeFocus: string): HouseInterpretationCopy {
  const primaryTemplates = [
    `${house.name} is where ${themeFocus} becomes formal, especially through ${house.shortFocus}`,
    `In legal or administrative questions, ${house.name} marks the stage where ${house.shortFocus} has to stand up to procedure`,
    `${house.name} shows where the matter becomes official, and where ${house.shortFocus} cannot stay informal`,
  ];

  return {
    primary: primaryTemplates[house.id % primaryTemplates.length],
    variants: [
      `${house.description} In this subject, it is often where files, deadlines, or approvals start to matter more than intention alone`,
      `${house.name} is the place in the process where clarity has to survive contact with rules, timelines, or other people's standards`,
      `When this house is emphasized, cleaner documentation and steadier timing usually do more than force`,
    ],
    summary: `${house.name} localizes the process around ${house.shortFocus}`,
  };
}

function buildPurposeCallingHouseCopy(house: HouseMeaning, themeFocus: string): HouseInterpretationCopy {
  const primaryTemplates = [
    `${house.name} is where ${themeFocus} becomes lived rather than imagined, especially through ${house.shortFocus}`,
    `In purpose and calling questions, ${house.name} marks the part of the path where ${house.shortFocus} reveals what still fits`,
    `${house.name} shows where the deeper path asks to take form, and where ${house.shortFocus} becomes a test of alignment`,
  ];

  return {
    primary: primaryTemplates[house.id % primaryTemplates.length],
    variants: [
      `${house.description} In this subject, it often points to the place where vocation stops being abstract and starts asking for real form`,
      `${house.name} keeps the reading honest because this is where values, stamina, and direction have to agree with each other`,
      `When this house is active, the clearest next move is usually the one that feels sustainable as well as meaningful`,
    ],
    summary: `${house.name} localizes the path around ${house.shortFocus}`,
  };
}

function buildDefaultHouseCopy(
  subject: SubjectDefinition,
  voice: SubjectVoice,
  house: HouseMeaning,
  themeFocus: string,
): HouseInterpretationCopy {
  return {
    primary: `${house.name} shows where ${themeFocus} becomes concrete in ${voice.area}, especially around ${house.shortFocus}`,
    variants: [
      `${house.description} In ${subject.displayLabel}, this is often where ${voice.pressure} becomes visible`,
      `${house.name} localizes the reading: it is the part of ${voice.area} where ${voice.value} has to be lived rather than discussed`,
      `When this house is emphasized, the reading turns practical because ${house.shortFocus} affects ${voice.nextMove}`,
    ],
    summary: `${house.name} localizes ${voice.area} around ${house.shortFocus}`,
  };
}

function buildHouseCopy(
  subject: SubjectDefinition,
  voice: SubjectVoice,
  house: HouseMeaning,
  themeFocus: string,
): HouseInterpretationCopy {
  switch (subject.id) {
    case "travel":
      return buildTravelHouseCopy(house, themeFocus);
    case "legal_admin":
      return buildLegalAdminHouseCopy(house, themeFocus);
    case "purpose_calling":
      return buildPurposeCallingHouseCopy(house, themeFocus);
    default:
      return buildDefaultHouseCopy(subject, voice, house, themeFocus);
  }
}

export function buildHouseInterpretationEntries(): InterpretationEntry[] {
  const entries: InterpretationEntry[] = [];

  SUBJECT_DEFINITIONS.forEach((subject) => {
    HOUSE_MEANINGS.forEach((house) => {
      const polarity = housePolarity(house.id);
      const themes = selectSubjectThemesBySignals(
        subject.id,
        subject.defaultThemes,
        [house.name, house.shortFocus, house.description],
        house.id,
        3,
      );
      const voice = getSubjectVoice(subject.id);
      const themeFocus = describeThemeFocus(themes, "the active theme");
      const copy = buildHouseCopy(subject, voice, house, themeFocus);

      entries.push({
        id: `house:${subject.id}:${house.id}`,
        technique: "house",
        techniqueKey: `house:${house.id}`,
        subjectId: subject.id,
        themeIds: themes,
        appliesTo: {
          houseId: house.id,
        },
        ranking: {
          tone: polarityTones(polarity),
          intensity: (((house.id + 1) % 5) + 1) as 1 | 2 | 3 | 4 | 5,
          confidence: 0.74,
          effect: [house.shortFocus, "context"],
          polarity,
        },
        text: {
          primary: sentenceCase(copy.primary),
          variants: copy.variants.map((variant) => sentenceCase(variant)),
          summary: sentenceCase(copy.summary),
        },
        meta: {
          weight: 1.04,
          active: true,
          version: "v1",
        },
        safety: baseSafetyFlags(),
      });
    });
  });

  return entries;
}
