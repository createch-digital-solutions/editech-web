'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { ArrowRight, Award, BookOpen, Flame, Medal, Pencil, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DiamondMotif } from '@/components/landing/diamond-motif';
import { LearnerAvatar } from '@/components/learner/app-header';
import { useCurrentUser } from '@/hooks/auth/use-current-user';

const stats = [
  { label: 'Courses Enrolled', icon: BookOpen, tint: 'bg-[#fbebe2] text-brand' },
  { label: 'Certificates', icon: Award, tint: 'bg-[#fbf3e0] text-[#d4920a]' },
  { label: 'Day Streak', icon: Flame, tint: 'bg-[#fbebe2] text-brand' },
  { label: 'Global Rank', icon: Trophy, tint: 'bg-[#ecedf3] text-[#1b2b6b]' },
];

/**
 * /profile — who the learner is (Clerk and GET /auth/me), their XP and streak, courses and badges.
 * TODO: List enrolled courses and earned badges once the learner and gamification modules have endpoints.
 */
export default function ProfilePage() {
  const { user } = useUser();
  const { user: dbUser } = useCurrentUser();
  const name = user?.fullName || [dbUser?.firstName, dbUser?.lastName].filter(Boolean).join(' ') || 'Your profile';
  const created = user?.createdAt ?? (dbUser?.createdAt ? new Date(dbUser.createdAt) : null);
  const joined = created?.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const xp = dbUser?.learnerProfile?.xpTotal ?? 0;
  const streak = dbUser?.learnerProfile?.streakDays ?? 0;

  return (
    <main className="learner-compact flex-1">
      <section className="relative overflow-hidden bg-brand-night" aria-label="Profile">
        <DiamondMotif className="left-[6px] top-[6px] h-[74px] w-[74px]" />
        <div className="relative mx-auto flex max-w-[1234px] flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start lg:h-[278px] lg:pb-0 lg:pl-[74px] lg:pr-[73px] lg:pt-[59px]">
          <div className="relative h-[133px] w-[133px] shrink-0">
            <LearnerAvatar className="h-full w-full border-[3px] border-[#c9b8a5]/70" />
            <Link
              href="/settings"
              aria-label="Change photo"
              className="absolute bottom-[2px] right-[3px] flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#1a0e05] bg-brand-gradient text-white"
            >
              <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>

          <div className="min-w-0 flex-1 md:ml-[4px] md:mt-[3px]">
            <h1 className="font-display text-[34px] font-extrabold leading-[44px] text-white sm:text-[43px]">{name}</h1>
            <p className="mt-[4px] text-[17px] leading-7 text-[#a08a78] sm:text-[21px]">
              Learner{joined && ` · Joined ${joined}`}
            </p>
            <div className="mt-[14px] flex flex-wrap gap-[12px]">
              <span className="rounded-full border border-[#c9a46b]/60 bg-[#e8a33d]/10 px-[14px] py-[4px] text-base font-bold text-[#e8a33d]">
                {xp.toLocaleString('en-NG')} XP
              </span>
              <span className="rounded-full border border-brand/50 bg-brand/10 px-[14px] py-[4px] text-base font-bold text-[#e05a1b]">
                {streak}-day Streak <span aria-hidden="true">🔥</span>
              </span>
            </div>
          </div>

          <Link
            href="/settings"
            className="flex h-[57px] w-[169px] shrink-0 items-center justify-center rounded-xl border-2 md:mt-[77px] border-white/70 font-body text-[20px] font-semibold text-white transition-colors hover:bg-white/10"
          >
            Edit Profile
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-[1234px] px-4 pb-[60px] sm:px-6 lg:px-[74px]">
        <section className="mt-[44px] grid grid-cols-2 gap-[26px] lg:grid-cols-4" aria-label="Your numbers">
          {stats.map((s) => (
            <div key={s.label} className="h-[170px] rounded-2xl border-2 border-[#efe2d0] bg-[#fffdf9] px-[30px] pt-[30px]">
              <span className={cn('flex h-[61px] w-[61px] items-center justify-center rounded-xl', s.tint)}>
                <s.icon className="h-[26px] w-[26px]" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <p className="mt-[20px] text-[19px] text-[#7a6655]">{s.label}</p>
            </div>
          ))}
        </section>

        <div className="mt-[46px] grid gap-[38px] lg:grid-cols-[699px_1fr]">
          <section id="my-courses" className="scroll-mt-28" aria-labelledby="my-courses-title">
            <h2 id="my-courses-title" className="font-display text-[25px] font-extrabold leading-8 text-[#1c0e04]">
              My Courses
            </h2>
            <div className="mt-[27px] flex flex-col items-center rounded-2xl border-2 border-dashed border-[#efe2d0] bg-[#fffdf9] px-6 py-12 text-center">
              <BookOpen className="h-8 w-8 text-brand" strokeWidth={1.7} aria-hidden="true" />
              <p className="mt-3 font-display text-[21px] font-bold text-[#1c0e04]">No courses yet</p>
              <p className="mt-1 max-w-sm text-[17px] text-[#7a6655]">Courses you enrol in will show up here with your progress.</p>
              <Link href="/courses" className="mt-4 text-[17px] font-semibold text-brand hover:text-brand-light">
                Explore the catalogue →
              </Link>
            </div>
          </section>

          <section aria-labelledby="recent-badges-title">
            <h2 id="recent-badges-title" className="font-display text-[25px] font-extrabold leading-8 text-[#1c0e04]">
              Recent Badges
            </h2>
            <div className="mt-[27px] rounded-2xl border-2 border-[#efe2d0] bg-[#fffdf9] px-[30px] pb-[30px] pt-[30px]">
              <div className="flex items-center gap-4 text-left">
                <Medal className="h-9 w-9 shrink-0 text-[#d4920a]" strokeWidth={1.6} aria-hidden="true" />
                <p className="text-[17px] text-[#7a6655]">No badges yet. Keep learning to earn your first one.</p>
              </div>
              <Link
                href="/dashboard/achievements"
                className="mt-[22px] flex h-11 w-full max-w-[286px] items-center justify-center gap-1 rounded-xl bg-brand-gradient text-[17px] font-semibold text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90"
              >
                View all badges
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
