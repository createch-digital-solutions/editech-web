'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ChevronRight, Clock, DollarSign, Download, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { card, primaryButton, StatCard } from '@/components/instructor/studio-parts';
import { BarChart, Meter, outlineButton, SampleDataNote } from '@/components/admin/admin-parts';
import { ADMIN_USERS, MONTHLY_SIGNUPS, OVERVIEW, REVIEW_QUEUE, TOP_CATEGORIES } from '@/lib/admin-data';
import { monthLabels, naira } from '@/lib/instructor-data';

/** GET /health: whether the API and its database answer. */
function useSystemStatus() {
  return useQuery({
    queryKey: ['admin', 'health'],
    queryFn: () => apiClient.get<{ status: string; services?: { database?: string } }>('/health', { skipAuth: true }),
    refetchInterval: 60_000,
  });
}

/** Saves the overview figures as a CSV file. */
function exportReport(rows: [string, string | number][]) {
  const blob = new Blob([['Metric,Value', ...rows.map(([k, v]) => `${k},${v}`)].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), { href: url, download: `platform-overview-${new Date().toISOString().slice(0, 10)}.csv` }).click();
  URL.revokeObjectURL(url);
}

/** /admin — platform overview: users, courses, revenue, reviews waiting, growth, what needs attention and top categories. */
export default function AdminOverviewPage() {
  const health = useSystemStatus();
  const pendingInstructors = ADMIN_USERS.filter((u) => u.status === 'Pending').length;
  const labels = monthLabels();
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const up = health.data?.status === 'ok' && health.data.services?.database !== 'down';

  const actions = [
    { label: 'Course Reviews', count: REVIEW_QUEUE.length, color: 'text-[#d4920a]', href: '/admin/courses' },
    { label: 'Payout Requests', count: OVERVIEW.payoutRequests, color: 'text-[#0d5c3a]' },
    { label: 'User Reports', count: OVERVIEW.userReports, color: 'text-[#b42318]' },
    { label: 'Instructor Verif.', count: pendingInstructors, color: 'text-[#1e2a78]', href: '/admin/users?filter=pending' },
  ];

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-12 pt-7 sm:px-6 lg:px-10 lg:pt-9">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="type-page-title text-[#1c0e04]">Platform Overview</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 font-body text-[15px] text-[#7a6655]">
            {today} ·
            <span className={cn('inline-flex items-center gap-1.5', health.isPending ? '' : up ? 'text-[#0d5c3a]' : 'text-[#b42318]')}>
              <span className={cn('h-2 w-2 rounded-full', health.isPending ? 'bg-[#c9b8a5]' : up ? 'bg-[#0d5c3a]' : 'bg-[#b42318]')} aria-hidden="true" />
              {health.isPending ? 'Checking systems…' : up ? 'All systems operational' : 'API not responding'}
            </span>
          </p>
          <SampleDataNote />
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              exportReport([
                ['Total users', OVERVIEW.totalUsers],
                ['Active courses', OVERVIEW.activeCourses],
                ['Monthly revenue (NGN)', OVERVIEW.monthlyRevenue],
                ['Pending reviews', REVIEW_QUEUE.length],
                ['Instructors awaiting approval', pendingInstructors],
              ])
            }
            className={outlineButton}
          >
            <Download className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Export Report
          </button>
          <button type="button" disabled title="Platform settings are coming soon" className={cn(primaryButton, 'cursor-not-allowed opacity-60')}>
            Platform Settings
          </button>
        </div>
      </div>

      <section className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 min-[1100px]:grid-cols-4" aria-label="Platform numbers">
        <StatCard icon={<Users className="h-5 w-5 text-[#1e2a78]" strokeWidth={1.9} />} tint="bg-[#ecedf3]" label="Total Users" value={OVERVIEW.totalUsers.toLocaleString('en-NG')} trend={OVERVIEW.usersTrend} />
        <StatCard icon={<BookOpen className="h-5 w-5 text-brand" strokeWidth={1.9} />} tint="bg-[#fbebe2]" label="Active Courses" value={String(OVERVIEW.activeCourses)} trend={OVERVIEW.coursesTrend} />
        <StatCard icon={<DollarSign className="h-5 w-5 text-[#0d5c3a]" strokeWidth={1.9} />} tint="bg-[#e6f0ea]" label="Monthly Revenue" value={naira(OVERVIEW.monthlyRevenue)} trend={OVERVIEW.revenueTrend} />
        <StatCard icon={<Clock className="h-5 w-5 text-[#d4920a]" strokeWidth={1.9} />} tint="bg-[#fbf3e0]" label="Pending Reviews" value={String(REVIEW_QUEUE.length)} />
      </section>

      {/* Breakpoints in rem so the 3-column one sorts after md (48rem) and wins from 1100px up. */}
      <div className="mt-7 grid gap-6 md:grid-cols-2 min-[68.75rem]:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <section className={cn(card, 'p-6 md:col-span-2 min-[68.75rem]:col-span-1')} aria-labelledby="growth-title">
          <h2 id="growth-title" className="type-section-title text-[#1c0e04]">
            Platform Growth · last 12 months
          </h2>
          <BarChart values={MONTHLY_SIGNUPS} labels={labels.map((l) => l.short)} format={(n) => `${n.toLocaleString('en-NG')} sign-ups`} className="mt-8" />
        </section>

        <section className={cn(card, 'p-6')} aria-labelledby="actions-title">
          <h2 id="actions-title" className="type-section-title text-[#1c0e04]">
            Pending Actions
          </h2>
          <ul className="mt-4 divide-y divide-[#efe2d0]">
            {actions.map((a) => {
              const row = (
                <>
                  <span className="text-[15px] text-[#3d2b1f]">{a.label}</span>
                  <span className="flex items-center gap-1">
                    <span className={cn('font-display text-[20px] font-extrabold', a.color)}>{a.count}</span>
                    {a.href && <ChevronRight className="h-4 w-4 text-[#c9b8a5] transition-transform group-hover:translate-x-0.5" strokeWidth={2} aria-hidden="true" />}
                  </span>
                </>
              );
              return (
                <li key={a.label}>
                  {a.href ? (
                    <Link href={a.href} className="group flex items-center justify-between py-3.5 font-body hover:text-[#1e2a78]">
                      {row}
                    </Link>
                  ) : (
                    <div className="flex items-center justify-between py-3.5 font-body">{row}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section className={cn(card, 'p-6')} aria-labelledby="categories-title">
          <h2 id="categories-title" className="type-section-title text-[#1c0e04]">
            Top Categories
          </h2>
          <div className="mt-5 space-y-4">
            {TOP_CATEGORIES.map((c) => (
              <Meter key={c.label} {...c} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
