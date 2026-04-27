import { CARD_MEANINGS, getCardMeaning } from "@/lib/content/cards";
import { getHouseMeaning } from "@/lib/content/houses";
import { getSubjectDefinition } from "@/lib/content/subjects";
import { resolveThemeForReading } from "@/lib/content/themes";
import type { ThemeId } from "@/lib/content/themes";
import { buildThemeCardSentence, buildThemeSectionBridge, buildCardPairBridge } from "@/lib/engine/themeFraming";
import { getDomainForSubject, inferCounterpartRole, inferSubjectFromQuestion } from "@/lib/engine/context";
import {
  buildGrandTableauLayout,
  getCartouchePlacements,
  getDiagonalLine,
  getKnightPositions,
  getProximityBuckets,
  classifyDistance,
} from "@/lib/engine/gt";
import {
  buildActionDirectiveSentence,
  buildCardAssociationPhrase,
  buildCardAssociationSentence,
  buildOverlayAssociationSentence,
  buildPairAssociationSentence,
  buildPositionedCardAssociationSentence,
} from "@/lib/engine/narrativeAssociations";
import {
  buildGrandTableauPairCandidates,
  buildThreeCardPairCandidates,
  selectBestPair,
  selectTopPair,
} from "@/lib/engine/pairSelection";
import { createMulberry32, hashStringToInt } from "@/lib/engine/rng";
import { chooseAvoidingRecent, createPhraseUsageTracker, type PhraseTemplate } from "@/lib/engine/phraseVariation";
import { buildThreeCardLayout, getThreeCardLabels } from "@/lib/engine/threeCard";
import { composeDeepDiveReading } from "@/lib/engine/deepDiveComposer";
import type {
  Domain,
  GeneratedReading,
  HighlightItem,
  NarrativeSection,
  ReadingState,
  SignificatorMode,
  SubjectId,
  ThreeCardMode,
} from "@/lib/engine/types";
import { ritualSummaryLine } from "@/lib/engine/shuffle";
import { synthesizeGrandTableauNarrative } from "@/lib/engine/tableauSynthesis";

interface NarrativeSeedContext {
  state: ReadingState;
  domain: Domain;
  subjectId: SubjectId;
  resolvedThemeId: ThemeId | null;
}

interface QuickCompositionResult {
  sections: NarrativeSection[];
  conclusion: string;
  selectionTrace?: GeneratedReading["selectionTrace"];
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function countWords(input: string): number {
  return input
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function capitalizeSentenceStarts(input: string): string {
  return input.replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix: string, letter: string) => `${prefix}${letter.toUpperCase()}`);
}

function choose<T>(values: T[], random: () => number): T {
  if (!values.length) {
    throw new Error("Cannot choose from an empty array");
  }
  const index = Math.floor(random() * values.length);
  return values[index];
}

function template<TContext>(
  id: string,
  family: string,
  text: string | ((context: TContext) => string),
): PhraseTemplate<TContext> {
  return { id, family, text };
}

function cardLabel(cardId: number): string {
  const card = getCardMeaning(cardId);
  return `${card.id}. ${card.name}`;
}

function cardRef(cardId: number): string {
  const card = getCardMeaning(cardId);
  return `the ${card.name}`;
}

