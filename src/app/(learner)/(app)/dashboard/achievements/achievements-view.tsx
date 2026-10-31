'use client';

import { Medal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DiamondMotif } from '@/components/landing/diamond-motif';
import { useCurrentUser } from '@/hooks/auth/use-current-user';

function StatCard({ emoji, value, valueClass, label, note }: { emoji: string; value: string; valueClass: string; label: string; note: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-[#e8d5bb] bg-[#fffdf9] px-4 pb-[38px] pt-[52px] text-center shadow-sm">
      <span className="text-[52px] leading-[60px]" aria-hidden="true">
        {emoji}
      </span>
      <p className={cn('mt-[26px] font-display text-[40px] font-extrabold leading-[44px]', valueClass)}>{value}</p>
      <p className="mt-[9px] text-[19px] font-semibold leading-6 text-[#3d2b1f]">{label}</p>
      <p className="mt-[3px] text-base leading-6 text-[#a89282]">{note}</p>
    </div>
  );
}

/**
 * XP and day streak from the learner profile (GET /auth/me).
 * TODO: Show levels, badges and certificates once the gamification and certificates modules have endpoints.
 */
export function AchievementsView() {
  const { user } = useCurrentUser();
  const xp = user?.learnerProfile?.xpTotal ?? 0;
  const streak = user?.learnerProfile?.streakDays ?? 0;

  return (
    <main className="learner-compact mx-auto w-full max-w-[1234px] flex-1 px-4 pb-[44px] pt-8 sm:px-6 lg:px-[49px] lg:pt-[43px]">
      <section className="grid gap-[33px] min-[768px]:grid-cols-2 min-[1100px]:grid-cols-[401px_repeat(3,minmax(0,1fr))]" aria-label="Your progress">
        <div className="relative overflow-hidden rounded-[28px] bg-brand-night px-[43px] pb-[34px] pt-[41px] text-white shadow-md min-[768px]:col-span-2 min-[1100px]:col-span-1">
          <DiamondMotif className="left-[10px] top-[10px] h-[80px] w-[80px]" />
          <p className="font-body text-[17px] font-bold uppercase tracking-[0.12em] text-[#e8a33d]">Total XP</p>
          <p className="mt-[18px] font-display text-[50px] font-extrabold leading-[56px]">{xp.toLocaleString('en-NG')} XP</p>
          <p className="mt-[16px] text-[19px] text-white/50">Earn XP by finishing lessons and quizzes.</p>
        </div>

        <StatCard emoji="🔥" value={String(streak)} valueClass="text-brand" label="Day Streak" note={streak ? 'Keep it going' : 'Learn today to start one'} />
        <StatCard emoji="🏅" value="0" valueClass="text-[#d4920a]" label="Badges Earned" note="None yet" />
        <StatCard emoji="🎓" value="0" valueClass="text-[#0d5c3a]" label="Certificates" note="Finish a course to earn one" />
      </section>

      <section className="mt-[48px]" aria-labelledby="badges-title">
        <h1 id="badges-title" className="font-display text-[26px] font-extrabold leading-8 text-[#1c0e04]">
          Your Badges
        </h1>
        <div className="mt-[27px] flex flex-col items-center rounded-2xl border-2 border-dashed border-[#e8d5bb] bg-[#fffdf9] px-6 py-14 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fbf3e0] text-[#d4920a]" aria-hidden="true">
            <Medal className="h-8 w-8" strokeWidth={1.7} />
          </span>
          <p className="mt-4 font-display text-[22px] font-bold text-[#1c0e04]">No badges yet</p>
          <p className="mt-2 max-w-md text-[17px] text-[#7a6655]">Badges you earn for streaks, quizzes and finished courses will appear here.</p>
        </div>
      </section>
    </main>
  );
}
