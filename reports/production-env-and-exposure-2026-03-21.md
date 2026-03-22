# Production Env And Exposure - 2026-03-21

## Required / Expected Env Vars

1. `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - optional in code
   - required if GA4 should be active in production

2. `GOOGLE_SITE_VERIFICATION`
   - optional in code
   - used to publish Search Console verification through app metadata

3. `OPENAI_API_KEY`
   - only required for art/image generation workflows
   - not required for the live reading product path

4. `OPENAI_IMAGE_MODEL`
5. `OPENAI_IMAGE_QUALITY`
   - optional art-generation support vars

6. `READING_API_RATE_LIMIT`
7. `READING_API_RATE_LIMIT_WINDOW_MS`
8. `CARD_DETAIL_API_RATE_LIMIT`
9. `CARD_DETAIL_API_RATE_LIMIT_WINDOW_MS`
10. `RATE_LIMIT_MAX_KEYS`
11. `TRUST_X_FORWARDED_FOR`
   - optional production tuning knobs
   - defaults are safe for a careful launch if unset
   - keep `TRUST_X_FORWARDED_FOR` unset unless your proxy chain is explicitly trusted

## Current Server-Side Boundaries

- `/Users/petermckay/36cards/app/api/reading/route.ts`
- `/Users/petermckay/36cards/app/api/card-detail/route.ts`

These now have:

- request IDs
- shared JSON error shape
- bounded in-memory rate limiting (key-cap pruning)
- basic server-side logging
- `no-store` / `nosniff` response headers
- rate-limit response headers
- streaming JSON body parsing with byte limits (enforced even when `content-length` is absent)

## Reading Logic Exposure

### Now Protected Behind The Server

- reading generation
- deep-dive / quick interpretation composition
- card inspector narrative detail
- export flow metadata needed for interpretation summaries

### Still Client-Visible And Acceptable For Launch

- `/Users/petermckay/36cards/components/SpreadGrid.tsx`
  - minimal public card/house labels only via `/Users/petermckay/36cards/lib/content/publicDisplay.ts`
  - no rich card caution/action/domain interpretation payloads in this render path

- `/Users/petermckay/36cards/app/setup/page.tsx` and `/Users/petermckay/36cards/lib/state/storage.ts`
  - now use `/Users/petermckay/36cards/lib/content/publicSetupTaxonomy.ts`
  - only lightweight subject labels + allowed theme IDs/labels for setup UX
  - broader subject scope text, aliases, and retrieval metadata remain off this client path

## Practical Risk Read

- The highest-value interpretation logic is no longer directly bundled into the results page client flow.
- Remaining client-visible content is mostly display/setup taxonomy.
- In-memory rate limiting is good enough for a careful launch, but not the final answer for multi-instance production hardening.

## Next Hardening Step If Needed Later

If the threat model gets stricter after launch, the next boundary to move would be:

1. server-driven spread/card display metadata
2. stronger shared rate limiting and request logging infrastructure
3. interpretation-school content packs kept fully behind the server boundary
