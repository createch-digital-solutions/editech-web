'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Banknote, CircleCheck, Landmark, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { card } from '@/components/instructor/studio-parts';
import { availableBalance, MIN_WITHDRAWAL, naira, PAYOUT_ACCOUNT } from '@/lib/instructor-data';

const PRESETS = [50_000, 100_000, 250_000];

const STEPS = [
  { title: 'Request submitted', note: 'Immediately', tone: 'border-[#0d5c3a] bg-[#0d5c3a] text-white' },
  { title: 'Admin review', note: 'Within 24 hours', tone: 'border-[#d4920a] text-[#d4920a]' },
  { title: 'Bank processing', note: '1–3 business days', tone: 'border-[#1e2a78] text-[#1e2a78]' },
  { title: 'Funds in your account', note: 'After bank processing', tone: 'border-[#0d5c3a] text-[#0d5c3a]' },
];

function WithdrawForm() {
  const router = useRouter();
  const params = useSearchParams();
  // A failed payout's retry link passes its amount.
  const [amount, setAmount] = useState(() => Math.min(Number(params.get('amount')) || availableBalance, availableBalance));
  const [touched, setTouched] = useState(false);

  const error =
    amount < MIN_WITHDRAWAL ? `The minimum withdrawal is ${naira(MIN_WITHDRAWAL)}.` : amount > availableBalance ? `You can withdraw up to ${naira(availableBalance)}.` : null;

  const choose = (n: number) => {
    setAmount(n);
    setTouched(true);
  };

  return (
    <form
      className={cn(card, 'mt-7 p-5 sm:p-8')}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        // No payout endpoint yet: the request goes nowhere, so this returns to the payout list.
        if (!error) router.push('/portal/payouts/history');
      }}
    >
      <label htmlFor="withdraw-amount" className="font-body text-[15px] font-semibold text-[#3d2b1f]">
        Amount to Withdraw
      </label>
      <div className={cn('mt-2 flex items-center gap-2 rounded-xl border-2 bg-[#eefaf3] px-4', touched && error ? 'border-[#b42318]' : 'border-[#0d5c3a]')}>
        <span className="font-display text-[24px] font-extrabold text-[#0d5c3a]" aria-hidden="true">
          ₦
        </span>
        <input
          id="withdraw-amount"
          inputMode="numeric"
          autoComplete="off"
          value={amount ? amount.toLocaleString('en-NG') : ''}
          onChange={(e) => choose(Number(e.target.value.replace(/\D/g, '').slice(0, 12)))}
          aria-invalid={touched && !!error}
          aria-describedby={touched && error ? 'withdraw-error' : undefined}
          className="h-14 min-w-0 flex-1 bg-transparent font-display text-[26px] font-extrabold text-[#1c0e04] outline-none"
        />
        <button type="button" onClick={() => choose(availableBalance)} className="cursor-pointer font-body text-[14px] font-semibold text-[#7a6655] hover:text-[#0d5c3a]">
          Max
        </button>
      </div>
      {touched && error && (
        <p id="withdraw-error" role="alert" className="mt-2 font-body text-[13px] text-[#b42318]">
          {error}
        </p>
      )}

      <div role="group" aria-label="Quick amounts" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[...PRESETS.filter((p) => p < availableBalance), availableBalance].map((p) => {
          const active = amount === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => choose(p)}
              aria-pressed={active}
              className={cn(
                'h-10 cursor-pointer rounded-xl border font-body text-[14px] transition-colors',
                active ? 'border-[#0d5c3a] bg-[#eefaf3] font-bold text-[#0d5c3a]' : 'border-[#e8d5bb] bg-[#fffdf9] text-[#7a6655] hover:border-[#0d5c3a]/40'
              )}
            >
              {p === availableBalance ? `All (${naira(p)})` : naira(p)}
            </button>
          );
        })}
      </div>

      <h2 className="mt-7 font-body text-[15px] font-semibold text-[#3d2b1f]">Destination Account</h2>
      <div className="mt-2 flex items-center gap-4 rounded-xl border-2 border-[#0d5c3a] bg-[#eefaf3] px-4 py-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#0d5c3a]" aria-hidden="true">
          <Landmark className="h-6 w-6" strokeWidth={1.7} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[16px] font-bold text-[#1c0e04]">
            {PAYOUT_ACCOUNT.bank} — {PAYOUT_ACCOUNT.type}
          </p>
          <p className="truncate font-body text-[14px] text-[#7a6655]">
            {PAYOUT_ACCOUNT.holder} · •••• {PAYOUT_ACCOUNT.last4}
          </p>
        </div>
        <CircleCheck className="h-6 w-6 shrink-0 text-[#0d5c3a]" strokeWidth={1.8} aria-label="Selected" />
      </div>

      <section className="mt-7 rounded-xl border border-[#efe2d0] bg-[#faf0e2] px-5 py-5" aria-labelledby="next-title">
        <h2 id="next-title" className="font-body text-[15px] font-semibold text-[#3d2b1f]">
          What happens next?
        </h2>
        <ol className="mt-4 space-y-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 font-body text-[13px] font-bold', s.tone)} aria-hidden="true">
                {i === 0 ? <CircleCheck className="h-4 w-4" strokeWidth={2.4} /> : i + 1}
              </span>
              <div>
                <p className="font-body text-[15px] font-semibold text-[#1c0e04]">{s.title}</p>
                <p className="font-body text-[13px] text-[#7a6655]">{s.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <button
        type="submit"
        className="mt-7 flex h-12 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-brand-gradient font-body text-[16px] font-semibold text-white shadow-md shadow-brand/30 transition-opacity hover:opacity-90"
      >
        Submit Withdrawal Request <ArrowRight className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
      </button>
      <p className="mt-4 flex items-center justify-center gap-1.5 font-body text-[13px] text-[#a08a78]">
        <Lock className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
        Secured · Processed by Paystack
      </p>
    </form>
  );
}

/** /portal/payouts/withdraw — choose an amount, confirm the bank account and send a withdrawal request. */
export default function WithdrawPage() {
  return (
    <main className="mx-auto w-full max-w-[760px] flex-1 px-4 pb-12 pt-8 sm:px-6 lg:pt-10">
      <div className="text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#075c45] text-[#7ee0b5]" aria-hidden="true">
          <Banknote className="h-8 w-8" strokeWidth={1.7} />
        </span>
        <h1 className="mt-4 font-display text-[26px] font-extrabold text-[#1c0e04]">Withdrawal Request</h1>
        <p className="mt-1 font-body text-[15px] text-[#7a6655]">
          Available balance: <strong className="text-[#0d5c3a]">{naira(availableBalance)}</strong>
        </p>
      </div>
      <Suspense>
        <WithdrawForm />
      </Suspense>
    </main>
  );
}
