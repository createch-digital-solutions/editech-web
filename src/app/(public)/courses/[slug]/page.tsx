import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CircleCheck, Clock, Play, Star, Users } from 'lucide-react';
import { DiamondMotif } from '@/components/landing/diamond-motif';
import { getCourse, getReviews } from '@/lib/courses-api';
import { formatPrice } from '@/lib/learner-data';
import { CourseTabs } from './course-tabs';

const LEVEL_LABEL = { BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced' } as const;

const INCLUDED = ['Full lifetime access', 'Certificate of completion', 'AI Learning Coach (Aria)', 'Downloadable resources'];

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCourse(slug);
  if (!result) return { title: 'Course not found — Createch Elevate' };
  return { title: `${result.course.fullTitle} — Createch Elevate`, description: result.course.description };
}

/** /courses/[slug] — one course: what it is, price, what's included, outcomes, curriculum and instructor. */
export default async function CoursePage({ params }: Params) {
  const { slug } = await params;
  const result = await getCourse(slug);
  if (!result) notFound();
  const { course, isSample } = result;
  const reviews = isSample ? [] : await getReviews(course.id);
  const discount = course.originalPrice && course.originalPrice > course.price ? Math.round((1 - course.price / course.originalPrice) * 100) : 0;

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden bg-brand-night">
        <DiamondMotif className="left-[6px] top-[8px] h-[76px] w-[76px]" />
        <div className="relative mx-auto grid max-w-[1238px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_359px] lg:gap-[60px] lg:pb-[44px] lg:pl-[153px] lg:pr-[77px] lg:pt-[46px]">
          <div className="max-w-[440px] lg:pb-10">
            <div className="flex flex-wrap gap-[9px]">
              {course.badge && course.badge !== 'Free' && (
                <span className="rounded-full border border-[#d4920a]/40 bg-[#d4920a]/15 px-[11px] py-[4px] text-[12px] font-bold text-[#e8a33d]">{course.badge}</span>
              )}
              <span className="rounded-full border border-[#1e2a78]/50 bg-[#1e2a78]/25 px-[11px] py-[4px] text-[12px] font-bold text-[#3b4bb8]">
                {LEVEL_LABEL[course.level]}
              </span>
            </div>
            <h1 className="mt-[18px] max-w-[390px] font-display text-[30px] font-extrabold leading-[40px] text-white sm:text-[36px] sm:leading-[46px]">{course.fullTitle}</h1>
            {course.description && <p className="mt-[16px] text-[18px] leading-[30px] text-[#8a7462]">{course.description}</p>}

            <ul className="mt-[24px] flex flex-wrap gap-x-[30px] gap-y-3 text-base leading-6 text-[#8a7462] lg:flex-nowrap lg:gap-x-[36px]">
              <li className="flex max-w-[105px] gap-[8px]">
                <Star className="mt-[11px] h-3.5 w-3.5 shrink-0 fill-[#d4920a] text-[#d4920a]" aria-hidden="true" />
                <span>
                  {course.rating.toFixed(1)} · {course.ratingsCount} ratings
                </span>
              </li>
              <li className="flex max-w-[92px] gap-[8px]">
                <Users className="mt-[6px] h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{course.studentsCount} students</span>
              </li>
              {course.duration && (
                <li className="flex max-w-[160px] shrink-0 gap-[8px]">
                  <Clock className="mt-[6px] h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>
                    {course.duration}
                    {course.updated && ` · Updated ${course.updated}`}
                  </span>
                </li>
              )}
            </ul>

            <p className="mt-[30px] flex items-center gap-[13px] text-[17px] text-[#8a7462]">
              <Image src={course.instructorImage} alt="" width={44} height={44} unoptimized className="h-11 w-11 rounded-full object-cover" />
              <span>
                Created by <span className="font-semibold text-[#e8a33d]">{course.instructor}</span>
              </span>
            </p>
          </div>

          <aside className="overflow-hidden rounded-2xl border border-[#e8d5bb] bg-[#fffdf9] shadow-xl lg:self-start" aria-label="Enrol">
            <Link href={`/learn/${course.slug}`} className="group relative block" aria-label="Watch the free preview">
              <Image src={course.image} alt={course.imageAlt} width={718} height={410} unoptimized priority className="aspect-[359/205] w-full object-cover" />
              <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform group-hover:scale-105">
                <Play className="ml-1 h-6 w-6 fill-[#1c0e04] text-[#1c0e04]" aria-hidden="true" />
              </span>
            </Link>
            <div className="px-[25px] pb-[28px] pt-[30px]">
              <p className="font-display text-[33px] font-extrabold leading-10 text-[#1c0e04]">{formatPrice(course.price)}</p>
              {discount > 0 && (
                <p className="mt-[6px] text-[14px] text-[#c0392b]">
                  <span className="line-through">
                    {formatPrice(course.originalPrice!)} · {discount}% off
                  </span>
                </p>
              )}
              <Link
                href={`/checkout/${course.slug}`}
                className="mt-[21px] flex h-[54px] items-center justify-center rounded-xl bg-brand-gradient font-body text-[17px] font-bold text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90"
              >
                {course.price === 0 ? 'Enroll for Free' : 'Enroll Now'}
              </Link>
              <Link
                href={`/learn/${course.slug}`}
                className="mt-[12px] flex h-[46px] items-center justify-center rounded-xl border-2 border-brand font-body text-[16px] font-semibold text-brand transition-colors hover:bg-[#fdeee4]"
              >
                Try Free Preview
              </Link>
              <ul className="mt-[23px] space-y-[11px]">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-center gap-[10px] text-base text-[#3d2b1f]">
                    <CircleCheck className="h-4 w-4 shrink-0 text-[#0d5c3a]" strokeWidth={2} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <CourseTabs course={course} reviews={reviews} />
    </main>
  );
}
