/**
 * SnapAdda — In-Memory Property Cache
 * 30-second TTL, keyed by serialized query params.
 * Invalidated on any write (create/update/delete).
 * Zero dependencies — pure Node.js Map.
 */

const cache = new Map();
const TTL_MS = 30_000; // 30 seconds

/** Return cached data if fresh, else null */
export function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

/** Store data in cache */
export function setCached(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

/** Wipe entire cache — call after any write operation */
export function invalidateCache() {
  cache.clear();
}

/** Build a stable cache key from query params object */
export function buildCacheKey(query) {
  const sorted = Object.keys(query)
    .sort()
    .reduce((acc, k) => { acc[k] = query[k]; return acc; }, {});
  return JSON.stringify(sorted);
}
