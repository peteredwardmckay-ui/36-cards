"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { getPublicCardName, getPublicHouseName } from "@/lib/content/publicDisplay";
import { buildGrandTableauLayout, getGTMainDimensions } from "@/lib/engine/gt";
import type { GTLayout, SpreadType } from "@/lib/engine/types";
import { getTheme } from "@/lib/ui/themes";
import { manifestHasEntries, manifestHasPath, useGeneratedManifestPaths } from "@/lib/utils/generatedAssets";
import { cn } from "@/lib/utils/cn";

interface SpreadGridProps {
  spreadType: SpreadType;
  layout: number[];
  revealMap: boolean[];
  selectedPosition: number | null;
  onFlip: (position: number) => void;
  onSelect: (position: number) => void;
  gtLayout?: GTLayout;
  showCastingBoard: boolean;
  themeId: string;
  readonly?: boolean;
}

function threeCardLabel(position: number): string {
  if (position === 1) return "Card 1";
  if (position === 2) return "Card 2";
  return "Card 3";
}

function toCardSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getCardFaceSources(themeId: string, cardId: number, cardName: string): string[] {
  const id = String(cardId).padStart(2, "0");
  const slug = toCardSlug(cardName);
  return [
    `/cards/${themeId}/${id}-${slug}.png`,
    `/cards/${themeId}/${id}.png`,
    `/cards/${themeId}/${slug}.png`,
  ];
}

function getAspectProbeSources(themeId: string): string[] {
  return [
    `/cards/${themeId}/01-rider.png`,
    `/cards/${themeId}/01.png`,
    `/cards/${themeId}/rider.png`,
    "/cards/botanical-engraving/01-rider.png",
  ];
}

function getCardBackStyle(themeId: string, fallbackAsset: string, manifestPaths: Set<string> | null) {
  const activePng = `/brand/card-backs/${themeId}.png`;
  const generatedPng = `/brand/generated/card-backs/${themeId}.png`;
  const hasEntries = manifestHasEntries(manifestPaths);

  if (hasEntries) {
    const hasGeneratedCardBack =
      manifestHasPath(manifestPaths, generatedPng) || manifestHasPath(manifestPaths, activePng);

    if (!hasGeneratedCardBack) {
      return {
        backgroundImage: `url(${fallbackAsset})`,
      };
    }
  }

  // No manifest entries yet: optimistically try pngs and keep svg as guaranteed fallback.
  return {
    backgroundImage: `url(${activePng}), url(${generatedPng}), url(${fallbackAsset})`,
  };
}

function CardFaceArtwork({
  themeId,
  cardId,
  cardName,
  manifestPaths,
}: {
  themeId: string;
  cardId: number;
  cardName: string;
  manifestPaths: Set<string> | null;
}) {
  const hasEntries = manifestHasEntries(manifestPaths);
  const sources = useMemo(() => {
    const candidates = getCardFaceSources(themeId, cardId, cardName);
    if (hasEntries) {
      return candidates.filter((urlPath) => manifestHasPath(manifestPaths, urlPath));
    }
    // No manifest entries: try primary naming only to keep failed requests low.
    return candidates.slice(0, 1);
  }, [themeId, cardId, cardName, hasEntries, manifestPaths]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const src = sources[sourceIndex];

  if (!src) {
    return null;
  }

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full rounded-[inherit] object-contain"
      loading="lazy"
      decoding="async"
      onError={() => setSourceIndex((current) => current + 1)}
    />
  );
}

