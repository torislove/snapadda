/**
 * SnapAdda — Client-Side Property Cache
 * sessionStorage TTL cache with stale-while-revalidate pattern.
 * Serves cached data instantly, revalidates in background.
 */

const CACHE_KEY = 'snap_props_v2';
const TTL_MS = 60_000; // 60 seconds

export function getCachedProperties() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function setCachedProperties(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // sessionStorage may be full or disabled — ignore silently
  }
}

export function invalidatePropertyCache() {
  try { sessionStorage.removeItem(CACHE_KEY); } catch {}
}
