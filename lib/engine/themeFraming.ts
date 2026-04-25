import { getThemeDefinition } from "@/lib/content/themes";
import type { ThemeId } from "@/lib/content/themes";
import { CARD_THEME_LENS } from "@/lib/engine/cardThemeLens";

function pick<T>(arr: T[], random: () => number): T {
  return arr[Math.floor(random() * arr.length)];
}

/**
 * Per-theme lens phrases. Each entry describes what that theme is looking for
 * when reading any card — the interpretive angle it brings to a position.
 * Format: noun/gerund phrase that completes "[card] points to / shows [lens]."
 */
const THEME_LENS: Partial<Record<ThemeId, string[]>> = {
  clarity: [
    "where the clearest signal sits before anything else can be trusted",
    "what needs to be visible and legible before action makes sense",
    "where confusion or ambiguity may be the real obstacle",
  ],
  timing: [
    "when things are most likely to move, and what the pace suggests",
    "where sequence and order matter more than force or intention",
    "what the rhythm of the situation is asking for first",
  ],
  hidden_factors: [
    "what is active but not yet fully in view",
    "where an unseen influence may be shaping outcomes",
    "what is working in the background before it becomes explicit",
  ],
  decision: [
    "where a choice is sitting and what it actually asks for",
    "which path this position is pointing toward most clearly",
    "what committing to one direction would actually require",
  ],
  change: [
    "what is shifting and where the movement is coming from",
    "where the situation is in transition rather than settled",
    "what the change is asking to be released or taken up",
  ],
  environment_change: [
    "how a shift in surroundings or context is landing",
    "what needs to adapt as conditions around this change",
    "where adjustment to a new environment is the real work",
  ],
  support: [
    "where help, steadiness, or backing is available",
    "what form of support would actually land here",
    "who or what is holding the situation from behind",
  ],
  delay: [
    "what is being held back and why the timing is not yet right",
    "where patience is the active response rather than stagnation",
    "what the delay is asking to be used for before things move",
  ],
  closure: [
    "what needs to be finished, released, or properly ended",
    "where holding on might be getting in the way of what comes next",
    "what completing this cycle would actually ask for",
  ],
  new_connection: [
    "where a new person or relationship is entering the picture",
    "what is opening up that was not available before",
    "how an unfamiliar presence is changing the field",
  ],
  flirtation: [
    "where attraction or playful interest is in the mix",
    "what is being signaled without full commitment yet",
    "how the lighter or more tentative side of connection shows up",
  ],
  communication: [
    "what is being said, how it is being received, and what still needs to be named",
    "where the exchange between people is the real fulcrum",
    "what the message is, who carries it, and whether the channel is clear",
  ],
  trust: [
    "where reliability and honesty are being tested or confirmed",
    "what would need to be consistent for trust to build here",
    "where faith in another person or process is the real question",
  ],
  distance: [
    "where separation, absence, or disconnection may be doing the shaping",
    "what the gap between people is asking to be acknowledged",
    "how physical or emotional distance is influencing the dynamic",
  ],
  commitment: [
    "where sustained follow-through is the deciding factor",
    "what staying with this fully would actually ask for",
    "the level of dedication this position is calling for",
  ],
  reconciliation: [
    "where repair, return, or resolution is available",
    "what would need to shift for the rift to close",
    "how coming back together is being approached here",
  ],
  third_party: [
    "where another person's presence or influence may be shaping the dynamic",
    "what the outside party brings in — knowingly or not",
    "how a third influence is complicating or clarifying the picture",
  ],
  conflict: [
    "where tension, friction, or opposition is carrying information",
    "what the disagreement is actually about beneath the surface",
    "how the conflict can be worked with rather than avoided",
  ],
  ending_or_separation: [
    "what is completing and what that completion asks to be honored",
    "where parting or release is the natural next movement",
    "how an ending is being handled and what it leaves behind",
  ],
  job_search: [
    "what is most relevant to finding or landing the right role",
    "where the search is stalled and what would move it forward",
    "how readiness, timing, and visibility are combining here",
  ],
  promotion: [
    "what is influencing recognition and advancement",
    "where the path to a higher role is open or blocked",
    "what readiness, visibility, and timing are saying about the next step",
  ],
  workplace_politics: [
    "where informal power and influence may be shaping outcomes",
    "what the alliances, rivalries, or hidden agendas are doing",
    "how navigating the social terrain at work is the real task",
  ],
  leadership: [
    "what leading or directing others is asking for here",
    "where the responsibility to set tone or direction sits",
    "how authority, trust, and clarity are combining in this position",
  ],
  burnout: [
    "where depletion, overextension, or exhaustion may be the real story",
    "what the body or will is signaling as unsustainable",
    "how the toll of ongoing pressure is showing up here",
  ],
  contract_matters: [
    "where the formal terms, agreements, or conditions are in play",
    "what the written or implied obligations are asking for",
    "how the structure of an agreement is influencing what can happen",
  ],
  career_change: [
    "what is shifting in the professional path and where it is heading",
    "where the move from one role or field to another is live",
    "how transition in work context is being navigated here",
  ],
  recognition: [
    "where visibility, acknowledgment, or reward is at stake",
    "what contribution is going unseen and what would change that",
    "how being seen and valued is shaping the situation",
  ],
  boundaries: [
    "where limits, edges, or refusals are the right response",
    "what needs to be named and held clearly for things to work",
    "how establishing a clear boundary changes what is possible",
  ],
  stability: [
    "what is providing steadiness or where it is missing",
    "where the absence or presence of reliable foundations is the real signal",
    "where consistency and durability are the real question",
  ],
  financial_pressure: [
    "where resource strain, constraint, or scarcity may be the real picture",
    "what the financial squeeze is asking to be addressed first",
    "how money stress is shaping decisions and options here",
  ],
  unexpected_gain: [
    "where something arriving without warning is changing the picture",
    "what the sudden improvement or windfall is actually offering",
    "how an unplanned positive shift is best used here",
  ],
  cashflow: [
    "how money is actually moving — in, out, and between",
    "what the actual movement or stagnation of money is signaling here",
    "what the rhythm of income and expense is showing here",
  ],
  investment_caution: [
    "where risk is present and what careful attention to it would look like",
    "what is worth protecting before committing resources",
    "how the danger of overextension or poor timing shows up here",
  ],
  business_growth: [
    "what expansion, development, or building is alive here",
    "where the conditions for growth are present or need strengthening",
    "how the next stage of a business or project is taking shape",
  ],
  debt: [
    "what is owed, accumulated, or weighing on the financial picture",
    "where obligation or financial burden is the central pressure",
    "how the weight of what is carried is influencing options",
  ],
  shared_resources: [
    "what is held in common and how that shared stake is working",
    "where joint finances, assets, or responsibilities are in play",
    "how what belongs to more than one person is being managed",
  ],
  financial_independence: [
    "where self-sufficiency and autonomous financial standing are the aim",
    "what movement toward financial freedom looks like here",
    "how independence from financial reliance on others is being built or blocked",
  ],
  relocation: [
    "where a move — physical, domestic, or circumstantial — is the real subject",
    "what changing location is asking for in terms of readiness and timing",
    "how the prospect or reality of moving is showing up here",
  ],
  family_tension: [
    "where conflict, friction, or unspoken pressure within family may be shaping things",
    "what the domestic disagreement or unresolved dynamic is asking for",
    "how family relationships are pulling on the situation",
  ],
  caregiving: [
    "where the work of supporting, tending to, or caring for another is central",
    "what the demands of caregiving are asking to be sustained or released",
    "how responsibility for another's wellbeing is showing up here",
  ],
  household_stability: [
    "where the steadiness of home life is the real question",
    "what keeps the domestic environment reliable and workable",
    "how the rhythms of a household are holding or under strain",
  ],
  children: [
    "where children — their needs, development, or relationship — are in focus",
    "what a young person's presence or situation is asking for",
    "how parenting, childcare, or family growth is showing up here",
  ],
  repair_or_renovation: [
    "where something physical or structural needs attention, fixing, or rebuilding",
    "what the work of restoring or improving a space is asking for",
    "how repair — literal or metaphorical — is the relevant task",
  ],
  protection: [
    "what needs to be guarded, secured, or shielded here",
    "where safety and prevention are the right focus",
    "how protecting what matters most is showing up as the task",
  ],
  independence_at_home: [
    "where autonomy and personal space within domestic life are in question",
    "what having room to be oneself at home is asking for",
    "how independence from household pressure or expectations shows up",
  ],
  friendship: [
    "where a friendship — its health, reciprocity, or difficulty — is the real subject",
    "what a close peer relationship is asking to be tended to",
    "how the dynamics of a personal friendship are shaping things",
  ],
  social_tension: [
    "where friction, awkwardness, or unease in a social setting is present",
    "what the social difficulty is actually about beneath the surface",
    "how tension between people in a shared space is shaping the situation",
  ],
  group_dynamics: [
    "where the way people interact collectively is what matters most",
    "what the patterns of a group — its energy, roles, or pressures — are doing",
    "how the collective is moving and what that means for this position",
  ],
  networks: [
    "where connections, contacts, or webs of relationship are the resource",
    "what the wider social or professional network is offering or withholding",
    "how reaching through relationships is the practical lever here",
  ],
  gossip_or_hidden_factors: [
    "where information is circulating informally or staying concealed",
    "what is being said behind the scenes and how it is shaping things",
    "how rumor, hearsay, or hidden social knowledge is in play",
  ],
  belonging: [
    "where the question of fitting in, being included, or feeling at home is alive",
    "what genuine belonging — as opposed to surface acceptance — looks like here",
    "how the need to be part of something real is shaping the situation",
  ],
  healing: [
    "where recovery, repair, or restoration is the real work",
    "what the process of coming back to wholeness is asking for",
    "how the body, mind, or relationship is finding its way back",
  ],
  patterns: [
    "where a recurring loop or habitual response is the real subject",
    "what the repeated behavior or dynamic is asking to be seen clearly",
    "how an old pattern is still running and what it would take to change it",
  ],
  self_trust: [
    "where confidence in one's own judgment is being tested or built",
    "what trusting one's own instincts or knowledge would look like here",
    "how doubt or inner certainty is shaping the next move",
  ],
  transition: [
    "where a significant life passage or in-between stage is the real context",
    "what moving from one chapter to the next is asking of this position",
    "how the threshold between what was and what is coming shows up here",
  ],
  independence: [
    "where standing alone or acting without external support is what is needed",
    "what self-direction and personal agency are asking for here",
    "how freedom from outside control or pressure is being worked toward",
  ],
  grounding: [
    "where stability, rootedness, and connection to the present moment are needed",
    "what would bring more solidity and settledness to the situation",
    "how staying with what is real and concrete is the right move",
  ],
  energy: [
    "where vitality, drive, or available force is the relevant question",
    "what the level of energy or capacity is revealing about what is possible",
    "how physical or motivational resources are being used or drained",
  ],
  recovery: [
    "where the work of returning to baseline, health, or strength is in progress",
    "what healing from a difficult period is asking for here",
    "how the process of restoring capacity is showing up in this position",
  ],
  stress_load: [
    "where accumulated strain, pressure, or overload is the real picture",
    "what carrying too much is doing to judgment, energy, and options",
    "how the weight of ongoing demand is shaping this moment",
  ],
  routine: [
    "where regular habits, rhythms, or daily structure are doing the work",
    "what a consistent, repeatable practice is offering or withholding",
    "how the reliability of a routine is supporting or constraining things",
  ],
  rest: [
    "where stepping back, pausing, or doing less is the right response",
    "what genuinely restorative rest would look like in this situation",
    "how recovery through stillness and non-action is being called for",
  ],
  wellbeing: [
    "where overall health — physical, mental, or emotional — is the real story",
    "what supporting oneself holistically looks like in this position",
    "how the state of being well or unwell is showing up here",
  ],
  behavior: [
    "where actions, habits, or conduct — one's own or another's — are what matters",
    "what the behavioral pattern is asking to be noticed or changed",
    "how what is done repeatedly is shaping the outcome here",
  ],
  bonding: [
    "where connection, attachment, and the building of closeness are in focus",
    "what strengthening the bond between people or beings is asking for",
    "how the quality of emotional connection is being developed or tested",
  ],
  comfort: [
    "where ease, safety, and feeling settled are what is being sought",
    "what genuine comfort — as opposed to numbing — looks like here",
    "how the need to feel secure and at ease is shaping the situation",
  ],
  inspiration: [
    "where a spark, idea, or creative impulse is the starting point",
    "what is igniting energy or imagination in this position",
    "how the arrival of something new and energizing is being received",
  ],
  creative_block: [
    "where resistance, stuckness, or the inability to start is the real obstacle",
    "what is getting in the way of creative flow and what would shift it",
    "how being unable to move forward on work is showing up here",
  ],
  momentum: [
    "where forward movement, building energy, or gathering pace is at work",
    "what is driving things forward and what is slowing the build",
    "how the accumulation of progress is showing up in this position",
  ],
  visibility: [
    "where being seen, recognized, or known for your work is the question",
    "what increased visibility would ask for — or what is keeping it back",
    "how the quality of attention on what you do is shaping things",
  ],
  collaboration: [
    "where working with others toward a shared output is what is called for",
    "what a creative or professional partnership is offering here",
    "how joint effort, shared work, and cooperative making show up",
  ],
  craft: [
    "where skill, technique, and the quality of execution are what matter most",
    "what the practice of making something well is asking for here",
    "how dedication to the craft itself is showing up in this position",
  ],
  risk: [
    "where a gamble, uncertain move, or exposure to loss is the real context",
    "what accepting risk consciously would look like here",
    "how the possibility of failure or reward is shaping the decision",
  ],
  completion: [
    "where finishing, wrapping up, or bringing something to a close is the work",
    "what getting to done — fully, not partially — would require here",
    "how the pull toward ending or delivering is showing up in this position",
  ],
  planning: [
    "where the work of preparing, structuring, or thinking ahead is what is needed",
    "what having a clear plan before moving would change here",
    "how the quality of forethought is shaping what is possible",
  ],
  delays: [
    "where holdups, slow movement, or waiting is the real condition",
    "what the delay is asking to be acknowledged and worked with",
    "how something not arriving on the expected timeline is shaping things",
  ],
  safe_travel: [
    "where the safety, practicality, and smooth passage of a journey are in focus",
    "what keeping travel protected and well-managed is asking for",
    "how the conditions for safe movement are present or need attention",
  ],
  opportunity: [
    "where an opening, possibility, or favorable moment is available",
    "what recognizing and using an opportunity would actually require",
    "how the window of chance is showing up and how long it stays open",
  ],
  documents: [
    "where paperwork, official records, or formal information is the real subject",
    "what getting the documentation right is asking for here",
    "how written records, forms, or official materials are shaping the situation",
  ],
  study_path: [
    "where the direction and shape of a learning journey are in question",
    "what the educational path forward is asking for in terms of choice and commitment",
    "how the course of study is clarifying or becoming more complicated",
  ],
  applications: [
    "where applying — for a role, course, program, or opportunity — is the action",
    "what the process of putting oneself forward formally is asking for",
    "how the moment of application and its outcome is showing up here",
  ],
  exams: [
    "where testing, evaluation, or formal assessment is the real pressure",
    "what preparation and performance under examination are asking for",
    "how the stakes of being formally measured are showing up in this position",
  ],
  qualification: [
    "where gaining credentials, formal recognition, or official status is the aim",
    "what becoming qualified — fully and properly — is asking for here",
    "how the path to certified competence is showing up in the cards",
  ],
  mentorship: [
    "where guidance, teaching, or learning from someone more experienced is in play",
    "what the presence of a guide, teacher, or mentor is offering here",
    "how being mentored — or taking on a mentoring role — is shaping things",
  ],
  skill_building: [
    "where developing, improving, or deepening a skill is the real work",
    "what the practice of getting better at something is asking for here",
    "how the effort to grow in competence is showing up in this position",
  ],
  focus: [
    "where concentrated, undivided attention is what is needed",
    "what narrowing the field and staying with one thing would change here",
    "how the ability to sustain attention is shaping what is possible",
  ],
  intuition: [
    "where inner knowing, felt sense, or non-rational intelligence is the guide",
    "what trusting what is known without being fully able to explain it looks like here",
    "how the quieter signal — beneath the obvious — is pointing",
  ],
  alignment: [
    "where being in accord with one's values, direction, or deeper sense of rightness is at stake",
    "what living in alignment — rather than contradiction — would ask for here",
    "how the feeling of fit between inner truth and outer action is showing up",
  ],
  sacred_timing: [
    "where the right moment — rather than the forced one — is what the situation calls for",
    "what waiting for the natural opening looks like, as opposed to pushing",
    "how trusting in a larger timing beyond personal control is being invited",
  ],
  signs: [
    "where meaningful signals, synchronicities, or patterns are pointing",
    "what the repeating or significant signs are saying if taken seriously",
    "how external events are carrying internal meaning in this position",
  ],
  discernment: [
    "where careful, clear-eyed judgment is what is being asked for",
    "what the difference between a real signal and a false one looks like here",
    "how the ability to distinguish, weigh, and see clearly is shaping things",
  ],
  practice: [
    "where regular, committed engagement with a discipline is the work",
    "what maintaining a consistent spiritual or creative practice is asking for",
    "how the rhythm of daily devotion or exercise is showing up here",
  ],
  audience: [
    "where the question of who is receiving your work or message is in focus",
    "what reaching, building, or connecting with an audience is asking for",
    "how the relationship between creator and the people they are speaking to shows up",
  ],
  shared_purpose: [
    "where a common mission or collective aim is what holds the group together",
    "what working toward something genuinely shared is asking for here",
    "how the alignment of individual effort with a larger goal is showing up",
  ],
  collective_support: [
    "where care, help, or strength coming from a group is the real resource",
    "what collective backing — not just individual effort — looks like here",
    "how the support of a community or team is being offered or withheld",
  ],
  group_tension: [
    "where friction, conflict, or strain within a collective is the real issue",
    "what the disagreement or dynamic disrupting the group is asking to be addressed",
    "how shared space is being strained and what that asks for",
  ],
  participation: [
    "where being actively present and engaged in a collective is the question",
    "what showing up, contributing, and taking part are asking for here",
    "how the level of involvement in a group or community is shaping things",
  ],
  contracts: [
    "where formal agreements, written terms, or legal commitments are the real subject",
    "what the structure of an agreement is asking to be read carefully",
    "how obligations set in writing are shaping what is possible",
  ],
  deadlines: [
    "where time limits, due dates, or the pressure of a hard end point is the context",
    "what working against a deadline is asking for in terms of pace and priority",
    "how the constraint of time is shaping decisions and actions here",
  ],
  approvals: [
    "where waiting for permission, sign-off, or formal authorization is the situation",
    "what the process of getting approval is asking for in terms of patience and preparation",
    "how dependency on another's decision is shaping what is possible",
  ],
  bureaucracy: [
    "where institutional process, red tape, or administrative complexity is the obstacle",
    "what navigating formal systems and their requirements is asking for",
    "how the machinery of procedure is shaping the pace and possibility of movement",
  ],
  compliance: [
    "where meeting requirements, rules, or formal standards is the task",
    "what aligning with what is required — officially or structurally — looks like here",
    "how the obligation to work within a formal framework is showing up",
  ],
  disputes: [
    "where a disagreement, contestation, or formal conflict is the real situation",
    "what the argument or dispute is actually about and where it might resolve",
    "how an active clash of claims or interests is shaping things here",
  ],
  resolution: [
    "where a way through, a settlement, or an end to conflict is becoming possible",
    "what resolving the tension or dispute would actually require",
    "how the path to a workable outcome is showing up in this position",
  ],
  vocation: [
    "where a person's deepest calling or life's work is the real subject",
    "what being truly called to something — not just interested — looks like here",
    "how the question of what one is meant to do is showing up in the cards",
  ],
  right_path: [
    "where the question of direction, alignment, and being on the correct course is central",
    "what following the right path — as opposed to the familiar one — asks for",
    "how clarity about true direction is showing up or being sought",
  ],
  meaning: [
    "where the deeper significance or purpose behind events is what matters",
    "what the reading is saying about what this experience is actually for",
    "how the search for meaning is shaping how the situation is being lived",
  ],
  long_term_direction: [
    "where the wider arc of a life or project — beyond the immediate — is in view",
    "what the long-range trajectory is pointing toward and asking for",
    "how thinking in terms of years rather than weeks is relevant here",
  ],
  service: [
    "where giving, contributing, or dedicating effort to something beyond oneself is the work",
    "what showing up in service to others or a larger mission asks for here",
    "how being of use — without losing oneself — is showing up in this position",
  ],
  calling_shift: [
    "where a change in life direction or purpose is underway or being considered",
    "what moving from one calling or identity toward another is asking for",
    "how the transition between one sense of purpose and another is showing up",
  ],
};

