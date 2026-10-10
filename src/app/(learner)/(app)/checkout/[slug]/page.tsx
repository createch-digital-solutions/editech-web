import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCourse } from '@/lib/courses-api';
import { CheckoutForm } from './checkout-form';

export const metadata: Metadata = { title: 'Complete your enrolment — Createch Elevate' };

/** /checkout/[slug] — pay for (or enrol free in) a course. */
export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ method?: string }>;
}) {
  const [{ slug }, { method }] = await Promise.all([params, searchParams]);
  const result = await getCourse(slug);
  if (!result) notFound();

  return (
    <main className="mx-auto w-full max-w-[1238px] flex-1 px-4 pb-[36px] pt-8 sm:px-6 lg:pl-[75px] lg:pr-[78px] lg:pt-[52px]">
      <h1 className="font-display text-[30px] font-extrabold leading-[44px] text-[#1c0e04] sm:text-[36px]">Complete your enrolment</h1>
      <CheckoutForm course={result.course} initialMethod={method === 'bank' || method === 'ussd' ? method : 'card'} />
    </main>
  );
}