function clause(input: string): string {
  return input.trim().replace(/[.!?]+$/, "");
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

function humanizeTechnicalPhrases(input: string): string {
  return input
    .replace(/\bthe significant other perspective enters the reading\b/gi, "the other person's perspective")
    .replace(/\bsignificant other perspective enters the reading\b/gi, "the other person's perspective")
    .replace(/\bthe querent'?s agency and orientation\b/gi, "your position and how you are showing up")
    .replace(/\bquerent'?s agency and orientation\b/gi, "your position and how you are showing up")
    .replace(/\bthe counterpart'?s agency and orientation\b/gi, "the other person's position and how they are showing up")
    .replace(/\bcounterpart'?s agency and orientation\b/gi, "the other person's position and how they are showing up")
    .replace(/\bself orientation dynamics\b/gi, "how you are showing up")
    .replace(/\bcounterpart orientation dynamics\b/gi, "how the other person is showing up")
    .replace(/\bstakeholder alignment\b/gi, "aligned expectations")
    .replace(/\bsequence quality\b/gi, "how the situation holds together")
    .replace(/\bwider layer\b/gi, "wider picture")
    .replace(/\bsecondary structure\b/gi, "background thread")
    .replace(/\bjourney and trade\b/gi, "movement, distance, and practical exchange")
    .replace(/\bjourney and repetition\b/gi, "movement meeting a pattern that keeps repeating")
    .replace(/\buncertainty and knowledge\b/gi, "uncertainty sitting beside knowledge that is still incomplete")
    .replace(/\buncertainty and fog\b/gi, "uncertainty and what still cannot be read clearly")
    .replace(/\bknowledge and secrecy\b/gi, "private knowledge and what is still withheld")
    .replace(/\bdialogue and other\b/gi, "conversation with the other person directly in view")
    .replace(/\binstitution and distance\b/gi, "distance, standards, and formal structure")
    .replace(/\binstitution and home\b/gi, "formal structure meeting the need for home base or closeness")
    .replace(/\bhome and structure\b/gi, "the shared base and what needs to hold")
    .replace(/\bsolution and certainty\b/gi, "a workable answer and clearer signal")
    .replace(/\bmoney and flow\b/gi, "resources, exchange, and what is actually moving")
    .replace(/\bdialogue and nerves\b/gi, "anxious talk and quick reactions")
    .replace(/\bbeginning and small\b/gi, "a small beginning that still needs care")
    .replace(/\brecognition and emotion\b/gi, "visibility and emotional tone")
    .replace(/\bcommitment and contract\b/gi, "commitment and the terms that hold it");
}

function normalizeMeaningFragment(input: string): string {
  return humanizeTechnicalPhrases(clause(input)).replace(/\s+/g, " ").trim();
}

function normalizeMeaningThatClause(input: string): string {
  const normalized = normalizeMeaningFragment(input).replace(/^that\s+/i, "");
  if (
    /^(choose|set|keep|watch|name|protect|clarify|review|track|listen|speak|pause|move|reframe|allow|hold|act|offer|take|make|prioritize|commit|focus|ask|give|let|consider|notice|reduce)\b/i.test(
      normalized,
    )
  ) {
    return `you may need to ${lowerFirst(normalized)}`;
  }
  return lowerFirst(normalized);
}

function normalizeMeaningForSentenceFrame(input: string): string {
  const normalized = lowerFirst(normalizeMeaningFragment(input));
  if (
    /^(choose|set|keep|watch|name|protect|clarify|review|track|listen|speak|pause|move|reframe|allow|hold|act|offer|take|make|prioritize|commit|focus|ask|give|let|consider|prototype|notice|reduce)\b/i.test(
      normalized,
    )
  ) {
    return `the need to ${normalized}`;
  }
  return normalized;
}

function normalizeMeaningNounPhrase(input: string): string {
  const normalized = normalizeMeaningFragment(input);
  let phrase = normalized
    .replace(/^(there is|there are)\s+/i, "")
    .replace(/\b(?:is|are)\s+(?:central|key|core|foregrounded|highlighted|in focus|prominent)\s*$/i, "")
    .trim();

  if (/\b(?:emerge|emerges|emerged)\s*$/i.test(phrase)) {
    phrase = phrase.replace(/\b(?:emerge|emerges|emerged)\s*$/i, "").trim();
    if (phrase) {
      phrase = `emerging ${phrase}`;
    }
  }

  const clauseLike =
    /^(?:it|this|that|there)\b/i.test(phrase) ||
    /\b(?:requires|need|needs|asks|suggests|indicates|points|leans|becomes|become)\b/i.test(phrase);
  if (!phrase || phrase.split(/\s+/).length < 2 || clauseLike) {
    return `the theme that ${lowerFirst(normalized)}`;
  }

  return lowerFirst(phrase);
}

function dedupeCardRefs(cardIds: number[], limit: number): string {
  const unique: number[] = [];
  const seen = new Set<number>();
  for (const cardId of cardIds) {
    if (seen.has(cardId)) continue;
    seen.add(cardId);
    unique.push(cardId);
  }
  return unique.slice(0, limit).map((cardId) => cardRef(cardId)).join(", ");
}

function naturalJoin(words: string[]): string {
  const clean = words.map((word) => word.trim()).filter(Boolean);
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(", ")}, and ${clean[clean.length - 1]}`;
}

function pairMeaningToProse(input: string): string {
  const normalized = humanizeTechnicalPhrases(clause(input)).replace(/\s+/g, " ").trim();
  const withoutNames = normalized.replace(
    /^[A-Za-z][A-Za-z'-]*(?:\s+[A-Za-z][A-Za-z'-]*)?\s*\+\s*[A-Za-z][A-Za-z'-]*(?:\s+[A-Za-z][A-Za-z'-]*)?\s*/u,
    "",
  );
  const withoutThemeLead = withoutNames.replace(/^(general|love|work)\s+themes?\s*/iu, "");
  const withoutVerbLead = withoutThemeLead.replace(
    /^(emphasizes|suggests|asks|indicates|points|signals|highlights|warns|marks|brings|calls|describes|supports|places|favors|combines|links|confirms|shows|reveals)\s+/iu,
    "",
  );
  const cleaned = withoutVerbLead
    .replace(/^(to|for|that)\s+/iu, "")
    .replace(/^(suggests?|indicates?|points?|asks?)\s+/iu, "")
    .replace(/^(can|may|often|is|are)\s+/iu, "")
    .replace(/;/g, ",")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",")
    .trim();

  if (!cleaned || cleaned.split(/\s+/).length < 3) {
    return lowerFirst(normalized);
  }

  const startsLikeVerb = /^(sequence|turn|choose|set|keep|act|offer|name|read|move|clarify|stabilize|monitor|track)\b/i.test(cleaned);
  if (startsLikeVerb) {
    return `a practical dynamic where ${lowerFirst(cleaned)}`;
  }

  return lowerFirst(cleaned);
}

function humanizeQuickPairMeaning(input: string): string {
  const normalizeFacet = (value: string): string =>
    value
      .trim()
      .replace(/^cut$/i, "a decisive cut")
      .replace(/^ending$/i, "closure")
      .replace(/^gift$/i, "warmth")
      .replace(/^other$/i, "the other person's position");

  return pairMeaningToProse(input)
    .replace(/^a blend of ([^,]+) and ([^,]+), asking you to /i, (_, left: string, right: string) => {
      const cleanLeft = normalizeFacet(left);
      const cleanRight = normalizeFacet(right);
      return `${cleanLeft} meeting ${cleanRight}, which asks you to `;
    })
    .replace(/^a blend of ([^,]+) and ([^,]+)$/i, (_, left: string, right: string) => {
      const cleanLeft = normalizeFacet(left);
      const cleanRight = normalizeFacet(right);
      return `${cleanLeft} meeting ${cleanRight}`;
    });
}

function cleanProseArtifacts(input: string): string {
  return humanizeTechnicalPhrases(input)
    .replace(/\bis central is central\b/gi, "is central")
    .replace(/\bare central is central\b/gi, "are central")
    .replace(/\bpoints to into\b/gi, "points into")
    .replace(/\bcentral message here\s+—\s+/gi, "")
    .replace(/(?:^| )On the [^.]+ front\.(?= |$)/gi, " ")
    // Remove consecutive duplicate words (e.g. "where where", "that that")
    .replace(/\b(\w+) \1\b/gi, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizedQuestion(input: string): string {
  return input.trim().replace(/[.!?]+$/, "");
}

function indefiniteArticleFor(input: string): "a" | "an" {
  return /^[aeiou]/i.test(input.trim()) ? "an" : "a";
}

function formatHouseName(input: string): string {
  const words = input.trim().split(/\s+/);
  const deduped: string[] = [];
  words.forEach((word) => {
    const prev = deduped[deduped.length - 1];
    if (!prev || prev.toLowerCase() !== word.toLowerCase()) {
      deduped.push(word);
    }
  });
  return deduped.join(" ");
}

function buildQuickCenterBridgeSentence(
  cardId: number,
  domainClause: string,
  random: () => number,
  phraseTracker = createPhraseUsageTracker(),
): string {
  if (cardId === 1) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.rider.timing.arrival.01", "center.rider.timing", () => `The center is moving because ${domainClause}; the first signal matters before the whole story is settled`),
          template("center.rider.action_point.response.01", "center.rider.action_point", "The reading is asking for response to what has arrived, not endless waiting for a fuller context"),
          template("center.rider.communication.signal.01", "center.rider.communication", () => `The strongest signal comes through contact, news, or movement around the fact that ${domainClause}`),
          template("center.rider.opportunity.momentum.01", "center.rider.opportunity", "This is the kind of center card that turns a small arrival into the thing the rest of the spread has to answer"),
          template("center.rider.practical.current.01", "center.rider.practical", "What just came in is more current than the older assumptions around it"),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 2) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.clover.opportunity.window.01", "center.clover.opportunity", () => `The center is not promising a complete rescue; it is showing the small workable opening inside the fact that ${domainClause}`),
          template("center.clover.timing.brief.01", "center.clover.timing", "The useful thing here is brief, which makes timing more important than intensity"),
          template("center.clover.practical.modest.01", "center.clover.practical", "This card keeps the reading practical: use the bit of ease that is actually available"),
          template("center.clover.action_point.use_it.01", "center.clover.action_point", () => `The spread turns on whether the opening around ${domainClause} is used while it is still open`),
          template("center.clover.obstacle.minimize.01", "center.clover.obstacle", "The risk is dismissing a small advantage because it does not look large enough to matter"),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 3) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.ship.direction.route.01", "center.ship.direction", () => `The center asks for direction because ${domainClause}; movement helps only if it is headed somewhere`),
          template("center.ship.practical.distance.01", "center.ship.practical", "Distance, exchange, or movement is not background here — it is the field the rest of the cards are crossing"),
          template("center.ship.timing.journey.01", "center.ship.timing", "This is a moving center, so the reading needs to be judged across stages rather than in one fixed moment"),
          template("center.ship.opportunity.horizon.01", "center.ship.opportunity", () => `The opening widens when the route around ${domainClause} becomes concrete`),
          template("center.ship.obstacle.drift.01", "center.ship.obstacle", "The danger is not movement itself; it is movement without a named destination"),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 4) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.house.stability.foundation.01", "center.house.stability", () => `The center is the foundation: ${domainClause}, and everything else depends on whether that base can hold`),
          template("center.house.practical.structure.01", "center.house.practical", "This spread wants structure before drama; the base conditions are doing more work than the visible movement"),
          template("center.house.boundary.container.01", "center.house.boundary", "The main question is what can be safely contained, protected, or made liveable enough to build from"),
          template("center.house.obstacle.rigidity.01", "center.house.obstacle", () => `The pressure gathers where ${domainClause} has become too fixed to adapt easily`),
          template("center.house.action_point.repair.01", "center.house.action_point", "The practical move is to repair the base before asking the rest of the reading to carry more weight"),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 5) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.tree.stability.roots.01", "center.tree.stability", () => `The center has roots because ${domainClause}; the useful question is what has been developing over time`),
          template("center.tree.practical.health.01", "center.tree.practical", "This spread slows down around health, endurance, and the living structure underneath the visible issue"),
          template("center.tree.timing.long_growth.01", "center.tree.timing", "The result here is unlikely to come from one sharp move; it comes from what is consistently nourished"),
          template("center.tree.obstacle.strain.01", "center.tree.obstacle", () => `The pressure gathers where ${domainClause} has been carrying strain longer than the surface story admits`),
          template("center.tree.action_point.tend.01", "center.tree.action_point", "The practical move is to tend the roots: pace, care, and sustain what actually has life in it"),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 6) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.clouds.obstacle.visibility.01", "center.clouds.obstacle", () => `The center is unclear because ${domainClause}; better visibility matters more than immediate certainty`),
          template("center.clouds.practical.verify.01", "center.clouds.practical", "The reading turns on verification: what is known, what is mood, and what is still hidden by poor light"),
          template("center.clouds.timing.wait_for_clearer.01", "center.clouds.timing", "Timing matters because acting inside fog can make a manageable question feel much larger"),
          template("center.clouds.action_point.separate.01", "center.clouds.action_point", "The practical move is to separate fact from atmosphere before drawing conclusions"),
          template("center.clouds.signal.mixed.01", "center.clouds.signal", () => `Mixed signals around ${domainClause} are part of the message, not just an inconvenience`),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 7) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.snake.obstacle.complexity.01", "center.snake.obstacle", () => `The center is complicated because ${domainClause}; the straightest story may not be the truest one`),
          template("center.snake.practical.motives.01", "center.snake.practical", "This card asks for motive-reading, tact, and a refusal to be hurried by the surface version of events"),
          template("center.snake.action_point.strategy.01", "center.snake.action_point", "The useful move is strategic without becoming suspicious: name the desire, the detour, and the cost"),
          template("center.snake.boundary.entanglement.01", "center.snake.boundary", () => `The risk around ${domainClause} is entanglement, especially if indirectness goes unnamed`),
          template("center.snake.timing.winding_path.01", "center.snake.timing", "Progress may be winding here, so the quality of each turn matters more than rushing to the end"),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 8) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.coffin.obstacle.ending.01", "center.coffin.obstacle", () => `The center is an ending or pause because ${domainClause}; forcing continuation would distort the reading`),
          template("center.coffin.practical.release.01", "center.coffin.practical", "This spread asks what has stopped, what is depleted, and what should no longer be asked to perform"),
          template("center.coffin.timing.after_stop.01", "center.coffin.timing", "The next phase begins after the stop is respected, not while the old form is being kept alive"),
          template("center.coffin.action_point.complete.01", "center.coffin.action_point", "The practical move is completion: close the loop, rest the system, and make room for energy to return elsewhere"),
          template("center.coffin.cause_effect.depletion.01", "center.coffin.cause_effect", () => `The pressure around ${domainClause} may be showing what has already reached its limit`),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 9) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.bouquet.opportunity.invitation.01", "center.bouquet.opportunity", () => `The center opens through goodwill because ${domainClause}; the offer matters if it is received and answered cleanly`),
          template("center.bouquet.social.welcome.01", "center.bouquet.social", "This spread turns on welcome, appreciation, and the small social gesture that changes what becomes possible"),
          template("center.bouquet.practical.offer.01", "center.bouquet.practical", "The useful thing is not just pleasant; it is an invitation or gift that needs practical handling"),
          template("center.bouquet.obstacle.surface.01", "center.bouquet.obstacle", () => `The risk around ${domainClause} is mistaking charm for completion when the offer still needs follow-through`),
          template("center.bouquet.action_point.receive.01", "center.bouquet.action_point", "The practical move is to receive what is sincere, respond with grace, and turn the opening into something real"),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 10) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.scythe.action_point.cut.01", "center.scythe.action_point", () => `The center asks for a clean cut because ${domainClause}; delay may make the edge rougher`),
          template("center.scythe.practical.precision.01", "center.scythe.practical", "This spread wants precision: remove what must go without damaging what should remain"),
          template("center.scythe.timing.swift.01", "center.scythe.timing", "Timing is sharp here, so the practical question is what needs decisive action now"),
          template("center.scythe.obstacle.careless.01", "center.scythe.obstacle", () => `The pressure around ${domainClause} comes from the risk of cutting too late, too broadly, or without enough care`),
          template("center.scythe.cause_effect.harvest.01", "center.scythe.cause_effect", "The card can show harvest as well as severing, but either way something has reached the point of removal"),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 11) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.whip.obstacle.repetition.01", "center.whip.obstacle", () => `The center is repetition because ${domainClause}; the pattern matters more than any single argument`),
          template("center.whip.practical.loop.01", "center.whip.practical", "This spread asks what keeps replaying and what it costs each time the rhythm repeats"),
          template("center.whip.action_point.interrupt.01", "center.whip.action_point", "The useful move is to interrupt the loop before effort turns into punishment"),
          template("center.whip.timing.rhythm.01", "center.whip.timing", () => `The rhythm around ${domainClause} needs changing, not just another attempt inside the same terms`),
          template("center.whip.boundary.friction.01", "center.whip.boundary", "Friction can become information here, but only if the reading does not simply rehearse the conflict again"),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 12) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.birds.communication.conversation.01", "center.birds.communication", () => `The center is conversational because ${domainClause}; tone and timing decide whether the exchange clarifies or scatters`),
          template("center.birds.obstacle.worry.01", "center.birds.obstacle", "The nervous charge around this card makes it important to separate useful dialogue from repeated worry"),
          template("center.birds.practical.listen.01", "center.birds.practical", "This spread wants listening before reaction: which voice matters, and which one is only adding noise"),
          template("center.birds.action_point.say_it.01", "center.birds.action_point", () => `The practical move around ${domainClause} is a clearer conversation, not more anxious circling`),
          template("center.birds.timing.message_rhythm.01", "center.birds.timing", "Communication is active here, but the rhythm needs calming before it becomes reliable"),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 13) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.child.opportunity.beginning.01", "center.child.opportunity", () => `The center is still forming because ${domainClause}; the next move works best at a small, testable scale`),
          template("center.child.practical.scale.01", "center.child.practical", "This spread asks for light structure: enough to protect the beginning, not so much that it crushes it"),
          template("center.child.timing.early_stage.01", "center.child.timing", "The timing is early, so the reading should be judged by what can be learned rather than what is already complete"),
          template("center.child.obstacle.overload.01", "center.child.obstacle", () => `The risk around ${domainClause} is loading a new thing with expectations it cannot carry yet`),
          template("center.child.action_point.iterate.01", "center.child.action_point", "The practical move is to start small, learn quickly, and let the first attempt teach the next one"),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 14) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.fox.practical.verify.01", "center.fox.practical", () => `The center asks for verification because ${domainClause}; motives and incentives need to be checked plainly`),
          template("center.fox.boundary.self_protection.01", "center.fox.boundary", "This spread wants careful self-protection without turning every uncertainty into suspicion"),
          template("center.fox.obstacle.evasion.01", "center.fox.obstacle", "The risk is that strategy becomes avoidance, or cleverness starts protecting the wrong thing"),
          template("center.fox.action_point.diligence.01", "center.fox.action_point", () => `The practical move around ${domainClause} is due diligence: check the story against the facts before committing more`),
          template("center.fox.cause_effect.incentive.01", "center.fox.cause_effect", "The important question is who benefits, what is being protected, and whether the plan can survive scrutiny"),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 15) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.bear.stability.power.01", "center.bear.stability", () => `The center has weight because ${domainClause}; power and resources have to be handled deliberately`),
          template("center.bear.practical.resources.01", "center.bear.practical", "This spread turns on capacity: money, body, authority, protection, or the person carrying real influence"),
          template("center.bear.boundary.stewardship.01", "center.bear.boundary", "The useful move is stewardship, not control; strength should hold the situation without smothering it"),
          template("center.bear.obstacle.overreach.01", "center.bear.obstacle", () => `The pressure around ${domainClause} comes from weight becoming control, appetite, or overreach`),
          template("center.bear.action_point.organize.01", "center.bear.action_point", "The practical answer is to name the resources, set the limits, and use authority with care"),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 16) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.stars.direction.guidance.01", "center.stars.direction", () => `The center offers guidance because ${domainClause}; the signal needs a route, not just belief`),
          template("center.stars.practical.orientation.01", "center.stars.practical", "This spread asks for orientation: what pattern is visible, and what step would keep faith with it"),
          template("center.stars.opportunity.alignment.01", "center.stars.opportunity", "Hope is useful here when it becomes coordinates: direction, timing, and a next action that can be tested"),
          template("center.stars.obstacle.float.01", "center.stars.obstacle", () => `The risk around ${domainClause} is floating on inspiration instead of making the guidance usable`),
          template("center.stars.timing.long_range.01", "center.stars.timing", "The timing is long-range, so the immediate move should align with the pattern rather than try to finish it"),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 17) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.stork.direction.change.01", "center.stork.direction", () => `The center is changing because ${domainClause}; the question is how to guide the transition rather than simply wait it out`),
          template("center.stork.timing.seasonal.01", "center.stork.timing", "This spread turns on timing, adaptation, and the moment when the old arrangement starts becoming a new one"),
          template("center.stork.practical.adjust.01", "center.stork.practical", "The practical move is to support the shift: move what is ready, revise what is stale, and check what returns"),
          template("center.stork.opportunity.upgrade.01", "center.stork.opportunity", () => `The opening around ${domainClause} is improvement, but only if the change is helped into a workable form`),
          template("center.stork.obstacle.unsettled.01", "center.stork.obstacle", "The risk is mistaking movement for completion before the new arrangement has actually landed"),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 18) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.dog.social.loyalty.01", "center.dog.social", () => `The center rests on loyalty because ${domainClause}; trust has to be measured by follow-through`),
          template("center.dog.practical.reliability.01", "center.dog.practical", "This spread asks who is genuinely dependable, what support is proven, and whether the bond is reciprocal"),
          template("center.dog.action_point.ally.01", "center.dog.action_point", "The useful move is to work with the ally or practice that has already shown it can stay present"),
          template("center.dog.obstacle.assumption.01", "center.dog.obstacle", () => `The risk around ${domainClause} is assuming warmth equals reliability before support is actually tested`),
          template("center.dog.boundary.service.01", "center.dog.boundary", "Service and loyalty matter here, but they need clean boundaries so help does not become obligation without choice"),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 19) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.tower.boundary.structure.01", "center.tower.boundary", () => `The center is structured because ${domainClause}; the formal frame decides more than mood does`),
          template("center.tower.practical.system.01", "center.tower.practical", "This spread asks for procedure, boundaries, and the right degree of distance from the immediate pressure"),
          template("center.tower.obstacle.isolation.01", "center.tower.obstacle", "The risk is that useful distance hardens into isolation, bureaucracy, or a wall no one can work through"),
          template("center.tower.action_point.channel.01", "center.tower.action_point", () => `The practical move around ${domainClause} is to use the proper channel rather than trying to solve it informally`),
          template("center.tower.direction.perspective.01", "center.tower.direction", "The stronger view comes from stepping back far enough to see the structure without disappearing from the human reality"),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 20) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.garden.social.public_field.01", "center.garden.social", () => `The center is public because ${domainClause}; the wider room is part of the reading, not just background`),
          template("center.garden.practical.network.01", "center.garden.practical", "This spread turns on participation, reputation, and the network that shapes what can be seen or shared"),
          template("center.garden.action_point.visibility.01", "center.garden.action_point", "The practical move is to choose the right setting, audience, or shared space for the next step"),
          template("center.garden.obstacle.exposure.01", "center.garden.obstacle", () => `The risk around ${domainClause} is accidental visibility: being seen before the terms are chosen`),
          template("center.garden.timing.gathering.01", "center.garden.timing", "The timing depends on the social field: who is present, who can witness, and what the room is ready to hold"),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 21) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.mountain.obstacle.terrain.01", "center.mountain.obstacle", () => `The center is blocked because ${domainClause}; the useful question is what route can still be worked`),
          template("center.mountain.timing.slow.01", "center.mountain.timing", "This spread turns on delay, endurance, and the patience to break the climb into real stages"),
          template("center.mountain.practical.route.01", "center.mountain.practical", "The practical move is to map the obstacle: what will not move, what can be routed around, and what simply needs more time"),
          template("center.mountain.action_point.stage.01", "center.mountain.action_point", () => `Progress around ${domainClause} comes through staged effort rather than another push straight at the wall`),
          template("center.mountain.obstacle.not_failure.01", "center.mountain.obstacle", "The delay is not automatically failure; it is information about terrain, stamina, and the route that can actually hold"),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 22) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.crossroads.action_point.choose.01", "center.crossroads.action_point", () => `The center is a choice because ${domainClause}; criteria matter more than keeping every option alive`),
          template("center.crossroads.practical.tradeoff.01", "center.crossroads.practical", "This spread asks for tradeoff clarity: what each route costs, protects, and makes possible"),
          template("center.crossroads.obstacle.drift.01", "center.crossroads.obstacle", "The risk is mistaking open options for movement when the reading is asking for a chosen path"),
          template("center.crossroads.values.criteria.01", "center.crossroads.values", () => `The decision around ${domainClause} becomes cleaner when values are used as criteria, not decoration`),
          template("center.crossroads.direction.branch.01", "center.crossroads.direction", "The way forward narrows by design: choose the road that can carry the actual next step"),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 23) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.mice.obstacle.leak.01", "center.mice.obstacle", () => `The center is being drained because ${domainClause}; the small leak matters before it becomes a large loss`),
          template("center.mice.practical.repair.01", "center.mice.practical", "This spread asks for maintenance: patch the leak, reduce the stressor, and stop treating attrition as background"),
          template("center.mice.timing.accumulation.01", "center.mice.timing", "Timing matters because small losses compound when they are left unnamed"),
          template("center.mice.action_point.simplify.01", "center.mice.action_point", () => `The practical move around ${domainClause} is simplification, especially where energy keeps disappearing in small amounts`),
          template("center.mice.hidden_pressure.stress.01", "center.mice.hidden_pressure", "The issue may not look dramatic, but the reading is tracking what quietly wears trust, money, time, or attention thin"),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 24) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.heart.values.core.01", "center.heart.values", () => `The center is emotional because ${domainClause}; what is genuinely cared for has to guide the next move`),
          template("center.heart.practical.care.01", "center.heart.practical", "This spread asks for care that can act: sincere, warm, and bounded enough to stay trustworthy"),
          template("center.heart.boundary.devotion.01", "center.heart.boundary", "Devotion matters here, but it needs discernment so love does not become idealization or self-erasure"),
          template("center.heart.action_point.express.01", "center.heart.action_point", () => `The practical move around ${domainClause} is to express the value clearly and back it with follow-through`),
          template("center.heart.direction.alignment.01", "center.heart.direction", "The way forward is value alignment: choose what keeps faith with the heart of the matter without ignoring reality"),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 25) {
    return sentence(chooseAvoidingRecent([
      template("center.ring.commitment.terms.01", "center.ring.commitment", () => `The center is an agreement because ${domainClause}; the terms need to be conscious, not merely inherited from the last cycle`),
      template("center.ring.practical.review.01", "center.ring.practical", "This spread asks what is being promised, renewed, repeated, or kept alive by habit"),
      template("center.ring.obstacle.loop.01", "center.ring.obstacle", "The risk is staying loyal to an outdated loop because it still has the shape of commitment"),
      template("center.ring.action_point.renew.01", "center.ring.action_point", () => `The practical move around ${domainClause} is to review the bond and decide what should be renewed on purpose`),
      template("center.ring.direction.terms.01", "center.ring.direction", "The way forward is clearer terms: name the promise, the cycle, and the point where repetition needs revision"),
    ], undefined, phraseTracker, random));
  }

  if (cardId === 26) {
    return sentence(chooseAvoidingRecent([
      template("center.book.hidden_context.01", "center.book.hidden_context", () => `The center is not fully visible because ${domainClause}; research matters before certainty`),
      template("center.book.practical.study.01", "center.book.practical", "This spread asks for study, privacy, and responsible handling of what has not yet been disclosed"),
      template("center.book.obstacle.withheld.01", "center.book.obstacle", "The risk is acting around missing context as if the blank space were already understood"),
      template("center.book.action_point.learn.01", "center.book.action_point", () => `The practical move around ${domainClause} is to learn enough before deciding what should be revealed`),
      template("center.book.timing.revelation.01", "center.book.timing", "The timing belongs to revelation in stages: open the right page, not every page at once"),
    ], undefined, phraseTracker, random));
  }

  if (cardId === 27) {
    return sentence(chooseAvoidingRecent([
      template("center.letter.communication.record.01", "center.letter.communication", () => `The center is documented because ${domainClause}; wording and follow-up matter now`),
      template("center.letter.practical.confirm.01", "center.letter.practical", "This spread asks for a message trail that can be checked, not meaning left floating in the air"),
      template("center.letter.action_point.write.01", "center.letter.action_point", "The practical move is to put the important thing in clear words and make sure it is received"),
      template("center.letter.obstacle.vague.01", "center.letter.obstacle", () => `The risk around ${domainClause} is vague communication carrying a decision that needs a record`),
      template("center.letter.direction.follow_up.01", "center.letter.direction", "The way forward runs through the document, message, form, receipt, or follow-up that makes the matter answerable"),
    ], undefined, phraseTracker, random));
  }

  if (cardId === 30) {
    return sentence(chooseAvoidingRecent([
      template("center.lily.ethics.maturity.01", "center.lily.ethics", () => `The center asks for maturity because ${domainClause}; calm has to be paired with clear intent`),
      template("center.lily.practical.composure.01", "center.lily.practical", "This spread turns on restraint, ethics, patience, and the long view"),
      template("center.lily.obstacle.avoidance.01", "center.lily.obstacle", "The risk is mistaking quiet for wisdom when action still needs to be taken"),
      template("center.lily.action_point.dignity.01", "center.lily.action_point", () => `The practical move around ${domainClause} is composed action, not passive waiting`),
      template("center.lily.direction.peace.01", "center.lily.direction", "The way forward is principled calm with enough spine to say what the situation requires"),
    ], undefined, phraseTracker, random));
  }

  if (cardId === 31) {
    return sentence(chooseAvoidingRecent([
      template("center.sun.clarity.vitality.01", "center.sun.clarity", () => `The center is bright because ${domainClause}; what is working should be strengthened responsibly`),
      template("center.sun.practical.visibility.01", "center.sun.practical", "This spread asks for confidence, visibility, and the discipline to sustain success once it appears"),
      template("center.sun.obstacle.overconfidence.01", "center.sun.obstacle", "The risk is letting momentum become glare, where brightness hides details that still matter"),
      template("center.sun.action_point.use_light.01", "center.sun.action_point", () => `The practical move around ${domainClause} is to use the clarity without outrunning the checks`),
      template("center.sun.direction.success.01", "center.sun.direction", "The way forward runs through the part of the situation that is genuinely alive and ready to grow stronger"),
    ], undefined, phraseTracker, random));
  }

  if (cardId === 32) {
    return sentence(chooseAvoidingRecent([
      template("center.moon.emotional.rhythm.01", "center.moon.emotional", () => `The center is rhythmic because ${domainClause}; feeling needs to be tracked across more than one phase`),
      template("center.moon.practical.attunement.01", "center.moon.practical", "This spread asks for emotional attunement, feedback, and recognition without surrendering judgment to mood"),
      template("center.moon.obstacle.fluctuation.01", "center.moon.obstacle", "The risk is treating one emotional weather pattern as the whole climate"),
      template("center.moon.action_point.name_need.01", "center.moon.action_point", () => `The practical move around ${domainClause} is to name the need and watch how the signal changes over time`),
      template("center.moon.direction.recognition.01", "center.moon.direction", "The way forward depends on timing, perception, and recognition handled with steadiness"),
    ], undefined, phraseTracker, random));
  }

  if (cardId === 33) {
    return sentence(chooseAvoidingRecent([
      template("center.key.solution.access.01", "center.key.solution", () => `The center is unlocking because ${domainClause}; the key detail should be verified and used`),
      template("center.key.practical.verify.01", "center.key.practical", "This spread asks for focused action: test the solution, then commit where the lock actually opens"),
      template("center.key.obstacle.false_certainty.01", "center.key.obstacle", "The risk is locking onto the first answer before checking whether it fits the real problem"),
      template("center.key.action_point.unlock.01", "center.key.action_point", () => `The practical move around ${domainClause} is to use the specific access point, not scatter effort everywhere`),
      template("center.key.direction.decide.01", "center.key.direction", "The way forward becomes available through one decisive, usable piece of clarity"),
    ], undefined, phraseTracker, random));
  }

  if (cardId === 34) {
    return sentence(chooseAvoidingRecent([
      template("center.fish.resources.flow.01", "center.fish.resources", () => `The center is flowing because ${domainClause}; what comes in and goes out needs tracking`),
      template("center.fish.practical.monitor.01", "center.fish.practical", "This spread turns on money, energy, exchange, or resource movement that has to be steered"),
      template("center.fish.obstacle.leakage.01", "center.fish.obstacle", "The risk is confusing movement with health when the flow may include leaks"),
      template("center.fish.action_point.align.01", "center.fish.action_point", () => `The practical move around ${domainClause} is to align the flow with what actually matters`),
      template("center.fish.direction.current.01", "center.fish.direction", "The way forward is resource clarity: follow the current closely enough to direct it"),
    ], undefined, phraseTracker, random));
  }

  if (cardId === 35) {
    return sentence(chooseAvoidingRecent([
      template("center.anchor.stability.endurance.01", "center.anchor.stability", () => `The center is anchored because ${domainClause}; durability matters more than a quick swing`),
      template("center.anchor.practical.hold.01", "center.anchor.practical", "This spread asks what should be stabilized, what can hold, and what has become dead weight"),
      template("center.anchor.obstacle.stuck.01", "center.anchor.obstacle", "The risk is mistaking staying power for wisdom when the fixed point no longer serves the life of the matter"),
      template("center.anchor.action_point.stabilize.01", "center.anchor.action_point", () => `The practical move around ${domainClause} is to strengthen what still deserves anchoring`),
      template("center.anchor.direction.long_term.01", "center.anchor.direction", "The way forward is the stable version: slower, more durable, and easier to trust under pressure"),
    ], undefined, phraseTracker, random));
  }

  if (cardId === 36) {
    return sentence(chooseAvoidingRecent([
      template("center.cross.burden.meaning.01", "center.cross.burden", () => `The center is serious because ${domainClause}; purpose has to be separated from pressure`),
      template("center.cross.practical.carry.01", "center.cross.practical", "This spread asks what is truly yours to carry, what can be shared, and what should be put down"),
      template("center.cross.obstacle.overburden.01", "center.cross.obstacle", "The risk is treating heaviness as proof that every burden is meaningful or necessary"),
      template("center.cross.action_point.discern.01", "center.cross.action_point", () => `The practical move around ${domainClause} is discernment: carry the true responsibility, not inherited strain`),
      template("center.cross.direction.accountability.01", "center.cross.direction", "The way forward honors the seriousness without making solitary endurance the whole answer"),
    ], undefined, phraseTracker, random));
  }

  if (cardId === 29) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.querent.action_point.direct.01", "center.querent.action_point", () => `Your clearest leverage is the part where ${domainClause}, because that is what you can shape, permit, or clarify directly`),
          template("center.querent.practical.steering.01", "center.querent.practical", () => `The weight sits with the part of the story you are actually steering: where ${domainClause}`),
          template("center.querent.obstacle.noise.01", "center.querent.obstacle", "That is why your own stance carries more weight here than the surrounding noise"),
          template("center.querent.practical.choice.01", "center.querent.practical", "That is what pulls the reading back to your choices more than the wider context"),
          template("center.querent.action_point.move.01", "center.querent.action_point", "That keeps the emphasis on what you can actually move, not just observe"),
          template("center.querent.social.side.01", "center.querent.social", () => `The spread keeps returning to your side of the exchange, especially where ${domainClause}`),
          template("center.querent.cause_effect.domain.01", "center.querent.cause_effect", () => `Your position in this is active because ${domainClause}`),
          template("center.querent.hidden_pressure.unresolved.01", "center.querent.hidden_pressure", "What you choose, permit, or leave unresolved is the variable the spread keeps circling back to"),
          template("center.querent.practical.active.01", "center.querent.practical", "This spread treats your choices as the most active part of the picture"),
          template("center.querent.cause_effect.domain.02", "center.querent.cause_effect", () => `The reading gives extra weight to the part where ${domainClause}`),
          template("center.querent.action_point.lever.01", "center.querent.action_point", "The spread keeps treating your position as the lever that determines the outcome"),
          template("center.querent.practical.control.01", "center.querent.practical", "Not all of this is in your hands, but the part that is turns out to matter most"),
          template("center.querent.opportunity.capacity.01", "center.querent.opportunity", "The reading's center of gravity sits with what you are actually in a position to do"),
          template("center.querent.boundary.control.01", "center.querent.boundary", "What is genuinely yours to move, decide, or let go carries more weight here than what is outside your control"),
          template("center.querent.action_point.redirect.01", "center.querent.action_point", "The surrounding cards keep redirecting attention to what is specifically yours to act on"),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  if (cardId === 28) {
    return sentence(
      chooseAvoidingRecent(
        [
          template("center.counterpart.social.shared.01", "center.counterpart.social", () => `This keeps attention on the part of the story you do not define alone, especially where ${domainClause}`),
          template("center.counterpart.practical.position.01", "center.counterpart.practical", () => `The other person's position matters because ${domainClause}`),
          template("center.counterpart.social.stance.01", "center.counterpart.social", () => `Their stance carries real weight where ${domainClause}`),
          template("center.counterpart.boundary.control.01", "center.counterpart.boundary", () => `This is the part you cannot steer by yourself, even if ${domainClause}`),
          template("center.counterpart.hidden_pressure.reveals.01", "center.counterpart.hidden_pressure", () => `The reading keeps returning to what the other person holds back, shows, or reveals around the fact that ${domainClause}`),
          template("center.counterpart.timing.availability.01", "center.counterpart.timing", () => `The timing depends partly on their availability, because ${domainClause}`),
          template("center.counterpart.obstacle.assumption.01", "center.counterpart.obstacle", () => `The main risk is assuming their side is already clear when ${domainClause}`),
          template("center.counterpart.opportunity.alignment.01", "center.counterpart.opportunity", () => `The useful opening is clearer alignment with their side of the matter, particularly where ${domainClause}`),
          template("center.counterpart.action_point.reading.01", "center.counterpart.action_point", () => `The practical move is to read their actual position before deciding what ${domainClause} means for you`),
          template("center.counterpart.emotional.mirror.01", "center.counterpart.emotional", () => `Emotionally, the spread asks you to notice what their response mirrors back about the part where ${domainClause}`),
        ],
        undefined,
        phraseTracker,
        random,
      ),
    );
  }

  return sentence(
    chooseAvoidingRecent(
      [
        template("center.general.signal.surrounding.01", "center.general.signal", () => `The surrounding cards suggest that ${domainClause}`),
        template("center.general.signal.pattern.01", "center.general.signal", () => `The wider pattern suggests that ${domainClause}`),
        template("center.general.supporting.01", "center.general.supporting", () => `The supporting cards suggest that ${domainClause}`),
        template("center.general.cause_effect.return.01", "center.general.cause_effect", () => `Read together, the cards keep pointing back to ${domainClause}`),
        template("center.general.hidden_pressure.field.01", "center.general.hidden_pressure", () => `The field keeps circling ${domainClause}`),
      ],
      undefined,
      phraseTracker,
      random,
    ),
  );
}

