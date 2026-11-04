'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { ArrowRight, Award, BookOpen, Flame, Medal, Pencil, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DiamondMotif } from '@/components/landing/diamond-motif';
import { LearnerAvatar } from '@/components/learner/app-header';
import { useCurrentUser } from '@/hooks/auth/use-current-user';
import { bestStreakOf } from '@/types/user';


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
  const best = bestStreakOf(dbUser);
  // Enrolled courses, certificates and rank have no endpoint yet, so they show a dash.
  const stats = [
    { label: 'Courses Enrolled', value: '—', icon: BookOpen, tint: 'bg-[#fbebe2] text-brand' },
    { label: 'Certificates', value: '0', icon: Award, tint: 'bg-[#fbf3e0] text-[#d4920a]' },
    { label: 'Day Streak', value: String(streak), icon: Flame, tint: 'bg-[#fbebe2] text-brand' },
    { label: 'Global Rank', value: '—', icon: Trophy, tint: 'bg-[#ecedf3] text-[#1b2b6b]' },
  ];

  return (
    <main className="learner-compact flex-1">
      <div className="px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <section className="relative overflow-hidden rounded-3xl bg-brand-night sm:rounded-[28px] shadow-[0_20px_50px_-24px_rgba(28,14,4,0.6)]" aria-label="Profile">
          <DiamondMotif className="left-[6px] top-[6px] h-[56px] w-[56px] sm:h-[74px] sm:w-[74px]" />
          <div className="relative mx-auto flex max-w-[1234px] flex-col items-center gap-4 px-5 py-7 text-center sm:px-6 sm:py-10 md:flex-row md:items-start md:gap-6 md:text-left lg:h-[278px] lg:pb-0 lg:pl-[74px] lg:pr-[73px] lg:pt-[59px]">
            <div className="relative h-[88px] w-[88px] shrink-0 sm:h-[133px] sm:w-[133px]">
              <LearnerAvatar className="h-full w-full border-[3px] border-[#c9b8a5]/70" />
              <Link
                href="/settings"
                aria-label="Change photo"
                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1a0e05] bg-brand-gradient text-white sm:bottom-[2px] sm:right-[3px] sm:h-9 sm:w-9"
              >
                <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} aria-hidden="true" />
              </Link>
            </div>

            <div className="min-w-0 flex-1 md:ml-[4px] md:mt-[3px]">
              <h1 className="font-display text-[24px] font-extrabold leading-8 text-white sm:text-[43px] sm:leading-[44px]">{name}</h1>
              <p className="mt-1 text-[14px] leading-5 text-[#a08a78] sm:text-[21px] sm:leading-7">
                Learner{joined && ` · Joined ${joined}`}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:mt-[14px] sm:gap-[12px] md:justify-start">
                <span className="rounded-full border border-[#c9a46b]/60 bg-[#e8a33d]/10 px-3 py-1 text-[13px] font-bold sm:px-[14px] sm:py-[4px] sm:text-base text-[#e8a33d]">
                  {xp.toLocaleString('en-NG')} XP
                </span>
                <span className="rounded-full border border-brand/50 bg-brand/10 px-3 py-1 text-[13px] font-bold sm:px-[14px] sm:py-[4px] sm:text-base text-[#e05a1b]">
                  {streak}-day Streak <span aria-hidden="true">🔥</span>
                </span>
                {best !== undefined && (
                  <span className="rounded-full border border-[#c9a46b]/60 bg-[#e8a33d]/10 px-3 py-1 text-[13px] font-bold sm:px-[14px] sm:py-[4px] sm:text-base text-[#e8a33d]">
                    Best streak: {best} {best === 1 ? 'day' : 'days'}
                  </span>
                )}
              </div>
            </div>

            <Link
              href="/settings"
              className="flex h-10 w-full max-w-[220px] shrink-0 items-center justify-center rounded-xl border-2 border-white/70 font-body text-[15px] font-semibold text-white transition-colors hover:bg-white/10 sm:h-[57px] sm:w-[169px] sm:text-[20px] md:mt-[77px]"
            >
              Edit Profile
            </Link>
          </div>
        </section>
      </div>

      <div className="mx-auto max-w-[1234px] px-4 pb-10 sm:px-6 sm:pb-[60px] lg:px-[74px]">
        <section className="mt-5 grid grid-cols-2 gap-3 sm:mt-[44px] sm:gap-[26px] lg:grid-cols-4" aria-label="Your numbers">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3 rounded-2xl border-2 border-[#efe2d0] bg-[#fffdf9] px-3.5 py-3.5 sm:block sm:px-[30px] sm:pb-[26px] sm:pt-[28px]">
              <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-[56px] sm:w-[56px]', s.tint)}>
                <s.icon className="h-5 w-5 sm:h-[24px] sm:w-[24px]" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-[20px] font-bold leading-6 text-[#1c0e04] sm:mt-[18px] sm:text-[32px] sm:leading-9">{s.value}</p>
                <p className="text-[12px] leading-4 text-[#7a6655] sm:mt-[2px] sm:text-[19px] sm:leading-normal">{s.label}</p>
              </div>
            </div>
          ))}
        </section>

        <div className="mt-8 grid gap-8 sm:mt-[46px] sm:gap-[38px] lg:grid-cols-[699px_1fr]">
          <section id="my-courses" className="scroll-mt-28" aria-labelledby="my-courses-title">
            <h2 id="my-courses-title" className="font-display text-[20px] font-extrabold leading-7 text-[#1c0e04] sm:text-[25px] sm:leading-8">
              My Courses
            </h2>
            <div className="mt-3 flex flex-col items-center rounded-2xl border-2 border-dashed border-[#efe2d0] bg-[#fffdf9] px-5 py-8 text-center sm:mt-[27px] sm:px-6 sm:py-12">
              <BookOpen className="h-7 w-7 text-brand sm:h-8 sm:w-8" strokeWidth={1.7} aria-hidden="true" />
              <p className="mt-3 font-display text-[17px] font-bold text-[#1c0e04] sm:text-[21px]">No courses yet</p>
              <p className="mt-1 max-w-sm text-[14px] text-[#7a6655] sm:text-[17px]">Courses you enrol in will show up here with your progress.</p>
              <Link href="/courses" className="mt-3 text-[14px] font-semibold text-brand hover:text-brand-light sm:mt-4 sm:text-[17px]">
                Explore the catalogue →
              </Link>
            </div>
          </section>

          <section aria-labelledby="recent-badges-title">
            <h2 id="recent-badges-title" className="font-display text-[20px] font-extrabold leading-7 text-[#1c0e04] sm:text-[25px] sm:leading-8">
              Recent Badges
            </h2>
            <div className="mt-3 rounded-2xl border-2 border-[#efe2d0] bg-[#fffdf9] p-5 sm:mt-[27px] sm:p-[30px]">
              <div className="flex items-center gap-4 text-left">
                <Medal className="h-7 w-7 shrink-0 text-[#d4920a] sm:h-9 sm:w-9" strokeWidth={1.6} aria-hidden="true" />
                <p className="text-[14px] text-[#7a6655] sm:text-[17px]">No badges yet. Keep learning to earn your first one.</p>
              </div>
              <Link
                href="/dashboard/achievements"
                className="mt-4 flex h-11 w-full items-center justify-center gap-1 rounded-xl bg-brand-gradient text-[15px] font-semibold sm:mt-[22px] sm:max-w-[286px] sm:text-[17px] text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90"
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
