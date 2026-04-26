"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { SiteFooter } from "@/components/SiteFooter";
import { loadReadingHistory } from "@/lib/state/storage";
import type { ReadingHistoryEntry } from "@/lib/state/storage";
import { CARD_BY_ID } from "@/lib/content/cards";
import { getPublicSubjectDefinition } from "@/lib/content/publicSetupTaxonomy";

/* ── Card tone ───────────────────────────────────────────────── */

const CARD_TONE: Record<number, "+" | "-"> = {
  2: "+", 9: "+", 13: "+", 16: "+", 18: "+", 24: "+",
  25: "+", 30: "+", 31: "+", 33: "+", 34: "+", 35: "+",
  6: "-", 7: "-", 8: "-", 10: "-", 11: "-",
  21: "-", 23: "-", 36: "-",
};

function toneOf(n: number): "+" | "-" | "·" {
  return CARD_TONE[n] ?? "·";
}

function readingTone(cardIds: number[]): "favourable" | "challenging" | "mixed" {
  let pos = 0, neg = 0;
  for (const n of cardIds) {
    const t = toneOf(n);
    if (t === "+") pos++;
    if (t === "-") neg++;
  }
  if (pos > neg + 1) return "favourable";
  if (neg > pos + 1) return "challenging";
  return "mixed";
}

/* ── Image helper (Sun/Moon capitalised) ─────────────────────── */

function cardImgPath(id: number, slug: string): string {
  const fileSlug = slug === "sun" ? "Sun" : slug === "moon" ? "Moon" : slug;
  return `/cards/traditional/${String(id).padStart(2, "0")}-${fileSlug}.webp`;
}

/* ── Date helpers ────────────────────────────────────────────── */

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-AU", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function daysAgo(ts: number): number {
  return Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
}

/* ── Component ───────────────────────────────────────────────── */

