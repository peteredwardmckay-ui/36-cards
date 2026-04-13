import { CARD_MEANINGS } from "@/lib/content/cards";
import type { Domain } from "@/lib/engine/types";

export interface PairMeaning {
  key: string;
  a: number;
  b: number;
  signal: number;
  meanings: Record<Domain, string>;
}

const SIGNAL_WEIGHTS: Record<number, number> = {
  1: 7,
  2: 6,
  3: 6,
  4: 6,
  5: 5,
  6: 6,
  7: 7,
  8: 7,
  9: 6,
  10: 7,
  11: 6,
  12: 6,
  13: 5,
  14: 7,
  15: 7,
  16: 7,
  17: 6,
  18: 5,
  19: 6,
  20: 6,
  21: 8,
  22: 8,
  23: 7,
  24: 7,
  25: 7,
  26: 6,
  27: 6,
  28: 8,
  29: 9,
  30: 5,
  31: 8,
  32: 6,
  33: 8,
  34: 7,
  35: 7,
  36: 8,
};

const CURATED_OVERRIDES: Record<string, Record<Domain, string>> = {
  "1-27": {
    general: "Rider + Letter highlights rapid communication that benefits from precision and quick acknowledgment.",
    love: "Rider + Letter suggests an important emotional message arriving soon, where tone and precise wording carry real emotional weight.",
    work: "Rider + Letter points to decisive updates, contracts, or notices with immediate workflow impact.",
  },
  "1-29": {
    general: "Rider + Querent puts fresh news, a first move, or incoming momentum directly in your own hands.",
    love: "Rider + Querent points to an incoming signal or first move landing squarely with you, where your response is what determines whether it goes further.",
    work: "Rider + Querent marks new information or an incoming opportunity that your own timing and readiness will decide.",
  },
  "6-29": {
    general: "Clouds + Querent places uncertainty and mixed signals close to home, where your own clarity is what begins to clear the fog.",
    love: "Clouds + Querent points to uncertainty about the connection, where your own stance is what begins to clear the mixed signals.",
    work: "Clouds + Querent marks unclear direction gathering around your own role, where a clearer personal position is what shifts the picture.",
  },
  "7-29": {
    general: "Snake + Querent places mixed motives, desire, or a complicated dynamic close to home, where your own clarity about what you actually want is what begins to untangle it.",
    love: "Snake + Querent points to desire or mixed motives gathering most squarely around your own position, where naming what you actually want is what cuts through the complication.",
    work: "Snake + Querent marks strategic pressure or mixed motives landing on your side, where your own discernment is what the situation needs.",
  },
  "11-29": {
    general: "Whip + Querent: the repeating argument, friction, or pattern of tension is directly with you, where how you respond to it is what either sustains it or breaks it.",
    love: "Whip + Querent points to the repeating tension or friction landing most squarely with you, where your own shift in response changes the pattern.",
    work: "Whip + Querent marks your own response to the repeating friction or pressure as what determines whether the pattern continues.",
  },
  "10-29": {
    general: "Scythe + Querent: a sharp decision or necessary boundary is directly with you, where the clarity required is yours to provide.",
    love: "Scythe + Querent marks a decisive boundary or clear cut falling most squarely on your side, where your own clarity matters more than pressure.",
    work: "Scythe + Querent marks your role as the place where the necessary boundary or clean cut has to be named and owned.",
  },
  "1-10": {
    general: "Rider + Scythe marks fast-moving news that demands a timely decision.",
    love: "Rider + Scythe suggests a direct conversation that clarifies relationship boundaries quickly.",
    work: "Rider + Scythe indicates urgent communications requiring rapid prioritization.",
  },
  "2-31": {
    general: "Clover + Sun blends luck with confidence, where small openings can become meaningful wins when met with self-trust.",
    love: "Clover + Sun favors joyful moments that refresh connection.",
    work: "Clover + Sun suggests a fortunate boost in visibility or performance.",
  },
  "2-29": {
    general: "Clover + Querent puts the opening close to your own choices, where a small, timely shift can make the difference.",
    love: "Clover + Querent places a small opening directly within reach, where your own responsiveness turns timing into something real.",
    work: "Clover + Querent points to a useful opening that depends on your own timing, responsiveness, and willingness to act cleanly.",
  },
  "3-34": {
    general: "Ship + Fish emphasizes movement in resources, trade, or financial flow.",
    love: "Ship + Fish may indicate emotional or practical distance around shared resources.",
    work: "Ship + Fish often points to revenue from expansion, markets, or external channels.",
  },
  "3-18": {
    general: "Ship + Dog suggests support that travels well: a reliable ally, practical arrangement, or trusted route that helps movement happen.",
    love: "Ship + Dog can show a loyal bond stretched by distance or helped by consistent effort across that distance.",
    work: "Ship + Dog points to dependable support across teams, locations, or moving parts.",
  },
  "3-24": {
    general: "Ship + Heart ties direction to devotion, so that what moves forward is what still feels genuinely worth backing.",
    love: "Ship + Heart suggests emotional movement, longing, or a bond trying to bridge distance through sincere feeling.",
    work: "Ship + Heart suggests a move or expansion shaped by values rather than convenience alone.",
  },
  "4-5": {
    general: "House + Tree points to a living foundation that grows stronger through steady care and maintenance.",
    love: "House + Tree suggests intimacy deepens through patience, routine, and emotional steadiness.",
    work: "House + Tree favors sustainable systems built through consistent upkeep rather than speed.",
  },
  "4-18": {
    general: "House + Dog steadies the environment through loyalty, routine, and dependable support.",
    love: "House + Dog suggests trust grows through reliability and the comfort of showing up consistently.",
    work: "House + Dog supports a dependable base, where trusted allies or routines keep things stable.",
  },
  "4-24": {
    general: "House + Heart brings values and belonging into focus, making emotional security the central concern.",
    love: "House + Heart is a strong signal for nurturing intimacy through stability.",
    work: "House + Heart suggests culture and values alignment influence productivity.",
  },
  "4-10": {
    general: "House + Scythe points to a sharp change in the base structure, where stability depends on what is cut away cleanly.",
    love: "House + Scythe suggests the bond may need a decisive boundary around home habits, emotional safety, or the routines that are quietly shaping the relationship.",
    work: "House + Scythe points to a sharp adjustment in process, base systems, or the structure people rely on day to day.",
  },
  "5-21": {
    general: "Tree + Mountain marks slow growth through sustained effort and patience.",
    love: "Tree + Mountain suggests relational healing requires time, consistency, and gentle pacing.",
    work: "Tree + Mountain calls for long-horizon planning through structural constraints.",
  },
  "5-23": {
    general: "Tree + Mice warns that small drains can wear down resilience if they are left unattended.",
    love: "Tree + Mice suggests quiet worries or small frictions erode closeness unless they are named early.",
    work: "Tree + Mice points to low-level stress steadily eating into stamina or long-term performance.",
  },
  "5-26": {
    general: "Tree + Book suggests knowledge that deepens slowly, with understanding growing through patience and repetition.",
    love: "Tree + Book indicates emotional truth unfolds gradually and needs time before it feels safe to share.",
    work: "Tree + Book supports study, training, or expertise that matures through disciplined practice.",
  },
  "5-18": {
    general: "Tree + Dog supports recovery and steadiness through dependable care, loyalty, and calm consistency.",
    love: "Tree + Dog suggests a bond that strengthens through faithful support and patient healing.",
    work: "Tree + Dog favors sustainable progress built with reliable allies and trusted routines.",
  },
  "6-24": {
    general: "Clouds + Heart mixes real feeling with uncertainty, making emotional truth harder to read cleanly for a while.",
    love: "Clouds + Heart suggests affection is present, but confusion, mixed signals, or fluctuating tone make it harder to trust what is being felt.",
    work: "Clouds + Heart points to values and morale being affected by uncertainty or unclear emotional undercurrents.",
  },
  "6-25": {
    general: "Clouds + Ring puts commitment under uncertain weather, where existing terms still lack the clear meaning needed to hold firm.",
    love: "Clouds + Ring suggests commitment is being tested by confusion, ambiguity, or changing emotional conditions.",
    work: "Clouds + Ring indicates uncertain contract terms, unclear commitments, or obligations that need better definition.",
  },
  "6-33": {
    general: "Clouds + Key says clarity is possible, but only after confusion is named rather than ignored.",
    love: "Clouds + Key suggests a clarifying conversation unlocks emotional confusion.",
    work: "Clouds + Key points to solving ambiguity with one decisive framework.",
  },
  "6-34": {
    general: "Clouds + Fish muddies the resource picture, making the true state of financial movement harder to read cleanly.",
    love: "Clouds + Fish can blur the line between emotional generosity and practical uncertainty.",
    work: "Clouds + Fish points to unclear revenue, budgets, or resource movement that need cleaner visibility.",
  },
  "6-35": {
    general: "Clouds + Anchor suggests something stable is still present, but it is obscured enough that you could mistake fog for collapse.",
    love: "Clouds + Anchor suggests steadiness may still exist in the bond, even if it is currently hard to trust or feel.",
    work: "Clouds + Anchor points to structural stability that is still there, even though the outlook remains unclear.",
  },
  "7-14": {
    general: "Snake + Fox emphasizes strategy, caution, and smart risk management.",
    love: "Snake + Fox asks for transparent intentions and discernment in relational dynamics.",
    work: "Snake + Fox indicates political complexity where tactical precision is essential.",
  },
  "8-35": {
    general: "Coffin + Anchor signals ending one commitment to preserve long-term stability.",
    love: "Coffin + Anchor asks whether continuity is serving growth or preventing necessary change.",
    work: "Coffin + Anchor suggests restructuring a career path for sustainable endurance.",
  },
  "9-20": {
    general: "Bouquet + Garden blends charm with visibility, creating conditions where social reception opens warmly.",
    love: "Bouquet + Garden favors warm social energy and mutual appreciation.",
    work: "Bouquet + Garden supports networking and external reputation building.",
  },
  "10-36": {
    general: "Scythe + Cross marks a serious cut: a hard decision that carries consequence, duty, or moral weight.",
    love: "Scythe + Cross marks a boundary choice made for emotional integrity.",
    work: "Scythe + Cross points to difficult tradeoffs with serious responsibility.",
  },
  "10-25": {
    general: "Scythe + Ring cuts directly into an agreement, exposing whether the bond or pattern can continue on current terms.",
    love: "Scythe + Ring suggests a commitment decision, a boundary around the bond, or a sharp redefinition of relational terms.",
    work: "Scythe + Ring points to abrupt contract revisions, renegotiation, or a decision that changes the agreement fast.",
  },
  "11-23": {
    general: "Whip + Mice warns that repetitive stress can slowly deplete your bandwidth.",
    love: "Whip + Mice suggests recurring small tensions need direct repair.",
    work: "Whip + Mice indicates process loops causing silent attrition.",
  },
  "12-24": {
    general: "Birds + Heart highlights emotionally significant dialogue.",
    love: "Birds + Heart favors heartfelt communication and relational reassurance.",
    work: "Birds + Heart suggests value-driven conversations improve team trust.",
  },
  "12-25": {
    general: "Birds + Ring keeps the agreement in active discussion, making repeated conversations part of how terms are shaped.",
    love: "Birds + Ring suggests commitment is being talked through, negotiated, or tested through recurring conversations.",
    work: "Birds + Ring points to ongoing discussion around agreements, expectations, or terms that are not yet fully settled.",
  },
  "12-27": {
    general: "Birds + Letter turns communication into the central event, where wording, timing, and tone all carry immediate weight.",
    love: "Birds + Letter suggests the emotional atmosphere is being carried by messages, replies, and the way things are said in real time.",
    work: "Birds + Letter often marks rapid exchanges, document revisions, or message loops that shape the practical outcome.",
  },
  "12-34": {
    general: "Birds + Fish puts attention and conversation directly onto the numbers, where nervous talk or mixed signals need separating from the actual financial flow.",
    love: "Birds + Fish can tie emotional tone to practical giving, support, or shared resources in ways that heighten sensitivity.",
    work: "Birds + Fish points to money talk, budget chatter, or resource questions that are moving faster than clear decisions.",
  },
  "13-16": {
    general: "Child + Stars points to a promising new direction with clear guidance.",
    love: "Child + Stars suggests a hopeful reset in emotional tone.",
    work: "Child + Stars supports innovation guided by strategic clarity.",
  },
  "13-26": {
    general: "Child + Book begins a learning curve, a private chapter, or information that is still taking shape.",
    love: "Child + Book suggests a tender but not-yet-fully-spoken feeling needs time before it becomes clear.",
    work: "Child + Book supports study, training, or new research that is still in early development.",
  },
  "14-15": {
    general: "Fox + Bear blends tactical caution with resource power.",
    love: "Fox + Bear asks for balanced boundaries around care and control.",
    work: "Fox + Bear indicates strategic negotiation around authority and assets.",
  },
  "14-35": {
    general: "Fox + Anchor protects what lasts through careful review, but it can also freeze a situation if caution becomes habit.",
    love: "Fox + Anchor suggests the bond wants stability, but guardedness may be mistaken for reliability if no one names it.",
    work: "Fox + Anchor favors protecting what already works, provided caution does not harden into unhelpful rigidity.",
  },
  "15-34": {
    general: "Bear + Fish puts money under strong hands, making leverage, stewardship, and who sets the terms the central concern.",
    love: "Bear + Fish raises practical questions about shared financial security.",
    work: "Bear + Fish often marks high-impact financial decision windows.",
  },
  "16-31": {
    general: "Stars + Sun is a high-clarity combination supporting confident progress.",
    love: "Stars + Sun favors optimistic alignment and shared direction.",
    work: "Stars + Sun indicates strategy and execution moving into sync.",
  },
  "17-18": {
    general: "Stork + Dog suggests positive change supported by a trusted ally, faithful habit, or loyal bond.",
    love: "Stork + Dog favors relationship improvement through consistent effort and trustworthy action.",
    work: "Stork + Dog indicates practical improvement supported by dependable colleagues or routines.",
  },
  "17-34": {
    general: "Stork + Fish suggests improving flow through timely changes, better sequencing, or a smarter pattern of movement in the numbers.",
    love: "Stork + Fish can show change improving the balance of giving, support, or practical reciprocity.",
    work: "Stork + Fish points to improving resource movement through better process or changed conditions.",
  },
  "17-29": {
    general: "Stork + Querent places movement, renewal, or a shift in conditions directly in your hands.",
    love: "Stork + Querent points to gradual renewal in how you are showing up, where a shift in your own approach is what updates the bond.",
    work: "Stork + Querent marks constructive change that depends on your own next move or reorientation.",
  },
  "17-22": {
    general: "Stork + Crossroads signals change driven by a pivotal decision.",
    love: "Stork + Crossroads asks you to choose the relationship direction deliberately.",
    work: "Stork + Crossroads suggests transition planning across multiple options.",
  },
  "18-20": {
    general: "Dog + Garden expands support through community, networks, and visible goodwill.",
    love: "Dog + Garden suggests a relationship grows through social openness, friendship, and shared space.",
    work: "Dog + Garden favors alliances, networking, and trusted connections in the wider field.",
  },
  "18-24": {
    general: "Dog + Heart blends loyalty with affection, making sincere care and emotional reliability central.",
    love: "Dog + Heart supports devotion, warmth, and friendship strengthening romantic feeling.",
    work: "Dog + Heart points to goodwill and trust becoming the emotional glue in collaboration.",
  },
  "18-25": {
    general: "Dog + Ring points to dependable agreements, bonds strengthened by follow-through, and loyalty made visible.",
    love: "Dog + Ring supports commitment that proves itself through consistency rather than promises alone.",
    work: "Dog + Ring favors reliable partnerships, contracts, and working agreements you can count on.",
  },
  "18-28": {
    general: "Dog + Counterpart emphasizes loyal support between key people.",
    love: "Dog + Counterpart highlights reliability and reciprocity in partnership.",
    work: "Dog + Counterpart points to trusted collaborators shaping results.",
  },
  "19-25": {
    general: "Tower + Ring formalizes commitment through structure, boundaries, or institutional terms.",
    love: "Tower + Ring suggests defining the relationship clearly may matter more than keeping it vague.",
    work: "Tower + Ring points to formal agreements, policies, or responsibilities becoming binding.",
  },
  "19-28": {
    general: "Tower + Counterpart: the other person is at a distance, behind structure, or inside conditions they are not moving beyond quickly.",
    love: "Tower + Counterpart suggests the other person's role is shaped by reserve, distance, caution, or a bond that currently feels more formal than intimate.",
    work: "Tower + Counterpart points to a stakeholder, institution, or counterpart operating from a more formal and protected position.",
  },
  "19-26": {
    general: "Tower + Book points to protected information, specialist knowledge, or rules held inside a formal system.",
    love: "Tower + Book suggests emotional reserve, privacy, or guarded truth within a structured bond.",
    work: "Tower + Book indicates confidential policy, institutional knowledge, or restricted information.",
  },
  "19-27": {
    general: "Tower + Letter emphasizes official messages, formal notices, or communication arriving through structured channels.",
    love: "Tower + Letter suggests a serious or boundary-setting conversation that cannot stay informal.",
    work: "Tower + Letter often marks contracts, notices, approvals, or formal correspondence with consequences.",
  },
  "19-33": {
    general: "Tower + Key brings a firm answer through structure, boundaries, or official channels, where clarity comes by defining the frame precisely.",
    love: "Tower + Key suggests defining boundaries can unlock emotional stability.",
    work: "Tower + Key indicates a formal decision or policy unlock.",
  },
  "20-24": {
    general: "Garden + Heart brings warmth into shared space, making welcome, affection, and public kindness more visible.",
    love: "Garden + Heart favors joyful connection in social settings and open-hearted interaction.",
    work: "Garden + Heart supports goodwill, audience warmth, and collaborative rapport.",
  },
  "20-25": {
    general: "Garden + Ring suggests belonging becoming formalized through commitments, circles, or public agreements.",
    love: "Garden + Ring may point to commitment becoming more visible in a shared social world.",
    work: "Garden + Ring supports alliances, memberships, and agreements that operate across a wider network.",
  },
  "20-28": {
    general: "Garden + Counterpart: the other person is in a wider social field, where context and outside influences matter.",
    love: "Garden + Counterpart suggests the relationship is shaped by social setting, visibility, or shared circles.",
    work: "Garden + Counterpart points to a collaborator or stakeholder whose role is publicly visible.",
  },
  "20-31": {
    general: "Garden + Sun increases visibility and social momentum.",
    love: "Garden + Sun favors vibrant public or social connection.",
    work: "Garden + Sun supports recognition through external engagement.",
  },
  "20-32": {
    general: "Garden + Moon heightens public mood, audience response, and the emotional tone of a wider group.",
    love: "Garden + Moon suggests feelings are affected by visibility, response, or the social atmosphere around the bond.",
    work: "Garden + Moon can indicate reputation, audience reception, or creative visibility in the wider field.",
  },
  "21-26": {
    general: "Mountain + Book points to truth held behind a barrier that yields only to patient, deliberate approach.",
    love: "Mountain + Book indicates emotional distance linked to what remains unsaid or hard to understand.",
    work: "Mountain + Book points to complex material, delays in access, or information blocked by process.",
  },
  "21-27": {
    general: "Mountain + Letter slows messages, paperwork, or explanations, making persistence through the delay more important than trying to rush.",
    love: "Mountain + Letter marks the point where communication feels stuck and patience matters more than pushing.",
    work: "Mountain + Letter often marks slow approvals, stalled documents, or messages caught in procedure.",
  },
  "21-33": {
    general: "Mountain + Key points to a real answer held behind an obstacle that yields only to patience and methodical working-through.",
    love: "Mountain + Key marks the slow repair that can dissolve emotional distance if both people commit to it steadily.",
    work: "Mountain + Key points to a blocker that is solvable with focused effort.",
  },
  "21-29": {
    general: "Mountain + Querent: the blockage is squarely with you, where steadiness and patience matter more than forcing what is still closed.",
    love: "Mountain + Querent points to your own reserve or caution as a likely part of what is keeping the distance in place.",
    work: "Mountain + Querent indicates you are personally handling the blockage and may need a slower, steadier strategy.",
  },
  "23-34": {
    general: "Mice + Fish shows flow being reduced by recurring losses, fees, or financial leakage that matters because it keeps repeating.",
    love: "Mice + Fish can show generosity or shared support being worn down by strain, imbalance, or practical worry.",
    work: "Mice + Fish points to budget seepage, small losses, or value leaking out through unstable process.",
  },
  "22-29": {
    general: "Crossroads + Querent: the decision is squarely with you, where the path forward depends on the direction you actually commit to.",
    love: "Crossroads + Querent asks what you genuinely want in this relationship path.",
    work: "Crossroads + Querent indicates personal leadership over strategic direction.",
  },
  "22-33": {
    general: "Crossroads + Key shows the right door opening only after a real choice is made, where clarity follows commitment rather than preceding it.",
    love: "Crossroads + Key points to the relational clarity that becomes available once the direction is named honestly.",
    work: "Crossroads + Key points to a strategic decision that unlocks the next workable phase.",
  },
  "23-35": {
    general: "Mice + Anchor highlights the risk of long-term depletion through unnoticed stress.",
    love: "Mice + Anchor suggests routine strain requires active care.",
    work: "Mice + Anchor flags burnout risk in sustained commitments.",
  },
  "23-24": {
    general: "Mice + Heart shows care being worn down by worry, attrition, or the small repeated losses that quietly change the tone.",
    love: "Mice + Heart points to affection being worn down by small hurts, doubt, or the strain of never feeling fully settled.",
    work: "Mice + Heart points to morale and motivation being slowly depleted by repeated stressors.",
  },
  "23-29": {
    general: "Mice + Querent puts attrition, drain, or small repeated stressors directly on your own choices and position.",
    love: "Mice + Querent points to worry, doubt, or low-grade relational strain landing most squarely with you.",
    work: "Mice + Querent marks personal energy, focus, or resources being quietly depleted by accumulated pressure.",
  },
  "24-25": {
    general: "Heart + Ring highlights commitment that is trying to stay true to what genuinely matters.",
    love: "Heart + Ring is a classic signal for sincere relational commitment.",
    work: "Heart + Ring suggests commitments should align with core values.",
  },
  "24-27": {
    general: "Heart + Letter brings feeling into words, making honesty, messages, or explicit expression central.",
    love: "Heart + Letter suggests emotion wants to be said plainly, whether through a confession, reassurance, or clearer emotional wording.",
    work: "Heart + Letter points to values and feeling being expressed more directly in writing or conversation.",
  },
  "24-28": {
    general: "Heart + Counterpart highlights emotional resonance with the other person.",
    love: "Heart + Counterpart supports relational depth through mutual vulnerability.",
    work: "Heart + Counterpart points to collaboration that benefits from empathy.",
  },
  "24-29": {
    general: "Heart + Querent keeps your own values and honest self-knowledge at the center, making them the emotional anchor of what unfolds.",
    love: "Heart + Querent suggests the relationship becomes clearer when you stay close to your own feelings rather than guessing theirs first.",
    work: "Heart + Querent points to values-led choices, where motivation improves when the work still feels personally true.",
  },
  "24-31": {
    general: "Heart + Sun warms the whole field, suggesting that sincerity and openness create forward movement faster than pressure.",
    love: "Heart + Sun supports warmth, generosity, and a more open emotional climate.",
    work: "Heart + Sun favors visible goodwill, where values and confidence strengthen each other.",
  },
  "24-33": {
    general: "Heart + Key brings emotional truth into clear focus, where sincerity becomes the thing that opens the next phase.",
    love: "Heart + Key suggests a clear emotional truth can unlock the relationship more effectively than guessing, testing, or waiting silently.",
    work: "Heart + Key points to values clarity becoming the key factor in a decision or commitment.",
  },
  "25-26": {
    general: "Ring + Book keeps terms private until they are understood, making discretion part of the commitment.",
    love: "Ring + Book suggests a commitment may still be forming behind the scenes or needs clearer private understanding.",
    work: "Ring + Book points to confidential agreements, specialist contracts, or terms not yet ready for open discussion.",
  },
  "26-29": {
    general: "Book + Querent keeps part of the story off the page, making withheld details, self-knowledge, or what has not yet been fully counted central to what happens next.",
    love: "Book + Querent suggests the relationship turns on what you know but have not yet said, especially where private feeling needs clearer expression.",
    work: "Book + Querent points to specialist knowledge, private judgment, or unspoken information that sits with you directly.",
  },
  "25-27": {
    general: "Ring + Letter points to agreements that must be stated clearly.",
    love: "Ring + Letter suggests explicit conversations about commitment terms.",
    work: "Ring + Letter often indicates contracts, renewals, or written obligations.",
  },
  "25-28": {
    general: "Ring + Counterpart names the explicit terms between two people, where mutual obligations can no longer be treated as implied.",
    love: "Ring + Counterpart suggests the relationship turns on whether the other person can meet the commitment in a concrete, mutual way.",
    work: "Ring + Counterpart points to agreements that depend on reciprocal clarity with the other party.",
  },
  "25-33": {
    general: "Ring + Key defines the terms sharply enough that a bond or agreement can finally be confirmed, revised, or unlocked.",
    love: "Ring + Key suggests commitment becomes much clearer once the real terms are named directly.",
    work: "Ring + Key points to agreement terms becoming clear enough to unlock the next workable phase.",
  },
  "26-27": {
    general: "Book + Letter brings hidden information into words, making study, paperwork, or revelation timely.",
    love: "Book + Letter suggests a private truth is ready to be said more plainly.",
    work: "Book + Letter often marks documents, research, applications, or findings moving into explicit form.",
  },
  "26-33": {
    general: "Book + Key unlocks what was hidden, turning private knowledge into something usable.",
    love: "Book + Key suggests a private truth can improve emotional clarity.",
    work: "Book + Key marks strategic insight becoming actionable.",
  },
  "27-33": {
    general: "Letter + Key marks the message, document, or explicit statement that changes the whole picture.",
    love: "Letter + Key suggests one direct message can unlock understanding between you.",
    work: "Letter + Key points to documents, notices, or approvals that open the next stage.",
  },
  "27-29": {
    general: "Letter + Querent sharpens the need to say explicitly what you actually mean, where clarity starts with your own stated position.",
    love: "Letter + Querent points to the clarity that comes from naming what you actually need in the bond.",
    work: "Letter + Querent indicates clear self-advocacy in professional communication.",
  },
  "25-34": {
    general: "Ring + Fish ties resources to recurring obligations, subscriptions, or agreements that keep drawing from the stream.",
    love: "Ring + Fish suggests practical commitments and shared obligations shape the emotional tone more than either person admits.",
    work: "Ring + Fish points to revenue or resources being shaped by contracts, subscriptions, or repeating financial terms.",
  },
  "27-34": {
    general: "Letter + Fish makes the resource picture legible through paperwork, invoices, statements, or the message that finally shows where value is moving.",
    love: "Letter + Fish can bring practical clarity around giving, support, or what is being exchanged in the bond.",
    work: "Letter + Fish often marks financial reporting, invoices, or written information that clarifies the real resource picture.",
  },
  "28-29": {
    general: "Counterpart + Querent keeps both perspectives in the frame, where what matters is not one side alone but the space they genuinely share.",
    love: "Counterpart + Querent highlights relationship negotiation and mutual perspective.",
    work: "Counterpart + Querent points to stakeholder alignment as a central task.",
  },
  "28-33": {
    general: "Counterpart + Key shows the other person's role becoming central to clarity, where the answer opens through real exchange rather than assumption.",
    love: "Counterpart + Key points to relational clarity that comes from both people stating what they actually want.",
    work: "Counterpart + Key points to a counterpart, client, or stakeholder holding the information that unlocks progress.",
  },
  "28-36": {
    general: "Counterpart + Cross places a real burden or obligation at the center of the other person's role, where what they carry shapes what they can offer.",
    love: "Counterpart + Cross points to the other person carrying something heavy — duty, guilt, or unresolved obligation — that is quietly shaping the bond.",
    work: "Counterpart + Cross points to a stakeholder or collaborator operating under significant pressure, duty, or constraint.",
  },
  "28-30": {
    general: "Counterpart + Lily slows the tone, suggesting maturity, restraint, or a quieter style of engagement from the other side.",
    love: "Counterpart + Lily suggests the other person may be showing feeling more slowly, more carefully, or through calm consistency rather than overt drama.",
    work: "Counterpart + Lily points to a composed, measured counterpart whose pace may be slower but steadier.",
  },
  "29-33": {
    general: "Querent + Key confirms that your own clarity is the hinge that opens the next phase, and the answer is not as far from you as it may feel.",
    love: "Querent + Key points to your own relational clarity as the variable the bond is most waiting on.",
    work: "Querent + Key indicates your decision can resolve a stuck process.",
  },
  "29-31": {
    general: "Querent + Sun: your position in a clearer light, where confidence and self-trust improve the whole field around you.",
    love: "Querent + Sun points to warmth and self-confidence as what lifts the overall tone of the connection.",
    work: "Querent + Sun points to stronger visibility, confidence, and positive momentum around your role.",
  },
  "25-29": {
    general: "Ring + Querent places the bond, promise, or repeating pattern close to home, where your own terms shape what continues.",
    love: "Ring + Querent points to the clarity that comes from being honest about the kind of bond you can truly sustain.",
    work: "Ring + Querent points to agreements or recurring responsibilities that depend on your own boundaries and follow-through.",
  },
  "29-36": {
    general: "Querent + Cross suggests a burden that lands close to the bone, where the harder task is discerning what is genuinely yours to carry and what can be released.",
    love: "Querent + Cross marks an emotional weight that settles on you more personally than almost anything else, where clearer limits become the most necessary response.",
    work: "Querent + Cross points to duty or pressure being felt very personally, which calls for steadier limits.",
  },
  "29-35": {
    general: "Querent + Anchor steadies the reading around what you can truly hold, fund, or keep supporting over time.",
    love: "Querent + Anchor suggests the bond grows clearer through consistency, steadiness, and what you can keep showing over time.",
    work: "Querent + Anchor points to your own reliability becoming the stabilizing force in the wider situation.",
  },
  "33-34": {
    general: "Key + Fish shows the answer appearing inside the numbers themselves, where clarity comes from reading the flow closely rather than guessing at it.",
    love: "Key + Fish can clarify what is being exchanged emotionally and practically, and whether that balance is sustainable.",
    work: "Key + Fish points to a financial or operational unlock once the flow is read clearly.",
  },
  "30-31": {
    general: "Lily + Sun combines maturity with visible progress.",
    love: "Lily + Sun suggests warm stability and respectful growth.",
    work: "Lily + Sun supports recognized excellence through composed leadership.",
  },
  "31-33": {
    general: "Sun + Key points to a clear breakthrough, where confidence and certainty strengthen each other instead of pulling apart.",
    love: "Sun + Key can unlock a positive turn in connection.",
    work: "Sun + Key indicates a clear success pathway with strong momentum.",
  },
  "31-35": {
    general: "Sun + Anchor supports durable progress: momentum holds when success is given structure and something solid to rest on.",
    love: "Sun + Anchor favors warm steadiness, where openness is matched by consistency rather than drama.",
    work: "Sun + Anchor points to lasting success built through disciplined follow-through, not just a bright moment.",
  },
  "32-36": {
    general: "Moon + Cross gives emotional weight to what must be carried, making feeling and responsibility difficult to separate cleanly.",
    love: "Moon + Cross suggests deep feelings need careful containment and care.",
    work: "Moon + Cross can indicate emotional load within public or creative work.",
  },
  "33-36": {
    general: "Key + Cross marks a defining obligation or lesson that can no longer remain vague, postponed, or half-held.",
    love: "Key + Cross indicates a defining relational lesson or commitment decision.",
    work: "Key + Cross points to mission-critical obligations becoming explicit.",
  },
  "4-36": {
    general: "House + Cross marks a base structure carrying fixed obligations, foundational responsibilities, or conditions that cannot simply be ignored.",
    love: "House + Cross may show the relationship carrying family, home, or responsibility weight that must be faced honestly.",
    work: "House + Cross points to structural obligations or base-system responsibilities carrying real consequence.",
  },
  "34-35": {
    general: "Fish + Anchor asks whether the flow can take a durable form, with money steadying only when movement and structure agree.",
    love: "Fish + Anchor asks for practical steadiness around shared resources.",
    work: "Fish + Anchor supports sustainable financial strategy.",
  },
  "34-36": {
    general: "Fish + Cross shows resources, flow, or material support carrying a heavier responsibility that cannot be handled casually.",
    love: "Fish + Cross points to weighty questions about what the bond can truly sustain in practical and emotional terms.",
    work: "Fish + Cross suggests financial decisions with long-term accountability.",
  },
  "35-36": {
    general: "Anchor + Cross asks for endurance with limits, so duty does not harden into burden.",
    love: "Anchor + Cross asks for steady care without self-sacrifice.",
    work: "Anchor + Cross marks duty-heavy phases requiring sustainable pacing.",
  },

  // ── Coffin pairs (card 8 — severely undercovered) ──────────────────────

  "8-29": {
    general: "Coffin + Querent places an ending, release, or necessary closure squarely in your hands — what you let go of now is what makes the next phase possible.",
    love: "Coffin + Querent points to something in the relationship that you personally need to close, grieve, or release before the dynamic can renew.",
    work: "Coffin + Querent marks a professional chapter ending on your side — a role, routine, or approach that has run its course.",
  },
  "8-36": {
    general: "Coffin + Cross carries the heaviest form of closure: an ending that is not optional, where acceptance and dignity matter more than resistance.",
    love: "Coffin + Cross suggests grief, duty, or an emotional ending that cannot be reversed — only processed with care and honesty.",
    work: "Coffin + Cross marks a serious closure tied to responsibility or consequence, where how you handle the ending defines what follows.",
  },
  "8-33": {
    general: "Coffin + Key shows the answer arriving through an ending — something must close before the solution becomes visible.",
    love: "Coffin + Key suggests emotional clarity only becomes available once a pattern, habit, or expectation is genuinely released.",
    work: "Coffin + Key points to a process or role needing retirement before the real opportunity can open.",
  },
  "8-31": {
    general: "Coffin + Sun says the ending leads somewhere warmer — what closes now clears the path for genuine forward momentum.",
    love: "Coffin + Sun suggests the relationship lightens significantly once something outworn is finally released.",
    work: "Coffin + Sun points to renewed energy and visibility arriving after a necessary closure or restructuring.",
  },
  "8-28": {
    general: "Coffin + Counterpart places a significant ending or release in the other person's experience, where their closure reshapes the dynamic for both of you.",
    love: "Coffin + Counterpart points to the other person processing a loss, ending, or letting-go that quietly reshapes the bond.",
    work: "Coffin + Counterpart marks a collaborator or stakeholder exiting, restructuring, or closing something that changes the working relationship.",
  },
  "8-22": {
    general: "Coffin + Crossroads closes one path to force a genuine choice — the decision only becomes real once the old option is truly gone.",
    love: "Coffin + Crossroads marks a moment where an ending forces an honest decision about direction in the relationship.",
    work: "Coffin + Crossroads points to a shutdown or discontinuation that opens a strategic fork requiring clear commitment.",
  },
  "8-21": {
    general: "Coffin + Mountain doubles down on stalled energy: something is both blocked and ending, and patience is the only honest response.",
    love: "Coffin + Mountain suggests emotional distance combined with closure — healing here requires accepting slow, difficult terrain.",
    work: "Coffin + Mountain marks a stalled project or role reaching its natural end, where forcing it forward only wastes resources.",
  },
  "8-24": {
    general: "Coffin + Heart asks whether what ends is the feeling itself or only its current form — not all closure means the care was wasted.",
    love: "Coffin + Heart suggests a bond is grieving or transforming, where the love may outlast the structure that held it.",
    work: "Coffin + Heart points to values or motivation needing renewal after something meaningful runs its course.",
  },
  "8-25": {
    general: "Coffin + Ring terminates an agreement or cycle — terms expire, a loop breaks, or a commitment reaches its natural conclusion.",
    love: "Coffin + Ring directly questions whether a commitment can continue on current terms, or whether the bond needs fundamental renegotiation.",
    work: "Coffin + Ring marks contract endings, partnership closures, or recurring obligations reaching a stopping point.",
  },
  "8-14": {
    general: "Coffin + Fox suggests the ending was strategic or that something is being quietly retired rather than openly closed.",
    love: "Coffin + Fox can indicate someone withdrawing tactically rather than honestly, where the real reason for distance has not been stated.",
    work: "Coffin + Fox points to a calculated exit, role elimination, or quiet restructuring where the rationale is not fully visible.",
  },
  "8-7": {
    general: "Coffin + Snake marks the end of a complicated dynamic — closure that is layered, difficult, and possibly overdue.",
    love: "Coffin + Snake suggests a complex, entangled situation is finally reaching its conclusion, where the relief and the loss coexist.",
    work: "Coffin + Snake points to a political or strategic situation winding down, where the conclusion simplifies what was unnecessarily convoluted.",
  },
  "8-23": {
    general: "Coffin + Mice shows an ending driven by attrition — not a dramatic closure but a slow drain that finally empties the tank.",
    love: "Coffin + Mice suggests a bond that has been quietly worn down by small unaddressed tensions until there is nothing left to sustain.",
    work: "Coffin + Mice marks a process or role collapsing under accumulated stress rather than failing in one dramatic event.",
  },
  "8-17": {
    general: "Coffin + Stork brings renewal through ending — what closes creates the exact conditions for something better to begin.",
    love: "Coffin + Stork suggests the relationship can transform if both people allow the old pattern to actually end rather than recycling it.",
    work: "Coffin + Stork points to constructive restructuring, where retirement of the old system enables a genuine upgrade.",
  },

  // ── Snake pairs (card 7 — undercovered) ────────────────────────────────

  "7-36": {
    general: "Snake + Cross entwines complexity with duty, making the obligation harder to carry because the path to fulfilling it is indirect.",
    love: "Snake + Cross suggests the relationship carries a moral or emotional burden made worse by unclear motives or unspoken agendas.",
    work: "Snake + Cross points to institutional obligations complicated by politics, where direct approaches may not be available.",
  },
  "7-33": {
    general: "Snake + Key says the answer exists but the route to it is indirect — clarity requires navigating complexity rather than cutting through it.",
    love: "Snake + Key suggests emotional clarity is available, but only through honest navigation of desire, motive, and what has been left unsaid.",
    work: "Snake + Key points to a strategic unlock that requires diplomatic skill rather than brute-force directness.",
  },
  "7-31": {
    general: "Snake + Sun warns that success may attract complications, or that a complicated path is nonetheless leading somewhere genuinely bright.",
    love: "Snake + Sun suggests a complex dynamic that is still moving toward warmth — desire and clarity are learning to coexist.",
    work: "Snake + Sun points to visible success requiring careful navigation of politics, incentives, or strategic complexity.",
  },
  "7-28": {
    general: "Snake + Counterpart places complexity, desire, or mixed motives squarely in the other person's position.",
    love: "Snake + Counterpart suggests the other person is navigating something complicated — desire, mixed feelings, or a situation they have not fully disclosed.",
    work: "Snake + Counterpart marks a stakeholder or counterpart whose approach is strategic, layered, or not entirely transparent.",
  },
  "7-22": {
    general: "Snake + Crossroads brings a strategic fork where the straightforward option may not be the best one.",
    love: "Snake + Crossroads suggests a relationship decision complicated by desire, triangulation, or unspoken alternatives.",
    work: "Snake + Crossroads points to a strategic choice where the options are not as simple as they first appear.",
  },
  "7-21": {
    general: "Snake + Mountain entangles a blockage with complication — the obstacle is not just large but layered, requiring patience and indirect approaches.",
    love: "Snake + Mountain suggests emotional distance worsened by complexity, mixed motives, or a situation that resists direct repair.",
    work: "Snake + Mountain marks a deeply entrenched blocker involving politics, process, or structural complexity.",
  },
  "7-25": {
    general: "Snake + Ring complicates a commitment by introducing competing desires, hidden terms, or motives that have not been fully stated.",
    love: "Snake + Ring suggests the commitment is entangled with desire, jealousy, or conditions that need more honest discussion.",
    work: "Snake + Ring points to agreements with hidden terms, political complexity, or strategic conditions that complicate renewal.",
  },
  "7-24": {
    general: "Snake + Heart puts desire and genuine feeling in the same frame, where distinguishing what you truly want from what merely attracts you becomes the central task.",
    love: "Snake + Heart is the classic tension between desire and love — where wanting and caring may not point in the same direction.",
    work: "Snake + Heart suggests values are being pulled by competing incentives, where authentic motivation needs separating from strategic positioning.",
  },
  "7-15": {
    general: "Snake + Bear blends strategy with resource power, creating conditions where leverage, control, and indirect influence shape outcomes.",
    love: "Snake + Bear suggests a power dynamic complicated by desire or unspoken control patterns within the bond.",
    work: "Snake + Bear marks high-stakes strategic positioning around budgets, authority, or institutional leverage.",
  },

  // ── Bouquet pairs (card 9 — severely undercovered) ─────────────────────

  "9-29": {
    general: "Bouquet + Querent puts grace, appreciation, or a welcome opportunity directly in your hands — receive it without overthinking.",
    love: "Bouquet + Querent suggests you are the one being appreciated, invited, or offered something warm that deserves a genuine response.",
    work: "Bouquet + Querent points to recognition, a compliment, or a social opening landing directly with you.",
  },
  "9-24": {
    general: "Bouquet + Heart doubles the warmth — genuine appreciation meets genuine feeling, creating conditions for generosity and closeness.",
    love: "Bouquet + Heart is one of the warmest pair signals, pointing to sincere affection, gifts of care, and emotional generosity.",
    work: "Bouquet + Heart supports morale, appreciation, and values-led recognition that improves team spirit.",
  },
  "9-28": {
    general: "Bouquet + Counterpart places the gift, charm, or social grace with the other person — they may be offering more than you have noticed.",
    love: "Bouquet + Counterpart suggests the other person is bringing warmth, charm, or a gesture of appreciation that deserves attention.",
    work: "Bouquet + Counterpart points to a collaborator or client offering goodwill, recognition, or a social opening.",
  },
  "9-31": {
    general: "Bouquet + Sun amplifies warmth and visibility — appreciation, generosity, and momentum all support each other.",
    love: "Bouquet + Sun supports joyful, expressive affection where warmth is both felt and shown.",
    work: "Bouquet + Sun favors strong public reception, client satisfaction, and visible appreciation.",
  },
  "9-25": {
    general: "Bouquet + Ring suggests an agreement or commitment sweetened by goodwill, gratitude, or favorable social conditions.",
    love: "Bouquet + Ring points to a commitment that feels welcome, chosen freely, and grounded in mutual appreciation rather than obligation.",
    work: "Bouquet + Ring supports contract renewals, partnerships, or agreements benefiting from strong rapport.",
  },
  "9-14": {
    general: "Bouquet + Fox places a gift or social gesture under scrutiny — is the charm genuine, or does it serve a strategic purpose?",
    love: "Bouquet + Fox asks whether the other person's warmth is sincere or calculated, and whether the flattery is leading somewhere honest.",
    work: "Bouquet + Fox suggests evaluating whether the positive reception is genuine or whether it masks a strategic play.",
  },
  "9-33": {
    general: "Bouquet + Key opens the next phase through appreciation, social grace, or the right gesture at the right moment.",
    love: "Bouquet + Key suggests a kind word, thoughtful gesture, or moment of appreciation can unlock emotional progress.",
    work: "Bouquet + Key points to goodwill, charm, or diplomatic skill being the factor that resolves a stuck situation.",
  },
  "9-8": {
    general: "Bouquet + Coffin offers grace in ending — a closure handled with dignity, gratitude, or the kind of care that honors what was shared.",
    love: "Bouquet + Coffin suggests a parting that carries warmth or appreciation rather than bitterness.",
    work: "Bouquet + Coffin supports graceful exits, warm departures, or transitions handled with diplomatic care.",
  },
  "9-36": {
    general: "Bouquet + Cross lightens a burden through grace, kindness, or the reminder that appreciation and duty can coexist.",
    love: "Bouquet + Cross suggests warmth and care can ease the weight of relational obligation or emotional difficulty.",
    work: "Bouquet + Cross points to gratitude and recognition helping sustain morale through a demanding responsibility.",
  },

  // ── Moon pairs (card 32 — undercovered) ────────────────────────────────

  "29-32": {
    general: "Querent + Moon heightens your emotional sensitivity, intuition, and awareness of how others perceive you.",
    love: "Querent + Moon points to your own emotional depth, mood, and internal rhythm shaping how the relationship feels from the inside.",
    work: "Querent + Moon suggests your reputation, creative instinct, or emotional read on the situation is the factor that matters most.",
  },
  "28-32": {
    general: "Counterpart + Moon highlights the other person's emotional state, mood, or public perception as a shaping force.",
    love: "Counterpart + Moon points to the other person's feelings, sensitivity, or emotional cycles influencing the bond's current tone.",
    work: "Counterpart + Moon marks a stakeholder whose public reputation, emotional response, or creative vision is central.",
  },
  "31-32": {
    general: "Sun + Moon balances outward confidence with inner emotional truth — success needs both momentum and sensitivity to hold.",
    love: "Sun + Moon blends warmth with depth, suggesting the relationship thrives when open energy is matched by emotional attunement.",
    work: "Sun + Moon supports recognition that combines visible achievement with emotional intelligence or creative sensitivity.",
  },
  "24-32": {
    general: "Heart + Moon deepens the emotional register, making feeling more vivid, intuitive, and responsive to mood and timing.",
    love: "Heart + Moon is one of the most emotionally rich pair signals — deep feeling, heightened sensitivity, and love shaped by intuition rather than logic.",
    work: "Heart + Moon suggests morale, creative motivation, and emotional engagement are driving the work more than rational process alone.",
  },
  "32-33": {
    general: "Moon + Key unlocks emotional clarity — a feeling that was vague becomes definite, and the right response becomes obvious.",
    love: "Moon + Key suggests an emotional realisation or moment of clarity that resolves what has been felt but not yet understood.",
    work: "Moon + Key points to a creative or reputational breakthrough where emotional intelligence opens the practical solution.",
  },
  "32-34": {
    general: "Moon + Fish ties emotional sensitivity to resource flow, making mood, perception, and financial reality harder to separate.",
    love: "Moon + Fish suggests emotional generosity, shared resources, and how each person feels about what is given and received.",
    work: "Moon + Fish points to revenue or creative output being shaped by morale, reputation, or public emotional response.",
  },
  "32-25": {
    general: "Moon + Ring places emotional rhythm and cyclical feeling at the heart of a commitment, making mood a factor in how terms are experienced.",
    love: "Moon + Ring suggests the commitment is felt differently at different times — cyclical closeness and distance that needs patient understanding.",
    work: "Moon + Ring points to recurring obligations or agreements affected by reputation, mood, or emotional cycles.",
  },
  "32-35": {
    general: "Moon + Anchor asks whether the emotional tone can sustain — whether feeling is durable enough to ground long-term commitment.",
    love: "Moon + Anchor suggests the relationship benefits from stable emotional rhythm, where steady attunement matters more than dramatic intensity.",
    work: "Moon + Anchor points to sustained reputation, consistent creative output, or emotional resilience as a career anchor.",
  },
  "7-32": {
    general: "Snake + Moon entwines desire and emotion with reputation and perception, making the internal truth harder to separate from how things appear.",
    love: "Snake + Moon suggests deep desire complicated by emotional sensitivity, jealousy, or how the relationship looks from the outside.",
    work: "Snake + Moon points to political dynamics shaped by reputation, creative rivalry, or strategically managed public perception.",
  },

  // ── Clover pairs (card 2 — undercovered) ───────────────────────────────

  "2-33": {
    general: "Clover + Key says the opening is real and the timing is right — a small piece of luck becomes a genuine answer when you act on it.",
    love: "Clover + Key suggests a lighthearted moment or lucky break can unlock a deeper emotional truth if met with sincerity.",
    work: "Clover + Key points to a fortunate discovery or well-timed opportunity that solves a problem more easily than expected.",
  },
  "2-22": {
    general: "Clover + Crossroads places a lucky opening at a decision point — the window is brief, so the choice needs to be made while conditions favour it.",
    love: "Clover + Crossroads suggests a light, fortunate moment at a relational fork where the easy path may also be the right one.",
    work: "Clover + Crossroads points to a low-risk opportunity at a strategic decision point — act quickly and the timing works in your favour.",
  },
  "2-24": {
    general: "Clover + Heart softens the field with lucky warmth — a small opening in affection, timing, or goodwill that rewards honest feeling.",
    love: "Clover + Heart supports lighthearted, joyful connection where a bit of luck warms what has been cautious.",
    work: "Clover + Heart suggests morale and motivation benefit from a fortunate turn or moment of genuine appreciation.",
  },
  "1-2": {
    general: "Rider + Clover delivers good news quickly — a message, arrival, or update that carries lucky timing.",
    love: "Rider + Clover suggests a pleasant surprise, invitation, or emotionally uplifting message arriving at a fortunate moment.",
    work: "Rider + Clover points to fast-arriving good news, a helpful update, or an opportunity with lucky timing.",
  },
  "2-36": {
    general: "Clover + Cross says the burden may be lighter than it appears — a small grace or fortunate detail eases what feels heavy.",
    love: "Clover + Cross suggests even a difficult relational obligation can be softened by a moment of lightness or unexpected ease.",
    work: "Clover + Cross points to a small lucky break within a demanding responsibility, where the opening is real even if the context is heavy.",
  },
  "2-14": {
    general: "Clover + Fox places luck under careful scrutiny — the opportunity is real, but discernment about timing and terms still matters.",
    love: "Clover + Fox asks whether a fortunate opening in the relationship is being received honestly or handled too cautiously.",
    work: "Clover + Fox supports smart opportunism — a small window that rewards tactical awareness more than passive hope.",
  },

  // ── Lily pairs (card 30 — undercovered) ────────────────────────────────

  "24-30": {
    general: "Heart + Lily brings maturity to feeling, where patient, principled care holds more weight than urgent emotion.",
    love: "Heart + Lily suggests a bond deepening through patience, respect, and love expressed through composure rather than intensity.",
    work: "Heart + Lily supports values-led leadership and mature, steady motivation that does not depend on constant stimulation.",
  },
  "29-30": {
    general: "Querent + Lily places maturity, composure, and principled restraint at the center of your own position.",
    love: "Querent + Lily suggests your own patience and emotional maturity are the qualities the relationship most needs from you right now.",
    work: "Querent + Lily points to professional integrity, steady judgment, and composed leadership being your strongest asset.",
  },
  "25-30": {
    general: "Ring + Lily places maturity at the heart of commitment — the bond endures because it has been tended with patience and principled care.",
    love: "Ring + Lily suggests the commitment benefits from patient, unhurried devotion rather than passionate urgency.",
    work: "Ring + Lily supports long-term agreements maintained through steady, ethical practice and professional integrity.",
  },
  "30-33": {
    general: "Lily + Key brings clarity through patience — the answer arrives not through force but through composed, principled waiting.",
    love: "Lily + Key suggests emotional clarity comes when both people slow down enough to let genuine understanding surface.",
    work: "Lily + Key points to experienced judgment or mature review being the factor that unlocks the right answer.",
  },
  "30-36": {
    general: "Lily + Cross combines maturity with duty, asking for dignity under pressure and principled endurance through what must be carried.",
    love: "Lily + Cross suggests heavy relational obligation needs the steady temperament and ethical care that only maturity can bring.",
    work: "Lily + Cross marks serious professional responsibility that requires composed, principled handling rather than reactive urgency.",
  },
  "30-35": {
    general: "Lily + Anchor pairs composure with staying power, where maturity and patience become the foundation for what endures.",
    love: "Lily + Anchor supports a calm, deeply stable bond that grows through steady presence rather than dramatic demonstration.",
    work: "Lily + Anchor favors careers built on expertise, integrity, and sustained quiet competence.",
  },
  "21-30": {
    general: "Mountain + Lily meets an obstacle with composure, where patience and principled endurance are the only tools that work.",
    love: "Mountain + Lily suggests emotional distance is best met with calm persistence and the maturity to wait without withdrawing.",
    work: "Mountain + Lily points to long-term blockers that yield only to patient, composed, and methodical effort.",
  },

  // ── Rider pairs (card 1 — undercovered) ────────────────────────────────

  "1-3": {
    general: "Rider + Ship doubles the movement energy — news from abroad, travel plans arriving, or momentum that covers real distance.",
    love: "Rider + Ship suggests a message or arrival connected to distance, travel, or someone coming from further away than expected.",
    work: "Rider + Ship points to communications around expansion, international contacts, or opportunities involving movement and distance.",
  },
  "1-8": {
    general: "Rider + Coffin delivers news of an ending — information that closes one chapter and forces the question of what follows.",
    love: "Rider + Coffin suggests a message or arrival that brings closure, a difficult goodbye, or the final word on something unresolved.",
    work: "Rider + Coffin points to incoming news about project closures, role changes, or decisions that terminate a current direction.",
  },
  "1-24": {
    general: "Rider + Heart delivers emotional news — a message, arrival, or development that carries genuine feeling with it.",
    love: "Rider + Heart is a strong signal for incoming emotional communication: a confession, a return, or news that changes the heart of the situation.",
    work: "Rider + Heart suggests incoming information about values, morale, or something that matters on a personal level.",
  },
  "1-31": {
    general: "Rider + Sun delivers positive news with momentum — a message, update, or arrival that brightens the outlook and builds confidence.",
    love: "Rider + Sun suggests a warm, positive communication or arrival that lifts the emotional tone and opens the path forward.",
    work: "Rider + Sun points to encouraging updates, positive results, or incoming opportunities with genuine momentum.",
  },
  "1-33": {
    general: "Rider + Key delivers the answer — a message, arrival, or piece of news that resolves uncertainty and opens the next phase.",
    love: "Rider + Key suggests an incoming message or conversation that provides the emotional clarity both people have been waiting for.",
    work: "Rider + Key marks decisive incoming information that unlocks progress on a stuck process or pending decision.",
  },
  "1-14": {
    general: "Rider + Fox delivers news that requires careful verification — the information is real, but the full picture may need closer scrutiny.",
    love: "Rider + Fox suggests an incoming message or approach where the tone seems right but the underlying motive needs checking.",
    work: "Rider + Fox points to incoming information that rewards careful evaluation before acting — the news is useful but may be incomplete.",
  },

  // ── Stars pairs (card 16 — undercovered) ───────────────────────────────

  "16-29": {
    general: "Stars + Querent puts clear direction and long-range guidance directly in your own hands — your vision is the compass now.",
    love: "Stars + Querent suggests your own clarity about what you want from the relationship is the factor that sets the direction.",
    work: "Stars + Querent points to strategic vision and personal clarity becoming the asset that guides the next phase.",
  },
  "16-33": {
    general: "Stars + Key combines guidance with certainty — the direction is clear and the answer is available, so what remains is execution.",
    love: "Stars + Key suggests a clarifying realisation about the relationship's direction that feels both true and actionable.",
    work: "Stars + Key points to strategic clarity meeting a practical unlock, where vision and solution align at the same moment.",
  },
  "16-36": {
    general: "Stars + Cross brings purpose to burden — the obligation carries meaning because it serves a direction you genuinely believe in.",
    love: "Stars + Cross suggests the relationship's difficulties make sense when seen through the lens of longer-term purpose and shared values.",
    work: "Stars + Cross points to demanding work that remains worthwhile because it serves a clear strategic vision.",
  },
  "16-22": {
    general: "Stars + Crossroads places strategic clarity at a decision point — the direction you choose now has long-range consequences.",
    love: "Stars + Crossroads asks which relationship path aligns with your deeper values and long-term emotional direction.",
    work: "Stars + Crossroads marks a strategic fork where clear vision guides the choice between competing options.",
  },
  "16-21": {
    general: "Stars + Mountain keeps the vision intact despite an obstacle — the direction is right even if progress is temporarily blocked.",
    love: "Stars + Mountain suggests the relationship has clear potential but current distance or difficulty requires patient trust in the longer arc.",
    work: "Stars + Mountain points to a sound strategy facing a structural blocker, where the delay is real but the direction remains correct.",
  },
  "16-34": {
    general: "Stars + Fish aligns strategic direction with financial flow, making clarity about goals the thing that improves resource decisions.",
    love: "Stars + Fish suggests the relationship benefits when emotional direction and practical generosity point the same way.",
    work: "Stars + Fish supports strategic financial planning, where clear direction improves revenue alignment or resource allocation.",
  },

  // ── Bear pairs (card 15 — undercovered) ────────────────────────────────

  "15-29": {
    general: "Bear + Querent places resource power, protection, or authority directly in your position — your own strength is the factor that shapes what happens.",
    love: "Bear + Querent suggests your own capacity to protect, provide, or set terms is central to the relationship dynamic right now.",
    work: "Bear + Querent marks your own authority, budget control, or protective stance as the asset the situation most depends on.",
  },
  "15-31": {
    general: "Bear + Sun puts power in the light — strength, resources, and authority are visible and growing, which builds confidence if managed well.",
    love: "Bear + Sun supports a warm, generous, and secure bond where both people feel resourced enough to be open.",
    work: "Bear + Sun points to strong financial or leadership momentum that benefits from visible confidence and generous authority.",
  },
  "15-36": {
    general: "Bear + Cross puts serious obligation on whoever holds the resources — authority carries weight, and power here demands responsible stewardship.",
    love: "Bear + Cross suggests protective care is becoming a burden, where the person providing security also needs support.",
    work: "Bear + Cross marks heavy financial or leadership responsibility with real consequences for how it is carried.",
  },
  "15-21": {
    general: "Bear + Mountain brings resource power to face a major obstacle — the blocker is real, but so is the strength available to handle it.",
    love: "Bear + Mountain suggests a protective or powerful dynamic meeting emotional distance, where patience and steady support matter more than force.",
    work: "Bear + Mountain points to financial or leadership resources being applied to a structural blocker that requires sustained effort.",
  },
  "15-33": {
    general: "Bear + Key unlocks resource power — a financial decision, authority move, or protective action becomes the thing that resolves the situation.",
    love: "Bear + Key suggests security and emotional strength become the factors that unlock the relationship's next phase.",
    work: "Bear + Key marks a financial or leadership decision that definitively resolves a stuck situation.",
  },
  "15-25": {
    general: "Bear + Ring ties resource power to commitment — who controls what, and on what terms, becomes the central concern.",
    love: "Bear + Ring suggests the commitment is shaped by questions of security, protection, and who is providing what.",
    work: "Bear + Ring points to contracts or agreements where financial terms, authority, and leverage define the outcome.",
  },
  "15-28": {
    general: "Bear + Counterpart places resource power or authority with the other person, whose strength or protective stance shapes the dynamic.",
    love: "Bear + Counterpart points to the other person's capacity to protect, provide, or assert control as a central relationship factor.",
    work: "Bear + Counterpart marks a powerful counterpart — a decision-maker, funder, or authority figure whose resources shape the outcome.",
  },

  // ── Fox pairs (card 14 — additional coverage) ──────────────────────────

  "14-29": {
    general: "Fox + Querent places strategic caution, self-interest, or careful discernment directly in your own position — trust your instincts but verify.",
    love: "Fox + Querent asks whether your own caution is protecting you wisely or keeping the relationship at arm's length.",
    work: "Fox + Querent marks your own tactical awareness as the central asset — verify details, protect your value, and move carefully.",
  },
  "14-28": {
    general: "Fox + Counterpart suggests the other person is operating strategically, protectively, or with motives that are not yet fully transparent.",
    love: "Fox + Counterpart raises questions about the other person's sincerity — their approach may be cautious, strategic, or self-protecting.",
    work: "Fox + Counterpart points to a counterpart whose behaviour is tactical, guarded, or serving interests not yet fully disclosed.",
  },
  "14-33": {
    general: "Fox + Key says the answer requires discernment — the solution is available but only to someone paying close enough attention to spot it.",
    love: "Fox + Key suggests emotional clarity arrives through careful observation rather than grand gestures or confrontation.",
    work: "Fox + Key points to a solution that rewards tactical awareness, quality control, or shrewd evaluation of the real situation.",
  },
  "14-36": {
    general: "Fox + Cross places duty under strategic scrutiny — the obligation is real, but how it is carried requires careful navigation.",
    love: "Fox + Cross suggests a relationship obligation that needs discernment about what is genuinely owed versus what is being assumed.",
    work: "Fox + Cross points to serious responsibilities requiring tactical skill and careful boundary-setting around what you actually take on.",
  },
  "14-22": {
    general: "Fox + Crossroads places a strategic decision under careful scrutiny — the right path is the one that survives honest evaluation.",
    love: "Fox + Crossroads asks which direction in the relationship is genuinely safe versus which merely looks comfortable.",
    work: "Fox + Crossroads marks a career or strategic fork where caution and discernment matter more than speed.",
  },

  // ── Whip pairs (card 11 — undercovered) ────────────────────────────────

  "11-25": {
    general: "Whip + Ring ties repetitive tension to a commitment or cycle — the friction is structural and the pattern needs conscious renegotiation.",
    love: "Whip + Ring suggests the relationship is caught in a repeating argument or friction pattern that the current terms cannot resolve.",
    work: "Whip + Ring points to process loops, recurring disputes, or contractual friction that needs a structural fix rather than another retry.",
  },
  "11-24": {
    general: "Whip + Heart places tension or repetitive friction in the emotional core, where care is being tested by recurring conflict.",
    love: "Whip + Heart suggests passionate argument or recurring emotional friction — the caring is real but the pattern of expressing it is causing damage.",
    work: "Whip + Heart points to values being tested by repeating tensions, where motivation is eroded by unresolved friction.",
  },
  "11-36": {
    general: "Whip + Cross intensifies the weight of repetitive obligation — a pattern that is both dutiful and exhausting.",
    love: "Whip + Cross marks a relationship burden that keeps recycling, where the same tension replays under different names.",
    work: "Whip + Cross points to a demanding, repetitive responsibility that needs better boundaries before it becomes unsustainable.",
  },
  "11-33": {
    general: "Whip + Key shows the solution to repeating tension — the friction resolves once the real pattern is named and addressed directly.",
    love: "Whip + Key suggests the recurring argument has a specific emotional root that, once identified, stops the cycle.",
    work: "Whip + Key points to a process or workflow fix that eliminates a frustrating loop once the cause is pinpointed.",
  },
  "11-21": {
    general: "Whip + Mountain doubles the frustration — repetitive effort meeting a wall, where persistence needs redirecting rather than intensifying.",
    love: "Whip + Mountain suggests repeating the same approach to a blocked situation is making things harder, not easier.",
    work: "Whip + Mountain marks a process stuck in a fruitless loop against an immovable constraint — reroute rather than hammer.",
  },

  // ── Child pairs (card 13 — undercovered) ───────────────────────────────

  "13-29": {
    general: "Child + Querent puts a fresh beginning, learning curve, or beginner's perspective in your own hands — start simply and allow yourself to be new at this.",
    love: "Child + Querent suggests approaching the relationship with fresh curiosity rather than inherited assumptions.",
    work: "Child + Querent marks a new role, project, or skill where embracing the learning curve is more productive than pretending expertise.",
  },
  "13-31": {
    general: "Child + Sun blesses a new beginning with warmth and confidence — the fresh start has genuine momentum behind it.",
    love: "Child + Sun supports a joyful new chapter in the relationship, where renewal carries warmth and optimism.",
    work: "Child + Sun points to a promising new initiative, role, or project with strong early momentum.",
  },
  "13-24": {
    general: "Child + Heart begins something from sincere feeling — a tender, genuine start that deserves gentle handling.",
    love: "Child + Heart marks the beginning of genuine affection — new love, a fresh emotional opening, or a tender reconnection.",
    work: "Child + Heart suggests a new initiative or relationship driven by authentic values rather than strategy alone.",
  },
  "13-8": {
    general: "Child + Coffin suggests something new can only emerge once something old is genuinely finished — rebirth requires real ending first.",
    love: "Child + Coffin marks the tender beginning that appears after a genuine ending, where grief and hope share space.",
    work: "Child + Coffin points to a new start made possible by retiring something obsolete — the closure enables the fresh approach.",
  },
  "13-33": {
    general: "Child + Key opens a new path through fresh insight — the answer arrives by looking at the problem with different, newer eyes.",
    love: "Child + Key suggests starting over with honest curiosity can unlock what more experienced approaches could not.",
    work: "Child + Key points to a fresh perspective or new approach that solves what incremental fixes could not.",
  },
  "13-21": {
    general: "Child + Mountain warns that a new beginning faces an early obstacle — the start is genuine but patience is needed before it gains traction.",
    love: "Child + Mountain suggests a new emotional opening meeting resistance, distance, or conditions that require patience before the tenderness can take hold.",
    work: "Child + Mountain marks a new initiative or role facing early structural constraints — start small and build slowly.",
  },

  // ── Crossroads high-signal pairs (card 22) ─────────────────────────────

  "22-36": {
    general: "Crossroads + Cross places a decision under serious moral or practical weight — the choice carries consequence and cannot be made lightly.",
    love: "Crossroads + Cross asks which direction honours what the relationship genuinely needs rather than what feels easiest.",
    work: "Crossroads + Cross marks a strategic decision with serious accountability, where the right choice may also be the harder one.",
  },
  "22-31": {
    general: "Crossroads + Sun places a positive outcome at the end of a deliberate choice — decide clearly and the momentum follows.",
    love: "Crossroads + Sun suggests the relationship brightens significantly once a genuine decision about direction is made.",
    work: "Crossroads + Sun marks a strategic fork where the bolder, more confident option leads to visible success.",
  },
  "22-28": {
    general: "Crossroads + Counterpart places the decision partly in the other person's hands, where their choice or direction shapes what becomes available.",
    love: "Crossroads + Counterpart asks whether both people are choosing the same direction, or whether the fork is between you.",
    work: "Crossroads + Counterpart points to a counterpart or stakeholder whose decision creates the fork you now face.",
  },
  "22-25": {
    general: "Crossroads + Ring asks whether the commitment continues as-is, gets renegotiated, or is released — the decision is about the terms themselves.",
    love: "Crossroads + Ring marks a defining choice about the commitment — stay, renegotiate, or release.",
    work: "Crossroads + Ring points to a contract decision, renewal, or partnership fork requiring explicit terms.",
  },
  "22-24": {
    general: "Crossroads + Heart places feeling at the centre of a decision — the right path is the one that aligns with what genuinely matters to you.",
    love: "Crossroads + Heart asks which direction honours the real feeling rather than the safer or more convenient option.",
    work: "Crossroads + Heart suggests the career or project choice that aligns with values will outperform the purely pragmatic option.",
  },
  "22-23": {
    general: "Crossroads + Mice warns that indecision itself is a form of attrition — the longer you wait at the fork, the more energy drains away.",
    love: "Crossroads + Mice suggests relational uncertainty is wearing both people down, and making the choice may hurt less than continuing to delay.",
    work: "Crossroads + Mice points to a decision delayed so long that the cost of waiting has begun to exceed the risk of choosing.",
  },
  "22-35": {
    general: "Crossroads + Anchor asks which path leads to something you can actually sustain — the right choice is the durable one.",
    love: "Crossroads + Anchor suggests the relationship decision that creates genuine stability is better than the one that merely avoids discomfort.",
    work: "Crossroads + Anchor marks a career or strategic fork where long-term sustainability matters more than short-term appeal.",
  },
  "22-34": {
    general: "Crossroads + Fish places a financial or resource consideration at the centre of a decision — money or flow shapes which path is viable.",
    love: "Crossroads + Fish suggests practical or financial factors are influencing a relational choice more than anyone wants to admit.",
    work: "Crossroads + Fish marks a strategic decision shaped by revenue, budget, or resource-flow considerations.",
  },

  // ── Mountain high-signal pairs (card 21) ───────────────────────────────

  "21-36": {
    general: "Mountain + Cross combines obstacle with obligation — a heavy path that demands endurance, patience, and clear limits on what you carry.",
    love: "Mountain + Cross marks the hardest terrain: emotional distance plus real burden, where the only honest response is slow, steady presence.",
    work: "Mountain + Cross points to a deeply challenging blocker tied to serious responsibility — sustainable pacing is essential.",
  },
  "21-31": {
    general: "Mountain + Sun says the obstacle is real but temporary — conditions will clear if patience holds and the direction remains sound.",
    love: "Mountain + Sun suggests warmth and confidence can outlast emotional distance, provided both people keep showing up.",
    work: "Mountain + Sun points to a structural delay that will resolve — the fundamentals are strong and visibility improves once the blockage clears.",
  },
  "21-28": {
    general: "Mountain + Counterpart places an obstacle between you and the other person — distance, reserve, or a structural barrier shaping the dynamic.",
    love: "Mountain + Counterpart suggests the other person is behind a wall of distance, reserve, or circumstance that patience alone must handle.",
    work: "Mountain + Counterpart marks a stakeholder or counterpart blocked by process, distance, or structural constraints.",
  },
  "21-22": {
    general: "Mountain + Crossroads forces a choice at the foot of an obstacle — push through, go around, or accept the delay and reroute entirely.",
    love: "Mountain + Crossroads asks whether the emotional blockage calls for patience, a new approach, or honest acknowledgment that the path needs changing.",
    work: "Mountain + Crossroads marks a strategic fork forced by a blocker — pivot, persist, or find a new route.",
  },
  "21-25": {
    general: "Mountain + Ring tests a commitment with difficulty — the obstacle puts the bond under pressure and reveals whether the terms can endure.",
    love: "Mountain + Ring suggests the commitment is being tested by distance, difficulty, or conditions that make staying harder than expected.",
    work: "Mountain + Ring marks agreements or contracts under strain from structural obstacles or delays that test durability.",
  },
  "21-34": {
    general: "Mountain + Fish blocks the flow — resources, money, or material support are delayed or obstructed by structural constraints.",
    love: "Mountain + Fish suggests practical or financial strain is creating emotional distance in the relationship.",
    work: "Mountain + Fish points to cash flow obstacles, budget freezes, or financial resources blocked by structural or procedural delays.",
  },
  "21-35": {
    general: "Mountain + Anchor asks whether what holds firm is genuine stability or just stubbornness in the face of a real obstacle.",
    love: "Mountain + Anchor suggests the relationship's steadiness is being tested by an obstacle that demands genuine resilience rather than rigid repetition.",
    work: "Mountain + Anchor marks a career or project anchor under pressure from an immovable constraint — adapt the foundation rather than abandoning it.",
  },

  // ── Counterpart + Sun/Fish/Anchor/Ring ─────────────────────────────────

  "28-31": {
    general: "Counterpart + Sun places the other person in a positive, visible, or confident position — their momentum is part of the current picture.",
    love: "Counterpart + Sun suggests the other person is bringing warmth, openness, or positive energy that lifts the dynamic.",
    work: "Counterpart + Sun points to a collaborator or stakeholder with strong momentum, confidence, or public visibility.",
  },
  "28-35": {
    general: "Counterpart + Anchor steadies the relationship through the other person's consistency — their reliability is a stabilising factor.",
    love: "Counterpart + Anchor suggests the other person's steadiness and follow-through are the qualities holding the bond together.",
    work: "Counterpart + Anchor marks a dependable collaborator whose consistency anchors the working relationship.",
  },
  "28-34": {
    general: "Counterpart + Fish places resource flow, financial considerations, or material support squarely with the other person.",
    love: "Counterpart + Fish suggests the other person's practical capacity — financial, supportive, or material — is a significant factor in the dynamic.",
    work: "Counterpart + Fish marks a counterpart whose financial resources, commercial position, or material contribution shapes the outcome.",
  },
  "28-25": {
    general: "Counterpart + Ring places an agreement, commitment, or mutual obligation at the centre of the dynamic with the other person.",
    love: "Counterpart + Ring asks whether the other person can genuinely meet the commitment on clear, mutual, sustainable terms.",
    work: "Counterpart + Ring points to a partnership agreement or contract where the counterpart's terms and commitment matter directly.",
  },

  // ── Mice additional pairs ──────────────────────────────────────────────

  "23-36": {
    general: "Mice + Cross shows attrition wearing down what must be carried — a duty or burden being eroded by small, repeated stress.",
    love: "Mice + Cross suggests the relationship's sense of duty or obligation is being undermined by chronic low-level strain.",
    work: "Mice + Cross marks a critical responsibility being slowly weakened by persistent operational stress.",
  },
  "23-33": {
    general: "Mice + Key shows the answer to the drain — once the source of attrition is identified and named, the erosion can stop.",
    love: "Mice + Key suggests the quiet tension eroding the relationship has a specific, identifiable cause that can be addressed.",
    work: "Mice + Key points to a diagnostic fix for an operational leak — identify the drain and the solution becomes obvious.",
  },
  "23-31": {
    general: "Mice + Sun warns that even positive momentum can be undermined by small persistent drains that nobody addresses.",
    love: "Mice + Sun suggests warmth and connection are present but being quietly worn down by worries, doubts, or small unresolved tensions.",
    work: "Mice + Sun points to strong performance being subtly eroded by operational friction or unattended stress.",
  },
  "23-28": {
    general: "Mice + Counterpart places attrition, stress, or quiet depletion with the other person — their own strain is affecting the wider dynamic.",
    love: "Mice + Counterpart suggests the other person is carrying worry, doubt, or small accumulated stress that is leaking into the bond.",
    work: "Mice + Counterpart marks a collaborator or stakeholder under quiet operational strain that is affecting their contribution.",
  },
  "23-25": {
    general: "Mice + Ring shows a commitment being worn down by small repeated failures to meet its terms — attrition eats loyalty.",
    love: "Mice + Ring suggests the relationship's agreements or expectations are being quietly eroded by small, unaddressed letdowns.",
    work: "Mice + Ring points to contractual or process commitments degrading through accumulated neglect or underfunding.",
  },

  // ── Key + Anchor, Sun + Cross/Fish/Ring/Anchor ────────────────────────

  "33-35": {
    general: "Key + Anchor unlocks something durable — the solution creates lasting stability rather than a temporary fix.",
    love: "Key + Anchor suggests the clarifying answer also creates the foundation for genuine long-term steadiness in the bond.",
    work: "Key + Anchor marks a solution that resolves the immediate problem and strengthens the long-term structure.",
  },
  "31-36": {
    general: "Sun + Cross brings clarity to burden — the difficulty does not disappear, but understanding its purpose makes it easier to carry.",
    love: "Sun + Cross suggests warmth and honest presence can transform a relational obligation from oppressive duty into meaningful commitment.",
    work: "Sun + Cross points to demanding responsibility that becomes more sustainable when met with confidence and visible purpose.",
  },
  "31-34": {
    general: "Sun + Fish brightens the resource picture — financial flow, confidence, and momentum all reinforce each other.",
    love: "Sun + Fish supports generous, warm exchange where emotional openness and practical giving feed each other naturally.",
    work: "Sun + Fish points to strong financial momentum, where visibility and commercial confidence are both high.",
  },
  "25-31": {
    general: "Ring + Sun illuminates a commitment — the agreement gains clarity, warmth, and forward momentum when both sides engage openly.",
    love: "Ring + Sun supports a commitment entering its brightest phase, where both people feel confident about what they are building together.",
    work: "Ring + Sun points to a contract or agreement gaining positive momentum, where terms are clear and prospects are strong.",
  },
  "25-36": {
    general: "Ring + Cross ties commitment to serious obligation — the bond carries weight, and the terms must be sustainable or they will become a burden.",
    love: "Ring + Cross suggests the commitment carries genuine responsibility, where the promise needs to be honoured with realistic boundaries.",
    work: "Ring + Cross marks binding obligations with real accountability — contracts, duties, or agreements that carry serious consequence.",
  },
  "24-36": {
    general: "Heart + Cross is one of the heaviest emotional combinations — genuine care meeting real burden, where love and duty become inseparable.",
    love: "Heart + Cross suggests loving someone through difficulty, where devotion is being tested by the weight of what must be endured together.",
    work: "Heart + Cross points to values-driven work carrying a heavy personal cost, where motivation needs clearer limits to remain sustainable.",
  },

  // ── Ship additional pairs ──────────────────────────────────────────────

  "3-29": {
    general: "Ship + Querent places movement, exploration, or distance directly in your own experience — you are the one in motion.",
    love: "Ship + Querent suggests your own need for direction, exploration, or emotional distance is the factor shaping the bond right now.",
    work: "Ship + Querent marks personal expansion, travel, or a career move that depends entirely on your own willingness to go.",
  },
  "3-21": {
    general: "Ship + Mountain slows a journey or expansion with a structural obstacle — the direction is right but the path is harder than expected.",
    love: "Ship + Mountain suggests emotional movement meeting resistance or distance that makes the journey longer and less straightforward.",
    work: "Ship + Mountain marks expansion plans or logistics delayed by a structural barrier that requires patient navigation.",
  },
  "3-33": {
    general: "Ship + Key finds the answer through movement, distance, or a broader perspective — the solution comes from looking further afield.",
    love: "Ship + Key suggests emotional clarity arriving through distance, travel, or a widened perspective on the relationship.",
    work: "Ship + Key points to an expansion, market shift, or broader approach that unlocks a stuck situation.",
  },
  "3-36": {
    general: "Ship + Cross carries a burden across distance — duty that travels, obligation that follows, or responsibility that movement alone cannot resolve.",
    love: "Ship + Cross suggests distance or movement is tied to a relational obligation that remains present regardless of geography.",
    work: "Ship + Cross marks expansion or travel carrying serious responsibility or accountability that cannot be left behind.",
  },

  // ── House additional pairs ─────────────────────────────────────────────

  "4-29": {
    general: "House + Querent brings stability, structure, and foundation directly to your own position — your base is the thing that needs attention.",
    love: "House + Querent suggests your own sense of security, home, and emotional grounding is the central concern right now.",
    work: "House + Querent points to your own operational base, systems, or fundamental routines as the area that shapes everything else.",
  },
  "4-31": {
    general: "House + Sun warms the foundation — stability becomes more visible, comfortable, and productive when confidence and openness enter the base.",
    love: "House + Sun supports a warm, open home dynamic where security and joy reinforce each other.",
    work: "House + Sun points to strong operational fundamentals and a productive, positive base environment.",
  },
  "4-33": {
    general: "House + Key unlocks something structural — the answer is in the foundations, systems, or core habits rather than in anything external.",
    love: "House + Key suggests the relationship's next step forward is in the domestic, habitual, or foundational layer rather than in grand gestures.",
    work: "House + Key marks a structural or systems-level fix that resolves the issue at its root.",
  },
  "4-25": {
    general: "House + Ring formalises the structure — domestic agreements, living arrangements, or foundational terms become binding.",
    love: "House + Ring points to cohabitation decisions, household agreements, or commitment expressed through shared domestic life.",
    work: "House + Ring marks agreements about infrastructure, leases, operational bases, or recurring structural obligations.",
  },
  "4-21": {
    general: "House + Mountain places an obstacle at the foundation — something structural needs repair, patience, or reworking before progress can resume.",
    love: "House + Mountain suggests domestic or foundational difficulty creating emotional distance, where home life needs patient rebuilding.",
    work: "House + Mountain marks infrastructure, systems, or base operations blocked by a structural constraint that demands slow, careful resolution.",
  },

  // ── Scythe additional pairs ────────────────────────────────────────────

  "10-31": {
    general: "Scythe + Sun cuts through to clarity — a decisive action that improves the outlook immediately and opens visible momentum.",
    love: "Scythe + Sun suggests a clean decision or honest conversation that lifts the emotional atmosphere and lets warmth return.",
    work: "Scythe + Sun points to a sharp prioritisation move that clears the path for confident, visible progress.",
  },
  "10-21": {
    general: "Scythe + Mountain meets an obstacle with a sharp tool — the blockage may yield to a clean cut rather than patient erosion.",
    love: "Scythe + Mountain suggests a direct boundary or decisive conversation is the fastest way through emotional distance that patience alone cannot fix.",
    work: "Scythe + Mountain points to a structural blocker that responds to a decisive intervention rather than slow workaround.",
  },
  "10-33": {
    general: "Scythe + Key shows the answer arriving through a clean, decisive cut — the solution is surgical, not gradual.",
    love: "Scythe + Key suggests one clear conversation, boundary, or decision is the thing that unlocks emotional progress.",
    work: "Scythe + Key marks a sharp operational decision that resolves a stuck situation definitively.",
  },
  "10-28": {
    general: "Scythe + Counterpart places a sharp decision, boundary, or sudden change with the other person.",
    love: "Scythe + Counterpart suggests the other person is making a decisive move, setting a boundary, or cutting something that affects the bond.",
    work: "Scythe + Counterpart marks a counterpart or stakeholder making a rapid, potentially disruptive decision.",
  },

  // ── Stork additional pairs ─────────────────────────────────────────────

  "17-31": {
    general: "Stork + Sun brings positive change with visible momentum — an improvement that is both real and felt immediately.",
    love: "Stork + Sun supports a warm, constructive shift in the relationship, where change arrives as relief rather than disruption.",
    work: "Stork + Sun marks a visible, energising improvement — a process upgrade, positive transition, or promotion with genuine momentum.",
  },
  "17-33": {
    general: "Stork + Key unlocks change — the right adjustment becomes clear and the improvement is available as soon as the shift is made.",
    love: "Stork + Key suggests a clarifying change in approach or dynamics that opens the relationship to something better.",
    work: "Stork + Key points to a process or structural improvement that resolves a stuck situation through smart adaptation.",
  },
  "17-36": {
    general: "Stork + Cross marks change that carries weight — the improvement requires sacrifice, and the transition itself is the difficult part.",
    love: "Stork + Cross suggests relationship change that is necessary but heavy, where the transition demands endurance and care.",
    work: "Stork + Cross points to a restructuring or transition carrying serious responsibility through the changeover period.",
  },
  "17-25": {
    general: "Stork + Ring renews a commitment — the bond or agreement evolves, updates, or enters a new phase rather than staying static.",
    love: "Stork + Ring supports recommitment, renewal, or a relationship entering a healthier phase through deliberate evolution.",
    work: "Stork + Ring points to contract renewals, partnership updates, or agreements entering improved terms.",
  },

  // ── Birds additional pairs ─────────────────────────────────────────────

  "12-29": {
    general: "Birds + Querent makes your own communication, nervousness, or dialogue style the central factor — how you talk about it matters as much as what you say.",
    love: "Birds + Querent points to your own conversational energy — anxiety, chattiness, or communication style — shaping the bond's current tone.",
    work: "Birds + Querent marks your own communication as the variable that most affects the outcome — clarity, tone, and frequency all count.",
  },
  "12-33": {
    general: "Birds + Key shows the answer arriving through conversation — the right discussion, at the right time, unlocks what has been stuck.",
    love: "Birds + Key suggests one clarifying conversation can resolve the uncertainty, but it needs to happen with honest, grounded wording.",
    work: "Birds + Key points to a meeting, call, or discussion that provides the decisive information needed to move forward.",
  },
  "12-31": {
    general: "Birds + Sun brings positive, confident communication energy — dialogue that builds momentum rather than creating anxiety.",
    love: "Birds + Sun supports warm, open conversation that lifts the emotional atmosphere and builds mutual confidence.",
    work: "Birds + Sun points to energising updates, positive feedback loops, or communication that strengthens team confidence.",
  },
  "12-21": {
    general: "Birds + Mountain stalls communication against an obstacle — messages are delayed, conversations are difficult, or the dialogue cannot reach where it needs to go.",
    love: "Birds + Mountain suggests important conversations being blocked by emotional distance, unavailability, or circumstances beyond either person's control.",
    work: "Birds + Mountain marks communication barriers — delayed responses, procedural blockages, or stakeholders who cannot be reached.",
  },
  "12-36": {
    general: "Birds + Cross places a serious, duty-laden topic at the centre of conversation — what must be discussed is heavy and requires care.",
    love: "Birds + Cross suggests a difficult, necessary conversation about obligation, grief, or relational weight that both people need to face.",
    work: "Birds + Cross points to discussions about serious accountability, heavy obligations, or communications carrying real professional weight.",
  },

  // ── Garden additional pairs ────────────────────────────────────────────

  "20-33": {
    general: "Garden + Key suggests the answer comes through social connection, public visibility, or community engagement rather than private effort alone.",
    love: "Garden + Key points to social context or shared circles providing the clarity or opportunity that private conversation could not.",
    work: "Garden + Key marks a networking breakthrough, public-facing solution, or community connection that unlocks the next step.",
  },
  "20-36": {
    general: "Garden + Cross brings public weight — responsibility in a community, social obligation, or duty performed in a visible setting.",
    love: "Garden + Cross suggests the relationship carries social expectations or obligations that add weight beyond the private bond.",
    work: "Garden + Cross points to public-facing responsibilities, community duties, or reputational weight that demands careful management.",
  },
  "20-21": {
    general: "Garden + Mountain blocks social access — networking is difficult, community engagement is stalled, or public visibility is limited.",
    love: "Garden + Mountain suggests social isolation or difficulty accessing the shared social world that the relationship needs.",
    work: "Garden + Mountain marks networking constraints, limited public access, or community engagement blocked by structural barriers.",
  },
  "20-34": {
    general: "Garden + Fish ties resource flow to public or community dynamics — money moves through networks, and social capital converts to practical value.",
    love: "Garden + Fish suggests shared social spending, generosity within friend groups, or practical resources flowing through communal channels.",
    work: "Garden + Fish points to revenue from public channels, networking-driven business development, or commercially productive community engagement.",
  },

  // ── Tower additional pairs ─────────────────────────────────────────────

  "19-29": {
    general: "Tower + Querent places institutional structure, formal boundaries, or a sense of distance directly in your own position.",
    love: "Tower + Querent suggests your own reserve, boundaries, or need for structure is the factor creating distance in the relationship.",
    work: "Tower + Querent marks your role within institutional hierarchy as the central concern — authority, standards, and professional distance.",
  },
  "19-31": {
    general: "Tower + Sun brings clarity and confidence to institutional or structural matters — the system works when standards meet visible purpose.",
    love: "Tower + Sun suggests the relationship benefits from clearer structure and confident boundary-setting rather than vagueness.",
    work: "Tower + Sun points to institutional success, visible authority, or professional recognition through strong structural foundations.",
  },
  "19-36": {
    general: "Tower + Cross places institutional weight or structural obligation at the centre — the system demands compliance and the duty is inescapable.",
    love: "Tower + Cross marks a relationship shaped by formal or institutional constraints — family obligation, legal structures, or external frameworks.",
    work: "Tower + Cross points to heavy institutional responsibility, structural accountability, or duties embedded in the organisation's framework.",
  },
  "19-21": {
    general: "Tower + Mountain doubles the structural resistance — institutional walls meeting external obstacles, where neither gives way quickly.",
    love: "Tower + Mountain marks significant distance created by both emotional reserve and structural circumstance, requiring patience on multiple fronts.",
    work: "Tower + Mountain points to deeply entrenched institutional or bureaucratic blockages that demand sustained, systematic effort to resolve.",
  },
  "19-34": {
    general: "Tower + Fish channels resources through institutional structure — formal financial systems, budgets, or regulated flow.",
    love: "Tower + Fish suggests financial dynamics shaped by formal arrangements, legal structures, or institutional constraints.",
    work: "Tower + Fish marks institutional financial systems, regulated revenue streams, or budgets governed by formal policy.",
  },
  "19-35": {
    general: "Tower + Anchor combines institutional framework with enduring stability — the structure is built to last if it is maintained.",
    love: "Tower + Anchor suggests the relationship's stability comes through structure, clear roles, and boundaries that both people can rely on.",
    work: "Tower + Anchor marks durable institutional foundations — established structures, long-standing policies, or career anchors within formal frameworks.",
  },

  // ── Tree additional pairs ──────────────────────────────────────────────

  "5-29": {
    general: "Tree + Querent places health, deep growth, and patient development at the centre of your own experience.",
    love: "Tree + Querent suggests your own wellbeing, patience, and capacity for slow growth are the qualities the relationship most needs.",
    work: "Tree + Querent marks personal development, health management, or long-term skill growth as the central professional concern.",
  },
  "5-31": {
    general: "Tree + Sun warms the roots — health improves, growth accelerates, and patient effort begins to show visible results.",
    love: "Tree + Sun supports a relationship entering a growth phase where warmth and steady care produce noticeable improvement.",
    work: "Tree + Sun points to long-term investments beginning to pay off visibly, with health and vitality supporting professional momentum.",
  },
  "5-24": {
    general: "Tree + Heart roots feeling in something deep and lasting — care that grows slowly but holds, drawing on what is genuinely planted rather than performed.",
    love: "Tree + Heart supports enduring affection that deepens through patience, showing up, and the slow compound effect of steady devotion.",
    work: "Tree + Heart suggests values and personal wellbeing are the roots that make sustainable professional growth possible.",
  },
  "5-33": {
    general: "Tree + Key unlocks growth that was stalled — the answer is found in the roots, in the long-term pattern, or in what has been slowly building underneath.",
    love: "Tree + Key suggests patient emotional work finally producing a breakthrough — the healing or growth was happening all along.",
    work: "Tree + Key points to a long-developing skill, system, or knowledge base becoming the key that resolves a current problem.",
  },
  "5-36": {
    general: "Tree + Cross places long-term growth under the weight of obligation — the duty is real, but so is the need for sustained care and recovery.",
    love: "Tree + Cross suggests the relationship requires long-term emotional care under difficult conditions, where endurance and rest must coexist.",
    work: "Tree + Cross marks a career or health burden that demands both long-term patience and clear limits on what you take on.",
  },

  // ── Round 2: GT-adjacent high-signal pairs ─────────────────────────────

  "20-29": {
    general: "Garden + Querent places you in a social or public-facing context — your visibility, network, and community engagement are the active factors.",
    love: "Garden + Querent suggests your social presence, openness to others, and willingness to be seen shape the relationship dynamic.",
    work: "Garden + Querent marks your public profile, networking effort, or community engagement as the asset the situation most depends on.",
  },
  "8-16": {
    general: "Coffin + Stars: an ending creates the conditions for clearer guidance — what was clouding the direction has to close before the signal sharpens.",
    love: "Coffin + Stars suggests letting go of an old emotional pattern clears the way for a truer sense of direction in the relationship.",
    work: "Coffin + Stars points to a closure that improves strategic clarity — retiring something obsolete reveals a better long-term path.",
  },
  "7-16": {
    general: "Snake + Stars brings strategic complexity into dialogue with long-range guidance — the direction is right but the path is indirect.",
    love: "Snake + Stars suggests desire and deeper purpose are negotiating with each other, where clarity emerges only through honest self-examination.",
    work: "Snake + Stars marks a strategic situation where the long-term vision is sound but the route requires careful political navigation.",
  },
  "27-36": {
    general: "Letter + Cross places a document, message, or written statement at the centre of a serious obligation or consequence.",
    love: "Letter + Cross suggests a difficult conversation or message that must be delivered honestly, even though the weight of it is real.",
    work: "Letter + Cross marks correspondence, notices, or documentation carrying serious professional accountability.",
  },
  "26-36": {
    general: "Book + Cross places hidden knowledge or private truth at the centre of a serious obligation — what is not yet known or spoken carries real weight.",
    love: "Book + Cross suggests unspoken emotional truth is making a relational burden heavier than it needs to be.",
    work: "Book + Cross marks confidential information or specialist knowledge tied to a serious professional responsibility.",
  },
  "25-35": {
    general: "Ring + Anchor locks commitment into lasting form — what is agreed on here is meant to hold, and the terms need to reflect that.",
    love: "Ring + Anchor is a strong signal for durable partnership — commitment built to last through consistency and follow-through.",
    work: "Ring + Anchor supports long-term contracts, career commitments, and agreements designed for sustained reliability.",
  },
  "24-34": {
    general: "Heart + Fish connects feeling to flow — emotional generosity and practical resource exchange become part of the same movement.",
    love: "Heart + Fish suggests love expressed through giving, financial sharing, or practical support that reflects genuine emotional care.",
    work: "Heart + Fish points to values-driven work generating financial flow, or motivation improving when the numbers align with what matters.",
  },
  "22-32": {
    general: "Crossroads + Moon places emotional sensitivity, intuition, or reputation at a decision point — what you feel may be as important as what you know.",
    love: "Crossroads + Moon suggests the relationship decision is shaped by deep emotional currents, mood, and what intuition is telling you.",
    work: "Crossroads + Moon marks a creative or reputational fork where emotional intelligence guides the better strategic choice.",
  },
  "16-25": {
    general: "Stars + Ring aligns long-range direction with a durable commitment — the agreement gains purpose when both sides share the same vision.",
    love: "Stars + Ring suggests a commitment grounded in shared hopes and long-term alignment rather than convenience or habit.",
    work: "Stars + Ring supports strategic partnerships, purpose-driven contracts, or agreements that serve a clear long-range goal.",
  },
  "16-24": {
    general: "Stars + Heart aligns values with direction — the path that honours genuine feeling is also the one that serves the longer arc.",
    love: "Stars + Heart is a strong signal for relationship alignment, where shared values and mutual hopes create a clear, emotionally grounded direction.",
    work: "Stars + Heart supports purpose-driven work where long-term vision and personal motivation point the same way.",
  },
  "15-24": {
    general: "Bear + Heart brings strength to feeling — protective care, generous resource power, and values working together.",
    love: "Bear + Heart suggests the relationship benefits from strong, generous care — love backed by the capacity to protect and provide.",
    work: "Bear + Heart points to leadership motivated by genuine values, where authority and care reinforce each other.",
  },
  "15-23": {
    general: "Bear + Mice warns that resource power is being drained by small, persistent losses — strength can erode if leaks are not patched.",
    love: "Bear + Mice suggests the protector in the relationship is being quietly worn down by accumulated small frustrations or imbalances.",
    work: "Bear + Mice marks financial or leadership resources being depleted by persistent low-level operational stress.",
  },
  "15-16": {
    general: "Bear + Stars brings resource power under strategic guidance — strength is most useful when it serves a clear long-range direction.",
    love: "Bear + Stars supports a relationship where security and shared vision reinforce each other, making long-term plans feel genuinely achievable.",
    work: "Bear + Stars marks strong financial or leadership resources aligned with clear strategic direction — power with purpose.",
  },
  "14-24": {
    general: "Fox + Heart places feeling under careful scrutiny — the care may be real, but discernment about how it is being expressed or received still matters.",
    love: "Fox + Heart asks whether caution is protecting the relationship wisely or keeping genuine feeling at arm's length.",
    work: "Fox + Heart suggests evaluating whether values-driven decisions are being made honestly or being shaped by self-interest.",
  },
  "14-23": {
    general: "Fox + Mice combines strategic caution with quiet attrition — discernment is needed to identify where the drain is coming from before it spreads.",
    love: "Fox + Mice suggests small relational tensions are being handled too guardedly, where direct honesty would stop the erosion faster than vigilance.",
    work: "Fox + Mice points to an operational leak that requires tactical diagnosis — identify the source of attrition before it compounds.",
  },
  "12-22": {
    general: "Birds + Crossroads places a decision in the middle of active conversation — the choice is being discussed, debated, or talked through in real time.",
    love: "Birds + Crossroads suggests the relationship direction is being worked out through ongoing dialogue, where the conversations themselves shape the decision.",
    work: "Birds + Crossroads marks a strategic decision being negotiated through meetings, calls, or rapid exchanges that require clear communication.",
  },
  "8-9": {
    general: "Coffin + Bouquet brings grace to an ending — closure handled with appreciation, warmth, or the recognition that what was shared had genuine value.",
    love: "Coffin + Bouquet suggests a parting that carries gratitude rather than bitterness, or a closure softened by genuine appreciation.",
    work: "Coffin + Bouquet supports dignified exits, graceful transitions, or endings that acknowledge contribution before moving on.",
  },
  "7-17": {
    general: "Snake + Stork brings change through a complicated route — the improvement is coming, but the path to it is indirect and requires navigation.",
    love: "Snake + Stork suggests the relationship is evolving through a complex transition, where desire, strategy, and genuine renewal all share the stage.",
    work: "Snake + Stork points to a process improvement requiring political skill, where the upgrade arrives through negotiation rather than decree.",
  },
  "6-7": {
    general: "Clouds + Snake doubles the confusion — ambiguity layered with complexity, where both the situation and the motives are hard to read clearly.",
    love: "Clouds + Snake suggests emotional confusion compounded by mixed motives or unclear desires that make the dynamic harder to trust.",
    work: "Clouds + Snake marks a workplace situation where both the strategy and the information are murky — verify everything twice.",
  },
  "6-16": {
    general: "Clouds + Stars says the guidance is there but partially obscured — the direction is sound, but current conditions make it difficult to see clearly.",
    love: "Clouds + Stars suggests the relationship has genuine long-term potential, but present confusion needs clearing before direction becomes trustworthy.",
    work: "Clouds + Stars points to good strategy being hampered by unclear conditions — the vision is right but visibility needs improving first.",
  },
  "6-15": {
    general: "Clouds + Bear obscures the resource picture — power, money, or authority are present but their true state is harder to assess in current conditions.",
    love: "Clouds + Bear suggests uncertainty about the protective or providing role in the relationship, where strength is present but trust in it wavers.",
    work: "Clouds + Bear marks financial or leadership ambiguity — the resources exist, but the fog makes it hard to know exactly how much is available or secure.",
  },
  "6-14": {
    general: "Clouds + Fox doubles the caution — when both the situation and your own read on it are unclear, patience and verification matter more than speed.",
    love: "Clouds + Fox suggests confusion compounded by guardedness, where neither person is sure enough to be fully honest yet.",
    work: "Clouds + Fox marks a situation requiring extra due diligence — conditions are unclear and the information available may be incomplete.",
  },
  "4-14": {
    general: "House + Fox places strategic caution inside the foundation — something in the base structure, routines, or domestic setup needs closer inspection.",
    love: "House + Fox suggests the household or foundational dynamic needs honest examination, where comfortable habits may be masking a real issue.",
    work: "House + Fox points to operational foundations needing quality review — systems, processes, or base routines that look stable but deserve scrutiny.",
  },
  "27-35": {
    general: "Letter + Anchor ties written communication to lasting structure — a document, agreement, or message that has enduring effect.",
    love: "Letter + Anchor suggests a message or conversation that creates genuine lasting stability in the relationship.",
    work: "Letter + Anchor marks documentation with long-term impact — permanent records, foundational contracts, or communications that create enduring terms.",
  },
  "26-35": {
    general: "Book + Anchor grounds hidden knowledge or specialist study in something durable — what you learn here stays useful for a long time.",
    love: "Book + Anchor suggests deeper understanding of the relationship's private truth creates the foundation for lasting stability.",
    work: "Book + Anchor marks specialist expertise or confidential knowledge becoming a long-term career anchor.",
  },
  "26-34": {
    general: "Book + Fish ties resource flow to hidden information — the money picture becomes clearer once private knowledge or undisclosed details surface.",
    love: "Book + Fish suggests undisclosed financial details or private resource dynamics are quietly shaping the relationship.",
    work: "Book + Fish marks confidential financial data, hidden revenue streams, or specialist knowledge that unlocks commercial insight.",
  },
  "23-32": {
    general: "Mice + Moon shows emotional sensitivity or reputation being quietly worn down by persistent small stressors.",
    love: "Mice + Moon suggests the emotional atmosphere in the relationship is being eroded by accumulated worry, doubt, or unprocessed feeling.",
    work: "Mice + Moon marks reputation, morale, or creative energy being undermined by chronic low-level stress.",
  },
  "22-30": {
    general: "Crossroads + Lily brings mature judgment to a decision — the choice benefits from patience, composure, and principled thinking rather than reactive speed.",
    love: "Crossroads + Lily suggests the relationship decision calls for wisdom and emotional maturity rather than impulsive action.",
    work: "Crossroads + Lily supports strategic choices guided by experience, professional integrity, and measured judgment.",
  },
  "2-10": {
    general: "Clover + Scythe places luck beside a sharp decision — a fortunate moment that requires quick, clean action before the window closes.",
    love: "Clover + Scythe suggests a lighthearted opening that needs a clear choice to be made quickly before the moment passes.",
    work: "Clover + Scythe marks a lucky break that rewards decisive action — hesitation may cost the advantage.",
  },
  "16-26": {
    general: "Stars + Book combines strategic guidance with hidden knowledge — the direction becomes clearer once something currently private is understood or revealed.",
    love: "Stars + Book suggests the relationship's true direction becomes visible only after something private, studied, or withheld comes to light.",
    work: "Stars + Book marks strategic insight arriving through research, specialist knowledge, or information not yet widely known.",
  },
  "16-17": {
    general: "Stars + Stork aligns constructive change with clear direction — the improvement serves the longer arc and the timing supports it.",
    love: "Stars + Stork supports a relationship upgrade guided by shared vision, where the change feels purposeful rather than reactive.",
    work: "Stars + Stork marks strategic improvements, well-timed transitions, or process upgrades aligned with long-range goals.",
  },
  "13-22": {
    general: "Child + Crossroads places a decision at the beginning of something new — the choice about direction shapes the fresh start before it takes form.",
    love: "Child + Crossroads suggests a new emotional opening that immediately presents a choice about which path to take.",
    work: "Child + Crossroads marks an early-stage project or role facing a directional choice that will define its trajectory.",
  },
  "10-20": {
    general: "Scythe + Garden brings a sharp decision or sudden change into the public arena — the cut is visible and the response is communal.",
    love: "Scythe + Garden suggests a decisive boundary or clear-cut conversation that affects the social circle around the relationship.",
    work: "Scythe + Garden marks a high-visibility decision, public restructuring, or sharp move that the wider network notices immediately.",
  },
  "10-19": {
    general: "Scythe + Tower cuts through institutional structure — a decisive move within a formal system, where boundaries and rules are reshaped quickly.",
    love: "Scythe + Tower suggests a relationship boundary being set firmly through structure, legal action, or institutional channels.",
    work: "Scythe + Tower marks organisational restructuring, role elimination, or a clean institutional cut that changes the hierarchy.",
  },
  "10-11": {
    general: "Scythe + Whip doubles the sharpness — cutting friction that repeats, or decisive action taken against a pattern that keeps recycling.",
    love: "Scythe + Whip suggests a repeating argument or tension pattern that finally meets a decisive boundary or clean break.",
    work: "Scythe + Whip marks a process loop being forcefully interrupted — the cycle ends because a sharp decision overrides the pattern.",
  },
  "1-11": {
    general: "Rider + Whip delivers news that brings tension, or incoming information that triggers a repeating cycle of response.",
    love: "Rider + Whip suggests an incoming message or contact that reactivates a familiar pattern of friction or emotional intensity.",
    work: "Rider + Whip points to urgent communications arriving under pressure, where the update itself creates a cycle of reactive work.",
  },
  "29-34": {
    general: "Querent + Fish places resource flow, money, or material capacity directly in your own hands — your financial position shapes what is possible.",
    love: "Querent + Fish suggests your own practical generosity, financial situation, or material capacity is a significant factor in the relationship.",
    work: "Querent + Fish marks your own financial or commercial position as the variable that shapes the next step.",
  },
  "9-17": {
    general: "Bouquet + Stork brings positive change through grace, charm, or social warmth — the improvement arrives as a welcome gift.",
    love: "Bouquet + Stork supports a relationship evolving through genuine warmth, appreciation, and caring gestures that invite renewal.",
    work: "Bouquet + Stork marks improvements welcomed by the team or community, where the upgrade is received with genuine appreciation.",
  },
  "8-18": {
    general: "Coffin + Dog places an ending close to a loyal ally — a trusted relationship or reliable support reaching its natural conclusion.",
    love: "Coffin + Dog suggests a friendship or supportive dynamic coming to an end, or loyalty being tested by a necessary closure.",
    work: "Coffin + Dog marks the departure of a trusted colleague or the end of a dependable working arrangement.",
  },
  "5-15": {
    general: "Tree + Bear roots resource power in something lasting — strength built through sustained growth, patient accumulation, and deep foundations.",
    love: "Tree + Bear suggests the relationship's security deepens through slow, steady care and the quiet accumulation of trust over time.",
    work: "Tree + Bear marks career strength built through long-term skill growth, where patience and consistency create durable resource power.",
  },
  "5-14": {
    general: "Tree + Fox places careful scrutiny on the growth process — patience is important, but so is verifying that what is growing is genuinely healthy.",
    love: "Tree + Fox suggests the slow emotional growth in the relationship needs honest evaluation, not just patient waiting.",
    work: "Tree + Fox points to long-term development requiring periodic quality checks to ensure the growth is heading in the right direction.",
  },
  "4-12": {
    general: "House + Birds brings conversation into the domestic or foundational space — discussions about home, structure, or core arrangements.",
    love: "House + Birds suggests the household dynamic is being shaped by ongoing dialogue, nervousness, or conversations that need grounding.",
    work: "House + Birds marks operational discussions, team conversations about process, or communication about foundational systems.",
  },
  "3-4": {
    general: "Ship + House stretches between movement and stability — the pull between exploring further and staying grounded at home.",
    love: "Ship + House suggests the relationship is navigating the tension between distance and domestic security.",
    work: "Ship + House points to expansion plans that must balance growth with operational stability at the base.",
  },
  "3-12": {
    general: "Ship + Birds places communication across distance — conversations that span geography, cultural gaps, or unfamiliar terrain.",
    love: "Ship + Birds suggests the emotional dialogue is happening across distance, whether physical, emotional, or experiential.",
    work: "Ship + Birds marks communications with remote teams, international contacts, or discussions about expansion and logistics.",
  },
  "3-11": {
    general: "Ship + Whip creates tension through movement — friction from travel, distance-related stress, or repetitive logistical challenges.",
    love: "Ship + Whip suggests distance is generating friction, or a repeating pattern of departure and return is wearing on the bond.",
    work: "Ship + Whip marks operational friction from movement, travel fatigue, or logistics issues cycling through without resolution.",
  },
  "2-3": {
    general: "Clover + Ship offers a fortunate window for movement — lucky timing around travel, expansion, or exploring something further afield.",
    love: "Clover + Ship suggests a lighthearted opportunity involving distance, travel, or a broader perspective on the relationship.",
    work: "Clover + Ship marks a well-timed opportunity for expansion, travel, or reaching a broader market.",
  },
  "2-12": {
    general: "Clover + Birds brings a bit of luck into the conversation — a fortunate exchange, well-timed dialogue, or news that eases nerves.",
    love: "Clover + Birds suggests a lighthearted conversation or fortunate exchange that improves the emotional atmosphere.",
    work: "Clover + Birds marks a lucky break arriving through communication — a well-timed meeting, call, or message that opens something.",
  },
  "2-11": {
    general: "Clover + Whip softens tension with a small piece of luck — a fortunate break in a repeating pattern, or ease arriving amid friction.",
    love: "Clover + Whip suggests a lighthearted moment that interrupts a tense pattern, offering a brief window for repair.",
    work: "Clover + Whip points to a lucky break within a repetitive process — a small opening that makes the friction more manageable.",
  },
  "19-20": {
    general: "Tower + Garden bridges structure and community — institutional authority meeting public space, where formal and social dynamics interact.",
    love: "Tower + Garden suggests the relationship's public face and its private structure need to be aligned rather than competing.",
    work: "Tower + Garden marks organisational presence in a wider community — corporate networking, institutional public relations, or structured community engagement.",
  },
  "17-27": {
    general: "Stork + Letter marks change arriving through written communication — a notice, document, or message that initiates or confirms a transition.",
    love: "Stork + Letter suggests a conversation, message, or written exchange that signals a constructive shift in the relationship.",
    work: "Stork + Letter points to change communicated formally — transition notices, contract updates, or documentation of improvement.",
  },
  "17-26": {
    general: "Stork + Book brings change through knowledge — an improvement triggered by new understanding, private study, or information that was previously hidden.",
    love: "Stork + Book suggests the relationship evolves once something private is understood or a hidden truth comes to light.",
    work: "Stork + Book marks process improvements driven by research, specialist insight, or newly available information.",
  },
  "13-23": {
    general: "Child + Mice warns that something new and fragile is being worn down by small stresses before it has time to take root.",
    love: "Child + Mice suggests a tender new dynamic being undermined by worry, doubt, or small frictions that erode trust before it can settle.",
    work: "Child + Mice marks a new initiative or early-stage project being weakened by persistent minor issues that compound quickly.",
  },
  "13-14": {
    general: "Child + Fox places a new beginning under careful scrutiny — start with caution, verify early, and protect the fresh start from avoidable mistakes.",
    love: "Child + Fox suggests a new emotional opening being approached guardedly, where some caution is wise but too much blocks the tenderness.",
    work: "Child + Fox supports a new initiative or prototype that benefits from tactical awareness and quality-checking from the very start.",
  },
  "12-20": {
    general: "Birds + Garden amplifies social communication — dialogue moving through a wider network, public conversation, or community-level exchange.",
    love: "Birds + Garden suggests the relationship is being discussed in social circles, or that friends and community are part of the communication dynamic.",
    work: "Birds + Garden marks public-facing communication, networking conversations, or feedback moving through the wider professional community.",
  },
  "11-20": {
    general: "Whip + Garden brings repetitive tension into the social or public sphere — friction that is visible, communal, or played out in shared spaces.",
    love: "Whip + Garden suggests relational tension being felt or witnessed in social settings, where private friction becomes publicly uncomfortable.",
    work: "Whip + Garden marks public-facing process friction, community complaints, or repetitive issues affecting external perception.",
  },
  "11-19": {
    general: "Whip + Tower creates institutional friction — repetitive tension within a formal structure, rules-based conflict, or structural discipline under strain.",
    love: "Whip + Tower suggests boundary enforcement becoming a source of recurring tension, where structure helps but the repetition exhausts.",
    work: "Whip + Tower marks process friction within institutional frameworks — policy disputes, regulatory loops, or disciplinary patterns.",
  },
  "11-12": {
    general: "Whip + Birds doubles the communicative intensity — conversations that repeat, escalate, or carry anxious tension into a feedback loop.",
    love: "Whip + Birds suggests arguments that cycle through talking, where the dialogue itself has become the arena for repetitive tension.",
    work: "Whip + Birds marks meetings, calls, or exchanges stuck in unproductive loops — communication friction that needs a structural reset.",
  },
  "21-24": {
    general: "Mountain + Heart meets genuine feeling with a real obstacle — the care is present but something structural or circumstantial is blocking its expression.",
    love: "Mountain + Heart suggests emotional distance despite real love, where patience and persistence matter because the feeling is genuine even if access is blocked.",
    work: "Mountain + Heart marks values-driven motivation meeting a structural barrier, where the commitment must outlast the obstruction.",
  },
  "21-23": {
    general: "Mountain + Mice combines a major obstacle with persistent erosion — the blockage is both immovable and slowly wearing down what surrounds it.",
    love: "Mountain + Mice suggests emotional distance compounded by accumulating small worries, where the obstacle itself is generating secondary stress.",
    work: "Mountain + Mice marks a structural blocker that is also creating operational attrition — the delay causes its own damage.",
  },
  "16-28": {
    general: "Stars + Counterpart places the other person in the line of strategic guidance — their direction, vision, or clarity is a factor in the shared path.",
    love: "Stars + Counterpart suggests the other person's sense of direction and long-term hopes are important to understand before the shared path becomes clear.",
    work: "Stars + Counterpart marks a collaborator or stakeholder whose strategic vision influences the shared direction.",
  },
  "15-22": {
    general: "Bear + Crossroads places resource power or authority at a decision point — the choice involves leverage, money, or protective capacity.",
    love: "Bear + Crossroads suggests a relational decision influenced by security, financial capacity, or questions about who holds the protective role.",
    work: "Bear + Crossroads marks a resource-heavy strategic fork — a financial, leadership, or authority decision with significant downstream impact.",
  },
  "14-31": {
    general: "Fox + Sun says success is available but requires discernment — visible momentum benefits from careful, tactical awareness rather than blind confidence.",
    love: "Fox + Sun suggests the relationship's warm trajectory needs protecting through honest attention to detail, not just riding the good feeling.",
    work: "Fox + Sun marks a period of visible success that benefits from quality control, careful review, and protecting the gains strategically.",
  },
  "14-21": {
    general: "Fox + Mountain places a blockage under tactical scrutiny — the obstacle may have a workaround if you look carefully enough.",
    love: "Fox + Mountain suggests emotional distance that may respond to a cleverer, more indirect approach rather than head-on confrontation.",
    work: "Fox + Mountain marks a structural blocker that rewards tactical analysis — look for the side route rather than attacking the wall directly.",
  },
  "10-22": {
    general: "Scythe + Crossroads makes the decision sharp and immediate — the fork requires a clean cut now, not more deliberation.",
    love: "Scythe + Crossroads marks a relationship decision that has arrived at the point where delay is no longer an option.",
    work: "Scythe + Crossroads points to a strategic fork requiring rapid, decisive action — the moment for analysis has passed.",
  },
  "1-36": {
    general: "Rider + Cross delivers serious news — a message or arrival carrying real weight, duty, or consequence that demands a grounded response.",
    love: "Rider + Cross suggests incoming information about obligation, grief, or responsibility that changes the emotional landscape significantly.",
    work: "Rider + Cross marks important incoming news about serious accountability, institutional decisions, or matters with lasting consequence.",
  },
  "1-28": {
    general: "Rider + Counterpart delivers news about or from the other person — a message, arrival, or development that puts the other party in motion.",
    love: "Rider + Counterpart suggests the other person is reaching out, arriving, or making a first move that changes the relational dynamic.",
    work: "Rider + Counterpart marks incoming communication from a key stakeholder, client, or collaborator that shifts the working relationship.",
  },
  "1-22": {
    general: "Rider + Crossroads delivers news at a decision point — incoming information that forces or clarifies a choice about direction.",
    love: "Rider + Crossroads suggests a message or arrival that creates an immediate decision about the relationship's direction.",
    work: "Rider + Crossroads marks incoming intelligence that reshapes a strategic decision — new data at a critical fork.",
  },
  "1-21": {
    general: "Rider + Mountain delivers news about a delay or obstacle — the information confirms a blockage that patience must handle.",
    love: "Rider + Mountain suggests a message about distance, unavailability, or circumstances that slow the relationship's forward movement.",
    work: "Rider + Mountain marks incoming information about a structural delay, blocked process, or timeline pushed back.",
  },
  "9-18": {
    general: "Bouquet + Dog blends appreciation with loyalty — genuine gratitude meeting dependable support, where warmth and reliability reinforce each other.",
    love: "Bouquet + Dog supports a friendship deepening into something warmer, or appreciation strengthening a bond built on trust.",
    work: "Bouquet + Dog marks loyal collaboration rewarded with recognition, goodwill, and mutual appreciation.",
  },
  "5-6": {
    general: "Tree + Clouds slows growth with uncertainty — the roots are there but current conditions make it difficult to see how things are developing.",
    love: "Tree + Clouds suggests emotional growth is happening but confusion or mixed signals make it hard to feel secure about the direction.",
    work: "Tree + Clouds marks long-term development proceeding under unclear conditions, where patient waiting is the only honest option.",
  },
  "4-13": {
    general: "House + Child brings a fresh start to the foundation — new routines, a domestic beginning, or something small and new entering the stable base.",
    love: "House + Child suggests a gentle domestic renewal — new energy in the home, a fresh dynamic, or a tender beginning inside an established structure.",
    work: "House + Child marks a new initiative within existing infrastructure, where something small and fresh enters the established foundation.",
  },
  "3-13": {
    general: "Ship + Child begins something new at a distance — a fresh start that involves exploration, travel, or reaching beyond the familiar.",
    love: "Ship + Child suggests a new emotional beginning connected to distance, fresh perspectives, or exploring unfamiliar relational territory.",
    work: "Ship + Child marks a new venture, project, or initiative involving expansion, new markets, or distant contacts.",
  },
  "20-30": {
    general: "Garden + Lily brings mature composure to social settings — dignity in public, measured engagement, and principled community participation.",
    love: "Garden + Lily suggests the social world around the relationship benefits from patience, respect, and mature handling of shared circles.",
    work: "Garden + Lily supports professional networking guided by seniority, measured reputation, and principled public engagement.",
  },
  "18-27": {
    general: "Dog + Letter ties loyalty to written communication — a trusted message, a reliable document, or support arriving through explicit, written terms.",
    love: "Dog + Letter suggests faithful communication — messages you can trust, conversations that follow through, and words that match actions.",
    work: "Dog + Letter marks dependable correspondence, reliable documentation, or trusted communications from proven allies.",
  },
  "18-26": {
    general: "Dog + Book brings loyalty into the hidden or private space — a trusted ally who keeps counsel, or reliable support behind the scenes.",
    love: "Dog + Book suggests quiet loyalty, private support, or a trusted confidant whose discretion matters.",
    work: "Dog + Book marks a reliable colleague with specialist knowledge, or a trusted ally handling confidential information with care.",
  },
  "12-13": {
    general: "Birds + Child brings nervous, excited energy to a new beginning — the start is fresh but the anxiety about it is real.",
    love: "Birds + Child suggests early-stage romantic nervousness, excited dialogue about something new, or the butterflies that come with a tender opening.",
    work: "Birds + Child marks anxious communication around a new project, role, or initiative — nervous energy that needs grounding.",
  },
  "9-22": {
    general: "Bouquet + Crossroads places a gift, invitation, or social opportunity at a decision point — the welcome option that still requires a genuine choice.",
    love: "Bouquet + Crossroads suggests a charming or warm relational opportunity that still requires a deliberate decision about direction.",
    work: "Bouquet + Crossroads marks a pleasant opportunity arriving at a strategic fork, where appreciation and clear choice work together.",
  },
  "9-21": {
    general: "Bouquet + Mountain softens an obstacle with grace — the blockage may be real, but warmth, appreciation, or social skill can ease the path around it.",
    love: "Bouquet + Mountain suggests emotional distance may respond to kindness and gentle social warmth more than to insistence.",
    work: "Bouquet + Mountain points to a blocker that yields to diplomatic skill, goodwill, or charm rather than brute-force persistence.",
  },
  "8-34": {
    general: "Coffin + Fish marks an ending in the flow — resources drying up, a financial chapter closing, or practical support reaching its natural limit.",
    love: "Coffin + Fish suggests the practical or financial dimension of the relationship is reaching a conclusion that needs honest acknowledgment.",
    work: "Coffin + Fish marks revenue streams closing, financial chapters ending, or resource-dependent projects reaching their natural conclusion.",
  },
  "1-7": {
    general: "Rider + Snake delivers news through a complicated channel — the message arrives, but the route is indirect and the full story may take time to unfold.",
    love: "Rider + Snake suggests incoming information entangled with desire, mixed motives, or a complicated situation that resists simple interpretation.",
    work: "Rider + Snake marks incoming intelligence requiring careful decoding — the update is important but the context is politically complex.",
  },
  "1-9": {
    general: "Rider + Bouquet delivers a pleasant message, welcome invitation, or news that arrives with genuine warmth and social grace.",
    love: "Rider + Bouquet suggests a charming approach, warm invitation, or message of appreciation arriving at just the right moment.",
    work: "Rider + Bouquet marks positive incoming feedback, a welcome offer, or recognition arriving through friendly channels.",
  },
  "1-15": {
    general: "Rider + Bear delivers news about resources, authority, or financial matters — incoming information that shifts the power picture.",
    love: "Rider + Bear suggests a message or development involving security, protection, or the financial dimension of the relationship.",
    work: "Rider + Bear marks incoming news about budgets, authority decisions, or resource allocation that changes the practical landscape.",
  },
  "1-25": {
    general: "Rider + Ring delivers news about a commitment — an incoming message that confirms, questions, or reshapes the terms of an agreement.",
    love: "Rider + Ring suggests a message about the relationship's status, a proposal, or news that directly affects the commitment.",
    work: "Rider + Ring marks incoming contract news, partnership updates, or agreement-related communications requiring prompt response.",
  },

  // ── Remaining high-signal combinations ─────────────────────────────────

  "2-9": {
    general: "Clover + Bouquet doubles the charm — a fortunate, warm moment where luck and grace combine into something genuinely pleasant.",
    love: "Clover + Bouquet supports lighthearted, graceful connection — a lucky encounter or welcome moment that brings easy warmth.",
    work: "Clover + Bouquet marks a fortunate social moment — positive reception, lucky networking, or well-timed goodwill.",
  },
  "3-35": {
    general: "Ship + Anchor asks whether movement can find a lasting harbour — exploration and stability negotiating a sustainable balance.",
    love: "Ship + Anchor suggests the relationship navigating between the need for exploration and the desire for grounded commitment.",
    work: "Ship + Anchor marks expansion efforts needing a stable operational anchor, or career movement seeking long-term footing.",
  },
  "4-35": {
    general: "House + Anchor doubles the stability — deeply rooted foundations, durable domestic structure, and security built to last.",
    love: "House + Anchor supports a relationship where home, routine, and dependable structure create genuine long-term safety.",
    work: "House + Anchor marks strong operational foundations and career stability grounded in reliable systems and infrastructure.",
  },
  "5-25": {
    general: "Tree + Ring ties deep, patient growth to a lasting commitment — the bond strengthens slowly through sustained, faithful attention.",
    love: "Tree + Ring supports a long-term commitment that deepens through patience, where the relationship is the thing being carefully grown.",
    work: "Tree + Ring marks career commitments or professional agreements that benefit from sustained, patient development.",
  },
  "6-21": {
    general: "Clouds + Mountain layers confusion with obstruction — visibility is poor and the path is blocked, demanding patience with both the fog and the wall.",
    love: "Clouds + Mountain marks a particularly difficult period where emotional confusion and real distance both need to be accepted before they clear.",
    work: "Clouds + Mountain points to an unclear situation compounded by structural blockers — wait for better visibility before committing to a route.",
  },
  "6-36": {
    general: "Clouds + Cross places uncertainty over an obligation — the duty is real but the confusion about how to carry it makes the weight harder to bear.",
    love: "Clouds + Cross suggests a relational burden made heavier by confusion about what is genuinely owed and what can be released.",
    work: "Clouds + Cross marks professional obligation under unclear conditions, where ambiguity about the duty itself is the primary stressor.",
  },
  "6-22": {
    general: "Clouds + Crossroads places a decision under foggy conditions — the choice needs to be made, but the information available is not yet clear enough to feel confident.",
    love: "Clouds + Crossroads suggests a relationship decision being hampered by emotional confusion, where clarity may need to precede the choice.",
    work: "Clouds + Crossroads marks a strategic fork under uncertain conditions — if possible, improve visibility before committing to direction.",
  },
  "9-34": {
    general: "Bouquet + Fish connects warmth and appreciation to resource flow — generosity, social capital, and material value supporting each other.",
    love: "Bouquet + Fish suggests practical generosity expressed with genuine warmth, where gifts and gestures carry real feeling.",
    work: "Bouquet + Fish marks goodwill generating commercial value — charm, social capital, and client appreciation improving the financial picture.",
  },
  "10-34": {
    general: "Scythe + Fish makes a sharp cut in the resource picture — a decisive financial move, sudden change in flow, or rapid resource reallocation.",
    love: "Scythe + Fish suggests a sharp practical decision affecting shared resources or the financial dimension of the relationship.",
    work: "Scythe + Fish marks a rapid financial decision — budget cuts, decisive investment, or immediate reallocation of resources.",
  },
  "11-28": {
    general: "Whip + Counterpart places repetitive tension or friction with the other person — a pattern of conflict or intensity in the dynamic between you.",
    love: "Whip + Counterpart suggests a recurring friction with the other person that needs structural change rather than another round of the same argument.",
    work: "Whip + Counterpart marks a pattern of tension with a stakeholder or collaborator that requires a different approach to break.",
  },
  "11-31": {
    general: "Whip + Sun says the tension is not permanent — the friction resolves into clearer, warmer energy once the pattern is addressed honestly.",
    love: "Whip + Sun suggests the relationship's tensions can lead to genuine warmth if the repeating pattern is named and changed.",
    work: "Whip + Sun marks process friction that resolves positively — the discipline or rework produces visible, energising improvement.",
  },
  "13-25": {
    general: "Child + Ring starts a new commitment — a fresh agreement, early-stage partnership, or the beginning of a recurring pattern.",
    love: "Child + Ring marks the early stage of a commitment — new promises, a young relationship, or a fresh cycle beginning in an existing bond.",
    work: "Child + Ring supports new contracts, early-stage partnerships, or the beginning of a recurring professional arrangement.",
  },
  "13-28": {
    general: "Child + Counterpart brings the other person into a fresh beginning — their own renewal, new approach, or changed position reshapes the dynamic.",
    love: "Child + Counterpart suggests the other person is offering a fresh start, a renewed approach, or an openness that invites something new.",
    work: "Child + Counterpart marks a counterpart bringing a new initiative, fresh perspective, or changed terms to the working relationship.",
  },
  "17-28": {
    general: "Stork + Counterpart places constructive change with the other person — they are evolving, improving, or shifting in ways that affect the shared dynamic.",
    love: "Stork + Counterpart suggests the other person is going through a positive change that creates new conditions for the bond.",
    work: "Stork + Counterpart marks a collaborator or stakeholder in transition, where their improvement creates new opportunities.",
  },
  "18-31": {
    general: "Dog + Sun brings loyalty into the light — trusted support becoming visible, dependable allies recognised, and faithful effort rewarded.",
    love: "Dog + Sun supports a warm, loyal bond where trust and confidence are both active and visible.",
    work: "Dog + Sun marks trusted colleagues or dependable allies gaining recognition, where loyalty and visibility reinforce each other.",
  },
  "18-33": {
    general: "Dog + Key says the answer comes through a trusted ally — the solution arrives from someone dependable, not from a stranger or a new source.",
    love: "Dog + Key suggests emotional clarity arriving through a trusted friend, confidant, or loyal bond that provides the missing perspective.",
    work: "Dog + Key points to a reliable colleague or proven ally being the one who provides the critical insight or unlock.",
  },
  "18-35": {
    general: "Dog + Anchor doubles the reliability — trusted support grounded in long-term commitment, where loyalty and endurance work as one.",
    love: "Dog + Anchor supports the most dependable form of partnership — consistent loyalty backed by genuine staying power.",
    work: "Dog + Anchor marks deeply reliable working relationships, career allies, or professional support systems built for the long term.",
  },
  "18-36": {
    general: "Dog + Cross brings loyalty face to face with burden — faithful support under heavy conditions, where the cost of caring is real.",
    love: "Dog + Cross suggests a loyal bond carrying real weight, where the person who stays must also set honest limits on what they can bear.",
    work: "Dog + Cross marks a trusted ally handling serious responsibility, where the demand on loyalty requires sustainable boundaries.",
  },
  "30-34": {
    general: "Lily + Fish brings patience and maturity to resource management — financial flow benefits from composed, principled stewardship.",
    love: "Lily + Fish suggests practical generosity guided by maturity, where financial or material exchange reflects wisdom rather than impulse.",
    work: "Lily + Fish supports mature financial leadership, patient investment strategies, and experienced resource management.",
  },
  "30-32": {
    general: "Lily + Moon brings maturity to emotional depth — composure meeting sensitivity, where principled restraint and genuine feeling coexist.",
    love: "Lily + Moon suggests deep, mature emotional understanding, where patience and emotional attunement create a rich bond.",
    work: "Lily + Moon supports creative or reputational work guided by experienced judgment and emotional intelligence.",
  },
};

function pairKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function keywordScore(aKeywords: string[], bKeywords: string[]): number {
  const overlap = aKeywords.filter((keyword) => bKeywords.includes(keyword)).length;
  return overlap * 1.6;
}

function axisBonus(aId: number, bId: number): number {
  if ((aId === 28 && bId === 29) || (aId === 29 && bId === 28)) return 6;
  if (aId === 29 || bId === 29) return 2.5;
  if (aId === 33 || bId === 33) return 1.8;
  if (aId === 21 || bId === 21) return 1.7;
  if (aId === 36 || bId === 36) return 1.7;
  return 0;
}

function buildFallbackMeaning(aId: number, bId: number): Record<Domain, string> {
  const a = CARD_MEANINGS.find((card) => card.id === aId);
  const b = CARD_MEANINGS.find((card) => card.id === bId);

  if (!a || !b) {
    return {
      general: "This pair introduces an important combined influence.",
      love: "This pair highlights an emotional dynamic worth observing.",
      work: "This pair marks a practical pattern in motion.",
    };
  }

  const general = `${a.name} + ${b.name} keeps ${a.keywords[0]} and ${b.keywords[0]} in active tension, where the way they settle determines what becomes available next.`;
  const love = `${a.name} + ${b.name} keeps ${a.keywords[0]} and ${b.keywords[0]} in active tension in the relationship, where the way they settle shapes what becomes emotionally available next.`;
  const work = `${a.name} + ${b.name} keeps ${a.keywords[0]} and ${b.keywords[0]} in active tension at work, where the way they settle determines what becomes practically available next.`;

  return { general, love, work };
}

