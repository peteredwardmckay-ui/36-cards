"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { TopNav } from "@/components/TopNav";
import { SiteFooter } from "@/components/SiteFooter";
import type { CardMeaning } from "@/lib/content/cards";
import type { HouseMeaning } from "@/lib/content/houses";
import type { TechniqueGlossary } from "@/lib/content/techniques";

/* =========================================================
   Filter groups (card IDs)
   ========================================================= */

const FILTERS: Record<string, number[]> = {
  all:         [],                              // empty = show all
  favourable:  [2, 9, 16, 24, 25, 31, 33, 34, 35],
  challenging: [6, 7, 8, 10, 11, 21, 23, 36],
  persons:     [13, 28, 29],
  objects:     [3, 4, 19, 20, 25, 26, 27, 33],
  nature:      [5, 6, 16, 21, 31, 32],
};

const FILTER_LABELS: Record<string, string> = {
  all:         "All 36",
  favourable:  "Favourable",
  challenging: "Challenging",
  persons:     "Persons",
  objects:     "Objects",
  nature:      "Nature",
};

/* =========================================================
   Image helper — Sun/Moon have capitalised filenames
   ========================================================= */

function cardImgPath(id: number, slug: string): string {
  const fileSlug = slug === "sun" ? "Sun" : slug === "moon" ? "Moon" : slug;
  return `/cards/traditional/${String(id).padStart(2, "0")}-${fileSlug}.webp`;
}

/* =========================================================
   Props
   ========================================================= */

interface Props {
  cards:      CardMeaning[];
  houses:     HouseMeaning[];
  techniques: TechniqueGlossary[];
}

/* =========================================================
   Component
   ========================================================= */

