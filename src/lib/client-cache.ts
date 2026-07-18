/** In-memory client cache — instant tab revisits without blank loading states. */
const store = new Map<string, { data: unknown; at: number }>();

export const CLIENT_CACHE_TTL_MS = 90_000;

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > CLIENT_CACHE_TTL_MS) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function cacheSet(key: string, data: unknown) {
  store.set(key, { data, at: Date.now() });
}

export function cacheInvalidate(prefix: string) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
