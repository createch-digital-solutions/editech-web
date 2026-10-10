'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { POST_AUTH_REDIRECT_KEY, usePostAuthDestination } from '@/hooks/auth';

/**
 * /sso-callback/complete — last step of a Google / Apple sign-in or sign-up (public route). Social
 * sign-up skips the email-code step that provisions the account, so this provisions it if its session
 * is not ACTIVE yet, then continues to the page the user started from (or their dashboard; new
 * learners are then sent on to onboarding by the learner layout).
 */
export default function SSOCompletePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const postAuthDestination = usePostAuthDestination();
  const started = useRef(false);

  useEffect(() => {
    if (!isLoaded || started.current) return;
    started.current = true;

    if (!isSignedIn) {
      // The provider round-trip did not create a session (cancelled, or more details needed).
      window.location.replace('/sign-in');
      return;
    }

    let redirectUrl: string | null = null;
    try {
      redirectUrl = sessionStorage.getItem(POST_AUTH_REDIRECT_KEY) || null;
      sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY);
    } catch {
      // Storage unavailable: fall back to the role's dashboard.
    }
    postAuthDestination(redirectUrl).then((destination) => window.location.replace(destination));
  }, [isLoaded, isSignedIn, postAuthDestination]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#fdf6ec] font-body">
      <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden="true" />
      <p className="mt-4 text-sm font-medium text-[#3d2b1f]" role="status">
        Setting up your account...
      </p>
    </main>
  );
}
