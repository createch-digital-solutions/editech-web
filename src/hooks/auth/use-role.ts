'use client';

import { useAuthContext } from '@/contexts/auth-context';
import { ROLE_PERMISSIONS } from '@/types/auth';
import type { Permission } from '@/types/auth';
import type { UserRole } from '@/types/user';

/**
 * Role and permission hook for client components.
 *
 * Provides boolean role flags and a `can()` function for fine-grained
 * permission checks. Reads from the AuthContext (no extra network calls).
 *
 * @example
 * ```tsx
 * const { isAdmin, isInstructor, can } = useRole();
 *
 * return (
 *   <>
 *     {isAdmin && <AdminBadge />}
 *     {can('courses:create') && <CreateCourseButton />}
 *   </>
 * );
 * ```
 */
export function useRole() {
  const { dbUser } = useAuthContext();
  const role = dbUser?.role ?? null;

  const isAdmin = role === 'ADMIN';
  const isInstructor = role === 'INSTRUCTOR';
  const isLearner = role === 'LEARNER';

  /**
   * Check if the current user has a specific role.
   * Admins implicitly have all roles (they pass any role check).
   */
  const hasRole = (...roles: UserRole[]): boolean => {
    if (!role) return false;
    if (role === 'ADMIN') return true;
    return roles.includes(role);
  };

  /**
   * Check if the current user has a fine-grained permission.
   * Uses the ROLE_PERMISSIONS map from types/auth.ts.
   *
   * @example
   * can('courses:create') // true for INSTRUCTOR and ADMIN
   * can('admin:dashboard') // true only for ADMIN
   */
  const can = (permission: Permission): boolean => {
    if (!role) return false;
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
  };

  return {
    role,
    isAdmin,
    isInstructor,
    isLearner,
    hasRole,
    can,
  };
}
