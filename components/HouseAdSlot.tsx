"use client";

const RIDDLE_URL   = "https://riddlethebadger.com";
const BEAVER_URL   = "https://busybeaver.art";

const ADS = [
  {
    key:       "riddle",
    name:      "Riddle the Badger",
    tagline:   "A new word puzzle every day. Free, challenging, satisfying.",
    url:       RIDDLE_URL,
    mascot:    "/brand/riddle-the-badger.png",
    mascotAlt: "Riddle the Badger",
  },
  {
    key:       "beaver",
    name:      "Busy Beaver",
    tagline:   "A focus timer with cosy pixel-art scenery. Work better, one session at a time.",
    url:       BEAVER_URL,
    mascot:    "/brand/busy-beaver.png",
    mascotAlt: "Busy Beaver",
  },
];

interface HouseAdSlotProps {
  id: string;
  className?: string;
  variant?: "compact" | "standard";
}

export function HouseAdSlot({ id }: HouseAdSlotProps) {
  return (
    <section
      id={id}
      aria-label="From the maker"
      style={{
        padding: "24px 0",
        borderBottom: "var(--rule) solid var(--rule-color-alt)",
      }}
    >
      <p className="mono" style={{
        fontSize: 9,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        opacity: 0.4,
        marginBottom: 16,
      }}>
        Also by the maker
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--rule-color-alt)" }}>
        {ADS.map((ad) => (
          <a
            key={ad.key}
            href={ad.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "20px 24px",
              background: "var(--vellum)",
              color: "var(--ink)",
              textDecoration: "none",
              transition: "opacity 0.12s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ad.mascot}
              alt={ad.mascotAlt}
              style={{ width: 48, height: 48, objectFit: "contain", flexShrink: 0 }}
            />
            <div>
              <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.3, margin: 0 }}>{ad.name}</p>
              <p style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.55, margin: "4px 0 0" }}>{ad.tagline}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
