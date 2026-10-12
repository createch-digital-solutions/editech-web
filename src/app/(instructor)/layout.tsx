'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentUser } from '@/hooks/auth/use-current-user';
import { AccountLoading } from '@/components/auth/account-loading';

interface InstructorLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout gate for the (instructor) route group, driven by the backend-derived `profileStatus`:
 * - PENDING_ONBOARDING (no bio yet) → `/portal/onboarding`
 * - PENDING_APPROVAL (application sent, not yet reviewed) → `/portal/pending-approval`
 * - ACTIVE (approved) on either of those routes → `/portal`
 * Each target route is exempt from its own redirect, so there are no loops. A loader shows until
 * GET /auth/me answers and while a redirect is under way.
 */
export default function InstructorLayout({ children }: InstructorLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isSignedIn } = useCurrentUser();

  const isOnboardingRoute = pathname.startsWith('/portal/onboarding');
  const isPendingApprovalRoute = pathname.startsWith('/portal/pending-approval');

  let target: string | null = null;
  if (isSignedIn && user) {
    const { profileStatus } = user;
    if (profileStatus === 'PENDING_ONBOARDING' && !isOnboardingRoute) target = '/portal/onboarding';
    else if (profileStatus === 'PENDING_APPROVAL' && !isPendingApprovalRoute) target = '/portal/pending-approval';
    else if (profileStatus === 'ACTIVE' && (isOnboardingRoute || isPendingApprovalRoute)) target = '/portal';
  }

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  if (isLoading || target) return <AccountLoading />;

  return <>{children}</>;
}
