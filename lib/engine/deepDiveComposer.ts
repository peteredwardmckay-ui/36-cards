import { getCardMeaning } from "@/lib/content/cards";
import { getHouseMeaning } from "@/lib/content/houses";
import { queryInterpretationEntries } from "@/lib/content/interpretation";
import { getPairMeaning } from "@/lib/content/pairs";
import type { ThemeId } from "@/lib/content/themes";
import { inferCounterpartRole } from "@/lib/engine/context";
import { buildThemeCardSentence, buildThemeSectionBridge, buildCardPairBridge, pickThemeLensPhrase } from "@/lib/engine/themeFraming";
import { analyzeGrandTableauForDeepDive } from "@/lib/engine/deepDive";
import { buildGrandTableauLayout, findCardPosition } from "@/lib/engine/gt";
import { resolvePairMeaningForSubject } from "@/lib/engine/pairSelection";
import {
  buildActionDirectiveSentence,
  buildCardAssociationPhrase,
  buildCardAssociationSentence,
  buildHouseAssociationPhrase,
  buildHouseAssociationSentence,
  buildPairAssociationSentence,
  createReadingContext,
  type ReadingContext,
} from "@/lib/engine/narrativeAssociations";
import { synthesizeGrandTableauNarrative } from "@/lib/engine/tableauSynthesis";
import { buildThreeCardLayout, getThreeCardLabels } from "@/lib/engine/threeCard";
import type {
  Domain,
  GTLayout,
  NarrativeSection,
  ReadingState,
  SignificatorMode,
  SubjectId,
  ThreeCardMode,
} from "@/lib/engine/types";

interface ComposeDeepDiveInput {
  state: ReadingState;
  subjectId: SubjectId;
  subjectLabel: string;
  domain: Domain;
  resolvedThemeId: ThemeId | null;
  resolvedThemeLabel: string | null;
  random: () => number;
}

interface DeepDiveDraft {
  intro: string;
  sections: NarrativeSection[];
  conclusion: string;
  disclaimer: string;
  wordCount: number;
}

function choose<T>(values: T[], random: () => number): T {
  if (!values.length) {
    throw new Error("Cannot choose from an empty array");
  }
  return values[Math.floor(random() * values.length)];
}

function clause(input: string): string {
  return input.trim().replace(/[.!?]+$/g, "");
}

function lowerFirst(input: string): string {
  if (!input) return input;
  return input[0].toLowerCase() + input.slice(1);
}

