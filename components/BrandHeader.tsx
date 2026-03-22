"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import Link from "next/link";
import { manifestHasEntries, manifestHasPath, useGeneratedManifestPaths } from "@/lib/utils/generatedAssets";
import { cn } from "@/lib/utils/cn";

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
    } else {
      list.push(generatedHorizontal, generatedPrimary);
    }

    list.push(...MANUAL_GENERATED_LOGO_PATHS);
    return list;
  }, [manifestPaths]);

  const [sourceIndex, setSourceIndex] = useState(0);
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
      )}
      decoding="async"
      onError={() => setSourceIndex((current) => current + 1)}
    />
  );
}

export function BrandHeader({ className, compact = false, themeClass }: BrandHeaderProps) {
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
        </nav>
      </div>

      {!compact && (
        <p className={cn("mt-2 border-t border-[color:var(--theme-border,var(--brand-border))] pt-2 text-sm text-[color:var(--theme-muted,var(--brand-muted))]", themeClass)}>
          Lenormand readings for the path ahead.
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
