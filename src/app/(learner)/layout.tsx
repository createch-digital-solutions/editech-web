'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentUser } from '@/hooks/auth/use-current-user';

interface LearnerLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout gate for the (learner) route group, driven by the backend-derived `profileStatus`:
 * - PENDING_ONBOARDING (no career goal yet) → `/onboarding`
 * - ACTIVE on the onboarding route → `/dashboard` (onboarding is only done once)
 *
 * The page renders straight away and the redirect happens once GET /auth/me answers: a sleeping or
 * unreachable API server would otherwise keep every learner page on a spinner while it retries.
 * (New learners are already sent to /onboarding by sign-up, so the redirect is rarely needed.)
 */
export default function LearnerLayout({ children }: LearnerLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isSignedIn } = useCurrentUser();

  const isOnboardingRoute = pathname.startsWith('/onboarding');

  useEffect(() => {
    if (isLoading || !isSignedIn || !user) return;

    if (user.profileStatus === 'PENDING_ONBOARDING' && !isOnboardingRoute) {
      router.replace('/onboarding');
    } else if (user.profileStatus === 'ACTIVE' && isOnboardingRoute) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, isSignedIn, isOnboardingRoute, router]);

  return <>{children}</>;
}
