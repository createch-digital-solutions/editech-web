'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { ChartNoAxesColumn, ChevronLeft, ChevronRight, Layers, LayoutGrid, List, SearchX, SlidersHorizontal, Tag, X, type LucideIcon } from 'lucide-react';
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

/** Courses per page, in both views; 12 fills whole rows of 2, 3 or 4 cards. */
const PAGE_SIZE = 12;

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

const DESKTOP = '(min-width: 1024px)';
const subscribeDesktop = (onChange: () => void) => {
  const query = window.matchMedia(DESKTOP);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};

/** A top-level row of the Explore panel: icon, label and, for a group, an arrow that opens its list. */
const panelRow = (active: boolean) =>
  cn(
    'flex w-full cursor-pointer items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-left font-body text-[15px] transition-colors lg:px-4 lg:py-3 lg:text-[19px]',
    active ? 'bg-[#fde8d8] font-semibold text-brand' : 'text-[#3d2b1f] hover:bg-[#fbf1e6]'
  );

/** An option inside an opened group, indented under the group's label. */
const optionRow = (active: boolean) =>
  cn(
    'flex w-full cursor-pointer items-center gap-3 rounded-lg py-2 pl-[46px] pr-3 text-left font-body text-[14px] transition-colors lg:pl-[54px] lg:text-[17px]',
    active ? 'font-semibold text-brand' : 'text-[#6b5848] hover:bg-[#fbf1e6] hover:text-[#1c0e04]'
  );

/** A group of the Explore panel (Categories, Levels, Price & highlights) that opens and closes. */
function PanelGroup({ icon: Icon, label, open, onToggle, children }: { icon: LucideIcon; label: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <li>
      <button type="button" onClick={onToggle} aria-expanded={open} className={panelRow(false)}>
        <Icon className="h-5 w-5 shrink-0 lg:h-6 lg:w-6" strokeWidth={1.8} aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ChevronRight className={cn('h-4 w-4 shrink-0 text-[#3d2b1f] transition-transform lg:h-5 lg:w-5', open && 'rotate-90')} strokeWidth={2.2} aria-hidden="true" />
      </button>
      {open && <ul className="mt-0.5 space-y-0.5 pb-1">{children}</ul>}
    </li>
  );
}

const pageButton ='flex h-[50px] min-w-[50px] items-center justify-center rounded-xl font-body text-[19px] transition-colors';

/**
 * Catalogue body: search, categories and level on the left; price / badge filters, sort, grid or list
 * view, the courses and page numbers on the right. Search matches the title, instructor or description,
 * and every filter applies at once. A search with no match suggests categories; filters alone that
 * leave nothing just offer to clear them.
 */
