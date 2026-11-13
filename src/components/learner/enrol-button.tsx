'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { enrolErrorText, enrolmentsApi } from '@/lib/enrolments-api';
import { queryKeys } from '@/lib/query-keys';

/**
 * Enrols in a free course in one click (POST /learner/courses/:slug/enroll) and opens the course player.
 * Signed-out visitors go to sign-in first and come back to the course page.
 */
export function EnrolButton({ slug, className, children = 'Enroll for Free', tabIndex }: { slug: string; className?: string; children?: React.ReactNode; tabIndex?: number }) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function enrol() {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(`/courses/${slug}`)}`);
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      await enrolmentsApi.enrol(slug);
      void queryClient.invalidateQueries({ queryKey: queryKeys.enrolments._root() });
      router.push(`/learn/${slug}`);
    } catch (err) {
      setProblem(enrolErrorText(err));
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={enrol} disabled={busy} tabIndex={tabIndex} className={cn('cursor-pointer disabled:cursor-wait disabled:opacity-80', className)}>
        {busy ? 'Enrolling…' : children}
      </button>
      {problem && (
        <p className="mt-2 text-[13px] text-[#b42318]" role="alert">
          {problem}
        </p>
      )}
    </>
  );
}
