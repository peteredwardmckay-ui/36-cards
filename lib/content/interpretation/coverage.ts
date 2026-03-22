import { SUBJECT_UI_ORDER } from "@/lib/content/subjects";
import { THEME_IDS } from "@/lib/content/themes";
import { INTERPRETATION_TECHNIQUES } from "@/lib/content/interpretation/model";
import type {
  InterpretationCoverageReport,
  InterpretationEntry,
  InterpretationTechnique,
} from "@/lib/content/interpretation/model";
import type { SubjectId } from "@/lib/engine/types";

const TECHNIQUE_MIN_THRESHOLDS: Record<InterpretationTechnique, number> = {
  card: 36,
  house: 36,
  pair: 12,
  diagonal: 2,
  knighting: 2,
  proximity: 3,
  significator: 4,
};

function initTechniqueSubjectMatrix(): Record<InterpretationTechnique, Record<SubjectId, number>> {
  return INTERPRETATION_TECHNIQUES.reduce(
    (acc, technique) => {
      acc[technique] = SUBJECT_UI_ORDER.reduce(
        (subjectAcc, subjectId) => {
          subjectAcc[subjectId] = 0;
          return subjectAcc;
        },
        {} as Record<SubjectId, number>,
      );
      return acc;
    },
    {} as Record<InterpretationTechnique, Record<SubjectId, number>>,
  );
}

export function buildInterpretationCoverageReport(entries: InterpretationEntry[]): InterpretationCoverageReport {
  const byTechnique = INTERPRETATION_TECHNIQUES.reduce(
    (acc, technique) => {
      acc[technique] = 0;
      return acc;
    },
    {} as Record<InterpretationTechnique, number>,
  );

  const bySubject = SUBJECT_UI_ORDER.reduce(
    (acc, subjectId) => {
      acc[subjectId] = 0;
      return acc;
    },
    {} as Record<SubjectId, number>,
  );

  const byTechniqueAndSubject = initTechniqueSubjectMatrix();
  const themeUsage = THEME_IDS.reduce(
    (acc, themeId) => {
      acc[themeId] = 0;
      return acc;
    },
    {} as Record<(typeof THEME_IDS)[number], number>,
  );

  entries.forEach((entry) => {
    byTechnique[entry.technique] += 1;
    bySubject[entry.subjectId] += 1;
    byTechniqueAndSubject[entry.technique][entry.subjectId] += 1;
    entry.themeIds.forEach((themeId) => {
      themeUsage[themeId] += 1;
    });
  });

  const themesWithZeroEntries = THEME_IDS.filter((themeId) => themeUsage[themeId] === 0);

  const missingAreas: InterpretationCoverageReport["missingAreas"] = [];
  const underpopulatedAreas: InterpretationCoverageReport["underpopulatedAreas"] = [];

  INTERPRETATION_TECHNIQUES.forEach((technique) => {
    SUBJECT_UI_ORDER.forEach((subjectId) => {
      const count = byTechniqueAndSubject[technique][subjectId];
      const threshold = TECHNIQUE_MIN_THRESHOLDS[technique];
      if (count === 0) {
        missingAreas.push({
          technique,
          subjectId,
          count,
          reason: `No entries available for ${technique} within ${subjectId}.`,
        });
      } else if (count < threshold) {
        underpopulatedAreas.push({
          technique,
          subjectId,
          count,
          threshold,
          reason: `Coverage below threshold for ${technique} within ${subjectId}.`,
        });
      }
    });
  });

  return {
    totalEntries: entries.length,
    byTechnique,
    bySubject,
    byTechniqueAndSubject,
    themeUsage,
    themesWithZeroEntries,
    missingAreas,
    underpopulatedAreas,
  };
}

