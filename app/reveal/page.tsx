"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SpreadGrid } from "@/components/SpreadGrid";
import { CardInspector } from "@/components/CardInspector";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useReadingState } from "@/lib/state/useReadingState";
import type { GTLayout } from "@/lib/engine/types";

const GT_ROWS = 4;
const GT_COLS_4X9 = 9;
const GT_COLS_4X8 = 8;
const CASCADE_TRIGGER = 4;

function firstUnrevealedIndex(revealMap: boolean[]): number | null {
  const idx = revealMap.findIndex((value) => !value);
  return idx >= 0 ? idx : null;
}

function getGrandTableauAutoBatch(revealMap: boolean[], gtLayout: GTLayout): number[] {
  const cols = gtLayout === "4x8+4" ? GT_COLS_4X8 : GT_COLS_4X9;
  const mainCardCount = GT_ROWS * cols;
  if (revealMap.length < mainCardCount) return [];

  const mainReveal = revealMap.slice(0, mainCardCount);
  const cartoucheReveal = gtLayout === "4x8+4" ? revealMap.slice(mainCardCount, mainCardCount + 4) : [];

  if (gtLayout === "4x8+4" && mainReveal.every(Boolean)) {
    const cartoucheIndex = cartoucheReveal.findIndex((value) => !value);
    if (cartoucheIndex >= 0) {
      return [mainCardCount + cartoucheIndex + 1];
    }
    return [];
  }

  const rowCounts = Array.from({ length: GT_ROWS }, (_, row) =>
    mainReveal.slice(row * cols, row * cols + cols).filter(Boolean).length,
  );

  const activeRows: number[] = [];
  for (let row = 0; row < GT_ROWS; row += 1) {
    const trigger = cols < CASCADE_TRIGGER ? cols : CASCADE_TRIGGER;
    const prereqMet = row === 0 || rowCounts[row - 1] >= trigger;
    if (prereqMet && rowCounts[row] < cols) {
      activeRows.push(row);
    }
  }

  if (!activeRows.length) return [];

  const next: number[] = [];
  const topRow = activeRows[0];
  next.push(topRow * cols + rowCounts[topRow] + 1);

  const bottomRow = activeRows[activeRows.length - 1];
  if (bottomRow !== topRow) {
    next.push(bottomRow * cols + rowCounts[bottomRow] + 1);
  }

  return next;
}

