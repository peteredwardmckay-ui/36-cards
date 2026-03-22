"use client";

import type { HighlightItem } from "@/lib/engine/types";

interface HighlightsPanelProps {
  highlights: HighlightItem[];
}

export function HighlightsPanel({ highlights }: HighlightsPanelProps) {
  return (
    <aside className="ritual-panel page-reveal p-4">
      <h3 className="text-lg font-semibold text-[color:var(--theme-text,var(--brand-text))]">Reading Highlights</h3>
      <p className="mt-1 text-xs text-[color:var(--theme-muted,var(--brand-muted))]">Click a highlight to jump to the detailed section.</p>
      <ul className="mt-3 space-y-2">
        {highlights.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.sectionId}`}
              className="btn-secondary block rounded-lg border-l-4 border-l-[color:var(--theme-accent,var(--brand-accent))] px-3 py-2"
            >
              <p className="text-sm font-semibold text-[color:var(--theme-text,var(--brand-text))]">{item.title}</p>
              <p className="text-xs text-[color:var(--theme-muted,var(--brand-muted))]">{item.summary}</p>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
