import Link from 'next/link';

/**
 * /unauthorized — shown when a user tries to access a route their role
 * doesn't permit. The middleware redirects here instead of throwing a 403.
 *
 * No styling implemented yet — this is a routing placeholder.
 */
export default function UnauthorizedPage() {
  return (
    <main>
      <h1>Access Denied</h1>
      <p>You do not have permission to view this page.</p>
      <Link href="/">Return home</Link>
    </main>
  );
}
