'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/hooks/use-api-client';
import { queryKeys } from '@/lib/query-keys';
import type { AuthState } from '@/types/auth';
import type { User } from '@/types/user';

// --- Context -----------------------------------------------------------------

const AuthContext = createContext<AuthState | null>(null);

// --- Provider ----------------------------------------------------------------

/**
 * AuthProvider fetches the Createch DB user (GET /auth/me) once Clerk confirms
 * the user is signed in, and exposes it via `useAuthContext()`.
 *
 * Mount this inside both <ClerkProvider> and <QueryProvider>.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const api = useApiClient();
  const queryClient = useQueryClient();

  const {
    data: dbUser = null,
    isLoading: isLoadingUser,
  } = useQuery<User>({
    queryKey: queryKeys.auth.me(),
    queryFn: () => api.get<User>('/auth/me'),
    // Only run when Clerk is done loading and the user is signed in
    enabled: isLoaded && !!isSignedIn,
    // User profile is stable — refetch every 5 minutes or on window focus
    staleTime: 5 * 60 * 1000,
  });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