export type CardPosition = "situation" | "pivot" | "direction" | "center";

/**
 * Generates a theme-specific interpretive sentence for a card in a given position.
 * Returns empty string when no theme is set or no lens is defined for this theme.
 */
export function buildThemeCardSentence(
  themeId: ThemeId | null,
  cardId: number,
  cardName: string,
  position: CardPosition | null,
  random: () => number,
): string {
  if (!themeId) return "";
  const cardLens = CARD_THEME_LENS[cardId]?.[themeId];
  const lens = cardLens ?? pick(THEME_LENS[themeId] ?? [], random);
  if (!lens) return "";
  const label = getThemeDefinition(themeId).displayLabel.toLowerCase();

  // When the lens phrase starts with the label word (e.g. label="trust", lens="trust eroded or ended..."),
  // standard templates create immediate repetition: "the trust hinge: trust eroded...".
  // Use inverted templates instead — lens comes first, label appears later with prose distance.
  const lensStartsWithLabel =
    lens.toLowerCase().startsWith(label.toLowerCase() + " ") || lens.toLowerCase() === label.toLowerCase();

  if (lensStartsWithLabel) {
    if (position === "situation") {
      return pick(
        [
          `${lens} — that is the ${label} context ${cardName} opens with.`,
          `${lens}: this is the ${label} ground as ${cardName} reads it.`,
          `${lens} — what ${cardName} names at the ${label} level here.`,
        ],
        random,
      );
    }
    if (position === "pivot") {
      return pick(
        [
          `${lens} — that is the ${label} pressure ${cardName} names at the pivot.`,
          `${lens}: this is the ${label} tension this reading turns on.`,
          `${lens} — the ${label} hinge, and ${cardName} holds it.`,
        ],
        random,
      );
    }
    if (position === "direction") {
      return pick(
        [
          `${lens} — that is where the ${label} thread points, as ${cardName} makes clear.`,
          `${lens}: the ${label} direction, as ${cardName} reads it.`,
          `${lens} — the forward ${label} signal, carried by ${cardName}.`,
        ],
        random,
      );
    }
    if (position === "center") {
      return pick(
        [
          `${lens} — ${cardName} at the center makes the ${label} question this specific.`,
          `${lens}: that is the ${label} core, and ${cardName} carries it.`,
          `${lens} — ${cardName} at the heart of this spread names it directly.`,
        ],
        random,
      );
    }
    // Inverted fallback (no position)
    return pick(
      [
        `${lens} — the ${label} angle ${cardName} names most directly.`,
        `${lens}: this is what ${cardName} points to on ${label}.`,
        `${lens} — ${cardName} read through the ${label} lens.`,
      ],
      random,
    );
  }

  if (position === "situation") {
    return pick(
      [
        `${cardName} sets the ${label} ground here: ${lens}.`,
        `As the opening card, ${cardName} establishes the ${label} context — ${lens}.`,
        `The ${label} foundation here — ${cardName} shows ${lens}.`,
        `What is already in motion in terms of ${label}: ${cardName} names ${lens}.`,
        `${cardName} opens the ${label} frame with ${lens}.`,
        `Through the ${label} lens, the situation begins with ${lens}.`,
      ],
      random,
    );
  }

  if (position === "pivot") {
    return pick(
      [
        `At the ${label} crux, ${cardName} shows ${lens}.`,
        `${cardName} is the ${label} hinge: ${lens}.`,
        `The ${label} tension in this reading centers on ${cardName}: ${lens}.`,
        `The ${label} pivot sits with ${cardName} — ${lens}.`,
        `${cardName} at the pivot names the ${label} pressure directly: ${lens}.`,
        `Through the ${label} lens, the pivot turns on ${lens}.`,
      ],
      random,
    );
  }

  if (position === "direction") {
    return pick(
      [
        `Looking ahead in terms of ${label}, ${cardName} points toward ${lens}.`,
        `Through the ${label} lens, ${cardName} points the way: ${lens}.`,
        `${cardName} shows where the ${label} question leads: ${lens}.`,
        `On the ${label} front, the direction is ${lens}.`,
        `${cardName} carries the ${label} direction: ${lens}.`,
        `Through the ${label} frame, the emerging path is ${lens}.`,
        `The ${label} thread resolves toward ${lens}, as ${cardName} makes clear.`,
        `Where the ${label} current is heading: ${cardName} reads as ${lens}.`,
        `For the ${label} question, the forward signal is ${lens}.`,
      ],
      random,
    );
  }

  if (position === "center") {
    return pick(
      [
        `Centered on ${cardName}, the ${label} question comes into sharpest focus: ${lens}.`,
        `${cardName} sits at the heart of the ${label} question, pointing to ${lens}.`,
        `The ${label} core of this spread — ${cardName} shows ${lens}.`,
        `Through the ${label} lens, the central card speaks directly: ${lens}.`,
        `The ${label} question centers on ${cardName}: ${lens}.`,
        `${cardName} at the center points most directly to ${lens}.`,
      ],
      random,
    );
  }

  // Fallback (no position)
  return pick(
    [
      `Through the ${label} lens, ${cardName} points to ${lens}.`,
      `Through the ${label} frame, ${cardName} shows ${lens}.`,
      `The ${label} angle here: ${cardName} is most directly about ${lens}.`,
      `${cardName} speaks to ${label} by showing ${lens}.`,
    ],
    random,
  );
}

