import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BarChart3, CalendarDays, ChevronRight, CircleCheck, Clock, PlayCircle, Star, Users } from 'lucide-react';
import { DiamondMotif } from '@/components/landing/diamond-motif';
import { PersonAvatar } from '@/components/learner/person-avatar';
import { Stars } from '@/components/learner/stars';
import { getCourse, getPreviewVideos, getReviews } from '@/lib/courses-api';
import { formatPrice, LEVEL_LABELS } from '@/lib/learner-data';
import { viewerToken } from '@/lib/viewer-token';
import { CourseTabs } from './course-tabs';
import { PreviewButton, PreviewCover, PreviewProvider, type PreviewLesson } from './course-preview';
import { EnrollBar } from './enroll-bar';

const INCLUDED = ['Full lifetime access', 'Certificate of completion', 'AI Learning Coach (Aria)', 'Downloadable resources'];

type Params = { params: Promise<{ slug: string }> };

/** "12 Oct 2026". */
const longDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  // The page itself shows the error screen when the API is down; the title just falls back.
  const course = await getCourse(slug).catch(() => undefined);
  if (course === undefined) return {};
  if (!course) return { title: 'Course not found — Createch Elevate' };
  return { title: `${course.fullTitle} — Createch Elevate`, description: course.description };
}

/**
 * /courses/[slug] — one course, laid out like a Udemy course page: a dark hero (breadcrumb, title,
 * description, badges, instructor, details), a purchase card on the right that overlaps the hero and
 * stays in view while scrolling, a stats strip, then curriculum, instructor and reviews. The cover
 * opens the free preview lessons in a pop-up.
 */
