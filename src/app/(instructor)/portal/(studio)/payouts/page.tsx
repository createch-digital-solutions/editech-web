import Link from 'next/link';
import { ArrowRight, ReceiptText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { card, primaryButton, StatusPill } from '@/components/instructor/studio-parts';
import { availableBalance, formatDate, INSTRUCTOR_SHARE, MIN_WITHDRAWAL, naira, paidOut, PAYOUTS, underReview } from '@/lib/instructor-data';

/** /portal/payouts — available balance with Request Payout, pending and paid-out totals, and the latest payouts. */
export default function PayoutDashboardPage() {
  const successful = PAYOUTS.filter((p) => p.status === 'Successful').length;

  return (
    <main className="mx-auto w-full max-w-[920px] flex-1 px-4 pb-12 pt-7 sm:px-6 lg:pt-9">
      <h1 className="font-display text-[26px] font-extrabold text-[#1c0e04]">Payout Dashboard</h1>

      <section className="relative mt-6 overflow-hidden rounded-2xl bg-[#075c45] px-6 py-7 text-white shadow-sm sm:px-9" aria-labelledby="balance-title">
        <h2 id="balance-title" className="font-body text-[12px] font-bold uppercase tracking-[0.12em] text-[#7ee0b5]">
          Available balance
        </h2>
        <p className="mt-2 font-display text-[36px] font-extrabold leading-tight sm:text-[40px]">{naira(availableBalance)}</p>
        <p className="mt-1 font-body text-[14px] text-[#7ee0b5]">
          {Math.round(INSTRUCTOR_SHARE * 100)}% instructor share · Minimum: {naira(MIN_WITHDRAWAL)} ✓
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/portal/payouts/withdraw" className={primaryButton}>
            Request Payout <ArrowRight className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
          </Link>
          <Link
            href="/portal/payouts/history"
            className="inline-flex h-10 items-center rounded-xl border border-white/25 bg-white/10 px-5 font-body text-[14px] font-medium text-white transition-colors hover:bg-white/20"
          >
            View History
          </Link>
        </div>
      </section>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Link href="/portal/payouts/pending" className={cn(card, 'block px-5 py-5 transition-shadow hover:shadow-md')}>
          <p className="font-body text-[14px] text-[#7a6655]">Pending Balance</p>
          <p className="mt-1 font-display text-[26px] font-extrabold text-[#c98a06]">{naira(underReview)}</p>
          <p className="mt-1 font-body text-[14px] text-[#7a6655]">
            Under admin review <span aria-hidden="true">→</span>
          </p>
        </Link>
        <Link href="/portal/payouts/history" className={cn(card, 'block px-5 py-5 transition-shadow hover:shadow-md')}>
          <p className="font-body text-[14px] text-[#7a6655]">Total Paid Out</p>
          <p className="mt-1 font-display text-[26px] font-extrabold text-[#0d5c3a]">{naira(paidOut)}</p>
          <p className="mt-1 font-body text-[14px] text-[#7a6655]">
            {successful} successful {successful === 1 ? 'payout' : 'payouts'} <span aria-hidden="true">→</span>
          </p>
        </Link>
      </div>

      <section className={cn(card, 'mt-5 px-5 py-5 sm:px-6')} aria-labelledby="recent-title">
        <div className="flex items-center justify-between">
          <h2 id="recent-title" className="font-display text-[18px] font-bold text-[#1c0e04]">
            Recent Payouts
          </h2>
          <Link href="/portal/payouts/history" className="flex items-center gap-1 font-body text-[14px] font-semibold text-brand hover:text-brand-light">
            View all <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-[#efe2d0]">
          {PAYOUTS.slice(0, 3).map((p) => (
            <li key={p.reference} className="flex items-center gap-3 py-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eefaf3] text-[#0d5c3a]" aria-hidden="true">
                <ReceiptText className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[14px] font-semibold text-[#1c0e04]">{p.reference}</p>
                <p className="font-body text-[13px] text-[#7a6655]">{formatDate(p.date)}</p>
              </div>
              <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-4">
                <span className="font-display text-[16px] font-bold text-[#1c0e04]">{naira(p.amount)}</span>
                <StatusPill status={p.status} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
