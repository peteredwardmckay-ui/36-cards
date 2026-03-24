import { describe, expect, it } from "vitest";
import { CARD_MEANINGS } from "@/lib/content/cards";
import type { Domain } from "@/lib/engine/types";
import { buildReadingStateFromFixture, composeDeterministicReading, readingBody } from "@/tests/helpers/readingHarness";
import type { SubjectId } from "@/lib/engine/types";

// --------------------------------------------------------------------------
// Helpers that mirror compose.ts normalization logic (read-only for auditing)
// --------------------------------------------------------------------------

const IMPERATIVE_FRAME = /^(choose|set|keep|watch|name|protect|clarify|review|track|listen|speak|pause|move|reframe|allow|hold|act|offer|take|make|prioritize|commit|focus|ask|give|let|consider|prototype|notice|reduce)\b/i;

// The full covered imperative list in compose.ts (after fix)
const CURRENT_IMPERATIVE_FRAME = /^(choose|set|keep|watch|name|protect|clarify|review|track|listen|speak|pause|move|reframe|allow|hold|act|offer|take|make|prioritize|commit|focus|ask|give|let|consider|prototype|notice|reduce)\b/i;

// Words that are imperatives only when they appear as the FIRST word of a
// domain variant (not as adjectives like "clear boundaries" or "fresh perspective").
// Only list verbs that would genuinely break "suggest that X" if uncovered.
const BARE_IMPERATIVE_SUSPECT = /^(notice|reduce|patch|stop|avoid|build|check|try|get|run|do|go|fix|add|help|put|pick|drop|raise|lower|push|pull|draw|place|plan|define|extend|close|join|leave|share|break|grow)\b/i;

const DOMAINS: Domain[] = ["general", "love", "work"];

// --------------------------------------------------------------------------
// PART 1 — Systematic scan of all domain variants
// --------------------------------------------------------------------------
describe("quick-read audit: domain variants normalization", () => {
  it("all domain variants produce grammatical sentence-frame and that-clause output", () => {
    const issues: Array<{ card: string; domain: Domain; text: string; problem: string }> = [];

    CARD_MEANINGS.forEach((card) => {
      DOMAINS.forEach((domain) => {
        const raw = card.domainVariants[domain];
        if (!raw) return;

        const lower = raw.trim().replace(/[.!?]+$/, "").toLowerCase();

        // Check 1: bare imperative suspect not covered by current list
        if (BARE_IMPERATIVE_SUSPECT.test(lower) && !CURRENT_IMPERATIVE_FRAME.test(lower)) {
          issues.push({
            card: card.name,
            domain,
            text: raw,
            problem: `starts with uncovered imperative verb — "suggest that ${lower}" would be ungrammatical`,
          });
        }

        // Check 2: text is suspiciously short (≤ 3 words) for a narrative thread
        const wordCount = lower.split(/\s+/).filter(Boolean).length;
        if (wordCount <= 3) {
          issues.push({
            card: card.name,
            domain,
            text: raw,
            problem: `very short (${wordCount} words) — may produce thin prose`,
          });
        }
      });
    });

    if (issues.length > 0) {
      console.log("\n=== DOMAIN VARIANT ISSUES ===");
      issues.forEach((issue) => {
        console.log(`[${issue.card} / ${issue.domain}] "${issue.text}"`);
        console.log(`  → ${issue.problem}`);
      });
    } else {
      console.log("\n=== DOMAIN VARIANT ISSUES: none found ===");
    }

    // Fail only if issues exist — comment below shows current expectation
    expect(issues, `Found ${issues.length} domain variant issue(s) — see console output`).toHaveLength(0);
  });
});

// --------------------------------------------------------------------------
// PART 2 — Sample quick readings across subjects and modes
// --------------------------------------------------------------------------

interface QuickAuditFixture {
  id: string;
  seed: string;
  subjectId: SubjectId;
  spreadType: "three-card" | "grand-tableau";
  threeCardMode?: "past-present-future" | "situation-challenge-advice";
  gtLayout?: "4x9" | "4x8+4";
  question: string;
}

