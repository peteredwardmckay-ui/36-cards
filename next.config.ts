import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function createNextConfig(phase: string): NextConfig {
  return {
    reactStrictMode: true,
    // Isolate dev artifacts from production build artifacts to avoid chunk mismatch
    // errors when switching between `next dev` and `next build`/`next start`.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
  };
}
