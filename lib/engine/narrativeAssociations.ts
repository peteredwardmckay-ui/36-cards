import { getCardMeaning, type CardMeaning } from "@/lib/content/cards";
import { getHouseMeaning, type HouseMeaning } from "@/lib/content/houses";
import type { Domain, SubjectId } from "@/lib/engine/types";

type AssociationNoteKey = Domain | SubjectId;
type DomainNotes = Partial<Record<AssociationNoteKey, string[]>>;

const SUBJECT_SCOPE: Record<SubjectId, string> = {
  general_reading: "the wider situation",
  love: "the relationship itself",
  work: "your work life",
  money: "the financial picture",
  home_family: "home life",
  friends_social: "your social world",
  personal_growth: "your inner life",
  health: "your wellbeing",
  pets: "your care for the animal",
  creative: "the creative process",
  travel: "the journey",
  education: "the learning path",
  spiritual: "your spiritual practice",
  community: "your place in the wider group",
  legal_admin: "the formal process",
  purpose_calling: "your calling",
};

const CARD_ASSOCIATION_NOTES: Partial<Record<number, DomainNotes>> = {
  6: {
    general: [
      "fog, uncertainty, and the parts of the picture that shift before they can be read clearly",
      "the unclear or ambiguous quality of the situation, where patience matters more than conclusions",
      "uncertainty and shifting conditions that ask for careful pacing before any firm commitment",
    ],
    love: [
      "fog in the connection, where mixed signals or withheld clarity make it hard to read what is actually being offered",
    ],
    work: [
      "unclear direction, shifting priorities, and the parts of the work picture that cannot yet be trusted as fixed",
    ],
  },
  1: {
    general: [
      "incoming news, a new arrival, and the signal that something which has been waiting is finally starting to move",
    ],
    love: [
      "a message, invitation, or emotional signal that reactivates what has been quietly building",
    ],
    work: [
      "incoming communication, updates, and the practical opening they create when timing is finally right",
    ],
  },
  2: {
    general: [
      "a small opening, brief easing, and the kind of chance that only matters if it is used promptly",
    ],
    love: [
      "a light touch, small gesture of goodwill, and the warmth that softens a tense emotional climate when it arrives",
    ],
    work: [
      "a small opening, brief easing, and the kind of chance that only helps if it is used cleanly and quickly",
    ],
  },
  3: {
    general: [
      "movement, distance, trade, and the shift that comes once something leaves its old context",
    ],
    love: [
      "movement, changing context, emotional distance, and the way a bond can feel different once it leaves familiar ground",
    ],
    money: [
      "money in motion, transfers, moving costs, trade, and the parts of the financial picture shaped by distance or transition",
    ],
    work: [
      "movement between teams, markets, or methods, and the distance a plan has to travel before it becomes real",
    ],
  },
  4: {
    general: [
      "base structure, fixed conditions, and the foundations that have to hold before anything else can stretch",
    ],
    money: [
      "fixed costs, baseline obligations, home-base expenses, and the part of the budget that has to be carried first",
    ],
    work: [
      "base systems, standard process, and the structural layer that people rely on even when they stop noticing it",
    ],
  },
  5: {
    general: [
      "roots, pacing, recovery, and the long build that only shows its value over time",
      "slow growth, deep roots, and whatever needs steadiness rather than speed",
    ],
    love: [
      "slow trust, emotional rootedness, and the kind of intimacy that deepens through consistency",
    ],
    work: [
      "long skill-building, sustainable process, and the quiet work that strengthens the whole structure over time",
    ],
  },
  7: {
    general: [
      "layered motives, complexity, desire, and the need to read around what looks obvious",
      "the indirect path, hidden agendas, and the complexity that demands careful navigation rather than blunt honesty",
    ],
    love: [
      "desire, mixed motives, jealousy, or the need for cleaner boundaries around a complicated dynamic",
      "attraction tangled with strategy, and the question of whether someone's interest is straightforward or layered",
    ],
    work: [
      "politics, competing interests, tactical maneuvering, and the quiet leverage hidden inside complexity",
      "the office undercurrent that nobody names directly but everyone navigates — alliances, positioning, and indirect influence",
    ],
  },
  8: {
    general: [
      "an ending or closure that clears the field for what genuinely comes next",
      "the thing that has already finished and needs to be allowed to rest rather than reactivated",
    ],
    love: [
      "the part of the bond that has already ended or gone quiet and needs to be allowed to rest rather than forced back open",
    ],
    work: [
      "a process, role, or phase of work that has run its course and cannot be meaningfully continued",
    ],
  },
  9: {
    general: [
      "a moment of goodwill, ease, or visible appreciation that makes the wider situation easier to move through",
      "grace, generosity, and the social warmth that makes difficult situations more navigable",
    ],
    love: [
      "warmth, romantic gesture, and the feeling of being genuinely appreciated in the connection",
      "the gift of attention, small kindnesses, and the beauty that arrives when affection is freely offered",
    ],
    work: [
      "professional recognition, goodwill between parties, and the visible ease that opens conversations",
      "a positive impression, social capital, and the professional charm that creates openings where force would not",
    ],
  },
  10: {
    general: [
      "a clean cut, abrupt clarity, and what can no longer be carried in its current form",
      "the sharp intervention that separates what can stay from what has to go — swift, necessary, and usually irreversible",
    ],
    love: [
      "clear boundaries, decisive conversations, and the moment a romantic ambiguity has to be cut through",
      "the conversation that ends ambiguity, the boundary that finally holds, or the severance that cannot be taken back",
    ],
    work: [
      "hard decisions, quick edits, deadlines, and cutting waste before it spreads further",
      "the restructure, the layoff, the decisive action that reorganizes what was no longer working — painful but clarifying",
    ],
  },
  11: {
    general: [
      "repetition, friction, discipline, and the strain of a pattern that keeps replaying",
      "the recurring loop that builds frustration or builds strength — depending on whether it is chosen or just endured",
    ],
    love: [
      "repeating arguments, sharpened chemistry, and the question of whether tension is being used well or badly",
      "the pattern that keeps triggering the same fight, or the passionate intensity that refuses to settle into calm",
    ],
    work: [
      "pressure, rework, repeated tasks, training through friction, and the cost of doing the same correction again",
      "the grinding repetition that either builds mastery or burns people out — the difference is whether it is deliberate",
    ],
  },
  12: {
    general: [
      "nerves, chatter, quick exchanges, and the mental weather created by constant conversation",
    ],
    money: [
      "nervous money talk, mixed signals in the numbers, and the chatter that can make the financial picture feel noisier than it is",
    ],
    love: [
      "check-ins, mixed signals, texting loops, and the way nervous conversation can either soothe or inflame",
    ],
    work: [
      "constant updates, chatter, meetings, nerves, and short-cycle decisions that can unsettle the day",
    ],
  },
  13: {
    general: [
      "a fresh start, small beginning, and the early-stage quality that needs careful handling to develop well",
      "the early signal of something genuinely new — and the light touch required before it can build its own momentum",
    ],
    love: [
      "the tender, early quality of this connection, or the part of it still holding its original openness",
    ],
    work: [
      "an early-stage effort, new approach, or small beginning that has not yet built its own momentum",
    ],
  },
  14: {
    general: [
      "discernment, tactical caution, self-interest, and the need to stay useful without becoming cynical",
      "the sharp-eyed assessment of what is real, who benefits, and whether the terms actually serve you",
    ],
    love: [
      "wariness, self-protection, guarded motives, and the need to test intentions before trusting them",
      "the protective instinct that checks whether affection is genuine before the heart commits further",
    ],
    work: [
      "quality control, tactical caution, professional self-interest, and the need to verify before committing",
      "the careful audit of whether an opportunity is as good as it looks, or whether someone else is benefiting more",
    ],
  },
  15: {
    general: [
      "resource authority, protective weight, and the question of who actually controls what the situation depends on",
    ],
    love: [
      "protective instincts, possessive dynamics, and the weight of caring for someone in a way that can either steady or strain the bond",
    ],
    work: [
      "resource control, budgetary authority, and the responsibility that comes with holding influence over what others need",
    ],
    money: [
      "significant resource concentration, major financial authority, and the leverage held by whoever controls the flow",
    ],
  },
  16: {
    general: [
      "long-range clarity, guidance, and the alignment between where things stand and where they are moving",
      "the wider vision that gives individual steps their meaning — not wishful thinking, but genuine orientation",
    ],
    love: [
      "shared hope, mutual orientation, and the sense of moving toward something meaningful together",
      "the moment when both people can see where the relationship could go — and whether they want the same destination",
    ],
    work: [
      "strategic coherence, clear direction, and the clarity that makes planning feel genuinely oriented rather than provisional",
      "the north star that makes daily work meaningful — purpose strong enough to survive the grind of execution",
    ],
  },
  17: {
    general: [
      "improvement, transition, upgrades, and the feeling that something is trying to move into a better form",
    ],
    money: [
      "financial improvement, restructuring, and the kind of change that helps the flow work better instead of just moving faster",
    ],
    love: [
      "gradual renewal, relational improvement, and the chance to update the way the bond is being lived",
    ],
    work: [
      "upgrades, changed routines, transfers, process improvement, and movement toward a better method",
    ],
  },
  18: {
    general: [
      "loyal backing, dependable help, and the quiet strength of what proves itself through consistency",
    ],
    money: [
      "practical support, a reliable ally, and the arrangements or help that can make the numbers more workable",
    ],
    love: [
      "friendship inside the bond, emotional reliability, and the question of whether affection is matched by steadiness",
    ],
    work: [
      "reliable collaborators, quiet loyalty, and support you can actually count on when pressure rises",
    ],
  },
  19: {
    general: [
      "distance, standards, official structure, and the part of the situation governed by rules rather than mood",
    ],
    love: [
      "distance, emotional reserve, strong boundaries, and the challenge of bridging what feels formal or far away",
    ],
    work: [
      "institutions, hierarchy, compliance, status, and the formal structure shaping what is possible",
    ],
  },
  20: {
    general: [
      "the visible social field, wider context, and the shared environment that shapes how events are read by others",
      "the audience, the community, the public stage — what happens here is witnessed, and the witnesses shape the outcome",
    ],
    love: [
      "the public side of the relationship, outside context, and the social environment shaping what can be offered or withheld",
      "how the relationship looks from the outside, and whether the public version matches what is happening privately",
    ],
    work: [
      "the professional network, visible environment, and wider context that creates or limits what is practically possible",
      "industry connections, professional reputation, and the visibility that determines whether opportunity finds you",
    ],
  },
  21: {
    general: [
      "a real obstacle, hard resistance, or significant blockage that requires patience and staged effort rather than force",
      "the wall that does not move when pushed — something in the situation is genuinely immovable right now",
    ],
    love: [
      "emotional distance, blocked access, or a hard barrier between people that cannot be resolved quickly or by goodwill alone",
      "the emotional wall — not hostility, but a genuine inability to reach the other person through the usual channels",
    ],
    work: [
      "a structural block, persistent resistance, or major obstacle that cannot be worked around without sustained effort and planning",
      "the project stall, the regulatory block, or the organizational resistance that refuses to yield to enthusiasm alone",
    ],
  },
  22: {
    general: [
      "branching options, decision pressure, and the need to choose by values rather than anxiety",
    ],
    love: [
      "naming the direction of the relationship, clarifying alternatives, and deciding what path is truly wanted",
    ],
    work: [
      "role choice, diverging priorities, strategic forks, and the practical cost of leaving a decision open too long",
    ],
  },
  23: {
    general: [
      "worry, attrition, and the little losses that quietly change the mood of the whole situation",
      "stress, erosion, and the small repeated drains that become serious only after they have accumulated",
    ],
    love: [
      "small disappointments, unspoken irritation, doubt, and the kind of strain that wears intimacy down by degrees",
      "nerves, depletion, repeated friction, and the slow damage done by what is never fully addressed",
    ],
    work: [
      "worry, depletion, small repeated tasks, correction work, admin drag, and what keeps slipping through the cracks",
      "research, editing, auditing, problem-solving, cleaning up mess, and the slow attrition created by instability or delay",
    ],
  },
  24: {
    general: [
      "value alignment, devotion, heartfelt honesty, and what the situation is asking you to care about openly",
    ],
    love: [
      "affection, vulnerability, emotional truth, and the willingness to let care be visible",
    ],
    work: [
      "morale, value alignment, and the question of whether the work still feels worth giving your heart to",
    ],
  },
  25: {
    general: [
      "agreements, repetition, mutual terms, and what keeps returning until it is consciously renewed or revised",
    ],
    love: [
      "commitment, relationship terms, the repeating shape of the bond, and what needs to be chosen again on purpose",
    ],
    work: [
      "contracts, recurring duties, meetings, obligations, and the cycle that keeps setting the terms of the work",
    ],
  },
  26: {
    general: [
      "private knowledge, research, what is not yet visible, and the need to learn before you declare certainty",
      "the withheld, unverified, or still-forming information that shapes the situation from behind the surface",
      "what is known but not shared, or known partially — and the patience required before conclusions can hold",
      "hidden information, research still in progress, and the gap between what is available and what can yet be confirmed",
    ],
    love: [
      "private conversations, what one person has not yet said, and the intimacy or distance created by secrecy",
    ],
    work: [
      "specialist knowledge, confidentiality, training, and the leverage hidden inside what is not yet shared openly",
    ],
  },
  27: {
    general: [
      "records, messages, explicit wording, and the importance of what can be tracked or proven",
      "written communication, documentation, and the clarity that comes from putting things into explicit form",
      "the stated position, formal record, or message that changes what can be assumed or left vague",
      "correspondence, notice, or information that needs to move between people in a clear and traceable way",
    ],
    love: [
      "texts, messages, written clarity, and the relief that comes when the emotional subtext is finally named",
    ],
    work: [
      "paper trails, notices, filings, messages, and the practical safety created by clear written follow-through",
    ],
  },
  28: {
    general: [
      "the other person's position, their motives, and the part of the story you do not control directly",
      "someone else's agency — what they want, what they are doing about it, and how their choices shape yours",
    ],
    love: [
      "the counterpart's needs, signals, and willingness to meet the relationship honestly",
      "who the other person actually is in this dynamic — not who you hope they are, but what their behavior reveals",
    ],
    work: [
      "the other party's agenda, stakeholder needs, and the external perspective shaping the process",
      "the client, the manager, the counterpart — whoever holds the other half of this equation and what they actually need",
    ],
  },
  29: {
    general: [
      "your role, boundaries, self-definition, and the way your stance is quietly setting the tone",
      "yourself as the variable — what you bring, what you withhold, and how your presence is shaping everything around you",
    ],
    love: [
      "self-awareness, boundaries, emotional availability, and the part you are playing in the relationship dynamic",
      "what you are actually offering to the relationship right now, and whether it matches what you believe you are offering",
    ],
    work: [
      "your role, boundaries, workload ownership, and the way your position is shaping the outcome",
      "how you are being perceived at work, what authority you actually hold, and whether your actions match your intentions",
    ],
  },
  30: {
    general: [
      "maturity, ethical steadiness, and the patience to let things develop at the right pace",
    ],
    love: [
      "respect, composed affection, and the slower intimacy that deepens when both people stop rushing",
    ],
    work: [
      "professional composure, principled judgment, and the restraint that keeps work from becoming reactive",
    ],
  },
  31: {
    general: [
      "confidence, visibility, success, and the warming effect of momentum that is finally obvious",
      "the bright outcome — things working openly, energy flowing, and the situation visibly improving",
    ],
    love: [
      "warmth, generosity, clearer attraction, and the healing effect of openness after uncertainty",
      "joy in the connection, mutual delight, and the kind of emotional sunlight that makes everything else easier",
    ],
    work: [
      "recognition, visibility, confidence, and the point where effort begins to look unmistakably productive",
      "success that others can see — the project landing, the recognition arriving, the momentum becoming undeniable",
    ],
  },
  32: {
    general: [
      "emotional weather, recognition, changing cycles, and what rises or falls with perception",
    ],
    love: [
      "attunement, emotional tides, sensitivity, and the way feeling changes the tone from one phase to the next",
    ],
    work: [
      "reputation, feedback loops, visibility, and how changing mood or recognition affects the work field",
    ],
  },
  33: {
    general: [
      "a workable answer, clearer certainty, and the point where guessing can stop because something usable is finally emerging",
      "the insight or access that changes the whole equation — the moment something locked finally opens",
    ],
    love: [
      "the emotional breakthrough, the conversation that finally unlocks understanding, or the gesture that proves what words could not",
      "the moment of clarity in the relationship where what was confusing becomes suddenly, usably clear",
    ],
    work: [
      "the solution that was missing, the access that was denied, or the answer that reorganizes the whole problem",
      "the professional breakthrough — the contact, credential, insight, or timing that finally makes progress possible",
    ],
  },
  34: {
    general: [
      "resources, circulation, exchange, and the need to keep movement healthy rather than clogged or chaotic",
    ],
    love: [
      "shared resources, generosity, reciprocity, and the question of whether emotional giving is flowing both ways",
    ],
    work: [
      "money flow, trade, liquidity, resources, and the need to keep value moving rather than trapped",
    ],
  },
  35: {
    general: [
      "endurance, steadiness, and what can actually hold when the first wave of emotion or uncertainty passes",
    ],
    love: [
      "consistency, reliability, and the sort of commitment that proves itself by staying power",
    ],
    work: [
      "career endurance, staying power, long-term fit, and the effort that can still hold under strain",
    ],
  },
  36: {
    general: [
      "duty, burden, meaning, and the serious weight that has to be carried wisely rather than theatrically",
    ],
    love: [
      "emotional burden, relationship duty, shared grief or gravity, and the need to carry meaning without martyrdom",
    ],
    work: [
      "duty, accountability, pressure, and the meaningful burden that comes with responsibility or consequence",
    ],
  },
};

