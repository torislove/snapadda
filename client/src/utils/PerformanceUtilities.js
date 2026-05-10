/**
 * SnapAdda Performance Utilities
 * Focused on predictive loading, resource pruning, and 'Zero-Latency' perceived speed.
 */

const prefetchCache = new Set();

/**
 * Prefetches data for a specific property to warm up the cache.
 * Used on Hover/TouchStart of PropertyCards.
 */
export const prefetchPropertyData = async (id, fetchFn) => {
  if (!id || prefetchCache.has(id)) return;
  
  try {
    // Only prefetch if on a high-speed connection or desktop
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && (conn.saveData || conn.effectiveType === '2g')) return;

    prefetchCache.add(id);
    await fetchFn(id);
    console.log(`[SnapAdda] Prefetched data for property: ${id}`);
  } catch (err) {
    prefetchCache.delete(id);
    console.warn(`[SnapAdda] Prefetch failed for property: ${id}`, err);
  }
};

/**
 * Dynamically prioritizes image loading based on viewport visibility.
 */
export const prioritizeImage = (imgElement) => {
  if (!imgElement) return;
  imgElement.setAttribute('loading', 'eager');
  imgElement.setAttribute('fetchpriority', 'high');
};

/**
 * Global Resource Pruner
 * Clears memory-heavy caches or objects when the system is idle.
 */
export const pruneResources = () => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      // Clear large sets or temporary objects here if needed
      if (prefetchCache.size > 50) prefetchCache.clear();
    });
  }
};

/**
 * Predictive Route Prefetcher
 * Pre-loads the code for a route before navigation.
 */
export const prefetchRoute = (importFn) => {
  importFn();
};
