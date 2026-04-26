"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TopNav } from "@/components/TopNav";
import { SiteFooter } from "@/components/SiteFooter";
import { LoadingScreen } from "@/components/LoadingScreen";
import {
  getPublicSubjectDefinition,
  getPublicSubjectThemes,
  normalizePublicThemeSelection,
  PUBLIC_SUBJECT_UI_GRID_ORDER,
} from "@/lib/content/publicSetupTaxonomy";
import { useReadingState } from "@/lib/state/useReadingState";
import type { SetupInput } from "@/lib/state/storage";
import type { GTLayout } from "@/lib/engine/types";
import { trackEvent } from "@/lib/analytics/ga";

/* =========================================================
   Types
   ========================================================= */

type SpreadMode = "triad" | "tableau" | "tableau-cartouche";

/* =========================================================
   Suggested questions
   ========================================================= */

const SUGGESTED_QUESTIONS = [
  "What does the next month ask of me?",
  "Where does this work want to go?",
  "How does this relationship stand?",
];

/* =========================================================
   Significator options
   ========================================================= */

const SIGNIFICATOR_OPTIONS: {
  id: SetupInput["significatorMode"];
  label: string;
  cardId: number | null;
  cardSlug: string | null;
}[] = [
  { id: "self",         label: "The Querent (29)",     cardId: 29, cardSlug: "querent" },
  { id: "other",        label: "The Counterpart (28)", cardId: 28, cardSlug: "counterpart" },
  { id: "relationship", label: "Relationship axis",    cardId: null, cardSlug: null },
  { id: "open",         label: "No significator",      cardId: null, cardSlug: null },
];

/* =========================================================
   Page
   ========================================================= */

