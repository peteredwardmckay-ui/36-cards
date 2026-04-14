import { getCardMeaning } from "@/lib/content/cards";
import { getHouseMeaning } from "@/lib/content/houses";
import { getDiagonalLine, getGTCoord } from "@/lib/engine/gt";
import type { CardPlacement, Domain, GTLayout, SubjectId } from "@/lib/engine/types";

type MotifId =
  | "guidance"
  | "pressure"
  | "hidden"
  | "stability"
  | "movement"
  | "warmth"
  | "choice"
  | "power"
  | "communication";

interface SignalCandidate {
  placement: CardPlacement;
  positiveScore: number;
  pressureScore: number;
  openingBias: number;
  pressureBias: number;
  text: string;
}

export interface TableauSynthesis {
  atmosphereSentence: string;
  openingsSentence: string;
  pressureSentence: string;
  practicalSentence: string;
  thesisSentence: string;
  conclusionSentence: string;
  openingBullet: string | null;
  pressureBullet: string | null;
}

const CARD_MOTIFS: Partial<Record<number, MotifId[]>> = {
  1: ["movement", "guidance"],
  2: ["guidance", "movement"],
  3: ["movement", "guidance"],
  4: ["stability"],
  5: ["stability", "guidance"],
  6: ["hidden", "pressure"],
  7: ["hidden", "pressure", "choice"],
  8: ["pressure", "hidden"],
  9: ["guidance", "warmth"],
  10: ["pressure", "choice"],
  11: ["pressure", "communication"],
  12: ["hidden", "communication", "pressure"],
  13: ["movement", "warmth"],
  14: ["pressure", "hidden"],
  15: ["power", "stability"],
  16: ["guidance"],
  17: ["movement", "guidance"],
  18: ["stability", "warmth"],
  19: ["pressure", "power"],
  20: ["movement", "communication"],
  21: ["pressure"],
  22: ["choice", "movement"],
  23: ["pressure", "hidden"],
  24: ["warmth", "guidance"],
  25: ["stability", "choice"],
  26: ["hidden", "guidance"],
  27: ["communication", "movement"],
  28: ["communication", "choice"],
  29: ["choice", "stability"],
  30: ["stability", "warmth"],
  31: ["guidance", "warmth"],
  32: ["hidden", "warmth"],
  33: ["guidance", "choice"],
  34: ["power", "movement"],
  35: ["stability", "power"],
  36: ["pressure", "stability"],
};

const POSITIVE_MOTIF_WEIGHT: Record<MotifId, number> = {
  guidance: 1.45,
  pressure: 0,
  hidden: 0.2,
  stability: 1.2,
  movement: 0.9,
  warmth: 1.1,
  choice: 0.7,
  power: 0.75,
  communication: 0.55,
};

const PRESSURE_MOTIF_WEIGHT: Record<MotifId, number> = {
  guidance: 0.1,
  pressure: 1.45,
  hidden: 1.1,
  stability: 0.25,
  movement: 0.2,
  warmth: 0.05,
  choice: 0.7,
  power: 0.45,
  communication: 0.55,
};

const MOTIF_LABELS: Record<MotifId, string> = {
  guidance: "guidance and openings",
  pressure: "pressure and weight",
  hidden: "hidden factors and uncertainty",
  stability: "stability and endurance",
  movement: "movement and change",
  warmth: "warmth and human feeling",
  choice: "decision pressure",
  power: "resources and leverage",
  communication: "communication and signal",
};

const PRACTICAL_SUBJECT_FRAMES: Record<SubjectId, string> = {
  general_reading: "a period where several threads are active at once, but only a few truly matter",
  love: "a relationship field where clarity, reciprocity, and steadiness matter more than force",
  work: "a work situation shaped by timing, systems, and the difference between strain and structure",
  money: "a money story about flow, pressure points, and what can genuinely stabilize",
  home_family: "a domestic field shaped by roles, emotional weather, and what the household can actually sustain",
  friends_social: "a social situation where trust, signaling, and group tone matter more than appearances",
  personal_growth: "an inward cycle where old patterns and truer self-definition are competing for the lead",
  health: "a wellbeing cycle where pacing, restoration, and what quietly drains the system matter most",
  pets: "a care rhythm shaped by comfort, routine, and what helps the animal settle safely",
  creative: "a creative process balancing inspiration with what can truly be finished or lived",
  travel: "a journey shaped by timing, practical movement, and what remains uncertain until it is underway",
  education: "a learning path where focus, steady effort, and what still needs clarifying are all in play",
  spiritual: "an intuitive phase where signal and discernment matter more than dramatic certainty",
  community: "a wider-group story where belonging, visibility, and boundaries all have to be negotiated",
  legal_admin: "a formal process story where timing, documents, and what can be clearly evidenced matter",
  purpose_calling: "a vocation question where meaning, sustainability, and the right path are not identical things",
};

const OVERLAY_OVERRIDES: Record<string, string[]> = {
  "1-29": ["events beginning to move the moment your own stance becomes clear"],
  "33-2": ["a small opening with more help in it than it first appears"],
  "2-13": ["a small beginning with more promise in it than its size suggests"],
  "16-3": ["guidance in movement, especially when the destination is farther away than the first step"],
  "5-4": ["something meant to root deeply, especially around home, family, or foundations"],
  "5-20": ["social or public life feeding long-term growth more than first appearances suggest"],
  "35-6": ["stability that exists, but under fog"],
  "36-7": ["burden tangled up with complexity, mixed motives, or a situation that refuses to stay simple"],
  "7-23": ["complication feeding anxiety, attrition, or the slow damage done by what keeps slipping sideways"],
  "8-21": ["a stopped place made heavier by delay, distance, or the feeling of no easy passage"],
  "27-10": ["a sharp message, document, or decision that cuts directly to the point"],
  "11-12": ["nervous conversation caught in repetition, where talk can sharpen rather than settle the issue"],
  "7-12": ["mixed messages, gossip, or anxious conversation that can distort what is really happening"],
  "11-16": ["mental overactivity around hope, signs, or future plans"],
  "18-11": ["support under strain, where loyalty is real but the pattern is tiring"],
  "11-19": ["pressure moving through official structures, boundaries, or a system that keeps the tension in place"],
  "20-15": ["public power, visible influence, or a network shaped by hierarchy"],
  "24-31": ["warmth and feeling brought fully into the light"],
  "15-33": ["power or leverage finally revealing the answer point, and showing what can actually be unlocked"],
  "7-29": ["your own role caught inside complication, mixed motives, or a dynamic that needs clearer boundaries"],
  "13-29": ["your role meeting a newly forming situation, where what you do first matters more than what you promise later"],
  "30-29": ["a way of moving through events with calm, dignity, and restraint"],
  "31-33": ["clarity itself becoming the solution"],
  "32-34": ["emotion, livelihood, and value becoming tightly linked"],
  "25-35": ["commitment that can genuinely stabilize over time"],
  "26-36": ["a hidden burden or lesson not yet fully understood"],
  "29-28": ["your story being shaped by the other person's stance as much as by your own"],
  "28-29": ["the other person's role landing directly in your field and becoming impossible to ignore"],
  "29-2": ["your own stance standing much closer to the opening than it first seems"],
  "14-27": ["documents or messages needing a close reading before trust is given"],
  "21-20": ["public or social delay, where progress is slowed by the wider setting"],
};

const SUBJECT_OVERLAY_OVERRIDES: Partial<Record<SubjectId, Record<string, string[]>>> = {
  work: {
    "12-29": ["your role being shaped by meetings, status chatter, and too many unsettled discussions at once"],
    "13-29": ["your role meeting a small but usable reset, where the next practical move matters more than another abstract plan"],
    "16-29": ["clearer direction beginning to form around your role once the broader work pattern is named plainly"],
    "21-29": ["your role meeting blockage, delay, or a process that now has to be worked in stages instead of forced"],
    "28-29": ["your position and the other side's expectations becoming impossible to separate cleanly, so alignment matters more than assumption"],
  },
  personal_growth: {
    "1-29": ["movement beginning once your own stance is clear enough to act on instead of only reflecting"],
    "1-35": ["first movement backed by what can actually hold"],
    "5-29": ["your stance being asked to root more deeply through healing, patience, and repetition that actually changes the pattern"],
    "14-29": ["your own stance being shaped by self-protective strategy and the need to separate caution from distrust"],
    "14-27": ["messages or assumptions needing a closer reading before you trust them"],
    "20-29": ["your growth becoming visible in the social field, where other people start reflecting back what you can no longer keep private"],
    "21-29": ["the blockage landing personally, so steadiness and sequencing matter more than forcing progress"],
    "24-31": ["what genuinely matters coming fully into view"],
    "22-29": ["the road changing once you make a real choice about who you are willing to be"],
    "29-32": ["your role and self-definition moving through changing emotional weather, visibility, and self-perception"],
    "29-33": ["your own clarity becoming the answer point that unlocks the next step in growth"],
    "29-35": ["your stance being tested for staying power, so growth depends on what can actually hold after the first surge of feeling"],
  },
  creative: {
    "9-29": ["a more encouraging response or smoother opening gathering around your creative process, provided it is used concretely"],
    "10-29": ["your creative process hitting a necessary cut, edit, or sharp correction that cannot stay deferred"],
    "14-29": ["your creative process getting shaped by overcontrol, defensive strategy, or craft that has become too guarded"],
    "16-29": ["the larger creative signal becoming clearer around your own work once the pattern is named plainly"],
    "17-29": ["the work beginning to improve once revision is made in the right order"],
    "20-29": ["your creative process becoming shaped by audience, community, or the visible field around the work"],
    "21-29": ["the block landing directly on the work, so sequencing matters more than force"],
    "23-29": ["your creative process being worn down by repeated drain, attrition, or the little losses that keep stealing momentum"],
    "24-29": ["the work becoming tied to what genuinely matters, so the process strengthens when it protects what is actually alive in it"],
    "28-29": ["your creative process becoming too entangled with audience, collaborator, or outside response to read from your side alone"],
    "29-30": ["the work asking for maturity, restraint, and a steadier hand instead of more noise or urgency"],
    "29-31": ["your own work becoming clearer, more visible, and easier to trust once traction and result signal start returning"],
    "29-32": ["your creative process moving through recognition cycles, visibility swings, and the emotional weather of being seen"],
    "29-33": ["your own creative clarity becoming the answer point that unlocks the next step in the work"],
    "29-35": ["the work being tested by what can genuinely hold as practice and sustainable output"],
  },
  travel: {
    "1-29": ["movement beginning once your own travel plans are clear enough to act on instead of only circling possibilities"],
    "2-13": ["a small opening or early-stage plan that helps only if it is used promptly and kept realistic"],
    "3-29": ["the trip starting to move again as a route change or transfer reshapes the next stage"],
    "6-29": ["your travel picture moving through uncertainty, shifting conditions, or information that is not yet stable"],
    "9-29": ["a smoother opening or more helpful handling gathering around your travel plans, provided it is used concretely"],
    "10-29": ["your travel plans hitting a sharp reroute, cut, or fast decision that has to be handled cleanly"],
    "17-29": ["your travel situation beginning to improve once the change is made in the right order"],
    "20-29": ["your travel picture becoming shaped by public logistics, crowds, or the wider field around the journey"],
    "21-29": ["the blockage landing directly on your travel plans, so resequencing matters more than force"],
    "22-29": ["the route choice now sitting squarely with you, so the trip changes when your decision does"],
    "26-33": ["hidden details or half-known information turning into usable travel clarity"],
    "28-29": ["your route and another person's timing becoming too linked to read separately"],
    "29-33": ["your own clarity becoming the answer point that unlocks the next travel step"],
    "29-35": ["your plans being tested by what can still hold once delay or stress hits"],
  },
  health: {
    "4-29": ["your wellbeing being shaped by routines, foundations, and the question of what actually helps you feel stable enough to recover"],
    "5-23": ["healing having to contend with repeated drain, so recovery depends on stopping the leak as much as adding support"],
    "5-29": ["your wellbeing being asked to root more deeply through healing, patience, and repetition that actually restores"],
    "8-29": ["your wellbeing moving through a pause, shutdown, or recovery phase that has to be honored before the next improvement helps"],
    "12-29": ["your wellbeing getting tangled in nervous activation, overprocessing, or a system that rarely settles fully"],
    "16-29": ["clearer guidance about recovery beginning to form once the larger pattern is named plainly"],
    "17-29": ["your wellbeing beginning to improve once change is made in the right order and at the right pace"],
    "18-29": ["steady support helping recovery hold long enough to see what is genuinely sustainable"],
    "23-29": ["your wellbeing being worn down by repeated drain, low-grade strain, or what keeps leaking energy without being named"],
    "24-29": ["your wellbeing becoming tied to what genuinely nourishes you, so recovery depends on protecting what is actually restorative"],
    "25-29": ["your wellbeing being shaped by recurring patterns or bodily agreements that now need conscious revision"],
    "28-29": ["your wellbeing getting entangled with someone else's expectations or mirror dynamics, so recovery depends on separating what is yours from what is not"],
    "29-31": ["your wellbeing becoming clearer and more supported once energy and signal start returning"],
    "29-32": ["your wellbeing moving through cycles, sensitivity, and changing internal weather that need to be tracked honestly"],
    "29-33": ["your own clarity about what genuinely helps becoming the answer point that unlocks the next step in recovery"],
    "29-34": ["your wellbeing responding once circulation, support, or practical movement starts flowing more cleanly"],
    "29-35": ["your wellbeing being tested by what can actually hold as routine, pacing, and staying power"],
  },
  home_family: {
    "4-29": ["your own place in the household becoming inseparable from questions of safety, home base, and what the family can actually hold"],
    "6-28": ["the other person's place in the household being obscured by uncertainty, mixed signals, or circumstances that make their true availability hard to read"],
    "6-29": ["your domestic role moving through uncertainty, unsettled conditions, or a stage where the household picture is still partly obscured"],
    "12-29": ["your role at home being shaped by anxious conversation, repeated check-ins, or the practical strain of too many unsettled discussions"],
    "13-29": ["your domestic role meeting something young, new, or still fragile enough to shape carefully"],
    "18-29": ["your role in the household being defined through loyalty, reliability, and the quiet labor of showing up consistently for others"],
    "20-29": ["your role inside the household being shaped by relatives, visitors, or the wider social field around home"],
    "29-28": ["your role inside the household being shaped by someone else's needs, position, or availability"],
    "30-29": ["meeting the domestic situation through calm, restraint, and mature boundaries"],
    "21-20": ["household progress slowed by social, public, or logistical factors around the family field"],
    "23-29": ["your place in the household worn down by repeated strain, small messes, or the kind of domestic erosion that builds because no one fully deals with it"],
    "25-29": ["your role at home being defined by commitments, routines, and the agreements that keep family life either stable or quietly overburdened"],
    "27-29": ["your role at home becoming clearer through messages, schedules, or practical information that cannot be ignored"],
    "27-28": ["the other person's place in the household becoming clearer through messages, plans, or practical details that make their position easier to understand"],
    "29-35": ["your role in the household being measured by steadiness, staying power, and whether the family can actually lean on what you are holding"],
    "29-33": ["your place in the household becoming the answer point, where clearer boundaries or decisions begin to unlock movement for everyone else too"],
  },
  love: {
    "6-28": ["the counterpart's signal arriving through uncertainty, delay, or mixed emotional weather that makes their true position harder to read cleanly"],
    "6-29": ["your own stance in the relationship moving through uncertainty, hesitation, or a phase where not everything can yet be trusted at face value"],
    "6-24": ["the heart moving through uncertainty, where affection is present but mixed signals or doubt keep it from feeling fully safe"],
    "6-25": ["commitment being tested by ambiguity, with promises present but their emotional reliability still hard to read clearly"],
    "11-28": ["the counterpart's stance surfacing through friction, chemistry, or a pattern that keeps demanding a response"],
    "11-12": ["conversation growing sharper or more reactive than the bond can comfortably hold unless both people slow the exchange down"],
    "12-28": ["the other person's availability filtered through nervous conversation, quick messages, and fluctuating tone"],
    "12-29": ["your side of the bond being shaped by anxious conversation, fast messages, or the strain of trying to speak clearly before you feel fully steady"],
    "12-24": ["the heart being carried through conversation, so reassurance, tone, and timing determine whether closeness grows or frays"],
    "12-25": ["commitment being worked out through repeated conversations, where the bond depends on whether talk leads to steadier terms or more looping uncertainty"],
    "12-27": ["messages becoming the main carrier of emotional tone, so what is written, delayed, or left unanswered matters as much as what is openly said"],
    "17-28": ["the counterpart beginning to move, update, or reveal whether the bond can grow in a healthier direction"],
    "19-28": ["the other person's signal arriving through distance, reserve, or conditions that keep the bond more formal than it wants to be"],
    "19-24": ["the heart taking on a more guarded shape, where feeling may be sincere but is being held behind reserve or self-protection"],
    "19-29": ["your role in the relationship taking on a more guarded or structured tone, where self-protection starts shaping what can be offered"],
    "23-28": ["the counterpart's role colored by doubt, small repeated hurts, or the slow erosion that happens when reassurance never fully lands"],
    "23-29": ["your own stance worn down by overthinking, small hurts, or the slow strain of never feeling fully reassured"],
    "24-25": ["love trying to take a stable form, where affection starts asking for continuity, reciprocity, and a bond that can hold in real life"],
    "24-27": ["the bond clarifying once feelings are spoken rather than left implied"],
    "24-28": ["the other person's role becoming more emotionally visible, where tenderness or care can no longer stay entirely implied"],
    "24-29": ["your position becoming more emotionally visible, whether through tenderness, longing, or clearer vulnerability"],
    "24-33": ["the heart arriving at an answer point, where clarity depends on whether feeling can become unmistakable rather than merely hoped for"],
    "25-28": ["the counterpart's side of commitment becoming the place where promises either deepen into reliability or reveal their limits"],
    "25-29": ["your side of commitment becoming the place where promises have to be lived, not just spoken aloud"],
    "25-27": ["the bond depending on clearer wording, where promises, definitions, or explicit terms begin to matter as much as emotion itself"],
    "25-33": ["commitment reaching the answer point, so the bond asks whether it can become clear, explicit, and strong enough to name what it is"],
    "25-35": ["the relationship leaning toward durability, where commitment matters most when it proves it can carry weight without becoming rigid"],
    "27-28": ["the counterpart's position becoming legible through messages, explicit wording, or the conversation that finally says what has only been implied"],
    "27-29": ["your own part in the bond becoming clearer through words, messages, or a conversation that finally names the emotional subtext directly"],
    "10-25": ["the bond meeting a decisive edge, where commitment must be redefined, cut cleaner, or asked to stand on truer terms"],
    "10-27": ["a message arriving with enough force to change the relationship atmosphere quickly, whether through clarity, boundary, or abrupt truth"],
    "29-35": ["your place in the relationship being tested for steadiness, reliability, and whether your presence actually feels safe to build around"],
    "29-30": ["your own role in the bond taking on a quieter, more mature shape, where dignity, patience, and emotional composure matter more than drama"],
    "28-30": ["the counterpart showing a quieter, more mature style of feeling, where calm consistency may reveal more than dramatic display"],
    "28-33": ["the other person's role becoming the answer point, where clarity arrives through what they reveal, choose, or finally make plain"],
  },
  legal_admin: {
    "1-2": ["the next notice or procedural step creating a small but usable opening if it is handled promptly and cleanly"],
    "1-29": ["movement beginning once your side of the matter is clear enough to file, answer, or consider carefully"],
    "2-5": ["a small but usable opening appearing inside a process that still has to move slowly and carefully"],
    "2-29": ["your side of the matter sitting inside a narrow but usable procedural opening"],
    "5-35": ["slow but usable procedural progress around what still holds"],
    "5-16": ["clearer process direction starting to help a slow process move in a usable way"],
    "6-6": ["uncertain facts sitting inside a process that is still not clear enough to trust at face value"],
    "6-14": ["defensive strategy tightening an already uncertain process"],
    "6-8": ["uncertain facts sitting inside a matter that is already drifting toward pause or closure"],
    "6-21": ["uncertain facts meeting real blockage or delay"],
    "6-23": ["uncertain facts getting further dragged down by preventable admin strain"],
    "7-23": ["mixed motives steadily worsening the admin strain instead of resolving it"],
    "7-19": ["formal structure getting tangled in strategy, pressure, or mixed motives"],
    "7-8": ["defensive strategy tightening around a matter already drifting toward pause or closure"],
    "7-27": ["paperwork or notices getting tangled in strategy or mixed motives, so what is stated, withheld, or framed too carefully matters as much as the raw facts"],
    "8-10": ["a paused or stalled matter colliding with a hard deadline or forced procedural cut"],
    "9-17": ["a more workable tone beginning once the process is resequenced and moved in the right order"],
    "9-15": ["a workable opening once authority or leverage is used cleanly and at the right point"],
    "10-4": ["a hard procedural cut colliding with fixed conditions or structural footing"],
    "11-7": ["repeat-request pressure feeding strategy, defensiveness, or mixed motives instead of helping the matter resolve"],
    "11-14": ["reactive communication getting tighter and less useful the more defensively the matter is handled"],
    "11-36": ["repeat-request pressure gathering around an obligation that cannot stay vague"],
    "12-26": ["reactive communication circling around information that is still under review"],
    "12-33": ["reactive communication crowding the approval point before the answer is actually usable"],
    "16-24": ["clearer process direction around what the file is actually trying to protect or establish"],
    "17-24": ["stage change beginning around what the file is actually trying to protect or establish"],
    "17-30": ["stage change beginning to hold once the matter is handled with steadier terms and clearer pacing"],
    "18-24": ["dependable support holding in place what the file is actually trying to protect or establish"],
    "16-35": ["clear process direction around what can still hold procedurally"],
    "24-9": ["a more workable tone beginning once the file's real stake is kept plainly in view"],
    "23-23": ["preventable admin strain steadily wearing the matter down"],
    "23-27": ["the record, filing, or written proof being worn down by clerical gaps, repeat requests, or preventable admin strain"],
    "15-31": ["authority or leverage becoming clearer and easier to use cleanly"],
    "3-29": ["your side of the matter moving into transfer, routing, or jurisdictional movement that changes how the process advances"],
    "4-7": ["fixed terms or structural footing getting tangled in strategy, mixed motives, or a response that needs much closer reading"],
    "4-29": ["your side of the matter being defined by fixed conditions, baseline obligations, or the structure the process rests on"],
    "5-31": ["slow procedural progress becoming more usable once the process is clearer and easier to read"],
    "5-24": ["slow procedural progress around what the file is actually trying to protect or establish"],
    "5-29": ["your side of the matter advancing only through patient follow-through and evidence that can hold over time"],
    "6-29": ["your side of the matter clouded by incomplete facts, pending review, or uncertainty that still needs clarification"],
    "1-16": ["movement beginning once the direction of the matter becomes clearer and the next instruction can actually be trusted"],
    "7-29": ["your side of the matter getting caught in layered process pressure, competing motives, or a file that needs cleaner boundaries"],
    "13-33": ["a small but usable opening appearing at the approval point, where the next step matters if it is handled cleanly"],
    "13-31": ["a small but usable opening becoming visible once the process is finally clear enough to consider"],
    "14-27": ["paperwork that needs careful reading because not every detail is as straightforward as it first looks"],
    "26-29": ["your side of the matter becoming tied to protected facts, pending review, or information that cannot yet be treated casually"],
    "27-10": ["a written decision or document that forces the matter forward quickly"],
    "27-29": ["your side of the matter becoming clearer through filings, notices, or a record that now has to be precise"],
    "27-33": ["the record reaching the clause, approval point, or decision that opens the next stage"],
    "28-29": ["your side of the matter and the other side's position now having to be read together, because timing and leverage sit across both"],
    "25-29": ["your side of the matter becoming tied to binding terms, renewals, or obligations that now define what continues"],
    "29-30": ["your side of the matter becoming more workable through measured handling and clearer terms"],
    "29-31": ["your side of the matter becoming clearer and easier to work with once the process is visible enough to consider"],
    "29-33": ["your own clarity becoming the hinge that opens the next stage cleanly"],
    "29-34": ["your side of the matter beginning to move once fees, access, or process flow are actually clearing"],
    "29-32": ["your side of the matter becoming more visible, so timing, presentation, and review cycles start affecting the outcome"],
    "29-35": ["your side of the matter being tested by deadlines, enforceability, and what can still hold procedurally"],
    "34-35": ["fees, access, or process flow settling into something that can actually hold procedurally"],
    "31-34": ["fees, access, or practical movement beginning to respond once the process becomes clearer"],
    "34-36": ["fees, access, or process flow becoming tied to a heavier obligation that cannot stay vague"],
    "35-6": ["an underlying structure that can hold, even if the process is still clouded"],
  },
  money: {
    "10-23": ["a necessary cutback or reset being driven by recurring drain, leakage, or small losses that can no longer be ignored"],
    "1-34": ["incoming news or a fast-moving development directly affecting the flow of money"],
    "1-29": ["your money picture starting to move because a real decision window or fresh information is finally in play"],
    "2-29": ["your own financial position standing close to a small but real opening, provided you use it cleanly"],
    "8-14": ["a financial reset being shaped by caution or defensive strategy"],
    "6-23": ["financial uncertainty thickening into worry, leakage, or the fear of not yet seeing the whole picture clearly"],
    "6-34": ["cashflow moving under fog, so income, spending, or timing feels harder to judge cleanly than the numbers alone suggest"],
    "6-35": ["financial stability still existing beneath uncertainty, even if it is currently obscured by unclear timing, confidence, or information gaps"],
    "3-18": ["support, trade, or a practical arrangement helping money move more reliably than it first seemed likely to"],
    "4-36": ["fixed costs, household obligations, or baseline responsibilities putting real weight on the budget floor"],
    "8-34": ["cashflow moving through a pause, contraction, or necessary ending before it can restart on healthier terms"],
    "8-29": ["your role inside a financial ending, pause, or necessary reset before the next phase can genuinely begin"],
    "10-29": ["a necessary cut or reset landing directly on your own financial choices and control"],
    "15-29": ["your financial position being shaped by budget control, stronger boundaries, and the need to take firmer command of resources"],
    "15-34": ["resources moving through control, stewardship, and the question of who actually holds the leverage"],
    "16-29": ["clearer financial direction beginning to form around your own choices"],
    "14-21": ["a cautious strategy running into real delay, where force would only make the blockage more expensive"],
    "21-29": ["your financial stance meeting delay, blockage, or a path that has to be worked in stages rather than forced"],
    "12-34": ["conversation, notices, or nervous attention wrapping directly around the flow of money, so signal and speculation need separating"],
    "23-29": ["your own money picture being worn down by recurring expenses, low-grade worry, or the slow loss created by untracked leakage"],
    "23-34": ["money flow being quietly reduced by recurring costs, small losses, or the kind of repeated drain that matters because it keeps returning"],
    "24-29": ["your financial choices coming back into line with what still feels worth backing, not just what looks safest on paper"],
    "25-29": ["your financial choices being tied to recurring obligations, payment cycles, or agreements that keep resetting the terms"],
    "25-34": ["cash movement becoming tied to obligations, subscriptions, debt cycles, or agreements that keep claiming a portion of the flow"],
    "27-29": ["your financial position becoming clearer through paperwork, statements, notices, or the written detail that turns vague worry into something concrete"],
    "27-31": ["paperwork, invoices, or statements coming into clear view"],
    "27-34": ["money becoming legible through paperwork, invoices, statements, or messages that show where value is truly moving"],
    "27-35": ["lasting security becoming easier to judge through paperwork, statements, or the documents that show what really holds"],
    "26-29": ["part of your money story still sitting off the page, where records, withheld details, or what has not yet been fully tallied matter more than appearances"],
    "29-34": ["your own financial role being defined by what is actually coming in, going out, and moving through your hands in real time"],
    "29-33": ["your own financial position becoming the answer point, where clearer priorities begin to unlock movement"],
    "29-32": ["your financial position moving through a visible cycle, where pattern matters more than one isolated moment"],
    "29-35": ["your own financial position being tested for staying power, consistency, and what can still hold after the first plan changes"],
    "33-34": ["an answer point emerging inside cashflow itself, where a clearer movement of resources starts revealing what can be fixed or unlocked"],
    "33-35": ["the solution beginning to take a more durable form, so what stabilizes now has a chance of lasting rather than only relieving pressure briefly"],
    "34-35": ["cashflow trying to find the form of stability that can actually last, rather than only looking secure for a moment"],
    "17-34": ["cashflow improving through better sequencing, smarter updates, or changes that help money move more cleanly"],
    "3-24": ["a change of direction shaped by what is still worth backing"],
  },
  purpose_calling: {
    "31-33": ["clarity revealing the part of the path that can actually open"],
    "26-36": ["a meaningful burden whose deeper lesson is still being uncovered"],
    "25-35": ["the form of commitment that could stabilize vocation over time"],
  },
};

const SHORT_CARD_SIGNALS: Partial<Record<number, string>> = {
  1: "incoming movement or news",
  2: "a small opening",
  3: "movement, distance, or transition",
  4: "stability and foundations",
  5: "slow growth and rooting",
  6: "fog and uncertainty",
  7: "complication or mixed motives",
  8: "closure, ending, or rest",
  9: "grace, goodwill, or invitation",
  10: "a sharp decision or cut",
  11: "repetition and tension",
  12: "nervous communication",
  13: "a small beginning",
  14: "caution and self-interest",
  15: "power or resource control",
  16: "guidance and signal",
  17: "constructive change",
  18: "reliable support",
  19: "structure, distance, or institution",
  20: "the public or social field",
  21: "obstacle or delay",
  22: "choice and branching paths",
  23: "erosion, worry, or leakage",
  24: "heart, value, or feeling",
  25: "commitment or repeating terms",
  26: "hidden knowledge or secrecy",
  27: "a message, record, or document",
  28: "the other person's stance",
  29: "your own stance",
  30: "maturity and restraint",
  31: "clarity and visible progress",
  32: "emotional weather or recognition",
  33: "a solution or unlock",
  34: "resources and flow",
  35: "stability and endurance",
  36: "burden and meaning",
};

const SUBJECT_CARD_SIGNALS: Partial<Record<SubjectId, Partial<Record<number, string>>>> = {
  home_family: {
    12: "family talk and household nerves",
    15: "support, authority, and who is carrying the household load",
    23: "recurring household drain",
    28: "the other person's influence on the household",
    29: "your role inside the household",
    30: "the wish for calm and mature boundaries",
    32: "the mood and emotional weather at home",
  },
  love: {
    28: "the counterpart's stance in the relationship",
    29: "how you are showing up in the relationship",
  },
  personal_growth: {
    1: "first movement",
    5: "healing and recovery",
    4: "inner foundation or base structure",
    12: "anxious inner talk",
    14: "defensive self-protection",
    17: "constructive inner change",
    20: "the visible social field",
    21: "inner blockage or resistance",
    22: "the decision point",
    23: "repeated inner drain",
    24: "what genuinely matters",
    29: "your own stance",
    32: "emotional weather and self-image",
    33: "the answer point",
    35: "what can hold",
  },
  creative: {
    6: "fog or uncertainty",
    7: "complication or mixed motives",
    9: "an encouraging response",
    11: "repetition and tension",
    14: "creative strategy and overcontrol",
    15: "power and resource control",
    16: "guidance and signal",
    17: "constructive change",
    20: "the visible creative field",
    21: "obstacle or delay",
    23: "erosion, worry, or leakage",
    24: "heart, value, or feeling",
    28: "the other person's field",
    29: "your own position",
    30: "maturity and restraint",
    31: "clarity and visible progress",
    32: "emotional weather or recognition",
    35: "what can hold",
  },
  travel: {
    1: "incoming movement or updates",
    3: "route and transit movement",
    6: "uncertain timing or changing conditions",
    10: "a reroute or clean cut",
    11: "repeat travel friction",
    17: "improvement or resequencing",
    19: "formal structure or checkpoints",
    20: "the public travel field",
    21: "delay or blockage",
    22: "the route choice",
    26: "hidden travel detail",
    27: "tickets and confirmations",
    28: "the other travel party",
    29: "your travel position",
    33: "the confirmation point",
    35: "what can still hold",
  },
  education: {
    8: "pause or deferral",
    9: "an encouraging response",
    5: "steady skill-building",
    6: "unclear requirements",
    13: "an early-stage effort",
    14: "study strategy and overcontrol",
    16: "the longer-view qualification signal",
    22: "the study-path choice",
    27: "applications and written requirements",
    28: "the evaluator or outside expectation",
    29: "your learning path",
    33: "the answer point",
    34: "resources and workload flow",
    35: "what can still hold as study rhythm",
  },
  health: {
    4: "routines and foundations",
    5: "healing and recovery",
    8: "rest and necessary pause",
    12: "nervous activation",
    14: "discernment versus hypervigilance",
    16: "the longer-view signal",
    17: "recovery movement",
    18: "steady support",
    23: "depletion and repeated drain",
    24: "what genuinely nourishes you",
    25: "recurring bodily patterns or agreements",
    28: "mirror dynamics and outside expectations",
    29: "your wellbeing",
    30: "rest and regulation",
    31: "returning energy and signal",
    32: "cycles and sensitivity",
    33: "what actually helps",
    34: "circulation and practical support",
    35: "what can actually hold",
  },
  legal_admin: {
    1: "incoming notices or procedural movement",
    3: "routing or jurisdictional movement",
    4: "fixed conditions or structural footing",
    5: "slow procedural progress",
    6: "uncertain facts or incomplete review",
    8: "procedural closure or file pause",
    9: "a workable opening in tone or handling",
    16: "clear process direction",
    17: "stage change or procedural improvement",
    28: "the other side's position",
    14: "defensive strategy or close procedural reading",
    26: "withheld or specialist information",
    27: "the record, filing, or written proof",
    29: "your side of the matter",
    30: "measured handling or settled terms",
    32: "visibility and review cycle",
    33: "the answer point or approval",
    34: "fees, access, or process flow",
    15: "authority or leverage",
    35: "what can still hold procedurally",
  },
  money: {
    6: "financial fog or unclear timing",
    8: "a financial reset or contraction",
    10: "a necessary cutback, reset, or hard financial decision",
    15: "budget pressure and leverage",
    23: "leakage and recurring drain",
    24: "what still feels worth backing",
    25: "recurring obligations and terms",
    27: "paperwork, invoices, or statements",
    29: "your financial position",
    33: "the answer point in the numbers",
    34: "cashflow itself",
    35: "what can genuinely hold",
  },
  purpose_calling: {
    29: "your stance toward the path",
    35: "what can be sustained in vocation",
    36: "the burden of calling",
  },
};

const SHORT_HOUSE_SIGNALS: Partial<Record<number, string>> = {
  2: "a small opening",
  5: "slow growth",
  6: "fog or uncertainty",
  8: "closure",
  12: "communication and nerves",
  13: "a newly forming situation",
  17: "improvement or movement",
  18: "support and loyalty",
  20: "the public field",
  23: "erosion and stress",
  25: "commitment",
  26: "what is hidden",
  27: "documents and messages",
  28: "the other person's field",
  29: "your own field",
  31: "clarity and success",
  33: "the answer point",
  35: "endurance",
  36: "the meaningful burden",
};

const SUBJECT_HOUSE_SIGNALS: Partial<Record<SubjectId, Partial<Record<number, string>>>> = {
  home_family: {
    2: "a brief easing in the household",
    14: "protective caution at home",
    32: "the emotional weather at home",
    28: "the other person's role in the household",
    29: "your own place in the household",
  },
  love: {
    28: "the counterpart's field",
    29: "your side of the relationship",
  },
  personal_growth: {
    1: "incoming momentum",
    4: "inner foundation or base structure",
    5: "healing and rooted growth",
    7: "layered motives and self-protective strategy",
    11: "the repeating inner loop",
    14: "self-protective caution",
    15: "power, stewardship, and how strength is carried",
    20: "the visible social field",
    21: "inner blockage or resistance",
    22: "the decision point",
    29: "your own field",
    32: "emotional weather and self-image",
    16: "guidance and long-range signal",
    33: "the answer point",
    35: "what can hold",
  },
  creative: {
    6: "unclear direction",
    7: "creative complication",
    9: "an encouraging response",
    11: "repeated friction",
    14: "creative strategy",
    15: "power and stewardship",
    16: "the longer-view signal",
    17: "constructive change",
    20: "the public creative field",
    21: "blockage",
    23: "drain",
    24: "what genuinely matters",
    28: "the audience or other side",
    29: "your own creative field",
    30: "craft maturity",
    31: "visible traction",
    32: "recognition cycle",
    35: "what can still hold",
  },
  travel: {
    1: "incoming momentum",
    2: "a small timing window",
    3: "the route itself",
    6: "uncertain timing",
    10: "a reroute or sharp cut",
    11: "repeat transit friction",
    17: "improvement or resequencing",
    19: "formal travel structure",
    20: "public logistics and crowds",
    21: "delay or route blockage",
    22: "the itinerary fork",
    26: "hidden booking detail",
    27: "tickets and confirmations",
    28: "the other travel party",
    29: "your own travel field",
    33: "the confirmation point",
    35: "what can still hold",
  },
  education: {
    8: "pause or deferral",
    9: "an encouraging response",
    5: "steady skill-building",
    6: "unclear requirements",
    13: "an early-stage effort",
    14: "study strategy",
    20: "the visible academic field",
    22: "the study-path choice",
    28: "the evaluator's field",
    29: "your own learning field",
    33: "the answer point",
    34: "resources and workload flow",
    35: "what can still hold as study rhythm",
  },
  health: {
    1: "first movement",
    4: "routines and foundations",
    5: "recovery and rooted repair",
    6: "uncertainty around what the body is saying",
    8: "rest or necessary pause",
    11: "the repeating strain pattern",
    12: "nervous activation",
    14: "discernment and overmanagement",
    18: "steady support",
    17: "improvement or recovery movement",
    20: "the visible social field around recovery",
    21: "blockage or slower passage",
    23: "repeated drain",
    24: "what genuinely nourishes you",
    25: "recurring patterns or bodily agreements",
    28: "mirror dynamics and outside expectations",
    29: "your body's direct experience",
    30: "rest and regulation",
    31: "clearer energy and signal",
    32: "cycles and sensitivity",
    33: "the answer point",
    34: "circulation and practical support",
    35: "what can hold",
  },
  legal_admin: {
    1: "incoming notices or procedural movement",
    3: "routing or jurisdictional movement",
    8: "procedural closure or file pause",
    9: "a workable opening in tone or handling",
    5: "slow procedural progress",
    6: "uncertain facts or incomplete review",
    7: "strategic pressure or mixed motives",
    4: "fixed conditions or structural footing",
    12: "follow-up loops or procedural noise",
    16: "clear process direction",
    17: "stage change or procedural improvement",
    26: "sealed information and pending review",
    27: "records, paperwork, and what can be proven",
    29: "your own documented position",
    30: "measured handling or settled terms",
    32: "visibility and review cycle",
    33: "the answer, approval, or unlock point",
    34: "fees, access, or process flow",
    15: "authority or leverage",
    35: "what can still hold procedurally",
  },
  money: {
    6: "financial uncertainty",
    8: "reset or contraction",
    10: "a necessary cutback or hard choice",
    15: "budget pressure and leverage",
    23: "repeated drain",
    24: "what still feels worth backing",
    25: "recurring obligations",
    27: "paperwork and statements",
    29: "your own financial field",
    33: "the fix or answer point",
    34: "cashflow itself",
    35: "lasting stability",
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

function distanceWeight(placement: CardPlacement, focusPosition: number, gtLayout: GTLayout): number {
  if (placement.zone === "cartouche") {
    return 1.7;
  }

  if (placement.position === focusPosition) {
    return 4.8;
  }

  const focus = getGTCoord(focusPosition, gtLayout);
  const current = getGTCoord(placement.position, gtLayout);
  if (!focus || !current) return 1;

  const chebyshev = Math.max(Math.abs(focus.row - current.row), Math.abs(focus.col - current.col));
  if (chebyshev === 1) return 3.3;
  if (focus.row === current.row || focus.col === current.col) return 2.2;

  const diagonalA = new Set(getDiagonalLine(focusPosition, "nwse", gtLayout));
  const diagonalB = new Set(getDiagonalLine(focusPosition, "nesw", gtLayout));
  if (diagonalA.has(placement.position) || diagonalB.has(placement.position)) {
    return 2;
  }

  return 1.15;
}

function motifsForPlacement(placement: CardPlacement): MotifId[] {
  const cardMotifs = CARD_MOTIFS[placement.cardId] ?? [];
  const houseMotifs = CARD_MOTIFS[placement.houseId] ?? [];
  return [...cardMotifs, ...houseMotifs];
}

function describePlacementSignal(
  placement: CardPlacement,
  subjectId: SubjectId,
  domain: Domain,
  random: () => number,
): string {
  const card = getCardMeaning(placement.cardId);
  const house = getHouseMeaning(placement.houseId);
  const subjectOverride = SUBJECT_OVERLAY_OVERRIDES[subjectId]?.[sortedPairKey(card.id, house.id)];
  if (subjectOverride?.length) {
    return `${card.name} in ${house.name} suggests ${choose(subjectOverride, random)}`;
  }

  const override = OVERLAY_OVERRIDES[sortedPairKey(card.id, house.id)];
  if (override?.length) {
    return `${card.name} in ${house.name} suggests ${choose(override, random)}`;
  }

  const cardPhrase =
    SUBJECT_CARD_SIGNALS[subjectId]?.[card.id] ??
    SHORT_CARD_SIGNALS[card.id] ??
    lowerFirst(card.keywords.slice(0, 2).join(" and "));
  const housePhrase =
    SUBJECT_HOUSE_SIGNALS[subjectId]?.[house.id] ??
    SHORT_HOUSE_SIGNALS[house.id] ??
    lowerFirst(house.shortFocus);

  if (cardPhrase === housePhrase || cardPhrase.startsWith(housePhrase) || housePhrase.startsWith(cardPhrase)) {
    return choose(
      [
        `${card.name} in ${house.name} suggests ${cardPhrase} concentrated at the center`,
        `${card.name} in ${house.name} points to ${cardPhrase} as a dominant thread`,
        `${card.name} in ${house.name} deepens the signal around ${cardPhrase}`,
      ],
      random,
    );
  }

  return choose(
    [
      `${card.name} in ${house.name} suggests ${cardPhrase} moving through ${housePhrase}`,
      `${card.name} in ${house.name} points to ${cardPhrase} inside ${housePhrase}`,
      `${card.name} in ${house.name} puts ${cardPhrase} under the influence of ${housePhrase}`,
    ],
    random,
  );
}

function signalLead(input: string): string {
  const match = input.match(/^[A-Za-z][A-Za-z0-9' -]* in [A-Za-z][A-Za-z0-9' -]* House/);
  return match?.[0] ?? input;
}

function signalSummary(input: string): string {
  return lowerFirst(
    clause(input)
      .replace(/^[A-Za-z][A-Za-z0-9' -]* in [A-Za-z][A-Za-z0-9' -]* House\s+(suggests|points to|puts)\s+/i, "")
      .replace(/\s+under the influence of\s+/i, " under ")
      .replace(/\s+moving through\s+/i, " moving through ")
      .replace(/\s+inside\s+/i, " in ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function replaceContextualPhrase(
  input: string,
  pattern: RegExp,
  replacements: Record<string, string>,
): string {
  return input.replace(pattern, (full, context: string) => {
    const replacement = replacements[context.toLowerCase().trim()];
    return replacement ?? full;
  });
}

function rewriteSocialFragmentResiduals(input: string, subjectId: "community" | "friends_social"): string {
  let rewritten = input;

  const replacements: Array<[RegExp, string]> = [
    [/\bhouse house\b/gi, "house"],
    [/clarity and visible progress/gi, subjectId === "community" ? "clearer traction others can actually see and respond to" : "clearer social movement people can actually see and trust"],
    [/clarity and success/gi, subjectId === "community" ? "clearer visibility and momentum" : "clearer social momentum"],
    [/communication and nerves/gi, "anxious talk, crossed signals, or too much reactive discussion"],
    [/erosion and stress/gi, "repeated strain and attrition"],
    [/grace, goodwill, or invitation/gi, subjectId === "community" ? "a warmer, more receptive group response" : "a warmer, more receptive social response"],
    [/\bresources and flow\b/gi, subjectId === "community" ? "reciprocity and usable support" : "reciprocity and practical exchange"],
    [/\bthe public or social field\b/gi, "the visible social field"],
    [/\bthe public field\b/gi, subjectId === "community" ? "the visible shared field" : "the visible social field"],
    [/\byour own field\b/gi, subjectId === "community" ? "your place in the wider field" : "your own social position"],
    [/\bthe meaningful burden\b/gi, subjectId === "community" ? "the part of the story already carrying real weight" : "the part of the social dynamic already carrying real weight"],
    [/\bthe answer point\b/gi, subjectId === "community" ? "the point where things start becoming clear enough to use" : "the point where things start becoming clear enough to act on"],
    [/incoming movement or news/gi, subjectId === "community" ? "fresh movement or response" : "new contact or movement"],
    [/movement, distance, or transition/gi, subjectId === "community" ? "movement or a shift in context" : "movement or a change in social context"],
    [/closure, ending, or rest/gi, subjectId === "community" ? "pause, ending, or withdrawal" : "pause, ending, or social withdrawal"],
    [/complication or mixed motives/gi, "mixed motives or layered complication"],
    [/caution and self-interest/gi, subjectId === "community" ? "defensive positioning or self-protection" : "defensiveness or self-protection"],
    [/obstacle or delay/gi, "delay or blockage"],
    [/structure, distance, or institution/gi, subjectId === "community" ? "fixed roles, gatekeeping, or formal structure" : "distance, fixed roles, or formal structure"],
    [/repetition and tension/gi, subjectId === "community" ? "repeated group friction" : "repeated social friction"],
    [/slow growth and rooting/gi, "slower trust and steadier belonging"],
    [/a newly forming situation/gi, subjectId === "community" ? "a new shared phase that is still taking shape" : "a new social situation still taking shape"],
    [/heart, value, or feeling/gi, subjectId === "community" ? "what genuinely matters in the group" : "what genuinely matters in the friendship"],
    [/power or resource control/gi, subjectId === "community" ? "leverage or stronger backing" : "clearer leverage or stronger backing"],
    [/guidance and signal/gi, "clearer direction"],
    [/values and love/gi, subjectId === "community" ? "what the group still genuinely values and holds in common" : "what genuinely matters in the friendship"],
  ];

  replacements.forEach(([pattern, replacement]) => {
    rewritten = rewritten.replace(pattern, replacement);
  });

  return rewritten;
}

function rewriteResidualSignalLabels(input: string, subjectId: SubjectId, kind: "opening" | "pressure"): string {
  let rewritten = input
    .replace(/\bvalues and love\b/gi, "what genuinely matters")
    .replace(/\brepetition and tension\b/gi, kind === "pressure" ? "repeated friction and pressure" : "a pattern that keeps replaying")
    .replace(/\bslow growth and rooting\b/gi, "slower, steadier growth")
    .replace(/\berosion and stress\b/gi, "repeated strain and attrition")
    .replace(/\bfog and uncertainty\b/gi, "uncertainty and mixed signals")
    .replace(/\bincoming movement or news\b/gi, "incoming movement or a concrete update")
    .replace(/\bcaution and self-interest\b/gi, "defensive caution and guarded self-interest")
    .replace(/\bgrace, goodwill, or invitation\b/gi, "warmth, goodwill, or a friendlier response")
    .replace(/\bclarity and success\b/gi, "clearer momentum")
    .replace(/\bclarity and visible progress\b/gi, "clearer visible progress")
    .replace(/\bcomplication or mixed motives\b/gi, "mixed motives")
    .replace(/\bcommunication and nerves\b/gi, "anxious talk and crossed signals")
    .replace(/\byour own field\b/gi, "your own position")
    .replace(/\bsupport and loyalty\b/gi, "reliable support")
    .replace(/\bpower or resource control\b/gi, "leverage or resource control")
    .replace(/\bguidance and signal\b/gi, "clearer direction")
    .replace(/\bmovement, distance, or transition\b/gi, "a shift in proximity or direction");

  rewritten = rewritten
    .replace(/^a small beginning in what genuinely matters$/i, "a small beginning around what genuinely matters")
    .replace(/^slower, steadier growth in what genuinely matters$/i, "slower, steadier growth in what genuinely matters most")
    .replace(/^slower, steadier growth around what genuinely matters$/i, "slower, steadier growth in what genuinely matters most")
    .replace(/^defensive caution and guarded self-interest moving through caution$/i, "defensive caution tightening the whole picture")
    .replace(/^mixed motives moving through choice$/i, "mixed motives complicating a decision that needs to be handled cleanly")
    .replace(/^endurance around maturity and restraint$/i, "steadier footing through maturity and restraint")
    .replace(/^warmth, goodwill, or a friendlier response under clearer momentum$/i, "a steadier, more workable tone as the picture clears")
    .replace(/^a more workable tone once the picture is clearer and momentum is easier to trust$/i, "a steadier, more workable tone as the picture clears")
    .replace(/^(.+) moving through anxious talk and crossed signals$/i, "$1 getting tangled in anxious talk and crossed signals")
    .replace(/^your own position under your own position$/i, "firmer ground under your own feet")
    .replace(/^your own position under your own field$/i, "firmer ground under your own feet")
    .replace(/^the other person's stance under repeated strain and attrition$/i, "the other person's stance being worn thin by repeated strain")
    .replace(/^the other person's stance under repetition$/i, "the other person's stance getting caught in the same repeating pattern")
    .replace(/^repeated friction and pressure in strategy$/i, "repeated friction getting locked in by defensive strategy")
    .replace(/^a small opening in incoming momentum$/i, "a small opening as momentum starts to build")
    .replace(/^maturity and restraint in what genuinely matters$/i, "steadier judgment around what genuinely matters")
    .replace(/^expansion around slower, steadier growth$/i, "slower, steadier settling")
    .replace(/^uncertainty and mixed signals under uncertainty and mixed signals$/i, "uncertainty feeding on itself and getting harder to read cleanly")
    .replace(/^anxious talk and crossed signals moving through uncertainty and mixed signals$/i, "uncertainty being amplified by anxious talk and crossed signals")
    .replace(/^uncertainty and mixed signals moving through fog or uncertainty$/i, "growing uncertainty in a picture that is still too unclear to trust")
    .replace(/^uncertainty and mixed signals in fog or uncertainty$/i, "uncertainty deepening because the picture is still too unclear to trust")
    .replace(/^uncertainty and mixed signals under fog or uncertainty$/i, "uncertainty feeding on itself until the picture gets harder to read cleanly")
    .replace(/^slower, steadier growth around incoming movement or a concrete update$/i, "slower, steadier progress once something concrete finally starts moving")
    .replace(/^slow growth around incoming movement or a concrete update$/i, "slower, steadier progress once something concrete finally starts moving")
    .replace(/^incoming movement or a concrete update in slow growth$/i, "something tangible beginning to move inside a slower rebuilding process")
    .replace(/^incoming movement or a concrete update in slower, steadier growth$/i, "something tangible beginning to move inside a slower rebuilding process")
    .replace(/^slow growth around warmth, goodwill, or a friendlier response$/i, "slower, steadier progress through a warmer, more receptive tone")
    .replace(/^incoming movement or a concrete update under slow growth$/i, "something tangible beginning to move")
    .replace(/^warmth, goodwill, or a friendlier response in slow growth$/i, "a warmer, more receptive tone as trust regrows slowly")
    .replace(/^distance or reserve in decisive cuts$/i, "distance or reserve hardening as a decision can no longer be put off")
    .replace(/^slower, steadier growth under your side of the relationship$/i, "slower, steadier growth in your part of the relationship")
    .replace(/^your side of the relationship around slower, steadier growth$/i, "slower, steadier growth in your part of the relationship")
    .replace(/^lasting stability around what still feels worth backing$/i, "what still feels worth backing as stability begins to return")
    .replace(/^anxious inner talk in repeated strain and attrition$/i, "anxious inner talk feeding on repeated strain and attrition")
    .replace(/^a small opening in endurance$/i, "a small opening in what could still hold")
    .replace(/^maturity around slower, steadier growth$/i, "maturity helping slower, steadier growth take hold")
    .replace(/^nervous communication in structure$/i, "anxious discussion getting trapped inside rigid structures or inherited expectations")
    .replace(/^slow procedural progress under stage change or procedural improvement$/i, "slow procedural progress as the process is corrected and starts moving again")
    .replace(/^healing and recovery in steady support$/i, "healing and recovery through support that actually holds")
    .replace(/^your role in the household and the ground you are standing on inside it$/i, "your role in the household and what is actually yours to hold inside it")
    .replace(/^your spiritual path finding a small but usable opening$/i, "a small but usable opening on your spiritual path")
    .replace(/^a small but usable opening beginning to appear in your spiritual path$/i, "a small but usable opening on your spiritual path")
    .replace(/^clearer visible progress in commitment$/i, "clearer progress in a commitment that can actually hold")
    .replace(/^your role in the household inside your own place in the household$/i, "your role in the household and what is actually yours to hold inside it")
    .replace(/^mixed motives under structure$/i, "mixed motives being reinforced by structure, fixed roles, or conditions that are too rigid")
    .replace(/^your learning path under stability$/i, "steadier footing on your learning path")
    .replace(/^your learning path with steadier footing$/i, "steadier footing on your learning path")
    .replace(/^a small opening in what genuinely matters$/i, "a small opening around what genuinely matters");

  if (subjectId === "pets") {
    rewritten = rewritten.replace(/^slower, steadier growth$/i, "slower, steadier settling");
  }

  return rewritten;
}

function rewriteFriendsSocialOpeningResiduals(input: string): string {
  let rewritten = input;

  rewritten = replaceContextualPhrase(
    rewritten,
    /^your own position (?:in|under|finding room through|moving through) ([a-z ,'-]+)$/i,
    {
      "choice": "your own social position reaching a decision point that needs conscious handling",
      "clarity and success": "clearer momentum beginning to gather around your own social position",
      "endurance": "steadier staying power gathering around your own social position",
      "expansion": "a little more freedom beginning to gather around your own social position",
      "guidance": "clearer direction beginning to gather around your own social position",
      "improvement or movement": "your own social position beginning to move into a healthier pattern",
      "maturity": "steadier social judgment gathering around your own position",
      "power": "your own social position gaining firmer ground through clearer leverage and stronger backing",
      "resource flow": "cleaner reciprocity and exchange gathering around your own social position",
      "slow growth": "slower trust and steadier belonging gathering around your own social position",
      "stability": "steadier footing gathering around your own social position",
      "support and loyalty": "steadier support gathering around your own social position",
      "the answer point": "your own social position becoming the clearest answer you can actually work from",
      "your own field": "your own social position becoming the clearest ground you can actually work from",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^heart, value, or feeling (?:in|under) ([a-z ,'-]+)$/i,
    {
      "endurance": "what genuinely matters finding steadier ground to hold over time",
      "grace": "what genuinely matters being met with more warmth, goodwill, or receptivity",
      "incoming momentum": "what genuinely matters starting to move as the social field finally shifts",
      "improvement or movement": "what genuinely matters starting to move in a healthier direction",
      "maturity": "what genuinely matters becoming clearer through maturity and restraint",
      "power": "what genuinely matters gaining firmer ground through clearer social backing",
      "slow growth": "what genuinely matters being asked to regrow slowly and steadily",
      "support and loyalty": "what genuinely matters becoming clearer through the ties that actually hold",
      "values and love": "what genuinely matters becoming harder to ignore at the center of the friendship",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^guidance and signal (?:in|under) ([a-z ,'-]+)$/i,
    {
      "incoming momentum": "clearer direction beginning to show as new movement finally starts",
      "improvement or movement": "clearer direction beginning to hold as the social dynamic starts improving",
      "slow growth": "clearer direction beginning to hold as trust regrows more slowly and steadily",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^clarity and success around ([a-z ,'-]+)$/i,
    {
      "choice and branching paths": "clearer momentum becoming possible once a decision is handled cleanly",
      "grace, goodwill, or invitation": "clearer momentum gathering through warmth, goodwill, or a more receptive social response",
      "hidden knowledge or secrecy": "clearer momentum becoming possible once what is hidden can be read more honestly",
      "maturity and restraint": "clearer momentum gathering through maturity, restraint, and steadier social judgment",
      "resources and flow": "clearer momentum gathering once reciprocity and exchange start moving more cleanly",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^clarity and visible progress (?:in|under) ([a-z ,'-]+)$/i,
    {
      "endurance": "clearer progress becoming visible in what can actually hold over time",
      "expansion": "clearer movement becoming visible as the social field opens up",
      "grace": "clearer progress becoming visible through warmth, goodwill, or receptivity",
      "improvement or movement": "clearer social movement becoming visible as the dynamic starts improving",
      "incoming momentum": "clearer progress becoming visible as new movement finally takes hold",
      "maturity": "clearer progress becoming visible through maturity and restraint",
      "slow growth": "clearer progress becoming visible as trust regrows slowly and steadily",
      "support and loyalty": "clearer progress becoming visible through the support that is actually dependable",
      "your own field": "clearer movement becoming visible once your own social position is easier to read",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^constructive change (?:in|under|around) ([a-z ,'-]+)$/i,
    {
      "clarity and success": "constructive change beginning to gather once the social picture is clearer and easier to trust",
      "grace": "constructive change becoming easier through warmth, goodwill, or receptivity",
      "guidance": "constructive change becoming easier once the direction is clearer",
      "improvement or movement": "constructive change beginning as the social dynamic starts improving",
      "incoming momentum": "constructive change beginning as new movement finally starts",
      "support and loyalty": "constructive change beginning through ties that are actually dependable",
      "the public field": "constructive change becoming visible once the social dynamic is out in the open",
      "values and love": "constructive change gathering around what genuinely matters in the friendship",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^incoming movement or news (?:in|under) ([a-z ,'-]+)$/i,
    {
      "a newly forming situation": "new contact or movement beginning to matter because something socially new is already taking shape",
      "clarity and success": "new contact or movement beginning to matter once the social picture is clearer and easier to trust",
      "endurance": "new contact or movement beginning to matter in what can actually hold over time",
      "grace": "new contact or movement arriving through a warmer or more receptive social tone",
      "incoming momentum": "new contact or movement beginning to build on itself",
      "slow growth": "new contact or movement beginning to matter as trust regrows more slowly and steadily",
      "the answer point": "new contact or movement beginning to matter once the answer is clear enough to act on",
      "values and love": "new contact or movement gathering around what genuinely matters in the friendship",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^movement, distance, or transition (?:in|under) ([a-z ,'-]+)$/i,
    {
      "clarity and success": "movement beginning once the social picture is clearer and easier to trust",
      "improvement or movement": "movement beginning because the social dynamic is already starting to improve",
      "slow growth": "movement beginning as trust regrows more slowly and steadily",
      "support and loyalty": "movement beginning through ties that are actually dependable",
      "values and love": "movement beginning around what genuinely matters in the friendship",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^reliable support (?:in|under) ([a-z ,'-]+)$/i,
    {
      "clarity and success": "reliable support becoming more usable as the social picture gets clearer",
      "improvement or movement": "reliable support gathering as the social dynamic starts improving",
      "incoming momentum": "reliable support beginning to matter as movement finally starts",
      "support and loyalty": "reliable support proving itself through the ties that actually hold",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^support and loyalty around ([a-z ,'-]+)$/i,
    {
      "heart, value, or feeling": "steadier support gathering around what genuinely matters in the friendship",
      "incoming movement or news": "steadier support gathering around new contact or movement already underway",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^values and love around ([a-z ,'-]+)$/i,
    {
      "a small opening": "what genuinely matters finding room through a small opening that can still be used well",
      "a solution or unlock": "what genuinely matters gathering around a workable answer or way through",
      "constructive change": "what genuinely matters gathering around constructive social change",
      "power or resource control": "what genuinely matters becoming clearer around leverage, stronger backing, and who is carrying real weight",
      "reliable support": "what genuinely matters becoming clearer through the support that is actually dependable",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^maturity(?: and restraint)? (?:in|under|around) ([a-z ,'-]+)$/i,
    {
      "a newly forming situation": "maturity and restraint helping a new social beginning take better shape",
      "clarity and success": "maturity and restraint helping clearer progress hold",
      "documents and messages": "maturity and restraint helping communication stay clear and usable",
      "grace": "maturity and restraint helping warmth or goodwill land cleanly",
      "grace, goodwill, or invitation": "maturity and restraint helping warmth or goodwill land cleanly",
      "heart, value, or feeling": "maturity and restraint helping what genuinely matters come through more cleanly",
      "maturity": "maturity and restraint beginning to steady the social field",
      "resources and flow": "maturity and restraint helping reciprocity and exchange stay balanced",
      "your own field": "maturity and restraint gathering around your own social position",
    },
  );

  return rewritten
    .replace(/^a newly forming situation around constructive change$/i, "a new social beginning gathering around constructive change")
    .replace(/^a newly forming situation around maturity and restraint$/i, "a new social beginning that benefits from maturity and restraint")
    .replace(/^a newly forming situation around slow growth and rooting$/i, "a new social beginning that still needs slower trust and steadier pacing")
    .replace(/^complication or mixed motives in commitment$/i, "mixed motives complicating a pattern, agreement, or repeated social dynamic that now needs clearer terms")
    .replace(/^incoming momentum around grace, goodwill, or invitation$/i, "movement beginning through a warmer opening or more receptive social response")
    .replace(/^a solution or unlock under values and love$/i, "a workable answer beginning to gather around what genuinely matters in the friendship")
    .replace(/^a solution or unlock in guidance$/i, "a workable answer beginning to emerge as the direction gets clearer")
    .replace(/^a solution or unlock in improvement or movement$/i, "a workable answer beginning to emerge as the social dynamic starts moving in a healthier direction")
    .replace(/^a solution or unlock under expansion$/i, "a workable answer beginning to show as the social field opens up")
    .replace(/^documents and messages under clarity and success$/i, "clearer communication, explicit wording, or something concrete beginning to help")
    .replace(/^clarity and success around a small beginning$/i, "a small new opening starting to become clearer and easier to trust")
    .replace(/^clarity and success around clarity and visible progress$/i, "clearer momentum building as progress becomes visible")
    .replace(/^clarity and success around slow growth and rooting$/i, "clearer momentum gathering as trust regrows slowly and steadily")
    .replace(/^clarity and visible progress under improvement or movement$/i, "clearer social movement becoming visible as the dynamic starts improving")
    .replace(/^endurance around a small beginning$/i, "a small new opening that could still hold if handled steadily")
    .replace(/^guidance around heart, value, or feeling$/i, "clearer direction gathering around what genuinely matters in the friendship")
    .replace(/^guidance around clarity and visible progress$/i, "clearer direction gathering around progress that is finally becoming visible")
    .replace(/^incoming movement or news in values and love$/i, "new contact or movement gathering around what genuinely matters in the friendship")
    .replace(/^movement, distance, or transition in the answer point$/i, "movement beginning once the answer is clear enough to act on socially")
    .replace(/^resource flow around your own position$/i, "cleaner reciprocity and exchange gathering around your own social position")
    .replace(/^resource flow around slow growth and rooting$/i, "cleaner reciprocity and exchange gathering around slower trust and steadier belonging")
    .replace(/^support and loyalty around reliable support$/i, "reliable support beginning to show itself more clearly")
    .replace(/^grace, goodwill, or invitation in values and love$/i, "warmth, goodwill, and a more receptive tone gathering around what genuinely matters")
    .replace(/^grace, goodwill, or invitation under maturity$/i, "warmth, goodwill, or a softer tone becoming easier to trust through maturity and steadier judgment")
    .replace(/^values and love around grace, goodwill, or invitation$/i, "what genuinely matters being met with more warmth, goodwill, or receptivity")
    .replace(/^values and love around stability and endurance$/i, "what genuinely matters finding steadier ground to hold")
    .replace(/^values and love around your own position$/i, "what genuinely matters gathering around your own social position")
    .replace(/^endurance around a small opening$/i, "a small opening that could still hold if handled steadily")
    .replace(/^endurance around clarity and visible progress$/i, "staying power gathering around progress that is finally becoming easier to trust")
    .replace(/^endurance around heart, value, or feeling$/i, "staying power gathering around what genuinely matters in the friendship")
    .replace(/^endurance around reliable support$/i, "staying power gathering through the support that is actually dependable")
    .replace(/^heart, value, or feeling under documents and messages$/i, "what genuinely matters being shaped by what is being said clearly, recorded, or made explicit")
    .replace(/^your own position in documents and messages$/i, "your own social position being shaped by what is being said clearly, recorded, or made explicit")
    .replace(/^caution and self-interest under what is hidden$/i, "defensive caution gathering around what is still private, obscured, or not fully known")
    .replace(/^emotional weather or recognition in fog or uncertainty$/i, "social visibility and emotional tone becoming harder to read because the picture is still unclear")
    .replace(/^emotional weather or recognition under fog or uncertainty$/i, "social visibility and emotional tone becoming harder to read because the picture is still unclear")
    .replace(/^erosion, worry, or leakage in the public field$/i, "social drain becoming harder to ignore once it is visible in the group field")
    .replace(/^power or resource control under values and love$/i, "clearer leverage and stronger backing gathering around what genuinely matters in the friendship")
    .replace(/^a small opening around reliable support$/i, "a small opening through support that is actually dependable")
    .replace(/^improvement or movement around constructive change$/i, "constructive social change beginning to gather real movement")
    .replace(/^mixed motives steadily worsening the strain, anxiety, and social wear already in the field$/i, "mixed motives steadily worsening a social dynamic already under strain")
    .replace(/^reliable support gathering around what genuinely matters in the friendship$/i, "reliable support beginning to gather around what genuinely matters in the friendship")
    .replace(/^obstacle or delay under repetition$/i, "a stalled social pattern that keeps replaying instead of resolving")
    .replace(/^nervous conversation caught in repetition, where talk can sharpen rather than settle the issue$/i, "conversation getting stuck in the same loop, where talking is starting to sharpen the problem instead of settling it")
    .replace(/^your own field around your own position$/i, "your own social position becoming the clearest ground you can actually work from")
    .replace(/^a new social beginning where first actions matter more than promises$/i, "a newer social opening where first actions matter more than promises")
    .replace(/^nervous communication moving through what is hidden$/i, "anxious talk gathering around what is still private, unspoken, or not yet clear")
    .replace(/^power around heart, value, or feeling$/i, "clearer leverage gathering around what genuinely matters in the friendship")
    .replace(/^social uncertainty being amplified by anxious talk, crossed signals, or too much chatter$/i, "social uncertainty thickening because too much chatter and crossed signals keep muddying the picture")
    .replace(/^your own field around movement, distance, or transition$/i, "your own social position moving into a different context or pattern")
    .replace(/^the public or social field moving through communication and nerves$/i, "the visible social field getting pulled through too much chatter, nerves, or crossed signals")
    .replace(/^the public or social field moving through fog or uncertainty$/i, "the visible social field getting pulled into mixed signals, ambiguity, or too little clarity")
    .replace(/^slow growth around reliable support$/i, "slower trust beginning to regrow through the support that is actually dependable")
    .replace(/^clarity and visible progress(?: (?:around|in|under) [a-z ,'-]+)?$/i, "clearer social movement becoming visible in ways people can actually trust")
    .replace(/^clarity and success(?: (?:around|in|under) [a-z ,'-]+)?$/i, "clearer social momentum that is easier to trust")
    .replace(/^(?:grace|grace, goodwill, or invitation)(?: (?:around|in|under) [a-z ,'-]+)?$/i, "a warmer, more receptive social response")
    .replace(/^endurance around grace, goodwill, or invitation$/i, "staying power gathering around a warmer, more receptive social response")
    .replace(/^endurance\b/i, "social staying power and what the friendship can actually hold")
    .replace(/^a solution or unlock\b/i, "a workable answer beginning to show in the social picture")
    .replace(/^choice and branching paths\b/i, "a real social fork or decision that needs conscious handling")
    .replace(/^your own position\b/i, "your own social position");
}

function rewriteFriendsSocialPressureResiduals(input: string): string {
  let rewritten = input;

  rewritten = replaceContextualPhrase(
    rewritten,
    /^a sharp decision or cut (?:moving through|under) ([a-z ,'-]+)$/i,
    {
      "caution": "a necessary social cut being made harder by defensiveness, guardedness, or overcareful handling",
      "closure": "a necessary social cut arriving as a pause, ending, or withdrawal becomes unavoidable",
      "decisive cuts": "a necessary social cut being sharpened by another decision that can no longer stay deferred",
      "erosion and stress": "a necessary social cut landing in a dynamic already worn down by repeated strain",
      "fog or uncertainty": "a necessary social cut being made harder by uncertainty, mixed signals, or too little clarity",
      "obstruction": "a necessary social cut running into blockage, distance, or a dynamic that still will not move cleanly",
      "repetition": "a necessary social cut landing in a pattern that keeps replaying instead of resolving",
      "strategy": "a necessary social cut being shaped by guarded strategy, overmanagement, or self-protective positioning",
      "structure": "a necessary social cut running into rigid roles, fixed expectations, or a structure that is hard to shift",
      "communication and nerves": "a necessary social cut being complicated by anxious talk, crossed signals, or too much chatter",
      "the meaningful burden": "a necessary social cut landing inside a friendship or group tension that already carries real weight",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^burden and meaning (?:in|moving through|under) ([a-z ,'-]+)$/i,
    {
      "caution": "a weighty social issue being tightened further by defensiveness or guarded handling",
      "closure": "a weighty social issue gathering around a pause, ending, or quiet withdrawal",
      "communication and nerves": "a weighty social issue being made noisier by anxious talk, crossed signals, or too much social overprocessing",
      "decisive cuts": "a weighty social issue being sharpened by decisions or boundaries that can no longer stay deferred",
      "erosion and stress": "a weighty social issue getting heavier because repeated strain is already wearing the dynamic down",
      "fog or uncertainty": "a weighty social issue being made harder to read by mixed signals or too little clarity",
      "obstruction": "a weighty social issue running into real blockage, distance, or delay",
      "repetition": "a weighty social issue getting trapped in the same pattern instead of resolving",
      "strategy": "a weighty social issue being managed too defensively or too strategically",
      "structure": "a weighty social issue being held in place by rigid roles, expectations, or structure",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^caution and self-interest (?:in|moving through|under) ([a-z ,'-]+)$/i,
    {
      "choice": "defensive caution tightening around a decision point that still has not been handled cleanly",
      "communication and nerves": "defensive caution feeding anxious talk, crossed signals, or too much social overprocessing",
      "erosion and stress": "defensive caution deepening a social dynamic already worn down by repeated strain",
      "fog or uncertainty": "defensive caution getting worse because too much in the social field still feels unclear",
      "obstruction": "defensive caution and guarded self-interest making an already blocked social dynamic even harder to move",
      "repetition": "defensive caution feeding a social pattern that keeps replaying",
      "resource flow": "defensive caution getting tangled in reciprocity, exchange, or the practical flow between people",
      "strategy": "defensive caution being reinforced by guarded strategy, overmanagement, or self-protective positioning",
      "structure": "defensive caution being held in place by fixed roles, rigid expectations, or a social structure that is hard to shift",
      "the meaningful burden": "defensive caution tightening around a friendship or group tension that already carries real weight",
      "the public field": "defensive caution getting amplified once the social dynamic is visible to the wider field",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^choice and branching paths (?:in|moving through|under) ([a-z ,'-]+)$/i,
    {
      "closure": "a decision point gathering around a pause, ending, or quiet social withdrawal that has not been handled cleanly",
      "communication and nerves": "decision pressure being made harder by anxious talk, crossed signals, or too many unsettled exchanges",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^closure, ending, or rest (?:in|moving through|under) ([a-z ,'-]+)$/i,
    {
      "communication and nerves": "a pause, ending, or withdrawal being complicated by anxious talk, crossed signals, or too much chatter",
      "caution": "a pause, ending, or withdrawal being made harder by defensiveness or guarded handling",
      "closure": "a pause, ending, or withdrawal gathering around something already cooling or closing down",
      "choice": "a pause, ending, or withdrawal gathering around a decision point that still is not cleanly handled",
      "decisive cuts": "a pause, ending, or withdrawal being sharpened by decisions or boundaries that can no longer stay deferred",
      "documents and messages": "a pause, ending, or withdrawal being carried through messages, records, or what is being said explicitly",
      "endurance": "a pause, ending, or withdrawal pressing on what can actually hold over time",
      "erosion and stress": "a pause, ending, or withdrawal forming inside a social dynamic already worn down by repeated strain",
      "fog or uncertainty": "a pause, ending, or withdrawal being made harder by mixed signals, ambiguity, or too little clarity",
      "repetition": "a pause, ending, or withdrawal getting trapped in the same social loop instead of finishing cleanly",
      "strategy": "a pause, ending, or withdrawal being prolonged by guarded strategy or overcareful handling",
      "the other person's field": "a pause, ending, or withdrawal gathering around the other person's side of the social dynamic",
      "recognition": "a pause, ending, or withdrawal shaping the social visibility and emotional tone around the friendship",
      "structure": "a pause, ending, or withdrawal being held in place by rigid roles, expectations, or structure",
      "the meaningful burden": "a pause, ending, or withdrawal gathering around a friendship or group tension that already carries real weight",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^complication or mixed motives (?:in|moving through|under) ([a-z ,'-]+)$/i,
    {
      "caution": "mixed motives being reinforced by defensiveness or guarded handling",
      "choice": "mixed motives complicating a decision point that cannot stay open forever",
      "closure": "mixed motives gathering around a pause, ending, or quiet withdrawal",
      "fog or uncertainty": "mixed motives being made harder to read because too much in the social field still feels unclear",
      "obstruction": "mixed motives running into blockage, distance, or a social dynamic that is not moving cleanly",
      "recognition": "mixed motives complicating how the social dynamic is being seen, mirrored, or talked about",
      "repetition": "mixed motives feeding a social pattern that keeps replaying",
      "resource flow": "mixed motives affecting reciprocity, exchange, or the practical give-and-take between people",
      "strategy": "mixed motives being reinforced by guarded strategy, overmanagement, or too much careful positioning",
      "structure": "mixed motives getting reinforced by group roles, social structure, or the way the dynamic is currently set up",
      "the meaningful burden": "mixed motives gathering around a friendship or group tension that already carries real weight",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^fog and uncertainty (?:in|moving through|under) ([a-z ,'-]+)$/i,
    {
      "caution": "social uncertainty being made worse by defensiveness, guardedness, or overcareful handling",
      "closure": "social uncertainty gathering around a pause, ending, or quiet withdrawal",
      "communication and nerves": "social uncertainty being amplified by anxious talk, crossed signals, or too much chatter",
      "erosion and stress": "social uncertainty getting thicker because repeated strain is already wearing the dynamic down",
      "fog or uncertainty": "social uncertainty feeding on itself until the picture gets harder to read cleanly",
      "obstruction": "social uncertainty gathering around blockage, distance, or a dynamic that still will not move cleanly",
      "repetition": "social uncertainty getting trapped in a pattern that keeps replaying instead of resolving",
      "strategy": "social uncertainty being intensified by guarded strategy, self-protective positioning, or too much management of the dynamic",
      "structure": "social uncertainty gathering inside rigid roles, fixed expectations, or a structure that is too hard to read cleanly",
      "the meaningful burden": "social uncertainty gathering around a friendship or group tension that already carries real weight",
      "the other person's field": "social uncertainty being amplified by the other person's unclear stance, motives, or availability",
      "what is hidden": "social uncertainty gathering around what is still private, unspoken, or not fully visible",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^nervous communication (?:in|moving through|under) ([a-z ,'-]+)$/i,
    {
      "commitment": "anxious talk gathering inside a social pattern, agreement, or repeated dynamic that needs clearer terms",
      "communication and nerves": "social chatter feeding on itself and making the signal harder to read",
      "caution": "anxious talk being tightened further by defensiveness or overcareful handling",
      "closure": "anxious talk gathering around a pause, ending, or quiet social withdrawal",
      "decisive cuts": "anxious talk flaring around a social decision or boundary that needs cleaner handling",
      "documents and messages": "anxious talk getting carried through messages, records, or what can be explicitly tracked",
      "erosion and stress": "anxious talk feeding a social dynamic already worn down by repeated strain",
      "fog or uncertainty": "anxious talk thickening an already unclear social picture",
      "obstruction": "anxious talk building around a blockage or delay that still has not been worked through",
      "resource flow": "anxious talk gathering around reciprocity, exchange, or the practical give-and-take between people",
      "recognition": "anxious talk shaping the social visibility and emotional tone around the friendship",
      "the answer point": "anxious talk crowding the very point where clarity is trying to emerge",
      "the meaningful burden": "anxious talk gathering around a friendship or group tension that already carries real weight",
      "the other person's field": "anxious talk being amplified by the other side of the social dynamic",
      "values and love": "anxious talk getting tangled in what genuinely matters in the friendship",
      "structure": "anxious talk getting trapped inside rigid roles, fixed expectations, or a structure that is too hard to read cleanly",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^structure, distance, or institution (?:in|moving through|under) ([a-z ,'-]+)$/i,
    {
      "caution": "distance, fixed roles, or formal social structure being made harder by defensiveness or guarded handling",
      "closure": "distance, fixed roles, or formal structure reinforcing a pause, ending, or quiet withdrawal",
      "communication and nerves": "distance, fixed roles, or formal social structure being made harder by anxious talk, crossed signals, or too much chatter",
      "decisive cuts": "distance, fixed roles, or formal structure sharpening a decision or boundary that already needs cleaner handling",
      "erosion and stress": "distance, fixed roles, or formal social structure being worn down by repeated strain",
      "fog or uncertainty": "distance, fixed roles, or formal structure being made harder to read by uncertainty or mixed signals",
      "the meaningful burden": "distance, fixed roles, or formal structure carrying even more weight because the social tension is already serious",
      "what is hidden": "distance, fixed roles, or formal structure gathering around what is still private or unspoken",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^your own position (?:in|moving through|under) ([a-z ,'-]+)$/i,
    {
      "caution": "your own social position becoming too defensive or overcareful in how it protects itself",
      "closure": "your own social position moving through a needed pause, ending, or quiet withdrawal",
      "communication and nerves": "your own social position being pulled through too much chatter, nerves, or crossed signals",
      "decisive cuts": "your own social position being shaped by decisions or boundaries that can no longer stay deferred",
      "erosion and stress": "your own social position being worn down by repeated strain and attrition",
      "fog or uncertainty": "your own social position being pulled through mixed signals, uncertainty, or too little clarity",
      "obstruction": "your own social position running into blockage, delay, or a social dynamic that still will not move cleanly",
      "repetition": "your own social position getting trapped in a pattern that keeps replaying",
      "structure": "your own social position getting pinned inside a structure, role, or expectation that is too rigid",
    },
  );

  return rewritten
    .replace(/^a sharp decision or cut in fog or uncertainty$/i, "a necessary social cut being made harder by uncertainty, mixed signals, or too little clarity")
    .replace(/^a sharp decision or cut in repetition$/i, "a necessary social cut landing in a pattern that keeps replaying instead of resolving")
    .replace(/^guidance and signal under closure$/i, "clarity being held back by a pause, ending, or social withdrawal that still has not been faced cleanly")
    .replace(/^fog and uncertainty in the answer point$/i, "social uncertainty crowding the very point where clarity is trying to emerge")
    .replace(/^repetition and tension moving through closure$/i, "repeating social friction gathering around a pause, ending, or quiet withdrawal")
    .replace(/^distance, structure, or formal boundaries being steadily worn down by repeated social strain$/i, "distance or formal boundaries being frayed by repeated social strain")
    .replace(/^caution and self-interest in caution$/i, "self-protective caution tightening the whole social picture")
    .replace(/^caution and self-interest under caution$/i, "self-protective caution tightening the whole social picture")
    .replace(/^closure, ending, or rest in commitment$/i, "a pause, ending, or withdrawal gathering around an agreement or repeating social pattern that now needs clearer terms")
    .replace(/^obstacle or delay in caution$/i, "delay or blockage being made heavier by defensiveness, guardedness, or overcareful handling")
    .replace(/^obstacle or delay in fog or uncertainty$/i, "delay or blockage being made harder by mixed signals, uncertainty, or too little clarity")
    .replace(/^obstacle or delay in structure$/i, "delay or blockage being held in place by rigid roles, expectations, or social structure")
    .replace(/^obstacle or delay in strategy$/i, "delay or blockage being worsened by guarded strategy, overmanagement, or too much careful positioning")
    .replace(/^obstacle or delay in the meaningful burden$/i, "delay or blockage gathering around a friendship or group tension that already carries real weight")
    .replace(/^obstacle or delay under fog or uncertainty$/i, "delay or blockage being made harder by mixed signals, uncertainty, or too little clarity")
    .replace(/^obstacle or delay under strategy$/i, "delay or blockage being worsened by guarded strategy, overmanagement, or too much careful positioning")
    .replace(/^obstacle or delay under structure$/i, "delay or blockage being held in place by rigid roles, expectations, or social structure")
    .replace(/^a sharp decision or cut\b/i, "a necessary social cut that now needs honest handling")
    .replace(/^nervous communication\b/i, "anxious social talk and too much reactive discussion");
}

function rewriteSpiritualOpeningResiduals(input: string): string {
  let rewritten = input;

  rewritten = replaceContextualPhrase(
    rewritten,
    /^your own position (?:in|under|around|moving through|finding room through) ([a-z ,'-]+)$/i,
    {
      "a small opening": "your spiritual path finding a small but usable opening",
      "choice": "your spiritual path reaching a choice that needs conscious discernment",
      "clarity and success": "your spiritual path becoming clearer and easier to trust",
      "endurance": "your spiritual path being tested by what it can genuinely sustain",
      "expansion": "your spiritual path getting more room to open and breathe",
      "grace": "your spiritual path being met with a gentler, more encouraging response",
      "guidance": "clearer guidance gathering around your spiritual path",
      "improvement or movement": "your spiritual path starting to move cleanly again",
      "maturity": "your spiritual path asking for maturity, restraint, and steadier practice",
      "power": "your spiritual path gaining firmer conviction and steadier footing",
      "resource flow": "usable support and steadier flow gathering around your spiritual path",
      "slow growth": "your spiritual path asking for slower, steadier growth",
      "stability": "steadier footing gathering around your spiritual path",
      "structural stability": "steadier footing and firmer ground gathering around your spiritual path",
      "support and loyalty": "steadier support gathering around your spiritual path",
      "the answer point": "your spiritual path arriving where the next answer can actually be used",
      "the public field": "your spiritual path becoming more visible in the wider field",
      "your own field": "your spiritual path becoming the clearest place to begin from",
      "values and love": "your spiritual path being pulled back toward what feels deeply true",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^(?:support and loyalty|reliable support) around ([a-z ,'-]+)$/i,
    {
      "your own position": "steadier support gathering around your spiritual path",
      "grace, goodwill, or invitation": "steadier support gathering around the gentler opening that is already showing itself",
      "maturity and restraint": "steadier support gathering around the part of the practice that is already deepening",
      "slow growth and rooting": "steadier support gathering around slower, deeper growth",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^endurance around ([a-z ,'-]+)$/i,
    {
      "a small opening": "a small opening that could still hold if you work with it steadily",
      "clarity and visible progress": "staying power gathering around signal that is finally becoming easier to trust",
      "your own position": "staying power gathering around your spiritual path",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^(?:heart, value, or feeling|values and love) (?:around|in|under) ([a-z ,'-]+)$/i,
    {
      "a small beginning": "what feels deeply true finding room inside a small new beginning",
      "a small opening": "what feels deeply true finding room through a small but usable opening",
      "constructive change": "what feels deeply true gathering around change that is actually aligned",
      "endurance": "what feels deeply true being tested by what can genuinely hold",
      "expansion": "what feels deeply true getting more room to open",
      "grace": "what feels deeply true being met with a gentler, more encouraging response",
      "improvement or movement": "what feels deeply true beginning to move in a healthier direction",
      "incoming movement or news": "what feels deeply true beginning to move with the next sign or development",
      "resources and flow": "what feels deeply true being supported by flow that is finally usable",
      "slow growth": "what feels deeply true asking for slower, steadier growth",
      "stability and endurance": "what feels deeply true finding steadier ground to hold",
      "support and loyalty": "what feels deeply true becoming clearer through the support that actually holds",
      "values and love": "what feels deeply true becoming impossible to ignore",
      "your own position": "what feels deeply true gathering around your spiritual path",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^incoming movement or news (?:in|under) ([a-z ,'-]+)$/i,
    {
      "a newly forming situation": "a sign, response, or new movement arriving because a new phase is already taking shape",
      "clarity and success": "a sign, response, or new movement arriving once the path is clearer and easier to trust",
      "endurance": "a sign, response, or new movement arriving in something the practice can actually sustain",
      "guidance": "a sign, response, or new movement arriving through guidance that is finally easier to trust",
      "incoming momentum": "a sign, response, or new movement beginning to build on itself",
      "maturity": "a sign, response, or new movement arriving through steadier practice and restraint",
      "slow growth": "a sign, response, or new movement arriving through slower, steadier growth",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^movement, distance, or transition (?:in|under) ([a-z ,'-]+)$/i,
    {
      "clarity and success": "the path beginning to shift once the signal is clearer and easier to trust",
      "clarity and visible progress": "the path beginning to shift once the signs are easier to recognize",
      "documents and messages": "the path beginning to shift through what is being named, written, or made explicit",
      "endurance": "the path beginning to shift in a way the practice can actually sustain",
      "improvement or movement": "the path beginning to shift because change is already underway",
      "power": "the path beginning to shift once stronger conviction or backing is present",
      "support and loyalty": "the path beginning to shift through steadier support",
      "values and love": "the path beginning to shift around what feels deeply true",
      "your own field": "the path beginning to shift once your own part in it is clearer",
    },
  );

  return rewritten
    .replace(/^a stopped place made heavier by delay, distance, or the feeling of no easy passage$/i, "a blocked stretch that still has no easy way through")
    .replace(/^reliable support under grace$/i, "reliable support showing up through a gentler, more encouraging response")
    .replace(/^the other person's stance under closure$/i, "the other person's stance moving through a pause, ending, or quiet withdrawal")
    .replace(/^choice and branching paths under improvement or movement$/i, "a decision point emerging because the path is already beginning to shift")
    .replace(/^guidance and signal in a newly forming situation$/i, "clearer guidance beginning to show through a phase that is only just taking shape")
    .replace(/^guidance and signal in clarity and success$/i, "clearer guidance showing itself as the path becomes easier to trust")
    .replace(/^guidance and signal in values and love$/i, "clearer guidance coming through what feels deeply true")
    .replace(/^a newly forming situation around ([a-z ,'-]+)$/i, "a new phase beginning to take shape around $1")
    .replace(/^a solution or unlock (?:in|under) ([a-z ,'-]+)$/i, "a workable answer beginning to appear through $1")
    .replace(/^clarity and success around ([a-z ,'-]+)$/i, "clearer signal and confirmation gathering around $1")
    .replace(/^clarity and success in ([a-z ,'-]+)$/i, "clearer signal and confirmation emerging through $1")
    .replace(/^clarity and success under ([a-z ,'-]+)$/i, "clearer signal and confirmation becoming possible through $1")
    .replace(/^clarity and visible progress around ([a-z ,'-]+)$/i, "clearer signal and usable confirmation gathering around $1")
    .replace(/^clarity and visible progress in ([a-z ,'-]+)$/i, "clearer signal and usable confirmation emerging through $1")
    .replace(/^clarity and visible progress under ([a-z ,'-]+)$/i, "clearer signal and usable confirmation becoming possible through $1")
    .replace(/^guidance around ([a-z ,'-]+)$/i, "clearer guidance gathering around $1")
    .replace(/^guidance in ([a-z ,'-]+)$/i, "clearer guidance emerging through $1")
    .replace(/^guidance under ([a-z ,'-]+)$/i, "clearer guidance becoming possible through $1")
    .replace(/^resource flow around ([a-z ,'-]+)$/i, "usable support and steadier flow gathering around $1")
    .replace(/^social or public life feeding long-term growth more than first appearances suggest$/i, "something in the wider field quietly nourishing longer growth on the path")
    .replace(/^(?:support and loyalty|reliable support)(?: (?:around|in|under) [a-z ,'-]+)?$/i, "steadier support")
    .replace(/^(?:heart, value, or feeling|values and love)(?: (?:around|in|under) [a-z ,'-]+)?$/i, "what feels deeply true")
    .replace(/^a newly forming situation(?: around [a-z ,'-]+)?$/i, "a new phase taking shape on the path")
    .replace(/^a solution or unlock(?: (?:in|under) [a-z ,'-]+)?$/i, "a workable answer beginning to appear")
    .replace(/^clarity and success(?: (?:around|in|under) [a-z ,'-]+)?$/i, "clearer signal and confirmation")
    .replace(/^clarity and visible progress(?: (?:around|in|under) [a-z ,'-]+)?$/i, "clearer signal and usable confirmation")
    .replace(/^guidance\b/i, "clearer guidance")
    .replace(/^incoming movement or news(?: (?:around|in|under) [a-z ,'-]+)?$/i, "a sign, response, or new movement")
    .replace(/^movement, distance, or transition(?: (?:around|in|under) [a-z ,'-]+)?$/i, "the path beginning to shift")
    .replace(/^resource flow(?: around [a-z ,'-]+)?$/i, "usable support and steadier flow")
    .replace(/^endurance(?: around [a-z ,'-]+)?$/i, "staying power that can actually hold")
    .replace(/^your own field\b/i, "your spiritual path")
    .replace(/^your own position\b/i, "your spiritual path");
}

function rewriteSpiritualPressureResiduals(input: string): string {
  let rewritten = input;

  rewritten = replaceContextualPhrase(
    rewritten,
    /^your own position (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "caution": "your spiritual path tightening under guardedness, overcontrol, or self-protective handling",
      "closure": "your spiritual path moving through a pause, ending, or quiet withdrawal",
      "communication and nerves": "your spiritual path getting crowded by anxious interpretation, overtalk, or mental noise",
      "erosion and stress": "your spiritual path being worn down by repeated strain or drain",
      "fog or uncertainty": "your spiritual path sitting inside uncertainty, mixed signal, or too little clarity",
      "obstruction": "your spiritual path running into a real blockage that still cannot be forced",
      "repetition": "your spiritual path getting caught in a pattern that keeps replaying",
      "structure": "your spiritual path getting pinned inside rigid expectations or inherited forms",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^caution and self-interest (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "caution": "defensive caution tightening into a loop that is no longer helping discernment",
      "closure": "defensive caution complicating a pause or withdrawal that may already need to happen",
      "communication and nerves": "defensive caution feeding anxious interpretation and too much mental noise",
      "decisive cuts": "defensive caution gathering around a hard boundary that may need to be honored",
      "fog or uncertainty": "defensive caution getting worse because the signal still feels unclear",
      "obstruction": "defensive caution making an already blocked path harder to read",
      "repetition": "defensive caution feeding the same repeating pattern",
      "strategy": "defensive caution turning discernment into overmanagement",
      "the meaningful burden": "defensive caution tightening around something spiritually weighty",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^closure, ending, or rest (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "caution": "a pause or ending being made harder by overprotection or guarded handling",
      "closure": "a pause or ending deepening because something on the path may already be complete",
      "commitment": "a pause or ending pressing on vows, promises, or commitments that can no longer be carried the same way",
      "communication and nerves": "a pause or ending being clouded by anxious interpretation or too much mental noise",
      "decisive cuts": "a pause or ending being sharpened by a necessary hard boundary",
      "documents and messages": "a pause or ending being shaped by what has been named, written, or made explicit",
      "erosion and stress": "a pause or ending forming in a path already worn down by strain",
      "strategy": "a pause or ending being prolonged by overmanagement or guarded discernment",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^fog and uncertainty (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "communication and nerves": "uncertainty thickened by anxious interpretation and too much mental noise",
      "decisive cuts": "uncertainty sharpening around a hard boundary or necessary no",
      "erosion and stress": "uncertainty thickening because repeated strain is already wearing the path down",
      "fog or uncertainty": "uncertainty feeding on itself until the path is hard to read cleanly",
      "obstruction": "uncertainty deepening because the way forward still feels blocked",
      "repetition": "uncertainty being reinforced by the same repeating pattern",
      "strategy": "uncertainty being worsened by overmanagement or guarded discernment",
      "structure": "uncertainty getting trapped inside inherited forms or rigid expectations",
      "the other person's field": "uncertainty thickening around the other person's role or response in the path",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^nervous communication (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "caution": "anxious interpretation feeding on self-protective caution",
      "closure": "anxious interpretation crowding a pause or ending that needs quiet",
      "decisive cuts": "anxious interpretation sharpening around a hard boundary or clean no",
      "endurance": "anxious interpretation straining what the path is actually trying to sustain",
      "erosion and stress": "anxious interpretation feeding a path that is already worn down",
      "fog or uncertainty": "anxious interpretation thickening an already unclear signal",
      "obstruction": "anxious interpretation building because the path feels blocked",
      "the public field": "anxious interpretation being amplified by the wider field around the question",
      "what is hidden": "anxious interpretation gathering around what is still hidden or unconfirmed",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^structure, distance, or institution (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "caution": "formal structures or inherited expectations tightening under overcareful handling",
      "closure": "formal structures or old obligations hardening a pause or ending",
      "communication and nerves": "formal structures or rigid expectations getting tangled in anxious interpretation",
      "erosion and stress": "formal structures or rigid expectations worsening a path already worn down by strain",
      "fog or uncertainty": "formal structures or rigid expectations making the path harder to read cleanly",
      "obstruction": "formal structures or rigid expectations reinforcing the blockage instead of easing it",
      "strategy": "formal structures or inherited expectations complicating a path that already needs cleaner discernment",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^burden and meaning (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "caution": "a spiritually weighty issue tightening under guardedness or overprotection",
      "communication and nerves": "a spiritually weighty issue being made noisier by anxious interpretation",
      "strategy": "a spiritually weighty issue being overmanaged instead of listened to",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^complication or mixed motives (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "caution": "mixed motives getting tighter under guardedness or overprotection",
      "closure": "mixed motives gathering around a pause or withdrawal that has not been faced cleanly",
      "decisive cuts": "mixed motives complicating a boundary or choice that needs to be clean",
      "obstruction": "mixed motives getting stuck inside real blockage or delay",
      "repetition": "mixed motives feeding the same repeating pattern",
      "strategy": "mixed motives being reinforced by overmanagement or guarded discernment",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^a sharp decision or cut (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "caution": "a hard boundary or spiritually clean cut being made harder by overprotection",
      "decisive cuts": "one hard boundary sharpening another until avoidance is no longer possible",
      "erosion and stress": "a hard boundary or spiritually clean cut landing in a path already worn down by strain",
      "fog or uncertainty": "a hard boundary or spiritually clean cut being made without enough clarity",
      "strategy": "a hard boundary or spiritually clean cut being shaped by overmanagement or guarded discernment",
    },
  );

  return rewritten
    .replace(/^a stopped place made heavier by delay, distance, or the feeling of no easy passage$/i, "a blocked stretch that still has no easy way through")
    .replace(/^the other person's stance under closure$/i, "the other person's stance moving through a pause, ending, or quiet withdrawal")
    .replace(/^a solution or unlock under communication and nerves$/i, "a workable answer trying to come through too much interpretation and mental noise")
    .replace(/^choice and branching paths under strategy$/i, "a decision point being overmanaged instead of discerned cleanly")
    .replace(/^obstacle or delay in caution$/i, "a real delay being worsened by guardedness or overprotection")
    .replace(/^obstacle or delay under caution$/i, "a real delay being worsened by guardedness or overprotection")
    .replace(/^obstacle or delay under erosion and stress$/i, "a real blockage getting heavier because repeated strain is already wearing the path down")
    .replace(/^obstacle or delay under structure$/i, "a real blockage being reinforced by rigid expectations or inherited forms")
    .replace(/^obstacle or delay(?: (?:in|under|moving through) [a-z ,'-]+)?$/i, "a real blockage or delay that has to be worked patiently rather than forced")
    .replace(/^a sharp decision or cut(?: (?:in|under|moving through) [a-z ,'-]+)?$/i, "a hard boundary or spiritually clean cut that now needs honest handling")
    .replace(/^burden and meaning(?: (?:in|under|moving through) [a-z ,'-]+)?$/i, "a spiritually weighty issue that needs wiser carrying")
    .replace(/^caution and self-interest(?: (?:in|under|moving through) [a-z ,'-]+)?$/i, "defensive caution and overprotection clouding the path")
    .replace(/^choice and branching paths(?: (?:in|under|moving through) [a-z ,'-]+)?$/i, "a decision point that cannot stay vague and has to be discerned cleanly")
    .replace(/^closure, ending, or rest\b/i, "a pause, ending, or quiet withdrawal that needs honest recognition")
    .replace(/^complication or mixed motives\b/i, "mixed motives or layered pressure making the path harder to read cleanly")
    .replace(/^fog and uncertainty\b/i, "uncertainty and mixed signal thickening around the path")
    .replace(/^nervous communication\b/i, "anxious interpretation and too much mental noise")
    .replace(/^structure, distance, or institution\b/i, "formal structures, inherited rules, or rigid expectations pressing on the path")
    .replace(/^your own field\b/i, "your spiritual path at the point that needs the most honest attention")
    .replace(/^your own position\b/i, "your spiritual path at the point that needs the most honest attention");
}

function rewriteCommunityOpeningResiduals(input: string): string {
  let rewritten = input;

  rewritten = replaceContextualPhrase(
    rewritten,
    /^your own position (?:in|under|around|moving through|finding room through) ([a-z ,'-]+)$/i,
    {
      "a small opening": "your place in the wider field finding a small but usable opening",
      "clarity and success": "your place in the wider field becoming clearer and easier for others to read",
      "commitment": "your place in the wider field inside a recurring group pattern or agreement that now needs clearer handling",
      "endurance": "steadier footing beginning to hold around your place in the wider field",
      "erosion and stress": "your place in the wider field having to recover from repeated strain or low-grade social wear",
      "expansion": "your place in the wider field getting more room to move",
      "grace": "more welcome, goodwill, or receptivity beginning to gather around your place in the wider field",
      "guidance": "clearer direction gathering around your place in the wider field",
      "improvement or movement": "your place in the wider field beginning to move into a healthier pattern of participation",
      "maturity": "your place in the wider field being steadied by better judgment and stronger boundaries",
      "power": "your place in the wider field gaining firmer footing through clearer leverage or support",
      "resource flow": "cleaner reciprocity and usable support gathering around your place in the wider field",
      "slow growth": "your place in the wider field growing more slowly but on steadier ground",
      "structural stability": "steadier footing and firmer ground gathering around your place in the wider field",
      "support and loyalty": "steadier mutual support gathering around your place in the wider field",
      "the answer point": "your place in the wider field reaching the clearest point of response or decision",
      "the public field": "your place in the wider field becoming more visible in the shared space",
      "your own field": "your place in the wider field becoming the clearest ground you can actually act from",
      "values and love": "your place in the wider field being pulled back toward what still feels mutual, welcoming, and worth belonging to",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^(?:support and loyalty|reliable support) around ([a-z ,'-]+)$/i,
    {
      "slow growth and rooting": "steadier mutual support gathering around slower trust and firmer belonging",
      "your own position": "steadier mutual support gathering around your place in the wider field",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^endurance around ([a-z ,'-]+)$/i,
    {
      "your own position": "steadier footing gathering around your place in the wider field",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^(?:heart, value, or feeling|values and love) (?:around|in|under) ([a-z ,'-]+)$/i,
    {
      "grace": "what genuinely matters in the group being met with more warmth, welcome, or receptivity",
      "maturity and restraint": "what genuinely matters in the group being carried with better judgment and steadier boundaries",
      "reliable support": "what genuinely matters in the group being backed by support that can actually hold",
      "slow growth and rooting": "what genuinely matters in the group deepening through slower trust and steadier belonging",
      "your own position": "what genuinely feels mutual gathering around your place in the wider field",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^incoming movement or news (?:in|under) ([a-z ,'-]+)$/i,
    {
      "a newly forming situation": "new movement or response beginning because a fresh group thread is already taking shape",
      "incoming momentum": "new movement or response beginning to build on itself in the wider field",
      "support and loyalty": "fresh movement beginning through support that actually goes both ways",
      "values and love": "new movement or response beginning around what still feels genuinely mutual",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^movement, distance, or transition (?:in|under) ([a-z ,'-]+)$/i,
    {
      "your own field": "movement beginning once your place in the wider field is clearer and easier to stand in",
    },
  );

  return rewritten
    .replace(/^a small beginning in values and love$/i, "a small beginning around what still feels mutual, welcoming, and worth belonging to")
    .replace(/^a small beginning under values and love$/i, "a small beginning around what still feels mutual, welcoming, and worth belonging to")
    .replace(/^constructive change under values and love$/i, "constructive change beginning around what still feels mutual, welcoming, and worth belonging to")
    .replace(/^power around your own position$/i, "clearer leverage and stronger footing gathering around your place in the wider field")
    .replace(/^a small opening in your own field$/i, "a small but usable opening around your place in the wider field")
    .replace(/^maturity and restraint under grace$/i, "a warmer group response being carried with maturity and restraint")
    .replace(/^improvement or movement around heart, value, or feeling$/i, "what genuinely matters in the group beginning to move in a healthier direction")
    .replace(/^improvement or movement around a small beginning$/i, "constructive change beginning through a new group thread that is still early enough to shape")
    .replace(/^improvement or movement around your own position$/i, "constructive change beginning around your place in the wider field")
    .replace(/^events beginning to move the moment your own stance becomes clear$/i, "movement beginning once your place in the wider field becomes clearer and easier to stand in")
    .replace(/^constructive change under the answer point$/i, "constructive change beginning once the clearest response or decision starts to show")
    .replace(/^constructive change under incoming momentum$/i, "constructive change beginning as fresh movement or response starts to arrive")
    .replace(/^erosion, worry, or leakage in closure$/i, "repeated drain gathering around a pause, exit, or withdrawal that the wider field has not handled cleanly")
    .replace(/^resources and flow in communication and nerves$/i, "resources, reciprocity, or practical support getting tangled in anxious talk, mixed signals, or too much group processing")
    .replace(/^guidance and signal in slow growth$/i, "clearer direction beginning to show as slower trust and steadier belonging take shape")
    .replace(/^power around reliable support$/i, "stronger backing through support that can actually hold")
    .replace(/^incoming momentum around slow growth and rooting$/i, "fresh movement beginning as slower trust and steadier belonging start to take root")
    .replace(/^complication feeding anxiety, attrition, or the slow damage done by what keeps slipping sideways$/i, "mixed motives steadily worsening the strain, anxiety, and social wear already working through the wider field")
    .replace(/^expansion around the commitment question or repeating terms$/i, "more room opening around the group terms, expectations, or repeated pattern that now need clearer handling")
    .replace(/^expansion around constructive change$/i, "more room opening for constructive change in the wider field")
    .replace(/^resources and flow in maturity$/i, "reciprocity and support finding better balance through steadier judgment")
    .replace(/^maturity around slow growth and rooting$/i, "better judgment helping slower trust and steadier belonging take root")
    .replace(/^warmth and feeling brought fully into the light$/i, "what genuinely matters becoming fully visible in the wider field")
    .replace(/^choice and branching paths in values and love$/i, "a decision point opening around what still feels genuinely mutual or worth belonging to")
    .replace(/^choice and branching paths under slow growth$/i, "a decision point emerging in a process of slower trust and steadier belonging")
    .replace(/^choice and branching paths under values and love$/i, "a decision point emerging around what still feels genuinely mutual or worth belonging to")
    .replace(/^guidance and signal in endurance$/i, "clearer direction beginning to hold in what can actually sustain participation")
    .replace(/^guidance and signal in expansion$/i, "clearer direction beginning to show as the wider field opens up")
    .replace(/^guidance and signal in clarity and success$/i, "clearer direction beginning to show as the wider field becomes easier to read")
    .replace(/^guidance and signal in maturity$/i, "clearer direction beginning to show through better judgment and stronger boundaries")
    .replace(/^guidance and signal in values and love$/i, "clearer direction beginning to show through what still feels genuinely mutual")
    .replace(/^guidance and signal under grace$/i, "clearer direction beginning to show through a warmer, more receptive group response")
    .replace(/^guidance and signal under values and love$/i, "clearer direction becoming possible through what still feels genuinely mutual")
    .replace(/^grace, goodwill, or invitation under slow growth$/i, "a more welcoming group response becoming possible as trust regrows slowly")
    .replace(/^social or public life feeding long-term growth more than first appearances suggest$/i, "the wider field quietly nourishing longer-term belonging more than first appearances suggest")
    .replace(/^your own position under commitment$/i, "your place in the wider field inside a pattern, agreement, or repeated group dynamic that now needs clearer terms")
    .replace(/^a newly forming situation around a small beginning$/i, "a new shared thread or group opening still early enough to shape well")
    .replace(/^a newly forming situation around reliable support$/i, "a new shared opening backed by support that could actually hold")
    .replace(/^a solution or unlock in improvement or movement$/i, "a workable way forward beginning to show as the group dynamic starts shifting")
    .replace(/^clarity and success around incoming movement or news$/i, "clearer visibility beginning once fresh movement or response actually arrives")
    .replace(/^clarity and success around your own position$/i, "clearer visibility gathering around your place in the wider field")
    .replace(/^clarity and visible progress under a newly forming situation$/i, "clearer traction beginning inside a new shared opening that is still taking shape")
    .replace(/^clarity and visible progress under a small opening$/i, "clearer traction beginning through a small opening that can still be used well")
    .replace(/^clarity and visible progress under endurance$/i, "clearer traction beginning in what can actually hold over time")
    .replace(/^clarity and visible progress under expansion$/i, "clearer traction beginning as the wider field opens up")
    .replace(/^constructive change in incoming momentum$/i, "constructive change beginning as fresh movement or response actually arrives")
    .replace(/^clarity and visible progress under the public field$/i, "clearer traction beginning once the shared field can actually see and respond")
    .replace(/^guidance around your own position$/i, "clearer direction gathering around your place in the wider field")
    .replace(/^maturity and restraint under your own field$/i, "steadier judgment gathering around your place in the wider field")
    .replace(/^your own field$/i, "your place in the wider field")
    .replace(/^a newly forming situation(?: around [a-z ,'-]+)?$/i, "a new shared phase that is still taking shape")
    .replace(/^a solution or unlock(?: (?:in|under) [a-z ,'-]+)?$/i, "a workable way forward beginning to show")
    .replace(/^clarity and success(?: (?:around|in|under) [a-z ,'-]+)?$/i, "clearer visibility and social traction")
    .replace(/^clarity and visible progress(?: (?:around|in|under) [a-z ,'-]+)?$/i, "clearer traction that others can actually see and respond to")
    .replace(/^endurance(?: around [a-z ,'-]+)?$/i, "steadier footing that can actually hold in the wider field")
    .replace(/^guidance(?: (?:around|in|under) [a-z ,'-]+)?$/i, "clearer direction about where you belong and how to participate")
    .replace(/^incoming movement or news(?: (?:around|in|under) [a-z ,'-]+)?$/i, "fresh movement or response in the wider field")
    .replace(/^movement, distance, or transition(?: (?:around|in|under) [a-z ,'-]+)?$/i, "the wider field finally beginning to move")
    .replace(/^resource flow(?: around [a-z ,'-]+)?$/i, "usable reciprocity and support")
    .replace(/^your own field(?: (?:around|in|under) [a-z ,'-]+)?$/i, "your place in the wider field becoming the clearest ground you can actually act from")
    .replace(/^(?:grace|grace, goodwill, or invitation)(?: (?:around|in|under) [a-z ,'-]+)?$/i, "a warmer, more receptive group response")
    .replace(/^(?:support and loyalty|reliable support)(?: (?:around|in|under) [a-z ,'-]+)?$/i, "steadier mutual support")
    .replace(/^(?:heart, value, or feeling|values and love)(?: (?:around|in|under) [a-z ,'-]+)?$/i, "what still feels mutual, welcoming, and worth belonging to")
    .replace(/^your own position\b/i, "your place in the wider field");
}

function rewriteCommunityPressureResiduals(input: string): string {
  let rewritten = input;

  rewritten = replaceContextualPhrase(
    rewritten,
    /^your own position (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "caution": "your place in the wider field tightening under guardedness or self-protective positioning",
      "closure": "your place in the wider field passing through a needed pause, exit, or quiet withdrawal",
      "communication and nerves": "your place in the wider field getting tangled in anxious talk, mixed signals, or too much group processing",
      "erosion and stress": "your place in the wider field being worn down by repeated strain, attrition, or low-grade social wear",
      "fog or uncertainty": "your place in the wider field being pulled through mixed signals or unclear group response",
      "obstruction": "your place in the wider field running into real blockage or social delay",
      "repetition": "your place in the wider field getting trapped in a pattern that keeps replaying",
      "strategy": "your place in the wider field being shaped too much by guarded strategy or self-protective positioning",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^a sharp decision or cut (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "closure": "a clean boundary or group split landing as a pause, exit, or withdrawal becomes unavoidable",
      "communication and nerves": "a clean boundary or group split being complicated by anxious talk, mixed signals, or too much reactive discussion",
      "fog or uncertainty": "a clean boundary or group split being made harder by uncertainty or too little clarity",
      "obstruction": "a clean boundary or group split running into a blockage the wider field still has not worked through",
      "repetition": "a clean boundary or group split landing in a pattern that keeps replaying instead of resolving",
      "strategy": "a clean boundary or group split being shaped by guarded strategy, image management, or self-protective positioning",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^caution and self-interest (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "caution": "defensive positioning and self-protective group dynamics tightening into a loop",
      "closure": "defensive positioning complicating a pause, exit, or withdrawal already forming in the wider field",
      "commitment": "defensive positioning tightening around the agreements, loyalties, or repeated group terms now under strain",
      "communication and nerves": "defensive positioning feeding anxious talk and reactive group processing",
      "fog or uncertainty": "defensive positioning getting worse because the social field still feels too unclear to trust",
      "obstruction": "defensive positioning making an already blocked group dynamic even harder to move",
      "strategy": "defensive positioning and self-protection shaping the wider field too strongly",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^closure, ending, or rest (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "caution": "a pause, exit, or withdrawal in the wider field being made harder by guardedness or overprotection",
      "closure": "a pause, exit, or withdrawal in the wider field deepening because part of the group story may already be ending",
      "commitment": "a pause, exit, or withdrawal pressing on the loyalties, agreements, or repeated terms that can no longer carry things cleanly",
      "communication and nerves": "a pause, exit, or withdrawal being blurred by anxious talk and too much reactive discussion",
      "erosion and stress": "a pause, exit, or withdrawal forming in a group dynamic already worn down by repeated strain",
      "fog or uncertainty": "a pause, exit, or withdrawal becoming harder to read because the field is still unclear",
      "repetition": "a pause, exit, or withdrawal getting trapped in the same repeating group pattern",
      "the meaningful burden": "a pause, exit, or withdrawal gathering around a shared burden the group has not handled wisely",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^complication or mixed motives (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "caution": "mixed motives and defensive positioning making the wider field harder to read cleanly",
      "closure": "mixed motives gathering around a pause, exit, or withdrawal that has not been handled cleanly",
      "decisive cuts": "mixed motives complicating a boundary or decision that needs to be cleaner",
      "fog or uncertainty": "mixed motives thickening an already unclear group dynamic",
      "obstruction": "mixed motives getting stuck inside a blockage the group still has not worked through",
      "strategy": "mixed motives being reinforced by strategy, image management, or too much guarded positioning",
      "the meaningful burden": "mixed motives complicating a shared burden the group is already carrying",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^emotional weather or recognition (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "erosion and stress": "the group mood and sense of recognition being worn down by repeated strain and low-grade attrition",
      "fog or uncertainty": "the group mood becoming harder to trust because too much in the field is still unclear",
      "obstruction": "the group's emotional climate growing heavier because the blockage still has not shifted cleanly",
      "repetition": "the group's emotional climate getting trapped in a pattern that keeps replaying",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^fog and uncertainty (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "caution": "group uncertainty thickening because guardedness and self-protection keep interrupting clean response",
      "communication and nerves": "group uncertainty being worsened by anxious talk, mixed signals, or too much reactive discussion",
      "decisive cuts": "group uncertainty sharpening around a boundary or decision that can no longer stay deferred",
      "erosion and stress": "group uncertainty thickening because repeated strain is already wearing the wider field down",
      "fog or uncertainty": "group uncertainty feeding on itself until the whole field becomes harder to read",
      "obstruction": "group uncertainty deepening because the blockage still has not been worked through",
      "repetition": "group uncertainty being reinforced by the same pattern replaying again",
      "strategy": "group uncertainty being made worse by guarded strategy, image management, or too much careful positioning",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^nervous communication (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "caution": "anxious group talk being tightened further by guardedness or overprotection",
      "closure": "anxious group talk crowding a pause, exit, or withdrawal that needs clearer handling",
      "structure": "anxious group talk getting trapped in fixed roles, gatekeeping, or formal group structure",
      "what is hidden": "anxious group talk gathering around what is still private, unspoken, or offstage in the wider field",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^choice and branching paths (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "communication and nerves": "decision pressure getting tangled in anxious talk, crossed signals, or too many voices trying to steer at once",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^structure, distance, or institution (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "caution": "fixed roles, gatekeeping, or formal group structure tightening under guardedness and self-protective handling",
      "communication and nerves": "fixed roles, gatekeeping, or formal group structure being made noisier by anxious talk and mixed signals",
      "erosion and stress": "fixed roles, gatekeeping, or formal group structure being worn down by repeated strain",
      "fog or uncertainty": "fixed roles, gatekeeping, or formal group structure staying too unclear to read cleanly",
      "strategy": "fixed roles, gatekeeping, or formal group structure being used to reinforce guarded positioning",
    },
  );

  return rewritten
    .replace(/^the commitment question or repeating terms in communication and nerves$/i, "the group's repeated terms, expectations, or unspoken agreement getting tangled in anxious talk and too much processing")
    .replace(/^erosion, worry, or leakage moving through your own field$/i, "repeated strain or low-grade social wear working directly on your place in the wider field")
    .replace(/^erosion, worry, or leakage under erosion and stress$/i, "repeated drain feeding a wider field already worn down by strain")
    .replace(/^erosion, worry, or leakage under caution$/i, "repeated drain worsening because guardedness or overprotection keep interrupting clean response")
    .replace(/^mixed messages, gossip, or anxious conversation that can distort what is really happening$/i, "too many side conversations, mixed signals, or anxious group talk distorting what is actually happening in the wider field")
    .replace(/^nervous conversation caught in repetition, where talk can sharpen rather than settle the issue$/i, "anxious group talk getting stuck in the same loop, where discussion sharpens the tension instead of settling it")
    .replace(/^your own role caught in complication, mixed motives, or a dynamic that needs clearer boundaries$/i, "your place in the wider field getting caught in mixed motives, group pressure, or a dynamic that needs clearer boundaries")
    .replace(/^a stopped place made heavier by delay, distance, or the feeling of no easy passage$/i, "a stalled group dynamic feeling heavier because there is still no easy way through it")
    .replace(/^a sharp decision or cut(?: (?:in|under|moving through) [a-z ,'-]+)?$/i, "a clean boundary or decisive split that now needs honest handling")
    .replace(/^burden and meaning(?: (?:in|under|moving through) [a-z ,'-]+)?$/i, "a shared burden that needs wiser carrying in the wider field")
    .replace(/^caution and self-interest(?: (?:in|under|moving through) [a-z ,'-]+)?$/i, "defensive positioning and guarded group dynamics making the wider field harder to read cleanly")
    .replace(/^closure, ending, or rest(?: (?:in|under|moving through) [a-z ,'-]+)?$/i, "a pause, exit, or withdrawal in the wider field that needs honest recognition")
    .replace(/^complication or mixed motives(?: (?:in|under|moving through) [a-z ,'-]+)?$/i, "mixed motives and layered group pressures making the field harder to read cleanly")
    .replace(/^emotional weather or recognition(?: (?:in|under|moving through) [a-z ,'-]+)?$/i, "the group's emotional climate and sense of recognition becoming harder to trust cleanly")
    .replace(/^fog and uncertainty(?: (?:in|under|moving through) [a-z ,'-]+)?$/i, "uncertainty and mixed signals thickening across the wider field")
    .replace(/^nervous communication(?: (?:in|under|moving through) [a-z ,'-]+)?$/i, "anxious group talk and too much reactive discussion")
    .replace(/^obstacle or delay(?: (?:in|under|moving through) [a-z ,'-]+)?$/i, "a real social delay or blockage the wider field still has to work through")
    .replace(/^structure, distance, or institution(?: (?:in|under|moving through) [a-z ,'-]+)?$/i, "fixed roles, gatekeeping, or formal group structure pressing on the dynamic")
    .replace(/^choice and branching paths\b/i, "a real fork or decision in the wider field that now needs honest handling")
    .replace(/^your own position(?: (?:in|under|moving through) [a-z ,'-]+)?$/i, "your place in the wider field at the point that needs the most honest attention");
}

function rewritePetsOpeningResiduals(input: string): string {
  let rewritten = input;

  rewritten = replaceContextualPhrase(
    rewritten,
    /^your own position (?:in|under|around|moving through|finding room through) ([a-z ,'-]+)$/i,
    {
      "a small opening": "your care for the animal finding a small but usable opening",
      "clarity and success": "your care picture becoming clearer and easier to trust",
      "documents and messages": "your care picture being shaped by what is written, reported, or explicitly communicated",
      "endurance": "a steadier care rhythm beginning to hold",
      "expansion": "the care picture getting more room to ease and improve",
      "grace": "your care being met with a softer, more encouraging response",
      "guidance": "clearer care direction gathering around what you can actually do",
      "improvement or movement": "the care rhythm beginning to move in a healthier direction",
      "maturity": "your care for the animal being steadied by calmer judgment and better pacing",
      "power": "your care gaining firmer leverage through clearer stewardship and steadier handling",
      "resource flow": "practical support and cleaner routines gathering around your care for the animal",
      "slow growth": "the care rhythm improving more slowly but on steadier ground",
      "support and loyalty": "steadier support gathering around your care for the animal",
      "the answer point": "your care for the animal reaching the clearest point of usable guidance",
      "the public field": "your care for the animal becoming easier to read in the wider environment",
      "your own field": "your care decisions becoming the clearest part of the situation you can actually control",
      "values and love": "your care being pulled back toward what genuinely comforts or protects the animal",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^(?:support and loyalty|reliable support) around ([a-z ,'-]+)$/i,
    {
      "your own position": "steadier support gathering around your care for the animal",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^endurance around ([a-z ,'-]+)$/i,
    {
      "your own position": "a steadier care rhythm beginning to hold",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^(?:heart, value, or feeling|values and love) (?:around|in|under) ([a-z ,'-]+)$/i,
    {
      "constructive change": "what genuinely helps the animal feel safer gathering around a useful change",
      "incoming movement or news": "what genuinely helps the animal feel safer beginning to move with the next change or update",
      "maturity": "what genuinely helps the animal settle becoming clearer through calmer judgment and steadier pacing",
      "slow growth": "what genuinely helps the animal settle being asked to build more slowly and steadily",
      "values and love": "what genuinely helps the animal settle becoming harder to ignore",
      "your own field": "what genuinely helps the animal settle becoming clearer through the part you can actually control",
      "your own position": "what genuinely helps the animal settle gathering around your care for it",
    },
  );

  return rewritten
    .replace(/^a small opening around your own position$/i, "a small opening around the part of the care picture you can directly influence")
    .replace(/^a small opening around slow growth and rooting$/i, "a small opening for steadier settling and gradual improvement")
    .replace(/^resources and flow under values and love$/i, "practical support and cleaner routines gathering around what genuinely helps the animal settle")
    .replace(/^constructive change in endurance$/i, "constructive change through routines that can actually hold")
    .replace(/^constructive change under endurance$/i, "constructive change through routines that can actually hold")
    .replace(/^events beginning to move the moment your own stance becomes clear$/i, "movement beginning once your handling becomes clearer and steadier")
    .replace(/^grace around your own position$/i, "a softer, more encouraging response around your care for the animal")
    .replace(/^maturity and restraint under expansion$/i, "calmer, steadier handling creating more room for the animal to settle")
    .replace(/^maturity around a solution or unlock$/i, "calmer, steadier handling around the point where the answer is starting to show")
    .replace(/^slow growth around your own position$/i, "slower, steadier improvement gathering around your care for the animal")
    .replace(/^the answer point around your own position$/i, "the clearest care answer gathering around what you can actually do")
    .replace(/^the commitment question or repeating terms under a small opening$/i, "a small opening around the routine or repeating pattern that now needs clearer handling")
    .replace(/^your care approach finding a steadier rhythm that can actually hold$/i, "a steadier care rhythm beginning to hold")
    .replace(/^your own field around your own position$/i, "the part of the care picture you can actually control becoming easier to see")
    .replace(/^a solution or unlock in support and loyalty$/i, "a workable care answer beginning to show through support that actually holds")
    .replace(/^clarity and success around maturity and restraint$/i, "clearer signal beginning to show through calmer judgment and steadier pacing")
    .replace(/^clarity and success around your own position$/i, "clearer signal gathering around your care for the animal")
    .replace(/^guidance and signal in slow growth$/i, "clearer signs of improvement taking hold, even if the change is slower than you want")
    .replace(/^guidance and signal in values and love$/i, "clearer signal around what genuinely helps the animal feel safer and settle")
    .replace(/^guidance and signal under incoming momentum$/i, "clearer signs of movement arriving with the next response or update")
    .replace(/^guidance and signal under maturity$/i, "clearer signal emerging through calmer, more mature handling")
    .replace(/^guidance and signal under improvement or movement$/i, "clearer care direction beginning to show as the situation starts improving")
    .replace(/^guidance around your own position$/i, "clearer care direction gathering around what you can actually do")
    .replace(/^social or public life feeding long-term growth more than first appearances suggest$/i, "the wider environment supporting steadier improvement more than first appearances suggest")
    .replace(/^your own field\b/i, "the part of the care picture you can actually control")
    .replace(/^your own position\b/i, "the part of the care picture you can actually control")
    .replace(/^a newly forming situation(?: around [a-z ,'-]+)?$/i, "a newer care phase that is still taking shape")
    .replace(/^a solution or unlock(?: (?:in|under) [a-z ,'-]+)?$/i, "a workable care answer beginning to show")
    .replace(/^clarity and success(?: (?:around|in|under) [a-z ,'-]+)?$/i, "clearer signal and reassurance")
    .replace(/^clarity and visible progress(?: (?:around|in|under) [a-z ,'-]+)?$/i, "clearer signs of improvement")
    .replace(/^endurance(?: around [a-z ,'-]+)?$/i, "a steadier rhythm that can actually hold")
    .replace(/^guidance\b/i, "clearer care direction")
    .replace(/^incoming movement or news(?: (?:around|in|under) [a-z ,'-]+)?$/i, "a new care cue, response, or shift")
    .replace(/^movement, distance, or transition(?: (?:around|in|under) [a-z ,'-]+)?$/i, "movement beginning in the care picture")
    .replace(/^resource flow(?: around [a-z ,'-]+)?$/i, "practical support and cleaner routines")
    .replace(/^(?:support and loyalty|reliable support)(?: (?:around|in|under) [a-z ,'-]+)?$/i, "steadier support")
    .replace(/^(?:heart, value, or feeling|values and love)(?: (?:around|in|under) [a-z ,'-]+)?$/i, "what genuinely helps the animal settle");
}

function rewritePetsPressureResiduals(input: string): string {
  let rewritten = input;

  rewritten = replaceContextualPhrase(
    rewritten,
    /^your own position (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "closure": "your care for the animal moving through a pause, setback, or necessary rest phase",
      "communication and nerves": "your care for the animal getting pulled through too much anxious interpretation or over-monitoring",
      "erosion and stress": "your care for the animal being worn down by repeated strain, small stressors, or accumulating wear",
      "fog or uncertainty": "your care for the animal getting stuck inside uncertainty about what the animal is signaling",
      "caution": "your care for the animal tightening into overprotection or second-guessing",
      "obstruction": "your care for the animal running into a real blockage or care delay",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^a sharp decision or cut (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "caution": "a necessary care change or firmer boundary being made harder by overprotection",
      "closure": "a necessary care change or firmer boundary landing as a pause or setback becomes unavoidable",
      "communication and nerves": "a necessary care change or firmer boundary being complicated by anxious talk or too much interpretation",
      "erosion and stress": "a necessary care change or firmer boundary landing in a care rhythm already worn down by strain",
      "strategy": "a necessary care change or firmer boundary being shaped by overmanagement or too much control",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^burden and meaning (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "closure": "the care load feeling heavier because a pause, setback, or ending is already pressing on it",
      "communication and nerves": "the care load feeling heavier because anxious discussion keeps agitating it",
      "erosion and stress": "the care load feeling heavier because repeated strain is already wearing the routine down",
      "strategy": "the care load being made heavier by overmanagement or too much control",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^caution and self-interest (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "caution": "overprotective handling tightening into a loop",
      "decisive cuts": "overprotective handling gathering around a harder care decision that now needs to be made cleanly",
      "erosion and stress": "overprotective handling getting heavier because the care rhythm is already worn down",
      "fog or uncertainty": "overprotective handling growing out of uncertainty about what the animal is signaling",
      "obstruction": "overprotective handling making an already blocked care pattern harder to shift",
      "repetition": "overprotective handling feeding the same care loop again and again",
      "strategy": "overprotective handling turning careful observation into overmanagement",
      "structure": "overprotective handling getting reinforced by rigid routines or outside constraints",
      "the other person's field": "overprotective handling being shaped by another person's role in the care situation",
      "the public field": "overprotective handling being amplified by outside opinion or the visible care environment",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^closure, ending, or rest (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "communication and nerves": "a pause, setback, or necessary rest in the care rhythm being blurred by anxious talk and too much interpretation",
      "decisive cuts": "a pause, setback, or necessary rest being sharpened by a harder care decision",
      "erosion and stress": "a pause, setback, or necessary rest forming in a care rhythm already worn down by repeated strain",
      "fog or uncertainty": "a pause, setback, or necessary rest becoming harder to read because the signals are still unclear",
      "strategy": "a pause, setback, or necessary rest being prolonged by overmanagement or too much control",
      "structure": "a pause, setback, or necessary rest being pressed on by rigid routines or outside constraints",
      "the other person's field": "a pause, setback, or necessary rest being shaped by another person's role in the care situation",
      "what is hidden": "a pause, setback, or necessary rest gathering around what is still unclear or off the page",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^complication or mixed motives (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "caution": "crossed care priorities or mixed handling complicating an already guarded situation",
      "closure": "crossed care priorities gathering around a pause or setback that has not been faced cleanly",
      "fog or uncertainty": "crossed care priorities thickening an already unclear care picture",
      "obstruction": "crossed care priorities getting stuck inside a blocked routine or delayed response",
      "repetition": "crossed care priorities feeding the same care loop again and again",
      "strategy": "crossed care priorities being reinforced by overmanagement or too much control",
      "structure": "crossed care priorities getting tangled in rigid routines or outside constraints",
      "the meaningful burden": "crossed care priorities complicating a care load that is already heavy",
      "the other person's field": "crossed care priorities getting amplified by another person's role in the situation",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^fog and uncertainty (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "caution": "uncertainty around the animal's signals being made heavier by overprotection or second-guessing",
      "closure": "uncertainty about the animal's signals gathering around a pause or setback",
      "communication and nerves": "uncertainty around the animal's signals being worsened by anxious talk and too much interpretation",
      "erosion and stress": "uncertainty thickening because repeated strain is already wearing the care rhythm down",
      "obstruction": "uncertainty deepening because the blockage in the care pattern still has not shifted",
      "recognition": "uncertainty gathering around how the animal's signals are being read or recognized",
      "strategy": "uncertainty being made worse by overmanagement or too much careful control",
      "the meaningful burden": "uncertainty gathering around a care load that is already heavy",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^nervous communication (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "caution": "anxious talk or over-monitoring being tightened further by overprotection",
      "communication and nerves": "anxious talk and over-monitoring feeding on themselves",
      "erosion and stress": "anxious talk and over-monitoring feeding a care rhythm already worn down by strain",
      "fog or uncertainty": "anxious talk and over-monitoring thickening an already unclear care picture",
      "obstruction": "anxious talk and over-monitoring building around a blockage in the care pattern",
      "the meaningful burden": "anxious talk and over-monitoring gathering around a care load that is already heavy",
      "what is hidden": "anxious talk and over-monitoring gathering around what is still unclear or not yet confirmed",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^obstacle or delay (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "caution": "a care delay or blockage being worsened by overprotection or second-guessing",
      "obstruction": "a care delay or blockage sitting inside a pattern that still has not shifted",
      "strategy": "a care delay or blockage being worsened by overmanagement or too much control",
      "the meaningful burden": "a care delay or blockage gathering around a load that is already heavy",
    },
  );

  rewritten = replaceContextualPhrase(
    rewritten,
    /^structure, distance, or institution (?:in|under|moving through) ([a-z ,'-]+)$/i,
    {
      "communication and nerves": "rigid routines, outside constraints, or institutional structure being made noisier by anxious discussion and over-monitoring",
      "erosion and stress": "rigid routines, outside constraints, or institutional structure being worn down by repeated strain",
      "strategy": "rigid routines, outside constraints, or institutional structure reinforcing overmanagement instead of steadiness",
    },
  );

  return rewritten
    .replace(/^a stopped place made heavier by delay, distance, or the feeling of no easy passage$/i, "a care pattern that feels stuck, delayed, or harder to shift than it should")
    .replace(/^delay shaped by erosion and stress$/i, "delay caused by repeated stress and strain already wearing the care rhythm down")
    .replace(/^erosion, worry, or leakage under fog or uncertainty$/i, "drain and stress being worsened by an unclear care picture and too little trustworthy signal")
    .replace(/^erosion, worry, or leakage in communication and nerves$/i, "drain and stress being worsened by anxious talk, speculation, or too much interpretation")
    .replace(/^erosion, worry, or leakage moving through communication and nerves$/i, "drain and stress being amplified by anxious talk, over-monitoring, or too much interpretation")
    .replace(/^repetition and tension under closure$/i, "a care loop tightening around a pause, setback, or rest phase")
    .replace(/^choice and branching paths in closure$/i, "decision pressure gathering around a pause, setback, or necessary ending")
    .replace(/^guidance and signal moving through communication and nerves$/i, "the real signal getting muddied by anxious talk, over-monitoring, or too much interpretation")
    .replace(/^a sharp decision or cut\b/i, "a necessary care change or firmer boundary that now needs honest handling")
    .replace(/^a solution or unlock\b/i, "a workable care answer beginning to show")
    .replace(/^burden and meaning\b/i, "the care load feeling heavier and needing wiser handling")
    .replace(/^caution and self-interest\b/i, "overprotective handling and too much control clouding the care picture")
    .replace(/^choice and branching paths\b/i, "a real care decision or fork in the approach that now needs honest handling")
    .replace(/^closure, ending, or rest\b/i, "a pause, setback, or necessary rest phase that needs honest recognition")
    .replace(/^complication or mixed motives\b/i, "crossed care priorities and mixed handling making the situation harder to read cleanly")
    .replace(/^fog and uncertainty\b/i, "uncertainty around what the animal is signaling")
    .replace(/^nervous communication\b/i, "anxious talk, speculation, or over-monitoring around the animal")
    .replace(/^obstacle or delay\b/i, "a care delay or blockage that still has to be worked through patiently")
    .replace(/^structure, distance, or institution\b/i, "rigid routines, outside constraints, or institutional structure pressing on the care rhythm")
    .replace(/^your own position\b/i, "your care for the animal at the point that needs the most honest attention");
}

function narrativeSignalPhrase(
  input: string,
  kind: "opening" | "pressure",
  subjectId: SubjectId,
  domain: Domain,
): string {
  const summarized = lowerFirst(signalSummary(input));
  let rewritten = cleanSignalPhrase(
    summarized
      .replace(/^the counterpart's signal\b/i, "the other person's signal")
      .replace(/^the counterpart's role\b/i, "the other person's role")
      .replace(/^the counterpart's position\b/i, "the other person's position")
      .replace(/^the counterpart's side of commitment\b/i, "the other person's reliability")
      .replace(/^the counterpart\b/i, "the other person")
      .replace(/^your own stance in the relationship\b/i, "your own position in the bond")
      .replace(/^your own stance\b/i, "your own position")
      .replace(/^your own part in the bond\b/i, "your own position in the bond")
      .replace(/^your place in the relationship\b/i, "your place in the bond")
      .replace(/^your position becoming more emotionally visible\b/i, "your feelings becoming harder to hide")
      .replace(/^the heart arriving at an answer point\b/i, "the emotional truth moving toward clarity")
      .replace(/^the heart\b/i, "the emotional truth")
      .replace(/^commitment reaching the answer point\b/i, "the commitment question moving toward clarity")
      .replace(/^commitment\b/i, "the commitment question")
      .replace(/^messages becoming the main carrier of emotional tone\b/i, "communication carrying more emotional weight than usual")
      .replace(/^messages\b/i, "communication")
      .replace(/^clarity and visible progress under slow growth\b/i, "clearer progress beginning, but only at a pace that can actually hold")
      .replace(/^the bond depending on clearer wording\b/i, "the need for clearer terms around the bond")
      .replace(/^the bond meeting a decisive edge\b/i, "the bond reaching a decision point")
      .replace(/^the relationship leaning toward durability\b/i, "a relationship that could become durable")
      .replace(/^the heart being carried through conversation\b/i, "the emotional tone being shaped by conversation")
      .replace(/^clarity itself becoming the solution$/i, "clearer terms and a usable answer")
      .replace(/^the bond\b/i, "the bond")
      .replace(/\bhas to be\b/gi, "needs to be")
      .replace(/\bmoving through\b/gi, kind === "opening" ? "finding room through" : "moving through"),
  );

  rewritten = rewritten
    .replace(/^obstacle or delay moving through strategy$/i, "delay shaped by caution or defensive strategy")
    .replace(/^closure, ending, or rest in strategy$/i, "a strategic ending or necessary pause")
    .replace(/^obstacle or delay moving through ([a-z ,'-]+)$/i, "delay shaped by $1")
    .replace(/^([a-z ,'-]+) in a small opening$/i, "a small opening around $1")
    .replace(/^([a-z ,'-]+) finding room through a small opening$/i, "a small but real opening around $1")
    .replace(/^([a-z ,'-]+) finding room through ([a-z ,'-]+)$/i, "$2 around $1");

  if (subjectId === "love") {
    rewritten = rewritten
      .replace(/^complication or mixed motives under repetition$/i, "mixed motives feeding the same relationship pattern again and again")
      .replace(/^values and love around grace, goodwill, or invitation$/i, "what genuinely matters being met with more warmth, goodwill, or receptivity in the bond")
      .replace(/^closure, ending, or rest under the meaningful burden$/i, "a pause or withdrawal around a bond that still carries real weight")
      .replace(/^stability and foundations in improvement or movement$/i, "steadier footing starting to return to the relationship")
      .replace(/^events beginning to move the moment your own stance becomes clear$/i, "a clearer sense of your own position in the bond")
      .replace(/^your own position in the bond moving through uncertainty, hesitation, or a phase where not everything can yet be trusted at face value$/i, "your own position in the bond being clouded by uncertainty and mixed signals")
      .replace(/^heart, value, or feeling in guidance$/i, "genuine feeling finding a clearer guiding signal")
      .replace(/^how you are showing up in the relationship under your side of the relationship$/i, "your own presence in the bond and the tone it quietly creates")
      .replace(/^how you are showing up in the relationship in the answer point$/i, "how you are showing up as the variable the bond is most waiting on")
      .replace(/^how you are showing up in the relationship$/i, "your own position in the bond")
      .replace(
        /^how you are showing up in the relationship in a small opening$/i,
        "a small but real opening in how you are showing up in the relationship",
      )
      .replace(
        /^your own position in the bond in a small opening$/i,
        "a small but real opening in your own position in the bond",
      )
      .replace(/^a small opening around how you are showing up in the relationship$/i, "a small but real opening in how you are showing up in the relationship")
      .replace(/^a small opening around your own position in the bond$/i, "a small but real opening in your own position in the bond")
      .replace(/^the emotional truth moving toward clarity$/i, "feeling becoming clear enough to trust")
      .replace(/^structure, distance, or institution moving through strategy$/i, "distance or guarded strategy")
      .replace(/^movement, distance, or transition under clarity and success$/i, "movement that gains clarity and momentum")
      .replace(/^erosion, worry, or leakage moving through repeated strain and attrition$/i, "small repeated losses compounding each other until the wear becomes hard to ignore")
      .replace(/^nervous communication moving through obstruction$/i, "anxious communication hitting a wall it cannot move through cleanly")
      .replace(/^nervous communication moving through repeated strain and attrition$/i, "anxious talk and crossed signals made worse by ongoing wear and drain")
      .replace(/^closure, ending, or rest moving through erosion and stress$/i, "an old hurt or tired pattern reaching its limit")
      .replace(/^closure, ending, or rest moving through power$/i, "an ending or withdrawal being held in place by a dominant or guarded dynamic in the bond")
      .replace(/^closure, ending, or rest in closure$/i, "an ending or withdrawal that needs to be acknowledged")
      .replace(/^closure, ending, or rest in caution$/i, "an ending, withdrawal, or cold spell being kept in place by self-protective caution")
      .replace(/^repeated friction and pressure under closure$/i, "repeated arguments or tension pressing toward an ending neither person is quite ready to name")
      .replace(/^heart, value, or feeling under improvement or movement$/i, "genuine feeling becoming easier to act on as the bond begins to move in a cleaner direction")
      .replace(/^constructive change under clearer momentum$/i, "constructive change becoming easier to sustain as things begin to clear and move")
      .replace(/^uncertainty and mixed signals in closure$/i, "mixed signals and unclear intentions gathering around an ending that has not yet been named honestly")
      .replace(/^maturity and restraint in improvement or movement$/i, "maturity and restraint creating the conditions for the bond to move in a cleaner direction")
      .replace(/^maturity and restraint in incoming momentum$/i, "the steadier, more composed approach that makes an arriving signal or first move easier to receive well")
      .replace(/^nervous communication under decisive cuts$/i, "anxious communication pressing against a boundary or clear cut that has to be stated")
      .replace(/^maturity and restraint under grace$/i, "steadier, more composed intimacy becoming available through warmth and genuine receptivity")
      .replace(/^resources and flow under slow growth$/i, "mutual generosity and trust deepening into something more consistent over time")
      .replace(/^grace around how you are showing up in the relationship$/i, "a gentler tone in how you are showing up")
      .replace(/^how you are showing up in the relationship in closure$/i, "how you are showing up as something that has already begun to close")
      .replace(/^how you are showing up in the relationship under closure$/i, "how you are showing up inside a bond that is already going quiet")
      .replace(/^how you are showing up in the relationship in improvement or movement$/i, "gradual renewal in how you are showing up, and what shifts when your own approach updates")
      .replace(/^closure, ending, or rest moving through repetition$/i, "an ending or withdrawal being held in a pattern that keeps repeating instead of resolving")
      .replace(/^reliable support around how you are showing up in the relationship$/i, "dependable support and friendship grounding how you are showing up in the bond")
      .replace(/^how you are showing up in the relationship under clearer momentum$/i, "how you are showing up becoming steadier and more readable as things begin to clear")
      .replace(/^repeated friction and pressure in repeated strain and attrition$/i, "ongoing friction and pressure feeding directly into the drain and wear already present")
      .replace(/^uncertainty and mixed signals moving through closure$/i, "mixed signals and unclear intentions pressing toward an ending or cold withdrawal")
      .replace(/^power around incoming movement or news$/i, "movement that gains momentum once something concrete arrives")
      .replace(/^obstacle or delay in obstruction$/i, "delay and emotional blockage")
      .replace(/^a message, record, or document under erosion and stress$/i, "strained communication and what is wearing thin")
      .replace(/^love trying to take a stable form, where affection starts asking for continuity, reciprocity, and a bond that can hold in real life$/i, "a bond wanting clearer shape, continuity, and mutual follow-through")
      .replace(/^slow growth around maturity and restraint$/i, "slow, steadier growth through maturity and restraint")
      .replace(/^distance or reserve in decisive cuts$/i, "distance or reserve hardening as a decision can no longer be put off")
      .replace(/^your side of the relationship around slower, steadier growth$/i, "slower, steadier growth in your part of the relationship")
      .replace(/^pressure moving through official structures, boundaries, or a system that keeps the tension in place$/i, "emotional distance being held in place by structure or a boundary neither person is currently moving around")
      .replace(/^movement, distance, or transition\b/i, "movement")
      .replace(/^structure, distance, or institution\b/i, "distance or reserve")
      .replace(/^nervous communication\b/i, "anxious communication and reactive talk in the bond")
      .replace(/^closure, ending, or rest\b/i, "an ending or withdrawal in the bond")
      .replace(/^burden and meaning\b/i, "real weight in the bond")
      .replace(/^obstacle or delay\b/i, "a genuine blocker or stall in the bond")
      .replace(/^a sharp decision or cut\b/i, "a necessary decision or boundary in the bond")
      .replace(/^choice and branching paths\b/i, "a real fork or choice in the relationship")
      .replace(/^a solution or unlock\b/i, "the actual answer or opening in the bond")
      .replace(/^heart, value, or feeling\b/i, "what genuinely matters in the bond")
      .replace(/^guidance\b/i, "clearer direction in the relationship")
      .replace(/^a newly forming situation\b/i, "an early-stage opening in the relationship")
      .replace(/^endurance\b/i, "staying power and commitment in the bond")
      .replace(/^resource flow\b/i, "practical support and what is actually moving in the bond")
      .replace(/^social or public life\b/i, "the wider social field around the relationship")
      .replace(/^your own field\b/i, "where you stand in the relationship")
      .replace(/^your own position\b/i, "where you stand in the relationship");
  }

  if (subjectId === "general_reading") {
    rewritten = rewritten
      .replace(/^fog and uncertainty in erosion and stress$/i, "uncertainty thickening because repeated strain is already wearing the situation down")
      .replace(/^values and love around constructive change$/i, "useful change beginning around what genuinely matters")
      .replace(/^erosion, worry, or leakage in your own field$/i, "repeated strain and leakage building around the part you can actually influence")
      .replace(/^your own stance in the relationship\b/i, "your own stance in the wider situation")
      .replace(/^your own position in the bond\b/i, "your own position in the wider situation")
      .replace(/^how you are showing up in the relationship\b/i, "your own position in the wider situation")
      .replace(/^your own position moving through erosion and stress$/i, "your own position being worn down by repeated strain")
      .replace(/^a small beginning with more promise in it than its size suggests$/i, "a small beginning that could matter more than it first appears")
      .replace(/^your own position moving through closure$/i, "your own position passing through a needed ending or pause")
      .replace(/^slow growth and rooting in guidance$/i, "slower, steadier growth once the direction is clearer")
      .replace(/^a stopped place made heavier by delay, distance, or the feeling of no easy passage$/i, "a blocked stretch that feels heavier because nothing is moving easily yet")
      .replace(/^your own position under slow growth$/i, "your own position settling into a slower, steadier pace")
      .replace(/^complication or mixed motives under choice$/i, "mixed motives complicating a decision that cannot stay open forever")
      .replace(/^your role meeting a newly forming situation, where what you do first matters more than what you promise later$/i, "your role meeting something new enough that the first steps matter more than promises")
      .replace(/^caution and self-interest moving through the meaningful burden$/i, "defensive strategy building around something weighty or consequential")
      .replace(/^values and love around a small opening$/i, "a small opening around what genuinely matters")
      .replace(/^burden and meaning under structure$/i, "real pressure being held in place by structure, duty, or rigid conditions")
      .replace(/^burden and meaning under strategy$/i, "real emotional weight filtered through defensiveness or guarded self-protection")
      .replace(/^burden and meaning under caution$/i, "emotional weight being tightened further by defensiveness or overcareful handling")
      .replace(/^incoming momentum around heart, value, or feeling$/i, "movement beginning around what feels genuinely important")
      .replace(/^what genuinely matters around incoming movement or a concrete update$/i, "genuine feeling beginning to move as something concrete finally arrives")
      .replace(/^(?:warmth, goodwill, or a friendlier response|grace, goodwill, or invitation) in what genuinely matters$/i, "warmth and genuine receptivity landing where the bond is actually asking for something real")
      .replace(/^power around maturity and restraint$/i, "the protective or steadying side of the bond becoming more sustainable through patience and restraint")
      .replace(/^stability and endurance in what genuinely matters$/i, "the stability that comes from staying close to what genuinely matters in the bond")
      .replace(/^a sharp decision or cut under strategy$/i, "a needed boundary or clean cut being complicated by guarded strategy or mixed motives")
      .replace(/^a sharp decision or cut moving through caution$/i, "a needed boundary or decisive conversation being slowed by overcareful handling or self-protective hesitation")
      .replace(/^(?:defensive caution and guarded self-interest|caution and self-interest) (?:in|under) strategy$/i, "self-protective caution feeding into guarded strategy and keeping both in place")
      .replace(/^improvement or movement around a solution or unlock$/i, "a clearer answer beginning to come into view once the bond has room to move")
      .replace(/^a small opening under slow growth$/i, "a small but real opening that asks for patience rather than force")
      .replace(/^uncertainty and mixed signals in repeated strain and attrition$/i, "mixed signals and uncertainty being worn down further by repeated small hurts and ongoing drain")
      .replace(/^(?:complication or )?mixed motives under caution$/i, "mixed motives and defensive caution complicating the wider picture")
      .replace(/^maturity around your own position$/i, "steadier judgment gathering around your own position")
      .replace(/^nervous communication moving through erosion and stress$/i, "anxious discussion feeding an already worn-down situation")
      .replace(/^constructive change under values and love$/i, "constructive change around what genuinely matters")
      .replace(/^(?:complication or )?mixed motives in the meaningful burden$/i, "mixed motives gathering around something already weighty or consequential")
      .replace(/^endurance around your own position$/i, "staying power gathering around your own position")
      .replace(/^repetition and tension in erosion and stress$/i, "repeated strain intensifying what is already being worn down")
      .replace(/^improvement or movement around clarity and visible progress$/i, "movement beginning once the picture is clearer and easier to trust")
      .replace(/^power or resource control under clarity and success$/i, "clearer leverage or steadier support beginning to come into view")
      .replace(/^a sharp decision or cut moving through closure$/i, "a necessary cut arriving as something already nears its end")
      .replace(/^your own position under improvement or movement$/i, "your own position beginning to move into a better pattern")
      .replace(/^choice and branching paths under erosion and stress$/i, "a decision point complicated by repeated strain and attrition")
      .replace(/^your own position under the answer point$/i, "your own position gathering around the clearest available answer")
      .replace(/^(?:complication or )?mixed motives moving through repetition$/i, "mixed motives feeding a pattern that keeps replaying")
      .replace(/^stability and endurance in maturity$/i, "steadier footing through maturity and what can actually hold")
      .replace(/^nervous communication under obstruction$/i, "anxious discussion gathering around a real blockage or delay")
      .replace(/^grace, goodwill, or invitation in the public field$/i, "a more helpful tone becoming visible in the wider field")
      .replace(/^fog and uncertainty under closure$/i, "uncertainty gathering around something that may already be ending or withdrawing")
      .replace(/^guidance around your own position$/i, "clearer direction beginning to gather around your own position")
      .replace(/^closure, ending, or rest moving through what is hidden$/i, "something hidden reaching an ending, pause, or needed withdrawal")
      .replace(/^your own position in support and loyalty$/i, "steadier support gathering around your own position")
      .replace(/^nervous communication in commitment$/i, "anxious discussion inside an obligation, agreement, or repeating pattern")
      .replace(/^(?:complication or )?mixed motives (?:in|under) strategy$/i, "mixed motives and guarded self-interest reinforcing each other")
      .replace(/^expansion around how you are showing up in the relationship$/i, "a little more room opening around how you are showing up, and what that makes available")
      .replace(/^(?:complication or )?mixed motives moving through closure$/i, "mixed motives gathering around something that may already be ending or withdrawing")
      .replace(/^improvement or movement around your own position$/i, "movement beginning once your own stance starts changing")
      .replace(/^closure, ending, or rest moving through communication and nerves$/i, "an ending, pause, or withdrawal being complicated by anxious discussion")
      .replace(/^heart, value, or feeling under maturity$/i, "clearer values emerging through maturity and restraint")
      .replace(/^pressure moving through official structures, boundaries, or a system that keeps the tension in place$/i, "pressure being held in place by structure, distance, or rigid terms")
      .replace(/^incoming movement or news under the public field$/i, "movement beginning once something visible or public finally shifts")
      .replace(/^the public field around clarity and visible progress$/i, "clearer visibility in the wider field once the process is easier to trust")
      .replace(/^repetition and tension under strategy$/i, "a repeated pattern being reinforced by defensive strategy")
      .replace(/^maturity and restraint under endurance$/i, "steadier footing through restraint and what can actually hold")
      .replace(/^emotional weather or recognition under communication and nerves$/i, "anxious discussion destabilizing how the situation is being read")
      .replace(/^your own position under support and loyalty$/i, "steadier support gathering around your own position")
      .replace(/^support and loyalty around your own position$/i, "steadier support gathering around your own position")
      .replace(/^fog and uncertainty in structure$/i, "uncertainty gathering inside a rigid arrangement or fixed set of conditions")
      .replace(/^maturity around maturity and restraint$/i, "maturity and restraint beginning to steady the wider situation")
      .replace(/^erosion, worry, or leakage moving through structure$/i, "slow drain eating into the structure that should be holding this together")
      .replace(/^stability and foundations under a small opening$/i, "a small opening around what can still hold")
      .replace(/^nervous communication under fog or uncertainty$/i, "anxious discussion thickening an already uncertain picture")
      .replace(/^your own position in maturity$/i, "steadier judgment gathering around your own position")
      .replace(/^resources and flow in values and love$/i, "practical support gathering around what genuinely matters")
      .replace(/^erosion, worry, or leakage under erosion and stress$/i, "repeated drain feeding a situation that is already being worn down")
      .replace(/^heart, value, or feeling in values and love$/i, "what genuinely matters beginning to show itself more clearly")
      .replace(/^reliable support in improvement or movement$/i, "reliable support gathering around a change already underway")
      .replace(/^caution and self-interest in decisive cuts$/i, "defensive caution gathering around a decision that may need to be made cleanly")
      .replace(/^your role meeting something new enough that the first steps matter more than promises$/i, "something new enough that first actions matter more than promises")
      .replace(/^caution and self-interest in communication and nerves$/i, "defensive caution feeding anxious discussion")
      .replace(/^expansion around your own position$/i, "more room beginning to open around your own position")
      .replace(/^nervous communication moving through the other person's field$/i, "anxious discussion being amplified by the other side of events")
      .replace(/^values and love around heart, value, or feeling$/i, "what genuinely matters becoming harder to ignore")
      .replace(/^complication or mixed motives under structure$/i, "mixed motives being held in place by rigid roles, structure, or conditions")
      .replace(/^maturity around a small opening$/i, "a small opening that still asks for maturity and restraint")
      .replace(/^complication or mixed motives moving through the meaningful burden$/i, "mixed motives moving inside something already weighty and consequential")
      .replace(/^your own position in endurance$/i, "your own position being tested for staying power")
      .replace(/^complication or mixed motives in resource flow$/i, "mixed motives and unclear pressures affecting the practical flow of the situation")
      .replace(/^grace, goodwill, or invitation under documents and messages$/i, "a more helpful tone beginning to show itself through clearer messages or details")
      .replace(/^caution and self-interest in caution$/i, "self-protective caution tightening the whole picture")
      .replace(/^your own position under erosion and stress$/i, "your own position being worn down by repeated strain")
      .replace(/^a small opening under clarity and success$/i, "a small opening once the picture is clearer and easier to trust")
      .replace(/^caution and self-interest moving through repetition$/i, "defensive caution feeding a pattern that keeps replaying")
      .replace(/^your own position under expansion$/i, "more room beginning to open around your own position")
      .replace(/^complication or mixed motives in repetition$/i, "mixed motives feeding a pattern that keeps replaying")
      .replace(/^your own field around constructive change$/i, "constructive change beginning around your own position")
      .replace(/^movement, distance, or transition under maturity$/i, "movement beginning, but only if it is paced with maturity and restraint")
      .replace(/^nervous communication in the other person's field$/i, "anxious discussion being amplified by the other side of events")
      .replace(/^reliable support under your own field$/i, "steadier support gathering around your own position")
      .replace(/^closure, ending, or rest under decisive cuts$/i, "an ending or withdrawal being sharpened by one necessary decision")
      .replace(/^maturity and restraint under your own field$/i, "steadier judgment gathering around your own position")
      .replace(/^repetition and tension under decisive cuts$/i, "a pattern of friction being sharpened by decisions that cannot stay deferred")
      .replace(/^slow growth and rooting under incoming momentum$/i, "slower, steadier growth beginning once movement finally starts")
      .replace(/^erosion, worry, or leakage moving through the other person's field$/i, "repeated drain and uncertainty gathering around the other side of the situation")
      .replace(/^endurance around a small opening$/i, "a small opening that could still hold if handled steadily")
      .replace(/^nervous communication\b/i, "anxious discussion and reactive noise in the situation")
      .replace(/^closure, ending, or rest\b/i, "something reaching its natural limit or needing a pause")
      .replace(/^burden and meaning\b/i, "real weight and what it demands")
      .replace(/^obstacle or delay\b/i, "a genuine blocker or delay in the situation")
      .replace(/^a sharp decision or cut\b/i, "a necessary decision or boundary")
      .replace(/^choice and branching paths\b/i, "a real fork or open decision")
      .replace(/^a solution or unlock\b/i, "the actual answer or opening")
      .replace(/^heart, value, or feeling\b/i, "what genuinely matters")
      .replace(/^movement, distance, or transition\b/i, "movement or a change of direction")
      .replace(/^structure, distance, or institution\b/i, "formal structure, distance, or institutional pressure")
      .replace(/^guidance\b/i, "clearer direction and signal")
      .replace(/^a newly forming situation\b/i, "an early-stage opening")
      .replace(/^endurance\b/i, "staying power and what can hold")
      .replace(/^resource flow\b/i, "practical resources and what is actually moving")
      .replace(/^social or public life\b/i, "the wider social or public field")
      .replace(/^your own field\b/i, "your own stance in the wider situation")
      .replace(/^your own position\b/i, "your own stance in the wider situation");
  }

  if (subjectId === "spiritual") {
    rewritten = kind === "opening"
      ? rewriteSpiritualOpeningResiduals(rewritten)
      : rewriteSpiritualPressureResiduals(rewritten);
  }

  if (subjectId === "community") {
    rewritten = kind === "opening"
      ? rewriteCommunityOpeningResiduals(rewritten)
      : rewriteCommunityPressureResiduals(rewritten);
    rewritten = rewriteSocialFragmentResiduals(rewritten, "community");
  }

  if (subjectId === "pets") {
    rewritten = kind === "opening"
      ? rewritePetsOpeningResiduals(rewritten)
      : rewritePetsPressureResiduals(rewritten);
  }

  if (subjectId === "friends_social") {
    rewritten = rewritten
      .replace(/^a message, record, or document moving through communication and nerves$/i, "an important message or detail getting tangled in anxious talk, crossed signals, or too much discussion")
      .replace(/^a solution or unlock under a newly forming situation$/i, "a workable answer starting to show in a social situation still taking shape")
      .replace(/^obstacle or delay in obstruction$/i, "a real social blockage or delay that has to be worked patiently rather than forced")
      .replace(/^obstacle or delay under obstruction$/i, "social delay running into a blockage that does not move just because it is named")
      .replace(/^clarity and success around your own position$/i, "clearer momentum beginning around your own social position")
      .replace(/^stability and endurance in erosion and stress$/i, "something meant to hold socially being tested by repeated strain and attrition")
      .replace(/^clarity and success around incoming movement or news$/i, "clearer momentum gathering once new contact or movement actually arrives")
      .replace(/^structure, distance, or institution moving through erosion and stress$/i, "distance, structure, or formal boundaries being steadily worn down by repeated social strain")
      .replace(/^the answer point around reliable support$/i, "a clarifying answer emerging through the support that is actually dependable")
      .replace(/^improvement or movement around maturity and restraint$/i, "movement becoming possible through maturity, restraint, and steadier social judgment")
      .replace(/^your own position under fog or uncertainty$/i, "your own social position sitting inside mixed signals, ambiguity, or too little clarity")
      .replace(/^constructive change under slow growth$/i, "constructive change becoming possible through slower trust and steadier belonging")
      .replace(/^repetition and tension under obstruction$/i, "social friction getting trapped inside a blockage that has still not been worked through cleanly")
      .replace(/^heart, value, or feeling under expansion$/i, "what genuinely matters beginning to get more room to move in the social field")
      .replace(/^fog and uncertainty under erosion and stress$/i, "social uncertainty getting thicker because repeated strain and drain are already wearing the dynamic down")
      .replace(/^guidance and signal in clarity and success$/i, "clearer direction starting to hold once the social picture is easier to trust")
      .replace(/^erosion, worry, or leakage under structure$/i, "social drain building inside rigid roles, fixed expectations, or a structure that is no longer helping the dynamic hold")
      .replace(/^closure, ending, or rest under communication and nerves$/i, "a pause, ending, or social withdrawal being made harder by anxious talk, crossed signals, or too much chatter")
      .replace(/^closure, ending, or rest moving through the meaningful burden$/i, "a pause, ending, or withdrawal gathering around a friendship or group tension that already carries real weight")
      .replace(/^grace, goodwill, or invitation in support and loyalty$/i, "goodwill and a softer social tone beginning to show through the people or ties that are actually dependable")
      .replace(/^nervous communication moving through the answer point$/i, "anxious talk crowding the very point where clarity is trying to emerge")
      .replace(/^a small beginning in values and love$/i, "a small beginning around what genuinely matters in the friendship")
      .replace(/^fog and uncertainty in closure$/i, "social uncertainty gathering around a pause, ending, or quiet withdrawal that has not yet been understood cleanly")
      .replace(/^erosion, worry, or leakage in repetition$/i, "repeated social drain getting trapped in the same loop instead of being resolved")
      .replace(/^grace, goodwill, or invitation in improvement or movement$/i, "a warmer social response beginning to show as the dynamic starts moving in a healthier direction")
      .replace(/^improvement or movement around a solution or unlock$/i, "movement beginning to gather around a workable answer or way through")
      .replace(/^your own position under communication and nerves$/i, "your own social position getting tangled in too much chatter, nerves, or crossed signals")
      .replace(/^a small but real opening around grace, goodwill, or invitation$/i, "a small but real opening through warmth, goodwill, or a friendlier social response")
      .replace(/^a sharp decision or cut in strategy$/i, "a necessary social cut being shaped by guarded strategy, overmanagement, or self-protective positioning")
      .replace(/^a sharp decision or cut moving through strategy$/i, "a necessary social cut being shaped by guarded strategy, overmanagement, or self-protective positioning")
      .replace(/^erosion, worry, or leakage under decisive cuts$/i, "social drain gathering around a decision or boundary that can no longer stay deferred")
      .replace(/^slow growth around your own position$/i, "slower trust and steadier belonging gathering around your own social position")
      .replace(/^caution and self-interest moving through caution$/i, "defensive caution tightening around itself until the social dynamic gets even harder to read cleanly")
      .replace(/^your own position under power$/i, "your own social position gaining firmer ground through clearer leverage and stronger backing")
      .replace(/^your own position in grace$/i, "your own social position being met with more goodwill, warmth, or receptivity")
      .replace(/^caution and self-interest in communication and nerves$/i, "defensive caution feeding anxious talk, crossed signals, or too much social overprocessing")
      .replace(/^slow growth and rooting in expansion$/i, "slower trust and steadier belonging beginning to gain more room to develop")
      .replace(/^fog and uncertainty under structure$/i, "social uncertainty gathering inside a rigid arrangement, set of rules, or fixed dynamic")
      .replace(/^power around a small opening$/i, "a small opening around leverage, influence, or what can be guided more fairly")
      .replace(/^erosion, worry, or leakage in fog or uncertainty$/i, "repeated social drain being worsened by confusion, ambiguity, or too little clarity")
      .replace(/^a small opening under slow growth$/i, "a small opening around slower trust and steadier belonging")
      .replace(/^caution and self-interest under strategy$/i, "defensive caution being reinforced by too much social strategy or guarded management of the dynamic")
      .replace(/^mixed messages, gossip, or anxious conversation that can distort what is really happening$/i, "too many side conversations, mixed signals, or anxious talk distorting what is actually happening in the social field")
      .replace(/^your own position under a small opening$/i, "a small but usable opening around your own social position")
      .replace(/^your own position under grace$/i, "your own social position being met with more goodwill, warmth, or receptivity")
      .replace(/^grace around your own position$/i, "a warmer social response beginning to gather around your own position")
      .replace(/^erosion, worry, or leakage in communication and nerves$/i, "social drain being worsened by too much anxious talk, crossed signals, or mental noise in the group")
      .replace(/^the public field around your own position$/i, "the visible social field beginning to gather around your own position")
      .replace(/^fog and uncertainty under strategy$/i, "social uncertainty being made worse by guarded strategy, overmanagement, or too much careful positioning")
      .replace(/^commitment question or repeating terms under a small opening$/i, "a small opening around the terms, commitments, or repeating pattern that now need clearer handling")
      .replace(/^hidden knowledge or secrecy under communication and nerves$/i, "what is being withheld or kept private getting tangled in too much chatter, nerves, or crossed signals")
      .replace(/^a small opening around your own position$/i, "a small but usable opening around your own social position")
      .replace(/^closure, ending, or rest moving through what is hidden$/i, "a pause or ending gathering around what has stayed hidden, private, or unspoken between people")
      .replace(/^closure, ending, or rest under what is hidden$/i, "a pause or ending gathering around what has stayed hidden, private, or unspoken between people")
      .replace(/^maturity and restraint in improvement or movement$/i, "maturity and restraint helping the social dynamic move in a cleaner direction")
      .replace(/^emotional weather or recognition moving through communication and nerves$/i, "social visibility and emotional tone being pulled through too much chatter, nerves, or crossed signals")
      .replace(/^your own position in the public field$/i, "your own social position becoming easier to read in the visible social field")
      .replace(/^structure, distance, or institution in fog or uncertainty$/i, "distance, formal structure, or fixed social roles staying too unclear to read cleanly")
      .replace(/^what is hidden around heart, value, or feeling$/i, "what is still private around what genuinely matters in the friendship")
      .replace(/^obstacle or delay in repetition$/i, "a stalled pattern that keeps replaying instead of resolving")
      .replace(/^clarity and visible progress in your own field$/i, "clearer movement becoming visible once your own social position is easier to read")
      .replace(/^caution and self-interest under decisive cuts$/i, "defensive caution gathering around a social decision that needs to be made more cleanly")
      .replace(/^power or resource control under a small opening$/i, "a small opening around leverage, influence, or what can actually be guided more responsibly")
      .replace(/^events beginning to move the moment your own stance becomes clear$/i, "movement beginning once your own social stance becomes clear")
      .replace(/^complication feeding anxiety, attrition, or the slow damage done by what keeps slipping sideways$/i, "mixed motives steadily worsening the strain, anxiety, and social wear already in the field")
      .replace(/^grace, goodwill, or invitation under slow growth$/i, "a more welcoming tone as trust regrows slowly")
      .replace(/^grace, goodwill, or invitation under values and love$/i, "a warmer social response beginning to gather around what genuinely matters")
      .replace(/^a small opening in values and love$/i, "a small opening around what genuinely matters in the friendship")
      .replace(/^slow growth and rooting under improvement or movement$/i, "slower trust and steadier belonging taking root as the social dynamic starts moving in a healthier direction")
      .replace(/^complication or mixed motives under caution$/i, "mixed motives and defensive caution complicating the social dynamic")
      .replace(/^power around your own position$/i, "clearer leverage and stronger footing gathering around your own social position")
      .replace(/^slow growth and rooting in values and love$/i, "slower trust regrowing around what genuinely matters")
      .replace(/^nervous communication under communication and nerves$/i, "social chatter feeding on itself and making the signal harder to read")
      .replace(/^resources and flow in support and loyalty$/i, "reciprocity and practical support gathering inside the relationships that actually hold")
      .replace(/^caution and self-interest moving through closure$/i, "defensive caution gathering around a social pause, ending, or withdrawal")
      .replace(/^your own position in expansion$/i, "a little more freedom beginning to gather around your own social position")
      .replace(/^improvement or movement around incoming movement or news$/i, "movement beginning once something concrete finally arrives")
      .replace(/^your own position in commitment$/i, "your own social position inside a pattern, agreement, or repeated social dynamic that needs conscious terms")
      .replace(/^a sharp decision or cut moving through communication and nerves$/i, "a necessary social cut being complicated by too much chatter, nerves, or crossed signals")
      .replace(/^slow growth and rooting under clarity and success$/i, "slower trust and steadier belonging becoming possible once the social picture is clearer")
      .replace(/^complication or mixed motives moving through obstruction$/i, "mixed motives running into blockage, distance, or a social dynamic that is not moving cleanly")
      .replace(/^clarity and visible progress in expansion$/i, "clearer movement becoming visible as the social field starts opening up")
      .replace(/^erosion, worry, or leakage moving through caution$/i, "slow social drain being worsened by overcaution, guardedness, or second-guessing")
      .replace(/^your own position in values and love$/i, "your own social position getting pulled back toward what genuinely matters")
      .replace(/^structure, distance, or institution under erosion and stress$/i, "distance, structure, or formal boundaries being worn down by repeated social strain")
      .replace(/^maturity and restraint under improvement or movement$/i, "maturity and restraint beginning to help the social dynamic move in a cleaner direction")
      .replace(/^a small but real opening around slow growth and rooting$/i, "a small but real opening around slower trust and steadier belonging")
      .replace(/^erosion, worry, or leakage under closure$/i, "repeated social drain gathering around a pause, ending, or quiet withdrawal")
      .replace(/^guidance around your own position$/i, "clearer social direction beginning to gather around your own position")
      .replace(/^stability and endurance moving through erosion and stress$/i, "something meant to hold socially being worn down by repeated strain")
      .replace(/^your role meeting a newly forming situation, where what you do first matters more than what you promise later$/i, "a new social beginning where first actions matter more than promises")
      .replace(/^a stopped place made heavier by delay, distance, or the feeling of no easy passage$/i, "a stalled social dynamic feeling heavier because there is still no easy way through it")
      .replace(/^a sharp decision or cut under what is hidden$/i, "a hard social choice landing around what is still unsaid, obscured, or not fully visible")
      .replace(/^a sharp decision or cut in erosion and stress$/i, "a necessary social cut landing in a situation already worn down by repeated strain")
      .replace(/^caution and self-interest in decisive cuts$/i, "defensive caution gathering around a social decision that needs to be made more cleanly")
      .replace(/^repetition and tension in decisive cuts$/i, "social friction tightening around a decision or boundary that can no longer stay deferred")
      .replace(/^heart, value, or feeling in expansion$/i, "what genuinely matters getting more room to move in the social field")
      .replace(/^emotional weather or recognition under obstruction$/i, "social visibility and emotional tone running into a real blockage or delay")
      .replace(/^your own role caught in complication, mixed motives, or a dynamic that needs clearer boundaries$/i, "your own social position caught in mixed motives or a dynamic that needs clearer boundaries")
      .replace(/^your own position under support and loyalty$/i, "steadier support gathering around your own social position")
      .replace(/^support and loyalty around your own position$/i, "steadier support gathering around your own social position")
      .replace(/^grace, goodwill, or invitation under guidance$/i, "a more welcoming social tone beginning to show once the direction feels clearer")
      .replace(/^your own position in the answer point$/i, "your own social position becoming the clearest answer you can actually work from")
      .replace(/^your own position in your own field$/i, "your own social position becoming the clearest ground you can actually work from")
      .replace(/^your own position moving through communication and nerves$/i, "your own social position being pulled through too much chatter, nerves, or crossed signals")
      .replace(/^improvement or movement around clarity and visible progress$/i, "movement beginning once the social picture is clearer and easier to trust")
      .replace(/^complication or mixed motives in decisive cuts$/i, "mixed motives complicating a decision that needs to be made more cleanly")
      .replace(/^erosion, worry, or leakage under choice$/i, "social drain gathering around a decision point that still has not been handled cleanly")
      .replace(/^clarity and success around guidance and signal$/i, "clearer direction beginning to hold because the social picture is easier to trust")
      .replace(/^obstacle or delay in erosion and stress$/i, "delay or blockage getting heavier because repeated strain is already wearing the dynamic down")
      .replace(/^fog and uncertainty in erosion and stress$/i, "social uncertainty thickening because repeated strain and wear are already getting harder to ignore")
      .replace(/^heart, value, or feeling in values and love$/i, "what genuinely matters becoming clearer at the emotional center of the friendship")
      .replace(/^caution and self-interest under fog or uncertainty$/i, "defensive caution getting worse because too much in the social field still feels unclear")
      .replace(/^incoming movement or news under incoming momentum$/i, "new contact or movement beginning to matter because the social field is finally starting to shift")
      .replace(/^your own position under closure$/i, "your own social position gathering around a pause, ending, or quiet withdrawal")
      .replace(/^heart, value, or feeling in support and loyalty$/i, "what genuinely matters becoming clearer through the people or ties that actually hold")
      .replace(/^fog and uncertainty in structure$/i, "social uncertainty gathering inside fixed roles, rigid expectations, or a structure that is too hard to read cleanly")
      .replace(/^constructive change in maturity$/i, "constructive change becoming possible through maturity, restraint, and steadier social judgment")
      .replace(/^a sharp decision or cut moving through fog or uncertainty$/i, "a necessary social cut being made harder by uncertainty, mixed signals, or too little clarity")
      .replace(/^a solution or unlock under support and loyalty$/i, "a way through beginning to show itself through the ties or support that are actually dependable")
      .replace(/^nervous communication in what is hidden$/i, "anxious talk gathering around what is still private, unclear, or not yet fully said")
      .replace(/^reliable support in values and love$/i, "reliable support gathering around what genuinely matters in the friendship")
      .replace(/^complication or mixed motives under the public field$/i, "mixed motives getting amplified once the social dynamic is exposed to the wider field")
      .replace(/^a newly forming situation around guidance and signal$/i, "a new social beginning gathering around clearer direction and a signal that is easier to trust")
      .replace(/^repetition and tension under caution$/i, "social friction staying stuck because caution keeps feeding the same pattern")
      .replace(/^values and love around the commitment question or repeating terms$/i, "what genuinely matters gathering around the commitments or repeating terms that now need clearer handling")
      .replace(/^clarity and visible progress under a small opening$/i, "clearer social movement beginning through a small opening that can still be used well")
      .replace(/^fog and uncertainty under recognition$/i, "social visibility and emotional tone being made harder to read by uncertainty, mixed signals, or too little clarity")
      .replace(/^clarity and success around constructive change$/i, "clearer momentum gathering as the social dynamic starts changing in a healthier direction")
      .replace(/^complication or mixed motives in closure$/i, "mixed motives gathering around a pause, ending, or quiet withdrawal that has not been handled cleanly")
      .replace(/^your own position under slow growth$/i, "your own social position having to regrow more slowly, steadily, and with less forcing")
      .replace(/^nervous communication in recognition$/i, "anxious talk shaping the social visibility and emotional weather around the friendship")
      .replace(/^your own position under values and love$/i, "your own social position getting pulled back toward what genuinely matters in the friendship")
      .replace(/^caution and self-interest in obstruction$/i, "defensive caution and guarded self-interest making an already blocked social dynamic even harder to move")
      .replace(/^maturity around your own position$/i, "steadier social judgment gathering around your own position")
      .replace(/^a sharp decision or cut moving through closure$/i, "a necessary social cut arriving as a pause, ending, or withdrawal becomes unavoidable")
      .replace(/^structure, distance, or institution under communication and nerves$/i, "distance, fixed roles, or formal social structure being made harder by anxious talk, crossed signals, or too much chatter")
      .replace(/^social or public life feeding long-term growth more than first appearances suggest$/i, "the wider social field helping trust and belonging grow more steadily than first appearances suggest")
      .replace(/^burden and meaning in caution$/i, "a weighty social issue being tightened further by defensiveness, guardedness, or overcareful handling")
      .replace(/^values and love around movement, distance, or transition$/i, "what genuinely matters gathering around movement, distance, or a social change already underway")
      .replace(/^clarity and success around reliable support$/i, "clearer momentum beginning to show through the support that is actually dependable")
      .replace(/^closure, ending, or rest moving through erosion and stress$/i, "a pause, ending, or social withdrawal forming inside a dynamic already worn down by repeated strain")
      .replace(/^incoming movement or news under slow growth$/i, "new contact or movement beginning to matter as trust regrows more slowly and steadily")
      .replace(/^fog and uncertainty in strategy$/i, "social uncertainty being intensified by guarded strategy, self-protective positioning, or too much management of the dynamic")
      .replace(/^nervous communication under what is hidden$/i, "anxious talk gathering around what is still private, unspoken, or not yet clearly known")
      .replace(/^endurance around your own position$/i, "steadier staying power gathering around your own social position")
      .replace(/^your own position in closure$/i, "your own social position moving into a needed pause, ending, or quiet withdrawal")
      .replace(/^guidance around incoming movement or news$/i, "clearer direction beginning to show through new contact, updates, or movement in the social field")
      .replace(/^a small but real opening around your own position$/i, "a small but real opening around your own social position")
      .replace(/^fog and uncertainty in the meaningful burden$/i, "social uncertainty gathering around a friendship or group tension that already carries real weight")
      .replace(/^fog and uncertainty in the other person's field$/i, "the other person's position being obscured by mixed signals, unclear motives, or uncertain availability")
      .replace(/^emotional weather or recognition under erosion and stress$/i, "social visibility and emotional tone being worn down by repeated strain")
      .replace(/^the answer point around heart, value, or feeling$/i, "a clarifying moment around what genuinely matters in the friendship")
      .replace(/^grace around incoming movement or news$/i, "a more workable social tone gathering around a fresh development or new movement")
      .replace(/^slow growth and rooting under values and love$/i, "slower trust and steadier belonging gathering around what still feels genuine and worth protecting")
      .replace(/^complication or mixed motives moving through structure$/i, "mixed motives getting reinforced by group roles, social structure, or the way the dynamic is currently set up")
      .replace(/^obstacle or delay under communication and nerves$/i, "social delay being worsened by anxious talk, crossed signals, or too many unsettled exchanges")
      .replace(/^closure, ending, or rest in what is hidden$/i, "a pause or ending around what has stayed unspoken between people")
      .replace(/^closure, ending, or rest moving through communication and nerves$/i, "a pause, ending, or social withdrawal being complicated by too much anxious talk")
      .replace(/^a small opening in clarity and success$/i, "a small opening once the social picture is clearer and easier to trust")
      .replace(/^a small opening in power$/i, "a small opening around leverage, influence, or what can actually be guided more fairly")
      .replace(/^a small opening in slow growth$/i, "a small opening for slower trust and steadier belonging to take hold")
      .replace(/^clarity and success around movement, distance, or transition$/i, "clearer movement beginning once the social dynamic starts changing in visible ways")
      .replace(/^reliable support under grace$/i, "reliable support beginning to show through goodwill, warmth, or a softer social tone")
      .replace(/^the answer point around your own position$/i, "the clearest answer beginning to gather around your own social position")
      .replace(/^your own position in maturity$/i, "steadier social judgment gathering around your own position")
      .replace(/^your own position under the public field$/i, "your own social position becoming easier to read in the visible social field")
      .replace(/^a small opening under your own field$/i, "a small but usable opening around your own social position")
      .replace(/^your own field$/i, "your own social position");

    rewritten = kind === "opening"
      ? rewriteFriendsSocialOpeningResiduals(rewritten)
      : rewriteFriendsSocialPressureResiduals(rewritten);
    rewritten = rewriteSocialFragmentResiduals(rewritten, "friends_social");
  }

  if (subjectId === "personal_growth") {
    rewritten = rewritten
      .replace(/^complication or mixed motives moving through the repeating inner loop$/i, "mixed motives getting trapped in the same inner loop instead of resolving")
      .replace(/^resources and flow under communication and nerves$/i, "support, energy, or forward movement getting tangled in anxious inner talk")
      .replace(/^a small opening under the visible social field$/i, "a small opening that gets clearer once the wider picture comes into view")
      .replace(/^mixed messages, gossip, or anxious conversation that can distort what is really happening$/i, "anxious talk and crossed signals distorting what is really happening inside you")
      .replace(/^the emotional truth\b/i, "what feels genuinely true")
      .replace(/^your own position in the bond\b/i, "your own stance")
      .replace(/^a small opening around your own position$/i, "a small opening around your own stance")
      .replace(/^improvement or movement around your own position$/i, "constructive change beginning around your own stance")
      .replace(/^emotional weather and self-image moving through layered motives and self-protective strategy$/i, "changing emotional weather tangled in self-protective strategy")
      .replace(/^guidance around your own position$/i, "clearer direction gathering around your own stance")
      .replace(/^maturity around your own position$/i, "steadier judgment gathering around your own stance")
      .replace(/^your own position moving through erosion and stress$/i, "your own stance being worn down by repeated inner strain")
      .replace(/^your own position under erosion and stress$/i, "your own stance being worn down by repeated inner strain")
      .replace(/^your own position under support and loyalty$/i, "steadier support gathering around your own stance")
      .replace(/^support and loyalty around your own position$/i, "steadier support gathering around your own stance")
      .replace(/^emotional weather and self-image moving through layered motives and self-protective strategy$/i, "changing emotional weather tangled in self-protective strategy")
      .replace(/^fog and uncertainty in fog or uncertainty$/i, "uncertainty feeding on itself")
      .replace(/^repeated inner drain in repeated strain and attrition$/i, "repeated inner drain and the low-grade attrition that goes with it")
      .replace(/^nervous communication under caution$/i, "anxious inner talk thickened by self-protective caution")
      .replace(/^anxious inner talk in communication and nerves$/i, "anxious inner talk feeding on itself")
      .replace(/^closure, ending, or rest in communication and nerves$/i, "an ending or withdrawal tangled in anxious inner talk")
      .replace(/^closure, ending, or rest in the repeating inner loop$/i, "an old pattern reaching the point where it has to stop repeating")
      .replace(/^emotional weather or recognition under communication and nerves$/i, "anxious inner talk destabilizing your emotional weather")
      .replace(/^documents or messages needing a close reading before trust is given$/i, "messages or assumptions needing a closer reading before you trust them")
      .replace(/^first movement under what can hold$/i, "first movement backed by what can actually hold")
      .replace(/^movement, distance, or transition under the answer point$/i, "movement beginning once the real answer is named plainly")
      .replace(/^movement, distance, or transition under clarity and success$/i, "movement beginning once the path is clear enough to trust")
      .replace(/^movement, distance, or transition in incoming momentum$/i, "movement beginning as something new finally takes hold")
      .replace(/^movement, distance, or transition in expansion$/i, "movement beginning as your life opens a little more")
      .replace(/^a sharp decision or cut under strategy$/i, "a necessary cut shaped by self-protective strategy")
      .replace(/^a sharp decision or cut moving through strategy$/i, "a necessary cut moving through self-protective strategy")
      .replace(/^a sharp decision or cut under communication and nerves$/i, "a necessary cut tangled in anxious inner talk")
      .replace(/^a sharp decision or cut moving through inner blockage or resistance$/i, "a necessary cut running straight into old resistance")
      .replace(/^events beginning to move the moment your own stance becomes clear$/i, "movement beginning once your own stance becomes clear")
      .replace(/^a small opening under values and love$/i, "a small opening around what genuinely matters")
      .replace(/^values and love around a small beginning$/i, "what genuinely matters finding room in a small new beginning")
      .replace(/^warmth and feeling brought fully into the light$/i, "what genuinely matters coming fully into view")
      .replace(/^clarity and visible progress under maturity$/i, "clearer progress once it is carried with maturity and steadier pacing")
      .replace(
        /^your role meeting a newly forming situation, where what you do first matters more than what you promise later$/i,
        "a newly forming version of yourself where first actions matter more than promises",
      )
      .replace(
        /^your own role caught in complication, mixed motives, or a dynamic that needs clearer boundaries$/i,
        "your own stance caught in mixed motives and a pattern that needs clearer boundaries",
      )
      .replace(/^complication or mixed motives under the meaningful burden$/i, "mixed motives complicating something that already carries real emotional weight")
      .replace(/^your own field around constructive change$/i, "constructive change beginning around your own stance")
      .replace(/^the other person's stance in caution$/i, "another person's stance being filtered through caution or defensiveness")
      .replace(/^the other person's stance under caution$/i, "another person's stance being filtered through caution or defensiveness")
      .replace(/^slow growth and rooting in maturity$/i, "slower, steadier growth through maturity and patience")
      .replace(/^clarity and visible progress under maturity$/i, "clearer progress once it is carried with maturity and steadier pacing")
      .replace(/^nervous communication\b/i, "anxious inner talk and reactive self-monitoring")
      .replace(/^closure, ending, or rest\b/i, "an old pattern reaching its natural limit")
      .replace(/^burden and meaning\b/i, "real inner weight and what it is asking you to carry")
      .replace(/^obstacle or delay\b/i, "a genuine internal blocker or delay")
      .replace(/^a sharp decision or cut\b/i, "a necessary inner boundary or honest break with an old pattern")
      .replace(/^choice and branching paths\b/i, "a real inner fork or choice")
      .replace(/^a solution or unlock\b/i, "the actual inner answer or opening")
      .replace(/^heart, value, or feeling\b/i, "what genuinely matters inwardly")
      .replace(/^movement, distance, or transition\b/i, "inner movement or a shift in direction")
      .replace(/^structure, distance, or institution\b/i, "outer structures or inherited patterns pressing on the inner work")
      .replace(/^guidance\b/i, "clearer inner direction and signal")
      .replace(/^a newly forming situation\b/i, "an early-stage inner opening")
      .replace(/^endurance\b/i, "inner staying power and what can hold over time")
      .replace(/^resource flow\b/i, "practical energy and what is actually moving")
      .replace(/^social or public life\b/i, "the wider social field touching the inner picture")
      .replace(/^your own field\b/i, "your own inner stance")
      .replace(/^your own position\b/i, "your own inner stance");
  }

  if (subjectId === "creative") {
    rewritten = rewritten
      .replace(/^erosion, worry, or leakage in the public creative field$/i, "creative drain building in the visible field around the work")
      .replace(/^caution and self-interest in fog or uncertainty$/i, "defensive creative habits thickening an already unclear picture")
      .replace(/^maturity around your own position$/i, "steadier craft and restraint gathering around your creative position")
      .replace(/^erosion, worry, or leakage under structure$/i, "creative drain building inside structures or routines that are no longer supporting the work")
      .replace(/^erosion, worry, or leakage moving through structure$/i, "creative drain eating into routines or structures that should be carrying the work instead of thinning it out")
      .replace(/^erosion, worry, or leakage moving through caution$/i, "creative drain being worsened by overcaution and second-guessing")
      .replace(/^erosion, worry, or leakage moving through creative strategy$/i, "creative drain being made worse by overmanaged strategy or too much guarding around the work")
      .replace(/^erosion, worry, or leakage under unclear direction$/i, "creative drain building because the direction is still too unclear to trust")
      .replace(/^nervous communication under unclear direction$/i, "creative chatter building because the direction is still too unclear to trust")
      .replace(/^nervous communication under blockage$/i, "creative chatter building inside a block that needs to be worked through rather than argued with")
      .replace(/^fog or uncertainty moving through blockage$/i, "creative uncertainty thickening around a block that still has to be worked rather than forced")
      .replace(/^fog or uncertainty moving through decisive cuts$/i, "creative uncertainty colliding with a hard cut or forced decision before the direction feels settled")
      .replace(/^nervous communication under your own creative field$/i, "creative chatter getting caught inside your own reactions and second-guessing")
      .replace(/^fog or uncertainty in unclear direction$/i, "creative direction staying too fogged to trust cleanly yet")
      .replace(/^fog or uncertainty under repeated friction$/i, "creative uncertainty being worsened by repeated friction and the same draining loop")
      .replace(/^obstacle or delay in drain$/i, "delay being made heavier by repeated drain and attrition")
      .replace(/^slow growth around constructive change$/i, "slower but real creative progress building through useful revision")
      .replace(/^slow growth around maturity and restraint$/i, "slow, steadier creative growth through restraint and more mature craft")
      .replace(/^slow growth around slow growth and rooting$/i, "slower growth gathering around what can genuinely take root")
      .replace(/^constructive change around a small beginning$/i, "constructive change gathering around a beginning small enough to shape well")
      .replace(/^the longer-view signal around a small beginning$/i, "the larger creative direction gathering around a beginning small enough to shape well")
      .replace(/^your own position under your own creative field$/i, "your own creative position becoming the clearest ground you can actually work from")
      .replace(/^your own position in your own creative field$/i, "your own creative position becoming the clearest ground you can actually work from")
      .replace(/^your own position in support and loyalty$/i, "steadier support gathering around your creative position")
      .replace(/^your own position in slow growth$/i, "your creative position being asked to trust slower growth that can actually hold")
      .replace(/^your own position moving through communication and nerves$/i, "your creative position being pulled through too much chatter, nerves, and crossed signal")
      .replace(/^your creative position being asked to trust slower growth that can actually hold$/i, "a slower creative pace that can actually hold")
      .replace(/^your creative process being worn down by repeated drain, attrition, or the little losses that keep stealing momentum$/i, "the work being steadily worn down by repeated drain and all the little losses stealing momentum")
      .replace(/^nervous communication moving through closure$/i, "creative chatter and overtalk forming around a process that may need a real pause or ending")
      .replace(/^nervous communication in communication and nerves$/i, "creative chatter feeding on itself until the work is harder to hear cleanly")
      .replace(/^nervous communication moving through creative strategy$/i, "creative chatter being intensified by overmanaged strategy or too much mental control around the work")
      .replace(/^nervous communication in documents and messages$/i, "creative chatter getting tangled in messages, notes, or recorded back-and-forth instead of helping the work move")
      .replace(/^nervous conversation caught in repetition, where talk can sharpen rather than settle the issue$/i, "creative chatter getting stuck in the same loop, where talking about the work is starting to replace moving it")
      .replace(/^mixed messages, gossip, or anxious conversation that can distort what is really happening$/i, "creative chatter, crossed signals, and anxious overtalk distorting what the work is actually asking for")
      .replace(/^guidance and signal under support and loyalty$/i, "clearer direction gathering because the right support is holding")
      .replace(/^an encouraging response in visible traction$/i, "an encouraging response gathering around the traction that is already starting to show")
      .replace(/^repetition and tension in blockage$/i, "repetition and strain getting trapped inside the block instead of loosening it")
      .replace(/^repetition and tension moving through what is hidden$/i, "creative repetition building around what is still hidden, withheld, or not yet fully named")
      .replace(/^repetition and tension under recognition cycle$/i, "creative strain getting pulled into the same visibility and recognition loop")
      .replace(/^repetition and tension under unclear direction$/i, "creative repetition building because the direction is still too unclear to trust cleanly")
      .replace(/^complication or mixed motives in repeated friction$/i, "creative complication getting intensified by the same repeating friction instead of being worked through cleanly")
      .replace(/^complication or mixed motives moving through decisive cuts$/i, "creative complication colliding with a hard cut or forced decision before the work is ready for it")
      .replace(/^a sharp decision or cut under creative complication$/i, "a hard creative choice being made inside layered complication, crossed motives, or too many agendas")
      .replace(/^choice and branching paths under creative complication$/i, "decision pressure getting tangled inside layered creative complication or too many competing agendas")
      .replace(/^slow growth and rooting in power$/i, "slower growth gaining real strength once the stronger creative choice is made")
      .replace(/^what genuinely matters around slow growth and rooting$/i, "what genuinely matters beginning to take root through slower, steadier growth")
      .replace(/^complication or mixed motives in creative strategy$/i, "mixed motives and overmanaged strategy complicating the work from inside the process itself")
      .replace(/^slow growth and rooting under what genuinely matters$/i, "slower growth taking hold once the work is organized around what actually matters in it")
      .replace(/^your own work becoming clearer, more visible, and easier to trust once traction and result signal start returning$/i, "your own work becoming easier to trust as traction returns and the results start speaking more clearly")
      .replace(/^the other person's field under closure$/i, "an outside response, audience dynamic, or collaboration thread moving through pause or withdrawal")
      .replace(/^events beginning to move the moment your own stance becomes clear$/i, "movement beginning once the work is clearer and the next step is chosen cleanly")
      .replace(/^your own role caught in complication, mixed motives, or a dynamic that needs clearer boundaries$/i, "your creative process getting tangled in mixed motives, audience pressure, or blurred boundaries")
      .replace(/^your creative process getting shaped by overcontrol, defensive strategy, or craft that has become too guarded$/i, "the work getting overmanaged from inside, with caution and control now constricting it more than helping it")
      .replace(/^incoming movement or updates in grace$/i, "a more encouraging response or smoother creative opening beginning to arrive")
      .replace(/^a more encouraging response or smoother opening gathering around your creative process, provided it is used concretely$/i, "a more encouraging opening gathering around the work, but only if you make real use of it")
      .replace(/^choice and branching paths moving through creative strategy$/i, "decision pressure being made harder by overmanaged creative strategy or too many methods competing at once")
      .replace(/^complication or mixed motives under strategy$/i, "overcomplicated planning or crossed motives making the work harder to read cleanly")
      .replace(/^resources and flow moving through creative complication$/i, "resources and momentum getting tangled in layered creative complication or too many competing demands")
      .replace(/^constructive change under power$/i, "constructive change gaining force once stronger creative choices are made")
      .replace(/^power or resource control in constructive change$/i, "stronger resources or firmer support beginning to help useful creative change take hold")
      .replace(/^an encouraging response in an encouraging response$/i, "an encouraging response around the work")
      .replace(/^an encouraging response in what genuinely matters$/i, "an encouraging response gathering around what genuinely matters in the work")
      .replace(/^clarity itself becoming the solution$/i, "clearer creative terms and a cleaner direction becoming the way through")
      .replace(/^erosion, worry, or leakage in closure$/i, "creative drain gathering around a pause or ending that is already underway")
      .replace(/^fog or uncertainty under drain$/i, "creative uncertainty thickening because repeated drain is still wearing the process down")
      .replace(/^closure, ending, or rest moving through creative strategy$/i, "a necessary pause or ending being driven by overmanaged creative strategy or control")
      .replace(/^closure, ending, or rest under the meaningful burden$/i, "a necessary pause or ending gathering under real creative weight that cannot just be pushed aside")
      .replace(/^closure, ending, or rest in recognition cycle$/i, "a pause or ending getting pulled into the same visibility and recognition cycle")
      .replace(/^closure, ending, or rest under structure$/i, "a necessary pause or ending being forced by structures or rules that are no longer helping the work")
      .replace(/^repetition and tension under strategy$/i, "creative repetition being reinforced by overcontrol")
      .replace(/^obstacle or delay in communication and nerves$/i, "delay being worsened by anxious overtalk, crossed signals, or too much reactive discussion")
      .replace(/^nervous communication under decisive cuts$/i, "creative chatter flaring around a hard cut or forced decision before the work feels settled")
      .replace(/^nervous communication under drain$/i, "creative chatter being worsened by drain, frayed capacity, and too little reserve")
      .replace(/^craft maturity around what can hold$/i, "craft maturity gathering around what can genuinely hold in practice")
      .replace(/^what can hold in craft maturity$/i, "what can still hold once the work is guided by steadier craft and restraint")
      .replace(/^the work beginning to improve once revision is made in the right order$/i, "the work beginning to improve once revision is sequenced in the order that actually helps it breathe")
      .replace(/^the work asking for maturity, restraint, and a steadier hand instead of more noise or urgency$/i, "the work asking for restraint, steadier craft, and less reactive noise")
      .replace(/^the work becoming tied to what genuinely matters, so the process strengthens when it protects what is actually alive in it$/i, "the work getting stronger once it protects what is actually alive in it")
      .replace(/^warmth and feeling brought fully into the light$/i, "what genuinely matters in the work becoming fully visible again")
      .replace(/^what genuinely matters in the work becoming fully visible again$/i, "what genuinely matters in the work coming back into clear view")
      .replace(/^slow growth and rooting under constructive change$/i, "slower growth beginning to take hold because the revision is finally moving in a useful direction")
      .replace(/^a solution or unlock under a newly forming situation$/i, "a workable answer beginning to appear inside a new phase that is still taking shape")
      .replace(/^closure, ending, or rest moving through the audience or other side$/i, "an outside response, audience dynamic, or collaboration thread moving into pause or withdrawal")
      .replace(/^nervous communication moving through drain$/i, "creative chatter being worsened by repeated drain, frayed capacity, and too little reserve")
      .replace(/^your own position under power$/i, "your creative position gaining firmer ground through clearer leverage and stronger stewardship")
      .replace(/^power around your own position$/i, "clearer leverage and stronger stewardship gathering around your creative position")
      .replace(/^creative strategy and overcontrol in structure$/i, "overmanaged creative strategy being made heavier by rigid structures or conditions")
      .replace(/^your own creative field around a small opening$/i, "your creative field finding a small but usable opening")
      .replace(/^fog or uncertainty moving through structure$/i, "uncertainty being made heavier by structures or conditions that are not helping")
      .replace(/^your creative process becoming shaped by audience, community, or the visible field around the work$/i, "the visible field around the work becoming active enough to give usable response")
      .replace(/^your own position moving through unclear direction$/i, "your creative position being pulled through uncertainty that still needs clarifying")
      .replace(/^clarity and visible progress in the longer-view signal$/i, "the longer-view signal beginning to show clearer traction")
      .replace(/^fog or uncertainty in communication and nerves$/i, "uncertainty being worsened by anxious chatter and crossed signals")
      .replace(/^support and loyalty around clarity and visible progress$/i, "steadier support gathering around the clearer signs of traction")
      .replace(/^power and stewardship around a small opening$/i, "stronger stewardship helping a small opening become usable")
      .replace(/^closure, ending, or rest under unclear direction$/i, "a necessary pause or ending gathering because the direction is still too unclear to trust")
      .replace(/^a stopped place made heavier by delay, distance, or the feeling of no easy passage$/i, "a blocked creative stretch that feels heavier because nothing is moving cleanly yet")
      .replace(/^what can still hold as practice, stamina, and sustainable output$/i, "what can genuinely hold as practice and sustainable output")
      .replace(/^the work being tested by what can actually hold as practice, stamina, and sustainable output$/i, "the work being tested by what can genuinely hold as practice and sustainable output")
      .replace(/^your own creative field around your own position$/i, "your creative field becoming the clearest ground you can actually shape and decide from")
      .replace(/^slow growth around your own position$/i, "slower creative growth gathering around your own position and what can actually hold")
      .replace(/^your own position under improvement or movement$/i, "your creative position beginning to move into a better sequence")
      .replace(/^your own position under a small opening$/i, "your creative position finding a small but usable opening")
      .replace(/^guidance around your own position$/i, "clearer creative direction gathering around your own position")
      .replace(/^reliable support under what genuinely matters$/i, "steadier support gathering around what genuinely matters in the work")
      .replace(/^visible traction around what can hold$/i, "visible traction gathering around what can genuinely hold in practice")
      .replace(/^resources and flow under expansion$/i, "resources and momentum finding more room to move as the field opens out")
      .replace(/^erosion, worry, or leakage moving through communication and nerves$/i, "creative drain being worsened by too much anxious talk, crossed signal, or reactive discussion")
      .replace(/^the public creative field around constructive change$/i, "the visible creative field beginning to respond to useful change")
      .replace(/^your own field$/i, "your creative field")
      .replace(/^the other person's field$/i, "the audience or other side")
      .replace(/^reliable support in the audience or other side$/i, "steadier support showing up through the audience, collaborator, or other side of the work")
      .replace(/^support and loyalty around your own position$/i, "steadier support gathering around your creative position")
      .replace(/^your own position under expansion$/i, "your creative position gaining more room to move")
      .replace(/^movement, distance, or transition in expansion$/i, "the work beginning to move as the field opens a little wider")
      .replace(/^grace, goodwill, or invitation\b/i, "a more encouraging response")
      .replace(/^nervous communication\b/i, "creative chatter and reactive noise around the work")
      .replace(/^closure, ending, or rest\b/i, "a necessary pause, ending, or rest phase for the work")
      .replace(/^burden and meaning\b/i, "real creative weight and what the work is asking you to carry")
      .replace(/^obstacle or delay\b/i, "a genuine creative block or delay")
      .replace(/^a sharp decision or cut\b/i, "a necessary creative decision or hard cut")
      .replace(/^choice and branching paths\b/i, "a real creative fork or choice")
      .replace(/^a solution or unlock\b/i, "the actual creative fix or opening")
      .replace(/^heart, value, or feeling\b/i, "what genuinely matters in the work")
      .replace(/^movement, distance, or transition\b/i, "movement or a creative shift")
      .replace(/^structure, distance, or institution\b/i, "formal structures or outside pressures on the work")
      .replace(/^guidance\b/i, "clearer creative direction and signal")
      .replace(/^a newly forming situation\b/i, "an early-stage creative opening")
      .replace(/^endurance\b/i, "creative staying power and what the work can sustain")
      .replace(/^resource flow\b/i, "practical creative resources and what is actually moving")
      .replace(/^social or public life\b/i, "the wider social or public field around the work")
      .replace(/^your own field\b/i, "your creative field")
      .replace(/^your own position\b/i, "your creative position");
  }

  if (subjectId === "travel") {
    rewritten = rewritten
      .replace(/^resources and flow in grace$/i, "practical support and smoother handling beginning to help the journey move")
      .replace(/^your own position in the bond$/i, "your travel position")
      .replace(/^your travel position under clarity and success$/i, "your travel position becoming clearer, more visible, and easier to work from")
      .replace(/^your travel position in clarity and success$/i, "your travel position becoming clearer, more visible, and easier to work from")
      .replace(/^your travel position under erosion and stress$/i, "your travel plans being worn down by repeated strain, small leaks, or accumulating friction")
      .replace(/^your own position under improvement or movement$/i, "your travel position beginning to move into a better sequence")
      .replace(/^your own position moving through improvement or movement$/i, "your travel position beginning to move into a better sequence")
      .replace(/^improvement or movement around your own position$/i, "movement beginning once your travel position starts changing")
      .replace(/^the itinerary fork around maturity and restraint$/i, "a route choice that benefits from patience and steadier judgment")
      .replace(/^caution and self-interest under communication and nerves$/i, "defensive planning made heavier by anxious updates and crossed messages")
      .replace(/^caution and self-interest moving through communication and nerves$/i, "defensive planning and anxious overtalk complicating the trip")
      .replace(/^a reroute or clean cut moving through communication and nerves$/i, "a reroute being driven by too many messages, crossed updates, or anxious coordination")
      .replace(/^closure, ending, or rest moving through caution$/i, "a pause or ended leg being complicated by defensive planning or overcontrol")
      .replace(/^nervous communication under caution$/i, "anxious travel talk thickened by caution or what is not yet confirmed")
      .replace(/^nervous communication in erosion and stress$/i, "crossed updates feeding a route that is already under strain")
      .replace(/^your travel picture moving through uncertainty, shifting conditions, or information that is not yet stable$/i, "uncertain timing, changing conditions, or information that still cannot be trusted cleanly")
      .replace(/^uncertain timing or changing conditions in strategy$/i, "uncertain timing being made harder by defensive planning or overcontrol")
      .replace(/^complication or mixed motives in uncertain timing$/i, "uncertain timing being worsened by crossed motives, second-guessing, or too many moving parts")
      .replace(/^your own role caught in complication, mixed motives, or a dynamic that needs clearer boundaries$/i, "your travel plans getting tangled in crossed motives, layered logistics, or outside dynamics that need clearer boundaries")
      .replace(/^delay or blockage in erosion and stress$/i, "delay being worsened by repeated strain, small leaks, or accumulating friction")
      .replace(/^the confirmation point around reliable support$/i, "a confirmed support line or backup arrangement")
      .replace(/^support and loyalty around your travel position$/i, "reliable support gathering around your travel plans")
      .replace(/^power around slow growth and rooting$/i, "steadier support gathering around slower, more workable progress")
      .replace(/^slow growth around your travel position$/i, "slower, steadier progress gathering around your travel position")
      .replace(/^power or resource control under clarity and success$/i, "stronger leverage or clearer backing once the route is easier to trust")
      .replace(/^a small opening under clarity and success$/i, "a small but usable opening once the route is clearer and easier to trust")
      .replace(/^a more workable opening under values and love$/i, "a more workable opening around what still feels worthwhile")
      .replace(/^values and love around incoming movement or updates$/i, "what still feels worthwhile beginning to move with the next update")
      .replace(/^a reroute or clean cut in repeat transit friction$/i, "a reroute being forced by repeated transit friction or too many repeated snags")
      .replace(/^repeat travel friction in closure$/i, "repeat travel friction pushing part of the trip toward pause, cancellation, or a forced stop")
      .replace(/^repeat travel friction under erosion and stress$/i, "repeat travel friction worsening a route that is already being worn down by strain and small losses")
      .replace(/^burden and meaning moving through repeat transit friction$/i, "the trip feeling heavier because the same transit friction keeps replaying")
      .replace(/^slow growth and rooting under a newly forming situation$/i, "slower, steadier progress beginning to gather once the next stage starts taking shape")
      .replace(/^route and transit movement in a small timing window$/i, "route movement depending on a narrow but usable timing window")
      .replace(/^nervous communication moving through communication and nerves$/i, "anxious travel chatter feeding on itself")
      .replace(/^guidance and signal under the route itself$/i, "clearer route signal gathering around the trip itself")
      .replace(/^incoming movement or updates in grace$/i, "movement or updates arriving through a smoother opening or more helpful handling")
      .replace(/^mixed messages, gossip, or anxious conversation that can distort what is really happening$/i, "crossed updates and anxious chatter making the route harder to read")
      .replace(/^incoming momentum around grace, goodwill, or invitation$/i, "movement beginning through a helpful opening or smoother handling")
      .replace(/^grace, goodwill, or invitation under incoming momentum$/i, "a more workable opening as movement begins")
      .replace(/^grace, goodwill, or invitation\b/i, "a more workable opening")
      .replace(/^movement, distance, or transition in expansion$/i, "movement beginning as the trip starts opening again")
      .replace(/^movement, distance, or transition\b/i, "movement")
      .replace(/^structure, distance, or institution\b/i, "formal travel structure")
      .replace(/^nervous communication\b/i, "anxious travel communication and crossed updates")
      .replace(/^closure, ending, or rest\b/i, "a cancelled leg, paused trip, or necessary stop")
      .replace(/^burden and meaning\b/i, "real weight or obligation shaping the journey")
      .replace(/^obstacle or delay\b/i, "a genuine travel blocker or delay")
      .replace(/^a sharp decision or cut\b/i, "a necessary reroute or clean cut in travel plans")
      .replace(/^choice and branching paths\b/i, "a real itinerary fork or route choice")
      .replace(/^a solution or unlock\b/i, "the actual fix or opening in the travel picture")
      .replace(/^heart, value, or feeling\b/i, "what still feels worth the journey")
      .replace(/^guidance\b/i, "clearer route direction and signal")
      .replace(/^a newly forming situation\b/i, "an early-stage travel opening")
      .replace(/^endurance\b/i, "staying power and persistence in the travel picture")
      .replace(/^resource flow\b/i, "practical resources and what is actually moving")
      .replace(/^social or public life\b/i, "the wider social or public field of the journey")
      .replace(/^your own field\b/i, "your travel position")
      .replace(/^your own position\b/i, "your travel position");
  }

  if (subjectId === "education") {
    rewritten = rewritten
      .replace(/^emotional truth to the answer point, sincerity becomes the thing that unlocks the next phase$/i, "sincerity becoming the thing that unlocks the next phase once the real answer is clear")
      .replace(/^nervous communication under pause or deferral$/i, "application chatter and anxious discussion gathering around a pause, deferral, or stalled phase")
      .replace(/^clarity and visible progress in what can still hold as study rhythm$/i, "clearer progress beginning through a study rhythm that can actually hold")
      .replace(/^erosion, worry, or leakage under what is hidden$/i, "academic strain accumulating around what is still hidden, deferred, or not yet fully known")
      .replace(/^a stopped place made heavier by delay, distance, or the feeling of no easy passage$/i, "a blocked academic stretch that feels heavier because nothing is moving cleanly yet")
      .replace(/^a sharp decision or cut in recognition$/i, "a hard decision landing right where recognition, results, or visible progress matter most")
      .replace(/^the answer point around your learning path$/i, "the answer point that opens the next step in your learning path")
      .replace(/^repetition and tension moving through erosion and stress$/i, "repeated academic strain compounding an already worn-down part of the path")
      .replace(/^your learning path in clarity and success$/i, "your learning path becoming clearer, more visible, and easier to trust")
      .replace(/^nervous communication moving through decisive cuts$/i, "anxious discussion being sharpened by hard decisions, cuts, or correction points")
      .replace(/^your learning path in the visible academic field$/i, "your learning path moving into the visible academic field where effort starts being measured more openly")
      .replace(/^your learning path moving through pause or deferral$/i, "your learning path being held in a pause, deferral, or phase that has to close cleanly before the next step works")
      .replace(/^pause or deferral in pause or deferral$/i, "the learning path being held in a pause or deferral that now needs to be read honestly")
      .replace(/^pause or deferral under strategy$/i, "a pause or deferral being prolonged by overmanaged strategy or hesitant planning")
      .replace(/^reliable support under an encouraging response$/i, "steady support gathering around a more encouraging academic response")
      .replace(/^an encouraging response around your learning path$/i, "a more encouraging academic response beginning to gather around your learning path")
      .replace(/^an encouraging response in values and love$/i, "a more encouraging academic response beginning to gather around what still genuinely matters in the work")
      .replace(/^emotional weather or recognition under pause or deferral$/i, "uncertain morale or delayed recognition surrounding a pause, deferral, or stalled academic phase")
      .replace(/^nervous communication in pause or deferral$/i, "application chatter and anxious discussion gathering around a pause, deferral, or stalled phase")
      .replace(/^events beginning to move the moment your own stance becomes clear$/i, "movement beginning once your own academic position is clear enough to act from")
      .replace(/^your learning path in decisive cuts$/i, "your learning path being shaped by a hard correction, forced cut, or fast academic decision")
      .replace(/^steady skill-building under support and loyalty$/i, "steady skill-building backed by reliable support, tutoring, or consistent help")
      .replace(/^nervous communication moving through unclear requirements$/i, "crossed messages and application nerves making unclear requirements even harder to read cleanly")
      .replace(/^your learning path moving through unclear requirements$/i, "your learning path still moving through requirements that are not clear enough to trust yet")
      .replace(/^your learning path under guidance$/i, "your learning path under a clearer long-range study signal")
      .replace(/^your learning path in expansion$/i, "your learning path beginning to open into a wider next stage")
      .replace(/^complication or mixed motives in repetition$/i, "crossed motives or conflicting pressures replaying the same academic confusion")
      .replace(/^complication or mixed motives under strategy$/i, "crossed motives or overcomplicated planning making the academic path harder to read cleanly")
      .replace(/^repetition and tension under strategy$/i, "the same academic tension being reinforced by overcomplicated strategy")
      .replace(/^a small beginning with more promise in it than its size suggests$/i, "a small academic start with more real potential than its size first suggests")
      .replace(/^a small opening under support and loyalty$/i, "a small but usable academic opening backed by reliable support")
      .replace(/^closure, ending, or rest under unclear requirements$/i, "a pause or stoppage caused by requirements that are still not clear enough to trust")
      .replace(/^your learning path in grace$/i, "your learning path gathering a more workable opening or encouraging response")
      .replace(/^unclear requirements moving through repetition$/i, "unclear requirements being replayed through repeated corrections or the same unresolved study loop")
      .replace(/^stability and foundations under incoming momentum$/i, "a steadier academic base beginning to form as the next update or response arrives")
      .replace(/^study strategy and overcontrol moving through decisive cuts$/i, "overmanaged study strategy meeting a hard correction or decision point")
      .replace(/^your learning path under power$/i, "your learning path under stronger standards, oversight, or academic pressure")
      .replace(/^erosion, worry, or leakage under obstruction$/i, "academic strain being worsened by a blockage, bottleneck, or stalled part of the path")
      .replace(/^your learning path in your own learning field$/i, "your learning path in what is actually yours to prepare, clarify, and carry")
      .replace(/^your learning path in the answer point$/i, "your learning path meeting the answer point that opens the next academic step")
      .replace(/^structure, distance, or institution under study strategy$/i, "formal academic structure or institutional pressure complicating the study strategy")
      .replace(/^structure, distance, or institution in pause or deferral$/i, "formal academic structure or institutional timing keeping the path in pause or deferral")
      .replace(/^your learning path under study strategy$/i, "your learning path being overmanaged by strategy or method that is no longer helping enough")
      .replace(/^study strategy and overcontrol in strategy$/i, "study strategy hardening into overcontrol and making the work harder to read cleanly")
      .replace(/^your learning path under support and loyalty$/i, "your learning path being steadied by dependable support that is actually holding")
      .replace(/^unclear requirements under unclear requirements$/i, "unclear requirements feeding on themselves until the brief becomes harder to trust than it should be")
      .replace(/^unclear requirements moving through study strategy$/i, "unclear requirements being filtered through too much strategy, overcontrol, or second-guessing")
      .replace(/^unclear requirements in study strategy$/i, "unclear requirements being made heavier by overmanaged strategy, second-guessing, or too much method")
      .replace(/^pause or deferral in structure$/i, "a pause or bottleneck being created by structure, timing, or institutional constraints")
      .replace(/^burden and meaning moving through unclear requirements$/i, "real academic weight being compounded by requirements that are still not clear enough")
      .replace(/^burden and meaning in communication and nerves$/i, "real academic pressure being made noisier by anxious discussion and crossed messages")
      .replace(/^structure, distance, or institution moving through unclear requirements$/i, "formal academic structure or institutional pressure deepening requirements that are still not clear enough")
      .replace(/^delay shaped by the meaningful burden$/i, "delay created by the real weight of the workload, expectations, or what the path is asking you to carry")
      .replace(/^your learning path under what can still hold as study rhythm$/i, "your learning path holding through the study rhythm that is actually sustainable")
      .replace(/^your learning path holding through the study rhythm that is actually sustainable$/i, "your learning path holding through the study rhythm that is genuinely sustainable")
      .replace(/^obstacle or delay under erosion and stress$/i, "delay or blockage being worsened by repeated academic strain and attrition")
      .replace(/^obstacle or delay under communication and nerves$/i, "delay or blockage being worsened by application chatter, crossed messages, or exam nerves")
      .replace(/^repetition and tension under pause or deferral$/i, "repeated academic strain gathering around a pause, deferral, or stalled phase")
      .replace(/^resources and workload flow under clarity and success$/i, "resources and workload flow beginning to move more cleanly as the path becomes clearer")
      .replace(/^repetition and tension in erosion and stress$/i, "repeated academic strain intensifying what is already being worn down")
      .replace(/^your own learning field around steady skill-building$/i, "steady skill-building gathering around what is actually yours to prepare and carry")
      .replace(/^maturity around steady skill-building$/i, "steadier judgment gathering around the slower skill-building that actually holds")
      .replace(/^steady skill-building under maturity$/i, "steady skill-building gaining strength through more mature pacing and judgment")
      .replace(/^an early-stage effort around an early-stage effort$/i, "an early academic effort that still has real room to improve if it is shaped deliberately now")
      .replace(/^your own position in the bond$/i, "your learning path")
      .replace(/^your own position under improvement or movement$/i, "your learning path beginning to move into a better sequence")
      .replace(/^your learning path in improvement or movement$/i, "your learning path beginning to move into a better sequence")
      .replace(/^your learning path beginning to open into a wider next stage$/i, "your learning path starting to open into a broader next phase")
      .replace(/^guidance around your own position$/i, "clearer direction gathering around your learning path")
      .replace(/^your own role caught in complication, mixed motives, or a dynamic that needs clearer boundaries$/i, "your learning path getting tangled in crossed expectations, mixed motives, or a dynamic that needs clearer boundaries")
      .replace(/^your role meeting a newly forming situation, where what you do first matters more than what you promise later$/i, "an early study or application phase where first habits matter more than promises")
      .replace(/^a sharp decision or cut under repetition$/i, "a hard course correction or forced choice repeating because the method is not yet settled")
      .replace(/^a sharp decision or cut under caution$/i, "a hard academic choice or correction being made more difficult by overcaution")
      .replace(/^expansion around slow growth and rooting$/i, "steady learning growth beginning to accumulate through slower practice")
      .replace(/^slow growth and rooting under a newly forming situation$/i, "slower, steadier learning progress beginning to take shape")
      .replace(/^complication or mixed motives under the meaningful burden$/i, "mixed motives complicating a path that already carries real academic weight")
      .replace(/^complication or mixed motives in recognition$/i, "mixed motives or crossed signals complicating recognition, feedback, or how the work is being read")
      .replace(/^a sharp decision or cut moving through caution$/i, "a hard correction being shaped by overcaution")
      .replace(/^a sharp decision or cut moving through unclear requirements$/i, "a hard academic cut or forced choice being driven by requirements that still are not clear enough")
      .replace(/^nervous communication under caution$/i, "crossed messages, overtalk, or application nerves thickening the decision")
      .replace(/^your own role caught in complication, mixed motives, or a dynamic that needs clearer boundaries$/i, "your learning path getting tangled in crossed expectations or mixed motives")
      .replace(/^expansion around slow growth and rooting$/i, "steady learning growth beginning to accumulate through slower practice")
      .replace(/^health, roots, and long-term development are emphasized, with long growth setting the tone$/i, "slow skill-building, long study growth, and the kind of progress that only holds through repetition are close to the surface")
      .replace(/^health and roots$/i, "skill-building and long study growth")
      .replace(/^your own field$/i, "your learning path")
      .replace(/^the other person's field$/i, "the evaluator's field")
      .replace(/^the other person's stance$/i, "the evaluator's position")
      .replace(/^support and loyalty around your own position$/i, "steadier support gathering around the learning path")
      .replace(/^support and loyalty around your learning path$/i, "steadier support gathering around the learning path")
      .replace(/^(?:support and loyalty|reliable support) in power$/i, "reliable support becoming more usable because stronger academic backing or oversight is finally in place")
      .replace(/^(?:support and loyalty|reliable support) in the answer point$/i, "reliable support gathering around the answer point that opens the next academic step")
      .replace(/^(?:support and loyalty|reliable support) in clarity and success$/i, "reliable support becoming more usable as the path gets clearer and early wins start holding")
      .replace(/^(?:support and loyalty|reliable support) in values and love$/i, "reliable support gathering around what still genuinely matters in the work")
      .replace(/^values and love around reliable support$/i, "motivation and genuine interest gathering around reliable academic support")
      .replace(/^your own position moving through erosion and stress$/i, "your learning path being worn down by repeated academic strain")
      .replace(/^your own position under erosion and stress$/i, "your learning path being worn down by repeated academic strain")
      .replace(/^complication or mixed motives in caution$/i, "uncertainty being worsened by crossed expectations or overcautious planning")
      .replace(/^obstacle or delay in study strategy$/i, "delay or blockage being worsened by overmanaged strategy or methods that are no longer helping enough")
      .replace(/^a sharp decision or cut under caution$/i, "a hard academic choice being made more difficult by overcaution")
      .replace(/^movement, distance, or transition in expansion$/i, "movement beginning once the learning path opens up a little more")
      .replace(/^movement, distance, or transition under clarity and success$/i, "movement beginning once the path is clear enough to trust")
      .replace(/^movement, distance, or transition under the answer point$/i, "movement beginning once the answer is clear enough to act on")
      .replace(/^movement beginning once your own academic position is clear enough to act from$/i, "movement beginning once your own academic position is clear enough to act on")
      .replace(/^unclear requirements in communication and nerves$/i, "unclear requirements being made harder by crossed messages, anxious discussion, or too much academic noise")
      .replace(/^repetition and tension moving through study strategy$/i, "repeated academic tension being reinforced by overmanaged strategy or method")
      .replace(/^the answer point around heart, value, or feeling$/i, "the answer point opening around what still genuinely matters in the work")
      .replace(/^nervous communication under the meaningful burden$/i, "anxious discussion gathering around a workload or academic pressure that already feels heavy")
      .replace(/^an early-stage effort under values and love$/i, "an early academic effort shaped by what still genuinely matters in the work")
      .replace(/^what still matters academically under an early-stage effort$/i, "what still matters academically finding room inside an early effort that can still be shaped well")
      .replace(/^a sharp decision or cut under erosion and stress$/i, "a hard academic cut or correction made heavier by repeated strain and attrition")
      .replace(/^steady skill-building around your learning path$/i, "steady skill-building gathering around what is actually yours to prepare and carry")
      .replace(/^clarity and visible progress in steady skill-building$/i, "clearer progress beginning to show through steadier skill-building that is finally holding")
      .replace(/^grace, goodwill, or invitation\b/i, "a more workable opening")
      .replace(/^heart, value, or feeling\b/i, "what still matters academically")
      .replace(/^warmth and feeling brought fully into the light$/i, "motivation and genuine interest coming back into clearer view")
      .replace(/^nervous communication\b/i, "anxious academic chatter and crossed messages")
      .replace(/^closure, ending, or rest\b/i, "a pause, deferral, or necessary stop in the learning path")
      .replace(/^burden and meaning\b/i, "real academic weight and what the path is asking you to carry")
      .replace(/^obstacle or delay\b/i, "a genuine blocker or delay in the learning path")
      .replace(/^a sharp decision or cut\b/i, "a hard academic decision or correction")
      .replace(/^choice and branching paths\b/i, "a real fork or choice in the educational path")
      .replace(/^a solution or unlock\b/i, "the actual answer or opening in the learning path")
      .replace(/^guidance\b/i, "clearer academic direction and signal")
      .replace(/^a newly forming situation\b/i, "an early-stage academic opening")
      .replace(/^endurance\b/i, "staying power and long-term academic effort")
      .replace(/^resource flow\b/i, "practical resources and what is actually moving in the learning path")
      .replace(/^social or public life\b/i, "the wider academic or institutional field")
      .replace(/^movement, distance, or transition\b/i, "movement in the learning path")
      .replace(/^structure, distance, or institution\b/i, "formal academic structure or institutional pressure")
      .replace(/^your own field\b/i, "your learning path")
      .replace(/^your own position\b/i, "your learning path");
  }

  if (subjectId === "health") {
    rewritten = rewritten
      .replace(/^depletion and repeated drain moving through repeated drain$/i, "depletion getting trapped in the same draining cycle instead of easing")
      .replace(/^depletion and repeated drain in repetition$/i, "depletion getting trapped in the same draining cycle instead of easing")
      .replace(/^the emotional truth\b/i, "what your system is honestly signaling")
      .replace(/^your own position in the bond\b/i, "your wellbeing")
      .replace(/^a small opening around your own position$/i, "a small opening around your wellbeing")
      .replace(/^guidance around your own position$/i, "clearer guidance around your wellbeing")
      .replace(/^maturity around your own position$/i, "steadier regulation around your wellbeing")
      .replace(/^your own position moving through erosion and stress$/i, "your wellbeing being worn down by repeated stress")
      .replace(/^your own position under erosion and stress$/i, "your wellbeing being worn down by repeated stress")
      .replace(/^your own position under support and loyalty$/i, "steadier support gathering around your recovery")
      .replace(/^support and loyalty around your own position$/i, "steadier support gathering around your recovery")
      .replace(/^fog and uncertainty in fog or uncertainty$/i, "uncertainty feeding symptom anxiety")
      .replace(/^fog and uncertainty under structure$/i, "uncertainty made heavier by routines or outside structures the body is still reacting to")
      .replace(/^nervous communication under caution$/i, "stress and over-alertness aggravating the system")
      .replace(/^nervous activation under nervous activation$/i, "stress feeding more stress and keeping the system activated")
      .replace(/^nervous activation under structure$/i, "stress and over-alertness getting reinforced by routines or outside demands")
      .replace(/^closure, ending, or rest in communication and nerves$/i, "rest being interrupted by an overactive nervous system")
      .replace(/^emotional weather or recognition under communication and nerves$/i, "reactivity and anxious overthinking unsettling the system")
      .replace(/^first movement under what can hold$/i, "first recovery movement backed by what can actually hold")
      .replace(/^movement, distance, or transition under the answer point$/i, "recovery beginning once the right support is clearer")
      .replace(/^movement, distance, or transition under clarity and success$/i, "recovery movement once the picture is clear enough to trust")
      .replace(/^movement, distance, or transition under what genuinely nourishes you$/i, "recovery movement beginning once what truly nourishes you is given more room")
      .replace(/^movement, distance, or transition in incoming momentum$/i, "recovery movement beginning as the system starts responding")
      .replace(/^movement, distance, or transition in expansion$/i, "more room to breathe as the system starts opening")
      .replace(/^a sharp decision or cut under strategy$/i, "a necessary boundary around what is overtaxing the system")
      .replace(/^a sharp decision or cut moving through strategy$/i, "a necessary boundary moving through overmanagement and self-protection")
      .replace(/^a sharp decision or cut under communication and nerves$/i, "a necessary boundary tangled in stress and overtalk")
      .replace(/^events beginning to move the moment your own stance becomes clear$/i, "improvement beginning once you trust what your body is telling you")
      .replace(/^improvement beginning once you trust what your body is telling you$/i, "improvement beginning once you trust the signals your body has already been giving you")
      .replace(/^a small opening under values and love$/i, "a small opening around what genuinely nourishes you")
      .replace(/^what genuinely nourishes you under a small opening$/i, "what genuinely nourishes you finding a small but usable opening")
      .replace(/^values and love around a small beginning$/i, "what genuinely nourishes you finding room in a small new start")
      .replace(/^warmth and feeling brought fully into the light$/i, "energy and warmth beginning to return")
      .replace(
        /^your role meeting a newly forming situation, where what you do first matters more than what you promise later$/i,
        "a newer recovery pattern where first habits matter more than promises",
      )
      .replace(
        /^your own role caught in complication, mixed motives, or a dynamic that needs clearer boundaries$/i,
        "your wellbeing caught in a pattern that needs clearer limits and steadier care",
      )
      .replace(/^complication or mixed motives under the meaningful burden$/i, "strain complicating what your system is already carrying")
      .replace(/^complication feeding anxiety, attrition, or the slow damage done by what keeps slipping sideways$/i, "strain and anxiety quietly worsening what the system is already trying to carry")
      .replace(/^your own field around constructive change$/i, "constructive change beginning around your wellbeing")
      .replace(
        /^structure, distance, or institution under uncertainty around what the body is saying$/i,
        "outside demands or fixed structures deepening uncertainty about what your body is trying to tell you",
      )
      .replace(/^structure, distance, or institution moving through repeated drain$/i, "outside demands or rigid structures aggravating the same repeated drain")
      .replace(/^structure, distance, or institution\b/i, "outside demands or rigid structures")
      .replace(/^nervous activation moving through rest or necessary pause$/i, "stress and over-alertness continuing even while the body is asking for rest")
      .replace(/^fog and uncertainty moving through rest or necessary pause$/i, "uncertainty making it harder to trust the rest and recovery the body is asking for")
      .replace(/^fog and uncertainty in repeated drain$/i, "uncertainty deepening because repeated drain is still wearing the system down")
      .replace(/^recovery and rooted repair around returning energy and signal$/i, "deeper recovery gathering as energy and signal begin to return")
      .replace(/^recovery movement in a newly forming situation$/i, "early recovery movement beginning to take shape")
      .replace(/^rest and necessary pause in commitment$/i, "rest and recovery being squeezed by commitments that still expect too much")
      .replace(/^values and love around rest and regulation$/i, "what genuinely nourishes you gathering around rest and regulation")
      .replace(/^slow growth and rooting in maturity$/i, "slower, steadier recovery through better pacing")
      .replace(/^clarity and visible progress under maturity$/i, "clearer improvement once the system is paced more steadily")
      .replace(/^clearer energy and signal around the longer-view signal$/i, "clearer energy returning once the longer recovery pattern is easier to trust")
      .replace(/^the longer-view signal in what genuinely nourishes you$/i, "the longer recovery pattern pointing back to what genuinely nourishes you")
      .replace(/^what genuinely nourishes you in guidance$/i, "clearer guidance about what genuinely nourishes you")
      .replace(/^cycles and sensitivity under strategy$/i, "cycles and sensitivity getting tangled in overmanagement and self-protective habits")
      .replace(/^nervous activation under structure$/i, "stress and over-alertness getting reinforced by routines or outside demands")
      .replace(/^circulation and practical support in clearer energy and signal$/i, "circulation and practical support improving as energy and signal return")
      .replace(/^circulation and practical support\b/i, "circulation and practical support around recovery")
      .replace(/^your wellbeing in rest and regulation$/i, "your wellbeing settling into better rest and regulation")
      .replace(/^your own field around your wellbeing$/i, "your direct experience of what the body is doing")
      .replace(/^heart, value, or feeling under rest and regulation$/i, "what genuinely nourishes you around rest and regulation")
      .replace(/^heart, value, or feeling around rest and regulation$/i, "what genuinely nourishes you around rest and regulation")
      .replace(/^nervous communication\b/i, "anxiety and overactivated stress signals")
      .replace(/^closure, ending, or rest\b/i, "a necessary ending, pause, or rest phase for the system")
      .replace(/^burden and meaning\b/i, "what the body is carrying and the weight of it")
      .replace(/^obstacle or delay\b/i, "a genuine health blocker or slowdown")
      .replace(/^a sharp decision or cut\b/i, "a necessary health boundary or protocol change")
      .replace(/^choice and branching paths\b/i, "a real fork or choice in the recovery path")
      .replace(/^a solution or unlock\b/i, "the actual fix or opening in the health picture")
      .replace(/^heart, value, or feeling\b/i, "what genuinely nourishes you")
      .replace(/^movement, distance, or transition\b/i, "recovery movement")
      .replace(/^guidance\b/i, "clearer health direction and signal")
      .replace(/^a newly forming situation\b/i, "an early-stage recovery opening")
      .replace(/^endurance\b/i, "staying power and long-term health effort")
      .replace(/^resource flow\b/i, "practical support and what is actually moving in recovery")
      .replace(/^social or public life\b/i, "the wider social or community field around health")
      .replace(/^your own field\b/i, "your wellbeing")
      .replace(/^your own position\b/i, "your wellbeing");
  }

  if (subjectId === "purpose_calling") {
    rewritten = rewritten
      .replace(/^a small opening in incoming momentum$/i, "a small opening as momentum begins to build")
      .replace(/^the other person's stance under closure$/i, "the other person's stance remaining quiet, withdrawn, or hard to read")
      .replace(/^the other person's stance under repetition$/i, "the other person's stance getting caught in the same repeating pattern")
      .replace(/^reliable support under grace$/i, "steadier support arriving in a gentler tone")
      .replace(/^your own clarity becoming the answer point that unlocks the next phase of the path$/i, "your own clarity becoming the hinge that unlocks the next phase of the path")
      .replace(/^closure, ending, or rest under communication and nerves$/i, "an old path reaching its limit through too much noise, overtalk, or anxious processing")
      .replace(/^maturity and restraint in slow growth$/i, "maturity and restraint helping slower, steadier growth take hold")
      .replace(/^the emotional truth\b/i, "what still feels deeply true")
      .replace(/^your own position in the bond\b/i, "your stance toward the path")
      .replace(/^erosion, worry, or leakage under repetition$/i, "repeated friction slowly draining conviction")
      .replace(/^reliable support in incoming momentum$/i, "steady support as the next movement begins")
      .replace(/^your stance toward the path in communication and nerves$/i, "anxious discussion and mental noise crowding your sense of the path")
      .replace(/^slow growth and rooting under expansion$/i, "slow, grounded growth as the path begins to open")
      .replace(/^complication or mixed motives under caution$/i, "mixed motives and defensive caution around the path")
      .replace(/^caution and self-interest moving through strategy$/i, "defensive strategy and self-protection shaping the path")
      .replace(/^caution and self-interest moving through fog or uncertainty$/i, "defensive caution inside uncertainty about the path")
      .replace(/^your stance toward the path under values and love$/i, "your path becoming clearer through what still feels deeply true")
      .replace(/^your stance toward the path under clarity and success$/i, "your path becoming clearer through visible progress")
      .replace(/^your stance toward the path in clarity and success$/i, "your path becoming clearer through visible progress")
      .replace(/^your own position in erosion and stress$/i, "your own stance being worn down by repeated strain")
      .replace(/^a more supportive tone around what still matters professionally$/i, "a gentler sense of meaning returning")
      .replace(/^complication or mixed motives moving through the meaningful burden$/i, "mixed motives inside a burden that already carries real weight")
      .replace(/^steadier footing around your own role$/i, "steadier footing around your own path")
      .replace(/^complication or mixed motives under fog or uncertainty$/i, "mixed motives and uncertainty around the path")
      .replace(/^closure, ending, or rest moving through decisive cuts$/i, "a necessary ending taking shape through one clean refusal or boundary")
      .replace(/^a sharp decision or cut moving through erosion and stress$/i, "a necessary cut made harder by repeated drain and stress")
      .replace(/^closure, ending, or rest under strategy$/i, "an old path reaching its limit through defensive strategy")
      .replace(/^guidance around a solution or unlock$/i, "clearer direction around the answer that could actually open the path")
      .replace(/^recurring household drain under fog or uncertainty$/i, "repeated drain clouding your sense of the path")
      .replace(/^warmth and feeling brought fully into the light$/i, "what still feels deeply true becoming unmistakable")
      .replace(/^grace, goodwill, or invitation under improvement or movement$/i, "a gentler forward movement beginning to feel possible")
      .replace(/^improvement or movement around incoming movement or news$/i, "movement beginning once something concrete finally arrives")
      .replace(/^values and love around power or resource control$/i, "what still feels true around who carries power, support, or stewardship")
      .replace(/^a small beginning under a newly forming situation$/i, "a small but meaningful beginning on the path itself")
      .replace(/^a small opening under clarity and success$/i, "a small opening once the path is clearer and more visible")
      .replace(/^complication or mixed motives under strategy$/i, "mixed motives and defensive patterning around the path")
      .replace(/^grace, goodwill, or invitation in values and love$/i, "care, goodwill, and a return to what still feels meaningful")
      .replace(/^grace, goodwill, or invitation under guidance$/i, "a helpful opening once the direction feels more trustworthy")
      .replace(/^your own position in the relationship$/i, "your stance toward the path")
      .replace(/^your stance toward the path in values and love$/i, "your stance toward the path becoming clearer through what still feels deeply true")
      .replace(/^your stance toward the path under expansion$/i, "your path gaining a little more room to move")
      .replace(/^your stance toward the path in communication and nerves$/i, "anxious discussion and mental noise crowding your sense of the path")
      .replace(/^nervous communication moving through your own field$/i, "anxious discussion circling your own sense of the path")
      .replace(/^emotional weather or recognition under communication and nerves$/i, "anxious discussion feeding unstable confidence about the path")
      .replace(/^a small beginning under expansion$/i, "a small but real beginning as the path starts to widen")
      .replace(/^fog and uncertainty in communication and nerves$/i, "uncertainty thickened by too much anxious discussion around the path")
      .replace(/^a newly forming situation around maturity and restraint$/i, "a quieter beginning shaped by maturity and restraint")
      .replace(/^erosion, worry, or leakage in repetition$/i, "repeated drain trapped inside the same cycle")
      .replace(/^events beginning to move the moment your own stance becomes clear$/i, "movement beginning once your own stance becomes clear")
      .replace(/^a sharp decision or cut under erosion and stress$/i, "a necessary cut made harder by repeated drain and stress")
      .replace(/^heart, value, or feeling in the answer point$/i, "what still feels deeply true arriving at the answer point")
      .replace(/^repetition and tension moving through fog or uncertainty$/i, "a repeating strain fed by uncertainty around the path")
      .replace(/^your stance toward the path under maturity$/i, "your path asking for maturity and restraint")
      .replace(/^caution and self-interest in the other person's field$/i, "another person's agenda or defensiveness distorting the path")
      .replace(/^a solution or unlock under maturity$/i, "a workable answer that asks for maturity and restraint")
      .replace(/^maturity and restraint in clarity and success$/i, "mature confidence and steadier visible progress")
      .replace(/^your own position moving through erosion and stress$/i, "your own stance being worn down by repeated strain")
      .replace(/^guidance and signal around reliable support$/i, "steady support clarifying the next move")
      .replace(/^reliable support in incoming movement or news$/i, "steady support as the next movement begins")
      .replace(/^a solution or unlock in guidance and signal$/i, "an answer beginning to reveal the path more clearly")
      .replace(/^nervous communication in endurance$/i, "anxious discussion straining what you are trying to sustain on the path")
      .replace(/^a solution or unlock in improvement or movement$/i, "a workable answer beginning to emerge through the changes already underway")
      .replace(/^your stance toward the path under erosion and stress$/i, "your conviction being worn down by repeated strain")
      .replace(/^power around movement, distance, or transition$/i, "movement gaining strength once the path is allowed to change form")
      .replace(/^complication or mixed motives moving through strategy$/i, "mixed motives reinforcing a defensive pattern around the path")
      .replace(/^movement, distance, or transition under incoming momentum$/i, "movement becoming real once fresh momentum arrives")
      .replace(/^nervous communication in structure$/i, "anxious discussion trapped inside old structures or inherited commitments")
      .replace(/^incoming movement or news under improvement or movement$/i, "new movement beginning as the path starts to shift for the better")
      .replace(/^structure, distance, or institution under closure$/i, "an old structure or obligation reaching its natural limit")
      .replace(/^guidance around your stance toward the path$/i, "clearer direction forming around your own stance")
      .replace(/^support and loyalty around your stance toward the path$/i, "steady support helping your path hold")
      .replace(/^support and loyalty around movement, distance, or transition$/i, "steadier support beginning to gather around the path as it changes")
      .replace(/^nervous communication in documents and messages$/i, "anxious discussion reinforced by paperwork, terms, or constant messaging")
      .replace(/^your stance toward the path under endurance$/i, "your path being tested by what it can actually sustain")
      .replace(/^nervous communication moving through the answer point$/i, "anxious discussion crowding the very decision point")
      .replace(/^resource flow around your stance toward the path$/i, "real support and movement beginning to gather around your path")
      .replace(/^caution and self-interest under structure$/i, "defensive caution hardened by structure or inherited rules")
      .replace(/^a small opening in guidance$/i, "a small opening once the direction feels clearer")
      .replace(/^nervous communication\b/i, "anxious discussion and mental noise around the path")
      .replace(/^closure, ending, or rest\b/i, "an old path reaching its natural limit")
      .replace(/^burden and meaning\b/i, "real weight and what the path is asking you to carry")
      .replace(/^obstacle or delay\b/i, "a genuine blocker or delay on the path")
      .replace(/^a sharp decision or cut\b/i, "a necessary decision or refusal on the path")
      .replace(/^choice and branching paths\b/i, "a real fork or choice in how the path continues")
      .replace(/^a solution or unlock\b/i, "the actual answer or opening on the path")
      .replace(/^heart, value, or feeling\b/i, "what still feels deeply true")
      .replace(/^movement, distance, or transition\b/i, "movement on the path")
      .replace(/^structure, distance, or institution\b/i, "old structures or inherited obligations on the path")
      .replace(/^guidance\b/i, "clearer direction and a longer-range signal on the path")
      .replace(/^a newly forming situation\b/i, "an early-stage opening on the path")
      .replace(/^endurance\b/i, "staying power and long-term commitment to the path")
      .replace(/^resource flow\b/i, "practical support and what is actually moving")
      .replace(/^social or public life\b/i, "the wider field where the path becomes visible to others")
      .replace(/^your own field\b/i, "your own sense of the path")
      .replace(/^your own position\b/i, "your own stance toward the path");
  }

  if (subjectId === "work") {
    rewritten = rewritten
      .replace(/^caution and self-interest in erosion and stress$/i, "defensive strategy deepening a work situation already worn down by repeated strain")
      .replace(/^stability and endurance in values and love$/i, "steadier footing gathering around the work that still genuinely matters")
      .replace(/^structure, distance, or institution under structure$/i, "formal pressure and rigid structure reinforcing themselves at work")
      .replace(/^grace, goodwill, or invitation under support and loyalty$/i, "a more workable opening backed by support that is actually dependable")
      .replace(/^warmth and feeling brought fully into the light$/i, "clear visibility around what matters")
      .replace(/^the emotional truth\b/i, "what matters most")
      .replace(/^the commitment question\b/i, "the question of what can hold")
      .replace(/^your own position in the bond\b/i, "your professional position")
      .replace(/^caution and self-interest in repetition$/i, "defensive strategy trapped in a repeating work loop")
      .replace(/^power or resource control under expansion$/i, "authority and resources beginning to move again")
      .replace(/^closure, ending, or rest moving through fog or uncertainty$/i, "an old process or role reaching its limit under uncertainty")
      .replace(/^grace, goodwill, or invitation in grace$/i, "a more workable opening in the professional climate")
      .replace(/^fog and uncertainty moving through communication and nerves$/i, "confused communication and reactive noise at work")
      .replace(/^caution and self-interest moving through communication and nerves$/i, "defensive strategy feeding anxious or reactive work communication")
      .replace(/^caution and self-interest under caution$/i, "defensive caution tightening into a loop at work")
      .replace(/^a small beginning under a newly forming situation$/i, "a small but usable reset in the work itself")
      .replace(/^a small opening under clarity and success$/i, "a small opening once the path is clearer and momentum is real")
      .replace(/^constructive change under values and love$/i, "constructive change around what still feels worth backing professionally")
      .replace(/^complication or mixed motives under fog or uncertainty$/i, "mixed motives and office politics thickening the uncertainty")
      .replace(/^uncertainty and mixed signals moving through fog or uncertainty$/i, "growing uncertainty in a work picture that is still too unclear to trust")
      .replace(/^values and love around power or resource control$/i, "a healthier alignment around who holds power and support")
      .replace(/^obstacle or delay under repetition$/i, "a blocker stuck inside the same repeating work loop")
      .replace(/^expansion around a small beginning$/i, "a small opening that could grow if handled cleanly")
      .replace(/^closure, ending, or rest moving through decisive cuts$/i, "a process or phase ending under a necessary hard decision")
      .replace(/^expansion around reliable support$/i, "reliable support beginning to give the work more room to move")
      .replace(/^resources and flow in communication and nerves$/i, "resource questions getting tangled in reactive communication")
      .replace(/^a small beginning with more promise in it than its size suggests$/i, "a small beginning that could matter more than it first appears")
      .replace(/^closure, ending, or rest in choice$/i, "a needed ending or pause around an unresolved decision")
      .replace(/^clarity and visible progress in clarity and success$/i, "clearer progress that can actually be seen and trusted")
      .replace(/^closure, ending, or rest under the meaningful burden$/i, "a needed pause or ending around work that has become too heavy to carry as-is")
      .replace(/^endurance around your own position$/i, "steadier footing around your own role")
      .replace(/^your own position under a small opening$/i, "a small but usable opening around your professional position")
      .replace(/^fog and uncertainty in communication and nerves$/i, "fog and reactive noise in work communication")
      .replace(/^slow growth around a solution or unlock$/i, "a fix beginning to take hold slowly enough to last")
      .replace(/^your role in the household under guidance$/i, "clearer direction beginning to form around your role at work")
      .replace(/^your role in the household inside improvement or movement$/i, "your role at work becoming part of the needed improvement")
      .replace(/^your role in the household being defined through loyalty, reliability, and the quiet labor of showing up consistently for others$/i, "reliable follow-through shaping your position at work")
      .replace(/^a strategic ending or necessary pause$/i, "a needed pause, closure, or reset in the work itself")
      .replace(/^your role in the household inside grace$/i, "a more workable tone beginning around your role")
      .replace(/^grace, goodwill, or invitation under improvement or movement$/i, "a more workable tone as conditions begin to improve")
      .replace(/^grace, goodwill, or invitation in values and love$/i, "a more supportive tone around what still matters professionally")
      .replace(/^grace, goodwill, or invitation under expansion$/i, "a more workable opening as momentum builds")
      .replace(/^your role in the household under expansion$/i, "your role gaining room to move")
      .replace(/^your role at home being shaped by anxious conversation, repeated check-ins, or the practical strain of too many unsettled discussions$/i, "your role being shaped by anxious updates, repeated check-ins, or too many unsettled work conversations")
      .replace(/^a gentler new beginning in the household$/i, "a smaller, cleaner restart in the work itself")
      .replace(/^closure, ending, or rest in commitment$/i, "a role, agreement, or repeating obligation reaching the point where it needs to end or be renegotiated")
      .replace(/^your own position under endurance$/i, "your professional position finding steadier footing through persistence and staying power")
      .replace(/^repeating terms moving through repeated strain and attrition$/i, "recurring commitments and contract terms being worn down by the same pressure that has not let up")
      .replace(/^your own position under the answer point$/i, "your professional position becoming more central once the key decision or strategic fix is named")
      .replace(/^the question of what can hold$/i, "the question of whether current commitments and work terms can hold under the existing pressure")
      .replace(/^uncertainty and mixed signals under the meaningful burden$/i, "unclear signals and mixed direction pressing into an already heavy workload")
      .replace(/^structural blockers require persistence and planning$/i, "structural blockers that demand patience and deliberate planning")
      .replace(/^strategy gains clarity and coherence$/i, "the point where strategic direction becomes clearer and the picture holds")
      .replace(/^your own position under improvement or movement$/i, "your professional position beginning to shift as conditions create room for it")
      .replace(/^your own position around your own position$/i, "your own professional position as the clearest point of leverage available")
      .replace(/^erosion, worry, or leakage moving through obstruction$/i, "accumulated drain and depletion pressing against a structural block that has not moved yet")
      .replace(/^budget, authority, and ownership come forward$/i, "budget, authority, and ownership beginning to come forward")
      .replace(/^a sharp decision or cut in decisive cuts$/i, "a necessary decision or cut that has to be named and made without delay")
      .replace(/^your own position around clearer visible progress$/i, "your professional position becoming more visible and clearly productive as things begin to move")
      .replace(/^a phase where structural blockers require persistence and planning$/i, "structural blockers that demand patient, deliberate planning")
      .replace(/^networking and visibility support progress$/i, "how networking and visibility create the conditions for professional progress")
      .replace(/^a phase where networking and visibility support progress$/i, "the point where networking and visibility begin to support forward movement")
      .replace(/^events beginning to move the moment your own stance becomes clear$/i, "the way things begin to move once your own professional position is clearly held")
      .replace(/^uncertainty and mixed signals moving through decisive cuts$/i, "unclear direction and mixed signals pressing toward a decision or boundary that can no longer wait")
      .replace(/^a sharp decision or cut in anxious talk and crossed signals$/i, "a necessary decision or boundary being muddied by anxious communication and crossed signals")
      .replace(/^the other person's stance in anxious talk and crossed signals$/i, "the other party's position being complicated by anxious communication and crossed signals")
      .replace(/^reliable support in clearer momentum$/i, "reliable support giving the work clearer forward momentum")
      .replace(/^public-facing diplomacy creates opportunities$/i, "the opportunities that open when public-facing work and diplomacy are handled well")
      .replace(/^your own position in structure$/i, "your professional position being constrained by structure, hierarchy, or rigid systems")
      .replace(/^your own position under structure\b/i, "your professional position being pressed down by formal structure, hierarchy, or rigid systems")
      .replace(/^incoming momentum around warmth, goodwill, or a friendlier response$/i, "incoming movement or a concrete update arriving at exactly the moment when the professional climate is becoming more receptive")
      .replace(/^expansion around clearer visible progress$/i, "growing room opening around a more visible, demonstrable result")
      .replace(/^closure, ending, or rest under structure$/i, "a process, role, or phase being held in place by structure when it should have ended or reset")
      .replace(/^incoming movement or a concrete update in expansion$/i, "incoming news or a concrete update opening up more room to move")
      .replace(/^your own position under slow growth$/i, "your professional position gaining ground through patient, incremental progress")
      .replace(/^burden and meaning in the meaningful burden$/i, "genuine weight and accountability reinforcing each other, with no obvious way to set either down")
      .replace(/^a small beginning in endurance$/i, "a modest first move that builds staying power if followed through consistently")
      .replace(/^improvement or movement around reliable support$/i, "real improvement becoming available when reliable support is part of the picture")
      .replace(/^improvement or movement around stability and endurance$/i, "real improvement becoming available once the work settles onto a more durable, sustainable footing")
      .replace(/^closure, ending, or rest under repeated strain and attrition$/i, "a process or phase that needs to end, being ground down further by the same pressure that has not let up")
      .replace(/^guidance and signal under anxious talk and crossed signals$/i, "clear direction being muddied by anxious communication, chatter, and crossed signals")
      .replace(/^slow growth around a small beginning$/i, "slow but real progress building from a modest, sustainable first step")
      .replace(/^uncertainty and mixed signals under strategy$/i, "unclear direction and mixed signals filtering through guarded strategy or political maneuvering")
      .replace(/^your own position under expansion$/i, "your professional position gaining more room as the work begins to expand")
      .replace(/^your own position in expansion\b/i, "your professional position gaining more room as the work begins to open up")
      .replace(/^mixed motives under closure$/i, "guarded self-interest and mixed motives reinforcing a situation that should already be closing")
      .replace(/^your own position under reliable support$/i, "your professional position becoming steadier when reliable support is genuinely present")
      .replace(/^your own position in reliable support\b/i, "your professional position becoming more stable when reliable support is genuinely available")
      .replace(/^closure, ending, or rest in caution$/i, "a process or phase being held back by overcautious handling when it needs to close or reset")
      .replace(/^a sharp decision or cut under fog or uncertainty$/i, "a necessary decision or cut being clouded by unclear information and shifting priorities")
      .replace(/^your own position under grace$/i, "your professional position becoming more workable through goodwill, diplomacy, and a more receptive tone")
      .replace(/^erosion, worry, or leakage moving through structure$/i, "accumulated drain and depletion being locked in by structural rigidity or rigid process")
      .replace(/^slower, steadier growth under a small opening$/i, "a modest opening that rewards slower, more deliberate follow-through")
      .replace(/^defensive caution and guarded self-interest moving through structure$/i, "defensive handling and self-protective strategy tightening inside a structure that was already rigid")
      .replace(/^a small opening around a solution or unlock$/i, "a small but usable opening beginning to form around the actual fix or unlock")
      .replace(/^your own position under repeated strain and attrition$/i, "your professional position being ground down by the same pressure that has not let up")
      .replace(/^slower, steadier growth under clearer momentum$/i, "slow but real progress building traction once the clearer momentum is used well")
      .replace(/^erosion, worry, or leakage under repeated strain and attrition$/i, "accumulated drain and depletion being ground down further by the same pressure that has not let up")
      .replace(/^the other person's stance in decisive cuts$/i, "the other party's position hardening into or around a decisive cut or boundary call")
      .replace(/^a small opening as momentum starts to build$/i, "a small opening that gains real traction as momentum begins to build behind it")
      .replace(/^a sharp decision or cut in obstruction$/i, "a necessary decision or clean cut being blocked by something that has not yet been moved around")
      .replace(/^a sharp decision or cut in repeated strain and attrition$/i, "a necessary decision or cut being worn down by the same sustained pressure that has not let up")
      .replace(/^a sharp decision or cut under strategy$/i, "a necessary decision or cut being handled through guarded strategy and self-protective maneuvering rather than named directly")
      .replace(/^a sharp decision or cut moving through structure$/i, "a necessary decision or cut being slowed and complicated by formal structure, hierarchy, or institutional process")
      .replace(/^a small opening under maturity$/i, "a small but real opening becoming available through principled judgment and a more measured, seasoned approach")
      .replace(/^a small opening in power\b$/i, "a small but usable opening appearing where leverage or backing is beginning to matter")
      .replace(/^maturity helping slower, steadier growth take hold$/i, "professional maturity creating the conditions for slower, steadier progress to actually hold")
      .replace(/^emotional weather or recognition moving through repeated strain and attrition$/i, "recognition and emotional climate being worn down by the same pressure that keeps not letting up")
      .replace(/^what genuinely matters around your own position$/i, "clarity about what genuinely matters beginning to inform how your professional position holds")
      .replace(/^defensive caution and guarded self-interest in the meaningful burden$/i, "self-protective strategy and guarded self-interest deepening what is already a heavy workload")
      .replace(/^defensive caution and guarded self-interest under the meaningful burden$/i, "self-protective strategy and guarded self-interest being pressed down by duty, obligation, and real professional weight")
      .replace(/^your own position in grace$/i, "your professional position becoming more sustainable through goodwill, social ease, and a receptive tone")
      .replace(/^nervous communication moving through fog or uncertainty$/i, "anxious communication and reactive chatter being made worse by unclear direction and shifting priorities")
      .replace(/^slower, steadier growth in guidance$/i, "slow but steady progress building once clearer direction and guidance are in place")
      .replace(/^defensive caution and guarded self-interest under repetition$/i, "self-protective strategy and guarded self-interest locked inside the same repeating work loop")
      .replace(/^power around your own position$/i, "the authority or backing your professional position already carries beginning to matter more")
      .replace(/^uncertainty and mixed signals under caution$/i, "unclear signals and mixed direction being tightened further by self-protective caution")
      .replace(/^a solution or unlock under slow growth$/i, "the actual fix or unlock becoming available once the work slows to a pace that can sustain it")
      .replace(/^stability and foundations in repeated strain and attrition$/i, "the stability and foundational reliability of your role being worn down by the same pressure that has not let up")
      .replace(/^your own position in clearer momentum$/i, "your professional position beginning to gain clearer forward momentum")
      .replace(/^a solution or unlock in maturity$/i, "the actual fix or unlock becoming available through principled judgment and a more mature approach")
      .replace(/^closure, ending, or rest under recognition$/i, "a process or role that should be closing being held in place by the recognition question still unresolved")
      .replace(/^burden and meaning in repeated strain and attrition$/i, "real weight and accountability being ground down by the same pressure that has not let up")
      .replace(/^maturity around heart, value, or feeling$/i, "the professional maturity that makes it possible to act from what genuinely matters rather than what is merely pressing")
      .replace(/^closure, ending, or rest as a dominant thread$/i, "an ending, withdrawal, or need for rest running through the whole picture as the dominant pressure")
      .replace(/^structure, distance, or institution under closure$/i, "formal structure, institutional distance, or rigid hierarchy pressing into a situation that needs to close or reset")
      .replace(/^clearer visible progress in grace$/i, "clearer, more visible results becoming available as the professional climate becomes more receptive")
      .replace(/^uncertainty and mixed signals under the public field$/i, "unclear signals and mixed direction pressing into the visible, public-facing layer of the work")
      .replace(/^your own position under caution$/i, "your professional position being tightened further by self-protective caution")
      .replace(/^a small opening in slow growth$/i, "a small opening that holds better when the pace is slower and more sustainable")
      .replace(/^nervous communication under structure$/i, "anxious or reactive communication being held rigid by formal structure or hierarchical pressure")
      .replace(/^the answer point around slower, steadier growth$/i, "the workable answer or decisive fix becoming available as the pace slows to something more sustainable")
      .replace(/^improvement or movement around movement, distance, or transition$/i, "process improvement or a positive shift becoming available once a transition or change of direction is properly handled")
      .replace(/^obstacle or delay under anxious talk and crossed signals$/i, "a genuine blocker or delay being made worse by anxious communication and crossed signals")
      .replace(/^incoming movement or a concrete update in incoming momentum$/i, "incoming news or a concrete update that lands at exactly the right moment to create real momentum")
      .replace(/^(?:complication or )?mixed motives in strategy$/i, "guarded self-interest and mixed motives reinforcing each other in how the work is being approached")
      .replace(/^a small opening around your own position$/i, "a small but usable opening gathering around your professional position")
      .replace(/^burden and meaning moving through strategy$/i, "real weight and accountability being filtered through defensive strategy or self-protective maneuvering")
      .replace(/^(?:complication or )?mixed motives under repetition$/i, "guarded self-interest and mixed motives locked inside the same repeating work loop")
      .replace(/^constructive change in the public field$/i, "constructive change beginning to take hold in the visible, public-facing layer of the work")
      .replace(/^a message, record, or document under a small opening$/i, "a specific message, record, or document that becomes more actionable once a small opening appears")
      .replace(/^structure, distance, or institution in caution$/i, "formal structure, institutional distance, or hierarchical rigidity being tightened further by self-protective caution")
      .replace(/^constructive change in slow growth$/i, "constructive change taking hold slowly enough to be sustainable")
      .replace(/^obstacle or delay in caution$/i, "a genuine blocker or delay being tightened further by self-protective caution")
      .replace(/^clearer momentum around maturity and restraint$/i, "clearer forward movement becoming available through principled judgment and steady composure")
      .replace(/^closure, ending, or rest moving through structure$/i, "a process or role that needs to close being locked in by structural rigidity or formal hierarchy")
      .replace(/^the public field around your own position$/i, "how your professional position lands and is read in the wider, more visible field")
      .replace(/^defensive caution and guarded self-interest under fog or uncertainty$/i, "self-protective strategy and guarded self-interest being made harder to read by unclear direction and shifting signals")
      .replace(/^defensive caution and guarded self-interest in fog or uncertainty$/i, "self-protective strategy and guarded self-interest thickening inside unclear direction and shifting priorities")
      .replace(/^heart, value, or feeling in what genuinely matters$/i, "what genuinely matters at the level of morale, meaning, and professional value beginning to clarify itself")
      .replace(/^your own position in slow growth$/i, "your professional position gaining ground through patient, incremental progress")
      .replace(/^clearer visible progress under resource flow$/i, "clearer, more demonstrable results becoming possible once resource flow is properly directed")
      .replace(/^structure, distance, or institution moving through repeated strain and attrition$/i, "formal structure, institutional distance, or rigid hierarchy being ground down by the same sustained pressure that has not let up")
      .replace(/^structure, distance, or institution getting tangled in anxious talk and crossed signals$/i, "formal structure, institutional distance, or hierarchical rigidity being made worse by anxious communication and crossed signals")
      .replace(/^a small opening around heart, value, or feeling$/i, "a small but real opening becoming available once what genuinely matters is allowed to inform how the situation is handled")
      .replace(/^nervous communication in repeated strain and attrition$/i, "anxious communication and reactive chatter being ground down by the same sustained pressure that has not let up")
      .replace(/^nervous communication in the meaningful burden$/i, "anxious communication and reactive chatter being loaded down with duty, obligation, and real professional weight")
      .replace(/^nervous communication under decisive cuts$/i, "anxious communication and reactive chatter being tightened further by a decision or boundary that has not yet been made cleanly")
      .replace(/^nervous communication moving through closure$/i, "anxious communication and reactive chatter pressing into a situation that needs to close but has not yet been allowed to")
      .replace(/^your own position in structural stability\b/i, "your professional position becoming more grounded as structural stability holds")
      .replace(/^your own position in closure\b/i, "your professional position pressing up against a needed ending or reset that has not yet been allowed to close")
      .replace(/^maturity around a small beginning$/i, "the professional maturity that allows a modest first move to be made without oversizing it or letting it stall")
      .replace(/^maturity around a solution or unlock$/i, "the professional maturity that makes the actual fix or unlock available once principled judgment is applied")
      .replace(/^reliable support in commitment$/i, "reliable support becoming more available and more usable once the right obligations are clearly in place")
      .replace(/^maturity and restraint in reliable support$/i, "principled judgment and steady composure creating the conditions where reliable support can actually hold")
      .replace(/^the public or social field under clearer momentum$/i, "how the wider, more visible field begins to work in your favour once clearer forward momentum is established")
      .replace(/^erosion, worry, or leakage in decisive cuts$/i, "accumulated drain and depletion pressing up against a decision or cut that can no longer be deferred")
      .replace(/^erosion, worry, or leakage under decisive cuts$/i, "accumulated drain and depletion being tightened further by a decision or boundary that has not yet been made cleanly")
      .replace(/^hidden knowledge or secrecy under caution$/i, "restricted or undisclosed information being tightened further by self-protective caution")
      .replace(/^defensive caution and guarded self-interest under closure$/i, "self-protective strategy and guarded self-interest reinforcing a situation that should already be closing")
      .replace(/^defensive caution and guarded self-interest moving through strategy$/i, "self-protective strategy and guarded self-interest locking inside a pattern of defensive maneuvering")
      .replace(/^your own position in power\b/i, "your professional position gaining firmer ground through clearer leverage and stronger backing")
      .replace(/^uncertainty and mixed signals moving through obstruction$/i, "unclear direction and mixed signals pressing against a structural block that has not yet moved")
      .replace(/^uncertainty and mixed signals moving through closure$/i, "unclear direction and mixed signals pressing into a situation that should already be closing")
      .replace(/^uncertainty and mixed signals in repeated strain and attrition$/i, "unclear direction and mixed signals being ground down by the same sustained pressure that has not let up")
      .replace(/^incoming movement or a concrete update under what genuinely matters$/i, "incoming news or a concrete update that lands where it can actually support what matters most")
      .replace(/^what genuinely matters around movement, distance, or transition$/i, "clarity about what genuinely matters beginning to inform a transition or change of direction")
      .replace(/^grace around your own position$/i, "the goodwill and social ease that make your professional position more workable and more sustainable")
      .replace(/^warmth, goodwill, or a friendlier response under slow growth$/i, "a more workable professional climate becoming available as the pace slows to something sustainable")
      .replace(/^warmth, goodwill, or a friendlier response under the answer point$/i, "a more workable professional climate becoming available once the key decision or strategic fix is named")
      .replace(/^warmth, goodwill, or a friendlier response under what genuinely matters$/i, "a more workable professional climate becoming available once the work is anchored to what actually matters")
      .replace(/^mixed motives under recognition$/i, "guarded self-interest and mixed motives deepening inside a situation where recognition is still unresolved")
      .replace(/^repeated friction and pressure moving through repeated strain and attrition$/i, "repeating friction and pressure being ground down further by the same sustained strain that has not let up")
      .replace(/^greater freedom beginning to open around your own position$/i, "a genuine opening beginning to form around your professional position as the work begins to give you more room")
      .replace(/^burden and meaning in anxious talk and crossed signals$/i, "real weight and accountability being tangled up in anxious communication and crossed signals")
      .replace(/^burden and meaning under fog or uncertainty$/i, "real weight and accountability being made harder to carry by unclear direction and shifting priorities")
      .replace(/^a newly forming situation around constructive change$/i, "an early-stage opening beginning to form around genuine, constructive improvement")
      .replace(/^repeated friction and pressure moving through closure$/i, "a repeating pressure pattern pressing into a situation that needs to close but has not yet been allowed to")
      .replace(/^repeated friction and pressure in the meaningful burden$/i, "repeating friction and pressure deepening what is already a heavy load of duty and professional responsibility")
      // burden and meaning variants
      .replace(/^burden and meaning under closure$/i, "real weight and accountability pressing into a situation that needs to close or reset")
      .replace(/^burden and meaning under repeated strain and attrition$/i, "real weight and accountability being ground down by the same sustained pressure that has not let up")
      .replace(/^burden and meaning in decisive cuts$/i, "real weight and accountability pressing toward a decision or cut that has to be named and made")
      .replace(/^burden and meaning moving through closure$/i, "real weight and accountability pressing into a process that needs to end but has not yet been allowed to")
      .replace(/^burden and meaning moving through fog or uncertainty$/i, "real weight and accountability being complicated by unclear direction and shifting priorities")
      .replace(/^burden and meaning under anxious talk and crossed signals$/i, "real weight and accountability being tangled further by anxious communication and crossed signals")
      .replace(/^burden and meaning under strategy$/i, "real weight and accountability being filtered through guarded strategy and self-protective maneuvering")
      // closure variants
      .replace(/^closure, ending, or rest getting tangled in anxious talk and crossed signals$/i, "a process or role that needs to close being muddied by anxious communication and crossed signals")
      .replace(/^closure, ending, or rest in anxious talk and crossed signals$/i, "a process or role that needs to close being muddied by anxious communication and crossed signals")
      .replace(/^closure, ending, or rest in repetition$/i, "a process or role that needs to close being caught in the same repeating work loop")
      .replace(/^closure, ending, or rest in the meaningful burden$/i, "a process or role that needs to close being held in place by real duty and professional weight")
      .replace(/^closure, ending, or rest under caution$/i, "a process or phase being held back by overcautious handling when it needs to close or reset")
      .replace(/^closure, ending, or rest under repetition$/i, "a process or role that needs to close being held in place by repeating obligations and work loops")
      .replace(/^closure, ending, or rest under strategy$/i, "a process or role that needs to close being managed through guarded strategy rather than allowed to end cleanly")
      // nervous communication variants
      .replace(/^nervous communication moving through decisive cuts$/i, "anxious communication and reactive chatter pressing toward a decision or boundary that has to be made cleanly")
      .replace(/^nervous communication moving through obstruction$/i, "anxious communication and reactive chatter pressing against a structural block that has not yet moved")
      .replace(/^nervous communication in anxious talk and crossed signals$/i, "anxious communication tightening into reactive noise and crossed signals with no clear centre holding")
      .replace(/^nervous communication in closure$/i, "anxious communication pressing into a situation that needs to close but has not been allowed to")
      .replace(/^nervous communication in fog or uncertainty$/i, "anxious communication being made worse by unclear direction and shifting priorities")
      .replace(/^nervous communication in the other person's field$/i, "anxious communication affecting how the other party is reading the situation")
      .replace(/^nervous communication moving through endurance$/i, "anxious communication being tested by what the work can actually sustain long-term")
      .replace(/^nervous communication moving through the meaningful burden$/i, "anxious communication pressing into real duty, weight, and professional responsibility")
      // obstacle or delay variants
      .replace(/^obstacle or delay in decisive cuts$/i, "a blocker or delay pressing toward a decision or cut that has to be made")
      .replace(/^obstacle or delay in fog or uncertainty$/i, "a blocker or delay being made worse by unclear direction and shifting priorities")
      .replace(/^obstacle or delay in strategy$/i, "a blocker or delay being managed through guarded strategy rather than addressed directly")
      .replace(/^obstacle or delay under strategy$/i, "a blocker or delay being managed through guarded strategy rather than addressed directly")
      // sharp decision variants
      .replace(/^a sharp decision or cut in caution$/i, "a necessary decision or cut being held back by self-protective caution")
      .replace(/^a sharp decision or cut in closure$/i, "a necessary decision or cut pressing into a situation that needs to close but has not yet been allowed to")
      .replace(/^a sharp decision or cut in strategy$/i, "a necessary decision or cut being managed through guarded strategy rather than named directly")
      .replace(/^a sharp decision or cut moving through obstruction$/i, "a necessary decision or cut pressing against a structural block that has not yet moved")
      .replace(/^a sharp decision or cut moving through repetition$/i, "a necessary decision or cut pressing into the same repeating work loop that has not yet changed")
      .replace(/^a sharp decision or cut under anxious talk and crossed signals$/i, "a necessary decision or cut being muddied by anxious communication and crossed signals")
      .replace(/^a sharp decision or cut under the meaningful burden$/i, "a necessary decision or cut being weighed down by real duty, obligation, and professional weight")
      .replace(/^a sharp decision or cut under what is hidden$/i, "a necessary decision or cut being held back by restricted information or undisclosed knowledge")
      // structure variants
      .replace(/^structure, distance, or institution in closure$/i, "formal structure, institutional distance, or rigid hierarchy pressing into a situation that needs to close or reset")
      .replace(/^structure, distance, or institution in repeated strain and attrition$/i, "formal structure, institutional distance, or rigid hierarchy being ground down by the same sustained pressure that has not let up")
      .replace(/^structure, distance, or institution in the meaningful burden$/i, "formal structure, institutional distance, or rigid hierarchy deepening what is already a heavy load of duty")
      .replace(/^structure, distance, or institution moving through fog or uncertainty$/i, "formal structure, institutional distance, or rigid hierarchy being complicated by unclear direction and shifting priorities")
      .replace(/^structure, distance, or institution under obstruction$/i, "formal structure, institutional distance, or rigid hierarchy pressing against a structural block that has not yet moved")
      // solution or unlock variants
      .replace(/^a solution or unlock in incoming momentum$/i, "the actual fix or unlock becoming available as incoming momentum creates the right opening")
      .replace(/^a solution or unlock in what genuinely matters$/i, "the actual fix or unlock becoming clearer once the work is anchored to what matters most")
      .replace(/^a solution or unlock under what genuinely matters$/i, "the actual fix or unlock becoming clearer once the work is anchored to what matters most")
      .replace(/^a solution or unlock getting tangled in anxious talk and crossed signals$/i, "the actual fix or unlock being muddied by anxious communication and crossed signals")
      // heart, value, or feeling variants
      .replace(/^heart, value, or feeling in guidance$/i, "what genuinely matters at the level of morale and professional value becoming clearer once clear direction is in place")
      .replace(/^heart, value, or feeling in a newly forming situation$/i, "what genuinely matters at the level of morale and professional value beginning to emerge from an early-stage situation")
      .replace(/^heart, value, or feeling in endurance$/i, "what genuinely matters at the level of morale and professional value finding steadier ground through persistence and staying power")
      .replace(/^heart, value, or feeling in maturity$/i, "what genuinely matters at the level of morale and professional value becoming available through principled judgment and steady composure")
      .replace(/^heart, value, or feeling in your own position$/i, "what genuinely matters at the level of morale and professional value beginning to inform how your professional position holds")
      .replace(/^heart, value, or feeling under choice$/i, "what genuinely matters at the level of morale and professional value pressing up against an open decision")
      // movement, distance, or transition variants
      .replace(/^movement, distance, or transition in improvement or movement$/i, "a transition or change of direction building momentum as real improvement begins")
      .replace(/^movement, distance, or transition in the answer point$/i, "a transition or change of direction becoming the actual answer or unlock")
      .replace(/^movement, distance, or transition in your own position$/i, "a transition or change of direction beginning to reshape your professional position")
      .replace(/^movement, distance, or transition under a newly forming situation$/i, "movement opening inside a situation that is still too early to fully commit to")
      .replace(/^movement, distance, or transition under choice$/i, "a transition or change of direction being complicated by an open decision that has not yet been made")
      .replace(/^movement, distance, or transition under improvement or movement$/i, "a transition or change of direction supported by genuine improvement in the conditions")
      .replace(/^movement, distance, or transition under your own position$/i, "a transition or change of direction that depends on your own professional position being clearly held")
      // your own position variants
      .replace(/^your own position around heart, value, or feeling$/i, "your professional position gaining more clarity when what genuinely matters is allowed to guide it")
      .replace(/^your own position around stability and endurance$/i, "your professional position finding steadier, more durable footing as stability and staying power begin to hold")
      // other
      .replace(/^a newly forming situation around movement, distance, or transition$/i, "an early-stage opening beginning to form around a transition or change of direction")
      .replace(/^choice and branching paths in clearer momentum$/i, "a strategic fork or open decision becoming more navigable once clearer forward momentum is established")
      // pre-transform: communication and nerves (→ anxious talk and crossed signals after work block)
      .replace(/^closure, ending, or rest moving through communication and nerves$/i, "a process or role that needs to close being muddied by anxious communication and crossed signals")
      .replace(/^closure, ending, or rest in communication and nerves$/i, "a process or role that needs to close being muddied by anxious communication and crossed signals")
      .replace(/^a sharp decision or cut in communication and nerves$/i, "a necessary decision or boundary being muddied by anxious communication and crossed signals")
      .replace(/^a sharp decision or cut under communication and nerves$/i, "a necessary decision or cut being muddied by anxious communication and crossed signals")
      .replace(/^a solution or unlock moving through communication and nerves$/i, "the actual fix or unlock being muddied by anxious communication and crossed signals")
      .replace(/^burden and meaning under communication and nerves$/i, "real weight and accountability being tangled further by anxious communication and crossed signals")
      .replace(/^burden and meaning moving through communication and nerves$/i, "real weight and accountability being tangled further by anxious communication and crossed signals")
      .replace(/^choice and branching paths moving through communication and nerves$/i, "a strategic fork or open decision being muddied by anxious communication and crossed signals")
      .replace(/^nervous communication in communication and nerves$/i, "anxious communication tightening into reactive noise and crossed signals with no clear centre holding")
      .replace(/^nervous communication moving through communication and nerves$/i, "anxious communication tightening further into reactive noise and crossed signals with no clear centre holding")
      .replace(/^nervous communication under communication and nerves$/i, "anxious communication being made worse by reactive chatter, crossed signals, and too much unsettled talk at once")
      .replace(/^obstacle or delay under communication and nerves$/i, "a genuine blocker or delay being made worse by anxious communication and crossed signals")
      .replace(/^structure, distance, or institution in communication and nerves$/i, "formal structure, institutional distance, or hierarchical rigidity being made worse by anxious communication and crossed signals")
      .replace(/^structure, distance, or institution moving through communication and nerves$/i, "formal structure, institutional distance, or hierarchical rigidity being made worse by anxious communication and crossed signals")
      // pre-transform: erosion and stress (→ repeated strain and attrition after work block)
      .replace(/^a sharp decision or cut in erosion and stress$/i, "a necessary decision or cut being worn down by the same sustained pressure that has not let up")
      .replace(/^a sharp decision or cut moving through erosion and stress$/i, "a necessary decision or cut pressing into the same sustained pressure that has not yet let up")
      .replace(/^burden and meaning under erosion and stress$/i, "real weight and accountability being ground down by the same sustained pressure that has not let up")
      .replace(/^closure, ending, or rest under erosion and stress$/i, "a process or phase that needs to end, being ground down further by the same pressure that has not let up")
      .replace(/^nervous communication in erosion and stress$/i, "anxious communication and reactive chatter being ground down by the same sustained pressure that has not let up")
      .replace(/^nervous communication under erosion and stress$/i, "anxious communication and reactive chatter being ground down further by the same sustained pressure that has not let up")
      .replace(/^structure, distance, or institution in erosion and stress$/i, "formal structure, institutional distance, or rigid hierarchy being ground down by the same sustained pressure that has not let up")
      .replace(/^structure, distance, or institution moving through erosion and stress$/i, "formal structure, institutional distance, or rigid hierarchy being worn down by the same sustained pressure that has not let up")
      // pre-transform: values and love / clarity and success / support and loyalty (→ post-transform labels after work block)
      .replace(/^a solution or unlock in values and love$/i, "the actual fix or unlock becoming clearer once the work is anchored to what matters most")
      .replace(/^a solution or unlock under values and love$/i, "the actual fix or unlock becoming clearer once the work is anchored to what matters most")
      .replace(/^choice and branching paths in clarity and success$/i, "a strategic fork or open decision becoming more navigable once clearer forward momentum is established")
      .replace(/^guidance and signal in values and love$/i, "clearer direction and a longer-range signal becoming available once the work is anchored to what matters most")
      .replace(/^guidance and signal under values and love$/i, "clearer direction and a longer-range signal becoming available once the work is anchored to what matters most")
      .replace(/^guidance and signal under support and loyalty$/i, "clearer direction and a longer-range signal becoming available once reliable support is part of the picture")
      // pre-transform: your own field (house 29 phrase, → your own position after work block)
      .replace(/^heart, value, or feeling in your own field$/i, "what genuinely matters at the level of morale and professional value beginning to inform how your professional position holds")
      .replace(/^movement, distance, or transition in your own field$/i, "a transition or change of direction beginning to reshape your professional position")
      .replace(/^movement, distance, or transition under your own field$/i, "a transition or change of direction that depends on your own professional position being clearly held")
      .replace(/^your own field around clarity and visible progress$/i, "your professional position becoming more visible and clearly productive as things begin to move")
      .replace(/^your own field around heart, value, or feeling$/i, "your professional position gaining more clarity when what genuinely matters is allowed to guide it")
      .replace(/^your own field around stability and endurance$/i, "your professional position finding steadier, more durable footing as stability and staying power begin to hold")
      .replace(/^your own field around your own position$/i, "your own professional position as the clearest point of leverage available")
      // closure variants: fog, caution, strategy, documents, hidden
      .replace(/^closure, ending, or rest in fog or uncertainty$/i, "a process or role that needs to close being kept open by unclear direction and shifting priorities")
      .replace(/^closure, ending, or rest under fog or uncertainty$/i, "a process or role that needs to close being kept open by unclear direction and shifting priorities")
      .replace(/^closure, ending, or rest moving through caution$/i, "a process or role that needs to close being further delayed by self-protective caution")
      .replace(/^closure, ending, or rest moving through strategy$/i, "a process or role that needs to close being managed through defensive strategy rather than allowed to end cleanly")
      .replace(/^closure, ending, or rest under documents and messages$/i, "a process or role that needs to close being held in place by unresolved records or unclear written terms")
      .replace(/^closure, ending, or rest under what is hidden$/i, "a process or role that needs to close being held in place by restricted information or undisclosed knowledge")
      // burden and meaning: closure
      .replace(/^burden and meaning in closure$/i, "real weight and accountability pressing into a process or role that needs to close or reset")
      // sharp decision or cut: caution, decisive cuts, closure
      .replace(/^a sharp decision or cut moving through caution$/i, "a necessary decision or cut pressing against self-protective caution that keeps narrowing the available options")
      .replace(/^a sharp decision or cut moving through decisive cuts$/i, "a necessary decision or cut pressing into a situation that is already demanding hard choices")
      .replace(/^a sharp decision or cut under caution$/i, "a necessary decision or cut being held back by self-protective caution")
      .replace(/^a sharp decision or cut under closure$/i, "a necessary decision or cut pressing into a situation that needs to close but has not yet been allowed to")
      // nervous communication: caution, decisive cuts, endurance, resource flow, recognition, documents, fog, hidden, strategy
      .replace(/^nervous communication in caution$/i, "anxious communication and reactive chatter being held in place by self-protective caution")
      .replace(/^nervous communication in decisive cuts$/i, "anxious communication and reactive chatter pressing up against a decision or boundary that needs to be made cleanly")
      .replace(/^nervous communication in endurance$/i, "anxious communication and reactive chatter being tested by what the work can actually sustain long-term")
      .replace(/^nervous communication in resource flow$/i, "anxious communication and reactive chatter getting tangled in questions of budget, resources, or who controls the flow of support")
      .replace(/^nervous communication moving through caution$/i, "anxious communication and reactive chatter being held tighter by self-protective caution")
      .replace(/^nervous communication under documents and messages$/i, "anxious communication and reactive chatter being held in place by outstanding records or unclear written terms")
      .replace(/^nervous communication under fog or uncertainty$/i, "anxious communication and reactive chatter being made worse by unclear direction and shifting priorities")
      .replace(/^nervous communication under recognition$/i, "anxious communication and reactive chatter being made worse by unresolved recognition questions and visibility pressure")
      .replace(/^nervous communication under what is hidden$/i, "anxious communication and reactive chatter being made worse by restricted information or undisclosed knowledge")
      // obstacle or delay: caution, obstruction
      .replace(/^obstacle or delay under caution$/i, "a genuine blocker or delay being made harder to navigate by self-protective caution")
      .replace(/^obstacle or delay under obstruction$/i, "a delay or blocker being compounded by a structural block that has not yet been moved")
      // structure: strategy
      .replace(/^structure, distance, or institution in strategy$/i, "formal structure, institutional distance, or rigid hierarchy being managed through defensive strategy rather than addressed directly")
      .replace(/^structure, distance, or institution moving through strategy$/i, "formal structure, institutional distance, or rigid hierarchy being filtered through defensive strategy and self-protective maneuvering")
      // movement, distance, or transition: various opening contexts
      .replace(/^movement, distance, or transition under values and love$/i, "a transition or change of direction becoming clearer once the work is anchored to what matters most")
      .replace(/^movement, distance, or transition in values and love$/i, "a transition or change of direction becoming clearer once the work is anchored to what matters most")
      .replace(/^movement, distance, or transition in expansion$/i, "a transition or change of direction finding more room to move as things begin to expand")
      .replace(/^movement, distance, or transition under clarity and success$/i, "a transition or change of direction supported by clearer forward momentum")
      .replace(/^movement, distance, or transition under grace$/i, "a transition or change of direction becoming more workable as the professional climate becomes more receptive")
      .replace(/^movement, distance, or transition under guidance$/i, "a transition or change of direction becoming clearer once a longer-range signal is in place")
      .replace(/^movement, distance, or transition under maturity$/i, "a transition or change of direction becoming steadier through principled judgment and a more measured approach")
      .replace(/^movement, distance, or transition under slow growth$/i, "a transition or change of direction that holds better at a slower, more sustainable pace")
      // heart, value, or feeling: various opening contexts
      .replace(/^heart, value, or feeling in values and love$/i, "what genuinely matters at the level of morale and professional value becoming the central question")
      .replace(/^heart, value, or feeling in grace$/i, "what genuinely matters becoming more usable once the professional climate is more receptive and easier to work with")
      .replace(/^heart, value, or feeling in improvement or movement$/i, "what genuinely matters at the level of morale and professional value beginning to move in a healthier direction")
      .replace(/^heart, value, or feeling in incoming momentum$/i, "what genuinely matters at the level of morale and professional value beginning to arrive with fresh momentum")
      .replace(/^heart, value, or feeling under grace$/i, "what genuinely matters becoming more workable once the professional climate is more receptive")
      .replace(/^heart, value, or feeling under the public field$/i, "what genuinely matters being shaped by visibility, public-facing work, and how the situation is read in the wider field")
      // choice and branching paths: improvement or movement
      .replace(/^choice and branching paths under improvement or movement$/i, "a strategic fork or open decision becoming clearer as the conditions start to improve")
      // solution or unlock: expansion, a small opening
      .replace(/^a solution or unlock in expansion$/i, "the actual fix or unlock becoming available as the work begins to find more room to move")
      .replace(/^a solution or unlock under a small opening$/i, "the actual fix or unlock becoming available inside a small but real opening that can still be used")
      // concentrated at center
      .replace(/^closure, ending, or rest concentrated at the center$/i, "a process or role that needs to close sitting at the center of the whole work picture")
      // prefix catch-alls — handle all remaining card/house label combinations not caught above
      // (runs before general fallbacks; specific rules above take priority)
      .replace(/^nervous communication\b/i, "anxious communication and reactive chatter")
      .replace(/^closure, ending, or rest\b/i, "a process or role that needs to close")
      .replace(/^structure, distance, or institution\b/i, "formal structure, institutional distance, or rigid hierarchy")
      .replace(/^burden and meaning\b/i, "real weight and accountability")
      .replace(/^obstacle or delay\b/i, "a genuine blocker or delay")
      .replace(/^a sharp decision or cut\b/i, "a necessary decision or cut")
      .replace(/^choice and branching paths\b/i, "a strategic fork or open decision")
      .replace(/^a solution or unlock\b/i, "the actual fix or unlock")
      .replace(/^heart, value, or feeling\b/i, "what genuinely matters")
      .replace(/^movement, distance, or transition\b/i, "a transition or change of direction")
      .replace(/^guidance and signal\b/i, "clearer direction and a longer-range signal")
      .replace(/^guidance\b/i, "clearer direction")
      .replace(/^a newly forming situation\b/i, "an early-stage opening")
      .replace(/^endurance\b/i, "staying power and long-term commitment")
      .replace(/^resource flow\b/i, "the flow of resources and budget")
      .replace(/^social or public life\b/i, "the wider, more visible professional field")
      // general fallbacks — must stay last in this block
      .replace(/^(.+) (?:in|under|around) \1$/i, "the same dynamic reinforcing itself and keeping the situation from resolving cleanly")
      .replace(/^the other person's stance\b/i, "the other party's position")
      .replace(/^your own field\b/i, "your professional position")
      .replace(/^your own position\b/i, "your professional position");
  }

  if (subjectId === "legal_admin") {
    rewritten = rewritten
      .replace(/^the other side's position under erosion and stress$/i, "the other side's position being worn down by delay, pressure, or admin strain")
      .replace(/^fees, access, or process flow in strategic pressure or mixed motives$/i, "fees, access pressure, or procedural flow getting tangled in strategy and mixed motives")
      .replace(/^your side of the matter in stage change or procedural improvement$/i, "your side of the matter beginning to move once the process is corrected and resequenced")
      .replace(/^defensive strategy or close procedural reading moving through choice$/i, "defensive strategy complicating a decision point that can no longer stay open")
      .replace(/^values and love around visibility and review cycle$/i, "the file's real stake becoming clearer as review and visibility increase")
      .replace(/^defensive strategy or close procedural reading under caution$/i, "defensive handling tightening into overcautious process control")
      .replace(/^your side of the matter moving only through patient, well-documented follow-through$/i, "your side can still move, but only through patient, well-documented follow-through")
      .replace(/^the other side's position moving through strategic pressure or mixed motives$/i, "the other side's position getting tangled in strategy, pressure, or mixed motives")
      .replace(/^your side of the matter under stage change or procedural improvement$/i, "your side of the matter beginning to move once the process is corrected and sequenced properly")
      .replace(/^the public or social field under strategic pressure or mixed motives$/i, "the wider public or institutional field getting tangled in strategy, pressure, or mixed motives")
      .replace(/^structure, distance, or institution in strategic pressure or mixed motives$/i, "formal structure getting tangled in strategy, pressure, or mixed motives")
      .replace(/^pressure moving through official structures, boundaries, or a system that keeps the tension in place$/i, "pressure being held in place by structure, distance, or rigid terms")
      .replace(/^complication or mixed motives moving through structure$/i, "fixed terms getting tangled in strategy or mixed motives")
      .replace(/^your side of the matter in your own documented position$/i, "your own documented position still giving the matter something solid to work from")
      .replace(/^your own documented position around your side of the matter$/i, "your own documented position still giving the matter something solid to work from")
      .replace(/^your own documented position still giving the matter something solid to work from$/i, "your own documented position still giving the matter firmer footing")
      .replace(/^repetition and tension under obstruction$/i, "repeat-request pressure meeting formal blockage")
      .replace(/^your side of the matter under measured handling or settled terms$/i, "your side of the matter becoming more workable through measured handling and settled terms")
      .replace(/^repetition and tension moving through decisive cuts$/i, "repeat-request pressure colliding with a hard deadline or forced procedural cut")
      .replace(/^your side of the matter in support and loyalty$/i, "dependable support still giving your side of the matter firmer footing")
      .replace(/^your side of the matter moving through erosion and stress$/i, "your side of the matter being worn down by preventable admin strain")
      .replace(/^values and love around routing or jurisdictional movement$/i, "the file's real stake staying visible as routing, transfer, or jurisdiction begins to shift")
      .replace(/^defensive strategy or close procedural reading under structure$/i, "defensive strategy tightening around fixed conditions or structural constraints")
      .replace(/^structure, distance, or institution under caution$/i, "formal structure tightening under defensive handling or procedural caution")
      .replace(/^uncertain facts or incomplete review in structure$/i, "uncertain facts meeting fixed conditions or structural constraints")
      .replace(/^choice and branching paths in incoming notices or procedural movement$/i, "real choices opening once the next notice or procedural movement arrives")
      .replace(/^nervous communication moving through caution$/i, "reactive communication getting tighter and less useful under defensive handling")
      .replace(/^nervous communication in caution$/i, "reactive communication tightening under defensive handling")
      .replace(/^your side of the matter in caution$/i, "your side of the matter tightening under defensive handling")
      .replace(/^repetition and tension under caution$/i, "repeat-request pressure getting tighter under defensive handling")
      .replace(/^repetition and tension under strategic pressure or mixed motives$/i, "repeat-request pressure feeding strategy, defensiveness, or mixed motives")
      .replace(/^complication or mixed motives under repetition$/i, "strategic pressure getting trapped in the same repeating procedural loop")
      .replace(/^a small beginning in clear process direction$/i, "a small but usable opening once the process direction is clear")
      .replace(/^a small opening around slow procedural progress$/i, "a small opening if the process is worked patiently enough to hold")
      .replace(/^a small opening in slow procedural progress$/i, "a small but usable opening inside a process that still needs patience")
      .replace(/^a small opening around routing or jurisdictional movement$/i, "a narrow but usable opening as routing, transfer, or jurisdiction begins to shift")
      .replace(/^a small opening in fixed conditions or structural footing$/i, "a narrow opening inside fixed conditions that still have to hold")
      .replace(/^slow procedural progress around the answer point or approval$/i, "slow procedural progress around the approval point or deciding clause")
      .replace(/^structure, distance, or institution in decisive cuts$/i, "formal structure colliding with a hard deadline or forced procedural cut")
      .replace(/^the public field around routing or jurisdictional movement$/i, "routing, transfer, or jurisdictional movement becoming visible in the wider field")
      .replace(/^erosion, worry, or leakage in the meaningful burden$/i, "admin strain worsening an issue that is already weighty enough")
      .replace(/^what can still hold procedurally around routing or jurisdictional movement$/i, "what can still hold as the matter moves through routing, transfer, or jurisdictional change")
      .replace(/^burden and meaning in caution$/i, "a weighty issue being tightened further by defensive handling or procedural caution")
      .replace(/^your side of the matter in values and love$/i, "your side of the matter anchored in what the file is actually trying to protect")
      .replace(/^your side of the matter under values and love$/i, "your side of the matter staying tied to what the file is actually trying to protect or establish")
      .replace(/^procedural closure or file pause in erosion and stress$/i, "procedural drag pushing the matter toward pause or closure")
      .replace(/^procedural closure or file pause under erosion and stress$/i, "procedural drag pushing the matter toward pause or closure")
      .replace(/^the other side's position moving through erosion and stress$/i, "the other side's position being worn down by delay, pressure, or admin strain")
      .replace(/^the answer point or approval under stage change or procedural improvement$/i, "an approval point beginning to open as the process starts moving in the right order")
      .replace(/^nervous communication in the meaningful burden$/i, "reactive communication amplifying an issue that is already weighty enough")
      .replace(/^defensive strategy or close procedural reading in strategic pressure or mixed motives$/i, "defensive strategy getting tangled in mixed motives and process pressure")
      .replace(/^defensive strategy or close procedural reading moving through strategic pressure or mixed motives$/i, "defensive strategy reinforcing already mixed motives and process pressure")
      .replace(/^incoming notices or procedural movement in authority or leverage$/i, "movement beginning once authority, leverage, or the next formal notice shifts")
      .replace(/^defensive strategy or close procedural reading moving through the meaningful burden$/i, "defensive strategy complicating an already weighty obligation")
      .replace(/^complication or mixed motives under the meaningful burden$/i, "mixed motives complicating an already weighty obligation")
      .replace(/^what can still hold procedurally around heart, value, or feeling$/i, "what can still hold around the file's real stake")
      .replace(/^repetition and tension under uncertain facts or incomplete review$/i, "repeat-request pressure inside a matter that is still not fully clarified")
      .replace(/^uncertain facts or incomplete review moving through repetition$/i, "uncertain facts getting dragged through the same repeat-request loop")
      .replace(/^your own clarity becoming the approval point that unlocks the next stage of the matter$/i, "your own clarity becoming the hinge that opens the next stage cleanly")
      .replace(/^movement beginning once your side of the matter is clear enough to file, answer, or act on$/i, "movement beginning once your side is clear enough to answer, file, or consider carefully")
      .replace(/^a sharp decision or cut in structure$/i, "a hard procedural cut colliding with fixed structure or formal constraints")
      .replace(/^withheld or specialist information under incoming notices or procedural movement$/i, "reviewed or specialist information beginning to move with the next notice or procedural step")
      .replace(/^nervous conversation caught in repetition, where talk can sharpen rather than settle the issue$/i, "reactive back-and-forth caught in the same procedural loop")
      .replace(/^nervous communication under sealed information and pending review$/i, "reactive communication around information that is still under review")
      .replace(/^your side of the matter moving into transfer, routing, or jurisdictional movement that changes how the process advances$/i, "your side of the matter beginning to move through routing, transfer, or jurisdictional change")
      .replace(/^procedural closure or file pause under choice$/i, "a paused or stalled matter sitting at a decision point that can no longer be deferred")
      .replace(/^clarity and success around your side of the matter$/i, "clearer visibility around your side of the matter")
      .replace(/^uncertain facts or incomplete review moving through erosion and stress$/i, "uncertain facts and incomplete review being worn down further by procedural strain")
      .replace(/^values and love around reliable support$/i, "reliable support around what is materially worth protecting")
      .replace(/^a sharp decision or cut moving through erosion and stress$/i, "a forced decision being made under procedural strain")
      .replace(/^obstacle or delay in erosion and stress$/i, "delay worsening inside a process that is already being worn down")
      .replace(/^your side of the matter advancing only through patient follow-through and evidence that can hold over time$/i, "your side of the matter moving only through patient, well-documented follow-through")
      .replace(/^repetition and tension under the meaningful burden$/i, "repeat-request pressure around an obligation that cannot stay vague")
      .replace(/^the part of the matter that can still hold once deadlines and enforceability are tested$/i, "what still holds once deadlines and enforceability are tested")
      .replace(/^procedural closure or file pause moving through follow-up loops or procedural noise$/i, "a paused or stalled matter getting blurred by repeat requests and procedural chatter")
      .replace(/^procedural closure or file pause in follow-up loops or procedural noise$/i, "a paused or stalled matter getting blurred by repeat requests and procedural chatter")
      .replace(/^your side of the matter in erosion and stress$/i, "your side of the matter being worn down by preventable admin strain")
      .replace(/^clarity itself becoming the solution$/i, "clearer terms and a cleaner record becoming the way through")
      .replace(/^a stopped place made heavier by delay, distance, or the feeling of no easy passage$/i, "formal blockage or backlog making the matter feel more stuck than it should")
      .replace(/^your own field around your side of the matter$/i, "your own documented position")
      .replace(/^visibility and review cycle in procedural closure or file pause$/i, "review visibility around a matter already entering pause or closure")
      .replace(/^procedural closure or file pause under visibility and review cycle$/i, "review visibility gathering around a matter already edging toward pause or closure")
      .replace(/^procedural closure or file pause in repetition$/i, "a paused or stalled matter caught in the same repeating procedural loop")
      .replace(/^structure, distance, or institution in procedural closure or file pause$/i, "formal structure tightening around a matter already edging toward pause or closure")
      .replace(/^support and loyalty around your side of the matter$/i, "dependable support still giving your side of the matter firmer footing")
      .replace(/^dependable support around your side of the matter$/i, "dependable support still giving your side of the matter firmer footing")
      .replace(/^your side of the matter under support and loyalty$/i, "dependable support still giving your side of the matter firmer footing")
      .replace(/^clarity and visible progress in support and loyalty$/i, "clearer movement beginning once dependable support is actually usable")
      .replace(/^burden and meaning in follow-up loops or procedural noise$/i, "an already weighty issue getting blurred by repeat requests and procedural chatter")
      .replace(/^a small beginning with more promise in it than its size suggests$/i, "a small but usable opening in the process")
      .replace(/^a small beginning under support and loyalty$/i, "a small but usable opening backed by dependable support")
      .replace(/^defensive strategy or close procedural reading under sealed information and pending review$/i, "defensive strategy tightening around information that is still under review")
      .replace(/^slow procedural progress in a workable opening in tone or handling$/i, "slow but usable procedural movement once the tone of the process improves")
      .replace(/^erosion, worry, or leakage under the public field$/i, "admin strain becoming visible in the part of the process exposed to other people or institutions")
      .replace(/^stage change or procedural improvement in incoming notices or procedural movement$/i, "procedural movement finally improving once the next notice or update arrives")
      .replace(/^burden and meaning moving through follow-up loops or procedural noise$/i, "an already weighty issue getting blurred by repeat requests and procedural chatter")
      .replace(/^defensive strategy or close procedural reading moving through follow-up loops or procedural noise$/i, "defensive strategy getting trapped in repeat requests and procedural chatter")
      .replace(/^repetition and tension moving through procedural closure or file pause$/i, "repeat-request pressure pushing the matter toward pause or exhaustion")
      .replace(/^your side of the matter beginning to move through routing, transfer, or jurisdictional change$/i, "your side of the matter beginning to move once routing, transfer, or jurisdiction is finally shifting")
      .replace(/^your side of the matter moving through structure$/i, "your side of the matter being constrained by fixed structure, rules, or institutional footing")
      .replace(/^visibility and review cycle moving through procedural closure or file pause$/i, "review visibility gathering around a matter already edging toward pause or closure")
      .replace(/^a workable opening in tone or handling around your side of the matter$/i, "a more workable tone beginning to help your side of the matter move again")
      .replace(/^your side of the matter in a workable opening in tone or handling$/i, "your side of the matter getting a little more room to move because tone and handling are improving")
      .replace(/^your side of the matter under a workable opening in tone or handling$/i, "your side of the matter getting a little more room to move because the tone or handling is improving")
      .replace(/^a workable opening in tone or handling in your own documented position$/i, "a more workable tone beginning to help the part of the record your side actually controls")
      .replace(/^defensive strategy or close procedural reading moving through erosion and stress$/i, "defensive strategy worsening the admin strain instead of easing it")
      .replace(/^a newly forming situation around a workable opening in tone or handling$/i, "an early-stage opening where tone and handling still matter")
      .replace(/^burden and meaning moving through erosion and stress$/i, "an already weighty issue being worn down further by delay and admin strain")
      .replace(/^procedural closure or file pause moving through erosion and stress$/i, "procedural drag pushing the matter closer to pause, closure, or exhaustion")
      .replace(/^a workable opening in tone or handling under authority or leverage$/i, "a workable opening once authority or leverage is used more cleanly and at the right point")
      .replace(/^a workable opening in tone or handling under values and love$/i, "a more workable tone once the file's real stake is kept plainly in view")
      .replace(/^a workable opening in tone or handling under stage change or procedural improvement$/i, "a more workable tone beginning once the process is resequenced and moved in the right order")
      .replace(/^heart, value, or feeling in a workable opening in tone or handling$/i, "a more workable tone once the file's real stake is kept plainly in view")
      .replace(/^slow procedural progress under what can still hold procedurally$/i, "slow but usable progress around what still holds procedurally")
      .replace(/^clarity and visible progress under what can still hold procedurally$/i, "clearer progress beginning around what still holds procedurally")
      .replace(/^clear process direction in what can still hold procedurally$/i, "clear process direction around what can still hold procedurally")
      .replace(/^slow procedural progress under clarity and success$/i, "slow procedural progress becoming more usable once the process is clearer and easier to read")
      .replace(/^slow procedural progress in slow procedural progress$/i, "slow progress that only becomes usable if the process is worked patiently enough to hold")
      .replace(/^nervous communication in your own documented position$/i, "reactive communication crowding the part of the record your side actually controls")
      .replace(/^structure, distance, or institution under follow-up loops or procedural noise$/i, "formal structure getting blurred by repeat requests and procedural chatter")
      .replace(/^structure, distance, or institution under erosion and stress$/i, "formal structure being worn down by delay, attrition, or preventable admin strain")
      .replace(/^structure, distance, or institution moving through caution$/i, "formal structure tightening under defensive handling or procedural caution")
      .replace(/^complication or mixed motives in obstruction$/i, "mixed motives meeting real blockage or delay")
      .replace(/^uncertain facts or incomplete review moving through obstruction$/i, "uncertain facts meeting real blockage or delay")
      .replace(/^nervous communication in obstruction$/i, "reactive communication meeting real blockage or delay")
      .replace(/^nervous communication in uncertain facts or incomplete review$/i, "reactive communication inside a matter that is still not fully clarified")
      .replace(/^nervous communication under what can still hold procedurally$/i, "reactive communication pressing against the part of the matter that still holds procedurally")
      .replace(/^uncertain facts or incomplete review moving through uncertain facts or incomplete review$/i, "uncertain facts sitting inside a process that is still not clear enough to trust at face value")
      .replace(/^your side of the matter becoming more workable through measured handling and settled terms$/i, "your side of the matter becoming more workable through measured handling and clearer terms")
      .replace(/^your side of the matter under follow-up loops or procedural noise$/i, "your side of the matter getting lost in repeat requests and procedural chatter")
      .replace(/^your side of the matter in decisive cuts$/i, "your side of the matter arriving at a hard deadline or forced procedural decision")
      .replace(/^a sharp decision or cut under repetition$/i, "a hard procedural cut colliding with the same repeat-request loop")
      .replace(/^the answer point or approval in slow procedural progress$/i, "the approval point beginning to matter inside a slow but workable process")
      .replace(/^a workable opening in tone or handling under a small opening$/i, "a more workable tone inside a narrow procedural opening")
      .replace(/^a workable opening in tone or handling in a newly forming situation$/i, "a more workable opening while the matter is still early enough to correct cleanly")
      .replace(/^heart, value, or feeling in a newly forming situation$/i, "what the file is actually trying to protect still visible in an early-stage step")
      .replace(/^a workable opening in tone or handling in clarity and success$/i, "a more workable tone once the process is clear enough to move cleanly")
      .replace(/^a workable opening in tone or handling in clear process direction$/i, "a more workable opening once the process direction is finally clear enough to follow")
      .replace(/^measured handling or settled terms under clear process direction$/i, "steadier handling beginning to matter once the process direction is finally clear")
      .replace(/^routing or jurisdictional movement under a small opening$/i, "routing or jurisdictional movement finally beginning through a narrow but usable opening")
      .replace(/^routing or jurisdictional movement in measured handling or settled terms$/i, "routing or jurisdictional movement becoming more workable once the matter is handled with steadier terms")
      .replace(/^stage change or procedural improvement around slow procedural progress$/i, "stage change beginning to help a slow process move in a usable way")
      .replace(/^stage change or procedural improvement under values and love$/i, "stage change beginning around what the file is actually trying to protect or establish")
      .replace(/^heart, value, or feeling in authority or leverage$/i, "what the file is actually trying to protect becoming legible inside the leverage or approval question")
      .replace(/^heart, value, or feeling in routing or jurisdictional movement$/i, "what the file is actually trying to protect staying visible as routing, transfer, or jurisdiction shifts")
      .replace(/^choice and branching paths in values and love$/i, "a real decision beginning around what the file is actually trying to protect or establish")
      .replace(/^complication or mixed motives under records, paperwork, and what can be proven$/i, "paperwork or notices getting tangled in strategy or mixed motives")
      .replace(/^stage change or procedural improvement under measured handling or settled terms$/i, "stage change beginning to hold once the matter is handled with steadier terms and clearer pacing")
      .replace(/^values and love around measured handling or settled terms$/i, "the file's real stake becoming easier to protect through steadier handling and clearer terms")
      .replace(/^defensive strategy or close procedural reading in procedural closure or file pause$/i, "defensive strategy tightening around a matter already drifting toward pause or closure")
      .replace(/^slow procedural progress under values and love$/i, "slow procedural progress around what the file is actually trying to protect or establish")
      .replace(/^slow procedural progress around a workable opening in tone or handling$/i, "slow procedural progress becoming more usable because tone and handling are improving")
      .replace(/^slow procedural progress around reliable support$/i, "slow procedural progress becoming more usable because dependable support is actually holding")
      .replace(/^uncertain facts or incomplete review in procedural closure or file pause$/i, "uncertain facts inside a matter already drifting toward pause or closure")
      .replace(/^procedural closure or file pause in sealed information and pending review$/i, "a paused or stalled matter still sitting inside information that is under review")
      .replace(/^complication or mixed motives in uncertain facts or incomplete review$/i, "mixed motives thickening a matter that is still not fully clarified")
      .replace(/^complication or mixed motives in sealed information and pending review$/i, "mixed motives thickening a matter that is still sitting inside sealed or pending information")
      .replace(/^stage change or procedural improvement under stage change or procedural improvement$/i, "stage change beginning to hold once the process is finally moving in the right order")
      .replace(/^fees, access, or process flow around clarity and visible progress$/i, "fees, access, or practical movement beginning to respond once the process becomes clearer")
      .replace(/^nervous communication in the answer, approval, or unlock point$/i, "reactive communication crowding the approval point before the answer is actually usable")
      .replace(/^the answer, approval, or unlock point around a workable opening in tone or handling$/i, "the approval point beginning to loosen because the tone of the process is improving")
      .replace(/^your side of the matter in fees, access, or process flow$/i, "your side of the matter beginning to move once fees, access, or process flow are actually clearing")
      .replace(/^the record, filing, or written proof moving through erosion and stress$/i, "the record being worn down by gaps, delays, or preventable admin strain")
      .replace(/^a small beginning under clarity and success$/i, "a small but usable opening once the process becomes clearer and easier to read")
      .replace(/^the answer point or approval under a small opening$/i, "a narrow opening at the approval point")
      .replace(/^clarity and visible progress under clarity and success$/i, "clearer progress once the process is visible enough to trust")
      .replace(/^sealed information and pending review around clarity and visible progress$/i, "sealed information and pending review starting to clear as the process becomes more visible and easier to read")
      .replace(/^structure, distance, or institution moving through strategic pressure or mixed motives$/i, "formal structure getting tangled in strategic pressure or mixed motives")
      .replace(/^structure, distance, or institution in structure$/i, "formal structure reinforcing itself and making the process harder to move")
      .replace(/^institutional delay or structural strain worsening the admin drag$/i, "institutional delay and structural friction worsening the admin drag")
      .replace(/^your side of the matter becoming clearer and more usable$/i, "your side of the matter becoming clear enough to consider")
      .replace(/^defensive strategy or close procedural reading under decisive cuts$/i, "defensive strategy tightening around a hard deadline or forced procedural cut")
      .replace(/^a small but real opening around your side of the matter$/i, "a narrow but usable opening on your side of the matter")
      .replace(/^nervous communication moving through obstruction$/i, "back-and-forth communication getting stuck in delay or formal blockage")
      .replace(/^nervous communication in procedural closure or file pause$/i, "reactive communication around a matter already drifting toward pause or closure")
      .replace(/^nervous communication under procedural closure or file pause$/i, "reactive communication around a matter already drifting toward pause or closure")
      .replace(/^nervous communication in decisive cuts$/i, "reactive communication colliding with a hard deadline or forced procedural decision")
      .replace(/^nervous communication moving through erosion and stress$/i, "reactive communication feeding an already worn-down process")
      .replace(/^reactive communication tightening under defensive handling$/i, "reactive communication hardening because the process is being handled too defensively")
      .replace(/^your side of the matter under clarity and success$/i, "your side of the matter becoming clearer and more usable")
      .replace(/^your side of the matter in clarity and success$/i, "your side of the matter becoming clearer and more usable once the process is visible enough to consider")
      .replace(/^complication feeding anxiety, attrition, or the slow damage done by what keeps slipping sideways$/i, "mixed motives steadily worsening the admin strain instead of resolving it")
      .replace(/^nervous communication under decisive cuts$/i, "anxious updates or reactive back-and-forth around a hard procedural cut")
      .replace(/^nervous communication under erosion and stress$/i, "reactive communication inside a process already being worn down")
      .replace(/^nervous communication under the other person's field$/i, "reactive communication being driven by the other side's position or response")
      .replace(/^the emotional truth\b/i, "the underlying facts")
      .replace(/^warmth and feeling brought fully into the light$/i, "the facts becoming fully visible")
      .replace(/^erosion, worry, or leakage moving through the meaningful burden$/i, "admin strain worsening an already weighty part of the matter")
      .replace(/^erosion, worry, or leakage moving through closure$/i, "missing details or procedural drag pushing the matter toward pause or closure")
      .replace(/^erosion, worry, or leakage under sealed information and pending review$/i, "admin strain building around information that is still under review")
      .replace(/^erosion, worry, or leakage moving through procedural closure or file pause$/i, "admin strain pushing a stalled matter further toward pause or closure")
      .replace(/^erosion, worry, or leakage under uncertain facts or incomplete review$/i, "gaps, delay, or admin strain inside a matter that is still under review")
      .replace(/^erosion, worry, or leakage moving through fog or uncertainty$/i, "missing details or procedural drift inside an uncertain process")
      .replace(/^erosion, worry, or leakage under erosion and stress$/i, "preventable admin strain steadily wearing the matter down")
      .replace(/^guidance around slow growth and rooting$/i, "steadier progress once the process is paced realistically")
      .replace(/^defensive strategy or close procedural reading in closure$/i, "defensive strategy tightening around a matter already entering pause or closure")
      .replace(/^caution and self-interest under what is hidden$/i, "defensive strategy around information that is still under review")
      .replace(/^your own position under endurance$/i, "your side of the matter still holding more firmly than the delay suggests")
      .replace(/^complication or mixed motives moving through the meaningful burden$/i, "procedural strategy complicating an already weighty obligation")
      .replace(/^uncertain facts or incomplete review moving through the meaningful burden$/i, "uncertain facts complicating an already weighty obligation")
      .replace(/^your own role caught in complication, mixed motives, or a dynamic that needs clearer boundaries$/i, "your side of the matter caught inside layered process pressure and unclear motives")
      .replace(/^your side of the matter in slow growth$/i, "your side of the matter advancing only through steady procedural progress")
      .replace(/^your side of the matter in slow procedural progress$/i, "your side of the matter advancing only through steady procedural progress")
      .replace(/^your side of the matter in closure$/i, "your side of the matter moving through pause, closure, or what may already be ending in practice")
      .replace(/^your own position in endurance$/i, "your side of the matter still having procedural staying power")
      .replace(/^what can still hold procedurally in slow procedural progress$/i, "the part of the matter that can still hold if the process is worked patiently")
      .replace(/^your side of the matter being tested by deadlines, enforceability, and what can still hold procedurally$/i, "the part of the matter that can still hold once deadlines and enforceability are tested")
      .replace(/^structure, distance, or institution in erosion and stress$/i, "institutional delay or structural strain worsening the admin drag")
      .replace(/^burden and meaning under structure$/i, "real pressure being held in place by structure, duty, or rigid conditions")
      .replace(/^complication or mixed motives in resource flow$/i, "process friction around fees, access, or who controls the practical movement")
      .replace(/^grace, goodwill, or invitation under documents and messages$/i, "a more workable opening through clearer paperwork or written response")
      .replace(/^grace around maturity and restraint$/i, "a more workable tone through measured, careful handling")
      .replace(/^defensive strategy worsening the admin strain instead of easing it$/i, "defensive handling making the admin strain worse instead of clarifying it")
      .replace(/^a newly forming situation around heart, value, or feeling$/i, "an early-stage opening around what the file is actually trying to protect or establish")
      .replace(/^nervous communication moving through measured handling or settled terms$/i, "reactive communication cutting across what should be steadier, more measured handling")
      .replace(/^a workable opening in tone or handling in measured handling or settled terms$/i, "a more workable opening through steadier handling and clearer terms")
      .replace(/^procedural closure or file pause under structure$/i, "formal structure hardening a pause or closure instead of helping it move")
      .replace(/^routing or jurisdictional movement around a small beginning$/i, "routing or jurisdictional movement beginning while the matter is still early enough to redirect cleanly")
      .replace(/^your side of the matter under your own documented position$/i, "your own documented position still giving your side of the matter something solid to stand on")
      .replace(/^values and love around your side of the matter$/i, "clearer alignment around what your side can honestly defend or protect")
      .replace(/^defensive strategy or close procedural reading under strategic pressure or mixed motives$/i, "defensive handling compounding an already strategic and complicated process")
      .replace(/^defensive strategy or close procedural reading moving through structure$/i, "defensive strategy tightening inside fixed conditions or structural constraints")
      .replace(/^heart, value, or feeling under measured handling or settled terms$/i, "the file's real stake becoming easier to protect through steadier handling and clearer terms")
      .replace(/^authority or leverage under support and loyalty$/i, "authority or leverage becoming usable because dependable support is finally holding")
      .replace(/^fees, access, or process flow under support and loyalty$/i, "fees, access, or process flow becoming more manageable because dependable support is actually holding")
      .replace(/^reliable support under your own documented position$/i, "dependable support still giving your documented position something solid to stand on")
      .replace(/^erosion, worry, or leakage under caution$/i, "admin strain building under defensive handling or procedural caution")
      .replace(/^erosion, worry, or leakage in caution$/i, "admin strain building under defensive handling or procedural caution")
      .replace(/^a small opening around authority or leverage$/i, "a small opening around the point where leverage or approval actually sits")
      .replace(/^caution and self-interest moving through fog or uncertainty$/i, "defensive strategy thickening an already uncertain process")
      .replace(/^complication or mixed motives under fog or uncertainty$/i, "mixed motives thickening an already uncertain process")
      .replace(/^caution and self-interest in caution$/i, "defensive strategy tightening into self-protective process handling")
      .replace(/^incoming movement or news in guidance$/i, "movement beginning once the direction of the matter is clearer")
      .replace(/^incoming movement or news under power$/i, "movement beginning once authority or the decision-maker responds")
      .replace(/^events beginning to move the moment your own stance becomes clear$/i, "movement beginning once your side of the matter is clear enough to file, answer, or consider carefully")
      .replace(/^(?:your role|your side of the matter) meeting a newly forming situation, where what you do first matters more than what you promise later$/i, "an early-stage step where the first filing, response, or correction matters more than later assurances")
      .replace(/^a new enough situation that the first steps matter more than promises$/i, "an early-stage step where the first filing or response matters more than later assurances")
      .replace(/^a sharp decision or cut under the other person's field$/i, "a hard procedural move or forced decision coming from the other side of the matter")
      .replace(/^mixed messages, gossip, or anxious conversation that can distort what is really happening$/i, "too many updates, side conversations, or mixed signals obscuring the actual process")
      .replace(/^clarity and success around the other person's stance$/i, "clearer visibility around the other side's actual position")
      .replace(/^repetition and tension moving through repetition$/i, "the same procedural loop tightening itself by repeating")
      .replace(/^reliable support under a small opening$/i, "dependable support appearing inside a narrow procedural opening")
      .replace(/^the other side's position in caution$/i, "the other side settling into defensive handling, caution, or a slower response than the process needs")
      .replace(/^complication or mixed motives in repetition$/i, "mixed motives feeding the same procedural loop instead of helping it resolve")
      .replace(/^complication or mixed motives in caution$/i, "mixed motives tightening under defensive handling or procedural caution")
      .replace(/^your side of the matter moving through caution$/i, "your side of the matter tightening under defensive handling or procedural caution")
      .replace(/^your side of the matter under procedural closure or file pause$/i, "your side of the matter moving through pause, closure, or a stalled phase that still needs clean handling")
      .replace(/^your side of the matter under erosion and stress$/i, "your side of the matter being worn down by preventable admin strain")
      .replace(/^erosion, worry, or leakage in procedural closure or file pause$/i, "admin strain accumulating inside a matter that is already drifting toward pause or closure")
      .replace(/^routing or jurisdictional movement under values and love$/i, "routing or jurisdictional movement beginning around what the file is actually trying to protect or establish")
      .replace(/^a small opening under values and love$/i, "a small but usable opening around what the file is actually trying to protect or establish")
      .replace(/^repetition and tension in erosion and stress$/i, "preventable admin strain steadily wearing the matter down")
      .replace(/^a small beginning in the answer, approval, or unlock point$/i, "a small but usable opening at the approval point")
      .replace(/^a sharp decision or cut in strategic pressure or mixed motives$/i, "a hard procedural move made more difficult by strategic pressure or mixed motives")
      .replace(/^a sharp decision or cut moving through obstruction$/i, "a hard procedural move running into real blockage or delay")
      .replace(/^stage change or procedural improvement around a small beginning$/i, "a small but real early-stage improvement that can still be built on")
      .replace(/^incoming notices or procedural movement in slow procedural progress$/i, "incoming procedural movement beginning to matter inside a slow but workable process")
      .replace(/^fog and uncertainty under strategic pressure or mixed motives$/i, "uncertainty thickened by strategic pressure or mixed motives")
      .replace(/^your own position under the answer point$/i, "your side of the matter at the approval point")
      .replace(/^reliable support in improvement or movement$/i, "usable support helping the process advance in the right order")
      .replace(/^(?:heart, value, or feeling|values and love) around ([a-z ,'-]+)$/i, "the file's real stake staying visible around $1")
      .replace(/^(?:heart, value, or feeling|values and love) under ([a-z ,'-]+)$/i, "the file's real stake under $1")
      .replace(/^(?:heart, value, or feeling|values and love) in ([a-z ,'-]+)$/i, "the file's real stake inside $1")
      .replace(/^(?:heart, value, or feeling|values and love)$/i, "the file's real stake")
      .replace(/^(?:support and loyalty|reliable support) around ([a-z ,'-]+)$/i, "dependable support around $1")
      .replace(/^(?:support and loyalty|reliable support) under ([a-z ,'-]+)$/i, "dependable support under $1")
      .replace(/^(?:support and loyalty|reliable support) in ([a-z ,'-]+)$/i, "dependable support in $1")
      .replace(/^(?:support and loyalty|reliable support)$/i, "dependable support")
      .replace(/^grace, goodwill, or invitation around ([a-z ,'-]+)$/i, "a more workable tone around $1")
      .replace(/^grace, goodwill, or invitation under ([a-z ,'-]+)$/i, "a more workable tone under $1")
      .replace(/^grace, goodwill, or invitation in ([a-z ,'-]+)$/i, "a more workable tone in $1")
      .replace(/^grace, goodwill, or invitation$/i, "a more workable tone")
      .replace(/^a workable opening in tone or handling around ([a-z ,'-]+)$/i, "a more workable tone around $1")
      .replace(/^a workable opening in tone or handling under ([a-z ,'-]+)$/i, "a more workable tone under $1")
      .replace(/^a workable opening in tone or handling in ([a-z ,'-]+)$/i, "a more workable tone through $1")
      .replace(/^movement, distance, or transition around ([a-z ,'-]+)$/i, "routing or jurisdictional movement around $1")
      .replace(/^movement, distance, or transition under ([a-z ,'-]+)$/i, "routing or jurisdictional movement under $1")
      .replace(/^movement, distance, or transition in ([a-z ,'-]+)$/i, "routing or jurisdictional movement in $1")
      .replace(/^movement, distance, or transition$/i, "routing or jurisdictional movement")
      .replace(/^incoming movement or news around ([a-z ,'-]+)$/i, "incoming notices or procedural movement around $1")
      .replace(/^incoming movement or news under ([a-z ,'-]+)$/i, "incoming notices or procedural movement under $1")
      .replace(/^incoming movement or news in ([a-z ,'-]+)$/i, "incoming notices or procedural movement in $1")
      .replace(/^incoming movement or news$/i, "incoming notices or procedural movement")
      .replace(/^the public or social field around ([a-z ,'-]+)$/i, "the wider public or institutional field around $1")
      .replace(/^the public or social field under ([a-z ,'-]+)$/i, "the wider public or institutional field under $1")
      .replace(/^the public or social field in ([a-z ,'-]+)$/i, "the wider public or institutional field in $1")
      .replace(/^the public or social field$/i, "the wider public or institutional field")
      .replace(/^the public field around ([a-z ,'-]+)$/i, "the wider public or institutional field around $1")
      .replace(/^the public field under ([a-z ,'-]+)$/i, "the wider public or institutional field under $1")
      .replace(/^the public field in ([a-z ,'-]+)$/i, "the wider public or institutional field in $1")
      .replace(/^the public field$/i, "the wider public or institutional field")
      .replace(/^clarity and success around ([a-z ,'-]+)$/i, "clearer visibility around $1")
      .replace(/^clarity and success under ([a-z ,'-]+)$/i, "clearer visibility under $1")
      .replace(/^clarity and success in ([a-z ,'-]+)$/i, "clearer visibility in $1")
      .replace(/^clarity and success$/i, "clearer visibility")
      .replace(/^clarity and visible progress around ([a-z ,'-]+)$/i, "clearer visibility and usable progress around $1")
      .replace(/^clarity and visible progress under ([a-z ,'-]+)$/i, "clearer visibility and usable progress under $1")
      .replace(/^clarity and visible progress in ([a-z ,'-]+)$/i, "clearer visibility and usable progress in $1")
      .replace(/^clarity and visible progress$/i, "clearer visibility and usable progress")
      .replace(/^nervous communication\b/i, "reactive back-and-forth complicating the process")
      .replace(/^closure, ending, or rest\b/i, "a necessary procedural pause, closure, or file stop")
      .replace(/^burden and meaning\b/i, "real weight in the matter and what it is obliging you to carry")
      .replace(/^obstacle or delay\b/i, "a genuine procedural blocker or delay")
      .replace(/^a sharp decision or cut\b/i, "a hard deadline or forced procedural decision")
      .replace(/^choice and branching paths\b/i, "a real procedural fork or filing choice")
      .replace(/^a solution or unlock\b/i, "the actual approval or opening in the process")
      .replace(/^guidance\b/i, "clearer procedural direction and signal")
      .replace(/^a newly forming situation\b/i, "an early-stage procedural opening")
      .replace(/^endurance\b/i, "procedural staying power and what it takes to hold through the process")
      .replace(/^resource flow\b/i, "fees, access, and what is practically moving in the process")
      .replace(/^social or public life\b/i, "the wider public or institutional field around the matter")
      .replace(/^structure, distance, or institution\b/i, "formal structure, distance, or institutional constraint")
      .replace(/^your own field\b/i, "your side of the matter")
      .replace(/^your own position\b/i, "your side of the matter");
  }

  if (subjectId === "money") {
    rewritten = rewritten
      .replace(/^a sharp decision or cut under repeated drain$/i, "a necessary cutback or reset made harder by recurring drain")
      .replace(/^a sharp decision or cut moving through repeated drain$/i, "a necessary cutback or reset being driven by recurring drain")
      .replace(/^complication or mixed motives in financial uncertainty$/i, "mixed motives and financial uncertainty feeding each other")
      .replace(/^your own clarity and priorities becoming the answer point that unlocks the next financial phase$/i, "your own clarity and priorities becoming the hinge that unlocks the next financial phase")
      .replace(/^caution and self-interest under structure$/i, "defensive caution hardened by fixed obligations, inherited terms, or financial structures")
      .replace(/^your own financial (?:field|leverage) around grace, goodwill, or invitation$/i, "a more supportive opening around the financial choices and leverage you still control")
      .replace(/\byour own financial leverage around grace, goodwill, or invitation\b/gi, "a more supportive opening around the financial choices and leverage you still control")
      .replace(/^warmth and feeling brought fully into the light$/i, "a clearer sense of value and direction")
      .replace(/^the emotional truth\b/i, "the real value question")
      .replace(/^mixed messages, gossip, or anxious conversation that can distort what is really happening$/i, "anxious talk and conflicting signals around the money picture")
      .replace(/^nervous communication under reset or contraction$/i, "anxious money talk running through a reset")
      .replace(/^your financial position in communication and nerves$/i, "your financial position caught in noisy or anxious communication")
      .replace(/^your financial position under communication and nerves$/i, "reactive money talk crowding your judgment")
      .replace(/^your financial position caught in money talk and reactive noise$/i, "reactive money talk crowding your judgment")
      .replace(/^your own financial field around your financial position$/i, "your own financial leverage")
      .replace(/^your own financial field\b/i, "your own financial leverage")
      .replace(/^movement, distance, or transition in support and loyalty$/i, "a supportive route or practical ally beginning to move")
      .replace(/^maturity and restraint under a newly forming situation$/i, "a steadier long-view around what is only just beginning")
      .replace(/^heart, value, or feeling moving through a small opening$/i, "a small opening around what still feels worth backing")
      .replace(/^lasting stability around heart, value, or feeling$/i, "lasting stability around what still feels worth backing")
      .replace(/^your financial position under what genuinely matters$/i, "your financial choices coming back into line with what still feels worth backing")
      .replace(/^your financial position under what still feels worth backing$/i, "your financial choices coming back into line with what still feels worth backing")
      .replace(/^heart, value, or feeling\b/i, "what still feels worth backing")
      .replace(/^your financial position in values and love$/i, "your financial choices lining up more honestly with what still matters")
      .replace(/^a small opening under stability$/i, "a modest opening that could support something steadier")
      .replace(/^guidance around your financial position$/i, "clearer direction around your financial choices")
      .replace(/^grace around your financial position$/i, "a more supportive tone around your financial choices")
      .replace(/^constructive change in your own financial field$/i, "constructive change beginning around your own financial choices")
      .replace(/^values and love around choice and branching paths$/i, "a real choice about what is still worth backing")
      .replace(/^values and love around constructive change$/i, "what still feels worth backing as conditions begin to improve")
      .replace(/^grace, goodwill, or invitation in values and love$/i, "goodwill or a helpful opening around what still matters")
      .replace(/^grace, goodwill, or invitation under guidance$/i, "a helpful opening becoming easier to trust")
      .replace(/^grace, goodwill, or invitation in clarity and success$/i, "clearer encouragement around what still has value")
      .replace(/^what still feels worth backing moving through choice and branching paths$/i, "a real choice about what is still worth backing")
      .replace(/^what still feels worth backing in choice and branching paths$/i, "a real choice about what is still worth backing")
      .replace(/^what still feels worth backing in clarity and success$/i, "clearer encouragement around what still has value")
      .replace(/^what still feels worth backing under lasting stability$/i, "what still feels worth backing as stability begins to return")
      .replace(/^nervous communication in financial uncertainty$/i, "anxious money talk making an already uncertain picture harder to read cleanly")
      .replace(/^choice and branching paths moving through financial uncertainty$/i, "uncertain choices about direction")
      .replace(/^financial uncertainty thickening into worry, leakage, or the fear of not yet seeing the whole picture clearly$/i, "financial uncertainty turning into worry or leakage")
      .replace(/^financial fog or unclear timing in financial uncertainty$/i, "financial fog and unclear timing")
      .replace(/^a financial reset or contraction under reset or contraction$/i, "a financial reset that needs to be acknowledged plainly")
      .replace(/^a financial reset or contraction under strategy$/i, "a financial reset complicated by caution or strategy")
      .replace(/^a financial reset or contraction moving through caution$/i, "a financial reset shaped by caution")
      .replace(/^nervous communication moving through caution$/i, "anxious money talk shaped by caution")
      .replace(/^nervous communication under decisive cuts$/i, "anxious money talk under a necessary cut")
      .replace(/^cashflow moving under fog, so income, spending, or timing feels harder to judge cleanly than the numbers alone suggest$/i, "cashflow obscured by uncertainty")
      .replace(/^financial stability still existing beneath uncertainty, even if it is currently obscured by unclear timing, confidence, or information gaps$/i, "real stability that is currently hard to see clearly")
      .replace(/^support, trade, or a practical arrangement helping money move more reliably than it first seemed likely to$/i, "a supportive route or arrangement helping money move more reliably")
      .replace(/^fixed costs, household obligations, or baseline responsibilities putting real weight on the budget floor$/i, "fixed obligations putting real weight on the budget")
      .replace(/^cashflow moving through a pause, contraction, or necessary ending before it can restart on healthier terms$/i, "cashflow passing through a necessary pause or reset")
      .replace(/^your role inside a financial ending, pause, or necessary reset before the next phase can genuinely begin$/i, "your own position inside a necessary financial reset")
      .replace(/^your financial position being shaped by budget control, stronger boundaries, and the need to take firmer command of resources$/i, "your financial position being shaped by tighter control and firmer boundaries")
      .replace(/^resources moving through control, stewardship, and the question of who actually holds the leverage$/i, "resources shaped by leverage, control, and who is really steering the budget")
      .replace(/^burden and meaning under repeated drain$/i, "repeated drain pressing against real obligations")
      .replace(/^burden and meaning moving through strategy$/i, "pressure and obligation feeding a defensive strategy")
      .replace(/^caution and self-interest moving through caution$/i, "defensive caution tightening its own grip")
      .replace(/^your financial position under expansion$/i, "your financial position becoming easier to work with again")
      .replace(/^repetition and tension in decisive cuts$/i, "pressure building around a necessary cut")
      .replace(/^repetition and tension in strategy$/i, "a pressured strategy that keeps replaying the same strain")
      .replace(/^expansion around maturity and restraint$/i, "steadier growth shaped by restraint")
      .replace(/^stability and foundations in slow growth$/i, "steadier foundations taking shape slowly")
      .replace(/^a financial reset being shaped by caution or defensive strategy$/i, "a financial reset complicated by caution or defensive strategy")
      .replace(/^clearer financial direction beginning to form around your own choices$/i, "clearer financial direction forming around your own choices")
      .replace(/^leakage and recurring drain in communication and nerves$/i, "leakage and recurring drain made worse by reactive talk")
      .replace(/^leakage and recurring drain in the meaningful burden$/i, "recurring drain pressing against real obligations")
      .replace(/^the other person's stance in reset or contraction$/i, "another party's position inside a pause or reset")
      .replace(/^budget pressure and leverage around a small opening$/i, "a small opening around leverage and budget pressure")
      .replace(/^your financial stance meeting delay, blockage, or a path that has to be worked in stages rather than forced$/i, "a money path slowed enough that sequencing matters more than force")
      .replace(/^conversation, notices, or nervous attention wrapping directly around the flow of money, so signal and speculation need separating$/i, "conversation and nervous attention wrapped around the flow of money")
      .replace(/^your own money picture being worn down by recurring expenses, low-grade worry, or the slow loss created by untracked leakage$/i, "your money picture being worn down by recurring expense and leakage")
      .replace(/^money flow being quietly reduced by recurring costs, small losses, or the kind of repeated drain that matters because it keeps returning$/i, "cashflow being reduced by recurring drains")
      .replace(/^your financial choices being tied to recurring obligations, payment cycles, or agreements that keep resetting the terms$/i, "your choices being constrained by recurring obligations")
      .replace(/^cash movement becoming tied to obligations, subscriptions, debt cycles, or agreements that keep claiming a portion of the flow$/i, "cashflow tied to obligations, subscriptions, or repeating claims")
      .replace(/^part of your money story still sitting off the page, where records, withheld details, or what has not yet been fully tallied matter more than appearances$/i, "part of the money story still sitting off the page")
      .replace(/^your financial position becoming clearer through paperwork, statements, notices, or the written detail that turns vague worry into something concrete$/i, "your financial position becoming clearer once the paperwork is faced directly")
      .replace(/^paperwork, invoices, or statements in clarity and success$/i, "paperwork and statements coming clearly into view")
      .replace(/^paperwork, invoices, or statements coming into clear view$/i, "paperwork and statements coming into clear view")
      .replace(/^money becoming legible through paperwork, invoices, statements, or messages that show where value is truly moving$/i, "the numbers becoming clearer through statements, paperwork, or invoices")
      .replace(/^lasting security becoming easier to judge through paperwork, statements, or the documents that show what really holds$/i, "lasting security becoming easier to judge once the paperwork is in view")
      .replace(/^your own financial role being defined by what is actually coming in, going out, and moving through your hands in real time$/i, "your financial position being defined by the real flow, not the hoped-for one")
      .replace(/^your own financial position becoming the answer point, where clearer priorities begin to unlock movement$/i, "your financial position becoming the hinge that unlocks movement")
      .replace(/^your financial position moving through a visible cycle, where pattern matters more than one isolated moment$/i, "your financial position moving through a visible cycle")
      .replace(/^your own financial position being tested for staying power, consistency, and what can still hold after the first plan changes$/i, "your financial footing being tested for staying power")
      .replace(/^obstacle or delay in strategy$/i, "a stalled strategy that needs better sequencing")
      .replace(/^incoming movement or news under budget pressure and leverage$/i, "new developments arriving under real budget pressure")
      .replace(/^your money picture starting to move because a real decision window or fresh information is finally in play$/i, "your money picture starting to move because a real decision window has opened")
      .replace(/^your own financial position standing close to a small but real opening, provided you use it cleanly$/i, "a small but real opening close to your own financial choices")
      .replace(/^a change of direction shaped by what is still worth backing$/i, "a change of direction shaped by what is still worth backing")
      .replace(/^an answer point emerging inside cashflow itself, where a clearer movement of resources starts revealing what can be fixed or unlocked$/i, "an answer beginning to show up in the numbers themselves")
      .replace(/^the solution beginning to take a more durable form, so what stabilizes now has a chance of lasting rather than only relieving pressure briefly$/i, "a workable fix beginning to take durable form")
      .replace(/^cashflow trying to find the form of stability that can actually last, rather than only looking secure for a moment$/i, "cashflow looking for a steadier structure")
      .replace(/^cashflow improving through better sequencing, smarter updates, or changes that help money move more cleanly$/i, "cashflow improving once changes are made in the right order")
      .replace(/^nervous communication\b/i, "anxious money talk and reactive financial noise")
      .replace(/^closure, ending, or rest\b/i, "a financial reset, pause, or necessary ending")
      .replace(/^burden and meaning\b/i, "real financial obligation and what it is asking you to carry")
      .replace(/^obstacle or delay\b/i, "a genuine financial blocker or delay")
      .replace(/^a sharp decision or cut\b/i, "a necessary cutback, reset, or hard financial decision")
      .replace(/^choice and branching paths\b/i, "a real fork or financial choice")
      .replace(/^a solution or unlock\b/i, "the actual fix or opening in the money picture")
      .replace(/^guidance\b/i, "clearer financial direction and signal")
      .replace(/^a newly forming situation\b/i, "an early-stage financial opening")
      .replace(/^endurance\b/i, "financial staying power and what holds through the pressure")
      .replace(/^resource flow\b/i, "the flow of money and practical resources")
      .replace(/^social or public life\b/i, "the wider social or public field around finances")
      .replace(/^movement, distance, or transition\b/i, "a financial shift or change of direction")
      .replace(/^structure, distance, or institution\b/i, "fixed financial obligations or institutional constraints")
      .replace(/^your own field\b/i, "your own financial leverage")
      .replace(/^your own position\b/i, "your own financial position");
  }

  if (subjectId === "home_family") {
    rewritten = rewritten
      .replace(/^fog and uncertainty moving through erosion and stress$/i, "uncertainty thickening because repeated household strain is already wearing everyone down")
      .replace(/^support and loyalty around constructive change$/i, "steadier support gathering around the changes that could actually help at home")
      .replace(/^caution and self-interest under the other person's role in the household$/i, "defensive caution building around the other person's role in the household")
      .replace(/^heart, value, or feeling in expansion$/i, "care and what genuinely matters getting a little more room to move at home")
      .replace(/^recurring household drain in communication and nerves$/i, "household strain made worse by repeated tense conversations")
      .replace(/^incoming momentum around choice and branching paths$/i, "movement beginning once a clearer family direction is chosen")
      .replace(/^your role in the household inside improvement or movement$/i, "your role in the household becoming part of the needed improvement")
      .replace(/^a strategic ending or necessary pause$/i, "a needed pause or ending that now has to be handled deliberately")
      .replace(/^caution and self-interest in protective caution at home$/i, "defensive caution at home tightening into a loop")
      .replace(/^your role in the household under guidance$/i, "clearer direction beginning to form around your role in the household")
      .replace(/^your role in the household being defined through loyalty, reliability, and the quiet labor of showing up consistently for others$/i, "reliable support and steady follow-through shaping your place in the household")
      .replace(/^a sharp decision or cut in closure$/i, "a necessary cut colliding with something that is already ending or exhausted")
      .replace(/^your role in the household inside grace$/i, "your role in the household being softened by goodwill or small acts of care")
      .replace(/^closure, ending, or rest moving through closure$/i, "a needed ending or pause that has not been fully allowed yet")
      .replace(/^guidance around a solution or unlock$/i, "clearer answers beginning to emerge for the household")
      .replace(/^recurring household drain under fog or uncertainty$/i, "repeated household strain made harder to solve by uncertainty")
      .replace(/^warmth and feeling brought fully into the light$/i, "care becoming more visible and easier to work with")
      .replace(/^grace, goodwill, or invitation under improvement or movement$/i, "a gentler improvement the household can build on")
      .replace(/^the other person's influence on the household in communication and nerves$/i, "the other person's role intensifying household talk and nerves")
      .replace(/^clarity and visible progress under expansion$/i, "clearer momentum and a little more room to breathe at home")
      .replace(/^clarity and visible progress under maturity$/i, "clearer household progress through maturity and steadier handling")
      .replace(/^repetition and tension moving through erosion and stress$/i, "repeated household strain slowly wearing everyone down")
      .replace(/^stability and foundations in clarity and success$/i, "clearer structure and steadier footing at home")
      .replace(/^caution and self-interest in fog or uncertainty$/i, "defensive caution fed by uncertainty at home")
      .replace(/^slow growth and rooting under power$/i, "steadier support beginning to take root around the household load")
      .replace(/^closure, ending, or rest in what is hidden$/i, "a pause or ending around what has stayed unspoken at home")
      .replace(/^grace, goodwill, or invitation in endurance$/i, "steady support and small kindnesses that still help the household hold")
      .replace(/^closure, ending, or rest under strategy$/i, "a pause or ending shaped by defensive household strategy")
      .replace(/^grace, goodwill, or invitation in values and love$/i, "care, goodwill, and a chance to soften the household atmosphere")
      .replace(/^caution and self-interest in commitment$/i, "defensive caution around commitments at home")
      .replace(/^clarity itself becoming the solution$/i, "clearer terms and honesty becoming the way through")
      .replace(/^recurring household drain under repetition$/i, "the same household drain repeating until it is finally addressed")
      .replace(/^a small opening in maturity$/i, "a small opening toward calmer, more mature handling at home")
      .replace(/^obstacle or delay in decisive cuts$/i, "delay around a needed cut or clear decision")
      .replace(/^the wish for calm and mature boundaries$/i, "calmer, steadier boundaries at home")
      .replace(/^a small opening around the wish for calm and mature boundaries$/i, "a small opening toward calmer, steadier boundaries at home")
      .replace(/^complication or mixed motives under strategy$/i, "complicated motives and defensive patterns in the household")
      .replace(/^a small beginning under grace$/i, "a gentler new beginning in the household")
      .replace(/^erosion, worry, or leakage under documents and messages$/i, "household strain gathering around messages, plans, or practical details")
      .replace(/^a small opening in endurance$/i, "a small sign the household can still hold")
      .replace(/^structure, distance, or institution moving through communication and nerves$/i, "distance, reserve, or household tension showing up through strained communication")
      .replace(/^power or resource control under clarity and success$/i, "stronger household support once the picture is clearer")
      .replace(/^delay shaped by erosion and stress$/i, "a slow drain that keeps household life from settling")
      .replace(/^clarity and visible progress in slow growth$/i, "steadier progress once the household starts healing at a slower pace")
      .replace(/^nervous communication under decisive cuts$/i, "tense conversations forcing a decision at home")
      .replace(/^a small but real opening around power or resource control$/i, "a small but real opening once support and responsibility are handled more clearly")
      .replace(/^nervous communication in caution$/i, "wary or defensive communication at home")
      .replace(/^heart, value, or feeling under endurance$/i, "care trying to hold steady")
      .replace(/^a sharp decision or cut in communication and nerves$/i, "a sharp conversation or message forcing a decision")
      .replace(/^a newly forming situation around grace, goodwill, or invitation$/i, "a gentler new beginning in the household")
      .replace(/^your own role inside the household under repetition, cycles, pressure, and refinement are visible$/i, "your role at home caught inside a pattern that keeps replaying")
      .replace(/^your own role inside the household moving through repetition, cycles, pressure, and refinement are visible$/i, "your role at home moving through a pattern that keeps replaying")
      .replace(/^your own role inside the household, including boundaries, responsibility, and what you are quietly carrying$/i, "your role in the household, including what you are carrying and what you keep permitting")
      .replace(/^your own place in the household$/i, "your role in the household")
      .replace(/^the wish for calm and mature boundaries in a small opening$/i, "a small opening toward calmer, steadier boundaries at home")
      .replace(/^nervous communication\b/i, "tense communication and anxious household talk")
      .replace(/^closure, ending, or rest\b/i, "a needed pause, ending, or quiet spell at home")
      .replace(/^burden and meaning\b/i, "real weight at home and what is being carried")
      .replace(/^obstacle or delay\b/i, "a genuine blocker or delay at home")
      .replace(/^a sharp decision or cut\b/i, "a necessary decision or clear change in the household")
      .replace(/^choice and branching paths\b/i, "a real fork or choice in the family situation")
      .replace(/^a solution or unlock\b/i, "the actual fix or opening in the household situation")
      .replace(/^heart, value, or feeling\b/i, "care and what genuinely matters at home")
      .replace(/^movement, distance, or transition\b/i, "movement or change at home")
      .replace(/^structure, distance, or institution\b/i, "household structure, distance, or outside pressure")
      .replace(/^guidance\b/i, "clearer direction in the household situation")
      .replace(/^a newly forming situation\b/i, "an early-stage opening in the family situation")
      .replace(/^endurance\b/i, "staying power and what holds the household together")
      .replace(/^resource flow\b/i, "practical resources and what is actually moving at home")
      .replace(/^social or public life\b/i, "the wider social field touching the household")
      .replace(/^your own field\b/i, "your place in the household")
      .replace(/^your own position\b/i, "your place in the household");
  }

  rewritten = rewriteResidualSignalLabels(rewritten, subjectId, kind);

  if (kind === "opening") {
    return rewritten
      .replace(/^constructive change under incoming momentum$/i, "constructive change beginning as fresh movement or response starts to arrive")
      .replace(/^expansion around your own position$/i, "greater freedom beginning to open around your own position")
      .replace(/^improvement or movement around power or resource control$/i, "clearer leverage and steadier backing beginning to emerge")
      .replace(/^power around heart, value, or feeling$/i, "clearer leverage gathering around what genuinely matters")
      .replace(/^nervous conversation caught in repetition, where talk can sharpen rather than settle the issue$/i, "conversation getting stuck in the same loop, where talking is starting to sharpen the problem instead of settling it")
      .replace(/^a new social beginning where first actions matter more than promises$/i, "a newer social opening where first actions matter more than promises")
      .replace(/^the need for /i, "")
      .replace(/^a relationship that could become durable\b/i, "the chance for something durable");
  }

  return rewritten
    .replace(/^the emotional truth\b/i, "the emotional truth")
    .replace(/^the commitment question\b/i, "the commitment question");
}

function cleanSignalPhrase(input: string): string {
  return input
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/\s+\./g, ".")
    .replace(/[.;:]+$/g, "")
    .trim();
}

function pickSignalCandidates(
  candidates: SignalCandidate[],
  kind: "opening" | "pressure",
): SignalCandidate[] {
  const scored = [...candidates].sort((left, right) => {
    const leftScore = kind === "opening" ? left.openingBias : left.pressureBias;
    const rightScore = kind === "opening" ? right.openingBias : right.pressureBias;
    if (rightScore !== leftScore) return rightScore - leftScore;

    const rightBase = kind === "opening" ? right.positiveScore : right.pressureScore;
    const leftBase = kind === "opening" ? left.positiveScore : left.pressureScore;
    return rightBase - leftBase;
  });

  const threshold = kind === "opening" ? 1.8 : 2.1;
  const filtered = scored.filter((candidate) => {
    const score = kind === "opening" ? candidate.openingBias : candidate.pressureBias;
    return score >= threshold;
  });

  return (filtered.length ? filtered : scored).slice(0, 2);
}

function formatOpeningSentence(
  candidates: SignalCandidate[],
  emptyLine: string,
  subjectId: SubjectId,
  domain: Domain,
  random: () => number,
): string {
  if (!candidates.length) {
    return sentence(emptyLine);
  }

  const firstSummary = narrativeSignalPhrase(candidates[0].text, "opening", subjectId, domain);
  const secondSummary = candidates[1] ? narrativeSignalPhrase(candidates[1].text, "opening", subjectId, domain) : null;

  if (!secondSummary) {
    return sentence(
      choose(
        [
          `The clearest opening here is ${firstSummary}`,
          `A real opening sits in ${firstSummary}`,
          `What keeps this field from closing down is ${firstSummary}`,
        ],
        random,
      ),
    );
  }

  return sentence(
    choose(
      [
        `The clearest opening here is ${firstSummary}; another encouraging note is ${secondSummary}`,
        `There is still room to move here: ${firstSummary}, with a second opening in ${secondSummary}`,
        `One hopeful line runs through ${firstSummary}, while another grows through ${secondSummary}`,
      ],
      random,
    ),
  );
}

function formatPressureSentence(
  candidates: SignalCandidate[],
  emptyLine: string,
  subjectId: SubjectId,
  domain: Domain,
  random: () => number,
): string {
  if (!candidates.length) {
    return sentence(emptyLine);
  }

  const firstSummary = narrativeSignalPhrase(candidates[0].text, "pressure", subjectId, domain);
  const secondSummary = candidates[1] ? narrativeSignalPhrase(candidates[1].text, "pressure", subjectId, domain) : null;

  if (!secondSummary) {
    return sentence(
      choose(
        [
          `The heaviest pressure here is ${firstSummary}`,
          `One of the harder notes in the spread is ${firstSummary}`,
          `The main strain sits around ${firstSummary}`,
        ],
        random,
      ),
    );
  }

  return sentence(
    choose(
      [
        `The heaviest pressure here is ${firstSummary}; a second strain comes through ${secondSummary}`,
        `One hard note is ${firstSummary}, and behind it sits ${secondSummary}`,
        `The strain gathers around ${firstSummary}, with ${secondSummary} keeping the pressure active`,
      ],
      random,
    ),
  );
}

function topMotifs(layout: CardPlacement[], focusPosition: number, gtLayout: GTLayout): Array<[MotifId, number]> {
  const scores = new Map<MotifId, number>();
  layout.forEach((placement) => {
    const weight = distanceWeight(placement, focusPosition, gtLayout);
    motifsForPlacement(placement).forEach((motif) => {
      scores.set(motif, (scores.get(motif) ?? 0) + weight);
    });
  });
  return Array.from(scores.entries()).sort((left, right) => right[1] - left[1]);
}

function atmosphereSentenceFromMotifs(motifs: Array<[MotifId, number]>, random: () => number): string {
  const primary = motifs[0]?.[0] ?? "guidance";
  const secondary = motifs[1]?.[0] ?? "stability";
  const key = `${primary}:${secondary}`;

  const specialized: Partial<Record<string, string[]>> = {
    "hidden:guidance": [
      "A good deal is still half-hidden, but the important things are lit.",
      "Not everything is visible yet, though the useful signals are already showing.",
    ],
    "guidance:hidden": [
      "The spread is not clear in every direction, but the important lights are on.",
      "Guidance is present, even if much of the surrounding field remains uncertain.",
    ],
    "pressure:stability": [
      "Pressure is unmistakable here, but something underneath can still hold.",
      "The strain is genuine, yet the spread is not structurally hopeless.",
    ],
    "stability:pressure": [
      "Something durable is present beneath the strain, even if it is being tested.",
      "The cards show pressure, but not collapse; there is structure under it.",
    ],
    "movement:guidance": [
      "This spread favors movement with signal, not drift for its own sake.",
      "Change is active here, but it comes with direction rather than chaos.",
    ],
    "choice:pressure": [
      "Decision pressure is part of the story, and not every path will stay open forever.",
      "The cards keep returning to choices that can no longer remain abstract.",
    ],
    "warmth:pressure": [
      "Feeling is strong here, but it is moving through strain rather than ease.",
      "Warmth is present in the spread, though it is being tested by pressure around it.",
    ],
    "guidance:pressure": [
      "Direction is available in this spread, but it has to move through real resistance to arrive.",
      "The clearer signals are present, but they are working against genuine pressure.",
      "There is a usable path here, even if it runs straight through the difficulty.",
    ],
    "pressure:guidance": [
      "The weight is real here, but the spread has not gone dark; guidance is still visible if you look past the strain.",
      "Pressure leads in this field, though the cards have not closed off a useful direction.",
      "The difficulty is genuine, but it is not the whole story; there is still signal pointing a way through.",
    ],
    "guidance:stability": [
      "The spread has both direction and ground to stand on, which makes this a moment worth trusting.",
      "Clear signal and a solid foundation are both present here, and together they give this reading unusual steadiness.",
      "Something is pointing the way, and the footing is firm enough to move on it.",
    ],
    "stability:guidance": [
      "There is solid ground beneath this reading, and the direction available is worth following from it.",
      "The base is steady and the signal is clear; this is a field ready to be worked with deliberately.",
      "Steadiness leads here, and the guidance available builds on that rather than fighting against it.",
    ],
    "pressure:movement": [
      "The pressure in this spread is already forcing things to move, whether or not the timing feels right.",
      "Strain and change are running together here; the question is whether the movement is being shaped or just endured.",
      "Things are shifting under load, and the reading asks whether that movement can be steered.",
    ],
    "movement:pressure": [
      "Change is happening, but it is moving through pressure rather than open ground.",
      "This spread is in motion, though the resistance around it means nothing shifts without cost.",
      "There is real movement here, but the pressure means the next step matters more than usual.",
    ],
    "guidance:warmth": [
      "The direction available in this spread has a human quality to it; this is not just strategy, it is care.",
      "Signal and warmth are both present, and they are pointing the same way.",
      "There is both clarity and genuine feeling in this field, which gives the available direction real weight.",
    ],
    "warmth:guidance": [
      "Warmth leads in this spread, and the direction available flows naturally from that rather than against it.",
      "Human feeling is the dominant note here, and the guidance available is shaped by it.",
      "The emotional tone is strong, and the signal the cards offer is consistent with it.",
    ],
    "stability:movement": [
      "Something solid is present in this spread, but it is not static; change is gathering underneath it.",
      "The base is steady for now, but the cards suggest that movement is already beginning to build.",
      "Stability and change are both active here, and the reading is asking which one to back.",
    ],
    "movement:stability": [
      "Change is the dominant note in this field, but something stable is available to land on once the movement settles.",
      "Things are shifting here, and a steadier foundation is close enough to reach if the movement is directed well.",
      "The spread is in motion, but it is not groundless; stability is available once the immediate change is navigated.",
    ],
    "guidance:choice": [
      "The spread shows both a clear direction and a decision that has to be made before it can be followed.",
      "There is useful signal here, but it leads through a genuine choice rather than around it.",
      "Direction is available, though it requires a clear decision first rather than a gradual drift toward it.",
    ],
    "choice:guidance": [
      "A decision is near the center of this reading, and the guidance available points toward rather than away from making it.",
      "The cards keep returning to a choice, and the signal they offer is pointed enough to make that choice cleaner.",
      "Decision pressure leads here, though the direction available gives it more structure than it might first appear.",
    ],
    "communication:pressure": [
      "Conversation and signal are running through pressure in this spread; what gets said matters, and so does how.",
      "Communication is active in this field, but it is moving through strain, which makes clarity more important than usual.",
      "Words and information are part of the pressure here, not just a background note.",
    ],
    "pressure:communication": [
      "The weight in this spread has a communicative edge; what is being said or withheld is part of the difficulty.",
      "Pressure leads, and it is being carried at least partly through words, signals, and what remains unspoken.",
      "The strain here is not just circumstantial; some of it lives in the space between what is said and what is meant.",
    ],
    "power:pressure": [
      "Resources and leverage are active in this spread, but they are under pressure rather than freely available.",
      "There is real capacity here, but it is being tested by the weight around it.",
      "Power and strain are in direct contact in this field, and the question is which one is setting the terms.",
    ],
    "pressure:power": [
      "The pressure in this spread has a structural quality; it is not just circumstantial but tied to leverage, resources, or control.",
      "Strain leads here, and it is the kind that comes from competing claims on what has real weight.",
      "The weight in this field is partly about who or what holds the leverage, and that is what makes it harder to simply wait out.",
    ],
  };

  if (specialized[key]?.length) {
    return sentence(choose(specialized[key] ?? [], random));
  }

  return sentence(
    choose(
      [
        `The overall mood leans toward ${MOTIF_LABELS[primary]}, with ${MOTIF_LABELS[secondary]} shaping the next layer down`,
        `${MOTIF_LABELS[primary]} set the tone here, while ${MOTIF_LABELS[secondary]} keep informing how events develop`,
        `The field is marked by ${MOTIF_LABELS[primary]}, with a secondary pull toward ${MOTIF_LABELS[secondary]}`,
        `Across the field, ${MOTIF_LABELS[primary]} lead, and ${MOTIF_LABELS[secondary]} keep working underneath`,
      ],
      random,
    ),
  );
}

export function synthesizeGrandTableauNarrative(input: {
  layout: CardPlacement[];
  focusPosition: number;
  gtLayout: GTLayout;
  subjectId: SubjectId;
  domain: Domain;
  random: () => number;
}): TableauSynthesis {
  const { layout, focusPosition, gtLayout, subjectId, domain, random } = input;

  const candidates: SignalCandidate[] = layout.map((placement) => {
    const motifs = motifsForPlacement(placement);
    const weight = distanceWeight(placement, focusPosition, gtLayout);
    const positiveScore = motifs.reduce((sum, motif) => sum + POSITIVE_MOTIF_WEIGHT[motif], 0) * weight;
    const pressureScore = motifs.reduce((sum, motif) => sum + PRESSURE_MOTIF_WEIGHT[motif], 0) * weight;
    const openingBias = positiveScore - pressureScore * 0.72;
    const pressureBias = pressureScore - positiveScore * 0.58;
    return {
      placement,
      positiveScore,
      pressureScore,
      openingBias,
      pressureBias,
      text: describePlacementSignal(placement, subjectId, domain, random),
    };
  });

  const strongestOpenings = pickSignalCandidates(candidates, "opening");
  const strongestPressures = pickSignalCandidates(candidates, "pressure");

  const motifs = topMotifs(layout, focusPosition, gtLayout);
  const atmosphereSentence = atmosphereSentenceFromMotifs(motifs, random);

  const openingsSentence = formatOpeningSentence(
    strongestOpenings,
    "There are openings here, but they are quieter than the pressure around them.",
    subjectId,
    domain,
    random,
  );

  const pressureSentence = formatPressureSentence(
    strongestPressures,
    "The difficulty is real, but it comes more from pressure than from total blockage.",
    subjectId,
    domain,
    random,
  );

  const practicalFrame = PRACTICAL_SUBJECT_FRAMES[subjectId];
  const strongestOpeningText = strongestOpenings[0]?.text ?? null;
  const strongestPressureText = strongestPressures[0]?.text ?? null;
  const openingSummary = strongestOpeningText
    ? narrativeSignalPhrase(strongestOpeningText, "opening", subjectId, domain)
    : null;
  const pressureSummary = strongestPressureText
    ? narrativeSignalPhrase(strongestPressureText, "pressure", subjectId, domain)
    : null;

  const practicalSentence = openingSummary && pressureSummary
    ? `${sentence(
        choose(
          [
            `Practically, this is ${practicalFrame}`,
            `In real terms, this is ${practicalFrame}`,
            `On the ground, this is ${practicalFrame}`,
            `In lived terms, this is ${practicalFrame}`,
          ],
          random,
        ),
      )} ${sentence(
        choose(
          [
            `The difficulty sits with ${pressureSummary}, while ${openingSummary} shows what can still move`,
            `The harder part is ${pressureSummary}, but there is still room for ${openingSummary}`,
          `${pressureSummary} is what keeps the story from settling, yet there is still room for ${openingSummary}`,
            `The pressure gathers around ${pressureSummary}, while ${openingSummary} is already beginning to answer it`,
            `What is most difficult here is ${pressureSummary}; what still helps is ${openingSummary}`,
            `${openingSummary} is real, but it has to work around ${pressureSummary} first`,
          ],
          random,
        ),
      )}`
    : sentence(
        choose(
          [
            `Practically, this looks like ${practicalFrame}`,
            `In plain terms, this is ${practicalFrame}`,
            `On the ground, this is ${practicalFrame}`,
          ],
          random,
        ),
      );

  const thesisSentence = sentence(
    openingSummary && pressureSummary
      ? choose(
        [
          `This is not a closed field; it is a live situation where naming the pressure is what allows the path forward to come through`,
          `The larger pattern says the opportunity is real, but it depends on handling what is pressing without losing sight of what is opening`,
          `This reads less like a dead end than a situation under strain, where a way through remains possible if the pressure is faced directly`,
          `The deeper story is not resolving this too quickly; the strain is real, but so is what can still take shape if it is handled honestly`,
          `The cards do not describe a shut door; they describe active strain, with a way forward still available if it is handled cleanly`,
          `What keeps this workable is that the strain is not the whole story; movement is already beginning to show through`,
          `Both threads belong in the reading: the pressure is real, and so is where the spread is still pointing forward`,
          `The situation is strained, not closed: the pressure is active, and there is still room for what is beginning to open`,
          ],
          random,
        )
      : choose(
          [
            "The tableau asks for discernment more than certainty.",
            "The spread reads like navigation through mixed conditions rather than a simple yes or no.",
            "The overall story is one of measured movement, not dramatic certainty.",
            "What the cards describe here is a field in motion, not a fixed answer.",
          ],
          random,
        ),
  );

  let conclusionSentence = sentence(
    openingSummary && pressureSummary
      ? choose(
        [
          `The situation has more room in it than the pressure suggests — the strain is real, and so is what can still develop, and neither cancels the other`,
          `Two things can be true at once here: the pressure is real, and a clearer direction is beginning to take shape`,
          `What matters is not denying the strain; it is noticing where movement has already started`,
          `At heart, this is a phase where the strain has to be faced honestly — and there is still a path worth following if it is`,
          `The clearer reading is that the strain is real, and the forward thread is still worth following`,
          `This is not a closed picture; the pressure has not ended, but neither has what can still shift`,
          `The reading describes active strain, not a finished outcome — the difficulty is real, and so is what the spread is still pointing toward`,
          `Neither side of this picture cancels the other — the pressure is worth attending to, and so is what the spread is still pointing toward`,
          ],
          random,
        )
      : choose(
          [
            "The cards point to a situation still in motion, where steadiness and honest timing matter more than early conclusions.",
            "The tableau is asking for realism, patience, and attention to what is actually moving.",
            "The spread is less about forcing a result than about reading what is already taking shape.",
            "What shows most clearly here is a situation still in motion, and the wisest move is to read it closely before acting.",
            "The reading describes a picture that is still developing, not a finished verdict — and that distinction matters.",
            "Nothing in this spread has fully settled, which means the situation is still open to influence from the right direction.",
            "The tableau is showing movement, not conclusions — and the next step is more about reading the field than forcing an answer.",
            "What the cards describe is a process, not a destination, and the most useful response is attentiveness to what shifts next.",
          ],
          random,
        ),
  );

  if (subjectId === "purpose_calling") {
    conclusionSentence = conclusionSentence.replace(
      /^The part worth backing now is\b/i,
      "What is worth noting now is",
    );
  }

  conclusionSentence = conclusionSentence.replace(
    /\bdepends on steadier footing through maturity and restraint\b/i,
    "depends on a steadier footing through maturity and restraint",
  );

  return {
    atmosphereSentence,
    openingsSentence,
    pressureSentence,
    practicalSentence,
    thesisSentence,
    conclusionSentence,
    openingBullet: openingSummary ? `What helps most is ${openingSummary}` : null,
    pressureBullet: pressureSummary ? `The main strain is ${pressureSummary}` : null,
  };
}