/**
 * Pair combination bridges — what two specific cards say together.
 * Keyed as `${lowerCardId}_${higherCardId}` (order-independent).
 * Each value is a short essential-quality phrase completing:
 *   "Together, [Card A] and [Card B] point to [phrase]."
 */
const CARD_PAIR_BRIDGES: Partial<Record<string, string>> = {

  // ── Rider (1) ───────────────────────────────────────────────────────────────
  "1_2":   "lucky news — a positive message arriving at exactly the right moment",
  "1_3":   "news from afar — a message crossing distance to reach you",
  "1_6":   "a confused or unclear message — news that arrives without sufficient clarity",
  "1_8":   "news of an ending — the message that tells you something is over",
  "1_16":  "inspiring or hopeful news — a message that opens or confirms a vision",
  "1_18":  "news from a trusted friend — a loyal contact carrying the word",
  "1_19":  "official news — a formal announcement or institutional communication",
  "1_21":  "a message delayed or blocked — news held up before it can reach you",
  "1_22":  "news that demands an immediate decision — the message that forces a choice",
  "1_27":  "news confirmed in writing — the message and the document arriving together",
  "1_31":  "wonderful, joyful news — a message carrying genuine brightness",
  "1_33":  "the news that is the breakthrough — the message that changes everything",
  "1_36":  "news carrying difficulty — a message that brings a burden with it",

  // ── Clover (2) ──────────────────────────────────────────────────────────────
  "2_3":   "a lucky journey — a fortunate move or a trip that opens better than expected",
  "2_9":   "double good fortune — luck and joy arriving together",
  "2_23":  "luck being quietly eroded — the small fortune nibbled away before it can be used",
  "2_31":  "a piece of luck that compounds into genuine success — the small opening that turns bright",
  "2_34":  "unexpected financial good fortune — a lucky turn in the flow of money",

  // ── Ship (3) ────────────────────────────────────────────────────────────────
  "3_4":   "a move — the home left behind or the new home being traveled toward",
  "3_8":   "a departure triggered by loss — the journey away from what is ending",
  "3_16":  "a journey guided by vision — moving toward something aspired to, not just away from something",
  "3_17":  "a significant move to a completely new place — change that requires going somewhere",
  "3_19":  "travel for official or institutional reasons — the journey connected to formal business",
  "3_21":  "a journey blocked — movement or travel significantly delayed",
  "3_22":  "a journey at a crossroads — which direction to take when more than one path opens",
  "3_24":  "love at a distance — the heart that travels, or a bond that spans physical separation",
  "3_31":  "a successful journey — travel going exactly as hoped",
  "3_33":  "a journey that is the breakthrough — travel that unlocks a new phase",
  "3_34":  "financial travel — money connected to distance, trade, or international movement",
  "3_35":  "a journey that ends in stability — moving toward somewhere that will hold",

  // ── House (4) ───────────────────────────────────────────────────────────────
  "4_5":   "the healthy, rooted home — a domestic environment with deep strength and vitality",
  "4_8":   "a domestic ending — the home situation coming to a close",
  "4_16":  "the dream home — or the home as the foundation of a larger vision",
  "4_17":  "a domestic transformation — moving home, or a significant shift in the living situation",
  "4_18":  "a loyal domestic partnership — home grounded in genuine, reliable friendship",
  "4_21":  "the home blocked — a domestic situation that cannot currently move forward",
  "4_23":  "domestic erosion — the home and its stability being worn down by persistent small damage",
  "4_25":  "a domestic commitment — the home as the formal expression of a bond",
  "4_33":  "the home as the answer — domestic life as what unlocks this",
  "4_35":  "deep domestic roots — a home that has become its own anchor",
  "4_36":  "the weight of the home — domestic obligation at its heaviest",

  // ── Tree (5) ────────────────────────────────────────────────────────────────
  "5_8":   "a health challenge — the body's vitality in a difficult phase",
  "5_10":  "a decisive health intervention — the surgical action that serves recovery",
  "5_16":  "spiritual health — the soul growing alongside the body, both tended with care",
  "5_17":  "a health transformation — the body changing course",
  "5_23":  "health slowly eroded — the body depleted by accumulated small stresses over time",
  "5_26":  "knowledge of the body — the study of health, medicine, or what the physical self needs",
  "5_27":  "a health document — medical correspondence, test results, or a care-related letter",
  "5_30":  "deep-rooted, mature health — the body sustained by long care and patient attention",
  "5_31":  "radiant health — the body at its strongest and most vital",
  "5_32":  "the mind-body connection — health and emotional life entangled",
  "5_33":  "health restored — the turning point in a recovery process",
  "5_34":  "the financial cost of health — resources and physical wellbeing directly entangled",
  "5_36":  "a long-carried health burden — something borne in the body over time",

  // ── Clouds (6) ──────────────────────────────────────────────────────────────
  "6_7":   "deception hidden beneath confusion — very hard to distinguish what is real",
  "6_10":  "sudden clarity cutting through confusion — the fog lifted by a decisive action",
  "6_19":  "institutional opacity — bureaucratic fog, the system that will not show its workings",
  "6_21":  "fog over an obstacle — confusion making it impossible to see the wall, let alone get around it",
  "6_22":  "a confused decision — unable to choose clearly because the situation remains opaque",
  "6_23":  "erosion in the fog — things quietly diminishing without being clearly noticed",
  "6_26":  "knowledge doubly hidden — obscurity layered over obscurity, very hard to see",
  "6_31":  "confusion finally clearing — the difficult weather breaking into light",
  "6_32":  "deep confusion layered with emotional uncertainty — very little is clear right now",
  "6_33":  "confusion finally broken through — the key that dissolves the fog",

  // ── Snake (7) ───────────────────────────────────────────────────────────────
  "7_8":   "a toxic situation reaching its end — or a cunning, deliberate exit",
  "7_11":  "conflict driven by deception — manipulation working beneath the surface of the argument",
  "7_12":  "deceptive gossip — manipulation travelling through anxious or rumour-driven communication",
  "7_14":  "a sophisticated deception — someone clever and self-serving at work",
  "7_19":  "institutional corruption — the self-serving move inside a formal system",
  "7_20":  "social manipulation — the charming deceiver performing in a public or group setting",
  "7_24":  "betrayal in love — a relationship compromised by self-interest or hidden intent",
  "7_26":  "deliberate concealment — someone withholding information with clear intention",
  "7_31":  "deception finally exposed — what was concealed coming fully into the light",
  "7_35":  "a toxic entanglement that is hard to leave — self-serving roots that run deep",

  // ── Coffin (8) ──────────────────────────────────────────────────────────────
  "8_9":   "an ending mixed with unexpected grace — grief that carries some relief alongside the loss",
  "8_10":  "a decisive, definitive ending — the double close that will not reopen",
  "8_12":  "anxious grief — the ending that also triggers worry about what comes next",
  "8_13":  "the end of innocence — or a child navigating a genuinely difficult passage",
  "8_14":  "a strategic ending — the cunning, calculated withdrawal from a situation",
  "8_15":  "significant financial loss — a large, hard ending in the resource domain",
  "8_16":  "a dream that ends — the vision that has to be released",
  "8_17":  "a complete transformation — dying to one form and being reborn in another",
  "8_19":  "an institution ending — a formal structure or system finally closing down",
  "8_20":  "a social ending — a community dissolving or a social chapter finally closing",
  "8_22":  "the decision to close something — choosing the ending deliberately",
  "8_23":  "depletion and ending combined — double diminishment, things running out and closing down",
  "8_24":  "grief — the heart carrying genuine loss",
  "8_25":  "the formal close of a commitment — the bond officially and finally ended",
  "8_27":  "a formal notice of an ending — the document that makes a close official",
  "8_30":  "a peaceful, dignified ending — a long life or chapter closing with grace",
  "8_32":  "transformation at the level of the unconscious — an ending working in the deepest layer",
  "8_33":  "transformation through ending — the closing that opens into something new",
  "8_35":  "the end of something very deeply rooted — a slow, hard, thorough close",
  "8_36":  "the weight of an ending — a loss that must be carried through",

  // ── Bouquet (9) ─────────────────────────────────────────────────────────────
  "9_16":  "a gift of inspiration — beauty or generosity that opens a new vision",
  "9_18":  "a warm, generous friendship — affection offered freely and genuinely received",
  "9_19":  "official recognition — a formal acknowledgment of beauty, generosity, or achievement",
  "9_20":  "a social celebration — warmth and joy shared openly with many",
  "9_24":  "love expressed as genuine gift — affection offered openly and freely",
  "9_31":  "genuine, celebrated joy — the warmth that cannot be mistaken for anything else",

  // ── Scythe (10) ─────────────────────────────────────────────────────────────
  "10_16": "a dream cut short — vision interrupted by a sudden, decisive severance",
  "10_19": "institutional dissolution — the formal structure cut down or decisively dismantled",
  "10_22": "the decision that eliminates alternatives — choosing by cutting off every other path",
  "10_25": "the severing of a commitment — a bond cut through decisively",
  "10_33": "decisive action as breakthrough — the cut that finally frees the path",
  "10_35": "cutting away what has kept you stuck — the release of a root that no longer serves",

  // ── Whip (11) ───────────────────────────────────────────────────────────────
  "11_8":  "the end of a recurring conflict — the pattern finally laid to rest",
  "11_12": "anxious conflict — worry and argument so layered they reinforce each other",
  "11_19": "institutional conflict — formal disciplinary action or an official dispute",
  "11_24": "a conflict rooted in genuine passion — the argument between people who truly care",
  "11_25": "conflict within a commitment — the persistent argument inside the bond",
  "11_35": "a deeply entrenched conflict — the argument that has become part of the structure",
  "11_36": "persistent conflict becoming a burden — the argument that has gone on far too long",

  // ── Birds (12) ──────────────────────────────────────────────────────────────
  "12_16": "anxious hope — wanting something so much that the wanting itself becomes a worry",
  "12_22": "anxious indecision — worry and paralysis layered so tightly they reinforce each other",
  "12_24": "anxiety about love — worried energy directed at what the heart most wants",
  "12_27": "anxious written communication — the message that feeds rather than settles worry",
  "12_32": "anxiety rooted in the unconscious — worries that come from below the surface",

  // ── Child (13) ──────────────────────────────────────────────────────────────
  "13_5":  "a child's health or growth — a young person in an important developmental phase",
  "13_16": "a child's potential — a new beginning full of bright, hopeful possibility",
  "13_17": "a genuine new arrival — birth, a fresh start, something wholly new entering life",
  "13_24": "love for a child — or the open-hearted, innocent quality of early love",
  "13_31": "the joy of something fresh and bright just starting — a new beginning at its most open",
  "13_35": "a new beginning taking root — the fresh start finding its grounding",

  // ── Fox (14) ────────────────────────────────────────────────────────────────
  "14_15": "strategic self-interest in a power or financial context — the cunning move for personal gain",
  "14_19": "strategic maneuvering within an institution — the fox inside the tower",
  "14_23": "cunning erosion — small, deliberate losses inflicted by someone acting in self-interest",
  "14_26": "deliberate secrecy — someone who knows more than they are showing and planned it that way",

  // ── Bear (15) ───────────────────────────────────────────────────────────────
  "15_19": "significant institutional power — a large organisation or an imposing figure within one",
  "15_31": "powerful success — authority and achievement meeting at their peak",
  "15_34": "significant financial strength — money and resources in genuine abundance",
  "15_35": "powerful, unmoveable stability — strength built to last and hard to challenge",
  "15_36": "the burden of power — authority or financial obligation at serious scale",

  // ── Stars (16) ──────────────────────────────────────────────────────────────
  "16_17": "a transformation guided by genuine vision — changing in the direction of what you aspire to",
  "16_19": "institutional ambition — the vision of climbing within or through a formal system",
  "16_20": "a public vision — collective aspiration shared openly with many",
  "16_21": "a dream blocked — the vision meeting a significant obstacle",
  "16_22": "the choice guided by vision — deciding in the direction of genuine aspiration",
  "16_24": "love as spiritual calling — the heart and the soul pointing in the same direction",
  "16_31": "a vision realized — the dream meeting the light and becoming real",
  "16_32": "spiritual guidance through emotional uncertainty — the vision that appears in the dark",
  "16_33": "a vision that becomes real — hope that unlocks into genuine possibility",
  "16_34": "financial vision — aspiring toward abundance and material independence",
  "16_35": "a stable, long-term vision — ambition with deep roots, aspiration that endures",
  "16_36": "a dream that has become a burden — the aspiration that costs too much to keep carrying",

  // ── Stork (17) ──────────────────────────────────────────────────────────────
  "17_22": "transformation through deliberate choice — the change that comes from finally deciding",
  "17_24": "a transformation in love — the heart's situation genuinely changing",
  "17_31": "a joyful transformation — change that brings brightness and genuine relief",
  "17_35": "a change that leads to lasting stability — transition as the path to genuine groundedness",

  // ── Dog (18) ────────────────────────────────────────────────────────────────
  "18_20": "the loyal social presence — the friend who reliably shows up for the group",
  "18_24": "a loving, loyal friendship — affection and reliability held together",
  "18_25": "loyal commitment — the friendship that has become a genuine, lasting bond",
  "18_35": "the most enduring friendship — loyalty that has held steadily across years",
  "18_36": "a loyal presence in difficulty — the friend who stays through the hardest part",

  // ── Tower (19) ──────────────────────────────────────────────────────────────
  "19_20": "an official public occasion — a formal gathering or institutional event",
  "19_22": "an institutional decision — the formal choice with official consequences",
  "19_24": "feelings within a professional context — the heart navigating an institutional setting",
  "19_26": "official knowledge — the authority of institutional expertise or formal credentials",
  "19_27": "an official document — formal institutional correspondence",
  "19_31": "professional peak — institutional success at its height",
  "19_33": "access gained to what was closed — the institution that finally yields",
  "19_35": "a deeply established institution — the system built to endure",
  "19_36": "institutional burden — the weight of a system that does not bend",

  // ── Garden (20) ─────────────────────────────────────────────────────────────
  "20_22": "the social crossroads — a community at a genuine point of collective choice",
  "20_24": "love expressed publicly — affection shared openly in a social setting",
  "20_31": "public success — being seen at your brightest, recognised openly",
  "20_35": "a stable, long-established community — deep roots in a particular social world",

  // ── Mountain (21) ───────────────────────────────────────────────────────────
  "21_24": "a blocked love — an emotional obstacle standing between the heart and what it wants",
  "21_33": "the obstacle finally cleared — what had been blocking the path now solved",
  "21_35": "immoveable — an obstacle and an anchor pulling in opposite directions",
  "21_36": "an obstacle that has become a burden — stuck and suffering at the same time",

  // ── Crossroads (22) ─────────────────────────────────────────────────────────
  "22_24": "a choice about love — the crossroads whose central question is the heart's direction",
  "22_31": "choosing the bright path — the decision that opens toward genuine success",
  "22_33": "the choice that unlocks everything — deciding is itself the breakthrough",
  "22_35": "the tension between movement and staying — stability or change as the defining question",
  "22_36": "a difficult choice that carries real weight — deciding under genuine burden",

  // ── Mice (23) ───────────────────────────────────────────────────────────────
  "23_24": "love eroded by accumulated small grievances — feeling diminished by what is never addressed",
  "23_25": "a commitment being slowly undermined — the bond weakened by persistent small damage",
  "23_34": "financial erosion — money slowly diminishing through small, persistent losses",
  "23_35": "the slow undermining of stability — what was solid being quietly worn away",

  // ── Heart (24) ──────────────────────────────────────────────────────────────
  "24_25": "a love commitment — the bond that has become a genuine, stated promise",
  "24_28": "someone in love — or the person whose heart is the central question in this reading",
  "24_29": "the querent's own love — their heart's direction and what it is truly seeking",
  "24_30": "mature love — the deep affection of a long, well-held relationship",
  "24_31": "love at its brightest — the heart in its fullest, most joyful state",
  "24_32": "the heart's hidden life — deep emotional feeling not yet spoken aloud",
  "24_33": "love as the answer — genuine feeling as what unlocks this",
  "24_35": "a deeply stable love — the heart firmly and securely rooted",
  "24_36": "heartbreak — the burden carried when genuine love meets genuine loss",

  // ── Ring (25) ───────────────────────────────────────────────────────────────
  "25_27": "the written commitment — the signed vow, the contract that formalises the bond",
  "25_30": "a long-standing commitment — the bond that has aged well and deepened over time",
  "25_31": "a joyful commitment — the bond in its brightest, happiest state",
  "25_33": "the commitment that is itself the key — making this promise opens everything",
  "25_35": "a deep, long-standing commitment — the bond that has held across years",
  "25_36": "the burden of commitment — honoring a promise at real personal cost",

  // ── Book (26) ───────────────────────────────────────────────────────────────
  "26_27": "written knowledge and written communication held together — the book that became a letter",
  "26_32": "hidden emotional knowledge — the secret that lives in the unconscious",
  "26_33": "knowledge as the breakthrough — the research or study that finally unlocks the path",
  "26_35": "a long, sustained course of study — knowledge built through years of patient learning",

  // ── Letter (27) ─────────────────────────────────────────────────────────────
  "27_31": "positive written news — the letter or document that brings genuine brightness",
  "27_33": "the document that is the key — the letter or contract that changes everything",
  "27_35": "a binding written agreement — the document whose terms hold for the long term",
  "27_36": "a difficult letter — the document that arrives carrying burden",

  // ── Counterpart (28) + Querent (29) ─────────────────────────────────────────
  "28_29": "the two people face to face — what these specific individuals are to each other right now",
  "28_31": "a confident, successful person — the counterpart at their brightest",
  "28_33": "the person who holds the key — the specific person whose involvement unlocks things",

  // ── Querent (29) ────────────────────────────────────────────────────────────
  "29_31": "the querent at their brightest — confident, successful, fully in their own light",
  "29_33": "the querent as the solution — they themselves hold what is needed to move forward",

  // ── Lily (30) ───────────────────────────────────────────────────────────────
  "30_31": "the contentment of a well-lived life — success that has ripened into quiet, lasting satisfaction",
  "30_33": "wisdom as the key — mature, experienced knowledge as what finally unlocks the path",
  "30_35": "the deepest stability — two grounding forces held together, roots and anchor",
  "30_36": "bearing an old burden with grace — the long-carried weight held with maturity and dignity",

  // ── Sun (31) ────────────────────────────────────────────────────────────────
  "31_33": "a breakthrough into success — the decisive opening that lets the light fully in",
  "31_34": "financial success in its clearest form — prosperity flowing freely and openly",
  "31_35": "stable, sustained success — the bright achievement that continues to hold",

  // ── Moon (32) ───────────────────────────────────────────────────────────────
  "32_33": "intuition as the key — trusting the inner knowing is itself the breakthrough",
  "32_34": "the emotional dimension of financial life — how money feels, not just what it does",
  "32_35": "emotional stability found through deep inner work — the anchor beneath the tidal feeling",
  "32_36": "emotional or unconscious suffering — the burden carried in the feeling life",

  // ── Key (33) ────────────────────────────────────────────────────────────────
  "33_34": "financial breakthrough — the insight or action that unlocks the flow of money",
  "33_36": "the breakthrough through difficulty — or the key that finally relieves a long burden",

  // ── Fish (34) ───────────────────────────────────────────────────────────────
  "34_35": "financial stability built over time — resources secured and held steady",
  "34_36": "the weight of financial obligation — debt or scarcity as a genuine burden",

  // ── Anchor (35) + Cross (36) ────────────────────────────────────────────────
  "35_36": "the cost of staying — holding on at significant personal cost",
};

