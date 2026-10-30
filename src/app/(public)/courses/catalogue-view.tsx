'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, List, Search, SearchX, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CourseCard, CourseListItem, CourseMobileCard, CourseMobileRow } from '@/components/learner/course-card';
import { SelectBox } from '@/components/learner/select-box';
import { LEVEL_LABELS, type CourseLevel, type CourseSummary } from '@/lib/learner-data';
import type { Catalogue } from '@/lib/courses-api';

const FILTERS = ['All', 'Free', 'Paid', 'New', 'Bestseller'] as const;
type Filter = (typeof FILTERS)[number];

type FilterKey = 'query' | 'category' | 'level' | 'filter';
type FilterChip = { key: FilterKey; label: string; remove: () => void };

const LEVELS: (CourseLevel | null)[] = [null, 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const SORTS = [
  { id: 'popular', label: 'Most popular' },
  { id: 'newest', label: 'Newest' },
  { id: 'rating', label: 'Highest rated' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
] as const;
type Sort = (typeof SORTS)[number]['id'];

/** Courses per page, in both views (two rows of three in the grid). */
const PAGE_SIZE = 6;

/** "2.3k" → 2300. */
function studentCount(students: string) {
  const n = parseFloat(students) || 0;
  return /k$/i.test(students.trim()) ? n * 1000 : n;
}

function sortCourses(courses: CourseSummary[], sort: Sort) {
  const list = [...courses];
  switch (sort) {
    case 'popular':
      return list.sort((a, b) => studentCount(b.students) - studentCount(a.students));
    case 'newest':
      return list.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
    case 'rating':
      return list.sort((a, b) => b.rating - a.rating);
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price);
  }
}

/** Page buttons: every page when there are few, else "1 2 3 … 82" around the current one. */
function pageItems(page: number, pages: number): (number | 'gap')[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const shown = new Set([1, pages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3].forEach((p) => shown.add(p));
  if (page >= pages - 2) [pages - 2, pages - 1].forEach((p) => shown.add(p));
  const sorted = [...shown].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? (['gap', p] as const) : [p]));
}

const pageButton ='flex h-[50px] min-w-[50px] items-center justify-center rounded-xl font-body text-[19px] transition-colors';

/**
 * Catalogue body: search, categories and level on the left; price / badge filters, sort, grid or list
 * view, the courses and page numbers on the right. Search matches the title, instructor or description,
 * and every filter applies at once. A search with no match suggests categories; filters alone that
 * leave nothing just offer to clear them.
 */
