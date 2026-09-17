'use client';

import { useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { apiClient, type RequestOptions } from '@/lib/api-client';

export interface UseApiClientOptions {
  /** Optional custom Clerk JWT template name */
  jwtTemplate?: string;
}

/**
 * React hook that returns an ApiClient configured with Clerk's `useAuth()` token resolver.
 *
 * Features:
 * - Automatically injects Clerk Bearer tokens into every request
 * - Supports force-refresh on 401 responses (token expiry recovery)
 * - Returns isLoaded / isSignedIn state for query enabling guards
 *
 * @example
 * ```tsx
 * const api = useApiClient();
 *
 * const { data } = useQuery({
 *   queryKey: queryKeys.courses.all(),
 *   queryFn: () => api.get<Course[]>('/courses'),
 *   enabled: api.isLoaded && api.isSignedIn,
 * });
 * ```
 */
export function useApiClient(options?: UseApiClientOptions) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const jwtTemplate = options?.jwtTemplate;

  const client = useMemo(() => {
    return apiClient.createChildClient({
      defaultJwtTemplate: jwtTemplate,
      // Refreshable provider: passes forceRefresh flag through to Clerk
      refreshableTokenProvider: async (forceRefresh = false) => {
        if (!isSignedIn) return null;
        try {
          return await getToken(
            forceRefresh
              ? { template: jwtTemplate ?? undefined }
              : jwtTemplate
              ? { template: jwtTemplate }
              : undefined
          );
        } catch {
          return null;
        }
      },
    });
  }, [getToken, isSignedIn, jwtTemplate]);

  return {
    client,
    isLoaded,
    isSignedIn,
    get: <T>(endpoint: string, opts?: RequestOptions) => client.get<T>(endpoint, opts),
    post: <T>(endpoint: string, body?: unknown, opts?: RequestOptions) =>
      client.post<T>(endpoint, body, opts),
    put: <T>(endpoint: string, body?: unknown, opts?: RequestOptions) =>
      client.put<T>(endpoint, body, opts),
    patch: <T>(endpoint: string, body?: unknown, opts?: RequestOptions) =>
      client.patch<T>(endpoint, body, opts),
    delete: <T>(endpoint: string, opts?: RequestOptions) => client.delete<T>(endpoint, opts),
  };
}
