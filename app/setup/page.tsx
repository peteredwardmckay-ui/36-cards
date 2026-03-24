"use client";
/* eslint-disable @next/next/no-img-element */

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandHeader } from "@/components/BrandHeader";
import { BrandFooter } from "@/components/BrandFooter";
import { LoadingScreen } from "@/components/LoadingScreen";
import {
  getPublicSubjectDefinition,
  getPublicSubjectThemes,
  normalizePublicThemeSelection,
  PUBLIC_SUBJECT_UI_GRID_ORDER,
} from "@/lib/content/publicSetupTaxonomy";
import { THEMES } from "@/lib/ui/themes";
import { useReadingState } from "@/lib/state/useReadingState";
import type { SetupInput } from "@/lib/state/storage";
import type { GTLayout } from "@/lib/engine/types";
import { trackEvent } from "@/lib/analytics/ga";
import { cn } from "@/lib/utils/cn";


type SpreadChoice = {
  id: "three-card-ppf" | "three-card-sca" | "gt-4x9" | "gt-4x8+4";
  label: string;
  helper: string;
  spreadType: SetupInput["spreadType"];
  threeCardMode: SetupInput["threeCardMode"];
  gtLayout: GTLayout;
};

const SPREAD_CHOICES: SpreadChoice[] = [
  {
    id: "three-card-ppf",
    label: "3-card — Past / Present / Future",
    helper: "Quick reading across a time arc. Good for a first session.",
    spreadType: "three-card",
    threeCardMode: "past-present-future",
    gtLayout: "4x9",
  },
  {
    id: "three-card-sca",
    label: "3-card — Situation / Challenge / Advice",
    helper: "Focused on a current problem and what to do about it.",
    spreadType: "three-card",
    threeCardMode: "situation-challenge-advice",
    gtLayout: "4x9",
  },
  {
    id: "gt-4x9",
    label: "Grand Tableau — full 36-card spread",
    helper: "All 36 cards laid out. A deep, whole-life reading.",
    spreadType: "grand-tableau",
    threeCardMode: "past-present-future",
    gtLayout: "4x9",
  },
  {
    id: "gt-4x8+4",
    label: "Grand Tableau — 36 cards with cartouche",
    helper: "Grand Tableau with a 4-card summary line at the end.",
    spreadType: "grand-tableau",
    threeCardMode: "past-present-future",
    gtLayout: "4x8+4",
  },
];

const SELECTED_BUTTON_CLASSES =
  "border-[color:var(--theme-accent,var(--brand-accent))] bg-[#f4df9a33] shadow-[inset_0_0_0_1px_rgba(220,171,54,0.28)]";

