import type { Metadata } from 'next';
import Link from 'next/link';
import { CircleAlert, CircleX } from 'lucide-react';
import { StatusScreen } from '@/components/learner/status-screen';

export const metadata: Metadata = { title: 'Payment failed — Createch Elevate' };

/** /checkout/[slug]/failed — the card was declined: try again, or pay by bank transfer. */
export default async function PaymentFailedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <StatusScreen tone="danger" title="Payment Failed" icon={<CircleX className="h-10 w-10" strokeWidth={2} aria-hidden="true" />}>
      <p className="mt-[10px] text-base leading-6 text-[#7a6655]">We couldn&apos;t process your payment. Your card was declined.</p>
      <div className="mt-[23px] flex w-full max-w-[460px] items-start gap-[13px] rounded-xl border-2 border-[#f9cfcf] bg-[#fdf0f0] px-[18px] py-[15px] text-left text-[14px] leading-[22px] text-[#b42318]" role="alert">
        <CircleAlert className="mt-[3px] h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
        Insufficient funds or card blocked for online transactions. Contact your bank or try another method.
      </div>
      <Link
        href={`/checkout/${slug}`}
        className="mt-[28px] flex h-[45px] items-center rounded-xl bg-brand-gradient px-[28px] text-[15px] font-bold text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90"
      >
        Try Again
      </Link>
      <Link
        href={`/checkout/${slug}?method=bank`}
        className="mt-[10px] flex h-[45px] items-center rounded-xl border-2 border-brand px-[27px] text-[15px] font-semibold text-brand transition-colors hover:bg-[#fdeee4]"
      >
        Pay via Bank Transfer
      </Link>
      <p className="mt-[14px] text-[14px] text-[#7a6655]">
        Need help?{' '}
        <a href="mailto:support@createch.example.com" className="font-semibold text-brand hover:text-brand-light">
          Contact Support
        </a>
      </p>
    </StatusScreen>
  );
}
