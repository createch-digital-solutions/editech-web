'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ArrowRight, CircleCheck } from 'lucide-react';
import { StatusScreen } from '@/components/learner/status-screen';
import { formatPrice, sampleCourseDetail, SAMPLE_LEARNER } from '@/lib/learner-data';

/** /checkout/[slug]/success — enrolment confirmed, with the receipt details. */
export default function PaymentSuccessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const search = useSearchParams();
  const { user } = useUser();
  const amount = Number(search.get('amount') ?? 0);
  const title = sampleCourseDetail(slug)?.title ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const email = user?.primaryEmailAddress?.emailAddress ?? SAMPLE_LEARNER.email;
  // TODO: Use the Paystack reference and receipt from the payments module.
  const date = useMemo(() => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), []);

  const rows = [
    ['Course', title],
    ['Amount Paid', amount === 0 ? 'Free' : formatPrice(amount)],
    ['Transaction ID', search.get('ref') ?? '—'],
    ['Date', date],
  ];

  return (
    <StatusScreen
      motif
      tone="success"
      title={
        <>
          Payment Successful! <span aria-hidden="true">🎉</span>
        </>
      }
      icon={<CircleCheck className="h-10 w-10" strokeWidth={2} aria-hidden="true" />}
    >
      <p className="mt-[10px] max-w-[470px] text-base leading-[30px] text-[#7a6655]">
        You&apos;re now enrolled in <strong className="text-[#1c0e04]">{title}</strong>. A receipt was sent to <strong className="break-all">{email}</strong>
      </p>
      <dl className="mt-[22px] w-full max-w-[498px] rounded-2xl border-2 border-[#efe2d0] bg-[#fffdf9] px-[20px] py-[13px] text-left text-[14px]">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 border-b border-[#efe2d0] py-[10px]">
            <dt className="text-[#7a6655]">{label}</dt>
            <dd className="font-bold text-[#1c0e04]">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-[24px] flex flex-wrap justify-center gap-[13px]">
        <Link
          href={`/learn/${slug}`}
          className="flex h-[45px] items-center gap-1 rounded-xl bg-brand-gradient px-[28px] text-[15px] font-bold text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90"
        >
          Start Learning <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex h-[45px] cursor-pointer items-center rounded-xl border-2 border-[#efe2d0] bg-[#fffdf9] px-[16px] text-[14px] font-semibold text-[#3d2b1f] transition-colors hover:bg-white"
        >
          View Receipt
        </button>
      </div>
    </StatusScreen>
  );
}