export default function RevealPage() {
  const router = useRouter();
  const { ready, state, update } = useReadingState();
  const [autoRevealing, setAutoRevealing] = useState(false);
  const autoTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!state) { router.replace("/setup"); return; }
    if (state.stage === "ritual") { router.replace("/shuffle"); return; }
    if (state.stage === "results") { router.replace("/results"); }
  }, [ready, router, state]);

  const revealMap = state?.stage === "reveal" ? state.revealMap : [];
  const revealedCount = revealMap.filter(Boolean).length;
  const total = revealMap.length;
  const allRevealed = total > 0 && revealedCount === total;
  const pct = total > 0 ? (revealedCount / total) * 100 : 0;

  const flipCards = useCallback((positions: number[]) => {
    if (!state || state.stage !== "reveal") return;
    const validPositions = positions.filter((p) => {
      const i = p - 1;
      return i >= 0 && i < state.revealMap.length && !state.revealMap[i];
    });
    if (!validPositions.length) return;
    update((current) => {
      const revealMap = [...current.revealMap];
      let selected = current.selectedCardPosition;
      validPositions.forEach((p) => {
        const i = p - 1;
        if (!revealMap[i]) { revealMap[i] = true; selected = p; }
      });
      return { ...current, revealMap, selectedCardPosition: selected };
    });
  }, [state, update]);

  const flipCard = useCallback((position: number) => {
    if (!state || state.stage !== "reveal") return;
    const index = position - 1;
    if (state.revealMap[index]) {
      update((current) => ({ ...current, selectedCardPosition: position }));
      return;
    }
    flipCards([position]);
  }, [flipCards, state, update]);

  const revealNext = useCallback(() => {
    if (!state || state.stage !== "reveal") return;
    const nextIndex = firstUnrevealedIndex(state.revealMap);
    if (nextIndex === null) return;
    flipCard(nextIndex + 1);
  }, [flipCard, state]);

  const goResults = useCallback(() => {
    if (!state || state.stage !== "reveal" || !allRevealed) return;
    setAutoRevealing(false);
    update((current) => ({ ...current, stage: "results" }));
    router.push("/results");
  }, [allRevealed, router, state, update]);

  useEffect(() => {
    if (!state || state.stage !== "reveal") return;
    if (!autoRevealing || allRevealed) {
      if (autoTimer.current) { window.clearTimeout(autoTimer.current); autoTimer.current = null; }
      if (allRevealed && autoRevealing) setAutoRevealing(false);
      return;
    }
    autoTimer.current = window.setTimeout(() => {
      if (state.setup.spreadType === "grand-tableau") {
        const batch = getGrandTableauAutoBatch(state.revealMap, state.setup.gtLayout ?? "4x9");
        if (batch.length) flipCards(batch);
        return;
      }
      const nextIndex = firstUnrevealedIndex(state.revealMap);
      if (nextIndex !== null) flipCards([nextIndex + 1]);
    }, state.setup.spreadType === "grand-tableau" ? 170 : 260);
    return () => {
      if (autoTimer.current) { window.clearTimeout(autoTimer.current); autoTimer.current = null; }
    };
  }, [autoRevealing, allRevealed, flipCards, state]);

  if (!ready || !state || state.stage !== "reveal") {
    return <LoadingScreen />;
  }

  const isGT = state.setup.spreadType === "grand-tableau";

  return (
    <div className="surface-ink" style={{ minHeight: "100vh" }}>
      <TopNav activePage={undefined} />

      <div className={isGT ? "container-wide" : "container"} style={{ paddingTop: 48, paddingBottom: 96 }}>

        {/* ── Header ──────────────────────────────────────── */}
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          paddingBottom: 32,
          borderBottom: "var(--rule) solid var(--rule-color)",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 32,
        }}>
          <div>
            <p className="smallcaps" style={{ color: "var(--ember)", marginBottom: 12, opacity: 0.8 }}>
              Turn the cards
            </p>
            <h1 className="display" style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 0.95, margin: 0 }}>
              <em>The spread.</em>
            </h1>
          </div>

          {/* Progress counter */}
          <div style={{ textAlign: "right" }}>
            <span className="numeral" style={{ fontSize: 48, color: "var(--ember)", lineHeight: 1 }}>
              {revealedCount}
            </span>
            <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.4, marginLeft: 8 }}>
              / {total}
            </span>
          </div>
        </div>

        {/* ── Progress bar ────────────────────────────────── */}
        <div style={{ height: 2, background: "var(--rule-color)", marginBottom: 40, borderRadius: 1 }}>
          <div style={{
            height: "100%",
            width: `${pct}%`,
            background: "var(--ember)",
            transition: "width 0.3s ease",
            borderRadius: 1,
          }} />
        </div>

        {/* ── Spread grid ─────────────────────────────────── */}
        <div style={{ marginBottom: 40 }}>
          <SpreadGrid
            spreadType={state.setup.spreadType}
            layout={state.layout}
            revealMap={state.revealMap}
            selectedPosition={state.selectedCardPosition}
            onFlip={flipCard}
            onSelect={(position) =>
              update((current) => ({ ...current, selectedCardPosition: position }))
            }
            gtLayout={state.setup.gtLayout}
            showCastingBoard={false}
            themeId={state.setup.themeId}
          />
        </div>

        {/* ── Action buttons ──────────────────────────────── */}
        <div style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          paddingTop: 32,
          borderTop: "var(--rule) solid var(--rule-color)",
        }}>
          <button
            type="button"
            onClick={revealNext}
            disabled={allRevealed}
            className="mono"
            style={{
              padding: "12px 24px",
              border: "var(--rule) solid var(--rule-color)",
              color: "var(--vellum)",
              background: "transparent",
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              opacity: allRevealed ? 0.3 : 1,
              cursor: allRevealed ? "not-allowed" : "pointer",
              transition: "opacity 0.12s",
            }}
          >
            Turn one
          </button>
          <button
            type="button"
            onClick={() => setAutoRevealing((v) => !v)}
            disabled={allRevealed}
            className="mono"
            style={{
              padding: "12px 24px",
              border: `var(--rule) solid ${autoRevealing ? "var(--ember)" : "var(--rule-color)"}`,
              color: "var(--vellum)",
              background: autoRevealing ? "var(--ink-3)" : "transparent",
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              opacity: allRevealed ? 0.3 : 1,
              cursor: allRevealed ? "not-allowed" : "pointer",
              transition: "background 0.12s, border-color 0.12s, opacity 0.12s",
            }}
          >
            {autoRevealing ? "Stop auto" : "Turn all"}
          </button>
          <button
            type="button"
            onClick={goResults}
            disabled={!allRevealed}
            className="mono"
            style={{
              padding: "12px 32px",
              border: `var(--rule) solid ${allRevealed ? "var(--ember)" : "var(--rule-color)"}`,
              color: allRevealed ? "var(--ember)" : "var(--vellum)",
              background: "transparent",
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              opacity: allRevealed ? 1 : 0.3,
              cursor: allRevealed ? "pointer" : "not-allowed",
              transition: "opacity 0.12s, border-color 0.12s, color 0.12s",
            }}
          >
            Read the cards →
          </button>
        </div>

      </div>

      {/* ── Card inspector ──────────────────────────────────── */}
      <CardInspector state={state} position={state.selectedCardPosition} />

      <SiteFooter />
    </div>
  );
}
