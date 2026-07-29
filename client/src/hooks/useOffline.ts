/**
 * Detects whether the backend is reachable and exposes `isOffline`.
 *
 * Strategy:
 *  1. On mount, attempt a lightweight HEAD request to the health endpoint.
 *  2. If it fails (network error OR any non-2xx), we are in offline mode.
 *  3. Subsequent API calls that fail with a network error flip the flag too.
 *  4. A periodic re-check every 30 s automatically brings the app back online
 *     when the backend recovers.
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const CHECK_INTERVAL_MS = 30_000;
// Endpoint that always exists – the CORS config route or just the root
const HEALTH_PATH = '/api/cors-config';

let _isOffline = false;
const _listeners = new Set<(v: boolean) => void>();

/** Module-level flag so all hook instances share one state */
export const getIsOffline = () => _isOffline;

const setOffline = (v: boolean) => {
  if (_isOffline === v) return;
  _isOffline = v;
  _listeners.forEach((fn) => fn(v));
};

async function checkBackend(): Promise<boolean> {
  try {
    await axios.get(`${API_BASE_URL}${HEALTH_PATH}`, {
      timeout: 4000,
      // Don't include auth header – this is a connectivity probe
      headers: {},
    });
    return false; // reachable
  } catch {
    return true; // offline
  }
}

export const useOffline = () => {
  const [isOffline, setIsOfflineState] = useState(_isOffline);

  const sync = useCallback((v: boolean) => setIsOfflineState(v), []);

  useEffect(() => {
    _listeners.add(sync);
    return () => { _listeners.delete(sync); };
  }, [sync]);

  // Initial probe + periodic re-check
  useEffect(() => {
    let cancelled = false;

    const probe = async () => {
      const offline = await checkBackend();
      if (!cancelled) setOffline(offline);
    };

    probe();
    const interval = setInterval(probe, CHECK_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { isOffline };
};

/** Call this from the axios response interceptor when a network error is caught */
export const markOffline = () => setOffline(true);
/** Call this when a request succeeds, to restore online state */
export const markOnline = () => setOffline(false);