function extractCardRefsFromText(input: string): string[] {
  const matches = input.match(/\b[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)?\s+\(\d+\)/g) ?? [];
  return Array.from(new Set(matches));
}

function extractFirstCardRef(input: string): string | null {
  return extractCardRefsFromText(input)[0] ?? null;
}

function extractHouseNameFromText(input: string): string | null {
  const match = input.match(/\b[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)?\s+House\b/);
  return match ? match[0] : null;
}

function buildQuickIntro(input: {
  question: string;
  spreadLabel: string;
  subjectLabel: string;
  themeLensSummary: string;
  random: () => number;
}): string {
  const { question, spreadLabel, subjectLabel, themeLensSummary, random } = input;
  const normalized = normalizedQuestion(question);
  const lowerSubject = subjectLabel.toLowerCase();

  if (!normalized) {
    return choose(
      [
        `This ${spreadLabel} opens through ${subjectLabel} ${themeLensSummary}, offering a broad read of current conditions.`,
        `${subjectLabel} ${themeLensSummary} sets the tone here, so the reading stays open and reflective rather than narrowly focused.`,
        `Without a fixed question, this ${spreadLabel.toLowerCase()} leans into ${lowerSubject} themes ${themeLensSummary}.`,
        `With no fixed question, the spread is best read through ${subjectLabel} ${themeLensSummary}.`,
        `${subjectLabel} ${themeLensSummary} provides the clearest frame for this open reading.`,
        `With the question left open, this ${spreadLabel.toLowerCase()} gathers around ${lowerSubject} themes ${themeLensSummary}.`,
        `This open reading settles most naturally into ${subjectLabel} ${themeLensSummary}.`,
        `No single question is fixed here, so ${subjectLabel} ${themeLensSummary} becomes the clearest lens.`,
        `The spread settles most naturally around ${subjectLabel} themes ${themeLensSummary}, given there is no fixed question to anchor it.`,
        `Without a question to direct it, this reading finds its shape through ${lowerSubject} ${themeLensSummary}.`,
        `Leaving the question open lets the spread speak through ${lowerSubject} ${themeLensSummary}, which is where the clearest signal sits.`,
        `The cards arrange themselves around ${lowerSubject} ${themeLensSummary}, offering a picture of what is already in motion.`,
        `This ${spreadLabel.toLowerCase()} reads best as a general survey through ${lowerSubject} ${themeLensSummary}, so the strongest threads can surface on their own.`,
        `An open reading like this one finds its centre through ${subjectLabel} ${themeLensSummary}, where the cards cluster most clearly.`,
        `The reading opens without a fixed question, so ${lowerSubject} ${themeLensSummary} becomes the thread that holds the sections together.`,
        `No question was set, and that lets the spread breathe — ${subjectLabel} ${themeLensSummary} gives it the shape it needs.`,
        `The strongest signal in this open ${spreadLabel.toLowerCase()} lives in ${lowerSubject} ${themeLensSummary}, so that is the thread the reading follows.`,
        `This is a reading without a fixed question, which means the cards speak through ${lowerSubject} ${themeLensSummary} and let the picture form gradually.`,
      ],
      random,
    );
  }

  return choose(
    [
      `For "${normalized}", the clearest pattern sits in ${subjectLabel} ${themeLensSummary}.`,
      `The cards answer "${normalized}" through ${subjectLabel} ${themeLensSummary}.`,
      `On "${normalized}", this ${spreadLabel.toLowerCase()} leans into ${lowerSubject}, ${themeLensSummary}.`,
      `Around "${normalized}", the reading gathers most strongly around ${lowerSubject}, ${themeLensSummary}.`,
      `For "${normalized}", the spread keeps returning to ${lowerSubject}, ${themeLensSummary}.`,
      `"${normalized}" is best read here through ${subjectLabel} ${themeLensSummary}.`,
      `Across "${normalized}", ${subjectLabel} ${themeLensSummary} gives the clearest frame.`,
      `For "${normalized}", the cards keep circling back to ${lowerSubject}, ${themeLensSummary}.`,
      `One workable lens for "${normalized}" is ${subjectLabel} ${themeLensSummary}.`,
      `"${normalized}" draws the reading toward ${lowerSubject}, ${themeLensSummary}.`,
      `This spread, asked through "${normalized}", keeps circling back to ${lowerSubject} ${themeLensSummary} as the clearest frame.`,
      `What the cards seem most interested in, given "${normalized}", is ${lowerSubject} ${themeLensSummary}.`,
      `"${normalized}" seems to live most strongly in ${lowerSubject} territory ${themeLensSummary}.`,
      `Framing "${normalized}" through ${lowerSubject} ${themeLensSummary} gives the clearest read of what is actually moving.`,
      `"${normalized}" enters a field shaped by ${lowerSubject} ${themeLensSummary}, and the cards answer by pointing toward what is most ready to shift.`,
      `The question "${normalized}" finds its strongest thread in ${lowerSubject} ${themeLensSummary}, so the reading follows that line first.`,
      `For "${normalized}", the practical response lives in ${lowerSubject} ${themeLensSummary} — that is where the cards concentrate.`,
      `"${normalized}" is a question that the spread answers through ${lowerSubject} ${themeLensSummary}, and the sections below trace where the signal is strongest.`,
    ],
    random,
  );
}

function buildSubjectDisclaimer(subjectId: SubjectId): string {
  switch (subjectId) {
    case "health":
      return "This reading is for reflective purposes only. It is not medical advice and should not replace consultation with a qualified health professional.";
    case "legal_admin":
      return "This reading is for reflective purposes only. It is not legal advice and should not replace consultation with a qualified legal professional.";
    default:
      return "";
  }
}

function describeSignificatorMode(mode: SignificatorMode): string {
  if (mode === "self") return "Querent is treated as the primary significator";
  if (mode === "other") return "Counterpart is treated as the primary significator";
  if (mode === "relationship") return "Querent and Counterpart are read as a relational axis";
  return "Significator focus remains open and context-driven";
}

function buildSection(id: string, title: string, technique: NarrativeSection["technique"], body: string): NarrativeSection {
  return { id, title, technique, body };
}

const SECTION_TITLE_POOL: Record<string, string[]> = {
  // GT quick mode
  center: [
    "At the Heart",
    "Central Focus",
    "The Core Position",
    "Where It All Centers",
    "The Anchor Point",
    "What Sits at the Middle",
    "The Central Field",
    "The Pivot Card",
  ],
  pair: [
    "What Sits Beside It",
    "The Nearest Cards",
    "Adjacent Influences",
    "Side by Side",
    "Closest to the Centre",
    "The Immediate Field",
    "What Flanks It",
    "The Surrounding Cards",
  ],
  background: [
    "The Deeper Current",
    "Undercurrents",
    "What Runs Beneath",
    "The Wider Pattern",
    "The Background Field",
    "The Longer Thread",
    "What Holds the Context",
    "Behind the Picture",
  ],
  timing: [
    "What Comes Next",
    "Timing and Momentum",
    "The Forward Edge",
    "What Is Forming",
    "The Moving Edge",
    "What the Spread Points Toward",
    "The Forward Signal",
    "In Motion",
  ],
  cartouche: ["Cartouche", "The Fate Line", "Below the Tableau", "The Final Row"],
  synthesis: [
    "Taken Together",
    "The Full Picture",
    "Reading the Whole",
    "What It Adds Up To",
    "Across the Spread",
    "The Whole Picture",
    "What the Spread Says",
    "The Overall Signal",
  ],
  // Three-card quick mode
  situation: [
    "Where Things Stand",
    "The Starting Position",
    "What Is Already Here",
    "The Current Ground",
    "The Field as It Is",
    "What the Cards Find First",
    "The Existing Shape",
    "Before the Turn",
  ],
  pivot: [
    "The Turning Point",
    "The Hinge",
    "Where It Shifts",
    "The Central Question",
    "The Complication",
    "Where Pressure Gathers",
    "The Core Tension",
    "What Shifts the Balance",
  ],
  direction: [
    "Where It Leads",
    "What Follows",
    "The Forward Movement",
    "Where Momentum Points",
    "The Next Shape",
    "What Opens",
    "The Direction Forward",
    "Where the Current Runs",
  ],
  closer: ["The Next Move", "What To Do With This", "The Practical Thread", "Your Response"],
};

function pickSectionTitle(id: string, random: () => number): string {
  const pool = SECTION_TITLE_POOL[id];
  if (!pool || pool.length === 0) return id;
  return pool[Math.floor(random() * pool.length)];
}

function buildHighlights(sections: NarrativeSection[]): HighlightItem[] {
  return sections.slice(0, 8).map((section, index) => ({
    id: `highlight-${index + 1}`,
    title: section.title,
    summary: capitalizeSentenceStarts(section.body.split(".")[0].trim()) + ".",
    sectionId: section.id,
  }));
}

