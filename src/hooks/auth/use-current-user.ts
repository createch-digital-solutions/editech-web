'use client';

import { useAuthContext } from '@/contexts/auth-context';
import type { User } from '@/types/user';

/**
 * Returns the currently authenticated Createch DB user.
 *
 * This is the single source of truth for the logged-in user in client components.
 * Do NOT use Clerk's `useUser()` directly in app components — that only gives
 * the Clerk identity object, not the Createch DB user with role/status/profiles.
 *
 * @example
 * ```tsx
 * const { user, isLoading } = useCurrentUser();
 * if (isLoading) return <Spinner />;
 * return <Avatar src={user?.avatarUrl} />;
 * ```
 */
export function useCurrentUser(): {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
} {
  const { dbUser, isLoadingUser, isSignedIn, isLoaded } = useAuthContext();

  return {
    user: dbUser,
    isLoading: !isLoaded || isLoadingUser,
    isSignedIn,
  };
}
