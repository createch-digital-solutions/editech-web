'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CircleCheck, ChevronDown, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Stars } from '@/components/learner/stars';
import type { CourseDetail } from '@/lib/learner-data';

const TABS = ['Overview', 'Curriculum', 'Instructor', 'Reviews'] as const;
type Tab = (typeof TABS)[number];

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
}

function Curriculum({ course, defaultOpen }: { course: CourseDetail; defaultOpen?: number }) {
  const [open, setOpen] = useState<number | null>(defaultOpen ?? null);
  if (course.curriculum.length === 0) return <p className="text-base text-[#7a6655]">The curriculum will appear here once the instructor publishes it.</p>;
  return (
    <ul className="space-y-[11px]">
      {course.curriculum.map((s, i) => {
        const complete = s.lessons.length > 0 && s.lessons.every((l) => l.done);
        // The section the learner is in: started but not finished, or the next one after a finished section.
        const prev = course.curriculum[i - 1];
        const current = !complete && (s.lessons.some((l) => l.done) || (!!prev && prev.lessons.length > 0 && prev.lessons.every((l) => l.done)));
        const isOpen = open === i;
        return (
          <li key={s.title} className={cn('overflow-hidden rounded-xl border-2', current ? 'border-[#f5d3bd] bg-[#fdeee4]' : 'border-[#efe2d0] bg-[#fbf3e8]')}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex min-h-[52px] w-full cursor-pointer items-center gap-[10px] px-[18px] py-2 text-left"
            >
              {complete && <CircleCheck className="h-[18px] w-[18px] shrink-0 text-[#0d5c3a]" strokeWidth={2} aria-label="Completed" />}
              <span className={cn('font-body text-[17px] font-semibold', current ? 'text-brand' : 'text-[#1c0e04]')}>{s.title}</span>
              <span className="rounded-full border border-[#e3d3bf] bg-[#f3e6d6] px-[9px] py-[2px] text-[11px] font-bold text-[#7a6655]">{s.summary}</span>
              <ChevronDown className={cn('ml-auto h-4 w-4 shrink-0 text-[#7a6655] transition-transform', isOpen && 'rotate-180')} aria-hidden="true" />
            </button>
            {isOpen && (
              <ul className="border-t border-[#efe2d0] bg-[#fffdf9] px-[18px] py-2">
                {s.lessons.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 py-2 text-[15px] text-[#3d2b1f]">
                    {l.done ? (
                      <CircleCheck className="h-4 w-4 shrink-0 text-[#0d5c3a]" aria-label="Watched" />
                    ) : (
                      <Play className="h-4 w-4 shrink-0 text-[#a89282]" aria-hidden="true" />
                    )}
                    <span className="flex-1">{l.title}</span>
                    <span className="text-[13px] text-[#a89282]">{l.duration}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function InstructorCard({ course }: { course: CourseDetail }) {
  return (
    <div className="rounded-2xl border-2 border-[#efe2d0] bg-[#fffdf9] px-[23px] pb-[26px] pt-[36px]">
      <div className="flex items-start gap-[13px]">
        <Image src={course.instructorImage} alt="" width={64} height={64} unoptimized className="h-16 w-16 shrink-0 rounded-full object-cover" />
        <div className="min-w-0">
          <p className="font-body text-[18px] font-bold leading-6 text-[#1c0e04]">{course.instructor}</p>
          <p className="mt-[3px] text-[14px] leading-[22px] text-[#7a6655]">{course.instructorTitle}</p>
          <div className="mt-[3px] flex items-center gap-1.5">
            <Stars rating={course.instructorRating} className="h-3 w-3" />
            <span className="text-[12px] font-bold text-[#d4920a]">{course.instructorRating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      {course.instructorBio && <p className="mt-[22px] text-[15px] leading-[25px] text-[#7a6655]">{course.instructorBio}</p>}
    </div>
  );
}

/** The tab bar and content under the course hero. */
export function CourseTabs({ course, reviews }: { course: CourseDetail; reviews: Review[] }) {
  const [tab, setTab] = useState<Tab>('Overview');

  return (
    <div className="mx-auto w-full max-w-[1238px] px-4 pb-[60px] pt-[46px] sm:px-6 lg:px-[64px]">
      <div className="flex gap-1 overflow-x-auto overflow-y-hidden border-b-2 border-[#efe2d0]" role="tablist" aria-label="Course details">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`panel-${t}`}
            onClick={() => setTab(t)}
            className={cn(
              '-mb-[2px] shrink-0 cursor-pointer border-b-[3px] px-6 pb-[13px] font-body text-[18px] transition-colors',
              tab === t ? 'border-brand font-semibold text-brand' : 'border-transparent text-[#7a6655] hover:text-brand'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="mx-auto mt-[37px] max-w-[841px] lg:ml-[135px]">
        {tab === 'Overview' && (
          <div className="grid gap-[44px] md:grid-cols-[minmax(0,532px)_265px]">
            <div>
              {course.outcomes.length > 0 && (
                <>
                  <h2 className="font-display text-[20px] font-bold leading-7 text-[#1c0e04]">What you&apos;ll learn</h2>
                  <ul className="mt-[16px] grid gap-x-[18px] gap-y-[12px] sm:grid-cols-2">
                    {course.outcomes.map((o) => (
                      <li key={o} className="flex items-start gap-[10px] text-base leading-6 text-[#3d2b1f]">
                        <CircleCheck className="mt-[3px] h-[17px] w-[17px] shrink-0 text-[#0d5c3a]" strokeWidth={2} aria-hidden="true" />
                        {o}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <h2 className="mt-[44px] font-display text-[20px] font-bold leading-7 text-[#1c0e04]">Course Curriculum</h2>
              <div className="mt-[16px]">
                <Curriculum course={course} />
              </div>
            </div>
            <div>
              <h2 className="font-display text-[17px] font-bold leading-6 text-[#1c0e04]">Your Instructor</h2>
              <div className="mt-[16px]">
                <InstructorCard course={course} />
              </div>
            </div>
          </div>
        )}

        {tab === 'Curriculum' && (
          <div className="max-w-[532px]">
            <Curriculum course={course} defaultOpen={0} />
          </div>
        )}

        {tab === 'Instructor' && (
          <div className="max-w-[420px]">
            <InstructorCard course={course} />
          </div>
        )}

        {tab === 'Reviews' && (
          <div className="max-w-[640px]">
            <div className="flex items-center gap-3">
              <span className="font-display text-[34px] font-extrabold text-[#1c0e04]">{course.rating.toFixed(1)}</span>
              <div>
                <Stars rating={course.rating} />
                <p className="mt-1 text-sm text-[#7a6655]">{course.ratingsCount} ratings</p>
              </div>
            </div>
            {reviews.length === 0 ? (
              <p className="mt-6 text-base text-[#7a6655]">Written reviews will appear here once learners who finished the course share them.</p>
            ) : (
              <ul className="mt-6 space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="rounded-2xl border-2 border-[#efe2d0] bg-[#fffdf9] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-[#1c0e04]">{r.name}</p>
                      <Stars rating={r.rating} className="h-3 w-3" />
                    </div>
                    {r.text && <p className="mt-2 text-[15px] leading-6 text-[#7a6655]">{r.text}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
