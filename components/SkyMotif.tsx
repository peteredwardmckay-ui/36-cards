"use client";

import { cn } from "@/lib/utils/cn";

interface SkyMotifProps {
  className?: string;
  variant?: "loading";
}

export function SkyMotif({ className, variant = "loading" }: SkyMotifProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "sky-motif",
        variant === "loading" && "sky-motif-loading",
        className,
      )}
    >
      <div className="sky-motif__wash" />
      <div className="sky-motif__sea" />

      {/* Ships, sun, and horizon — all in one SVG so they scale together */}
      <svg
        className="sky-motif__ships"
        viewBox="0 0 600 120"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
      >

        {/* Soft horizon glow — no sun disk */}
        <circle cx="450" cy="90" r="80" fill="rgba(255,175,80,0.09)" />
        <circle cx="450" cy="90" r="48" fill="rgba(255,160,60,0.07)" />

        {/* Horizon line */}
        <line x1="0" y1="90" x2="600" y2="90" stroke="currentColor" strokeWidth="0.5" opacity="0.20" />

        {/* Ship A — large, left */}
        <g transform="translate(105, 90)" fill="currentColor" opacity="0.46">
          <path d="M-20 0 L20 0 L15 9 L-15 9 Z" />
          <rect x="-1" y="-50" width="2" height="50" />
          <path d="M0 -48 L18 -3 L0 -3 Z" opacity="0.76" />
          <path d="M-20 0 L-1 -40 L-1 0 Z" opacity="0.60" />
        </g>

        {/* Ship B — medium */}
        <g transform="translate(330, 90)" fill="currentColor" opacity="0.32">
          <path d="M-13 0 L13 0 L9 6 L-9 6 Z" />
          <rect x="-0.8" y="-32" width="1.6" height="32" />
          <path d="M0 -30 L11 -2 L0 -2 Z" opacity="0.76" />
          <path d="M-13 0 L-0.8 -25 L-0.8 0 Z" opacity="0.58" />
        </g>

        {/* Ship C — distant */}
        <g transform="translate(460, 90)" fill="currentColor" opacity="0.20">
          <path d="M-8 0 L8 0 L5 4 L-5 4 Z" />
          <rect x="-0.5" y="-20" width="1" height="20" />
          <path d="M0 -19 L7 -2 L0 -2 Z" opacity="0.76" />
          <path d="M-8 0 L-0.5 -16 L-0.5 0 Z" opacity="0.55" />
        </g>
      </svg>

      {/* Birds */}
      <svg
        className="sky-motif__birds"
        viewBox="0 0 600 120"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
      >
        <path d="M64 54 c6-6 12-6 18 0 M84 54 c6-6 12-6 18 0" />
        <path d="M155 42 c7-7 14-7 21 0 M178 42 c7-7 14-7 21 0" />
        <path d="M255 30 c8-7 16-7 24 0 M281 30 c8-7 16-7 24 0" />
        <path d="M315 50 c5-4 10-4 15 0 M332 50 c5-4 10-4 15 0" />
        <path d="M365 24 c6-5 12-5 18 0 M385 24 c6-5 12-5 18 0" />
        <path d="M475 18 c7-6 14-6 21 0 M498 18 c7-6 14-6 21 0" />
        <path d="M524 38 c5-4 10-4 15 0 M541 38 c5-4 10-4 15 0" />
      </svg>
    </div>
  );
}