function makeConclusion(subjectId: SubjectId, domain: Domain, random: () => number): string {
  switch (subjectId) {
    case "money":
      return choose(
        [
          "Follow the money to the point where it thins; that is where the real adjustment belongs.",
          "Stabilize the recurring obligation before chasing the next upside.",
          "Back the structure that actually holds the flow together, not the one that only looks reassuring.",
          "Let the numbers show you what can last, then commit there.",
          "Protect the channel that keeps value moving cleanly and let the rest reorganize around it.",
        ],
        random,
      );
    case "home_family":
      return choose(
        [
          "Make one small change that makes the home atmosphere easier to live in.",
          "Support the part of the household that most needs steadiness, then let the rest soften.",
          "Choose the quieter act of care and let that reset the tone at home.",
          "Name one domestic pressure plainly and work there first.",
          "Protect one part of the home rhythm that helps everyone breathe more easily.",
        ],
        random,
      );
    case "friends_social":
      return choose(
        [
          "Reach toward the connection that feels reciprocal, and let the rest show itself in time.",
          "Say one clear thing in the social space that matters most, then watch what becomes simpler.",
          "Keep your energy with the people who meet you cleanly.",
          "Clarify one friendship boundary and let the group dynamic respond around it.",
          "Choose the social thread that feels honest, not merely convenient.",
        ],
        random,
      );
    case "personal_growth":
      return choose(
        [
          "Choose the response that breaks the old loop, even if it feels quieter than habit.",
          "Stay with the one truth that keeps returning and let it guide the next move.",
          "Make the smaller, cleaner choice rather than the familiar one.",
          "Support the part of yourself that is ready for change, not the part asking for another delay.",
          "Let one steady boundary do the work that overthinking cannot.",
        ],
        random,
      );
    case "health":
      return choose(
        [
          "Choose the steadier rhythm, not the more dramatic push.",
          "Support the part of your routine that helps your system settle first.",
          "Let rest and pacing lead the next move, even if that feels slower than you want.",
          "Make the gentler adjustment and watch whether your energy answers well to it.",
          "Protect one habit that restores rather than depletes.",
        ],
        random,
      );
    case "pets":
      return choose(
        [
          "Make the smallest care change that helps the animal feel safer in its environment.",
          "Support routine first, then let the animal show you what still needs attention.",
          "Choose the calmer adjustment and watch for comfort rather than speed.",
          "Protect the rhythm that helps your animal settle most easily.",
          "Work with one clear cue from the animal, then let its comfort guide the next step.",
        ],
        random,
      );
    case "creative":
      return choose(
        [
          "Back the part of the work that still feels alive, and let momentum grow from there.",
          "Choose the next concrete act of making and let the meaning gather around it.",
          "Protect the thread of work that wants to be finished, not merely improved forever.",
          "Let craft lead the next move, and trust visibility to come later.",
          "Give the project one honest push forward and let that restore confidence.",
        ],
        random,
      );
    case "travel":
      return choose(
        [
          "Secure the next practical piece of the journey, then let the route reveal itself step by step.",
          "Confirm the part of the trip that still feels uncertain, and let that steady the rest.",
          "Work with timing and logistics first, then let the wider journey open from there.",
          "Choose the route that feels workable in real conditions, not just appealing in theory.",
          "Handle the next travel detail cleanly and let that ease the wider movement.",
        ],
        random,
      );
    case "education":
      return choose(
        [
          "Focus on the next piece of learning you can truly absorb, then build from there.",
          "Choose the study step that strengthens understanding, not just urgency.",
          "Let repetition and clarity shape the next move in the learning process.",
          "Work with the material that asks for steadier attention first.",
          "Finish one useful stage of learning before reaching for the next one.",
        ],
        random,
      );
    case "spiritual":
      return choose(
        [
          "Follow the quieter sign that returns, rather than the louder one that fades quickly.",
          "Keep to the practice that helps you feel more grounded, not more dramatic.",
          "Let one calm act of trust guide the next step.",
          "Stay with the symbol or feeling that keeps proving itself gently.",
          "Choose the path that brings more inner steadiness, not just more intensity.",
        ],
        random,
      );
    case "community":
      return choose(
        [
          "Take the next step that strengthens real belonging rather than surface visibility.",
          "Offer one concrete contribution to the group space that matters most.",
          "Support the connection that feels mutual and let your place in the wider field grow from there.",
          "Choose participation where your effort is actually met.",
          "Build trust in the shared space one visible act at a time.",
        ],
        random,
      );
    case "legal_admin":
      return choose(
        [
          "Handle the clearest document or procedural step first, then let the process catch up around it.",
          "Make the next formal step clean, documented, and timely.",
          "Clarify the part of the process that still feels vague, then move from firmer ground.",
          "Protect the paper trail that keeps the matter steady and legible.",
          "Choose the procedural move that reduces ambiguity rather than speed alone.",
        ],
        random,
      );
    case "purpose_calling":
      return choose(
        [
          "Choose the next step that still feels true after the mood passes.",
          "Back the path you can sustain with integrity, not the one that only glows from a distance.",
          "Commit to the move that deepens alignment, even if it looks quieter than ambition.",
          "Let vocation become practical through one choice you can keep living with.",
          "Take the next step that feels both meaningful and bearable to carry.",
        ],
        random,
      );
    default:
      break;
  }

  if (domain === "love") {
    return choose(
      [
        "Choose one honest conversation and let the response set your next step.",
        "Name one emotional need clearly, then notice what shifts between you.",
        "Offer one steady sign of care and let the response show you what is mutual.",
        "Set one gentle boundary and track whether mutual respect grows around it.",
        "Make one clear invitation to connect, then let actions speak.",
        "Ask one direct question and let the answer shape what comes next.",
        "Let one clear act of honesty do the work that guessing cannot.",
        "Say one true thing plainly, then watch whether the relationship meets you there.",
        "Choose one action that supports trust, and let consistency do the rest.",
        "Bring one feeling into the open, then pay attention to what becomes easier.",
        "Make one warm, unmistakable gesture and let the other person show whether they can meet it.",
        "Show care in one grounded way, then let the exchange reveal its real shape.",
      ],
      random,
    );
  }
  if (domain === "work") {
    return choose(
      [
        "Pick one high-impact task and let finishing it restore some clarity.",
        "Clarify one boundary in your workflow, then notice what pressure eases.",
        "Make one practical process change and give it room to settle.",
        "Address one recurring friction point directly, then watch what loosens around it.",
        "Prioritize one strategic conversation and let it reset the tone of the week.",
        "Take one decisive operational step and let steadiness, not urgency, carry it.",
        "Stabilize one pressure point first, then see what no longer needs your effort.",
        "Choose one concrete improvement that reduces drag and makes the next move simpler.",
        "Make one boundary visible in practice, then let people respond to the clearer shape.",
        "Resolve one bottleneck cleanly, then let the wider picture reorganize around that shift.",
      ],
      random,
    );
  }
  return choose(
    [
      "Take one concrete step and let the next signal meet you there.",
      "Choose one grounded action, then give it space to show what changes.",
      "Commit to one practical move and notice what becomes lighter or clearer.",
      "Make one deliberate adjustment, then let clarity gather around it.",
      "Act on one stable priority and see what begins to move with less strain.",
      "Move one piece at a time and let momentum reveal the next choice.",
      "Let one practical choice test the pattern before you ask for more certainty.",
      "Take one measured step and let the response narrow the field.",
      "Work with one clear signal first, then let the rest sort itself by relevance.",
      "Choose one durable next move and let the outcome deepen the story.",
      "Back one practical choice fully, then notice which doubts lose force.",
      "Put one calm decision into motion and let the rest follow at its own pace.",
      "Follow one solid lead and let the rest wait until it becomes necessary.",
      "Anchor the next step in what is already clear, then notice what answers back.",
    ],
    random,
  );
}

function makeThreeCardCloser(subjectId: SubjectId, role: string, domain: Domain, random: () => number): string {
  switch (subjectId) {
    case "general_reading":
      return choose(
        [
          "Let the middle card decide which part of the sequence deserves action first.",
          "Keep your attention on the pivot; that is where the reading stops being abstract.",
          "The clearest next move is the one that answers the pivot directly.",
          "Let the center of the sequence set the pace before you ask the whole story to resolve.",
          "The reading becomes practical at the center — that is the place where intention can become action.",
          "What the middle card asks of you is more important than what the other two predict.",
        ],
        random,
      );
    case "money":
      return choose(
        [
          "Treat the middle card as the money choice that steadies the rest.",
          "Let the pivot show where flow needs protecting before anything can grow.",
          "The center of the sequence tells you which financial pressure to simplify first.",
          "Work with the middle card as the point where stability is either kept or lost.",
          "The financial thread turns at the center — that is where the next clear move sits.",
          "Let the pivot name which resource question deserves attention before the others.",
          "The middle card shows where money decisions have the most leverage right now.",
        ],
        random,
      );
    case "home_family":
      return choose(
        [
          "Here the household shows what most needs steadiness now.",
          "Let the pivot point to the domestic tension that is asking for care first.",
          "Keep your eye on the center of the sequence; that is where the home atmosphere can change.",
          "The center of the sequence is where the household rhythm is most ready to be adjusted.",
          "The pivot shows which thread in the household story needs the most direct attention.",
          "Let the middle card name which domestic pressure is asking for honest handling first.",
          "What would settle the home situation is at the center — that is where the reading becomes practical.",
        ],
        random,
      );
    case "friends_social":
      return choose(
        [
          "The social tone can still be reset from the middle of this sequence.",
          "Use the pivot to see which connection asks for honesty rather than assumption.",
          "In the center of the sequence, the social dynamic can still change cleanly.",
          "Let the middle card show which relationship thread deserves your energy first.",
          "The pivot tells you where the social story is asking for a genuine shift.",
          "Let the middle card name which friendship question needs the most direct response.",
          "What most shapes the social outcome sits at the center of this sequence.",
        ],
        random,
      );
    case "personal_growth":
      return choose(
        [
          "One habit or truth at the center can change the whole sequence.",
          "Stay with the pivot long enough to see which old loop it is trying to interrupt.",
          "In the center of the sequence, self-trust has to become practical.",
          "Let the middle card name the inner adjustment that makes the rest possible.",
          "The pivot shows where the inner work has the most direct path to something real.",
          "What the growth sequence is asking for sits at the center — that is the thing worth sitting with first.",
          "Let the middle card name which personal truth needs to be lived rather than just understood.",
        ],
        random,
      );
    case "health":
      return choose(
        [
          "Pacing matters more than pushing at the center of this sequence.",
          "Treat the pivot as the point where your system asks for a gentler response.",
          "The center of the sequence tells you which adjustment supports steadier recovery.",
          "Let the middle card guide the rhythm rather than the urgency around it.",
          "The pivot tells you where the body or energy most needs an honest adjustment.",
          "Let the middle card show which wellbeing choice would take the most pressure off.",
          "The health story turns at the center — that is where pacing becomes a real decision.",
        ],
        random,
      );
    case "pets":
      return choose(
        [
          "One care adjustment at the center would help the animal settle first.",
          "Treat the pivot as the clearest signal about comfort, routine, or stress.",
          "The center of the sequence points to the part of the care rhythm that matters most now.",
          "Let the middle card show what would make the animal feel safer or steadier first.",
          "The pivot tells you where the animal's situation is asking for the most direct response.",
          "Let the middle card name which care change would land most immediately.",
          "The care story turns at the center — that is where the clearest signal sits.",
        ],
        random,
      );
    case "creative":
      return choose(
        [
          "The work asks for a cleaner, more honest push right at the center.",
          "Treat the pivot as the part of the process that can restore momentum.",
          "The center of the sequence tells you where the making itself wants attention first.",
          "Let the middle card show which creative choice would make the rest easier to finish.",
          "The pivot tells you where creative energy is asking to be directed rather than scattered.",
          "Let the middle card name which step in the process would unlock what comes after.",
          "The making turns at the center — that is where the clearest choice about the work sits.",
        ],
        random,
      );
    case "travel":
      return choose(
        [
          "One travel detail near the center affects the rest of the route most.",
          "Treat the pivot as the point where timing or logistics need the clearest handling.",
          "The center of the sequence reveals what has to be confirmed before the journey can flow.",
          "Let the middle card show which part of the trip needs steadier planning first.",
          "The pivot tells you where the journey is asking for the most direct decision.",
          "Let the middle card name which travel question needs the clearest answer before things can move.",
          "The route turns at the center — that is where planning has the most leverage.",
        ],
        random,
      );
    case "education":
      return choose(
        [
          "Understanding has to deepen at the center before progress feels real.",
          "Treat the pivot as the part of the learning process that deserves more focus.",
          "The center of the sequence reveals which study step changes the rest.",
          "Let the middle card show where the learning curve needs steadier attention.",
          "The pivot tells you where understanding has to become practical before the next stage opens.",
          "Let the middle card name which aspect of the learning is asking for the most direct engagement.",
          "The study sequence turns at the center — that is where effort has the clearest return.",
        ],
        random,
      );
    case "spiritual":
      return choose(
        [
          "Guidance becomes something you can actually practice at the center of this sequence.",
          "Treat the pivot as the place where intuition needs grounding rather than intensity.",
          "The center of the sequence reveals which inner signal deserves your trust.",
          "Let the middle card show where the symbolic message wants to become lived.",
          "The pivot tells you where the spiritual question is asking to move from reflection into practice.",
          "Let the middle card name which aspect of the path is asking for genuine attention rather than assumption.",
          "The inner sequence turns at the center — that is where discernment becomes concrete.",
        ],
        random,
      );
    case "community":
      return choose(
        [
          "Your place in the wider field can be strengthened from the center outward.",
          "Treat the pivot as the point where belonging becomes practical rather than abstract.",
          "The center of the sequence reveals which shared space most needs your attention.",
          "Let the middle card show where participation would actually make a difference.",
          "The pivot tells you where the collective question is asking for the most direct engagement.",
          "Let the middle card name which aspect of community is asking to move from intention to action.",
          "The group story turns at the center — that is where showing up would carry the most weight.",
        ],
        random,
      );
    case "legal_admin":
      return choose(
        [
          "The process needs clarity, proof, or timing first, and the pivot shows where.",
          "Treat the pivot as the formal step that makes the rest of the matter workable.",
          "The center of the sequence reveals which document or decision point deserves attention now.",
          "Let the middle card show where procedure has to become precise.",
          "The pivot tells you where the formal process is asking for the most direct attention.",
          "Let the middle card name which procedural step would open what is currently blocked.",
          "The matter turns at the center — that is where the next concrete action sits.",
        ],
        random,
      );
    case "purpose_calling":
      return choose(
        [
          "Alignment has to become a real choice at the center, not just a hope.",
          "Treat the pivot as the place where vocation asks for something concrete from you.",
          "The center of the sequence reveals which part of the path still feels true in practice.",
          "Let the middle card show which choice would make the path feel more fully yours.",
          "The pivot tells you where the calling is asking to stop being abstract and become a real commitment.",
          "Let the middle card name which aspect of the path is asking for the most honest answer.",
          "The vocational story turns at the center — that is where intention has to become direction.",
        ],
        random,
      );
    default:
      break;
  }

  if (domain === "love") {
    return choose(
      [
        `Keep ${role} in view, because the middle card shows what the relationship needs next.`,
        `Let the pivot show what ${role} is asking of the connection now.`,
        `The middle card tells you where the bond can either deepen or harden, so keep ${role} in view.`,
        `Stay with the center of the sequence, because that is where ${role} becomes clearest.`,
        `The connection shifts at the center — and ${role} is the thread that decides which direction it moves.`,
        `What the relationship needs is not more feeling but a clearer response at the pivot, where ${role} does the most work.`,
      ],
      random,
    );
  }

  if (domain === "work") {
    return choose(
      [
        `Use the middle card as the place where ${role} can change the outcome most directly.`,
        `The pivot shows where ${role} matters more than the wider noise around it.`,
        `Keep the middle card in focus, because that is where ${role} can actually alter the sequence.`,
        `The center of the sequence shows where ${role} becomes practical rather than theoretical.`,
        `The professional picture shifts at the center — and ${role} is what makes the adjustment stick.`,
        `What moves the work forward is not more planning but a concrete response at the pivot, where ${role} has the most leverage.`,
      ],
      random,
    );
  }

  return choose(
    [
      `Keep ${role} in view, because the middle card is where the reading asks for movement.`,
      `What changes next depends most on ${role}, especially at the middle card.`,
      `The middle card is the adjustment point, and ${role} shows how to work with it.`,
      `Let ${role} stay in focus while you work with the pivot rather than the outcome.`,
      `The reading asks for a response at the center, and ${role} tells you what kind of response would count.`,
      `Strip away the noise and the sequence is about ${role} at the pivot — that is where the reading becomes actionable.`,
    ],
    random,
  );
}

