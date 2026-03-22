import { getCardMeaning } from "@/lib/content/cards";
import { getPairMeaning } from "@/lib/content/pairs";
import { findCardPosition, getGTCoord, getProximityBuckets } from "@/lib/engine/gt";
import type { CardPlacement, Domain, GTLayout, SignificatorMode, SubjectId } from "@/lib/engine/types";

export interface PairCandidate {
  cardA: number;
  cardB: number;
  proximityBias: number;
}

export interface RankedPairCandidate extends PairCandidate {
  key: string;
  score: number;
  signal: number;
  meaning: string;
}

export interface SelectedPairCandidate extends RankedPairCandidate {
  topBandKeys: string[];
}

export const PAIR_SELECTION_DELTA = 0.35;

const SUBJECT_PAIR_MEANING_OVERRIDES: Partial<Record<SubjectId, Record<string, string>>> = {
  general_reading: {
    "2-34": "a small opening around flow, support, or whatever needs to start moving again",
    "4-36": "a basic obligation, structural burden, or responsibility that cannot simply be ignored",
    "9-29": "a more helpful tone gathering around your own position, even if that alone is not the full answer",
    "24-33": "what genuinely matters reaching an answer point, so clarity depends on whether the situation can be named honestly",
    "27-28": "the other side of the situation becoming clearer through messages, wording, or details that can no longer stay implied",
    "29-33": "your own clarity becoming the hinge that can unlock the wider situation",
    "34-36": "resources, support, or practical flow becoming tied to a weightier responsibility that has to be handled seriously",
  },
  home_family: {
    "2-34": "a brief opening around practical support, resources, or household flow that could make home life easier if used promptly",
    "4-36": "the household carrying fixed responsibilities, home-base costs, or family obligations that cannot simply be ignored",
    "4-17": "the household entering a period of practical change, move, or gradual improvement that needs the right order to hold",
    "7-29": "your role at home caught inside a complicated dynamic that needs clearer boundaries and less guesswork",
    "8-29": "your place in the household sitting inside a needed ending, pause, or rest period before anything healthier can restart",
    "8-25": "a household commitment, routine, or obligation that may have reached its limit and needs honest reworking",
    "10-11": "a hard boundary or decisive interruption needed to stop the same household strain from replaying",
    "10-29": "a hard boundary or necessary cut landing directly on your role in the household",
    "11-28": "the other person's role in the household getting caught in conflict, pressure, or a pattern that keeps reigniting the same strain",
    "11-29": "your role at home getting caught in repetition or friction, where the same strain keeps replaying until the pattern changes",
    "14-29": "your role at home becoming guarded, over-vigilant, or too shaped by protective strategy",
    "15-23": "household pressure, money, or caregiving weight being carried in a way that is slowly wearing everyone down",
    "16-29": "your role at home becoming clearer once the bigger family direction is named plainly",
    "15-29": "your role at home becoming tied to protection, practical authority, and the question of who is carrying too much",
    "18-22": "support is present, but the household still needs a clear decision about direction",
    "24-33": "the household becomes clearer once care, priorities, and emotional truth are named plainly",
    "21-27": "messages, plans, or paperwork running into delay, so household answers come through patience rather than speed",
    "28-29": "your own position and another person's role inside the household becoming impossible to separate cleanly",
    "34-36": "resources, costs, or practical support carrying more family weight than can be ignored",
  },
  friends_social: {
    "1-5": "an incoming social development meeting slower trust, where the first response matters less than whether steadiness follows",
    "25-33": "a friendship agreement or repeating social pattern reaching the point where the terms have to be clarified, renewed, or consciously revised",
    "33-34": "a clarifying social answer emerging through reciprocity, exchange, or the practical flow between people",
    "29-35": "your own social position being tested by what can actually hold as steady reciprocity and support over time",
    "24-29": "the social dynamic getting pulled back toward what genuinely matters, so trust strengthens when what is alive in the connection is actually protected",
    "16-29": "the longer-view social direction becoming clearer around your own position once the pattern is read more honestly",
    "11-34": "friction getting tied to reciprocity, response flow, or uneven give-and-take inside the social exchange",
    "25-29": "your own boundaries shaping the social pattern, promise, or repeated dynamic that keeps returning",
    "28-29": "your own social position and the other person's role becoming too linked to read from one side alone",
    "29-32": "your social position moving through visibility, reputation, and the emotional weather of the group",
    "29-33": "your own clarity becoming the hinge that helps the social dynamic stop guessing and start responding",
    "29-34": "your social position being shaped by reciprocity, contact flow, and what is or is not being exchanged cleanly between people",
  },
  legal_admin: {
    "1-4": "a notice or procedural movement landing directly on the structural footing of the matter, so the next step depends on how the base terms or file structure are updated",
    "1-10": "a fast-moving notice or procedural update forcing a timely cut, response, or deadline decision that can no longer be postponed",
    "1-35": "the next notice or update testing what can actually hold procedurally, so movement has to be anchored in enforceable terms instead of reaction",
    "1-20": "a public-facing update or procedural notice changing who sees the matter and how quickly the next step moves",
    "1-15": "movement or a new notice meeting real authority, so the next step depends on who can actually move the process and how cleanly they do it",
    "2-13": "a small early-stage opening that matters only if the filing, response, or correction is tightened before the matter hardens",
    "2-7": "a narrow opening being shaped by strategy or mixed motives, so timing only helps if the process is read carefully before anyone commits to the next step",
    "2-3": "a brief procedural opening that matters only if the next routing or transfer step is handled quickly and cleanly",
    "2-28": "the other side of the matter sitting inside a narrow procedural opening, so timing and leverage matter only if that opening is used cleanly",
    "3-22": "routing, transfer, or jurisdiction now depending on a real decision about which path actually reduces uncertainty instead of prolonging it",
    "3-26": "information under review moving into routing, transfer, or jurisdictional handling, so the process depends on where the record is being sent and how clearly it travels",
    "3-27": "a filing, notice, or written record moving into routing, transfer, or jurisdictional handling, so the process depends on where the record is going and how cleanly it travels",
    "3-28": "the other side becoming tied to routing, transfer, or jurisdictional movement, so timing depends on who actually has the file and where their response now has to land",
    "3-19": "routing, transfer, or jurisdiction now meeting formal structure or institutional control, so the next step depends on where the file sits and who actually has authority to move it",
    "3-31": "routing, transfer, or jurisdiction becoming clear enough that the next move can be made with confidence instead of guesswork",
    "4-35": "the structural footing of the matter being tested against what can still hold procedurally, so base terms and enforceable commitments have to support each other",
    "5-28": "the other side of the matter being tied to a slower process, longer review, or something that only proves itself over time, so timing matters more than pressure",
    "5-8": "a matter in pause, closure, or procedural recovery that still requires patient follow-through and documentation strong enough to hold over time",
    "8-18": "a pause, closure, or exhausted phase that now depends on dependable support and what still proves itself through consistency",
    "9-11": "repeat-request pressure meeting a smoother or more workable tone, so the matter only improves if goodwill is used to change the loop instead of cover it",
    "10-13": "a clean procedural cut or forced decision creating an early-stage step where the next correction or filing now matters more than delay",
    "6-7": "uncertain facts getting tangled in strategic pressure or mixed motives, so the process has to be read carefully before any response is committed",
    "6-14": "uncertain facts meeting defensive strategy, so the process has to be clarified before caution hardens into avoidance",
    "6-28": "the other side's position still moving through uncertainty, delay, or incomplete review, so timing depends on what they actually clarify or fail to answer",
    "6-30": "uncertain facts needing measured handling, so calm review matters more than premature certainty",
    "6-33": "the answer or approval point is real, but it only becomes usable once uncertainty is named plainly and the record is clarified enough to trust",
    "7-20": "public visibility getting tangled in strategy or mixed motives, so the process has to stay on substance instead of optics",
    "7-11": "strategic handling and repeat-request pressure feeding each other, so the process only improves when the loop itself is interrupted",
    "8-26": "protected information or reviewed material reaching pause, closure, or the point where one phase has to be closed cleanly",
    "5-11": "repeat-request pressure settling into a long-running process pattern, so the matter only improves through steadier pacing and documentation that can hold up over time",
    "11-31": "repeat-request pressure finally meeting enough visibility or momentum that the process can start moving instead of circling",
    "12-26": "back-and-forth communication circling around information still under review, so clarifying what is documented matters more than talking harder",
    "14-15": "tactical reading meeting real leverage, so the next move depends on reading power clearly rather than reacting to it",
    "14-19": "formal structure being filtered through tactical reading, so the next move depends on reading institutional pressure clearly instead of reacting to it",
    "14-25": "binding terms being filtered through caution, close reading, or defensive handling, so the next commitment has to be judged more carefully than it first appears",
    "16-17": "clear direction and procedural change finally lining up, so the matter can improve once the next steps are sequenced properly",
    "20-30": "measured public handling, visible restraint, or calmer presentation helping the matter read as more credible in the open",
    "20-27": "paperwork, notices, or a filing moving into a more public or reviewable field, so wording and timing matter as much as the filing itself",
    "22-30": "a decision point that now needs measured judgment, steadier handling, and less reactive movement through the process",
    "21-33": "the answer is real, but process blockage means it can only be reached through methodical sequencing rather than pressure",
    "24-28": "the other side becoming central to what the file is actually trying to protect, establish, or make defensible",
    "24-9": "the file's real stake becoming easier to name because the tone, handling, or small openings around the process are improving",
    "24-33": "the approval point becoming clearer once the file's real stake is named plainly and kept above procedural noise",
    "25-33": "binding terms reaching the approval point, so what continues now depends on whether the clause, renewal, or commitment can actually be confirmed cleanly",
    "25-32": "binding terms moving through review cycles or changing visibility, so what continues now depends on how the matter is being read and reassessed",
    "26-28": "the other side becoming tied to information still under review, so timing and leverage depend on what is actually disclosed or withheld",
    "25-28": "the other side becoming tied to binding terms, so timing and leverage now depend on the actual obligations in force",
    "28-33": "the other side becoming central to the approval point, so the next move depends on what they actually disclose, accept, or formally answer",
    "13-28": "the other side of the matter still sitting in an early-stage step, so timing and first responses matter more than pressure",
    "17-28": "the other side of the matter beginning to move or change position, so timing and sequencing matter more than pressure",
    "18-19": "dependable support meeting institutional structure, so the next step depends on who can actually help the process hold and move cleanly",
    "18-22": "support is present, but the matter still needs a clear decision about which procedural path actually reduces uncertainty",
    "18-28": "the other side and dependable support now have to be read together, so the process depends on who is actually reliable enough to back the next step",
    "30-34": "fees, access, or process flow now depending on steadier terms and measured handling rather than speed",
    "25-29": "your side of the matter becoming bound to recurring terms, renewal conditions, or obligations that keep resetting the process",
    "7-29": "your side of the matter getting caught in layered process pressure, tactical reading, or motives that need cleaner boundaries",
    "14-27": "paperwork or notices needing careful reading before any response is treated as final",
    "7-27": "paperwork or notices getting entangled in strategy or mixed motives, so what is stated, withheld, or framed too carefully matters as much as the raw facts",
    "8-27": "a filing, notice, or written record reaching pause, closure, or the end of one cleanly handled phase, so the next move depends on what is complete and what still needs formal closure",
    "21-27": "documents or notices slowed by process, backlog, or formal blockage, so persistence matters more than speed",
    "26-29": "your side of the matter becoming tied to information still under review, so clarity depends on what can be documented",
    "27-33": "the record reaching the approval point, where the next stage depends on what can actually be shown",
    "28-29": "your side of the matter and the other side's position now have to be read together, because timing and leverage sit across both",
    "29-33": "your own clarity becoming the approval point that unlocks the next stage of the matter",
    "29-34": "your side of the matter moving into fees, access, or process flow, so the next step depends on what actually clears, lands, or gets approved",
    "29-35": "your side of the matter being tested by deadlines, enforceability, and what can still hold procedurally",
    "29-31": "your side of the matter becoming clearer and more usable once the process is visible enough to act on",
    "34-35": "fees, access, or process flow finally taking a durable form, but only if movement is anchored in what can actually hold procedurally",
    "34-36": "fees, access, or process flow becoming tied to a heavier obligation that cannot stay vague",
  },
  money: {
    "1-34": "incoming news or a fast-moving development directly affecting the flow of money",
    "2-29": "a small financial opening sitting close to your own choices, so even modest relief matters if you act on it cleanly",
    "3-24": "a move, transfer, or change of direction shaped by what still feels worth backing with real resources",
    "3-18": "a supportive route, practical arrangement, or reliable ally helping the flow move more cleanly",
    "4-36": "fixed obligations and baseline costs carrying real weight in the budget",
    "10-29": "a necessary cut, decision, or reset landing directly on your own financial choices and control",
    "12-34": "conversation and nervous attention sitting directly on the numbers, so signal needs separating from speculation",
    "14-35": "protecting what already holds, so caution serves stability rather than freezing the budget in place",
    "17-34": "cashflow improving through better sequencing and smarter updates",
    "24-33": "clarity arriving around what is still worth backing, so the next move has to satisfy both the numbers and your priorities",
    "25-29": "recurring obligations or payment cycles landing directly on your own financial choices and boundaries",
    "28-29": "your own financial choices and another party's position becoming tightly linked, so the numbers cannot be read from one side alone",
    "26-28": "another person's position or withheld information affecting the numbers more than appearances suggest",
    "26-29": "part of the money story still sitting off the page, where records or withheld details matter more than appearances",
    "29-34": "your own choices sitting directly on the flow of money, making personal control and cash movement inseparable",
    "29-31": "your financial role becoming clearer, so confidence improves once the numbers are faced directly",
    "29-33": "your own clarity and priorities becoming the hinge that unlocks the next financial phase",
    "29-35": "what you can actually hold, fund, or sustain over time becoming the real stabilizing question",
  },
  personal_growth: {
    "1-29": "movement beginning once your own stance is clear enough to act on instead of only reflecting",
    "4-20": "the public self and private foundations needing cleaner alignment, so growth depends on living what you say you value",
    "12-17": "constructive change needing quieter, clearer dialogue so growth is guided by sequence rather than anxious spin",
    "12-30": "anxious dialogue needing calmer pacing and more mature handling so growth is not driven by inner noise",
    "14-29": "self-protective strategy shaping your stance more than you may realize, so discernment matters more than suspicion",
    "21-29": "the blockage landing personally, so steadiness and cleaner boundaries matter more than forcing progress",
    "22-29": "the road changing once you make a real choice about who you are willing to be",
    "26-33": "what has been hidden or half-known finally becoming usable clarity",
    "29-32": "your inner life moving through emotional cycles, self-image, and the changing visibility of growth",
    "29-33": "your own clarity becoming the hinge that unlocks the next step in growth",
    "29-35": "your growth being tested by what can actually hold once the first emotional wave passes",
  },
  creative: {
    "9-29": "your creative process gathering a more encouraging response or smoother opening, but only if it is used concretely",
    "10-29": "your creative process hitting a necessary cut, edit, or sharp correction that cannot stay deferred",
    "14-29": "creative strategy and overcontrol shaping the work more than you may realize, so craft needs separating from defensiveness",
    "16-29": "the larger creative signal becoming clearer around your own work once the pattern is named plainly",
    "17-29": "the work beginning to improve once revision is made in the right order",
    "20-29": "your creative process becoming shaped by audience, community, or the visible field around the work",
    "21-29": "the block landing directly on the work, so sequencing matters more than force",
    "23-29": "your creative process being worn down by repeated drain, attrition, or the little losses that keep stealing momentum",
    "24-29": "the work becoming tied to what genuinely matters, so the process strengthens when it protects what is actually alive in it",
    "28-29": "your creative process becoming too entangled with audience, collaborator, or outside response to read from your side alone",
    "29-30": "the work asking for maturity, restraint, and a steadier hand instead of more noise or urgency",
    "29-31": "your own work becoming clearer, more visible, and easier to trust once traction and result signal start returning",
    "29-32": "your creative process moving through recognition cycles, visibility swings, and the emotional weather of being seen",
    "29-33": "your own creative clarity becoming the hinge that unlocks the next step in the work",
    "29-35": "the work being tested by what can genuinely hold as practice and sustainable output",
  },
  travel: {
    "1-9": "a helpful update, invitation, or smoother handling arriving right where the trip needs a practical opening",
    "1-29": "the next movement or update landing directly on your travel plans, so timing depends on what is actually confirmed now",
    "16-29": "your route becoming clearer once the longer-view timing pattern starts making practical sense",
    "2-13": "a small opening or early-stage plan that helps only if it is used promptly and kept realistic",
    "3-29": "your travel picture entering movement, transfer, or route change that alters how the next stage unfolds",
    "6-29": "your travel picture moving through uncertainty, changing conditions, or information that is not stable yet",
    "9-29": "a smoother opening or more helpful handling gathering around your travel plans, but only if it is used concretely",
    "10-29": "a sharp reroute, clean cut, or fast decision landing directly on your travel plans",
    "17-29": "your travel situation beginning to improve once change is made in the right order",
    "21-29": "the delay or blockage landing directly on your route, so resequencing matters more than force",
    "22-29": "the route choice now sitting squarely with you, so the trip changes when your decision does",
    "26-33": "hidden details or half-known information turning into usable travel clarity",
    "28-29": "your route and another person's timing becoming too linked to read separately, so planning depends on both sides",
    "29-33": "your own clarity becoming the hinge that unlocks the next travel step",
    "29-35": "your plans being tested by what can still hold once delay or stress hits",
  },
  education: {
    "2-18": "a brief opening helped by reliable support, where a small chance matters because someone steady is actually backing it",
    "1-2": "an early notice or update arriving inside a narrow but usable timing window",
    "5-29": "your learning path needing steadier practice, more realistic pacing, and skill-building that only compounds over time",
    "6-29": "your learning path moving through unclear requirements, mixed signals, or information that still needs clarifying before you commit harder",
    "16-29": "the longer-view study signal becoming clearer around your own learning path once the pattern is named plainly",
    "13-29": "your learning path still sitting in an early stage, where first study habits matter more than promises or pressure",
    "18-29": "steady support, tutoring, or reliable feedback helping the learning path hold long enough to become more workable",
    "29-34": "your learning path being shaped by workload flow, fees, materials, or practical resources that need to keep moving cleanly",
    "22-29": "the study-path choice now sitting squarely with you, so progress depends on which direction you actually commit to",
    "27-29": "applications, notices, or written requirements bringing your learning path into clearer practical focus",
    "28-29": "your progress becoming too tied to another person's expectations, judgment, or timetable to read from your side alone",
    "29-31": "your own work becoming more visible and easier to trust once confidence and clearer results start returning",
    "29-33": "your own clarity about the learning path becoming the hinge that unlocks the next step",
    "29-35": "your study path being tested by what can actually hold as routine, stamina, and steady effort",
  },
  health: {
    "16-29": "clearer guidance beginning to form around recovery once the larger pattern is named plainly",
    "18-29": "steady support helping recovery hold long enough to see what is genuinely sustainable",
    "5-23": "healing and depletion sitting side by side, so recovery depends on stopping the drain as much as adding support",
    "5-29": "your wellbeing needing patient recovery, better pacing, and fewer demands on a system that is already asking to heal",
    "8-29": "your wellbeing entering a rest, pause, or recovery phase that has to be honored before more effort will help",
    "12-29": "your nervous system and your own wellbeing getting tangled together, so stress regulation matters as much as explanation",
    "17-29": "your wellbeing beginning to improve once change is made in the right order and at the right pace",
    "24-29": "your wellbeing becoming tied to what genuinely nourishes you, so recovery depends on protecting what is actually restorative",
    "23-29": "your system being worn down by repeated drain, stress, or low-grade depletion that cannot stay in the background",
    "28-29": "your wellbeing getting entangled with another person's needs, expectations, or mirror dynamics, so recovery depends on separating what is yours from what you keep carrying for others",
    "29-31": "your wellbeing becoming clearer and easier to support once energy and signal start returning",
    "29-32": "your wellbeing moving through cycles, sensitivity, or changing internal weather that need to be tracked honestly",
    "29-33": "clarity about what genuinely helps your wellbeing starting to unlock the next step",
    "29-34": "your wellbeing responding once circulation, practical support, or what helps things move starts flowing more cleanly",
    "29-35": "your wellbeing being tested by what can actually hold as routine, rest, and staying power",
    "30-34": "practical support and steadier pacing needing to work together, so the body trusts recovery because the basics are actually being carried consistently",
  },
  purpose_calling: {
    "2-17": "a small but real opening for change on the path, provided improvement is sequenced rather than left to hope",
    "7-29": "your path moving through mixed motives, hidden tension, or a dynamic that needs cleaner boundaries and less guesswork",
    "10-29": "a necessary cut or refusal landing directly on your path, so vocation can be separated from habit or pressure",
    "16-29": "clearer direction beginning to form around your path once the larger pattern is named plainly",
    "16-18": "steady support helping your path become clearer, provided guidance is turned into something you can actually live",
    "16-20": "guidance becoming visible in the wider field, so the path asks to be lived in public rather than imagined in private",
    "18-29": "steady support helping your path hold long enough to see what is genuinely sustainable",
    "24-28": "another person's pull or expectations resonating with what feels meaningful, so you need to separate genuine calling from relational gravity",
    "27-29": "the path becoming clearer once it is named plainly and given terms you can actually live by",
    "25-29": "your path being shaped by recurring promises, inherited loyalties, or commitments that need to be chosen again on purpose",
    "22-29": "the path changing once you make a real choice instead of circling the same uncertainty",
    "28-29": "your path and another person's expectations becoming too entangled to read cleanly, so boundaries matter more than pleasing both sides",
    "24-29": "your path becoming clearer through what still feels deeply true",
    "29-33": "your own clarity becoming the hinge that unlocks the next phase of the path",
  },
  work: {
    "7-29": "your role at work moving through politics, mixed motives, or a dynamic that needs cleaner boundaries and clearer incentives",
    "8-11": "a repeated work strain showing an old workflow or pressure pattern has reached its limit",
    "12-29": "your role at work being shaped by meetings, status chatter, and too many short-cycle decisions",
    "15-29": "your role being shaped by authority, budget pressure, or who actually controls the resources",
    "19-33": "a formal answer, policy decision, or structural approval path becoming the key to progress",
    "21-29": "the blockage landing directly on you, so slower sequencing matters more than force",
    "21-26": "information or access being slowed by process, hierarchy, or restricted knowledge",
    "29-33": "your own decision becoming the hinge that can unlock a stuck process",
    "28-29": "your position and the other side's expectations needing explicit alignment before the work can move cleanly",
  },
};

