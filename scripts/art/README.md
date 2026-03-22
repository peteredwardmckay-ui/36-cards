# AI Art Generation Pipeline

This script batch-generates branded visual assets for 36 Cards using OpenAI Images.

## Requirements

- `OPENAI_API_KEY` in your environment
- Node.js 18+

Optional env vars:

- `OPENAI_IMAGE_MODEL` (default: `gpt-image-1`)
- `OPENAI_IMAGE_QUALITY` (default: `high`)
- `OPENAI_IMAGE_ENDPOINT` (default: `https://api.openai.com/v1/images/generations`)

## Usage

From project root:

```bash
npm run art:dry-run -- --type all --themes botanical-engraving --cards 1-3
npm run art:generate -- --type logo
npm run art:generate -- --type backs --themes all
npm run art:generate -- --type cards --themes botanical-engraving --cards 1-36
npm run art:generate -- --type cards --themes all --cards 1-36 --limit 24
```

## Key flags

- `--type`:
  - `logo`
  - `backs`
  - `cards` (card faces)
  - `all`
- `--themes`: comma list or `all`
- `--cards`: `1-36`, ranges, or comma list (e.g. `1,5,9-12`)
- `--dry-run`: print tasks without API calls
- `--overwrite`: regenerate files even if they exist
- `--write-active-backs`: also write generated PNG backs into `public/brand/card-backs/<theme>.png`
- `--limit`: cap number of generated tasks (cost control)

## Output paths

- Logos: `public/brand/generated/logo/*.png`
- Card backs: `public/brand/generated/card-backs/*.png`
- Card faces: `public/cards/<theme>/<id>-<slug>.png`
- Manifest: `public/generated/manifest.json`
- Prompt sidecars: `*.png.json`

## Notes

- Card face prompts intentionally avoid text/numbers on the art; labels are handled by UI.
- Use `--dry-run` first for cost-safe planning.
- You can curate generated outputs and copy approved files into active app paths.
- App auto-prefers generated assets:
  - Logos from `public/brand/generated/logo`
  - Card faces from `public/cards/<theme>`
  - Card backs from `public/brand/generated/card-backs` (or active `public/brand/card-backs/<theme>.png`)

