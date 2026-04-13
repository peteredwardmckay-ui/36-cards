import { SUBJECT_DEFINITIONS } from "@/lib/content/subjects";
import type { InterpretationEntry } from "@/lib/content/interpretation/model";
import {
  baseSafetyFlags,
  describeThemeFocus,
  getSubjectVoice,
  selectSubjectThemesBySignals,
  sentenceCase,
} from "@/lib/content/interpretation/families/shared";

export function buildTemplateInterpretationEntries(): InterpretationEntry[] {
  const entries: InterpretationEntry[] = [];

  SUBJECT_DEFINITIONS.forEach((subject) => {
    const voice = getSubjectVoice(subject.id);

    const diagonalLines: Array<"primary" | "secondary"> = ["primary", "secondary"];
    diagonalLines.forEach((line, lineIndex) => {
      const lineThemes = selectSubjectThemesBySignals(
        subject.id,
        subject.defaultThemes,
        [line, voice.area, voice.pressure, "timing sequence background pattern"],
        lineIndex + subject.priority,
        2,
      );
      const lineThemeFocus = describeThemeFocus(lineThemes, "the longer story");
      entries.push({
        id: `diagonal:${subject.id}:${line}`,
        technique: "diagonal",
        techniqueKey: `diagonal:${line}`,
        subjectId: subject.id,
        themeIds: lineThemes,
        appliesTo: { line },
        ranking: {
          tone: ["reflective", "grounded"],
          intensity: (3 + lineIndex) as 3 | 4,
          confidence: 0.7,
          effect: ["sequence", "storyline"],
          polarity: "mixed",
        },
        conditions: {
          prefers: [`subject:${subject.id}`],
        },
        text: {
          primary: sentenceCase(
            `The ${line === "primary" ? "main" : "secondary"} diagonal shows ${lineThemeFocus} developing across ${voice.area}`,
          ),
          variants: [
            sentenceCase(
              `Read this line as the longer thread beneath immediate events, especially where ${voice.pressure} keeps repeating`,
            ),
            sentenceCase(
              `Diagonal evidence is most useful when it shows how earlier choices become later conditions in ${voice.area}`,
            ),
            sentenceCase(
              `The diagonal is a timeline compressed into position — what appears early on this line creates the context for what appears later, and the pattern rarely reverses on its own`,
            ),
            sentenceCase(
              `Cards on this diagonal share a developmental arc, so read them as stages of the same process rather than separate events in ${voice.area}`,
            ),
          ],
        },
        meta: {
          weight: 0.86,
          active: true,
          version: "v1",
        },
        safety: baseSafetyFlags(),
      });
    });

    const knightAnchors: Array<"significator" | "querent" | "counterpart" | "key_card"> = [
      "significator",
      "querent",
      "counterpart",
      "key_card",
    ];
    knightAnchors.forEach((anchor, anchorIndex) => {
      const anchorThemes = selectSubjectThemesBySignals(
        subject.id,
        subject.defaultThemes,
        [anchor, voice.area, voice.nextMove, "indirect trigger side influence timing"],
        anchorIndex + 11 + subject.priority,
        2,
      );
      const anchorFocus = describeThemeFocus(anchorThemes, "the side current");
      entries.push({
        id: `knighting:${subject.id}:${anchor}`,
        technique: "knighting",
        techniqueKey: `knighting:${anchor}`,
        subjectId: subject.id,
        themeIds: anchorThemes,
        appliesTo: { anchor },
        ranking: {
          tone: ["pragmatic", "grounded"],
          intensity: (2 + (anchorIndex % 3)) as 2 | 3 | 4,
          confidence: 0.68,
          effect: ["indirect", "trigger"],
          polarity: "neutral",
        },
        text: {
          primary: sentenceCase(
            `Knighting from ${anchor} reveals side influences around ${anchorFocus} that can redirect timing in ${voice.area}`,
          ),
          variants: [
            sentenceCase("Treat knight links as side currents: they rarely dominate, but they often explain why the story bends."),
            sentenceCase(
              `Indirect links often show why events move faster or slower than expected in ${voice.area}`,
            ),
            sentenceCase(
              `Knight connections work like off-screen characters — their influence is real even when it is not immediately visible, and it shapes ${voice.pressure} from an angle you might not be watching`,
            ),
            sentenceCase(
              `The cards reached by knighting are not random noise; they carry the weight of what is trying to enter ${voice.area} through the side door rather than the front`,
            ),
          ],
        },
        meta: {
          weight: 0.82,
          active: true,
          version: "v1",
        },
        safety: baseSafetyFlags(),
      });
    });

    const distances: Array<"near" | "medium" | "far"> = ["near", "medium", "far"];
    distances.forEach((distance, distanceIndex) => {
      const proximityThemes = selectSubjectThemesBySignals(
        subject.id,
        subject.defaultThemes,
        [distance, voice.area, voice.pressure, "priority pacing urgency sequence"],
        distanceIndex + 21 + subject.priority,
        2,
      );
      const proximityFocus = describeThemeFocus(proximityThemes, "what matters first");
      entries.push({
        id: `proximity:${subject.id}:${distance}`,
        technique: "proximity",
        techniqueKey: `proximity:${distance}`,
        subjectId: subject.id,
        themeIds: proximityThemes,
        appliesTo: { distance },
        ranking: {
          tone: ["pragmatic", "reflective"],
          intensity: (distance === "near" ? 4 : distance === "medium" ? 3 : 2) as 2 | 3 | 4,
          confidence: 0.74,
          effect: ["distance", "priority"],
          polarity: "mixed",
        },
        conditions: {
          requires: [`distance:${distance}`],
        },
        text: {
          primary: sentenceCase(
            `In ${voice.area}, ${distance} cards show how urgently ${proximityFocus} needs attention`,
          ),
          variants: [
            sentenceCase("Near cards speak first, medium cards gather, and far cards give context to the rest."),
            sentenceCase(
              `Use distance as a pacing tool inside ${voice.area}, not as a fixed prediction`,
            ),
            sentenceCase(
              `Proximity tells you what is pressing and what is forming — the near cards are already active, while the far cards describe the weather that is coming`,
            ),
            sentenceCase(
              `The gradient from near to far is a priority map: attend to what is closest first, let middle-distance cards inform your strategy, and keep far cards as context rather than worry`,
            ),
          ],
        },
        meta: {
          weight: 0.88,
          active: true,
          version: "v1",
        },
        safety: baseSafetyFlags(),
      });
    });

    const significatorModes: Array<"self" | "other" | "relationship" | "open"> = [
      "self",
      "other",
      "relationship",
      "open",
    ];
    significatorModes.forEach((mode, modeIndex) => {
      const modeThemes = selectSubjectThemesBySignals(
        subject.id,
        subject.defaultThemes,
        [mode, voice.area, voice.value, "perspective role framing"],
        modeIndex + 31 + subject.priority,
        2,
      );
      const modeFocus = describeThemeFocus(modeThemes, "the lived perspective");
      const modeDescription =
        mode === "self"
          ? "your own stance"
          : mode === "other"
            ? "the other party's position"
            : mode === "relationship"
              ? "the bond itself"
              : "the most relevant point of view";
      entries.push({
        id: `significator:${subject.id}:${mode}`,
        technique: "significator",
        techniqueKey: `significator:${mode}`,
        subjectId: subject.id,
        themeIds: modeThemes,
        appliesTo: { mode },
        ranking: {
          tone: ["grounded", "reflective"],
          intensity: 3,
          confidence: 0.76,
          effect: ["role", "agency"],
          polarity: "neutral",
        },
        conditions: {
          requires: [`significator:${mode}`],
        },
        text: {
          primary: sentenceCase(
            `This significator frame keeps the reading tied to ${modeDescription}, which sharpens ${modeFocus} in ${voice.area}`,
          ),
          variants: [
            sentenceCase("Role framing should stay specific enough to be useful, while remaining inclusive and flexible."),
            sentenceCase(
              `Perspective matters here because it shows where ${voice.value} is most likely to be tested`,
            ),
            sentenceCase(
              `The significator anchors the reading to a lived viewpoint — without it, the cards describe a situation but not who is standing inside it or what they can actually do`,
            ),
            sentenceCase(
              `Everything else in the spread is relative to this position; the significator is not just a label, it is the center of gravity that makes distance, direction, and adjacency meaningful`,
            ),
          ],
        },
        meta: {
          weight: 0.9,
          active: true,
          version: "v1",
        },
        safety: baseSafetyFlags(),
      });
    });
  });

  return entries;
}
