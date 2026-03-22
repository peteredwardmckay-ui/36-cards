# Launch Readiness - 2026-03-21

## Overall

The reading engine now feels close to release-candidate quality.

The biggest improvements are no longer about broken synthesis. They are now about tone, pacing, and whether a real user would feel the prose is trustworthy, readable, and distinct enough to keep reading.

My current recommendation is:

- suitable for a careful launch
- not yet something to ship and then ignore
- best treated as a release candidate with live-example monitoring

## What Feels Solid

- Deep-dive structure now reads as a real interpretation rather than a list of mapped spread features.
- Opening Frame, Immediate Surroundings, Wider Thread, Secondary Zone, Local Cluster, and Key Threads all do more interpretive work than they did before.
- Quick mode now explains Center Focus, Nearby Pair, Background Pattern, and Secondary Timing much more clearly.
- Shared raw-label leaks are heavily reduced.
- Subject-specific rewrites are in place for the most fragile paths we found in practice.
- Regression coverage is much stronger than it was at the start of this pass.

## Coverage In Place

- `/Users/petermckay/36cards/tests/reading-golden.test.ts`
- `/Users/petermckay/36cards/tests/theme-lens-curated.test.ts`
- `/Users/petermckay/36cards/tests/theme-lens-regression.test.ts`
- `/Users/petermckay/36cards/tests/theme-lens-readability-pack.test.ts`
- `/Users/petermckay/36cards/tests/quick-mode-readability-pack.test.ts`
- `/Users/petermckay/36cards/tests/reading-engine-smoke.audit.test.ts`
- `/Users/petermckay/36cards/tests/frozen-pack-regression.audit.test.ts`
- `/Users/petermckay/36cards/tests/rollout-pack.audit.test.ts`
- `/Users/petermckay/36cards/tests/rollout-phrase-harvest.audit.test.ts`

## Remaining Risks

These are no longer structural blockers, but they are the things I would still watch:

- Quick-mode conclusions can still occasionally compress symbolic language too hard.
- Some subject-specific symbolic terms still need real-world checking in context, especially when the card language is naturally metaphorical.
- A few intro and conclusion cadences are still recognizably template-based if someone reads many outputs in one sitting.
- Live examples are still the best way to catch the last awkward seams.

## Recommended Release Gate

Before making it live:

1. Do one final UI-based human read across 6-10 real examples.
2. Watch both deep-dive and quick mode, not just deep-dive.
3. Treat any new issue as worth fixing only if it is:
   - awkward enough for a normal reader to trip on
   - repeated enough to come from a shared builder
   - confusing enough to weaken trust in the reading

## Recommended Post-Launch Watch List

- quick money
- quick work
- quick love
- deep friends/social
- deep money
- deep community

These are not bad. They are just the most likely places for the remaining high-level tone issues to surface first.

## Bottom Line

If we needed to, we could make this live carefully.

If we have a little more time, the best use of it is not more broad rewriting. It is:

- real UI reads
- selective live-example fixes
- stopping when the remaining issues are matters of taste rather than clarity