export default function SetupPage() {
  const router = useRouter();
  const { ready, state, createFromSetup } = useReadingState();

  const [question, setQuestion] = useState("");
  const [subjectId, setSubjectId] = useState<SetupInput["subjectId"]>("general_reading");
  const [interpretationThemeId, setInterpretationThemeId] = useState<SetupInput["interpretationThemeId"]>("auto");
  const [readingStyle, setReadingStyle] = useState<SetupInput["readingStyle"]>("quick");
  const [includeHouses, setIncludeHouses] = useState<SetupInput["includeHouses"]>(true);
  const [spreadType, setSpreadType] = useState<SetupInput["spreadType"]>("grand-tableau");
  const [gtLayout, setGtLayout] = useState<GTLayout>("4x9");
  const [threeCardMode, setThreeCardMode] = useState<SetupInput["threeCardMode"]>("past-present-future");
  const [themeId, setThemeId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("36cards-dark");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (stored !== null ? stored === "true" : prefersDark) return "neo-noir";
    }
    return THEMES[0].id;
  });
  const [significatorMode, setSignificatorMode] = useState<SetupInput["significatorMode"]>("self");

  useEffect(() => {
    if (!ready || !state) return;
    if (state.stage === "ritual" || state.stage === "reveal" || state.stage === "results") {
      setQuestion(state.setup.question);
      setSubjectId(state.setup.subjectId ?? "general_reading");
      setInterpretationThemeId(
        normalizePublicThemeSelection(state.setup.subjectId ?? "general_reading", state.setup.interpretationThemeId),
      );
      setReadingStyle(state.setup.readingStyle ?? "quick");
      setIncludeHouses(state.setup.includeHouses ?? true);
      setSpreadType(state.setup.spreadType);
      setGtLayout(state.setup.gtLayout ?? "4x9");
      setThreeCardMode(state.setup.threeCardMode);
      setThemeId(state.setup.themeId);
      setSignificatorMode(state.setup.significatorMode);
    }
  }, [ready, state]);

  useEffect(() => {
    setInterpretationThemeId((current) => normalizePublicThemeSelection(subjectId, current));
  }, [subjectId]);

  const uiTheme = useMemo(() => THEMES.find((theme) => theme.id === "ethiopian") ?? THEMES[0], []);
  const subjectThemes = useMemo(() => getPublicSubjectThemes(subjectId), [subjectId]);
  const selectedSpreadChoice = useMemo<SpreadChoice["id"]>(() => {
    if (spreadType === "three-card") {
      return threeCardMode === "situation-challenge-advice" ? "three-card-sca" : "three-card-ppf";
    }
    return gtLayout === "4x8+4" ? "gt-4x8+4" : "gt-4x9";
  }, [gtLayout, spreadType, threeCardMode]);

  const handleSubjectSelect = (nextSubjectId: SetupInput["subjectId"]) => {
    setSubjectId(nextSubjectId);
    trackEvent("subject_selected", {
      subject_id: nextSubjectId,
    });
  };

  const handleThemeLensSelect = (nextThemeId: SetupInput["interpretationThemeId"]) => {
    setInterpretationThemeId(nextThemeId);
    trackEvent("theme_lens_selected", {
      subject_id: subjectId,
      theme_lens_id: nextThemeId,
      theme_lens_mode: nextThemeId === "auto" ? "auto" : "explicit",
    });
  };

  const handleSpreadSelect = (choice: SpreadChoice) => {
    setSpreadType(choice.spreadType);
    setThreeCardMode(choice.threeCardMode);
    setGtLayout(choice.gtLayout);
    trackEvent("spread_selected", {
      spread_choice_id: choice.id,
      spread_type: choice.spreadType,
      gt_layout: choice.gtLayout,
      three_card_mode: choice.threeCardMode,
    });
  };

  const handleSignificatorModeChange = (nextMode: SetupInput["significatorMode"]) => {
    setSignificatorMode(nextMode);
    trackEvent("significator_mode_selected", {
      significator_mode: nextMode,
    });
  };

  const handleReadingStyleSelect = (nextStyle: SetupInput["readingStyle"]) => {
    setReadingStyle(nextStyle);
    trackEvent("reading_style_selected", {
      reading_style: nextStyle,
    });
  };

  const handleIncludeHousesToggle = (nextValue: boolean) => {
    setIncludeHouses(nextValue);
    trackEvent("include_houses_toggled", {
      include_houses: nextValue,
    });
  };

  if (!ready) {
    return <LoadingScreen />;
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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

  return (
    <main className={`${uiTheme.bodyClass} ${uiTheme.displayFontClass} ${uiTheme.bodyFontClass} min-h-screen px-4 py-5 sm:px-6 lg:px-8`}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <BrandHeader compact />

        <section>
          <form
            onSubmit={onSubmit}
            className="ritual-panel page-reveal p-5"
          >
            <div className="flex items-center gap-3">
              <div>
                <span className="section-kicker">New Reading</span>
                <h1 className="mt-2 text-3xl font-semibold">Begin Your Reading</h1>
              </div>
            </div>

            <p className="mt-2 text-sm text-[color:var(--theme-muted,var(--brand-muted))]">
              Lenormand is a 36-card oracle system. Choose a subject, pick a spread — then choose your deck and lay the cards.
            </p>

            <div className="mt-4 space-y-4">

              {/* Question — full width */}
              <section className="ritual-panel-soft p-4">
                <h2 className="text-sm font-semibold tracking-[0.06em] uppercase text-[color:var(--theme-muted,var(--brand-muted))]">Your Question</h2>
                <label className="mt-3 block text-sm text-[color:var(--theme-text,var(--brand-text))]">
                  Question (optional)
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What would you like clarity on today?"
                    className="mt-1 min-h-24 w-full rounded-xl border border-[color:var(--theme-border,var(--brand-border))] bg-white/55 p-3 text-base outline-none ring-[color:var(--theme-accent,var(--brand-accent))] focus:ring-2"
                  />
                  <p className="mt-1.5 text-xs text-[color:var(--theme-muted,var(--brand-muted))]">Lenormand reads what is in motion, not yes or no. &ldquo;What do I need to understand about my situation?&rdquo; will land better than &ldquo;Will this work out?&rdquo;</p>
                </label>
              </section>

              {/* Two columns on desktop: left = Subject+Theme, right = Spread+Reading options */}
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">

                {/* Left: Subject then Theme Lens — always adjacent */}
                <div className="space-y-4">
                  <section className="ritual-panel-soft p-4">
                    <h2 className="text-sm font-semibold tracking-[0.06em] uppercase text-[color:var(--theme-muted,var(--brand-muted))]">Subject Focus</h2>
                    <p className="mt-1 text-sm text-[color:var(--theme-muted,var(--brand-muted))]">Choose a focus domain for interpretation emphasis.</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                      {PUBLIC_SUBJECT_UI_GRID_ORDER.flat().map((id) => {
                        const subject = getPublicSubjectDefinition(id);
                        const selected = subjectId === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => handleSubjectSelect(id)}
                            aria-pressed={selected}
                            className={cn(
                              "min-h-[44px] rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-colors",
                              selected ? SELECTED_BUTTON_CLASSES : "border-[color:var(--theme-border,var(--brand-border))]",
                            )}
                          >
                            <span className="block text-[color:var(--theme-text,var(--brand-text))]">{subject.displayLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section className="ritual-panel-soft p-4">
                    <h2 className="text-sm font-semibold tracking-[0.06em] uppercase text-[color:var(--theme-muted,var(--brand-muted))]">Theme Lens</h2>
                    <p className="mt-1 text-sm text-[color:var(--theme-muted,var(--brand-muted))]">Themes refine the selected subject. Auto infers weighting from your question.</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                      <button
                        type="button"
                        onClick={() => handleThemeLensSelect("auto")}
                        aria-pressed={interpretationThemeId === "auto"}
                        className={cn(
                          "min-h-[44px] rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-colors",
                          interpretationThemeId === "auto" ? SELECTED_BUTTON_CLASSES : "border-[color:var(--theme-border,var(--brand-border))]",
                        )}
                      >
                        <span className="block text-[color:var(--theme-text,var(--brand-text))]">Auto</span>
                      </button>
                      {subjectThemes.map((subjectTheme) => {
                        const selected = interpretationThemeId === subjectTheme.id;
                        return (
                          <button
                            key={subjectTheme.id}
                            type="button"
                            onClick={() => handleThemeLensSelect(subjectTheme.id)}
                            aria-pressed={selected}
                            className={cn(
                              "min-h-[44px] rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-colors",
                              selected ? SELECTED_BUTTON_CLASSES : "border-[color:var(--theme-border,var(--brand-border))]",
                            )}
                          >
                            <span className="block text-[color:var(--theme-text,var(--brand-text))]">{subjectTheme.displayLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </div>

                {/* Right: Spread then Reading options */}
                <div className="space-y-4">
                  <section className="ritual-panel-soft p-4">
                    <h2 className="text-sm font-semibold tracking-[0.06em] uppercase text-[color:var(--theme-muted,var(--brand-muted))]">Spread</h2>
                    <p className="mt-1 text-sm text-[color:var(--theme-muted,var(--brand-muted))]">How many cards? Start with a 3-card reading if you are new.</p>
                    <div className="mt-3 grid gap-2">
                      {SPREAD_CHOICES.map((choice) => {
                        const selected = selectedSpreadChoice === choice.id;
                        return (
                          <button
                            key={choice.id}
                            type="button"
                            onClick={() => handleSpreadSelect(choice)}
                            aria-pressed={selected}
                            className={cn(
                              "min-h-[44px] rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                              selected ? SELECTED_BUTTON_CLASSES : "border-[color:var(--theme-border,var(--brand-border))]",
                            )}
                          >
                            <span className="block font-semibold text-[color:var(--theme-text,var(--brand-text))]">{choice.label}</span>
                            <span className="mt-0.5 block text-[10px] text-[color:var(--theme-muted,var(--brand-muted))]">{choice.helper}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section className="ritual-panel-soft p-4">
                    <h2 className="text-sm font-semibold tracking-[0.06em] uppercase text-[color:var(--theme-muted,var(--brand-muted))]">Reading Style & Options</h2>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleReadingStyleSelect("quick")}
                        aria-pressed={readingStyle === "quick"}
                        className={cn(
                          "min-h-[44px] rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                          readingStyle === "quick" ? SELECTED_BUTTON_CLASSES : "border-[color:var(--theme-border,var(--brand-border))]",
                        )}
                      >
                        <span className="block font-semibold text-[color:var(--theme-text,var(--brand-text))]">Quick</span>
                        <span className="mt-0.5 block text-[10px] text-[color:var(--theme-muted,var(--brand-muted))]">Concise reading</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReadingStyleSelect("deep_dive")}
                        aria-pressed={readingStyle === "deep_dive"}
                        className={cn(
                          "min-h-[44px] rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                          readingStyle === "deep_dive" ? SELECTED_BUTTON_CLASSES : "border-[color:var(--theme-border,var(--brand-border))]",
                        )}
                      >
                        <span className="block font-semibold text-[color:var(--theme-text,var(--brand-text))]">Deep Dive</span>
                        <span className="mt-0.5 block text-[10px] text-[color:var(--theme-muted,var(--brand-muted))]">Literary narrative</span>
                      </button>
                    </div>
                    <div className="mt-3 space-y-2">
                      <label className="text-sm">
                        Significator
                        <select
                          value={significatorMode}
                          onChange={(e) => handleSignificatorModeChange(e.target.value as SetupInput["significatorMode"])}
                          className="mt-1 w-full rounded-xl border border-[color:var(--theme-border,var(--brand-border))] bg-white/55 p-2 text-base"
                        >
                          <option value="self">Self (Querent)</option>
                          <option value="other">Other (Counterpart)</option>
                          <option value="relationship">Relationship axis</option>
                          <option value="open">Open significator</option>
                        </select>
                      </label>
                      <label className="flex items-center gap-2 rounded-lg border border-[color:var(--theme-border,var(--brand-border))] px-3 py-2 text-sm text-[color:var(--theme-text,var(--brand-text))]">
                        <input
                          type="checkbox"
                          checked={includeHouses}
                          onChange={(event) => handleIncludeHousesToggle(event.target.checked)}
                          className="h-4 w-4 accent-[color:var(--theme-accent,var(--brand-accent))]"
                        />
                        Include Houses
                      </label>
                    </div>
                  </section>
                </div>

              </div>

            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="btn-primary px-5 py-2 text-sm font-semibold"
              >
                Choose Your Deck
              </button>
            </div>
          </form>
        </section>

        <BrandFooter />
      </div>
    </main>
  );
}
