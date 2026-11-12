import type { Metadata } from 'next';
import Link from 'next/link';
import { ErrorScreen, primaryAction, secondaryAction } from '@/components/error-screen';

export const metadata: Metadata = { title: 'Page not found — Createch Elevate' };

/** Shown for any address that doesn't exist, and for a course slug the API doesn't know. */
export default function NotFound() {
  return (
    <ErrorScreen code="404" title="Page not found" message="The page you're looking for doesn't exist or may have moved.">
      <Link href="/" className={primaryAction}>
        Go home
      </Link>
      <Link href="/courses" className={secondaryAction}>
        Browse courses
      </Link>
    </ErrorScreen>
  );
}
