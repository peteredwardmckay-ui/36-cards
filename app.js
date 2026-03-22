const STORAGE_KEY = "thirtysixcards_saved_readings_v2";

function card(id, name, focus, domain, gifts, cautions, actions, timing, tags) {
  return { id, name, focus, domain, gifts, cautions, actions, timing, tags };
}

const CARD_LIBRARY = [
  card(1, "Rider", "incoming motion and message delivery", "communication", ["fast updates", "quick alignment"], ["impulsiveness", "unfinished follow-through"], ["answer quickly", "verify the source"], "immediate", ["news", "movement", "arrival"]),
  card(2, "Clover", "small luck and temporary openings", "opportunity", ["timely chance", "light support"], ["inconsistency", "underestimating risk"], ["take the opening", "keep backup plans"], "short-term", ["luck", "window", "ease"]),
  card(3, "Ship", "distance, expansion, and exploration", "travel", ["new markets", "wider perspective"], ["drift", "overextension"], ["plan logistics", "track spending"], "mid-term", ["journey", "trade", "distance"]),
  card(4, "House", "home base, structure, and belonging", "stability", ["security", "grounding"], ["stagnation", "defensiveness"], ["stabilize routines", "protect boundaries"], "ongoing", ["home", "family", "foundation"]),
  card(5, "Tree", "health, roots, and long growth", "wellbeing", ["resilience", "endurance"], ["slow response", "hidden stress"], ["prioritize recovery", "commit to habits"], "long-term", ["health", "roots", "growth"]),
  card(6, "Clouds", "ambiguity and temporary confusion", "clarity", ["better questions", "signal filtering"], ["misreading facts", "reactive decisions"], ["pause before deciding", "clarify assumptions"], "variable", ["fog", "uncertainty", "complexity"]),
  card(7, "Snake", "complex strategy and layered motives", "strategy", ["tactical intelligence", "creative rerouting"], ["entanglement", "jealous dynamics"], ["audit incentives", "choose precision"], "mid-term", ["strategy", "desire", "twists"]),
  card(8, "Coffin", "closures and controlled endings", "transition", ["clean exits", "needed rest"], ["resistance to ending", "low vitality"], ["close loops", "protect recovery time"], "cycle close", ["ending", "release", "pause"]),
  card(9, "Bouquet", "attraction, invitation, and social grace", "relationships", ["goodwill", "recognition"], ["pleasing over truth", "surface-only harmony"], ["accept support", "signal appreciation"], "near-term", ["gift", "joy", "appeal"]),
  card(10, "Scythe", "decisive cut and rapid consequence", "decision", ["clean prioritization", "risk control"], ["overreaction", "avoidable loss"], ["cut noise", "act with awareness"], "immediate", ["cut", "sudden", "precision"]),
  card(11, "Whip", "repetition, pressure, and refinement", "effort", ["skill sharpening", "honest friction"], ["burnout", "looped conflict"], ["break unhelpful cycles", "channel intensity"], "repeating", ["cycle", "conflict", "practice"]),
  card(12, "Birds", "dialogue, nerves, and short exchanges", "communication", ["quick feedback", "social intelligence"], ["anxiety", "noise"], ["name concerns", "simplify messages"], "short-term", ["talk", "nervous", "pairing"]),
  card(13, "Child", "new starts and simplified scope", "beginnings", ["fresh possibility", "agility"], ["naivety", "immature execution"], ["prototype quickly", "learn in small steps"], "early stage", ["new", "small", "start"]),
  card(14, "Fox", "workcraft, caution, and self-interest", "work", ["smart efficiency", "alertness"], ["mistrust", "overly defensive play"], ["audit details", "protect value"], "near-term", ["work", "caution", "self-interest"]),
  card(15, "Bear", "power, resources, and protection", "finance", ["asset control", "strong backing"], ["dominance issues", "hoarding"], ["negotiate leverage", "manage reserves"], "medium cycle", ["power", "assets", "authority"]),
  card(16, "Stars", "guidance, pattern clarity, and faith", "vision", ["clear direction", "digital/network reach"], ["idealism drift", "disconnection from reality"], ["map long horizons", "align daily steps"], "long arc", ["guidance", "clarity", "signal"]),
  card(17, "Stork", "upgrades, moves, and life edits", "change", ["renewal", "course correction"], ["restlessness", "constant switching"], ["sequence changes", "measure outcomes"], "active cycle", ["change", "move", "upgrade"]),
  card(18, "Dog", "loyal support and trusted alliances", "alliances", ["reliable help", "steady collaboration"], ["dependency", "misplaced trust"], ["choose proven allies", "reciprocate support"], "steady", ["friendship", "support", "trust"]),
  card(19, "Tower", "institutions, standards, and distance", "authority", ["professional authority", "clear standards"], ["isolation", "rigidity"], ["define governance", "schedule check-ins"], "long frame", ["institution", "distance", "status"]),
  card(20, "Garden", "public sphere and networks", "social", ["visibility", "community access"], ["performative behavior", "overexposure"], ["curate public narrative", "show up consistently"], "near-term", ["public", "events", "network"]),
  card(21, "Mountain", "barriers requiring persistence", "obstacles", ["discipline", "strategic patience"], ["delay frustration", "hardening positions"], ["work in stages", "find alternate route"], "slow", ["block", "delay", "effort"]),
  card(22, "Crossroads", "branch points and multi-option paths", "choice", ["agency", "comparative insight"], ["analysis paralysis", "diffused commitment"], ["define criteria", "pick one lane"], "immediate to short", ["choice", "split", "options"]),
  card(23, "Mice", "erosion, anxiety, and minor losses", "stress", ["early warning", "problem detection"], ["attrition", "chronic worry"], ["patch leaks", "reduce noise sources"], "creeping", ["loss", "stress", "erosion"]),
  card(24, "Heart", "values, affection, and devotion", "love", ["warmth", "meaningful bonding"], ["overidealization", "emotional bias"], ["speak values", "prioritize emotional truth"], "ongoing", ["love", "values", "desire"]),
  card(25, "Ring", "agreements, loops, and commitments", "contracts", ["durable partnership", "shared terms"], ["stuck loops", "unexamined obligations"], ["review agreements", "confirm reciprocal terms"], "cycle-based", ["commitment", "contract", "cycle"]),
  card(26, "Book", "hidden knowledge and study", "knowledge", ["specialized learning", "private insight"], ["withholding", "information asymmetry"], ["research deeply", "protect confidentiality"], "developmental", ["study", "privacy", "secrets"]),
  card(27, "Letter", "documents, messages, and records", "communication", ["clear proof", "traceability"], ["miscommunication", "bureaucratic delays"], ["write clearly", "retain records"], "short-term", ["message", "document", "notice"]),
  card(28, "Companion", "the close other and counterpart", "relationships", ["mutual perspective", "shared execution"], ["projection", "co-dependency"], ["name roles", "co-design next steps"], "near-term", ["partner", "counterpart", "mirror"]),
  card(29, "Querant", "the reading focal self", "identity", ["self-awareness", "agency"], ["self-protection loops", "identity conflict"], ["set intention", "act from values"], "immediate", ["self", "identity", "agency"]),
  card(30, "Lily", "maturity, ethics, and peaceful order", "legacy", ["wise pacing", "diplomacy"], ["complacency", "passive avoidance"], ["favor quality", "model integrity"], "long-term", ["maturity", "peace", "ethics"]),
  card(31, "Sun", "vitality, confidence, and success", "success", ["visibility", "strong momentum"], ["overconfidence", "heat without balance"], ["lead visibly", "convert momentum to structure"], "immediate to short", ["success", "vitality", "confidence"]),
  card(32, "Moon", "reputation, sensitivity, and cycles", "recognition", ["creative attunement", "public resonance"], ["mood volatility", "approval dependence"], ["track cycles", "protect emotional bandwidth"], "cyclical", ["emotion", "recognition", "rhythm"]),
  card(33, "Key", "certainty, access, and resolution", "solution", ["decisive breakthrough", "verification"], ["locking too early", "binary thinking"], ["validate assumptions", "commit when clear"], "pivot moment", ["solution", "access", "certainty"]),
  card(34, "Fish", "money flow, trade, and liquidity", "finance", ["cash movement", "commercial adaptability"], ["leakage", "drifted spending"], ["track inflow/outflow", "price with clarity"], "market-driven", ["money", "flow", "trade"]),
  card(35, "Anchor", "career continuity and durable effort", "career", ["stability", "long effort payoff"], ["stuck attachment", "work fatigue"], ["define sustainable pace", "recommit to priorities"], "long-term", ["career", "stability", "endurance"]),
  card(36, "Cross", "burden, meaning, and sacred duty", "purpose", ["deep significance", "spiritual grit"], ["overweight responsibility", "martyr pattern"], ["release non-essential burdens", "honor true obligations"], "fated cycle", ["burden", "meaning", "destiny"]),
];

