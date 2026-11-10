'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CircleCheck, CircleX, Clock, DollarSign, Download, Eye, ReceiptText, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { card, primaryButton, StatCard, StatusPill, td, th } from '@/components/instructor/studio-parts';
import { formatDate, naira, paidOut, PAYOUTS, type Payout, type PayoutStatus } from '@/lib/instructor-data';

const FILTERS = ['All', 'Successful', 'Processing', 'Failed', 'Pending'] as const;
type Filter = (typeof FILTERS)[number];

/** Saves the given payouts as a CSV file. */
function downloadCsv(rows: Payout[], filename: string) {
  const lines = [['Reference', 'Date', 'Amount (NGN)', 'Bank', 'Account', 'Status'], ...rows.map((p) => [p.reference, p.date, String(p.amount), p.bank, `****${p.last4}`, p.status])];
  const blob = new Blob([lines.map((l) => l.join(',')).join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

const count = (status: PayoutStatus) => PAYOUTS.filter((p) => p.status === status).length;

const iconButton = 'flex h-8 w-8 items-center justify-center rounded-lg text-[#7a6655] transition-colors';

/** /portal/payouts/history — every payout with status filters, CSV export, and retry for a failed one. */
export default function PayoutHistoryPage() {
  const [filter, setFilter] = useState<Filter>('All');
  const rows = filter === 'All' ? PAYOUTS : PAYOUTS.filter((p) => p.status === filter);

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-12 pt-7 sm:px-6 lg:px-10 lg:pt-9">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-extrabold text-[#1c0e04]">Payout History</h1>
          <p className="mt-1 font-body text-[15px] text-[#7a6655]">All your payout requests and how they went</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => downloadCsv(rows, `payouts-${filter.toLowerCase()}.csv`)}
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-[#e8d5bb] bg-[#fffdf9] px-4 font-body text-[14px] font-semibold text-[#3d2b1f] transition-colors hover:border-brand/40"
          >
            <Download className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Export CSV
          </button>
          <Link href="/portal/payouts/withdraw" className={primaryButton}>
            Request Payout
          </Link>
        </div>
      </div>

      <section className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 min-[1000px]:grid-cols-4" aria-label="Totals">
        <StatCard icon={<DollarSign className="h-5 w-5 text-[#0d5c3a]" strokeWidth={1.9} />} tint="bg-[#e6f0ea]" label="Total Paid Out" value={naira(paidOut)} />
        <StatCard icon={<CircleCheck className="h-5 w-5 text-[#0d5c3a]" strokeWidth={1.9} />} tint="bg-[#e6f0ea]" label="Successful" value={String(count('Successful'))} />
        <StatCard icon={<Clock className="h-5 w-5 text-[#d4920a]" strokeWidth={1.9} />} tint="bg-[#fbf3e0]" label="Processing" value={String(count('Processing'))} />
        <StatCard icon={<CircleX className="h-5 w-5 text-[#b42318]" strokeWidth={1.9} />} tint="bg-[#fdecea]" label="Failed" value={String(count('Failed'))} />
      </section>

      <div role="group" aria-label="Filter payouts" className="-mx-4 mt-7 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={cn(
              'h-9 shrink-0 cursor-pointer rounded-full px-4 font-body text-[14px] transition-colors',
              filter === f ? 'bg-[#075c45] font-semibold text-white' : 'border border-[#e8d5bb] bg-[#fffdf9] text-[#3d2b1f] hover:border-[#0d5c3a]/40'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <section className={cn(card, 'mt-5 overflow-hidden')} aria-label="Payouts">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-[#efe2d0] bg-[#fdf6ec]">
              <tr>
                <th scope="col" className={th}>Reference</th>
                <th scope="col" className={th}>Date</th>
                <th scope="col" className={th}>Amount</th>
                <th scope="col" className={th}>Bank</th>
                <th scope="col" className={th}>Status</th>
                <th scope="col" className={th}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efe2d0]">
              {rows.map((p) => (
                <tr key={p.reference}>
                  <th scope="row" className={cn(td, 'text-left')}>
                    <span className="flex items-center gap-2 font-mono font-semibold text-[#1c0e04]">
                      <ReceiptText className="h-4 w-4 text-[#a08a78]" strokeWidth={1.8} aria-hidden="true" />
                      {p.reference}
                    </span>
                  </th>
                  <td className={cn(td, 'text-[#7a6655]')}>{formatDate(p.date)}</td>
                  <td className={cn(td, 'font-display font-bold text-[#1c0e04]')}>{naira(p.amount)}</td>
                  <td className={cn(td, 'text-[#3d2b1f]')}>
                    {p.bank} ••{p.last4}
                  </td>
                  <td className={td}>
                    <StatusPill status={p.status} />
                  </td>
                  <td className={td}>
                    <div className="flex items-center gap-1">
                      {/* Payout details need a design and an API endpoint. */}
                      <button type="button" disabled title="Payout details are coming soon" aria-label={`View ${p.reference} (coming soon)`} className={cn(iconButton, 'cursor-not-allowed opacity-50')}>
                        <Eye className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
                      </button>
                      {p.status === 'Failed' && (
                        <Link href={`/portal/payouts/withdraw?amount=${p.amount}`} aria-label={`Try ${p.reference} again`} className={cn(iconButton, 'text-brand hover:bg-[#fbebe2]')}>
                          <RotateCw className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
                        </Link>
                      )}
                      <button type="button" onClick={() => downloadCsv([p], `${p.reference}.csv`)} aria-label={`Download ${p.reference}`} className={cn(iconButton, 'cursor-pointer hover:bg-[#fdf6ec] hover:text-[#1c0e04]')}>
                        <Download className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className={cn(td, 'py-10 text-center text-[#7a6655]')}>
                    No {filter.toLowerCase()} payouts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
