'use client';

import { useCallback } from 'react';
import { useClerk } from '@clerk/nextjs';
import { apiClient } from '@/lib/api-client';
import { getAuthDestination } from '@/lib/auth-redirect';
import type { User } from '@/types/user';

/** Where a social (Google / Apple) sign-in or sign-up should land, kept across the provider redirect. */
export const POST_AUTH_REDIRECT_KEY = 'createch:post-auth-redirect';

/** The role and account status in a Clerk session token. */
export function readClaims(token: string | null | undefined): { role?: string; status?: string } | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return { role: payload.role, status: payload.status };
  } catch {
    return null;
  }
}

/** How long sign-in waits for GET /auth/me before going on to the dashboard (whose gate checks again). */
const PROFILE_CHECK_MS = 10000;

/**
 * Where a user who has not finished setting up belongs (learner or instructor onboarding, or the
 * instructor's waiting screen), so they go there directly instead of via the dashboard. Null when
 * the profile is complete or the API does not answer in time.
 */
async function unfinishedProfileRoute(token: string | null | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const me = await apiClient.get<User>('/auth/me', { token, signal: AbortSignal.timeout(PROFILE_CHECK_MS) });
    const instructor = me.role === 'INSTRUCTOR';
    if (me.profileStatus === 'PENDING_ONBOARDING') return instructor ? '/portal/onboarding' : '/onboarding';
    if (me.profileStatus === 'PENDING_APPROVAL' && instructor) return '/portal/pending-approval';
  } catch (err) {
    console.warn('Profile check after sign-in failed:', err);
  }
  return null;
}

/**
 * Returns a function to call once a Clerk session exists (after sign-in, or after a Google / Apple
 * sign-up or sign-in): it resolves where to send the user next.
 *
 * JIT self-healing: an account whose session claims are not ACTIVE (created while the backend was
 * unreachable, or through social sign-up, which skips the email-code provisioning step) would be sent
 * to /unauthorized by the proxy. Such an account is provisioned (POST /auth/provision) and its token
 * refreshed first.
 *
 * Learners and instructors who have not finished onboarding are then sent to it directly.
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
      return (await unfinishedProfileRoute(await clerk.session?.getToken())) ?? getAuthDestination(redirectUrl, role);
    },
    [clerk]
  );
}
