'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CircleCheck, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusScreen } from '@/components/learner/status-screen';

const STEPS = ['Payment initiated', 'Verifying card details', 'Authorising transaction', 'Completing enrolment'];
const STEP_MS = 900;

/**
 * /checkout/[slug]/processing — progress while the payment goes through, then on to success or failure.
 * TODO: Poll the payments module for the Paystack transaction instead of this timed demo.
 */
export default function ProcessingPaymentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const search = useSearchParams();
  const [done, setDone] = useState(0);

  const declined = search.get('demo') === 'declined';
  const steps = search.get('method') === 'card' ? STEPS : STEPS.filter((s) => s !== 'Verifying card details');

  useEffect(() => {
    if (done < steps.length - 1 && !(declined && done === 2)) {
      const t = setTimeout(() => setDone((d) => d + 1), STEP_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      const ref = `TXN-${new Date().getFullYear()}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
      const query = new URLSearchParams({ amount: search.get('amount') ?? '0', ref });
      router.replace(`/checkout/${slug}/${declined ? 'failed' : 'success'}?${query}`);
    }, STEP_MS);
    return () => clearTimeout(t);
  }, [done, declined, steps.length, router, slug, search]);

  return (
    <StatusScreen
      tone="brand"
      title="Processing Payment..."
      icon={<Loader className="h-9 w-9 animate-[spin_2s_linear_infinite]" strokeWidth={2.2} aria-hidden="true" />}
    >
      <p className="mt-[10px] text-base leading-6 text-[#7a6655]">Hold on — we&apos;re talking to Paystack right now.</p>
      <ol className="mt-[29px] w-full max-w-[358px] space-y-[14px] rounded-2xl border-2 border-[#efe2d0] bg-[#fffdf9] px-[28px] py-[30px] text-left text-base" aria-live="polite">
        {steps.map((s, i) => {
          const state = i < done ? 'done' : i === done ? 'active' : 'waiting';
          return (
            <li key={s} className={cn('flex items-center gap-[14px]', state === 'done' ? 'text-[#0d5c3a]' : state === 'active' ? 'text-brand' : 'text-[#a89282]')}>
              {state === 'done' ? (
                <CircleCheck className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
              ) : state === 'active' ? (
                <Loader className="h-5 w-5 shrink-0 animate-[spin_2s_linear_infinite]" strokeWidth={2} aria-hidden="true" />
              ) : (
                <span className="h-5 w-5 shrink-0 rounded-full border-2 border-[#efd9bd]" aria-hidden="true" />
              )}
              {s}
              <span className="sr-only">{state === 'done' ? ' — done' : state === 'active' ? ' — in progress' : ''}</span>
            </li>
          );
        })}
      </ol>
    </StatusScreen>
  );
}
