'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Stars } from '@/components/learner/stars';
import { formatPrice, SAMPLE_PROMO, type CourseDetail } from '@/lib/learner-data';

const METHODS = [
  { id: 'card', label: 'Card', emoji: '💳' },
  { id: 'bank', label: 'Bank Transfer', emoji: '🏦' },
  { id: 'ussd', label: 'USSD', emoji: '📱' },
] as const;
type Method = (typeof METHODS)[number]['id'];

const labelClass = 'block font-body text-[20px] font-semibold leading-6 text-[#3d2b1f]';
const inputClass =
  'mt-[14px] h-[66px] w-full rounded-xl border-2 border-[#efe2d0] bg-[#fffdf9] px-[21px] font-body text-[20px] text-[#1c0e04] placeholder:text-[#3d2b1f] focus:border-brand focus:outline-none';

/** "1234 5678 9012 3456" while typing. */
const groupCard = (v: string) => v.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
/** "MM / YY" while typing. */
const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
};

/**
 * Payment method, card details, order summary and promo code.
 * TODO: Initialise a Paystack transaction (payments module) instead of the demo flow below, which goes
 * straight to the processing screen; card numbers ending in 0002 demonstrate a declined payment.
 */
export function CheckoutForm({ course, initialMethod = 'card' }: { course: CourseDetail; initialMethod?: Method }) {
  const router = useRouter();
  const [method, setMethod] = useState<Method>(initialMethod);
  const [card, setCard] = useState('');
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [promo, setPromo] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const original = course.originalPrice && course.originalPrice > course.price ? course.originalPrice : course.price;
  const courseDiscount = original - course.price;
  const promoDiscount = promoApplied ? Math.round((course.price * SAMPLE_PROMO.percent) / 100) : 0;
  const total = course.price - promoDiscount;
  const isFree = course.price === 0;

  function applyPromo() {
    if (promo.trim().toUpperCase() === SAMPLE_PROMO.code) {
      setPromoApplied(true);
      setPromoError(null);
    } else {
      setPromoApplied(false);
      setPromoError('That code is not valid.');
    }
  }

  function handlePay(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isFree && method === 'card') {
      const digits = card.replace(/\s/g, '');
      if (digits.length < 12) return setError('Enter the card number as it appears on your card.');
      if (!/^\d{2} \/ \d{2}$/.test(expiry)) return setError('Enter the expiry date as MM / YY.');
      if (!/^\d{3,4}$/.test(cvv)) return setError('Enter the 3 or 4 digit security code (CVV).');
    }
    const params = new URLSearchParams({ amount: String(total), method: isFree ? 'free' : method });
    if (!isFree && method === 'card' && card.replace(/\s/g, '').endsWith('0002')) params.set('demo', 'declined');
    router.push(`/checkout/${course.slug}/processing?${params}`);
  }

  return (
    <div className="mt-[44px] grid grid-cols-1 items-start gap-[46px] lg:grid-cols-[487px_minmax(0,546px)]">
      <form onSubmit={handlePay} className="min-w-0 rounded-3xl border-2 border-[#efe2d0] bg-[#fffdf9] px-5 pb-[36px] pt-[44px] sm:px-[42px]">
        {isFree ? (
          <>
            <h2 className="font-body text-[22px] font-bold leading-7 text-[#1c0e04]">This course is free</h2>
            <p className="mt-3 text-[17px] text-[#7a6655]">Enrol now to start learning straight away — no payment needed.</p>
          </>
        ) : (
          <>
            <h2 className="font-body text-[22px] font-bold leading-7 text-[#1c0e04]">Payment Method</h2>
            <div className="mt-[34px] grid grid-cols-3 gap-2.5 sm:gap-[18px]" role="radiogroup" aria-label="Payment method">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={method === m.id}
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    'flex h-[120px] min-w-0 cursor-pointer flex-col items-center justify-center rounded-2xl px-1 text-center font-body text-[15px] leading-[22px] transition-colors sm:h-[153px] sm:px-2 sm:text-[20px] sm:leading-[30px]',
                    method === m.id ? 'border-[3px] border-brand bg-[#fdeee4] font-semibold text-brand' : 'border-[3px] border-[#efe2d0] bg-[#fffdf9] text-[#5a4636] hover:border-brand/40'
                  )}
                >
                  <span className="text-[26px] leading-8" aria-hidden="true">
                    {m.emoji}
                  </span>
                  <span className="mt-[10px] max-w-[90px]">{m.label}</span>
                </button>
              ))}
            </div>

            {method === 'card' && (
              <div className="mt-[39px] space-y-[34px]">
                <div>
                  <label htmlFor="card-number" className={labelClass}>
                    Card Number
                  </label>
                  <input id="card-number" inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" value={card} onChange={(e) => setCard(groupCard(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="card-name" className={labelClass}>
                    Cardholder Name
                  </label>
                  <input id="card-name" autoComplete="cc-name" placeholder="Adaeze Okafor" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-[23px]">
                  <div>
                    <label htmlFor="card-expiry" className={labelClass}>
                      Expiry
                    </label>
                    <input id="card-expiry" inputMode="numeric" autoComplete="cc-exp" placeholder="MM / YY" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="card-cvv" className={labelClass}>
                      CVV
                    </label>
                    <input id="card-cvv" type="password" inputMode="numeric" autoComplete="cc-csc" placeholder="•••" maxLength={4} value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))} className={inputClass} />
                  </div>
                </div>
              </div>
            )}
            {method === 'bank' && (
              <p className="mt-[34px] rounded-xl border-2 border-[#efe2d0] bg-[#fdf6ec] px-5 py-4 text-[17px] leading-7 text-[#5a4636]">
                You will get a one-time account number to transfer {formatPrice(total)} to. Your enrolment starts as soon as the transfer arrives.
              </p>
            )}
            {method === 'ussd' && (
              <p className="mt-[34px] rounded-xl border-2 border-[#efe2d0] bg-[#fdf6ec] px-5 py-4 text-[17px] leading-7 text-[#5a4636]">
                You will get a short code to dial from the phone linked to your bank account to pay {formatPrice(total)}.
              </p>
            )}
          </>
        )}

        {error && (
          <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="mt-[22px] flex h-[69px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-brand-gradient font-body text-[22px] font-bold text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90"
        >
          {isFree ? 'Enroll for Free' : `Pay ${formatPrice(total)}`}
          <ArrowRight className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
        </button>
        {!isFree && (
          <p className="mt-[24px] flex items-center justify-center gap-2 text-[18px] text-[#a89282]">
            <Lock className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
            Secured by Paystack · 256-bit SSL
          </p>
        )}
      </form>

      <div className="space-y-[28px]">
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
            <div className="flex justify-between gap-4">
              <dt>Original price</dt>
              <dd>{formatPrice(original)}</dd>
            </div>
            {courseDiscount > 0 && (
              <div className="flex justify-between gap-4">
                <dt>Discount ({Math.round((courseDiscount / original) * 100)}% off)</dt>
                <dd>−{formatPrice(courseDiscount)}</dd>
              </div>
            )}
            {promoApplied && (
              <div className="flex justify-between gap-4">
                <dt>Promo {SAMPLE_PROMO.code}</dt>
                <dd>−{formatPrice(promoDiscount)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4 border-t-[3px] border-[#efe2d0] pt-[20px] font-display text-[23px] font-bold text-[#1c0e04]">
              <dt>Total</dt>
              <dd>{total === 0 ? '₦0' : formatPrice(total)}</dd>
            </div>
          </dl>
        </section>

        {!isFree && (
          <section className="rounded-3xl border-2 border-[#efe2d0] bg-[#fffdf9] px-5 pb-[24px] pt-[26px] sm:px-[24px]" aria-labelledby="promo-title">
            <h2 id="promo-title" className="font-body text-[20px] font-semibold leading-7 text-[#3d2b1f]">
              <label htmlFor="promo">Promo Code</label>
            </h2>
            <div className="mt-[12px] flex gap-[14px]">
              <input
                id="promo"
                value={promo}
                onChange={(e) => {
                  setPromo(e.target.value);
                  setPromoError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyPromo();
                  }
                }}
                placeholder={SAMPLE_PROMO.code}
                className="h-[60px] min-w-0 flex-1 rounded-xl border-2 border-[#efe2d0] bg-[#fffdf9] px-[19px] font-body text-[20px] uppercase text-[#1c0e04] placeholder:text-[#a89282] focus:border-brand focus:outline-none"
              />
              <button
                type="button"
                onClick={applyPromo}
                className="h-[60px] w-[90px] shrink-0 cursor-pointer rounded-xl bg-brand-gradient font-body text-[19px] font-bold text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90"
              >
                Apply
              </button>
            </div>
            {promoError && (
              <p className="mt-2 text-sm text-red-700" role="alert">
                {promoError}
              </p>
            )}
            {promoApplied && (
              <p className="mt-2 text-sm text-[#0d5c3a]" role="status">
                {SAMPLE_PROMO.percent}% off applied.
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
