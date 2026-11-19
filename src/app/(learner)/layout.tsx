'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentUser } from '@/hooks/auth/use-current-user';
import { AccountLoading } from '@/components/auth/account-loading';
import { getHomeRoute } from '@/lib/auth-redirect';

interface LearnerLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout gate for the (learner) route group, driven by the backend's `role` and `profileStatus`:
 * - Learners who haven't finished onboarding (no career goal yet) → `/onboarding`; once they have,
 *   onboarding sends them on to `/dashboard` (it is only done once).
 * - Admins and instructors have homes of their own: the learner dashboard and onboarding send them
 *   there (`/admin`, or `/portal` and its application / approval pages), and so does any learner page
 *   while an instructor is still applying. Other learner pages (the course player) stay open to them.
 *
 * A loader shows until GET /auth/me answers and while a redirect is under way, so nobody sees the wrong
 * page first. If the API cannot be reached the page is shown rather than leaving them on the loader.
 */
export default function LearnerLayout({ children }: LearnerLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isSignedIn } = useCurrentUser();

  const isOnboardingRoute = pathname.startsWith('/onboarding');
  const isLearnerHome = pathname === '/dashboard' || pathname.startsWith('/dashboard/') || isOnboardingRoute;

  let target: string | null = null;
  if (isSignedIn && user) {
    const { role, profileStatus } = user;
    if (role === 'ADMIN' || role === 'INSTRUCTOR') {
      if (isLearnerHome || profileStatus !== 'ACTIVE') target = getHomeRoute(role, profileStatus);
    } else if (profileStatus === 'PENDING_ONBOARDING' && !isOnboardingRoute) target = '/onboarding';
    else if (profileStatus === 'ACTIVE' && isOnboardingRoute) target = '/dashboard';
  }

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  if (isLoading || target) return <AccountLoading />;

  return <>{children}</>;
}
