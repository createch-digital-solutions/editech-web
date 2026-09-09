'use client';

import { useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { apiClient, RequestOptions } from '@/lib/api-client';

export interface UseApiClientOptions {
  /** Optional custom Clerk JWT template name */
  jwtTemplate?: string;
}

/**
 * React hook that returns an ApiClient configured with Clerk's `useAuth()` token resolver.
 * Perfect for React Query hooks and client-side mutations.
 *
 * @example
 * ```tsx
 * const api = useApiClient();
 *
 * const { data, isLoading } = useQuery({
 *   queryKey: ['courses'],
 *   queryFn: () => api.get<Course[]>('/courses'),
 *   enabled: api.isLoaded,
 * });
 * ```
 */
export function useApiClient(options?: UseApiClientOptions) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const jwtTemplate = options?.jwtTemplate;

  const client = useMemo(() => {
    return apiClient.createChildClient({
      defaultJwtTemplate: jwtTemplate,
      tokenProvider: async () => {
        if (!isSignedIn) {
          return null;
        }
        return await getToken(
          jwtTemplate ? { template: jwtTemplate } : undefined
        );
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
