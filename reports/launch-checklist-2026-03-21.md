# Launch Checklist - 2026-03-21

## Verified Green

- Production build passes:
  - `npm run build`
- Lint passes:
  - `npm run lint`
- Full test suite passes:
  - `npm run test -- --run`
- Current automated state:
  - `19/19` test files passing
  - `74/74` tests passing

## Product / UX In Place

- Deep-dive and quick reading voice have had a full readability pass.
- Scenic loading is intentional on results and suppressed for transient flashes elsewhere.
- Results page now includes:
  - `Share Reading`
  - `Start New Reading`
  - `Back to Top`
- Header and loading visuals now use the shared sky motif / sunrise brand treatment.

## SEO / Discovery In Place

- Global metadata in `/Users/petermckay/36cards/app/layout.tsx`
- Sitemap in `/Users/petermckay/36cards/app/sitemap.ts`
- Robots file in `/Users/petermckay/36cards/app/robots.ts`
- `noindex` route heads for workflow/session pages:
  - `/Users/petermckay/36cards/app/setup/head.tsx`
  - `/Users/petermckay/36cards/app/ritual/head.tsx`
  - `/Users/petermckay/36cards/app/reveal/head.tsx`
  - `/Users/petermckay/36cards/app/results/head.tsx`
- Glossary metadata baseline in:
  - `/Users/petermckay/36cards/app/glossary/page.tsx`
  - `/Users/petermckay/36cards/app/glossary/cards/[slug]/page.tsx`
  - `/Users/petermckay/36cards/app/glossary/houses/[id]/page.tsx`
  - `/Users/petermckay/36cards/app/glossary/techniques/[slug]/page.tsx`

## Analytics In Place

- GA4 scaffold in `/Users/petermckay/36cards/components/GoogleAnalytics.tsx`
- GA helper in `/Users/petermckay/36cards/lib/analytics/ga.ts`
- Event hooks wired for:
  - `reading_started`
  - `subject_selected`
  - `theme_lens_selected`
  - `spread_selected`
  - `significator_mode_selected`
  - `reading_style_selected`
  - `include_houses_toggled`
  - `deck_theme_selected`
  - `reading_generated`
  - `reading_generation_failed`
  - `reading_generation_retry`
  - `share_reading`
  - `start_new_reading`
  - `pdf_export_clicked`

## Server Boundary In Place

- Reading generation runs through:
  - `/Users/petermckay/36cards/app/api/reading/route.ts`
- Card inspector detail runs through:
  - `/Users/petermckay/36cards/app/api/card-detail/route.ts`
- Shared API response helper:
  - `/Users/petermckay/36cards/lib/server/apiResponse.ts`
- Shared lightweight protection:
  - `/Users/petermckay/36cards/lib/server/routeProtection.ts`

These routes now have:

- request IDs
- shared JSON error shape
- lightweight in-memory rate limiting
- basic logging

## Remaining Before Live

1. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in production.
2. Verify GA4 pageviews and events in real-time against a real session.
3. Set `GOOGLE_SITE_VERIFICATION` in production if Search Console verification is being used via meta tag.
4. Set up Google Search Console.
5. Submit `https://36cards.com/sitemap.xml`.
6. Confirm the production redirect policy:
   - `36cards.com`
   - `www.36cards.com`
7. Do one final live smoke pass in the deployed environment:
   - generate a quick reading
   - generate a deep reading
   - export PDF
   - open glossary pages
   - test share flow

## Post-Launch Watch List

- reading generation latency
- API route abuse / rate-limit pressure
- GA funnel drop-off between setup and results
- any live examples that still feel repetitive or too templated

## Practical Read

This is now a release candidate.

The highest-risk code and build issues have been cleared.
The remaining work is mostly production configuration and careful launch verification rather than more engine surgery.