export default async function CoursePage({ params }: Params) {
  const { slug } = await params;
  const course = await getCourse(slug, await viewerToken());
  if (!course) notFound();
  const [reviews, videos] = await Promise.all([getReviews(course.id), getPreviewVideos(course.slug)]);
  const previews: PreviewLesson[] = course.curriculum.flatMap((s) => s.lessons).flatMap((l) => (videos[l.id] ? [{ id: l.id, title: l.title, duration: l.duration, url: videos[l.id] }] : []));
  const lessonCount = course.curriculum.reduce((n, s) => n + s.lessons.length, 0);
  const published = longDate(course.createdAt);
  const discount = course.originalPrice && course.originalPrice > course.price ? Math.round((1 - course.price / course.originalPrice) * 100) : 0;
  const enrolHref = course.enrolment ? `/learn/${course.slug}` : `/checkout/${course.slug}`;
  const enrolLabel = course.enrolment ? 'Continue Learning' : course.price === 0 ? 'Enroll for Free' : 'Enroll Now';

  return (
    <main className="relative flex-1 overflow-x-clip">
      {/* The hero starts at the top of the page, so the motif sits in its top-left corner. */}
      <DiamondMotif className="left-[6px] top-[8px] z-10 h-[76px] w-[76px]" />
      <div className="mx-auto grid max-w-[1240px] px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-x-12 lg:px-10">
        {/* Hero: its brand-night band is stretched to the screen edges by a wide layer behind it. */}
        <section id="course-hero" className="relative isolate pb-24 pt-7 text-white sm:pt-10 lg:col-start-1 lg:row-start-1 lg:py-12">
          <div className="absolute inset-y-0 -left-[100vmax] -right-[100vmax] -z-10 bg-brand-night" aria-hidden="true" />
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-[#f0b765] sm:text-[14px]">
            <Link href="/courses" className="hover:text-white">
              Explore
            </Link>
            {course.categoryLabel && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-white/40" aria-hidden="true" />
                <Link href="/courses" className="hover:text-white">
                  {course.categoryLabel}
                </Link>
              </>
            )}
          </nav>

          <h1 className="type-hero-title mt-3 sm:mt-4">{course.fullTitle}</h1>
          {course.description && <p className="mt-3 max-w-[680px] text-[15px] leading-6 text-white/80 sm:mt-4 sm:text-[18px] sm:leading-[28px]">{course.description}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5 sm:gap-2.5">
            {course.badge === 'Bestseller' && <span className="rounded-md bg-[#f6d9a8] px-2 py-0.5 text-[12px] font-bold sm:px-2.5 sm:py-1 sm:text-[13px] text-[#6b4204]">Bestseller</span>}
            {course.price === 0 && <span className="rounded-md bg-[#c9ecd6] px-2 py-0.5 text-[12px] font-bold sm:px-2.5 sm:py-1 sm:text-[13px] text-[#0b4f31]">Free</span>}
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-[12px] font-bold sm:px-2.5 sm:py-1 sm:text-[13px] text-white">{LEVEL_LABELS[course.level]}</span>
            <span className="flex flex-wrap items-center gap-x-1.5 text-[14px] sm:text-[15px]">
              <span className="font-bold text-[#f0b765]">{course.rating.toFixed(1)}</span>
              <Star className="h-4 w-4 fill-[#f0b765] text-[#f0b765]" aria-hidden="true" />
              <span className="text-white/70">({course.ratingsCount} ratings)</span>
              <span className="text-white/70">· {course.studentsCount} learners</span>
            </span>
          </div>

          <p className="mt-4 flex items-center gap-3 text-[14px] text-white/80 sm:mt-5 sm:text-[16px]">
            <PersonAvatar name={course.instructor} src={course.instructorImage} size={36} />
            <span>
              Created by <span className="font-semibold text-[#f0b765]">{course.instructor}</span>
            </span>
          </p>

          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-white/80 sm:mt-5 sm:gap-x-6 sm:gap-y-2 sm:text-[15px]">
            {(course.updated || published) && (
              <li className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                {course.updated ? `Last updated ${course.updated}` : `Published ${published}`}
              </li>
            )}
            {lessonCount > 0 && (
              <li className="flex items-center gap-2">
                <PlayCircle className="h-4 w-4" aria-hidden="true" />
                {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}
              </li>
            )}
            {course.duration && (
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4" aria-hidden="true" />
                {course.duration} total
              </li>
            )}
          </ul>
        </section>

        {/* Purchase card: overlaps the hero (rising into it on phones and tablets) and, on desktop, stays in view while scrolling. */}
        <aside id="enrol-card" className="relative z-10 -mt-16 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-10" aria-label="Enrol">
          <div className="overflow-hidden rounded-2xl border border-[#e8dccb] bg-white shadow-[0_24px_60px_-28px_rgba(28,14,4,0.45)] lg:sticky lg:top-24">
            <PreviewProvider title={course.title} lessons={previews}>
              <PreviewCover src={course.image} alt={course.imageAlt} foldAfter="course-hero" />
              <div className="px-4 pb-4 pt-3.5 sm:px-5 sm:pb-5 sm:pt-4">
                <div className="flex items-baseline gap-3">
                  <p className="font-display text-[24px] font-extrabold leading-8 text-[#1c0e04] sm:text-[26px]">{formatPrice(course.price)}</p>
                  {discount > 0 && (
                    <p className="text-[15px] text-[#7a6655]">
                      <span className="line-through">{formatPrice(course.originalPrice!)}</span> <span className="font-semibold text-[#b42318]">{discount}% off</span>
                    </p>
                  )}
                </div>
                <Link
                  href={enrolHref}
                  className="mt-3 flex h-11 items-center justify-center rounded-lg bg-brand-gradient font-body text-[15px] font-bold text-white shadow-md shadow-brand/30 transition-opacity hover:opacity-90"
                >
                  {enrolLabel}
                </Link>
                {!course.enrolment && (
                  // Phones and tablets preview from the cover just above; on desktop the cover folds away while scrolling.
                  <PreviewButton className="mt-2 hidden h-11 w-full items-center lg:flex justify-center rounded-lg border border-[#1c0e04] font-body text-[15px] font-bold text-[#1c0e04] transition-colors hover:bg-[#fbf6ef]">
                    Preview this course
                  </PreviewButton>
                )}
                <h2 className="mt-4 font-display text-[14px] font-bold text-[#1c0e04] sm:mt-5">This course includes:</h2>
                <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2 lg:grid-cols-1">
                  {INCLUDED.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px] leading-[18px] text-[#3d2b1f] sm:text-[14px]">
                      <CircleCheck className="mt-px h-4 w-4 shrink-0 text-[#0d5c3a]" strokeWidth={2} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </PreviewProvider>
          </div>
        </aside>

        {/* Stats strip and details */}
        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl sm:mt-8 border border-[#e8dccb] bg-white sm:grid-cols-4">
            <div className="flex flex-col items-center justify-center border-b border-r border-[#efe5d8] px-3 py-3.5 text-center sm:px-4 sm:py-5 sm:border-b-0">
              <p className="sr-only">Rating</p>
              <p className="font-display text-[22px] font-bold leading-7 text-[#1c0e04] sm:text-[26px] sm:leading-8">{course.rating.toFixed(1)}</p>
              <div className="mt-1">
                <Stars rating={course.rating} />
              </div>
              <p className="mt-0.5 text-[12px] text-[#7a6655] sm:mt-1 sm:text-[13px]">{course.ratingsCount} ratings</p>
            </div>
            <div className="flex flex-col items-center justify-center border-b border-[#efe5d8] px-3 py-3.5 text-center sm:px-4 sm:py-5 sm:border-b-0 sm:border-r">
              <Users className="h-5 w-5 text-[#3d2b1f] sm:h-6 sm:w-6" strokeWidth={1.8} aria-hidden="true" />
              <p className="order-last mt-0.5 text-[12px] text-[#7a6655] sm:mt-1 sm:text-[13px]">learners</p>
              <p className="mt-1 font-display text-[17px] font-bold text-[#1c0e04] sm:text-[20px]">{course.studentsCount}</p>
            </div>
            <div className="flex flex-col items-center justify-center border-r border-[#efe5d8] px-3 py-3.5 text-center sm:px-4 sm:py-5">
              <PlayCircle className="h-5 w-5 text-[#3d2b1f] sm:h-6 sm:w-6" strokeWidth={1.8} aria-hidden="true" />
              <p className="order-last mt-0.5 text-[12px] text-[#7a6655] sm:mt-1 sm:text-[13px]">{course.duration ? `lessons · ${course.duration}` : 'lessons'}</p>
              <p className="mt-1 font-display text-[17px] font-bold text-[#1c0e04] sm:text-[20px]">{lessonCount}</p>
            </div>
            <div className="flex flex-col items-center justify-center px-3 py-3.5 text-center sm:px-4 sm:py-5">
              <BarChart3 className="h-5 w-5 text-[#3d2b1f] sm:h-6 sm:w-6" strokeWidth={1.8} aria-hidden="true" />
              <p className="order-last mt-0.5 text-[12px] text-[#7a6655] sm:mt-1 sm:text-[13px]">level</p>
              <p className="mt-1 font-display text-[17px] font-bold text-[#1c0e04] sm:text-[20px]">{LEVEL_LABELS[course.level]}</p>
            </div>
          </div>

          <CourseTabs course={course} reviews={reviews} />
        </div>
      </div>

      <EnrollBar
        watch="enrol-card"
        title={course.title}
        price={formatPrice(course.price)}
        oldPrice={discount > 0 ? formatPrice(course.originalPrice!) : undefined}
        href={enrolHref}
        cta={enrolLabel}
      />
    </main>
  );
}
