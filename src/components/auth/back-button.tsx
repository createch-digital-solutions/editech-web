'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

/** Back to the previous page on this site, or the home page when the auth page was opened from elsewhere. */
export function BackButton() {
  const router = useRouter();
  const goBack = () => {
    // Reached by a link inside the app (the page first loaded was another one), or from another page here.
    const firstLoaded = performance.getEntriesByType('navigation')[0]?.name;
    const linkedInApp = !!firstLoaded && new URL(firstLoaded).pathname !== window.location.pathname;
    const cameFromSite = linkedInApp || document.referrer.startsWith(window.location.origin);
    if (cameFromSite) router.back();
    else router.push('/');
  };
  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Go back"
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
    >
      <ArrowLeft className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />
    </button>
  );
}
