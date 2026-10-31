'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CircleCheck, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusScreen } from '@/components/learner/status-screen';
import { useApiClient } from '@/hooks/use-api-client';

const STEPS = ['Payment sent to Paystack', 'Waiting for Paystack to confirm', 'Completing enrolment'];
const POLL_MS = 3000;
/** How long to keep checking before suggesting the learner comes back later. */
const GIVE_UP_MS = 90_000;

/**
 * /checkout/[slug]/processing — where Paystack returns the learner. Paystack confirms the payment to the
 * API (webhook), which then enrols the learner, so this checks the course's `learnerEnrolment`
 * (GET /courses/{slug}) until it appears, then shows the receipt.
 */
export default function ProcessingPaymentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const search = useSearchParams();
  const api = useApiClient();
  const [attempt, setAttempt] = useState(0);
  const [enrolled, setEnrolled] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  // Paystack adds ?reference=… (and trxref) to the return link.
  const reference = search.get('reference') ?? search.get('trxref') ?? '';

  useEffect(() => {
    if (!api.isLoaded || !api.isSignedIn || enrolled || timedOut) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const course = await api.get<{ learnerEnrolment?: unknown }>(`/courses/${encodeURIComponent(slug)}`);
        if (cancelled) return;
        if (course?.learnerEnrolment) {
          setEnrolled(true);
          router.replace(`/checkout/${slug}/success?${new URLSearchParams(reference ? { reference } : {})}`);
          return;
        }
      } catch {
        // A failed check is retried on the next round.
      }
      if (cancelled) return;
      if ((attempt + 1) * POLL_MS >= GIVE_UP_MS) setTimedOut(true);
      else setAttempt((a) => a + 1);
    }, attempt === 0 ? 0 : POLL_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [api, attempt, enrolled, timedOut, slug, reference, router]);

  const done = enrolled ? 3 : 1;

  return (
    <StatusScreen
      tone="brand"
      title={timedOut ? 'Still waiting for Paystack' : 'Processing Payment...'}
      icon={<Loader className={cn('h-9 w-9', !timedOut && 'animate-[spin_2s_linear_infinite]')} strokeWidth={2.2} aria-hidden="true" />}
    >
      <p className="mt-[10px] text-base leading-6 text-[#7a6655]">
        {timedOut
          ? 'Paystack hasn’t confirmed your payment yet. If money left your account, your enrolment will appear as soon as it does.'
          : 'Hold on — we’re waiting for Paystack to confirm your payment.'}
      </p>
      <ol className="mt-[29px] w-full max-w-[358px] space-y-[14px] rounded-2xl border-2 border-[#efe2d0] bg-[#fffdf9] px-[28px] py-[30px] text-left text-base" aria-live="polite">
        {STEPS.map((s, i) => {
          const state = i < done ? 'done' : i === done && !timedOut ? 'active' : 'waiting';
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
      {timedOut && (
        <div className="mt-[24px] flex flex-wrap justify-center gap-[13px]">
          <button
            type="button"
            onClick={() => {
              setTimedOut(false);
              setAttempt(0);
            }}
            className="flex h-[45px] cursor-pointer items-center rounded-xl bg-brand-gradient px-[24px] text-[15px] font-bold text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90"
          >
            Check again
          </button>
          <Link href={`/courses/${slug}`} className="flex h-[45px] items-center rounded-xl border-2 border-[#efe2d0] bg-[#fffdf9] px-[16px] text-[14px] font-semibold text-[#3d2b1f] transition-colors hover:bg-white">
            Back to the course
          </Link>
        </div>
      )}
    </StatusScreen>
  );
}
