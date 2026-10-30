'use client';

import { useUser } from '@clerk/nextjs';
import { BookOpen, DollarSign, Plus, Star, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { card, RevenueChart, StatCard, StatusPill } from '@/components/instructor/studio-parts';
import {
  courseTotals,
  INSTRUCTOR_SHARE,
  monthlyGross,
  naira,
  percentChange,
  SAMPLE_INSTRUCTOR,
  STUDIO_COURSES,
  sum,
} from '@/lib/instructor-data';

function greeting(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** /portal — instructor home: greeting, students / revenue / rating / completion, earnings chart and their courses. */
export default function InstructorDashboardPage() {
  const { user } = useUser();
  const firstName = user?.firstName || SAMPLE_INSTRUCTOR.firstName;

  const live = STUDIO_COURSES.filter((c) => c.status === 'Live');
  const drafts = STUDIO_COURSES.length - live.length;
  const monthlyShare = monthlyGross.map((g) => g * INSTRUCTOR_SHARE);
  const thisMonth = monthlyShare.at(-1) ?? 0;
  const lastMonth = monthlyShare.at(-2) ?? 0;

  const studentsByCourse = STUDIO_COURSES.map((c) => courseTotals(c, 12).students);
  const totalStudents = sum(studentsByCourse);
  const newThisMonth = sum(STUDIO_COURSES.map((c) => c.monthlyStudents.at(-1) ?? 0));
  const rated = live.filter((c) => c.rating !== undefined);
  const avgRating = sum(rated.map((c) => (c.rating ?? 0) * courseTotals(c, 12).students)) / Math.max(sum(rated.map((c) => courseTotals(c, 12).students)), 1);

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-12 pt-7 sm:px-6 lg:px-10 lg:pt-9">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-extrabold leading-9 text-[#1c0e04]">
            {greeting(new Date().getHours())}, {firstName} <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-1 font-body text-[15px] text-[#7a6655]">
            {live.length} {live.length === 1 ? 'course' : 'courses'} live · {drafts} {drafts === 1 ? 'draft' : 'drafts'} · {naira(thisMonth)} earned this month
          </p>
        </div>
        {/* The Course Builder (SCRUM-32/38) is waiting on its designs. */}
        <button
          type="button"
          aria-disabled="true"
          title="The Course Builder is coming next"
          className="inline-flex h-11 cursor-not-allowed items-center gap-1.5 rounded-xl bg-brand-gradient px-5 font-body text-[15px] font-semibold text-white opacity-60 shadow-md shadow-brand/30"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          Create Course
        </button>
      </div>

      <section className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 min-[1100px]:grid-cols-4" aria-label="Your numbers">
        <StatCard
          icon={<Users className="h-5 w-5 text-[#0d5c3a]" strokeWidth={1.9} />}
          tint="bg-[#e6f0ea]"
          label="Total Students"
          value={totalStudents.toLocaleString('en-NG')}
          trend={percentChange(totalStudents, totalStudents - newThisMonth)}
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5 text-brand" strokeWidth={1.9} />}
          tint="bg-[#fbebe2]"
          label="Revenue (Month)"
          value={naira(thisMonth)}
          trend={percentChange(thisMonth, lastMonth)}
        />
        <StatCard icon={<Star className="h-5 w-5 text-[#d4920a]" strokeWidth={1.9} />} tint="bg-[#fbf3e0]" label="Avg Rating" value={avgRating.toFixed(1)} />
        <StatCard
          icon={<BookOpen className="h-5 w-5 text-[#1e2a78]" strokeWidth={1.9} />}
          tint="bg-[#ecedf3]"
          label="Completion Rate"
          value={`${SAMPLE_INSTRUCTOR.completionRate}%`}
          trend={SAMPLE_INSTRUCTOR.completionTrend}
        />
      </section>

      <div className="mt-7 grid gap-6 min-[1000px]:grid-cols-[minmax(0,1fr)_340px]">
        <section className={cn(card, 'p-6')} aria-labelledby="revenue-title">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="revenue-title" className="font-display text-[19px] font-bold text-[#1c0e04]">
              Earnings · last 12 months
            </h2>
            <span className="rounded-full border border-[#0d5c3a]/20 bg-[#e6f0ea] px-3 py-1 font-body text-[13px] font-bold text-[#0d5c3a]">
              {naira(sum(monthlyShare))} total
            </span>
          </div>
          <RevenueChart values={monthlyShare} className="mt-8" />
        </section>

        <section id="my-courses" className="scroll-mt-24" aria-labelledby="courses-title">
          <h2 id="courses-title" className="font-display text-[19px] font-bold text-[#1c0e04]">
            My Courses
          </h2>
          <ul className="mt-4 space-y-3">
            {STUDIO_COURSES.map((c, i) => (
              <li key={c.slug} className={cn(card, 'flex items-start justify-between gap-3 px-5 py-4')}>
                <div className="min-w-0">
                  <h3 className="font-display text-[16px] font-bold text-[#1c0e04]">{c.title}</h3>
                  <p className="mt-1 font-body text-[13px] text-[#7a6655]">
                    {c.status === 'Live' ? `${studentsByCourse[i].toLocaleString('en-NG')} students · ${c.rating?.toFixed(1)}★` : '— students'}
                  </p>
                </div>
                <StatusPill status={c.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
