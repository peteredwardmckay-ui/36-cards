"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandHeader } from "@/components/BrandHeader";
import { SpreadGrid } from "@/components/SpreadGrid";
import { CardInspector } from "@/components/CardInspector";
import { LoadingScreen } from "@/components/LoadingScreen";
import { BrandFooter } from "@/components/BrandFooter";
import { useReadingState } from "@/lib/state/useReadingState";
import { getTheme } from "@/lib/ui/themes";
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

  const theme = useMemo(() => getTheme(state?.setup.themeId ?? "botanical-engraving"), [state?.setup.themeId]);

  useEffect(() => {
    if (!ready) return;
    if (!state) {
      router.replace("/setup");
      return;
    }
    if (state.stage === "ritual") {
      router.replace("/shuffle");
      return;
    }
    if (state.stage === "results") {
      router.replace("/results");
    }
  }, [ready, router, state]);

  const revealMap = state?.stage === "reveal" ? state.revealMap : [];
  const revealedCount = revealMap.filter(Boolean).length;
  const total = revealMap.length;
  const allRevealed = total > 0 && revealedCount === total;

  const flipCards = useCallback((positions: number[]) => {
    if (!state || state.stage !== "reveal") return;

    const validPositions = positions.filter((position) => {
      const index = position - 1;
      return index >= 0 && index < state.revealMap.length && !state.revealMap[index];
    });

    if (!validPositions.length) return;

    update((current) => {
      const revealMap = [...current.revealMap];
      let selected = current.selectedCardPosition;

      validPositions.forEach((position) => {
        const index = position - 1;
        if (!revealMap[index]) {
          revealMap[index] = true;
          selected = position;
        }
      });

      return {
        ...current,
        revealMap,
        selectedCardPosition: selected,
      };
    });
  }, [state, update]);

  const flipCard = useCallback((position: number) => {
    if (!state || state.stage !== "reveal") return;

    const index = position - 1;
    if (state.revealMap[index]) {
      update((current) => ({
        ...current,
        selectedCardPosition: position,
      }));
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

    update((current) => ({
      ...current,
      stage: "results",
    }));

    router.push("/results");
  }, [allRevealed, router, state, update]);

  useEffect(() => {
    if (!state || state.stage !== "reveal") return;

    if (!autoRevealing || allRevealed) {
      if (autoTimer.current) {
        window.clearTimeout(autoTimer.current);
        autoTimer.current = null;
      }
      if (allRevealed && autoRevealing) {
        setAutoRevealing(false);
      }
      return;
    }

    autoTimer.current = window.setTimeout(() => {
      if (state.setup.spreadType === "grand-tableau") {
        const batch = getGrandTableauAutoBatch(state.revealMap, state.setup.gtLayout ?? "4x9");
        if (batch.length) {
          flipCards(batch);
        }
        return;
      }

      const nextIndex = firstUnrevealedIndex(state.revealMap);
      if (nextIndex !== null) {
        flipCards([nextIndex + 1]);
      }
    }, state.setup.spreadType === "grand-tableau" ? 170 : 260);

    return () => {
      if (autoTimer.current) {
        window.clearTimeout(autoTimer.current);
        autoTimer.current = null;
      }
    };
  }, [autoRevealing, allRevealed, flipCards, state]);

  if (!ready) {
    return <LoadingScreen />;
  }

  if (!state || state.stage !== "reveal") {
    return <LoadingScreen />;
  }

  return (
    <main className={`${theme.bodyClass} ${theme.displayFontClass} ${theme.bodyFontClass} min-h-screen px-4 py-5 sm:px-6 lg:px-8`}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <BrandHeader compact />

        <section className="flex flex-col gap-4">
          <article className="ritual-panel page-reveal p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="section-kicker">Reveal</span>
                <h1 className="mt-2 text-3xl font-semibold">Turn the Cards</h1>
              </div>
            </div>
            <p className="mt-2 text-sm text-[color:var(--theme-muted,var(--brand-muted))]">
              Flip cards one by one to unfold the spread. Progress: {revealedCount}/{total}.
            </p>

            <div className="mt-4">
              <div className="ritual-progress-track">
                <div className="ritual-progress-fill" style={{ width: `${(revealedCount / total) * 100}%` }} />
              </div>
            </div>

            <div className="mt-4">
              <SpreadGrid
                spreadType={state.setup.spreadType}
                layout={state.layout}
                revealMap={state.revealMap}
                selectedPosition={state.selectedCardPosition}
                onFlip={flipCard}
                onSelect={(position) =>
                  update((current) => ({
                    ...current,
                    selectedCardPosition: position,
                  }))
                }
                gtLayout={state.setup.gtLayout}
                showCastingBoard={false}
                themeId={state.setup.themeId}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={revealNext}
                disabled={allRevealed}
                className="btn-secondary px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Individual Turn
              </button>
              <button
                type="button"
                onClick={() => setAutoRevealing((current) => !current)}
                disabled={allRevealed}
                className="btn-secondary px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                {autoRevealing ? "Automatic Turn (Stop)" : "Automatic Turn"}
              </button>
              <button
                type="button"
                onClick={goResults}
                disabled={!allRevealed}
                className="btn-primary px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                View Results
              </button>
            </div>
          </article>

        </section>

        <CardInspector state={state} position={state.selectedCardPosition} />

        <BrandFooter
          spreadLabel={
            state.setup.spreadType === "grand-tableau"
              ? state.setup.gtLayout === "4x8+4"
                ? "Grand Tableau (4x8 + 4 cartouche)"
                : "Grand Tableau (4x9 continuous)"
              : "3-card"
          }
        />
      </div>
    </main>
  );
}
