/**
 * Auth hooks barrel.
 * Import all auth-related hooks from this single entry point:
 *
 *   import { useCurrentUser, useRole, useSignOut, useAuthQuery } from '@/hooks/auth'
 *
 * Note: useApiClient lives at @/hooks/use-api-client — it is infrastructure
 * consumed by the AuthProvider itself and kept separate to avoid circular deps.
 */

export { useCurrentUser } from './use-current-user';
export { useRole } from './use-role';
export { useSignOut } from './use-sign-out';
export { useAuthQuery } from './use-auth-query';
