import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminRole, AdminUserStatus } from '@/lib/admin-data';

/** Filter chips: navy when chosen, as in the admin designs (the studio uses green). */
export const chip = (on: boolean) =>
  cn(
    'h-9 shrink-0 cursor-pointer rounded-full px-4 font-body text-[14px] transition-colors',
    on ? 'bg-[#1e2a78] font-semibold text-white' : 'border border-[#e8d5bb] bg-[#fffdf9] text-[#3d2b1f] hover:border-[#1e2a78]/40'
  );

export const outlineButton =
  'inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-[#e8d5bb] bg-[#fffdf9] px-4 font-body text-[14px] font-semibold text-[#3d2b1f] transition-colors hover:border-[#1e2a78]/40';

const pills = {
  Learner: 'border-[#1e2a78]/20 bg-[#ecedf3] text-[#1e2a78]',
  Admin: 'border-[#1e2a78]/20 bg-[#ecedf3] text-[#1e2a78]',
  Instructor: 'border-brand/25 bg-[#fbebe2] text-brand',
  Active: 'border-[#0d5c3a]/20 bg-[#e6f0ea] text-[#0d5c3a]',
  Suspended: 'border-[#b42318]/20 bg-[#fdecea] text-[#b42318]',
  Pending: 'border-[#d4920a]/25 bg-[#fdf5e1] text-[#a86f00]',
  'Pending Review': 'border-[#d4920a]/25 bg-[#fdf5e1] text-[#a86f00]',
};

const pillText: Partial<Record<keyof typeof pills, string>> = { Pending: 'Awaiting Approval' };

export function Pill({ value }: { value: AdminRole | AdminUserStatus | 'Pending Review' }) {
  return <span className={cn('inline-flex whitespace-nowrap rounded-full border px-2.5 py-0.5 font-body text-[12px] font-bold', pills[value])}>{pillText[value] ?? value}</span>;
}

/** Bars for a series, the last one (now) in the brand gradient; each names its label and value for screen readers. */
export function BarChart({ values, labels, format = (n) => n.toLocaleString('en-NG'), showLabels = true, className }: { values: number[]; labels: string[]; format?: (n: number) => string; showLabels?: boolean; className?: string }) {
  const max = Math.max(...values, 1);
  return (
    <figure className={className}>
      <div className="flex h-[200px] items-end gap-[3px] sm:gap-1" role="list" aria-label="Chart">
        {values.map((v, i) => (
          <div key={i} role="listitem" tabIndex={0} aria-label={`${labels[i]}: ${format(v)}`} className="group relative flex h-full min-w-0 flex-1 items-end outline-none">
            <div
              className={cn('w-full rounded-t-[4px] transition-opacity group-hover:opacity-80', i === values.length - 1 ? 'bg-[linear-gradient(180deg,#c1440e,#d4920a)]' : 'bg-[#dcdde8]')}
              style={{ height: `${Math.max((v / max) * 100, 2)}%` }}
            />
            <span aria-hidden="true" className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#1c0e04] px-2 py-1 font-body text-[12px] text-white shadow group-hover:block group-focus:block">
              {labels[i]} · <strong>{format(v)}</strong>
            </span>
          </div>
        ))}
      </div>
      {showLabels && (
        <div className="mt-2.5 flex gap-[3px] sm:gap-1" aria-hidden="true">
          {labels.map((l, i) => (
            <span key={i} className="min-w-0 flex-1 truncate text-center font-body text-[12px] text-[#a08a78]">
              {l}
            </span>
          ))}
        </div>
      )}
    </figure>
  );
}

/** A labelled percentage with its bar (categories, devices). */
export function Meter({ label, percent, bar, text, track }: { label: string; percent: number; bar: string; text: string; track: string }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 font-body">
        <span className="text-[14px] text-[#3d2b1f] sm:text-[15px]">{label}</span>
        <span className={cn('text-[15px] font-bold', text)}>{percent}%</span>
      </div>
      <div className={cn('mt-1.5 h-2 rounded-full', track)} role="meter" aria-label={label} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className={cn('h-full rounded-full', bar)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

/** Says plainly that nothing on the admin pages is saved yet. */
export function SampleDataNote() {
  return (
    <p className="mt-2 flex items-start gap-1.5 font-body text-[13px] text-[#a08a78]">
      <Info className="mt-px h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
      Sample data: the admin API isn&apos;t ready yet, so changes here aren&apos;t saved.
    </p>
  );
}