function makeThreeCardSynthesis(input: {
  subjectId: SubjectId;
  domain: Domain;
  leftRef: string;
  rightRef: string;
  pairLine: string;
  random: () => number;
}): string {
  const { subjectId, domain, leftRef, rightRef, pairLine, random } = input;

  switch (subjectId) {
    case "general_reading":
      return choose(
        [
          `${leftRef} with ${rightRef} show where the broader pattern really turns: ${pairLine}.`,
          `What ties this short sequence together is the link between ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} and ${rightRef} give the reading its clearest inner logic, pointing to ${pairLine}.`,
          `The sequence makes most sense where ${leftRef} meets ${rightRef}: ${pairLine}.`,
          `Between ${leftRef} and ${rightRef}, the reading's core becomes legible: ${pairLine}.`,
          `Neither ${leftRef} nor ${rightRef} can be read alone — together they point to ${pairLine}.`,
          `${leftRef} beside ${rightRef} names where the weight of the sequence falls: ${pairLine}.`,
        ],
        random,
      );
    case "money":
      return choose(
        [
          `The money story turns where ${leftRef} meets ${rightRef}: ${pairLine}.`,
          `${leftRef} with ${rightRef} show the pressure point in the resource picture, pointing to ${pairLine}.`,
          `What matters most for the financial thread is the exchange between ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} and ${rightRef} reveal how the flow changes, and the message is ${pairLine}.`,
          `Between ${leftRef} and ${rightRef}, the real shape of the money situation emerges: ${pairLine}.`,
          `The financial sequence finds its sharpest signal in ${leftRef} with ${rightRef}: ${pairLine}.`,
          `${leftRef} beside ${rightRef} concentrates the resource question: ${pairLine}.`,
        ],
        random,
      );
    case "home_family":
      return choose(
        [
          `The home story gathers around ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} with ${rightRef} show the domestic pattern most clearly, pointing to ${pairLine}.`,
          `What binds the household sequence together is the link between ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} and ${rightRef} reveal the emotional logic under the home situation: ${pairLine}.`,
          `Between ${leftRef} and ${rightRef}, the household dynamic becomes most readable: ${pairLine}.`,
          `The domestic sequence finds its truest signal in ${leftRef} with ${rightRef}: ${pairLine}.`,
          `${leftRef} beside ${rightRef} concentrates the home question: ${pairLine}.`,
        ],
        random,
      );
    case "friends_social":
      return choose(
        [
          `The social thread is clearest where ${leftRef} meets ${rightRef}: ${pairLine}.`,
          `${leftRef} with ${rightRef} show what is really shaping the connection: ${pairLine}.`,
          `What ties the social pattern together is the exchange between ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} and ${rightRef} reveal the tone beneath the social situation, and it points to ${pairLine}.`,
          `Between ${leftRef} and ${rightRef}, the social dynamic finds its clearest shape: ${pairLine}.`,
          `The connection makes most sense through ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} beside ${rightRef} carries the sharpest social signal in this sequence: ${pairLine}.`,
        ],
        random,
      );
    case "personal_growth":
      return choose(
        [
          `The inner shift begins where ${leftRef} meets ${rightRef}: ${pairLine}.`,
          `${leftRef} with ${rightRef} show the pattern that matters most for growth right now: ${pairLine}.`,
          `What ties the inner sequence together is the link between ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} and ${rightRef} reveal the personal pattern under the whole reading: ${pairLine}.`,
          `Between ${leftRef} and ${rightRef}, the inner dynamic becomes most readable: ${pairLine}.`,
          `The growth sequence names itself most clearly through ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} beside ${rightRef} holds the weight of the personal question: ${pairLine}.`,
        ],
        random,
      );
    case "health":
      return choose(
        [
          `The wellbeing thread is clearest where ${leftRef} meets ${rightRef}: ${pairLine}.`,
          `${leftRef} with ${rightRef} show what your system is really responding to, and it points to ${pairLine}.`,
          `What ties the recovery story together is the link between ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} and ${rightRef} reveal the pressure pattern under the question of pace and support: ${pairLine}.`,
          `Between ${leftRef} and ${rightRef}, the wellbeing picture becomes most legible: ${pairLine}.`,
          `The recovery sequence finds its clearest signal in ${leftRef} with ${rightRef}: ${pairLine}.`,
          `${leftRef} beside ${rightRef} concentrates the health question: ${pairLine}.`,
        ],
        random,
      );
    case "pets":
      return choose(
        [
          `The clearest care signal sits between ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} with ${rightRef} show what is shaping the animal's comfort most clearly: ${pairLine}.`,
          `What ties the care picture together is the link between ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} and ${rightRef} reveal the practical tone of the animal's situation: ${pairLine}.`,
          `Between ${leftRef} and ${rightRef}, the care picture becomes most readable: ${pairLine}.`,
          `The animal's situation makes most sense through ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} beside ${rightRef} carries the clearest signal for the care question: ${pairLine}.`,
        ],
        random,
      );
    case "creative":
      return choose(
        [
          `The creative thread sharpens where ${leftRef} meets ${rightRef}: ${pairLine}.`,
          `${leftRef} with ${rightRef} show what the work is asking for next, and it points to ${pairLine}.`,
          `What ties the making process together is the exchange between ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} and ${rightRef} reveal the deeper movement in the project: ${pairLine}.`,
          `Between ${leftRef} and ${rightRef}, the creative dynamic becomes most legible: ${pairLine}.`,
          `The making process names itself most clearly through ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} beside ${rightRef} holds the weight of the creative question: ${pairLine}.`,
        ],
        random,
      );
    case "travel":
      return choose(
        [
          `The journey becomes clearest where ${leftRef} meets ${rightRef}: ${pairLine}.`,
          `${leftRef} with ${rightRef} show the travel thread that matters most now: ${pairLine}.`,
          `What ties the route together is the link between ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} and ${rightRef} reveal the practical logic under the trip: ${pairLine}.`,
          `Between ${leftRef} and ${rightRef}, the journey becomes most readable: ${pairLine}.`,
          `The travel sequence finds its clearest signal in ${leftRef} with ${rightRef}: ${pairLine}.`,
          `${leftRef} beside ${rightRef} concentrates the question about the road ahead: ${pairLine}.`,
        ],
        random,
      );
    case "education":
      return choose(
        [
          `The learning pattern is clearest where ${leftRef} meets ${rightRef}: ${pairLine}.`,
          `${leftRef} with ${rightRef} show what most shapes the study path now: ${pairLine}.`,
          `What ties the learning sequence together is the link between ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} and ${rightRef} reveal the practical logic under the study process: ${pairLine}.`,
          `Between ${leftRef} and ${rightRef}, the learning picture becomes most legible: ${pairLine}.`,
          `The study sequence names itself most clearly through ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} beside ${rightRef} carries the sharpest signal for the learning question: ${pairLine}.`,
        ],
        random,
      );
    case "spiritual":
      return choose(
        [
          `The deeper message gathers where ${leftRef} meets ${rightRef}: ${pairLine}.`,
          `${leftRef} with ${rightRef} show the symbolic thread most clearly, and it points to ${pairLine}.`,
          `What ties the spiritual pattern together is the link between ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} and ${rightRef} reveal the quieter guidance under the question: ${pairLine}.`,
          `Between ${leftRef} and ${rightRef}, the spiritual thread becomes most readable: ${pairLine}.`,
          `The path's deepest guidance arrives through ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} beside ${rightRef} holds the weight of the inner question: ${pairLine}.`,
        ],
        random,
      );
    case "community":
      return choose(
        [
          `The collective thread sharpens where ${leftRef} meets ${rightRef}: ${pairLine}.`,
          `${leftRef} with ${rightRef} show what most shapes your place in the wider field: ${pairLine}.`,
          `What ties the community pattern together is the link between ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} and ${rightRef} reveal the shared dynamic under the whole sequence: ${pairLine}.`,
          `Between ${leftRef} and ${rightRef}, the group dynamic becomes most legible: ${pairLine}.`,
          `The collective sequence names itself most clearly through ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} beside ${rightRef} carries the sharpest signal for the community question: ${pairLine}.`,
        ],
        random,
      );
    case "legal_admin":
      return choose(
        [
          `The procedural thread is clearest where ${leftRef} meets ${rightRef}: ${pairLine}.`,
          `${leftRef} with ${rightRef} show the formal pressure point in the matter: ${pairLine}.`,
          `What ties the process together is the link between ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} and ${rightRef} reveal what is really driving the paperwork or decision path: ${pairLine}.`,
          `Between ${leftRef} and ${rightRef}, the formal picture becomes most readable: ${pairLine}.`,
          `The process sequence finds its clearest signal in ${leftRef} with ${rightRef}: ${pairLine}.`,
          `${leftRef} beside ${rightRef} concentrates the practical question in the matter: ${pairLine}.`,
        ],
        random,
      );
    case "purpose_calling":
      return choose(
        [
          `The path becomes clearest where ${leftRef} meets ${rightRef}: ${pairLine}.`,
          `${leftRef} with ${rightRef} show what most shapes the question of calling: ${pairLine}.`,
          `What ties the vocational pattern together is the link between ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} and ${rightRef} reveal the deeper logic of the path, and it points to ${pairLine}.`,
          `Between ${leftRef} and ${rightRef}, the vocational thread becomes most legible: ${pairLine}.`,
          `The calling sequence names itself most clearly through ${leftRef} and ${rightRef}: ${pairLine}.`,
          `${leftRef} beside ${rightRef} holds the weight of the path question: ${pairLine}.`,
        ],
        random,
      );
    default:
      break;
  }

  if (domain === "love") {
    return choose(
      [
        `The relationship thread is clearest where ${leftRef} meets ${rightRef}: ${pairLine}.`,
        `${leftRef} with ${rightRef} show what emotionally ties this sequence together: ${pairLine}.`,
        `What binds the relationship pattern together is the link between ${leftRef} and ${rightRef}: ${pairLine}.`,
        `${leftRef} and ${rightRef} reveal the emotional logic under the whole sequence: ${pairLine}.`,
        `Between ${leftRef} and ${rightRef}, the relationship finds its clearest shape: ${pairLine}.`,
        `The love sequence names itself most clearly through ${leftRef} and ${rightRef}: ${pairLine}.`,
        `${leftRef} beside ${rightRef} carries the sharpest emotional signal here: ${pairLine}.`,
      ],
      random,
    );
  }

  if (domain === "work") {
    return choose(
      [
        `The practical thread is clearest where ${leftRef} meets ${rightRef}: ${pairLine}.`,
        `${leftRef} with ${rightRef} show what most shapes the work pattern: ${pairLine}.`,
        `What ties the professional sequence together is the link between ${leftRef} and ${rightRef}: ${pairLine}.`,
        `${leftRef} and ${rightRef} reveal the practical logic under the situation: ${pairLine}.`,
        `Between ${leftRef} and ${rightRef}, the work picture becomes most legible: ${pairLine}.`,
        `The professional sequence finds its truest signal in ${leftRef} with ${rightRef}: ${pairLine}.`,
        `${leftRef} beside ${rightRef} concentrates the practical thread: ${pairLine}.`,
      ],
      random,
    );
  }

  return choose(
    [
      `${leftRef} with ${rightRef} suggests ${pairLine}.`,
      `What ties the sequence together is ${leftRef} with ${rightRef}: ${pairLine}.`,
      `${leftRef} and ${rightRef} carry the strongest undercurrent here, suggesting ${pairLine}.`,
      `The sequence leans most heavily on ${leftRef} with ${rightRef}, pointing to ${pairLine}.`,
      `The truest part of the sequence sits between ${leftRef} and ${rightRef}: ${pairLine}.`,
      `${leftRef} beside ${rightRef} gives the sequence its clearest emotional logic: ${pairLine}.`,
    ],
    random,
  );
}

function buildThemeLensSummary(themeOverlay: ReturnType<typeof resolveThemeForReading>): string {
  const lens = themeOverlay.resolvedThemeLabel ?? "General";
  return `with ${indefiniteArticleFor(lens)} ${lens.toLowerCase()} emphasis`;
}

