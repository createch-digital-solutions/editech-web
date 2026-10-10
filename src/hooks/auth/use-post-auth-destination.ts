'use client';

import { useCallback } from 'react';
import { useClerk } from '@clerk/nextjs';
import { apiClient } from '@/lib/api-client';
import { getAuthDestination } from '@/lib/auth-redirect';

/** Where a social (Google / Apple) sign-in or sign-up should land, kept across the provider redirect. */
export const POST_AUTH_REDIRECT_KEY = 'createch:post-auth-redirect';

function readClaims(token: string | null | undefined): { role?: string; status?: string } | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return { role: payload.role, status: payload.status };
  } catch {
    return null;
  }
}

/**
 * Returns a function to call once a Clerk session exists (after sign-in, or after a Google / Apple
 * sign-up or sign-in): it resolves where to send the user next.
 *
 * JIT self-healing: an account whose session claims are not ACTIVE (created while the backend was
 * unreachable, or through social sign-up, which skips the email-code provisioning step) would be sent
 * to /unauthorized by the proxy. Such an account is provisioned (POST /auth/provision) and its token
 * refreshed first. Accounts already ACTIVE skip the backend call, so a sleeping API server does not
 * slow their sign-in.
 */
export function usePostAuthDestination() {
  const clerk = useClerk();

  return useCallback(
    async (redirectUrl?: string | null): Promise<string> => {
      let claims = readClaims(await clerk.session?.getToken());
      const clerkId = clerk.user?.id;
      if (claims?.status?.toUpperCase() !== 'ACTIVE' && clerkId) {
        try {
          await apiClient.post('/auth/provision', { clerkId }, { skipAuth: true });
          claims = readClaims(await clerk.session?.getToken({ skipCache: true }));
        } catch (provisionErr) {
          console.warn('JIT provision fallback failed:', provisionErr);
        }
      }
      const role = claims?.role ?? (clerk.user?.publicMetadata?.role as string | undefined);
      return getAuthDestination(redirectUrl, role);
    },
    [clerk]
  );
}