export function pairKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function buildAdHocPairMeaning(cardA: number, cardB: number, domain: Domain): string {
  const left = getCardMeaning(cardA);
  const right = getCardMeaning(cardB);

  return `${left.name} + ${right.name} points to a blend of ${left.keywords[0]} and ${right.keywords[0]}, asking you to ${left.action} while staying alert to ${right.caution.toLowerCase()}.`;
}

export function resolvePairMeaningForSubject(
  cardA: number,
  cardB: number,
  domain: Domain,
  subjectId?: SubjectId,
): string {
  const key = pairKey(cardA, cardB);
  const subjectOverride = subjectId ? SUBJECT_PAIR_MEANING_OVERRIDES[subjectId]?.[key] : null;
  if (subjectOverride) {
    return subjectOverride;
  }

  const repositoryMeaning = getPairMeaning(cardA, cardB);
  return repositoryMeaning?.meanings[domain] ?? buildAdHocPairMeaning(cardA, cardB, domain);
}

export function resolvePrimarySignificatorPlacement(
  layout: CardPlacement[],
  mode: SignificatorMode,
  gtLayout: GTLayout,
): { primarySignificator: number; primaryPos: number } {
  const querentPos = findCardPosition(layout, 29);
  const counterpartPos = findCardPosition(layout, 28);

  const primarySignificator =
    mode === "other"
      ? 28
      : mode === "relationship"
        ? 29
        : mode === "open"
          ? (querentPos && counterpartPos && counterpartPos < querentPos ? 28 : 29)
          : 29;

  let primaryPos = findCardPosition(layout, primarySignificator) ?? 1;
  if (!getGTCoord(primaryPos, gtLayout)) {
    const fallbackMain = layout.find((placement) => placement.zone === "main");
    if (fallbackMain) {
      primaryPos = fallbackMain.position;
    }
  }

  return {
    primarySignificator,
    primaryPos,
  };
}

