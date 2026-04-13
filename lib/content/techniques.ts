export interface TechniqueGlossary {
  slug: string;
  title: string;
  summary: string;
  description: string;
  howItWorks: string[];
  whyItMatters: string;
  example: string;
}

export const TECHNIQUES: TechniqueGlossary[] = [
  {
    slug: "houses",
    title: "Houses (Casting Board)",
    summary: "Each layout position is mapped to one of the 36 Lenormand houses, blending the card drawn with the house context.",
    description: "The house system is what separates a Grand Tableau from a random pile of cards. Every position on the board belongs to a house — position 1 is the Rider House, position 2 is the Clover House, and so on through all 36. When a card lands in a house, it does not lose its own meaning; instead, it gains a second layer. The card tells you what is happening; the house tells you where in your life it is happening.",
    howItWorks: [
      "Each of the 36 positions in a Grand Tableau is permanently assigned to a house, numbered 1 through 36 in the same order as the cards themselves.",
      "When a card lands in a house, you read both meanings together. The Coffin in the Heart House is not just an ending — it is an ending in matters of love or core values.",
      "A card landing in its own house (e.g. the Rider in position 1) is considered intensified — the theme is doubled and demands attention.",
      "Houses do not change based on the reading. They are the fixed landscape; the cards are the weather that moves across it.",
    ],
    whyItMatters: "Without houses, a Grand Tableau is just 36 cards in a grid. With houses, every position becomes a specific department of life — career, health, love, ambition, secrets — and every card that lands there is filtered through that department's concerns. This is what makes Grand Tableau readings so layered: the same card means something different depending on where it falls.",
    example: "The Ship (journey, distance) lands in the Tower House (institutions, formal authority). This is not a holiday — it is an institutional move. A job transfer, an international assignment, or expansion into a new market governed by formal rules. The house redirects the card's travel energy into structured, official channels.",
  },
  {
    slug: "diagonals",
    title: "Diagonals",
    summary: "Diagonal lines reveal storyline arcs and supporting currents beyond immediate neighbours.",
    description: "Diagonals trace the long arcs that run underneath a reading. While adjacent cards tell you what is happening right now, diagonal lines reveal the deeper currents — the narrative threads that connect distant parts of the spread into a single storyline. They are the technique that reveals cause-and-effect relationships separated by time or circumstance.",
    howItWorks: [
      "Main diagonals run corner-to-corner across the Grand Tableau grid, creating two primary narrative pathways through the entire spread.",
      "Card-centred diagonals extend outward from any focal card (often the significator) in four diagonal directions, revealing what pressures and support lines converge on that person or theme.",
      "Cards along the same diagonal share a narrative thread — they may represent stages of the same story, or forces that are connected even though they appear unrelated at first glance.",
      "When the same theme appears on multiple diagonals, it suggests a pattern that runs deeper than any single area of life.",
    ],
    whyItMatters: "Diagonals catch what proximity misses. Two cards can be far apart on the grid but sit on the same diagonal, meaning they are part of the same underlying story. A health card and a career card on the same diagonal might reveal that a work decision is being driven by physical exhaustion — a connection that adjacency alone would never surface.",
    example: "The Stars (guidance, clarity) and the Coffin (endings, closure) sit on the same main diagonal. This suggests that clarity arrives through an ending — understanding will come not from more information, but from letting something finish. The diagonal connects the two events into a single arc: the end of one thing is the beginning of seeing clearly.",
  },
  {
    slug: "knighting",
    title: "Knighting Moves",
    summary: "Knight moves (chess L-shapes) expose indirect influences, triggers, and hidden connectors.",
    description: "Knighting borrows the chess knight's L-shaped jump to find cards that influence each other indirectly. These are not neighbours, and they are not on the same row, column, or diagonal — they connect through a blind spot in the grid. Knighting reveals what is acting on a situation from an unexpected angle: the colleague you did not consider, the resource you forgot you had, the consequence nobody warned you about.",
    howItWorks: [
      "From any card on the Grand Tableau grid, a knight move jumps two squares in one direction and one square perpendicular (or vice versa), exactly like a chess knight.",
      "Each card can have up to eight knight connections, depending on its position on the grid. Edge and corner cards have fewer.",
      "Knight-linked cards represent indirect influences — forces that are not obviously connected to the focal card but are actively shaping its outcome.",
      "When the significator's knight cards include a cluster of similar themes (e.g. multiple cards about communication), it suggests a hidden pattern of indirect pressure.",
    ],
    whyItMatters: "Knighting surfaces what you would not think to look for. Adjacent cards show the obvious context; diagonals show the deep narrative. But knight cards show the sideways influence — the thing that is affecting your situation from a direction you are not watching. In complex readings, knighting often identifies the most actionable insight because it points to leverage you did not know existed.",
    example: "The Fox (caution, self-interest) appears as a knight card to the Ring (commitment, contracts). This does not mean the commitment is necessarily bad — but it means someone's self-interest is reaching into the agreement from an angle that is not immediately visible. The knighting connection suggests checking the terms more carefully, or noticing whose interests the contract actually serves.",
  },
  {
    slug: "proximity",
    title: "Proximity (Near / Medium / Far)",
    summary: "Distance from the focal card helps classify what is immediate, developing, or background.",
    description: "Proximity is the simplest spatial technique, but also one of the most practical. It classifies every card in the spread by its distance from a focal card — usually the significator — and uses that distance to gauge urgency, timing, and relevance. What is near is happening now. What is far is context, background, or something that has not arrived yet.",
    howItWorks: [
      "Near cards are directly adjacent to the focal card, including diagonals — one square away in any direction. These represent the most immediate pressures, people, and circumstances.",
      "Medium cards are two squares away. These represent developing situations — things that are forming, approaching, or in an early stage of influence.",
      "Far cards are three or more squares away. These represent background forces, long-term context, or influences that are present but not yet urgent.",
      "The same card carries different weight depending on its distance. The Scythe (decisive cut) adjacent to the significator is an immediate decision; three rows away, it is a future reckoning.",
    ],
    whyItMatters: "Proximity gives you a sense of timing and urgency without needing to assign specific dates. It answers the question every reading eventually arrives at: what do I need to deal with first? Near cards are the answer. Medium cards are what to prepare for. Far cards are what to be aware of but not react to yet.",
    example: "The Mountain (obstruction, delay) is a near card to the significator, while the Key (resolution, unlock) is a far card. This tells you the blockage is immediate and real, but the solution exists — it is just not close yet. The reading would suggest patience and preparation rather than forcing through the obstacle now.",
  },
  {
    slug: "significators",
    title: "Significator Reading",
    summary: "The reading uses gender-neutral significators: Querent and Counterpart.",
    description: "In traditional Lenormand, the significator cards represent the people at the centre of the reading. 36 Cards uses a gender-neutral system: the Querent card represents you (or whoever is asking the question), and the Counterpart card represents the other key person in the situation. Everything else in the spread is read in relation to where these two cards fall.",
    howItWorks: [
      "The Querent card (card 29) represents the person asking the question. Its position on the Grand Tableau grid determines which houses, diagonals, and knight connections relate directly to you.",
      "The Counterpart card (card 28) represents the other significant person — a partner, rival, collaborator, or anyone whose role is defined in relation to yours.",
      "Significator mode can be set to self (focus on the Querent), other (focus on the Counterpart), relationship (read the dynamic between them), or open (let the spread determine emphasis).",
      "The distance between Querent and Counterpart on the grid is itself meaningful — close together suggests alignment or entanglement; far apart suggests independence or disconnection.",
    ],
    whyItMatters: "Without significators, a Grand Tableau is a map with no 'you are here' marker. The significator cards anchor the reading to specific people, giving every technique — proximity, diagonals, knighting — a reference point. The relationship between the two significators often tells the central story of the reading before any other technique is applied.",
    example: "The Querent lands in the Bear House (power, resources) with the Dog (loyalty) and Stars (guidance) nearby. The Counterpart lands in the Clouds House (ambiguity) with the Fox (caution) adjacent. This immediately frames the dynamic: you are in a position of strength with good support, while the other person is operating in uncertainty with guarded intentions. The reading will build from this foundation.",
  },
];

export const TECHNIQUES_BY_SLUG = new Map(TECHNIQUES.map((item) => [item.slug, item]));
