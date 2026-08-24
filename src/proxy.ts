// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// const isPublicRoute = createRouteMatcher([
//   '/',
//   '/sign-in(.*)',
//   '/sign-up(.*)',
//   '/courses(.*)',
// ]);

// const isLearnerRoute = createRouteMatcher(['/dashboard(.*)']);
// const isInstructorRoute = createRouteMatcher(['/instructor(.*)', '/portal(.*)']);
// const isAdminRoute = createRouteMatcher(['/admin(.*)']);

// export default clerkMiddleware(async (auth, req) => {
//   // If route is public, allow access
//   if (isPublicRoute(req)) {
//     return;
//   }

//   // Protect private routes
//   const { userId } = await auth();
//   if (!userId) {
//     await auth.protect();
//   }

//   // TODO: Implement RBAC role verification using Clerk sessionClaims / publicMetadata
//   // if (isAdminRoute(req)) { ... }
//   // if (isInstructorRoute(req)) { ... }
//   // if (isLearnerRoute(req)) { ... }
// });

export function proxy() {}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
