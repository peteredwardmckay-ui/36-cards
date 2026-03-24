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
