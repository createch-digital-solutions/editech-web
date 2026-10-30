import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { monthLabels, naira, type PayoutStatus, type StudioCourseStatus } from '@/lib/instructor-data';

export const card = 'rounded-2xl border border-[#e8d5bb] bg-[#fffdf9] shadow-sm';

/** Table header cells: small uppercase labels on the cream band. */
export const th = 'whitespace-nowrap px-5 py-3 text-left font-body text-[12px] font-semibold uppercase tracking-[0.08em] text-[#a08a78]';
export const td = 'whitespace-nowrap px-5 py-4 font-body text-[14px]';

export const primaryButton =
  'inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-brand-gradient px-5 font-body text-[14px] font-semibold text-white shadow-md shadow-brand/30 transition-opacity hover:opacity-90';

/** Icon tile, label and value, with an optional change against the previous period. */
export function StatCard({ icon, tint, label, value, trend }: { icon: React.ReactNode; tint: string; label: string; value: string; trend?: number | null }) {
  return (
    <div className={cn(card, 'min-w-0 px-4 pb-4 pt-4 sm:px-5 sm:pt-5')}>
      <div className="flex items-start justify-between gap-2">
        <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', tint)}>{icon}</span>
        {trend != null && (
          <span className={cn('flex items-center gap-0.5 font-body text-[13px] font-semibold', trend >= 0 ? 'text-[#0d5c3a]' : 'text-[#b42318]')}>
            <ArrowUpRight className={cn('h-3.5 w-3.5', trend < 0 && 'rotate-90')} strokeWidth={2.4} aria-hidden="true" />
            <span className="sr-only">{trend >= 0 ? 'Up' : 'Down'}</span>
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="mt-4 truncate font-display text-[19px] font-bold leading-7 text-[#1c0e04] sm:text-[22px]">{value}</p>
      <p className="mt-0.5 font-body text-[13px] text-[#7a6655]">{label}</p>
    </div>
  );
}

const pillStyles: Record<PayoutStatus | StudioCourseStatus | 'Available' | 'Under Review', string> = {
  Successful: 'border-[#0d5c3a]/20 bg-[#e6f0ea] text-[#0d5c3a]',
  Available: 'border-[#0d5c3a]/20 bg-[#e6f0ea] text-[#0d5c3a]',
  Live: 'border-[#0d5c3a]/20 bg-[#e6f0ea] text-[#0d5c3a]',
  Processing: 'border-[#d4920a]/25 bg-[#fdf5e1] text-[#a86f00]',
  Pending: 'border-[#d4920a]/25 bg-[#fdf5e1] text-[#a86f00]',
  'Under Review': 'border-[#d4920a]/25 bg-[#fdf5e1] text-[#a86f00]',
  Draft: 'border-[#d4920a]/25 bg-[#fdf5e1] text-[#a86f00]',
  Failed: 'border-[#b42318]/20 bg-[#fdecea] text-[#b42318]',
};

export function StatusPill({ status }: { status: keyof typeof pillStyles }) {
  return <span className={cn('inline-flex rounded-full border px-2.5 py-0.5 font-body text-[12px] font-bold', pillStyles[status])}>{status}</span>;
}

/**
 * Earnings per month for the last 12 months as bars. The last `highlight` months (the period in
 * view) are drawn in the brand gradient. Each bar shows its amount on hover or keyboard focus, and
 * names its month and amount for screen readers.
 */
export function RevenueChart({ values, highlight = 1, className }: { values: number[]; highlight?: number; className?: string }) {
  const max = Math.max(...values, 1);
  const labels = monthLabels();
  return (
    <figure className={className}>
      <div className="flex h-[200px] items-end gap-[3px] sm:gap-1.5" role="list" aria-label="Earnings per month">
        {values.map((v, i) => {
          const on = i >= values.length - highlight;
          return (
            <div key={i} role="listitem" className="group relative flex h-full flex-1 items-end outline-none" tabIndex={0} aria-label={`${labels[i].long}: ${naira(v)}`}>
              <div
                className={cn('w-full rounded-t-[4px] transition-opacity group-hover:opacity-80', on ? 'bg-[linear-gradient(180deg,#c1440e,#d4920a)]' : 'bg-[#d6e4da]')}
                style={{ height: `${Math.max((v / max) * 100, 2)}%` }}
              />
              <span aria-hidden="true" className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#1c0e04] px-2 py-1 font-body text-[12px] text-white shadow group-hover:block group-focus:block">
                {labels[i].long} · <strong>{naira(v)}</strong>
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2.5 flex gap-[3px] sm:gap-1.5" aria-hidden="true">
        {labels.map((l, i) => (
          <span key={i} className="flex-1 text-center font-body text-[12px] text-[#a08a78]">
            {l.short}
          </span>
        ))}
      </div>
    </figure>
  );
}
