"use client";

import { useState } from "react";

export function HowRandomnessModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-ghost rounded-full px-3 py-1.5 text-xs"
      >
        How randomness works
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]" role="dialog" aria-modal="true">
          <div className="ritual-panel w-full max-w-xl max-h-[90vh] overflow-y-auto p-5 shadow-2xl">
            <h2 className="text-lg font-semibold text-[color:var(--theme-text,var(--brand-text))]">Randomness and Agency</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[color:var(--theme-muted,var(--brand-muted))]">
              <li>Shuffle intensity 1-10 equals that exact number of seeded riffle passes.</li>
              <li>Each pass stores split index and full interleave sequence for reproducibility.</li>
              <li>Your cut choice (pile 1/2/3) changes final deck order deterministically.</li>
              <li>No hidden rerolls occur after reveal begins.</li>
              <li>Ritual details are persisted for refresh and can be added to PDF exports.</li>
            </ul>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-primary px-4 py-2 text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
