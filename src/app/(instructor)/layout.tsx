'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentUser } from '@/hooks/auth/use-current-user';

interface InstructorLayoutProps {
  children: React.ReactNode;
}

/**
 * Universal layout gate for the entire (instructor) route group.
 * Gating logic:
 * - If the user's instructorProfile is missing or status is PENDING (not yet APPROVED),
 *   redirect them to `/portal/onboarding` so they can complete their bio and verification.
 * - Exempts `/portal/onboarding` itself to prevent redirect loops.
 */
export default function InstructorLayout({ children }: InstructorLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isSignedIn } = useCurrentUser();

  const isOnboardingRoute = pathname.startsWith('/portal/onboarding');

  useEffect(() => {
    if (isLoading || !isSignedIn || !user) return;

    // Check instructorProfile status
    const instructorStatus = user.instructorProfile?.status;
    const isProfilePending = !instructorStatus || instructorStatus === 'PENDING';

    if (isProfilePending && !isOnboardingRoute) {
      router.replace('/portal/onboarding');
    } else if (!isProfilePending && isOnboardingRoute) {
      router.replace('/portal');
    }
  }, [user, isLoading, isSignedIn, isOnboardingRoute, router]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