function generateGTSections(context: NarrativeSeedContext, random: () => number): QuickCompositionResult {
  const { state, domain, subjectId, resolvedThemeId } = context;
  const gtLayout = state.setup.gtLayout ?? "4x9";
  const layout = buildGrandTableauLayout(state.layout, gtLayout);
  const mode = state.setup.significatorMode;
  const { primaryPos, candidates: pairCandidates } = buildGrandTableauPairCandidates(layout, mode, gtLayout);
  const primaryPlacement = layout.find((item) => item.position === primaryPos) ?? layout[0];
  const primaryCard = getCardMeaning(primaryPlacement.cardId);
  const primaryHouse = getHouseMeaning(primaryPlacement.houseId);

  const diagonalNWSE = getDiagonalLine(primaryPos, "nwse", gtLayout);
  const diagonalNESW = getDiagonalLine(primaryPos, "nesw", gtLayout);
  const knights = getKnightPositions(primaryPos, gtLayout);
  const proximity = getProximityBuckets(primaryPos, layout, gtLayout);

  const diagonalCardsA = diagonalNWSE.map((position) => layout.find((item) => item.position === position)).filter(isDefined);
  const diagonalCardsB = diagonalNESW.map((position) => layout.find((item) => item.position === position)).filter(isDefined);
  const knightCards = knights.map((position) => layout.find((item) => item.position === position)).filter(isDefined);
  const selectedPair = selectBestPair(pairCandidates, domain, random, subjectId);
  const phraseTracker = createPhraseUsageTracker();

  const houseName = formatHouseName(primaryHouse.name);
  const primaryFocusPhrase = lowerFirst(buildCardAssociationPhrase(primaryCard, subjectId, domain, random));
  const primaryDomainClause = normalizeMeaningThatClause(primaryCard.domainVariants[domain]);
  const centerBridgeSentence = buildQuickCenterBridgeSentence(primaryCard.id, primaryDomainClause, random, phraseTracker);
  const overlaySentence = buildOverlayAssociationSentence({
    card: primaryCard,
    house: primaryHouse,
    subjectId,
    domain,
    random,
  });

  const centerSentence = chooseAvoidingRecent(
    [
      template("gt.center.frame.house_hold.01", "gt.center.frame.house", () => `${houseName} now holds ${cardRef(primaryPlacement.cardId)}, which puts ${primaryFocusPhrase} at the center of the reading. ${centerBridgeSentence} ${overlaySentence}`),
      template("gt.center.frame.centered.01", "gt.center.frame.centered", () => `${cardRef(primaryPlacement.cardId)} falls in ${houseName} at the reading's center. That keeps ${primaryFocusPhrase} close to everything else that is happening. ${centerBridgeSentence} ${overlaySentence}`),
      template("gt.center.frame.focus.01", "gt.center.frame.focus", () => `${houseName} holds ${cardRef(primaryPlacement.cardId)}, keeping ${primaryFocusPhrase} in focus. ${centerBridgeSentence} ${overlaySentence}`),
      template("gt.center.frame.foreground.01", "gt.center.frame.foreground", () => `${houseName} centers ${cardRef(primaryPlacement.cardId)} here. This keeps ${primaryFocusPhrase} in the foreground. ${centerBridgeSentence} ${overlaySentence}`),
      template("gt.center.frame.focal.01", "gt.center.frame.focal", () => `One clear focal point is ${cardRef(primaryPlacement.cardId)} in ${houseName}. It brings ${primaryFocusPhrase} to the foreground. ${centerBridgeSentence} ${overlaySentence}`),
      template("gt.center.frame.anchor.01", "gt.center.frame.anchor", () => `${cardRef(primaryPlacement.cardId)} in ${houseName} becomes the main anchor here, putting ${primaryFocusPhrase} under the strongest light. ${centerBridgeSentence} ${overlaySentence}`),
    ],
    undefined,
    phraseTracker,
    random,
  );
  const centerThemeSentence = buildThemeCardSentence(resolvedThemeId, primaryCard.id, primaryCard.name, "center", random);
  const centerSentenceWithTheme = [centerSentence, centerThemeSentence].filter(Boolean).join(" ");

  const pairSentence = selectedPair
    ? (() => {
        const quickPairMeaning = humanizeQuickPairMeaning(selectedPair.meaning);
        return chooseAvoidingRecent(
          [
            template("gt.pair.frame.points.01", "gt.pair.frame.points", () => `${cardRef(selectedPair.cardA)} with ${cardRef(selectedPair.cardB)} points to ${quickPairMeaning}. ${buildPairAssociationSentence({
              cardA: selectedPair.cardA,
              cardB: selectedPair.cardB,
              subjectId,
              domain,
              random,
            })}`),
            template("gt.pair.frame.closest.01", "gt.pair.frame.closest", () => `${cardRef(selectedPair.cardA)} and ${cardRef(selectedPair.cardB)} make the closest central pair, pointing to ${quickPairMeaning}. ${buildPairAssociationSentence({
              cardA: selectedPair.cardA,
              cardB: selectedPair.cardB,
              subjectId,
              domain,
              random,
            })}`),
            template("gt.pair.frame.combination.01", "gt.pair.frame.combination", () => `${cardRef(selectedPair.cardA)} and ${cardRef(selectedPair.cardB)} sit close together, and the combination points to ${quickPairMeaning}. ${buildPairAssociationSentence({
              cardA: selectedPair.cardA,
              cardB: selectedPair.cardB,
              subjectId,
              domain,
              random,
            })}`),
            template("gt.pair.frame.near.01", "gt.pair.frame.near", () => `Near the center, ${cardRef(selectedPair.cardA)} with ${cardRef(selectedPair.cardB)} points to ${quickPairMeaning}. ${buildPairAssociationSentence({
              cardA: selectedPair.cardA,
              cardB: selectedPair.cardB,
              subjectId,
              domain,
              random,
            })}`),
            template("gt.pair.frame.sharpens.01", "gt.pair.frame.sharpens", () => `${cardRef(selectedPair.cardA)} beside ${cardRef(selectedPair.cardB)} sharpens the reading around ${quickPairMeaning}. ${buildPairAssociationSentence({
              cardA: selectedPair.cardA,
              cardB: selectedPair.cardB,
              subjectId,
              domain,
              random,
            })}`),
            template("gt.pair.frame.hinge.01", "gt.pair.frame.hinge", () => `The nearest hinge sits between ${cardRef(selectedPair.cardA)} and ${cardRef(selectedPair.cardB)}, pointing to ${quickPairMeaning}. ${buildPairAssociationSentence({
              cardA: selectedPair.cardA,
              cardB: selectedPair.cardB,
              subjectId,
              domain,
              random,
            })}`),
            template("gt.pair.frame.tension.01", "gt.pair.frame.tension", () => `Together, ${cardRef(selectedPair.cardA)} and ${cardRef(selectedPair.cardB)} make the central tension easier to name: ${quickPairMeaning}. ${buildPairAssociationSentence({
              cardA: selectedPair.cardA,
              cardB: selectedPair.cardB,
              subjectId,
              domain,
              random,
            })}`),
          ],
          undefined,
          phraseTracker,
          random,
        );
      })()
    : chooseAvoidingRecent(
        [
          template("gt.pair.none.pattern.01", "gt.pair.none.pattern", "No single nearby pair dominates, so meaning depends more on overall pattern than one isolated combination."),
          template("gt.pair.none.distributed.01", "gt.pair.none.distributed", "The cards near the center spread their influence broadly rather than concentrating in one strong pairing."),
          template("gt.pair.none.even_weight.01", "gt.pair.none.even_weight", "Without a dominant pairing near the center, the reading distributes its weight more evenly across the field."),
          template("gt.pair.none.atmosphere.01", "gt.pair.none.atmosphere", "The nearby cards do not lock into one strong combination, so the reading is shaped by proximity and atmosphere rather than a single pair."),
          template("gt.pair.none.broader_field.01", "gt.pair.none.broader_field", "No single pairing commands the center, which means the broader spread of surrounding influences carries more weight than usual."),
          template("gt.pair.none.open_field.01", "gt.pair.none.open_field", "The lack of a dominant pair near the center keeps the reading open — the pattern emerges from the wider field rather than one concentrated signal."),
        ],
        undefined,
        phraseTracker,
        random,
      );

  const diagonalCardsAIds = diagonalCardsA.map((placement) => placement.cardId);
  const diagonalCardsBIds = diagonalCardsB.map((placement) => placement.cardId);
  const diagonalASet = new Set(diagonalCardsAIds);
  const diagonalCardsBUniqueIds = diagonalCardsBIds.filter((cardId) => !diagonalASet.has(cardId));
  const knightCardIds = knightCards.map((placement) => placement.cardId);
  const diagonalsBriefA = dedupeCardRefs(diagonalCardsAIds, 4);
  const diagonalsBriefB = dedupeCardRefs(diagonalCardsBUniqueIds, 4);
  const knightBrief = dedupeCardRefs(knightCardIds, 4);
  const diagonalThread = naturalJoin([diagonalsBriefA, diagonalsBriefB].filter(Boolean));
  const tableauSynthesis = synthesizeGrandTableauNarrative({
    layout,
    focusPosition: primaryPos,
    gtLayout,
    subjectId,
    domain,
    random,
  });
  const backgroundConnector = chooseAvoidingRecent(
    [
      template("gt.background.connector.beneath.01", "gt.background.connector.beneath", "Beneath that first layer,"),
      template("gt.background.connector.underneath.01", "gt.background.connector.underneath", "Below that first visible layer,"),
      template("gt.background.connector.headline.01", "gt.background.connector.headline", "Looking past the headline cards,"),
      template("gt.background.connector.behind.01", "gt.background.connector.behind", "Behind the central impression,"),
      template("gt.background.connector.surface.01", "gt.background.connector.surface", "Beyond the surface reading,"),
      template("gt.background.connector.first_impression.01", "gt.background.connector.first_impression", "Stepping past the first impression,"),
      template("gt.background.connector.further.01", "gt.background.connector.further", "Further into the spread,"),
      template("gt.background.connector.opening.01", "gt.background.connector.opening", "Past the opening layer,"),
      template("gt.background.connector.pressure.01", "gt.background.connector.pressure", "Below the most visible pressure,"),
      template("gt.background.connector.center.01", "gt.background.connector.center", "Underneath what the center card announces,"),
    ],
    undefined,
    phraseTracker,
    random,
  );
  const backgroundSentence =
    knightCards.length > 0
      ? `${tableauSynthesis.atmosphereSentence} ${backgroundConnector} ${chooseAvoidingRecent(
          [
            template("gt.background.knight.setup.thread.01", "gt.background.knight.setup.thread", () => `a longer thread runs through ${diagonalThread}, while side links around ${knightBrief} show the story developing in stages.`),
            template("gt.background.knight.setup.timing.01", "gt.background.knight.setup.timing", () => `the diagonals run through ${diagonalThread}, while ${knightBrief} tighten the timing around that longer movement.`),
            template("gt.background.knight.setup.pace.01", "gt.background.knight.setup.pace", () => `${diagonalThread} read as a slow build, while ${knightBrief} show where the pace changes.`),
            template("gt.background.knight.setup.motion.01", "gt.background.knight.setup.motion", () => `the wider motion runs through ${diagonalThread}; off-angle links to ${knightBrief} show results arriving step by step.`),
            template("gt.background.knight.setup.rhythm.01", "gt.background.knight.setup.rhythm", () => `a quieter layer runs through ${diagonalThread}, while ${knightBrief} show where the rhythm starts to shift.`),
          ],
          undefined,
          phraseTracker,
          random,
        )} ${chooseAvoidingRecent(
          [
            template("gt.background.knight.meaning.direction.01", "gt.background.knight.meaning.direction", "Read as a whole, the diagonals show the underlying direction of travel while the knight links name the points where smaller factors can interrupt, accelerate, or redirect it — the slower line of development rather than the headline turn of events."),
            template("gt.background.knight.meaning.arc.01", "gt.background.knight.meaning.arc", "The diagonals trace the longer arc of the story, and the knight connections show where indirect forces can alter the pace or redirect the outcome."),
            template("gt.background.knight.meaning.current.01", "gt.background.knight.meaning.current", "Taken together, the diagonals name the deeper current while the knight links mark where that current gets redirected, reinforced, or quietly interrupted."),
            template("gt.background.knight.meaning.complication.01", "gt.background.knight.meaning.complication", "The diagonal layer holds the longer arc while the knight links name the off-angle points where that arc gets complicated, extended, or quietly redirected."),
            template("gt.background.knight.meaning.reinforce.01", "gt.background.knight.meaning.reinforce", "A slow current runs through the diagonals; the knight connections are where it gets interrupted, redirected, or quietly reinforced."),
            template("gt.background.knight.meaning.test.01", "gt.background.knight.meaning.test", () => `${diagonalThread} set the longer direction, while the knight links around ${knightBrief} show where that direction gets tested, bent, or quietly confirmed.`),
            template("gt.background.knight.meaning.outside_forces.01", "gt.background.knight.meaning.outside_forces", "The diagonal layer describes what builds by accumulation, while the knight connections show the junctures where outside forces enter that buildup."),
            template("gt.background.knight.meaning.causation.01", "gt.background.knight.meaning.causation", "What the two layers share is a quieter kind of causation — the diagonals show the direction and the knight links show the knock-on effects that complicate or extend it."),
            template("gt.background.knight.meaning.compress.01", "gt.background.knight.meaning.compress", () => `Because ${diagonalThread} carry the background line, the links around ${knightBrief} show where that line compresses, stretches, or changes direction.`),
            template("gt.background.knight.meaning.side_pressure.01", "gt.background.knight.meaning.side_pressure", () => `The long thread belongs to ${diagonalThread}; ${knightBrief} mark the side pressures that can speed it up, slow it down, or send it slightly off course.`),
            template("gt.background.knight.meaning.adjust.01", "gt.background.knight.meaning.adjust", () => `The background timing is not flat here: ${diagonalThread} show what keeps developing, while ${knightBrief} show where that development has to adjust.`),
            template("gt.background.knight.meaning.complement.01", "gt.background.knight.meaning.complement", "The two layers complement each other — the diagonals describe what builds slowly, and the knight connections show the moments where that slow build is suddenly accelerated, diverted, or confirmed."),
          ],
          undefined,
          phraseTracker,
          random,
        )}`
      : `${tableauSynthesis.atmosphereSentence} ${backgroundConnector} ${chooseAvoidingRecent(
          [
            template("gt.background.diagonal.setup.pattern.01", "gt.background.diagonal.setup.pattern", () => `a quieter pattern runs through ${diagonalThread}, pointing to movement by stages rather than abrupt change.`),
            template("gt.background.diagonal.setup.gradual.01", "gt.background.diagonal.setup.gradual", () => `${diagonalThread} suggest progress that gathers gradually once the separate threads are read together.`),
            template("gt.background.diagonal.setup.slow_build.01", "gt.background.diagonal.setup.slow_build", () => `the diagonal frame linking ${diagonalThread} implies a slow build rather than a dramatic turn.`),
            template("gt.background.diagonal.setup.sequence.01", "gt.background.diagonal.setup.sequence", () => `${diagonalThread} carry the wider story, and they favor sequence over sudden swings.`),
          ],
          undefined,
          phraseTracker,
          random,
        )} ${chooseAvoidingRecent(
          [
            template("gt.background.diagonal.meaning.long_range.01", "gt.background.diagonal.meaning.long_range", "Read together, the diagonals are doing the longer-range work here, showing what gathers by stages rather than arriving all at once. Taken together, this is the slower line of development, and it shows what needs time to assemble before the full picture can be read clearly."),
            template("gt.background.diagonal.meaning.quiet_timeline.01", "gt.background.diagonal.meaning.quiet_timeline", "The diagonal thread describes the quieter timeline — what builds gradually rather than announcing itself. This is the part of the reading that rewards patience."),
            template("gt.background.diagonal.meaning.slower_current.01", "gt.background.diagonal.meaning.slower_current", "What the diagonals reveal is the slower current beneath the surface. These are not headline events but the conditions that are quietly assembling before the next visible shift."),
            template("gt.background.diagonal.meaning.long_game.01", "gt.background.diagonal.meaning.long_game", "The diagonal arc is the long game — what is accumulating underneath the immediate picture and will become decisive once enough time has passed."),
            template("gt.background.diagonal.meaning.in_motion.01", "gt.background.diagonal.meaning.in_motion", "Taken together, the diagonal connections describe what is not yet visible but already in motion — the quiet thread that will eventually define the outcome."),
          ],
          undefined,
          phraseTracker,
          random,
        )}`;

  const nearBrief = dedupeCardRefs(proximity.near.map((placement) => placement.cardId), 4);
  const mediumBrief = dedupeCardRefs(proximity.medium.map((placement) => placement.cardId), 4);
  const timingConnector = chooseAvoidingRecent(
    [
      template("gt.timing.connector.timing.01", "gt.timing.connector.timing", "In terms of timing,"),
      template("gt.timing.connector.sequence_pressure.01", "gt.timing.connector.sequence_pressure", "Looking at the sequence of pressure,"),
      template("gt.timing.connector.pace.01", "gt.timing.connector.pace", "As the pace of events goes,"),
      template("gt.timing.connector.first.01", "gt.timing.connector.first", "When it comes to what arrives first,"),
      template("gt.timing.connector.pace_question.01", "gt.timing.connector.pace_question", "On the question of pace,"),
      template("gt.timing.connector.arrives_when.01", "gt.timing.connector.arrives_when", "Looking at what arrives when,"),
      template("gt.timing.connector.order.01", "gt.timing.connector.order", "Considering the order of events,"),
      template("gt.timing.connector.unfolds.01", "gt.timing.connector.unfolds", "For the sequence of what unfolds,"),
    ],
    undefined,
    phraseTracker,
    random,
  );
  const timingSentence = `${timingConnector} ${chooseAvoidingRecent(
    [
      template("gt.timing.setup.immediate.01", "gt.timing.setup.immediate", () => `${nearBrief} describe what is immediate, while ${mediumBrief || "the next ring of cards"} shape what follows.`),
      template("gt.timing.setup.first_pressure.01", "gt.timing.setup.first_pressure", () => `the first pressure sits with ${nearBrief}; ${mediumBrief || "the cards further out"} show the layer that forms just behind it.`),
      template("gt.timing.setup.near_field.01", "gt.timing.setup.near_field", () => `the near field, ${nearBrief}, speaks to current pressure, and ${mediumBrief || "the outer field"} helps show what gathers next.`),
      template("gt.timing.setup.present_tense.01", "gt.timing.setup.present_tense", () => `${nearBrief} read as present-tense influence, and ${mediumBrief || "the broader field"} as the sequence forming right behind it.`),
      template("gt.timing.setup.immediate_turn.01", "gt.timing.setup.immediate_turn", () => `${nearBrief} belong to the immediate turn of events, while ${mediumBrief || "the outer field"} describe what is still gathering.`),
      template("gt.timing.setup.speak_first.01", "gt.timing.setup.speak_first", () => `${nearBrief} speak first; ${mediumBrief || "the next layer out"} describe what follows after.`),
    ],
    undefined,
    phraseTracker,
    random,
  )} ${mediumBrief
    ? chooseAvoidingRecent(
        [
          template("gt.timing.meaning.split.01", "gt.timing.meaning.split", "That split matters because the near field describes what is already pressing for attention, while the next ring shows what is forming just behind it."),
          template("gt.timing.meaning.forming.01", "gt.timing.meaning.forming", "What presses first sits with the near cards; the medium ring holds what is already forming but not yet fully visible."),
          template("gt.timing.meaning.conditions.01", "gt.timing.meaning.conditions", "What is closest demands attention first, but the next ring out is already shaping the conditions those decisions will land in."),
          template("gt.timing.meaning.different_layers.01", "gt.timing.meaning.different_layers", "Near and medium cards are not the same story — the first layer is already active, while the second is still forming its shape."),
          template("gt.timing.meaning.response_now.01", "gt.timing.meaning.response_now", "That distinction is important: the near field names what requires a response now, and the medium field names what is becoming the next thing to manage."),
          template("gt.timing.meaning.timescales.01", "gt.timing.meaning.timescales", "The two rings describe different timescales: what is asking for a response now, and what is quietly becoming the next chapter."),
          template("gt.timing.meaning.proximity.01", "gt.timing.meaning.proximity", "Proximity matters here — the closest cards are active and current; the next ring is gathering but not yet pressing."),
          template("gt.timing.meaning.motion.01", "gt.timing.meaning.motion", "The near field is already in motion; the medium ring is what that motion will soon run into."),
        ],
        undefined,
        phraseTracker,
        random,
      )
    : chooseAvoidingRecent(
        [
          template("gt.timing.meaning.sparse_pressing.01", "gt.timing.meaning.sparse_pressing", "That split matters because the near field describes what is already pressing for attention, even if the outer layer has not clarified itself yet."),
          template("gt.timing.meaning.sparse_signal.01", "gt.timing.meaning.sparse_signal", "The immediate cards carry the clearest signal; what lies further out has not yet gathered enough weight to read with confidence."),
          template("gt.timing.meaning.sparse_closest.01", "gt.timing.meaning.sparse_closest", "The nearest cards speak most clearly — the outer field is still forming, so the timing picture concentrates around what is closest."),
          template("gt.timing.meaning.sparse_weight.01", "gt.timing.meaning.sparse_weight", "When the medium field is sparse, the near cards carry more weight than usual — they are doing most of the timing work here."),
          template("gt.timing.meaning.sparse_readable.01", "gt.timing.meaning.sparse_readable", "The near field is readable and pressing; the outer layer has not yet solidified, so this reading works most confidently from what is closest."),
        ],
        undefined,
        phraseTracker,
        random,
      )}`;

  const synthesisSentence = `${tableauSynthesis.practicalSentence} ${tableauSynthesis.openingsSentence} ${tableauSynthesis.thesisSentence}`;

  const sections: NarrativeSection[] = [
    buildSection("center", pickSectionTitle("center", random), "house", centerSentenceWithTheme),
    buildSection("pair", pickSectionTitle("pair", random), "pair", pairSentence),
    buildSection("background", pickSectionTitle("background", random), "diagonal", backgroundSentence),
    buildSection("timing", pickSectionTitle("timing", random), "proximity", timingSentence),
  ];

  let cartouchePairKey: string | null = null;
  if (gtLayout === "4x8+4") {
    const cartouche = getCartouchePlacements(layout);
    if (cartouche.length === 4) {
      const cartoucheCardIds = cartouche.map((placement) => placement.cardId);
      const cartoucheFirstCard = getCardMeaning(cartoucheCardIds[0]);
      const cartoucheLastCard = getCardMeaning(cartoucheCardIds[cartoucheCardIds.length - 1]);
      const cartouchePairs: Array<{ cardA: number; cardB: number; proximityBias: number }> = [];

      for (let i = 0; i < cartoucheCardIds.length - 1; i += 1) {
        cartouchePairs.push({
          cardA: cartoucheCardIds[i],
          cardB: cartoucheCardIds[i + 1],
          proximityBias: 2.6 - i * 0.35,
        });
      }

      const cartouchePair = selectBestPair(cartouchePairs, domain, random, subjectId);
      cartouchePairKey = cartouchePair?.key ?? null;
      const cartoucheSentenceA = chooseAvoidingRecent(
        [
          template("gt.cartouche.setup.closes.01", "gt.cartouche.setup.closes", () => `The cartouche closes with ${dedupeCardRefs(cartoucheCardIds, 4)}, setting the wrap-up tone after the main field speaks.`),
          template("gt.cartouche.setup.final_line.01", "gt.cartouche.setup.final_line", () => `As a final line, the cartouche shows ${dedupeCardRefs(cartoucheCardIds, 4)}, clarifying what settles after the first wave.`),
          template("gt.cartouche.setup.wrap_up.01", "gt.cartouche.setup.wrap_up", () => `The wrap-up line in cartouche form carries ${dedupeCardRefs(cartoucheCardIds, 4)}, which reads as the spread's closing movement.`),
          template("gt.cartouche.setup.below_grid.01", "gt.cartouche.setup.below_grid", () => `Below the main grid, the cartouche holds ${dedupeCardRefs(cartoucheCardIds, 4)}, adding a final layer to the reading.`),
          template("gt.cartouche.setup.fate_line.01", "gt.cartouche.setup.fate_line", () => `The fate line at the bottom — ${dedupeCardRefs(cartoucheCardIds, 4)} — describes what lingers after the main action settles.`),
          template("gt.cartouche.setup.last_word.01", "gt.cartouche.setup.last_word", () => `Closing the layout, ${dedupeCardRefs(cartoucheCardIds, 4)} form the cartouche row and carry the reading's last word.`),
        ],
        undefined,
        phraseTracker,
        random,
      );
      const cartoucheSentenceB = cartouchePair
        ? chooseAvoidingRecent(
            [
              template("gt.cartouche.pair.points.01", "gt.cartouche.pair.points", () => `${cardRef(cartouchePair.cardA)} with ${cardRef(cartouchePair.cardB)} points to ${pairMeaningToProse(cartouchePair.meaning)}.`),
              template("gt.cartouche.pair.within.01", "gt.cartouche.pair.within", () => `Within that line, ${cardRef(cartouchePair.cardA)} and ${cardRef(cartouchePair.cardB)} suggest ${pairMeaningToProse(
                cartouchePair.meaning,
              )}.`),
              template("gt.cartouche.pair.strongest.01", "gt.cartouche.pair.strongest", () => `The strongest link in the cartouche is ${cardRef(cartouchePair.cardA)} beside ${cardRef(cartouchePair.cardB)}: ${pairMeaningToProse(cartouchePair.meaning)}.`),
              template("gt.cartouche.pair.concentrate.01", "gt.cartouche.pair.concentrate", () => `${cardRef(cartouchePair.cardA)} and ${cardRef(cartouchePair.cardB)} concentrate the cartouche's meaning around ${pairMeaningToProse(cartouchePair.meaning)}.`),
            ],
            undefined,
            phraseTracker,
            random,
          )
        : `${cardRef(cartoucheFirstCard.id)} and ${cardRef(cartoucheLastCard.id)} frame a closing shift from ${lowerFirst(
            clause(cartoucheFirstCard.keywords[0]),
          )} toward ${lowerFirst(clause(cartoucheLastCard.keywords[0]))}.`;
      const cartoucheSentenceC = chooseAvoidingRecent(
        [
          template("gt.cartouche.coda.pacing.01", "gt.cartouche.coda.pacing", () => `Read alongside ${cardRef(primaryPlacement.cardId)} at the heart of the spread, this closing line suggests outcomes settle through pacing rather than pressure.`),
          template("gt.cartouche.coda.consequence.01", "gt.cartouche.coda.consequence", () => `Coming back to ${cardRef(primaryPlacement.cardId)}, the final line points to consequences that arrive once choices have been sustained.`),
          template("gt.cartouche.coda.remains.01", "gt.cartouche.coda.remains", () => `With ${cardRef(primaryPlacement.cardId)} still holding the center, the cartouche reads as what remains once the immediate tension clears.`),
          template("gt.cartouche.coda.follow_through.01", "gt.cartouche.coda.follow_through", () => `${cardRef(primaryPlacement.cardId)} anchors the reading, and this closing line shows what becomes available once its lesson is followed through.`),
          template("gt.cartouche.coda.resolves.01", "gt.cartouche.coda.resolves", () => `The cartouche adds a coda to ${cardRef(primaryPlacement.cardId)}'s central message, showing where the sequence naturally resolves.`),
          template("gt.cartouche.coda.sustained.01", "gt.cartouche.coda.sustained", () => `Taken with ${cardRef(primaryPlacement.cardId)} at the center, this final row suggests that outcomes arrive through sustained attention rather than a single decisive moment.`),
        ],
        undefined,
        phraseTracker,
        random,
      );

      sections.push(buildSection("cartouche", pickSectionTitle("cartouche", random), "timeline", `${cartoucheSentenceA} ${cartoucheSentenceB} ${cartoucheSentenceC}`));
    }
  }

  const themeBridge = buildThemeSectionBridge(resolvedThemeId, random);
  sections.push(
    buildSection("synthesis", pickSectionTitle("synthesis", random), "synthesis", [synthesisSentence, themeBridge].filter(Boolean).join(" ")),
  );

  const conclusionActionCard = primaryCard.id === 28 || primaryCard.id === 29 ? getCardMeaning(primaryHouse.id) : primaryCard;
  const conclusionActionRef = cardRef(conclusionActionCard.id);
  const conclusionHouseName = formatHouseName(primaryHouse.name);
  const conclusionBridge = chooseAvoidingRecent(
    [
      template("gt.conclusion.bridge.reflect.01", "gt.conclusion.bridge.reflect", () => `${conclusionActionRef} in ${conclusionHouseName} is the place worth reflecting on first.`),
      template("gt.conclusion.bridge.practical.01", "gt.conclusion.bridge.practical", () => `The practical thread runs through ${conclusionActionRef} in ${conclusionHouseName}.`),
      template("gt.conclusion.bridge.response.01", "gt.conclusion.bridge.response", () => `A direct response would land first with ${conclusionActionRef} in ${conclusionHouseName}.`),
      template("gt.conclusion.bridge.concentrates.01", "gt.conclusion.bridge.concentrates", () => `That picture concentrates around ${conclusionActionRef} in ${conclusionHouseName} more than anywhere else.`),
      template("gt.conclusion.bridge.weight.01", "gt.conclusion.bridge.weight", () => `${conclusionActionRef} in ${conclusionHouseName} carries the practical weight, so action counts there first.`),
      template("gt.conclusion.bridge.signal.01", "gt.conclusion.bridge.signal", () => `The strongest signal gathers around ${conclusionActionRef} in ${conclusionHouseName}.`),
      template("gt.conclusion.bridge.converge.01", "gt.conclusion.bridge.converge", () => `The cards converge on ${conclusionActionRef} in ${conclusionHouseName} more clearly than anywhere else.`),
      template("gt.conclusion.bridge.concrete.01", "gt.conclusion.bridge.concrete", () => `${conclusionActionRef} in ${conclusionHouseName} is where the reading asks for something concrete.`),
      template("gt.conclusion.bridge.actionable.01", "gt.conclusion.bridge.actionable", () => `${conclusionActionRef} in ${conclusionHouseName} is the most actionable part of the spread.`),
      template("gt.conclusion.bridge.direction.01", "gt.conclusion.bridge.direction", () => `The direction with the most weight now runs through ${conclusionActionRef} in ${conclusionHouseName}.`),
      template("gt.conclusion.bridge.leverage.01", "gt.conclusion.bridge.leverage", () => `${conclusionActionRef} in ${conclusionHouseName} has more leverage than the surrounding noise.`),
      template("gt.conclusion.bridge.points.01", "gt.conclusion.bridge.points", () => `From here, the reading points most clearly toward ${conclusionActionRef} in ${conclusionHouseName}.`),
      template("gt.conclusion.bridge.edge.01", "gt.conclusion.bridge.edge", () => `${conclusionActionRef} in ${conclusionHouseName} gives the spread its clearest practical edge.`),
    ],
    undefined,
    phraseTracker,
    random,
  );
  const conclusion = `${tableauSynthesis.conclusionSentence} ${conclusionBridge} ${buildActionDirectiveSentence({
    actionCard: conclusionActionCard,
    house: primaryHouse,
    subjectId,
    domain,
    random,
  })}`.trim();

  return {
    sections,
    conclusion,
    selectionTrace: {
      primaryPairKey: selectedPair?.key ?? null,
      primaryPairSelectionBand: selectedPair?.topBandKeys ?? [],
      cartouchePairKey,
      phraseTemplateIds: Array.from(phraseTracker.usedTemplateIds),
      phraseTemplateFamilies: Array.from(phraseTracker.usedFamilies),
    },
  };
}

