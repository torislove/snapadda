import { useState, useEffect, useCallback } from 'react';

const API_BASE = (import.meta?.env?.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

/**
 * Client-side lightweight server health hook.
 * Checks /api/health once on mount, then periodically.
 * Does NOT use the deep endpoint (avoid exposing service internals to clients).
 */
export const useServerHealth = (pollIntervalMs = 60000) => {
  const [serverOk, setServerOk] = useState(true); // Optimistic default
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [error, setError] = useState(null);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${API_BASE}/health`, {
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeout);

      setServerOk(res.ok);
      setError(null);
    } catch (err) {
      setServerOk(false);
      setError(err?.name === 'AbortError' ? 'Connection timed out' : 'Server unreachable');
    } finally {
      setChecking(false);
      setLastChecked(new Date());
    }
  }, []);

  useEffect(() => {
    check();
    const interval = setInterval(check, pollIntervalMs);
    return () => clearInterval(interval);
  }, [check, pollIntervalMs]);

  return { serverOk, checking, lastChecked, error, refetch: check };
};
