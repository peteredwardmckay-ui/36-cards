"use client";

import { useEffect, useState } from "react";

interface LoadingScreenProps {
  mode?: "immersive" | "transient";
}

const TRANSIENT_DELAY_MS = 250;

export function LoadingScreen({ mode = "transient" }: LoadingScreenProps) {
  const [visible, setVisible] = useState(mode === "immersive");

  useEffect(() => {
    if (mode === "immersive") { setVisible(true); return; }
    const timer = window.setTimeout(() => setVisible(true), TRANSIENT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [mode]);

  if (!visible) return null;

  return (
    <div className="surface-ink" style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 32,
    }}>
      {/* Wordmark */}
      <div style={{ textAlign: "center" }}>
        <span className="numeral" style={{ fontSize: 48, color: "var(--ember)", lineHeight: 1 }}>36</span>
        <span className="display" style={{ fontSize: 28, fontStyle: "italic", opacity: 0.6, marginLeft: 8 }}>Cards</span>
      </div>

      {/* Animated rule */}
      <div style={{ width: 120, height: 1, background: "var(--rule-color)", overflow: "hidden", position: "relative" }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "var(--ember)",
          animation: "loading-sweep 1.6s ease-in-out infinite",
        }} />
      </div>

      <p className="mono" style={{
        fontSize: 9,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        opacity: 0.35,
      }}>
        Your interpretation is loading
      </p>

      <style>{`
        @keyframes loading-sweep {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
