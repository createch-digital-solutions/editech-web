'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { useApiClient } from '@/hooks/use-api-client';
import { queryKeys } from '@/lib/query-keys';
import type { User } from '@/types/user';

/**
 * React Query hook for GET /auth/me.
 *
 * Used internally by AuthProvider, but also usable standalone
 * in components that need the current user without the full context.
 *
 * The query is disabled until Clerk confirms the user is signed in.
 * Stale time is 5 minutes — the user's role/status rarely changes mid-session.
 */
export function useAuthQuery() {
  const { isLoaded, isSignedIn } = useAuth();
  const api = useApiClient();

  return useQuery<User>({
    queryKey: queryKeys.auth.me(),
    queryFn: () => api.get<User>('/auth/me'),
    enabled: isLoaded && !!isSignedIn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Never retry auth errors on the /me endpoint
      const status = (error as { status?: number })?.status;
      if (status === 401 || status === 403) return false;
      return failureCount < 2;
    },
  });
}