export function CatalogueView({ catalogue }: { catalogue: Catalogue }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [level, setLevel] = useState<CourseLevel | null>(null);
  const [filter, setFilter] = useState<Filter>('All');
  const [sort, setSort] = useState<Sort>('popular');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  /** Filters in use, in the order they were first picked: the order of the filter tags. */
  const [picked, setPicked] = useState<FilterKey[]>([]);

  /** A changed search or filter starts again from page 1; a filter turned on joins the end of the tags. */
  const update = <T,>(set: (value: T) => void, key?: FilterKey) => (value: T) => {
    set(value);
    setPage(1);
    if (!key) return;
    const on = value !== null && value !== 'All' && String(value).trim() !== '';
    setPicked((p) => (on ? (p.includes(key) ? p : [...p, key]) : p.filter((k) => k !== key)));
  };
  const clearAll = () => {
    setQuery('');
    setCategory(null);
    setLevel(null);
    setFilter('All');
    setPage(1);
    setPicked([]);
  };
  const browseCategory = (slug: string) => {
    clearAll();
    setCategory(slug);
    setPicked(['category']);
  };

  const categoryLabel = (slug: string) => catalogue.categories.find((c) => c.slug === slug)?.label;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalogue.courses.filter((c) => {
      if (category && c.category !== category) return false;
      if (level && c.level !== level) return false;
      if (filter === 'Free' && c.price !== 0) return false;
      if (filter === 'Paid' && c.price === 0) return false;
      if ((filter === 'New' || filter === 'Bestseller') && c.badge !== filter) return false;
      if (!q) return true;
      return [c.title, c.instructor, c.description ?? ''].some((text) => text.toLowerCase().includes(q));
    });
  }, [catalogue.courses, query, category, level, filter]);

  const sorted = useMemo(() => sortCourses(matches, sort), [matches, sort]);
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = sorted.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const filtered = query.trim() !== '' || category !== null || level !== null || filter !== 'All';
  const available = filtered ? matches.length : catalogue.total;

  const allChips: (FilterChip | false | '' | null)[] = [
    query.trim() && { key: 'query', label: `“${query.trim()}”`, remove: () => update(setQuery, 'query')('') },
    category && { key: 'category', label: categoryLabel(category) ?? category, remove: () => update(setCategory, 'category')(null) },
    level && { key: 'level', label: LEVEL_LABELS[level], remove: () => update(setLevel, 'level')(null) },
    filter !== 'All' && { key: 'filter', label: filter, remove: () => update(setFilter, 'filter')('All') },
  ];
  const chips = allChips.filter((c): c is FilterChip => !!c).sort((a, b) => picked.indexOf(a.key) - picked.indexOf(b.key));

  const goTo = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="learner-compact flex flex-1 flex-col lg:flex-row">
      {/* Desktop sidebar; phones and tablets get the same controls as dropdowns above the results. */}
      <aside className="hidden w-[367px] shrink-0 border-r border-[#e8d5bb] bg-[#fffdf9] lg:block">
        <div className="border-b border-[#e8d5bb] px-[25px] pb-[25px] pt-[31px]">
          <label className="relative block">
            <span className="sr-only">Search courses</span>
            <Search className="pointer-events-none absolute left-[21px] top-1/2 h-5 w-5 -translate-y-1/2 text-[#7a6655]" strokeWidth={1.8} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => update(setQuery, 'query')(e.target.value)}
              placeholder="Search courses..."
              className="h-[60px] w-full rounded-xl border-2 border-[#efe2d0] bg-[#fffdf9] pl-[53px] pr-4 font-body text-[20px] text-[#1c0e04] placeholder:text-[#a89282] focus:border-brand focus:outline-none"
            />
          </label>
        </div>

        <div className="px-[25px] pb-6 pt-[29px]">
          <h2 className="font-body text-[15px] font-semibold uppercase tracking-[0.1em] text-[#a08a78]">Categories</h2>
          <ul className="mt-[18px] space-y-[4px]">
            {[{ slug: null, label: 'All Courses', count: catalogue.total }, ...catalogue.categories].map((c) => {
              const active = category === c.slug;
              return (
                <li key={c.label}>
                  <button
                    type="button"
                    onClick={() => update(setCategory, 'category')(c.slug)}
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

        <div className="border-t border-[#e8d5bb] px-[25px] pb-[35px] pt-[23px]">
          <h2 className="font-body text-[15px] font-semibold uppercase tracking-[0.1em] text-[#a08a78]">Level</h2>
          <div role="group" aria-label="Level" className="mt-[15px] space-y-[4px]">
            {LEVELS.map((l) => {
              const active = level === l;
              return (
                <button
                  key={l ?? 'all'}
                  type="button"
                  onClick={() => update(setLevel, 'level')(l)}
                  aria-pressed={active}
                  className={cn(
                    'flex h-[50px] w-full cursor-pointer items-center gap-[15px] whitespace-nowrap rounded-xl px-[19px] text-left font-body text-[20px] transition-colors',
                    active ? 'bg-[#fdeee4] font-bold text-brand' : 'text-[#3d2b1f] hover:bg-[#fdf6ec]'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2', active ? 'border-brand' : 'border-[#c9b8a5]')}
                  >
                    {active && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
                  </span>
                  {l ? LEVEL_LABELS[l] : 'All levels'}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 pb-12 pt-5 sm:px-6 lg:pb-[37px] lg:pl-[45px] lg:pr-[47px] lg:pt-[42px]">
        <label className="relative mb-6 block lg:hidden">
          <span className="sr-only">Search courses</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7a6655]" strokeWidth={1.8} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => update(setQuery, 'query')(e.target.value)}
            placeholder="Search courses..."
            className="h-12 w-full rounded-xl border-2 border-[#efe2d0] bg-[#fffdf9] pl-12 pr-4 font-body text-base text-[#1c0e04] placeholder:text-[#a89282] focus:border-brand focus:outline-none"
          />
        </label>

        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start lg:justify-between">
          <div>
            <h1 className="font-display text-[30px] font-extrabold leading-9 text-[#1c0e04] lg:text-[33px] lg:leading-10">All Courses</h1>
            <p className="mt-[1px] text-[17px] text-[#7a6655] lg:text-[20px]" aria-live="polite">
              {available.toLocaleString('en-NG')} {available === 1 ? 'course' : 'courses'} available
            </p>
          </div>
          <div
            className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:gap-[10px] lg:overflow-visible lg:px-0 lg:pt-[11px]"
            role="group"
            aria-label="Filter courses"
          >
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => update(setFilter, 'filter')(f)}
                aria-pressed={filter === f}
                className={cn(
                  'h-8 shrink-0 cursor-pointer rounded-full px-3.5 font-body text-[13px] transition-colors lg:h-[46px] lg:px-[19px] lg:text-[19px]',
                  filter === f ? 'bg-brand text-white shadow-md shadow-brand/30' : 'border-2 border-[#efe2d0] bg-[#fffdf9] text-[#3d2b1f] hover:border-brand/40'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:hidden">
          <div>
            <label htmlFor="catalogue-category" className="mb-1.5 block font-body text-[14px] text-[#7a6655]">
              Category
            </label>
            <SelectBox
              id="catalogue-category"
              value={category ?? ''}
              onChange={(v) => update(setCategory, 'category')(v || null)}
              options={[{ value: '', label: 'All Categories' }, ...catalogue.categories.map((c) => ({ value: c.slug, label: c.label }))]}
            />
          </div>
          <div>
            <label htmlFor="catalogue-level" className="mb-1.5 block font-body text-[14px] text-[#7a6655]">
              Level
            </label>
            <SelectBox
              id="catalogue-level"
              value={level ?? ''}
              onChange={(v) => update(setLevel, 'level')((v || null) as CourseLevel | null)}
              options={LEVELS.map((l) => ({ value: l ?? '', label: l ? LEVEL_LABELS[l] : 'All Levels' }))}
              align="right"
            />
          </div>
        </div>

        {sorted.length > 0 && (
          <div className="mt-4 flex flex-col-reverse gap-4 lg:mt-[30px] lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:border-b lg:border-[#efe2d0] lg:pb-5">
            <p className="font-body text-[15px] text-[#7a6655] lg:text-[17px]">
              Showing{' '}
              <strong className="text-[#1c0e04]">
                {(current - 1) * PAGE_SIZE + 1}–{(current - 1) * PAGE_SIZE + visible.length}
              </strong>{' '}
              of {sorted.length.toLocaleString('en-NG')} {sorted.length === 1 ? 'course' : 'courses'}
            </p>
            <div className="flex items-center gap-3 lg:gap-[15px]">
              <label htmlFor="catalogue-sort" className="sr-only font-body text-[17px] text-[#7a6655] lg:not-sr-only">
                Sort by
              </label>
              <SelectBox
                id="catalogue-sort"
                value={sort}
                onChange={(v) => update(setSort)(v as Sort)}
                options={SORTS.map((s) => ({ value: s.id, label: s.label }))}
                className="flex-1 lg:flex-none"
              />
              <div role="group" aria-label="View" className="flex gap-1 rounded-xl border-2 border-[#efe2d0] bg-[#fffdf9] p-1">
                {(['grid', 'list'] as const).map((v) => {
                  const Icon = v === 'grid' ? LayoutGrid : List;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setView(v)}
                      aria-pressed={view === v}
                      aria-label={v === 'grid' ? 'Grid view' : 'List view'}
                      className={cn(
                        'flex h-9 w-12 cursor-pointer items-center justify-center rounded-lg transition-colors lg:h-[38px] lg:w-[43px]',
                        view === v ? 'bg-[#fbece4] text-brand' : 'text-[#7a6655] hover:text-brand'
                      )}
                    >
                      <Icon className="h-5 w-5 lg:h-[21px] lg:w-[21px]" strokeWidth={1.9} aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {chips.length > 0 && (
          <div className={cn('flex flex-wrap items-center gap-2 lg:gap-[10px]', sorted.length > 0 ? 'mt-4 lg:mt-5' : 'mt-5 border-b border-[#efe2d0] pb-4 lg:mt-[30px] lg:pb-5')}>
            <span className="mr-1 font-body text-[14px] text-[#7a6655] lg:text-[17px]">Filters:</span>
            {chips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={chip.remove}
                aria-label={`Remove filter ${chip.label}`}
                className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-[#fdeee4] pl-3 pr-2.5 font-body text-[13px] font-semibold text-[#9a3409] transition-colors hover:bg-[#fbe0d0] lg:h-[42px] lg:gap-[10px] lg:pl-[17px] lg:pr-[13px] lg:text-[17px]"
              >
                {chip.label}
                <X className="h-3.5 w-3.5 lg:h-[17px] lg:w-[17px]" strokeWidth={2.4} aria-hidden="true" />
              </button>
            ))}
          </div>
        )}

        {sorted.length === 0 && !query.trim() ? (
          <section aria-labelledby="no-results-title" className="mt-[35px] flex flex-col items-center px-6 py-10 text-center">
            <h2 id="no-results-title" className="font-display text-[24px] font-extrabold text-[#1c0e04]">
              No courses match these filters yet
            </h2>
            <p className="mt-2 font-body text-[19px] text-[#7a6655]">Remove a filter above, or clear them all.</p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-6 h-[50px] cursor-pointer rounded-xl border-2 border-brand bg-[#fffdf9] px-6 font-body text-[19px] font-semibold text-brand transition-colors hover:bg-[#fdeee4]"
            >
              Clear filters
            </button>
          </section>
        ) : sorted.length === 0 ? (
          <section
            aria-labelledby="no-results-title"
            className="mt-[35px] flex flex-col items-center rounded-2xl border-2 border-dashed border-[#e8d5bb] bg-[#fffdf9] px-6 py-16 text-center"
          >
            <span aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fbece4] text-brand">
              <SearchX className="h-9 w-9" strokeWidth={1.8} />
            </span>
            <h2 id="no-results-title" className="mt-[22px] font-display text-[28px] font-extrabold text-[#1c0e04]">
              No courses match “{query.trim()}”
            </h2>
            <p className="mt-[10px] max-w-[575px] font-body text-[19px] leading-[29px] text-[#7a6655]">
              Try a different keyword or fewer filters, or browse a category instead:
            </p>
            <div className="mt-[27px] flex max-w-[800px] flex-wrap justify-center gap-3">
              {catalogue.categories.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => browseCategory(c.slug)}
                  className="h-[50px] cursor-pointer rounded-full border-2 border-[#efe2d0] bg-[#fffdf9] px-5 font-body text-[19px] font-medium text-[#3d2b1f] transition-colors hover:border-brand/40 hover:text-brand"
                >
                  {c.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={clearAll}
              className="mt-[35px] h-[55px] cursor-pointer rounded-xl border-2 border-brand bg-[#fffdf9] px-7 font-body text-[19px] font-semibold text-brand transition-colors hover:bg-[#fdeee4]"
            >
              Clear all filters
            </button>
          </section>
        ) : view === 'grid' ? (
          <>
            <div className="mt-4 flex flex-col gap-4 min-[640px]:hidden">
              {visible.map((c, i) => (
                <CourseMobileCard key={c.id} course={c} priority={i < 1} />
              ))}
            </div>
            <div className="mt-[30px] hidden gap-[30px] min-[640px]:grid min-[640px]:grid-cols-2 min-[1100px]:grid-cols-3">
              {visible.map((c, i) => (
                <CourseCard key={c.id} course={c} priority={i < 3} />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mt-4 flex flex-col gap-3 lg:hidden">
              {visible.map((c, i) => (
                <CourseMobileRow key={c.id} course={c} priority={i < 3} />
              ))}
            </div>
            <div className="mt-[30px] hidden flex-col gap-5 lg:flex">
              {visible.map((c, i) => (
                <CourseListItem key={c.id} course={c} categoryLabel={categoryLabel(c.category)} priority={i < 2} />
              ))}
            </div>
          </>
        )}

        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-[45px] flex flex-wrap items-center justify-center gap-[10px]">
            <button
              type="button"
              onClick={() => goTo(current - 1)}
              disabled={current === 1}
              className={cn(pageButton, 'cursor-pointer gap-2 border-2 border-[#efe2d0] bg-[#fffdf9] text-[#3d2b1f] hover:border-brand/40 disabled:cursor-not-allowed disabled:text-[#a89282] disabled:hover:border-[#efe2d0] sm:px-[18px]')}
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Previous</span>
            </button>
            {pageItems(current, pages).map((p, i) =>
              p === 'gap' ? (
                <span key={`gap-${i}`} aria-hidden="true" className="w-[35px] text-center font-body text-[19px] text-[#7a6655]">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => goTo(p)}
                  aria-current={p === current ? 'page' : undefined}
                  aria-label={`Page ${p}`}
                  className={cn(
                    pageButton,
                    'cursor-pointer',
                    p === current ? 'bg-brand font-semibold text-white' : 'border-2 border-[#efe2d0] bg-[#fffdf9] text-[#3d2b1f] hover:border-brand/40'
                  )}
                >
                  {p}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => goTo(current + 1)}
              disabled={current === pages}
              className={cn(pageButton, 'cursor-pointer gap-2 border-2 border-[#efe2d0] bg-[#fffdf9] text-[#3d2b1f] hover:border-brand/40 disabled:cursor-not-allowed disabled:text-[#a89282] disabled:hover:border-[#efe2d0] sm:px-[18px]')}
            >
              <span className="sr-only sm:not-sr-only">Next</span>
              <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </button>
          </nav>
        )}
      </main>
    </div>
  );
}
