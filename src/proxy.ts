import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { UserRole } from '@/types/user';

// --- Route matchers ----------------------------------------------------------

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/forgot-password(.*)',
  '/sso-callback(.*)',
  '/unauthorized(.*)',
  '/courses(.*)',
]);

const isAuthRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

const isLearnerRoute = createRouteMatcher(['/dashboard(.*)']);
const isInstructorRoute = createRouteMatcher(['/instructor(.*)', '/portal(.*)']);
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

// --- Role helpers ------------------------------------------------------------

/**
 * Extract role from Clerk session claims (publicMetadata) — and ONLY
 * publicMetadata. publicMetadata is the sole claim guaranteed to be
 * backend-written (via PATCH /auth/role); it is embedded in the JWT and
 * available here at the Edge without a DB call.
 */
function getRoleFromClaims(
  sessionClaims: CustomJwtSessionClaims | Record<string, unknown> | null | undefined
): UserRole | null {
  if (!sessionClaims) return null;
  const claims = sessionClaims as Record<string, unknown>;
  const publicMeta = claims.publicMetadata as { role?: UserRole } | undefined;
  return publicMeta?.role ?? null;
}

function getRoleDashboard(role?: UserRole | null): string {
  if (role === 'ADMIN') return '/admin';
  if (role === 'INSTRUCTOR') return '/portal';
  return '/dashboard';
}

// --- Middleware ---------------------------------------------------------------

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // If already authenticated and visiting sign-in / sign-up, redirect to destination
  if (userId && isAuthRoute(req)) {
    const redirectUrl = req.nextUrl.searchParams.get('redirect_url');
    if (redirectUrl && redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')) {
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
    const role = getRoleFromClaims(sessionClaims as Record<string, unknown>);
    return NextResponse.redirect(new URL(getRoleDashboard(role), req.url));
  }

  // Public routes: allow access
  if (isPublicRoute(req)) return;

  // All non-public routes require authentication
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(signInUrl);
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
