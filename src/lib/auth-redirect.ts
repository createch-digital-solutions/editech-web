import type { ProfileStatus, UserRole } from '@/types/user';

/**
 * Maps a user's role to their designated dashboard route.
 */
export function getRoleDashboard(role?: UserRole | string | null): string {
  switch (role?.toUpperCase()) {
    case 'ADMIN':
      return '/admin';
    case 'INSTRUCTOR':
      return '/portal';
    case 'LEARNER':
    default:
      return '/dashboard';
  }
}

/**
 * Resolves where to send the user after authentication.
 * Prioritizes the explicit `redirect_url` search parameter, falling back
 * to the role-specific dashboard.
 */
export function getAuthDestination(
  redirectUrl?: string | null,
  role?: UserRole | string | null
): string {
  if (redirectUrl && redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')) {
    return redirectUrl;
  }
  return getRoleDashboard(role);
}

/**
 * Where this person belongs right now, from their role and how far they are with setting up: learners
 * who haven't picked their goals go to onboarding, instructors to their application or the approval
 * wait, admins to the admin portal.
 */
export function getHomeRoute(role?: UserRole | string | null, profileStatus?: ProfileStatus | null): string {
  switch (role?.toUpperCase()) {
    case 'ADMIN':
      return '/admin';
    case 'INSTRUCTOR':
      if (profileStatus === 'PENDING_ONBOARDING') return '/portal/onboarding';
      if (profileStatus === 'PENDING_APPROVAL') return '/portal/pending-approval';
      return '/portal';
    default:
      return profileStatus === 'PENDING_ONBOARDING' ? '/onboarding' : '/dashboard';
  }
}
