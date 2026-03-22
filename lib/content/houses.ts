export interface HouseMeaning {
  id: number;
  name: string;
  shortFocus: string;
  description: string;
}

export const HOUSE_MEANINGS: HouseMeaning[] = [
  { id: 1, name: "Rider House", shortFocus: "incoming momentum", description: "Where messages, news, and first movement arrive." },
  { id: 2, name: "Clover House", shortFocus: "small luck", description: "Where quick chances and temporary openings appear." },
  { id: 3, name: "Ship House", shortFocus: "expansion", description: "Where travel, trade, and distance shape perspective." },
  { id: 4, name: "House House", shortFocus: "stability", description: "Where foundations, home patterns, and security are tested." },
  { id: 5, name: "Tree House", shortFocus: "long growth", description: "Where health, roots, and long-term development are emphasized." },
  { id: 6, name: "Clouds House", shortFocus: "ambiguity", description: "Where uncertainty must be clarified before commitment." },
  { id: 7, name: "Snake House", shortFocus: "strategy", description: "Where complexity, desire, and tactical choices unfold." },
  { id: 8, name: "Coffin House", shortFocus: "closure", description: "Where endings, release, and transitions are necessary." },
  { id: 9, name: "Bouquet House", shortFocus: "grace", description: "Where gifts, beauty, and social goodwill are active." },
  { id: 10, name: "Scythe House", shortFocus: "decisive cuts", description: "Where sudden decisions and clear boundaries matter." },
  { id: 11, name: "Whip House", shortFocus: "repetition", description: "Where cycles, pressure, and refinement keep repeating until something changes." },
  { id: 12, name: "Birds House", shortFocus: "dialogue", description: "Where conversation and anxiety move together." },
  { id: 13, name: "Child House", shortFocus: "new start", description: "Where fresh beginnings and small experiments begin." },
  { id: 14, name: "Fox House", shortFocus: "caution", description: "Where strategy, discernment, and self-interest appear." },
  { id: 15, name: "Bear House", shortFocus: "power", description: "Where resources, authority, and stewardship need careful handling." },
  { id: 16, name: "Stars House", shortFocus: "guidance", description: "Where clarity, purpose, and long-range signal are strongest." },
  { id: 17, name: "Stork House", shortFocus: "upgrade", description: "Where changes, moves, and improvements accelerate." },
  { id: 18, name: "Dog House", shortFocus: "loyal support", description: "Where allies, trust, and reciprocal support are central." },
  { id: 19, name: "Tower House", shortFocus: "structure", description: "Where institutions, standards, and distance influence outcomes." },
  { id: 20, name: "Garden House", shortFocus: "public field", description: "Where visibility, community, and networks matter." },
  { id: 21, name: "Mountain House", shortFocus: "obstruction", description: "Where delays and obstacles require patience and rerouting." },
  { id: 22, name: "Crossroads House", shortFocus: "choice", description: "Where branching options and decisive selection are required." },
  { id: 23, name: "Mice House", shortFocus: "erosion", description: "Where stress and gradual loss can accumulate." },
  { id: 24, name: "Heart House", shortFocus: "values and love", description: "Where emotional truth and devotion guide decisions." },
  { id: 25, name: "Ring House", shortFocus: "commitment", description: "Where contracts, loops, and binding agreements operate." },
  { id: 26, name: "Book House", shortFocus: "hidden knowledge", description: "Where secrets, study, and private information are held." },
  { id: 27, name: "Letter House", shortFocus: "documents", description: "Where written messages and records carry weight." },
  { id: 28, name: "Counterpart House", shortFocus: "the other", description: "Where counterpart roles and mirror dynamics emerge." },
  { id: 29, name: "Querent House", shortFocus: "self agency", description: "Where identity, intention, and personal agency sit." },
  { id: 30, name: "Lily House", shortFocus: "maturity", description: "Where ethics, peace, and seasoned judgment apply." },
  { id: 31, name: "Sun House", shortFocus: "success", description: "Where vitality, confidence, and clear progress shine." },
  { id: 32, name: "Moon House", shortFocus: "recognition", description: "Where emotional cycles and reputation are active." },
  { id: 33, name: "Key House", shortFocus: "resolution", description: "Where certainty and unlock moments become available." },
  { id: 34, name: "Fish House", shortFocus: "resource flow", description: "Where money, trade, and liquidity patterns matter." },
  { id: 35, name: "Anchor House", shortFocus: "endurance", description: "Where career, commitment, and long effort stabilize." },
  { id: 36, name: "Cross House", shortFocus: "meaningful burden", description: "Where duty, purpose, and spiritual weight are held." },
];

export const HOUSE_BY_ID = new Map(HOUSE_MEANINGS.map((house) => [house.id, house]));

export function getHouseMeaning(id: number): HouseMeaning {
  const house = HOUSE_BY_ID.get(id);
  if (!house) {
    throw new Error(`Unknown house id ${id}`);
  }
  return house;
}
