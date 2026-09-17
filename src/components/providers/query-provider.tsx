'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api-client';

/**
 * Creates a QueryClient with production-ready defaults:
 * - staleTime: 30s — avoids redundant refetches on navigation
 * - retry: smart retry — retries network errors but not deterministic HTTP errors
 * - refetchOnWindowFocus: true — keeps data fresh when user switches tabs
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // 30 seconds
        refetchOnWindowFocus: true,
        retry: (failureCount, error) => {
          // Never retry auth/resource errors — they are deterministic
          if (error instanceof ApiClientError) {
            const noRetry = [400, 401, 403, 404, 409, 422];
            if (noRetry.includes(error.status)) return false;
          }
          // Retry up to 3 times for network/server errors
          return failureCount < 3;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server: always create a fresh client per render
    return makeQueryClient();
  }
  // Browser: reuse singleton so cache persists across navigations
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // useState ensures the client is not recreated on re-renders on the server
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