function sentence(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const capitalized = `${trimmed[0].toUpperCase()}${trimmed.slice(1)}`;
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

function normalizeMeaningForSentenceFrame(input: string): string {
  const raw = lowerFirst(cleanSpacing(clause(sanitizeNarrativeText(input))));
  // Strip leading punctuation left behind when "In [Subject]," is removed by sanitization
  const afterLeadingPunct = raw.replace(/^[,;:\s]+/, "");
  // Strip "in/for [subject phrase], " prefix for subjects not handled by sanitizeNarrativeText (e.g. "in friends & social, ", "for vocation, ")
  const afterSubjectPrefix = afterLeadingPunct.replace(/^(?:in|for)\s+[^,]{2,50},\s*/i, "");
  // Strip ". Here, [sentence]" suffix produced by the primary card interpretation template
  const afterHere = afterSubjectPrefix.replace(/\.\s*here,.*$/i, "").trim();
  // Strip trailing passive constructions like "is required", "is needed", "is indicated"
  const normalized = afterHere.replace(/\s+(is|are|was|were)\s+(required|needed|indicated|recommended|necessary|warranted)\s*$/i, "").trim();
  if (!normalized) return "";
  if (
    /^(choose|set|keep|watch|name|protect|clarify|review|track|listen|speak|pause|move|reframe|allow|hold|act|offer|take|consider|make|prioritize|commit|focus|ask|give|let|notice)\b/i.test(
      normalized,
    )
  ) {
    return `the need to ${normalized}`;
  }
  // "[card name] brings X into Y" pattern: extract just X (the themeFocus fragment)
  // Must check before the phase-where verb list to prevent false matches like "anchor brings career [change] into..."
  const bringMatch = /^\w+\s+(?:brings|carries)\s+(.+?)\s+into\b/i.exec(normalized);
  if (bringMatch) return bringMatch[1];
  if (
    /^(?:[a-z][a-z'-]*\s+){0,5}(?:require|requires|influence|influences|affect|affects|shape|shapes|govern|governs|decide|decides|demand|demands|change|changes|reveal|reveals|determine|determines|complicate|complicates|tighten|tightens|deepen|deepens|pull|pulls|keep|keeps|open|opens)\b/i.test(
      normalized,
    )
  ) {
    return `a phase where ${normalized}`;
  }
  return normalized;
}

function withIndefiniteArticle(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "a reading";
  return `${/^[aeiou]/i.test(trimmed) ? "an" : "a"} ${trimmed}`;
}

function subjectReadingLabel(subjectLabel: string): string {
  return subjectLabel.replace(/\s+reading$/i, "").trim();
}

function cleanSpacing(input: string): string {
  return input
    .replace(/[^\S\n]+/g, " ")
    .replace(/[^\S\n]*([,.;:!?])/g, "$1")
    .replace(/([,.;:!?])([A-Za-z])/g, "$1 $2")
    .replace(/\.[^\S\n]*\./g, ".")
    .trim();
}

function sanitizeNarrativeText(input: string): string {
  return cleanSpacing(
    input
      .replace(/\bthe significant other perspective enters the reading\b/gi, "the other person's perspective comes into focus")
      .replace(/\bSignificator mode\b[^.]*\.?/gi, "")
      .replace(/\bnear proximity\b[^.]*\.?/gi, "")
      .replace(/\bsecondary diagonal\b[^.]*\.?/gi, "")
      .replace(/\bagency and orientation\b/gi, "leverage and direction")
      .replace(/\bsequence quality\b/gi, "how the sequence holds")
      .replace(/\bhigh[- ]signal checkpoint\b/gi, "clear hinge")
      .replace(/\bin\s+(?:general|love|work|money|home(?:_family)?|friends(?:_social)?|personal(?:_growth)?|health|pets|creative|travel|education|spiritual|community|legal(?:_admin)?|purpose(?:_calling)?)\s+context\b/gi, "")
      .replace(/\bin\s+(?:a|the)?\s*(?:general|love|work|money|home(?:_family)?|friends(?:_social)?|personal(?:_growth)?|health|pets|creative|travel|education|spiritual|community|legal(?:_admin)?|purpose(?:_calling)?)\s+frame\b/gi, "")
      .replace(/\bin\s+[A-Za-z][A-Za-z/&\s-]{1,40}\s+frame\b/g, "")
      .replace(/\bin\s+(?:General|Love|Work|Money)\b(?=\s*(?:[,.]|$))(?!\s+House)/gi, "")
      .replace(/\bin\s+Purpose\s*\/\s*Calling\b(?=\s+highlights)/gi, "")
      .replace(/\b(subject|technique|template|ranking)\b[^.]*\.?/gi, ""),
  );
}

function normalizeEmbeddedFragment(input: string): string {
  return cleanSpacing(
    input
      .replace(/\bpoints to to\b/gi, "points to")
      .replace(/\bare central\b/gi, "as central")
      .replace(/\bis central\b/gi, "is central")
      .replace(/\bthe\.$/i, "")
      .replace(/\s+\.$/g, "."),
  );
}

function normalizeHouseOverlayText(input: string, fallback: string): string {
  const cleaned = cleanSpacing(
    sanitizeNarrativeText(clause(input))
      .replace(/^[A-Za-z][A-Za-z' -]*\s+House\s+centers\s+/i, "")
      .replace(/\bhouse\s+centers\s+/i, "")
      .replace(/\bhouse\b/gi, ""),
  );
  if (cleaned.split(/\s+/).filter(Boolean).length < 3) {
    return fallback;
  }
  return lowerFirst(cleaned);
}

function normalizeCardThread(input: string): string {
  const cleaned = lowerFirst(clause(sanitizeNarrativeText(input)));
  if (!cleaned) return "the tone needs patient attention";
  if (/^(consider|watch|choose|set|name|protect|clarify|review|track|listen|speak|pause|move|reframe|allow|hold)\b/i.test(cleaned)) {
    return `you may need to ${cleaned}`;
  }
  return cleaned;
}

function interpretiveSentence(input: string): string {
  const cleaned = normalizeEmbeddedFragment(sanitizeNarrativeText(clause(input)));
  if (!cleaned) return "";
  const tokenCount = cleaned.split(/\s+/).filter(Boolean).length;
  if (tokenCount < 2 && /^(the|this|that|it)$/i.test(cleaned)) return "";
  return sentence(lowerFirst(cleaned));
}

function interpretiveThread(input: string): string {
  const cleaned = normalizeEmbeddedFragment(sanitizeNarrativeText(clause(input)));
  if (!cleaned) return "";
  const lower = lowerFirst(cleaned);
  if (
    /^(choose|set|keep|watch|name|protect|clarify|review|track|listen|speak|pause|move|reframe|allow|hold|act|offer|take|make|prioritize|commit|focus|ask|give|let)\b/i.test(
      lower,
    )
  ) {
    return `the need to ${lower}`;
  }
  if (/^(your|the other person's|how|what|where|whether|timing|pressure|distance|trust|commitment|clarity|support|documents|roles|professional|family|wellbeing)\b/i.test(lower)) {
    return lower;
  }
  // "strength can protect if paired with fairness" → "how strength can protect if paired with fairness"
  // Safe-pass above must come first so "what can X" is not double-prefixed
  if (/^\w[\w\s]{0,20}\s+(can|will|may|should|must|could|would)\b/i.test(lower)) {
    return `how ${lower}`;
  }
  return lower;
}

function buildDiagonalMovementSentence(
  cardIds: number[],
  subjectId: SubjectId,
  domain: Domain,
  random: () => number,
  context?: ReadingContext,
): string {
  if (cardIds.length < 2) return "";

  const startThread = normalizeMeaningForSentenceFrame(
    buildCardAssociationPhrase(cardIds[0], subjectId, domain, random, context),
  );
  const endThread = normalizeMeaningForSentenceFrame(
    buildCardAssociationPhrase(cardIds[cardIds.length - 1], subjectId, domain, random, context),
  );

  if (!startThread || !endThread) return "";
  if (startThread === endThread) {
    return sentence(`Read as a sequence, that line keeps circling ${startThread}`);
  }

  return sentence(
    choose(
      [
        `Read as a sequence, that line moves from ${startThread} toward ${endThread}`,
        `Taken as one progression, it starts with ${startThread}, then leans toward ${endThread}`,
        `As a wider arc, it begins with ${startThread}, then gradually points toward ${endThread}`,
      ],
      random,
    ),
  );
}

function buildLineMovementSentence(
  cardIds: number[],
  subjectId: SubjectId,
  domain: Domain,
  random: () => number,
  axis: "row" | "column",
  context?: ReadingContext,
): string {
  if (cardIds.length < 2) return "";

  const startThread = normalizeMeaningForSentenceFrame(
    buildCardAssociationPhrase(cardIds[0], subjectId, domain, random, context),
  );
  const endThread = normalizeMeaningForSentenceFrame(
    buildCardAssociationPhrase(cardIds[cardIds.length - 1], subjectId, domain, random, context),
  );

  if (!startThread || !endThread) return "";

  if (startThread === endThread) {
    return sentence(
      axis === "row"
        ? `Across that line, the same issue keeps circling ${startThread}`
        : `On that vertical line, the same underlying issue keeps circling ${startThread}`,
    );
  }

  if (axis === "row") {
    return sentence(
      choose(
        [
          `Across that line, the movement runs from ${startThread} toward ${endThread}`,
          `Read from one side to the other, that row moves from ${startThread} toward ${endThread}`,
          `Seen as one horizontal progression, it moves from ${startThread} toward ${endThread}`,
        ],
        random,
      ),
    );
  }

  return sentence(
    choose(
      [
        `On that vertical line, the deeper movement runs from ${startThread} toward ${endThread}`,
        `Read from top to bottom, that axis moves from ${startThread} toward ${endThread}`,
        `Seen as one vertical progression, it moves from ${startThread} toward ${endThread}`,
      ],
      random,
    ),
  );
}

function buildProximityInterpretationSentence(input: string): string {
  const cleaned = cleanSpacing(clause(sanitizeNarrativeText(input)));
  if (!cleaned) return "";

  const directFocusMatch = cleaned.match(/^In\s+.*,\s*near cards show how urgently (.+) needs attention$/i);
  if (directFocusMatch) {
    return sentence(`The nearest cards show where the pressure lands first around ${directFocusMatch[1]}`);
  }

  const normalized = cleaned
    .replace(/^In\s+.*,\s*/i, "")
    .replace(/^near cards show\b/i, "the nearest cards show")
    .replace(
      /^Near cards speak first, medium cards gather, and far cards give context to the rest$/i,
      "the nearest cards speak first, while the wider field shows what is gathering around them",
    )
    .replace(
      /^Use distance as a pacing tool inside\s+[^,]+,\s*not as a fixed prediction$/i,
      "distance works best here as a pacing cue, not a fixed prediction",
    );

  const focusMatch = normalized.match(/^the nearest cards show how urgently (.+) needs attention$/i);
  if (focusMatch) {
    return sentence(`The nearest cards show where the pressure lands first around ${focusMatch[1]}`);
  }

  return sentence(normalized);
}

function narrativeMeaningDomain(subjectId: SubjectId): Domain {
  if (subjectId === "love") return "love";
  if (subjectId === "work") return "work";
  return "general";
}

function cardRef(cardId: number): string {
  const card = getCardMeaning(cardId);
  return `the ${card.name}`;
}

function countWords(input: string): number {
  return input
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function normalizeQuestionText(input: string): string | null {
  const cleaned = input.trim().replace(/[.!?]+$/g, "");
  return cleaned || null;
}

function countDraftWords(intro: string, sections: NarrativeSection[], conclusion: string): number {
  return countWords([intro, ...sections.map((section) => section.body), conclusion].join(" "));
}

function introShiftFocus(subjectId: SubjectId): string {
  switch (subjectId) {
    case "community":
      return "how the wider field is starting to shift";
    case "friends_social":
      return "how the social dynamic is starting to shift";
    case "love":
      return "what is starting to shift in the relationship";
    case "work":
      return "what is starting to shift in the work itself";
    case "home_family":
      return "what is starting to shift at home";
    case "travel":
      return "what is starting to shift in the journey";
    case "general_reading":
      return "what starts to move first";
    default:
      return "what starts to shift first";
  }
}

function sortedPairKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function toPairProse(input: string): string {
  const normalized = normalizeEmbeddedFragment(sanitizeNarrativeText(clause(input)).replace(/\s+/g, " ").trim());
  const withoutNames = normalized.replace(
    /^[A-Za-z][A-Za-z'-]*(?:\s+[A-Za-z][A-Za-z'-]*)?\s*\+\s*[A-Za-z][A-Za-z'-]*(?:\s+[A-Za-z][A-Za-z'-]*)?\s*/u,
    "",
  );
  const withoutLead = withoutNames
    .replace(/^in\s+[^,]{2,50},\s*/iu, "")
    .replace(/^in\s+(?:general|love|work|money)\s*,?\s*/iu, "")
    .replace(/^(general|love|work|money)\s+themes?\s*/iu, "")
    .replace(/^[,;:-]\s*/u, "")
    .replace(/^this\s+pair\s+acts\s+as\s+/iu, "")
    .replace(/^this\s+pair\s+/iu, "")
    .replace(/\bthis\s+pair\s+acts\s+as\s+/iu, "")
    .replace(
      /^(emphasizes|suggests|asks|indicates|points|signals|highlights|warns|marks|brings|calls|describes|supports|places|favors|combines|links|confirms|shows|reveals|blends)\s+/iu,
      "",
    )
    .replace(/;/g, ",")
    .trim();
  const cleanedLead = withoutLead.replace(/^,\s*/, "").replace(/^(to|that)\s+/i, "");

  if (cleanedLead.split(/\s+/).length < 3) {
    return lowerFirst(normalized);
  }
  return lowerFirst(cleanedLead);
}

function toPairMeaningClause(input: string): string {
  const prose = toPairProse(input);
  if (/^(unlock|open|clarify|stabilize|shift|strengthen|restore|renew|reveal|move|draw|build|protect|create|invite|ask|set|choose|keep|name|listen|speak|let|hold|allow|accept|release|bridge|repair|align|commit|focus|plan|reframe)\b/i.test(prose)) {
    return `you can ${prose}`;
  }
  return prose;
}

function polishTemplatedPhrase(input: string, random: () => number): string {
  let phrase = lowerFirst(cleanSpacing(clause(sanitizeNarrativeText(input))));

  if (/stakeholder alignment as a central task/i.test(phrase)) {
    phrase = choose(
      [
        "a clear need for aligned expectations between you and the other person",
        "a shared alignment point that asks for clearer expectations",
        "a relational hinge where clarity between both sides matters most",
      ],
      random,
    );
  }

  if (/for resilience without over-carrying burdens/i.test(phrase)) {
    phrase = choose(
      [
        "resilience without carrying what is not yours",
        "steady endurance with clearer emotional load boundaries",
        "staying resilient while refusing unnecessary weight",
      ],
      random,
    );
  }

  if (/^(?:the\s+)?primary diagonal reveals a storyline(?: crossing immediate and long-range influences)?/i.test(phrase)) {
    phrase = choose(
      [
        "the main diagonal traces how immediate pressures become longer-term outcomes",
        "the main diagonal maps a thread from what is pressing now to what settles later",
        "the main diagonal shows one continuous arc from present tension to later resolution",
      ],
      random,
    );
  }

  return phrase;
}

function toPairNarrativePhrase(input: string, random: () => number): string {
  const clauseText = polishTemplatedPhrase(toPairMeaningClause(input), random);
  if (/^for\s+/i.test(clauseText)) {
    return `highlights ${clauseText.replace(/^for\s+/i, "")}`;
  }
  if (/^you can\b/i.test(clauseText)) {
    return `hints that ${clauseText}`;
  }
  return `highlights ${clauseText}`;
}

function buildPairPointSentence(
  leadIn: string,
  input: string,
  random: () => number,
): string {
  const clauseText = polishTemplatedPhrase(toPairMeaningClause(input), random);

  if (
    /^(?:the|a|an|this|that)\b/i.test(clauseText) &&
    /\b(?:is|are|was|were|lands|keeps|begins|starts|gathers|moves|returns|tightens|hardens|deepens|gets|becomes|needs|need|carries|carry)\b/i.test(
      clauseText,
    )
  ) {
    return sentence(`${leadIn} suggests that ${clauseText}`);
  }

  if (
    /^(?:your|their|his|her|our|my)\b/i.test(clauseText) &&
    /\b(?:becoming|moving|gathering|starting|returning|feeding|tightening|hardening|deepening|being)\b/i.test(clauseText)
  ) {
    return sentence(`${leadIn} points toward ${clauseText}`);
  }

  return sentence(`${leadIn} highlights ${clauseText}`);
}

function buildClusterLinkSentence(
  subjectId: SubjectId,
  random: () => number,
): string {
  switch (subjectId) {
    case "legal_admin":
      return sentence(
        choose(
          [
            "The cluster keeps procedural pressure and practical choices tightly linked",
            "This part of the spread keeps procedural pressure and practical choices tightly bound together",
          ],
          random,
        ),
      );
    case "money":
      return sentence(
        choose(
          [
            "This nearest ring keeps financial pressure and practical choices tightly linked",
            "Here, financial pressure and practical choices keep feeding into one another",
          ],
          random,
        ),
      );
    case "education":
      return sentence(
        choose(
          [
            "The cluster keeps study pressure, practical choices, and what still needs proving tightly linked",
            "This section keeps study pressure, practical choices, and what still needs proving tightly bound together",
          ],
          random,
        ),
      );
    case "travel":
      return sentence(
        choose(
          [
            "The cluster keeps logistics, timing, and practical choices tightly linked",
            "This section keeps logistics, timing, and practical choices tightly bound together",
          ],
          random,
        ),
      );
    case "creative":
      return sentence(
        choose(
          [
            "The cluster keeps creative pressure, practical choices, and what still needs shaping tightly linked",
            "This knot of cards keeps creative pressure, practical choices, and what still needs shaping tightly bound together",
          ],
          random,
        ),
      );
    case "friends_social":
      return sentence(
        choose(
          [
            "The cluster keeps social pressure, practical choices, and what still needs clarifying tightly linked",
            "This knot of cards keeps social pressure, practical choices, and what still needs clarifying tightly bound together",
          ],
          random,
        ),
      );
    case "work":
      return sentence(
        choose(
          [
            "This nearest ring keeps workplace pressure and practical choices tightly linked",
            "Here, workplace pressure and practical choices keep shaping each other",
          ],
          random,
        ),
      );
    default:
      return sentence(
        choose(
          [
            "In this nearest ring, emotion and practical decisions keep shaping each other",
            "Here, emotional tone and practical decisions remain tightly linked",
            "At this distance, feeling and practical judgment keep feeding into one another",
          ],
          random,
        ),
      );
  }
}

function renderDirectionList(
  values: Array<{ label: string; cardId: number }>,
): string {
  const items = values.map((item) => `${cardRef(item.cardId)} to the ${item.label}`);
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function chebyshevDistanceFromSignificator(
  placement: { row: number; col: number },
  significator: { row: number; col: number },
): number {
  return Math.max(Math.abs(placement.row - significator.row), Math.abs(placement.col - significator.col));
}

function formatCardList(cardIds: number[], limit = 6): string {
  return cardIds.slice(0, limit).map((cardId) => cardRef(cardId)).join(", ");
}

function dominantKeywords(cardIds: number[]): string[] {
  const counts = new Map<string, number>();
  cardIds.forEach((cardId) => {
    getCardMeaning(cardId).keywords.slice(0, 2).forEach((keyword) => {
      const normalized = keyword.toLowerCase().trim();
      if (!normalized) return;
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([keyword]) => keyword)
    .slice(0, 3);
}

function normalizeAtmospherePhrase(subjectId: SubjectId, phrase: string): string {
  const normalized = phrase
    // Rider
    .replace(/^news and arrival$/i, "movement and fresh signals")
    // Clover
    .replace(/^luck and window$/i, "brief openings and usable chances")
    // Ship
    .replace(/^journey and trade$/i, "movement and exchange")
    // House
    .replace(/^home and structure$/i, "home, structure, and steadiness")
    // Tree
    .replace(/^health and roots$/i, "slow growth and deep foundations")
    // Clouds
    .replace(/^uncertainty and fog$/i, "unclear conditions and shifting ground")
    // Snake
    .replace(/^strategy and complexity$/i, "strategic depth and layered complexity")
    // Coffin
    .replace(/^ending and rest$/i, "closure and rest")
    // Bouquet
    .replace(/^gift and charm$/i, "warmth and goodwill")
    // Scythe
    .replace(/^cut and decision$/i, "sharp choices and decisive pressure")
    // Whip
    .replace(/^repetition and tension$/i, "repeated friction and pressure")
    // Birds
    .replace(/^dialogue and nerves$/i, "active conversation and underlying tension")
    // Child
    .replace(/^beginning and small$/i, "small beginnings and first movement")
    // Fox
    .replace(/^caution and craft$/i, "caution and calculation")
    // Bear
    .replace(/^power and resources$/i, "resource authority and protective weight")
    // Stars
    .replace(/^guidance and clarity$/i, "clear guidance and long-range direction")
    .replace(/^clarity and success$/i, "clearer signal and momentum")
    .replace(/^clarity and visible progress$/i, "clearer visible traction")
    // Stork
    .replace(/^change and upgrade$/i, "active change and forward improvement")
    // Dog
    .replace(/^loyalty and ally$/i, "reliable loyalty and trusted support")
    // Tower
    .replace(/^institution and distance$/i, "formal structure and maintained distance")
    // Mountain
    .replace(/^obstacle and delay$/i, "real obstacles and necessary patience")
    // Crossroads
    .replace(/^choice and branch$/i, "choice and direction")
    // Mice
    .replace(/^erosion and stress$/i, "strain and attrition")
    // Heart
    .replace(/^love and values$/i, "genuine care and shared values")
    // Ring
    .replace(/^commitment and contract$/i, "commitment and formal terms")
    // Book
    .replace(/^knowledge and secrecy$/i, "private knowledge and hidden factors")
    // Letter
    .replace(/^document and message$/i, "written records and clear communication")
    // Counterpart
    .replace(/^other and mirror$/i, "the other person's perspective and what reflects back")
    // Querent
    .replace(/^self and identity$/i, "your own role and how it is shaping the field")
    // Lily
    .replace(/^maturity and peace$/i, "principled calm and long-term judgment")
    // Sun
    .replace(/^success and vitality$/i, "forward momentum and returning confidence")
    // Moon
    .replace(/^recognition and emotion$/i, "visibility and emotional tone")
    // Key
    .replace(/^solution and certainty$/i, "workable answers and clearer signal")
    // Fish
    .replace(/^money and flow$/i, "resource flow and financial movement")
    // Anchor
    .replace(/^stability and career$/i, "career durability and long-term steadiness")
    // Cross
    .replace(/^burden and meaning$/i, "meaningful responsibility and what it demands");
  if (/^public and network$/i.test(normalized)) return "public life and networks";
  if (subjectId !== "pets") return normalized;

  return normalized
    .replace(/\bcareer\b/gi, "care")
    .replace(/^stability and care$/i, "steadiness and care");
}

function displayHouseName(name: string): string {
  if (name === "House House") return "Foundation House";
  return name;
}

function pickInterpretationText(input: {
  subjectId: SubjectId;
  technique: "card" | "house" | "pair" | "diagonal" | "knighting" | "proximity" | "significator";
  techniqueKey: string;
  appliesTo: Record<string, number | string | boolean>;
  themeIds: ThemeId[];
  usedPhrases: string[];
  contextTags?: string[];
}): string | null {
  const units = queryInterpretationEntries({
    subjectId: input.subjectId,
    technique: input.technique,
    techniqueKey: input.techniqueKey,
    appliesTo: input.appliesTo,
    themeIds: input.themeIds,
    usedPhrases: input.usedPhrases,
    contextTags: input.contextTags,
    limit: 1,
  });
  if (!units[0]) return null;
  input.usedPhrases.push(units[0].selectedText);
  return units[0].selectedText;
}

function bestPairFromPositions(cardIds: number[], subjectId: SubjectId): { cardA: number; cardB: number; prose: string; signal: number } | null {
  const meaningDomain = narrativeMeaningDomain(subjectId);
  let best: { cardA: number; cardB: number; prose: string; signal: number } | null = null;
  for (let i = 0; i < cardIds.length; i += 1) {
    for (let j = i + 1; j < cardIds.length; j += 1) {
      const cardA = cardIds[i];
      const cardB = cardIds[j];
      const pair = getPairMeaning(cardA, cardB);
      const signal = pair?.signal ?? 16;
      const prose = toPairProse(resolvePairMeaningForSubject(cardA, cardB, meaningDomain, subjectId));
      if (!best || signal > best.signal) {
        best = { cardA, cardB, prose, signal };
      }
    }
  }
  return best;
}

function inferSignificatorCard(
  layout: ReturnType<typeof buildGrandTableauLayout>,
  mode: SignificatorMode,
): number {
  const querentPos = findCardPosition(layout, 29);
  const counterpartPos = findCardPosition(layout, 28);

  if (mode === "other") return 28;
  if (mode === "relationship") return 29;
  if (mode === "open") {
    if (querentPos && counterpartPos && counterpartPos < querentPos) {
      return 28;
    }
  }
  return 29;
}

function buildKeyThreadBullets(lines: string[]): string {
  return lines
    .slice(0, 5)
    .map((line) => sanitizeNarrativeText(sentence(line).replace(/[.!?]$/, "")))
    .filter(Boolean)
    .map((line) => `• ${line}`)
    .join("\n");
}

function buildArcBullet(
  cardIds: number[],
  subjectId: SubjectId,
  domain: Domain,
  random: () => number,
  context?: ReadingContext,
): string {
  if (cardIds.length < 2) {
    return `The wider arc settles around ${formatCardList(cardIds, 4)}`;
  }

  const startThread = normalizeMeaningForSentenceFrame(
    buildCardAssociationPhrase(cardIds[0], subjectId, domain, random, context),
  );
  const endThread = normalizeMeaningForSentenceFrame(
    buildCardAssociationPhrase(cardIds[cardIds.length - 1], subjectId, domain, random, context),
  );

  if (!startThread || !endThread) {
    return `The wider arc runs through ${formatCardList(cardIds, 4)}`;
  }

  if (startThread === endThread) {
    return `The wider arc keeps circling ${startThread}`;
  }

  return choose(
    [
      `The wider arc moves from ${startThread} toward ${endThread}`,
      `The longer movement runs from ${startThread} toward ${endThread}`,
      `The wider pattern starts in ${startThread}, then leans toward ${endThread}`,
    ],
    random,
  );
}

type TrimQueueEntry = { sectionId: string; sentence: string };

function removeSentenceFromBody(body: string, target: string): string {
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return cleanSpacing(body.replace(new RegExp(`\\s*${escaped}\\s*`), " ").trim());
}

function enforceDeepDiveTargets(
  intro: string,
  sections: NarrativeSection[],
  conclusion: string,
  spreadType: "grand-tableau" | "three-card",
  supplementalSentences: string[] = [],
  trimQueue: TrimQueueEntry[] = [],
): { intro: string; sections: NarrativeSection[]; conclusion: string; wordCount: number } {
  const minWords = spreadType === "grand-tableau" ? 650 : 280;
  const maxWords = spreadType === "grand-tableau" ? 1100 : 450;

  let wordCount = countDraftWords(intro, sections, conclusion);

  let supplementIndex = 0;
  while (wordCount < minWords && supplementIndex < supplementalSentences.length) {
    const extra = interpretiveSentence(supplementalSentences[supplementIndex]);
    if (extra) {
      const targetIndex = Math.max(0, sections.length - 2);
      sections[targetIndex] = {
        ...sections[targetIndex],
        body: cleanSpacing(`${sections[targetIndex].body} ${extra}`),
      };
      wordCount = countDraftWords(intro, sections, conclusion);
    }
    supplementIndex += 1;
  }

  let trimQueueIndex = 0;
  let guard = 0;
  while (wordCount > maxWords && guard < 48) {
    guard += 1;

    // Work through the priority trim queue first
    if (trimQueueIndex < trimQueue.length) {
      const entry = trimQueue[trimQueueIndex++];
      const sectionIndex = sections.findIndex((s) => s.id === entry.sectionId);
      if (sectionIndex !== -1) {
        const section = sections[sectionIndex];
        const newBody = removeSentenceFromBody(section.body, entry.sentence);
        if (newBody !== section.body) {
          sections[sectionIndex] = { ...section, body: newBody };
          wordCount = countDraftWords(intro, sections, conclusion);
        }
      }
      continue;
    }

    // Fallback: trim last sentence from longest section
    const longestIndex = sections.reduce(
      (best, section, index, list) => (section.body.length > list[best].body.length ? index : best),
      0,
    );
    const longest = sections[longestIndex];
    const sentences = longest.body
      .split(/(?<=[.!?])\s+/)
      .map((part) => part.trim())
      .filter(Boolean);
    if (sentences.length > 2) {
      const separator = longest.body.includes("\n") ? "\n" : " ";
      sections[longestIndex] = {
        ...longest,
        body: sentences.slice(0, sentences.length - 1).join(separator),
      };
    } else {
      break;
    }
    wordCount = countDraftWords(intro, sections, conclusion);
  }

  return {
    intro,
    sections,
    conclusion,
    wordCount,
  };
}

function composeDeepDiveGT(input: ComposeDeepDiveInput): DeepDiveDraft {
  const { state, subjectId, subjectLabel, domain, resolvedThemeId, resolvedThemeLabel, random } = input;
  const phraseContext: ReadingContext = createReadingContext();
  const gtLayout: GTLayout = state.setup.gtLayout ?? "4x9";
  const layout = buildGrandTableauLayout(state.layout, gtLayout);
  const significatorCardId = inferSignificatorCard(layout, state.setup.significatorMode);
  const significatorPosition = findCardPosition(layout, significatorCardId) ?? 1;
  const analysis = analyzeGrandTableauForDeepDive(layout, significatorPosition, gtLayout);
  const significatorPlacement = layout.find((placement) => placement.position === significatorPosition) ?? layout[0];
  const significatorCard = getCardMeaning(significatorPlacement.cardId);
  const significatorHouse = getHouseMeaning(significatorPlacement.houseId);
  const significatorHouseName = displayHouseName(significatorHouse.name);
  const meaningDomain = narrativeMeaningDomain(subjectId);
  const tableauSynthesis = synthesizeGrandTableauNarrative({
    layout,
    focusPosition: significatorPlacement.position,
    gtLayout,
    subjectId,
    domain: meaningDomain,
    random,
  });

  const themeIds: ThemeId[] = resolvedThemeId ? [resolvedThemeId] : [];
  const usedPhrases: string[] = [];

  const rowNeighbors = analysis.rowLine
    .filter((placement) => placement.position !== significatorPlacement.position)
    .sort(
      (left, right) =>
        Math.abs(left.col - analysis.significator.col) - Math.abs(right.col - analysis.significator.col),
    )
    .slice(0, 5);
  const columnNeighbors = analysis.columnLine
    .filter((placement) => placement.position !== significatorPlacement.position)
    .sort(
      (left, right) =>
        Math.abs(left.row - analysis.significator.row) - Math.abs(right.row - analysis.significator.row),
    )
    .slice(0, 3);

  const centerSignificatorText =
    pickInterpretationText({
      subjectId,
      technique: "significator",
      techniqueKey: `significator:${state.setup.significatorMode}`,
      appliesTo: { mode: state.setup.significatorMode },
      themeIds,
      usedPhrases,
      contextTags: [`significator:${state.setup.significatorMode}`],
    }) ?? sentence(`${inferCounterpartRole(state.setup.question, state.setup.significatorMode)} frames the reading`);

  const cardinal = [
    analysis.surroundings.north ? { label: "north", cardId: analysis.surroundings.north.cardId } : null,
    analysis.surroundings.south ? { label: "south", cardId: analysis.surroundings.south.cardId } : null,
    analysis.surroundings.east ? { label: "east", cardId: analysis.surroundings.east.cardId } : null,
    analysis.surroundings.west ? { label: "west", cardId: analysis.surroundings.west.cardId } : null,
  ].filter(Boolean) as Array<{ label: string; cardId: number }>;

  const diagonalNeighbors = [
    analysis.surroundings.northeast?.cardId,
    analysis.surroundings.northwest?.cardId,
    analysis.surroundings.southeast?.cardId,
    analysis.surroundings.southwest?.cardId,
  ].filter((value): value is number => typeof value === "number");

  const cardinalPair = bestPairFromPositions([significatorPlacement.cardId, ...cardinal.map((entry) => entry.cardId)], subjectId);
  const cardinalPairText = cardinalPair ? sentence(cardinalPair.prose) : null;

  const proximityText =
    pickInterpretationText({
      subjectId,
      technique: "proximity",
      techniqueKey: "proximity:near",
      appliesTo: { distance: "near" },
      themeIds,
      usedPhrases,
      contextTags: ["distance:near"],
    }) ?? "";

  const diagonalLine = analysis.dominantDiagonal.placements.map((placement) => placement.cardId);
  const diagonalTemplateText =
    pickInterpretationText({
      subjectId,
      technique: "diagonal",
      techniqueKey: analysis.dominantDiagonal.axis === "nwse" ? "diagonal:primary" : "diagonal:secondary",
      appliesTo: { line: analysis.dominantDiagonal.axis === "nwse" ? "primary" : "secondary" },
      themeIds,
      usedPhrases,
    }) ?? "";

  const secondaryZoneCenterCardId = analysis.secondaryCluster
    ? layout.find((placement) => placement.position === analysis.secondaryCluster?.centerPosition)?.cardId ?? layout[0].cardId
    : null;
  const secondaryZone = analysis.secondaryCluster
    ? {
        label: `a secondary cluster around ${cardRef(secondaryZoneCenterCardId ?? layout[0].cardId)}`,
        cards: analysis.secondaryCluster.placements.map((placement) => placement.cardId),
      }
    : (() => {
        const sortedQuadrants = [...analysis.quadrants].sort((left, right) => right.score - left.score);
        const fallback = sortedQuadrants[0];
        return {
          label: fallback.id.replace("_", " "),
          cards: fallback.placements.map((placement) => placement.cardId),
        };
      })();
  const secondaryPair = bestPairFromPositions(secondaryZone.cards, subjectId);
  const secondaryZoneCenterThread = secondaryZoneCenterCardId
    ? interpretiveThread(
        buildCardAssociationPhrase(secondaryZoneCenterCardId, subjectId, meaningDomain, random, phraseContext),
      )
    : "";
  const secondaryZoneDisplayCards =
    secondaryZoneCenterCardId && secondaryZone.cards.includes(secondaryZoneCenterCardId)
      ? secondaryZone.cards.filter((cardId) => cardId !== secondaryZoneCenterCardId)
      : secondaryZone.cards;

  const primaryClusterCardIds = analysis.primaryCluster.placements.map((placement) => placement.cardId);
  const renderedClusterCardIds = primaryClusterCardIds.slice(0, 7);
  const clusterPair = bestPairFromPositions(renderedClusterCardIds, subjectId);
  const cardinalPairKey = cardinalPair ? sortedPairKey(cardinalPair.cardA, cardinalPair.cardB) : null;
  const clusterPairKey = clusterPair ? sortedPairKey(clusterPair.cardA, clusterPair.cardB) : null;
  const secondaryPairKey = secondaryPair ? sortedPairKey(secondaryPair.cardA, secondaryPair.cardB) : null;
  const clusterPairText = clusterPair ? sentence(clusterPair.prose) : null;

  const dominantWords = dominantKeywords(primaryClusterCardIds);
  const rawAtmospherePhrase =
    dominantWords.length >= 2
      ? `${dominantWords[0]} and ${dominantWords[1]}`
      : dominantWords[0] ?? "quiet movement";
  const atmospherePhrase = normalizeAtmospherePhrase(subjectId, rawAtmospherePhrase);
  const themePhrase = resolvedThemeLabel ? resolvedThemeLabel.toLowerCase() : "context-led";
  const themeLensPhrase = pickThemeLensPhrase(resolvedThemeId, random);
  const normalizedQuestion = normalizeQuestionText(state.setup.question);
  const centerLead = choose(["At the center", "At the heart of the tableau", "In the middle of the spread"], random);
  const nearLead = choose(["Close by", "Within one step of the center", "Just around the center"], random);
  const clusterLead = choose(
    subjectId === "money"
      ? [
          "Around the center, a compact financial cluster gathers",
          "Nearest to the heart of the spread, these cards show the first practical pressure",
          "The closest cluster to the center carries the immediate financial weather",
        ]
      : [
          "Around the center, a compact cluster gathers",
          "Nearest to the heart of the spread, these cards show where the first pressure lands",
          "The closest cluster to the center carries the immediate emotional weather",
        ],
    random,
  );
  const widerLead = choose(
    [
      "A longer thread runs through",
      "In the wider picture, a line of continuity runs through",
      "Beyond the center, one clear arc runs through",
    ],
    random,
  );
  const backgroundLead = choose(["In the background", "Under the surface", "Further out in the field"], random);
  let strongestHouseBullet: string | null = null;
  const centerCardThread = interpretiveThread(
    buildCardAssociationPhrase(significatorCard, subjectId, meaningDomain, random, phraseContext),
  );
  const centerSignificatorThread =
    significatorCard.id === 29
      ? subjectId === "money"
        ? choose(
            [
              "your own financial choices are setting the pace more than first appearances suggest",
              "the reading keeps returning to what you can actually change, pause, or commit to in the money picture",
              "your own position in the finances matters because your decisions are shaping more of the outcome than the surrounding noise",
            ],
            random,
          )
        : subjectId === "home_family"
          ? choose(
              [
                "your role in the household matters because your boundaries are shaping what home can actually sustain",
                "the reading keeps returning to what you are carrying, permitting, or postponing at home",
                "your own place in the household matters because the family field is taking its cues from what you keep holding or allowing",
              ],
              random,
            )
          : subjectId === "purpose_calling"
            ? choose(
              [
                "your stance toward the path matters because the next phase depends on what is truly chosen rather than merely inherited",
                "the reading keeps returning to what still feels like your path once ambition, fear, and habit are stripped back",
                "your own position in calling matters because alignment changes when you stop living by momentum alone",
              ],
              random,
            )
        : subjectId === "general_reading"
          ? choose(
              [
                "your own position matters because the wider situation is reacting to what you keep allowing, clarifying, or postponing",
                "the reading keeps returning to what your stance is reinforcing in the wider picture, even before everything is explicit",
                "your role in the wider situation matters more than first appearances suggest, because the field is responding to how you are positioned inside it",
              ],
              random,
            )
        : subjectId === "personal_growth"
          ? choose(
              [
                "your own stance matters because the inner process is taking its cue from what you keep allowing, protecting, or postponing",
                "the reading keeps returning to how your boundaries and self-definition are shaping the pace of change",
                "your role in your own growth matters because what you reinforce now becomes the next pattern",
              ],
              random,
            )
        : subjectId === "creative"
          ? choose(
              [
                "your creative process matters because the work is taking its cue from what you are willing to shape, protect, revise, or release",
                "the reading keeps returning to how your own creative stance is setting the pace of the work",
                "your role in the creative process matters because what you reinforce now becomes the next shape the work can take",
              ],
              random,
            )
        : subjectId === "education"
          ? choose(
              [
                "your learning path matters because the next result depends on what you can actually prepare, clarify, or submit",
                "the reading keeps returning to what your study effort is reinforcing in the path itself, even before everything is fully settled",
                "your position in education matters because the next step depends on what you can realistically sustain, not just what you hope to complete",
              ],
              random,
            )
        : subjectId === "travel"
          ? choose(
              [
                "your travel situation matters because timing, documents, and what you keep confirming or postponing are shaping the route",
                "the reading keeps returning to what you can actually verify, resequence, or decide cleanly before movement begins",
                "your position in the journey matters because the next leg depends on what is actually confirmed, not just imagined",
              ],
              random,
            )
        : subjectId === "health"
          ? choose(
              [
                "your wellbeing matters because the body is taking its cue from what you keep pushing, ignoring, or allowing",
                "the reading keeps returning to what helps your system settle, repair, or stop overcompensating",
                "your position in health matters because pacing, rest, and what you keep asking of yourself are shaping the outcome",
              ],
              random,
            )
        : subjectId === "legal_admin"
          ? choose(
              [
                "your side of the matter matters because the process is responding to what you can actually evidence, clarify, or submit",
                "the reading keeps returning to what your side can prove, document, or carry through the process",
                "your position here matters because the next stage depends on what you can substantiate, not just what you suspect",
              ],
              random,
            )
        : subjectId === "work"
          ? choose(
              [
                "your role at work matters because your choices are shaping more of the outcome than the surrounding noise suggests",
                "the reading keeps returning to what you are owning, permitting, or postponing in the work itself",
                "your professional position matters because the field is taking its cues from what you keep carrying or allowing",
              ],
              random,
            )
        : subjectId === "pets"
          ? choose(
              [
                "your care choices matter because the animal is responding to what you reinforce, soften, or keep consistent",
                "the reading keeps returning to the tone, routine, and handling the animal is actually living inside",
                "your role in the care rhythm matters because the animal keeps taking cues from what you make steady, noisy, or hard to read",
              ],
              random,
            )
        : subjectId === "spiritual"
          ? choose(
              [
                "your spiritual stance matters because the path is taking cues from what you trust, question, or keep postponing",
                "the reading keeps returning to what your discernment is allowing, filtering, or prematurely closing down",
                "your role in the path matters because your boundaries and receptivity are shaping how guidance can actually land",
              ],
              random,
            )
        : subjectId === "friends_social"
          ? choose(
              [
                "your social position matters because the tone of the group is taking cues from what you permit, clarify, or step back from",
                "the reading keeps returning to the part your boundaries, availability, and visible participation are playing in the social field",
                "your role in the social dynamic matters because the group keeps responding to what you make easy, difficult, or unmistakable",
              ],
              random,
            )
        : subjectId === "community"
          ? choose(
              [
                "your place in the wider field matters because the group is taking cues from what you participate in, decline, or clarify",
                "the reading keeps returning to how your boundaries, availability, and style of participation are shaping the wider field",
                "your role in the wider group matters because the field keeps responding to what you make easier, harder, or unmistakable",
              ],
              random,
            )
        : choose(
            [
              "your own stance is setting the tone more than first appearances suggest",
              "your role in the bond matters — your boundaries and availability are shaping the pace",
              "the reading keeps returning to what your own position is inviting, allowing, or postponing",
            ],
            random,
          )
      : significatorCard.id === 28
        ? choose(
            [
              "the other person's position matters because part of this story sits outside your direct control",
              "the reading keeps returning to what the other person is willing to reveal, offer, or avoid",
              "their stance is shaping the field in ways you can feel even before everything is explicit",
            ],
            random,
          )
        : interpretiveThread(centerSignificatorText);
  const centerHouseSentence = buildHouseAssociationSentence(significatorHouse, subjectId, meaningDomain, random);
  const normalizedCenterHouseSentence =
    subjectId === "work"
      ? centerHouseSentence
          .replace(/^In Moon House, the emphasis falls on emotional cycles and reputation\s*, with recognition\./i, "In Moon House, the emphasis falls on reputation, feedback loops, and the changing visibility of your work.")
          .replace(/^Moon House makes emotional cycles and reputation\s*, with recognition setting the tone harder to ignore\./i, "Moon House keeps attention on reputation, feedback loops, and the changing visibility of your work.")
      : subjectId === "travel"
        ? centerHouseSentence
            .replace(/^In Moon House, the emphasis falls on emotional cycles and reputation\s*, with recognition\./i, "In Moon House, the emphasis falls on timing, visibility, and the changing feel of the journey as conditions shift.")
            .replace(/^Moon House makes emotional cycles and reputation\s*, with recognition setting the tone harder to ignore\./i, "Moon House keeps attention on timing, visibility, and the changing feel of the journey as conditions shift.")
      : subjectId === "health"
        ? centerHouseSentence
            .replace(/^In Moon House, the emphasis falls on emotional cycles and reputation\s*, with recognition\./i, "In Moon House, the emphasis falls on cycles, sensitivity, and the way timing changes what the body can carry.")
            .replace(/^Moon House makes emotional cycles and reputation\s*, with recognition setting the tone harder to ignore\./i, "Moon House keeps attention on cycles, sensitivity, and the way timing changes what the body can carry.")
            .replace(/^In Sun House, the emphasis falls on vitality, confidence, and clear progress shine, with success setting the tone\./i, "In Sun House, the emphasis falls on returning vitality, clearer signal, and the point where improvement is visible enough to trust.")
            .replace(/^Sun House makes vitality, confidence, and clear progress shine, with success setting the tone harder to ignore\./i, "Sun House keeps attention on returning vitality, clearer signal, and the point where improvement is visible enough to trust.")
      : subjectId === "legal_admin"
        ? centerHouseSentence
            .replace(/^In Sun House, the emphasis falls on vitality, confidence, and clear progress shine, with success setting the tone\./i, "In Sun House, the emphasis falls on clear visibility, formal progress, and the parts of the matter that can now be tested openly.")
            .replace(/^Sun House makes vitality, confidence, and clear progress shine, with success setting the tone harder to ignore\./i, "Sun House keeps attention on clear visibility, formal progress, and the parts of the matter that are finally visible enough to test openly.")
            .replace(/^In Moon House, the emphasis falls on emotional cycles and reputation\s*, with recognition\./i, "In Moon House, the emphasis falls on visibility, review cycles, and how the matter is being read as updates accumulate.")
            .replace(/^Moon House makes emotional cycles and reputation\s*, with recognition setting the tone harder to ignore\./i, "Moon House keeps attention on visibility, review cycles, and how the matter is being read as the process unfolds.")
      : centerHouseSentence;

  const intro = sentence(
    normalizedQuestion
      ? choose(
          [
            `The atmosphere around your question leans toward ${atmospherePhrase}, and the cards keep returning to concrete choices`,
            `A question of ${themePhrase} runs through this ${subjectReadingLabel(subjectLabel).toLowerCase()} reading, with ${atmospherePhrase} showing up first`,
            `The tableau opens in a mood of ${atmospherePhrase}, where timing and selection seem to matter more than force`,
            `${subjectLabel} comes through here with ${atmospherePhrase} nearest the surface, while the cards keep pointing back to practical choices`,
            `The first thing the tableau shows is ${atmospherePhrase}, and that is the first clue to ${introShiftFocus(subjectId)}`,
          ],
          random,
        )
      : choose(
          [
            `The tableau leans toward ${atmospherePhrase}, and the cards keep returning to concrete choices`,
            `A question of ${themePhrase} runs through this ${subjectReadingLabel(subjectLabel).toLowerCase()} reading, with ${atmospherePhrase} showing up first`,
            `The field opens in a mood of ${atmospherePhrase}, where timing and selection seem to matter more than force`,
            `${subjectLabel} comes through here with ${atmospherePhrase} nearest the surface, while the cards keep pointing back to practical choices`,
            `The first thing the tableau shows is ${atmospherePhrase}, and that is the first clue to ${introShiftFocus(subjectId)}`,
          ],
          random,
        ),
  );

  // Capture boilerplate sentences for the GT trim queue.
  // None of these call random(), so hoisting them is safe — no seeding change.
  const gtWiderRowBoilerplate = sentence(
    `Across the center row, ${formatCardList(analysis.rowLine.map((p) => p.cardId), 6)} show that pacing matters more than force`,
  );
  const gtWiderColBoilerplate = sentence(
    `The vertical line through ${formatCardList(analysis.columnLine.map((p) => p.cardId), 4)} adds a quieter timing signal, where outcomes settle after the visible turning point`,
  );
  const gtImmediateRowBoilerplate = rowNeighbors.length
    ? sentence(
        `Across the same row, ${formatCardList(rowNeighbors.map((p) => p.cardId), 5)} show how immediate choices ripple into social or practical consequences`,
      )
    : "";
  const gtImmediateColBoilerplate = columnNeighbors.length
    ? sentence(
        `On the vertical axis, ${formatCardList(columnNeighbors.map((p) => p.cardId), 3)} describe what is already maturing beneath the surface`,
      )
    : "";

  const sections: NarrativeSection[] = [
    {
      id: "opening-frame",
      title: "Opening Frame",
      technique: "synthesis",
      body: [
        normalizedQuestion
          ? sentence(
              choose(
                [
                  `Your question "${normalizedQuestion}" enters a field ${themeLensPhrase}`,
                  `"${normalizedQuestion}" lands in a field ${themeLensPhrase}`,
                  `Your question "${normalizedQuestion}" is read through a field ${themeLensPhrase}`,
                ],
                random,
              ),
            )
          : "",
        tableauSynthesis.practicalSentence,
        tableauSynthesis.thesisSentence,
      ]
        .filter(Boolean)
        .join(" "),
    },
    {
      id: "center-significator",
      title: "Center / Significator Focus",
      technique: "significator",
      body: `${sentence(
        `${centerLead}, ${cardRef(significatorPlacement.cardId)} sits at row ${analysis.significator.row + 1}, column ${
          analysis.significator.col + 1
        }, in ${significatorHouseName}`,
      )} ${
        centerCardThread
          ? sentence(
              choose(
                [
                  `What matters most here is ${centerCardThread}`,
                  `The center keeps pulling attention toward ${centerCardThread}`,
                  `This keeps the reading close to ${centerCardThread}`,
                  `At the core of the spread is ${centerCardThread}`,
                  `The heart of the reading stays with ${centerCardThread}`,
                ],
                random,
              ),
            )
          : ""
      } ${
        centerSignificatorThread
          ? sentence(
              choose(
                [
                  `It also suggests that ${centerSignificatorThread}`,
                  `This shows that ${centerSignificatorThread}`,
                  `That is why ${centerSignificatorThread}`,
                  `The wider pattern suggests that ${centerSignificatorThread}`,
                  `Taken together, this suggests that ${centerSignificatorThread}`,
                ],
                random,
              ),
            )
          : ""
      } ${normalizedCenterHouseSentence}`,
    },
    {
      id: "immediate-surroundings",
      title: "Immediate Surroundings",
      technique: "proximity",
      body: `${sentence(
        cardinal.length
          ? `${nearLead}, ${renderDirectionList(cardinal)} set the immediate tone`
          : `${nearLead}, the field is sparse, so weight falls on only a few immediate influences`,
      )} ${
        diagonalNeighbors.length
          ? sentence(`The diagonal neighbors — ${formatCardList(diagonalNeighbors, 4)} — add nuance to what looks simple at first glance`)
          : ""
      } ${proximityText ? buildProximityInterpretationSentence(proximityText) : ""} ${
        cardinalPair
          ? buildPairPointSentence(
              `${cardRef(cardinalPair.cardA)} with ${cardRef(cardinalPair.cardB)}`,
              cardinalPairText ?? cardinalPair.prose,
              random,
            )
          : ""
      } ${gtImmediateRowBoilerplate} ${rowNeighbors.length ? buildLineMovementSentence(analysis.rowLine.map((placement) => placement.cardId), subjectId, meaningDomain, random, "row", phraseContext) : ""} ${gtImmediateColBoilerplate} ${columnNeighbors.length ? buildLineMovementSentence(analysis.columnLine.map((placement) => placement.cardId), subjectId, meaningDomain, random, "column", phraseContext) : ""}`,
    },
  ];

  if (state.setup.includeHouses) {
    const relevance = new Map<number, number>();
    const bump = (cardId: number, score: number) => {
      relevance.set(cardId, (relevance.get(cardId) ?? 0) + score);
    };

    analysis.primaryCluster.placements.forEach((placement) => {
      const distance = chebyshevDistanceFromSignificator(placement, analysis.significator);
      bump(placement.cardId, distance === 0 ? 4 : distance === 1 ? 2.5 : 1);
    });
    cardinal.forEach((entry) => bump(entry.cardId, 3.5));
    diagonalNeighbors.forEach((cardId) => bump(cardId, 2));
    rowNeighbors.slice(0, 2).forEach((placement) => bump(placement.cardId, 1.5));
    columnNeighbors.slice(0, 2).forEach((placement) => bump(placement.cardId, 1.5));

    const houseTargets = analysis.primaryCluster.placements
      .filter((placement) => placement.position !== significatorPlacement.position)
      .sort((left, right) => {
        const byRelevance = (relevance.get(right.cardId) ?? 0) - (relevance.get(left.cardId) ?? 0);
        if (byRelevance !== 0) return byRelevance;
        const leftDistance = chebyshevDistanceFromSignificator(left, analysis.significator);
        const rightDistance = chebyshevDistanceFromSignificator(right, analysis.significator);
        if (leftDistance !== rightDistance) return leftDistance - rightDistance;
        return left.position - right.position;
      })
      .slice(0, 5);

    const houseNotes = [
      `${sentence(
        choose(
          [
            `${displayHouseName(significatorHouse.name)} sets the center tone of the spread`,
            `The house beneath the significator matters because it keeps the reading returning to ${displayHouseName(significatorHouse.name)}`,
            `${displayHouseName(significatorHouse.name)} is one of the clearest interpretive anchors in the tableau`,
          ],
          random,
        ),
      )} ${sentence(
        choose(
          [
            `That framing sets the context for the overlay entries that follow`,
            `That context carries into how each card interprets its house`,
            `That same framing runs through the houses that follow`,
          ],
          random,
        ),
      )} ${
        centerCardThread
          ? sentence(
              choose(
                [
                  `In practice, this keeps the reading close to that same central thread`,
                  `Practically, the focus stays with what was named at the center`,
                  `In practice, that thread keeps this section oriented toward the same core concern`,
                ],
                random,
              ),
            )
          : ""
      }`,
      ...houseTargets.slice(0, 4).map((placement) => {
        const house = getHouseMeaning(placement.houseId);
        const card = getCardMeaning(placement.cardId);
        const houseName = displayHouseName(house.name);
        const houseOverlay = lowerFirst(buildHouseAssociationPhrase(house, subjectId, meaningDomain, random, phraseContext));
        const cardThread = interpretiveThread(buildCardAssociationPhrase(card, subjectId, meaningDomain, random, phraseContext));
        if (placement === houseTargets[0]) {
          strongestHouseBullet = `${houseName} with ${cardRef(placement.cardId)} highlights ${houseOverlay}`;
        }
        return `${sentence(
          choose(
            [
              `${cardRef(placement.cardId)} in ${houseName} keeps ${houseOverlay} close to the center story`,
              `${houseName} becomes important here because ${cardRef(placement.cardId)} keeps pulling it into view`,
              `${cardRef(placement.cardId)} makes ${houseName} one of the clearer side themes around the center`,
            ],
            random,
          ),
        )} ${
          cardThread
            ? sentence(
                choose(
                  [
                    `It also points to ${cardThread}`,
                    `${card.name} here keeps returning to ${cardThread}`,
                    `That matters because it brings ${cardThread} into the main story`,
                    `This pulls ${cardThread} into the center of the story`,
                    `That keeps ${cardThread} close to what is actually unfolding`,
                  ],
                  random,
                ),
              )
            : ""
        }`;
      }),
    ];

    sections.push({
      id: "houses-overlay",
      title: "Houses",
      technique: "house",
      body: houseNotes.slice(0, 6).join(" "),
    });
  }

  sections.push(
    {
      id: "local-cluster",
      title: "Local Cluster",
      technique: "pair",
      body: `${sentence(
        `${clusterLead}: ${formatCardList(renderedClusterCardIds, 7)}`,
      )} ${
        clusterPair && clusterPairKey !== cardinalPairKey
          ? buildPairPointSentence(
              choose(
                [
                  `Within that cluster, ${cardRef(clusterPair.cardA)} with ${cardRef(clusterPair.cardB)}`,
                  `At the center of that cluster, ${cardRef(clusterPair.cardA)} with ${cardRef(clusterPair.cardB)}`,
                  `Inside that nearest cluster, ${cardRef(clusterPair.cardA)} with ${cardRef(clusterPair.cardB)}`,
                ],
                random,
              ),
              clusterPairText ?? clusterPair.prose,
              random,
            )
          : ""
      } ${
        proximityText
          ? sentence(
              choose(
                [
                  `What is closest matters first, while the next ring shows what is beginning to gather`,
                  `The nearest cards speak first, while the next ring shows what is already starting to build`,
                  `What is closest lands first, while the next ring shows what is gathering just behind it`,
                ],
                random,
              ),
            )
          : ""
      } ${dominantWords[2] ? buildClusterLinkSentence(subjectId, random) : ""} ${
        analysis.primaryCluster.placements[0]
          ? sentence(
              choose(
                [
                  `The cluster keeps returning to ${lowerFirst(
                    buildCardAssociationPhrase(
                      getCardMeaning(analysis.primaryCluster.placements[0].cardId),
                      subjectId,
                      meaningDomain,
                      random,
                      phraseContext,
                    ),
                  )}`,
                  `It keeps circling back to ${lowerFirst(
                    buildCardAssociationPhrase(
                      getCardMeaning(analysis.primaryCluster.placements[0].cardId),
                      subjectId,
                      meaningDomain,
                      random,
                      phraseContext,
                    ),
                  )}`,
                  `That nearest group keeps pulling attention back to ${lowerFirst(
                    buildCardAssociationPhrase(
                      getCardMeaning(analysis.primaryCluster.placements[0].cardId),
                      subjectId,
                      meaningDomain,
                      random,
                      phraseContext,
                    ),
                  )}`,
                ],
                random,
              ),
            )
          : ""
      }`,
    },
    {
      id: "wider-thread",
      title: "Wider Thread",
      technique: "diagonal",
      body: `${sentence(
        `${widerLead} ${formatCardList(diagonalLine, 7)}, where early signals echo into later positions`,
      )} ${buildDiagonalMovementSentence(diagonalLine, subjectId, meaningDomain, random, phraseContext)} ${gtWiderRowBoilerplate} ${gtWiderColBoilerplate} ${
        analysis.mirrors.rowPairs[0]
          ? sentence(
              `${cardRef(analysis.mirrors.rowPairs[0][0].cardId)} mirrored with ${cardRef(
                analysis.mirrors.rowPairs[0][1].cardId,
              )} shows a tension between what is felt now and what stabilizes later`,
            )
          : ""
      } ${diagonalTemplateText ? interpretiveSentence(polishTemplatedPhrase(diagonalTemplateText, random)) : ""}`,
    },
    {
      id: "secondary-zone",
      title: "Secondary Zone",
      technique: "knight",
      body: `${sentence(
        `${backgroundLead}, ${secondaryZone.label} carries ${formatCardList(
          secondaryZoneDisplayCards.length ? secondaryZoneDisplayCards : secondaryZone.cards,
          6,
        )}, and it points to the next layer already gathering behind the scenes`,
      )} ${sentence(
        choose(
          [
            `What gathers there is less immediate, but it quietly sets the conditions under which your next choices will land`,
            `That zone is not the loudest part yet, but it is already setting the terms your next choices will meet`,
            `It is not foreground pressure yet, but it is already shaping the conditions your next steps will enter`,
          ],
          random,
        ),
      )} ${
        secondaryZoneCenterCardId && secondaryZoneCenterThread
          ? sentence(
              choose(
                [
                  `That zone centers on ${cardRef(secondaryZoneCenterCardId)} and keeps gathering around ${secondaryZoneCenterThread}`,
                  `At the center of that zone, ${cardRef(secondaryZoneCenterCardId)} keeps pulling attention back to ${secondaryZoneCenterThread}`,
                  `The center of that zone is ${cardRef(secondaryZoneCenterCardId)}, and it keeps drawing the future pressure toward ${secondaryZoneCenterThread}`,
                ],
                random,
              ),
            )
          : ""
      } ${
        secondaryPair
          ? sentence(
              choose(
                [
                  `Within that zone, ${cardRef(secondaryPair.cardA)} with ${cardRef(secondaryPair.cardB)} ${toPairNarrativePhrase(
                    secondaryPair.prose,
                    random,
                  )}`,
                  `In that cluster, ${cardRef(secondaryPair.cardA)} with ${cardRef(secondaryPair.cardB)} ${toPairNarrativePhrase(
                    secondaryPair.prose,
                    random,
                  )}`,
                  `There, ${cardRef(secondaryPair.cardA)} with ${cardRef(secondaryPair.cardB)} ${toPairNarrativePhrase(
                    secondaryPair.prose,
                    random,
                  )}`,
                ],
                random,
              ),
            )
          : ""
      } ${
        secondaryZone.cards[0]
          ? sentence(
              choose(
                [
                  `${cardRef(secondaryZone.cards[0])} carries an underlying note of ${lowerFirst(
                    clause(buildCardAssociationPhrase(secondaryZone.cards[0], subjectId, meaningDomain, random, phraseContext)),
                  )}`,
                  `${cardRef(secondaryZone.cards[0])} keeps a quieter note of ${lowerFirst(
                    clause(buildCardAssociationPhrase(secondaryZone.cards[0], subjectId, meaningDomain, random, phraseContext)),
                  )}`,
                  `${cardRef(secondaryZone.cards[0])} leaves a quieter trace of ${lowerFirst(
                    clause(buildCardAssociationPhrase(secondaryZone.cards[0], subjectId, meaningDomain, random, phraseContext)),
                  )}`,
                ],
                random,
              ),
            )
          : ""
      }`,
    },
  );

  if (gtLayout === "4x8+4" && analysis.cartoucheCards.length === 4) {
    const cartoucheCardIds = analysis.cartoucheCards.map((placement) => placement.cardId);
    const cartouchePair = bestPairFromPositions(cartoucheCardIds, subjectId);
    const cartouchePairText = cartouchePair ? sentence(cartouchePair.prose) : null;

    const cartoucheNarrativeA = sentence(
      choose(
        [
          `At the edge of the tableau, the cartouche line carries ${formatCardList(cartoucheCardIds, 4)}, reading like the final movement after the main field resolves`,
          `The cartouche closes with ${formatCardList(cartoucheCardIds, 4)}, and this line feels like what remains once immediate pressure softens`,
          `As a fate line, ${formatCardList(cartoucheCardIds, 4)} describe how the story settles after the center has done its work`,
        ],
        random,
      ),
    );
    const cartoucheNarrativeB = cartouchePair
      ? sentence(
          `${cardRef(cartouchePair.cardA)} with ${cardRef(cartouchePair.cardB)} points to ${polishTemplatedPhrase(
            toPairMeaningClause(
              cartouchePairText ?? cartouchePair.prose,
            ),
            random,
          )}`,
        )
      : sentence(
          `${cardRef(cartoucheCardIds[0])} to ${cardRef(cartoucheCardIds[cartoucheCardIds.length - 1])} suggests a closing shift from pressure toward steadier footing`,
        );
    const cartoucheNarrativeC = sentence(
      choose(
        [
          `Coming back to ${cardRef(significatorPlacement.cardId)} at the heart of the spread, this closing line describes consequences that arrive through consistency more than force`,
          `With ${cardRef(significatorPlacement.cardId)} still holding the center, this final line shows what crystallizes after repeated choices`,
          `Read alongside ${cardRef(significatorPlacement.cardId)}, the cartouche points to what is likely to endure once timing has played out`,
          `${cardRef(significatorPlacement.cardId)} anchors the reading, and this closing line shows what becomes available once its lesson is followed through`,
        ],
        random,
      ),
    );

    const cartoucheBullets = buildKeyThreadBullets([
      `Opening card ${cardRef(cartoucheCardIds[0])} sets the final-line tone`,
      cartouchePair
        ? `${cardRef(cartouchePair.cardA)} with ${cardRef(cartouchePair.cardB)} carries the strongest wrap-up signal`
        : `${cardRef(cartoucheCardIds[1])} acts as the line's turning point`,
      `${cardRef(cartoucheCardIds[cartoucheCardIds.length - 1])} shows what likely lingers after the center process`,
    ]);

    sections.push({
      id: "cartouche-fate-line",
      title: "Cartouche / Fate Line",
      technique: "timeline",
      body: `${cartoucheNarrativeA} ${cartoucheNarrativeB}\n\n${cartoucheNarrativeC}\n${cartoucheBullets}`,
    });
  }

  const sortedQuadrants = [...analysis.quadrants].sort((left, right) => right.score - left.score);
  const topQuadrant = sortedQuadrants[0];
  const quadrantLabel =
    topQuadrant.id === "top_left"
      ? "the upper-left zone"
      : topQuadrant.id === "top_right"
        ? "the upper-right zone"
        : topQuadrant.id === "bottom_left"
          ? "the lower-left zone"
          : "the lower-right zone";

  const keyThreadLines = [
    `${cardRef(significatorPlacement.cardId)} in ${significatorHouseName} marks your leverage point`,
    tableauSynthesis.openingBullet
      ? `${tableauSynthesis.openingBullet[0].toUpperCase()}${tableauSynthesis.openingBullet.slice(1)}`
      : cardinalPair
        ? choose(
            [
              `Alignment between both sides stays central (${cardRef(cardinalPair.cardA)} + ${cardRef(cardinalPair.cardB)})`,
              `Shared expectations stay central (${cardRef(cardinalPair.cardA)} + ${cardRef(cardinalPair.cardB)})`,
              `Mutual clarity remains central (${cardRef(cardinalPair.cardA)} + ${cardRef(cardinalPair.cardB)})`,
            ],
            random,
          )
        : "The closest cards set the emotional tone first",
    tableauSynthesis.pressureBullet
      ? `${tableauSynthesis.pressureBullet[0].toUpperCase()}${tableauSynthesis.pressureBullet.slice(1)}`
      : `${secondaryZone.label} carries the background pressure`,
    buildArcBullet(diagonalLine, subjectId, meaningDomain, random, phraseContext),
    gtLayout === "4x8+4" && analysis.cartoucheCards.length === 4
      ? `Cartouche line ${formatCardList(analysis.cartoucheCards.map((placement) => placement.cardId), 4)} frames the end-state`
      : state.setup.includeHouses && strongestHouseBullet
        ? strongestHouseBullet
        : `The wider field gathers most strongly in ${quadrantLabel}`,
    `Most momentum sits in ${quadrantLabel}`,
  ];

  const gtThemeBridge = buildThemeSectionBridge(resolvedThemeId, random);
  sections.push({
    id: "key-threads",
    title: "Key Threads",
    technique: "synthesis",
    body: [buildKeyThreadBullets(keyThreadLines), gtThemeBridge].filter(Boolean).join("\n"),
  });

  const conclusionActionCard =
    significatorCard.id === 28 || significatorCard.id === 29 ? getCardMeaning(significatorHouse.id) : significatorCard;
  const conclusionBridge = choose(
    [
      "The spread points to one place worth reflecting on first.",
      "There is a practical thread worth following through.",
      "The cards suggest one place where a direct response would land first.",
      "That picture leaves one thread that concentrates the reading more than the others.",
    ],
    random,
  );
  const conclusion = `${tableauSynthesis.conclusionSentence} ${conclusionBridge} ${buildActionDirectiveSentence({
    actionCard: conclusionActionCard,
    house: significatorHouse,
    subjectId,
    domain: meaningDomain,
    random,
  })}`.trim();

  const supplemental: string[] = [
    analysis.mirrors.rowPairs[0]
      ? `${cardRef(analysis.mirrors.rowPairs[0][0].cardId)} and ${cardRef(analysis.mirrors.rowPairs[0][1].cardId)} repeat a mirror theme: what you choose now is likely to be reflected back later`
      : "",
    analysis.mirrors.columnPairs[0]
      ? `${cardRef(analysis.mirrors.columnPairs[0][0].cardId)} above and ${cardRef(
          analysis.mirrors.columnPairs[0][1].cardId,
        )} below suggest that pressure can settle once priorities are reordered`
      : "",
    `${quadrantLabel} keeps drawing attention through ${formatCardList(topQuadrant.placements.map((placement) => placement.cardId), 5)}`,
    state.setup.includeHouses
      ? ""
      : `${significatorHouseName} contrasts with ${displayHouseName(getHouseMeaning(
          analysis.primaryCluster.placements[0]?.houseId ?? significatorHouse.id,
        ).name)}, and present pressure asks for a different response than future stability`,
    clusterPair
      && clusterPairKey !== cardinalPairKey
      ? `${cardRef(clusterPair.cardA)} with ${cardRef(clusterPair.cardB)} echoes the same thread: ${polishTemplatedPhrase(
          toPairMeaningClause(
          clusterPairText ?? clusterPair.prose,
          ),
          random,
        )}`
      : "",
    rowNeighbors[0]
      ? `${cardRef(rowNeighbors[0].cardId)} close on the row keeps pressing this point: ${normalizeCardThread(
          buildCardAssociationPhrase(rowNeighbors[0].cardId, subjectId, meaningDomain, random, phraseContext),
        )}`
      : "",
    rowNeighbors[1]
      ? `${cardRef(rowNeighbors[1].cardId)} reinforces that sequence and timing are carrying as much weight as intention`
      : "",
    columnNeighbors[0]
      ? `${cardRef(columnNeighbors[0].cardId)} on the vertical line points to an influence that matures slowly but steadily`
      : "",
    columnNeighbors[1]
      ? `${cardRef(columnNeighbors[1].cardId)} indicates that what is below the surface can become decisive once acknowledged directly`
      : "",
    secondaryPair
      && secondaryPairKey !== cardinalPairKey
      ? `${cardRef(secondaryPair.cardA)} with ${cardRef(secondaryPair.cardB)} in the outer field suggests a secondary opportunity if the first adjustment is handled cleanly`
      : "",
    topQuadrant.placements[0]
      ? `${cardRef(topQuadrant.placements[0].cardId)} helps define the mood in ${quadrantLabel}, where pressure and possibility seem to rise together`
      : "",
    analysis.dominantDiagonal.placements[0]
      ? `${cardRef(analysis.dominantDiagonal.placements[0].cardId)} at the start of the dominant diagonal frames how the rest of that line should be read`
      : "",
    gtLayout === "4x8+4" && analysis.cartoucheCards.length
      ? `Cartouche cards ${formatCardList(
          analysis.cartoucheCards.map((placement) => placement.cardId),
          4,
        )} describe what remains after central pressure settles`
      : "",
  ].filter(Boolean);

  // The secondary-zone boilerplate is one of three choose() variants — add all three.
  // removeSentenceFromBody silently no-ops on the two that don't appear in the body.
  const gtTrimQueue: TrimQueueEntry[] = [
    // wider-thread: most generic sentences first
    { sectionId: "wider-thread", sentence: gtWiderColBoilerplate },
    { sectionId: "wider-thread", sentence: gtWiderRowBoilerplate },
    // secondary-zone: any of the three boilerplate variants
    { sectionId: "secondary-zone", sentence: sentence("What gathers there is less immediate, but it quietly sets the conditions under which your next choices will land") },
    { sectionId: "secondary-zone", sentence: sentence("That zone is not the loudest part yet, but it is already setting the terms your next choices will meet") },
    { sectionId: "secondary-zone", sentence: sentence("It is not foreground pressure yet, but it is already shaping the conditions your next steps will enter") },
    // immediate-surroundings: conditional — empty strings are filtered by the enforcer no-op check
    ...(gtImmediateColBoilerplate ? [{ sectionId: "immediate-surroundings", sentence: gtImmediateColBoilerplate }] : []),
    ...(gtImmediateRowBoilerplate ? [{ sectionId: "immediate-surroundings", sentence: gtImmediateRowBoilerplate }] : []),
  ];

  const normalized = enforceDeepDiveTargets(intro, sections, conclusion, "grand-tableau", supplemental, gtTrimQueue);

  return {
    intro: normalized.intro,
    sections: normalized.sections,
    conclusion: normalized.conclusion,
    disclaimer: "",
    wordCount: normalized.wordCount,
  };
}

function composeDeepDiveThreeCard(input: ComposeDeepDiveInput): DeepDiveDraft {
  const { state, subjectId, subjectLabel, domain, resolvedThemeId, resolvedThemeLabel, random } = input;
  const mode = state.setup.threeCardMode as ThreeCardMode;
  const placements = buildThreeCardLayout(state.layout, mode);
  const labels = getThreeCardLabels(mode);
  const cards = placements.map((placement) => getCardMeaning(placement.cardId));
  const themeIds: ThemeId[] = resolvedThemeId ? [resolvedThemeId] : [];
  const usedPhrases: string[] = [];
  const normalizedQuestion = normalizeQuestionText(state.setup.question);

  const firstText =
    pickInterpretationText({
      subjectId,
      technique: "card",
      techniqueKey: `card:${cards[0].id}`,
      appliesTo: { cardId: cards[0].id },
      themeIds,
      usedPhrases,
    }) ?? sentence(cards[0].domainVariants[domain]);
  const secondText =
    pickInterpretationText({
      subjectId,
      technique: "card",
      techniqueKey: `card:${cards[1].id}`,
      appliesTo: { cardId: cards[1].id },
      themeIds,
      usedPhrases,
    }) ?? sentence(cards[1].coreMeaning);
  const thirdText =
    pickInterpretationText({
      subjectId,
      technique: "card",
      techniqueKey: `card:${cards[2].id}`,
      appliesTo: { cardId: cards[2].id },
      themeIds,
      usedPhrases,
    }) ?? sentence(cards[2].domainVariants[domain]);
  const resolveThread = (raw: string, alt1: string, alt2: string): string => {
    // Phrases shorter than 5 words, or containing " or " (raw theme label joins like "ending or separation"),
    // are label extractions — fall back to richer card-native text.
    const isUsable = (s: string) => {
      if (s.split(/\s+/).filter(Boolean).length < 5) return false;
      if (/ or /i.test(s)) return false;
      // Pure "word word and word word" theme-label pairs have no verb — not usable as prose
      if (/^[^\s]+ [^\s]+ and [^\s]+ [^\s]+$/i.test(s)) return false;
      return true;
    };
    if (isUsable(raw)) return raw;
    const n1 = normalizeMeaningForSentenceFrame(alt1);
    if (isUsable(n1)) return n1;
    const n2 = normalizeMeaningForSentenceFrame(alt2);
    if (isUsable(n2)) return n2;
    return raw;
  };
  const firstThread = resolveThread(
    normalizeMeaningForSentenceFrame(firstText),
    sentence(cards[0].domainVariants[domain]),
    sentence(cards[0].coreMeaning),
  );
  const secondThread = resolveThread(
    normalizeMeaningForSentenceFrame(secondText),
    sentence(cards[1].coreMeaning),
    sentence(cards[1].domainVariants[domain]),
  );
  const thirdThread = resolveThread(
    normalizeMeaningForSentenceFrame(thirdText),
    sentence(cards[2].domainVariants[domain]),
    sentence(cards[2].coreMeaning),
  );

  const strongestPair = bestPairFromPositions(cards.map((card) => card.id), subjectId);
  const pairText =
    strongestPair &&
    (pickInterpretationText({
      subjectId,
      technique: "pair",
      techniqueKey: `pair:${sortedPairKey(strongestPair.cardA, strongestPair.cardB)}`,
      appliesTo: { cardA: strongestPair.cardA, cardB: strongestPair.cardB },
      themeIds,
      usedPhrases,
    }) ??
      sentence(strongestPair.prose));

  const intro = sentence(
    choose(
      [
        `This deep-dive ${subjectLabel.toLowerCase()} reading opens with a ${resolvedThemeLabel ? resolvedThemeLabel.toLowerCase() : "context-led"} emphasis`,
        `The three cards answer in a quieter, reflective register shaped by ${subjectLabel.toLowerCase()}`,
        `The atmosphere here is focused and reflective, with the ${subjectLabel.toLowerCase()} lens sharpening each turn`,
      ],
      random,
    ),
  );

  // Capture sentences that will be used in section bodies AND the trim queue.
  // Boilerplate is trimmed first (highest priority), then association sentences (lower priority).
  const situationAssoc = buildCardAssociationSentence(cards[0], subjectId, domain, random);
  const pivotAssoc = buildCardAssociationSentence(cards[1], subjectId, domain, random);
  const directionAssoc = buildCardAssociationSentence(cards[2], subjectId, domain, random);
  const situationBoilerplate = sentence("This first card shows where things already stand before any adjustment is made");
  const pivotBoilerplate = sentence("This is the hinge point in the reading, where one precise response can redirect the whole arc");
  const directionBoilerplate = sentence("If the middle card is handled cleanly, this direction tends to feel steadier and more coherent");

  const sections: NarrativeSection[] = [
    {
      id: "opening-frame",
      title: "Opening Frame",
      technique: "synthesis",
      body: `${sentence(
        normalizedQuestion
          ? `Your question "${normalizedQuestion}" is best read as an unfolding sequence rather than a fixed verdict`
          : "These three cards read best as an unfolding sequence rather than a fixed verdict",
      )} ${sentence(
        `Timing and emotional tone matter here just as much as the obvious symbols`,
      )}`,
    },
    {
      id: "situation",
      title: "Situation",
      technique: "timeline",
      body: [
        `${sentence(`${labels[0]} begins with ${cardRef(cards[0].id)}${firstThread ? `: ${firstThread[0].toUpperCase()}${firstThread.slice(1)}` : `, establishing the opening conditions`}`)} ${situationAssoc} ${situationBoilerplate}`,
        buildThemeCardSentence(resolvedThemeId, cards[0].id, cards[0].name, "situation", random),
      ].filter(Boolean).join(" "),
    },
    {
      id: "pivot",
      title: "Pivot",
      technique: "timeline",
      body: [
        `${sentence(`${labels[1]} turns on ${cardRef(cards[1].id)}${secondThread ? `: ${secondThread[0].toUpperCase()}${secondThread.slice(1)}` : `, and this is where the reading can turn`}`)} ${pivotAssoc} ${pivotBoilerplate}`,
        buildThemeCardSentence(resolvedThemeId, cards[1].id, cards[1].name, "pivot", random),
      ].filter(Boolean).join(" "),
    },
    {
      id: "direction",
      title: "Direction",
      technique: "timeline",
      body: [
        `${sentence(`${labels[2]} closes with ${cardRef(cards[2].id)}${thirdThread ? `: ${thirdThread[0].toUpperCase()}${thirdThread.slice(1)}` : `, carrying the sequence into its likely direction`}`)} ${directionAssoc}`,
        buildThemeCardSentence(resolvedThemeId, cards[2].id, cards[2].name, "direction", random),
        `${directionBoilerplate} ${
        pairText
          ? `${sentence(
              `The strongest link in the spread is ${cardRef(strongestPair!.cardA)} with ${cardRef(strongestPair!.cardB)}: ${toPairMeaningClause(pairText)}`,
            )} ${buildPairAssociationSentence({
              cardA: strongestPair!.cardA,
              cardB: strongestPair!.cardB,
              subjectId,
              domain,
              random,
            })}`
          : ""
      }`,
      ].filter(Boolean).join(" "),
    },
    ...((() => {
      const bridge01 = buildCardPairBridge(cards[0].id, cards[1].id, cards[0].name, cards[1].name, random);
      const bridge12 = buildCardPairBridge(cards[1].id, cards[2].id, cards[1].name, cards[2].name, random);
      const body = [bridge01, bridge12].filter(Boolean).join(" ");
      if (!body) return [];
      return [{
        id: "between-the-cards",
        title: "Between the Cards",
        technique: "synthesis" as const,
        body,
      }];
    })()),
    {
      id: "key-threads",
      title: "Key Threads",
      technique: "synthesis",
      body: buildKeyThreadBullets([
        `${cardRef(cards[0].id)} sets the opening tone`,
        `${cardRef(cards[1].id)} marks the central turning point`,
        `${cardRef(cards[2].id)} marks where momentum is heading`,
        strongestPair
          ? `${cardRef(strongestPair.cardA)} with ${cardRef(strongestPair.cardB)} carries the strongest shared current`
          : "The strongest movement comes through the sequence rather than one dominant pair",
      ]),
    },
  ];

  const conclusion = `${sentence(
    choose(
      [
        `${cardRef(cards[1].id)} is the hinge that decides how the whole sequence lands`,
        `The spread keeps turning back to ${cardRef(cards[1].id)} as the place where the outcome can still change`,
        `${cardRef(cards[1].id)} is the point where this reading either opens or tightens`,
      ],
      random,
    ),
  )} ${(() => {
    const pivotAction = cards[1].action;
    const directionRef = cardRef(cards[2].id);
    return sentence(choose(
      [
        `When that means ${pivotAction}, ${directionRef} tends to start making sense in practice rather than theory`,
        `The question worth sitting with is what it would mean to ${pivotAction} — that is what gives ${directionRef} room to become real`,
        `If the invitation is to ${pivotAction}, then ${directionRef} stops being a possibility and becomes a direction`,
        `The reading keeps returning to ${pivotAction} as the thread — and ${directionRef} is what that can open toward`,
      ],
      random,
    ));
  })()}`.trim();

  const supplemental = [
    strongestPair
      ? `${cardRef(strongestPair.cardA)} with ${cardRef(strongestPair.cardB)} keeps returning as a practical thread: ${toPairMeaningClause(
          pairText ?? strongestPair.prose,
        )}`
      : "",
    `${cardRef(cards[0].id)} and ${cardRef(cards[2].id)} suggest that the ending can settle if the middle turn is handled deliberately`,
  ].filter(Boolean);

  const trimQueue: TrimQueueEntry[] = [
    // Boilerplate first — these are safe to cut and the reading still makes sense without them
    { sectionId: "direction", sentence: directionBoilerplate },
    { sectionId: "pivot", sentence: pivotBoilerplate },
    { sectionId: "situation", sentence: situationBoilerplate },
    // Association sentences next — useful but echoing the thread content
    { sectionId: "direction", sentence: directionAssoc },
    { sectionId: "pivot", sentence: pivotAssoc },
    { sectionId: "situation", sentence: situationAssoc },
  ];

  const normalized = enforceDeepDiveTargets(intro, sections, conclusion, "three-card", supplemental, trimQueue);

  return {
    intro: normalized.intro,
    sections: normalized.sections,
    conclusion: normalized.conclusion,
    disclaimer: "",
    wordCount: normalized.wordCount,
  };
}

export function composeDeepDiveReading(input: ComposeDeepDiveInput): DeepDiveDraft {
  if (input.state.setup.spreadType === "grand-tableau") {
    return composeDeepDiveGT(input);
  }
  return composeDeepDiveThreeCard(input);
}
