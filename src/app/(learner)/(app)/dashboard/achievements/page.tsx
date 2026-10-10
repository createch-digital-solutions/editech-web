import type { Metadata } from 'next';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { DiamondMotif } from '@/components/landing/diamond-motif';
import { SAMPLE_BADGES, SAMPLE_CERTIFICATE, SAMPLE_LEARNER, type Badge } from '@/lib/learner-data';

export const metadata: Metadata = { title: 'Achievements & XP — Createch Elevate' };

const badgeTone: Record<NonNullable<Badge['tone']>, { card: string; title: string }> = {
  gold: { card: 'border-[#f1dcb2] bg-[#fcf3e3]', title: 'text-[#d4920a]' },
  orange: { card: 'border-[#f2cdb5] bg-[#fbeee4]', title: 'text-brand' },
  navy: { card: 'border-[#d8d3d6] bg-[#f4eeeb]', title: 'text-[#1b2b6b]' },
  green: { card: 'border-[#d9dfc8] bg-[#f2f0e2]', title: 'text-[#0d5c3a]' },
  amber: { card: 'border-[#f1dcb2] bg-[#fcf3e3]', title: 'text-[#d4920a]' },
  forest: { card: 'border-[#d9dfc8] bg-[#f2f0e2]', title: 'text-[#0d5c3a]' },
};

function StatCard({ emoji, value, valueClass, label, note, href }: { emoji: string; value: string; valueClass: string; label: string; note: string; href?: string }) {
  const className = cn('flex flex-col items-center rounded-2xl border border-[#e8d5bb] bg-[#fffdf9] px-4 pb-[38px] pt-[52px] text-center shadow-sm', href && 'transition-shadow hover:shadow-md');
  const content = (
    <>
      <span className="text-[52px] leading-[60px]" aria-hidden="true">
        {emoji}
      </span>
      <p className={cn('mt-[26px] font-display text-[40px] font-extrabold leading-[44px]', valueClass)}>{value}</p>
      <p className="mt-[9px] text-[19px] font-semibold leading-6 text-[#3d2b1f]">{label}</p>
      <p className="mt-[3px] text-base leading-6 text-[#a89282]">{note}</p>
    </>
  );
  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

/** /dashboard/achievements — level and XP, streak, badges and certificates, and every badge (earned and locked). */
export default function AchievementsPage() {
  const l = SAMPLE_LEARNER;
  return (
    <main className="mx-auto w-full max-w-[1234px] flex-1 px-4 pb-[44px] pt-8 sm:px-6 lg:px-[49px] lg:pt-[43px]">
      <section className="grid gap-[33px] min-[768px]:grid-cols-2 min-[1100px]:grid-cols-[401px_repeat(3,minmax(0,1fr))]" aria-label="Your progress">
        <div className="relative overflow-hidden rounded-[28px] bg-brand-night px-[43px] pb-[34px] pt-[41px] text-white shadow-md min-[768px]:col-span-2 min-[1100px]:col-span-1">
          <DiamondMotif className="left-[10px] top-[10px] h-[80px] w-[80px]" />
          <p className="font-body text-[17px] font-bold uppercase tracking-[0.12em] text-[#e8a33d]">
            Level {l.level} · {l.levelName}
          </p>
          <p className="mt-[18px] font-display text-[50px] font-extrabold leading-[56px]">{l.xp.toLocaleString('en-NG')} XP</p>
          <p className="mt-[16px] text-[19px] text-white/35">
            {l.xpToNextLevel} XP to Level {l.level + 1}
          </p>
          <div
            className="mt-[26px] -mr-[43px] h-[13px] rounded-l-full bg-white/10"
            role="progressbar"
            aria-valuenow={l.levelProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progress to level ${l.level + 1}`}
          >
            {/* The design runs the bar off the card's right edge. */}
            <div className="h-full rounded-l-full bg-[linear-gradient(90deg,#c1440e,#d4920a)]" style={{ width: '100%' }} />
          </div>
          <p className="mt-[15px] text-[17px] text-white/10">{l.levelProgress}% to next level</p>
        </div>

        <StatCard emoji="🔥" value={String(l.streak)} valueClass="text-brand" label="Day Streak" note={`Best: ${l.bestStreak} days`} />
        <StatCard emoji="🏅" value={String(l.badgesEarned)} valueClass="text-[#d4920a]" label="Badges Earned" note={`${l.badgesThisMonth} this month`} />
        <StatCard emoji="🎓" value={String(l.certificates)} valueClass="text-[#0d5c3a]" label="Certificates" note="Verified on chain" href={`/certificates/${SAMPLE_CERTIFICATE.id}`} />
      </section>

      <section className="mt-[48px]" aria-labelledby="badges-title">
        <h1 id="badges-title" className="font-display text-[26px] font-extrabold leading-8 text-[#1c0e04]">
          Your Badges
        </h1>
        <ul className="mt-[27px] grid grid-cols-2 gap-x-[22px] gap-y-[23px] min-[640px]:grid-cols-3 min-[1100px]:grid-cols-6">
          {SAMPLE_BADGES.map((b) => {
            const tone = b.earned && b.tone ? badgeTone[b.tone] : null;
            return (
              <li
                key={b.name}
                className={cn(
                  'flex h-[205px] flex-col items-center rounded-2xl border px-3 pt-[33px] text-center',
                  tone ? tone.card : 'border-[#f3e9dc] bg-[#fffdf9] opacity-40'
                )}
              >
                <span className="text-[42px] leading-[48px]" aria-hidden="true">
                  {b.emoji}
                </span>
                <p className={cn('mt-[12px] font-body text-[19px] font-bold leading-6', tone ? tone.title : 'text-[#7a6655]')}>{b.name}</p>
                <p className="mt-[5px] max-w-[120px] text-base leading-[23px] text-[#a89282]">{b.description}</p>
                {!b.earned && <span className="sr-only">Not earned yet</span>}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