const SUBJECT_CARD_ASSOCIATION_NOTES: Partial<Record<SubjectId, Partial<Record<number, string[]>>>> = {
  general_reading: {
    1: [
      "incoming news, a fresh signal, or the first concrete movement that shows the situation is ready to shift",
    ],
    2: [
      "a brief opening, small relief, or modest stroke of luck that helps if it is used before the window closes",
    ],
    3: [
      "movement, changing context, and the part of the situation that shifts once things leave familiar ground",
    ],
    4: [
      "the stable base, home ground, and practical foundation the situation depends on whether or not it is acknowledged",
    ],
    5: [
      "slow growth, deeper roots, and the part of the picture that only improves through patience and steady attention",
    ],
    6: [
      "confusion, mixed signals, and the part of the situation that still cannot be read cleanly enough to act on confidently",
    ],
    7: [
      "complication, mixed motives, and the thread in the situation that has to be navigated carefully rather than trusted at face value",
    ],
    8: [
      "an ending, pause, or necessary withdrawal that has to be acknowledged before anything healthier can begin again",
    ],
    9: [
      "a visible opening in tone, goodwill, or encouragement that can help the wider situation move more easily without resolving it by itself",
    ],
    10: [
      "a sharp cut, sudden change, or decisive boundary that alters the situation faster than expected",
    ],
    11: [
      "repeating tension, friction, or the pattern that keeps cycling through the same unresolved conflict",
    ],
    12: [
      "anxious talk, nervous discussion, and the noise created when too many signals arrive before any of them settle",
    ],
    13: [
      "a fresh start, early phase, or newer element in the picture that is still flexible enough to shape well",
    ],
    14: [
      "strategic caution, self-protective instinct, and the question of whether watchfulness is helping clarity or feeding suspicion",
    ],
    15: [
      "strength, authority, and the part of the situation where someone's weight or resources are shaping the field",
    ],
    16: [
      "long-range direction, guiding clarity, and the pattern that only helps once it is turned into concrete steps",
    ],
    17: [
      "constructive change, improvement, and the kind of shift that helps when it is done in the right order",
    ],
    18: [
      "loyalty, reliable support, and the dependable presence that proves itself through consistency rather than intensity",
    ],
    19: [
      "formal structures, authority, and the institutional framework that shapes what can proceed, stall, or be refused",
    ],
    20: [
      "the wider social field, shared context, or visible environment that starts mattering once events can no longer stay private",
    ],
    21: [
      "blockage, delay, and the obstacle that requires patience and careful strategy rather than force",
    ],
    22: [
      "a decision point, fork in the road, and the moment where continuing on two paths stops being viable",
    ],
    23: [
      "low-grade drain, repeated small losses, and the quiet attrition that wears the situation down if left unnamed",
    ],
    24: [
      "what genuinely matters, emotional truth, and the part of the picture that deserves honest protection",
    ],
    25: [
      "recurring terms, binding agreements, and the loop that keeps setting the shape of the situation until it is consciously revised",
    ],
    26: [
      "hidden information, what is not yet known, and the gap between assumption and verified fact",
    ],
    27: [
      "documents, messages, explicit terms, and the point where the situation changes because something is finally stated plainly",
    ],
    28: [
      "the other person's position, the mirrored side of events, and the part of the wider situation you do not define alone",
    ],
    29: [
      "your own role, boundaries, self-definition, and the way your stance is quietly shaping the wider situation",
      "your own position and how your choices are quietly setting the tone",
      "the way your boundaries and availability are shaping what can unfold",
      "your own stance and the field it is creating around you",
      "what you are permitting, clarifying, or holding back — and how that shapes the wider picture",
    ],
    30: [
      "maturity, restraint, and the steadier handling that keeps the situation from becoming noisier than it needs to be",
    ],
    31: [
      "clarity, warmth, and the visible momentum that makes the situation easier to trust and move with",
    ],
    32: [
      "emotional cycles, shifting visibility, and the way recognition or perception changes the whole atmosphere",
    ],
    33: [
      "the answer, the unlock, and the decisive clarity that lets guessing stop and action begin",
    ],
    34: [
      "flow, exchange, and the practical movement of resources or energy that keeps the situation from stalling",
    ],
    35: [
      "what can actually hold, stay reliable, and remain standing once the initial reaction passes",
    ],
    36: [
      "weight, duty, and the serious burden that has to be carried wisely rather than avoided or dramatized",
    ],
  },
  personal_growth: {
    1: [
      "the first real movement in your inner life, where something new starts once you stop waiting for perfect readiness",
    ],
    2: [
      "a brief opening, small relief, or narrow chance to choose differently before the old pattern closes back in",
    ],
    9: [
      "the moment of encouragement, affirmation, or visible support that reminds you growth can feel lighter without becoming superficial",
    ],
    13: [
      "a newer, more honest version of yourself, where first actions matter more than promises and the pattern is still flexible enough to change",
    ],
    10: [
      "a necessary cut, cleaner boundary, or decisive refusal that stops an old pattern from replaying on autopilot",
    ],
    12: [
      "anxious inner talk, overprocessing, and the mental weather created when too many thoughts are trying to steer at once",
    ],
    14: [
      "self-protective strategy, discernment, and the part of growth that can become overmanaged when trust is low",
    ],
    17: [
      "constructive change, personal improvement, and the movement toward a way of living that fits better",
    ],
    20: [
      "the social field where your growth becomes visible, mirrored, or tested once it can no longer stay private",
    ],
    21: [
      "the inner blockage, old resistance, or delayed passage that cannot be forced without making it heavier",
    ],
    22: [
      "the decision point where self-definition changes because one road can no longer be walked beside another",
    ],
    23: [
      "the repeated drain, low-grade strain, or quiet attrition that wears down confidence if it is left unnamed",
    ],
    24: [
      "what feels genuinely true, worth protecting, and emotionally alive beneath the noise",
    ],
    29: [
      "your role, boundaries, self-definition, and the way your stance is quietly setting the tone",
      "how you are moving through the inner process and what only you can decide about it",
      "what you are reinforcing or resisting — and how that shapes the pace of change",
      "your own stance and the ground it is creating for growth",
    ],
    32: [
      "your emotional weather, self-image, and the visibility cycle through which growth starts feeling more or less real",
    ],
    33: [
      "the answer point where something inside finally clicks into usable clarity",
    ],
    3: [
      "the inner journey that begins once you leave the comfort of familiar self-understanding and let your perspective widen",
    ],
    4: [
      "the foundation of habits, safety, and self-care that has to hold before deeper inner work becomes sustainable",
    ],
    5: [
      "slow healing, deeper roots, and the part of personal development that only matures through patience and consistent practice",
    ],
    6: [
      "inner confusion, self-doubt, and the fog that must be acknowledged honestly before clarity can arrive on its own terms",
    ],
    7: [
      "the inner complication, competing desires, and the part of growth where honesty about mixed motives matters more than clean answers",
    ],
    8: [
      "the ending of an old identity, necessary rest, and the quieter phase that has to be honored before renewal becomes real",
    ],
    11: [
      "inner conflict, self-criticism, and the repeating friction that keeps you stuck until the pattern itself is addressed",
    ],
    15: [
      "personal strength, self-sufficiency, and the question of whether your protective power is serving growth or preventing vulnerability",
    ],
    16: [
      "long-range personal vision, guiding clarity, and the deeper direction that only becomes useful once it shapes daily choices",
    ],
    18: [
      "self-loyalty, inner faithfulness, and the steady alliance with your own process that holds even when progress feels invisible",
    ],
    19: [
      "personal boundaries, solitude, and the part of growth that requires standing apart from others long enough to hear yourself clearly",
    ],
    25: [
      "the promises you keep making to yourself, habitual commitments, and the loops that shape your life until you consciously revise them",
    ],
    26: [
      "what you have not yet learned about yourself, and the self-knowledge that only arrives through honest inquiry rather than assumption",
    ],
    27: [
      "the moment of self-articulation where something you have been feeling becomes clear enough to write down or say aloud",
    ],
    28: [
      "the mirror others hold up for you, and the part of personal growth that depends on how you receive what is reflected back",
    ],
    30: [
      "emotional maturity, earned patience, and the steadier inner pace that comes from having survived earlier storms without hardening",
    ],
    31: [
      "genuine confidence, inner warmth, and the phase where growth starts feeling less like effort and more like arrival",
    ],
    34: [
      "the flow of energy, motivation, and practical resources that either sustain your growth or reveal where the support has run dry",
    ],
    36: [
      "the weight of personal responsibility, the burden of meaning, and the question of what you are willing to carry for your own sake",
    ],
    35: [
      "what can actually hold after the first emotional wave passes",
    ],
  },
  friends_social: {
    1: [
      "incoming social movement, invitations, updates, or first responses that can change group tone quickly once they actually arrive",
    ],
    2: [
      "a small social opening, brief easing, or useful invitation that matters because tone can change quickly if it is used well",
    ],
    6: [
      "the social uncertainty, mixed signals, and ambiguity that have to be clarified before the group can respond cleanly",
    ],
    17: [
      "improvement, resequencing, and the kind of social change that helps a friendship or group dynamic move into a healthier pattern",
    ],
    9: [
      "grace, social goodwill, recognition, and the warmer response that can help a friendship or group dynamic soften and move",
    ],
    3: [
      "movement between circles, changing social context, and the way a connection feels different once it leaves familiar ground",
    ],
    4: [
      "the shared base, familiar setting, and the part of the friendship dynamic that depends on consistency, comfort, or known ground",
    ],
    5: [
      "slow trust, rooted connection, and the friendships that deepen by steadiness rather than intensity",
    ],
    21: [
      "social blockage, distance, or the part of the friendship dynamic that has to be worked around patiently instead of forced",
    ],
    23: [
      "stress, erosion, and the small repeated drains that quietly wear trust, tone, and momentum down",
    ],
    8: [
      "the pause, ending, or quiet social withdrawal that has to be acknowledged before a healthier pattern can restart",
    ],
    7: [
      "social complexity, mixed motives, and the part of the group dynamic that has to be read around rather than taken at face value",
    ],
    11: [
      "repeating social friction, group pressure, and the loop that keeps a friendship pattern from settling cleanly",
    ],
    13: [
      "a newer friendship thread, early reconnection, or social dynamic still tender enough to shape before it hardens",
    ],
    15: [
      "social leverage, protective strength, and the part of the friendship field where power has to stay fair if trust is going to survive",
    ],
    16: [
      "the longer-view social signal, shared direction, and the pattern that helps once the group dynamic can actually be read clearly",
    ],
    18: [
      "dependable friendship, reciprocity, and the social support that proves itself by showing up consistently",
    ],
    20: [
      "the visible social field, group atmosphere, and networked context shaping what gets amplified, witnessed, or quietly avoided",
    ],
    24: [
      "what genuinely matters in the friendship, and the trust or care that still deserves honest protection",
    ],
    25: [
      "the promises, loops, and social terms that keep renewing themselves until they are consciously revised",
    ],
    26: [
      "private knowledge, what is not yet visible, and the part of the social dynamic that still needs learning before certainty is justified",
    ],
    27: [
      "records, messages, explicit wording, and the importance of what can be tracked or stated plainly between people",
    ],
    28: [
      "the other person's social stance, availability, and the part of the friendship dynamic you do not define alone",
    ],
    29: [
      "your social position, boundaries, and the way your stance quietly sets the tone in a friendship or group dynamic",
    ],
    30: [
      "social maturity, restraint, and the steadier tone that keeps friendship or group dynamics from becoming noisier than they need to be",
    ],
    31: [
      "clearer social warmth, visible momentum, and the kind of openness that makes the group dynamic easier to trust",
    ],
    32: [
      "visibility, reputation, and the emotional weather created when the social field is reading, mirroring, or talking about the dynamic",
    ],
    33: [
      "the clarifying moment or social truth that lets guessing stop and response become cleaner",
    ],
    34: [
      "the flow of contact, reciprocity, and practical give-and-take that keeps a social bond alive rather than one-sided",
    ],
    35: [
      "reliable support, staying power, and the social backing that still holds once first reactions fade",
    ],
    36: [
      "the social burden, moral weight, or duty in the group that has to be carried wisely rather than theatrically",
    ],
  },
  community: {
    1: [
      "the next response, invitation, or visible shift in the wider field that changes how participation is moving",
    ],
    2: [
      "a small opening, brief easing, or moment of welcome in the wider field that only matters if it is used promptly and concretely",
    ],
    6: [
      "the mixed signals, unclear group response, and wider-field ambiguity that make belonging harder to read cleanly",
    ],
    4: [
      "the group's base structure, shared ground, and the conditions that have to hold before belonging can deepen reliably",
    ],
    8: [
      "a pause, exit, or quiet withdrawal in the wider field, including what may need to end cleanly before belonging can reset on truer terms",
    ],
    9: [
      "a warmer welcome, encouraging response, or visible sign of goodwill that can soften how the group receives what is happening",
    ],
    3: [
      "movement between circles, changing group context, and the way belonging shifts once people move from one shared space into another",
    ],
    11: [
      "the repeating group tension, public pressure, or loop that keeps replaying until the pattern itself changes",
    ],
    12: [
      "nervous group talk, reactive discussion, and the atmosphere created when too many voices are trying to steer at once",
    ],
    13: [
      "a newer group thread, early participation, or a shared dynamic still flexible enough to shape before it hardens",
    ],
    17: [
      "constructive change in the group pattern, including the kind of shift that helps participation become healthier and easier to trust",
    ],
    23: [
      "stress, attrition, and the small repeated drains that quietly change tone, energy, and willingness to participate",
    ],
    27: [
      "messages, explicit wording, and the point where group response changes because something can no longer stay implied",
    ],
    15: [
      "the pressure point around gatekeeping, influence, or who gets to shape the terms of belonging",
    ],
    16: [
      "the longer-view group signal, shared direction, and the pattern that only helps once it becomes concrete enough to act on",
    ],
    20: [
      "the visible group field, networks, and shared spaces where belonging gets mirrored, tested, or opened up",
    ],
    21: [
      "the blockage, delay, or slower passage in the wider field that calls for patience and careful sequencing",
    ],
    24: [
      "what still feels genuinely mutual, welcoming, and worth belonging to in the group",
      "the genuine warmth, goodwill, and real reciprocity that makes belonging feel earned rather than obligatory",
      "the shared feeling and real affinity that holds a group together when pressure tests it",
    ],
    25: [
      "the group agreement, recurring norm, or repeated social terms that keep renewing themselves until they are consciously revised",
    ],
    29: [
      "your place in the wider field, the boundaries around your participation, and the tone your presence or withdrawal is setting",
      "how your own availability, consistency, and style of showing up are shaping what the group can become",
      "your role in the wider field and the way your choices about participation are quietly defining what continues",
      "the signal your presence, boundaries, and patterns of engagement are sending into the wider group",
      "the part of the group field that only you can actively shape, protect, or choose to step back from",
    ],
    30: [
      "maturity, restraint, and the steadier tone that helps participation hold without hardening into coldness",
    ],
    32: [
      "the group's emotional weather, changing visibility, and the way recognition or perception affects belonging",
    ],
    31: [
      "clearer visibility, confidence, and the point where your place in the wider field becomes easier for others to read",
    ],
  },
  travel: {
    1: [
      "the next update, departure notice, or practical movement that turns the trip from idea into logistics",
    ],
    2: [
      "a small timing window, narrow opening, or helpful stroke of luck that only matters if it is used promptly",
    ],
    3: [
      "route, transit, distance, and the movement that changes once the journey is actually underway",
    ],
    16: [
      "the route signal, timing pattern, and longer-view guidance that only helps once it becomes a real sequence of steps",
    ],
    6: [
      "uncertain timing, unclear conditions, or travel information that still cannot be trusted at face value",
    ],
    9: [
      "goodwill, smoother handling, and the small ease that can make a trip more workable without solving everything",
    ],
    10: [
      "the sharp reroute, fast decision, or abrupt cut that changes the trip more quickly than expected",
    ],
    11: [
      "repeat friction, transit stress, or the travel loop that keeps re-aggravating the same problem",
    ],
    17: [
      "upgrades, resequencing, and the kind of change that improves travel when it is made in the right order",
    ],
    19: [
      "terminals, checkpoints, institutional rules, and the formal structures that decide what proceeds or stalls",
    ],
    20: [
      "public spaces, crowds, and the visible field of who else affects the journey once it is in motion",
    ],
    21: [
      "delay, blockage, route obstruction, and what has to be worked around rather than argued with",
    ],
    22: [
      "the itinerary fork, route choice, and the question of which direction actually reduces uncertainty",
    ],
    26: [
      "hidden details, bookings under review, or information you do not yet have clearly in hand",
    ],
    27: [
      "tickets, confirmations, messages, and the practical details that make the journey real",
    ],
    28: [
      "the other traveler, host, companion, or outside party whose timing affects the trip",
    ],
    29: [
      "your route, timing choices, and the part of the journey only you can organize or decide cleanly",
    ],
    33: [
      "the confirmation, approval, or clear answer that lets the next travel step proceed",
    ],
    35: [
      "what can still hold once delay or stress hits, including the stable plan or fallback that keeps the trip workable",
    ],
  },
  education: {
    2: [
      "a brief opening, extension window, or small chance in timing that only helps if you use it quickly and realistically",
    ],
    3: [
      "distance learning, expanded perspective, or the phase of education that changes once the path leaves familiar ground",
    ],
    4: [
      "the study base, home structure, and practical foundation that has to hold if the path is going to stay workable",
    ],
    5: [
      "skill-building, long study growth, and the part of learning that only compounds through steadier repetition",
    ],
    6: [
      "unclear requirements, mixed signals, and the part of the course or application that still cannot be read cleanly",
    ],
    8: [
      "a pause, deferral, or closed phase in the academic path that has to be honored before the next step can move cleanly",
    ],
    9: [
      "encouragement, favorable response, or a smoother academic opening that helps the path move if it is used concretely",
    ],
    13: [
      "fresh starts, first attempts, and the part of the learning path that is still flexible enough to shape well",
    ],
    12: [
      "application chatter, exam nerves, and the mental noise created when too many academic signals are arriving at once",
    ],
    14: [
      "study strategy, tactical caution, and the question of whether discipline is helping focus or becoming overcontrol",
    ],
    18: [
      "dependable help, tutoring, or steady support that strengthens the path by being consistent rather than dramatic",
    ],
    19: [
      "institutions, standards, and the formal structures that decide what counts, proceeds, or gets held back",
    ],
    16: [
      "the longer-view study signal, qualification arc, and the pattern that only helps once it becomes an actual plan",
    ],
    20: [
      "the visible learning field, cohort pressure, and the part of education shaped by who else sees or measures the work",
    ],
    22: [
      "the study-path fork, course choice, or application decision that stops tolerating delay once the options are clear enough",
    ],
    26: [
      "research, hidden requirements, and the part of education you still have to learn before certainty is justified",
    ],
    27: [
      "applications, forms, notices, written requirements, and the part of education that has to be tracked on paper",
    ],
    28: [
      "the evaluator, teacher, admissions side, or outside expectation you do not control directly",
    ],
    29: [
      "your learning path, study effort, and the part of education only you can prepare, sustain, or submit",
    ],
    30: [
      "measured handling, mature judgment, and the steadier academic pace that keeps the work from becoming noisier than it needs to be",
    ],
    31: [
      "clear progress, confidence, and the visible sign that the work is starting to land or pay off",
    ],
    34: [
      "fees, materials, workload flow, and the practical resources that need to circulate cleanly if the path is going to stay workable",
    ],
    33: [
      "the answer point, acceptance, result, or clarity that unlocks the next academic step",
    ],
    35: [
      "what can still hold as routine, study stamina, and work that remains sustainable after the first push",
    ],
  },
  creative: {
    1: [
      "incoming movement, the next signal from the work, and the update that changes what needs to happen next",
    ],
    4: [
      "the studio base, practical foundation, and routine strong enough to let the work keep happening after the first wave of inspiration fades",
    ],
    5: [
      "slow creative growth, deeper roots, and the version of the work that only matures through steadier pacing",
    ],
    6: [
      "unclear direction, mixed signals in the work, or the part of the process that still cannot be read cleanly enough to trust",
    ],
    7: [
      "layered motives, creative complication, and the part of the work that gets harder when too many agendas are touching it at once",
    ],
    8: [
      "the pause, ending, or quiet withdrawal the work may need before anything healthier can restart",
    ],
    9: [
      "encouragement, goodwill, or a favorable response that can help the work move if it is used concretely instead of romanticized",
    ],
    11: [
      "repetition, rehearsal, refinement, and the question of whether the loop is sharpening the work or just exhausting it",
    ],
    12: [
      "creative chatter, nerves, and the mental noise that builds when too many signals are arriving at once",
    ],
    13: [
      "fresh starts, small experiments, and the version of the work that is still early enough to shape well before it hardens",
    ],
    14: [
      "creative strategy, craft discipline, and the question of whether discernment is helping the work or hardening into overcontrol",
    ],
    15: [
      "resources, authority, and stewardship, and the question of how to hold power without letting it dictate the work",
    ],
    16: [
      "the longer-view creative signal, the shape of the body of work, and the part of the process that only helps once it becomes an actual plan",
    ],
    17: [
      "constructive change, revision, and the kind of resequencing that helps the work improve when it is done in the right order",
    ],
    20: [
      "the visible creative field, audience response, and the public context that starts shaping the work once it can no longer stay private",
    ],
    21: [
      "the block, resistance, or slower passage that cannot be forced without making the work heavier",
    ],
    23: [
      "creative drain, attrition, and the repeated little losses that quietly change the mood of the whole process",
    ],
    24: [
      "what genuinely matters in the work and what still feels alive enough to protect",
    ],
    28: [
      "the audience, collaborator, commissioner, or outside response that affects the work without being fully under your control",
    ],
    29: [
      "your creative process, voice, and the part of the work only you can shape, release, or protect",
      "the part of the creative work that only you can shape, authorize, or set aside",
      "the creative stance you are holding and how it is quietly shaping what can emerge",
      "what is genuinely yours to make — the part of the process no one else can move for you",
      "your own authorship and the way it is setting the tone before anything is visible",
    ],
    30: [
      "craft maturity, restraint, and the steadier hand that knows how to refine without flattening the work",
    ],
    31: [
      "visible traction, confidence, and the result signal that makes the work easier to trust",
    ],
    32: [
      "recognition cycles, visibility swings, and the emotional weather created by being seen or not seen",
    ],
    35: [
      "what can still hold as practice, body of work, and sustainable output once the first push fades",
    ],
  },
  health: {
    1: [
      "the first bodily signal, update, or practical movement that shows the system is starting to respond",
    ],
    4: [
      "the routines, home base, and physical foundations the body is leaning on more than it may first appear",
    ],
    5: [
      "healing, recovery, and the part of wellbeing that only improves through patience and repetition",
    ],
    6: [
      "uncertainty around symptoms, causes, or what the body is trying to say before the picture is fully clear",
    ],
    8: [
      "rest, recovery, and the part of the system that needs a real pause before anything healthier can begin again",
    ],
    12: [
      "nervous activation, overprocessing, and the kind of internal chatter that keeps the system from settling",
    ],
    14: [
      "discernment about what helps versus what only overtaxes the system, especially when vigilance has become a habit",
    ],
    15: [
      "strength, load, and the question of what your system is carrying that may already be too heavy",
    ],
    16: [
      "the longer-view signal about what genuinely helps, especially where pacing and the next restorative step matter more than one dramatic answer",
    ],
    17: [
      "recovery movement, improvement, and the change in rhythm that lets the body work differently",
    ],
    18: [
      "dependable support, steadier backing, and the kind of consistency that helps the system stop bracing quite so hard",
    ],
    20: [
      "the visible social field around wellbeing, including where recovery is witnessed, pressured, or shaped by other people's responses",
    ],
    23: [
      "depletion, low-grade strain, and the repeated drain that keeps wearing the system down",
    ],
    24: [
      "what genuinely nourishes the system and what needs protecting if recovery is going to feel real instead of theoretical",
    ],
    25: [
      "the recurring terms, habits, or promises your body keeps living under until they are consciously revised",
    ],
    28: [
      "the other person's expectations, mirrored dynamics, or outside needs your system may still be adapting around",
    ],
    29: [
      "your wellbeing, body awareness, and the part of the process only you can report or regulate honestly",
      "your direct experience of recovery and what only your body can tell you about pacing and readiness",
      "how you are reading the system and what only you can feel, pace, or adjust from the inside",
      "your own body signals and the honest picture only you have access to",
    ],
    30: [
      "rest, regulation, and the steadier pace that helps the system trust safety again",
    ],
    31: [
      "vitality, clearer energy, and the return of signal that shows the system is responding",
    ],
    32: [
      "cycles, sensitivity, and the way sleep, mood, or timing change the whole picture",
    ],
    33: [
      "the answer point where what genuinely helps starts becoming clear",
    ],
    34: [
      "circulation, practical support, and what needs to move more cleanly before the system can feel less stuck",
    ],
    35: [
      "routine, staying power, and what still holds once the flare or fear settles",
    ],
  },
  pets: {
    1: [
      "the next sign, response, update, or small shift in the animal's behavior or condition that changes what needs doing next",
    ],
    3: [
      "travel to appointments, movement between settings, or a change in environment that alters how the animal settles",
    ],
    9: [
      "a gentler response, encouraging sign, or warmer opening that can help the animal settle if it is used calmly",
    ],
    4: [
      "the home base, enclosure, routine, or practical setup the animal is relying on more than it first appears",
    ],
    5: [
      "settling, recovery, rooted routine, and the slower improvement that only shows through steadier care",
    ],
    6: [
      "unclear signals, mixed cues, and the part of the animal's condition that still cannot be read confidently",
    ],
    7: [
      "mixed signals, layered factors, and the part of the care picture that has to be read carefully instead of reacted to too fast",
    ],
    8: [
      "a pause, recovery phase, quiet withdrawal, or part of the care picture that needs rest instead of pressure",
    ],
    11: [
      "the repeating stress loop, flare pattern, or care friction that keeps replaying until something in the routine changes",
    ],
    12: [
      "anxious discussion, over-monitoring, and the nervous atmosphere created when too many interpretations are circling at once",
    ],
    14: [
      "careful handling, vigilance, overprotection, and the question of whether caution is helping or tightening the whole picture",
    ],
    16: [
      "the longer-view signal in the animal's condition, where the pattern only becomes trustworthy over time",
    ],
    17: [
      "adjustment, improvement, and the kind of change in routine that helps the animal settle better",
    ],
    18: [
      "dependable care, steady bonding, and the kind of support that helps the animal feel safer",
    ],
    20: [
      "the visible environment, visitors, outside stimulation, or wider social field around the animal that starts shaping the care picture",
    ],
    21: [
      "the blockage, delay, or slower passage in the care picture that cannot be forced without making the animal more braced or stressed",
    ],
    22: [
      "the care decision point where one path now needs choosing instead of more circling",
    ],
    23: [
      "stress, attrition, and the little repeated drains that quietly wear the animal or the care rhythm down",
    ],
    24: [
      "what genuinely comforts, soothes, or helps the animal feel safe enough to settle",
    ],
    25: [
      "the repeating routine, care agreement, or pattern that keeps renewing itself until it is consciously adjusted",
    ],
    26: [
      "what still needs observation, testing, or quieter watching before the care picture can be trusted",
    ],
    28: [
      "another caregiver, vet, or outside person's role in the care picture, especially where their choices affect what you can or cannot settle directly",
    ],
    29: [
      "your role in the animal's care, the routines and boundaries you set, and the tone your steadiness or worry creates",
    ],
    30: [
      "calm handling, restraint, and the steadier rhythm that helps the animal settle without pressure",
    ],
    31: [
      "clearer signs of comfort, vitality, or progress that make the care picture easier to trust",
    ],
    32: [
      "changing sensitivity, recognition, and the emotional weather around the animal or the way the care picture is being read",
    ],
    33: [
      "the point where the care picture becomes clear enough to guide the next step",
    ],
    35: [
      "the routine, support, or practical steadiness that can actually hold for the animal after first reactions pass",
    ],
  },
  home_family: {
    4: [
      "the household itself, including the base routines, practical structures, and the question of what home can actually hold without strain",
    ],
    8: [
      "the part of home life that is ending, pausing, or asking for real rest before anything healthier can begin again",
    ],
    12: [
      "family talk, repeated check-ins, nerves, and the unsettled atmosphere created when too much is being discussed without enough resolution",
    ],
    11: [
      "the repeated friction, household pressure, and the strain of patterns that keep replaying at home",
    ],
    13: [
      "a younger, newer, or more fragile domestic beginning that still needs gentleness and practical shaping",
    ],
    15: [
      "protection, practical authority, caregiving pressure, and the question of who is holding the resources or carrying the heaviest part of the family load",
    ],
    17: [
      "household improvement, relocation energy, or the kind of domestic change that helps life work better when done in the right order",
    ],
    20: [
      "the wider family or social field around the household, including relatives, visitors, or outside dynamics that affect what home feels like",
    ],
    27: [
      "messages, schedules, paperwork, and the practical information that changes the domestic picture once it is finally clear",
    ],
    14: [
      "careful reading of motives, practical caution, and the household instinct to protect what is vulnerable before trusting too quickly",
    ],
    21: [
      "domestic delay, emotional distance inside the home, or the sense that progress is being slowed by what has not yet shifted",
    ],
    28: [
      "the other person's place in the household story, including their needs, influence, and what you cannot decide on their behalf",
    ],
    29: [
      "your own role inside the household, including boundaries, responsibility, and what you are quietly carrying",
    ],
    30: [
      "the wish for calm, mature boundaries, and a home atmosphere that feels steadier and less dramatic",
    ],
    32: [
      "the emotional weather of the household, including the changing mood, sensitivity, and recognition that set the tone at home",
    ],
    34: [
      "practical support, shared resources, and the flow of money, time, or effort that keeps the household functioning",
    ],
    35: [
      "what still holds the household together, including the routines, responsibilities, and steady support that keep family life from tipping over",
    ],
  },
  love: {
    1: [
      "incoming romantic news, a first message, or the signal that the emotional situation is starting to move",
      "the arrival of new energy in the bond — a text, a gesture, or a shift that changes the emotional weather",
    ],
    2: [
      "a brief romantic opening, lighthearted moment, or small chance to reconnect before the mood shifts again",
    ],
    3: [
      "emotional distance, long-distance dynamics, and the way desire changes once the relationship leaves familiar ground",
    ],
    4: [
      "domestic stability, shared living, and the practical foundation the relationship depends on beneath the romance",
    ],
    5: [
      "slow emotional deepening, trust built through time, and the bond that strengthens by steadiness rather than intensity",
    ],
    6: [
      "mixed signals, clouded intentions, and the difficulty of reading what the other person is actually offering",
      "the uncertainty in the connection, where what is meant and what is communicated are not yet the same",
    ],
    7: [
      "desire tangled with strategy, and the question of whether attraction is being offered cleanly or used as leverage",
      "complicated desire, rival energy, and the thread of seduction or manipulation woven through the connection",
    ],
    8: [
      "emotional endings, cold places in the bond, and the need to let what has already gone quiet actually rest",
    ],
    9: [
      "affection and the small gestures that help the bond feel genuinely appreciated rather than taken for granted",
      "warmth and genuine openness that makes connection feel lighter and more generous",
    ],
    10: [
      "the sharp break, decisive ending, or sudden emotional boundary that changes the relationship faster than either person expected",
    ],
    11: [
      "repeating arguments, passion that tips into friction, and the tension loop that keeps cycling without resolving",
    ],
    12: [
      "texting loops, nervous check-ins, mixed signals, and the difference between contact and true clarity",
    ],
    13: [
      "new emotional ground, tentative openings, and the part of the bond that still needs gentleness rather than pressure",
      "a fragile beginning in the bond, where curiosity and lightness matter more than conclusions",
      "the tender or early part of the connection, where gentleness is what makes the next step possible",
    ],
    14: [
      "romantic suspicion, guarded attachment, and the question of whether self-protection is keeping you safe or keeping love out",
    ],
    15: [
      "security, resource protection, and the way the stronger partner's stance shapes the emotional field",
      "the protective or possessive current in the bond — steadying or controlling depending on how it is held",
    ],
    16: [
      "shared hopes, long-range direction, and the vision of what the relationship could become if both people stay with it",
      "the guiding light in the bond, including what both people are reaching toward and whether those visions align",
    ],
    17: [
      "relationship improvement, emotional upgrades, and the constructive change that helps the bond evolve when both people are willing",
    ],
    18: [
      "loyalty, dependable love, and the steady devotion that proves itself by showing up consistently rather than dramatically",
    ],
    19: [
      "emotional walls, institutional distance, and the part of the relationship shaped by formality or separation rather than warmth",
    ],
    20: [
      "the relationship's public face, social context, and what changes when the bond becomes visible to others",
    ],
    21: [
      "emotional distance, blocked access, and the slow work of patient repair",
      "the resistance or distance in the bond, and what it is asking for before it shifts",
      "the obstacle in the connection, which requires patience rather than force",
    ],
    22: [
      "the romantic decision point, the choice between staying or leaving, and the fork where both paths can no longer be walked at once",
    ],
    23: [
      "small hurts, suspicion, anxious over-reading, and the slow wear that comes from what never fully gets repaired",
    ],
    24: [
      "genuine affection, tenderness, emotional truth, and what the bond is genuinely asking for",
    ],
    25: [
      "promises, commitment, and the repeating shape the relationship keeps falling back into",
    ],
    26: [
      "what is still hidden in the relationship, unspoken feelings, and the emotional truth that has not yet surfaced between you",
    ],
    27: [
      "love letters, explicit declarations, and the moment where what has been felt finally gets put into words that can be received",
    ],
    28: [
      "the counterpart's signals, availability, and the part of the bond that depends on their willingness to meet you honestly",
    ],
    29: [
      "your own stance in the relationship, including boundaries, availability, and the tone you are setting without always realizing it",
      "how your presence in the relationship is quietly shaping what can be given or received",
      "what you are making available, withholding, or leaving unclear — and how that shapes the dynamic",
      "your presence in the relationship and the tone it creates before anything is made explicit",
    ],
    30: [
      "mature love, sexual depth, and the quieter intimacy that comes from experience and earned trust rather than novelty",
    ],
    31: [
      "radiant connection, visible happiness, and the phase where the relationship feels warm, open, and genuinely nourishing",
    ],
    32: [
      "romantic longing, emotional tides, and the way the bond feels different depending on mood, memory, and what is being projected",
    ],
    33: [
      "the decisive romantic clarity that ends ambiguity and reveals whether the connection can actually work",
    ],
    34: [
      "emotional abundance, shared resources, and the practical flow that keeps the relationship from becoming all feeling and no foundation",
    ],
    35: [
      "lasting commitment, relationship endurance, and the bond that can actually hold once infatuation and first intensity pass",
    ],
    36: [
      "the weight of love, sacrificial devotion, and the part of the bond that asks something real to be carried without resentment",
    ],
  },
  legal_admin: {
    1: [
      "incoming notices, updates, and the next instruction that changes what has to happen now",
    ],
    3: [
      "routing, transfer, jurisdiction, and the part of the matter that changes hands before it resolves",
    ],
    13: [
      "an early-stage filing, provisional step, or matter still plastic enough to correct before it hardens",
    ],
    21: [
      "backlog, formal blockage, or the part of the matter that has to be worked methodically instead of forced",
    ],
    24: [
      "what the file is actually trying to protect, establish, or show as materially and ethically important",
    ],
    29: [
      "your side of the matter, what can be evidenced from your position, and the steps only you can authorize or complete",
    ],
    7: [
      "layered motives, strategic positioning, and the part of the matter that has to be read carefully rather than taken at face value",
    ],
    8: [
      "pause, closure, file exhaustion, and the point where one phase has to be closed cleanly before the next can proceed",
    ],
    9: [
      "goodwill, smoother handling, and the kind of small procedural opening that helps a difficult file move without changing its obligations",
    ],
    14: [
      "defensive strategy, tactical reading, and the part of the file that needs scrutiny before anything is conceded",
    ],
    16: [
      "clear direction, long-range strategy, and the signal that only becomes useful once it is turned into an actual next step",
    ],
    17: [
      "stage change, corrected sequencing, and the improvement that comes when the process is moved in the right order",
    ],
    12: [
      "back-and-forth communication, follow-up loops, anxious waiting, and the procedural noise created when too many voices touch the same file",
    ],
    19: [
      "institutions, hierarchy, compliance, and the formal authority shaping what can be approved, delayed, or refused",
    ],
    23: [
      "small procedural leaks, missing details, clerical anxiety, repeated corrections, and the kind of admin erosion that slows everything down",
    ],
    25: [
      "binding terms, contractual loops, renewal clauses, and the obligations that keep setting the shape of the process",
    ],
    26: [
      "research, confidential information, withheld facts, specialist knowledge, and the material that must be understood before anything is signed off",
    ],
    27: [
      "letters, notices, filings, records, and the paper trail that makes the whole matter legible",
    ],
    28: [
      "the other party, agency, or decision-maker position that shapes timing but is not under your control",
    ],
    30: [
      "measured judgment, settled terms, and the kind of restrained handling that strengthens credibility instead of adding noise",
    ],
    32: [
      "visibility, review cycles, and the way the matter is being read or reconsidered as more of it comes into view",
    ],
    33: [
      "the solution clause, the approval point, and the document or decision that finally unlocks the process",
    ],
    35: [
      "what can still hold procedurally, including deadlines, enforceable commitments, and the part of the matter that survives first reactions",
    ],
  },
  money: {
    1: [
      "incoming movement, fresh information, and the first sign that the money picture is ready to respond",
    ],
    2: [
      "a modest financial opening, brief relief, or a narrow chance worth using while it is still available",
    ],
    3: [
      "money in transit, international transactions, and the financial movement that changes once capital leaves familiar territory",
    ],
    4: [
      "property value, mortgage stability, and the financial foundation that everything else is quietly resting on",
    ],
    5: [
      "slower financial repair, better roots, and the kind of growth that matters more over time than in one quick result",
    ],
    6: [
      "unclear numbers, fog around timing, and the difficulty of judging the financial picture cleanly before the facts settle",
    ],
    7: [
      "financial complication, hidden costs, and the part of the money picture that has to be traced carefully rather than trusted at face value",
    ],
    8: [
      "a financial pause, ending, write-off, or necessary reset that has to be acknowledged before healthier movement can begin again",
    ],
    9: [
      "goodwill, a favorable response, and the kind of practical support that can open a door if it is backed by substance",
    ],
    10: [
      "a sudden financial cut, unexpected expense, or sharp change in the money picture that demands an immediate response",
    ],
    11: [
      "financial disputes, billing conflicts, and the repeating tension around money that keeps cycling without clean resolution",
    ],
    12: [
      "nervous money talk, repeated checking, and the noise created when the financial picture is discussed faster than it is understood",
    ],
    13: [
      "a new financial venture, seed funding, or early-stage investment still small enough to shape before the stakes harden",
    ],
    14: [
      "budget caution, defensive strategy, and the need to separate prudent protection from unhelpful suspicion",
    ],
    15: [
      "heavyweight financial authority, major asset management, and the question of who actually controls the resources",
    ],
    16: [
      "long-range financial planning, investment horizons, and the strategy that only pays off when it is followed through patiently",
    ],
    17: [
      "financial improvement, portfolio rebalancing, and the upgrade in money management that helps when the timing is right",
    ],
    18: [
      "a trusted financial ally, reliable business partner, or the steady support that keeps the money picture from tipping in a crisis",
    ],
    19: [
      "banks, regulatory bodies, tax structures, and the institutional framework that shapes what money can or cannot do",
    ],
    20: [
      "markets, clients, audience, or the wider financial ecosystem shaping which opportunities are actually viable",
    ],
    21: [
      "financial blockage, frozen assets, and the money obstacle that requires patience and workaround rather than brute force",
    ],
    22: [
      "the financial fork, investment choice, or spending decision where both options can no longer be held open simultaneously",
    ],
    23: [
      "small losses, recurring costs, admin drag, financial anxiety, and the little leaks that matter precisely because they repeat",
    ],
    24: [
      "what money is genuinely for, the spending that reflects real values, and the financial choices that feel emotionally honest",
    ],
    25: [
      "binding financial terms, repeating obligations, subscriptions, debt cycles, and the agreements that keep claiming a share of the flow",
    ],
    26: [
      "hidden financial information, undisclosed terms, and the part of the money picture you still need to research before committing",
    ],
    27: [
      "statements, invoices, notices, filings, and the paperwork that reveals where money is truly going",
    ],
    28: [
      "the other party's position, incentives, or timing, and the part of the money story you do not control directly",
    ],
    29: [
      "your financial position, spending choices, and the degree of control you actually have over the flow",
    ],
    30: [
      "restraint, long-view judgment, and the steadier pacing that helps money decisions hold up over time",
    ],
    31: [
      "financial clarity, profitable momentum, and the phase where money effort starts producing visible, trustworthy returns",
    ],
    32: [
      "fluctuating confidence, market sentiment, and the emotional weather that makes financial decisions feel more or less certain",
    ],
    33: [
      "the practical fix or decisive clarity that reveals what can be unlocked in the money picture",
    ],
    34: [
      "cashflow, exchange, liquidity, and the direction in which resources are actually moving",
    ],
    35: [
      "stability, durable income, and the structures that can still hold when the market mood changes",
    ],
    36: [
      "financial sacrifice, the cost of doing what is right, and the money burden that comes with moral or family obligation",
    ],
  },
  purpose_calling: {
    1: [
      "the first real movement on the path, where a message, opening, or concrete signal asks to be answered in practice",
    ],
    20: [
      "the wider social field where the path becomes visible, including audience, networks, and the part of calling that has to stand in the open",
    ],
    6: [
      "uncertainty around the path, and the need to separate real ambiguity from self-protective confusion before committing further",
    ],
    12: [
      "too many voices, anxious discussion, or mental noise making it harder to hear what the path is actually asking of you",
    ],
    18: [
      "steady support, loyal alliance, and the kind of dependable help that shows whether the path can actually hold in real life",
    ],
    14: [
      "defensive strategy, over-reading, or self-protective caution that can make the true path harder to trust",
    ],
    7: [
      "mixed motives, inner conflict, or layered pressure that can make a true path harder to read cleanly",
    ],
    10: [
      "the necessary cut, refusal, or clean boundary that separates vocation from habit, urgency, or inherited expectation",
    ],
    16: [
      "guidance, long-range direction, and the larger pattern that only becomes visible once reactive noise starts to quiet",
    ],
    23: [
      "the small repeated drain that weakens conviction or meaning if it is left unaddressed",
    ],
    29: [
      "your own stance toward the path, including how much of it is truly chosen and how much is inherited habit",
    ],
    30: [
      "maturity, ethical restraint, and the steadier judgment that helps long-range direction hold without becoming rigid or performative",
    ],
    33: [
      "the answer point where the path stops being theoretical and asks for a choice you can actually live",
    ],
    8: [
      "the part of the old path that has already finished, and the rest that is needed before anything genuinely new can take root",
    ],
    22: [
      "a vocational fork in the road, where not every path deserves the same loyalty or sacrifice",
    ],
    24: [
      "what still feels genuinely meaningful, and the part of the path that remains emotionally true",
    ],
    27: [
      "the wording, terms, or explicit message that makes the path less vague and more livable",
    ],
    34: [
      "where energy, support, and real-world movement either begin feeding the path or reveal what is not actually sustaining it",
    ],
    35: [
      "the version of vocation that can actually be sustained, not just admired from a distance",
    ],
    36: [
      "the weight of calling, duty, and the difference between a meaningful burden and a draining one",
    ],
  },
  work: {
    1: [
      "incoming assignments, fresh leads, and the first signal that the work situation is ready to move",
      "a new task, message, or opportunity arriving that changes what the workday demands next",
    ],
    2: [
      "a brief professional opening, small stroke of timing, or narrow window worth acting on before it closes",
    ],
    3: [
      "business travel, remote work, projects with moving parts, and the phase where the job leaves familiar ground",
    ],
    4: [
      "the office base, workspace setup, and the practical foundation the job depends on more than anyone admits",
    ],
    5: [
      "slow professional growth, skill-building over time, and the career investment that only compounds through patience",
    ],
    6: [
      "unclear direction from management, mixed signals about priorities, and the fog that makes it hard to commit confidently",
    ],
    7: [
      "office politics, strategic maneuvering, and the part of the work that has to be navigated carefully rather than taken at face value",
    ],
    8: [
      "a project ending, role closure, or professional pause that needs to be acknowledged before the next phase can begin cleanly",
    ],
    9: [
      "professional goodwill, a favorable review, or the kind of recognition that opens a door if it is backed by substance",
    ],
    10: [
      "a decisive cut, sudden restructure, or sharp professional boundary that changes the work picture faster than expected",
    ],
    11: [
      "workplace friction, repeated disputes, competitive pressure, and the tension that keeps cycling through the same unresolved pattern",
    ],
    12: [
      "excessive meetings, Slack noise, email churn, and the professional chatter that creates activity without progress",
    ],
    13: [
      "a new project, early-stage initiative, or professional beginning still flexible enough to shape before it hardens into routine",
    ],
    14: [
      "strategic caution, self-protective professionalism, and the question of whether workplace vigilance is helping focus or breeding distrust",
    ],
    15: [
      "management authority, resource control, and the heavyweight professional presence that shapes the field whether it intends to or not",
    ],
    16: [
      "career direction, long-range professional goals, and the guiding vision that only becomes useful once it turns into actual steps",
    ],
    17: [
      "role changes, process improvements, and the kind of professional upgrade that helps when the sequencing is right",
    ],
    18: [
      "a reliable colleague, trusted mentor, or steady professional alliance that proves itself through consistency rather than drama",
    ],
    19: [
      "institutions, hierarchy, formal standards, and the part of the job that is shaped by structure rather than preference",
    ],
    20: [
      "the professional network, industry visibility, and the wider field where reputation and opportunity actually circulate",
    ],
    21: [
      "career blockage, stalled promotion, and the professional obstacle that requires patience and strategy rather than force",
    ],
    22: [
      "the career fork, job decision, or professional pivot where continuing on two paths stops being viable",
    ],
    23: [
      "workflow leaks, repeated corrections, low-grade stress, and the hidden cost of everything that needs fixing twice",
    ],
    24: [
      "genuine professional passion, the work that still feels meaningful, and what keeps the career emotionally alive beneath the routine",
    ],
    25: [
      "recurring obligations, standing meetings, contract terms, and the loops that keep setting the rhythm of the work",
    ],
    26: [
      "restricted information, policy detail, specialist knowledge, and the gap between what is assumed and what is actually known",
    ],
    27: [
      "instructions, approvals, filings, and the paper trail that keeps the work defensible",
    ],
    28: [
      "the colleague, client, or counterpart whose position and timing shape the work outcome without being under your direct control",
    ],
    29: [
      "your professional stance, boundaries, and the way your work ethic and availability are quietly setting the terms",
    ],
    30: [
      "professional maturity, measured judgment, and the experienced hand that keeps the work from becoming noisier than it needs to be",
    ],
    31: [
      "visible professional success, clear momentum, and the phase where effort starts landing in ways others can see",
    ],
    32: [
      "professional reputation, visibility cycles, and the way recognition or perception shifts how the work is received",
    ],
    33: [
      "the breakthrough, decisive answer, or key insight that unlocks what has been stuck in the work picture",
    ],
    34: [
      "income flow, business revenue, professional resources, and the practical exchange that keeps the work financially viable",
    ],
    35: [
      "career durability, long effort, and the kind of commitment that has to prove it can last",
    ],
    36: [
      "professional duty, moral weight at work, and the burden of responsibility that comes with meaningful stakes",
    ],
  },
  spiritual: {
    1: [
      "the first stirring of spiritual awareness, an arriving message from the inner life, or the sign that something deeper is ready to move",
    ],
    2: [
      "a brief moment of grace, a small synchronicity, or the fleeting opening where the sacred feels closer before ordinary life resumes",
    ],
    3: [
      "the spiritual journey, pilgrimage energy, and the expansion that begins once practice leaves familiar comfort and enters deeper water",
    ],
    4: [
      "the spiritual home base, sacred space, and the grounded container that daily practice depends on more than inspiration alone",
    ],
    5: [
      "deep roots, ancestral connection, and the slow spiritual growth that only comes through patience, embodiment, and lived experience",
    ],
    6: [
      "spiritual confusion, dark night of the soul, and the fog that must be endured honestly before genuine clarity can arrive",
    ],
    7: [
      "spiritual complication, shadow work, and the part of the inner path that requires honesty about mixed motives and hidden desires",
    ],
    8: [
      "ego death, necessary endings, and the spiritual surrender that has to happen before transformation can take root on deeper ground",
    ],
    9: [
      "spiritual gifts, blessings received, and the grace that arrives as encouragement without needing to be earned or explained",
    ],
    10: [
      "the decisive spiritual cut, renunciation, and the moment where something must be released completely rather than renegotiated",
    ],
    11: [
      "spiritual discipline, repetitive practice, and the question of whether devotion is deepening awareness or becoming compulsive ritual",
    ],
    12: [
      "restless spiritual seeking, too many teachings at once, and the inner noise created when the mind tries to outpace the soul",
    ],
    13: [
      "beginner's mind, fresh spiritual openness, and the phase of the path where innocence and curiosity matter more than expertise",
    ],
    14: [
      "spiritual bypassing, over-strategic practice, and the question of whether discernment is serving truth or protecting the ego from honest encounter",
    ],
    15: [
      "spiritual authority, the weight of a teacher or tradition, and the question of whether power in sacred space is serving or controlling",
    ],
    16: [
      "higher guidance, cosmic orientation, and the long-range spiritual direction that only becomes real when it shapes how you actually live",
    ],
    17: [
      "spiritual transformation, renewal of practice, and the constructive change that helps the inner life evolve rather than stagnate",
    ],
    18: [
      "spiritual companionship, faithful practice partners, and the steady devotional support that holds without needing to perform",
    ],
    19: [
      "spiritual solitude, monastic energy, and the part of the path that requires withdrawal from noise long enough to hear what is real",
    ],
    20: [
      "spiritual community, shared practice, and the sacred context that emerges when inner work becomes visible to and held by others",
    ],
    21: [
      "the spiritual obstacle, the wall that cannot be climbed by effort alone, and the invitation to let stillness do what striving cannot",
    ],
    22: [
      "the spiritual crossroads, the choice between paths or traditions, and the fork where deepening requires choosing one direction honestly",
    ],
    23: [
      "spiritual erosion, doubt that wears away faith, and the quiet attrition of practice when meaning drains faster than it is replenished",
    ],
    24: [
      "devotion, the heart of spiritual life, and the love that keeps practice alive when intellectual understanding alone is not enough",
    ],
    25: [
      "spiritual vows, sacred commitments, and the repeating promises that shape the inner life until they are consciously renewed or released",
    ],
    26: [
      "esoteric knowledge, hidden teachings, and the part of the spiritual path that only reveals itself through study, initiation, or time",
    ],
    27: [
      "sacred texts, spiritual writing, and the moment where inner experience becomes articulate enough to be shared or recorded",
    ],
    28: [
      "the spiritual mirror, the teacher or counterpart who reflects back what you cannot yet see in yourself",
    ],
    29: [
      "your own spiritual stance, the sincerity of your seeking, and the way your inner posture is shaping what can be received",
    ],
    30: [
      "spiritual maturity, elder wisdom, and the quieter holiness that comes from having walked the path long enough to stop performing it",
    ],
    31: [
      "illumination, spiritual clarity, and the phase where practice begins producing genuine warmth and visible inner light",
    ],
    32: [
      "mystical experience, lunar intuition, and the part of the spiritual path that works through dreams, cycles, and what cannot be fully articulated",
    ],
    33: [
      "spiritual breakthrough, the key insight that unlocks a deeper level of understanding, and the moment where seeking gives way to finding",
    ],
    34: [
      "spiritual abundance, the flow of grace, and the practical question of how inner richness translates into a life that actually sustains the path",
    ],
    35: [
      "spiritual endurance, anchored faith, and the practice that can still hold after ecstasy fades and ordinary life returns",
    ],
    36: [
      "the weight of sacred duty, spiritual suffering, and the part of the path that asks something real to be carried as offering rather than complaint",
    ],
  },
};

