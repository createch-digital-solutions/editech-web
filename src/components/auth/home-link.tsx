'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { getAuthDestination } from '@/lib/auth-redirect';

/**
 * The logo on the auth pages as a link: to the user's dashboard when signed in, otherwise the home page
 * (the dashboard would only send a signed-out visitor back to sign-in).
 */
export function HomeLink({ children, className }: { children: ReactNode; className?: string }) {
  const { isSignedIn, user } = useUser();
  const href = isSignedIn ? getAuthDestination(null, user?.publicMetadata?.role as string | undefined) : '/';
  return (
    <Link href={href} aria-label="Createch Elevate home" className={className}>
      {children}
    </Link>
  );
}
