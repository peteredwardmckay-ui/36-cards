#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const PROJECT_ROOT = process.cwd();

async function loadEnvFile(fileName) {
  const filePath = path.join(PROJECT_ROOT, fileName);
  let raw = "";
  try {
    raw = await readFile(filePath, "utf8");
  } catch {
    return;
  }

  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function loadEnvFiles() {
  await loadEnvFile(".env");
  await loadEnvFile(".env.local");
}

const BRAND_TONE =
  "Brand context: 36 Cards (primary), 36cards.com (secondary). Tone is calm, intelligent, slightly mystical, and grounded. Premium editorial quality, never cheesy.";

const THEMES = [
  {
    id: "botanical-engraving",
    label: "Botanical Engraving",
    style: "etched botanical linework, natural pigments, aged parchment texture, precise symbolic composition",
    cardBackDirection: "botanical wreath motif around a subtle 36 emblem, refined engraved frame, elegant restraint",
  },
  {
    id: "gothic-ink",
    label: "Gothic Ink",
    style: "gothic ink wash, moonlit contrast, ornate filigree, deep shadows, archival manuscript feel",
    cardBackDirection: "cathedral geometry, moon sigils, subtle silver line details with central 36 crest",
  },
  {
    id: "retro-sci-fi",
    label: "Retro Sci-Fi",
    style: "mid-century retro futurism, halftone texture, geometric control panels, optimistic analog future",
    cardBackDirection: "radar circles, star chart lines, bold but clean 36 insignia",
  },
  {
    id: "vaporwave-neon",
    label: "Vaporwave Neon",
    style: "neon gradients, chrome highlights, synth horizon grid, dreamy but readable symbolism",
    cardBackDirection: "magenta cyan frame, grid horizon accent, central 36 mark with glow restraint",
  },
  {
    id: "whimsical-storybook",
    label: "Whimsical Storybook",
    style: "hand-painted gouache, soft storybook forms, warm paper grain, playful yet elegant",
    cardBackDirection: "storybook crest, ribbon ornament, gentle ornamental border with 36 centerpiece",
  },
  {
    id: "minimal-luxe",
    label: "Minimal Luxe",
    style: "quiet premium minimalism, refined iconography, soft neutral palette, subtle material depth",
    cardBackDirection: "debossed monogram feel, thin metallic frame, restrained 36 monoseal",
  },
];

const CARDS = [
  [1, "Rider", "swift arrival, message delivery, momentum"],
  [2, "Clover", "small luck, brief opening, lightness"],
  [3, "Ship", "journey, distance, commerce"],
  [4, "House", "home base, stability, belonging"],
  [5, "Tree", "health, roots, long growth"],
  [6, "Clouds", "uncertainty, obscured clarity, shifting conditions"],
  [7, "Snake", "strategy, complexity, desire"],
  [8, "Coffin", "closure, endings, release"],
  [9, "Bouquet", "gift, grace, appreciation"],
  [10, "Scythe", "decisive cut, urgency, boundary"],
  [11, "Whip", "repetition, tension, discipline"],
  [12, "Birds", "conversation, nerves, social signals"],
  [13, "Child", "newness, simplicity, beginning"],
  [14, "Fox", "caution, craft, tactical awareness"],
  [15, "Bear", "power, resources, stewardship"],
  [16, "Stars", "guidance, clear signal, long vision"],
  [17, "Stork", "change, transition, upgrade"],
  [18, "Dog", "loyalty, alliance, support"],
  [19, "Tower", "institution, boundary, authority"],
  [20, "Garden", "public sphere, network, visibility"],
  [21, "Mountain", "obstacle, delay, persistence"],
  [22, "Crossroads", "choice, branching path, decision"],
  [23, "Mice", "erosion, stress, slow loss"],
  [24, "Heart", "love, values, devotion"],
  [25, "Ring", "commitment, contract, cycle"],
  [26, "Book", "hidden knowledge, study, privacy"],
  [27, "Letter", "document, message, record"],
  [28, "Counterpart", "the other person, mirror role, counterpart dynamic"],
  [29, "Querent", "focal self, identity, agency"],
  [30, "Lily", "maturity, ethics, peace"],
  [31, "Sun", "success, vitality, confidence"],
  [32, "Moon", "recognition, emotion, rhythm"],
  [33, "Key", "solution, certainty, unlock"],
  [34, "Fish", "money flow, trade, liquidity"],
  [35, "Anchor", "career, stability, endurance"],
  [36, "Cross", "burden, meaning, duty"],
];

const LOGO_VARIANTS = [
  {
    id: "logo-primary",
    size: "1024x1024",
    prompt:
      `${BRAND_TONE} Design a premium logo lockup for a Lenormand platform. Include a simple icon mark with the number 36 and a typographic wordmark reading \"36 Cards\" with a smaller secondary lockup \"36cards.com\". Clear geometry, high legibility at favicon scale, modern timeless feeling, transparent or clean neutral background.`,
  },
  {
    id: "logo-wordmark-horizontal",
    size: "1536x1024",
    prompt:
      `${BRAND_TONE} Create a horizontal brand wordmark for \"36 Cards\" with subtle mystical character but grounded professionalism. Include secondary text \"36cards.com\". Keep icon and text balanced, minimal flourishes, editorial spacing, vector-like cleanliness.`,
  },
  {
    id: "logo-icon-only",
    size: "1024x1024",
    prompt:
      `${BRAND_TONE} Create an icon-only brand mark for \"36 Cards\" that works at 16px favicon and app icon sizes. Must feature a memorable 36 monogram, strong silhouette, minimal complexity, high contrast, timeless look.`,
  },
];

function toSlug(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseArgs(argv, defaults) {
  const options = {
    type: "all",
    themes: "all",
    cards: "1-36",
    dryRun: false,
    overwrite: false,
    limit: Number.POSITIVE_INFINITY,
    model: defaults.model,
    quality: defaults.quality,
    logoVariants: LOGO_VARIANTS.length,
    writeActiveBacks: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === "--type" && next) {
      options.type = next;
      i += 1;
    } else if (arg === "--themes" && next) {
      options.themes = next;
      i += 1;
    } else if (arg === "--cards" && next) {
      options.cards = next;
      i += 1;
    } else if (arg === "--limit" && next) {
      options.limit = Number(next);
      i += 1;
    } else if (arg === "--model" && next) {
      options.model = next;
      i += 1;
    } else if (arg === "--quality" && next) {
      options.quality = next;
      i += 1;
    } else if (arg === "--logo-variants" && next) {
      options.logoVariants = Number(next);
      i += 1;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--overwrite") {
      options.overwrite = true;
    } else if (arg === "--write-active-backs") {
      options.writeActiveBacks = true;
    }
  }

  return options;
}

function parseCardSelection(input) {
  const allIds = new Set(CARDS.map(([id]) => id));
  if (input === "all") {
    return allIds;
  }

  const output = new Set();
  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes("-")) {
      const [startRaw, endRaw] = part.split("-");
      const start = Number(startRaw);
      const end = Number(endRaw);
      if (Number.isFinite(start) && Number.isFinite(end)) {
        const step = start <= end ? 1 : -1;
        for (let id = start; step > 0 ? id <= end : id >= end; id += step) {
          if (allIds.has(id)) output.add(id);
        }
      }
    } else {
      const id = Number(part);
      if (allIds.has(id)) output.add(id);
    }
  }

  return output.size ? output : allIds;
}

