'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth, useClerk } from '@clerk/nextjs';
import { Logo } from '@/components/landing/logo';
import { usePostAuthDestination, useSignOut } from '@/hooks/auth';
import { readClaims } from '@/hooks/auth/use-post-auth-destination';

type State = 'checking' | 'setup-failed' | 'denied';

/**
 * /unauthorized — where the proxy sends a signed-in user it will not let through.
 *
 * Usually that is an account whose session is not ACTIVE yet, because provisioning failed when it was
 * created (e.g. the API was unreachable). The page repairs it the same way sign-in does (POST
 * /auth/provision, then a refreshed token) and sends the user on. Only a user who really lacks the
 * role for a page sees "Access denied".
 */
export default function UnauthorizedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const clerk = useClerk();
  const postAuthDestination = usePostAuthDestination();
  const { signOut } = useSignOut();
  const [state, setState] = useState<State>('checking');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;

    (async () => {
      if (!isSignedIn) {
        if (!cancelled) setState('denied');
        return;
      }
      const before = readClaims(await clerk.session?.getToken());
      if (before?.status?.toUpperCase() === 'ACTIVE') {
        if (!cancelled) setState('denied');
        return;
      }
      const destination = await postAuthDestination();
      const after = readClaims(await clerk.session?.getToken());
      if (cancelled) return;
      if (after?.status?.toUpperCase() === 'ACTIVE') window.location.replace(destination);
      else setState('setup-failed');
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, clerk, postAuthDestination, attempt]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#fdf6ec] px-4 font-body">
      <Logo size="app" />
      <div className="mt-8 w-full max-w-[420px] rounded-2xl border border-[#e8d5bb] bg-[#fffdf9] px-6 py-8 text-center shadow-sm">
        {state === 'checking' && (
          <div role="status" aria-live="polite">
            <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-[3px] border-[#f3e6d6] border-t-brand" aria-hidden="true" />
            <p className="mt-4 text-sm text-[#7a6655]">Setting up your account…</p>
          </div>
        )}

        {state === 'setup-failed' && (
          <>
            <h1 className="font-display text-[22px] font-bold text-[#1c0e04]">We couldn&apos;t finish setting up your account</h1>
            <p className="mt-2 text-sm leading-6 text-[#7a6655]">
              Our server didn&apos;t respond. It may be waking up, so please try again in a moment.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setState('checking');
                  setAttempt((a) => a + 1);
                }}
                className="h-10 cursor-pointer rounded-lg bg-brand-gradient px-5 text-sm font-semibold text-white shadow-md shadow-brand/30 hover:opacity-90"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => signOut()}
                className="h-10 cursor-pointer rounded-lg border border-[#e8d5bb] bg-white px-5 text-sm font-semibold text-[#3d2b1f] hover:bg-[#fdf6ec]"
              >
                Sign out
              </button>
            </div>
          </>
        )}

        {state === 'denied' && (
          <>
            <h1 className="font-display text-[22px] font-bold text-[#1c0e04]">Access denied</h1>
            <p className="mt-2 text-sm leading-6 text-[#7a6655]">You don&apos;t have permission to view this page.</p>
            <Link
              href="/"
              className="mt-6 inline-flex h-10 items-center rounded-lg bg-brand-gradient px-5 text-sm font-semibold text-white shadow-md shadow-brand/30 hover:opacity-90"
            >
              Return home
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
