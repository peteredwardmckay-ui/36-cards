const CARD_NAMES: string[] = [
  "Rider",
  "Clover",
  "Ship",
  "House",
  "Tree",
  "Clouds",
  "Snake",
  "Coffin",
  "Bouquet",
  "Scythe",
  "Whip",
  "Birds",
  "Child",
  "Fox",
  "Bear",
  "Stars",
  "Stork",
  "Dog",
  "Tower",
  "Garden",
  "Mountain",
  "Crossroads",
  "Mice",
  "Heart",
  "Ring",
  "Book",
  "Letter",
  "Counterpart",
  "Querent",
  "Lily",
  "Sun",
  "Moon",
  "Key",
  "Fish",
  "Anchor",
  "Cross",
];

export function getPublicCardName(cardId: number): string {
  if (!Number.isInteger(cardId) || cardId < 1 || cardId > CARD_NAMES.length) {
    throw new Error(`Unknown card id ${cardId}`);
  }

  return CARD_NAMES[cardId - 1] as string;
}

export function getPublicHouseName(houseId: number): string {
  return `${getPublicCardName(houseId)} House`;
}
