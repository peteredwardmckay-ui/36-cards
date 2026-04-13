export interface HouseMeaning {
  id: number;
  name: string;
  shortFocus: string;
  description: string;
  whenStrong: string;
  whenChallenged: string;
}

export const HOUSE_MEANINGS: HouseMeaning[] = [
  {
    id: 1, name: "Rider House", shortFocus: "incoming momentum",
    description: "The Rider House is where things arrive. News, visitors, invitations, first contact — anything that crosses the threshold into your awareness lands here. A card in this position tells you what kind of energy is approaching and how quickly it will reach you. Speed matters in this house; what arrives here rarely waits.",
    whenStrong: "Good news travels fast. A supportive card here suggests incoming opportunity, a welcome message, or the start of something that moves in your favour without needing to be chased.",
    whenChallenged: "Unwelcome news or premature arrivals. A difficult card here warns of information that disrupts plans, forces a reaction before you are ready, or brings pressure you did not invite.",
  },
  {
    id: 2, name: "Clover House", shortFocus: "small luck",
    description: "The Clover House governs brief windows of fortune — the kind that open quietly and close just as fast. This is not destiny or grand design; it is a moment of ease that rewards those paying attention. A card here reveals what your current stroke of luck actually looks like and how long you have to act on it.",
    whenStrong: "A pleasant surprise with real, if modest, benefit. The opening is genuine, the timing is kind, and the cost of entry is low. Take it before it passes.",
    whenChallenged: "Luck that misleads or evaporates. A difficult card here suggests relying on fortune that is not as solid as it appears, or missing a small window because you hesitated too long.",
  },
  {
    id: 3, name: "Ship House", shortFocus: "expansion",
    description: "The Ship House is where horizons widen. Travel, foreign connections, trade, and anything that takes you beyond your usual boundaries operates through this position. A card here shows what kind of expansion is underway and whether the journey has a destination or is still searching for one.",
    whenStrong: "Productive distance. A supportive card here points to rewarding travel, successful commerce, or perspective gained by stepping outside your comfort zone.",
    whenChallenged: "Drift without direction. A difficult card here suggests aimless movement, homesickness, deals that look better from a distance, or expansion that stretches resources too thin.",
  },
  {
    id: 4, name: "House House", shortFocus: "structural stability",
    description: "The House House is where you live — not just physically, but in terms of routine, family patterns, and the structures you return to. Security, domestic order, and the habits that hold daily life together all centre here. A card in this position reveals what is reinforcing or undermining your foundation.",
    whenStrong: "A stable base. The domestic sphere is secure, routines are working, and there is a reliable structure to build from. Comfort and safety are not under threat.",
    whenChallenged: "Cracks in the foundation. A difficult card here exposes dysfunction at home, habits that no longer serve you, or security that depends on conditions you cannot control.",
  },
  {
    id: 5, name: "Tree House", shortFocus: "long growth",
    description: "The Tree House operates on a slow clock. Health, deep roots, inherited patterns, and anything that compounds over years rather than weeks belongs here. A card in this position is not about what happens next — it is about what has been growing for a long time and what that growth is producing now.",
    whenStrong: "Deep vitality. A supportive card here indicates strong health, a well-rooted situation, or long-term investments finally bearing fruit. Patience has been rewarded.",
    whenChallenged: "Chronic strain. A difficult card here points to health concerns that have been building, inherited problems resurfacing, or stagnation disguised as stability.",
  },
  {
    id: 6, name: "Clouds House", shortFocus: "ambiguity",
    description: "The Clouds House is where clarity goes to be tested. Nothing here is fully visible; conditions shift, information is partial, and confidence is hard to hold. A card in this position tells you what is being obscured and whether the fog is lifting or thickening.",
    whenStrong: "Temporary confusion that resolves. A supportive card here suggests the uncertainty is a passing phase — clarity is close, and patience will be rewarded with better information.",
    whenChallenged: "Persistent fog. A difficult card here warns of deliberate concealment, self-deception, or a situation where the truth is genuinely unavailable and decisions must be made without it.",
  },
  {
    id: 7, name: "Snake House", shortFocus: "strategy",
    description: "The Snake House is where things get complicated — and where complication can be an advantage. Desire, indirect approaches, layered motives, and the kind of intelligence that reads a room before speaking all operate here. A card in this position reveals the nature of the complexity you are navigating.",
    whenStrong: "Skilful navigation. A supportive card here suggests that a strategic, indirect approach will work. The complexity is manageable and rewards sophistication over bluntness.",
    whenChallenged: "Manipulation or entanglement. A difficult card here warns of someone playing a longer game than you realised, mixed motives that create confusion, or desire leading you into territory that is harder to leave than to enter.",
  },
  {
    id: 8, name: "Coffin House", shortFocus: "closure",
    description: "The Coffin House is where things end so that something else can begin. This is not catastrophe — it is the natural conclusion of a cycle. Grief, release, rest, and the clearing of space all belong here. A card in this position shows what is ending, what needs to be let go, and what kind of recovery follows.",
    whenStrong: "Clean closure. A supportive card here suggests an ending that brings relief, a burden finally set down, or a transition that opens space for something better.",
    whenChallenged: "Endings that linger. A difficult card here warns of grief that is not being processed, an ending fought rather than accepted, or the temptation to revive something that has already run its course.",
  },
  {
    id: 9, name: "Bouquet House", shortFocus: "grace",
    description: "The Bouquet House is where goodwill, beauty, and social generosity operate. Compliments, gifts, invitations, and the kind of warmth that makes people want to help you — all of it flows through this position. A card here shows what form appreciation is taking and whether it carries real substance.",
    whenStrong: "Genuine warmth. A supportive card here points to sincere recognition, a gift that arrives at the right time, or social grace that opens doors you could not push through alone.",
    whenChallenged: "Superficial charm. A difficult card here warns of flattery without substance, gifts with strings attached, or social pleasantness that masks indifference.",
  },
  {
    id: 10, name: "Scythe House", shortFocus: "decisive cuts",
    description: "The Scythe House is where decisions become irreversible. This is the position of the clean cut — surgery, not negotiation. Speed and finality define what happens here. A card in this position reveals what is about to be severed, decided, or removed, and whether the cut is surgical or reckless.",
    whenStrong: "A decisive move that clears the way. A supportive card here means the cut is clean, the timing is right, and removing what no longer works creates immediate relief.",
    whenChallenged: "Hasty or painful severance. A difficult card here warns of decisions made in anger, cuts that go too deep, or losses that happen faster than you can process.",
  },
  {
    id: 11, name: "Whip House", shortFocus: "repetition",
    description: "The Whip House is where patterns repeat — sometimes as discipline, sometimes as damage. Arguments that circle back, habits that resist change, training that refines through practice, and friction that will not resolve on its own all live here. A card in this position shows what is cycling and whether the repetition is productive or destructive.",
    whenStrong: "Productive discipline. A supportive card here suggests that repetition is building skill, that persistence will pay off, or that a difficult rhythm is actually training you for something.",
    whenChallenged: "Destructive loops. A difficult card here warns of arguments that never resolve, self-punishment disguised as effort, or staying in a pattern because leaving feels harder than enduring.",
  },
  {
    id: 12, name: "Birds House", shortFocus: "dialogue",
    description: "The Birds House is where communication happens — conversations, negotiations, gossip, nervous chatter, and the anxiety that comes from too much or too little information. A card here reveals the quality of dialogue around your situation and whether words are helping or adding noise.",
    whenStrong: "Productive exchange. A supportive card here suggests conversations that clarify, negotiations that move forward, or a partnership where both parties are actually listening.",
    whenChallenged: "Noise and anxiety. A difficult card here warns of rumour, miscommunication, nervous overthinking, or conversations that generate heat without light.",
  },
  {
    id: 13, name: "Child House", shortFocus: "new start",
    description: "The Child House is where things begin small. New projects, fresh perspectives, innocence, vulnerability, and the first tentative steps of anything that has not yet proven itself all belong here. A card in this position shows what is just starting and how much protection or room it needs to grow.",
    whenStrong: "A promising beginning. A supportive card here suggests a fresh start with real potential, an idea worth nurturing, or a return to simplicity that cuts through accumulated complexity.",
    whenChallenged: "Naivety or fragility. A difficult card here warns of underestimating what a new venture requires, starting something without adequate preparation, or vulnerability being exploited.",
  },
  {
    id: 14, name: "Fox House", shortFocus: "caution",
    description: "The Fox House is where self-interest operates — yours and everyone else's. Discernment, suspicion, cunning, and the kind of careful attention that spots what others miss all belong here. A card in this position reveals where caution is warranted and whether the threat is external or a product of your own calculation.",
    whenStrong: "Sharp discernment. A supportive card here suggests your instincts are correct, your caution is protecting something valuable, or a careful approach will outperform a bold one.",
    whenChallenged: "Paranoia or deception. A difficult card here warns of trust eroded by suspicion, someone acting purely in self-interest at your expense, or overthinking that prevents action.",
  },
  {
    id: 15, name: "Bear House", shortFocus: "power",
    description: "The Bear House is where authority and resources concentrate. Money, leadership, physical strength, parental figures, and the weight of responsibility that comes with having power all operate through this position. A card here shows how power is being held and whether it is being used well.",
    whenStrong: "Responsible stewardship. A supportive card here suggests resources are abundant, leadership is sound, and the person in charge — whether that is you or someone else — is using their influence constructively.",
    whenChallenged: "Control struggles. A difficult card here warns of financial pressure, authority wielded without fairness, possessiveness, or the burden of carrying more weight than one person should.",
  },
  {
    id: 16, name: "Stars House", shortFocus: "guidance",
    description: "The Stars House is where long-range clarity lives. Vision, hope, purpose, spiritual direction, and the feeling of being aligned with something larger than the immediate problem all operate here. A card in this position reveals what kind of guidance is available and whether you are following it or ignoring it.",
    whenStrong: "Clear direction. A supportive card here suggests your compass is working — the vision is sound, the path is visible, and inspiration is translating into practical steps.",
    whenChallenged: "Lost bearings. A difficult card here warns of misplaced idealism, following a vision that no longer fits, or confusing wishful thinking with genuine guidance.",
  },
  {
    id: 17, name: "Stork House", shortFocus: "upgrade",
    description: "The Stork House is where change improves things. Moves, upgrades, transitions that leave you better off than before, and the restlessness that precedes positive change all belong here. A card in this position shows what is shifting and whether the change is an improvement or just movement for its own sake.",
    whenStrong: "A genuine upgrade. A supportive card here suggests a move or change that delivers on its promise — better conditions, a step up, or a transition that was overdue and lands well.",
    whenChallenged: "Change without improvement. A difficult card here warns of restlessness mistaken for progress, a move that trades one set of problems for another, or instability dressed up as opportunity.",
  },
  {
    id: 18, name: "Dog House", shortFocus: "loyal support",
    description: "The Dog House is where loyalty operates. Friendship, trust, reliability, and the people who show up consistently — not dramatically — all centre here. A card in this position reveals the quality of support around you and whether it can be depended on.",
    whenStrong: "Reliable allies. A supportive card here confirms that the people around you are trustworthy, that help is available, and that loyalty is being reciprocated.",
    whenChallenged: "Misplaced trust. A difficult card here warns of loyalty given to someone who does not return it, dependence on support that may withdraw, or friendship tested by circumstance.",
  },
  {
    id: 19, name: "Tower House", shortFocus: "structure",
    description: "The Tower House is where systems, institutions, and formal authority hold sway. Government, corporate hierarchy, legal frameworks, solitude by design, and the cold clarity that comes from distance all operate here. A card in this position shows how institutional forces are shaping your situation.",
    whenStrong: "Institutional support. A supportive card here suggests the system is working in your favour — rules protect you, structure provides clarity, or authority is being exercised fairly.",
    whenChallenged: "Institutional friction. A difficult card here warns of bureaucracy blocking progress, isolation that has become loneliness, or authority exercised without empathy.",
  },
  {
    id: 20, name: "Garden House", shortFocus: "public field",
    description: "The Garden House is where you are seen. Reputation, social networks, public events, community involvement, and anything that depends on how others perceive you operates here. A card in this position reveals your standing in a group and what the public dimension of your situation looks like.",
    whenStrong: "Social momentum. A supportive card here suggests your reputation is working for you, your network is active and helpful, or a public-facing effort is gaining traction.",
    whenChallenged: "Exposure or social friction. A difficult card here warns of unwanted visibility, gossip, groupthink overriding your judgement, or a public persona that no longer matches private reality.",
  },
  {
    id: 21, name: "Mountain House", shortFocus: "obstruction",
    description: "The Mountain House is where progress stops — at least temporarily. Obstacles, delays, immovable resistance, and the patience required to wait out what cannot be pushed through all belong here. A card in this position shows what is blocking you and whether the obstacle will move or must be navigated around.",
    whenStrong: "Protective boundary. A supportive card here reframes the obstacle — the delay is protecting you from something worse, the blockage is giving you time you need, or the resistance is redirecting you toward a better path.",
    whenChallenged: "Genuine impasse. A difficult card here confirms that the obstacle is real, the delay is costly, and forcing through will not work. Patience, rerouting, or acceptance may be the only options.",
  },
  {
    id: 22, name: "Crossroads House", shortFocus: "choice",
    description: "The Crossroads House is where paths diverge. Decisions, options, freedom, and the anxiety of choosing one thing over another all converge here. A card in this position reveals the nature of the choice in front of you and what each direction actually costs.",
    whenStrong: "Genuine options. A supportive card here suggests real freedom — the choices are good, the decision is yours to make, and either path has merit.",
    whenChallenged: "Paralysis or false choice. A difficult card here warns of indecision that wastes the window, options that look different but lead to the same place, or freedom experienced as overwhelm.",
  },
  {
    id: 23, name: "Mice House", shortFocus: "erosion",
    description: "The Mice House is where things diminish. Stress, gradual loss, worry, and the slow drain of resources, confidence, or health all operate here. Nothing in this house collapses suddenly — it wears away. A card in this position reveals what is being eroded and how much has already been lost.",
    whenStrong: "Manageable loss. A supportive card here suggests the erosion is minor, the stress is being handled, or what is being lost was not worth keeping. The damage is containable.",
    whenChallenged: "Compounding drain. A difficult card here warns of chronic stress, resources leaking faster than they can be replenished, or worry that has become self-reinforcing.",
  },
  {
    id: 24, name: "Heart House", shortFocus: "values and love",
    description: "The Heart House is where emotional truth lives. Love, passion, core values, and the things you care about most deeply all centre here. A card in this position reveals the state of your emotional core and whether your actions are aligned with what actually matters to you.",
    whenStrong: "Emotional alignment. A supportive card here suggests your heart and your actions are pointing in the same direction — love is present, values are being honoured, and passion has a constructive outlet.",
    whenChallenged: "Emotional conflict. A difficult card here warns of values compromised, love that costs too much, or passion misdirected into something that does not deserve it.",
  },
  {
    id: 25, name: "Ring House", shortFocus: "commitment",
    description: "The Ring House is where binding agreements operate. Contracts, marriages, recurring obligations, and anything that loops back on itself — creating continuity through repetition — belongs here. A card in this position reveals the state of your commitments and whether they are sustaining or confining you.",
    whenStrong: "Solid commitment. A supportive card here confirms that a promise is being kept, a contract is sound, or a recurring arrangement is working for everyone involved.",
    whenChallenged: "Binding obligation. A difficult card here warns of commitments that have become traps, contracts with unfavourable terms, or cycles of obligation that drain more than they return.",
  },
  {
    id: 26, name: "Book House", shortFocus: "hidden knowledge",
    description: "The Book House is where secrets are kept and knowledge is stored. Education, research, private information, things deliberately withheld, and the kind of understanding that only comes from sustained study all operate here. A card in this position reveals what is hidden, what is being studied, or what you do not yet know.",
    whenStrong: "Valuable discovery. A supportive card here suggests that study will pay off, a secret revealed will be useful, or private knowledge gives you an advantage others lack.",
    whenChallenged: "Dangerous ignorance. A difficult card here warns of secrets kept from you, knowledge you need but do not have, or information deliberately withheld by someone who benefits from your not knowing.",
  },
  {
    id: 27, name: "Letter House", shortFocus: "documents",
    description: "The Letter House is where the written word carries weight. Contracts, emails, medical results, official correspondence, and any situation where what is on paper matters more than what was said aloud all belong here. A card in this position reveals what documentation is active in your situation and whether it helps or complicates things.",
    whenStrong: "Clear documentation. A supportive card here suggests the paperwork is in order, an important message arrives on time, or putting something in writing resolves ambiguity.",
    whenChallenged: "Paper problems. A difficult card here warns of missing documents, messages that arrive too late, fine print that changes the deal, or official communication that delivers unwelcome news.",
  },
  {
    id: 28, name: "Counterpart House", shortFocus: "the other",
    description: "The Counterpart House is where the other person in your story becomes the focus. A partner, rival, collaborator, or anyone whose role is defined in relation to yours operates here. A card in this position reveals what the other person is bringing to the dynamic and how their presence shapes the outcome.",
    whenStrong: "A constructive counterpart. A supportive card here suggests the other person is an asset — their presence balances yours, their contribution is real, and the dynamic between you is productive.",
    whenChallenged: "A complicated counterpart. A difficult card here warns of a relationship where the other person's needs conflict with yours, where projection is distorting your view of them, or where their role has shifted in ways neither of you expected.",
  },
  {
    id: 29, name: "Querent House", shortFocus: "self agency",
    description: "The Querent House is where you stand. Identity, personal agency, the choices only you can make, and the version of yourself that is showing up to this situation — all of it centres here. A card in this position is not about what happens to you; it is about who you are being while it happens.",
    whenStrong: "Clear self-possession. A supportive card here suggests you are showing up well — your identity is grounded, your agency is intact, and the situation responds to the version of yourself you are choosing to be.",
    whenChallenged: "Identity under pressure. A difficult card here warns that you are not fully yourself in this situation — something is distorting your judgment, undermining your confidence, or pulling you away from your own centre.",
  },
  {
    id: 30, name: "Lily House", shortFocus: "maturity",
    description: "The Lily House is where experience speaks. Maturity, ethics, peace earned through difficulty, sexuality in its deeper forms, and the wisdom that only comes from having lived through something all operate here. A card in this position reveals what seasoned judgment has to say about your situation.",
    whenStrong: "Earned peace. A supportive card here suggests that maturity is your advantage — the situation rewards patience, ethical clarity, and the kind of calm that comes from having seen similar things before.",
    whenChallenged: "Rigidity or suppression. A difficult card here warns of experience hardening into inflexibility, moral certainty becoming judgmental, or peace maintained by refusing to acknowledge what is actually happening.",
  },
  {
    id: 31, name: "Sun House", shortFocus: "success",
    description: "The Sun House is where things go well. Vitality, confidence, visibility, warmth, and the kind of success that is obvious to everyone around you all centre here. A card in this position reveals what is thriving, what is gaining energy, and whether the success is sustainable.",
    whenStrong: "Genuine success. A supportive card here confirms that things are working — confidence is earned, visibility is deserved, and the energy behind the situation is strong and self-sustaining.",
    whenChallenged: "Overexposure. A difficult card here warns of success that attracts the wrong attention, confidence that has tipped into arrogance, or brightness that makes the shadows harder to see.",
  },
  {
    id: 32, name: "Moon House", shortFocus: "recognition",
    description: "The Moon House is where reputation, emotional cycles, and the inner life that shapes outer perception all operate. How you are seen, what you feel beneath the surface, creative intuition, and the way your emotional state colours everything around you — all of it belongs here.",
    whenStrong: "Positive recognition. A supportive card here suggests your reputation is well-earned, your emotional intuition is reliable, and creative or public-facing work is landing the way you intended.",
    whenChallenged: "Emotional distortion. A difficult card here warns of mood swings affecting judgment, reputation built on a version of you that no longer exists, or creative blocks rooted in unprocessed feeling.",
  },
  {
    id: 33, name: "Key House", shortFocus: "resolution",
    description: "The Key House is where things unlock. Solutions, certainty, access, and the moment when something that was stuck becomes available all operate here. A card in this position reveals what is about to be resolved and what kind of key is required.",
    whenStrong: "A clear solution. A supportive card here confirms that the answer is available, the lock will open, and certainty is replacing doubt. The resolution is genuine and durable.",
    whenChallenged: "False certainty. A difficult card here warns of solutions that create new problems, access granted to something you may not want, or the illusion of resolution where the real issue remains untouched.",
  },
  {
    id: 34, name: "Fish House", shortFocus: "resource flow",
    description: "The Fish House is where money and material resources move. Income, expenditure, trade, abundance, and the circulation of value — whether financial or otherwise — all operate here. A card in this position reveals the state of your material flow and whether resources are accumulating or dispersing.",
    whenStrong: "Healthy flow. A supportive card here suggests money is coming in, resources are sufficient, and the material dimension of your situation is stable or improving.",
    whenChallenged: "Financial pressure. A difficult card here warns of cash flow problems, resources being misallocated, or material concerns crowding out everything else.",
  },
  {
    id: 35, name: "Anchor House", shortFocus: "endurance",
    description: "The Anchor House is where long-term commitment holds. Career, vocation, the work you do day after day, and the kind of persistence that only matters over years — all of it centres here. A card in this position reveals what you are anchored to and whether that anchor is security or dead weight.",
    whenStrong: "Stable ground. A supportive card here confirms that your long-term position is secure, your daily work is meaningful, and persistence is building something worth having.",
    whenChallenged: "Stuck. A difficult card here warns of commitment to something that no longer serves you, a career that has become an identity trap, or endurance that has become endurance for its own sake.",
  },
  {
    id: 36, name: "Cross House", shortFocus: "meaningful burden",
    description: "The Cross House is where weight is carried with purpose. Duty, sacrifice, spiritual responsibility, the suffering that teaches, and the burdens you accept because they matter — all of it converges here. This is the final house, and a card in this position reveals what you are being asked to bear and whether the weight has meaning.",
    whenStrong: "Purposeful burden. A supportive card here suggests the weight is worth carrying — the duty is real, the sacrifice serves something larger, and the difficulty is producing genuine growth or service.",
    whenChallenged: "Suffering without purpose. A difficult card here warns of martyrdom, unnecessary guilt, burdens taken on out of obligation rather than conviction, or pain that has outlived its lesson.",
  },
];

export const HOUSE_BY_ID = new Map(HOUSE_MEANINGS.map((house) => [house.id, house]));

export function getHouseMeaning(id: number): HouseMeaning {
  const house = HOUSE_BY_ID.get(id);
  if (!house) {
    throw new Error(`Unknown house id ${id}`);
  }
  return house;
}
