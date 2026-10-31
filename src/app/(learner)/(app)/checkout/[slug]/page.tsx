import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getCourse } from '@/lib/courses-api';
import { viewerToken } from '@/lib/viewer-token';
import { CheckoutForm } from './checkout-form';

export const metadata: Metadata = { title: 'Complete your enrolment — Createch Elevate' };

/** /checkout/[slug] — pay for a course; a learner already enrolled goes straight to its lessons. */
export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourse(slug, await viewerToken());
  if (!course) notFound();
  if (course.enrolment) redirect(`/learn/${course.slug}`);

  return (
    <main className="learner-compact mx-auto w-full max-w-[1238px] flex-1 px-4 pb-[36px] pt-8 sm:px-6 lg:pl-[75px] lg:pr-[78px] lg:pt-[52px]">
      <h1 className="font-display text-[30px] font-extrabold leading-[44px] text-[#1c0e04] sm:text-[36px]">Complete your enrolment</h1>
      <CheckoutForm course={course} />
    </main>
  );
}