const CARD_BY_ID = new Map(CARD_LIBRARY.map((entry) => [entry.id, entry]));

const THEMES = [
  {
    id: "vintage",
    label: "Vintage Engraving",
    swatchClass: "theme-vintage-swatch",
    cardClass: "theme-vintage",
    voice: "The spread is read like archival correspondence where cause and consequence leave clear inked traces.",
  },
  {
    id: "botanical",
    label: "Botanical Greenhouse",
    swatchClass: "theme-botanical-swatch",
    cardClass: "theme-botanical",
    voice: "The spread is framed as an ecosystem: what you feed grows, what you neglect withers, and timing is seasonal.",
  },
  {
    id: "noir",
    label: "Noir Bureau",
    swatchClass: "theme-noir-swatch",
    cardClass: "theme-noir",
    voice: "The spread reads like an investigation file: motives, leverage, and timing windows decide outcomes.",
  },
  {
    id: "celestial",
    label: "Celestial Observatory",
    swatchClass: "theme-celestial-swatch",
    cardClass: "theme-celestial",
    voice: "The spread is mapped as a star chart where alignment, rhythm, and visibility determine the unfolding line.",
  },
  {
    id: "harbor",
    label: "Harbor Cartography",
    swatchClass: "theme-harbor-swatch",
    cardClass: "theme-harbor",
    voice: "The spread is interpreted as a navigation board: currents, anchors, and safe routes matter more than raw speed.",
  },
];

const THEME_BY_ID = new Map(THEMES.map((theme) => [theme.id, theme]));