const HOUSE_ASSOCIATION_NOTES: Partial<Record<number, DomainNotes>> = {
  3: {
    love: [
      "emotional distance, changing context, and the way a bond feels different once one or both people are no longer standing on familiar ground",
    ],
  },
  2: {
    general: [
      "brief openings, lucky timing, and the kind of small chance that disappears if it is ignored",
    ],
    love: [
      "lightness, flirtation, and the fleeting opening that can soften a tense emotional field",
    ],
    work: [
      "quick wins, small openings, and low-risk chances that matter because they arrive briefly",
    ],
  },
  8: {
    general: [
      "rest, closure, endings that need to be honored, and the quiet space required before anything healthy can restart",
    ],
    love: [
      "old heartbreak, emotional endings, and the need to let what has gone cold actually come to rest",
    ],
    work: [
      "retired systems, exhausted workflows, and the point where patching the old way forward costs more than replacing it",
    ],
  },
  12: {
    general: [
      "nervous conversation, quick exchanges, and the atmosphere created when too much is being said at once",
    ],
    money: [
      "nervous money talk, conflicting notices, and the atmosphere created when the financial picture is being discussed faster than it is being understood",
    ],
    love: [
      "texting loops, anxious check-ins, and the unstable mood created when contact outruns clarity",
    ],
    work: [
      "meetings, status updates, short-cycle decisions, and the mental noise created by too many moving parts",
    ],
  },
  13: {
    general: [
      "fresh starts, small experiments, and the part of the situation that is still tender enough to be shaped",
    ],
    love: [
      "new emotional ground, tentative beginnings, and the part of the bond that still needs gentleness rather than pressure",
    ],
    work: [
      "small pilots, early-stage ideas, and the part of the work that benefits from being tested lightly before it scales",
    ],
  },
  17: {
    general: [
      "upgrades, movement, and the kind of change that improves the pattern when it is made in the right order",
    ],
    money: [
      "financial improvement, better sequencing, and the changes that help the money picture work more cleanly",
    ],
    love: [
      "relationship improvement, movement, and the chance to update a bond without forcing it",
    ],
    work: [
      "process improvement, transfers, upgrades, and the changes that help a system work better rather than just look busier",
    ],
  },
  18: {
    general: [
      "loyal support, reciprocal trust, and the help that proves itself through consistency",
    ],
    money: [
      "reliable help, practical support, and the part of the financial picture that is made easier by dependable backing",
    ],
    love: [
      "friendship inside the bond, reliable support, and affection that becomes believable through steadiness",
    ],
    work: [
      "dependable colleagues, useful allies, and support that actually holds under pressure",
    ],
  },
  19: {
    general: [
      "distance, standards, formal structure, and the part of the situation governed by rules rather than mood",
    ],
    love: [
      "distance, reserve, and the guarded patterns that can keep genuine connection at arm's length",
    ],
    work: [
      "institutions, hierarchy, and the systems of approval that determine what can move",
    ],
  },
  22: {
    general: [
      "branching options, pressure to choose, and the paths that stop looking equal once consequences come into view",
    ],
    love: [
      "relationship direction, alternatives, and the need to name what kind of bond this is becoming",
    ],
    work: [
      "role choice, diverging priorities, and the strategic cost of leaving a fork unresolved",
    ],
  },
  23: {
    general: [
      "erosion, worry, and the small recurring losses that quietly change the mood of the whole situation",
    ],
    love: [
      "small disappointments, suspicious over-reading, and the slow wear created by what keeps being left unresolved",
    ],
    work: [
      "admin drag, repeated fixes, missing details, and the kind of leak that keeps good work from holding",
    ],
  },
  24: {
    general: [
      "value alignment, devotion, and the part of the story that has to be chosen with the heart as well as the mind",
    ],
    love: [
      "tenderness, devotion, and the emotional truth the relationship keeps circling back toward",
    ],
    work: [
      "morale, values, and the question of whether the effort still feels worth giving yourself to",
    ],
  },
  25: {
    general: [
      "promises, loops, and the terms that keep repeating until they are renewed or revised on purpose",
    ],
    love: [
      "commitment, mutual promises, and the repeating shape the bond keeps taking",
    ],
    work: [
      "contracts, obligations, and the agreements that keep structuring the workload",
    ],
  },
  30: {
    general: [
      "maturity, peace, ethics, and the wisdom that comes from restraint without passivity",
    ],
    love: [
      "respect, calm intimacy, and the slower, steadier tone that lets feeling deepen without drama",
    ],
    work: [
      "professional maturity, composure, and principled judgment that steadies the whole field",
    ],
  },
  26: {
    general: [
      "private knowledge, what is not yet visible, and the fact that some answers remain closed until they are earned",
    ],
    love: [
      "private feelings, withheld context, and the conversations that have not yet been brave enough to happen out loud",
    ],
    work: [
      "restricted information, specialist knowledge, and the leverage hidden inside what others have not yet understood",
    ],
  },
  27: {
    general: [
      "records, messages, paperwork, and the version of events that can actually be shown, tracked, or proved",
    ],
    love: [
      "messages, explicit wording, and the relief that comes when emotion is finally translated into something clear",
    ],
    work: [
      "paper trails, instructions, filings, and the written proof that keeps the process from dissolving into guesswork",
    ],
  },
  33: {
    general: [
      "the lock, the answer, and the point where uncertainty gives way to something usable",
    ],
    love: [
      "the clarifying moment, the honest answer, and the conversation that finally reveals whether the bond can open further",
    ],
    work: [
      "the strategic fix, approval point, or decisive answer that turns a stuck process back into motion",
    ],
  },
  34: {
    general: [
      "flow, exchange, and what is moving or stalling in practical terms",
    ],
    love: [
      "reciprocity, generosity, and whether emotional giving is actually flowing both ways",
    ],
    work: [
      "money flow, resources, and the channels through which value is really moving",
    ],
  },
  35: {
    general: [
      "staying power, commitment, and what can still hold after the first excitement fades",
    ],
    love: [
      "consistency, commitment, and the kind of steadiness that makes attachment feel safe",
    ],
    work: [
      "career durability, long effort, and the structures that can support sustained work without collapse",
    ],
  },
  36: {
    general: [
      "meaningful burden, duty, and the weight that has to be carried consciously if it is to remain worthwhile",
    ],
    money: [
      "fixed obligations, unavoidable cost, and the financial weight that has to be budgeted honestly rather than carried by wishful thinking",
    ],
    love: [
      "shared burden, relational gravity, and the question of what the bond can hold without becoming heavy in the wrong way",
    ],
    work: [
      "responsibility, consequence, and the burden that comes with serious stakes",
    ],
  },
};

