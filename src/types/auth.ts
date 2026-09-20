/**
 * Auth domain types.
 * Covers Clerk session claims, the frontend auth state shape,
 * and the role-based permission map.
 */

import type { User, UserRole } from './user';

// --- Clerk Session Claims ----------------------------------------------------

/**
 * Shape of Clerk JWT `publicMetadata` that we control.
 * The backend writes `role` here when PATCH /auth/role is called.
 * Available in middleware via `sessionClaims.publicMetadata`.
 */
export interface ClerkPublicMetadata {
  role?: UserRole;
  status?: string;
}

/**
 * The full session claims object available in Clerk middleware.
 * Directly mirrors the single canonical Clerk session template.
 */
export interface SessionClaims {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole | string;
  status: string | null;
}

// --- Auth Context State ------------------------------------------------------

/**
 * Shape exposed by `useAuthContext()`.
 * Merges Clerk identity state with the resolved Createch DB user.
 */
export interface AuthState {
  /** True once Clerk has finished loading session state. */
  isLoaded: boolean;
  /** True if the user is signed in to Clerk. */
  isSignedIn: boolean;
  /** The full Createch DB user (from GET /auth/me). Null until loaded. */
  dbUser: User | null;
  /** True while the GET /auth/me query is in flight. */
  isLoadingUser: boolean;
  /** Re-fetches GET /auth/me (e.g., after a role change). */
  refetchUser: () => void;
}

// --- Role Permissions --------------------------------------------------------

/**
 * Fine-grained permission keys used by `useRole().can()`.
 * Add new permissions here as features are built.
 */
export type Permission =
  // Courses
  | 'courses:view'
  | 'courses:enrol'
  | 'courses:create'
  | 'courses:edit'
  | 'courses:delete'
  | 'courses:publish'
  // Users / Admin
  | 'users:view'
  | 'users:manage'
  | 'roles:assign'
  // Instructor
  | 'instructor:portal'
  | 'instructor:analytics'
  | 'instructor:payouts'
  // Admin
  | 'admin:dashboard'
  | 'admin:settings';

/**
 * Map of role to granted permissions.
 * The `useRole().can()` hook resolves permissions against this map.
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  LEARNER: [
    'courses:view',
    'courses:enrol',
  ],
  INSTRUCTOR: [
    'courses:view',
    'courses:enrol',
    'courses:create',
    'courses:edit',
    'courses:delete',
    'courses:publish',
    'instructor:portal',
    'instructor:analytics',
    'instructor:payouts',
  ],
  ADMIN: [
    'courses:view',
    'courses:enrol',
    'courses:create',
    'courses:edit',
    'courses:delete',
    'courses:publish',
    'instructor:portal',
    'instructor:analytics',
    'instructor:payouts',
    'users:view',
    'users:manage',
    'roles:assign',
    'admin:dashboard',
    'admin:settings',
  ],
};
