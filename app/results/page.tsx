"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandHeader } from "@/components/BrandHeader";
import { SpreadGrid } from "@/components/SpreadGrid";
import { LoadingScreen } from "@/components/LoadingScreen";
import { HouseAdSlot } from "@/components/HouseAdSlot";
import { BrandFooter } from "@/components/BrandFooter";
import { ReadingTOC } from "@/components/ReadingTOC";
import { trackEvent } from "@/lib/analytics/ga";
import { ritualSummaryLine } from "@/lib/engine/shuffle";
import type { GeneratedReading, ReadingRequestPayload } from "@/lib/engine/types";
import { useReadingState } from "@/lib/state/useReadingState";
import { saveReadingToHistory } from "@/lib/state/storage";
import { getTheme } from "@/lib/ui/themes";

const RESULTS_LOADING_MIN_MS = 4000;
const READING_REQUEST_TIMEOUT_MS = 15_000;

export default function ResultsPage() {
  const router = useRouter();
  const { ready, state, update, clear } = useReadingState();
  const [loadingGatePassed, setLoadingGatePassed] = useState(false);
  const [readingError, setReadingError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const readingRequestRef = useRef<string | null>(null);

  const theme = useMemo(() => getTheme(state?.setup.themeId ?? "botanical-engraving"), [state?.setup.themeId]);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoadingGatePassed(true), RESULTS_LOADING_MIN_MS);
    return () => window.clearTimeout(timer);
  }, []);

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

    if (state.stage === "reveal") {
      const allRevealed = state.revealMap.every(Boolean);
      if (!allRevealed) {
        router.replace("/reveal");
        return;
      }

      update((current) => ({
        ...current,
        stage: "results",
      }));
    }
  }, [ready, router, state, update]);

  useEffect(() => {
    if (!ready || !state || state.stage !== "results" || state.reading) return;
    if (readingRequestRef.current === state.id) return;

    readingRequestRef.current = state.id;
    setReadingError(null);

    void (async () => {
      const controller = new AbortController();
      const timeoutHandle = window.setTimeout(() => controller.abort(), READING_REQUEST_TIMEOUT_MS);
      try {
        const requestPayload: ReadingRequestPayload = {
          id: state.id,
          createdAt: state.createdAt,
          setup: state.setup,
          ritual: state.ritual,
          layout: state.layout,
        };

        const response = await fetch("/api/reading", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({ state: requestPayload }),
        });

        if (!response.ok) {
          throw new Error("Reading generation failed.");
        }

        const payload = (await response.json()) as { reading?: GeneratedReading };

        if (!payload.reading) {
          throw new Error("No reading returned.");
        }

        update((current) => {
          if (current.id !== state.id || current.reading) return current;

          const updated = {
            ...current,
            reading: payload.reading ?? null,
          };
          if (updated.reading) saveReadingToHistory(updated);
          return updated;
        });
        trackEvent("reading_generated", {
          subject_id: state.setup.subjectId,
          spread_type: state.setup.spreadType,
          reading_style: state.setup.readingStyle,
        });
      } catch (error) {
        readingRequestRef.current = null;
        const isTimeout = error instanceof DOMException && error.name === "AbortError";
        setReadingError(
          isTimeout
            ? "Reading generation took too long. Please try again."
            : "The reading did not come through cleanly. Please try again.",
        );
        trackEvent("reading_generation_failed", {
          subject_id: state.setup.subjectId,
          spread_type: state.setup.spreadType,
          reading_style: state.setup.readingStyle,
          timed_out: isTimeout,
        });
      } finally {
        window.clearTimeout(timeoutHandle);
      }
    })();
  }, [ready, state, update]);


  const copyReading = async () => {
    if (!state?.reading) return;
    const parts = [
      state.setup.question ? `Question: ${state.setup.question}` : null,
      state.reading.intro,
      ...state.reading.sections.map((s) => `${s.title}\n\n${s.body}`),
      `Conclusion\n\n${state.reading.conclusion}`,
      "36Cards.com",
    ].filter(Boolean);
    const text = parts.join("\n\n");
    try {
      if (navigator.share) {
        await navigator.share({ title: "My 36 Cards Reading", text });
        setCopyStatus("copied");
        setTimeout(() => setCopyStatus("idle"), 2000);
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      // cancelled or unavailable
    }
  };

  const startNewReading = () => {
    if (state) {
      trackEvent("start_new_reading", {
        subject_id: state.setup.subjectId,
        spread_type: state.setup.spreadType,
        reading_style: state.setup.readingStyle,
      });
    }
    clear();
    router.push("/setup");
  };

  if (!loadingGatePassed || !ready) {
    return <LoadingScreen mode="immersive" />;
  }

  if (state?.stage === "results" && !state.reading && readingError) {
    return (
      <main className={`${theme.bodyClass} ${theme.displayFontClass} ${theme.bodyFontClass} min-h-screen px-4 py-5 sm:px-6 lg:px-8`}>
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
          <BrandHeader compact />
          <section className="ritual-panel page-reveal p-5">
            <span className="section-kicker">Reading Error</span>
            <h1 className="mt-3 text-3xl font-semibold">We need one more try.</h1>
            <p className="mt-3 max-w-2xl text-sm text-[color:var(--theme-muted,var(--brand-muted))]">
              {readingError}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  readingRequestRef.current = null;
                  setReadingError(null);
                  trackEvent("reading_generation_retry", {
                    subject_id: state.setup.subjectId,
                    spread_type: state.setup.spreadType,
                    reading_style: state.setup.readingStyle,
                  });
                }}
                className="btn-primary rounded-full px-4 py-2 text-sm font-semibold"
              >
                Try Again
              </button>
              <button type="button" onClick={startNewReading} className="btn-ghost rounded-full px-4 py-2 text-sm font-semibold">
                Start New Reading
              </button>
            </div>
          </section>
          <BrandFooter spreadLabel={state.setup.spreadType === "grand-tableau" ? (state.setup.gtLayout === "4x8+4" ? "Grand Tableau (4x8 + 4 cartouche)" : "Grand Tableau (4x9 continuous)") : "3-card"} />
        </div>
      </main>
    );
  }

  if (!state || state.stage !== "results" || !state.reading) {
    return <LoadingScreen mode="immersive" />;
  }

  const subjectLabel = state.reading.subjectLabel;
  const resolvedTheme = state.reading.themeOverlay ?? null;
  const gtLayoutLabel =
    state.setup.gtLayout === "4x8+4" ? "Grand Tableau (4x8 + 4 cartouche)" : "Grand Tableau (4x9 continuous)";

  return (
    <main className={`${theme.bodyClass} ${theme.displayFontClass} ${theme.bodyFontClass} min-h-screen px-4 py-5 sm:px-6 lg:px-8`}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <BrandHeader compact />

        <section>
          <article className="ritual-panel page-reveal p-5">
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="section-kicker">Interpretation</span>
                <h1 className="mt-2 text-3xl font-semibold">Your Reading Results</h1>
                {state.setup.question ? (
                  <p className="mt-2 max-w-2xl border-l-2 border-[color:var(--theme-accent,var(--brand-accent))] pl-3 text-base italic text-[color:var(--theme-text,var(--brand-text))]">
                    &ldquo;{state.setup.question}&rdquo;
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-[color:var(--theme-muted,var(--brand-muted))]">{new Date(state.createdAt).toLocaleString()}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[color:var(--theme-muted,var(--brand-muted))]">
                  Spread: {state.setup.spreadType === "grand-tableau" ? gtLayoutLabel : "3-card"}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[color:var(--theme-muted,var(--brand-muted))]">
                  Style: {state.setup.readingStyle === "deep_dive" ? "Deep Dive" : "Quick"}
                </p>
                {state.setup.spreadType === "grand-tableau" ? (
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[color:var(--theme-muted,var(--brand-muted))]">
                    Houses: {state.setup.includeHouses ? "Included" : "Not Included"}
                  </p>
                ) : null}
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[color:var(--theme-muted,var(--brand-muted))]">Subject: {subjectLabel}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[color:var(--theme-muted,var(--brand-muted))]">
                  Theme: {resolvedTheme?.resolvedThemeLabel ?? "Auto"} ({resolvedTheme?.mode ?? "explicit"})
                </p>
                {resolvedTheme?.subjectContextNote ? (
                  <p className="mt-1 text-xs text-[color:var(--theme-muted,var(--brand-muted))]">{resolvedTheme.subjectContextNote}</p>
                ) : null}
              </div>
            </header>

            <div className="ritual-panel-soft mt-4 p-3">
              <SpreadGrid
                spreadType={state.setup.spreadType}
                layout={state.layout}
                revealMap={state.revealMap}
                selectedPosition={null}
                onFlip={() => {}}
                onSelect={() => {}}
                gtLayout={state.setup.gtLayout}
                showCastingBoard={false}
                themeId={state.setup.themeId}
                readonly
              />
            </div>

            <div className="ritual-panel-soft mt-3 p-3">
              <p className="text-sm text-[color:var(--theme-text,var(--brand-text))]">{state.reading.intro}</p>
            </div>

            <div className="mt-3">
              <HouseAdSlot id="ad-first-paragraph" variant="standard" />
            </div>

            <div className="ritual-panel-soft mt-4 p-3 text-xs text-[color:var(--theme-muted,var(--brand-muted))]">
              <p>Ritual details: {ritualSummaryLine(state.ritual.shuffleRun, state.ritual.cutStep)}</p>
              <p className="mt-1">Generated narrative length: {state.reading.wordCount} words</p>
            </div>

            {state.setup.spreadType === "grand-tableau" && state.reading.sections.length > 3 ? (
              <ReadingTOC sections={state.reading.sections} />
            ) : null}

            <div className="reading-prose mt-4 space-y-4">
              {state.reading.sections.map((section, index) => (
                <>
                  <section
                    id={section.id}
                    key={section.id}
                    className="ritual-panel-soft border-l-4 border-l-[color:var(--theme-accent,var(--brand-accent))] p-3"
                  >
                    <h2 className="text-xl font-semibold">{section.title}</h2>
                    <div className="mt-2 space-y-2 text-sm text-[color:var(--theme-text,var(--brand-text))]">
                      {section.body.split("\n").filter(Boolean).map((paragraph, pIndex) => (
                        <p key={pIndex}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                  {index === 2 ? (
                    <HouseAdSlot key="ad-mid" id="ad-mid-content" variant="standard" />
                  ) : null}
                </>
              ))}
            </div>

            <section id="closing" className="ritual-panel-soft mt-4 border-l-4 border-l-[color:var(--theme-accent,var(--brand-accent))] p-3">
              <h2 className="text-xl font-semibold">Conclusion</h2>
              <p className="mt-2 text-sm text-[color:var(--theme-text,var(--brand-text))]">{state.reading.conclusion}</p>
              {state.reading.disclaimer ? (
                <p className="mt-3 text-xs text-[color:var(--theme-muted,var(--brand-muted))]">{state.reading.disclaimer}</p>
              ) : null}
            </section>

            <section
             
              className="ritual-panel-soft sky-cta mt-4 overflow-hidden p-4 sm:p-5"
            >
              <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <span className="section-kicker">What&apos;s Next</span>
                  <h2 className="mt-3 text-2xl font-semibold">Share your reading or ask another question.</h2>
                  <p className="mt-2 text-sm text-[color:var(--theme-muted,var(--brand-muted))]">
                    Send this reading to someone, or begin again with a new question and a fresh spread.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={startNewReading} className="btn-primary rounded-full px-4 py-2 text-sm font-semibold">
                    Start New Reading
                  </button>
                  <button type="button" onClick={copyReading} className="btn-secondary rounded-full px-4 py-2 text-sm font-semibold">
                    {copyStatus === "copied" ? "Shared!" : "Share Reading"}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="btn-ghost rounded-full px-4 py-2 text-sm font-semibold"
                  >
                    Back to Top
                  </button>
                </div>
              </div>
            </section>
          </article>
        </section>

        <div>
          <HouseAdSlot id="ad-footer" variant="compact" />
        </div>

        <BrandFooter spreadLabel={state.setup.spreadType === "grand-tableau" ? gtLayoutLabel : "3-card"} />
      </div>
    </main>
  );
}