const SUBJECT_HOUSE_ASSOCIATION_NOTES: Partial<Record<SubjectId, Partial<Record<number, string[]>>>> = {
  general_reading: {
    3: [
      "the wider situation entering a phase of movement, changing context, or expanded distance that shifts perspective and what counts as progress",
    ],
    4: [
      "the underlying base, routine, or structural foundation the wider situation still has to stand on",
    ],
    5: [
      "the slower growth pattern that only reveals its value through steadier pacing and time",
    ],
    14: [
      "the strategic layer of the wider situation, including where caution is useful and where self-protective distortion is starting to blur the picture",
    ],
    16: [
      "the longer-range signal or clearer pattern that only becomes obvious once the noise starts to quiet",
    ],
    11: [
      "the repeating cycle, pressure point, or friction pattern that will keep shaping the wider situation until the pattern itself changes",
    ],
    9: [
      "an opening, visible goodwill, or a more encouraging tone that can soften the wider situation without resolving it by itself",
    ],
    20: [
      "the wider visible field, public dynamics, or network around the situation that starts mattering once events cannot stay private or abstract",
    ],
    6: [
      "uncertainty, obscured motives, and the part of the wider situation that still cannot be read cleanly",
    ],
    22: [
      "the branch point where the wider situation stops tolerating delay and asks for a real decision",
    ],
    23: [
      "the small repeated drain or erosion quietly changing the wider situation because no one is dealing with it directly",
    ],
    26: [
      "the hidden layer, withheld information, or part of the situation that still needs to be learned before it can be named cleanly",
    ],
    28: [
      "the other side of events, mirrored roles, or the part of the wider situation you do not define alone",
    ],
    29: [
      "your own role, boundaries, and the stance quietly shaping the wider situation from inside it",
    ],
    32: [
      "the shifting mood, visibility, or recognition cycle affecting how the wider situation is being read",
    ],
    33: [
      "the answer point, decisive fix, or piece of clarity that can actually unlock movement",
    ],
    35: [
      "what can genuinely hold once the reactive phase passes and the situation has to prove its staying power",
    ],
  },
  personal_growth: {
    1: [
      "first movement, incoming truth, and the part of growth that begins the moment you stop waiting for perfect readiness",
    ],
    2: [
      "the brief opening where change is possible now, provided you do not dismiss it because it is small",
    ],
    3: [
      "the transition out of old ground, where growth begins once something actually leaves its old context",
    ],
    4: [
      "the base structure, home pattern, or inner foundation that has to change if the rest of growth is going to hold",
    ],
    5: [
      "healing, rooted growth, and the part of change that only becomes real through patience and repetition",
    ],
    6: [
      "self-doubt, obscured motives, and the part of your inner life that still cannot be read cleanly",
    ],
    7: [
      "layered motives, self-protective strategy, and the part of growth that needs cleaner boundaries instead of more suspicion",
    ],
    11: [
      "the repeating inner loop, friction pattern, or self-conflict that will keep replaying until something in the pattern actually changes",
    ],
    13: [
      "an early-stage revision of the self, still tender enough to be shaped differently before it hardens",
    ],
    14: [
      "self-protective strategy, discernment, and the question of whether caution is helping growth or guarding the old pattern",
    ],
    15: [
      "power, stewardship, and the question of how to carry strength without letting control become the answer to everything",
    ],
    16: [
      "guidance, long-range signal, and the part of growth that only helps once it becomes one lived step at a time",
    ],
    20: [
      "the visible social field where growth becomes mirrored, witnessed, pressured, or tested in public",
    ],
    21: [
      "the blockage, inner resistance, or slower passage that can only be worked in stages instead of forced",
    ],
    22: [
      "the identity fork where one path strengthens self-respect and another only repeats the old compromise",
    ],
    10: [
      "the clean cut or sharper boundary that ends one pattern so another can finally begin",
    ],
    29: [
      "your own role, boundaries, and the stance that quietly sets the tone for the whole inner process",
    ],
    32: [
      "emotional cycles, self-image, and the changing visibility of growth as it is felt, mirrored, or recognized",
    ],
    33: [
      "the answer point, clarifying truth, or inner recognition that finally makes the next step usable",
    ],
    35: [
      "what can genuinely steady you once the first emotional surge passes",
    ],
  },
  community: {
    1: [
      "the next update, invitation, or visible shift in the wider field that changes how the group is moving",
    ],
    2: [
      "a small opening, brief easing, or moment of welcome in the wider field that matters only if it is used in time",
    ],
    5: [
      "the longer growth pattern of belonging, where steadier trust and slower rooting matter more than quick proof",
    ],
    6: [
      "the unclear group mood, mixed signals, and part of the wider field that still cannot be read cleanly",
    ],
    4: [
      "the group's base structure, shared ground, and the conditions that have to hold before belonging can deepen reliably",
    ],
    8: [
      "a pause, exit, or quiet withdrawal in the wider field, including what has cooled enough that it should not be forced back into life",
    ],
    10: [
      "the sharper boundary, decisive cut, or clean break that quickly changes who participates and on what terms",
    ],
    23: [
      "the repeated low-grade drain, group stress, or quiet erosion that keeps changing tone if nobody deals with it directly",
    ],
    27: [
      "the message trail, explicit wording, or record that starts changing group response once it can no longer stay implied",
    ],
    28: [
      "the other side of belonging, mirrored roles, and the part of the group dynamic you do not define alone",
    ],
    11: [
      "repetition, group pressure, and the loop of friction that keeps replaying until the pattern is interrupted",
    ],
    12: [
      "nervous conversation, reactive discussion, and the atmosphere created when too many voices are trying to steer at once",
    ],
    3: [
      "movement between circles, changing group context, and the way belonging shifts once people move from one shared space into another",
    ],
    9: [
      "the warmer response, visible welcome, or sign of goodwill that can soften the group atmosphere if it is real",
    ],
    15: [
      "the group's power center, gatekeeping, influence, and the question of who is quietly shaping the terms of belonging",
    ],
    16: [
      "the longer-view group signal, shared direction, and the pattern that only helps once it becomes concrete enough to guide participation",
    ],
    19: [
      "distance, standards, formal structure, or gatekeeping that shapes belonging through rules more than warmth",
    ],
    20: [
      "the visible group field, shared spaces, and networks where belonging becomes public enough to affect tone",
    ],
    21: [
      "the blockage, delay, or slower passage in the wider field that calls for patience and careful sequencing",
    ],
    24: [
      "shared values, real affinity, and the part of belonging that has to feel mutual if it is going to keep holding",
    ],
    25: [
      "the group agreement, repeated norm, or recurring social terms that keep renewing themselves until someone revises them on purpose",
    ],
    29: [
      "your place in the wider field, including how your participation, absence, or boundaries are quietly setting the tone",
    ],
    30: [
      "maturity, restraint, and the steadier tone that helps participation hold without hardening into coldness",
    ],
    31: [
      "clearer visibility, confidence, and the point where your place in the wider field becomes easier for others to read",
    ],
  },
  travel: {
    1: [
      "the next update, departure cue, or first movement that changes what the trip can actually do now",
    ],
    2: [
      "a small opening in timing, luck, or access that helps only if it is used quickly",
    ],
    3: [
      "the route itself, transit, distance, and the way the trip changes once it is truly in motion",
    ],
    4: [
      "home base, staging, and the practical foundation the trip depends on once movement begins",
    ],
    9: [
      "the helpful tone, smoother handling, or goodwill that makes the next stage easier if it is used concretely",
    ],
    5: [
      "the slower pace, physical stamina, and the part of travel that only improves through steadier sequencing and enough recovery time",
    ],
    6: [
      "unclear timing, weather, conditions, or information that still needs checking before it can be trusted",
    ],
    7: [
      "layered logistics, hidden variables, and the part of travel that has to be read carefully instead of assumed",
    ],
    10: [
      "sharp decisions, reroutes, and abrupt cuts that change the journey more quickly than expected",
    ],
    11: [
      "repeat friction, transit stress, and the loop that keeps making movement harder than it needs to be",
    ],
    16: [
      "the route signal, timing map, and longer-view direction that helps only once movement is sequenced clearly",
    ],
    17: [
      "upgrades, resequencing, and the kind of change that improves a trip when it is done in the right order",
    ],
    19: [
      "terminals, checkpoints, institutional rules, and the formal structure that decides what proceeds or stalls",
    ],
    20: [
      "public spaces, crowds, and the visible field of who else is shaping the journey",
    ],
    21: [
      "delay, blockage, route obstruction, and the part of travel that only yields to patience or rerouting",
    ],
    22: [
      "route choice, itinerary branching, and the decision about which path actually reduces uncertainty",
    ],
    26: [
      "hidden details, bookings not fully visible yet, and what still has to be checked before you rely on it",
    ],
    27: [
      "tickets, confirmations, visas, and the documents that make the trip real",
    ],
    28: [
      "the other traveler, host, or outside party whose timing now affects the route",
    ],
    29: [
      "your own role in the journey, including what only you can confirm, organize, or decide",
    ],
    31: [
      "clearer visibility, confidence, and the point where the route becomes easier to trust and act on",
    ],
    32: [
      "timing, visibility, weather, and the changing feel of the trip as conditions shift from stage to stage",
    ],
    33: [
      "the confirmation, approval, or answer point that unlocks the next travel step",
    ],
    35: [
      "what can still hold, including the stable booking, fallback plan, or base arrangement that keeps the trip workable",
    ],
  },
  education: {
    2: [
      "small openings in timing, extensions, or narrow chances to improve the academic position if they are used promptly",
    ],
    3: [
      "distance study, expanded perspective, and the stretch of education that changes once the path moves beyond familiar ground",
    ],
    4: [
      "home study base, practical foundations, and the routines that have to hold before progress can scale cleanly",
    ],
    5: [
      "the slower pace, long study growth, and the part of learning that only improves through steadier repetition",
    ],
    6: [
      "unclear requirements, ambiguity in the brief, and the part of education that still needs clarifying before you commit harder",
    ],
    8: [
      "pause, deferral, and the phase of the academic path that has to close or rest before the next step becomes workable",
    ],
    9: [
      "encouraging response, smoother handling, and the kind of favorable opening that helps the academic path move more easily",
    ],
    7: [
      "layered requirements, mixed motives, or the part of the academic path that has to be read more carefully than it first appears",
    ],
    12: [
      "application nerves, exam chatter, and the mental noise that makes the academic picture feel busier than it really is",
    ],
    13: [
      "an early-stage study effort, application, or skill that is still tender enough to shape before it hardens",
    ],
    14: [
      "study strategy, tactical caution, and the question of whether method is helping focus or hardening into overcontrol",
    ],
    15: [
      "academic pressure, standards, or oversight that carries weight because someone else can still judge the outcome",
    ],
    16: [
      "the longer-view study signal, qualification arc, and the part of the path that only helps once it becomes an actual plan",
    ],
    20: [
      "the visible cohort or public academic field where effort becomes mirrored, measured, or compared",
    ],
    22: [
      "the study-path fork, application choice, or decision about which route actually reduces uncertainty",
    ],
    26: [
      "research, hidden requirements, and the part of the course or application that is still not fully visible",
    ],
    28: [
      "the evaluator, teacher, admissions side, or other party whose judgment affects the path",
    ],
    29: [
      "your own learning position, including what only you can prepare, clarify, or submit",
    ],
    31: [
      "visible progress, confidence, and the kind of result signal that makes the next academic step easier to trust",
    ],
    34: [
      "fees, materials, workload flow, and the practical resource picture that has to keep moving without leakage",
    ],
    33: [
      "the answer point, acceptance, result, or answer that unlocks the next academic step",
    ],
    35: [
      "what can still hold as study rhythm, stamina, and sustainable effort",
    ],
  },
  creative: {
    4: [
      "studio base, practical foundations, and the routine strong enough to keep the work moving when inspiration alone is not enough",
    ],
    5: [
      "slow creative growth, deeper roots, and the kind of progress that only becomes real through steadier pacing",
    ],
    6: [
      "unclear direction, mixed signals in the work, and the part of the process that still needs clarifying before you commit harder",
    ],
    7: [
      "creative complication, layered motives, and the part of the work that gets harder when too many agendas are touching it at once",
    ],
    8: [
      "the pause, ending, or quiet withdrawal the work may need before anything healthier can restart",
    ],
    9: [
      "encouragement, favorable response, and the kind of smoother opening that helps the work move if it is used concretely",
    ],
    11: [
      "repetition, rehearsal, and the refinement loop that either sharpens the work or keeps it trapped",
    ],
    12: [
      "creative chatter, nerves, and the mental weather created when too much is being said at once",
    ],
    13: [
      "fresh starts, small experiments, and the version of the work that is still early enough to shape well before it hardens",
    ],
    14: [
      "creative strategy, craft discipline, and the question of whether method is helping focus or hardening into overcontrol",
    ],
    15: [
      "resources, authority, and stewardship, and the question of how to hold power without letting it dictate the work",
    ],
    16: [
      "the longer-view creative signal, where clarity, direction, and the body of work only help once they become a real plan",
    ],
    17: [
      "constructive revision, resequencing, and the kind of change that improves the work when it is done in the right order",
    ],
    20: [
      "the visible creative field, audience response, and the public setting where the work starts being mirrored, measured, or received",
    ],
    21: [
      "blockage, resistance, and the part of the process that has to be worked around instead of bullied into movement",
    ],
    23: [
      "repeated drain, attrition, and the little losses that become serious only after they keep repeating",
    ],
    24: [
      "what genuinely matters in the work and what still needs to be protected if it is going to stay alive",
    ],
    28: [
      "the audience, collaborator, commissioner, or outside response that shapes the work without being fully under your control",
    ],
    29: [
      "your own creative field, including what only you can shape, revise, or release",
    ],
    30: [
      "craft maturity, restraint, and the steadier hand that knows how to refine without overworking",
    ],
    31: [
      "visible traction, confidence, and the clearer result signal that makes the work easier to trust",
    ],
    32: [
      "recognition cycles, changing visibility, and the emotional weather created by being seen or evaluated",
    ],
    35: [
      "what can genuinely hold as practice and sustainable output",
    ],
  },
  health: {
    1: [
      "the first bodily or practical movement that shows something is starting to respond",
    ],
    3: [
      "movement between settings, changing rhythms, and the part of recovery that depends on transitions being handled more gently",
    ],
    4: [
      "routines, foundations, and the question of what the body is leaning on day after day",
    ],
    5: [
      "recovery, rooted repair, and the slower healing that only holds when it is paced realistically",
    ],
    6: [
      "unclear symptoms, uncertainty, and what the system is still struggling to name cleanly",
    ],
    8: [
      "rest, recovery, and the pause that has to be honored before the system can restart more cleanly",
    ],
    11: [
      "repeating strain, flare cycles, or the loop that keeps re-aggravating the system",
    ],
    12: [
      "nervous activation, overtalk, and the inner noise that keeps the body on alert",
    ],
    14: [
      "discernment, overmanagement, and the question of whether vigilance is helping the system or exhausting it",
    ],
    17: [
      "recovery movement, improvement, and the change in routine that helps the system respond better",
    ],
    18: [
      "steady support, consistent care, and what helps the system feel less alone with the load",
    ],
    20: [
      "the visible social field where wellbeing becomes mirrored, witnessed, pressured, or supported by other people",
    ],
    21: [
      "blockage, slower passage, and the part of healing that cannot be forced without becoming heavier",
    ],
    23: [
      "depletion, low-grade stress, and the repeated drain that needs attention before it becomes the whole story",
    ],
    24: [
      "what genuinely nourishes the system and needs to be protected if recovery is going to deepen",
    ],
    25: [
      "recurring patterns, bodily agreements, and the terms under which the system keeps trying to function",
    ],
    28: [
      "mirror dynamics, outside expectations, and the part of recovery that keeps adapting to other people's needs or responses",
    ],
    29: [
      "your own direct experience of the body and what it is honestly telling you",
    ],
    30: [
      "rest, regulation, and the steadier pace that lets the system feel safe again",
    ],
    31: [
      "clearer energy, vitality, and the point where improvement is visible enough to trust",
    ],
    32: [
      "cycles, sensitivity, and the way timing changes what the system can carry",
    ],
    33: [
      "the answer point where what genuinely helps becomes usable",
    ],
    34: [
      "circulation, practical support, and what needs to move more cleanly through the system",
    ],
    35: [
      "what can hold",
    ],
  },
  pets: {
    1: [
      "incoming signals, updates, or behavioral shifts that change what the animal needs next",
    ],
    3: [
      "travel to appointments, movement between settings, or the way a change of environment affects how the animal settles",
    ],
    4: [
      "home base, enclosure, daily setup, and the familiar conditions the animal is relying on",
    ],
    5: [
      "settling, recovery, rooted routine, and the slower improvement that comes from consistency",
    ],
    6: [
      "unclear cues, uncertainty, and the part of the animal's condition that still cannot be read cleanly",
    ],
    7: [
      "mixed signals, layered factors, and the part of the care picture that has to be read carefully instead of reacted to too quickly",
    ],
    8: [
      "a pause, withdrawal, recovery phase, or part of the care picture that needs rest instead of pressure",
    ],
    9: [
      "a warmer response, encouraging sign, or gentler tone that helps the animal soften or settle",
    ],
    10: [
      "a necessary care change, sharper boundary, or quick intervention that changes the tone quickly once it is actually made",
    ],
    11: [
      "the repeating stress loop, flare pattern, or care friction that keeps replaying until the routine changes",
    ],
    12: [
      "anxious talk, over-monitoring, and the nervous atmosphere around the animal",
    ],
    14: [
      "careful handling, vigilance, overprotection, and the question of whether caution is helping or over-tightening the situation",
    ],
    16: [
      "the longer-view care signal, pattern recognition, and the guidance that only helps once it becomes concrete",
    ],
    17: [
      "adjustment, improvement, and the kind of change in routine that helps the animal settle better",
    ],
    18: [
      "dependable care, steady bonding, and the kind of support the animal can actually rely on",
    ],
    20: [
      "the visible care environment, visitors, public outings, or wider field around the animal that starts shaping the situation",
    ],
    21: [
      "delay, blockage, or a slower passage in the care picture that has to be worked patiently instead of forced",
    ],
    22: [
      "the care decision point where one path now needs choosing more cleanly than before",
    ],
    23: [
      "stress, attrition, and the little repeated drains that quietly wear the care rhythm down",
    ],
    24: [
      "what genuinely comforts the animal and what still deserves protection",
    ],
    25: [
      "the repeating care loop, routine agreement, and pattern that keeps renewing itself until it is consciously revised",
    ],
    26: [
      "observation, quieter watching, and the part of the care picture that still needs time before certainty is justified",
    ],
    28: [
      "another caregiver, vet, or outside person's role in the care picture and the parts of the situation you do not control directly",
    ],
    29: [
      "your role in the animal's care, including what only you can observe, pace, or change directly",
    ],
    30: [
      "calm handling, restraint, and the steadier tone that helps the animal settle without pressure",
    ],
    31: [
      "clearer signs of comfort or improvement that make the care picture easier to trust",
    ],
    33: [
      "the usable clue or clarifying sign that helps the next care step make sense",
    ],
    35: [
      "the routine, support, and steadiness that can actually hold after first reactions settle",
    ],
  },
  home_family: {
    1: [
      "incoming developments, messages, or movement that can change the household atmosphere quickly once they are addressed plainly",
    ],
    4: [
      "the household base itself, including the routines, foundations, and sense of safety everything else in family life has to lean on",
    ],
    2: [
      "a brief domestic opening, small relief, or the short window in which home life can be made easier if you act promptly",
    ],
    7: [
      "the complicated part of home life, where motives, tension, and the need for clearer boundaries can no longer be ignored",
    ],
    14: [
      "protective caution at home, including the instinct to prevent one more problem before it starts and the need to separate real discernment from defensive suspicion",
    ],
    8: [
      "the part of the household that needs rest, closure, or a real pause before anything healthy can restart",
    ],
    9: [
      "warmth, goodwill, and the small kindnesses that can soften a strained domestic atmosphere",
    ],
    11: [
      "repeating household strain, conflict, or friction that keeps returning until the pattern itself is changed",
    ],
    16: [
      "the long-range view of how family life could steady once the present delay is worked through",
    ],
    17: [
      "household change, relocation, or practical improvement made in the order reality actually allows",
    ],
    20: [
      "the household's connection to the wider social field, including what is made public, shared, or shaped by the community around it",
    ],
    22: [
      "the domestic crossroads, where the family needs a clearer direction instead of more circling around the same tension",
    ],
    27: [
      "messages, documents, schedules, and the practical information that can change the domestic picture quickly",
    ],
    28: [
      "the other person's influence in the home, and the parts of the domestic story you cannot define alone",
    ],
    29: [
      "your own place in the household, including agency, responsibility, and what the family field is asking you to hold or refuse",
    ],
    32: [
      "the household's emotional weather, including changing moods, sensitivity, and the atmosphere everyone is quietly responding to",
    ],
    34: [
      "the practical flow of resources, support, and shared effort that keeps home life working from day to day",
    ],
    35: [
      "the steadiness, staying power, and practical support that can still hold the household together",
    ],
  },
  friends_social: {
    1: [
      "the incoming social movement, invitation, or first response that starts changing group tone once it actually arrives",
    ],
    9: [
      "the grace, goodwill, and warmer social response that can soften a dynamic if it is received and used honestly",
    ],
    3: [
      "movement between circles, changing social distance, and the shift in tone that comes once the connection leaves familiar ground",
    ],
    17: [
      "improvement, resequencing, and the kind of social change that helps a friendship or group dynamic move into a healthier pattern",
    ],
    6: [
      "the social uncertainty, mixed signals, and ambiguity that have to be clarified before the group can respond cleanly",
    ],
    7: [
      "the layered social dynamic, mixed motives, and the part of the group field that has to be read carefully instead of taken at face value",
    ],
    10: [
      "the clean social cut, sharper boundary, or necessary decision that changes the tone quickly once it is actually made",
    ],
    28: [
      "the mirrored role, other person's social stance, and the part of the friendship dynamic you cannot define from your side alone",
    ],
    2: [
      "the brief easing, social opening, or invitation that can change group tone if it is used promptly and honestly",
    ],
    4: [
      "the shared social base, familiar ground, and the part of the friendship dynamic that only stretches well once it feels steady enough to hold",
    ],
    5: [
      "the slower trust pattern, steadier friendship rhythm, and the social bond that only strengthens through consistency",
    ],
    21: [
      "social delay, blockage, or the part of the group dynamic that has to be rerouted patiently instead of pushed head-on",
    ],
    8: [
      "the social thread that has cooled, paused, or gone quiet enough that forcing it may do more harm than honesty",
    ],
    14: [
      "the guarded strategy, social caution, or mixed motive layer that makes the friendship dynamic harder to trust at face value",
    ],
    11: [
      "the repeating social loop, friendship friction, or group pressure that keeps replaying until someone changes the pattern itself",
    ],
    13: [
      "an early friendship thread, tentative reconnection, or social beginning that still needs gentleness rather than pressure",
    ],
    15: [
      "the social leverage, protection, and group weight that have to be handled fairly if steadiness is going to stay trustworthy",
    ],
    16: [
      "the longer-view social signal, where shared direction and real alignment only help once they become concrete",
    ],
    18: [
      "reliable friendship, reciprocal support, and the kind of social steadiness that becomes believable through follow-through",
    ],
    20: [
      "the visible social field, group atmosphere, and network context that starts shaping everything once the dynamic can no longer stay private",
    ],
    24: [
      "what genuinely matters in the friendship, and the care or trust that has to be protected if the bond is going to stay real",
    ],
    25: [
      "the promises, loops, and social terms that keep renewing themselves until they are consciously revised",
    ],
    26: [
      "private knowledge, what is not yet visible, and the part of the social dynamic that still needs learning before certainty is justified",
    ],
    27: [
      "records, messages, explicit wording, and the importance of what can be tracked or stated plainly between people",
    ],
    29: [
      "your social position, boundaries, and the way your stance quietly sets the tone in the group",
    ],
    30: [
      "social maturity, restraint, and the steadier tone that helps a friendship or group dynamic stay clear without becoming cold",
    ],
    31: [
      "the visible social warmth, clearer momentum, and the part of the friendship field that becomes easier to trust once it is openly alive",
    ],
    32: [
      "visibility, reputation, and the emotional weather created when a friendship or group dynamic is being watched, mirrored, or talked about",
    ],
    33: [
      "the clarifying moment or social truth that lets guessing stop and response become cleaner",
    ],
    34: [
      "the flow of contact, reciprocity, and practical give-and-take that keeps friendships feeling alive rather than stalled or one-sided",
    ],
    35: [
      "the dependable backing, long-term friendship, and social steadiness that still proves itself after first reactions fade",
    ],
    36: [
      "the social burden, moral weight, or duty in the group that has to be carried wisely rather than theatrically",
    ],
  },
  love: {
    8: [
      "an ending already written into the emotional field, and the need to stop reviving what has already gone quiet",
    ],
    12: [
      "relationship talk, anxious anticipation, and the unstable mood created when messages arrive faster than certainty",
    ],
    23: [
      "small hurts, quiet suspicion, and the attrition that starts when reassurance never quite lands",
    ],
    24: [
      "devotion, tenderness, and the values the relationship has to be built on if it is to last",
    ],
    25: [
      "commitment, return patterns, and the promises that either bind the bond or trap it in repetition",
    ],
    28: [
      "the counterpart's stance, their availability, and the part of the story you cannot determine alone",
    ],
    29: [
      "your own stance in the bond, including boundaries, openness, and the signals you keep sending",
    ],
  },
  legal_admin: {
    8: [
      "pause, closure, file exhaustion, and the point where one phase has to be closed cleanly before the next can proceed",
    ],
    9: [
      "goodwill, smoother handling, and the kind of small procedural opening that helps a difficult file move without changing its obligations",
    ],
    16: [
      "clear direction, long-range strategy, and the process line that only helps once it is converted into actual next steps",
    ],
    17: [
      "stage change, corrected sequencing, and the improvement that comes when the matter moves in the right order",
    ],
    13: [
      "an early-stage filing, provisional step, or matter still open enough to be corrected before it hardens into a bigger problem",
    ],
    21: [
      "backlog, formal blockage, and the part of the process that only yields to methodical sequencing",
    ],
    24: [
      "the material or ethical stake the file is actually trying to protect, establish, or defend",
    ],
    31: [
      "clear visibility, formal progress, and the point where the matter can be seen and tested openly instead of argued in the abstract",
    ],
    30: [
      "measured judgment, settled terms, and the kind of restrained handling that makes a file more credible instead of noisier",
    ],
    1: [
      "incoming notices, updates, and the first procedural movement that changes what has to happen next",
    ],
    2: [
      "brief openings, small timing windows, and the kind of narrow procedural advantage that matters only if it is used promptly",
    ],
    3: [
      "routing, transfer, jurisdiction, or the part of the matter that changes hands before it resolves",
    ],
    4: [
      "fixed conditions, baseline obligations, and the structural footing the rest of the process depends on",
    ],
    7: [
      "strategic pressure, mixed motives, and the part of the process that has to be read carefully before you answer it",
    ],
    5: [
      "long-running process, patient follow-through, and the part of the matter that only improves through steady, documented progress",
    ],
    6: [
      "uncertain facts, incomplete review, and the part of the matter that cannot be forced clear before the record catches up",
    ],
    15: [
      "authority, leverage, approvals, and the question of who can actually move or stall the process",
    ],
    10: [
      "hard deadlines, decisive cuts, and the point where the process stops allowing delay or loose interpretation",
    ],
    11: [
      "repeat requests, pressure loops, and the procedural cycle that will keep replaying until something in the file actually changes",
    ],
    19: [
      "formal systems, hierarchy, rules, and the authority that decides what proceeds, pauses, or gets refused",
    ],
    20: [
      "the public field where visibility, outside attention, and who sees the matter start shaping how it moves",
    ],
    23: [
      "clerical erosion, missing attachments, repeat requests, and the admin fatigue caused by preventable gaps",
    ],
    25: [
      "binding terms, contract cycles, and the obligations that keep resetting the matter",
    ],
    26: [
      "sealed information, protected documents, research, and the details that stay decisive even before disclosure",
    ],
    27: [
      "filings, notices, submissions, and the paper trail that makes the case real",
    ],
    28: [
      "the other side's role, decision-making position, and the part of the matter whose timing or response you cannot define alone",
    ],
    29: [
      "your filed position, the parts of the record only you can authorize, and the procedural stance that now belongs to you rather than the other side",
    ],
    12: [
      "follow-up loops, procedural chatter, and the kind of admin noise that can blur what actually changed in the file",
    ],
    32: [
      "visibility, review cycles, and the way the matter is being read as updates, responses, or scrutiny change the tone",
    ],
    34: [
      "fees, transfers, access, and the part of the process that only moves once resources or approvals actually clear",
    ],
    35: [
      "deadlines that can still hold, enforceable commitments, and the part of the process that remains structurally sound after the first reaction passes",
    ],
    33: [
      "the approval point, decisive clause, or clear answer that finally unlocks progress",
    ],
  },
  money: {
    1: [
      "incoming updates, a quick decision window, and the first movement that can change the money picture",
    ],
    7: [
      "strategy, layered motives, and the need to read incentives clearly before committing money or trust",
    ],
    9: [
      "goodwill, a favorable response, and the kind of support or offer that can help if the terms are real",
    ],
    4: [
      "baseline costs, household overhead, and the part of the budget that has to be carried consistently",
    ],
    5: [
      "slow repair, long-view growth, and the financial health that improves only when pacing becomes steadier",
    ],
    16: [
      "strategy, forecasting, and the clearer long-range direction that helps financial choices stop reacting to every short-term swing",
    ],
    3: [
      "trade, transfers, moving costs, and the route money has to travel before it arrives where it can actually help",
    ],
    11: [
      "fast corrections, pressure cycles, and the kind of short-turn consequences that make rushed responses expensive",
    ],
    12: [
      "money talk, repeated notices, and the unstable atmosphere created when updates arrive faster than clarity",
    ],
    13: [
      "a small financial beginning, trial plan, or early-stage option that still needs gentle handling",
    ],
    14: [
      "caution, defensive budgeting, and the difference between sensible protection and fear-based contraction",
    ],
    18: [
      "practical support, dependable backing, and the help that proves itself through consistency",
    ],
    19: [
      "rules, institutions, account boundaries, and the formal structure shaping what the money picture can realistically do",
    ],
    6: [
      "uncertain pricing, unclear timing, and the financial fog that makes clean judgment harder than it should be",
    ],
    8: [
      "a contraction, pause, or write-off that needs to be acknowledged before the next money phase can be planned honestly",
    ],
    15: [
      "resource control, stewardship, and the question of who really holds financial leverage",
    ],
    32: [
      "financial cycles, visibility, confidence swings, and the pattern that only makes sense once you watch it over time",
    ],
    23: [
      "financial leakage, recurring charges, small losses, and the anxiety created by what keeps draining quietly",
    ],
    25: [
      "financial obligations, subscriptions, debt cycles, and the terms that keep claiming a share of the flow",
    ],
    27: [
      "paperwork, statements, notices, and the details that reveal where the numbers are actually tightening or opening",
    ],
    28: [
      "the other party, shared leverage, or counterpart expectations shaping the money picture without being fully under your control",
    ],
    29: [
      "your own financial position, agency, and the choices that can genuinely change the flow",
    ],
    33: [
      "the fix, approval point, or clear answer that starts making the money picture usable again",
    ],
    34: [
      "cash movement, liquidity, and the channels through which resources are actually traveling",
    ],
    35: [
      "lasting security, durable income, and the structures that can keep holding once short-term conditions change",
    ],
  },
  purpose_calling: {
    1: [
      "the first real movement on the path, where a message, opening, or concrete signal asks to be answered in practice",
    ],
    3: [
      "movement, distance, and the wider perspective that reshapes the path once it leaves familiar ground",
    ],
    4: [
      "the ordinary foundations, daily structure, and lived conditions that have to support the path if it is going to be real",
    ],
    9: [
      "encouragement, grace, and the kind of welcome that makes the path feel more livable in ordinary life",
    ],
    26: [
      "the part of the path still being studied, protected, or slowly understood before it can be lived more openly",
    ],
    6: [
      "uncertainty around the path, where honest naming has to come before deeper commitment",
    ],
    8: [
      "the part of the old path that is already over, and the rest required before a more truthful one can begin",
    ],
    10: [
      "the necessary cut, refusal, or decisive boundary that frees energy for the path that is actually yours",
    ],
    12: [
      "anxious discussion, too many voices, and the temptation to confuse ongoing talk with real direction",
    ],
    14: [
      "defensive caution, strategic self-protection, and the need to distinguish discernment from fear on the path",
    ],
    15: [
      "the question of what kind of support, stewardship, or authority your calling can actually stand on",
    ],
    16: [
      "the long-range direction of the path, and the pattern that only becomes obvious once short-term noise is named for what it is",
    ],
    20: [
      "the wider public field where the path has to take visible form, including audience, networks, and the question of what can stand in the open",
    ],
    21: [
      "the delay, obstruction, or outer resistance that forces the path to be worked in stages rather than forced for image or speed",
    ],
    23: [
      "the small repeated drain that quietly weakens conviction, focus, or sustainability if it is left unnamed",
    ],
    22: [
      "vocational choice, branch points, and the paths that ask different versions of you to step forward",
    ],
    24: [
      "felt meaning, vocation with heart, and what still rings true beneath ambition or obligation",
    ],
    25: [
      "recurring promises, inherited loyalties, and the commitments that have to be renewed consciously if they still belong to the path",
    ],
    34: [
      "the real flow of energy, support, and lived momentum that shows whether the path can actually carry you forward",
    ],
    28: [
      "the other person's field, including outside expectations, mirrors, or agendas that are not fully yours to carry",
    ],
    29: [
      "your own agency in the path, where intention has to become deliberate instead of merely inherited",
    ],
    30: [
      "maturity, ethical restraint, and the quieter wisdom that keeps the path from being driven by urgency or image",
    ],
    31: [
      "clear visibility, confidence, and the kind of unmistakable progress that shows the path can be lived rather than only imagined",
    ],
    32: [
      "the changing visibility of the path, where recognition, mood, and inner response affect what feels real enough to keep choosing",
    ],
    33: [
      "the answer point where the path stops being abstract and asks for a real decision you can actually live with",
    ],
    35: [
      "enduring vocation, practiced craft, and the path that still holds after the early excitement settles",
    ],
    36: [
      "meaningful burden, service, and the difference between devotion and self-erasure",
    ],
  },
  work: {
    3: [
      "movement across teams, handoffs, outside channels, and the route the work has to travel before it lands cleanly",
    ],
    5: [
      "long-term capacity, sustainability, and whether the role or system can actually hold the pace being asked of it",
    ],
    6: [
      "uncertainty, mixed signals, and unclear reporting that make priorities harder to judge cleanly",
    ],
    7: [
      "office politics, mixed motives, and tactical behavior that need clearer boundaries and cleaner reading",
    ],
    11: [
      "pressure cycles, repeated correction loops, and the friction that keeps proving the process is not fixed yet",
    ],
    12: [
      "meeting noise, repeated check-ins, and the short-cycle decisions that crowd out clear judgment",
    ],
    15: [
      "budget authority, resource control, and the question of who can actually sponsor, protect, or block movement",
    ],
    16: [
      "strategic direction, long-range alignment, and the plan that becomes clearer once short-term noise is cut back",
    ],
    20: [
      "team visibility, external networks, and the wider field of people or stakeholders shaping how the work is received",
    ],
    32: [
      "reputation, visibility, and the feedback loops that shape how your work is being perceived",
    ],
    21: [
      "blocked progress, delayed approvals, and the part of the work that now has to be sequenced around instead of forced",
    ],
    23: [
      "workflow leaks, repeated corrections, low-grade stress, and the hidden cost of everything that needs fixing twice",
    ],
    26: [
      "restricted information, policy detail, specialist knowledge, and the gap between what is assumed and what is actually known",
    ],
    27: [
      "instructions, approvals, filings, and the written trail that keeps the work defensible",
    ],
    28: [
      "the stakeholder, client, manager, or other side of the process whose agenda shapes what can move and when",
    ],
    35: [
      "career durability, long effort, and the conditions that make a role sustainable rather than merely demanding",
    ],
  },
};

