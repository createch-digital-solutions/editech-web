'use client';

import { useState } from 'react';
import { CircleCheck, ChevronDown, Lock, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PersonAvatar } from '@/components/learner/person-avatar';
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
              className="flex min-h-[48px] w-full cursor-pointer items-center gap-[10px] px-4 py-2 text-left sm:min-h-[50px] sm:px-5"
            >
              {complete && <CircleCheck className="h-[18px] w-[18px] shrink-0 text-[#0d5c3a]" strokeWidth={2} aria-label="Completed" />}
              <span className={cn('font-body text-[15px] font-semibold leading-[21px] sm:text-[16px] sm:leading-6', current ? 'text-brand' : 'text-[#1c0e04]')}>{s.title}</span>
              <span className="hidden shrink-0 whitespace-nowrap rounded-full border border-[#e3d3bf] bg-[#f3e6d6] px-[9px] py-[2px] text-[11px] font-bold text-[#7a6655] sm:inline">{s.summary}</span>
              <ChevronDown className={cn('ml-auto h-4 w-4 shrink-0 text-[#7a6655] transition-transform', isOpen && 'rotate-180')} aria-hidden="true" />
            </button>
            {isOpen && (
              <ul className="border-t border-[#efe2d0] bg-[#fffdf9] px-[18px] py-2">
                {s.lessons.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 py-2 text-[14px] text-[#3d2b1f] sm:text-[15px]">
                    {l.done ? (
                      <CircleCheck className="h-4 w-4 shrink-0 text-[#0d5c3a]" aria-label="Watched" />
                    ) : l.locked ? (
                      <Lock className="h-4 w-4 shrink-0 text-[#a89282]" aria-label="Unlocks when you enrol" />
                    ) : (
                      <Play className="h-4 w-4 shrink-0 text-[#a89282]" aria-hidden="true" />
                    )}
                    <span className="flex-1">{l.title}</span>
                    {l.preview && <span className="rounded-full bg-[#e6f0ea] px-2 py-0.5 text-[11px] font-bold text-[#0d5c3a]">Preview</span>}
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
    <div className="rounded-2xl border-2 border-[#efe2d0] bg-[#fffdf9] px-4 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
      <div className="flex items-start gap-[13px]">
        <PersonAvatar name={course.instructor} src={course.instructorImage} size={56} />
        <div className="min-w-0">
          <p className="type-card-title text-[#1c0e04]">{course.instructor}</p>
          <p className="mt-[2px] text-[13px] leading-5 text-[#7a6655] sm:mt-[3px] sm:text-[14px] sm:leading-[22px]">{course.instructorTitle}</p>
          <div className="mt-[3px] flex items-center gap-1.5">
            <Stars rating={course.instructorRating} className="h-3 w-3" />
            <span className="text-[12px] font-bold text-[#d4920a]">{course.instructorRating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      {course.instructorBio && <p className="mt-4 text-[14px] leading-[22px] text-[#7a6655] sm:mt-[22px] sm:text-[15px] sm:leading-[25px]">{course.instructorBio}</p>}
    </div>
  );
}

/** The tab bar and content under the course hero. */
export function CourseTabs({ course, reviews }: { course: CourseDetail; reviews: Review[] }) {
  const [tab, setTab] = useState<Tab>('Overview');

  return (
    <div className="w-full pb-16 pt-10">
      {/* Phones: the four tabs share the width evenly, so the bar never scrolls. */}
      <div className="grid grid-cols-4 border-b-2 border-[#efe2d0] sm:flex sm:gap-1" role="tablist" aria-label="Course details">
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
              '-mb-[2px] min-w-0 cursor-pointer truncate border-b-[3px] px-1 pb-3 font-body text-[14px] transition-colors sm:shrink-0 sm:px-5 sm:text-[15px]',
              tab === t ? 'border-brand font-semibold text-brand' : 'border-transparent text-[#7a6655] hover:text-brand'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="mt-6 sm:mt-8">
        {tab === 'Overview' && (
          <div className="grid gap-10">
            <div>
              {course.outcomes.length > 0 && (
                <>
                  <h2 className="type-section-title text-[#1c0e04]">What you&apos;ll learn</h2>
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
              {/* Space above only when "What you'll learn" is there to separate it from. */}
              <h2 className={cn('type-section-title text-[#1c0e04]', course.outcomes.length > 0 && 'mt-10 sm:mt-[44px]')}>Course Curriculum</h2>
              <div className="mt-[16px]">
                <Curriculum course={course} />
              </div>
            </div>
            <div>
              <h2 className="type-section-title text-[#1c0e04]">Your Instructor</h2>
              <div className="mt-[16px]">
                <InstructorCard course={course} />
              </div>
            </div>
          </div>
        )}

        {tab === 'Curriculum' && (
          <div>
            <Curriculum course={course} defaultOpen={0} />
          </div>
        )}

        {tab === 'Instructor' && (
          <div>
            <InstructorCard course={course} />
          </div>
        )}

        {tab === 'Reviews' && (
          <div>
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
                    {r.text && <p className="mt-2 text-[14px] leading-[22px] text-[#7a6655] sm:text-[15px] sm:leading-6">{r.text}</p>}
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