function buildPairRepository(): PairMeaning[] {
  const candidates: Array<{ a: number; b: number; signal: number }> = [];

  for (let i = 0; i < CARD_MEANINGS.length; i += 1) {
    for (let j = i + 1; j < CARD_MEANINGS.length; j += 1) {
      const a = CARD_MEANINGS[i];
      const b = CARD_MEANINGS[j];
      const key = pairKey(a.id, b.id);
      const signal =
        SIGNAL_WEIGHTS[a.id] +
        SIGNAL_WEIGHTS[b.id] +
        keywordScore(a.keywords, b.keywords) +
        axisBonus(a.id, b.id) +
        (CURATED_OVERRIDES[key] ? 4 : 0);

      candidates.push({ a: a.id, b: b.id, signal });
    }
  }

  candidates.sort((left, right) => right.signal - left.signal);

  const topPairs = candidates.slice(0, 220);

  return topPairs.map((entry) => {
    const key = pairKey(entry.a, entry.b);
    const meanings = CURATED_OVERRIDES[key] ?? buildFallbackMeaning(entry.a, entry.b);

    return {
      key,
      a: entry.a,
      b: entry.b,
      signal: Number(entry.signal.toFixed(2)),
      meanings,
    };
  });
}

export const PAIR_MEANINGS: PairMeaning[] = buildPairRepository();
export const PAIR_MEANINGS_BY_KEY = new Map(PAIR_MEANINGS.map((item) => [item.key, item]));

export function getPairMeaning(a: number, b: number): PairMeaning | null {
  return PAIR_MEANINGS_BY_KEY.get(pairKey(a, b)) ?? null;
}