const SUBJECT_OVERLAY_ASSOCIATION_NOTES: Partial<Record<SubjectId, Record<string, string[]>>> = {
  general_reading: {
    "1-29": [
      "your position receiving fresh news, a first move, or an early signal that resets the timeline",
    ],
    "2-29": [
      "a brief window forming around your own position, where a small practical step matters more than waiting for a bigger opening",
    ],
    "3-29": [
      "your own role moving into a wider phase where changing context, distance, or momentum starts altering what progress actually looks like",
    ],
    "4-29": [
      "your role becoming anchored to a structure, routine, or obligation that limits movement but provides stability",
    ],
    "5-29": [
      "your own position being asked to grow slowly, root more deeply, or let a longer pattern play out before forcing outcomes",
    ],
    "6-29": [
      "your own stance passing through uncertainty, where clearer reading matters more than premature certainty",
    ],
    "8-29": [
      "your position entering a pause, ending, or withdrawal phase that cannot be rushed through",
    ],
    "10-29": [
      "a sharp cut, fast decision, or clean reroute landing directly on your role and requiring immediate clarity",
    ],
    "11-29": [
      "repeated strain or friction wearing against your position until something is simplified or renegotiated",
    ],
    "14-29": [
      "your role being shaped by strategy, mixed motives, or the need to read the field more carefully before committing",
    ],
    "15-29": [
      "authority, resource control, or protective strength landing directly on your position, making leverage visible",
    ],
    "16-29": [
      "clearer direction starting to form around your role once the broader pattern is named honestly",
    ],
    "21-29": [
      "a blockage or obstacle sitting directly on your position, so resequencing matters more than force",
    ],
    "22-29": [
      "the wider situation changing once you make a real choice instead of circling the same fork",
    ],
    "23-29": [
      "your own position being quietly worn down by repeated strain, small leaks, or the cost of leaving too much unaddressed",
    ],
    "24-29": [
      "your position being shaped by what genuinely matters, so the emotional core of the situation cannot stay vague",
    ],
    "25-29": [
      "a binding commitment, agreement, or obligation landing on your role and making the terms visible",
    ],
    "26-29": [
      "your own role becoming tied to what is still hidden, withheld, or only partly understood",
    ],
    "27-29": [
      "your position becoming clearer through messages, documents, or practical information that brings definition",
    ],
    "28-29": [
      "your position and another person's expectations becoming linked, so alignment matters more than assumption",
    ],
    "29-31": [
      "warmth, energy, or visible success beginning to gather around your own position and clarify direction",
    ],
    "29-33": [
      "your own clarity becoming the answer point that starts unlocking the wider situation",
    ],
    "29-35": [
      "your own stance being tested by what can actually hold once the first reaction passes",
    ],
    "29-29": [
      "your own role becoming impossible to separate from the wider situation itself, so what you allow, clarify, or postpone now has direct consequence",
    ],
  },
  personal_growth: {
    "1-29": [
      "your inner life answering the first real movement, where momentum starts the moment you stop waiting for perfect readiness",
    ],
    "2-29": [
      "your own stance meeting a brief but real opening, where a small choice can change the pattern if you actually take it",
    ],
    "13-29": [
      "your own stance meeting a newer, more honest version of yourself, where first actions matter more than promises",
    ],
    "5-29": [
      "your stance being asked to root more deeply through healing, patience, and repetition that actually changes the pattern",
    ],
    "10-23": [
      "repeated inner drain meeting a clean cut, where growth depends on ending the leak instead of adapting around it",
    ],
    "14-29": [
      "your own stance being shaped by self-protective strategy, discernment, and the need to separate caution from distrust",
    ],
    "20-29": [
      "your growth becoming visible in the social field, where other people start reflecting back what you can no longer keep private",
    ],
    "21-29": [
      "the blockage landing personally, so steadiness and sequencing matter more than forcing progress",
    ],
    "22-29": [
      "your growth changing once you make a real choice about who you are willing to be",
    ],
    "29-32": [
      "your role and self-definition moving through changing emotional weather, visibility, and self-perception",
    ],
    "29-33": [
      "your own clarity becoming the answer point that unlocks the next step in growth",
    ],
    "29-35": [
      "your stance being tested for staying power, so growth depends on what can actually hold after the first surge of feeling",
    ],
  },
  travel: {
    "1-29": [
      "the next update or departure movement landing directly on your travel plans, so timing now depends on what is actually confirmed",
    ],
    "3-29": [
      "your travel picture entering movement, transfer, or route change that alters how the next stage unfolds",
    ],
    "6-29": [
      "your travel picture moving through uncertainty, shifting conditions, or information that is not yet stable",
    ],
    "9-29": [
      "a small helpful opening or smoother handling gathering around your travel plans, provided it is used concretely",
    ],
    "10-29": [
      "your travel plans hitting a sharp reroute, cut, or fast decision that has to be handled cleanly instead of emotionally",
    ],
    "17-29": [
      "your travel situation beginning to improve once change is made in the right order",
    ],
    "20-29": [
      "your travel picture becoming visible in the public field, where crowds, terminals, or outside logistics start shaping the experience",
    ],
    "21-29": [
      "the blockage landing directly on your travel plans, so resequencing matters more than force",
    ],
    "22-29": [
      "the route choice now sitting squarely with you, so the trip changes when your decision does",
    ],
    "26-29": [
      "your travel plans being shaped by details still hidden, delayed, or not fully confirmed yet",
    ],
    "27-29": [
      "tickets, confirmations, or messages bringing your route into clearer practical focus",
    ],
    "28-29": [
      "your route and another person's timing becoming too linked to read separately",
    ],
    "29-33": [
      "your own clarity becoming the confirmation point that unlocks the next travel step",
    ],
    "29-35": [
      "your plans being tested by what can still hold once delay or stress hits",
    ],
  },
  education: {
    "1-2": [
      "an early update arriving inside a narrow academic window, where timing matters because the chance is real but brief",
    ],
    "2-18": [
      "a brief opening helped by reliable support, where a small chance becomes useful because someone steady is actually backing it",
    ],
    "8-34": [
      "resource flow, fees, or workload movement entering a pause, delay, or phase that cannot keep running at the same pace",
    ],
    "5-29": [
      "your learning path being asked to grow slowly enough that the work can actually root instead of being crammed into short bursts",
    ],
    "6-29": [
      "your learning path moving through unclear requirements or mixed signals that still need clarifying before you commit harder",
    ],
    "9-29": [
      "your learning path gathering a more encouraging response, smoother handling, or opening that helps only if it is used concretely",
    ],
    "16-29": [
      "the longer-view study signal becoming clearer around your own learning path once the broader academic pattern is named plainly",
    ],
    "16-28": [
      "the evaluator's judgment becoming tied to the longer-view direction of the path, so clarity depends on what they are actually measuring",
    ],
    "13-29": [
      "your learning path still sitting in an early phase where first workable habits matter more than intention",
    ],
    "18-29": [
      "steady support helping your learning path hold long enough to become more coherent, sustainable, and easier to trust",
    ],
    "29-34": [
      "your learning path being shaped by resource flow, workload movement, or fees that need to stay manageable if progress is going to hold",
    ],
    "22-29": [
      "the study-path choice now sitting squarely with you, so progress depends on which route you truly commit to",
    ],
    "27-29": [
      "applications, notices, or written requirements bringing your learning path into clearer practical focus",
    ],
    "28-29": [
      "your learning path becoming too entangled with another person's expectations or judgment to read from your side alone",
    ],
    "29-29": [
      "your own learning position becoming impossible to separate from the path itself, so what you prepare, clarify, or postpone now has direct academic consequence",
    ],
    "29-31": [
      "your own work becoming clearer, more visible, and easier to trust once confidence and results start showing up together",
    ],
    "29-33": [
      "your own clarity about the learning path becoming the answer point that unlocks the next step",
    ],
    "29-35": [
      "your study path being tested by what can actually hold as routine, stamina, and sustained effort",
    ],
  },
  friends_social: {
    "1-5": [
      "your social world beginning to move through a slower trust pattern, where the first response matters less than whether steadiness follows",
    ],
    "25-33": [
      "the friendship terms reaching a point of clarity, where a repeating pattern or agreement now has to be named, confirmed, or consciously revised",
    ],
    "28-29": [
      "your social position being shaped through another person's stance, availability, or mixed signal, so the dynamic cannot be read from one side alone",
    ],
    "29-32": [
      "your social position moving through visibility, reputation, and the emotional weather created by being seen, discussed, or mirrored in the group",
    ],
    "29-34": [
      "your social position being shaped by the flow of contact, reciprocity, and what is or is not being exchanged cleanly between people",
    ],
  },
  creative: {
    "9-29": [
      "your creative process gathering a more encouraging response or smoother opening, but only if that opening is used concretely",
    ],
    "10-29": [
      "your creative process being shaped by a hard edit, sharper decision, or necessary correction that cannot stay deferred",
    ],
    "14-29": [
      "creative strategy and overcontrol shaping the work more than you may realize, so craft needs separating from defensiveness",
    ],
    "16-29": [
      "the larger creative signal becoming clearer around your own work once the pattern is named plainly",
    ],
    "17-29": [
      "the work beginning to improve once revision is made in the right order",
    ],
    "20-29": [
      "your creative process becoming shaped by audience, community, or the visible field around the work",
    ],
    "21-29": [
      "the block landing directly on the work, so sequencing matters more than force",
    ],
    "23-29": [
      "your creative process being worn down by repeated drain, attrition, or the little losses that keep stealing momentum",
    ],
    "24-29": [
      "the work becoming tied to what genuinely matters, so the process strengthens when it protects what is actually alive in it",
    ],
    "28-29": [
      "your creative process becoming too entangled with audience, collaborator, or outside response to read from your side alone",
    ],
    "29-30": [
      "the work asking for maturity, restraint, and a steadier hand instead of more noise or urgency",
    ],
    "29-31": [
      "your own work becoming clearer, more visible, and easier to trust once traction and result signal start returning",
    ],
    "29-32": [
      "your creative process moving through recognition cycles, visibility swings, and the emotional weather of being seen",
    ],
    "29-33": [
      "your own creative clarity becoming the answer point that unlocks the next step in the work",
    ],
    "29-35": [
      "the work being tested by what can genuinely hold as practice and sustainable output",
    ],
  },
  health: {
    "14-29": [
      "your direct experience of the body being filtered through discernment, overmanagement, and the question of whether vigilance is helping recovery or exhausting the system",
    ],
    "4-29": [
      "your wellbeing being shaped by routines, foundations, and the question of what actually helps you feel stable enough to recover",
    ],
    "5-23": [
      "healing meeting depletion, where recovery depends on ending the drain instead of only asking the system to compensate",
    ],
    "5-29": [
      "your wellbeing being asked to root more deeply through healing, patience, and repetition that actually restores",
    ],
    "8-29": [
      "your wellbeing moving through a pause, shutdown, or recovery phase that needs to be honored before more effort can help",
    ],
    "12-29": [
      "your wellbeing getting tangled in nervous activation, overprocessing, or the strain of a system that rarely settles fully",
    ],
    "17-29": [
      "your wellbeing beginning to improve once change is made in the right order and at the right pace",
    ],
    "24-29": [
      "your wellbeing becoming tied to what genuinely nourishes you, so recovery depends on protecting what is truly restorative",
    ],
    "23-29": [
      "your wellbeing being worn down by repeated drain, low-grade strain, or what keeps leaking energy without being named",
    ],
    "25-29": [
      "your wellbeing being shaped by recurring bodily patterns, habits, or agreements that now need to be revised on purpose",
    ],
    "28-29": [
      "your wellbeing getting pulled into mirror dynamics or other people's expectations, so healing depends on separating what is yours from what is not",
    ],
    "29-34": [
      "your wellbeing responding once circulation, support, or practical movement starts flowing more cleanly",
    ],
    "29-31": [
      "your wellbeing becoming clearer and more supported once energy and signal start returning",
    ],
    "29-32": [
      "your wellbeing moving through cycles, sensitivity, and the changing internal weather that needs to be tracked honestly",
    ],
    "29-33": [
      "your own clarity about what genuinely helps becoming the answer point that unlocks the next step in recovery",
    ],
    "29-35": [
      "your wellbeing being tested by what can actually hold as routine, pacing, and staying power",
    ],
    "30-34": [
      "recovery depending on practical support and steadier pacing working together, so the body trusts what is actually being sustained",
    ],
  },
  pets: {
    "29-31": [
      "your care for the animal being guided by clearer signs of comfort or improvement, so confidence follows what the animal is actually showing",
    ],
  },
  legal_admin: {
    "8-26": [
      "protected information or reviewed material reaching pause, closure, or the point where one phase has to be closed cleanly",
    ],
    "1-29": [
      "your side of the matter reaching the point where a notice, update, or first procedural movement changes what must happen next",
    ],
    "2-29": [
      "your side of the matter sitting inside a narrow but usable procedural opening, where timing matters only if the record is ready enough to support the next step",
    ],
    "8-29": [
      "your side of the matter moving through pause, closure, or the formal ending of one phase before the next can proceed cleanly",
    ],
    "11-29": [
      "your side of the matter getting trapped in a repeat-request loop, so the file only moves once the exact point of friction is fixed",
    ],
    "13-29": [
      "your side of the matter entering an early-stage step where the first filing, response, or correction matters more than later assurances",
    ],
    "24-29": [
      "your side of the matter becoming tied to what the file is actually trying to protect, establish, or make defensible",
    ],
    "3-29": [
      "your side of the matter entering a transfer, routing step, or jurisdictional movement that changes who touches the file and when",
    ],
    "4-29": [
      "your side of the matter being defined by fixed conditions, baseline obligations, or the structural footing the process rests on",
    ],
    "5-29": [
      "your side of the matter advancing only through patient follow-through and evidence that can hold over time",
    ],
    "6-29": [
      "your side of the matter being clouded by incomplete facts, pending review, or uncertainty that has to be clarified before the next response",
    ],
    "1-16": [
      "movement beginning once the direction of the matter becomes clearer and the next instruction or update can actually be trusted",
    ],
    "7-29": [
      "your side of the matter getting caught in layered process pressure, mixed motives, or a file that needs cleaner boundaries and reading",
    ],
    "13-33": [
      "a small but usable opening appearing at the approval point, where the next step matters if it is handled cleanly",
    ],
    "13-28": [
      "the other side of the matter still sitting in an early-stage step, so timing and first responses matter more than pressure",
    ],
    "14-27": [
      "paperwork or notices needing careful reading before any response is treated as final",
    ],
    "4-7": [
      "fixed conditions or structural footing getting tangled in strategy, mixed motives, or a process that has to be read more carefully than it first appears",
    ],
    "26-29": [
      "your side of the matter becoming tied to information still under review, so clarity depends on what can be documented",
    ],
    "27-29": [
      "your side of the matter becoming legible through filings, notices, or a paper trail that now has to be precise",
    ],
    "27-20": [
      "the paperwork or notice moving into a more public or reviewable field, where wording, timing, and who sees the record now matter as much as the filing itself",
    ],
    "27-33": [
      "the record reaching the clause, approval, or decision point that opens the next stage",
    ],
    "29-33": [
      "your own clarity becoming the approval point that unlocks the next stage of the matter",
    ],
    "29-34": [
      "your side of the matter moving through fees, access, or the part of the process that only clears once resources or approvals actually move",
    ],
    "29-32": [
      "your side of the matter becoming more visible, so timing, presentation, and how the file is being read all start to matter more",
    ],
    "29-35": [
      "your side of the matter being tested by deadlines, enforceability, and what can still hold procedurally",
    ],
    "29-29": [
      "your documented position becoming part of the file itself, so what you submit, clarify, or leave unanswered now has direct procedural consequence",
    ],
    "25-29": [
      "your side of the matter becoming bound to recurring terms, renewal conditions, or obligations that now define what continues",
    ],
    "17-28": [
      "the other side of the matter beginning to move, update, or change position, so timing and sequencing matter more than pressure",
    ],
    "20-7": [
      "the public-facing side of the matter getting entangled in strategy, mixed motives, or too many hands on the process, so participation has to be managed carefully",
    ],
    "15-17": [
      "authority or leverage beginning to shift, so the matter may finally move once power is used in a cleaner sequence",
    ],
    "12-24": [
      "the file's real stake getting caught in follow-up loops and procedural chatter, so the process has to stop circling before the point can land cleanly",
    ],
    "14-30": [
      "defensive strategy needing steadier handling, so scrutiny helps only if it is paired with restraint instead of suspicion",
    ],
    "30-34": [
      "resource flow being judged through steadier terms, measured pacing, and what can actually hold once the numbers are reviewed soberly",
    ],
  },
  love: {
    "6-28": [
      "the counterpart's signal arriving through uncertainty, delay, or mixed emotional weather that makes their true position harder to read cleanly",
      "the other person's side of the bond being partially veiled, so desire and doubt keep arriving in the same breath",
    ],
    "6-29": [
      "your own stance in the relationship moving through uncertainty, hesitation, or a phase where not everything can yet be trusted at face value",
      "your position in the bond passing through fog, where feeling is real but confidence in what it means keeps shifting",
    ],
    "6-24": [
      "the heart moving through uncertainty, where affection is present but mixed signals, doubt, or uneven timing keep it from feeling fully safe",
      "real feeling trying to survive a foggier emotional climate, so warmth and hesitation sit side by side",
    ],
    "6-25": [
      "commitment being tested by ambiguity, with promises present but their emotional reliability still hard to read clearly",
      "the bond wanting form and continuity while the emotional weather around it stays unsettled",
    ],
    "11-28": [
      "the counterpart's stance surfacing through friction, chemistry, or a pattern that keeps demanding a response",
      "the other person's role carrying heat, tension, or a repeated charge that will not stay neutral for long",
    ],
    "11-12": [
      "conversation growing sharper, quicker, or more reactive than the bond can comfortably hold unless both people slow the exchange down",
    ],
    "12-28": [
      "the other person's availability filtering through nervous conversation, quick messages, and fluctuating tone",
      "the counterpart becoming readable through chatter, replies, and the little tonal shifts that say more than the headline words",
    ],
    "12-29": [
      "your side of the bond being shaped by anxious conversation, fast messages, or the strain of trying to speak clearly before you feel fully steady",
      "your own part in the relationship getting carried by words, replies, and nervous interpretation before the deeper feeling has settled",
    ],
    "12-24": [
      "the heart being carried through conversation, so reassurance, tone, and timing start determining whether closeness grows or frays",
    ],
    "12-25": [
      "commitment being worked out through repeated conversations, where the bond depends on whether talk leads to steadier terms or more looping uncertainty",
    ],
    "12-27": [
      "messages becoming the main carrier of emotional tone, so what is written, delayed, or left unanswered matters as much as what is openly said",
    ],
    "17-28": [
      "the counterpart beginning to move, update, or reveal whether the bond can grow in a healthier direction",
      "the other person's side of the relationship entering a transition, where movement itself becomes part of the answer",
    ],
    "19-28": [
      "the other person's signal arriving through distance, reserve, or conditions that keep the bond more formal than it wants to be",
      "the counterpart holding a more guarded line, where privacy, distance, or self-containment shapes what can be shared",
    ],
    "19-24": [
      "the heart taking on a more guarded shape, where feeling may be sincere but is being held behind reserve, privacy, or self-protection",
    ],
    "19-29": [
      "your role in the relationship taking on a more guarded or structured tone, where self-protection and emotional discipline start shaping what can be offered",
    ],
    "23-28": [
      "the counterpart's role colored by doubt, small repeated hurts, or the slow erosion that happens when reassurance never fully lands",
    ],
    "23-29": [
      "your own stance worn down by overthinking, small hurts, or the slow strain of never feeling fully reassured",
      "your place in the bond being shaped by low-level worry, repeated disappointment, or emotional depletion that is easy to minimize until it accumulates",
    ],
    "24-25": [
      "love trying to take a stable form, where affection starts asking for continuity, reciprocity, and a bond that can hold in real life",
      "the feeling itself pressing toward commitment, making it harder to stay in the realm of hints or half-measures",
    ],
    "24-27": [
      "feeling becoming legible through words, so the emotional truth of the bond starts depending on what is actually said, written, or acknowledged",
    ],
    "24-28": [
      "the other person's role becoming more emotionally visible, where tenderness, longing, or care can no longer stay entirely implied",
    ],
    "24-29": [
      "your position becoming more emotionally visible, whether through tenderness, longing, or a clearer willingness to care openly",
      "your own heart coming further into view, making it harder to remain detached, ambiguous, or hidden behind restraint",
    ],
    "24-33": [
      "the heart arriving at an answer point, where clarity depends on whether feeling can become unmistakable rather than merely hoped for",
    ],
    "25-28": [
      "the counterpart's side of commitment becoming the place where promises either deepen into reliability or reveal their limits",
      "the other person's role becoming inseparable from the question of whether this bond can truly hold its shape over time",
    ],
    "25-29": [
      "your side of commitment becoming the place where promises have to be felt in practice, not just spoken aloud",
      "your own relationship role being measured by follow-through, steadiness, and whether closeness can be made durable rather than only intense",
    ],
    "25-27": [
      "the bond depending on clearer wording, where promises, definitions, or explicit terms begin to matter as much as emotion itself",
    ],
    "25-33": [
      "commitment reaching the answer point, so the bond asks whether it can become clear, explicit, and strong enough to name what it is",
    ],
    "25-35": [
      "the relationship leaning toward durability, where commitment matters most when it proves it can carry weight without becoming rigid",
    ],
    "27-28": [
      "the counterpart's position becoming legible through messages, explicit wording, or the conversation that finally says what has only been implied",
    ],
    "27-29": [
      "your own part in the bond becoming clearer through words, messages, or a conversation that finally names the emotional subtext directly",
    ],
    "10-25": [
      "the bond meeting a decisive edge, where commitment must be redefined, cut cleaner, or asked to stand on truer terms",
    ],
    "10-27": [
      "a message arriving with enough force to change the relationship atmosphere quickly, whether through clarity, boundary, or abrupt truth",
    ],
    "29-35": [
      "your place in the relationship being tested for steadiness, reliability, and whether your presence actually feels safe to build around",
    ],
    "29-30": [
      "your own role in the bond taking on a quieter, more mature shape, where dignity, patience, and emotional composure matter more than drama",
    ],
    "28-30": [
      "the counterpart showing a quieter, more mature style of feeling, where calm consistency may reveal more than dramatic display",
    ],
    "28-33": [
      "the other person's role becoming the answer point, where clarity arrives through what they reveal, choose, or finally make plain",
    ],
  },
  money: {
    "1-29": [
      "your money picture being pushed into motion by fresh information, quick developments, or a decision window that matters if you respond clearly",
    ],
    "2-29": [
      "your own financial position standing close to a small but real opening, provided you use it cleanly and in time",
    ],
    "24-29": [
      "money choices being shaped by what still feels genuinely worth backing, not just what looks safest on paper",
    ],
    "8-14": [
      "a financial reset being shaped by caution, defensive strategy, or the need to protect what still has value without clinging to the wrong plan",
    ],
    "6-23": [
      "financial uncertainty thickening into worry, leakage, or the fear of not yet seeing the whole picture clearly",
    ],
    "6-34": [
      "cashflow moving under fog, so income, spending, or timing feels harder to judge cleanly than the numbers alone suggest",
    ],
    "6-35": [
      "financial stability still existing beneath uncertainty, even if it is currently obscured by unclear timing, confidence, or information gaps",
    ],
    "3-18": [
      "support, trade, or a practical arrangement helping money move more reliably than it first seemed likely to",
    ],
    "4-36": [
      "fixed costs, household obligations, or baseline responsibilities putting real weight on the budget floor",
    ],
    "8-34": [
      "cashflow moving through a pause, contraction, or necessary ending before it can restart on healthier terms",
    ],
    "8-29": [
      "your role inside a financial ending, pause, or necessary reset before the next phase can genuinely begin",
    ],
    "15-29": [
      "your financial position being shaped by budget control, stronger boundaries, and the need to take firmer command of resources",
    ],
    "15-34": [
      "resources moving through control, stewardship, and the question of who actually holds the financial leverage",
    ],
    "16-29": [
      "clearer financial direction beginning to form around your own choices, so planning starts to matter more than reacting",
    ],
    "21-29": [
      "your financial stance meeting delay, blockage, or a path that has to be worked in stages rather than forced",
    ],
    "12-34": [
      "conversation, notices, or nervous attention wrapping directly around the flow of money, so signal and speculation need separating",
    ],
    "23-29": [
      "your own money picture being worn down by recurring expenses, low-grade worry, or the slow loss created by untracked leakage",
    ],
    "23-34": [
      "money flow being quietly reduced by recurring costs, small losses, or the kind of repeated drain that matters because it keeps returning",
    ],
    "25-29": [
      "your financial choices being tied to recurring obligations, payment cycles, or agreements that keep resetting the terms",
    ],
    "25-34": [
      "cash movement becoming tied to obligations, subscriptions, debt cycles, or agreements that keep claiming a portion of the flow",
    ],
    "27-29": [
      "your financial position becoming clearer through paperwork, statements, notices, or the written detail that turns vague worry into something concrete",
    ],
    "27-31": [
      "paperwork, invoices, or statements coming into clear view, making the real financial picture easier to judge",
    ],
    "27-34": [
      "money becoming legible through paperwork, invoices, statements, or messages that show where value is truly moving",
    ],
    "27-35": [
      "lasting security becoming easier to judge through paperwork, statements, or the documents that show what really holds",
    ],
    "26-29": [
      "part of your money story still sitting off the page, where records, withheld details, or what has not yet been fully tallied matter more than appearances",
    ],
    "29-34": [
      "your own financial role being defined by what is actually coming in, going out, and moving through your hands in real time",
    ],
    "29-33": [
      "your own financial position becoming the answer point, where clearer priorities begin to unlock movement",
    ],
    "29-32": [
      "your financial position moving through a cycle of visibility and fluctuation, where pattern recognition matters more than one isolated moment",
    ],
    "29-35": [
      "your own financial position being tested for staying power, consistency, and what can still hold after the first plan changes",
    ],
    "29-29": [
      "your own financial leverage becoming impossible to ignore, where your choices and your consequences are now tightly linked",
    ],
    "33-34": [
      "an answer point emerging inside cashflow itself, where a clearer movement of resources starts revealing what can be fixed or unlocked",
    ],
    "33-35": [
      "the solution beginning to take a more durable form, so what stabilizes now has a chance of lasting rather than only relieving pressure briefly",
    ],
    "34-35": [
      "cashflow trying to find the form of stability that can actually last, rather than only looking secure for a moment",
    ],
    "17-34": [
      "cashflow improving through better sequencing, smarter updates, or changes that help money move more cleanly",
    ],
    "3-24": [
      "a route or change of direction being shaped by what still feels worth backing with real resources",
    ],
  },
  work: {
    "1-29": [
      "your role receiving a fresh assignment, update, or incoming request that resets the immediate priority",
    ],
    "3-29": [
      "your professional trajectory shifting through relocation, remote arrangements, or a change of context that alters how the role feels",
    ],
    "4-29": [
      "your position being held in place by process, institutional routine, or structural commitments that limit how fast things can change",
    ],
    "7-29": [
      "your role moving through office politics, mixed motives, or a dynamic that needs cleaner boundaries and clearer reading",
    ],
    "8-11": [
      "a repeated work strain showing the old way has reached its limit, so a workflow now needs to be retired rather than patched",
    ],
    "8-29": [
      "your role entering a winding-down phase where the current project, contract, or arrangement is approaching its natural end",
    ],
    "10-29": [
      "a fast decision, restructure, or clean break landing on your position, where speed and clarity matter more than consensus",
    ],
    "11-29": [
      "ongoing friction, micromanagement, or low-grade conflict wearing at your professional position until something is renegotiated",
    ],
    "12-29": [
      "your role being shaped by meetings, status chatter, and too many short-cycle decisions for clean judgment",
    ],
    "14-29": [
      "your role requiring sharper political reading, because strategy, self-interest, and mixed motives are shaping the landscape around you",
    ],
    "15-29": [
      "your position being defined by authority, resource control, and who actually has leverage over the next move",
    ],
    "16-29": [
      "clearer direction beginning to form around your role once the broader work pattern is named plainly",
    ],
    "19-29": [
      "your role being tested by institutional process, formal structure, or bureaucratic steps that cannot be skipped",
    ],
    "21-29": [
      "a blockage, delay, or stalled approval sitting on your position, where resequencing matters more than pushing harder",
    ],
    "22-29": [
      "a career fork or role decision landing on your position, so progress depends on choosing rather than hovering between options",
    ],
    "25-29": [
      "a contract, formal agreement, or binding commitment landing on your role and making obligations visible",
    ],
    "27-29": [
      "your position becoming clearer through emails, briefs, documentation, or practical information that brings the next step into focus",
    ],
    "28-29": [
      "your position and the other side's expectations becoming impossible to separate cleanly, so alignment matters more than assumption",
    ],
    "29-31": [
      "recognition, visibility, or a positive outcome starting to gather around your professional position",
    ],
    "29-34": [
      "your role connecting to revenue, client flow, or resource movement that makes the practical value of your work visible",
    ],
    "29-36": [
      "your professional position carrying a heavier obligation, ethical weight, or responsibility that cannot stay optional",
    ],
  },
  purpose_calling: {
    "7-29": [
      "your path moving through mixed motives or inner conflict, so cleaner boundaries matter more than more analysis",
    ],
    "10-29": [
      "a necessary cut or refusal landing directly on your path, so vocation can be separated from habit or inherited pressure",
    ],
    "16-29": [
      "clearer direction beginning to form around your path once the larger pattern is named plainly",
    ],
    "16-18": [
      "steady support helping the path clarify, but only if guidance is turned into something you can actually practice",
    ],
    "24-28": [
      "another person's pull or expectations resonating with what feels meaningful, so you need to separate genuine calling from relational gravity",
    ],
    "22-29": [
      "the path changing once you make a real choice instead of circling the same uncertainty",
    ],
    "28-29": [
      "your path and another person's expectations becoming too entangled to read cleanly, so clearer boundaries matter more than pleasing both sides",
    ],
    "24-29": [
      "what still feels deeply true becoming the clearest guide to the path in front of you",
    ],
    "29-35": [
      "your stance toward the path being tested by what you can actually sustain, not just admire from a distance",
    ],
  },
  home_family: {
    "2-30": [
      "a small but real opening toward calmer, steadier boundaries at home",
    ],
    "7-29": [
      "your role at home moving through a complicated dynamic that needs clearer boundaries and less guessing",
    ],
    "4-29": [
      "your own position becoming inseparable from questions of safety, home base, and what the household can really hold",
    ],
    "4-17": [
      "the household itself entering a period of practical change, move, or improvement that needs the right order to hold",
    ],
    "6-28": [
      "the other person's place in the household being obscured by uncertainty, mixed signals, or circumstances that make their true availability hard to read",
    ],
    "6-29": [
      "your domestic role moving through uncertainty, unsettled conditions, or a stage where the household picture is still partly obscured",
    ],
    "7-7": [
      "household complexity becoming impossible to ignore, where motives, tension, and unspoken strategy are now part of the main story",
    ],
    "8-29": [
      "your role at home sitting inside an ending, pause, or necessary rest period before healthier movement can begin",
    ],
    "9-13": [
      "a gentler new beginning becoming possible at home through warmth, kindness, or a more welcoming tone",
    ],
    "11-29": [
      "your role in the household being caught in repetition or friction, where the same strain keeps replaying until the pattern changes",
    ],
    "12-29": [
      "your role at home being shaped by anxious conversation, repeated check-ins, or the practical strain of too many unsettled discussions",
    ],
    "13-29": [
      "your domestic role meeting something young, new, or still fragile enough to be shaped carefully",
    ],
    "18-29": [
      "your role in the household being defined through loyalty, reliability, and the quiet labor of showing up consistently for others",
    ],
    "20-21": [
      "household life slowed by visitors, relatives, neighbours, or the wider social field around the family system",
    ],
    "20-29": [
      "your role inside the household being shaped by the wider social field, including relatives, visitors, and what the family must manage in public",
    ],
    "16-21": [
      "household progress slowed by delay or distance, even though the longer-range path still exists if it is worked patiently",
    ],
    "23-29": [
      "your place in the household worn down by repeated strain, small messes, or the kind of domestic erosion that builds because no one fully deals with it",
    ],
    "25-29": [
      "your role at home being defined by commitments, routines, and the agreements that keep family life either stable or quietly overburdened",
    ],
    "27-29": [
      "your part in the home story becoming clearer through messages, schedules, paperwork, or practical information that cannot be ignored",
    ],
    "27-28": [
      "the other person's place in the household becoming clearer through messages, plans, or practical details that make their position easier to understand",
    ],
    "28-29": [
      "your place in the household being defined in relation to someone else's needs, influence, or absence",
    ],
    "29-29": [
      "your own role in the family field becoming unmistakable, for better or worse, so boundaries and responsibility can no longer stay vague",
    ],
    "29-35": [
      "your role in the household being measured by steadiness, staying power, and whether the family can actually lean on what you are holding",
    ],
    "29-33": [
      "your place in the household becoming the answer point, where clearer boundaries or decisions begin to unlock movement for everyone else too",
    ],
  },
  spiritual: {
    "1-29": [
      "your inner position receiving a sign, synchronicity, or early signal that suggests movement is beginning whether you feel ready or not",
    ],
    "2-29": [
      "a small sacred opening forming around your path, where a quiet act of faith can shift the pattern if taken without overthinking",
    ],
    "5-29": [
      "your spiritual path being asked to grow slowly through patience, devotion, and repetition that actually deepens rather than performs",
    ],
    "6-29": [
      "your inner life moving through fog, doubt, or spiritual ambiguity that cannot be resolved by thinking harder",
    ],
    "8-29": [
      "your path passing through a necessary ending, release, or surrender that clears space for what comes next",
    ],
    "9-29": [
      "grace, generosity, or unexpected kindness gathering around your inner position and softening the way forward",
    ],
    "10-29": [
      "a sharp spiritual cut or moment of clarity landing on your path, severing something that was holding the old pattern in place",
    ],
    "13-29": [
      "your spiritual position encountering a fresh beginning, rebirth, or initiation that asks you to start again with less certainty and more presence",
    ],
    "16-29": [
      "a moment of alignment, guidance, or spiritual clarity starting to gather around your path and light the next step",
    ],
    "21-29": [
      "a blockage on your path that is not punishment but invitation — the obstacle itself is teaching something that cannot be bypassed",
    ],
    "22-29": [
      "your inner journey arriving at a genuine fork, where the path changes once a real choice is made rather than endlessly weighed",
    ],
    "24-29": [
      "what you love and what you practise becoming inseparable, so the heart of the matter cannot be intellectualised away from the path",
    ],
    "26-29": [
      "your path being shaped by mystery, secrecy, or something still hidden that is not yet ready to be understood",
    ],
    "29-31": [
      "warmth, illumination, or spiritual vitality gathering around your position and bringing what was practised in the dark into the light",
    ],
    "29-33": [
      "your own clarity becoming the key that unlocks the next phase of practice, where understanding arrives through lived experience rather than study alone",
    ],
    "29-35": [
      "your path being tested by endurance, faith, and whether the practice can hold when comfort and momentum withdraw",
    ],
    "29-36": [
      "your spiritual position carrying a heavier weight, calling, or sacred responsibility that cannot stay optional or casual",
    ],
    "32-29": [
      "your path being shaped by emotional honesty, shifting moods, and the need to sit with the full range of inner weather",
    ],
    "36-29": [
      "a deep obligation, karmic weight, or non-negotiable calling landing on your path and asking for acceptance rather than resistance",
    ],
  },
};

