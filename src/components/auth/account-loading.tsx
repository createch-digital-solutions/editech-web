'use client';

import { useEffect, useState } from 'react';
import { Logo } from '@/components/landing/logo';

/** After this long the API server is probably waking up, so say so. */
const SLOW_MS = 6000;

/**
 * Full-screen loader shown while GET /auth/me says where a signed-in user belongs (onboarding,
 * waiting for approval or their dashboard), so no page is shown before the gate has decided.
 */
export function AccountLoading() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), SLOW_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#fdf6ec] px-4 font-body" role="status" aria-live="polite">
      <Logo size="app" />
      <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#f3e6d6] border-t-brand" aria-hidden="true" />
      <p className="text-center text-sm text-[#7a6655]">
        {slow ? 'Still loading. The server is waking up, this can take up to a minute…' : 'Loading your account…'}
      </p>
    </div>
  );
}
