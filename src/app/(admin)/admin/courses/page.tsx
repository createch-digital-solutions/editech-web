'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Check, CircleAlert, CircleCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { card } from '@/components/instructor/studio-parts';
import { chip, Pill, SampleDataNote } from '@/components/admin/admin-parts';
import { ago, length, REVIEW_QUEUE, type ReviewCourse } from '@/lib/admin-data';
import { naira } from '@/lib/instructor-data';

const FILTERS = ['All', 'New', 'Revised'] as const;
type Filter = (typeof FILTERS)[number];

/** /admin/courses — courses instructors submitted for review: the queue on the left, the chosen one to approve or reject on the right. */
export default function CourseReviewPage() {
  const [queue, setQueue] = useState<ReviewCourse[]>(REVIEW_QUEUE);
  const [filter, setFilter] = useState<Filter>('All');
  const [selectedId, setSelectedId] = useState<string | null>(REVIEW_QUEUE[0]?.id ?? null);
  const [decided, setDecided] = useState<{ title: string; approved: boolean } | null>(null);
  const detail = useRef<HTMLElement>(null);

  /** Shows a course; on phones and tablets the details sit under the queue, so scroll down to them. */
  function open(id: string) {
    setSelectedId(id);
    if (!window.matchMedia('(min-width: 1024px)').matches) detail.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const shown = filter === 'All' ? queue : queue.filter((c) => c.kind === filter);
  const selected = queue.find((c) => c.id === selectedId) ?? shown[0] ?? null;
  const count = (f: Filter) => (f === 'All' ? queue.length : queue.filter((c) => c.kind === f).length);

  function decide(course: ReviewCourse, approved: boolean) {
    const rest = queue.filter((c) => c.id !== course.id);
    setQueue(rest);
    setSelectedId(rest[0]?.id ?? null);
    setDecided({ title: course.title, approved });
  }

  return (
    <main className="flex w-full flex-1 flex-col lg:flex-row">
      <aside className="border-b border-[#e8d5bb] bg-[#fffdf9] lg:w-[400px] lg:shrink-0 lg:border-b-0 lg:border-r" aria-labelledby="queue-title">
        <div className="border-b border-[#efe2d0] px-5 pb-4 pt-6 sm:px-6">
          <h1 id="queue-title" className="type-section-title text-[#1c0e04]">
            Review Queue
          </h1>
          <div role="group" aria-label="Filter the queue" className="mt-3 flex gap-2">
            {FILTERS.map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)} aria-pressed={filter === f} className={cn(chip(filter === f), 'h-8 px-3.5 text-[13px]')}>
                {f} ({count(f)})
              </button>
            ))}
          </div>
        </div>

        <ul className="space-y-3 p-4 sm:px-5 lg:max-h-[calc(100vh-11rem)] lg:overflow-y-auto">
          {shown.map((c) => {
            const on = c.id === selected?.id;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => open(c.id)}
                  aria-current={on ? 'true' : undefined}
                  className={cn(
                    'flex w-full cursor-pointer gap-3.5 rounded-2xl border p-3.5 text-left transition-colors',
                    on ? 'border-[#1e2a78]/30 bg-[#eef0fb]' : 'border-[#e8d5bb] bg-[#fffdf9] hover:border-[#1e2a78]/30'
                  )}
                >
                  <Image src={c.image} alt="" width={116} height={116} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-[16px] font-bold text-[#1c0e04]">{c.title}</span>
                    <span className="mt-0.5 block font-body text-[13px] text-[#7a6655]">
                      {c.instructor} · {ago(c.hoursAgo)}
                    </span>
                    <span className="mt-2 flex gap-1.5">
                      <Pill value="Pending Review" />
                      {c.kind === 'Revised' && <span className="rounded-full border border-[#1e2a78]/20 bg-[#ecedf3] px-2.5 py-0.5 font-body text-[12px] font-bold text-[#1e2a78]">Revised</span>}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
          {shown.length === 0 && <li className="px-2 py-8 text-center font-body text-[14px] text-[#7a6655]">Nothing waiting for review.</li>}
        </ul>
      </aside>

      <section ref={detail} className="min-w-0 flex-1 scroll-mt-16 px-4 pb-12 pt-6 sm:px-6 lg:px-10 lg:pt-8" aria-live="polite">
        <SampleDataNote />
        {decided && (
          <p className={cn('mt-3 rounded-xl px-4 py-3 font-body text-[14px] font-semibold', decided.approved ? 'bg-[#e6f0ea] text-[#0d5c3a]' : 'bg-[#fdecea] text-[#b42318]')} role="status">
            {decided.approved ? `“${decided.title}” approved. It goes live once the admin API saves it.` : `“${decided.title}” sent back to the instructor.`}
          </p>
        )}

        {selected ? (
          <>
            <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 max-w-[520px]">
                <h2 className="type-page-title text-[#1c0e04]">{selected.title}</h2>
                <p className="mt-2 font-body text-[15px] leading-6 text-[#7a6655]">
                  {selected.instructor} · {selected.lessons} lessons · {length(selected.duration)} · {selected.price ? naira(selected.price) : 'Free'} · Submitted {ago(selected.hoursAgo)}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => decide(selected, false)}
                  className="inline-flex h-12 cursor-pointer items-center gap-1.5 rounded-xl border border-[#f2c4c0] bg-[#fdf1f0] px-5 font-body text-[15px] font-semibold text-[#b42318] transition-colors hover:bg-[#fdecea]"
                >
                  <X className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => decide(selected, true)}
                  className="inline-flex h-12 cursor-pointer items-center gap-1.5 rounded-xl bg-brand-gradient px-6 font-body text-[15px] font-semibold text-white shadow-md shadow-brand/30 transition-opacity hover:opacity-90"
                >
                  <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                  Approve
                </button>
              </div>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <section className={cn(card, 'p-6')} aria-labelledby="preview-title">
                <h3 id="preview-title" className="font-display text-[18px] font-bold text-[#1c0e04]">
                  Course Preview
                </h3>
                <Image src={selected.image} alt={`Cover of ${selected.title}`} width={640} height={400} className="mt-4 aspect-[16/10] w-full rounded-xl object-cover" />
                <p className="mt-4 font-display text-[17px] font-bold text-[#1c0e04]">{selected.title}</p>
                <p className="mt-1 font-body text-[14px] leading-6 text-[#7a6655]">{selected.summary}</p>
              </section>

              <section className={cn(card, 'p-6')} aria-labelledby="checklist-title">
                <h3 id="checklist-title" className="font-display text-[18px] font-bold text-[#1c0e04]">
                  Quality Checklist
                </h3>
                <ul className="mt-4 space-y-3.5">
                  {selected.checklist.map((item) => (
                    <li key={item.label} className={cn('flex items-center gap-3 font-body text-[15px]', item.ok ? 'text-[#3d2b1f]' : 'text-[#a86f00]')}>
                      {item.ok ? (
                        <CircleCheck className="h-5 w-5 shrink-0 text-[#0d5c3a]" strokeWidth={1.9} aria-hidden="true" />
                      ) : (
                        <CircleAlert className="h-5 w-5 shrink-0 text-[#d4920a]" strokeWidth={1.9} aria-hidden="true" />
                      )}
                      {item.label}
                      <span className="sr-only">{item.ok ? '(passed)' : '(needs attention)'}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </>
        ) : (
          <div className={cn(card, 'mt-6 px-6 py-14 text-center')}>
            <CircleCheck className="mx-auto h-9 w-9 text-[#0d5c3a]" strokeWidth={1.7} aria-hidden="true" />
            <p className="mt-3 font-display text-[18px] font-bold text-[#1c0e04]">All caught up</p>
            <p className="mt-1 font-body text-[14px] text-[#7a6655]">No courses are waiting for review.</p>
          </div>
        )}
      </section>
    </main>
  );
}
