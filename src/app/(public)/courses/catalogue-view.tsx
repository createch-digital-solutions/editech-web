'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CourseCard } from '@/components/learner/course-card';
import type { Catalogue } from '@/lib/courses-api';

const FILTERS = ['All', 'Free', 'Paid', 'New', 'Bestseller'] as const;
type Filter = (typeof FILTERS)[number];

/** Catalogue body: search and categories on the left, filter pills and the course grid on the right. */
export function CatalogueView({ catalogue }: { catalogue: Catalogue }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('All');

  const courses = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalogue.courses.filter((c) => {
      if (category && c.category !== category) return false;
      if (filter === 'Free' && c.price !== 0) return false;
      if (filter === 'Paid' && c.price === 0) return false;
      if ((filter === 'New' || filter === 'Bestseller') && c.badge !== filter) return false;
      return !q || c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q);
    });
  }, [catalogue.courses, query, category, filter]);

  const filtered = query.trim() !== '' || category !== null || filter !== 'All';
  const available = filtered || !catalogue.isSample ? courses.length : catalogue.total;

  return (
    <div className="learner-compact flex flex-1 flex-col lg:flex-row">
      <aside className="shrink-0 border-b border-[#e8d5bb] bg-[#fffdf9] lg:w-[367px] lg:border-b-0 lg:border-r">
        <div className="border-b border-[#e8d5bb] px-4 py-6 sm:px-6 lg:px-[25px] lg:pb-[25px] lg:pt-[31px]">
          <label className="relative block">
            <span className="sr-only">Search courses</span>
            <Search className="pointer-events-none absolute left-[21px] top-1/2 h-5 w-5 -translate-y-1/2 text-[#7a6655]" strokeWidth={1.8} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses..."
              className="h-[60px] w-full rounded-xl border-2 border-[#efe2d0] bg-[#fffdf9] pl-[53px] pr-4 font-body text-[20px] text-[#1c0e04] placeholder:text-[#a89282] focus:border-brand focus:outline-none"
            />
          </label>
        </div>

        <div className="px-4 py-6 sm:px-6 lg:px-[25px] lg:pt-[29px]">
          <h2 className="font-body text-[15px] font-semibold uppercase tracking-[0.1em] text-[#a08a78]">Categories</h2>
          <ul className="mt-[18px] flex gap-1 overflow-x-auto lg:block lg:space-y-[4px]">
            {[{ slug: null, label: 'All Courses', count: catalogue.total }, ...catalogue.categories].map((c) => {
              const active = category === c.slug;
              return (
                <li key={c.label} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setCategory(c.slug)}
                    aria-pressed={active}
                    className={cn(
                      'flex h-[53px] w-full cursor-pointer items-center justify-between gap-4 rounded-xl px-[19px] text-left font-body text-[20px] transition-colors',
                      active ? 'bg-[#fdeee4] font-bold text-brand' : 'text-[#3d2b1f] hover:bg-[#fdf6ec]'
                    )}
                  >
                    <span className="whitespace-nowrap">{c.label}</span>
                    <span className={cn('text-[17px]', active ? 'font-bold text-brand' : 'text-[#a89282]')}>{c.count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 pb-12 pt-8 sm:px-6 lg:pb-[37px] lg:pl-[45px] lg:pr-[47px] lg:pt-[42px]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-[33px] font-extrabold leading-10 text-[#1c0e04]">All Courses</h1>
            <p className="mt-[1px] text-[20px] text-[#7a6655]" aria-live="polite">
              {available.toLocaleString('en-NG')} {available === 1 ? 'course' : 'courses'} available
            </p>
          </div>
          <div className="flex flex-wrap gap-[10px] pt-[11px]" role="group" aria-label="Filter courses">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={cn(
                  'h-[46px] cursor-pointer rounded-full px-[19px] font-body text-[19px] transition-colors',
                  filter === f ? 'bg-brand text-white shadow-md shadow-brand/30' : 'border-2 border-[#efe2d0] bg-[#fffdf9] text-[#3d2b1f] hover:border-brand/40'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="mt-[35px] rounded-2xl border-2 border-dashed border-[#e8d5bb] bg-[#fffdf9] px-6 py-16 text-center">
            <p className="font-display text-xl font-bold text-[#1c0e04]">No courses match</p>
            <p className="mt-2 text-base text-[#7a6655]">Try another search, category or filter.</p>
          </div>
        ) : (
          <div className="mt-[35px] grid gap-[30px] min-[640px]:grid-cols-2 min-[1100px]:grid-cols-3">
            {courses.map((c, i) => (
              <CourseCard key={c.id} course={c} priority={i < 3} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
