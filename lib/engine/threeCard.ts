import type { ThreeCardMode } from "@/lib/engine/types";

export interface ThreeCardPlacement {
  position: number;
  label: string;
  cardId: number;
}

export function getThreeCardLabels(mode: ThreeCardMode): [string, string, string] {
  if (mode === "situation-challenge-advice") {
    return ["Situation", "Challenge", "Advice"];
  }

  return ["Past", "Present", "Future"];
}

export function buildThreeCardLayout(deck: number[], mode: ThreeCardMode): ThreeCardPlacement[] {
  const labels = getThreeCardLabels(mode);
  return deck.slice(0, 3).map((cardId, index) => ({
    position: index + 1,
    label: labels[index],
    cardId,
  }));
}
