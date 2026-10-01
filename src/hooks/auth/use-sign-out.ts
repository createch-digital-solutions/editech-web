'use client';
import { useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Coordinated sign-out hook.
 *
 * Clears the entire React Query cache before calling Clerk signOut.
 * This prevents stale user data (role, profile, enrolments) from being
 * briefly visible if a different user signs in on the same browser session.
 *
 * @example
 * ```tsx
 * const { signOut, isSigningOut } = useSignOut();
 * <Button onClick={() => signOut()} disabled={isSigningOut}>Sign out</Button>
 * ```
 */
export function useSignOut() {
  const { signOut } = useClerk();
  const queryClient = useQueryClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async (redirectUrl?: string) => {
    setIsSigningOut(true);
    // Clear all cached data before signing out
    queryClient.clear();

    await signOut({ redirectUrl: redirectUrl ?? '/' });
  };

  return {
    signOut: handleSignOut,
    isSigningOut,
  };
}
