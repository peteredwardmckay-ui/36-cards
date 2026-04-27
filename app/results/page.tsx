"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SpreadGrid } from "@/components/SpreadGrid";
import { LoadingScreen } from "@/components/LoadingScreen";
import { HouseAdSlot } from "@/components/HouseAdSlot";
import { trackEvent } from "@/lib/analytics/ga";
import { ritualSummaryLine } from "@/lib/engine/shuffle";
import type { GeneratedReading, NarrativeSection, ReadingRequestPayload } from "@/lib/engine/types";
import { useReadingState } from "@/lib/state/useReadingState";
import { saveReadingToHistory } from "@/lib/state/storage";

const RESULTS_LOADING_MIN_MS = 4000;
const READING_REQUEST_TIMEOUT_MS = 15_000;

const TECHNIQUE_LABELS: Record<NarrativeSection["technique"], string> = {
  house:        "House position",
  diagonal:     "Diagonal",
  knight:       "Knighting",
  proximity:    "Proximity",
  significator: "Significator",
  pair:         "Pairing",
  timeline:     "Timeline",
  synthesis:    "Synthesis",
};

function spreadLabel(state: ReturnType<typeof useReadingState>["state"]): string {
  if (!state) return "";
  if (state.setup.spreadType === "grand-tableau") {
    return state.setup.gtLayout === "4x8+4"
      ? "Grand Tableau · 4×8 + cartouche"
      : "Grand Tableau · 4×9";
  }
  return "3-card spread";
}

