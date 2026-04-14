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
} from "@/lib/engine/narrativeAssociations";
import {
  buildGrandTableauPairCandidates,
  buildThreeCardPairCandidates,
  selectBestPair,
  selectTopPair,
} from "@/lib/engine/pairSelection";
import { createMulberry32, hashStringToInt } from "@/lib/engine/rng";
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

function buildQuickCenterBridgeSentence(cardId: number, domainClause: string, random: () => number): string {
  if (cardId === 29) {
    return sentence(
      choose(
        [
          "That keeps the reading tied to what you can shape, permit, or clarify directly",
          "That keeps the focus on the part of the story you are actually steering",
          "That is why your own stance carries more weight here than the surrounding noise",
        ],
        random,
      ),
    );
  }

  if (cardId === 28) {
    return sentence(
      choose(
        [
          "That keeps attention on the part of the story you do not define alone",
          "That keeps the reading honest about how much depends on the other person's position",
          "That is why the other person's stance carries real weight here",
        ],
        random,
      ),
    );
  }

  return sentence(
    choose(
      [
        `The surrounding cards suggest that ${domainClause}`,
        `The wider pattern suggests that ${domainClause}`,
        `The supporting cards suggest that ${domainClause}`,
      ],
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
      `The answer to "${normalized}" seems to be living in ${lowerSubject} territory ${themeLensSummary}.`,
      `Framing "${normalized}" through ${lowerSubject} ${themeLensSummary} gives the clearest read of what is actually moving.`,
    ],
    random,
  );
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

  const houseName = formatHouseName(primaryHouse.name);
  const primaryFocusPhrase = lowerFirst(buildCardAssociationPhrase(primaryCard, subjectId, domain, random));
  const primaryDomainClause = normalizeMeaningThatClause(primaryCard.domainVariants[domain]);
  const centerBridgeSentence = buildQuickCenterBridgeSentence(primaryCard.id, primaryDomainClause, random);
  const overlaySentence = buildOverlayAssociationSentence({
    card: primaryCard,
    house: primaryHouse,
    subjectId,
    domain,
    random,
  });

  const centerSentence = choose(
    [
      `${houseName} now holds ${cardRef(primaryPlacement.cardId)}, which puts ${primaryFocusPhrase} at the center of the reading. ${centerBridgeSentence} ${overlaySentence}`,
      `Centered here, ${cardRef(primaryPlacement.cardId)} falls in ${houseName}. That keeps ${primaryFocusPhrase} close to everything else that is happening. ${centerBridgeSentence} ${overlaySentence}`,
      `${houseName} holds ${cardRef(primaryPlacement.cardId)}, keeping ${primaryFocusPhrase} in focus. ${centerBridgeSentence} ${overlaySentence}`,
      `At the center, ${cardRef(primaryPlacement.cardId)} rests in ${houseName}. This keeps ${primaryFocusPhrase} in the foreground. ${centerBridgeSentence} ${overlaySentence}`,
      `One clear focal point is ${cardRef(primaryPlacement.cardId)} in ${houseName}. It brings ${primaryFocusPhrase} to the foreground. ${centerBridgeSentence} ${overlaySentence}`,
      `${cardRef(primaryPlacement.cardId)} in ${houseName} becomes the main anchor here, putting ${primaryFocusPhrase} under the strongest light. ${centerBridgeSentence} ${overlaySentence}`,
    ],
    random,
  );
  const centerThemeSentence = buildThemeCardSentence(resolvedThemeId, primaryCard.id, primaryCard.name, "center", random);
  const centerSentenceWithTheme = [centerSentence, centerThemeSentence].filter(Boolean).join(" ");

  const pairSentence = selectedPair
    ? (() => {
        const quickPairMeaning = humanizeQuickPairMeaning(selectedPair.meaning);
        return choose(
          [
            `${cardRef(selectedPair.cardA)} with ${cardRef(selectedPair.cardB)} points to ${quickPairMeaning}. ${buildPairAssociationSentence({
              cardA: selectedPair.cardA,
              cardB: selectedPair.cardB,
              subjectId,
              domain,
              random,
            })}`,
            `Closest to center, ${cardRef(selectedPair.cardA)} with ${cardRef(selectedPair.cardB)} points to ${quickPairMeaning}. ${buildPairAssociationSentence({
              cardA: selectedPair.cardA,
              cardB: selectedPair.cardB,
              subjectId,
              domain,
              random,
            })}`,
            `${cardRef(selectedPair.cardA)} and ${cardRef(selectedPair.cardB)} sit close together, and the combination points to ${quickPairMeaning}. ${buildPairAssociationSentence({
              cardA: selectedPair.cardA,
              cardB: selectedPair.cardB,
              subjectId,
              domain,
              random,
            })}`,
            `Near the center, ${cardRef(selectedPair.cardA)} with ${cardRef(selectedPair.cardB)} points to ${quickPairMeaning}. ${buildPairAssociationSentence({
              cardA: selectedPair.cardA,
              cardB: selectedPair.cardB,
              subjectId,
              domain,
              random,
            })}`,
            `${cardRef(selectedPair.cardA)} beside ${cardRef(selectedPair.cardB)} sharpens the reading around ${quickPairMeaning}. ${buildPairAssociationSentence({
              cardA: selectedPair.cardA,
              cardB: selectedPair.cardB,
              subjectId,
              domain,
              random,
            })}`,
            `The nearest hinge sits between ${cardRef(selectedPair.cardA)} and ${cardRef(selectedPair.cardB)}, pointing to ${quickPairMeaning}. ${buildPairAssociationSentence({
              cardA: selectedPair.cardA,
              cardB: selectedPair.cardB,
              subjectId,
              domain,
              random,
            })}`,
            `${cardRef(selectedPair.cardA)} with ${cardRef(selectedPair.cardB)} make the central tension easier to name: ${quickPairMeaning}. ${buildPairAssociationSentence({
              cardA: selectedPair.cardA,
              cardB: selectedPair.cardB,
              subjectId,
              domain,
              random,
            })}`,
          ],
          random,
        );
      })()
    : choose(
        [
          "No single nearby pair dominates, so meaning depends more on overall pattern than one isolated combination.",
          "The cards near the center spread their influence broadly rather than concentrating in one strong pairing.",
          "Without a dominant pairing near the center, the reading distributes its weight more evenly across the field.",
        ],
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
  const backgroundConnector = choose(
    [
      "Beneath that first layer,",
      "Underneath the immediate picture,",
      "Looking past the headline cards,",
      "Behind the central impression,",
    ],
    random,
  );
  const backgroundSentence =
    knightCards.length > 0
      ? `${tableauSynthesis.atmosphereSentence} ${backgroundConnector} ${choose(
          [
            `a longer thread runs through ${diagonalThread}, while side links around ${knightBrief} show the story developing in stages.`,
            `the diagonals run through ${diagonalThread}, while ${knightBrief} tighten the timing around that longer movement.`,
            `${diagonalThread} read as a slow build, while ${knightBrief} show where the pace changes.`,
            `the wider motion runs through ${diagonalThread}; off-angle links to ${knightBrief} show results arriving step by step.`,
            `a quieter layer runs through ${diagonalThread}, while ${knightBrief} show where the rhythm starts to shift.`,
          ],
          random,
        )} Read together, the diagonals show the underlying direction of travel, while the off-angle links show where smaller factors can interrupt, accelerate, or redirect that direction. Taken together, this is the slower line of development rather than the headline turn of events.`
      : `${tableauSynthesis.atmosphereSentence} ${backgroundConnector} ${choose(
          [
            `a quieter pattern runs through ${diagonalThread}, pointing to movement by stages rather than abrupt change.`,
            `${diagonalThread} suggest progress that gathers gradually once the separate threads are read together.`,
            `the diagonal frame linking ${diagonalThread} implies a slow build rather than a dramatic turn.`,
            `${diagonalThread} carry the wider story, and they favor sequence over sudden swings.`,
          ],
          random,
        )} Read together, the diagonals are doing the longer-range work here, showing what gathers by stages rather than arriving all at once. Taken together, this is the slower line of development, and it shows what needs time to assemble before the full picture can be read clearly.`;

  const nearBrief = dedupeCardRefs(proximity.near.map((placement) => placement.cardId), 4);
  const mediumBrief = dedupeCardRefs(proximity.medium.map((placement) => placement.cardId), 4);
  const timingConnector = choose(
    [
      "In terms of timing,",
      "Looking at the sequence of pressure,",
      "As the pace of events goes,",
      "When it comes to what arrives first,",
    ],
    random,
  );
  const timingSentence = `${timingConnector} ${choose(
    [
      `${nearBrief} describe what is immediate, while ${mediumBrief || "the next ring of cards"} shape what follows.`,
      `the first pressure sits with ${nearBrief}; ${mediumBrief || "the cards further out"} show the layer that forms just behind it.`,
      `the near field, ${nearBrief}, speaks to current pressure, and ${mediumBrief || "the outer field"} helps show what gathers next.`,
      `${nearBrief} read as present-tense influence, and ${mediumBrief || "the broader field"} as the sequence forming right behind it.`,
      `${nearBrief} belong to the immediate turn of events, while ${mediumBrief || "the outer field"} describe what is still gathering.`,
      `${nearBrief} speak first; ${mediumBrief || "the next layer out"} describe what follows after.`,
    ],
    random,
  )} ${mediumBrief
    ? "That split matters because the near field describes what is already pressing for attention, while the next ring shows what is forming just behind it."
    : "That split matters because the near field describes what is already pressing for attention, even if the outer layer has not clarified itself yet."}`;

  const synthesisSentence = `${tableauSynthesis.practicalSentence} ${tableauSynthesis.openingsSentence} ${tableauSynthesis.thesisSentence}`;

  const sections: NarrativeSection[] = [
    buildSection("center", "At the Heart", "house", centerSentenceWithTheme),
    buildSection("pair", "What Sits Beside It", "pair", pairSentence),
    buildSection("background", "The Deeper Current", "diagonal", backgroundSentence),
    buildSection("timing", "What Comes Next", "proximity", timingSentence),
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
      const cartoucheSentenceA = choose(
        [
          `The cartouche closes with ${dedupeCardRefs(cartoucheCardIds, 4)}, setting the wrap-up tone after the main field speaks.`,
          `As a final line, the cartouche shows ${dedupeCardRefs(cartoucheCardIds, 4)}, clarifying what settles after the first wave.`,
          `The wrap-up line in cartouche form carries ${dedupeCardRefs(cartoucheCardIds, 4)}, which reads as the spread's closing movement.`,
        ],
        random,
      );
      const cartoucheSentenceB = cartouchePair
        ? choose(
            [
              `${cardRef(cartouchePair.cardA)} with ${cardRef(cartouchePair.cardB)} points to ${pairMeaningToProse(cartouchePair.meaning)}.`,
              `Within that line, ${cardRef(cartouchePair.cardA)} and ${cardRef(cartouchePair.cardB)} suggest ${pairMeaningToProse(
                cartouchePair.meaning,
              )}.`,
            ],
            random,
          )
        : `${cardRef(cartoucheFirstCard.id)} and ${cardRef(cartoucheLastCard.id)} frame a closing shift from ${lowerFirst(
            clause(cartoucheFirstCard.keywords[0]),
          )} toward ${lowerFirst(clause(cartoucheLastCard.keywords[0]))}.`;
      const cartoucheSentenceC = choose(
        [
          `Read alongside ${cardRef(primaryPlacement.cardId)} at the heart of the spread, this closing line suggests outcomes settle through pacing rather than pressure.`,
          `Coming back to ${cardRef(primaryPlacement.cardId)}, the final line points to consequences that arrive once choices have been sustained.`,
          `With ${cardRef(primaryPlacement.cardId)} still holding the center, the cartouche reads as what remains once the immediate tension clears.`,
          `${cardRef(primaryPlacement.cardId)} anchors the reading, and this closing line shows what becomes available once its lesson is followed through.`,
        ],
        random,
      );

      sections.push(buildSection("cartouche", "Cartouche", "timeline", `${cartoucheSentenceA} ${cartoucheSentenceB} ${cartoucheSentenceC}`));
    }
  }

  const themeBridge = buildThemeSectionBridge(resolvedThemeId, random);
  sections.push(
    buildSection("synthesis", "Taken Together", "synthesis", [synthesisSentence, themeBridge].filter(Boolean).join(" ")),
  );

  const conclusionActionCard = primaryCard.id === 28 || primaryCard.id === 29 ? getCardMeaning(primaryHouse.id) : primaryCard;
  const conclusionBridge = choose(
    [
      "The spread points to one place worth reflecting on first.",
      "There is a practical thread worth following through.",
      "The cards suggest one place where a direct response would land first.",
      "That picture leaves one thread that concentrates the reading more than the others.",
      "One part of the spread carries more weight than the rest, and that is where action would count most.",
      "If the reading has a single strongest signal, it gathers here.",
      "The cards converge on one point more clearly than anywhere else in the spread.",
    ],
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
        `${labels[0]} opens with ${cardRef(cards[0].id)}: ${situationThread}. This sets the emotional weather for everything that follows. ${buildCardAssociationSentence(cards[0], subjectId, domain, random)}`,
        `With ${cardRef(cards[0].id)} in ${labels[0].toLowerCase()}, the starting picture is already clear: ${situationThread}. ${buildCardAssociationSentence(cards[0], subjectId, domain, random)}`,
        `${cardRef(cards[0].id)} in ${labels[0]} sets the tone: ${situationThread}. ${buildCardAssociationSentence(cards[0], subjectId, domain, random)}`,
        `The sequence begins in ${labels[0]} with ${cardRef(cards[0].id)}: ${situationThread}. ${buildCardAssociationSentence(cards[0], subjectId, domain, random)}`,
      ],
      random,
  );
  const situationSentence = [situationSentenceBase, buildThemeCardSentence(resolvedThemeId, cards[0].id, cards[0].name, "situation", random)].filter(Boolean).join(" ");

  const pivotSentenceBase = choose(
    [
      `${labels[1]} turns on ${cardRef(cards[1].id)}, so the middle card becomes the point where the sequence can redirect. ${buildCardAssociationSentence(cards[1], subjectId, domain, random)}`,
      `At the pivot, ${labels[1]} places ${cardRef(cards[1].id)} at the center, making this the point where the reading can shift. ${buildCardAssociationSentence(cards[1], subjectId, domain, random)}`,
      `In ${labels[1]}, ${cardRef(cards[1].id)} becomes the pivot, so the next movement depends on how its lesson is handled. ${buildCardAssociationSentence(cards[1], subjectId, domain, random)}`,
      `${cardRef(cards[1].id)} in ${labels[1]} acts as the fulcrum, so this is the point where tone, timing, or choice can change the sequence. ${buildCardAssociationSentence(cards[1], subjectId, domain, random)}`,
      `${labels[1]} centers on ${cardRef(cards[1].id)}, where the whole sequence either opens or tightens. ${buildCardAssociationSentence(cards[1], subjectId, domain, random)}`,
    ],
    random,
  );
  const pivotSentence = [pivotSentenceBase, buildThemeCardSentence(resolvedThemeId, cards[1].id, cards[1].name, "pivot", random)].filter(Boolean).join(" ");

  const directionSentenceBase = choose(
    [
      `The direction in ${labels[2]} comes through ${cardRef(cards[2].id)}: ${directionThread}, once the middle card is handled directly. ${buildCardAssociationSentence(cards[2], subjectId, domain, random)}`,
      `The likely direction shows in ${labels[2]} through ${cardRef(cards[2].id)}, and it suggests ${directionThread} once the pivot is met directly. ${buildCardAssociationSentence(cards[2], subjectId, domain, random)}`,
      `What ${labels[2]} shows through ${cardRef(cards[2].id)}: ${directionThread}, provided the central pressure is handled honestly. ${buildCardAssociationSentence(cards[2], subjectId, domain, random)}`,
      `${labels[2]} closes with ${cardRef(cards[2].id)}, and the directional message is: ${directionThread} when the pivot receives consistent attention. ${buildCardAssociationSentence(cards[2], subjectId, domain, random)}`,
      `${cardRef(cards[2].id)} in ${labels[2]} suggests ${directionThread}, once the middle-card pressure has been worked with directly. ${buildCardAssociationSentence(cards[2], subjectId, domain, random)}`,
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
    ],
    random,
  );
  const closerConnector = choose(
    [
      "From here,",
      "Given that picture,",
      "With that sequence in mind,",
      "Taking all of that,",
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
      `${pivotAction}. That is where the sequence concentrates.`,
      `The reading keeps returning to one thing: ${pivotAction.toLowerCase()}.`,
    ],
    random,
  );
  const conclusion = `${sentence(
    choose(
      [
        `${cardRef(cards[1].id)} is the real hinge in this spread`,
        `The spread turns on ${cardRef(cards[1].id)} more than any other card`,
        `${cardRef(cards[1].id)} shows where the whole sequence either opens or tightens`,
      ],
      random,
    ),
  )} ${conclusionClose}`.trim();

  const themeBridge = buildThemeSectionBridge(resolvedThemeId, random);
  return {
    sections: [
      buildSection("situation", "Where Things Stand", "timeline", situationSentence),
      buildSection("pivot", "The Turning Point", "timeline", pivotSentence),
      buildSection("direction", "Where It Leads", "timeline", directionSentence),
      buildSection("synthesis", "Taken Together", "synthesis", [synthesisConnector, synthesisSentence, buildCardPairBridge(cards[0].id, cards[1].id, cards[0].name, cards[1].name, random), buildCardPairBridge(cards[1].id, cards[2].id, cards[1].name, cards[2].name, random), themeBridge].filter(Boolean).join(" ")),
      buildSection("closer", "The Next Move", "synthesis", closerSentence),
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
    const commaIndex = trimmed.lastIndexOf(",");
    if (commaIndex > 64) {
      return `${trimmed.slice(0, commaIndex)}.`;
    }
    const words = trimmed.split(/\s+/);
    if (words.length > 28) {
      return `${words.slice(0, 28).join(" ")}.`;
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
  const disclaimer = "";

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
