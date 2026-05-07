import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ServiceStatus {
  ok: boolean;
  message: string;
  state?: string;
  configured?: boolean;
  cloudName?: string | null;
}

export interface HealthStatus {
  loading: boolean;
  serverOk: boolean;
  mongoOk: boolean;
  cloudinaryOk: boolean;
  allOk: boolean;
  lastChecked: Date | null;
  services: {
    server: ServiceStatus;
    mongodb: ServiceStatus;
    cloudinary: ServiceStatus;
  } | null;
  error: string | null;
  refetch: () => void;
}

const INITIAL_SERVICES = {
  server: { ok: false, message: 'Checking...' },
  mongodb: { ok: false, message: 'Checking...', state: 'unknown' },
  cloudinary: { ok: false, message: 'Checking...', configured: false, cloudName: null },
};

/**
 * Admin-side hook that polls /api/health/deep every 30 seconds.
 * Returns live connectivity status for Server, MongoDB, and Cloudinary.
 */
export const useServerHealth = (pollIntervalMs = 30000): HealthStatus => {
  const [loading, setLoading] = useState(true);
  const [serverOk, setServerOk] = useState(false);
  const [mongoOk, setMongoOk] = useState(false);
  const [cloudinaryOk, setCloudinaryOk] = useState(false);
  const [services, setServices] = useState<HealthStatus['services']>(INITIAL_SERVICES);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${API_URL}/health/deep`, {
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeout);

      const data = await res.json();
      const s = data.services || {};

      const srvOk = s.server?.ok ?? false;
      const mOk = s.mongodb?.ok ?? false;
      const cOk = s.cloudinary?.ok ?? false;

      setServerOk(srvOk);
      setMongoOk(mOk);
      setCloudinaryOk(cOk);
      setServices(s);
      setLastChecked(new Date());
      setError(null);
    } catch (err: any) {
      setServerOk(false);
      setMongoOk(false);
      setCloudinaryOk(false);
      setServices({
        server: { ok: false, message: 'Server unreachable' },
        mongodb: { ok: false, message: 'Cannot reach server', state: 'unknown' },
        cloudinary: { ok: false, message: 'Cannot reach server', configured: false, cloudName: null },
      });
      setError(err.name === 'AbortError' ? 'Request timed out' : err.message || 'Network error');
      setLastChecked(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial check + polling
  useEffect(() => {
    check();
    const interval = setInterval(check, pollIntervalMs);
    return () => clearInterval(interval);
  }, [check, pollIntervalMs]);

  return {
    loading,
    serverOk,
    mongoOk,
    cloudinaryOk,
    allOk: serverOk && mongoOk && cloudinaryOk,
    lastChecked,
    services,
    error,
    refetch: check,
  };
};