export function GlossaryIndex({ cards, houses, techniques }: Props) {
  const [filter, setFilter] = useState<string>("all");
  const [view,   setView]   = useState<"grid" | "index">("grid");

  const ids     = FILTERS[filter];
  const visible = ids.length === 0 ? cards : cards.filter((c) => ids.includes(c.id));

  return (
    <>
      {/* TopNav lives in its own ink strip so it stays readable on the vellum page */}
      <div className="surface-ink">
        <TopNav activePage="glossary" />
      </div>

      <div className="surface-vellum" style={{ minHeight: "100vh" }}>
        <div className="container-wide" style={{ paddingTop: 64, paddingBottom: 96 }}>

          {/* ── Masthead ──────────────────────────────── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: "clamp(40px, 6vw, 80px)",
            paddingBottom: 56,
            borderBottom: "var(--rule) solid var(--rule-color-alt)",
          }}>
            <div>
              <p className="smallcaps" style={{ color: "var(--ember)", marginBottom: 20 }}>
                Glossary · The vocabulary
              </p>
              <h1 className="display" style={{ fontSize: "clamp(56px, 8vw, 120px)", margin: 0, fontWeight: 300, lineHeight: 0.95 }}>
                Thirty-six<br />
                <span className="italic-display" style={{ color: "var(--ember)" }}>fixed words.</span>
              </h1>
            </div>
            <p style={{ fontSize: "clamp(15px, 1.4vw, 19px)", lineHeight: 1.6, alignSelf: "end", opacity: 0.6, margin: 0 }}>
              Every card in the deck, with its meaning, its native house, and the
              combinations that most often arrive with it. Read them as you would a
              glossary in a textbook — a working vocabulary, not an oracle.
            </p>
          </div>

          {/* ── Controls bar ──────────────────────────── */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "24px 0",
            borderBottom: "var(--rule) solid var(--rule-color-alt)",
            flexWrap: "wrap",
            gap: 16,
          }}>
            {/* Filter tabs */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.keys(FILTERS).map((id) => {
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
                    {FILTER_LABELS[id]}
                  </button>
                );
              })}
            </div>

            {/* Entry count + view toggle */}
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <span className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.4 }}>
                {visible.length} {visible.length === 1 ? "entry" : "entries"}
              </span>
              <div style={{ display: "flex", border: "var(--rule) solid var(--rule-color-alt)" }}>
                {(["grid", "index"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className="mono"
                    style={{
                      padding: "8px 14px",
                      background: view === v ? "var(--ink)" : "transparent",
                      color: view === v ? "var(--vellum)" : "var(--ink)",
                      fontSize: 10,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      transition: "background 0.12s, color 0.12s",
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Card grid ─────────────────────────────── */}
          {view === "grid" ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: "clamp(12px, 2vw, 24px)",
              paddingTop: 48,
            }}>
              {visible.map((card) => (
                <Link
                  key={card.id}
                  href={`/glossary/cards/${card.slug}`}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  <div className="card-frame" style={{ width: "100%" }}>
                    <Image
                      src={cardImgPath(card.id, card.slug)}
                      alt={card.name}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div style={{
                    marginTop: 14,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    borderBottom: "var(--rule) solid var(--rule-color-alt)",
                    paddingBottom: 8,
                  }}>
                    <span className="numeral" style={{ fontSize: 18, color: "var(--ember)" }}>
                      {String(card.id).padStart(2, "0")}
                    </span>
                    <span className="display" style={{ fontSize: 18, fontStyle: "italic" }}>
                      {card.name}
                    </span>
                  </div>
                  <p style={{ margin: "10px 0 0", fontSize: 12, lineHeight: 1.55, opacity: 0.55 }}>
                    {card.coreMeaning}
                  </p>
                  <p className="mono" style={{ margin: "8px 0 0", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ember)", opacity: 0.8 }}>
                    House {card.id}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            /* ── Index table ──────────────────────────── */
            <div style={{ paddingTop: 40 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr className="mono" style={{ textAlign: "left", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.4 }}>
                    <th style={{ padding: "12px 0", borderBottom: "var(--rule) solid var(--rule-color-alt)", width: 56 }}>№</th>
                    <th style={{ padding: "12px 0", borderBottom: "var(--rule) solid var(--rule-color-alt)", width: 180 }}>Card</th>
                    <th style={{ padding: "12px 0", borderBottom: "var(--rule) solid var(--rule-color-alt)" }}>Meaning</th>
                    <th style={{ padding: "12px 0", borderBottom: "var(--rule) solid var(--rule-color-alt)", width: 160 }}>Keywords</th>
                    <th style={{ padding: "12px 0", borderBottom: "var(--rule) solid var(--rule-color-alt)", width: 60 }} />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((card) => (
                    <tr key={card.id} style={{ borderBottom: "var(--rule) solid var(--rule-color-alt)" }}>
                      <td style={{ padding: "16px 0" }}>
                        <span className="numeral" style={{ fontSize: 20, color: "var(--ember)" }}>
                          {String(card.id).padStart(2, "0")}
                        </span>
                      </td>
                      <td style={{ padding: "16px 0" }}>
                        <span className="display" style={{ fontSize: 22, fontStyle: "italic" }}>{card.name}</span>
                      </td>
                      <td style={{ padding: "16px 16px", fontSize: 15, lineHeight: 1.55, opacity: 0.65 }}>
                        {card.coreMeaning}
                      </td>
                      <td style={{ padding: "16px 0" }}>
                        <span className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.45 }}>
                          {card.keywords.slice(0, 2).join(" · ")}
                        </span>
                      </td>
                      <td style={{ padding: "16px 0", textAlign: "right" }}>
                        <Link
                          href={`/glossary/cards/${card.slug}`}
                          className="mono"
                          style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.5 }}
                        >
                          Open →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Houses + Techniques ───────────────────── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(32px, 5vw, 64px)",
            marginTop: 96,
            paddingTop: 64,
            borderTop: "var(--rule) solid var(--rule-color-alt)",
          }}>
            {/* Houses */}
            <div>
              <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 16 }}>Houses</p>
              <h2 className="display" style={{ fontSize: 36, fontStyle: "italic", fontWeight: 400, marginBottom: 32 }}>
                The 36 positions
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                {houses.map((h) => (
                  <Link
                    key={h.id}
                    href={`/glossary/houses/${h.id}`}
                    className="mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      opacity: 0.55,
                      display: "flex",
                      gap: 10,
                      textDecoration: "none",
                      color: "inherit",
                      transition: "opacity 0.12s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.55")}
                  >
                    <span style={{ color: "var(--ember)", flexShrink: 0 }}>
                      {String(h.id).padStart(2, "0")}
                    </span>
                    <span>{h.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Techniques */}
            <div>
              <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 16 }}>Techniques</p>
              <h2 className="display" style={{ fontSize: 36, fontStyle: "italic", fontWeight: 400, marginBottom: 32 }}>
                Reading methods
              </h2>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {techniques.map((t, i) => (
                  <Link
                    key={t.slug}
                    href={`/glossary/techniques/${t.slug}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      borderTop: i === 0 ? "var(--rule) solid var(--rule-color-alt)" : "none",
                      borderBottom: "var(--rule) solid var(--rule-color-alt)",
                      padding: "20px 0",
                      display: "block",
                    }}
                  >
                    <div className="display" style={{ fontSize: 22, fontStyle: "italic", marginBottom: 6 }}>{t.title}</div>
                    <div style={{ fontSize: 13, opacity: 0.55, lineHeight: 1.55 }}>{t.summary}</div>
                  </Link>
                ))}
              </div>
              <Link href="/setup" className="btn btn-ghost-dark" style={{ marginTop: 32, fontSize: "10px" }}>
                Begin a Reading
              </Link>
            </div>
          </div>

        </div>
      </div>

      <SiteFooter />

      <style>{`
        @media (max-width: 900px) {
          .glossary-masthead { grid-template-columns: 1fr !important; }
          .glossary-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .glossary-bottom { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .glossary-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </>
  );
}
