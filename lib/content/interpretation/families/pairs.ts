import { CARD_BY_ID } from "@/lib/content/cards";
import { PAIR_MEANINGS } from "@/lib/content/pairs";
import { SUBJECT_DEFINITIONS } from "@/lib/content/subjects";
import type { InterpretationEntry, InterpretationPolarity } from "@/lib/content/interpretation/model";
import {
  baseSafetyFlags,
  describeThemeFocus,
  getSubjectVoice,
  polarityTones,
  selectSubjectThemesBySignals,
  sentenceCase,
} from "@/lib/content/interpretation/families/shared";

const PRIORITY_PAIR_LIMIT = 72;

function pairPolarity(text: string): InterpretationPolarity {
  const lower = text.toLowerCase();
  if (/(delay|obstacle|stress|burden|risk|uncertain|deplete|tension)/.test(lower)) return "challenging";
  if (/(success|clarity|support|alignment|confidence|unlock|joy|stability)/.test(lower)) return "constructive";
  return "mixed";
}

function pairKey(cardA: number, cardB: number): string {
  return cardA < cardB ? `${cardA}-${cardB}` : `${cardB}-${cardA}`;
}

export function buildPairInterpretationEntries(): InterpretationEntry[] {
  const entries: InterpretationEntry[] = [];
  const priorityPairs = [...PAIR_MEANINGS].sort((a, b) => b.signal - a.signal).slice(0, PRIORITY_PAIR_LIMIT);

  SUBJECT_DEFINITIONS.forEach((subject) => {
    priorityPairs.forEach((pair, index) => {
      const domainMeaning = pair.meanings[subject.fallbackDomain];
      const polarity = pairPolarity(domainMeaning);
      const left = CARD_BY_ID.get(pair.a);
      const right = CARD_BY_ID.get(pair.b);
      const themes = selectSubjectThemesBySignals(
        subject.id,
        subject.defaultThemes,
        [
          left?.name ?? "",
          right?.name ?? "",
          left?.keywords.join(" ") ?? "",
          right?.keywords.join(" ") ?? "",
          domainMeaning,
          left?.coreMeaning ?? "",
          right?.coreMeaning ?? "",
        ],
        index + pair.a + pair.b,
        3,
      );
      const voice = getSubjectVoice(subject.id);
      const themeFocus = describeThemeFocus(themes, "the central issue");

      entries.push({
        id: `pair:${subject.id}:${pair.key}`,
        technique: "pair",
        techniqueKey: `pair:${pairKey(pair.a, pair.b)}`,
        subjectId: subject.id,
        themeIds: themes,
        appliesTo: {
          cardA: pair.a,
          cardB: pair.b,
        },
        ranking: {
          tone: polarityTones(polarity),
          intensity: (Math.max(1, Math.min(5, Math.round(pair.signal / 4))) as 1 | 2 | 3 | 4 | 5),
          confidence: Math.min(0.92, 0.62 + pair.signal / 28),
          effect: [left?.keywords[0] ?? "pair", right?.keywords[0] ?? "context"],
          polarity,
        },
        conditions: {
          prefers: [`subject:${subject.id}`],
        },
        text: {
          primary: sentenceCase(domainMeaning),
          variants: [
            sentenceCase(
              `In ${voice.area}, ${left?.name ?? "Card A"} with ${right?.name ?? "Card B"} makes ${themeFocus} harder to ignore, especially where ${voice.pressure} is already active`,
            ),
            sentenceCase(
              `${left?.name ?? "Card A"} brings ${left?.keywords[0] ?? "signal"}; ${right?.name ?? "Card B"} brings ${right?.keywords[0] ?? "context"}. Together they speak to ${voice.value}`,
            ),
            sentenceCase(
              `Read this pair as one movement inside ${voice.area}: ${left?.action ?? "act with care"} while staying aware of ${right?.caution?.toLowerCase() ?? "context"}`,
            ),
          ],
          summary: sentenceCase(`${left?.name ?? "Card A"} and ${right?.name ?? "Card B"} combine around ${themeFocus}`),
        },
        meta: {
          weight: 1.15,
          active: true,
          version: "v1",
        },
        safety: baseSafetyFlags(),
      });
    });
  });

  return entries;
}
