/**
 * Converts card face PNGs and card back PNGs to WebP.
 *
 * Card faces:  resized to 400×600 (2× retina for ~200px display size)
 * Card backs:  resized to 400×600 (same dimensions, crisp at all sizes)
 *
 * Originals are kept as fallbacks. Run once; re-running skips existing WebPs.
 *
 * Usage:  node scripts/convert-to-webp.mjs
 */

import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import { join, extname, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const CARD_FACE_DIR = join(ROOT, "public", "cards");
const CARD_BACK_DIR = join(ROOT, "public", "brand", "card-backs");

const FACE_W = 400;
const FACE_H = 600;
const BACK_W = 400;
const BACK_H = 600;
const QUALITY = 83;

let converted = 0;
let skipped = 0;
let totalSavedBytes = 0;

async function convertFile(inputPath, outputPath, width, height) {
  try {
    const existing = await stat(outputPath).catch(() => null);
    if (existing) {
      skipped++;
      return;
    }

    const inputStat = await stat(inputPath);
    await sharp(inputPath)
      .resize(width, height, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outputPath);

    const outputStat = await stat(outputPath);
    const saved = inputStat.size - outputStat.size;
    totalSavedBytes += saved;
    converted++;

    const pct = Math.round((saved / inputStat.size) * 100);
    console.log(
      `  ✓ ${basename(inputPath)} → ${basename(outputPath)}  ` +
      `${(inputStat.size / 1024).toFixed(0)}KB → ${(outputStat.size / 1024).toFixed(0)}KB  (-${pct}%)`
    );
  } catch (err) {
    console.error(`  ✗ ${inputPath}: ${err.message}`);
  }
}

async function processDir(dir, width, height) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await processDir(fullPath, width, height);
    } else if (entry.isFile() && extname(entry.name).toLowerCase() === ".png") {
      const outputPath = join(dir, basename(entry.name, ".png") + ".webp");
      await convertFile(fullPath, outputPath, width, height);
    }
  }
}

console.log("Converting card faces…");
await processDir(CARD_FACE_DIR, FACE_W, FACE_H);

console.log("\nConverting card backs…");
await processDir(CARD_BACK_DIR, BACK_W, BACK_H);

console.log(
  `\nDone. ${converted} converted, ${skipped} already existed. ` +
  `Total saved: ${(totalSavedBytes / 1024 / 1024).toFixed(1)} MB`
);
