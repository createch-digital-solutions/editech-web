'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentUser } from '@/hooks/auth/use-current-user';

interface InstructorLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout gate for the (instructor) route group, driven by the backend-derived `profileStatus`:
 * - PENDING_ONBOARDING (no bio yet) → `/portal/onboarding`
 * - PENDING_APPROVAL (application sent, not yet reviewed) → `/portal/pending-approval`
 * - ACTIVE (approved) on either of those routes → `/portal`
 * Each target route is exempt from its own redirect, so there are no loops.
 */
export default function InstructorLayout({ children }: InstructorLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isSignedIn } = useCurrentUser();

  const isOnboardingRoute = pathname.startsWith('/portal/onboarding');
  const isPendingApprovalRoute = pathname.startsWith('/portal/pending-approval');

  useEffect(() => {
    if (isLoading || !isSignedIn || !user) return;

    const { profileStatus } = user;
    if (profileStatus === 'PENDING_ONBOARDING' && !isOnboardingRoute) {
      router.replace('/portal/onboarding');
    } else if (profileStatus === 'PENDING_APPROVAL' && !isPendingApprovalRoute) {
      router.replace('/portal/pending-approval');
    } else if (profileStatus === 'ACTIVE' && (isOnboardingRoute || isPendingApprovalRoute)) {
      router.replace('/portal');
    }
  }, [user, isLoading, isSignedIn, isOnboardingRoute, isPendingApprovalRoute, router]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
