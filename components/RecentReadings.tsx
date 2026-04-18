"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { loadReadingHistory, type ReadingHistoryEntry } from "@/lib/state/storage";
import { getPublicSubjectDefinition } from "@/lib/content/publicSetupTaxonomy";
import { CARD_BY_ID } from "@/lib/content/cards";
import type { SubjectId } from "@/lib/engine/types";

function subjectLabel(subjectId: string): string {
  try {
    return getPublicSubjectDefinition(subjectId as SubjectId).displayLabel;
  } catch {
    return subjectId;
  }
}

function relativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function spreadLabel(entry: ReadingHistoryEntry): string {
  return entry.spreadType === "grand-tableau" ? "Grand Tableau" : "3-Card";
}

function getCardImagePath(cardId: number, cardSlug: string): string {
  return `/cards/traditional/${String(cardId).padStart(2, "0")}-${cardSlug}.webp`;
}

export function RecentReadings() {
  const [history, setHistory] = useState<ReadingHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadReadingHistory().slice(0, 5));
  }, []);

  if (history.length === 0) return null;

  return (
    <section className="ritual-panel-soft p-5">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--brand-muted)]">
        Recent Readings
      </p>
      <div className="mt-3 divide-y divide-[color:var(--brand-border)]">
        {history.map((entry) => {
          const isThreeCard = entry.spreadType === "three-card";
          const displayCards = isThreeCard
            ? entry.cardIds.slice(0, 3).map((id) => CARD_BY_ID.get(id)).filter((c): c is NonNullable<typeof c> => c != null)
            : [];

          return (
            <div key={entry.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex min-w-0 items-center gap-3">
                {displayCards.length > 0 ? (
                  <div className="flex shrink-0 gap-1">
                    {displayCards.map((card) => (
                      <div
                        key={card.id}
                        className="h-10 w-7 overflow-hidden rounded border border-[color:var(--brand-border)]"
                      >
                        <Image
                          src={getCardImagePath(card.id, card.slug)}
                          alt={card.name}
                          width={28}
                          height={42}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[color:var(--brand-text)]">
                    {entry.question || subjectLabel(entry.subjectId)}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[color:var(--brand-muted)]">
                    {spreadLabel(entry)} &middot; {subjectLabel(entry.subjectId)} &middot; {relativeTime(entry.createdAt)}
                  </p>
                </div>
              </div>
              <Link
                href="/setup"
                className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--brand-accent)] hover:underline"
              >
                New
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