export default function SetupPage() {
  const router = useRouter();
  const { ready, state, createFromSetup } = useReadingState();

  /* Form state */
  const [question, setQuestion] = useState("");
  const [subjectId, setSubjectId] = useState<SetupInput["subjectId"]>("general_reading");
  const [interpretationThemeId, setInterpretationThemeId] = useState<SetupInput["interpretationThemeId"]>("auto");
  const [readingStyle, setReadingStyle] = useState<SetupInput["readingStyle"]>("quick");
  const [includeHouses, setIncludeHouses] = useState<SetupInput["includeHouses"]>(true);
  const [spreadMode, setSpreadMode] = useState<SpreadMode>("tableau");
  const [threeCardMode, setThreeCardMode] = useState<SetupInput["threeCardMode"]>("past-present-future");
  const [significatorMode, setSignificatorMode] = useState<SetupInput["significatorMode"]>("self");

  /* Derive SetupInput spread fields from spreadMode */
  const spreadType: SetupInput["spreadType"] = spreadMode === "triad" ? "three-card" : "grand-tableau";
  const gtLayout: GTLayout = spreadMode === "tableau-cartouche" ? "4x8+4" : "4x9";

  /* themeId — kept for results-page compatibility; no UI shown */
  const themeId = "neo-noir";

  /* Restore from existing reading state */
  useEffect(() => {
    if (!ready || !state) return;
    if (state.stage === "ritual" || state.stage === "reveal" || state.stage === "results") {
      const s = state.setup;
      setQuestion(s.question);
      setSubjectId(s.subjectId ?? "general_reading");
      setInterpretationThemeId(
        normalizePublicThemeSelection(s.subjectId ?? "general_reading", s.interpretationThemeId),
      );
      setReadingStyle(s.readingStyle ?? "quick");
      setIncludeHouses(s.includeHouses ?? true);
      if (s.spreadType === "three-card") {
        setSpreadMode("triad");
        setThreeCardMode(s.threeCardMode);
      } else {
        setSpreadMode(s.gtLayout === "4x8+4" ? "tableau-cartouche" : "tableau");
      }
      setSignificatorMode(s.significatorMode);
    }
  }, [ready, state]);

  /* Reset theme lens when subject changes */
  useEffect(() => {
    setInterpretationThemeId((c) => normalizePublicThemeSelection(subjectId, c));
  }, [subjectId]);

  const subjectThemes = useMemo(() => getPublicSubjectThemes(subjectId), [subjectId]);

  /* Handlers */
  const handleSubjectSelect = (id: SetupInput["subjectId"]) => {
    setSubjectId(id);
    trackEvent("subject_selected", { subject_id: id });
  };

  const handleThemeLensSelect = (id: SetupInput["interpretationThemeId"]) => {
    setInterpretationThemeId(id);
    trackEvent("theme_lens_selected", { subject_id: subjectId, theme_lens_id: id });
  };

  const handleSignificatorModeChange = (id: SetupInput["significatorMode"]) => {
    setSignificatorMode(id);
    trackEvent("significator_mode_selected", { significator_mode: id });
  };

  const handleReadingStyleSelect = (s: SetupInput["readingStyle"]) => {
    setReadingStyle(s);
    trackEvent("reading_style_selected", { reading_style: s });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = createFromSetup({
      question,
      subjectId,
      interpretationThemeId,
      readingStyle,
      includeHouses,
      spreadType,
      gtLayout,
      threeCardMode,
      themeId,
      significatorMode,
    });
    if (next) {
      trackEvent("reading_started", {
        subject_id: subjectId,
        spread_type: spreadType,
        reading_style: readingStyle,
        has_question: Boolean(question.trim()),
      });
      router.push("/shuffle");
    }
  };

  if (!ready) return <LoadingScreen />;

  /* Step numbers — axis row shifts when triad is selected */
  const axisStep   = "III.";
  const focusStep  = spreadMode === "triad" ? "IV." : "III.";
  const readerStep = spreadMode === "triad" ? "V."  : "IV.";
  const estTime    = spreadMode === "triad" ? "~4" : "~12";

  return (
    <>
      <TopNav activePage="setup" />

      <div className="surface-ink" style={{ minHeight: "100vh" }}>
        <form onSubmit={onSubmit}>
          <div className="container-wide" style={{ paddingTop: 64, paddingBottom: 96 }}>

            {/* ── Masthead ──────────────────────────────── */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.6fr",
              gap: "clamp(40px, 6vw, 80px)",
              marginBottom: 80,
            }}>
              <div>
                <h1 className="display" style={{
                  fontSize: "clamp(56px, 7vw, 100px)",
                  margin: 0,
                  fontWeight: 300,
                  lineHeight: 0.95,
                }}>
                  Frame your<br />
                  <span className="italic-display" style={{ color: "var(--ember)" }}>question.</span>
                </h1>
              </div>
              <p style={{
                fontSize: "clamp(16px, 1.5vw, 20px)",
                lineHeight: 1.55,
                opacity: 0.7,
                alignSelf: "end",
                maxWidth: 600,
              }}>
                Lenormand answers questions, not moods. Speak it as plainly as
                you can — the cleaner the question, the cleaner the geometry
                that returns.
              </p>
            </div>

            <hr className="rule" />

            {/* ── I. The Question ───────────────────────── */}
            <FormRow num="I." label="The question">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 48 }}>
                <div>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What would you like clarity on today?"
                    rows={3}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      borderBottom: "var(--rule) solid var(--rule-color)",
                      color: "var(--vellum)",
                      fontFamily: "var(--serif-display)",
                      fontStyle: "italic",
                      fontSize: "clamp(24px, 3vw, 38px)",
                      lineHeight: 1.3,
                      padding: "0 0 16px",
                      resize: "none",
                      outline: "none",
                    }}
                  />
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 12,
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    opacity: 0.5,
                  }}>
                    <span>{question.length} characters</span>
                    <span style={{ color: "var(--ember)" }}>Recommended: open, specific, present-tense</span>
                  </div>
                </div>

                {/* Suggested questions */}
                <div>
                  <p className="smallcaps" style={{ opacity: 0.45, marginBottom: 14 }}>Try one of these</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <li key={q}>
                        <button
                          type="button"
                          onClick={() => setQuestion(q)}
                          style={{
                            fontFamily: "var(--serif-body)",
                            fontStyle: "italic",
                            fontSize: 14,
                            color: "var(--vellum)",
                            opacity: 0.6,
                            textAlign: "left",
                            lineHeight: 1.45,
                            transition: "opacity 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
                        >
                          &ldquo;{q}&rdquo;
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FormRow>

            {/* ── II. The Spread ────────────────────────── */}
            <FormRow num="II." label="The spread">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Main spread tiles */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  {[
                    {
                      id: "triad" as SpreadMode,
                      n: "03",
                      title: "The Triad",
                      desc: "A focused, three-card narrative — past, present, future, or situation, challenge, counsel.",
                    },
                    {
                      id: "tableau" as SpreadMode,
                      n: "36",
                      title: "Grand Tableau",
                      desc: "All thirty-six cards laid in four rows. Houses, diagonals, and knighting in play.",
                    },
                  ].map((opt) => {
                    const sel = spreadMode === opt.id || (opt.id === "tableau" && spreadMode === "tableau-cartouche");
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSpreadMode(opt.id)}
                        style={{
                          textAlign: "left",
                          border: `var(--rule) solid ${sel ? "var(--ember)" : "var(--rule-color)"}`,
                          background: sel ? "var(--ink-2)" : "transparent",
                          padding: "28px 32px",
                          color: "var(--vellum)",
                          transition: "background 0.15s, border-color 0.15s",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
                          <span className="mono" style={{
                            fontSize: 11,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: sel ? "var(--ember)" : "currentColor",
                            opacity: sel ? 1 : 0.5,
                          }}>
                            Spread № {opt.n}
                          </span>
                          <span style={{
                            width: 14, height: 14, borderRadius: "50%",
                            border: "var(--rule) solid var(--vellum)",
                            background: sel ? "var(--ember)" : "transparent",
                            flexShrink: 0,
                          }} />
                        </div>
                        <div className="display" style={{ fontSize: 40, lineHeight: 1, fontWeight: 400 }}>
                          {opt.title}
                        </div>
                        <p style={{ fontSize: 15, lineHeight: 1.55, opacity: 0.7, margin: "16px 0 0" }}>
                          {opt.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Grand Tableau sub-option: cartouche */}
                {(spreadMode === "tableau" || spreadMode === "tableau-cartouche") && (
                  <div style={{ display: "flex", gap: 12, paddingLeft: 0 }}>
                    <p className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.4, alignSelf: "center", marginRight: 8 }}>
                      Layout
                    </p>
                    {[
                      { id: "tableau" as SpreadMode, label: "4 × 9  Standard" },
                      { id: "tableau-cartouche" as SpreadMode, label: "4 × 8 + Cartouche" },
                    ].map((opt) => {
                      const sel = spreadMode === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSpreadMode(opt.id)}
                          className="mono"
                          style={{
                            padding: "10px 16px",
                            border: `var(--rule) solid ${sel ? "var(--ember)" : "var(--rule-color)"}`,
                            color: "var(--vellum)",
                            background: sel ? "var(--ink-3)" : "transparent",
                            fontSize: 10,
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </FormRow>

            {/* ── III. The Axis (Triad only) ────────────── */}
            {spreadMode === "triad" && (
              <FormRow num={axisStep} label="The axis">
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {[
                    { id: "past-present-future" as const, label: "Past · Present · Future" },
                    { id: "situation-challenge-advice" as const, label: "Situation · Challenge · Advice" },
                  ].map((opt) => {
                    const sel = threeCardMode === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setThreeCardMode(opt.id)}
                        className="mono"
                        style={{
                          padding: "12px 20px",
                          border: `var(--rule) solid ${sel ? "var(--ember)" : "var(--rule-color)"}`,
                          color: "var(--vellum)",
                          background: sel ? "var(--ink-3)" : "transparent",
                          fontSize: 11,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </FormRow>
            )}

            {/* ── Focus (Subject + Theme Lens) ──────────── */}
            <FormRow num={focusStep} label="The focus">
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

                {/* Subject grid */}
                <div>
                  <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 14 }}>Subject</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                    {PUBLIC_SUBJECT_UI_GRID_ORDER.flat().map((id) => {
                      const subject = getPublicSubjectDefinition(id);
                      const sel = subjectId === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => handleSubjectSelect(id)}
                          aria-pressed={sel}
                          className="mono"
                          style={{
                            padding: "10px 14px",
                            border: `var(--rule) solid ${sel ? "var(--ember)" : "var(--rule-color)"}`,
                            color: "var(--vellum)",
                            background: sel ? "var(--ink-3)" : "transparent",
                            fontSize: 10,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            textAlign: "left",
                            transition: "background 0.12s, border-color 0.12s",
                          }}
                        >
                          {subject.displayLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Theme lens */}
                <div>
                  <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 14 }}>Theme lens</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[{ id: "auto" as const, displayLabel: "Auto" }, ...subjectThemes].map((t) => {
                      const sel = interpretationThemeId === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleThemeLensSelect(t.id)}
                          aria-pressed={sel}
                          className="mono"
                          style={{
                            padding: "10px 16px",
                            border: `var(--rule) solid ${sel ? "var(--ember)" : "var(--rule-color)"}`,
                            color: "var(--vellum)",
                            background: sel ? "var(--ink-3)" : "transparent",
                            fontSize: 10,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            transition: "background 0.12s, border-color 0.12s",
                          }}
                        >
                          {t.displayLabel}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.4, marginTop: 10 }}>
                    Auto infers weighting from your question text
                  </p>
                </div>
              </div>
            </FormRow>

            {/* ── The Reader (Significator + Style + Houses) */}
            <FormRow num={readerStep} label="The reader">
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

                {/* Significator */}
                <div>
                  <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 14 }}>Significator</p>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {SIGNIFICATOR_OPTIONS.map((opt) => {
                      const sel = significatorMode === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSignificatorModeChange(opt.id)}
                          aria-pressed={sel}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                            padding: "12px 16px",
                            border: `var(--rule) solid ${sel ? "var(--ember)" : "var(--rule-color)"}`,
                            background: sel ? "var(--ink-2)" : "transparent",
                            color: "var(--vellum)",
                            transition: "background 0.12s, border-color 0.12s",
                          }}
                        >
                          {opt.cardId !== null && opt.cardSlug !== null ? (
                            <div style={{ width: 36, height: 58, position: "relative", flexShrink: 0 }}>
                              <Image
                                src={`/cards/traditional/${String(opt.cardId).padStart(2, "0")}-${opt.cardSlug}.webp`}
                                alt={opt.label}
                                fill
                                style={{ objectFit: "cover", opacity: sel ? 1 : 0.55 }}
                              />
                            </div>
                          ) : (
                            <div style={{
                              width: 36, height: 58, flexShrink: 0,
                              border: "var(--rule) solid var(--rule-color)",
                              background: "var(--ink-3)",
                            }} />
                          )}
                          <span className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reading style + Houses */}
                <div style={{ display: "flex", gap: 40, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div>
                    <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 14 }}>Reading style</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[
                        { id: "quick" as const, label: "Quick", sub: "Concise, focused" },
                        { id: "deep_dive" as const, label: "Deep Dive", sub: "Layered narrative" },
                      ].map((opt) => {
                        const sel = readingStyle === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleReadingStyleSelect(opt.id)}
                            aria-pressed={sel}
                            style={{
                              padding: "12px 20px",
                              border: `var(--rule) solid ${sel ? "var(--ember)" : "var(--rule-color)"}`,
                              color: sel ? "var(--vellum)" : "var(--vellum)",
                              background: sel ? "var(--ink-3)" : "transparent",
                              textAlign: "left",
                              transition: "background 0.12s, border-color 0.12s",
                            }}
                          >
                            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                              {opt.label}
                            </div>
                            <div style={{ fontSize: 12, opacity: 0.65, marginTop: 4 }}>{opt.sub}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 14 }}>Houses</p>
                    <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={includeHouses}
                        onChange={(e) => setIncludeHouses(e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: "var(--ember)", cursor: "pointer" }}
                      />
                      <span className="mono" style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", opacity: includeHouses ? 1 : 0.45 }}>
                        Include house positions
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </FormRow>

            {/* ── Submit row ────────────────────────────── */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 56,
              flexWrap: "wrap",
              gap: 24,
            }}>
              <p className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.45 }}>
                Reading length · {estTime} min · Saved to your journal
              </p>
              <button type="submit" className="btn btn-ember">
                Lay the Cards <span style={{ fontFamily: "var(--serif-display)", marginLeft: 8 }}>→</span>
              </button>
            </div>

          </div>
        </form>
      </div>

      <SiteFooter />

      <style>{`
        @media (max-width: 900px) {
          .setup-masthead { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .setup-spread-grid { grid-template-columns: 1fr !important; }
          .setup-question-grid { grid-template-columns: 1fr !important; }
          textarea { font-size: 22px !important; }
        }
      `}</style>
    </>
  );
}

/* =========================================================
   FormRow helper
   ========================================================= */

function FormRow({
  num,
  label,
  children,
}: {
  num: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "180px 1fr",
        gap: 48,
        padding: "40px 0",
        borderBottom: "var(--rule) solid var(--rule-color)",
      }}
    >
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
