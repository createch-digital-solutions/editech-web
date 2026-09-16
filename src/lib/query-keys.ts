/**
 * Centralized React Query key factory.
 *
 * All query keys live here. When you need to invalidate a query, import
 * from this file rather than scattering magic strings across the codebase.
 *
 * Pattern: each domain has a root key function and specific key functions.
 * The root can be used to invalidate ALL queries in that domain:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.courses._root() })
 *
 * @example
 * ```ts
 * // In a query hook
 * useQuery({ queryKey: queryKeys.courses.detail(id), ... })
 *
 * // In a mutation onSuccess
 * queryClient.invalidateQueries({ queryKey: queryKeys.courses.all() })
 * ```
 */

// --- Auth --------------------------------------------------------------------

export const authKeys = {
  _root: () => ['auth'] as const,
  me: () => ['auth', 'me'] as const,
};

// --- Courses -----------------------------------------------------------------

export interface CourseFilters {
  page?: number;
  limit?: number;
  search?: string;
  level?: string;
  status?: string;
  instructorId?: string;
}

export const courseKeys = {
  _root: () => ['courses'] as const,
  all: (filters?: CourseFilters) => ['courses', 'list', filters ?? {}] as const,
  detail: (id: string) => ['courses', 'detail', id] as const,
  bySlug: (slug: string) => ['courses', 'slug', slug] as const,
  instructor: (instructorId: string) => ['courses', 'instructor', instructorId] as const,
};

// --- Enrolments --------------------------------------------------------------

export const enrolmentKeys = {
  _root: () => ['enrolments'] as const,
  mine: () => ['enrolments', 'me'] as const,
  detail: (id: string) => ['enrolments', 'detail', id] as const,
  byCourse: (courseId: string) => ['enrolments', 'course', courseId] as const,
};

// --- Users (Admin) -----------------------------------------------------------

export interface UserFilters {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
}

export const userKeys = {
  _root: () => ['users'] as const,
  all: (filters?: UserFilters) => ['users', 'list', filters ?? {}] as const,
  detail: (id: string) => ['users', 'detail', id] as const,
};

// --- Instructor --------------------------------------------------------------

export const instructorKeys = {
  _root: () => ['instructor'] as const,
  analytics: (instructorId: string) => ['instructor', 'analytics', instructorId] as const,
  payouts: (instructorId: string) => ['instructor', 'payouts', instructorId] as const,
};

// --- Convenience re-export ---------------------------------------------------

export const queryKeys = {
  auth: authKeys,
  courses: courseKeys,
  enrolments: enrolmentKeys,
  users: userKeys,
  instructor: instructorKeys,
};
