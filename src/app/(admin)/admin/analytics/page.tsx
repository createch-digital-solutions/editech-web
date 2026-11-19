'use client';

import { useState } from 'react';
import { ArrowUpRight, BarChart3, Clock, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { card } from '@/components/instructor/studio-parts';
import { BarChart, chip, Meter, SampleDataNote } from '@/components/admin/admin-parts';
import { ANALYTICS, DEVICES, RANGES, TRAFFIC_SOURCES, type Range } from '@/lib/admin-data';

/** Like the studio's stat card, with the change written as text ("+2m", "+0.3%") rather than a whole percentage. */
function AnalyticsCard({ icon, tint, label, value, change }: { icon: React.ReactNode; tint: string; label: string; value: string; change: string }) {
  return (
    <div className={cn(card, 'min-w-0 px-4 pb-4 pt-4 sm:px-5 sm:pt-5')}>
      <div className="flex items-start justify-between gap-2">
        <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', tint)}>{icon}</span>
        <span className="flex items-center gap-0.5 font-body text-[13px] font-semibold text-[#0d5c3a]">
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" />
          {change}
        </span>
      </div>
      <p className="mt-4 truncate font-display text-[19px] font-bold leading-7 text-[#1c0e04] sm:text-[22px]">{value}</p>
      <p className="mt-0.5 font-body text-[13px] text-[#7a6655]">{label}</p>
    </div>
  );
}

/** /admin/analytics — page views, users, session length and conversion for a chosen period, active users, devices and traffic sources. */
export default function PlatformAnalyticsPage() {
  const [range, setRange] = useState<Range>('30 days');
  const a = ANALYTICS[range];

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-12 pt-7 sm:px-6 lg:px-10 lg:pt-9">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="type-page-title text-[#1c0e04]">Platform Analytics</h1>
          <SampleDataNote />
        </div>
        <div role="group" aria-label="Period" className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
          {RANGES.map((r) => (
            <button key={r} type="button" onClick={() => setRange(r)} aria-pressed={range === r} className={cn(chip(range === r), 'h-10 rounded-xl px-5')}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <section className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 min-[1100px]:grid-cols-4" aria-label={`Numbers for ${range}`}>
        <AnalyticsCard icon={<BarChart3 className="h-5 w-5 text-[#1e2a78]" strokeWidth={1.9} />} tint="bg-[#ecedf3]" label="Page Views" value={a.pageViews.toLocaleString('en-NG')} change={a.pageViewsTrend} />
        <AnalyticsCard icon={<Users className="h-5 w-5 text-brand" strokeWidth={1.9} />} tint="bg-[#fbebe2]" label="Unique Users" value={a.uniqueUsers.toLocaleString('en-NG')} change={a.usersTrend} />
        <AnalyticsCard icon={<Clock className="h-5 w-5 text-[#0d5c3a]" strokeWidth={1.9} />} tint="bg-[#e6f0ea]" label="Avg Session" value={a.avgSession} change={a.sessionTrend} />
        <AnalyticsCard icon={<TrendingUp className="h-5 w-5 text-[#d4920a]" strokeWidth={1.9} />} tint="bg-[#fbf3e0]" label="Conversion" value={a.conversion} change={a.conversionTrend} />
      </section>

      <div className="mt-7 grid gap-6 min-[1000px]:grid-cols-[minmax(0,1fr)_360px]">
        <section className={cn(card, 'p-6')} aria-labelledby="active-title">
          <h2 id="active-title" className="type-section-title text-[#1c0e04]">
            {a.chartTitle}
          </h2>
          <BarChart values={a.active} labels={a.labels} format={(n) => `${n.toLocaleString('en-NG')} users`} showLabels={a.labels.length <= 13} className="mt-8" />
        </section>

        <section className={cn(card, 'p-6')} aria-labelledby="devices-title">
          <h2 id="devices-title" className="type-section-title text-[#1c0e04]">
            Device Breakdown
          </h2>
          <div className="mt-5 space-y-4">
            {DEVICES.map((d) => (
              <Meter key={d.label} {...d} />
            ))}
          </div>

          <h3 className="mt-7 font-display text-[16px] font-bold text-[#1c0e04]">Traffic Sources</h3>
          <dl className="mt-3 space-y-2.5 font-body text-[15px]">
            {TRAFFIC_SOURCES.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <dt className="text-[#7a6655]">{s.label}</dt>
                <dd className="font-bold text-[#1c0e04]">{s.percent}%</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </main>
  );
}
