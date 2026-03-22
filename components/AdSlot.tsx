"use client";

interface AdSlotProps {
  id: string;
  slot: string;
  className?: string;
  minHeight?: number;
}

export function AdSlot({ id, slot, className, minHeight = 250 }: AdSlotProps) {
  return (
    <section
      id={id}
      className={className}
      style={{ minHeight }}
      aria-label="Advertisement"
    >
      <div className="ritual-panel-soft relative overflow-hidden p-3">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--theme-accent,var(--brand-accent))] to-transparent opacity-55" />
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--theme-muted,var(--brand-muted))]">Sponsored</p>
          <p className="text-[10px] text-[color:var(--theme-muted,var(--brand-muted))]">Supports 36cards.com</p>
        </div>
        <ins
          className="adsbygoogle"
          style={{ display: "block", minHeight }}
          data-ad-client="ca-pub-REPLACE_WITH_YOUR_CLIENT_ID"
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </section>
  );
}
