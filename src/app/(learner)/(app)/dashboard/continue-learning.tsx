'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { EnrolmentCard, EnrolmentCardSkeletons } from '@/components/learner/enrolment-card';
import { useMyEnrolments } from '@/hooks/use-my-enrolments';

/**
 * Continue Learning on the dashboard: every course the learner is enrolled in, newest first, with how far
 * along they are; each opens the course player.
 */
export function ContinueLearning() {
  const { data: enrolments, isLoading, isError, refetch } = useMyEnrolments();

  return (
    <section id="continue-learning" className="mt-10 scroll-mt-28" aria-labelledby="continue-title">
      <h2 id="continue-title" className="type-section-title text-[#1c0e04]">
        Continue Learning
      </h2>

      {isLoading ? (
        <EnrolmentCardSkeletons className="mt-[18px] grid gap-3 md:grid-cols-2 xl:grid-cols-3" />
      ) : isError ? (
        <div className="mt-[18px] flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#efe2d0] bg-[#fffdf9] px-5 py-4">
          <p className="type-body text-[#7a6655]">We couldn&apos;t load your courses just now.</p>
          <button type="button" onClick={() => refetch()} className="type-body cursor-pointer font-semibold text-brand hover:text-brand-light">
            Try again
          </button>
        </div>
      ) : enrolments && enrolments.length > 0 ? (
        <ul className="mt-[18px] grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {enrolments.map((e) => (
            <EnrolmentCard key={e.id} enrolment={e} />
          ))}
        </ul>
      ) : (
        <div className="mt-[18px] flex flex-col items-center rounded-2xl border-2 border-dashed border-[#e8d5bb] bg-[#fffdf9] px-6 py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fbece4] text-brand" aria-hidden="true">
            <BookOpen className="h-7 w-7" strokeWidth={1.8} />
          </span>
          <p className="type-card-title mt-3 text-[#1c0e04]">No courses yet</p>
          <p className="type-body mt-1 max-w-md text-[#7a6655]">Courses you enrol in will show up here so you can pick up where you left off.</p>
          <Link href="/courses" className="type-body mt-4 font-semibold text-brand hover:text-brand-light">
            Explore the catalogue →
          </Link>
        </div>
      )}
    </section>
  );
}
