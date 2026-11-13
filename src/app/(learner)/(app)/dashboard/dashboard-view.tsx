'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { ArrowRight, Flame, Sparkles, Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CourseCard } from '@/components/learner/course-card';
import { useCurrentUser } from '@/hooks/auth/use-current-user';
import { bestStreakOf } from '@/types/user';
import type { CourseSummary } from '@/lib/learner-data';
import { useMyEnrolments } from '@/hooks/use-my-enrolments';
import { ContinueLearning } from './continue-learning';

function greeting(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatCard({ icon, tint, value, label, note }: { icon: React.ReactNode; tint: string; value: string; label: string; note: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#e8d5bb] bg-[#fffdf9] px-3 pb-3 pt-3 shadow-sm sm:px-[22px] sm:pb-[17px] sm:pt-[21px]">
      <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg sm:h-[42px] sm:w-[42px]', tint)}>{icon}</span>
      <p className="mt-2.5 font-display text-[19px] font-bold leading-6 text-[#1c0e04] sm:mt-[19px] sm:text-[22px] sm:leading-7">{value}</p>
      <p className="mt-[2px] truncate text-[12px] leading-4 text-[#3d2b1f] sm:mt-[3px] sm:text-[13px] sm:leading-[18px]">{label}</p>
      {/* Three cards share a phone's width, so the note waits for a wider screen. */}
      <p className="mt-[3px] hidden text-[11px] leading-4 text-[#a89282] sm:block">{note}</p>
    </div>
  );
}

/**
 * The learner's home: greeting, streak and XP (GET /auth/me), their courses (GET /learner/enrolments)
 * and recommendations. Text and course cards use the catalogue's sizes.
 * TODO: Show the rank once gamification has a leaderboard.
 */
export function DashboardView({ recommended }: { recommended: CourseSummary[] }) {
  const { user: clerkUser } = useUser();
  const { user } = useCurrentUser();
  const firstName = user?.firstName || clerkUser?.firstName || '';
  const streak = user?.learnerProfile?.streakDays ?? 0;
  const best = bestStreakOf(user);
  const xp = user?.learnerProfile?.xpTotal ?? 0;
  // Recommendations leave out the courses the learner is already in.
  const { data: enrolments } = useMyEnrolments();
  const enrolled = new Set(enrolments?.map((e) => e.courseId));
  const suggestions = recommended.filter((c) => !enrolled.has(c.id));

  return (
    <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">
      <section className="grid grid-cols-3 gap-3 sm:gap-[23px] min-[1180px]:grid-cols-[257px_repeat(3,minmax(0,1fr))]" aria-label="Your progress">
        <div className="relative col-span-3 overflow-hidden rounded-2xl bg-brand-night px-6 pb-6 pt-6 text-white shadow-sm sm:px-[31px] sm:pt-[31px] min-[1180px]:col-span-1">
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
          note={best !== undefined ? `Best: ${best} ${best === 1 ? 'day' : 'days'}` : streak ? 'Keep it going' : 'Learn today to start one'}
        />
        <StatCard icon={<Zap className="h-[18px] w-[18px] text-[#d4920a]" strokeWidth={2} />} tint="bg-[#fbf3e0]" value={xp.toLocaleString('en-NG')} label="XP" note="Earned from lessons and quizzes" />
        <StatCard icon={<Trophy className="h-[18px] w-[18px] text-[#1b2b6b]" strokeWidth={2} />} tint="bg-[#ecedf3]" value="—" label="Rank" note="Not ranked yet" />
      </section>

      <ContinueLearning />

      {suggestions.length > 0 && (
        <section className="mt-[40px]" aria-labelledby="recommended-title">
          <h2 id="recommended-title" className="type-section-title flex items-center gap-2 text-[#1c0e04]">
            Recommended for You
            <Sparkles className="h-5 w-5 text-[#d4920a]" aria-hidden="true" />
          </h2>
          {/* The catalogue card at its catalogue size (capped width), three to a row. */}
          <div className="learner-compact mt-[22px] grid gap-[30px] min-[640px]:grid-cols-[repeat(2,minmax(0,320px))] min-[1180px]:grid-cols-[repeat(3,minmax(0,320px))]">
            {suggestions.slice(0, 3).map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