export default function ResultsPage() {
  const router = useRouter();
  const { ready, state, update, clear } = useReadingState();
  const [loadingGatePassed, setLoadingGatePassed] = useState(false);
  const [readingError, setReadingError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const readingRequestRef = useRef<string | null>(null);

  /* ── minimum loading gate ───────────────────────────────── */
  useEffect(() => {
    const timer = window.setTimeout(() => setLoadingGatePassed(true), RESULTS_LOADING_MIN_MS);
    return () => window.clearTimeout(timer);
  }, []);

  /* ── routing guard ──────────────────────────────────────── */
  useEffect(() => {
    if (!ready) return;
    if (!state) { router.replace("/setup"); return; }
    if (state.stage === "ritual") { router.replace("/shuffle"); return; }
    if (state.stage === "reveal") {
      const allRevealed = state.revealMap.every(Boolean);
      if (!allRevealed) { router.replace("/reveal"); return; }
      update((current) => ({ ...current, stage: "results" }));
    }
  }, [ready, router, state, update]);

  /* ── reading generation ─────────────────────────────────── */
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
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ state: requestPayload }),
        });
        if (!response.ok) throw new Error("Reading generation failed.");
        const payload = (await response.json()) as { reading?: GeneratedReading };
        if (!payload.reading) throw new Error("No reading returned.");
        update((current) => {
          if (current.id !== state.id || current.reading) return current;
          const updated = { ...current, reading: payload.reading ?? null };
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
            ? "The reading took too long. Please try again."
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

  /* ── share / copy ───────────────────────────────────────── */
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
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch { /* cancelled or unavailable */ }
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

  /* ── loading / error states ─────────────────────────────── */
  if (!loadingGatePassed || !ready) {
    return <LoadingScreen mode="immersive" />;
  }

  if (state?.stage === "results" && !state.reading && readingError) {
    return (
      <>
        <div className="surface-ink" style={{ minHeight: "100vh" }}>
          <TopNav activePage={undefined} />
          <div className="container" style={{ paddingTop: 56, paddingBottom: 96 }}>
            <p className="smallcaps" style={{ color: "var(--ember)", marginBottom: 20, opacity: 0.8 }}>
              Reading error
            </p>
            <h1 className="display" style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 0.95, margin: "0 0 24px" }}>
              <em>One more try.</em>
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.75, opacity: 0.7, maxWidth: 560, marginBottom: 32 }}>
              {readingError}
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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
                className="btn"
              >
                Try again
              </button>
              <button type="button" onClick={startNewReading} className="btn btn-ghost-dark">
                New reading
              </button>
            </div>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  if (!state || state.stage !== "results" || !state.reading) {
    return <LoadingScreen mode="immersive" />;
  }

  const reading = state.reading;
  const label = spreadLabel(state);
  const styleLabel = state.setup.readingStyle === "deep_dive" ? "Deep dive" : "Quick";
  const subjectLabel = reading.subjectLabel;
  const resolvedTheme = reading.themeOverlay ?? null;
  const dateStr = new Date(state.createdAt).toLocaleDateString("en-AU", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      <div className="surface-ink" style={{ minHeight: "100vh" }}>
        <TopNav activePage={undefined} />
        <div className="container" style={{ paddingTop: 56, paddingBottom: 96 }}>

          {/* ── Reading header ──────────────────────────── */}
          <div style={{
            paddingBottom: 48,
            borderBottom: "var(--rule) solid var(--rule-color)",
            maxWidth: 760,
          }}>
            <p className="smallcaps" style={{ color: "var(--ember)", marginBottom: 16, opacity: 0.8 }}>
              Interpretation
            </p>
            <h1 className="display" style={{ fontSize: "clamp(40px, 5.5vw, 72px)", lineHeight: 0.95, margin: "0 0 20px" }}>
              <em>Your reading.</em>
            </h1>

            {state.setup.question && (
              <p style={{
                fontSize: "clamp(15px, 1.3vw, 18px)",
                lineHeight: 1.65,
                fontStyle: "italic",
                opacity: 0.75,
                maxWidth: 600,
                marginBottom: 20,
                paddingLeft: 20,
                borderLeft: "2px solid var(--ember)",
              }}>
                &ldquo;{state.setup.question}&rdquo;
              </p>
            )}

            <p className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.4 }}>
              {dateStr} · {label} · {styleLabel} · {subjectLabel}
              {resolvedTheme?.resolvedThemeLabel ? ` · ${resolvedTheme.resolvedThemeLabel}` : ""}
            </p>
          </div>

          {/* ── Spread overview ─────────────────────────── */}
          <div style={{
            padding: "40px 0",
            borderBottom: "var(--rule) solid var(--rule-color)",
          }}>
            <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 24 }}>The spread</p>
            <div style={{
              border: "var(--rule) solid var(--rule-color)",
              padding: "24px",
              overflowX: "auto",
            }}>
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
          </div>

          {/* ── Intro ───────────────────────────────────── */}
          <div style={{ padding: "40px 0", borderBottom: "var(--rule) solid var(--rule-color)", maxWidth: 720 }}>
            <p style={{ fontSize: 17, lineHeight: 1.8, opacity: 0.75 }}>{reading.intro}</p>
          </div>

          <div style={{ marginBottom: 0 }}>
            <HouseAdSlot id="ad-first-paragraph" variant="standard" />
          </div>

          {/* ── Ritual detail (collapsed) ────────────────── */}
          <div style={{
            padding: "20px 0",
            borderBottom: "var(--rule) solid var(--rule-color)",
          }}>
            <p className="mono" style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.35 }}>
              {ritualSummaryLine(state.ritual.shuffleRun, state.ritual.cutStep)}
              {" · "}
              {reading.wordCount} words
            </p>
          </div>

          {/* ── Reading sections ─────────────────────────── */}
          <div>
            {reading.sections.map((section, index) => (
              <div key={section.id}>
                <div
                  id={section.id}
                  style={{
                    padding: "40px 0",
                    borderBottom: "var(--rule) solid var(--rule-color)",
                    maxWidth: 760,
                  }}
                >
                  <p className="mono" style={{
                    fontSize: 9,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--ember)",
                    opacity: 0.65,
                    marginBottom: 12,
                  }}>
                    {TECHNIQUE_LABELS[section.technique] ?? section.technique}
                  </p>
                  <h2 className="display" style={{
                    fontSize: "clamp(22px, 2.5vw, 32px)",
                    fontStyle: "italic",
                    fontWeight: 400,
                    lineHeight: 1.1,
                    margin: "0 0 20px",
                  }}>
                    {section.title}
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {section.body.split("\n").filter(Boolean).map((paragraph, pIndex) => (
                      <p key={pIndex} style={{ fontSize: 16, lineHeight: 1.8, opacity: 0.72 }}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
                {index === 2 && (
                  <HouseAdSlot key="ad-mid" id="ad-mid-content" variant="standard" />
                )}
              </div>
            ))}
          </div>

          {/* ── Conclusion ──────────────────────────────── */}
          <div id="closing" style={{
            padding: "40px 0",
            borderBottom: "var(--rule) solid var(--rule-color)",
            maxWidth: 760,
          }}>
            <p className="mono" style={{
              fontSize: 9,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--ember)",
              opacity: 0.65,
              marginBottom: 12,
            }}>
              Synthesis
            </p>
            <h2 className="display" style={{
              fontSize: "clamp(22px, 2.5vw, 32px)",
              fontStyle: "italic",
              fontWeight: 400,
              lineHeight: 1.1,
              margin: "0 0 20px",
            }}>
              Conclusion
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, opacity: 0.72 }}>{reading.conclusion}</p>
            {reading.disclaimer && (
              <p className="mono" style={{
                marginTop: 24,
                fontSize: 9,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                opacity: 0.35,
                lineHeight: 1.7,
              }}>
                {reading.disclaimer}
              </p>
            )}
          </div>

          {/* ── CTA ─────────────────────────────────────── */}
          <div className="results-cta" style={{
            padding: "56px 0",
            borderTop: "var(--rule) solid var(--rule-color)",
            borderBottom: "var(--rule) solid var(--rule-color)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(32px, 5vw, 80px)",
            alignItems: "start",
          }}>
            {/* Left — actions */}
            <div>
              <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 16 }}>What&apos;s next</p>
              <h2 className="display" style={{ fontSize: "clamp(24px, 3vw, 40px)", fontStyle: "italic", fontWeight: 400, margin: "0 0 8px", lineHeight: 1.05 }}>
                Ask another question.
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.65, opacity: 0.55, maxWidth: 400, marginBottom: 32 }}>
                Begin again with a fresh spread and a new question.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button type="button" onClick={startNewReading} className="btn btn-ember">
                  New reading
                </button>
                <button type="button" onClick={copyReading} className="btn btn-ghost-light">
                  {copyStatus === "copied" ? "Shared!" : "Share reading"}
                </button>
              </div>
              <p className="mono" style={{ marginTop: 24, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.4 }}>
                This reading has been saved to your{" "}
                <Link href="/journal" style={{ color: "var(--ember)", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  journal
                </Link>
                .
              </p>
            </div>

            {/* Right — navigate */}
            <div>
              <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 16 }}>Navigate</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="mono"
                  style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.5, textAlign: "left", background: "none", border: "none", cursor: "pointer", color: "var(--vellum)" }}
                >
                  ↑ Back to top
                </button>
                {reading.sections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" })}
                    className="mono"
                    style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.45, textAlign: "left", background: "none", border: "none", cursor: "pointer", color: "var(--vellum)" }}
                  >
                    {s.title}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => document.getElementById("closing")?.scrollIntoView({ behavior: "smooth" })}
                  className="mono"
                  style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.45, textAlign: "left", background: "none", border: "none", cursor: "pointer", color: "var(--vellum)" }}
                >
                  Conclusion
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 0 }}>
            <HouseAdSlot id="ad-footer" variant="compact" />
          </div>

        </div>
      </div>

      <SiteFooter />
    </>
  );
}