/**
 * Returns a sentence about what two specific cards mean together, or empty string if no bridge exists.
 */
export function buildCardPairBridge(
  cardId1: number,
  cardId2: number,
  card1Name: string,
  card2Name: string,
  random: () => number,
): string {
  const key = `${Math.min(cardId1, cardId2)}_${Math.max(cardId1, cardId2)}`;
  const bridge = CARD_PAIR_BRIDGES[key];
  if (!bridge) return "";
  return pick(
    [
      `Together, ${card1Name} and ${card2Name} point to ${bridge}.`,
      `${card1Name} alongside ${card2Name} speaks of ${bridge}.`,
      `The combination of ${card1Name} and ${card2Name}: ${bridge}.`,
      `What ${card1Name} and ${card2Name} say together — ${bridge}.`,
      `${card1Name} and ${card2Name} side by side describe ${bridge}.`,
      `When ${card1Name} meets ${card2Name}, the reading names ${bridge}.`,
      `The pairing of ${card1Name} and ${card2Name} is specific: ${bridge}.`,
    ],
    random,
  );
}

/**
 * Appended to the "Taken Together" synthesis section.
 * Names the theme as the consistent thread running through the reading.
 */
export function buildThemeSectionBridge(themeId: ThemeId | null, random: () => number): string {
  if (!themeId) return "";
  const label = getThemeDefinition(themeId).displayLabel.toLowerCase();
  return pick(
    [
      `The ${label} thread runs through the whole reading.`,
      `Across the cards, ${label} is the sharpest angle of what the spread is asking.`,
      `What holds the reading together is the ${label} question underneath everything else.`,
      `The ${label} line is consistent from the first card to the last.`,
      `Seen through the ${label} lens, the pattern here is more specific than it first appears.`,
      `The question of ${label} is not incidental here — it is what makes the reading cohere.`,
      `Read with ${label} in mind, the spread becomes more focused and less abstract.`,
      `The ${label} dimension is where the cards concentrate most clearly.`,
    ],
    random,
  );
}