function parseThemeSelection(input) {
  const all = THEMES.map((theme) => theme.id);
  if (input === "all") {
    return new Set(all);
  }

  const output = new Set();
  for (const value of input.split(",").map((s) => s.trim()).filter(Boolean)) {
    if (all.includes(value)) output.add(value);
  }

  return output.size ? output : new Set(all);
}

function buildCardFacePrompt(card, theme) {
  const [id, name, symbolism] = card;
  return [
    BRAND_TONE,
    `Create a premium Lenormand card face illustration for card ${id} \"${name}\".`,
    `Theme: ${theme.label}. Style direction: ${theme.style}.`,
    `Core symbolism to show clearly: ${symbolism}.`,
    "Composition rules: single focal scene, elegant frame-safe margins, no text, no numerals, no watermark, no logo, no unrelated symbols.",
    "Art quality: highly detailed, coherent lighting, printable illustration quality, card art aesthetic.",
  ].join(" ");
}

function buildCardBackPrompt(theme) {
  return [
    BRAND_TONE,
    `Create a branded Lenormand card back (verso) for theme \"${theme.label}\".`,
    `Style direction: ${theme.style}.`,
    `Back design guidance: ${theme.cardBackDirection}.`,
    "Must include tasteful brand presence with 36 mark and subtle 36cards.com lockup, symmetric design, no clutter.",
    "Output as a single card back illustration, centered, with clean border area.",
  ].join(" ");
}

