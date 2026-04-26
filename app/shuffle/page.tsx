"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { SiteFooter } from "@/components/SiteFooter";
import { LoadingScreen } from "@/components/LoadingScreen";
import {
  applyThreePileCut,
  buildRitualSeedMaterial,
  performRifflePasses,
} from "@/lib/engine/shuffle";
import { useReadingState } from "@/lib/state/useReadingState";
import { getSpreadCardCount } from "@/lib/state/storage";
import { THEMES } from "@/lib/ui/themes";

/* =========================================================
   Preset options
   ========================================================= */

const SHUFFLE_PRESETS = [
  { label: "5×", intensity: 5 },
  { label: "6×", intensity: 6 },
  { label: "7×", intensity: 7 },
];

const CUT_PRESETS = [
  { label: "No cut",  sub: "Original order", pile: 1 as const },
  { label: "1 cut",   sub: "Pile 2 to top",  pile: 2 as const },
  { label: "2 cuts",  sub: "Pile 3 to top",  pile: 3 as const },
];

/* =========================================================
   Page
   ========================================================= */

export default function ShufflePage() {
  const router = useRouter();
  const { ready, state, update } = useReadingState();
  const [justShuffled, setJustShuffled] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!state) { router.replace("/setup"); return; }
    if (state.stage === "reveal")  { router.replace("/reveal");  return; }
    if (state.stage === "results") { router.replace("/results"); return; }
  }, [ready, router, state]);

  const cardCount = useMemo(
    () => (state ? getSpreadCardCount(state.setup.spreadType) : 0),
    [state],
  );

  if (!ready || !state || state.stage !== "ritual") return <LoadingScreen />;

  const { locked } = state.ritual;
  const shuffleRun  = state.ritual.shuffleRun;
  const cutStep     = state.ritual.cutStep;
  const shuffleDone = Boolean(shuffleRun);
  const cutDone     = Boolean(cutStep);
  const canLay      = shuffleDone && cutDone && !locked;

  /* ── Handlers ── */

  const handleDeckSelect = (themeId: string) => {
    if (locked) return;
    update((c) => ({ ...c, setup: { ...c.setup, themeId } }));
  };

  const handleShuffle = (intensity: number) => {
    if (locked) return;
    const now = Date.now();
    const trace = [...state.ritual.interactionTrace, now];
    const seed  = buildRitualSeedMaterial({
      readingId:    state.id,
      createdAt:    state.createdAt,
      question:     state.setup.question,
      spreadType:   state.setup.spreadType,
      interactionTrace: trace,
      intensity,
    });
    const run = performRifflePasses(intensity, seed, state.deck);
    update((c) => ({
      ...c,
      ritual: { ...c.ritual, interactionTrace: trace, shuffleRun: run, cutStep: null, intensity },
      deck:    run.deckAfterShuffle,
      layout:  run.deckAfterShuffle.slice(0, cardCount),
      revealMap: Array.from({ length: cardCount }, () => false),
      reading: null,
      selectedCardPosition: null,
    }));
    setJustShuffled(true);
  };

  const handleCut = (pile: 1 | 2 | 3) => {
    if (locked || !shuffleRun) return;
    const cut = applyThreePileCut(shuffleRun.deckAfterShuffle, pile);
    update((c) => ({
      ...c,
      ritual: { ...c.ritual, cutStep: cut },
      deck:   cut.deckAfterCut,
      layout: cut.deckAfterCut.slice(0, cardCount),
      revealMap: Array.from({ length: cardCount }, () => false),
      reading: null,
      selectedCardPosition: null,
    }));
  };

  const handleLay = () => {
    if (!canLay) return;
    update((c) => ({
      ...c,
      stage: "reveal",
      ritual: { ...c.ritual, locked: true },
      revealMap: Array.from({ length: cardCount }, () => false),
      selectedCardPosition: null,
      reading: null,
    }));
    router.push("/reveal");
  };

  const selectedIntensity = shuffleRun?.intensity ?? null;
  const selectedCutPile   = cutStep?.choice ?? null;

  return (
    <>
      <TopNav />

      <div className="surface-ink" style={{ minHeight: "100vh" }}>
        <div className="container-wide" style={{ paddingTop: 64, paddingBottom: 96 }}>

          {/* Masthead */}
          <div style={{ marginBottom: 64 }}>
            <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 16 }}>
              {state.setup.spreadType === "grand-tableau" ? "Grand Tableau" : "3-Card Reading"}
            </p>
            <h1 className="display" style={{
              fontSize: "clamp(48px, 6vw, 88px)",
              lineHeight: 0.95,
              fontWeight: 300,
            }}>
              Prepare<br />
              <span className="italic-display" style={{ color: "var(--ember)" }}>the deck.</span>
            </h1>
          </div>

          <hr className="rule" />

          {/* ── I. Choose your deck ─────────────────────── */}
          <ShuffleRow num="I." label="The deck">
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: 16,
            }}>
              {THEMES.map((t) => {
                const sel = state.setup.themeId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={locked}
                    onClick={() => handleDeckSelect(t.id)}
                    style={{
                      textAlign: "left",
                      border: `var(--rule) solid ${sel ? "var(--ember)" : "var(--rule-color)"}`,
                      background: sel ? "var(--ink-2)" : "transparent",
                      padding: 0,
                      color: "var(--vellum)",
                      transition: "border-color 0.15s, background 0.15s",
                      opacity: locked ? 0.5 : 1,
                    }}
                  >
                    <div style={{ position: "relative", aspectRatio: "2/3", width: "100%" }}>
                      <Image
                        src={`/cards/${t.id}/${t.previewCardFile}`}
                        alt={`${t.label} deck`}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ padding: "10px 12px" }}>
                      <div className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                        {t.label}
                      </div>
                      <div style={{ fontSize: 11, opacity: 0.5, marginTop: 3 }}>{t.subtitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ShuffleRow>

          {/* ── II. Shuffle ─────────────────────────────── */}
          <ShuffleRow num="II." label="The shuffle">
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <p style={{ opacity: 0.55, fontSize: 15, lineHeight: 1.55, maxWidth: 520 }}>
                Choose how many times the deck is riffled. Each pass uses your
                question and timing as part of the seed.
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                {SHUFFLE_PRESETS.map(({ label, intensity }) => {
                  const sel = selectedIntensity === intensity;
                  return (
                    <button
                      key={label}
                      type="button"
                      disabled={locked}
                      onClick={() => handleShuffle(intensity)}
                      style={{
                        width: 80,
                        height: 80,
                        border: `var(--rule) solid ${sel ? "var(--ember)" : "var(--rule-color)"}`,
                        background: sel ? "var(--ink-3)" : "transparent",
                        color: "var(--vellum)",
                        fontFamily: "var(--serif-display)",
                        fontSize: 32,
                        fontStyle: "italic",
                        fontWeight: 300,
                        transition: "border-color 0.15s, background 0.15s",
                        opacity: locked ? 0.5 : 1,
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {shuffleDone && (
                <p className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ember)", opacity: 0.85 }}>
                  ✓ Shuffled {selectedIntensity}× — {cardCount} cards ordered
                </p>
              )}
            </div>
          </ShuffleRow>

          {/* ── III. Cut ────────────────────────────────── */}
          <ShuffleRow num="III." label="The cut">
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <p style={{ opacity: shuffleDone ? 0.55 : 0.3, fontSize: 15, lineHeight: 1.55, maxWidth: 520, transition: "opacity 0.2s" }}>
                Cut the deck to complete the preparation.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {CUT_PRESETS.map(({ label, sub, pile }) => {
                  const sel = selectedCutPile === pile;
                  return (
                    <button
                      key={label}
                      type="button"
                      disabled={!shuffleDone || locked}
                      onClick={() => handleCut(pile)}
                      style={{
                        padding: "16px 24px",
                        textAlign: "left",
                        border: `var(--rule) solid ${sel ? "var(--ember)" : "var(--rule-color)"}`,
                        background: sel ? "var(--ink-3)" : "transparent",
                        color: "var(--vellum)",
                        transition: "border-color 0.15s, background 0.15s, opacity 0.2s",
                        opacity: (!shuffleDone || locked) ? 0.25 : 1,
                      }}
                    >
                      <div className="display" style={{ fontSize: 22, fontWeight: 400 }}>{label}</div>
                      <div className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.5, marginTop: 6 }}>{sub}</div>
                    </button>
                  );
                })}
              </div>
              {cutDone && (
                <p className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ember)", opacity: 0.85 }}>
                  ✓ Cut complete
                </p>
              )}
            </div>
          </ShuffleRow>

          {/* ── Lay the Cards ───────────────────────────── */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 56,
            flexWrap: "wrap",
            gap: 24,
          }}>
            <p className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.4 }}>
              {canLay
                ? "Ready — the deck is prepared"
                : !shuffleDone
                  ? "Shuffle first, then cut"
                  : "Choose a cut to continue"}
            </p>
            <button
              type="button"
              onClick={handleLay}
              disabled={!canLay}
              className="btn btn-ember"
              style={{ opacity: canLay ? 1 : 0.3, transition: "opacity 0.2s" }}
            >
              Lay the Cards <span style={{ fontFamily: "var(--serif-display)", marginLeft: 8 }}>→</span>
            </button>
          </div>

        </div>
      </div>

      <SiteFooter spreadLabel={state.setup.spreadType === "grand-tableau" ? "Grand Tableau" : "3-card"} />

      <style>{`
        @media (max-width: 900px) {
          .shuffle-deck-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .shuffle-deck-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </>
  );
}

/* =========================================================
   Row helper
   ========================================================= */

function ShuffleRow({ num, label, children }: { num: string; label: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "180px 1fr",
      gap: 48,
      padding: "40px 0",
      borderBottom: "var(--rule) solid var(--rule-color)",
    }}>
      <div>
        <div className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.5 }}>
          {num}
        </div>
        <div className="display" style={{ fontSize: 28, fontStyle: "italic", marginTop: 8, fontWeight: 400 }}>
          {label}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}