export function SpreadGrid({
  spreadType,
  layout,
  revealMap,
  selectedPosition,
  onFlip,
  onSelect,
  gtLayout = "4x9",
  showCastingBoard,
  themeId,
  readonly = false,
}: SpreadGridProps) {
  const theme = getTheme(themeId);
  const manifestPaths = useGeneratedManifestPaths();
  const cardBackStyle = getCardBackStyle(theme.id, theme.cardBackAsset, manifestPaths);
  const [cardAspectRatio, setCardAspectRatio] = useState(5 / 7);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const candidates = getAspectProbeSources(theme.id);
    let cancelled = false;
    let index = 0;

    const tryNext = () => {
      if (cancelled || index >= candidates.length) return;

      const src = candidates[index];
      const image = new window.Image();
      image.decoding = "async";
      image.onload = () => {
        if (cancelled) return;
        if (!image.naturalWidth || !image.naturalHeight) {
          index += 1;
          tryNext();
          return;
        }

        const ratio = image.naturalWidth / image.naturalHeight;
        if (Number.isFinite(ratio) && ratio > 0.45 && ratio < 1.2) {
          setCardAspectRatio(ratio);
        }
      };
      image.onerror = () => {
        index += 1;
        tryNext();
      };
      image.src = src;
    };

    tryNext();

    return () => {
      cancelled = true;
    };
  }, [theme.id]);

  const cardFrameStyle = useMemo(() => ({ aspectRatio: String(cardAspectRatio) }), [cardAspectRatio]);

  if (spreadType === "three-card") {
    return (
      <div className="grid grid-cols-3 gap-3">
        {layout.slice(0, 3).map((cardId, index) => {
          const position = index + 1;
          const cardName = getPublicCardName(cardId);
          const isRevealed = revealMap[index];
          const isSelected = selectedPosition === position;

          return (
            <div key={`${position}-${cardId}`}>
              <button
                type="button"
                onClick={() => {
                  if (!isRevealed && !readonly) onFlip(position);
                  onSelect(position);
                }}
                className={cn(
                  "card-interactive relative isolate w-full rounded-xl transition duration-200 active:scale-[0.97] active:opacity-90",
                  isSelected
                    ? "after:pointer-events-none after:absolute after:inset-0 after:rounded-none after:border-2 after:border-[color:var(--theme-accent,var(--brand-accent))] after:content-[''] shadow-[0_18px_40px_rgba(10,8,18,0.34)]"
                    : "shadow-[0_12px_24px_rgba(10,8,18,0.18)]",
                )}
                style={cardFrameStyle}
              >
                <div className={cn("card-flip-inner", isRevealed && "card-flip-inner-revealed")}>
                  <div className="card-face-back" style={cardBackStyle} />
                  <div className="card-face-front">
                    <CardFaceArtwork
                      themeId={theme.id}
                      cardId={cardId}
                      cardName={cardName}
                      manifestPaths={manifestPaths}
                    />
                  </div>
                </div>
              </button>
              <p
                className={cn(
                  "mt-1 text-center text-xs tracking-[0.08em] text-[color:var(--theme-muted,var(--brand-muted))]",
                  isSelected && "text-[color:var(--theme-accent,var(--brand-accent))]",
                )}
              >
                {isRevealed ? `${cardName} - ${threeCardLabel(position)}` : threeCardLabel(position)}
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  const tableauLayout = buildGrandTableauLayout(layout, gtLayout);
  const mainPlacements = tableauLayout.filter((placement) => placement.zone === "main");
  const cartouchePlacements = tableauLayout.filter((placement) => placement.zone === "cartouche");
  const mainDimensions = getGTMainDimensions(gtLayout);

  const renderGrandTableauCard = (position: number, cardId: number) => {
    const cardName = getPublicCardName(cardId);
    const houseName = getPublicHouseName(position);
    const isRevealed = revealMap[position - 1];
    const isSelected = selectedPosition === position;
    const houseLabel = showCastingBoard ? `${houseName} - House ${position}` : houseName;

    return (
      <div key={`${position}-${cardId}`} className="min-w-0">
        <button
          type="button"
          onClick={() => {
            if (!isRevealed && !readonly) onFlip(position);
            onSelect(position);
          }}
          className={cn(
            "card-interactive relative isolate w-full rounded-xl transition duration-200 active:scale-[0.97] active:opacity-90",
            isSelected
              ? "after:pointer-events-none after:absolute after:inset-0 after:rounded-none after:border-2 after:border-[color:var(--theme-accent,var(--brand-accent))] after:content-[''] shadow-[0_18px_40px_rgba(10,8,18,0.34)]"
              : "shadow-[0_12px_24px_rgba(10,8,18,0.18)]",
          )}
          style={cardFrameStyle}
        >
          <div className={cn("card-flip-inner", isRevealed && "card-flip-inner-revealed")}>
            <div className="card-face-back" style={cardBackStyle} />
            <div className="card-face-front">
              <CardFaceArtwork
                themeId={theme.id}
                cardId={cardId}
                cardName={cardName}
                manifestPaths={manifestPaths}
              />
            </div>
          </div>
        </button>
        <p
          className={cn(
            "mt-1 min-h-[2.1rem] whitespace-normal break-words px-0.5 text-center text-[11px] leading-[1.12] tracking-[0.04em] text-[color:var(--theme-muted,var(--brand-muted))]",
            isSelected && "text-[color:var(--theme-accent,var(--brand-accent))]",
          )}
          title={houseLabel}
        >
          {houseLabel}
        </p>
      </div>
    );
  };

  return (
    <div className="overflow-auto [overflow-scrolling:touch]">
      <div className="relative space-y-3">
        <div
          className="gt-grid relative"
          style={{
            gridTemplateColumns: `repeat(${mainDimensions.cols}, minmax(0, 1fr))`,
          }}
        >
          {mainPlacements.map((placement) => renderGrandTableauCard(placement.position, placement.cardId))}
        </div>
        {cartouchePlacements.length ? (
          <div>
            <p className="mb-2 text-center text-[10px] uppercase tracking-[0.12em] text-[color:var(--theme-muted,var(--brand-muted))]">
              Cartouche
            </p>
            <div
              className="gt-grid relative"
              style={{
                gridTemplateColumns: `repeat(${cartouchePlacements.length}, minmax(0, 1fr))`,
              }}
            >
              {cartouchePlacements.map((placement) => renderGrandTableauCard(placement.position, placement.cardId))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