function choose<T>(values: T[], random: () => number): T {
  if (!values.length) {
    throw new Error("Cannot choose from an empty array");
  }
  return values[Math.floor(random() * values.length)];
}

function clause(input: string): string {
  return input.trim().replace(/[.!?]+$/g, "");
}

function sentence(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const capitalized = `${trimmed[0].toUpperCase()}${trimmed.slice(1)}`;
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

function lowerFirst(input: string): string {
  if (!input) return input;
  return input[0].toLowerCase() + input.slice(1);
}

function sortedPairKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

const SUBJECT_PAIR_ASSOCIATION_OVERRIDES: Partial<Record<SubjectId, Record<string, string[]>>> = {
  general_reading: {
    "1-6": [
      "This pairing says news is arriving inside uncertainty, so the signal matters but the full picture is not yet readable",
    ],
    "2-34": [
      "This pairing says a small opening is forming around flow, support, or whatever needs to start moving again",
    ],
    "4-36": [
      "This pairing says a basic obligation, structural burden, or responsibility can no longer stay in the background",
    ],
    "8-13": [
      "This pairing says an ending is clearing space for a fresh start, so what closes now makes room for what comes next",
    ],
    "9-29": [
      "This pairing says a more helpful tone or visible encouragement is gathering around your own position, even if it does not resolve the wider situation by itself",
    ],
    "10-21": [
      "This pairing says a sharp decision meets a firm obstacle, so the cut has to be placed precisely or it will bounce off the blockage",
    ],
    "11-23": [
      "This pairing says repeated friction is compounding with ongoing drain, so the pattern needs interrupting before the cost outweighs the effort",
    ],
    "14-15": [
      "This pairing says strategy and authority are in the same frame, so the question is whether caution serves protection or just delays the reckoning",
    ],
    "16-31": [
      "This pairing says guidance and warmth are reinforcing each other, so the clearest path is also the most energising one",
    ],
    "22-26": [
      "This pairing says the choice depends on information that is still hidden, so the fork cannot be resolved until more is revealed",
    ],
    "24-33": [
      "This pairing says what genuinely matters is reaching an answer point, so clarity depends on whether the situation can be named honestly",
    ],
    "25-36": [
      "This pairing says a binding commitment is meeting a heavier obligation, so the weight of what has been agreed is becoming impossible to set aside",
    ],
    "27-28": [
      "This pairing says the other side of the situation becomes clearer through messages, wording, or details that can no longer stay implied",
    ],
    "29-33": [
      "This pairing says your own clarity is becoming the hinge that can unlock the wider situation",
    ],
    "31-33": [
      "This pairing says success and clarity are converging, so the answer becomes visible when progress is named honestly",
    ],
    "34-36": [
      "This pairing says practical flow, support, or resources are getting tied to a heavier responsibility that cannot stay vague",
    ],
  },
  pets: {
    "8-9": [
      "This pairing says the animal is more likely to settle when rest and reassurance work together, not when encouragement turns into pressure",
      "This pairing says comfort only helps if it protects the quiet phase the animal is already moving through",
    ],
  },
  community: {
    "23-29": [
      "This pairing says your place in the wider field is being worn down by repeated low-grade stress or erosion, so simplification matters more than reacting to every signal",
    ],
    "27-29": [
      "This pairing says the wider field becomes easier to read once your position, terms, or expectations are stated plainly",
    ],
  },
  friends_social: {
    "23-29": [
      "This pairing says your own social position is being worn down by repeated strain, so small drains in trust and tone need addressing before they define the whole dynamic",
    ],
    "27-29": [
      "This pairing says your own position becomes clearer once the message, terms, or expectations are stated plainly",
    ],
    "33-34": [
      "This pairing says clarity comes through what is actually being exchanged between people, not through guessing about intention",
    ],
    "29-35": [
      "This pairing says your own position is being tested by what can actually hold socially, so consistency matters more than promises or first reactions",
    ],
    "24-29": [
      "This pairing says the social dynamic becomes clearer when you protect what genuinely matters instead of reacting to every signal around it",
    ],
    "16-29": [
      "This pairing says the longer-view social signal is clarifying around your own position, but it only helps if vision turns into clearer social steps",
    ],
    "11-34": [
      "This pairing says friction is getting tied to reciprocity, response flow, or uneven give-and-take, so the social exchange itself needs a cleaner pattern",
    ],
    "25-29": [
      "This pairing says your own boundaries are shaping what keeps repeating socially, so the next version of the connection depends on the terms you keep accepting",
    ],
    "28-29": [
      "This pairing says self and other now have to be read together, because the friendship dynamic lives in the space between both positions",
    ],
    "29-34": [
      "This pairing says reciprocity, contact flow, and practical give-and-take are shaping the friendship more than either side may be naming outright",
    ],
    "29-33": [
      "This pairing says your own clarity is becoming the hinge that helps the social dynamic stop guessing and start responding",
    ],
    "30-32": [
      "This pairing says maturity steadies the emotional weather, so visibility and mood stop dictating the whole social tone",
    ],
    "35-36": [
      "This pairing says steadiness matters, but social duty still needs limits so support does not harden into burden",
    ],
  },
  personal_growth: {
    "1-29": [
      "This pairing says movement begins once your own stance is clear enough to act on instead of only reflecting",
    ],
    "4-20": [
      "This pairing says the public self and private foundations now need cleaner alignment, so growth depends on living what you say you value",
    ],
    "12-17": [
      "This pairing says change needs quieter, clearer dialogue, so growth is guided by sequence rather than anxious spin",
    ],
    "12-30": [
      "This pairing says inner dialogue needs calmer pacing and more mature handling, so growth is not driven by anxiety alone",
    ],
    "14-29": [
      "This pairing says self-protective strategy is shaping your stance more than you may realize, so discernment matters more than suspicion",
    ],
    "21-29": [
      "This pairing says the blockage is landing personally, so steadiness and cleaner boundaries matter more than forcing progress",
    ],
    "22-29": [
      "This pairing says the road changes once you make a real choice about who you are willing to be",
    ],
    "26-33": [
      "This pairing says what was hidden is turning into usable clarity, so the next step depends on what you are now ready to name plainly",
    ],
    "29-32": [
      "This pairing says your inner life is moving through emotional cycles, self-image, and the changing visibility of growth",
    ],
    "29-33": [
      "This pairing says your own clarity is becoming the answer point that unlocks the next step in growth",
    ],
    "29-35": [
      "This pairing says growth is now being tested by what can actually hold after the first emotional wave passes",
    ],
  },
  travel: {
    "1-9": [
      "This pairing says a helpful update, invitation, or smoother handling is arriving right where the trip needs a practical opening",
    ],
    "1-29": [
      "This pairing says the next update or departure movement is landing directly on your travel plans, so timing now depends on what is actually confirmed",
    ],
    "2-13": [
      "This pairing says a small opening or early-stage plan can help, but only if it is used promptly and kept realistic",
    ],
    "3-29": [
      "This pairing says your travel picture is entering movement, routing, or transit, so the next stage depends on how cleanly that shift is handled",
    ],
    "6-29": [
      "This pairing says uncertainty is still sitting directly on your travel plans, so the route depends on what can be clarified before you commit harder",
    ],
    "16-29": [
      "This pairing says the route becomes clearer once the longer-view timing pattern starts making practical sense",
    ],
    "9-29": [
      "This pairing says a smoother opening or more helpful handling is gathering around the trip, but only if it is used concretely",
    ],
    "10-29": [
      "This pairing says a sharp reroute or necessary cut is landing directly on your plans, so the trip improves only if the decision is made cleanly",
    ],
    "17-29": [
      "This pairing says the journey can improve, but only if change is made in the right order instead of all at once",
    ],
    "21-29": [
      "This pairing says the blockage is landing directly on your route, so pacing and resequencing matter more than force",
    ],
    "22-29": [
      "This pairing says the route choice now sits squarely with you, so the trip changes when your decision does",
    ],
    "26-33": [
      "This pairing says hidden details are turning into usable travel clarity, so the next step depends on what is finally confirmed",
    ],
    "28-29": [
      "This pairing says your route and another person's timing are too linked to read separately, so planning depends on both sides",
    ],
    "29-33": [
      "This pairing says your own clarity is becoming the answer point that unlocks the next travel step",
    ],
    "29-35": [
      "This pairing says the trip is being tested by what can still hold once delay or stress actually lands",
    ],
  },
  education: {
    "1-2": [
      "This pairing says an early update or notice matters because it lands inside a narrow window that will not stay open forever",
    ],
    "2-18": [
      "This pairing says a small academic opening becomes usable because dependable help is actually there to support it",
    ],
    "8-34": [
      "This pairing says fees, materials, or workload flow are being forced into a pause, so the academic path cannot keep moving at the same rate without adjustment",
    ],
    "5-29": [
      "This pairing says your learning path needs steadier practice and pacing, because the work only compounds when it is given time to root",
    ],
    "6-29": [
      "This pairing says unclear requirements or mixed signals are still sitting directly on the learning path, so clarity matters before harder commitment",
    ],
    "9-29": [
      "This pairing says the learning path is gathering a more encouraging response or smoother opening, but only if that opening is used concretely",
    ],
    "16-29": [
      "This pairing says the longer-view study signal is becoming clearer around your own learning path once the broader pattern is named plainly",
    ],
    "16-28": [
      "This pairing says another person's judgment is becoming tied to the longer-view direction of the path, so clarity depends on what they are really measuring",
    ],
    "13-29": [
      "This pairing says the learning path is still in an early phase, so first habits matter more than promising yourself a bigger future version of the work",
    ],
    "18-29": [
      "This pairing says steady support or reliable feedback is helping the learning path hold long enough to become more workable",
    ],
    "29-34": [
      "This pairing says fees, materials, or workload flow are shaping the learning path more than they may first appear, so practical management matters",
    ],
    "22-29": [
      "This pairing says the study-path choice now sits squarely with you, so progress changes when your decision does",
    ],
    "27-29": [
      "This pairing says applications, notices, or written requirements are bringing the learning path into clearer practical focus",
    ],
    "28-29": [
      "This pairing says your progress and another person's judgment are too linked to read separately, so planning depends on both sides",
    ],
    "29-31": [
      "This pairing says your own work is becoming easier to trust because confidence and clearer results are starting to show up together",
    ],
    "29-33": [
      "This pairing says your own clarity is becoming the answer point that unlocks the next academic step",
    ],
    "29-35": [
      "This pairing says the learning path is being tested by what can actually hold as routine, stamina, and sustainable effort",
    ],
  },
  creative: {
    "9-29": [
      "This pairing says the work is gathering a more encouraging response or smoother opening, but only if that opening is used concretely",
    ],
    "10-29": [
      "This pairing says a hard edit, sharper decision, or necessary correction is landing directly on the creative process",
    ],
    "14-29": [
      "This pairing says creative strategy or overcontrol is shaping the work more than you may realize, so craft needs separating from defensiveness",
    ],
    "16-29": [
      "This pairing says the larger creative signal is becoming clearer around your own work once the pattern is named plainly",
    ],
    "17-29": [
      "This pairing says the work can improve, but only if change is made in the right order instead of all at once",
    ],
    "20-29": [
      "This pairing says the work is becoming shaped by audience, community, or the visible field around it",
    ],
    "21-29": [
      "This pairing says the block is landing directly on the work, so sequencing and steadier craft matter more than forcing output",
    ],
    "23-29": [
      "This pairing says repeated drain or attrition is wearing down the creative process, so the leak has to be named instead of normalized",
    ],
    "24-29": [
      "This pairing says the work becomes stronger once it protects what genuinely matters instead of only what looks impressive",
    ],
    "28-29": [
      "This pairing says the work and outside response are too entangled to read from one side alone, so boundaries matter more than guesswork",
    ],
    "29-30": [
      "This pairing says the work is asking for maturity, restraint, and a steadier hand instead of more noise or urgency",
    ],
    "29-31": [
      "This pairing says the work is becoming clearer, more visible, and easier to trust once traction and result signal start returning",
    ],
    "29-32": [
      "This pairing says the creative process is moving through visibility cycles and the emotional weather of being seen",
    ],
    "29-33": [
      "This pairing says your own creative clarity is becoming the answer point that unlocks the next step",
    ],
    "29-35": [
      "This pairing says the work is being tested by what can genuinely hold as practice and sustainable output",
    ],
  },
  health: {
    "16-29": [
      "This pairing says the bigger recovery pattern is becoming clearer, so the next helpful step depends on what you now know enough to trust",
    ],
    "18-29": [
      "This pairing says steady support is helping your wellbeing hold long enough to see what is genuinely sustainable",
    ],
    "5-23": [
      "This pairing says recovery depends on stopping the drain as much as adding support, because healing cannot keep competing with the same leak forever",
    ],
    "5-29": [
      "This pairing says your wellbeing needs patient recovery, better pacing, and fewer demands on a system that is already asking to heal",
    ],
    "8-29": [
      "This pairing says your wellbeing is moving through a rest or recovery phase, so the next improvement depends on whether that pause is actually honored",
    ],
    "12-29": [
      "This pairing says nervous activation is shaping your wellbeing more than you may realize, so settling the system matters as much as interpreting it",
    ],
    "17-29": [
      "This pairing says improvement is beginning, but only if the change is made in the right order and at the right pace",
    ],
    "24-29": [
      "This pairing says recovery depends on protecting what genuinely nourishes you instead of treating care like something you earn after depletion",
    ],
    "23-29": [
      "This pairing says repeated drain is landing directly on your wellbeing, so recovery depends on naming the leak instead of normalizing it",
    ],
    "25-29": [
      "This pairing says recovery is being shaped by recurring habits or bodily agreements, so healing depends on revising what the system keeps promising to endure",
    ],
    "28-29": [
      "This pairing says your wellbeing is too entangled with someone else's expectations or mirror dynamics, so recovery depends on separating what is yours from what you keep carrying for others",
    ],
    "29-31": [
      "This pairing says your wellbeing becomes easier to support once energy and signal start returning clearly",
    ],
    "29-32": [
      "This pairing says your wellbeing moves in cycles, so honesty about timing and sensitivity matters more than one fixed explanation",
    ],
    "29-33": [
      "This pairing says clarity about what genuinely helps is becoming the answer point that unlocks the next step",
    ],
    "29-34": [
      "This pairing says wellbeing starts responding once support, circulation, or practical movement begins flowing more cleanly",
    ],
    "29-35": [
      "This pairing says recovery is being tested by what can actually hold as routine, pacing, and staying power",
    ],
  },
  legal_admin: {
    "1-4": [
      "This pairing says a notice or procedural movement is landing directly on the matter's fixed terms or file structure, so the next step depends on tightening the base conditions rather than improvising around them",
    ],
    "1-10": [
      "This pairing says a fast-moving notice or update is colliding with a hard cut or deadline, so the next step has to be handled promptly and without vague wording",
    ],
    "1-35": [
      "This pairing says the next notice or update matters only if it is anchored in what can actually hold procedurally, not just in motion for its own sake",
    ],
    "1-20": [
      "This pairing says a public-facing update or procedural notice is changing who sees the matter and how quickly the next step can move",
    ],
    "1-15": [
      "This pairing says a notice or movement is meeting real authority, so the next step depends on who can actually move the process and how cleanly they do it",
    ],
    "2-13": [
      "This pairing says a small early-stage opening matters only if the filing, response, or correction is tightened before the matter hardens",
    ],
    "2-28": [
      "This pairing says the opening only matters if the other side uses it cleanly enough to make timing and leverage count for something real",
    ],
    "2-7": [
      "This pairing says the opening is real, but it is already being shaped by tactics or mixed motives, so timing helps only if the process is read carefully first",
    ],
    "3-22": [
      "This pairing says routing, transfer, or jurisdiction now depends on making one procedural choice cleanly instead of keeping multiple paths half-open",
    ],
    "3-26": [
      "This pairing says information under review is moving into routing, transfer, or jurisdictional handling, so the process depends on where the record is being sent and how clearly it travels",
    ],
    "3-27": [
      "This pairing says a filing or written notice is now moving through routing, transfer, or jurisdictional handling, so clarity depends on where the record is actually going and how cleanly it travels",
    ],
    "4-35": [
      "This pairing says the matter now depends on whether the structural footing and the enforceable commitments can actually hold together",
    ],
    "5-8": [
      "This pairing says the matter is moving through pause, closure, or procedural recovery, but it still needs patient follow-through and documentation strong enough to hold",
    ],
    "6-7": [
      "This pairing says the uncertainty is no longer neutral; it is being shaped by tactics or mixed motives, so clarification has to come before any committed response",
    ],
    "6-14": [
      "This pairing says uncertain facts are meeting defensive strategy, so the next move depends on clarifying the record before caution hardens into avoidance",
    ],
    "6-30": [
      "This pairing says uncertain facts need measured handling, so calm review matters more than premature certainty",
    ],
    "6-33": [
      "This pairing says the answer point is real, but it only becomes usable once the uncertain parts of the file are named plainly and worked cleanly instead of guessed at",
    ],
    "7-20": [
      "This pairing says the matter is getting pulled toward optics, visibility, or too many outside hands, so strategy only helps if the process stays grounded in substance",
    ],
    "7-11": [
      "This pairing says strategic handling and repeat-request pressure are feeding each other, so the loop has to be broken instead of managed more artfully",
    ],
    "8-18": [
      "This pairing says a pause, ending, or exhausted phase now depends on dependable support and what still proves itself through consistent follow-through",
    ],
    "10-13": [
      "This pairing says a hard procedural cut or forced decision has created an early-stage step where the next correction, filing, or response now matters more than delay",
    ],
    "11-31": [
      "This pairing says the file is finally visible enough for repeated back-and-forth to become one concrete next move, but only if the loop is tightened instead of fed",
    ],
    "8-26": [
      "This pairing says protected information or reviewed material may be reaching pause, closure, or the end of one cleanly handled phase",
    ],
    "5-11": [
      "This pairing says repeat-request pressure is settling into a longer process pattern, so the only durable way through is steadier pacing and documentation strong enough to hold over time",
    ],
    "12-26": [
      "This pairing says communication is circling around information still under review, so the next useful move is to clarify what is documented rather than add more noise",
    ],
    "14-15": [
      "This pairing says defensive strategy is sitting directly on authority or leverage, so the next move depends on reading power clearly rather than reacting to it",
    ],
    "14-19": [
      "This pairing says institutional pressure is being filtered through tactical reading, so the next move depends on reading the structure clearly instead of reacting to it",
    ],
    "14-25": [
      "This pairing says binding terms are being filtered through caution, close reading, or defensive handling, so the next commitment has to be judged more carefully than it first appears",
    ],
    "16-17": [
      "This pairing says clear direction and procedural change are finally lining up, so the matter improves only if the next steps are sequenced and actually carried through",
    ],
    "20-30": [
      "This pairing says measured public handling or calmer presentation is helping the matter look more credible in the open",
    ],
    "20-27": [
      "This pairing says the paperwork is moving into a more public or reviewable field, so wording, timing, and who sees the record now matter as much as the filing itself",
    ],
    "22-30": [
      "This pairing says the next decision has to be made with steadier judgment and cleaner sequencing, not with reactive pressure",
    ],
    "21-33": [
      "This pairing says the answer exists, but backlog or formal blockage means it only becomes usable through methodical sequencing rather than pressure",
    ],
    "24-28": [
      "This pairing says the other side has become central to what the file is actually trying to protect, establish, or make defensible",
    ],
    "24-33": [
      "This pairing says the approval point becomes clearer once the file's real stake is named plainly instead of being buried in procedure",
    ],
    "25-33": [
      "This pairing says a binding term is reaching the approval point, so the next move depends on what can actually be confirmed, revised, or formally brought into force",
    ],
    "25-32": [
      "This pairing says binding terms are moving through review cycles or changing visibility, so what continues now depends on how the matter is being read and reassessed",
    ],
    "26-28": [
      "This pairing says the other side is now tied to information still under review, so the process depends on what they actually disclose, withhold, or clarify",
    ],
    "25-28": [
      "This pairing says the other side is now tied to binding terms or formal obligations, so timing and leverage depend on what is actually in force",
    ],
    "28-33": [
      "This pairing says the other side has become central to the approval point, so the file moves when their response is explicit enough to count",
    ],
    "13-28": [
      "This pairing says the other side is still in an early-stage step, so first responses and timing matter more than pressure",
    ],
    "17-28": [
      "This pairing says the other side is no longer static, so the file now depends on reading their shift early enough to sequence the next step cleanly",
    ],
    "18-19": [
      "This pairing says dependable support only matters if it can actually work with the institution, policy, or formal structure that controls the next step",
    ],
    "18-22": [
      "This pairing says support is present, but the matter still needs a clear decision about which procedural path actually reduces uncertainty",
    ],
    "18-28": [
      "This pairing says the other side and dependable support now have to be read together, so the next step depends on who is actually reliable enough to back it cleanly",
    ],
    "9-11": [
      "This pairing says a better tone only helps if it actually changes the repeat-request loop instead of softening language around the same problem",
    ],
    "30-34": [
      "This pairing says the flow of fees, access, or practical resources now depends on steadier terms and measured handling rather than speed",
    ],
    "2-3": [
      "This pairing says the opening only matters if the next routing or transfer step is handled immediately and documented cleanly",
    ],
    "3-19": [
      "This pairing says routing or jurisdiction is now meeting institutional control, so progress depends on where the file sits and who actually has authority to move it",
    ],
    "3-28": [
      "This pairing says the other side is now caught in routing, transfer, or jurisdictional movement, so the file depends on where their response actually lands and who now has to answer it",
    ],
    "3-31": [
      "This pairing says the route through the process is finally becoming clear enough that the next step can be taken with confidence instead of guesswork",
    ],
    "5-28": [
      "This pairing says the other side is now tied to a slower or longer review process, so the file depends on what they can actually sustain, document, or confirm over time",
    ],
    "6-28": [
      "This pairing says the other side is still moving through uncertainty or incomplete review, so the process depends on what they actually clarify, confirm, or keep delaying",
    ],
    "25-29": [
      "This pairing says your side of the matter is tied to binding terms or renewal conditions, so what continues now depends on the actual obligations, not informal expectation",
    ],
    "28-29": [
      "This pairing says your side of the matter and the other side's position now have to be read together, because leverage and timing sit across both",
    ],
    "29-31": [
      "This pairing says your side of the matter becomes clearer and easier to work with once the process is visible enough to act on cleanly",
    ],
    "34-36": [
      "This pairing says the flow of fees, access, or practical movement now has to answer to an obligation that can no longer stay vague or informal",
    ],
    "34-35": [
      "This pairing says fees, access, or process movement only become useful once they settle into something that can actually hold procedurally",
    ],
    "14-27": [
      "This pairing says the paperwork needs careful reading before any response is treated as final",
    ],
    "7-27": [
      "This pairing says the paperwork or notice is getting entangled in strategy or mixed motives, so clarity depends on what is stated plainly, withheld, or framed too carefully",
    ],
    "8-27": [
      "This pairing says a filing or written notice is reaching pause, closure, or the end of one phase, so the next move depends on what is actually complete and what still needs formal closure",
    ],
    "21-27": [
      "This pairing says persistence, orderly follow-up, and patient sequencing matter more than trying to force a faster answer",
    ],
    "21-26": [
      "This pairing says the needed information exists, but access is slowed by process, hierarchy, or what is still restricted, so patient sequencing matters more than pushing harder",
    ],
    "26-29": [
      "This pairing says your side of the matter is tied to information still under review, so clarity depends on what can be documented",
    ],
    "27-33": [
      "This pairing says the record is reaching the clause, approval, or decision point that opens the next stage",
    ],
    "29-33": [
      "This pairing says your own clarity is becoming the approval point that unlocks the next stage of the matter",
    ],
    "29-35": [
      "This pairing says your side of the matter is being tested by deadlines, enforceability, and what can still hold procedurally",
    ],
  },
  home_family: {
    "2-34": [
      "This pairing says a brief opening around practical support or resources could ease home life if it is used promptly and cleanly",
    ],
    "4-36": [
      "This pairing says the household is carrying fixed responsibilities, home-base costs, or family obligations that cannot simply be ignored",
    ],
    "4-17": [
      "This pairing shows the household entering a period of change, move, or practical improvement that has to be paced carefully if it is going to hold",
    ],
    "7-29": [
      "This pairing says your role at home is caught in a complicated dynamic, so clearer boundaries matter more than trying to decode every motive",
    ],
    "8-29": [
      "This pairing says your place in the household is sitting inside a needed pause or ending, so rest may be part of the repair",
    ],
    "8-25": [
      "This pairing says a household commitment, routine, or obligation may have reached its limit and needs honest reworking",
    ],
    "10-11": [
      "This pairing says a hard boundary or decisive interruption is needed to stop the same household strain from replaying",
    ],
    "10-29": [
      "This pairing says a hard boundary or necessary cut is landing directly on your role in the household",
    ],
    "11-28": [
      "This pairing says the other person's role in the household is getting caught in conflict, pressure, or a pattern that keeps reigniting the same strain",
    ],
    "11-29": [
      "This pairing shows your role at home getting pulled into repetition or friction, where the same strain keeps replaying until the pattern changes",
    ],
    "14-29": [
      "This pairing says your role at home is becoming guarded or over-shaped by protective strategy, so discernment matters more than suspicion",
    ],
    "15-23": [
      "This pairing says money, caregiving, or practical pressure is being carried in a way that slowly wears the household down",
    ],
    "16-29": [
      "This pairing says your role at home becomes clearer once the bigger family direction is named plainly",
    ],
    "15-29": [
      "This pairing says your role at home is tied to protection, authority, or carrying more of the practical burden than is sustainable",
    ],
    "18-22": [
      "This pairing says support is present, but the household still needs a clear decision about direction",
    ],
    "24-33": [
      "This pairing says the household becomes clearer once care, priorities, and emotional truth are named plainly",
    ],
    "21-27": [
      "This pairing shows plans, messages, or paperwork running into delay, so the domestic answer comes through patience rather than speed",
    ],
    "28-29": [
      "This pairing says your own position and another person's role in the household now have to be read together, not separately",
    ],
    "34-36": [
      "This pairing says resources, costs, or practical support are carrying more family weight than can be ignored",
    ],
  },
  money: {
    "1-34": [
      "This pairing puts fresh information directly onto the flow, so the next update matters because it changes the numbers, not just the mood",
    ],
    "2-29": [
      "This pairing says a small opening is already close to your own choices, so even modest relief matters if you use it well",
    ],
    "3-24": [
      "This pairing suggests a move, transfer, or change of direction shaped by what still feels worth backing with real resources",
    ],
    "14-35": [
      "This pairing favors protecting what already holds, so caution serves stability instead of freezing the budget in place",
    ],
    "10-29": [
      "This pairing makes a necessary cut or reset personal, so the decision has to be made clearly rather than deferred into more strain",
    ],
    "12-34": [
      "This pairing puts attention, reporting, and nervous interpretation directly onto the flow of money",
    ],
    "26-29": [
      "This pairing says part of the money picture is still off the page, so records and withheld details matter more than assumptions",
    ],
    "26-28": [
      "This pairing says someone else's position or missing information is shaping the numbers more than appearances suggest",
    ],
    "3-18": [
      "This pairing suggests a practical arrangement, ally, or support line that can help money move more reliably",
    ],
    "4-36": [
      "This pairing ties the budget to fixed obligations, baseline costs, or responsibilities that cannot be ignored",
    ],
    "17-34": [
      "This pairing shows the flow improving when changes are made in the right order",
    ],
    "24-33": [
      "This pairing says clarity is arriving around what is still worth backing, so the next move has to satisfy both the numbers and your priorities",
    ],
    "23-34": [
      "This pairing shows the drain inside the flow, where small repeated losses matter because they keep recurring",
    ],
    "25-34": [
      "This pairing shows how the flow is being claimed by recurring terms, obligations, or debt cycles",
    ],
    "28-29": [
      "This pairing says your own choices and another party's position are now tightly linked, so the numbers have to be read from both sides",
    ],
    "27-34": [
      "This pairing makes the resource picture readable through paperwork, statements, or messages that finally show where the money is going",
    ],
    "29-34": [
      "This pairing ties your own choices directly to the movement of money, so control comes from following the real flow rather than the imagined one",
    ],
    "29-31": [
      "This pairing shows your financial role coming into clearer view, so confidence grows when the facts are faced directly",
    ],
    "29-33": [
      "This pairing says the answer is not elsewhere: clearer priorities and firmer decisions on your side are what unlock the next phase",
    ],
    "33-34": [
      "This pairing says the answer is already hiding in the numbers if you follow the flow closely enough",
    ],
  },
  purpose_calling: {
    "2-17": [
      "This pairing says the path has a small but real opening for change, but only if timing is treated as part of discernment rather than luck alone",
    ],
    "12-29": [
      "This pairing says too many voices are crowding your sense of the path, so clarity will come from reducing noise rather than adding more interpretation",
    ],
    "16-20": [
      "This pairing says guidance now wants public form, where the path has to be lived in the world rather than kept private and idealized",
    ],
    "18-29": [
      "This pairing says steady support is helping you see what the path can actually sustain, not just what it can inspire in a good moment",
    ],
    "24-28": [
      "This pairing says another person's pull or expectations are resonating with what feels meaningful, so you need to separate genuine calling from relational gravity",
    ],
    "27-29": [
      "This pairing says the path becomes clearer when you name it plainly and give the next step terms you can actually live by",
    ],
    "25-29": [
      "This pairing says inherited promises or recurring loyalties are shaping the path, so you need to decide what still deserves a living yes",
    ],
    "28-29": [
      "This pairing says your path and another person's expectations have become too entangled to read cleanly, so clearer boundaries matter more than pleasing both sides",
    ],
    "29-31": [
      "This pairing says the path becomes clearer when it is lived visibly enough to test whether the progress is real",
    ],
  },
  work: {
    "1-4": [
      "This pairing says fresh news or an incoming task is landing inside a stable structure, so the change has to be absorbed without breaking what already works",
    ],
    "3-25": [
      "This pairing says a professional move, transfer, or change of context is now tied to a commitment or contract that shapes when and how it happens",
    ],
    "7-14": [
      "This pairing says mixed signals and strategic self-interest are in the same frame, so reading the political landscape matters before taking sides",
    ],
    "8-11": [
      "This pairing says an exhausted workflow or repeated strain has reached the point where patching it costs more than replacing it",
    ],
    "8-13": [
      "This pairing says the end of one project or role is making space for a fresh start, so what closes now opens room for a better arrangement",
    ],
    "10-15": [
      "This pairing says a sharp decision is meeting authority or resource control, so the cut has to respect the power structure or it will not stick",
    ],
    "12-29": [
      "This pairing says your role is being crowded by meetings, status chatter, or too many quick-turn decisions, so cleaner communication matters",
    ],
    "14-28": [
      "This pairing says someone in the professional field is playing a strategic angle, so what they say and what they want may not be the same thing",
    ],
    "15-19": [
      "This pairing says management authority and institutional process are reinforcing each other, so navigating both requires patience and clear documentation",
    ],
    "16-29": [
      "This pairing says clearer professional direction is forming around your position once the broader workplace pattern is named honestly",
    ],
    "19-33": [
      "This pairing says the answer comes through structure, policy, or a formal approval path rather than more improvisation",
    ],
    "21-26": [
      "This pairing says the needed information exists, but access is slowed by process, hierarchy, or what is still restricted",
    ],
    "22-29": [
      "This pairing says a career decision or role fork is sitting with you, so progress resumes once you choose rather than wait for the situation to choose for you",
    ],
    "25-34": [
      "This pairing says contractual terms and revenue flow are linked, so obligations shape what the work is actually worth in practice",
    ],
    "28-29": [
      "This pairing says your role and the other side's expectations now need explicit alignment before the work can move cleanly",
    ],
    "29-31": [
      "This pairing says recognition or a positive outcome is starting to form around your professional position, so visible effort matters now",
    ],
  },
  love: {
    "1-24": [
      "This pairing says fresh news or a first signal is arriving around what the heart wants, so what comes in now sets the emotional tone for what follows",
    ],
    "2-24": [
      "This pairing says a small opening is forming in the emotional field, but it is brief and needs to be met with honesty rather than hesitation",
    ],
    "5-24": [
      "This pairing says what matters most in this connection needs time, patience, and rootedness — love that is rushed will not hold",
    ],
    "6-24": [
      "This pairing says emotional fog or mixed signals are making it hard to read the connection clearly, so patience matters more than guessing",
    ],
    "8-24": [
      "This pairing says something in the emotional picture is ending, closing, or being released — grief and acceptance are both part of this passage",
    ],
    "9-24": [
      "This pairing says warmth, encouragement, or a kind gesture is touching the heart of the connection and softening the wider dynamic",
    ],
    "10-24": [
      "This pairing says a sharp emotional break, honest cut, or decisive moment is arriving in the relationship, where clarity matters more than comfort",
    ],
    "14-24": [
      "This pairing says self-interest and emotional attachment are in the same frame, so the question is whether care and strategy can coexist honestly",
    ],
    "22-24": [
      "This pairing says a genuine emotional fork is present, where the connection changes once a real choice is made rather than deferred",
    ],
    "24-25": [
      "This pairing says what matters emotionally is now bound to a commitment, promise, or agreement that makes the relationship's terms visible",
    ],
    "24-26": [
      "This pairing says the emotional picture is being shaped by something still hidden, unsaid, or not yet ready to be fully revealed",
    ],
    "24-28": [
      "This pairing says two hearts are in the same frame, so what each person feels and what each person needs have to be read together",
    ],
    "24-29": [
      "This pairing says your emotional position is becoming the centre of the story, so what you feel and what you allow shapes the whole connection",
    ],
    "24-31": [
      "This pairing says warmth, joy, and visible happiness are gathering around the emotional core of this reading",
    ],
    "24-33": [
      "This pairing says the heart is reaching an answer point, where emotional clarity unlocks the next step in the connection",
    ],
    "24-36": [
      "This pairing says what matters emotionally is carrying a heavier weight, obligation, or test that cannot be wished away",
    ],
    "25-28": [
      "This pairing says a commitment or agreement is now directly tied to another person, so the terms of the bond matter as much as the feeling",
    ],
  },
  spiritual: {
    "1-16": [
      "This pairing says a first sign or spiritual signal is arriving alongside clearer guidance, so the direction of the path becomes more readable",
    ],
    "5-8": [
      "This pairing says something is dying slowly into richer soil, where spiritual growth requires the patience to let go without rushing the next growth",
    ],
    "6-26": [
      "This pairing says fog and secrecy are in the same frame, so the path through mystery requires sitting with what cannot yet be known",
    ],
    "8-13": [
      "This pairing says death and rebirth are working together, so what ends now is making room for a genuine new beginning in the inner life",
    ],
    "9-36": [
      "This pairing says grace and spiritual weight are meeting, so the blessing arrives inside the difficulty rather than in spite of it",
    ],
    "10-26": [
      "This pairing says sharp clarity is cutting into hidden territory, so spiritual honesty may expose what was more comfortable left in shadow",
    ],
    "13-31": [
      "This pairing says a new spiritual beginning is being illuminated by warmth and vitality, so the fresh start has real energy behind it",
    ],
    "16-33": [
      "This pairing says guidance and clarity are converging, so the answer to the spiritual question is closer than uncertainty makes it feel",
    ],
    "21-36": [
      "This pairing says an obstacle is meeting a deep obligation, so the blockage is not random — it is asking something specific of your practice",
    ],
    "22-36": [
      "This pairing says a spiritual fork is meeting sacred obligation, so the choice is not casual — it carries weight for the path ahead",
    ],
    "24-36": [
      "This pairing says what the heart holds and what the path demands are now in the same frame, so devotion has to become practical",
    ],
    "26-29": [
      "This pairing says your spiritual position is shaped by what is still hidden or not yet revealed, so trust and surrender matter more than analysis",
    ],
    "29-31": [
      "This pairing says illumination is gathering around your spiritual position, so what was practised quietly is becoming visible and warm",
    ],
    "29-36": [
      "This pairing says your path is carrying a sacred weight or calling that cannot be put down, so acceptance matters more than comfort",
    ],
    "31-36": [
      "This pairing says light and weight are together, so spiritual joy and spiritual responsibility are not opposed — they ask to be held at once",
    ],
  },
};

function compactAssociationPhrase(input: string): string {
  return lowerFirst(
    clause(input)
      .replace(/^gifts, beauty, and social goodwill are active, with grace setting the tone$/i, "grace, beauty, and social goodwill")
      .replace(/^caution and the part of the field where (.+)$/i, "the part of the field where $1")
      .replace(/^caution, where strategy, discernment, and self-interest appear$/i, "caution, strategy, discernment, and self-interest")
      .replace(/^caution, strategy, discernment, and self-interest$/i, "strategy, discernment, and self-interest")
      .replace(/\bare active, with ([^,]+?) setting the tone$/i, ", with $1")
      .replace(/\bis active, with ([^,]+?) setting the tone$/i, ", with $1")
      .replace(/, especially where .*$/i, "")
      .replace(/, which is where .*$/i, "")
      .replace(/, with .* close to the surface$/i, "")
      .replace(/, with .* setting the tone$/i, "")
      .replace(/, and the need to .*$/i, "")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function naturalizeAction(input: string): string {
  const normalized = clause(input).toLowerCase();
  const mapped: Record<string, string> = {
    "sequence improvements deliberately": "change things in a deliberate order",
    "start small and iterate": "begin on a scale you can actually sustain",
    "pair composure with clear intent": "stay composed and say exactly what you mean",
    "verify then commit": "check what is solid before you commit",
    "respond promptly and confirm facts": "respond promptly and confirm what is true",
    "document clearly and follow up": "put it in writing and follow through",
    "review terms and renew consciously": "review the terms before you renew anything",
    "favor concise, clarifying dialogue": "keep the conversation brief and clarifying",
    "turn friction into intentional practice": "use the friction to improve the pattern instead of replaying it",
    "stabilize what matters and release dead weight": "secure what can last and release what only adds drag",
    "verify details and protect your value": "check what is actually present before committing further trust",
  };
  return mapped[normalized] ?? normalized;
}

const SUBJECT_HOUSE_ACTION_OVERRIDES: Partial<Record<SubjectId, Partial<Record<number, string[]>>>> = {
  general_reading: {
    9: [
      "work with the opening or goodwill that is actually present, but do not make it carry more certainty than it can",
      "use the encouraging signal without pretending it solves the whole situation",
    ],
    6: [
      "name what is still unclear before deciding what it means",
      "separate real uncertainty from projection before choosing your next move",
    ],
    22: [
      "choose the branch that reduces confusion instead of feeding it",
      "make the real decision instead of circling the same alternatives again",
    ],
    23: [
      "fix the small drain before treating it like background noise",
      "deal with the repeated leak directly before it becomes the whole atmosphere",
    ],
    26: [
      "learn what is still hidden before forcing the story closed",
      "protect what is still unclear until you can name it more honestly",
    ],
    28: [
      "clarify roles and expectations before reading intent into everything else",
      "separate what belongs to the other side of events from what is actually yours to decide",
    ],
    29: [
      "treat your own stance as part of the answer, not just the observer's seat",
      "notice what your position is reinforcing before you ask the situation to change",
    ],
    33: [
      "back the clearest answer and test it in reality",
      "use the cleanest available signal instead of waiting for perfect certainty",
    ],
    35: [
      "build around what can actually hold once the first reaction passes",
      "let staying power decide what deserves continued effort",
    ],
  },
  personal_growth: {
    2: [
      "take the small opening seriously enough to use it before the old pattern closes back in",
      "use the brief opening while it is real instead of dismissing it because it is small",
    ],
    1: [
      "answer the first true movement instead of waiting for perfect readiness",
      "treat the first real signal as something to work with, not something to overanalyze first",
    ],
    5: [
      "pace the change for what can actually root and heal instead of pushing for instant proof",
      "let repetition and patient repair do their work before you demand visible transformation",
    ],
    11: [
      "break the repeating inner loop where you already know it stops helping",
      "stop feeding the old pattern with one more reactive pass through the same story",
    ],
    14: [
      "separate discernment from self-protective suspicion before you decide what is true",
      "use caution to clarify the pattern, not to keep the old defenses in charge",
    ],
    16: [
      "turn the long-range signal into one step you can actually live now",
      "convert guidance into one concrete action instead of admiring it from a distance",
    ],
    10: [
      "make the clean cut that stops the old pattern from replaying one more time",
      "use the boundary that actually ends the cycle instead of negotiating with it again",
    ],
    7: [
      "separate layered motives from real guidance before you trust the next instinct",
      "name the pattern clearly enough that complexity stops disguising itself as truth",
    ],
    15: [
      "carry strength in a way that protects growth without turning everything into control",
      "use power as stewardship, not as proof that you can force the whole process",
    ],
    20: [
      "choose where to be visible on purpose instead of performing growth for every audience",
      "curate the social field around your growth so reflection helps more than it pressures",
    ],
    21: [
      "stop trying to force what still needs patience, sequencing, and steadier contact with reality",
      "treat the blockage as something to work in stages instead of a verdict on who you are",
    ],
    22: [
      "choose the path that reduces self-betrayal, not just discomfort",
      "treat the fork as real and close off the route that only repeats the old compromise",
    ],
    32: [
      "track the cycle honestly and stop treating every passing mood as final truth",
      "work with timing, reflection, and self-observation instead of assuming this moment defines the whole pattern",
    ],
    33: [
      "work from the clearest answer that already feels usable instead of demanding total certainty",
      "work from the part of the truth that is already clear enough to live, not just admire",
    ],
    35: [
      "build around what actually steadies you after the first surge of feeling",
      "back the practice, support, or boundary that still holds once the emotional weather changes",
    ],
  },
  community: {
    21: [
      "work the blockage in stages instead of asking the wider field to move all at once",
      "reroute participation around what is blocked instead of treating delay as proof you do not belong",
    ],
    22: [
      "notice which path actually aligns with what you value before closing the other one off",
      "sit with the fork until values rather than anxiety are doing the pointing",
    ],
    29: [
      "notice what your own patterns of participation are quietly reinforcing before asking the group to change",
      "reflect on which boundaries and choices are setting the terms for what the wider field can become",
    ],
    31: [
      "let the clearer signal show without turning belonging into performance",
      "use clearer visibility to build trust in the wider field, not just optics",
    ],
  },
  friends_social: {
    3: [
      "be clear which connection is actually worth expanding before you keep moving between circles",
      "name where the social dynamic is heading before you widen the field around it",
    ],
    34: [
      "track reciprocity and back what is actually flowing both ways",
      "pay attention to whether contact, effort, and support are moving cleanly in both directions",
    ],
  },
  travel: {
    1: [
      "confirm the next movement or update before you make the plan bigger than the facts",
      "treat the next notice or departure change as real information, not background noise",
    ],
    2: [
      "use the small timing window promptly, but do not build the whole trip on it",
      "take the narrow opening while it is usable, then back it with cleaner logistics",
    ],
    3: [
      "define the route and allow more transit time than first looks necessary",
      "plan for the movement itself, not only the destination",
    ],
    9: [
      "use the helpful opening concretely and tie it to an actual travel step",
      "accept the smoother handling, but make sure it changes something practical in the route",
    ],
    6: [
      "name the uncertainty before you choose direction",
      "do not commit harder until the unclear condition is made explicit",
    ],
    7: [
      "separate the real constraint from the hidden variable before you lock the route",
      "read the layered logistics carefully instead of reacting to the first explanation that appears",
    ],
    10: [
      "choose the cleaner cut or reroute and communicate the consequence early",
      "make the sharp travel decision before delay makes it for you",
    ],
    11: [
      "stop replaying the same stressful planning loop and change the sequence instead",
      "interrupt the travel friction pattern at the point where you already know it stops helping",
    ],
    16: [
      "turn the longer-view route signal into actual timings, legs, or confirmations",
      "use the bigger pattern only when it becomes concrete enough to sequence the next step",
    ],
    17: [
      "change things in deliberate order instead of all at once",
      "let the itinerary improve through resequencing, not wishful compression",
    ],
    19: [
      "check the formal rules, checkpoints, or institutional limits before assuming movement",
      "treat the terminal, border, or official structure as part of the trip, not an afterthought",
    ],
    20: [
      "be selective about which public logistics or crowds you actually need to involve",
      "choose the public-facing parts of the trip on purpose instead of letting them choose you",
    ],
    21: [
      "reroute methodically instead of arguing with the delay",
      "work around the blockage in stages instead of trying to force a straight path through it",
    ],
    22: [
      "choose the route that reduces uncertainty, not just the one that looks most open",
      "commit to the path that simplifies the trip instead of the one that multiplies variables",
    ],
    26: [
      "check the hidden detail before you trust the plan",
      "do not assume the booking or condition is real until the missing information is clear",
    ],
    27: [
      "get the confirmation, ticket, or message in writing before you move on",
      "treat the document trail as part of the journey, not just admin around it",
    ],
    28: [
      "clarify the other person's timing or role before you plan around it",
      "separate your route from someone else's assumptions before the trip hardens around them",
    ],
    29: [
      "work from what only you can confirm or organize cleanly",
      "base the next travel step on what is actually in your hands to decide",
    ],
    32: [
      "track timing, visibility, and changing conditions before you decide what the uncertainty means",
      "watch how the route feels across stages instead of treating one unclear phase as the whole trip",
    ],
    33: [
      "act from the clearest confirmed answer instead of from hopeful interpretation",
      "use the confirmation point as the hinge for the next travel step",
    ],
    35: [
      "back the part of the plan that can still hold when timing slips",
      "build around the booking, base, or fallback that still works once the strain hits",
    ],
  },
  education: {
    2: [
      "use the small academic window while it is real instead of assuming it will stay open",
      "treat a brief extension or opening as something to use while it is real, not admire abstractly",
    ],
    3: [
      "define direction before expanding effort into a wider course, campus, or application field",
      "treat distance, expansion, or transfer as a real change in workload and planning, not just a change in scenery",
    ],
    4: [
      "stabilize the study base and routine before expecting the rest of the work to scale cleanly",
      "strengthen the practical foundation the learning path depends on before you add more load",
    ],
    5: [
      "pace the study plan for what can actually be learned and retained instead of what only looks ambitious on paper",
      "treat long study growth as something that compounds through repetition, not pressure spikes",
    ],
    6: [
      "name the unclear requirement before you commit harder to the wrong version of the task",
      "clarify the brief, criteria, or application condition before you build more effort on guesswork",
    ],
    7: [
      "read the layered requirement or mixed signal more carefully before you assume you know what is being asked",
      "separate real complexity from avoidable confusion before you decide what the next academic move should be",
    ],
    8: [
      "allow the pause or deferral to mean something instead of pretending the path is still moving normally",
      "close the stalled phase cleanly before you try to force the next academic step",
    ],
    9: [
      "use the encouraging response or smoother handling concretely instead of treating it as approval for everything",
      "accept the academic opening, but tie it to a real next step instead of mood alone",
    ],
    12: [
      "reduce application chatter and work from the clearest instruction instead of from the loudest opinion",
      "treat nerves and overtalk as noise to manage, not as proof that the path is wrong",
    ],
    13: [
      "begin on a scale you can actually sustain long enough to learn from it",
      "protect the early stage by building one workable habit before you demand mastery",
    ],
    14: [
      "use method to improve focus, not to punish yourself for not being further ahead",
      "separate study strategy from overcontrol before you decide what the work now needs",
    ],
    16: [
      "turn the longer-view study signal into the next concrete step instead of admiring it from a distance",
      "use the qualification arc only when it becomes a real plan for the next piece of work",
    ],
    19: [
      "treat institutional rules, standards, or formal expectations as real constraints and plan within them",
      "work with the structure that governs the result instead of hoping pressure or mood can outrun it",
    ],
    20: [
      "be deliberate about which public comparisons or cohort pressures you actually let shape the work",
      "curate the visible academic field so feedback helps more than it destabilizes",
    ],
    22: [
      "choose the study path that reduces confusion and wasted effort, not just the one that looks most prestigious",
      "treat the fork as real and commit to the route that lets the work compound cleanly",
    ],
    28: [
      "clarify expectations, criteria, or another person's role before you keep planning around assumptions",
      "separate your own work from someone else's timetable or judgment before the path hardens around it",
    ],
    29: [
      "work from what only you can prepare, practice, or submit cleanly",
      "base the next academic step on what is actually in your hands to clarify or finish",
    ],
    31: [
      "use the visible progress as proof that the method is starting to work, then build on it deliberately",
      "treat clearer results as a reason to keep the process steady, not as permission to overreach",
    ],
    34: [
      "manage fees, materials, and workload flow before they quietly shape the path for you",
      "keep the practical resource picture moving cleanly so the work is not being undercut by avoidable leakage",
    ],
    33: [
      "act from the clearest criterion, answer, or acceptance signal instead of circling possibility",
      "use the answer point as the hinge for the next academic step",
    ],
    35: [
      "build around the study rhythm that still holds after the first push fades",
      "let sustainable effort decide what deserves to continue",
    ],
  },
  creative: {
    4: [
      "stabilize the studio base and practical routine before expecting the work to scale cleanly",
      "strengthen the creative foundation the work actually depends on before you add more pressure",
    ],
    6: [
      "clarify what is unclear in the work before you produce harder on guesswork",
      "name the mixed signal or uncertain direction before you build more effort on it",
    ],
    7: [
      "separate real complexity from self-entanglement before you decide what the work needs next",
      "read the layered motive carefully before you assume complication means depth",
    ],
    9: [
      "use the encouraging response or smoother opening concretely instead of treating it as a whole answer",
      "accept the creative opening, but tie it to a real next step instead of mood alone",
    ],
    11: [
      "refine one loop instead of replaying the whole pattern again",
      "interrupt the repetition at the point where it stops sharpening the work and starts draining it",
    ],
    12: [
      "reduce the creative chatter and work from the clearest signal instead of the loudest noise",
      "treat nerves and overtalk as interference to manage, not proof that the work is wrong",
    ],
    14: [
      "separate craft discipline from overcontrol before you decide what the work needs now",
      "use strategy to sharpen the work, not to hide behind it",
    ],
    16: [
      "turn the larger creative signal into the next concrete step",
      "use the longer-view direction to choose what actually gets made next",
    ],
    17: [
      "change the sequence deliberately instead of trying to fix everything at once",
      "let revision happen in the order that actually helps the work breathe",
    ],
    20: [
      "choose which audience field actually matters before you let public response shape the work",
      "curate the visible field around the work so feedback helps more than it distorts",
    ],
    21: [
      "work around the block in stages instead of trying to break it in one move",
      "treat resistance as something to route around, not a wall that proves the work is dead",
    ],
    23: [
      "patch the little leaks before you ask the work for more momentum",
      "reduce the repeated drain that keeps quietly changing the mood of the process",
    ],
    24: [
      "protect what genuinely matters in the work before you ask it to carry more ambition",
      "back what still feels alive instead of only what looks strategically useful",
    ],
    26: [
      "keep the private core of the work protected until it is ready to be shown or named cleanly",
      "let withheld knowledge become deliberate craft, not secrecy that keeps the work half-made",
    ],
    28: [
      "separate your process from audience or collaborator pressure before the work hardens around it",
      "clarify the other side's role before you keep building around assumptions about response",
    ],
    29: [
      "work from what only you can shape, revise, or release cleanly",
      "base the next creative step on what is actually yours to make or decide",
    ],
    30: [
      "stay composed and precise instead of trying to rescue the work with more noise",
      "let craft maturity set the pace of revision",
    ],
    31: [
      "use visible traction to steady the process, not to overreach",
      "treat clearer signal as proof of method, then keep building deliberately",
    ],
    32: [
      "track the visibility cycle honestly before deciding what recognition means",
      "work with the changing weather of being seen instead of treating every fluctuation as final",
    ],
    35: [
      "build around what can actually hold as practice once the first push fades",
      "let sustainable output decide what deserves to continue",
    ],
  },
  health: {
    4: [
      "stabilize the routines and home base your body is leaning on before you ask for more output",
      "work on the foundations of recovery first, so the rest of the system has something real to stand on",
    ],
    5: [
      "pace recovery for what can actually heal instead of demanding instant proof from the body",
      "let healing happen at the speed the system can truly sustain",
    ],
    8: [
      "honor the pause, rest, or shutdown instead of treating it like a moral failure",
      "give the part that is already asking for rest enough quiet to actually recover",
    ],
    11: [
      "interrupt the repeating strain pattern instead of adapting around it one more time",
      "stop feeding the flare cycle at the point where you already know it stops helping",
    ],
    12: [
      "reduce stimulation, overtalk, and inner noise before asking the system for cleaner answers",
      "settle the nervous system first so the rest of the picture can become easier to read",
    ],
    14: [
      "separate useful caution from hypervigilance before you decide what the body needs",
      "use discernment to support the system, not to keep it under constant surveillance",
    ],
    17: [
      "change routines in an order the body can actually integrate",
      "let the improvement build in sequence instead of trying to force it all at once",
    ],
    18: [
      "lean on dependable support instead of performing recovery alone",
      "let consistency from people or practices you trust do some of the stabilizing work",
    ],
    20: [
      "choose where to let recovery be visible instead of letting every audience shape how the body is allowed to heal",
      "be selective about whose feedback actually helps the system settle rather than brace harder",
    ],
    23: [
      "name the repeated drain before it becomes the whole story of how you feel",
      "fix the small leak in energy, stress, or recovery before asking for bigger gains",
    ],
    24: [
      "treat what genuinely nourishes you as part of the recovery itself, not a reward after the fact",
      "protect what actually restores you before you ask the body for more output",
    ],
    25: [
      "revise the repeating pattern instead of renewing it just because the body already knows how to survive it",
      "look at the routine or bodily agreement that keeps resetting the same strain and decide whether it still deserves renewal",
    ],
    28: [
      "separate your body's truth from what other people need, expect, or mirror back to you",
      "notice whether someone else's pace or expectation has become the measure of what your system is supposed to carry",
    ],
    29: [
      "treat your own wellbeing as part of the answer, not just the thing being managed",
      "work from what your system is actually showing you instead of what you hoped would be true by now",
    ],
    30: [
      "let steadier rest and calmer pacing do their work before you ask for more output",
      "use rest and regulation as treatment, not as a reward you only earn after pushing through",
    ],
    31: [
      "back the signs of returning energy without spending them all at once",
      "use clearer signal to guide pacing, not to pretend the body has no limits now",
    ],
    32: [
      "track the cycle honestly before deciding what is wrong with the whole system",
      "work with sleep, timing, and sensitivity instead of treating every fluctuation as random",
    ],
    33: [
      "work with what is already proving helpful instead of waiting for perfect certainty",
      "build around the clearest answer your body is already giving you",
    ],
    34: [
      "support circulation, access, and the practical conditions that let the system move more cleanly",
      "back what helps movement and flow instead of only reacting once things feel stuck",
    ],
    35: [
      "choose the routine, support, or pacing that still holds after the first good or bad day passes",
      "let staying power decide what is actually helping recovery",
    ],
  },
  pets: {
    4: [
      "tighten the setup and daily routine the animal is relying on most",
      "strengthen the home base, enclosure, or everyday structure the animal actually depends on",
    ],
    5: [
      "commit to the calmer, steadier routine the animal can actually settle into",
      "pace care for what helps the animal feel safe enough to root and recover instead of demanding faster proof",
    ],
    8: [
      "respect the pause and stop pushing for a response before the animal is ready",
      "protect recovery time instead of turning the quiet phase into more pressure",
    ],
    11: [
      "change the routine the animal is reacting to instead of replaying the same stress loop",
      "interrupt the flare or friction pattern at the point where you already know it stops helping",
    ],
    12: [
      "reduce anxious discussion and over-monitoring so the animal's real signals are easier to read",
      "settle the atmosphere around the animal before you ask the care picture for cleaner answers",
    ],
    14: [
      "observe carefully without tightening into over-control",
      "separate useful caution from overprotection before you decide what the animal needs next",
    ],
    16: [
      "turn the longer-view care pattern into the next concrete step",
      "use the clearer signal to choose one practical adjustment instead of only watching it from a distance",
    ],
    17: [
      "change routines in an order the animal can actually integrate",
      "let improvement build through small care changes instead of trying to fix everything at once",
    ],
    20: [
      "manage the visible environment and outside input so the animal has less to absorb",
      "be selective about visitors, outings, or stimulation instead of letting the wider environment set the tone",
    ],
    21: [
      "work around the blockage patiently instead of forcing progress the animal cannot yet sustain",
      "treat the delay as something to sequence through, not something to argue with by pushing harder",
    ],
    23: [
      "reduce the small stressors and simplify the routine before asking for bigger gains",
      "patch the repeated little drains before they become the whole care atmosphere",
    ],
    25: [
      "review the routine before you keep repeating it",
      "change the care pattern that no longer helps the animal settle instead of renewing it by habit",
    ],
    29: [
      "base the next step on what you can actually observe, pace, and change directly",
      "treat your care role as part of the answer, not just the thing reacting to the animal",
    ],
    31: [
      "treat clearer comfort or improvement as guidance for the next care step",
      "use the clearer signs of comfort or progress to support one practical adjustment",
    ],
    33: [
      "work from the clearest usable clue instead of from hopeful interpretation",
      "let the answer that is already beginning to show guide the next care step",
    ],
    35: [
      "stabilize the routine that genuinely helps the animal settle, and stop carrying what only adds stress",
      "build around the support and steadiness that actually holds for the animal after first reactions pass",
    ],
  },
  legal_admin: {
    1: [
      "answer the first notice or update promptly, but only after you confirm what the record actually supports",
      "treat the new movement in the file as real, but verify the next procedural step before you commit to it",
    ],
    2: [
      "use the narrow opening quickly, but only if the record is ready enough to support the next step",
      "treat the brief procedural advantage as real, but do not waste it on a half-prepared response",
    ],
    9: [
      "use the small opening to improve tone, timing, or handling without pretending it resolves the whole matter",
      "work the goodwill or procedural opening only where it helps the file move cleanly and credibly",
    ],
    4: [
      "stabilize the base terms, file structure, or fixed obligations the rest of the matter depends on",
      "secure the structural footing of the matter before pushing for faster movement",
    ],
    5: [
      "pace the matter for what can actually be sustained and evidenced",
      "work the process patiently enough for the record to strengthen instead of just getting noisier",
    ],
    6: [
      "name the unknowns before you file, answer, or commit to the next step",
      "separate what is missing from what is actually blocked before you react",
    ],
    7: [
      "separate tactical reading from suspicion before you answer the next step",
      "read the strategy in the file clearly before you decide what it means",
    ],
    8: [
      "close out what is already ending in practice before it keeps dragging the file forward by inertia",
      "treat the pause or ending as procedural reality and clear space for the next stage to begin cleanly",
    ],
    10: [
      "treat the deadline or forced decision as real and tighten the response around what can actually be evidenced",
      "use the cut point to remove anything vague, late, or no longer supportable from the file",
    ],
    11: [
      "stop the repeat-request loop by fixing the exact point where the file keeps bouncing back",
      "use the friction to identify what has to change in the process itself, not just in your reaction to it",
    ],
    13: [
      "treat the matter as still correctable while it is early enough to tighten the filing, response, or evidence cleanly",
      "use the early-stage status of the matter to fix what would be harder to repair later",
    ],
    19: [
      "work directly with the formal rules and approval path instead of arguing with the structure itself",
      "treat the institution, policy, or formal limit as part of the route, not just the obstacle",
    ],
    21: [
      "work the backlog or blockage in stages and stop trying to force the whole matter at once",
      "treat the delay as something to route through methodically instead of something to emotionally argue with",
    ],
    22: [
      "choose the branch that actually reduces procedural uncertainty instead of carrying two incompatible paths at once",
      "treat the decision point as procedural reality and close off the route that only keeps the file circling",
    ],
    23: [
      "fix the repeated admin leak before it becomes a bigger delay",
      "close the missing-detail loop before you assume the process is against you",
    ],
    24: [
      "name what the file is actually trying to protect or establish before the process gets buried in tactics",
      "keep the material or ethical stake visible so the process does not collapse into pure procedure",
    ],
    28: [
      "clarify roles, responses, and what actually sits with the other side before you build the next step on assumption",
      "separate what depends on the other side's response from what your own side can still advance cleanly now",
    ],
    31: [
      "make the clearest part of the record visible at the point where review now depends on what can be shown plainly",
      "use visible progress in the file to support the next step instead of arguing from possibility alone",
    ],
    26: [
      "pull together the missing facts or protected documents before you respond",
      "let the review happen fully before you treat the matter as settled",
    ],
    27: [
      "put the facts, dates, and terms in writing before the next step",
      "follow the paper trail until the matter stops being vague",
    ],
    29: [
      "treat your own documented position as part of the file and tighten whatever only you can authorize, clarify, or sign",
      "work from the part of the matter only your side can evidence cleanly instead of reacting to noise around it",
    ],
    33: [
      "tie the next move to the actual approval point, clause, or decision that unlocks progress",
      "work from the decisive clause or answer point instead of from speculation",
    ],
    34: [
      "track where fees, access, or process movement are actually clearing before you assume the matter is blocked",
      "follow the part of the process that only moves once approvals or resources truly land",
    ],
    35: [
      "secure the deadlines, obligations, or commitments that can still hold",
      "back the part of the process that remains enforceable after the first reaction passes",
    ],
    32: [
      "track the review cycle and who needs to see what before the next response is sent",
      "work with visibility, timing, and formal perception instead of assuming the file is being read the way you intend",
    ],
    30: [
      "let measured handling and settled terms strengthen the file instead of adding more noise",
      "use restraint to improve credibility and keep the response aligned with what can actually be defended",
    ],
  },
  home_family: {
    1: [
      "respond to the first clear household signal and keep the next step manageable",
      "work with the first real movement at home instead of waiting for perfect certainty",
    ],
    18: [
      "lean on the support that has already proved reliable and make the terms of help explicit at home",
      "work with the dependable ally or support line that actually steadies the household",
    ],
    2: [
      "use the small domestic opening before daily pressure closes it again",
      "take the brief chance to make the household easier while it is still open",
    ],
    16: [
      "turn the long view for home life into the next practical steps the household can actually sustain",
      "use the larger family picture to decide what needs steady follow-through now",
    ],
    14: [
      "check what is actually needed before reacting from household defensiveness",
      "separate practical caution from suspicion so the home problem gets solved instead of replayed",
    ],
    8: [
      "let the exhausted part of the household rhythm actually rest",
      "allow the part that is already over at home to stop demanding energy",
    ],
    9: [
      "accept the help or kindness that genuinely eases the household load",
      "let warmth become practical support instead of leaving it at good intention",
    ],
    11: [
      "stop replaying the same household strain just because it is familiar",
      "change the repeating domestic pattern instead of refining the argument around it",
    ],
    17: [
      "change the household rhythm in the order reality allows",
      "make the domestic adjustment step by step so it can actually hold",
    ],
    32: [
      "name the household mood before it hardens into another argument",
      "work with the emotional cycle at home before you ask the family to carry one more strain",
    ],
    34: [
      "trace where support, money, or effort keeps flowing out faster than it returns",
      "work with the part of the household exchange that actually keeps daily life moving",
    ],
  },
  love: {
    6: [
      "name what feels unclear before trying to call it commitment",
      "separate fear from fact before deciding what this bond means",
    ],
    7: [
      "separate signal from social noise",
      "say what feels complicated plainly instead of letting tension coil around it",
    ],
    19: [
      "name the distance honestly and ask whether it is protection or pattern",
      "treat reserve as something to clarify, not something to romance",
    ],
    26: [
      "say what has been kept private once you can say it plainly",
      "bring the unsaid part of the bond into clearer language",
    ],
    27: [
      "say the important thing directly and without extra static",
      "let the next conversation clarify the terms instead of circling them",
    ],
    30: [
      "stay composed and say exactly what you mean",
      "let calm honesty do the work that drama cannot",
    ],
  },
  money: {
    1: [
      "answer the incoming item quickly, but only after you verify what it changes",
      "treat new information as a prompt to confirm the facts, not to panic",
    ],
    7: [
      "reduce the complexity before you decide what to protect",
      "separate incentives from assumptions before committing money or trust",
    ],
    9: [
      "use goodwill where it helps, but make the support concrete before you count on it",
      "let the favorable tone open a door, then check whether the terms actually hold",
    ],
    5: [
      "back the slow repair that actually strengthens the base",
      "choose the steadier pace that leaves the budget healthier a month from now",
    ],
    16: [
      "turn the plan into dated, trackable steps",
      "translate the strategy into the next concrete actions and deadlines",
    ],
    6: [
      "separate temporary uncertainty from actual loss before you react",
      "wait for cleaner numbers before calling the whole picture",
    ],
    12: [
      "keep money conversations brief, specific, and tied to actual figures",
      "separate chatter from numbers before you make the next call",
    ],
    8: [
      "let the part that is already over close cleanly",
      "treat the reset as real before planning the rebuild",
    ],
    15: [
      "take firmer control of the budget pressure instead of negotiating with it",
      "name who holds the leverage and work from that fact",
    ],
    19: [
      "work with the rules, structures, and formal limits directly instead of resenting them",
      "treat the formal structure as part of the solution, not just the obstacle",
    ],
    24: [
      "back what still clearly matters and stop funding what only feels sentimental",
      "let values guide the choice, but make the numbers prove they can hold it",
    ],
    23: [
      "track the small losses before they become the whole story",
      "plug the recurring leak before chasing a bigger gain",
    ],
    25: [
      "review the recurring obligation line by line before renewing it",
      "renegotiate the terms that keep taking a share of the flow",
    ],
    27: [
      "follow the paperwork until the money picture stops being vague",
      "put the numbers, notices, and dates in one place before deciding",
    ],
    29: [
      "tighten your side of the flow before trying to control the whole field",
      "treat your own choices as the first lever in the money picture",
    ],
    30: [
      "slow the pace enough for restraint to improve the decision",
      "use patience to make the choice cleaner, not to avoid making it",
    ],
    32: [
      "track the pattern before reacting to one spike or dip",
      "work from the cycle you can see, not the mood of the moment",
    ],
    33: [
      "back the fix that actually unlocks the flow",
      "choose the answer that improves the numbers, not just the mood",
    ],
    34: [
      "follow the flow to where it slows, stalls, or leaks",
      "work with the actual movement of money, not the hoped-for version",
    ],
    35: [
      "stabilize what can truly hold before expanding anything",
      "protect the part of the structure that is already proving durable",
    ],
  },
  work: {
    3: [
      "define the direction or handoff path before more effort gets committed",
      "make sure movement in the work has a route, not just momentum",
    ],
    7: [
      "read the incentives directly and put the real constraint on the table",
      "separate politics from the actual work so the next move is based on signal, not theater",
    ],
    14: [
      "separate real risk from office politics before you react",
      "use discernment to cut through tactical noise instead of rewarding it",
    ],
    12: [
      "cut the meeting noise down to the next real decision",
      "keep the update cycle brief and tied to what actually changes delivery",
    ],
    19: [
      "use the formal structure, approval path, or chain of responsibility instead of fighting it sideways",
      "take the question to the level where a real decision can actually be made",
    ],
    21: [
      "work the blocker in stages instead of trying to force it all at once",
      "reroute around the delayed piece and keep the rest of the system moving",
    ],
    23: [
      "fix the leak or repeat correction loop before taking on more",
      "stop the rework pattern before it hardens into normal operating mode",
    ],
    33: [
      "back the cleanest fix and make it explicit",
      "choose the answer that turns a stuck process back into motion",
    ],
  },
  purpose_calling: {
    1: [
      "respond to the first real signal and test it in lived practice",
      "follow the first concrete sign that still feels true once the noise dies down",
    ],
    4: [
      "strengthen the daily structure that lets the path be lived instead of only imagined",
      "rebuild the ordinary foundation that makes the path viable in real life",
    ],
    26: [
      "learn what the path still needs before naming it finished or fully public",
      "protect what is still ripening until it can be lived more honestly in the open",
    ],
    34: [
      "follow the real flow of energy and support instead of only the most dramatic impulse",
      "back the channel that actually feeds the path rather than the one that only keeps it busy",
    ],
    12: [
      "quiet the noise long enough to hear what the path is actually asking of you",
      "reduce the chatter and let the next real signal stand out",
    ],
    23: [
      "simplify what keeps draining conviction so the path can breathe again",
      "stop feeding the small repeated drain that keeps weakening your trust in the path",
    ],
    8: [
      "let the old version of the path finish before demanding a new one from yourself",
      "stop feeding the version of the path that has already ended in practice",
    ],
    10: [
      "make the clean cut that frees energy for the path that is actually yours",
      "stop feeding the version of the path that only survives by urgency, guilt, or habit",
    ],
    16: [
      "turn the larger vision into the next durable step you can actually keep",
      "let the long view decide what deserves steady follow-through now",
    ],
    21: [
      "work the delay in stages and let patience prove what is still yours to carry",
      "treat the blockage as part of the discernment, not just a problem to bulldoze through",
    ],
    22: [
      "choose the branch that still feels alive after the pressure passes",
      "make the path choice that you can keep living with once the mood changes",
    ],
    25: [
      "renew only the commitments that still belong to the path you can actually live",
      "stop repeating promises that no longer match the life or work you are being asked toward",
    ],
    24: [
      "back what still feels deeply true, even if it asks for a quieter form of devotion",
      "let meaning, not mood, decide the next step on the path",
    ],
    29: [
      "choose from conviction rather than fear, then let the rest reorganize around that choice",
      "treat your own agency as the first answer point on the path",
    ],
    30: [
      "let maturity decide what deserves your devotion and what only wants your urgency",
      "use restraint to protect the path from false drama",
    ],
    33: [
      "choose the answer that makes the path more livable, not just more impressive",
      "back the decision that turns direction into something you can actually practice",
    ],
    35: [
      "build around what you can actually sustain over time",
      "treat endurance as part of alignment, not as the enemy of it",
    ],
    31: [
      "step toward the version of the path that becomes clearer when it is lived openly",
      "let visible progress confirm the path instead of waiting for certainty to arrive first",
    ],
    32: [
      "track the cycle without mistaking every mood for truth",
      "use the pattern you can see over time, not only the feeling of this moment",
    ],
  },
};

const SUBJECT_HOUSE_FOLLOW_THROUGH_OVERRIDES: Partial<Record<SubjectId, Partial<Record<number, string[]>>>> = {
  personal_growth: {
    11: [
      "This is where the loop has to be interrupted, not studied one more time",
      "This is where the pattern has to be broken instead of replayed again",
    ],
  },
  money: {
    3: [
      "This keeps attention on where the money is actually moving, what it costs to move it, and whether it will land where it can help",
      "This brings the focus back to movement, transfer costs, and whether the money will arrive where it is actually needed",
    ],
  },
};

function naturalJoin(values: string[]): string {
  const clean = values.map((value) => value.trim()).filter(Boolean);
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(", ")}, and ${clean[clean.length - 1]}`;
}

function normalizePairKeywords(input: string): string {
  return input
    .replace(/^ending and rest$/i, "closure, rest, and what needs recovery time")
    .replace(/^stability and career$/i, "stability, endurance, and what can actually hold")
    .replace(/^cut and decision$/i, "a decisive cut and its consequences")
    .replace(/^beginning and small$/i, "small beginnings and what they need")
    .replace(/^gift and charm$/i, "warmth, invitation, and what opens through tone")
    .replace(/^clarity and success$/i, "clearer signal and usable momentum")
    .replace(/^clarity and visible progress$/i, "visible traction and clearer signal")
    .replace(/^communication and nerves$/i, "anxious talk and crossed signals")
    .replace(/^erosion and stress$/i, "worry, attrition, and the little losses that change tone")
    .replace(/^grace, goodwill, or invitation$/i, "warmth, goodwill, and a friendlier opening")
    .replace(/^guidance and signal$/i, "clearer signal and direction")
    .replace(/^journey and trade$/i, "movement, distance, and practical exchange")
    .replace(/^knowledge and secrecy$/i, "private knowledge and what is still withheld")
    .replace(/^other and mirror$/i, "the other person's stance and what it reflects back")
    .replace(/^uncertainty and fog$/i, "uncertainty and what still cannot be read clearly")
    .replace(/^institution and distance$/i, "distance, standards, and formal structure")
    .replace(/^home and structure$/i, "the shared base and what needs steadiness")
    .replace(/^solution and certainty$/i, "a workable answer and clearer signal")
    .replace(/^money and flow$/i, "resources, exchange, and what is actually moving")
    .replace(/^dialogue and nerves$/i, "anxious talk and quick reactions")
    .replace(/^repetition and tension$/i, "repeated friction and pressure")
    .replace(/^the answer point$/i, "the point where things finally become clear enough to use")
    .replace(/^values and love$/i, "shared values and genuine care");
}

function displayHouseName(input: HouseMeaning): string {
  if (input.name === "House House") return "Foundation House";
  return input.name;
}

function cardFrom(input: number | CardMeaning): CardMeaning {
  return typeof input === "number" ? getCardMeaning(input) : input;
}

function houseFrom(input: number | HouseMeaning): HouseMeaning {
  return typeof input === "number" ? getHouseMeaning(input) : input;
}

function houseDescriptionPhrase(input: HouseMeaning): string {
  return lowerFirst(clause(input.description).replace(/^where\s+/i, ""));
}

export interface ReadingContext {
  usedCardPhrases: Map<number, Set<string>>;
  usedHousePhrases: Map<number, Set<string>>;
}

export function createReadingContext(): ReadingContext {
  return { usedCardPhrases: new Map(), usedHousePhrases: new Map() };
}

function chooseAvoiding(
  pool: string[],
  id: number,
  usedMap: Map<number, Set<string>>,
  random: () => number,
): string {
  if (pool.length <= 1) return pool[0] ?? "";
  const used = usedMap.get(id);
  const available = used ? pool.filter((p) => !used.has(p)) : pool;
  const chosen = choose(available.length > 0 ? available : pool, random);
  if (!usedMap.has(id)) usedMap.set(id, new Set());
  usedMap.get(id)!.add(chosen);
  return chosen;
}

export function buildCardAssociationPhrase(
  input: number | CardMeaning,
  subjectId: SubjectId,
  domain: Domain,
  random: () => number,
  context?: ReadingContext,
): string {
  const card = cardFrom(input);
  const subjectPool = SUBJECT_CARD_ASSOCIATION_NOTES[subjectId]?.[card.id] ?? [];
  if (subjectPool.length) {
    return context
      ? chooseAvoiding(subjectPool, card.id, context.usedCardPhrases, random)
      : choose(subjectPool, random);
  }

  const specialPool = CARD_ASSOCIATION_NOTES[card.id]?.[domain] ?? CARD_ASSOCIATION_NOTES[card.id]?.general ?? [];
  if (specialPool.length) {
    return context
      ? chooseAvoiding(specialPool, card.id, context.usedCardPhrases, random)
      : choose(specialPool, random);
  }

  const domainLine = clause(card.domainVariants[domain]);
  const keywords = naturalJoin(card.keywords.slice(0, 3));
  const action = clause(card.action);

  return compactAssociationPhrase(
    choose(
      [
        `${domainLine}, with ${keywords} close to the surface`,
        `the ${keywords} layer of the situation, especially where ${domainLine}`,
        `${domainLine}, especially where ${keywords} have been building quietly`,
        `${domainLine}, and the need to ${action}`,
      ],
      random,
    ),
  );
}

export function buildHouseAssociationPhrase(
  input: number | HouseMeaning,
  subjectId: SubjectId,
  domain: Domain,
  random: () => number,
  context?: ReadingContext,
): string {
  const house = houseFrom(input);
  const subjectPool = SUBJECT_HOUSE_ASSOCIATION_NOTES[subjectId]?.[house.id] ?? [];
  if (subjectPool.length) {
    return context
      ? chooseAvoiding(subjectPool, house.id, context.usedHousePhrases, random)
      : choose(subjectPool, random);
  }

  const specialPool = HOUSE_ASSOCIATION_NOTES[house.id]?.[domain] ?? HOUSE_ASSOCIATION_NOTES[house.id]?.general ?? [];
  if (specialPool.length) {
    return context
      ? chooseAvoiding(specialPool, house.id, context.usedHousePhrases, random)
      : choose(specialPool, random);
  }

  return compactAssociationPhrase(
    choose(
      [
        `${house.shortFocus} and the part of the field where ${houseDescriptionPhrase(house)}`,
        `the part of the field where ${houseDescriptionPhrase(house)}`,
        `the layer of the situation where ${houseDescriptionPhrase(house)}`,
      ],
      random,
    ),
  );
}

export function buildCardAssociationSentence(
  input: number | CardMeaning,
  subjectId: SubjectId,
  domain: Domain,
  random: () => number,
): string {
  const card = cardFrom(input);
  const phrase = buildCardAssociationPhrase(card, subjectId, domain, random);
  const scope = SUBJECT_SCOPE[subjectId];

  return sentence(
    choose(
      [
        `${card.name} often points to ${phrase} in ${scope}`,
        `${card.name} colors ${scope} through ${phrase}`,
        `Here, ${card.name} emphasizes ${phrase}`,
        `In ${scope}, ${card.name} keeps returning to ${phrase}`,
        `${card.name} tends to draw ${scope} toward ${phrase}`,
        `When ${card.name} appears here, it pulls ${scope} toward ${phrase}`,
        `${card.name} carries ${phrase} into the reading's picture of ${scope}`,
        `${card.name} shifts the tone of ${scope} toward ${phrase}`,
      ],
      random,
    ),
  );
}

