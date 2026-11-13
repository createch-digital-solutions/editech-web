'use client';

import { useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api-client';

/**
 * Pings the API once when an auth page opens. The API sleeps when idle and takes up to a minute to
 * wake, so starting it while the user types means it is ready by the time sign-in needs it.
 */
export function WakeApi() {
  useEffect(() => {
    fetch(`${API_BASE_URL}/health`, { cache: 'no-store' }).catch(() => {
      // Only a head start; sign-in copes with a slow API on its own.
    });
  }, []);
  return null;
}
