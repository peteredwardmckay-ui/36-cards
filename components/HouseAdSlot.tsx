"use client";

const BUSY_BEAVER_URL = "https://busybeaver.art";
const RIDDLE_URL = "https://riddlethebadger.com";

const ADS = [
  {
    key: "riddle",
    name: "Riddle the Badger",
    tagline: "A free daily word game. New puzzle every day.",
    url: RIDDLE_URL,
    symbol: "◈",
  },
  {
    key: "beaver",
    name: "Busy Beaver",
    tagline: "A focus timer with pixel-art scenery and deep work modes.",
    url: BUSY_BEAVER_URL,
    symbol: "◉",
  },
];

interface HouseAdSlotProps {
  id: string;
  className?: string;
  variant?: "compact" | "standard";
}

export function HouseAdSlot({ id, className }: HouseAdSlotProps) {
  return (
    <section id={id} className={className} aria-label="From the maker">
      <div className="ritual-panel-soft relative overflow-hidden p-3">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--theme-accent,var(--brand-accent))] to-transparent opacity-55" />
        <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[color:var(--theme-muted,var(--brand-muted))]">
          Also by the maker
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ADS.map((ad) => (
            <a
              key={ad.key}
              href={ad.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] items-start gap-2 rounded-lg border border-[color:var(--theme-border,var(--brand-border))] p-2 transition-opacity hover:opacity-75"
            >
              <span
                className="mt-0.5 shrink-0 text-base leading-none text-[color:var(--theme-accent,var(--brand-accent))]"
                aria-hidden="true"
              >
                {ad.symbol}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-snug">{ad.name}</p>
                <p className="mt-0.5 text-xs text-[color:var(--theme-muted,var(--brand-muted))]">{ad.tagline}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