const INTERPRETATION_REPOSITORY = {
  houseTemplates: [
    "{cardName} in {houseName} House activates {houseDomain} through {cardDomain}; the practical edge comes from {actionOne}.",
    "House logic says {houseName} sets the stage: {cardName} performs best when {actionOne} and avoids {cautionOne}.",
    "In this seat, {cardName} translates into {houseDomain} priorities; treat {giftOne} as the lever and {cautionOne} as the watchpoint.",
    "{houseName} House reframes {cardName} toward {houseDomain}. The read improves if you pair {actionOne} with measurable checkpoints.",
    "{cardName} lands where {houseName} rules. Expect {giftOne}, but keep safeguards around {cautionOne}.",
    "The card-house blend emphasizes {houseDomain} decisions: lead with {actionOne}, then stabilize with {actionTwo}.",
    "{cardName} inherits {houseName}'s agenda. This makes {giftOne} usable when the querant names a concrete deliverable.",
    "With {houseName} as context, {cardName} suggests a two-step strategy: {actionOne}, then {actionTwo}.",
    "This placement frames {cardName} as a {houseDomain} operator. Move quickly on {giftOne}, but do not ignore {cautionOne}.",
    "{houseName} House turns {cardName} into a policy card: define terms early, then execute {actionOne}.",
  ],
  diagonalTemplates: [
    "NW-SE axis runs from {nwseStart} to {nwseEnd}, showing a legacy-to-outcome line where {cardName} acts as the hinge.",
    "NE-SW axis links {neswStart} and {neswEnd}; this is a social/material crossing that clarifies where pressure is building.",
    "Diagonal spread suggests multi-vector influence: {diagLead} introduces context while {diagTail} indicates where momentum consolidates.",
    "On diagonals, {cardName} amplifies pattern recognition. Events on both axes mirror each other through timing offsets.",
    "The diagonals indicate transfer: insight from {diagLead} can be applied directly to constraints around {diagTail}.",
    "When diagonal endpoints are {nwseStart} and {neswEnd}, you get a cross-current that rewards sequence planning.",
    "This diagonal geometry implies the past is still active. Treat early cues as predictive, not historical.",
    "Diagonal cards suggest parallel storylines converging around {cardName}; do not read this position in isolation.",
  ],
  knightTemplates: [
    "Knight cards are catalysts rather than neighbors. {topKnight} is a jump trigger that can advance the matter abruptly.",
    "Knight geometry implies non-linear progress: outcomes arrive by detour, especially through {topKnight}.",
    "Treat knight links as alerts. {topKnight} can introduce a new actor or sudden variable into the timeline.",
    "The knight pattern favors strategic hops over direct force. Shift lanes before pushing harder.",
    "Knight cards expose hidden dependencies; {topKnight} shows where indirect leverage is strongest.",
    "In this configuration, the knight web behaves like an escalation ladder. Watch the second move, not just the first.",
    "Knight vectors suggest that timing beats volume. A precise move near {topKnight} outperforms broad effort.",
    "These leaps indicate fast context switching. Keep communication concise and commitments explicit.",
  ],
  chainTemplates: [
    "Row chain maps immediate storyline: {rowChain}. This is the short-horizon operating lane.",
    "Column chain maps structural storyline: {columnChain}. This is the deep support layer behind visible events.",
    "Querant path sequence ({pathToQuerant}) shows how the issue translates into personal agency.",
    "Companion path sequence ({pathToCompanion}) shows how counterpart dynamics alter execution.",
    "Chain logic says sequence matters: lock the first link before expanding into adjacent cards.",
    "Where row and column themes intersect, the matter becomes decision-critical and less reversible.",
    "Chain analysis favors staged rollouts: define phase one, validate, then move to phase two.",
    "This chain indicates the spread is process-heavy; discipline in order of operations is essential.",
  ],
  proximityTemplates: [
    "Nearest cards ({nearOne}, {nearTwo}) create the active weather around {cardName}.",
    "Ring-1 proximity shows immediate influences, while ring-2 cards describe background pressure.",
    "{nearOne} has the highest proximity weight; if ignored, it becomes the source of avoidable drag.",
    "Proximity clustering indicates what the querant feels day-to-day versus what unfolds in longer cycles.",
    "Close cards describe tactical constraints; distant cards describe strategic direction.",
    "When proximity weights are concentrated, decision windows narrow and execution quality matters more.",
    "The local card field around {cardName} emphasizes compounding effects rather than single events.",
    "Proximity analysis advises triage: resolve the closest friction before chasing distant opportunities.",
  ],
  strategyTemplates: [
    "Prioritize {actionOne} first, then {actionTwo}; this keeps {cautionOne} from compounding.",
    "Use {giftOne} as your lead indicator and review progress on a {timing} cadence.",
    "Frame the next move around {houseDomain}; avoid over-expanding until baseline stability is visible.",
    "Anchor decisions in one measurable outcome to avoid narrative drift.",
    "Treat this as a phased sequence: clarify, commit, and then consolidate.",
    "Run a two-track plan: immediate response plus structural correction.",
    "Communicate commitments explicitly to prevent interpretive gaps between cards.",
    "Adjust pace to match signal quality. Fast where clear, slow where mixed.",
  ],
};

const state = {
  spread: [],
  selectedThemes: ["vintage", "celestial"],
  revealState: Array(36).fill(false),
  selectedIndex: null,
  isDealing: false,
  dealToken: 0,
  currentInterpretation: null,
  savedReadings: [],
  cardNodes: [],
};

const ui = {
  siteShell: document.getElementById("siteShell"),
  themeRow: document.getElementById("themeRow"),
  tableau: document.getElementById("tableau"),
  repositoryView: document.getElementById("repositoryView"),
  statusLine: document.getElementById("statusLine"),
  queryInput: document.getElementById("queryInput"),
  notesInput: document.getElementById("notesInput"),
  savedList: document.getElementById("savedList"),
  focusBadge: document.getElementById("focusBadge"),
  themeVoice: document.getElementById("themeVoice"),
  synthesisText: document.getElementById("synthesisText"),
  houseRead: document.getElementById("houseRead"),
  diagonalRead: document.getElementById("diagonalRead"),
  knightRead: document.getElementById("knightRead"),
  chainRead: document.getElementById("chainRead"),
  proximityRead: document.getElementById("proximityRead"),
  potentialReads: document.getElementById("potentialReads"),
  dealBtn: document.getElementById("dealBtn"),
  revealBtn: document.getElementById("revealBtn"),
  saveBtn: document.getElementById("saveBtn"),
  pdfBtn: document.getElementById("pdfBtn"),
};