export function buildHouseAssociationSentence(
  input: number | HouseMeaning,
  subjectId: SubjectId,
  domain: Domain,
  random: () => number,
): string {
  const house = houseFrom(input);
  const houseName = displayHouseName(house);
  const housePhrase = buildHouseAssociationPhrase(house, subjectId, domain, random);

  return sentence(
    choose(
      [
        `${houseName} keeps drawing attention to ${housePhrase}`,
        `${houseName} makes ${housePhrase} harder to ignore`,
        `In ${houseName}, the emphasis falls on ${housePhrase}`,
        `${houseName} is the part of the reading where ${housePhrase} becomes most concrete`,
        `Whatever else is happening, ${houseName} keeps pulling focus back to ${housePhrase}`,
        `The weight of ${houseName} lands on ${housePhrase}, and other readings nearby are shaped by it`,
        `${houseName} grounds the reading: ${housePhrase} is not abstract here, it is active`,
        `${houseName} localizes the pressure around ${housePhrase}`,
      ],
      random,
    ),
  );
}

export function buildOverlayAssociationSentence(input: {
  card: number | CardMeaning;
  house: number | HouseMeaning;
  subjectId: SubjectId;
  domain: Domain;
  random: () => number;
}): string {
  const card = cardFrom(input.card);
  const house = houseFrom(input.house);
  const houseName = displayHouseName(house);
  const overlayOverride = SUBJECT_OVERLAY_ASSOCIATION_NOTES[input.subjectId]?.[sortedPairKey(card.id, house.id)];
  if (overlayOverride?.length) {
    const overlayPhrase = choose(overlayOverride, input.random);
    return sentence(
      choose(
        [
          `${card.name} in ${houseName} brings ${overlayPhrase}`,
          `In ${houseName}, ${card.name} points to ${overlayPhrase}`,
          `${card.name} meeting ${houseName} suggests ${overlayPhrase}`,
        ],
        input.random,
      ),
    );
  }

  const housePhrase = compactAssociationPhrase(
    buildHouseAssociationPhrase(house, input.subjectId, input.domain, input.random),
  );
  const cardPhrase = compactAssociationPhrase(
    buildCardAssociationPhrase(card, input.subjectId, input.domain, input.random),
  );

  return sentence(
    choose(
      [
        `${card.name} in ${houseName} ties ${cardPhrase} to ${housePhrase}`,
        `${houseName} frames ${card.name} through ${housePhrase}, making ${cardPhrase} harder to ignore`,
        `Placed in ${houseName}, ${card.name} shows how ${cardPhrase} is being shaped by ${housePhrase}`,
        `${card.name} meeting ${houseName} brings ${cardPhrase} into the atmosphere of ${housePhrase}`,
        `${card.name} landing in ${houseName} means ${cardPhrase} is now working inside the conditions of ${housePhrase}`,
        `The combination of ${card.name} and ${houseName} concentrates the reading: ${cardPhrase} is where ${housePhrase} becomes personal`,
        `In ${houseName}, ${card.name} cannot avoid ${housePhrase} — and the result is that ${cardPhrase} takes on a sharper, more grounded quality`,
      ],
      input.random,
    ),
  );
}