export function buildGrandTableauPairCandidates(
  layout: CardPlacement[],
  mode: SignificatorMode,
  gtLayout: GTLayout,
): {
  primarySignificator: number;
  primaryPos: number;
  candidates: PairCandidate[];
} {
  const { primarySignificator, primaryPos } = resolvePrimarySignificatorPlacement(layout, mode, gtLayout);
  const proximity = getProximityBuckets(primaryPos, layout, gtLayout);

  const nearCandidates = proximity.near.slice(0, 5).map((placement, index) => ({
    cardId: placement.cardId,
    proximityBias: 2.2 - index * 0.35,
  }));

  const candidates: PairCandidate[] = [];
  for (let i = 0; i < nearCandidates.length; i += 1) {
    for (let j = i + 1; j < nearCandidates.length; j += 1) {
      candidates.push({
        cardA: nearCandidates[i].cardId,
        cardB: nearCandidates[j].cardId,
        proximityBias: nearCandidates[i].proximityBias + nearCandidates[j].proximityBias,
      });
    }
  }

  return {
    primarySignificator,
    primaryPos,
    candidates,
  };
}

export function buildThreeCardPairCandidates(cardIds: number[]): PairCandidate[] {
  if (cardIds.length < 2) {
    return [];
  }

  const first = cardIds[0];
  const second = cardIds[1];
  const third = cardIds[2];

  const candidates: PairCandidate[] = [
    { cardA: first, cardB: second, proximityBias: 0 },
  ];

  if (typeof third === "number") {
    candidates.push(
      { cardA: second, cardB: third, proximityBias: 0 },
      { cardA: first, cardB: third, proximityBias: 0 },
    );
  }

  return candidates;
}

