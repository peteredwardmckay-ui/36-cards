"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BrandHeader } from "@/components/BrandHeader";
import { BrandFooter } from "@/components/BrandFooter";
import { HowRandomnessModal } from "@/components/HowRandomnessModal";
import { LoadingScreen } from "@/components/LoadingScreen";
import {
  applyThreePileCut,
  buildRitualSeedMaterial,
  describeCutChoice,
  MAX_RIFFLE_INTENSITY,
  MIN_RIFFLE_INTENSITY,
  normalizeRiffleIntensity,
  performRifflePasses,
  ritualSummaryLine,
} from "@/lib/engine/shuffle";
import { useReadingState } from "@/lib/state/useReadingState";
import { getSpreadCardCount } from "@/lib/state/storage";
import { getTheme, THEMES } from "@/lib/ui/themes";
import { cn } from "@/lib/utils/cn";

const SELECTED_BUTTON_CLASSES =
  "border-[color:var(--theme-accent,var(--brand-accent))]";
const SELECTED_BUTTON_STYLE: CSSProperties = {
  background: "color-mix(in oklab, var(--theme-panel, var(--brand-panel)) 72%, #f4df9a 28%)",
  boxShadow: "inset 0 0 0 1px rgba(220, 171, 54, 0.28)",
};

export default function ShufflePage() {
  const router = useRouter();
  const { ready, state, update } = useReadingState();

  const theme = useMemo(() => getTheme(state?.setup.themeId ?? "botanical-engraving"), [state?.setup.themeId]);
  const [auditOpen, setAuditOpen] = useState(false);

  const handleDeckThemeSelect = (nextThemeId: string) => {
    update((current) => ({
      ...current,
      setup: { ...current.setup, themeId: nextThemeId },
    }));
  };

  useEffect(() => {
    if (!ready) return;
    if (!state) {
      router.replace("/setup");
      return;
    }
    if (state.stage === "reveal") {
      router.replace("/reveal");
      return;
    }
    if (state.stage === "results") {
      router.replace("/results");
    }
  }, [ready, router, state]);

  if (!ready) {
    return <LoadingScreen />;
  }

  if (!state || state.stage !== "ritual") {
    return <LoadingScreen />;
  }

  const cardCount = getSpreadCardCount(state.setup.spreadType);
  const shuffleReady = Boolean(state.ritual.shuffleRun);
  const cutReady = Boolean(state.ritual.cutStep);
  const locked = state.ritual.locked;
  const ritualProgress = cutReady ? 100 : shuffleReady ? 60 : 20;

  const runShuffle = () => {
    if (locked) return;

    const now = Date.now();
    const interactionTrace = [...state.ritual.interactionTrace, now];
    const seedMaterial = buildRitualSeedMaterial({
      readingId: state.id,
      createdAt: state.createdAt,
      question: state.setup.question,
      spreadType: state.setup.spreadType,
      interactionTrace,
      intensity: state.ritual.intensity,
    });

    const run = performRifflePasses(state.ritual.intensity, seedMaterial, state.deck);

    update((current) => ({
      ...current,
      ritual: {
        ...current.ritual,
        interactionTrace,
        shuffleRun: run,
        cutStep: null,
      },
      deck: run.deckAfterShuffle,
      layout: run.deckAfterShuffle.slice(0, cardCount),
      revealMap: Array.from({ length: cardCount }, () => false),
      reading: null,
      selectedCardPosition: null,
    }));
  };

  const chooseCut = (choice: 1 | 2 | 3) => {
    if (locked || !state.ritual.shuffleRun) return;

    const cutStep = applyThreePileCut(state.ritual.shuffleRun.deckAfterShuffle, choice);

    update((current) => ({
      ...current,
      ritual: {
        ...current.ritual,
        cutStep,
      },
      deck: cutStep.deckAfterCut,
      layout: cutStep.deckAfterCut.slice(0, cardCount),
      revealMap: Array.from({ length: cardCount }, () => false),
      reading: null,
      selectedCardPosition: null,
    }));
  };

  const layCards = () => {
    if (locked || !state.ritual.shuffleRun || !state.ritual.cutStep) return;

    update((current) => ({
      ...current,
      stage: "reveal",
      ritual: {
        ...current.ritual,
        locked: true,
      },
      revealMap: Array.from({ length: cardCount }, () => false),
      selectedCardPosition: null,
      reading: null,
    }));

    router.push("/reveal");
  };

  return (
    <main className={`${theme.bodyClass} ${theme.displayFontClass} ${theme.bodyFontClass} min-h-screen px-4 py-5 sm:px-6 lg:px-8`}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <BrandHeader compact />

        {/* Step 1: Choose Your Deck */}
        <section className="ritual-panel page-reveal p-5">
          <span className="section-kicker">Step 1</span>
          <h1 className="mt-2 text-3xl font-semibold">Choose Your Deck</h1>
          <p className="mt-2 text-sm text-[color:var(--theme-muted,var(--brand-muted))]">
            Select the card art for this reading.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                disabled={locked}
                onClick={() => handleDeckThemeSelect(t.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border p-2 text-center transition-colors disabled:opacity-50",
                  state.setup.themeId === t.id
                    ? SELECTED_BUTTON_CLASSES
                    : "border-[color:var(--theme-border,var(--brand-border))]",
                )}
                style={state.setup.themeId === t.id ? SELECTED_BUTTON_STYLE : undefined}
              >
                <div className="relative w-full overflow-hidden rounded" style={{ aspectRatio: "2/3" }}>
                  <Image
                    src={`/cards/${t.id}/${t.previewCardFile}`}
                    alt={`${t.label} deck`}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-xs font-semibold leading-tight text-[color:var(--theme-text,var(--brand-text))]">{t.label}</span>
                <span className="text-[10px] leading-tight text-[color:var(--theme-muted,var(--brand-muted))]">{t.subtitle}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Step 2: Shuffle and Cut */}
        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="ritual-panel page-reveal p-5">
            <span className="section-kicker">Step 2</span>
            <h2 className="mt-2 text-3xl font-semibold">Shuffle and Cut</h2>
            <p className="mt-2 text-sm text-[color:var(--theme-muted,var(--brand-muted))]">
              Shuffle intensity equals the number of riffle passes applied. The safe range is {MIN_RIFFLE_INTENSITY}–{MAX_RIFFLE_INTENSITY}.
            </p>

            <div className="mt-4">
              <div className="ritual-progress-track">
                <div className="ritual-progress-fill" style={{ width: `${ritualProgress}%` }} />
              </div>
              <div className="mt-1 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-[color:var(--theme-muted,var(--brand-muted))]">
                <span>Shuffle</span>
                <span>Cut</span>
                <span>Lay</span>
              </div>
            </div>

            <div className="ritual-panel-soft mt-5 p-4">
              <label className="block text-sm font-medium text-[color:var(--theme-text,var(--brand-text))]">
                Shuffle Intensity: {state.ritual.intensity}
                <input
                  type="range"
                  min={MIN_RIFFLE_INTENSITY}
                  max={MAX_RIFFLE_INTENSITY}
                  value={state.ritual.intensity}
                  disabled={locked}
                  onChange={(event) => {
                    const value = normalizeRiffleIntensity(Number(event.target.value));
                    update((current) => ({
                      ...current,
                      ritual: {
                        ...current.ritual,
                        intensity: value,
                      },
                    }));
                  }}
                  className="mt-2 w-full"
                />
              </label>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={locked}
                  onClick={runShuffle}
                  className="btn-primary px-4 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  Shuffle {state.ritual.intensity} {state.ritual.intensity > 1 ? "Times" : "Time"}
                </button>
                <HowRandomnessModal />
              </div>
            </div>

            <div className="ritual-panel-soft mt-4 p-4">
              <h3 className="text-lg font-semibold">Cut the Deck</h3>
              <p className="mt-1 text-sm text-[color:var(--theme-muted,var(--brand-muted))]">
                Choose which pile to bring to the top.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[1, 2, 3].map((pile) => (
                  <button
                    key={pile}
                    type="button"
                    disabled={!shuffleReady || locked}
                    onClick={() => chooseCut(pile as 1 | 2 | 3)}
                    className={cn(
                      "btn-secondary rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50",
                      state.ritual.cutStep?.choice === pile && SELECTED_BUTTON_CLASSES,
                    )}
                    style={state.ritual.cutStep?.choice === pile ? SELECTED_BUTTON_STYLE : undefined}
                  >
                    {describeCutChoice(pile as 1 | 2 | 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!cutReady || locked}
                onClick={layCards}
                className="btn-primary px-5 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Lay the Cards
              </button>
              <p className="self-center text-xs text-[color:var(--theme-muted,var(--brand-muted))]">
                No changes after reveal starts.
              </p>
            </div>
          </article>

          <aside className="space-y-4">
            <section className="ritual-panel page-reveal p-4">
              <h3 className="text-lg font-semibold">Sorting Sequence</h3>
              <p className="mt-2 text-xs text-[color:var(--theme-muted,var(--brand-muted))]">
                {ritualSummaryLine(state.ritual.shuffleRun, state.ritual.cutStep)}
              </p>
              <p className="mt-2 text-xs text-[color:var(--theme-muted,var(--brand-muted))]">Spread cards: {cardCount}</p>
              {state.setup.spreadType === "grand-tableau" ? (
                <p className="mt-2 text-xs text-[color:var(--theme-muted,var(--brand-muted))]">
                  Layout: {state.setup.gtLayout === "4x8+4" ? "4x8 + 4 cartouche" : "4x9 continuous"}
                </p>
              ) : null}
            </section>

            <section className="ritual-panel page-reveal p-4">
              <button
                type="button"
                onClick={() => setAuditOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-2 text-left"
              >
                <h3 className="text-lg font-semibold">Shuffle Audit</h3>
                <span className="text-xs text-[color:var(--theme-muted,var(--brand-muted))]">{auditOpen ? "Hide" : "Show"}</span>
              </button>
              {auditOpen && (
                <div className="mt-2 max-h-80 space-y-2 overflow-auto pr-1 text-xs text-[color:var(--theme-muted,var(--brand-muted))]">
                  {!state.ritual.shuffleRun ? (
                    <p>No shuffle has been executed yet.</p>
                  ) : (
                    state.ritual.shuffleRun.passes.map((pass) => (
                      <div key={pass.passIndex} className="ritual-panel-soft p-2">
                        <p className="font-semibold">Pass {pass.passIndex + 1}</p>
                        <p>Seed: {pass.seed}</p>
                        <p>
                          Split: {pass.leftCount}/{pass.rightCount} (index {pass.splitIndex})
                        </p>
                        <p>Interleave: {pass.interleaveDecisions.slice(0, 18)}... ({pass.interleaveDecisions.length} steps)</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </section>
          </aside>
        </section>

        <BrandFooter spreadLabel={state.setup.spreadType === "grand-tableau" ? "Grand Tableau" : "3-card"} />
      </div>
    </main>
  );
}
