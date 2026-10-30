'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { card, primaryButton, RevenueChart, StatCard, td, th } from '@/components/instructor/studio-parts';
import {
  courseTotals,
  INSTRUCTOR_SHARE,
  monthlyGross,
  naira,
  percentChange,
  processing,
  STUDIO_COURSES,
  sum,
  totalEarned,
  underReview,
} from '@/lib/instructor-data';

const PERIODS = [
  { months: 1, label: 'This Month' },
  { months: 3, label: '3 Months' },
  { months: 12, label: 'All Time' },
] as const;

/** /portal/revenue — earnings for a chosen period: totals, monthly chart, 70/30 split and a per-course breakdown. */
export default function RevenuePage() {
  const [months, setMonths] = useState<(typeof PERIODS)[number]['months']>(1);

  const monthlyShare = monthlyGross.map((g) => g * INSTRUCTOR_SHARE);
  const thisMonth = monthlyShare.at(-1) ?? 0;
  const lastMonth = monthlyShare.at(-2) ?? 0;
  const periodGross = sum(monthlyGross.slice(-months));
  const rows = STUDIO_COURSES.filter((c) => c.status === 'Live').map((c) => ({ course: c, ...courseTotals(c, months) }));
  const sharePercent = Math.round(INSTRUCTOR_SHARE * 100);

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-12 pt-7 sm:px-6 lg:px-10 lg:pt-9">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[26px] font-extrabold text-[#1c0e04]">Revenue</h1>
        <div role="group" aria-label="Period" className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.months}
              type="button"
              onClick={() => setMonths(p.months)}
              aria-pressed={months === p.months}
              className={cn(
                'h-10 cursor-pointer rounded-xl border px-4 font-body text-[14px] transition-colors',
                months === p.months ? 'border-[#0d5c3a] bg-[#eefaf3] font-semibold text-[#0d5c3a]' : 'border-[#e8d5bb] bg-[#fffdf9] text-[#7a6655] hover:text-[#0d5c3a]'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <section className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 min-[1000px]:grid-cols-3" aria-label="Totals">
        <StatCard
          icon={<DollarSign className="h-5 w-5 text-[#0d5c3a]" strokeWidth={1.9} />}
          tint="bg-[#e6f0ea]"
          label="Total Earnings"
          value={naira(totalEarned)}
          trend={percentChange(totalEarned, totalEarned - thisMonth)}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-brand" strokeWidth={1.9} />}
          tint="bg-[#fbebe2]"
          label="This Month"
          value={naira(thisMonth)}
          trend={percentChange(thisMonth, lastMonth)}
        />
        <StatCard icon={<Wallet className="h-5 w-5 text-[#d4920a]" strokeWidth={1.9} />} tint="bg-[#fbf3e0]" label="Pending Payout" value={naira(underReview + processing)} />
      </section>

      <div className="mt-6 grid gap-6 min-[1000px]:grid-cols-[minmax(0,1fr)_340px]">
        <section className={cn(card, 'p-6')} aria-labelledby="monthly-title">
          <h2 id="monthly-title" className="font-display text-[19px] font-bold text-[#1c0e04]">
            Monthly Earnings · last 12 months
          </h2>
          <RevenueChart values={monthlyShare} highlight={months} className="mt-8" />
        </section>

        <section className={cn(card, 'flex flex-col p-6')} aria-labelledby="split-title">
          <h2 id="split-title" className="font-display text-[19px] font-bold text-[#1c0e04]">
            Revenue Split
          </h2>
          <div
            className="relative mx-auto mt-6 h-[132px] w-[132px] rounded-full"
            style={{ background: `conic-gradient(#0d5c3a 0 ${sharePercent}%, #fbe0d0 ${sharePercent}% 100%)` }}
            role="img"
            aria-label={`You keep ${sharePercent}%, the platform fee is ${100 - sharePercent}%`}
          >
            <span className="absolute inset-[18px] flex items-center justify-center rounded-full bg-[#fffdf9] font-display text-[22px] font-bold text-[#0d5c3a]">
              {sharePercent}%
            </span>
          </div>
          <dl className="mt-6 divide-y divide-[#efe2d0] border-y border-[#efe2d0] font-body text-[14px]">
            <div className="flex items-center justify-between py-3">
              <dt className="text-[#3d2b1f]">Your share ({sharePercent}%)</dt>
              <dd className="font-bold text-[#0d5c3a]">{naira(periodGross * INSTRUCTOR_SHARE)}</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-[#3d2b1f]">Platform fee ({100 - sharePercent}%)</dt>
              <dd className="font-bold text-[#7a6655]">{naira(periodGross * (1 - INSTRUCTOR_SHARE))}</dd>
            </div>
          </dl>
          <Link href="/portal/payouts/withdraw" className={cn(primaryButton, 'mt-6 w-full')}>
            Request Payout
          </Link>
        </section>
      </div>

      <section className={cn(card, 'mt-6 overflow-hidden')} aria-label="Earnings by course">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="border-b border-[#efe2d0] bg-[#fdf6ec]">
              <tr>
                <th scope="col" className={th}>Course</th>
                <th scope="col" className={th}>Students</th>
                <th scope="col" className={th}>Gross</th>
                <th scope="col" className={th}>Your share</th>
                <th scope="col" className={th}>Avg / student</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efe2d0]">
              {rows.map((r) => (
                <tr key={r.course.slug}>
                  <th scope="row" className={cn(td, 'text-left font-semibold text-[#1c0e04]')}>{r.course.title}</th>
                  <td className={cn(td, 'text-[#3d2b1f]')}>{r.students.toLocaleString('en-NG')}</td>
                  <td className={cn(td, 'text-[#3d2b1f]')}>{naira(r.gross)}</td>
                  <td className={cn(td, 'font-semibold text-[#0d5c3a]')}>{naira(r.share)}</td>
                  <td className={cn(td, 'text-[#3d2b1f]')}>{r.students ? naira(r.gross / r.students) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
