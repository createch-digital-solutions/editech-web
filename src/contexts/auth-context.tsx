'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useAuth, useSession } from '@clerk/nextjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/hooks/use-api-client';
import { queryKeys } from '@/lib/query-keys';
import type { AuthState } from '@/types/auth';
import type { User } from '@/types/user';
import type { ApiClientError } from '@/lib/api-client';

// --- Context -----------------------------------------------------------------

const AuthContext = createContext<AuthState | null>(null);

// --- Provider ----------------------------------------------------------------

/**
 * AuthProvider fetches the Createch DB user (GET /auth/me) once Clerk confirms
 * the user is signed in, ensures session synchronization, and exposes state via `useAuthContext()`.
 *
 * Mount this inside both <ClerkProvider> and <QueryProvider>.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { session } = useSession();
  const api = useApiClient();
  const queryClient = useQueryClient();

  const {
    data: dbUser = null,
    isLoading: isLoadingUser,
  } = useQuery<User, ApiClientError>({
    queryKey: queryKeys.auth.me(),
    queryFn: () => api.get<User>('/auth/me'),
    // Only run when Clerk is done loading and the user is signed in
    enabled: isLoaded && !!isSignedIn,
    // User profile is stable — refetch every 5 minutes or on window focus
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      // Never retry 401 or 403 or 404
      if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
  });

  // Once the account is confirmed active, refresh the Clerk session token once
  // so that the current session receives the latest role/status claims synchronized by the backend/webhook
  const hasRefreshedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (dbUser && dbUser.status === 'ACTIVE') {
      const userKey = `${dbUser.id}-${dbUser.role}-${dbUser.status}`;
      if (hasRefreshedTokenRef.current === userKey) {
        return;
      }
      hasRefreshedTokenRef.current = userKey;

      if (session) {
        const s = session as unknown as { getToken?: (opts?: unknown) => Promise<string | null> };
        void s.getToken?.({ forceRefresh: true });
      } else if (typeof window !== 'undefined' && window.Clerk?.session) {
        const s = window.Clerk.session as unknown as { getToken?: (opts?: unknown) => Promise<string | null> };
        void s.getToken?.({ forceRefresh: true });
      }
    }
  }, [dbUser, session]);

  const refetchUser = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
  };

  const value = useMemo<AuthState>(
    () => ({
      isLoaded,
      isSignedIn: !!isSignedIn,
      dbUser,
      isLoadingUser,
      refetchUser,
    }),
    [isLoaded, isSignedIn, dbUser, isLoadingUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// --- Hook --------------------------------------------------------------------

/**
 * Access the Createch auth state — Clerk session state + resolved DB user.
 *
 * Must be used inside <AuthProvider>.
 *
 * @example
 * ```tsx
 * const { dbUser, isLoadingUser } = useAuthContext();
 * if (isLoadingUser) return <Spinner />;
 * return <p>Hello {dbUser?.firstName}</p>;
 * ```
 */
export function useAuthContext(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used inside <AuthProvider>');
  }
  return ctx;
}