export function JournalClient() {
  const [history, setHistory] = useState<ReadingHistoryEntry[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHistory(loadReadingHistory());
    setMounted(true);
  }, []);

  /* ── Filtered entries ─────────────────────────────────────── */
  const filtered = history.filter((r) => {
    if (filter === "triad") return r.spreadType === "three-card";
    if (filter === "tableau") return r.spreadType === "grand-tableau";
    if (filter === "favourable") return readingTone(r.cardIds) === "favourable";
    if (filter === "challenging") return readingTone(r.cardIds) === "challenging";
    return true;
  });

  /* ── Patterns (deterministic, full history) ───────────────── */

  // Card frequency
  const cardCounts: Record<number, number> = {};
  history.forEach((r) => r.cardIds.forEach((id) => {
    cardCounts[id] = (cardCounts[id] ?? 0) + 1;
  }));
  const topCards = Object.entries(cardCounts)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 6)
    .map(([id, count]) => ({ card: CARD_BY_ID.get(Number(id)), count: Number(count) }))
    .filter((x): x is { card: NonNullable<typeof x.card>; count: number } => x.card != null);

  // Tone totals
  const overallTone = history.reduce(
    (acc, r) => {
      r.cardIds.forEach((n) => {
        const t = toneOf(n);
        if (t === "+") acc.pos++;
        else if (t === "-") acc.neg++;
        else acc.neu++;
      });
      return acc;
    },
    { pos: 0, neg: 0, neu: 0 },
  );
  const toneSum = overallTone.pos + overallTone.neg + overallTone.neu;
  const tonePct = (n: number) => (toneSum > 0 ? Math.round((n / toneSum) * 100) : 0);

  // Cadence — last 12 weeks
  const now = Date.now();
  const weeks = Array.from({ length: 12 }).map((_, i) => {
    const start = now - (i + 1) * 7 * 24 * 60 * 60 * 1000;
    const end   = now - i * 7 * 24 * 60 * 60 * 1000;
    return history.filter((r) => r.createdAt >= start && r.createdAt < end).length;
  }).reverse();
  const maxWeek = Math.max(...weeks, 1);

  // Recurring questions
  const questionGroups: Record<string, { count: number; example: string }> = {};
  history.forEach((r) => {
    if (!r.question) return;
    const key = r.question.toLowerCase().split(/\s+/).filter((w) => w.length > 4).sort().slice(0, 3).join(" ");
    if (!questionGroups[key]) questionGroups[key] = { count: 0, example: r.question };
    questionGroups[key].count++;
  });
  const recurring = Object.values(questionGroups)
    .filter((g) => g.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Stats
  const oldest = history.length ? history[history.length - 1] : null;
  const tableauCount = history.filter((r) => r.spreadType === "grand-tableau").length;

  /* ── Empty state ───────────────────────────────────────────── */
  if (mounted && history.length === 0) {
    return (
      <>
        <div className="surface-ink"><TopNav activePage="journal" /></div>
        <div className="surface-vellum" style={{ minHeight: "100vh" }}>
          <div className="container" style={{ paddingTop: 56, paddingBottom: 96 }}>
            <p className="smallcaps" style={{ color: "var(--ember)", marginBottom: 20, opacity: 0.8 }}>
              The Journal · Your archive
            </p>
            <h1 className="display" style={{ fontSize: "clamp(48px, 7vw, 96px)", lineHeight: 0.95, margin: "0 0 32px", fontWeight: 300 }}>
              The questions<br />
              <em style={{ color: "var(--ember)" }}>you keep asking.</em>
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.75, opacity: 0.6, maxWidth: 520, marginBottom: 40 }}>
              Your readings will appear here once you complete one. Each entry is stored locally
              on this device — nothing leaves your browser.
            </p>
            <Link href="/setup" className="btn">Begin a reading</Link>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  /* ── Full journal ──────────────────────────────────────────── */
  return (
    <>
      <div className="surface-ink"><TopNav activePage="journal" /></div>

      <div className="surface-vellum" style={{ minHeight: "100vh" }}>
        <div className="container-wide" style={{ paddingTop: 64, paddingBottom: 96 }}>

          {/* ── Masthead ──────────────────────────────────────── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: "clamp(40px, 6vw, 80px)",
            paddingBottom: 56,
            borderBottom: "var(--rule) solid var(--rule-color-alt)",
          }}>
            <div>
              <p className="smallcaps" style={{ color: "var(--ember)", marginBottom: 20 }}>
                The Journal · Your archive
              </p>
              <h1 className="display" style={{ fontSize: "clamp(56px, 7vw, 112px)", margin: 0, fontWeight: 300, lineHeight: 0.95 }}>
                The questions<br />
                <em style={{ color: "var(--ember)" }}>you keep asking.</em>
              </h1>
            </div>
            <div style={{ alignSelf: "end" }}>
              <p style={{ fontSize: "clamp(15px, 1.4vw, 19px)", lineHeight: 1.6, opacity: 0.6, margin: "0 0 24px" }}>
                Every reading kept, indexed, and read back to you — a record of
                what you have been asking, and how the cards have answered.
              </p>
              <div style={{
                display: "flex",
                gap: 36,
                paddingTop: 24,
                borderTop: "var(--rule) solid var(--rule-color-alt)",
                flexWrap: "wrap",
              }}>
                {[
                  { label: "Readings kept",  value: String(history.length) },
                  { label: "Since",          value: oldest ? formatDate(oldest.createdAt) : "—" },
                  { label: "Most recent",    value: history[0] ? formatDate(history[0].createdAt) : "—" },
                  { label: "Tableaux cast",  value: String(tableauCount) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="numeral" style={{ fontSize: 36, lineHeight: 1, color: "var(--ember)" }}>{value}</div>
                    <div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.5, marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Patterns panel ────────────────────────────────── */}
          {history.length > 0 && (
            <div style={{ paddingTop: 56, paddingBottom: 56, borderBottom: "var(--rule) solid var(--rule-color-alt)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
                <h2 className="display" style={{ fontSize: "clamp(32px, 4vw, 52px)", margin: 0, fontWeight: 400 }}>
                  <em>Patterns</em> in the archive
                </h2>
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.4 }}>
                  Counted, not interpreted
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: "clamp(24px, 4vw, 56px)", alignItems: "start" }}>

                {/* Most-drawn cards */}
                <div>
                  <p className="smallcaps" style={{ color: "var(--ember)", marginBottom: 8 }}>Most-drawn cards</p>
                  <p className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.5, margin: "0 0 20px" }}>
                    Across {history.length} {history.length === 1 ? "reading" : "readings"}
                  </p>
                  {topCards.length > 0 ? (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {topCards.map(({ card, count }) => (
                        <Link
                          key={card.id}
                          href={`/glossary/cards/${card.slug}`}
                          style={{ flex: "1 1 60px", minWidth: 52, maxWidth: 80, color: "inherit", textDecoration: "none" }}
                        >
                          <div className="card-frame" style={{ width: "100%" }}>
                            <Image
                              src={cardImgPath(card.id, card.slug)}
                              alt={card.name}
                              fill
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                          <div className="mono" style={{
                            fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
                            marginTop: 6, display: "flex", justifyContent: "space-between",
                          }}>
                            <span style={{ opacity: 0.6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.name}</span>
                            <span style={{ color: "var(--ember)", flexShrink: 0, marginLeft: 4 }}>×{count}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 14, opacity: 0.5 }}>Not enough data yet.</p>
                  )}
                </div>

                {/* The weather */}
                <div>
                  <p className="smallcaps" style={{ color: "var(--ember)", marginBottom: 8 }}>The weather</p>
                  <p className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.5, margin: "0 0 20px" }}>
                    Tone of every card drawn
                  </p>
                  {toneSum > 0 ? (
                    <>
                      <div style={{ display: "flex", height: 10, overflow: "hidden", border: "var(--rule) solid var(--rule-color-alt)" }}>
                        <div style={{ flex: overallTone.pos, background: "var(--ember)" }} />
                        <div style={{ flex: overallTone.neu, background: "var(--rule-color-alt)" }} />
                        <div style={{ flex: overallTone.neg, background: "var(--ink)" }} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 20 }}>
                        {[
                          { label: "Favourable", pct: tonePct(overallTone.pos) },
                          { label: "Neutral",    pct: tonePct(overallTone.neu) },
                          { label: "Challenging", pct: tonePct(overallTone.neg) },
                        ].map(({ label, pct }) => (
                          <div key={label}>
                            <div className="numeral" style={{ fontSize: 36, lineHeight: 1, fontStyle: "italic" }}>{pct}%</div>
                            <div className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.55, marginTop: 4 }}>{label}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p style={{ fontSize: 14, opacity: 0.5 }}>Not enough data yet.</p>
                  )}
                </div>

                {/* Cadence */}
                <div>
                  <p className="smallcaps" style={{ color: "var(--ember)", marginBottom: 8 }}>Cadence · Last 12 weeks</p>
                  <p className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.5, margin: "0 0 20px" }}>
                    Readings per week
                  </p>
                  <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 80 }}>
                    {weeks.map((count, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: count === 0 ? 4 : `${Math.round((count / maxWeek) * 80)}px`,
                          background: count === 0 ? "var(--rule-color-alt)" : "var(--ink)",
                          transition: "height 0.3s",
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                    <span className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.45 }}>12 wks ago</span>
                    <span className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.45 }}>This week</span>
                  </div>
                </div>
              </div>

              {/* Recurring questions */}
              {recurring.length > 0 && (
                <div style={{ marginTop: 48, paddingTop: 32, borderTop: "var(--rule) solid var(--rule-color-alt)" }}>
                  <p className="smallcaps" style={{ color: "var(--ember)", marginBottom: 20 }}>Questions you have returned to</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
                    {recurring.map((g, i) => (
                      <div key={i}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
                          <span className="numeral" style={{ fontSize: 40, lineHeight: 0.9, color: "var(--ember)", fontStyle: "italic" }}>×{g.count}</span>
                          <span className="mono" style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.5 }}>asked</span>
                        </div>
                        <p className="display" style={{ fontSize: 22, fontStyle: "italic", margin: 0, lineHeight: 1.3, opacity: 0.75 }}>
                          &ldquo;{g.example}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Controls bar ──────────────────────────────────── */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "24px 0",
            borderBottom: "var(--rule) solid var(--rule-color-alt)",
            flexWrap: "wrap",
            gap: 16,
          }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                ["all",         "All readings"],
                ["triad",       "Triads"],
                ["tableau",     "Tableaux"],
                ["favourable",  "Favourable"],
                ["challenging", "Challenging"],
              ].map(([id, label]) => {
                const sel = filter === id;
                return (
                  <button
                    key={id}
                    onClick={() => setFilter(id)}
                    className="mono"
                    style={{
                      padding: "10px 16px",
                      border: `var(--rule) solid ${sel ? "var(--ink)" : "var(--rule-color-alt)"}`,
                      color: sel ? "var(--vellum)" : "var(--ink)",
                      background: sel ? "var(--ink)" : "transparent",
                      fontSize: 10,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      transition: "background 0.12s, color 0.12s, border-color 0.12s",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <span className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.4 }}>
              {filtered.length} of {history.length}
            </span>
          </div>

          {/* ── Entries list ───────────────────────────────────── */}
          <div>
            {filtered.length === 0 ? (
              <p style={{ padding: "40px 0", fontSize: 15, opacity: 0.5 }}>No entries match this filter.</p>
            ) : (
              filtered.map((r, index) => {
                const tone = readingTone(r.cardIds);
                const previewCards = r.cardIds.slice(0, 5);
                const moreCount = r.cardIds.length - previewCards.length;
                let subjectLabel = "";
                try { subjectLabel = getPublicSubjectDefinition(r.subjectId).displayLabel; } catch { subjectLabel = r.subjectId; }

                return (
                  <article
                    key={r.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "96px 1fr auto 80px",
                      gap: "clamp(16px, 3vw, 40px)",
                      padding: "32px 0",
                      borderBottom: "var(--rule) solid var(--rule-color-alt)",
                      alignItems: "center",
                    }}
                  >
                    {/* № + date */}
                    <div>
                      <div className="numeral" style={{ fontSize: 28, color: "var(--ember)", fontStyle: "italic", lineHeight: 1 }}>
                        №{index + 1}
                      </div>
                      <div className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.5, marginTop: 6 }}>
                        {formatDate(r.createdAt)}
                      </div>
                      <div className="mono" style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.4, marginTop: 2 }}>
                        {daysAgo(r.createdAt) === 0 ? "Today" : `${daysAgo(r.createdAt)}d ago`}
                      </div>
                    </div>

                    {/* Question + metadata */}
                    <div>
                      <div className="mono" style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                        <span style={{ color: "var(--ember)" }}>
                          {r.spreadType === "three-card" ? "Triad · 3 cards" : "Tableau · 36 cards"}
                        </span>
                        <span style={{ opacity: 0.4 }}>·</span>
                        <span style={{ opacity: 0.65 }}>{tone}</span>
                        <span style={{ opacity: 0.4 }}>·</span>
                        <span style={{ opacity: 0.55 }}>{subjectLabel}</span>
                      </div>
                      {r.question ? (
                        <h3 className="display" style={{ fontSize: "clamp(18px, 2vw, 26px)", fontStyle: "italic", fontWeight: 400, margin: 0, lineHeight: 1.25, opacity: 0.85 }}>
                          &ldquo;{r.question}&rdquo;
                        </h3>
                      ) : (
                        <h3 className="display" style={{ fontSize: "clamp(18px, 2vw, 26px)", fontStyle: "italic", fontWeight: 400, margin: 0, lineHeight: 1.25, opacity: 0.4 }}>
                          No question recorded
                        </h3>
                      )}
                    </div>

                    {/* Card strip */}
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      {previewCards.map((id) => {
                        const card = CARD_BY_ID.get(id);
                        if (!card) return null;
                        return (
                          <div key={id} style={{ width: 36, flexShrink: 0 }}>
                            <div className="card-frame" style={{ width: 36 }}>
                              <Image
                                src={cardImgPath(card.id, card.slug)}
                                alt={card.name}
                                fill
                                style={{ objectFit: "cover" }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      {moreCount > 0 && (
                        <span className="mono" style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5, marginLeft: 4, flexShrink: 0 }}>
                          +{moreCount}
                        </span>
                      )}
                    </div>

                    {/* Action */}
                    <div style={{ textAlign: "right" }}>
                      <Link
                        href="/setup"
                        className="mono"
                        style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.5, textDecoration: "none", color: "inherit" }}
                      >
                        New reading →
                      </Link>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* ── Footer row ────────────────────────────────────── */}
          {history.length > 0 && (
            <div style={{ marginTop: 48, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <p className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.4 }}>
                Patterns recompute on each new reading · Stored locally on this device
              </p>
              <Link href="/setup" className="btn">
                Begin a new reading
              </Link>
            </div>
          )}

        </div>
      </div>

      <SiteFooter />
    </>
  );
}