function shuffleDeck(deck) {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toPos(index) {
  return { row: Math.floor(index / 9), col: index % 9 };
}

function toIndex(row, col) {
  if (row < 0 || row > 3 || col < 0 || col > 8) {
    return -1;
  }
  return row * 9 + col;
}

function themeForPosition(index) {
  const themeId = state.selectedThemes[index % state.selectedThemes.length];
  return THEME_BY_ID.get(themeId) || THEMES[0];
}

function setStatus(message) {
  ui.statusLine.textContent = message;
}

function applySiteTheme() {
  ui.siteShell.classList.remove(...THEMES.map((theme) => `site-theme-${theme.id}`));
  const primary = state.selectedThemes[0] || THEMES[0].id;
  ui.siteShell.classList.add(`site-theme-${primary}`);
  const themeLabels = state.selectedThemes.map((id) => THEME_BY_ID.get(id)?.label).filter(Boolean);
  const themeVoices = state.selectedThemes.map((id) => THEME_BY_ID.get(id)?.voice).filter(Boolean);
  ui.themeVoice.textContent = `${themeLabels.join(" + ")}: ${themeVoices.join(" ")}`;
}

function renderThemes() {
  ui.themeRow.innerHTML = "";

  THEMES.forEach((theme) => {
    const label = document.createElement("label");
    label.className = "theme-item";

    const checked = state.selectedThemes.includes(theme.id) ? "checked" : "";
    label.innerHTML = `
      <input type="checkbox" value="${theme.id}" ${checked}>
      <span class="theme-chip">
        <span class="theme-swatch ${theme.swatchClass}" aria-hidden="true"></span>
        <span class="theme-meta">
          <strong>${theme.label}</strong>
          <span>Illustrated palette + interpretation voice</span>
        </span>
      </span>
    `;

    const input = label.querySelector("input");
    input.addEventListener("change", () => {
      if (input.checked) {
        if (!state.selectedThemes.includes(theme.id)) {
          state.selectedThemes.push(theme.id);
        }
      } else {
        state.selectedThemes = state.selectedThemes.filter((id) => id !== theme.id);
      }

      if (!state.selectedThemes.length) {
        state.selectedThemes = [THEMES[0].id];
        renderThemes();
      }

      applySiteTheme();
      renderTableau();

      if (state.selectedIndex !== null && state.revealState[state.selectedIndex]) {
        selectCard(state.selectedIndex);
      }
    });

    ui.themeRow.appendChild(label);
  });
}

function renderTableau() {
  ui.tableau.innerHTML = "";
  state.cardNodes = [];

  state.spread.forEach((currentCard, index) => {
    const houseCard = CARD_LIBRARY[index];
    const theme = themeForPosition(index);

    const node = document.createElement("button");
    node.type = "button";
    node.className = `tableau-card ${theme.cardClass}`;
    node.dataset.index = String(index);
    node.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-back">
          <div class="back-brand">
            <div class="back-sigil">36</div>
            <strong>36cards.com</strong>
            <span>Grand Tableau</span>
          </div>
        </div>
        <div class="card-face card-front">
          <div class="house-label">${houseCard.name} House</div>
          <div class="card-value">${currentCard.id}. ${currentCard.name}</div>
          <div class="card-tag">${currentCard.focus}</div>
        </div>
      </div>
    `;

    if (state.revealState[index]) {
      node.classList.add("is-revealed");
    }

    node.addEventListener("click", () => {
      if (state.isDealing) {
        setStatus("Cards are still dealing. Wait for reveal to complete.");
        return;
      }

      if (!state.revealState[index]) {
        setStatus("That card is still face-down. Use Reveal Instantly or wait for the deal.");
        return;
      }

      selectCard(index);
    });

    ui.tableau.appendChild(node);
    state.cardNodes.push(node);
  });

  refreshHighlights();
}

function clearInterpretation() {
  state.currentInterpretation = null;
  state.selectedIndex = null;
  ui.focusBadge.textContent = "Awaiting revealed focus card.";
  ui.synthesisText.textContent = "Select a revealed card to generate the layered reading.";
  ui.houseRead.textContent = "-";
  ui.diagonalRead.textContent = "-";
  ui.knightRead.textContent = "-";
  ui.chainRead.textContent = "-";
  ui.proximityRead.textContent = "-";
  ui.potentialReads.innerHTML = "";
  refreshHighlights();
}

function syncRevealClasses() {
  state.cardNodes.forEach((node, index) => {
    node.classList.toggle("is-revealed", Boolean(state.revealState[index]));
  });
}

function findCardIndexById(cardId) {
  return state.spread.findIndex((entry) => entry.id === cardId);
}

function collectDirection(index, dr, dc) {
  const items = [];
  const start = toPos(index);
  let row = start.row + dr;
  let col = start.col + dc;

  while (row >= 0 && row <= 3 && col >= 0 && col <= 8) {
    const idx = toIndex(row, col);
    items.push(idx);
    row += dr;
    col += dc;
  }

  return items;
}

function diagonalLineNWSE(index) {
  const nw = collectDirection(index, -1, -1).reverse();
  const se = collectDirection(index, 1, 1);
  return [...nw, index, ...se];
}

function diagonalLineNESW(index) {
  const ne = collectDirection(index, -1, 1).reverse();
  const sw = collectDirection(index, 1, -1);
  return [...ne, index, ...sw];
}

function knightIndices(index) {
  const offsets = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ];

  const origin = toPos(index);
  return offsets
    .map(([dr, dc]) => toIndex(origin.row + dr, origin.col + dc))
    .filter((value) => value >= 0);
}

function rowIndices(index) {
  const { row } = toPos(index);
  return Array.from({ length: 9 }, (_, col) => toIndex(row, col));
}

function columnIndices(index) {
  const { col } = toPos(index);
  return Array.from({ length: 4 }, (_, row) => toIndex(row, col));
}

function pathIndices(fromIndex, toIndexValue) {
  if (fromIndex < 0 || toIndexValue < 0) {
    return [];
  }

  const from = toPos(fromIndex);
  const to = toPos(toIndexValue);
  const indices = [fromIndex];

  let col = from.col;
  let row = from.row;

  while (col !== to.col) {
    col += col < to.col ? 1 : -1;
    indices.push(toIndex(row, col));
  }

  while (row !== to.row) {
    row += row < to.row ? 1 : -1;
    indices.push(toIndex(row, col));
  }

  return indices;
}

function proximityEntries(index) {
  const origin = toPos(index);
  const entries = [];

  state.spread.forEach((item, idx) => {
    if (idx === index) {
      return;
    }

    const candidate = toPos(idx);
    const dx = Math.abs(origin.col - candidate.col);
    const dy = Math.abs(origin.row - candidate.row);
    const ring = Math.max(dx, dy);

    if (ring > 2) {
      return;
    }

    const distance = Math.sqrt(dx * dx + dy * dy);
    const weight = Number((1 / (0.6 + distance)).toFixed(2));

    entries.push({
      index: idx,
      card: item,
      ring,
      weight,
      distance,
    });
  });

  entries.sort((a, b) => b.weight - a.weight);
  return entries;
}

function cardsToList(indices, maxItems = 7) {
  return indices
    .slice(0, maxItems)
    .map((idx) => `${state.spread[idx].name}`)
    .join(" -> ");
}

function cardNames(indices, maxItems = 5) {
  return indices
    .slice(0, maxItems)
    .map((idx) => state.spread[idx].name)
    .join(", ") || "none";
}

function pickTemplate(pool, seed, offset = 0) {
  const idx = Math.abs(seed + offset) % pool.length;
  return pool[idx];
}

function fill(template, values) {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => {
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      return values[key];
    }
    return "";
  });
}

function generateInterpretation(index) {
  const selected = state.spread[index];
  const houseCard = CARD_LIBRARY[index];
  const nwse = diagonalLineNWSE(index);
  const nesw = diagonalLineNESW(index);
  const knight = knightIndices(index);
  const rowChain = rowIndices(index);
  const columnChain = columnIndices(index);

  const querantIndex = findCardIndexById(29);
  const companionIndex = findCardIndexById(28);
  const pathToQuerant = pathIndices(index, querantIndex);
  const pathToCompanion = pathIndices(index, companionIndex);
  const proximity = proximityEntries(index);

  const seed = selected.id * 37 + houseCard.id * 11 + index * 13;
  const topKnight = knight.length ? state.spread[knight[0]].name : "no direct knight trigger";
  const nearOne = proximity[0]?.card.name || "none";
  const nearTwo = proximity[1]?.card.name || "none";

  const templateValues = {
    cardName: selected.name,
    houseName: houseCard.name,
    houseDomain: houseCard.domain,
    cardDomain: selected.domain,
    giftOne: selected.gifts[0],
    actionOne: selected.actions[0],
    actionTwo: selected.actions[1],
    cautionOne: selected.cautions[0],
    timing: selected.timing,
    nwseStart: state.spread[nwse[0]].name,
    nwseEnd: state.spread[nwse[nwse.length - 1]].name,
    neswStart: state.spread[nesw[0]].name,
    neswEnd: state.spread[nesw[nesw.length - 1]].name,
    diagLead: state.spread[nwse[0]].name,
    diagTail: state.spread[nesw[nesw.length - 1]].name,
    topKnight,
    rowChain: cardsToList(rowChain),
    columnChain: cardsToList(columnChain),
    pathToQuerant: cardsToList(pathToQuerant),
    pathToCompanion: cardsToList(pathToCompanion),
    nearOne,
    nearTwo,
  };

  const houseText = fill(pickTemplate(INTERPRETATION_REPOSITORY.houseTemplates, seed), templateValues);
  const diagonalText = [
    fill(pickTemplate(INTERPRETATION_REPOSITORY.diagonalTemplates, seed, 1), templateValues),
    fill(pickTemplate(INTERPRETATION_REPOSITORY.diagonalTemplates, seed, 2), templateValues),
  ].join(" ");

  const knightText = [
    fill(pickTemplate(INTERPRETATION_REPOSITORY.knightTemplates, seed, 3), templateValues),
    `Knight cards in play: ${cardNames(knight, 8)}.`,
  ].join(" ");

  const chainText = [
    fill(pickTemplate(INTERPRETATION_REPOSITORY.chainTemplates, seed, 4), templateValues),
    fill(pickTemplate(INTERPRETATION_REPOSITORY.chainTemplates, seed, 5), templateValues),
  ].join(" ");

  const proximityText = [
    fill(pickTemplate(INTERPRETATION_REPOSITORY.proximityTemplates, seed, 6), templateValues),
    `High-weight cluster: ${proximity
      .slice(0, 4)
      .map((item) => `${item.card.name} (${item.weight})`)
      .join(", ") || "none"}.`,
  ].join(" ");

  const strategyText = fill(pickTemplate(INTERPRETATION_REPOSITORY.strategyTemplates, seed, 7), templateValues);

  const synthesis = [
    `${selected.id}. ${selected.name} is seated in ${houseCard.name} House, merging ${selected.focus} with ${houseCard.focus}.`,
    `Core gifts available now: ${selected.gifts.join(" and ")}.`,
    `Main caution to monitor: ${selected.cautions[0]}.`,
    strategyText,
  ].join(" ");

  const potentialReads = [
    fill(pickTemplate(INTERPRETATION_REPOSITORY.houseTemplates, seed, 0), templateValues),
    fill(pickTemplate(INTERPRETATION_REPOSITORY.houseTemplates, seed, 2), templateValues),
    fill(pickTemplate(INTERPRETATION_REPOSITORY.diagonalTemplates, seed, 1), templateValues),
    fill(pickTemplate(INTERPRETATION_REPOSITORY.knightTemplates, seed, 2), templateValues),
    fill(pickTemplate(INTERPRETATION_REPOSITORY.chainTemplates, seed, 3), templateValues),
    fill(pickTemplate(INTERPRETATION_REPOSITORY.proximityTemplates, seed, 4), templateValues),
    fill(pickTemplate(INTERPRETATION_REPOSITORY.strategyTemplates, seed, 5), templateValues),
    fill(pickTemplate(INTERPRETATION_REPOSITORY.strategyTemplates, seed, 7), templateValues),
  ];

  return {
    focusLine: `${selected.name} in ${houseCard.name} House`,
    selected,
    houseCard,
    synthesis,
    houseText,
    diagonalText,
    knightText,
    chainText,
    proximityText,
    potentialReads,
    highlight: {
      diagonal: new Set([...nwse, ...nesw]),
      knight: new Set(knight),
      proximity: new Set(proximity.slice(0, 6).map((entry) => entry.index)),
    },
    paths: {
      rowChain,
      columnChain,
      pathToQuerant,
      pathToCompanion,
      nwse,
      nesw,
      knight,
      proximity,
    },
  };
}

function renderInterpretation(interpretation) {
  ui.focusBadge.textContent = `${interpretation.focusLine} | ${interpretation.selected.timing} rhythm`;
  ui.synthesisText.textContent = interpretation.synthesis;
  ui.houseRead.textContent = interpretation.houseText;
  ui.diagonalRead.textContent = interpretation.diagonalText;
  ui.knightRead.textContent = interpretation.knightText;
  ui.chainRead.textContent = interpretation.chainText;
  ui.proximityRead.textContent = interpretation.proximityText;

  ui.potentialReads.innerHTML = "";
  interpretation.potentialReads.forEach((line) => {
    const li = document.createElement("li");
    li.textContent = line;
    ui.potentialReads.appendChild(li);
  });
}

function refreshHighlights() {
  state.cardNodes.forEach((node) => {
    node.classList.remove("is-selected", "is-diagonal", "is-knight", "is-proximity");
  });

  if (state.selectedIndex === null || !state.currentInterpretation) {
    return;
  }

  state.cardNodes[state.selectedIndex]?.classList.add("is-selected");

  state.currentInterpretation.highlight.diagonal.forEach((idx) => {
    if (idx !== state.selectedIndex) {
      state.cardNodes[idx]?.classList.add("is-diagonal");
    }
  });

  state.currentInterpretation.highlight.knight.forEach((idx) => {
    if (idx !== state.selectedIndex) {
      state.cardNodes[idx]?.classList.add("is-knight");
    }
  });

  state.currentInterpretation.highlight.proximity.forEach((idx) => {
    if (idx !== state.selectedIndex) {
      state.cardNodes[idx]?.classList.add("is-proximity");
    }
  });
}

function selectCard(index) {
  state.selectedIndex = index;
  state.currentInterpretation = generateInterpretation(index);
  renderInterpretation(state.currentInterpretation);
  refreshHighlights();
  setStatus(`Focused ${state.currentInterpretation.focusLine}. Repository logic refreshed.`);
}

async function dealSpread(animated = true) {
  const token = ++state.dealToken;
  state.isDealing = true;

  if (!animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    state.revealState = Array(36).fill(true);
    syncRevealClasses();
    state.isDealing = false;
    autoSelectDefaultFocus();
    return;
  }

  setStatus("Dealing cards: branded versos are turning over to reveal the spread.");

  for (let i = 0; i < state.spread.length; i += 1) {
    if (token !== state.dealToken) {
      return;
    }

    await wait(45 + (i % 9) * 5);
    state.revealState[i] = true;
    state.cardNodes[i]?.classList.add("is-revealed");
  }

  if (token !== state.dealToken) {
    return;
  }

  state.isDealing = false;
  autoSelectDefaultFocus();
}

function autoSelectDefaultFocus() {
  const querantIndex = findCardIndexById(29);
  const focusIndex = querantIndex >= 0 ? querantIndex : 0;
  selectCard(focusIndex);
}

async function startNewReading(animated = true) {
  state.spread = shuffleDeck(CARD_LIBRARY);
  state.revealState = Array(36).fill(false);
  clearInterpretation();
  renderTableau();
  await dealSpread(animated);
}

function revealAllNow() {
  state.dealToken += 1;
  state.isDealing = false;
  state.revealState = Array(36).fill(true);
  syncRevealClasses();
  if (state.selectedIndex === null) {
    autoSelectDefaultFocus();
  }
  setStatus("All cards revealed instantly.");
}

function parseSavedReadings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (_error) {
    return [];
  }
}

function persistSavedReadings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.savedReadings));
}

function formatSavedDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch (_error) {
    return "unknown date";
  }
}

function renderSavedReadings() {
  ui.savedList.innerHTML = "";

  if (!state.savedReadings.length) {
    const empty = document.createElement("div");
    empty.className = "saved-empty";
    empty.textContent = "No saved readings yet. Save one to build your reading archive.";
    ui.savedList.appendChild(empty);
    return;
  }

  state.savedReadings.forEach((entry) => {
    const wrapper = document.createElement("div");
    wrapper.className = "saved-item";

    const title = entry.query?.trim() ? entry.query.trim() : "General reading";
    const themeLabels = (entry.themes || [])
      .map((id) => THEME_BY_ID.get(id)?.label)
      .filter(Boolean)
      .join(" + ");

    wrapper.innerHTML = `
      <div class="saved-title">${title}</div>
      <div class="saved-meta">${formatSavedDate(entry.createdAt)} | ${themeLabels || "default theme"}</div>
      <div class="saved-actions">
        <button type="button" data-action="load" data-id="${entry.id}">Load</button>
        <button type="button" data-action="delete" data-id="${entry.id}">Delete</button>
      </div>
    `;

    wrapper.querySelector("[data-action='load']").addEventListener("click", () => loadReading(entry.id));
    wrapper.querySelector("[data-action='delete']").addEventListener("click", () => deleteReading(entry.id));

    ui.savedList.appendChild(wrapper);
  });
}

function saveReading() {
  const snapshot = {
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
    query: ui.queryInput.value.trim(),
    notes: ui.notesInput.value.trim(),
    themes: [...state.selectedThemes],
    spreadIds: state.spread.map((entry) => entry.id),
    selectedIndex: state.selectedIndex,
  };

  state.savedReadings.unshift(snapshot);
  state.savedReadings = state.savedReadings.slice(0, 60);
  persistSavedReadings();
  renderSavedReadings();
  setStatus("Reading saved locally. You can load it any time from this browser.");
}

function loadReading(id) {
  const snapshot = state.savedReadings.find((entry) => entry.id === id);
  if (!snapshot) {
    setStatus("Saved reading not found.");
    return;
  }

  const rebuiltSpread = snapshot.spreadIds.map((cardId) => CARD_BY_ID.get(cardId)).filter(Boolean);
  if (rebuiltSpread.length !== 36) {
    setStatus("Saved reading is incomplete and cannot be loaded.");
    return;
  }

  const validThemes = (snapshot.themes || []).filter((themeId) => THEME_BY_ID.has(themeId));
  state.selectedThemes = validThemes.length ? validThemes : [THEMES[0].id];
  state.spread = rebuiltSpread;
  state.revealState = Array(36).fill(true);
  state.selectedIndex = null;

  ui.queryInput.value = snapshot.query || "";
  ui.notesInput.value = snapshot.notes || "";

  renderThemes();
  applySiteTheme();
  renderTableau();

  const focus = Number.isInteger(snapshot.selectedIndex) ? snapshot.selectedIndex : findCardIndexById(29);
  const normalizedFocus = focus >= 0 ? focus : 0;
  selectCard(normalizedFocus);

  setStatus(`Loaded reading from ${formatSavedDate(snapshot.createdAt)}.`);
}

function deleteReading(id) {
  state.savedReadings = state.savedReadings.filter((entry) => entry.id !== id);
  persistSavedReadings();
  renderSavedReadings();
  setStatus("Saved reading deleted.");
}

function escapeHtml(input) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderRepositoryView() {
  const cardKnowledge = CARD_LIBRARY.map((entry) => `
    <li><strong>${entry.id}. ${entry.name}</strong>: ${entry.focus}; gifts ${entry.gifts[0]} + ${entry.gifts[1]}; cautions ${entry.cautions[0]} + ${entry.cautions[1]}.</li>
  `).join("");

  const houseTemplates = INTERPRETATION_REPOSITORY.houseTemplates.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
  const diagonalTemplates = INTERPRETATION_REPOSITORY.diagonalTemplates.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
  const knightTemplates = INTERPRETATION_REPOSITORY.knightTemplates.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
  const chainTemplates = INTERPRETATION_REPOSITORY.chainTemplates.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
  const proximityTemplates = INTERPRETATION_REPOSITORY.proximityTemplates.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
  const strategyTemplates = INTERPRETATION_REPOSITORY.strategyTemplates.map((line) => `<li>${escapeHtml(line)}</li>`).join("");

  ui.repositoryView.innerHTML = `
    <details class="repo-block" open>
      <summary><strong>Card Profile Repository (${CARD_LIBRARY.length} entries)</strong></summary>
      <ol class="repo-list">${cardKnowledge}</ol>
    </details>

    <details class="repo-block" open>
      <summary><strong>House Read Templates (${INTERPRETATION_REPOSITORY.houseTemplates.length})</strong></summary>
      <ul class="repo-list">${houseTemplates}</ul>
    </details>

    <details class="repo-block">
      <summary><strong>Diagonal Templates (${INTERPRETATION_REPOSITORY.diagonalTemplates.length})</strong></summary>
      <ul class="repo-list">${diagonalTemplates}</ul>
    </details>

    <details class="repo-block">
      <summary><strong>Knight Templates (${INTERPRETATION_REPOSITORY.knightTemplates.length})</strong></summary>
      <ul class="repo-list">${knightTemplates}</ul>
    </details>

    <details class="repo-block">
      <summary><strong>Chain Templates (${INTERPRETATION_REPOSITORY.chainTemplates.length})</strong></summary>
      <ul class="repo-list">${chainTemplates}</ul>
    </details>

    <details class="repo-block">
      <summary><strong>Proximity Templates (${INTERPRETATION_REPOSITORY.proximityTemplates.length})</strong></summary>
      <ul class="repo-list">${proximityTemplates}</ul>
    </details>

    <details class="repo-block">
      <summary><strong>Strategy Templates (${INTERPRETATION_REPOSITORY.strategyTemplates.length})</strong></summary>
      <ul class="repo-list">${strategyTemplates}</ul>
    </details>
  `;
}

async function captureReadingImage() {
  const capture = document.getElementById("readingCapture");
  const ads = capture.querySelectorAll(".ad-slot");
  const backups = [];

  ads.forEach((slot) => {
    backups.push({ slot, display: slot.style.display });
    slot.style.display = "none";
  });

  try {
    const canvas = await html2canvas(capture, {
      scale: 1.6,
      backgroundColor: "#faf4e8",
    });
    return canvas;
  } finally {
    backups.forEach(({ slot, display }) => {
      slot.style.display = display;
    });
  }
}

function addWrappedParagraph(pdf, text, x, y, maxWidth, lineHeight = 4.2) {
  const lines = pdf.splitTextToSize(text, maxWidth);
  let currentY = y;

  lines.forEach((line) => {
    if (currentY > 282) {
      pdf.addPage();
      currentY = 18;
    }
    pdf.text(line, x, currentY);
    currentY += lineHeight;
  });

  return currentY + 1.5;
}

async function exportBrandedPdf() {
  if (!window.jspdf || !window.html2canvas) {
    setStatus("PDF tooling did not load. Check internet/CDN access and try again.");
    return;
  }

  if (state.selectedIndex === null) {
    autoSelectDefaultFocus();
  }

  setStatus("Generating branded PDF report...");

  const canvas = await captureReadingImage();
  const imageData = canvas.toDataURL("image/jpeg", 0.9);
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const primaryTheme = THEME_BY_ID.get(state.selectedThemes[0]) || THEMES[0];
  const colorMap = {
    vintage: [118, 70, 40],
    botanical: [60, 106, 64],
    noir: [67, 73, 86],
    celestial: [80, 72, 151],
    harbor: [45, 101, 126],
  };

  const [r, g, b] = colorMap[primaryTheme.id] || colorMap.vintage;

  pdf.setFillColor(r, g, b);
  pdf.rect(0, 0, 210, 26, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("36cards.com", 12, 12.5);
  pdf.setFontSize(11);
  pdf.text("Lenormand Grand Tableau Report", 12, 20);

  const question = ui.queryInput.value.trim() || "General reading";
  const themes = state.selectedThemes.map((id) => THEME_BY_ID.get(id)?.label).filter(Boolean).join(" + ");
  const created = new Date().toLocaleString();

  pdf.setTextColor(40, 35, 30);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.text(`Generated: ${created}`, 12, 32);
  pdf.text(`Theme mix: ${themes}`, 12, 37);
  pdf.text(`Question: ${question}`, 12, 42);

  const imageWidth = 186;
  const imageHeight = Math.min(120, imageWidth * (canvas.height / canvas.width));
  pdf.addImage(imageData, "JPEG", 12, 46, imageWidth, imageHeight, undefined, "FAST");

  let y = 46 + imageHeight + 7;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("Focus and Summary", 12, y);
  y += 5;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  const focus = state.currentInterpretation?.focusLine || "No focus selected";
  y = addWrappedParagraph(pdf, `Focus: ${focus}`, 12, y, 186);
  y = addWrappedParagraph(pdf, `Synthesis: ${state.currentInterpretation?.synthesis || "No synthesis available."}`, 12, y, 186);

  pdf.addPage();
  pdf.setFillColor(r, g, b);
  pdf.rect(0, 0, 210, 18, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("Detailed Interpretation", 12, 11.5);

  pdf.setTextColor(35, 30, 24);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);

  let sectionY = 24;
  const sections = [
    ["House", state.currentInterpretation?.houseText || "-"],
    ["Diagonals", state.currentInterpretation?.diagonalText || "-"],
    ["Knight Signals", state.currentInterpretation?.knightText || "-"],
    ["Chains", state.currentInterpretation?.chainText || "-"],
    ["Proximities", state.currentInterpretation?.proximityText || "-"],
    ["Reader Notes", ui.notesInput.value.trim() || "No notes recorded."],
  ];

  sections.forEach(([title, body]) => {
    if (sectionY > 276) {
      pdf.addPage();
      sectionY = 18;
    }

    pdf.setFont("helvetica", "bold");
    pdf.text(title, 12, sectionY);
    sectionY += 4.5;
    pdf.setFont("helvetica", "normal");
    sectionY = addWrappedParagraph(pdf, String(body), 12, sectionY, 186);
    sectionY += 2;
  });

  pdf.addPage();
  pdf.setFillColor(r, g, b);
  pdf.rect(0, 0, 210, 18, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("Potential Reads", 12, 11.5);

  pdf.setTextColor(35, 30, 24);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);

  let listY = 24;
  (state.currentInterpretation?.potentialReads || []).forEach((line, idx) => {
    const label = `${idx + 1}. ${line}`;
    if (listY > 280) {
      pdf.addPage();
      listY = 18;
    }
    listY = addWrappedParagraph(pdf, label, 12, listY, 186);
  });

  const fileName = `36cards-grand-tableau-${Date.now()}.pdf`;
  pdf.save(fileName);
  setStatus(`Branded PDF exported: ${fileName}`);
}

function initAds() {
  const adNodes = document.querySelectorAll(".adsbygoogle");
  adNodes.forEach(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_error) {
      // Safe fallback for local/unconfigured environments.
    }
  });
}

function bindEvents() {
  ui.dealBtn.addEventListener("click", () => startNewReading(true));
  ui.revealBtn.addEventListener("click", revealAllNow);
  ui.saveBtn.addEventListener("click", saveReading);
  ui.pdfBtn.addEventListener("click", exportBrandedPdf);
}

async function init() {
  state.savedReadings = parseSavedReadings();
  renderSavedReadings();
  renderRepositoryView();
  renderThemes();
  applySiteTheme();
  bindEvents();

  await startNewReading(true);
  initAds();
}

init();
