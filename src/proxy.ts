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
 * backend-written (via JIT provision or PATCH /auth/role); it is embedded in the JWT and
 * available here at the Edge without a DB call.
 */
function getRoleFromClaims(
  sessionClaims: CustomJwtSessionClaims | Record<string, unknown> | null | undefined
): UserRole | null {
  if (!sessionClaims) return null;
  const claims = sessionClaims as Record<string, unknown>;
  const rawRole = claims.role as string | undefined;

  if (!rawRole) return null;
  const upper = rawRole.toUpperCase();
  if (upper === 'ADMIN' || upper === 'INSTRUCTOR' || upper === 'LEARNER') {
    return upper as UserRole;
  }
  return null;
}

function getStatusFromClaims(
  sessionClaims: CustomJwtSessionClaims | Record<string, unknown> | null | undefined
): string | null {
  if (!sessionClaims) return null;
  const claims = sessionClaims as Record<string, unknown>;
  const rawStatus = claims.status as string | undefined;

  if (!rawStatus) return null;
  return rawStatus.toUpperCase();
}

function getRoleDashboard(role?: UserRole | null): string {
  if (role === 'ADMIN') return '/admin';
  if (role === 'INSTRUCTOR') return '/portal';
  return '/dashboard';
}

// --- Middleware ---------------------------------------------------------------

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // If already authenticated and visiting sign-in / sign-up:
  if (userId && isAuthRoute(req)) {
    const role = getRoleFromClaims(sessionClaims as Record<string, unknown>);
    const status = getStatusFromClaims(sessionClaims as Record<string, unknown>);

    // Strict status check: only ACTIVE users are allowed into application dashboards
    if (status !== 'ACTIVE') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    const redirectUrl = req.nextUrl.searchParams.get('redirect_url');
    if (redirectUrl && redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')) {
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
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
  const status = getStatusFromClaims(sessionClaims as Record<string, unknown>);
  const unauthorizedUrl = new URL('/unauthorized', req.url);

  // STRICT STATUS CHECK: Must be explicitly ACTIVE to access any protected route
  if (status !== 'ACTIVE') {
    return NextResponse.redirect(unauthorizedUrl);
  }

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

  // Learner dashboard
  if (isLearnerRoute(req)) {
    if (!role || !(['LEARNER', 'INSTRUCTOR', 'ADMIN'] as UserRole[]).includes(role)) {
      return NextResponse.redirect(unauthorizedUrl);
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
