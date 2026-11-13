import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CircleCheck } from 'lucide-react';
import { COURSE_PLACEHOLDER_IMAGE } from '@/lib/courses-api';
import type { Enrolment } from '@/types/enrollment';

/** Full links, or the cover images this site ships; anything else falls back to the placeholder. */
const cover = (url: string | null) => (url && /^(https?:\/\/|\/learner\/)/.test(url) ? url : COURSE_PLACEHOLDER_IMAGE);

/** "1h 05m" / "45m" from minutes (the course's totalDuration). */
function length(minutes: number) {
  const m = Math.round(minutes);
  if (m <= 0) return '';
  return m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m` : `${m}m`;
}

/** A course the learner is enrolled in: cover, facts and how far along they are; opens the course player. */
export function EnrolmentCard({ enrolment }: { enrolment: Enrolment }) {
  const { course } = enrolment;
  const done = enrolment.status === 'COMPLETED' || enrolment.progressPercentage >= 100;
  const started = enrolment.progressPercentage > 0;
  const facts = [course.instructorName, `${course.totalLessons} ${course.totalLessons === 1 ? 'lesson' : 'lessons'}`, length(course.totalDuration)].filter(Boolean);

  return (
    <li>
      <Link
        href={`/learn/${course.slug}`}
        className="group flex h-full gap-3.5 rounded-2xl border border-[#e8d5bb] bg-[#fffdf9] p-3 shadow-sm transition-shadow hover:shadow-md sm:gap-4 sm:p-3.5"
      >
        <Image src={cover(course.thumbnailUrl)} alt="" width={240} height={135} unoptimized className="aspect-video w-28 shrink-0 self-start rounded-lg object-cover sm:w-36" />
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="type-card-title line-clamp-2 text-[#1c0e04] group-hover:text-brand">{course.title}</h3>
          <p className="type-small mt-0.5 truncate text-[#7a6655]">{facts.join(' · ')}</p>
          <div className="mt-auto pt-2.5">
            {done ? (
              <p className="type-small flex items-center gap-1 font-semibold text-[#0d5c3a]">
                <CircleCheck className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                Completed
              </p>
            ) : (
              <>
                <div
                  className="h-1.5 rounded-full bg-[#f3e6d6]"
                  role="progressbar"
                  aria-valuenow={enrolment.progressPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${course.title} progress`}
                >
                  <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${Math.max(enrolment.progressPercentage, started ? 4 : 0)}%` }} />
                </div>
                <p className="type-small mt-1.5 flex items-center justify-between gap-2 text-[#7a6655]">
                  {started ? `${enrolment.progressPercentage}% complete` : 'Not started'}
                  <span className="flex items-center gap-1 font-semibold text-brand">
                    {started ? 'Continue' : 'Start'}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} aria-hidden="true" />
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}

/** Placeholder cards while the learner's courses load. */
export function EnrolmentCardSkeletons({ className }: { className?: string }) {
  return (
    <ul className={className} aria-label="Loading your courses">
      {[0, 1].map((i) => (
        <li key={i} className="flex gap-4 rounded-2xl border border-[#efe2d0] bg-[#fffdf9] p-3.5">
          <span className="aspect-video w-28 shrink-0 animate-pulse rounded-lg bg-[#f3e6d6] sm:w-36" />
          <span className="flex-1 space-y-2 pt-1">
            <span className="block h-4 w-4/5 animate-pulse rounded bg-[#f3e6d6]" />
            <span className="block h-3 w-1/2 animate-pulse rounded bg-[#f3e6d6]" />
            <span className="mt-5 block h-1.5 w-full animate-pulse rounded bg-[#f3e6d6]" />
          </span>
        </li>
      ))}
    </ul>
  );
}
