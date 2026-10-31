'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';
import { Stars } from '@/components/learner/stars';
import { useApiClient } from '@/hooks/use-api-client';
import { formatPrice, type CourseDetail } from '@/lib/learner-data';

const METHODS = [
  { label: 'Card', emoji: '💳' },
  { label: 'Bank Transfer', emoji: '🏦' },
  { label: 'USSD', emoji: '📱' },
];

interface CheckoutSession {
  provider: string;
  checkoutUrl: string;
  reference?: string;
  /** Set when the API has no live payment keys and returned a placeholder link. */
  mode?: string;
}

/**
 * Order summary and payment. Pay starts a Paystack transaction (POST /payments/initiate) and sends the
 * learner to Paystack's own page, where they choose card, bank transfer or USSD; card details are
 * never typed into this site.
 * TODO: Enrol in free courses once the API has a free-enrolment endpoint (SCRUM-31).
 */
export function CheckoutForm({ course }: { course: CourseDetail }) {
  const api = useApiClient();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isFree = course.price === 0;

  async function handlePay(e: FormEvent) {
    e.preventDefault();
    if (isFree || busy) return;
    setError(null);
    setBusy(true);
    try {
      const session = await api.post<CheckoutSession>('/payments/initiate', { courseId: course.id, amount: course.price, currency: 'NGN' });
      if (session.mode === 'stub' || !/^https:\/\//.test(session.checkoutUrl ?? '')) {
        setError('Online payments are not switched on yet, so this course cannot be bought right now. Please try again later.');
        setBusy(false);
        return;
      }
      window.location.assign(session.checkoutUrl);
    } catch (err) {
      setError(err instanceof Error && err.message ? `We couldn’t start the payment: ${err.message}` : 'We couldn’t start the payment. Please try again.');
      setBusy(false);
    }
  }

  return (
    <div className="mt-[44px] grid grid-cols-1 items-start gap-[46px] lg:grid-cols-[487px_minmax(0,546px)]">
      <form onSubmit={handlePay} className="min-w-0 rounded-3xl border-2 border-[#efe2d0] bg-[#fffdf9] px-5 pb-[36px] pt-[44px] sm:px-[42px]">
        {isFree ? (
          <>
            <h2 className="font-body text-[22px] font-bold leading-7 text-[#1c0e04]">This course is free</h2>
            <p className="mt-3 text-[17px] leading-7 text-[#7a6655]">Enrolling in free courses opens soon. You can already watch the free preview lessons.</p>
          </>
        ) : (
          <>
            <h2 className="font-body text-[22px] font-bold leading-7 text-[#1c0e04]">Payment Method</h2>
            <ul className="mt-[34px] grid grid-cols-3 gap-2.5 sm:gap-[18px]" aria-label="Ways to pay">
              {METHODS.map((m) => (
                <li
                  key={m.label}
                  className="flex h-[110px] min-w-0 flex-col items-center justify-center rounded-2xl border-[3px] border-[#efe2d0] bg-[#fffdf9] px-1 text-center font-body text-[15px] leading-[22px] text-[#5a4636] sm:h-[130px] sm:text-[19px]"
                >
                  <span className="text-[26px] leading-8" aria-hidden="true">
                    {m.emoji}
                  </span>
                  <span className="mt-[10px] max-w-[90px]">{m.label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-[28px] rounded-xl border-2 border-[#efe2d0] bg-[#fdf6ec] px-5 py-4 text-[17px] leading-7 text-[#5a4636]">
              You&apos;ll choose how to pay on Paystack&apos;s secure page, then come back here once the payment is confirmed.
            </p>
          </>
        )}

        {error && (
          <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        {isFree ? (
          <Link
            href={`/learn/${course.slug}`}
            className="mt-[22px] flex h-[69px] w-full items-center justify-center gap-1.5 rounded-xl bg-brand-gradient font-body text-[22px] font-bold text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90"
          >
            Watch the Free Preview
            <ArrowRight className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
          </Link>
        ) : (
          <button
            type="submit"
            disabled={busy || !api.isLoaded}
            className="mt-[22px] flex h-[69px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-brand-gradient font-body text-[22px] font-bold text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy ? 'Opening Paystack…' : `Pay ${formatPrice(course.price)}`}
            {!busy && <ArrowRight className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />}
          </button>
        )}
        {!isFree && (
          <p className="mt-[24px] flex items-center justify-center gap-2 text-[18px] text-[#a89282]">
            <Lock className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
            Secured by Paystack
          </p>
        )}
      </form>

      <section className="rounded-3xl border-2 border-[#efe2d0] bg-[#fffdf9] px-5 pb-[34px] pt-[34px] sm:px-[30px]" aria-labelledby="summary-title">
        <h2 id="summary-title" className="font-body text-[21px] font-bold leading-7 text-[#1c0e04]">
          Order Summary
        </h2>
        <div className="mt-[22px] flex items-center gap-[18px] border-b-2 border-[#efe2d0] pb-[24px]">
          <Image src={course.image} alt="" width={196} height={196} unoptimized className="h-[98px] w-[98px] shrink-0 rounded-xl object-cover" />
          <div className="min-w-0">
            <p className="font-body text-[20px] font-bold leading-7 text-[#1c0e04]">{course.title}</p>
            <p className="text-[18px] leading-7 text-[#7a6655]">
              {course.instructor}
              {course.duration && ` · ${course.duration}`}
            </p>
            <div className="flex items-center gap-1.5">
              <Stars rating={course.rating} />
              <span className="text-[15px] font-bold text-[#d4920a]">{course.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        <dl className="mt-[17px] space-y-[18px] text-[19px] text-[#7a6655]">
          <div className="flex justify-between gap-4 pt-[4px] font-display text-[23px] font-bold text-[#1c0e04]">
            <dt>Total</dt>
            <dd>{isFree ? '₦0' : formatPrice(course.price)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
