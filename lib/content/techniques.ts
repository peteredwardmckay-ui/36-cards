export interface TechniqueGlossary {
  slug: string;
  title: string;
  summary: string;
  details: string[];
}

export const TECHNIQUES: TechniqueGlossary[] = [
  {
    slug: "houses",
    title: "Houses (Casting Board)",
    summary: "Each layout position is mapped to one of the 36 Lenormand houses, blending the card drawn with the house context.",
    details: [
      "House mapping adds context and role to any card.",
      "In the Grand Tableau, position one is Rider House and so on through position thirty-six.",
      "A card in an unexpected house can reveal a hidden angle in the question.",
    ],
  },
  {
    slug: "diagonals",
    title: "Diagonals",
    summary: "Diagonal lines reveal storyline arcs and supporting currents beyond immediate neighbors.",
    details: [
      "Main diagonals in GT show long-range narrative pathways.",
      "Card-centered diagonals reveal pressure and support lines around a focal card.",
      "Diagonal echoes can indicate repeated themes across different life areas.",
    ],
  },
  {
    slug: "knighting",
    title: "Knighting Moves",
    summary: "Knight moves (chess L-shapes) expose indirect influences, triggers, and hidden connectors.",
    details: [
      "Knight cards often indicate secondary effects and cross-channel influence.",
      "Significator knighting is useful for practical next-step strategy.",
      "Knight links can surface cards that are otherwise distant in the grid.",
    ],
  },
  {
    slug: "proximity",
    title: "Proximity (Near / Medium / Far)",
    summary: "Distance from the focal card helps classify what is immediate, developing, or background.",
    details: [
      "Near cards are adjacent (including diagonals).",
      "Medium cards are within two squares on the board.",
      "Far cards provide backdrop influence and longer-horizon context.",
    ],
  },
  {
    slug: "significators",
    title: "Significator Reading",
    summary: "The reading uses gender-neutral significators: Querent and Counterpart.",
    details: [
      "Querent represents the focal self by default.",
      "Counterpart represents another key person or stakeholder.",
      "Mode can be set to self, other, relationship, or open depending on your question.",
    ],
  },
];

export const TECHNIQUES_BY_SLUG = new Map(TECHNIQUES.map((item) => [item.slug, item]));
