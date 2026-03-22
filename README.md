# 36 Cards (36cards.com) - Lenormand Atlas

Production-oriented Next.js web app for ritual-style Lenormand readings.

## Core Product

- Multi-page app flow: `/setup` -> `/ritual` -> `/reveal` -> `/results`
- Spreads:
  - 3-card (Past/Present/Future or Situation/Challenge/Advice)
  - Grand Tableau (classic 8x4 + 4 format)
- Ritual mechanics:
  - Shuffle Intensity slider (`1-10`) with **real agency**
  - Intensity `N` = exactly `N` seeded riffle passes
  - Gaussian-biased split near center + weighted pile interleave
  - Three-pile cut with explicit pile order selection
  - Persisted shuffle/cut step logs for reproducibility
- Reveal experience:
  - Verso-up branded card backs
  - One-by-one flipping animation
- Interpretation depth:
  - Houses / casting board
  - Diagonals
  - Knighting
  - Proximity (near / medium / far)
  - Significator-based reading with gender-neutral cards:
    - `28 Counterpart`
    - `29 Querent`
  - Canonical v1 interpretation subjects + second-layer thematic overlays
- Reading engine:
  - 8-14 insight units
  - 400-600 word narrative target
  - Highlights panel with anchor links
  - Role-aware language (they/them default)
- PDF export:
  - Theme-aware styling
  - Question/date/spread/ritual details
  - Grid + narrative + footer branding
- Ads policy implementation:
  - No ads during ritual/reveal
  - Results page only: first-paragraph slot, conditional mid slot, footer slot
  - Fixed slot sizing to reduce CLS

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Client-side PDF: `html2canvas` + `jsPDF`
- Test coverage: Vitest for GT computations/content checks

## Project Structure

- `app/setup` - configuration and intent capture
- `app/ritual` - seeded shuffle + cut with audit trail
- `app/reveal` - card-by-card reveal
- `app/results` - interpretation, highlights, ads, PDF export
- `app/glossary` - SEO-friendly static glossary pages
- `lib/content` - card/house/technique/pair repositories
- `lib/engine` - GT logic, shuffle RNG, narrative composition
- `lib/state` - local storage persistence
- `components` - UI building blocks
- `brand` - brand kit (logos, tokens, card backs, PDF helpers)

## Install and Run

```bash
nvm use 22
npm install
npm run dev
```