export function rankPairCandidates(candidatePairs: PairCandidate[], domain: Domain, subjectId?: SubjectId): RankedPairCandidate[] {
  return candidatePairs
    .map((pair) => {
      const repositoryMeaning = getPairMeaning(pair.cardA, pair.cardB);
      const signal = repositoryMeaning?.signal ?? 18;
      const significatorBonus =
        pair.cardA === 29 || pair.cardB === 29 || pair.cardA === 28 || pair.cardB === 28 ? 2.2 : 0;
      const score = signal + pair.proximityBias + significatorBonus;

      return {
        ...pair,
        key: pairKey(pair.cardA, pair.cardB),
        score,
        signal,
        meaning: resolvePairMeaningForSubject(pair.cardA, pair.cardB, domain, subjectId),
      };
    })
    .sort((left, right) => right.score - left.score || left.key.localeCompare(right.key));
}

export function selectBestPair(
  candidatePairs: PairCandidate[],
  domain: Domain,
  random: () => number,
  subjectId?: SubjectId,
): SelectedPairCandidate | null {
  const ranked = rankPairCandidates(candidatePairs, domain, subjectId);
  if (!ranked.length) {
    return null;
  }

  const topScore = ranked[0].score;
  const topBand = ranked.filter((pair) => topScore - pair.score <= PAIR_SELECTION_DELTA);
  const chosen = topBand[Math.floor(random() * topBand.length)] ?? topBand[0];

  return {
    ...chosen,
    topBandKeys: topBand.map((pair) => pair.key),
  };
}

export function selectTopPair(candidatePairs: PairCandidate[], domain: Domain, subjectId?: SubjectId): RankedPairCandidate | null {
  return rankPairCandidates(candidatePairs, domain, subjectId)[0] ?? null;
}
