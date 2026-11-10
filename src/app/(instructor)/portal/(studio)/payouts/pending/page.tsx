import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { card, primaryButton, StatusPill, td, th } from '@/components/instructor/studio-parts';
import { availableBalance, availableByCourse, INSTRUCTOR_SHARE, MIN_WITHDRAWAL, naira, processing, underReview } from '@/lib/instructor-data';

/** /portal/payouts/pending — what can be withdrawn now, what is under review or processing, and which courses it came from. */
export default function PendingBalancePage() {
  const rows = availableByCourse();

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-12 pt-7 sm:px-6 lg:px-10 lg:pt-9">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-extrabold text-[#1c0e04]">Pending Balance</h1>
          <p className="mt-1 font-body text-[15px] text-[#7a6655]">Earnings ready to withdraw, waiting for approval or on their way to your bank</p>
        </div>
        <Link href="/portal/payouts/withdraw" className={primaryButton}>
          Request Withdrawal <ArrowRight className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
        </Link>
      </div>

      <section className="mt-7 grid gap-4 md:grid-cols-3" aria-label="Balances">
        <div className="rounded-2xl bg-[#075c45] px-6 py-6 text-white shadow-sm">
          <h2 className="font-body text-[12px] font-bold uppercase tracking-[0.12em] text-[#7ee0b5]">Available to withdraw</h2>
          <p className="mt-3 font-display text-[30px] font-extrabold leading-tight">{naira(availableBalance)}</p>
          <p className="mt-2 font-body text-[14px] text-[#7ee0b5]">Minimum: {naira(MIN_WITHDRAWAL)} ✓</p>
        </div>
        <div className="rounded-2xl border-2 border-[#f6e08a] bg-[#fffbea] px-6 py-6 shadow-sm">
          <h2 className="font-body text-[12px] font-bold uppercase tracking-[0.12em] text-[#a86f00]">Under review</h2>
          <p className="mt-3 font-display text-[30px] font-extrabold leading-tight text-[#1c0e04]">{naira(underReview)}</p>
          <p className="mt-2 font-body text-[14px] text-[#a86f00]">Admin review in progress</p>
        </div>
        <div className="rounded-2xl border-2 border-[#c9d2fa] bg-[#eef1ff] px-6 py-6 shadow-sm">
          <h2 className="font-body text-[12px] font-bold uppercase tracking-[0.12em] text-[#1e2a78]">Processing</h2>
          <p className="mt-3 font-display text-[30px] font-extrabold leading-tight text-[#1c0e04]">{naira(processing)}</p>
          <p className="mt-2 font-body text-[14px] text-[#1e2a78]">1–3 business days</p>
        </div>
      </section>

      <section className={cn(card, 'mt-6 p-5 sm:p-6')} aria-labelledby="by-course-title">
        <h2 id="by-course-title" className="font-display text-[18px] font-bold text-[#1c0e04]">
          Available by Course
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="border-b-2 border-[#efe2d0] bg-[#fdf6ec]">
              <tr>
                <th scope="col" className={th}>Course</th>
                <th scope="col" className={th}>Gross sales</th>
                <th scope="col" className={th}>Your share ({Math.round(INSTRUCTOR_SHARE * 100)}%)</th>
                <th scope="col" className={th}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efe2d0]">
              {rows.map((r) => (
                <tr key={r.course.slug}>
                  <th scope="row" className={cn(td, 'text-left font-semibold text-[#1c0e04]')}>{r.course.title}</th>
                  <td className={cn(td, 'text-[#7a6655]')}>{naira(r.gross)}</td>
                  <td className={cn(td, 'font-display font-bold text-[#0d5c3a]')}>{naira(r.share)}</td>
                  <td className={td}>
                    <StatusPill status="Available" />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#efe2d0] bg-[#eefaf3]">
                <th scope="row" colSpan={2} className={cn(td, 'text-left font-display text-[16px] font-bold text-[#1c0e04]')}>
                  Total Available
                </th>
                <td colSpan={2} className={cn(td, 'text-right font-display text-[20px] font-extrabold text-[#0d5c3a]')}>
                  {naira(availableBalance)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </main>
  );
}
