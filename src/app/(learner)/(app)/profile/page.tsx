'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { ArrowRight, Award, BookOpen, Flame, Pencil, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DiamondMotif } from '@/components/landing/diamond-motif';
import { LearnerAvatar } from '@/components/learner/app-header';
import { SAMPLE_BADGES, SAMPLE_IN_PROGRESS, SAMPLE_LEARNER } from '@/lib/learner-data';

const barTone = {
  orange: 'bg-[linear-gradient(90deg,#c1440e,#d4920a)]',
  green: 'bg-[#0d5c3a]',
  navy: 'bg-[#1e2a78]',
};

const stats = [
  { label: 'Courses Enrolled', icon: BookOpen, tint: 'bg-[#fbebe2] text-brand' },
  { label: 'Certificates', icon: Award, tint: 'bg-[#fbf3e0] text-[#d4920a]' },
  { label: 'Day Streak', icon: Flame, tint: 'bg-[#fbebe2] text-brand' },
  { label: 'Global Rank', icon: Trophy, tint: 'bg-[#ecedf3] text-[#1b2b6b]' },
];

/** /profile — who the learner is, their level, courses in progress and latest badges. */
export default function ProfilePage() {
  const { user } = useUser();
  const l = SAMPLE_LEARNER;
  const name = user?.fullName || `${l.firstName} ${l.lastName}`;
  const joined = (user?.createdAt ?? new Date('2026-01-15')).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const recent = SAMPLE_BADGES.filter((b) => b.earned).slice(0, 6);

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
              {l.tier} · Joined {joined} · {l.location} <span aria-label="Nigeria">🇳🇬</span>
            </p>
            <div className="mt-[14px] flex flex-wrap gap-[12px]">
              <span className="rounded-full border border-[#c9a46b]/60 bg-[#e8a33d]/10 px-[14px] py-[4px] text-base font-bold text-[#e8a33d]">
                Level {l.level} · {l.levelName}
              </span>
              <span className="rounded-full border border-[#c9a46b]/60 bg-[#e8a33d]/10 px-[14px] py-[4px] text-base font-bold text-[#e8a33d]">
                {l.xp.toLocaleString('en-NG')} XP
              </span>
              <span className="rounded-full border border-brand/50 bg-brand/10 px-[14px] py-[4px] text-base font-bold text-[#e05a1b]">
                {l.streak}-day Streak <span aria-hidden="true">🔥</span>
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
            <ul className="mt-[27px] space-y-5">
              {SAMPLE_IN_PROGRESS.map((c) => (
                <li key={c.slug} className="relative flex h-[135px] overflow-hidden rounded-2xl border-2 border-[#efe2d0] bg-[#fffdf9]">
                  <Image src={c.image} alt="" width={244} height={270} unoptimized className="h-full w-[122px] shrink-0 object-cover" />
                  <div className="flex min-w-0 flex-1 flex-col justify-center pl-[22px] pr-[22px]">
                    <h3 className="font-display text-[21px] font-bold leading-7 text-[#1c0e04]">
                      <Link href={`/learn/${c.slug}`} className="after:absolute after:inset-0">
                        {c.title}
                      </Link>
                    </h3>
                    <div
                      className="mt-[12px] h-2 rounded-full bg-[#f3e6d6]"
                      role="progressbar"
                      aria-valuenow={c.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${c.title} progress`}
                    >
                      <div className={cn('h-full rounded-full', barTone[c.tone])} style={{ width: `${c.progress}%` }} />
                    </div>
                    <p className="mt-[14px] text-[19px] text-[#7a6655]">{c.progress}% complete</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="recent-badges-title">
            <h2 id="recent-badges-title" className="font-display text-[25px] font-extrabold leading-8 text-[#1c0e04]">
              Recent Badges
            </h2>
            <div className="mt-[27px] rounded-2xl border-2 border-[#efe2d0] bg-[#fffdf9] px-[30px] pb-[30px] pt-[30px]">
              <ul className="grid grid-cols-3 justify-items-start gap-x-[19px] gap-y-[20px] sm:w-fit">
                {recent.map((b) => (
                  <li
                    key={b.name}
                    title={`${b.name} — ${b.description}`}
                    className="flex h-[73px] w-[73px] items-center justify-center rounded-full border-2 border-[#efd9bd] bg-[#fdf6ec] text-[34px]"
                  >
                    <span aria-hidden="true">{b.emoji}</span>
                    <span className="sr-only">
                      {b.name}: {b.description}
                    </span>
                  </li>
                ))}
              </ul>
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
