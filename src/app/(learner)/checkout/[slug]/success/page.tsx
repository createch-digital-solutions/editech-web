import { notFound } from 'next/navigation';
import { getCourse } from '@/lib/courses-api';
import { viewerToken } from '@/lib/viewer-token';
import { SuccessView } from './success-view';

/** /checkout/[slug]/success — enrolment confirmed: the course, amount, Paystack reference and date. */
export default async function PaymentSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ reference?: string }>;
}) {
  const [{ slug }, { reference }] = await Promise.all([params, searchParams]);
  const course = await getCourse(slug, await viewerToken());
  if (!course) notFound();
  const enrolledAt = course.enrolment?.enrolledAt ? new Date(course.enrolment.enrolledAt) : new Date();
  return (
    <SuccessView
      slug={course.slug}
      title={course.title}
      price={course.price}
      reference={reference ?? ''}
      date={enrolledAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
    />
  );
}
