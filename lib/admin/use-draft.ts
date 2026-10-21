"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Keeps a long form's work-in-progress in this browser so a refresh, a closed
 * tab or an accidental dismiss does not lose it. Call `save(snapshot)` as the
 * form changes (it is debounced), `clear()` once it is submitted or discarded,
 * and offer `draft` back to the person with a "Restore" choice.
 *
 * Stored in localStorage only - never sent anywhere - and ignored if storage is
 * unavailable (private mode), in which case the form simply works without it.
 */
export function useDraft<T>(key: string) {
  const storageKey = `admin-draft:${key}`;
  const [draft, setDraft] = useState<T | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setDraft(JSON.parse(raw) as T);
    } catch {
      /* storage unavailable or corrupt - no draft */
    }
  }, [storageKey]);

  const save = useCallback(
    (snapshot: T) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        setDraft(snapshot);
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
        } catch {
          /* quota / private mode - ignore */
        }
      }, 600);
    },
    [storageKey]
  );

  const clear = useCallback(() => {
    window.clearTimeout(timer.current);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    setDraft(null);
  }, [storageKey]);

  return { draft, save, clear };
}