Open [http://localhost:3000/setup](http://localhost:3000/setup).

If you see `Cannot find module './627.js'` / `./638.js` / random Internal Server Error in dev:

```bash
nvm use 22
cd /Users/petermckay/36cards
npm run dev:reset
```

## Tests

```bash
npm run test
```

Golden regression harness:

```bash
npm run test:golden
```

200-case smoke audit harness:

```bash
npm run audit:reading-smoke
```

Audit artifacts are written to:

- `reports/reading-golden-latest.json`
- `reports/reading-engine-smoke-latest.json`
- timestamped smoke snapshots in `reports/reading-engine-smoke-*.json`

Current tests cover:

- House mapping correctness
- Knighting/diagonal/proximity GT computations
- Content repository counts and minimum variant requirements

## Content System

### Cards (`lib/content/cards.ts`)

- 36 cards
- Per card:
  - 6+ core phrasing variants
  - 3 domain variants (`general`, `love`, `work`)
  - 2 knighting snippets
  - 2 diagonal snippets

### Houses (`lib/content/houses.ts`)

- 36 house meanings (1..36)

### Themes (`lib/content/themes.ts`)

- Canonical v1 second-layer theme taxonomy (110 internal theme IDs)
- Subject-scoped theme boundaries (no cross-subject drift)
- Canonical ordering per subject (used in setup UI)
- Alias handling for inferred weighting from question text
- Retrieval rules:
  - hard match first: `subject_id` + `technique`
  - theme weighting as soft refinement

### Pairs (`lib/content/pairs.ts`)

- 220 high-signal pair entries (expandable)
- Curated overrides for critical combinations
- Ranked generation system for maintainability

## Deterministic Randomness and Reproducibility

- Seed material includes reading id, timestamp, question, spread type, intensity, and interaction trace.
- Each shuffle pass stores:
  - pass seed
  - split index
  - left/right sizes
  - full interleave decision sequence
- Cut step stores:
  - chosen pile
  - pile sizes
  - resulting order
- State persists in local storage; refresh does not lose reading.

## Brand Kit (`/brand`)

- `brand/logo.svg` - wordmark + icon system
- `brand/favicon.svg` - favicon source
- `brand/tokens.css` - neutral + accent token system + theme overrides
- `brand/card-backs/*.svg` - themed branded verso designs
- `brand/pdf/PdfBrand.tsx` - PDF branding helpers
- `brand/README.md` - asset notes and favicon `.ico` generation guidance

## Brand Guidelines (Concise)

### Naming

- Primary: **36 Cards**
- Secondary lockup: **36cards.com**

### Tone

- Calm, intelligent, slightly mystical, grounded
- Never absolute predictions
- No melodrama or fear language

### Usage Rules

- Keep icon and wordmark together unless space is constrained.
- Maintain clear-space around logo equal to icon radius.
- Preserve neutral base and use one accent token per theme.
- Keep card backs branded but subtle.

### Do

- Use role labels (`querent`, `counterpart`, `employer`, `friend`) when context supports it.
- Keep ritual screens uncluttered and ad-free.
- Keep narrative specific but reflective.

### Don't

- Don't use gendered Man/Woman labels.
- Don't place ads in ritual or reveal steps.
- Don't claim certainty in medical/legal/financial outcomes.

## AdSense Setup

Replace placeholders:

- `ca-pub-REPLACE_WITH_YOUR_CLIENT_ID`
- `REPLACE_RESULTS_TOP_SLOT`
- `REPLACE_RESULTS_MID_SLOT`
- `REPLACE_RESULTS_FOOTER_SLOT`

Ads render only on `/results`.

## Generate Art with DALL-E (OpenAI Images)

This repo includes a batch art pipeline:

- Script: `/Users/petermckay/36cards/scripts/generate-art.mjs`
- Guide: `/Users/petermckay/36cards/scripts/art/README.md`

Set credentials:

```bash
cp .env.example .env.local
# add OPENAI_API_KEY
```

Examples:

```bash
# cost-safe planning
npm run art:dry-run -- --type all --themes botanical-engraving --cards 1-3

# generate logo variants
npm run art:generate -- --type logo

# generate all 6 themed card backs
npm run art:generate -- --type backs --themes all

# generate full 36-card face set for one theme
npm run art:generate -- --type cards --themes botanical-engraving --cards 1-36
```

Output locations:

- Logos: `/Users/petermckay/36cards/public/brand/generated/logo`
- Card backs: `/Users/petermckay/36cards/public/brand/generated/card-backs`
- Card faces: `/Users/petermckay/36cards/public/cards/<theme>`
- Manifest: `/Users/petermckay/36cards/public/generated/manifest.json`

Each image also gets a sidecar `*.png.json` with prompt + model metadata for auditability.

Auto-usage behavior in app:

- Header logo prefers generated assets first:
  - `/brand/generated/logo/logo-wordmark-horizontal.png`
  - `/brand/generated/logo/logo-primary.png`
  - falls back to `/brand/logo.svg`
- Card faces prefer generated PNGs in `/public/cards/<theme>/...` and fall back to text-first card UI.
- Card backs prefer PNGs in:
  - `/brand/card-backs/<theme>.png`
  - `/brand/generated/card-backs/<theme>.png`
  - then fallback to themed SVG placeholders.

If you want generated backs to become active first-class assets immediately, run with:

```bash
npm run art:generate -- --type backs --themes all --write-active-backs
```

## Deployment

Deploy to Vercel or any Node host supporting Next.js 15.

```bash
npm run build
npm run start
```

## Expansion Notes

- Add more curated pair overrides in `lib/content/pairs.ts`.
- Add card art assets under `public/cards/<theme>/` and swap into `SpreadGrid`.
- Add server-side PDF (`/api/pdf`) later if you need pixel-perfect print server rendering.
