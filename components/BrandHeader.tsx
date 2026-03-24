"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { manifestHasEntries, manifestHasPath, useGeneratedManifestPaths } from "@/lib/utils/generatedAssets";
import { cn } from "@/lib/utils/cn";

const DARK_KEY = "36cards-dark";

function useDarkMode() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(DARK_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored !== null ? stored === "true" : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = useCallback(() => {
    setDark((current) => {
      const next = !current;
      localStorage.setItem(DARK_KEY, String(next));
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  return { dark, toggle };
}

interface BrandHeaderProps {
  className?: string;
  compact?: boolean;
  themeClass?: string;
}

const MANUAL_GENERATED_LOGO_PATHS = [
  "/brand/generated/logo/Lockups%20horizontal.png",
  "/brand/generated/logo/Lockups%20horizontal%20and%20stacked.png",
  "/brand/generated/logo/Wordmark.png",
];

function BrandWordmark() {
  const manifestPaths = useGeneratedManifestPaths();
  const generatedHorizontal = "/brand/generated/logo/logo-wordmark-horizontal.png";
  const generatedPrimary = "/brand/generated/logo/logo-primary.png";

  const sources = useMemo(() => {
    const list: string[] = [];
    const hasManifestEntries = manifestHasEntries(manifestPaths);

    if (hasManifestEntries) {
      if (manifestHasPath(manifestPaths, generatedHorizontal)) list.push(generatedHorizontal);
      if (manifestHasPath(manifestPaths, generatedPrimary)) list.push(generatedPrimary);
    } else if (manifestPaths === null) {
      // Manifest not yet loaded — optimistically try generated paths
      list.push(generatedHorizontal, generatedPrimary);
    }
    // If manifest loaded but empty, skip straight to manual paths below

    list.push(...MANUAL_GENERATED_LOGO_PATHS);
    return list;
  }, [manifestPaths]);

  const [sourceIndex, setSourceIndex] = useState(0);

  // When the manifest resolves, reset so sources recalculates from index 0
  useEffect(() => {
    if (manifestPaths !== null) {
      setSourceIndex(0);
    }
  }, [manifestPaths]);

  const src = sources[sourceIndex] ?? "/brand/favicon.png";

  return (
    <img
      src={src}
      alt="36 Cards"
      width={224}
      height={64}
      className={cn(
        "h-auto w-auto object-contain transition-transform group-hover:scale-[1.01]",
        "max-h-[3rem] max-w-[12rem] sm:max-h-[3.4rem] sm:max-w-[14rem]",
        "brand-wordmark",
      )}
      decoding="async"
      onError={() => setSourceIndex((current) => current + 1)}
    />
  );
}

export function BrandHeader({ className, compact = false, themeClass }: BrandHeaderProps) {
  const { dark, toggle } = useDarkMode();

  return (
    <header
      className={cn(
        "ritual-panel page-reveal px-4 py-3 sm:px-5 sm:py-4",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <Link href="/setup" className="group shrink-0">
          <BrandWordmark />
        </Link>

        <nav className="flex items-center gap-2 text-xs font-semibold text-[color:var(--theme-text,var(--brand-text))]">
          <Link href="/setup" className="btn-ghost rounded-full px-3 py-1.5">
            Setup
          </Link>
          <Link href="/glossary" className="btn-ghost rounded-full px-3 py-1.5">
            Glossary
          </Link>
          <button
            onClick={toggle}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="btn-ghost rounded-full px-3 py-1.5 leading-none"
          >
            {dark ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </nav>
      </div>

      {!compact && (
        <p className={cn("mt-2 border-t border-[color:var(--theme-border,var(--brand-border))] pt-2 text-sm text-[color:var(--theme-muted,var(--brand-muted))]", themeClass)}>
          A Lenormand reader for the path ahead.
        </p>
      )}
    </header>
  );
}

export function RitualSignature() {
  return (
    <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--theme-muted,var(--brand-muted))]">
      36 Cards - 36cards.com
    </p>
  );
}
