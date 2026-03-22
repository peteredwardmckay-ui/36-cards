"use client";

import { useEffect, useState } from "react";

interface ManifestEntry {
  outputPath?: string;
}

interface ManifestShape {
  entries?: ManifestEntry[];
}

let manifestUrlPathPromise: Promise<Set<string>> | null = null;

function normalizeToUrlPath(outputPath: string): string | null {
  const value = outputPath.trim();
  if (!value) return null;

  if (value.startsWith("/")) {
    return value;
  }

  if (value.startsWith("public/")) {
    return `/${value.slice("public/".length)}`;
  }

  return `/${value}`;
}

async function loadManifestUrlPaths(): Promise<Set<string>> {
  const response = await fetch("/generated/manifest.json", {
    cache: "no-store",
  }).catch(() => null);

  if (!response || !response.ok) {
    return new Set();
  }

  const json = (await response.json().catch(() => ({}))) as ManifestShape;
  const entries = Array.isArray(json.entries) ? json.entries : [];

  const paths = new Set<string>();
  for (const entry of entries) {
    if (!entry?.outputPath) continue;
    const urlPath = normalizeToUrlPath(entry.outputPath);
    if (urlPath) paths.add(urlPath);
  }

  return paths;
}

export function useGeneratedManifestPaths(): Set<string> | null {
  const [paths, setPaths] = useState<Set<string> | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!manifestUrlPathPromise) {
      manifestUrlPathPromise = loadManifestUrlPaths();
    }

    manifestUrlPathPromise.then((result) => {
      if (!cancelled) {
        setPaths(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return paths;
}

export function manifestHasPath(paths: Set<string> | null, urlPath: string): boolean {
  if (!paths || !paths.size) return false;
  return paths.has(urlPath);
}

export function manifestHasEntries(paths: Set<string> | null): boolean {
  return Boolean(paths && paths.size > 0);
}