/**
 * Appended to the conclusion.
 * Delivers a direct statement about what the reading says on the theme.
 */
export function pickThemeLensPhrase(themeId: ThemeId | null, random: () => number): string {
  if (!themeId) return "where the central questions of this reading are active";
  const phrases = THEME_LENS[themeId];
  if (!phrases || phrases.length === 0) return "where the central questions of this reading are active";
  const wherePhrases = phrases.filter((p) => p.startsWith("where "));
  return pick(wherePhrases.length > 0 ? wherePhrases : phrases, random);
}

export function buildThemeConclusionLine(themeId: ThemeId | null, random: () => number): string {
  if (!themeId) return "";
  const label = getThemeDefinition(themeId).displayLabel.toLowerCase();
  return pick(
    [
      `When it comes to ${label}, the reading is specific enough to reflect on.`,
      `The reading on ${label} is clear enough to reflect on honestly.`,
      `What the reading says about ${label} is worth taking seriously — the pattern here is clearer than it may feel in the moment.`,
      `The spread has something to say about ${label}; it is worth returning to once the initial read settles.`,
      `The ${label} signal in this reading is consistent — not just one card, but a pattern that repeats across positions.`,
      `On ${label}, the cards are more direct than they might first appear. Sit with what they are actually saying.`,
      `The reading's message about ${label} is not vague — there is enough here to act on, or at least to watch for.`,
    ],
    random,
  );
}
