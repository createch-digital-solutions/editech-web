import type { UserRole } from '@/types/user';

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
