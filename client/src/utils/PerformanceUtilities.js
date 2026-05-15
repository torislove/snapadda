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
  imgElement.style.willChange = 'transform, opacity';
};

/**
 * Forces GPU acceleration on an element.
 */
export const forceGPU = (element) => {
  if (!element) return;
  element.style.transform = 'translateZ(0)';
  element.style.backfaceVisibility = 'hidden';
  element.style.perspective = '1000px';
  element.style.willChange = 'transform, opacity';
};

/**
 * Global Resource Pruner
 * Clears memory-heavy caches or objects when the system is idle.
 */
export const pruneResources = () => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      if (prefetchCache.size > 50) prefetchCache.clear();
      // Additional memory cleanup
      if (window.gc) window.gc(); 
    });
  }
};

/**
 * Predictive Route Prefetcher
 */
export const prefetchRoute = (importFn) => {
  if (typeof importFn === 'function') {
    importFn();
  }
};
