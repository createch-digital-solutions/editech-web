import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatPrice, type CourseBadge, type CourseSummary } from '@/lib/learner-data';
import { Stars } from './stars';

const badgeStyles: Record<CourseBadge, string> = {
  Bestseller: 'border-brand/30 bg-brand/15 text-brand',
  New: 'border-[#1e2a78]/30 bg-[#1e2a78]/15 text-[#1e2a78]',
  Free: 'border-green-700/30 bg-green-700/15 text-green-700',
};

const sizes = {
  // Catalogue grid (240px wide in the design).
  lg: {
    image: 'aspect-[240/215]',
    badge: 'left-[14px] top-[18px] px-3 py-[3px] text-[15px]',
    body: 'px-[21px] pb-[22px] pt-[22px]',
    title: 'text-[19px] leading-[27px] pr-3',
    instructor: 'mt-[9px] text-[17px] leading-6',
    rating: 'mt-[14px] gap-1.5',
    ratingText: 'text-base',
    students: 'text-[17px] leading-[25px]',
    stars: 'h-3.5 w-3.5',
    price: 'text-[24px]',
    enroll: 'h-[45px] px-[22px] text-[18px] rounded-xl',
    footer: 'pt-[12px]',
  },
  // Dashboard "Recommended for You" (186px wide).
  sm: {
    image: 'aspect-[186/152]',
    badge: 'left-[11px] top-[16px] px-2.5 py-0.5 text-[11px]',
    body: 'px-[15px] pb-[16px] pt-[19px]',
    title: 'text-[14px] leading-5',
    instructor: 'mt-[6px] text-[12px] leading-4',
    rating: 'mt-[11px] gap-[3px]',
    ratingText: 'text-[12px]',
    students: 'whitespace-nowrap text-[11.5px] leading-4',
    stars: 'h-2.5 w-2.5',
    price: 'text-[16px]',
    enroll: 'h-8 px-4 text-[12px] rounded-lg',
    footer: 'pt-[15px]',
  },
};

/** A course in a grid: photo with badge, title, instructor, rating, students, price and Enroll. */
export function CourseCard({ course, size = 'lg', priority }: { course: CourseSummary; size?: 'lg' | 'sm'; priority?: boolean }) {
  const s = sizes[size];
  const href = `/courses/${course.slug}`;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e8d5bb] bg-[#fffdf9] shadow-sm transition-shadow hover:shadow-md">
      <div className="relative">
        <Image
          src={course.image}
          alt={course.imageAlt}
          width={480}
          height={430}
          priority={priority}
          unoptimized
          className={cn('w-full object-cover', s.image)}
        />
        {course.badge && (
          <span className={cn('absolute rounded-full border font-body font-bold leading-[1.4]', s.badge, badgeStyles[course.badge])}>{course.badge}</span>
        )}
      </div>

      <div className={cn('flex flex-1 flex-col', s.body)}>
        <h3 className={cn('font-display font-bold text-[#1c0e04]', s.title)}>
          {/* The whole card is clickable; Enroll stays a separate, focusable link above it. */}
          <Link href={href} className="after:absolute after:inset-0 focus:outline-none">
            {course.title}
          </Link>
        </h3>
        <p className={cn('font-body text-[#7a6655]', s.instructor)}>{course.instructor}</p>

        <div className={cn('flex items-center', s.rating)}>
          <Stars rating={course.rating} className={s.stars} />
          <span className={cn('font-body font-bold text-[#d4920a]', s.ratingText)}>{course.rating.toFixed(1)}</span>
          <span className={cn('font-body text-[#a89282]', s.students, size === 'lg' && 'max-w-[4.5rem]')}>{course.students} students</span>
        </div>

        <div className={cn('mt-auto flex items-center justify-between gap-2', s.footer)}>
          <span className={cn('font-display font-bold', s.price, course.price === 0 ? 'text-[#0d5c3a]' : 'text-[#1c0e04]')}>
            {formatPrice(course.price)}
          </span>
          <Link
            href={`/checkout/${course.slug}`}
            className={cn(
              'relative z-10 flex items-center justify-center bg-brand-gradient font-body font-semibold text-white shadow-md shadow-brand/30 transition-opacity hover:opacity-90',
              s.enroll
            )}
          >
            Enroll
          </Link>
        </div>
      </div>
    </article>
  );
}
