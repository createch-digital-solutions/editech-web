'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { ArrowRight, BookOpen, Flame, Sparkles, Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CourseCard } from '@/components/learner/course-card';
import { LearnerSidebar } from '@/components/learner/learner-sidebar';
import { useCurrentUser } from '@/hooks/auth/use-current-user';
import type { CourseSummary } from '@/lib/learner-data';

function greeting(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatCard({ icon, tint, value, label, note }: { icon: React.ReactNode; tint: string; value: string; label: string; note: string }) {
  return (
    <div className="rounded-2xl border border-[#e8d5bb] bg-[#fffdf9] px-[22px] pb-[17px] pt-[21px] shadow-sm">
      <span className={cn('flex h-[42px] w-[42px] items-center justify-center rounded-lg', tint)}>{icon}</span>
      <p className="mt-[19px] font-display text-[22px] font-bold leading-7 text-[#1c0e04]">{value}</p>
      <p className="mt-[3px] text-[13px] leading-[18px] text-[#3d2b1f]">{label}</p>
      <p className="mt-[3px] text-[11px] leading-4 text-[#a89282]">{note}</p>
    </div>
  );
}

/**
 * The learner's home: greeting, streak and XP (GET /auth/me), courses in progress and recommendations.
 * TODO: List enrolled courses with progress once the learner module has an enrolments endpoint, and
 * show the rank once gamification has a leaderboard.
 */
export function DashboardView({ recommended }: { recommended: CourseSummary[] }) {
  const { user: clerkUser } = useUser();
  const { user } = useCurrentUser();
  const firstName = user?.firstName || clerkUser?.firstName || '';
  const profile = user?.learnerProfile;
  const streak = profile?.streakDays ?? 0;
  const xp = profile?.xpTotal ?? 0;

  return (
    <div className="flex flex-1">
      <LearnerSidebar />

      <main className="min-w-0 flex-1 px-4 pb-12 pt-6 sm:px-6 lg:pb-[30px] lg:pl-[19px] lg:pr-[48px] lg:pt-[31px]">
        <section className="grid gap-[23px] min-[640px]:grid-cols-2 min-[1180px]:grid-cols-[257px_repeat(3,minmax(0,1fr))]" aria-label="Your progress">
          <div className="relative overflow-hidden rounded-2xl bg-brand-night px-[31px] pb-6 pt-[31px] text-white shadow-sm min-[640px]:col-span-2 min-[1180px]:col-span-1">
            <h1 className="font-display text-[20px] font-bold leading-[33px]">
              {greeting(new Date().getHours())}
              {firstName && (
                <>
                  ,
                  <br />
                  {firstName}
                </>
              )}{' '}
              <span aria-hidden="true">👋</span>
            </h1>
            <p className="mt-[9px] max-w-[190px] text-[13px] leading-[21px] text-white/55">Find a course you love and start learning today.</p>
            <Link
              href="/courses"
              className="mt-[22px] inline-flex h-[31px] items-center gap-1 rounded-md bg-brand-gradient px-[15px] text-[12px] font-semibold text-white shadow-md shadow-brand/40 transition-opacity hover:opacity-90"
            >
              Browse Courses
              <ArrowRight className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
            </Link>
          </div>

          <StatCard
            icon={<Flame className="h-[18px] w-[18px] text-brand" strokeWidth={2} />}
            tint="bg-[#fbebe2]"
            value={String(streak)}
            label="Day Streak"
            note={streak ? 'Keep it going' : 'Learn today to start one'}
          />
          <StatCard icon={<Zap className="h-[18px] w-[18px] text-[#d4920a]" strokeWidth={2} />} tint="bg-[#fbf3e0]" value={xp.toLocaleString('en-NG')} label="XP" note="Earned from lessons and quizzes" />
          <StatCard icon={<Trophy className="h-[18px] w-[18px] text-[#1b2b6b]" strokeWidth={2} />} tint="bg-[#ecedf3]" value="—" label="Rank" note="Not ranked yet" />
        </section>

        <section id="continue-learning" className="mt-[34px] scroll-mt-28" aria-labelledby="continue-title">
          <h2 id="continue-title" className="font-display text-[19px] font-bold text-[#1c0e04]">
            Continue Learning
          </h2>
          <div className="mt-[18px] flex flex-col items-center rounded-2xl border-2 border-dashed border-[#e8d5bb] bg-[#fffdf9] px-6 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fbece4] text-brand" aria-hidden="true">
              <BookOpen className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <p className="mt-3 font-display text-[16px] font-bold text-[#1c0e04]">No courses in progress</p>
            <p className="mt-1 max-w-sm text-[13px] text-[#7a6655]">Courses you enrol in will show up here so you can pick up where you left off.</p>
            <Link href="/courses" className="mt-4 text-[13px] font-semibold text-brand hover:text-brand-light">
              Explore the catalogue →
            </Link>
          </div>
        </section>

        {recommended.length > 0 && (
          <section className="mt-[37px]" aria-labelledby="recommended-title">
            <h2 id="recommended-title" className="font-display text-[19px] font-bold leading-6 text-[#1c0e04]">
              Recommended for You
            </h2>
            <Sparkles className="mt-1 h-4 w-4 text-[#d4920a]" aria-hidden="true" />
            <div className="mt-[9px] grid gap-[19px] min-[640px]:grid-cols-2 min-[1180px]:-mr-3 min-[1180px]:grid-cols-4 min-[1180px]:pl-[13px]">
              {recommended.slice(0, 4).map((c) => (
                <CourseCard key={c.id} course={c} size="sm" />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
