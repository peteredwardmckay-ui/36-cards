"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface LoadingScreenProps {
  mode?: "immersive" | "transient";
}

const TRANSIENT_LOADING_DELAY_MS = 250;

export function LoadingScreen({ mode = "transient" }: LoadingScreenProps) {
  const [visible, setVisible] = useState(mode === "immersive");

  useEffect(() => {
    if (mode === "immersive") {
      setVisible(true);
      return;
    }

    const timer = window.setTimeout(() => setVisible(true), TRANSIENT_LOADING_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [mode]);

  if (!visible) {
    return null;
  }

  return (
    <main className="theme-ethiopian font-display-botanical font-body-quiet min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="ritual-panel page-reveal mx-auto w-full max-w-3xl overflow-hidden">
        <div className="relative h-48 w-full overflow-hidden sm:h-64">
          <Image
            src="/brand/header.png"
            alt="Lenormand cards on a dark oak table"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
        <div className="flex flex-col items-center px-6 py-8 text-center sm:py-10">
          <Image
            src="/brand/logo-mark.png"
            alt="36 Cards"
            width={180}
            height={180}
            className="brand-wordmark h-auto w-36 object-contain sm:w-44 [mix-blend-mode:multiply]"
          />
          <p className="mt-4 text-base text-[color:var(--brand-muted)]">
            Your interpretation is loading…
          </p>
        </div>
      </div>
    </main>
  );
}