const QUICK_FIXTURES: QuickAuditFixture[] = [
  {
    id: "quick_3card_ppf_general",
    seed: "qa-3c-01",
    subjectId: "general_reading",
    spreadType: "three-card",
    threeCardMode: "past-present-future",
    question: "What should I keep in mind this week?",
  },
  {
    id: "quick_3card_sca_work",
    seed: "qa-3c-02",
    subjectId: "work",
    spreadType: "three-card",
    threeCardMode: "situation-challenge-advice",
    question: "What is the real pressure at work right now?",
  },
  {
    id: "quick_3card_ppf_love",
    seed: "qa-3c-03",
    subjectId: "love",
    spreadType: "three-card",
    threeCardMode: "past-present-future",
    question: "What is moving in this relationship?",
  },
  {
    id: "quick_3card_sca_health",
    seed: "qa-3c-04",
    subjectId: "health",
    spreadType: "three-card",
    threeCardMode: "situation-challenge-advice",
    question: "How do I pace my recovery?",
  },
  {
    id: "quick_3card_ppf_money",
    seed: "qa-3c-05",
    subjectId: "money",
    spreadType: "three-card",
    threeCardMode: "past-present-future",
    question: "What do I need to understand about my finances?",
  },
  {
    id: "quick_3card_sca_purpose",
    seed: "qa-3c-06",
    subjectId: "purpose_calling",
    spreadType: "three-card",
    threeCardMode: "situation-challenge-advice",
    question: "What is the next step in my calling?",
  },
  {
    id: "quick_gt_4x9_general",
    seed: "qa-gt-01",
    subjectId: "general_reading",
    spreadType: "grand-tableau",
    gtLayout: "4x9",
    question: "What is the broader picture right now?",
  },
  {
    id: "quick_gt_4x9_work",
    seed: "qa-gt-02",
    subjectId: "work",
    spreadType: "grand-tableau",
    gtLayout: "4x9",
    question: "What should I understand about my work situation?",
  },
  {
    id: "quick_gt_4x9_love",
    seed: "qa-gt-03",
    subjectId: "love",
    spreadType: "grand-tableau",
    gtLayout: "4x9",
    question: "What is the real shape of this relationship?",
  },
  {
    id: "quick_gt_4x8_money",
    seed: "qa-gt-04",
    subjectId: "money",
    spreadType: "grand-tableau",
    gtLayout: "4x8+4",
    question: "Where is the real pressure in my finances?",
  },
  {
    id: "quick_gt_4x9_home_family",
    seed: "qa-gt-05",
    subjectId: "home_family",
    spreadType: "grand-tableau",
    gtLayout: "4x9",
    question: "What needs attention in my home life?",
  },
  {
    id: "quick_gt_4x9_personal_growth",
    seed: "qa-gt-06",
    subjectId: "personal_growth",
    spreadType: "grand-tableau",
    gtLayout: "4x9",
    question: "Where am I in my own growth right now?",
  },
];

// Patterns that indicate a prose quality issue
const BANNED_QUICK_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  // GT "that" clause grammar breaks
  { pattern: /suggest(?:s)? that notice\b/i, label: "broken that-clause: notice" },
  { pattern: /suggest(?:s)? that reduce\b/i, label: "broken that-clause: reduce" },
  { pattern: /suggest(?:s)? that patch\b/i, label: "broken that-clause: patch" },
  { pattern: /suggest(?:s)? that start\b/i, label: "broken that-clause: start" },
  { pattern: /suggest(?:s)? that build\b/i, label: "broken that-clause: build" },
  // Raw synthesis labels leaking into quick reads
  { pattern: /\bvalues and love\b/i, label: "raw synthesis label" },
  { pattern: /\bthe public field\b/i, label: "raw synthesis label" },
  { pattern: /\bhouse house\b/i, label: "raw synthesis label" },
  { pattern: /\bobligation and cross\b/i, label: "raw synthesis label" },
  { pattern: /\ba newly forming situation\b/i, label: "raw synthesis label" },
  // Fragment after colon that starts with naked imperative
  { pattern: /:\s+notice\b/i, label: "bare imperative after colon: notice" },
  { pattern: /:\s+reduce\b/i, label: "bare imperative after colon: reduce" },
];

describe("quick-read audit: prose quality across fixtures", () => {
  it("quick readings produce clean prose without grammar breaks or raw labels", () => {
    const allIssues: Array<{ fixture: string; section: string; issue: string; snippet: string }> = [];

    QUICK_FIXTURES.forEach((f, i) => {
      const fixture = {
        seed: f.seed,
        question: f.question,
        subjectId: f.subjectId,
        interpretationThemeId: "auto" as const,
        spreadType: f.spreadType,
        threeCardMode: f.threeCardMode ?? "past-present-future",
        gtLayout: f.gtLayout ?? "4x9",
        readingStyle: "quick" as const,
        includeHouses: false,
        significatorMode: "self" as const,
      };

      const state = buildReadingStateFromFixture(fixture, i);
      const reading = composeDeterministicReading(state, 1770000000000 + i * 1000);

      console.log(`\n=== ${f.id} ===`);
      reading.sections.forEach((s) => {
        const preview = s.body.slice(0, 300);
        console.log(`[${s.id}] ${preview}`);

        BANNED_QUICK_PATTERNS.forEach(({ pattern, label }) => {
          if (pattern.test(s.body)) {
            allIssues.push({ fixture: f.id, section: s.id, issue: label, snippet: s.body.slice(0, 150) });
          }
        });
      });
    });

    if (allIssues.length > 0) {
      console.log("\n=== QUICK READ ISSUES FOUND ===");
      allIssues.forEach((issue) => {
        console.log(`[${issue.fixture} / ${issue.section}] ${issue.issue}`);
        console.log(`  "${issue.snippet}"`);
      });
    }

    expect(allIssues, `Found ${allIssues.length} quick-read prose issue(s) — see console output`).toHaveLength(0);
  });
});
