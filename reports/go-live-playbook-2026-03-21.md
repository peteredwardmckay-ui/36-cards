# Go-Live Playbook - 2026-03-21

## Before Deploy

1. Set production env vars:
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - `GOOGLE_SITE_VERIFICATION` if Search Console verification is done via metadata
   - `READING_API_RATE_LIMIT`
   - `READING_API_RATE_LIMIT_WINDOW_MS`
   - `CARD_DETAIL_API_RATE_LIMIT`
   - `CARD_DETAIL_API_RATE_LIMIT_WINDOW_MS`
   - `RATE_LIMIT_MAX_KEYS`
   - `TRUST_X_FORWARDED_FOR` only when proxy chain is trusted end-to-end
2. Confirm production domain policy:
   - `36cards.com`
   - `www.36cards.com`
3. Confirm API routes are reachable in production:
   - `/api/reading`
   - `/api/card-detail`
4. Confirm API guardrails in response headers:
   - `x-request-id`
   - `x-ratelimit-limit`
   - `x-ratelimit-remaining`
   - `x-ratelimit-reset`

## Deploy Verification

1. Open the site homepage and confirm the branded header and glossary link render correctly.
2. Start one quick reading and confirm:
   - loading scene appears intentionally before results
   - reading renders
   - share button works
3. Start one deep reading and confirm:
   - reading generates successfully
   - section layout renders cleanly
   - `Start New Reading` returns to setup cleanly
4. Open card inspector and confirm the detail loads.
5. Export one PDF and confirm the export finishes without layout breakage.

## Analytics Verification

1. Open GA4 real-time.
2. Run a live reading session.
3. Confirm these events appear:
   - `subject_selected`
   - `spread_selected`
   - `reading_style_selected`
   - `reading_started`
   - `reading_generated`
   - `share_reading` if tested
   - `pdf_export_clicked` if tested

## Search / Indexing Verification

1. Open `https://36cards.com/sitemap.xml`
2. Open `https://36cards.com/robots.txt`
3. In Search Console:
   - verify the property
   - submit the sitemap
4. Confirm workflow routes are `noindex`:
   - `/setup`
   - `/ritual`
   - `/reveal`
   - `/results`

## First 24 Hours

Watch for:

- API route failures
- unusual generation latency
- repeated user-visible wording seams in live reads
- analytics drop-off between setup and results
- PDF export errors

## Current Status

- build passes cleanly
- lint passes cleanly
- tests pass cleanly
