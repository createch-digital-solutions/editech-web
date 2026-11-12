'use client';

import { startTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ErrorScreen, primaryAction, secondaryAction } from '@/components/error-screen';

/**
 * Shown when a page fails to load, most often because the API is down or still waking up. "Try again"
 * re-fetches the page's server data as well as re-rendering it.
 */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  function retry() {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <ErrorScreen
      title="Something went wrong"
      message="We couldn't load this page. Our server may be waking up or having a problem, so please try again in a moment."
    >
      <button type="button" onClick={retry} className={primaryAction}>
        Try again
      </button>
      <Link href="/" className={secondaryAction}>
        Go home
      </Link>
    </ErrorScreen>
  );
}
