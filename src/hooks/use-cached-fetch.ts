"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cacheGet, cacheSet } from "@/lib/client-cache";

/**
 * Fetch with instant cache hit — shows stale data immediately, revalidates in background.
 * Fixes slow tab switches caused by full-page loading spinners on every visit.
 */
export function useCachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  enabled = true
) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [data, setData] = useState<T | null>(() => cacheGet<T>(key));
  const [loading, setLoading] = useState(() => !cacheGet<T>(key));
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const fresh = await fetcherRef.current();
      cacheSet(key, fresh);
      setData(fresh);
      setError(null);
      return fresh;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    if (!enabled) return;

    const cached = cacheGet<T>(key);
    if (cached) {
      setData(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    let cancelled = false;
    void (async () => {
      try {
        const fresh = await fetcherRef.current();
        if (cancelled) return;
        cacheSet(key, fresh);
        setData(fresh);
        setError(null);
      } catch (e) {
        if (!cancelled && !cacheGet<T>(key)) {
          setError(e instanceof Error ? e.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key, enabled]);

  return { data, loading, error, reload, setData };
}