function ensureTaskDir(filePath) {
  return mkdir(path.dirname(filePath), { recursive: true });
}

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function promptHash(prompt) {
  return createHash("sha256").update(prompt).digest("hex").slice(0, 12);
}

function extractBase64OrUrl(json) {
  const candidates = [
    json?.data?.[0],
    json?.output?.[0],
    json?.result,
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate?.b64_json) {
      return { type: "b64", value: candidate.b64_json };
    }

    if (candidate?.url) {
      return { type: "url", value: candidate.url };
    }

    if (Array.isArray(candidate?.content)) {
      for (const item of candidate.content) {
        if (item?.b64_json) return { type: "b64", value: item.b64_json };
        if (item?.url) return { type: "url", value: item.url };
      }
    }
  }

  return null;
}

async function callOpenAIImage({ model, prompt, size, quality, apiKey, endpoint }) {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set. Add it to .env.local or .env");
  }

  const payload = {
    model,
    prompt,
    size,
    quality,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = json?.error?.message || JSON.stringify(json);
    throw new Error(`OpenAI image request failed (${response.status}): ${detail}`);
  }

  const found = extractBase64OrUrl(json);
  if (!found) {
    throw new Error(`OpenAI response did not contain image data: ${JSON.stringify(json).slice(0, 700)}`);
  }

  if (found.type === "b64") {
    return Buffer.from(found.value, "base64");
  }

  const imageResponse = await fetch(found.value);
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch generated image URL: ${imageResponse.status}`);
  }

  const arrayBuffer = await imageResponse.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function loadManifest(manifestPath) {
  try {
    const raw = await readFile(manifestPath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.entries)) return parsed;
  } catch {
    // ignore
  }

  return {
    generatedAt: null,
    entries: [],
  };
}

function buildTasks(options) {
  const tasks = [];
  const selectedThemes = parseThemeSelection(options.themes);
  const selectedCardIds = parseCardSelection(options.cards);

  const doLogos = options.type === "all" || options.type === "logo";
  const doBacks = options.type === "all" || options.type === "backs" || options.type === "back";
  const doFaces = options.type === "all" || options.type === "faces" || options.type === "cards" || options.type === "card";

  if (doLogos) {
    for (const variant of LOGO_VARIANTS.slice(0, Math.max(1, options.logoVariants))) {
      tasks.push({
        kind: "logo",
        id: variant.id,
        size: variant.size,
        prompt: variant.prompt,
        outputPath: path.join(PROJECT_ROOT, "public/brand/generated/logo", `${variant.id}.png`),
      });
    }
  }

  if (doBacks) {
    for (const theme of THEMES) {
      if (!selectedThemes.has(theme.id)) continue;

      tasks.push({
        kind: "card-back",
        id: theme.id,
        themeId: theme.id,
        size: "1024x1536",
        prompt: buildCardBackPrompt(theme),
        outputPath: path.join(PROJECT_ROOT, "public/brand/generated/card-backs", `${theme.id}.png`),
        activeBackPath: path.join(PROJECT_ROOT, "public/brand/card-backs", `${theme.id}.png`),
      });
    }
  }

  if (doFaces) {
    for (const theme of THEMES) {
      if (!selectedThemes.has(theme.id)) continue;

      for (const card of CARDS) {
        const [id, name] = card;
        if (!selectedCardIds.has(id)) continue;
        const slug = toSlug(name);

        tasks.push({
          kind: "card-face",
          id: `${theme.id}-${id}`,
          themeId: theme.id,
          cardId: id,
          cardName: name,
          size: "1024x1536",
          prompt: buildCardFacePrompt(card, theme),
          outputPath: path.join(PROJECT_ROOT, "public/cards", theme.id, `${String(id).padStart(2, "0")}-${slug}.png`),
        });
      }
    }
  }

  return tasks.slice(0, Number.isFinite(options.limit) ? options.limit : tasks.length);
}

function printPlan(tasks, options) {
  const counts = tasks.reduce(
    (acc, task) => {
      acc[task.kind] = (acc[task.kind] || 0) + 1;
      return acc;
    },
    {},
  );

  console.log("\n36 Cards art generation plan");
  console.log(`- Model: ${options.model}`);
  console.log(`- Quality: ${options.quality}`);
  console.log(`- Dry run: ${options.dryRun}`);
  console.log(`- Overwrite: ${options.overwrite}`);
  console.log(`- Tasks: ${tasks.length}`);
  for (const [kind, count] of Object.entries(counts)) {
    console.log(`  - ${kind}: ${count}`);
  }
  console.log("");
}

async function main() {
  await loadEnvFiles();

  const env = {
    defaultModel: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
    defaultQuality: process.env.OPENAI_IMAGE_QUALITY || "high",
    imageEndpoint:
      process.env.OPENAI_IMAGE_ENDPOINT || "https://api.openai.com/v1/images/generations",
    apiKey: process.env.OPENAI_API_KEY || "",
  };

  const options = parseArgs(process.argv.slice(2), {
    model: env.defaultModel,
    quality: env.defaultQuality,
  });
  const tasks = buildTasks(options);

  if (!tasks.length) {
    console.log("No tasks selected. Check --type/--themes/--cards filters.");
    return;
  }

  printPlan(tasks, options);

  const manifestPath = path.join(PROJECT_ROOT, "public/generated/manifest.json");
  const manifest = await loadManifest(manifestPath);

  let generated = 0;
  let skipped = 0;

  for (let index = 0; index < tasks.length; index += 1) {
    const task = tasks[index];
    const exists = await fileExists(task.outputPath);

    if (exists && !options.overwrite) {
      console.log(`[${index + 1}/${tasks.length}] skip existing ${task.outputPath}`);
      skipped += 1;
      continue;
    }

    await ensureTaskDir(task.outputPath);

    if (options.dryRun) {
      console.log(`[${index + 1}/${tasks.length}] dry-run ${task.kind} -> ${task.outputPath}`);
      console.log(`  promptHash=${promptHash(task.prompt)}`);
      continue;
    }

    console.log(`[${index + 1}/${tasks.length}] generating ${task.kind} -> ${task.outputPath}`);
    const imageBuffer = await callOpenAIImage({
      model: options.model,
      prompt: task.prompt,
      size: task.size,
      quality: options.quality,
      apiKey: env.apiKey,
      endpoint: env.imageEndpoint,
    });

    await writeFile(task.outputPath, imageBuffer);

    if (task.kind === "card-back" && options.writeActiveBacks) {
      await ensureTaskDir(task.activeBackPath);
      await writeFile(task.activeBackPath, imageBuffer);
    }

    const createdAt = new Date().toISOString();

    manifest.entries.push({
      id: task.id,
      kind: task.kind,
      themeId: task.themeId || null,
      cardId: task.cardId || null,
      cardName: task.cardName || null,
      outputPath: path.relative(PROJECT_ROOT, task.outputPath),
      size: task.size,
      model: options.model,
      quality: options.quality,
      promptHash: promptHash(task.prompt),
      createdAt,
    });

    const sidecarPath = `${task.outputPath}.json`;
    await writeFile(
      sidecarPath,
      JSON.stringify(
        {
          id: task.id,
          kind: task.kind,
          themeId: task.themeId || null,
          cardId: task.cardId || null,
          cardName: task.cardName || null,
          size: task.size,
          model: options.model,
          quality: options.quality,
          prompt: task.prompt,
          promptHash: promptHash(task.prompt),
          createdAt,
        },
        null,
        2,
      ),
    );

    generated += 1;
  }

  if (!options.dryRun) {
    manifest.generatedAt = new Date().toISOString();
    await mkdir(path.dirname(manifestPath), { recursive: true });
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  }

  console.log("\nDone.");
  console.log(`Generated: ${generated}`);
  console.log(`Skipped: ${skipped}`);

  if (options.dryRun) {
    console.log("Dry run mode did not call the API.");
  }
}

main().catch((error) => {
  console.error("Art generation failed:", error.message);
  process.exit(1);
});
