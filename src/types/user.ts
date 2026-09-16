/**
 * User domain types.
 * `User` matches the `AuthenticatedUser` interface from the NestJS backend
 * (populated by ClerkAuthGuard and returned by GET /auth/me).
 */

export const UserRole = {
  LEARNER: 'LEARNER',
  INSTRUCTOR: 'INSTRUCTOR',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

// --- Profiles ----------------------------------------------------------------

export interface LearnerProfile {
  id: string;
  userId: string;
  bio: string | null;
  xpTotal: number;
  streakDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface InstructorProfile {
  id: string;
  userId: string;
  bio: string | null;
  headline: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// --- Core User ---------------------------------------------------------------

/**
 * The authenticated user object as returned by GET /auth/me.
 * Matches the backend AuthenticatedUser interface exactly.
 */
export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  learnerProfile?: LearnerProfile | null;
  instructorProfile?: InstructorProfile | null;
}

/** Minimal user shape used in lists and references. */
export interface UserSummary {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  role: UserRole;
}