function generateThreeCardSections(context: NarrativeSeedContext, random: () => number): QuickCompositionResult {
  const { state, domain, subjectId, resolvedThemeId } = context;
  const mode = state.setup.threeCardMode as ThreeCardMode;
  const placements = buildThreeCardLayout(state.layout, mode);
  const labels = getThreeCardLabels(mode);
  const role = inferCounterpartRole(state.setup.question, state.setup.significatorMode);

  const cards = placements.map((placement) => getCardMeaning(placement.cardId));
  const situationThread = normalizeMeaningForSentenceFrame(cards[0].domainVariants[domain]);
  const directionThread = normalizeMeaningForSentenceFrame(cards[2].domainVariants[domain]);
  const topPair = selectTopPair(buildThreeCardPairCandidates(cards.map((card) => card.id)), domain);

  const situationSentenceBase = choose(
      [
        `${labels[0]} opens with ${cardRef(cards[0].id)}: ${situationThread}, which sets the tone before anything else has a chance to speak. ${buildPositionedCardAssociationSentence(cards[0], "situation", subjectId, domain, random)}`,
        `With ${cardRef(cards[0].id)} in ${labels[0].toLowerCase()}, the starting picture is already clear: ${situationThread}. ${buildPositionedCardAssociationSentence(cards[0], "situation", subjectId, domain, random)}`,
        `${cardRef(cards[0].id)} in ${labels[0]} sets the tone: ${situationThread}. ${buildPositionedCardAssociationSentence(cards[0], "situation", subjectId, domain, random)}`,
        `The sequence begins in ${labels[0]} with ${cardRef(cards[0].id)}: ${situationThread}. ${buildPositionedCardAssociationSentence(cards[0], "situation", subjectId, domain, random)}`,
        `${labels[0]} arrives through ${cardRef(cards[0].id)}, establishing ${situationThread} as the ground the rest of the reading builds from. ${buildPositionedCardAssociationSentence(cards[0], "situation", subjectId, domain, random)}`,
        `The first card, ${cardRef(cards[0].id)}, describes what is already present: ${situationThread}. ${buildPositionedCardAssociationSentence(cards[0], "situation", subjectId, domain, random)}`,
      ],
      random,
  );
  const situationSentence = [situationSentenceBase, buildThemeCardSentence(resolvedThemeId, cards[0].id, cards[0].name, "situation", random)].filter(Boolean).join(" ");

  const pivotSentenceBase = choose(
    [
      `${labels[1]} turns on ${cardRef(cards[1].id)}, so the middle card becomes the point where the sequence can redirect. ${buildPositionedCardAssociationSentence(cards[1], "pivot", subjectId, domain, random)}`,
      `At the pivot, ${labels[1]} places ${cardRef(cards[1].id)} at the center, making this the point where the reading can shift. ${buildPositionedCardAssociationSentence(cards[1], "pivot", subjectId, domain, random)}`,
      `In ${labels[1]}, ${cardRef(cards[1].id)} becomes the pivot, so the next movement depends on how its lesson is handled. ${buildPositionedCardAssociationSentence(cards[1], "pivot", subjectId, domain, random)}`,
      `${cardRef(cards[1].id)} in ${labels[1]} acts as the fulcrum, so this is the point where tone, timing, or choice can change the sequence. ${buildPositionedCardAssociationSentence(cards[1], "pivot", subjectId, domain, random)}`,
      `${labels[1]} centers on ${cardRef(cards[1].id)}, where the whole sequence either opens or tightens. ${buildPositionedCardAssociationSentence(cards[1], "pivot", subjectId, domain, random)}`,
      `The pivot falls on ${cardRef(cards[1].id)} in ${labels[1]}, marking the moment where the situation either moves forward or doubles back. ${buildPositionedCardAssociationSentence(cards[1], "pivot", subjectId, domain, random)}`,
      `${cardRef(cards[1].id)} holds the middle ground in ${labels[1]}, and it is here that the reading asks for a direct response. ${buildPositionedCardAssociationSentence(cards[1], "pivot", subjectId, domain, random)}`,
    ],
    random,
  );
  const pivotSentence = [pivotSentenceBase, buildThemeCardSentence(resolvedThemeId, cards[1].id, cards[1].name, "pivot", random)].filter(Boolean).join(" ");

  const directionSentenceBase = choose(
    [
      `The direction in ${labels[2]} comes through ${cardRef(cards[2].id)}: ${directionThread}, once the middle card is handled directly. ${buildPositionedCardAssociationSentence(cards[2], "direction", subjectId, domain, random)}`,
      `The likely direction shows in ${labels[2]} through ${cardRef(cards[2].id)}, and it suggests ${directionThread} once the pivot is met directly. ${buildPositionedCardAssociationSentence(cards[2], "direction", subjectId, domain, random)}`,
      `What ${labels[2]} shows through ${cardRef(cards[2].id)}: ${directionThread}, provided the central pressure is handled honestly. ${buildPositionedCardAssociationSentence(cards[2], "direction", subjectId, domain, random)}`,
      `${labels[2]} closes with ${cardRef(cards[2].id)}, and the directional message is: ${directionThread} when the pivot receives consistent attention. ${buildPositionedCardAssociationSentence(cards[2], "direction", subjectId, domain, random)}`,
      `${cardRef(cards[2].id)} in ${labels[2]} suggests ${directionThread}, once the middle-card pressure has been worked with directly. ${buildPositionedCardAssociationSentence(cards[2], "direction", subjectId, domain, random)}`,
      `In ${labels[2]}, ${cardRef(cards[2].id)} points toward ${directionThread}, assuming the pivot is met with something more than avoidance. ${buildPositionedCardAssociationSentence(cards[2], "direction", subjectId, domain, random)}`,
      `The final position gives ${cardRef(cards[2].id)} in ${labels[2]}, and its directional pull is toward ${directionThread} when the middle card is answered honestly. ${buildPositionedCardAssociationSentence(cards[2], "direction", subjectId, domain, random)}`,
    ],
    random,
  );
  const directionSentence = [directionSentenceBase, buildThemeCardSentence(resolvedThemeId, cards[2].id, cards[2].name, "direction", random)].filter(Boolean).join(" ");

  const pairLine = topPair ? pairMeaningToProse(topPair.meaning) : "the relationship between the cards matters more than any single symbol alone";
  const leftRef = cardRef(topPair?.cardA ?? cards[0].id);
  const rightRef = cardRef(topPair?.cardB ?? cards[1].id);
  const synthesisSentence = makeThreeCardSynthesis({
    subjectId,
    domain,
    leftRef,
    rightRef,
    pairLine,
    random,
  });

  const synthesisConnector = choose(
    [
      "Stepping back from the individual cards,",
      "Looking at the three cards as a single movement,",
      "Read as a whole,",
      "Across the full sequence,",
      "When the three positions are read together,",
      "Taken as one arc,",
    ],
    random,
  );
  const closerConnector = choose(
    [
      "From here,",
      "Given that picture,",
      "With that sequence in mind,",
      "Taking all of that,",
      "With that arc laid out,",
      "Bearing all three cards in mind,",
    ],
    random,
  );
  const closerSentence = `${closerConnector} ${makeThreeCardCloser(subjectId, role, domain, random).replace(/^[A-Z]/, (c) => c.toLowerCase())}`;
  const pivotAction = `${cards[1].action[0].toUpperCase()}${cards[1].action.slice(1)}`;
  const directionRef = cardRef(cards[2].id);
  const conclusionClose = choose(
    [
      `${pivotAction} — that is the clearest move this reading points to.`,
      `The practical thread here is to ${pivotAction.toLowerCase()}.`,
      `${pivotAction} — the three cards keep returning to this point.`,
      `The reading keeps returning to one thing: ${pivotAction.toLowerCase()}.`,
      `If there is one move to make from this spread, it is to ${pivotAction.toLowerCase()}.`,
      `The three cards point most clearly toward one step: ${pivotAction.toLowerCase()}.`,
      `The clearest practical thread here: ${pivotAction.toLowerCase()}.`,
      `What the three cards keep saying: ${pivotAction.toLowerCase()}.`,
      `Across all three positions, one thing keeps surfacing: ${pivotAction.toLowerCase()}.`,
    ],
    random,
  );
  const conclusion = `${sentence(
    choose(
      [
        `${cardRef(cards[1].id)} is the real hinge in this spread`,
        `The spread turns on ${cardRef(cards[1].id)} more than any other card`,
        `${cardRef(cards[1].id)} shows where the whole sequence either opens or tightens`,
        `The reading as a whole circles back to ${cardRef(cards[1].id)}`,
        `${cardRef(cards[1].id)} is the card that asks the most of you in this spread`,
        `Of the three cards, ${cardRef(cards[1].id)} carries the most weight`,
        `The reading's center of gravity is ${cardRef(cards[1].id)}`,
        `${cardRef(cards[1].id)} is doing the most interpretive work here`,
        `If the sequence has a fulcrum, it is ${cardRef(cards[1].id)}`,
      ],
      random,
    ),
  )} ${conclusionClose}`.trim();

  const themeBridge = buildThemeSectionBridge(resolvedThemeId, random);
  return {
    sections: [
      buildSection("situation", pickSectionTitle("situation", random), "timeline", situationSentence),
      buildSection("pivot", pickSectionTitle("pivot", random), "timeline", pivotSentence),
      buildSection("direction", pickSectionTitle("direction", random), "timeline", directionSentence),
      buildSection("synthesis", pickSectionTitle("synthesis", random), "synthesis", [synthesisConnector, synthesisSentence, buildCardPairBridge(cards[0].id, cards[1].id, cards[0].name, cards[1].name, random), buildCardPairBridge(cards[1].id, cards[2].id, cards[1].name, cards[2].name, random), themeBridge].filter(Boolean).join(" ")),
      buildSection("closer", pickSectionTitle("closer", random), "synthesis", closerSentence),
    ],
    conclusion,
    selectionTrace: {
      threeCardPairKey: topPair?.key ?? null,
    },
  };
}

function countSentences(input: string): number {
  return input
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean).length;
}

function enforceSentenceTargets(
  reading: Omit<GeneratedReading, "wordCount">,
  spreadType: "grand-tableau" | "three-card",
): GeneratedReading {
  let intro = cleanProseArtifacts(capitalizeSentenceStarts(reading.intro.trim()));
  let sections = reading.sections.map((section) => ({
    ...section,
    body: cleanProseArtifacts(capitalizeSentenceStarts(section.body.trim())),
  }));
  let conclusion = cleanProseArtifacts(capitalizeSentenceStarts(reading.conclusion.trim()));

  const minSentences = spreadType === "grand-tableau" ? 6 : 6;
  const maxSentences = spreadType === "grand-tableau" ? 16 : 12;
  const minWords = spreadType === "grand-tableau" ? 260 : 200;
  const maxWords = spreadType === "grand-tableau" ? 420 : 260;

  const sentenceTotal = () =>
    countSentences([intro, ...sections.map((section) => section.body), conclusion].join(" "));
  const wordTotal = () =>
    countWords([intro, ...sections.map((section) => section.body), conclusion, reading.disclaimer].join(" "));

  while (sentenceTotal() > maxSentences && sections.length > 2) {
    const preserveIds =
      spreadType === "grand-tableau"
        ? new Set(sections.some((section) => section.id === "cartouche") ? ["center", "pair", "background", "cartouche"] : ["center", "pair", "background"])
        : new Set(["situation", "pivot", "direction"]);
    let removeIndex = sections.length - 1;
    while (removeIndex >= 0 && preserveIds.has(sections[removeIndex]?.id ?? "")) {
      removeIndex -= 1;
    }
    if (removeIndex < 0) {
      break;
    }
    sections = sections.filter((_, index) => index !== removeIndex);
  }

  const addClause = (sentence: string, extra: string): string => {
    const base = clause(sentence);
    const normalizedExtra = clause(extra);
    return `${base}. ${normalizedExtra}.`;
  };

  const trimSentence = (sentence: string): string => {
    const trimmed = clause(sentence);
    const sentences = trimmed
      .split(/(?<=[.!?])\s+/)
      .map((part) => part.trim())
      .filter(Boolean);
    if (sentences.length > 1) {
      return sentences.slice(0, -1).join(" ");
    }
    const commaIndex = trimmed.lastIndexOf(",");
    if (commaIndex > 64) {
      return `${trimmed.slice(0, commaIndex)}.`;
    }
    return `${trimmed}.`;
  };

  type ExpansionTemplate = string | ((section: NarrativeSection) => string);

  const expansionByTechnique: Record<NarrativeSection["technique"], ExpansionTemplate[]> = {
    house: [
      (section) => {
        const house = extractHouseNameFromText(section.body);
        return house
          ? `${house} is the part of life where this theme stops hovering in the background and asks to be lived directly.`
          : "This placement shows where the reading stops hovering in the background and starts asking something concrete of you.";
      },
      (section) => {
        const house = extractHouseNameFromText(section.body);
        return house ? `${house} is where the pattern is most likely to show up in concrete form.` : "What lands here usually names the part of life that carries the real weight.";
      },
      (section) => {
        const house = extractHouseNameFromText(section.body);
        return house ? `${house} gives the reading a location, not just a mood.` : "The house placement locates the meaning instead of leaving it abstract.";
      },
      (section) => {
        const house = extractHouseNameFromText(section.body);
        return house ? `${house} shows where the theme becomes practical instead of staying abstract.` : "A house overlay often reveals where the reading is most worth sitting with directly.";
      },
      "A house overlay often reveals where the reading is most worth sitting with directly.",
      "The house narrows the theme to the place where it can be tested.",
      "House emphasis often points to the arena where timing matters most.",
      (section) => {
        const house = extractHouseNameFromText(section.body);
        return house ? `${house} is likely to be the setting where the cards show themselves first.` : "This placement tells you where the cards are likely to show up on the ground.";
      },
      (section) => {
        const house = extractHouseNameFromText(section.body);
        return house
          ? `${house} turns mood into location, which makes the reading easier to test in real life.`
          : "The house turns mood into location, which makes the reading easier to test in real life.";
      },
      "What appears here usually describes the setting that gives the rest of the spread its shape.",
      (section) => {
        const house = extractHouseNameFromText(section.body);
        return house ? `${house} is where the issue stops being theoretical and starts asking something of you.` : "The house tells you where the issue stops being theoretical and starts asking something of you.";
      },
    ],
    pair: [
      (section) => {
        const refs = extractCardRefsFromText(section.body);
        return refs.length >= 2
          ? `Between ${refs[0]} and ${refs[1]}, the interaction matters as much as either symbol alone.`
          : "Together, these cards show how one pressure meets another.";
      },
      (section) => {
        const refs = extractCardRefsFromText(section.body);
        return refs.length >= 2
          ? `Read ${refs[0]} with ${refs[1]} as one linked movement rather than two isolated symbols.`
          : "Read them together rather than as two isolated symbols.";
      },
      (section) => {
        const refs = extractCardRefsFromText(section.body);
        return refs.length >= 2
          ? `${refs[0]} names the pressure first, and ${refs[1]} shows how it begins to move.`
          : "One card names the pressure first, and the other shows how it begins to move.";
      },
      (section) => {
        const refs = extractCardRefsFromText(section.body);
        return refs.length >= 2
          ? `Together, ${refs[0]} and ${refs[1]} reveal the first point where the reading asks for response.`
          : "This pair brings the first real point of response into view.";
      },
      (section) => {
        const refs = extractCardRefsFromText(section.body);
        return refs.length >= 2
          ? `The meaning sits in how ${refs[0]} and ${refs[1]} meet, not in either card alone.`
          : "Their meaning sits in the interaction, not in either card alone.";
      },
      "Pairs matter because they show what shifts when two signals meet.",
      "The link between them is often more useful than either card in isolation.",
      "The pair turns symbol into movement.",
      (section) => {
        const refs = extractCardRefsFromText(section.body);
        return refs.length >= 2
          ? `Read ${refs[0]} as opening one side of the situation while ${refs[1]} shows how it turns.`
          : "One card opens the situation while the other shows its next turn.";
      },
      (section) => {
        const refs = extractCardRefsFromText(section.body);
        return refs.length >= 2
          ? `Together, ${refs[0]} and ${refs[1]} form the reading's most immediate hinge.`
          : "The pair gives the reading its most immediate hinge.";
      },
      "Read this pair as the smallest story unit in the spread.",
      "Together they show what happens when one influence presses directly on another.",
      (section) => {
        const refs = extractCardRefsFromText(section.body);
        return refs.length >= 2
          ? `Together, ${refs[0]} and ${refs[1]} reveal the practical tone faster than a single card can on its own.`
          : "The pair often reveals the practical tone faster than a single card can.";
      },
    ],
    diagonal: [
      (section) => {
        const refs = extractCardRefsFromText(section.body);
        if (refs.length >= 2) {
          return `${refs[0]} and ${refs[1]} belong to the same longer thread, even if the link only becomes obvious with time.`;
        }
        return "This thread becomes clearer once you read it as one unfolding line rather than a set of isolated details.";
      },
      "The diagonal shows continuity between details that seem separate at first.",
      "It reads more like an arc than a single event.",
      (section) => {
        const ref = extractFirstCardRef(section.body);
        return ref ? `${ref} helps bridge the early mood to what develops later in the spread.` : "This thread helps explain how the early mood becomes a later result.";
      },
      "The diagonal often shows how today's choice keeps moving long after the first moment passes.",
      "The diagonal often carries what the spread is building toward quietly.",
      (section) => {
        const ref = extractFirstCardRef(section.body);
        return ref ? `${ref} shows how present tension travels into what comes later.` : "This line shows how present tensions travel into later conditions.";
      },
      (section) => {
        const ref = extractFirstCardRef(section.body);
        return ref
          ? `Read the diagonal through ${ref}, as the story moving underneath the obvious surface.`
          : "Read the diagonal as the story moving underneath the obvious surface.";
      },
      (section) => {
        const ref = extractFirstCardRef(section.body);
        return ref
          ? `${ref} helps connect moments that only make sense once they are read together.`
          : "The diagonal helps connect moments that only make sense once they are read together.";
      },
      (section) => {
        const ref = extractFirstCardRef(section.body);
        return ref
          ? `${ref} is most useful when you need the storyline, not just the symbol on its own.`
          : "This diagonal is most useful when you need the storyline, not just the symbol on its own.";
      },
      (section) => {
        const ref = extractFirstCardRef(section.body);
        return ref ? `${ref} often carries the quieter development behind the headline cards.` : "This line often carries the quieter development behind the headline cards.";
      },
      (section) => {
        const ref = extractFirstCardRef(section.body);
        return ref
          ? `${ref} gives the reading a sense of motion across time, not just placement.`
          : "The diagonal gives the reading a sense of motion across time, not just placement.";
      },
    ],
    knight: [
      "This side influence can redirect the story unexpectedly.",
      "What arrives from the side may matter more than what looks obvious.",
      "It helps explain why timing can shift suddenly.",
      "Knight moves often reveal the influence that does not announce itself directly.",
      "This is where the spread shows a sideways nudge rather than a frontal push.",
      "Knight links often name the factor that changes the pace from the edge.",
      "This side pattern helps explain what bends the story without taking center stage.",
      "Indirect influence matters here because it alters timing more than tone.",
      "The knight move shows what joins the story from an angle.",
      "This is the secondary influence most likely to redirect the sequence.",
    ],
    proximity: [
      (section) => {
        const refs = extractCardRefsFromText(section.body);
        return refs.length >= 2
          ? `${refs[0]} and ${refs[1]} speak first; the wider field answers afterward.`
          : "What is nearest speaks first; the next ring answers later.";
      },
      "The closest cards describe active pressure, while the next ring gathers quietly.",
      "Distance helps separate what is immediate from what is still forming.",
      "Closeness is a timing cue as much as a meaning cue.",
      "Near cards show what is already in motion; outer cards show what is approaching.",
      "The layout uses distance to sort urgency from background influence.",
      (section) => {
        const refs = extractCardRefsFromText(section.body);
        return refs.length >= 1
          ? `${refs[0]} is already active; the wider field is still gathering force.`
          : "What sits close is already active; what sits further out is still gathering force.";
      },
      (section) => {
        const refs = extractCardRefsFromText(section.body);
        return refs.length >= 2
          ? `${refs[0]} and ${refs[1]} describe the present mood, while the wider field suggests the next weather.`
          : "Near cards often describe the present mood, while outer cards describe the next weather.";
      },
      "Proximity makes the timeline easier to trust.",
      "Distance helps separate what needs attention now from what is still approaching.",
    ],
    significator: [
      "This keeps the reading tied to lived perspective.",
      "It clarifies whose stance carries the most weight.",
      "That is why some cards feel louder than others.",
      "Perspective matters because it changes which details feel most urgent.",
      "The significator lens keeps the reading anchored in experience rather than abstraction.",
      "This point of view decides which parts of the spread feel personal.",
      "The significator tells you where the reading is being lived from the inside.",
      "Perspective shapes emphasis: some cards press harder depending on who is centered.",
      "This frame keeps the reading relational rather than abstract.",
      "It helps explain why certain cards move from background to foreground.",
    ],
    timeline: [
      (section) => {
        const ref = extractFirstCardRef(section.body);
        return ref ? `${ref} changes the meaning of what comes after it.` : "Each position changes the meaning of the next.";
      },
      (section) => {
        const ref = extractFirstCardRef(section.body);
        return ref ? `Read ${ref} as part of a moving sequence rather than a frozen verdict.` : "Read the spread as movement rather than a frozen verdict.";
      },
      (section) =>
        section.id === "pivot"
          ? "The sequence is cumulative, so the pivot changes how the ending lands."
          : section.id === "direction"
            ? "The ending only makes full sense once you read it in light of what came before it."
            : "The sequence is cumulative, so the earlier cards keep shaping what follows.",
      (section) =>
        section.id === "situation"
          ? "The first card matters because it sets the condition the rest of the sequence must answer."
          : section.id === "pivot"
            ? "The sequence makes most sense once you let the middle card recast what came before and after it."
            : section.id === "direction"
              ? "The direction card reads best as a consequence of what the earlier positions set in motion."
              : "The sequence becomes clearer when you read each card as changing the one that follows.",
      (section) =>
        section.id === "direction"
          ? "Let the ending answer the earlier pressure instead of reading it as a stand-alone result."
          : "Trust the order of the spread; each position hands something forward to the next.",
      (section) =>
        section.id === "pivot"
          ? "The middle card often decides whether the ending softens or sharpens."
          : section.id === "situation"
            ? "The first turn of the sequence quietly shapes how the ending lands."
            : "The turning point of the sequence decides how the final card lands.",
      (section) => {
        const ref = extractFirstCardRef(section.body);
        return ref ? `${ref} shifts the tone of what comes after it.` : "Each stage modifies the tone of what comes after it.";
      },
      (section) => {
        const ref = extractFirstCardRef(section.body);
        if (section.id === "situation") {
          return ref ? `${ref} frames the conditions the rest of the reading must answer.` : "The opening card frames the conditions the rest of the reading must answer.";
        }
        return ref ? `${ref} still sets terms the later cards must work with.` : "The opening card still sets terms the later cards must work with.";
      },
      (section) =>
        section.id === "pivot"
          ? "The middle card usually decides whether the sequence softens, sharpens, or changes direction."
          : section.id === "direction"
            ? "The pivot decides how this ending develops from here."
            : "The middle turn often decides how the story develops from here.",
      (section) =>
        section.id === "direction"
          ? "The final card does not stand alone; it grows out of what the first two cards set in motion."
          : section.id === "pivot"
            ? "The later cards do not cancel the earlier ones; they answer the pressure already in play."
            : "Later cards do not replace the start of the story; they answer it.",
      (section) =>
        section.id === "synthesis"
          ? "The sequence becomes clearest when you read cause and response together rather than separately."
          : section.id === "direction"
            ? "Here the ending grows out of what the middle card manages or avoids."
            : "Sequence matters here because later meaning keeps leaning on the middle turn.",
      (section) =>
        section.id === "closer"
          ? "The final emphasis is less about prediction than about where the sequence is already leaning."
          : section.id === "direction"
            ? "Order matters here because the ending answers the pressure that came before it."
            : section.id === "pivot"
              ? "Order matters most where the middle card changes the tone of the whole sequence."
              : "The sequence matters because each position changes the emotional weight of the next.",
    ],
    synthesis: [
      "What repeats is more important than any single dramatic card.",
      "Taken together, the pattern favors consistency over force.",
      "The soundest thread is the one the cards keep returning to from different angles.",
      "The reading becomes more trustworthy where several signals quietly agree.",
      "When several parts of the spread agree, that thread deserves more trust.",
      "Agreement across the spread matters more than one striking detail.",
      "What the cards repeat is usually safer to trust than what they merely hint at once.",
      "The synthesis becomes clearer when you follow agreement across the spread.",
      "One card can catch the eye, but the repeated theme usually tells the truth.",
      "The reading settles when you notice which theme keeps returning.",
      "The spread is clearest where several smaller signals keep agreeing.",
      "The most dependable message is the one the spread echoes in more than one place.",
      "Repeated themes carry more weight here than any single striking image.",
      (section) => {
        const ref = extractFirstCardRef(section.body);
        return ref
          ? `What develops in the wider field depends more on what ${ref} can actually sustain than on what only flares for a moment.`
          : "What develops in the wider field depends more on what can actually be sustained than on what only flares for a moment.";
      },
    ],
  };

  const expansionRng = createMulberry32(
    hashStringToInt([spreadType, intro, conclusion, sections.map((section) => section.body).join("|")].join("|")),
  );

  let expansionGuard = 0;
  const usedExpansion = new Set<string>();
  const expandableSectionCount = Math.max(1, sections.length - 1);
  const maxMeaningExpansions = spreadType === "grand-tableau" ? 5 : 5;
  let expansionsAdded = 0;
  while (wordTotal() < minWords && expansionGuard < 24 && expansionsAdded < maxMeaningExpansions) {
    const sectionIndex = Math.floor(expansionRng.next() * expandableSectionCount);
    const techniquePool = expansionByTechnique[sections[sectionIndex].technique] ?? expansionByTechnique.synthesis;
    const template = choose(techniquePool, expansionRng.next);
    const phrase = typeof template === "function" ? template(sections[sectionIndex]) : template;
    if (!usedExpansion.has(phrase) && !sections[sectionIndex].body.includes(phrase)) {
      sections[sectionIndex] = {
        ...sections[sectionIndex],
        body: addClause(sections[sectionIndex].body, phrase),
      };
      usedExpansion.add(phrase);
      expansionsAdded += 1;
    }
    expansionGuard += 1;
  }

  let trimGuard = 0;
  while (wordTotal() > maxWords && trimGuard < 24) {
    const longestIndex = sections.reduce(
      (best, section, index, list) => (section.body.length > list[best].body.length ? index : best),
      0,
    );
    sections[longestIndex] = {
      ...sections[longestIndex],
      body: trimSentence(sections[longestIndex].body),
    };
    trimGuard += 1;
  }

  const total = sentenceTotal();
  if (total < minSentences) {
    conclusion = `${conclusion} Keep it simple and stay observant.`;
  }

  const wordCount = wordTotal();

  return {
    ...reading,
    intro,
    sections,
    conclusion,
    wordCount,
  };
}

