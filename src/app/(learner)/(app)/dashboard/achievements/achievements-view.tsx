'use client';

import { Medal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DiamondMotif } from '@/components/landing/diamond-motif';
import { useCurrentUser } from '@/hooks/auth/use-current-user';
import { bestStreakOf } from '@/types/user';

function StatCard({ emoji, value, valueClass, label, short = label, note }: { emoji: string; value: string; valueClass: string; label: string; short?: string; note: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center rounded-2xl border border-[#e8d5bb] bg-[#fffdf9] px-2 pb-4 pt-4 text-center shadow-sm sm:px-4 sm:pb-[38px] sm:pt-[52px]">
      <span className="text-[28px] leading-8 sm:text-[52px] sm:leading-[60px]" aria-hidden="true">
        {emoji}
      </span>
      <p className={cn('mt-2 font-display text-[22px] font-extrabold leading-7 sm:mt-[26px] sm:text-[40px] sm:leading-[44px]', valueClass)}>{value}</p>
      <p className="mt-0.5 w-full truncate text-[12px] font-semibold leading-4 text-[#3d2b1f] sm:mt-[9px] sm:text-[19px] sm:leading-6">
        <span className="sm:hidden">{short}</span>
        <span className="hidden sm:inline">{label}</span>
      </p>
      {/* Three cards share a phone's width, so the note waits for a wider screen. */}
      <p className="mt-[3px] hidden text-base leading-6 text-[#a89282] sm:block">{note}</p>
    </div>
  );
}

/**
 * XP, day streak and best streak from the learner profile (GET /auth/me). On phones the sizes match the
 * dashboard's: a compact XP card with the three stats side by side under it.
 * TODO: Show levels, badges and certificates once the gamification and certificates modules have endpoints.
 */
export function AchievementsView() {
  const { user } = useCurrentUser();
  const xp = user?.learnerProfile?.xpTotal ?? 0;
  const streak = user?.learnerProfile?.streakDays ?? 0;
  const best = bestStreakOf(user);

  return (
    <main className="learner-compact mx-auto w-full max-w-[1234px] flex-1 px-4 pb-[44px] pt-6 sm:px-6 sm:pt-8 lg:px-[49px] lg:pt-[43px]">
      <section className="grid grid-cols-3 gap-3 sm:gap-[33px] min-[1100px]:grid-cols-[401px_repeat(3,minmax(0,1fr))]" aria-label="Your progress">
        <div className="relative col-span-3 overflow-hidden rounded-2xl bg-brand-night px-6 pb-6 pt-6 text-white shadow-md sm:rounded-[28px] sm:px-[43px] sm:pb-[34px] sm:pt-[41px] min-[1100px]:col-span-1">
          <DiamondMotif className="left-[10px] top-[10px] h-[56px] w-[56px] sm:h-[80px] sm:w-[80px]" />
          <p className="font-body text-[13px] font-bold uppercase tracking-[0.12em] text-[#e8a33d] sm:text-[17px]">Total XP</p>
          <p className="mt-2 font-display text-[32px] font-extrabold leading-10 sm:mt-[18px] sm:text-[50px] sm:leading-[56px]">{xp.toLocaleString('en-NG')} XP</p>
          <p className="mt-2 text-[14px] text-white/50 sm:mt-[16px] sm:text-[19px]">Earn XP by finishing lessons and quizzes.</p>
        </div>

        <StatCard emoji="🔥" value={String(streak)} valueClass="text-brand" label="Day Streak" note={best !== undefined ? `Best: ${best} ${best === 1 ? 'day' : 'days'}` : streak ? 'Keep it going' : 'Learn today to start one'} />
        <StatCard emoji="🏅" value="0" valueClass="text-[#d4920a]" label="Badges Earned" short="Badges" note="None yet" />
        <StatCard emoji="🎓" value="0" valueClass="text-[#0d5c3a]" label="Certificates" note="Finish a course to earn one" />
      </section>

      <section className="mt-8 sm:mt-[48px]" aria-labelledby="badges-title">
        <h1 id="badges-title" className="type-section-title text-[#1c0e04]">
          Your Badges
        </h1>
        <div className="mt-4 flex flex-col items-center rounded-2xl border-2 border-dashed border-[#e8d5bb] bg-[#fffdf9] px-6 py-9 text-center sm:mt-[27px] sm:py-14">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fbf3e0] text-[#d4920a] sm:h-16 sm:w-16" aria-hidden="true">
            <Medal className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={1.7} />
          </span>
          <p className="mt-3 font-display text-[18px] font-bold text-[#1c0e04] sm:mt-4 sm:text-[22px]">No badges yet</p>
          <p className="mt-1.5 max-w-md text-[14px] leading-[22px] text-[#7a6655] sm:mt-2 sm:text-[17px] sm:leading-normal">Badges you earn for streaks, quizzes and finished courses will appear here.</p>
        </div>
      </section>
    </main>
  );
}