export function CatalogueView({ catalogue, initialQuery = '', initialCategory = '' }: { catalogue: Catalogue; initialQuery?: string; initialCategory?: string }) {
  const known = (slug: string) => (catalogue.categories.some((c) => c.slug === slug) ? slug : null);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<string | null>(() => known(initialCategory));
  const [level, setLevel] = useState<CourseLevel | null>(null);
  const [filter, setFilter] = useState<Filter>('All');
  const [sort, setSort] = useState<Sort>('popular');
  // List on phones and tablets, grid on desktop, until the learner picks one.
  const isDesktop = useSyncExternalStore(subscribeDesktop, () => window.matchMedia(DESKTOP).matches, () => true);
  const [chosenView, setView] = useState<'grid' | 'list' | null>(null);
  const view = chosenView ?? (isDesktop ? 'grid' : 'list');
  // Phones and tablets: the filters open from a button above the courses.
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  /** Filters in use, in the order they were first picked: the order of the filter tags. */
  const [picked, setPicked] = useState<FilterKey[]>(() => [...(initialQuery.trim() ? (['query'] as const) : []), ...(known(initialCategory) ? (['category'] as const) : [])]);

  // The search lives in the top bar (?q=); follow it when it changes, keeping the other filters.
  const router = useRouter();
  const [searched, setSearched] = useState(initialQuery);
  if (initialQuery !== searched) {
    setSearched(initialQuery);
    setQuery(initialQuery);
    setPage(1);
    setPicked((p) => (initialQuery.trim() ? (p.includes('query') ? p : [...p, 'query']) : p.filter((k) => k !== 'query')));
  }
  // The menu's Explore list links to a category (?category=); follow it the same way.
  const [linkedCategory, setLinkedCategory] = useState(initialCategory);
  if (initialCategory !== linkedCategory) {
    setLinkedCategory(initialCategory);
    const next = known(initialCategory);
    setCategory(next);
    setPage(1);
    setPicked((p) => (next ? (p.includes('category') ? p : [...p, 'category']) : p.filter((k) => k !== 'category')));
  }
  /** Drops the search from the address, which also clears the top-bar box. */
  const clearSearch = () => {
    if (initialQuery) router.replace('/courses', { scroll: false });
  };

  /** A changed search or filter starts again from page 1; a filter turned on joins the end of the tags. */
  const update = <T,>(set: (value: T) => void, key?: FilterKey) => (value: T) => {
    set(value);
    setPage(1);
    if (!key) return;
    const on = value !== null && value !== 'All' && String(value).trim() !== '';
    setPicked((p) => (on ? (p.includes(key) ? p : [...p, key]) : p.filter((k) => k !== key)));
  };
  const clearAll = () => {
    clearSearch();
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
    query.trim() && { key: 'query', label: `“${query.trim()}”`, remove: () => {
        update(setQuery, 'query')('');
        clearSearch();
      } },
    category && { key: 'category', label: categoryLabel(category) ?? category, remove: () => update(setCategory, 'category')(null) },
    level && { key: 'level', label: LEVEL_LABELS[level], remove: () => update(setLevel, 'level')(null) },
    filter !== 'All' && { key: 'filter', label: filter, remove: () => update(setFilter, 'filter')('All') },
  ];
  const chips = allChips.filter((c): c is FilterChip => !!c).sort((a, b) => picked.indexOf(a.key) - picked.indexOf(b.key));

  const goTo = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Opened groups; a group with something picked in it starts open.
  const [groupChoice, setGroupChoice] = useState<Record<string, boolean>>({});
  const groupOpen = (id: string, picked: boolean) => groupChoice[id] ?? picked;
  const toggleGroup = (id: string, picked: boolean) => setGroupChoice((g) => ({ ...g, [id]: !groupOpen(id, picked) }));

  const filterPanel = (
    <nav aria-label="Explore">
      <div className="hidden items-center justify-between lg:flex">
        <h2 className="type-section-title text-[#1c0e04]">Explore</h2>
      </div>
      <ul className="space-y-1 lg:mt-6">
        <li>
          <button type="button" onClick={clearAll} aria-pressed={chips.length === 0} className={panelRow(chips.length === 0)}>
            <Layers className="h-5 w-5 shrink-0 lg:h-6 lg:w-6" strokeWidth={1.8} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">All Courses</span>
            <span className="text-[13px] font-semibold opacity-70 lg:text-[16px]">{catalogue.total}</span>
          </button>
        </li>

        <PanelGroup icon={LayoutGrid} label="Categories" open={groupOpen('category', !!category)} onToggle={() => toggleGroup('category', !!category)}>
          {catalogue.categories.map((c) => (
            <li key={c.slug}>
              <button type="button" onClick={() => update(setCategory, 'category')(category === c.slug ? null : c.slug)} aria-pressed={category === c.slug} className={optionRow(category === c.slug)}>
                <span className="min-w-0 flex-1 leading-snug">
                  {c.label}
                </span>
                <span className="text-[12px] text-[#a08a78] lg:text-[15px]">{c.count}</span>
              </button>
            </li>
          ))}
        </PanelGroup>

        <PanelGroup icon={ChartNoAxesColumn} label="Levels" open={groupOpen('level', !!level)} onToggle={() => toggleGroup('level', !!level)}>
          {LEVELS.map((l) => (
            <li key={l ?? 'all'}>
              <button type="button" onClick={() => update(setLevel, 'level')(l)} aria-pressed={level === l} className={optionRow(level === l)}>
                {l ? LEVEL_LABELS[l] : 'All levels'}
              </button>
            </li>
          ))}
        </PanelGroup>

        <PanelGroup icon={Tag} label="Price & tags" open={groupOpen('filter', filter !== 'All')} onToggle={() => toggleGroup('filter', filter !== 'All')}>
          {FILTERS.map((f) => (
            <li key={f}>
              <button type="button" onClick={() => update(setFilter, 'filter')(f)} aria-pressed={filter === f} className={optionRow(filter === f)}>
                {f === 'All' ? 'Any price' : f}
              </button>
            </li>
          ))}
        </PanelGroup>
      </ul>
    </nav>
  );

  return (
    <div className="learner-compact flex flex-1">
      {/* Filter sidebar beside the courses (desktop), in place of the menu rail; phones open the same filters from a button. */}
      <aside aria-label="Filters" className="hidden w-[290px] shrink-0 border-r border-[#ece1d3] bg-[#fdf6ee] lg:block">
        {/* Stays in view under the top bar. Lengths are before the page's 0.8 zoom, so 80px lands at the bar's 64px. */}
        <div className="sticky top-[80px] max-h-[calc(125vh-80px)] overflow-y-auto px-5 pb-8 pt-9 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{filterPanel}</div>
      </aside>

      <main className="min-w-0 flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-[40px] lg:pb-[37px] lg:pt-[36px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="type-page-title text-[#1c0e04]">
              {category ? (categoryLabel(category) ?? 'All Courses') : 'All Courses'}
            </h1>
            <p className="mt-1 font-body text-[14px] text-[#7a6655] lg:text-[17px]" aria-live="polite">
              {sorted.length > 0 ? (
                <>
                  Showing{' '}
                  <strong className="text-[#1c0e04]">
                    {(current - 1) * PAGE_SIZE + 1}–{(current - 1) * PAGE_SIZE + visible.length}
                  </strong>{' '}
                  of {available.toLocaleString('en-NG')} {available === 1 ? 'course' : 'courses'}
                </>
              ) : (
                `${available.toLocaleString('en-NG')} ${available === 1 ? 'course' : 'courses'} available`
              )}
            </p>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto lg:gap-3">
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              aria-expanded={filtersOpen}
              aria-controls="catalogue-filters-mobile"
              className={cn(
                'flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-3.5 font-body text-[14px] font-semibold transition-colors lg:hidden',
                filtersOpen ? 'border-[#1c0e04] bg-[#1c0e04] text-white' : 'border-[#e3d6c4] bg-white text-[#1c0e04]'
              )}
            >
              <SlidersHorizontal className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              Filters
              {chips.length > 0 && <span className="rounded-full bg-brand px-1.5 text-[12px] text-white">{chips.length}</span>}
            </button>
            <label htmlFor="catalogue-sort" className="sr-only">
              Sort by
            </label>
            <SelectBox
              id="catalogue-sort"
              value={sort}
              onChange={(v) => update(setSort)(v as Sort)}
              options={SORTS.map((s) => ({ value: s.id, label: `Sort: ${s.label}` }))}
              align="right"
              className="min-w-0 flex-1 sm:w-[240px] sm:flex-none lg:w-[280px]"
            />
            <div role="group" aria-label="View" className="flex shrink-0 gap-1 rounded-xl border border-[#e3d6c4] bg-white p-1">
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
                      'flex h-8 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors lg:h-[40px] lg:w-[46px]',
                      view === v ? 'bg-[#fbece4] text-brand' : 'text-[#7a6655] hover:text-brand'
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] lg:h-[21px] lg:w-[21px]" strokeWidth={1.9} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {filtersOpen && (
          <div id="catalogue-filters-mobile" className="mt-4 rounded-2xl border border-[#ece1d3] bg-white p-4 lg:hidden">
            {filterPanel}
          </div>
        )}

        <div className="mt-5 border-t border-[#efe2d0] lg:mt-6">
          <div className="min-w-0">
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

        {catalogue.courses.length === 0 ? (
          <section aria-labelledby="no-results-title" className="mt-6 flex flex-col items-center px-4 py-8 text-center lg:mt-[35px] lg:px-6 lg:py-10">
            <h2 id="no-results-title" className="type-section-title text-[#1c0e04]">
              {catalogue.unavailable ? 'We couldn’t load the courses' : 'No courses yet'}
            </h2>
            <p className="mt-2 max-w-[520px] font-body text-[15px] text-[#7a6655] lg:text-[19px]">
              {catalogue.unavailable ? 'Please refresh the page in a moment.' : 'Courses will appear here as soon as instructors publish them.'}
            </p>
          </section>
        ) : sorted.length === 0 && !query.trim() ? (
          <section aria-labelledby="no-results-title" className="mt-6 flex flex-col items-center px-4 py-8 text-center lg:mt-[35px] lg:px-6 lg:py-10">
            <h2 id="no-results-title" className="type-section-title text-[#1c0e04]">
              No courses match these filters yet
            </h2>
            <p className="mt-1.5 font-body text-[14px] text-[#7a6655] lg:mt-2 lg:text-[19px]">Remove a filter above, or clear them all.</p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-4 h-10 cursor-pointer rounded-lg border-2 border-brand bg-[#fffdf9] px-4 font-body text-[14px] font-semibold text-brand transition-colors hover:bg-[#fdeee4] lg:mt-6 lg:h-[50px] lg:rounded-xl lg:px-6 lg:text-[19px]"
            >
              Clear filters
            </button>
          </section>
        ) : sorted.length === 0 ? (
          <section
            aria-labelledby="no-results-title"
            className="mt-6 flex flex-col items-center rounded-2xl border-2 border-dashed border-[#e8d5bb] bg-[#fffdf9] px-4 py-10 text-center lg:mt-[35px] lg:px-6 lg:py-16"
          >
            <span aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fbece4] text-brand">
              <SearchX className="h-9 w-9" strokeWidth={1.8} />
            </span>
            <h2 id="no-results-title" className="type-section-title mt-4 text-[#1c0e04] lg:mt-[22px]">
              No courses match “{query.trim()}”
            </h2>
            <p className="mt-2 max-w-[575px] font-body text-[14px] leading-[22px] text-[#7a6655] lg:mt-[10px] lg:text-[19px] lg:leading-[29px]">
              Try a different keyword or fewer filters, or browse a category instead:
            </p>
            <div className="mt-[27px] flex max-w-[800px] flex-wrap justify-center gap-3">
              {catalogue.categories.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => browseCategory(c.slug)}
                  className="h-9 cursor-pointer rounded-full border-2 border-[#efe2d0] bg-[#fffdf9] px-3.5 font-body text-[13px] font-medium text-[#3d2b1f] transition-colors hover:border-brand/40 hover:text-brand lg:h-[50px] lg:px-5 lg:text-[19px]"
                >
                  {c.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={clearAll}
              className="mt-6 h-10 cursor-pointer rounded-lg border-2 border-brand bg-[#fffdf9] px-4 font-body text-[14px] font-semibold text-brand transition-colors hover:bg-[#fdeee4] lg:mt-[35px] lg:h-[55px] lg:rounded-xl lg:px-7 lg:text-[19px]"
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
            <div className="mt-6 hidden gap-[20px] min-[640px]:grid min-[640px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1200px]:grid-cols-4">
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
          </div>
        </div>
      </main>
    </div>
  );
}
