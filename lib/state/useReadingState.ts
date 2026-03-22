"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReadingState } from "@/lib/engine/types";
import {
  loadReadingState,
  saveReadingState,
  updateReadingState,
  type SetupInput,
  createReadingState,
  clearReadingState,
} from "@/lib/state/storage";

export function useReadingState() {
  const [state, setState] = useState<ReadingState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadReadingState());
    setReady(true);
  }, []);

  const persist = useCallback((next: ReadingState | null) => {
    if (next) saveReadingState(next);
  }, []);

  const setAndPersist = useCallback(
    (next: ReadingState | null) => {
      setState(next);
      persist(next);
    },
    [persist],
  );

  const createFromSetup = useCallback(
    (input: SetupInput) => {
      const next = createReadingState(input);
      setAndPersist(next);
      return next;
    },
    [setAndPersist],
  );

  const update = useCallback(
    (patch: Partial<ReadingState> | ((current: ReadingState) => ReadingState)) => {
      setState((current) => {
        if (!current) return current;

        const next = typeof patch === "function" ? patch(current) : updateReadingState(current, patch);
        saveReadingState(next);
        return next;
      });
    },
    [],
  );

  const clear = useCallback(() => {
    clearReadingState();
    setState(null);
  }, []);

  return useMemo(
    () => ({
      ready,
      state,
      createFromSetup,
      update,
      clear,
      setAndPersist,
    }),
    [clear, createFromSetup, ready, setAndPersist, state, update],
  );
}
