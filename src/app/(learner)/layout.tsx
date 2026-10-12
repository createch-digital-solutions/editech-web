'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentUser } from '@/hooks/auth/use-current-user';
import { AccountLoading } from '@/components/auth/account-loading';

interface LearnerLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout gate for the (learner) route group, driven by the backend-derived `profileStatus`:
 * - PENDING_ONBOARDING (no career goal yet) → `/onboarding`
 * - ACTIVE on the onboarding route → `/dashboard` (onboarding is only done once)
 *
 * A loader shows until GET /auth/me answers and while a redirect is under way, so a learner who has
 * not finished onboarding never sees the dashboard first. If the API cannot be reached the page is
 * shown rather than leaving them on the loader.
 */
export default function LearnerLayout({ children }: LearnerLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isSignedIn } = useCurrentUser();

  const isOnboardingRoute = pathname.startsWith('/onboarding');

  let target: string | null = null;
  if (isSignedIn && user) {
    if (user.profileStatus === 'PENDING_ONBOARDING' && !isOnboardingRoute) target = '/onboarding';
    else if (user.profileStatus === 'ACTIVE' && isOnboardingRoute) target = '/dashboard';
  }

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  if (isLoading || target) return <AccountLoading />;

  return <>{children}</>;
}
