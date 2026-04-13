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