export function buildPairAssociationSentence(input: {
  cardA: number | CardMeaning;
  cardB: number | CardMeaning;
  subjectId: SubjectId;
  domain: Domain;
  random: () => number;
}): string {
  const cardA = cardFrom(input.cardA);
  const cardB = cardFrom(input.cardB);
  const pairOverride = SUBJECT_PAIR_ASSOCIATION_OVERRIDES[input.subjectId]?.[sortedPairKey(cardA.id, cardB.id)];
  if (pairOverride?.length) {
    return sentence(choose(pairOverride, input.random));
  }
  const leftKeywords = normalizePairKeywords(naturalJoin(cardA.keywords.slice(0, 2)).toLowerCase());
  const rightKeywords = normalizePairKeywords(naturalJoin(cardB.keywords.slice(0, 2)).toLowerCase());
  // Avoid "X and Y and A and B" chains when each side already contains "and"
  const kwJoin = (left: string, right: string): string =>
    left.includes(" and ") || right.includes(" and ")
      ? `${left} alongside ${right}`
      : `${left} and ${right}`;

  return sentence(
    choose(
      [
        `${cardA.name} and ${cardB.name} show ${kwJoin(leftKeywords, rightKeywords)} actively shaping each other rather than sitting in separate lanes`,
        `Taken together, ${cardA.name} and ${cardB.name} bring ${leftKeywords} into direct contact with ${rightKeywords}, so neither can be read on its own`,
        `${cardA.name} and ${cardB.name} place ${kwJoin(leftKeywords, rightKeywords)} in the same frame — and make each harder to ignore`,
        `${cardA.name} and ${cardB.name} bring ${leftKeywords} into active contact with ${rightKeywords}, which is why the reading cannot treat them as separate issues`,
        `${cardA.name} alongside ${cardB.name} means ${kwJoin(leftKeywords, rightKeywords)} are not separate threads — they are already interacting`,
        `The combination of ${cardA.name} and ${cardB.name} makes ${kwJoin(leftKeywords, rightKeywords)} part of the same question`,
        `${cardA.name} and ${cardB.name} together pull ${kwJoin(leftKeywords, rightKeywords)} into the same orbit`,
        `What ${cardA.name} starts with ${leftKeywords}, ${cardB.name} reshapes through ${rightKeywords} — the two cards speak as one voice here`,
        `${cardA.name} and ${cardB.name} are not background noise: ${kwJoin(leftKeywords, rightKeywords)} is the mechanism the reading is describing`,
        `Neither ${cardA.name} nor ${cardB.name} can be understood alone in this spread — ${kwJoin(leftKeywords, rightKeywords)} describes a single dynamic, not two separate ones`,
      ],
      input.random,
    ),
  );
}

export function buildActionDirectiveSentence(input: {
  actionCard: number | CardMeaning;
  house: number | HouseMeaning;
  subjectId: SubjectId;
  domain: Domain;
  random: () => number;
}): string {
  const card = cardFrom(input.actionCard);
  const house = houseFrom(input.house);
  const houseName = displayHouseName(house);
  const action = clause(card.action);
  const housePhrase = compactAssociationPhrase(
    buildHouseAssociationPhrase(house, input.subjectId, input.domain, input.random),
  );
  const cardPhrase = compactAssociationPhrase(
    buildCardAssociationPhrase(card, input.subjectId, input.domain, input.random),
  );
  const actionSentence =
    SUBJECT_HOUSE_ACTION_OVERRIDES[input.subjectId]?.[house.id]?.length
      ? choose(SUBJECT_HOUSE_ACTION_OVERRIDES[input.subjectId]?.[house.id] ?? [], input.random)
      : naturalizeAction(action);
  const fieldWhereMatch = housePhrase.match(/the part of the field where (.+)$/i);
  const wherePhrase = fieldWhereMatch?.[1] ?? null;
  const followThroughOverrides = SUBJECT_HOUSE_FOLLOW_THROUGH_OVERRIDES[input.subjectId]?.[house.id] ?? [];
  const hasFollowThroughOverride = followThroughOverrides.length > 0;
  const isCardEqualsHouse = card.id === house.id;
  const followThroughSentence = hasFollowThroughOverride
    ? choose(followThroughOverrides, input.random)
    : isCardEqualsHouse
      ? choose(
          [
            `That is the sharpest signal in this spread`,
            `When the card and the house name the same thing, the signal concentrates`,
            `The card and the house point to the same place, which makes it worth trusting`,
          ],
          input.random,
        )
      : wherePhrase
        ? `This is where ${wherePhrase}`
        : choose(
            [
              `That keeps the focus on ${housePhrase}`,
              `That is the thread the rest of the reading leads toward`,
              `That is where acting first would carry the most weight`,
              `That is where the reading's weight concentrates most`,
              `That is the single clearest directive in the spread`,
              `Everything else in the reading orbits this — ${housePhrase} is where the leverage sits`,
              `If you only act on one thing from this reading, this is where it counts`,
            ],
            input.random,
          );

  return sentence(
    choose(
      hasFollowThroughOverride
        ? [
            `If anything deserves closer attention here, it is ${houseName}: ${actionSentence}. ${followThroughSentence}`,
            `The thread worth following runs through ${houseName}: ${actionSentence}. ${followThroughSentence}`,
          ]
        : [
            `The place most worth returning to is ${houseName}: ${actionSentence}. This is where the reading concentrates most clearly`,
            `${houseName} is where the reading keeps pointing: ${actionSentence}. ${followThroughSentence}`,
            `If anything deserves closer attention here, it is ${houseName}: ${actionSentence}. ${followThroughSentence}`,
            `The thread worth following runs through ${houseName}: ${actionSentence}. ${followThroughSentence}`,
            `The reading's clearest practical signal is at ${houseName}: ${actionSentence}. ${followThroughSentence}`,
            `Everything in this spread leads back to ${houseName}: ${actionSentence}. ${followThroughSentence}`,
          ],
      input.random,
    ),
  );
}
