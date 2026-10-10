'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { ArrowRight, Flame, Play, Sparkles, Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CourseCard } from '@/components/learner/course-card';
import { LearnerSidebar } from '@/components/learner/learner-sidebar';
import { SAMPLE_IN_PROGRESS, SAMPLE_LEARNER, SAMPLE_RECOMMENDED } from '@/lib/learner-data';

const progressTone = {
  orange: { bar: 'bg-[linear-gradient(90deg,#c1440e,#d4920a)]', text: 'text-brand' },
  green: { bar: 'bg-[#0d5c3a]', text: 'text-[#0d5c3a]' },
  navy: { bar: 'bg-[#1e2a78]', text: 'text-[#1e2a78]' },
};

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

/** /dashboard — the learner's home: greeting, streak / XP / rank, courses in progress and recommendations. */
export default function LearnerDashboardPage() {
  const { user } = useUser();
  const firstName = user?.firstName || SAMPLE_LEARNER.firstName;
  const l = SAMPLE_LEARNER;
  const resume = SAMPLE_IN_PROGRESS[0];

  return (
    <div className="flex flex-1">
      <LearnerSidebar />

      <main className="min-w-0 flex-1 px-4 pb-12 pt-6 sm:px-6 lg:pb-[30px] lg:pl-[19px] lg:pr-[48px] lg:pt-[31px]">
        <section className="grid gap-[23px] min-[640px]:grid-cols-2 min-[1180px]:grid-cols-[257px_repeat(3,minmax(0,1fr))]" aria-label="Your progress">
          <div className="relative overflow-hidden rounded-2xl bg-[#1a0e05] px-[31px] pb-6 pt-[31px] text-white shadow-sm min-[640px]:col-span-2 min-[1180px]:col-span-1">
            <Image src="/learner/course-uiux.jpg" alt="" fill unoptimized className="object-cover" priority />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(26,14,5,0.95)_0%,rgba(26,14,5,0.82)_42%,rgba(26,14,5,0.25)_100%)]" />
            <div className="relative">
              <h1 className="font-display text-[20px] font-bold leading-[33px]">
                {greeting(new Date().getHours())},
                <br />
                {firstName} <span aria-hidden="true">👋</span>
              </h1>
              <p className="mt-[9px] max-w-[170px] text-[13px] leading-[21px] text-white/45">
                You have {l.lessonsDueToday} lessons due today. Aria is ready!
              </p>
              <Link
                href={`/learn/${resume.slug}`}
                className="mt-[22px] inline-flex h-[31px] items-center gap-1 rounded-md bg-brand-gradient px-[15px] text-[12px] font-semibold text-white shadow-md shadow-brand/40 transition-opacity hover:opacity-90"
              >
                Continue Learning
                <ArrowRight className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <StatCard
            icon={<Flame className="h-[18px] w-[18px] text-brand" strokeWidth={2} />}
            tint="bg-[#fbebe2]"
            value={String(l.streak)}
            label="Day Streak"
            note={`Personal best: ${l.bestStreak}`}
          />
          <StatCard
            icon={<Zap className="h-[18px] w-[18px] text-[#d4920a]" strokeWidth={2} />}
            tint="bg-[#fbf3e0]"
            value={l.xp.toLocaleString('en-NG')}
            label={`XP · Level ${l.level}`}
            note={`${l.xpToNextLevel} to Level ${l.level + 1}`}
          />
          <StatCard
            icon={<Trophy className="h-[18px] w-[18px] text-[#1b2b6b]" strokeWidth={2} />}
            tint="bg-[#ecedf3]"
            value={`#${l.rank}`}
            label="Rank"
            note="Top 1% this week"
          />
        </section>

        <section id="continue-learning" className="mt-[34px] scroll-mt-28" aria-labelledby="continue-title">
          <div className="flex items-center justify-between">
            <h2 id="continue-title" className="font-display text-[19px] font-bold text-[#1c0e04]">
              Continue Learning
            </h2>
            <Link href="/profile#my-courses" className="flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-light">
              View all <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-[18px] grid gap-[19px] md:grid-cols-3">
            {SAMPLE_IN_PROGRESS.map((c) => {
              const tone = progressTone[c.tone];
              return (
                <article key={c.slug} className="relative flex h-[139px] overflow-hidden rounded-2xl border border-[#e8d5bb] bg-[#fffdf9] shadow-sm">
                  <Image src={c.image} alt="" width={196} height={278} unoptimized className="h-full w-[98px] shrink-0 object-cover" />
                  <div className="flex min-w-0 flex-1 items-center gap-2 px-[15px]">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-[13px] font-bold leading-[21px] text-[#1c0e04]">
                        <Link href={`/learn/${c.slug}`} className="after:absolute after:inset-0">
                          {c.title}
                        </Link>
                      </h3>
                      <p className="mt-[3px] text-[12px] leading-[18px] text-[#7a6655]">{c.currentLesson}</p>
                      <p className="mt-[2px] text-[11px] leading-4 text-[#7a6655]">
                        Progress <span className={cn('font-bold', tone.text)}>{c.progress}%</span>
                      </p>
                      <div className="mt-[9px] h-[5px] w-[70px] overflow-hidden rounded-full bg-[#f3e6d6]" role="progressbar" aria-valuenow={c.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${c.title} progress`}>
                        <div className={cn('h-full rounded-full', tone.bar)} style={{ width: `${c.progress}%` }} />
                      </div>
                    </div>
                    <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white shadow-md shadow-brand/30" aria-hidden="true">
                      <Play className="ml-0.5 h-3.5 w-3.5 fill-white" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-[37px]" aria-labelledby="recommended-title">
          <h2 id="recommended-title" className="font-display text-[19px] font-bold leading-6 text-[#1c0e04]">
            Recommended for You
          </h2>
          <Sparkles className="mt-1 h-4 w-4 text-[#d4920a]" aria-hidden="true" />
          <div className="mt-[9px] grid gap-[19px] min-[640px]:grid-cols-2 min-[1180px]:-mr-3 min-[1180px]:grid-cols-4 min-[1180px]:pl-[13px]">
            {SAMPLE_RECOMMENDED.map((c) => (
              <CourseCard key={c.id} course={c} size="sm" />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
