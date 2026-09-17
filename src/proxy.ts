import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { UserRole } from '@/types/user';

// --- Route matchers ----------------------------------------------------------

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/unauthorized(.*)',
  '/courses(.*)',
]);

const isLearnerRoute = createRouteMatcher(['/dashboard(.*)']);
const isInstructorRoute = createRouteMatcher(['/instructor(.*)', '/portal(.*)']);
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

// --- Role helpers ------------------------------------------------------------

/**
 * Extract role from Clerk session claims (publicMetadata).
 * The backend writes the role to Clerk publicMetadata when PATCH /auth/role is called,
 * so it is embedded in the JWT and available here at the Edge without a DB call.
 */
function getRoleFromClaims(
  sessionClaims: CustomJwtSessionClaims | Record<string, unknown> | null | undefined
): UserRole | null {
  if (!sessionClaims) return null;
  const claims = sessionClaims as Record<string, unknown>;
  const publicMeta = claims.publicMetadata as { role?: UserRole } | undefined;
  const meta = claims.metadata as { role?: UserRole } | undefined;
  return (
    (claims.role as UserRole | undefined) ??
    publicMeta?.role ??
    meta?.role ??
    null
  );
}

// --- Middleware ---------------------------------------------------------------

export default clerkMiddleware(async (auth, req) => {
  // Public routes: always allow
  if (isPublicRoute(req)) return;

  // All non-public routes require authentication
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    // Redirect unauthenticated users to sign-in
    await auth.protect();
    return;
  }

  const role = getRoleFromClaims(sessionClaims as Record<string, unknown>);
  const unauthorizedUrl = new URL('/unauthorized', req.url);

  // Admin-only routes
  if (isAdminRoute(req)) {
    if (role !== 'ADMIN') {
      return NextResponse.redirect(unauthorizedUrl);
    }
    return;
  }

  // Instructor + Admin routes
  if (isInstructorRoute(req)) {
    if (!role || !(['INSTRUCTOR', 'ADMIN'] as UserRole[]).includes(role)) {
      return NextResponse.redirect(unauthorizedUrl);
    }
    return;
  }

  // Learner dashboard: any authenticated user with a known role
  if (isLearnerRoute(req)) {
    if (!role) {
      // Role not yet in JWT — user is provisioned but role not synced yet.
      // Allow through; the backend guard will enforce if needed.
      return;
    }
    return;
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk auto-proxy path
    '/__clerk/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
