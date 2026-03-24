"use client";

import { useEffect, useState } from "react";
import type { ReadingState } from "@/lib/engine/types";
import type { CardDetail, CardDetailRequestPayload } from "@/lib/engine/types";

const CARD_DETAIL_REQUEST_TIMEOUT_MS = 10_000;

interface CardInspectorProps {
  state: ReadingState;
  position: number | null;
}

export function CardInspector({ state, position }: CardInspectorProps) {
  const [detail, setDetail] = useState<CardDetail | null>(null);
  const [detailError, setDetailError] = useState(false);

  useEffect(() => {
    if (!position) {
      setDetail(null);
      setDetailError(false);
      return;
    }

    const payload: CardDetailRequestPayload = {
      id: state.id,
      createdAt: state.createdAt,
      setup: state.setup,
      ritual: state.ritual,
      layout: state.layout,
      position,
    };

    let cancelled = false;
    const controller = new AbortController();
    const timeoutHandle = window.setTimeout(() => controller.abort(), CARD_DETAIL_REQUEST_TIMEOUT_MS);
    setDetailError(false);

    void (async () => {
      try {
        const response = await fetch("/api/card-detail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({ state: payload }),
        });

        if (!response.ok) {
          throw new Error("Card detail failed");
        }

        const result = (await response.json()) as { detail?: CardDetail };
        if (!cancelled) {
          setDetail(result.detail ?? null);
        }
      } catch {
        if (!cancelled) {
          setDetail(null);
          setDetailError(true);
        }
      } finally {
        window.clearTimeout(timeoutHandle);
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutHandle);
    };
  }, [position, state.createdAt, state.id, state.layout, state.ritual, state.setup]);

  if (!position) {
    return (
      <aside className="ritual-panel page-reveal p-4">
        <h3 className="text-lg font-semibold text-[color:var(--theme-text,var(--brand-text))]">Card Detail</h3>
        <p className="mt-2 text-sm text-[color:var(--theme-muted,var(--brand-muted))]">Tap a card to read its meaning and how it sits in this spread.</p>
      </aside>
    );
  }

  if (detailError) {
    return (
      <aside className="ritual-panel page-reveal p-4">
        <h3 className="text-lg font-semibold text-[color:var(--theme-text,var(--brand-text))]">Card Detail</h3>
        <p className="mt-2 text-sm text-[color:var(--theme-muted,var(--brand-muted))]">
          This card&apos;s detail didn&apos;t arrive. Tap it again to retry.
        </p>
      </aside>
    );
  }

  if (!detail) {
    return (
      <aside className="ritual-panel page-reveal p-4">
        <h3 className="text-lg font-semibold text-[color:var(--theme-text,var(--brand-text))]">Card Detail</h3>
        <p className="mt-2 text-sm text-[color:var(--theme-muted,var(--brand-muted))]">
          Reading the card...
        </p>
      </aside>
    );
  }

  return (
    <aside className="ritual-panel page-reveal p-4">
      <h3 className="text-lg font-semibold text-[color:var(--theme-text,var(--brand-text))]">{detail.title}</h3>
      <p className="mt-2 text-sm text-[color:var(--theme-muted,var(--brand-muted))]">{detail.cardSummary}</p>
      {detail.houseSummary ? (
        <>
          <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-[color:var(--theme-muted,var(--brand-muted))]">In this house</p>
          <p className="mt-1 text-sm text-[color:var(--theme-muted,var(--brand-muted))]">{detail.houseSummary}</p>
        </>
      ) : null}
      {detail.connections.length > 0 ? (
        <>
          <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-[color:var(--theme-muted,var(--brand-muted))]">Connections</p>
          <ul className="mt-1 space-y-1 text-xs text-[color:var(--theme-muted,var(--brand-muted))]">
            {detail.connections.map((line) => (
              <li key={line} className="flex gap-1.5"><span className="shrink-0 opacity-50">—</span>{line}</li>
            ))}
          </ul>
        </>
      ) : null}
    </aside>
  );
}
