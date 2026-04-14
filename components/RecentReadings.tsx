"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadReadingHistory, type ReadingHistoryEntry } from "@/lib/state/storage";
import { getPublicSubjectDefinition } from "@/lib/content/publicSetupTaxonomy";
import type { SubjectId } from "@/lib/engine/types";

function subjectLabel(subjectId: string): string {
  try {
    return getPublicSubjectDefinition(subjectId as SubjectId).displayLabel;
  } catch {
    return subjectId;
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function spreadLabel(entry: ReadingHistoryEntry): string {
  return entry.spreadType === "grand-tableau" ? "Grand Tableau" : "3-Card";
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
        {history.map((entry) => (
          <div key={entry.id} className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[color:var(--brand-text)]">
                {entry.question || subjectLabel(entry.subjectId)}
              </p>
              <p className="mt-0.5 text-[10px] text-[color:var(--brand-muted)]">
                {spreadLabel(entry)} &middot; {subjectLabel(entry.subjectId)} &middot; {formatDate(entry.createdAt)}
              </p>
            </div>
            <Link
              href="/setup"
              className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--brand-accent)] hover:underline"
            >
              New
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