export function composeReading(state: ReadingState): GeneratedReading {
  const question = state.setup.question.trim() || "General reflective reading";
  const subjectId = state.setup.subjectId ?? inferSubjectFromQuestion(question);
  const subject = getSubjectDefinition(subjectId);
  const themeOverlay = resolveThemeForReading({
    subjectId,
    question,
    selectedThemeId: state.setup.interpretationThemeId,
  });
  const domain = getDomainForSubject(subjectId);

  const variantSeed = hashStringToInt(
    [
      state.id,
      state.layout.join(","),
      state.ritual.shuffleRun?.normalizedSeed ?? "no-shuffle",
      Date.now(),
    ].join("|"),
  );

  const rng = createMulberry32(variantSeed);
  const readingStyle = state.setup.readingStyle ?? "quick";

  if (readingStyle === "deep_dive") {
    const deep = composeDeepDiveReading({
      state,
      subjectId,
      subjectLabel: subject.displayLabel,
      domain,
      resolvedThemeId: themeOverlay.resolvedThemeId,
      resolvedThemeLabel: themeOverlay.resolvedThemeLabel,
      random: rng.next,
    });

    return {
      subjectLabel: subject.displayLabel,
      intro: deep.intro,
      sections: deep.sections,
      highlights: buildHighlights(deep.sections),
      conclusion: deep.conclusion,
      disclaimer: deep.disclaimer,
      wordCount: deep.wordCount,
      generatedAtIso: new Date().toISOString(),
      ritualSummary: ritualSummaryLine(state.ritual.shuffleRun, state.ritual.cutStep),
      themeOverlay: {
        selection: themeOverlay.selection,
        mode: themeOverlay.mode,
        resolvedThemeId: themeOverlay.resolvedThemeId,
        resolvedThemeLabel: themeOverlay.resolvedThemeLabel,
        subjectContextNote: themeOverlay.subjectContextNote,
        inferred: themeOverlay.inferred.map((item) => ({
          id: item.id,
          label: item.label,
          weight: item.weight,
        })),
      },
    };
  }

  const spreadLabel = state.setup.spreadType === "grand-tableau" ? "Grand Tableau" : "3-card";
  const themeLensSummary = buildThemeLensSummary(themeOverlay);
  const intro = buildQuickIntro({
    question: state.setup.question,
    spreadLabel,
    subjectLabel: subject.displayLabel,
    themeLensSummary,
    random: rng.next,
  });
  const sectionsCore =
    state.setup.spreadType === "grand-tableau"
      ? generateGTSections({ state, domain, subjectId, resolvedThemeId: themeOverlay.resolvedThemeId }, rng.next)
      : generateThreeCardSections({ state, domain, subjectId, resolvedThemeId: themeOverlay.resolvedThemeId }, rng.next);
  const sections = sectionsCore.sections;

  const conclusion = sectionsCore.conclusion || makeConclusion(subjectId, domain, rng.next);
  const disclaimer = buildSubjectDisclaimer(subjectId);

  const reading = enforceSentenceTargets(
    {
    subjectLabel: subject.displayLabel,
    intro,
    sections,
    highlights: buildHighlights(sections),
    conclusion,
    disclaimer,
    generatedAtIso: new Date().toISOString(),
    ritualSummary: ritualSummaryLine(state.ritual.shuffleRun, state.ritual.cutStep),
    selectionTrace: sectionsCore.selectionTrace,
    themeOverlay: {
      selection: themeOverlay.selection,
      mode: themeOverlay.mode,
      resolvedThemeId: themeOverlay.resolvedThemeId,
      resolvedThemeLabel: themeOverlay.resolvedThemeLabel,
      subjectContextNote: themeOverlay.subjectContextNote,
      inferred: themeOverlay.inferred.map((item) => ({
        id: item.id,
        label: item.label,
        weight: item.weight,
      })),
    },
  },
    state.setup.spreadType,
  );

  return reading;
}

export function composeCardDetail(state: ReadingState, position: number): {
  title: string;
  cardSummary: string;
  houseSummary: string;
  connections: string[];
} {
  const cardId = state.layout[position - 1];
  const card = getCardMeaning(cardId);

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  if (state.setup.spreadType === "three-card") {
    const labels = getThreeCardLabels(state.setup.threeCardMode);
    return {
      title: `${labels[position - 1]} — ${card.name}`,
      cardSummary: cap(card.coreMeaning),
      houseSummary: "",
      connections: [
        `Keywords: ${card.keywords.join(", ")}`,
        cap(card.action),
      ],
    };
  }

  const house = getHouseMeaning(position);
  const gtLayout = state.setup.gtLayout ?? "4x9";
  const layout = buildGrandTableauLayout(state.layout, gtLayout);
  const knightIds = getKnightPositions(position, gtLayout)
    .map((p) => layout.find((item) => item.position === p)?.cardId)
    .filter((id): id is number => Boolean(id));

  const diagonalA = getDiagonalLine(position, "nwse", gtLayout).map((p) => layout.find((item) => item.position === p)?.cardId);
  const diagonalB = getDiagonalLine(position, "nesw", gtLayout).map((p) => layout.find((item) => item.position === p)?.cardId);

  const proximity = layout
    .filter((entry) => entry.position !== position)
    .slice(0, 10)
    .map((entry) => `${cardLabel(entry.cardId)} (${classifyDistance(position, entry.position, gtLayout)})`);

  const knightLine = knightIds.length
    ? `Knighted by: ${knightIds.map((id) => cardLabel(id)).join(", ")}`
    : null;
  const diagALine = diagonalA.filter(Boolean).length > 1
    ? `Diagonal: ${diagonalA.filter(Boolean).map((id) => cardLabel(id as number)).join(" · ")}`
    : null;
  const diagBLine = diagonalB.filter(Boolean).length > 1
    ? `Diagonal: ${diagonalB.filter(Boolean).map((id) => cardLabel(id as number)).join(" · ")}`
    : null;

  return {
    title: `${card.name} in ${house.name}`,
    cardSummary: `${cap(card.coreMeaning)}. ${cap(card.domainVariants.general)}.`,
    houseSummary: cap(house.description),
    connections: [
      `Neighbours: ${proximity.slice(0, 4).join(", ")}`,
      knightLine,
      diagALine,
      diagBLine,
    ].filter((s): s is string => Boolean(s)),
  };
}

export function getCardThumbnailSet(state: ReadingState): Array<{ position: number; cardId: number; label: string }> {
  if (state.setup.spreadType === "three-card") {
    const labels = getThreeCardLabels(state.setup.threeCardMode);
    return state.layout.slice(0, 3).map((cardId, index) => ({
      position: index + 1,
      cardId,
      label: labels[index],
    }));
  }

  return state.layout.slice(0, 36).map((cardId, index) => ({
    position: index + 1,
    cardId,
    label: `House ${index + 1}`,
  }));
}

export function getRepositoryStats() {
  return {
    cards: CARD_MEANINGS.length,
  };
}
