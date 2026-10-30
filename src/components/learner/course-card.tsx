import Image from 'next/image';
import Link from 'next/link';
import { ChartNoAxesColumnIncreasing, CirclePlay, Clock, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDuration, formatPrice, LEVEL_LABELS, type CourseBadge, type CourseSummary } from '@/lib/learner-data';
import { Stars } from './stars';

const badgeStyles: Record<CourseBadge, string> = {
  Bestseller: 'border-brand/30 bg-brand/15 text-brand',
  New: 'border-[#1e2a78]/30 bg-[#1e2a78]/15 text-[#1e2a78]',
  Free: 'border-green-700/30 bg-green-700/15 text-green-700',
};

/** Solid versions for the phone card, where the badge sits on the photo. */
const solidBadgeStyles: Record<CourseBadge, string> = {
  Bestseller: 'bg-[#fbd9cc] text-[#9a3409]',
  New: 'bg-[#dfe3fb] text-[#1e2a78]',
  Free: 'bg-[#d3eedd] text-[#0d5c3a]',
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

/** A course in the phone catalogue: wide photo with badge, title, description, then lessons, level and length. */
export function CourseMobileCard({ course, priority }: { course: CourseSummary; priority?: boolean }) {
  const meta = [
    course.lessons !== undefined && { icon: CirclePlay, label: `${course.lessons} ${course.lessons === 1 ? 'lesson' : 'lessons'}` },
    course.level && { icon: ChartNoAxesColumnIncreasing, label: LEVEL_LABELS[course.level] },
    course.durationMinutes !== undefined && { icon: Clock, label: formatDuration(course.durationMinutes) },
  ].filter((m): m is { icon: LucideIcon; label: string } => !!m);
  return (
    <article className="relative overflow-hidden rounded-2xl border border-[#efe2d0] bg-[#fffdf9] shadow-sm">
      <div className="relative">
        <Image src={course.image} alt={course.imageAlt} width={686} height={322} priority={priority} unoptimized className="aspect-[343/161] w-full object-cover" />
        {course.badge && (
          <span className={cn('absolute left-3 top-3 rounded-full px-3 py-[3px] font-body text-[13px] font-bold leading-[1.4]', solidBadgeStyles[course.badge])}>{course.badge}</span>
        )}
      </div>
      <div className="px-4 pb-4 pt-3.5">
        <h3 className="font-display text-[17px] font-bold leading-6 text-[#1c0e04]">
          <Link href={`/courses/${course.slug}`} className="after:absolute after:inset-0 focus:outline-none">
            {course.title}
          </Link>
        </h3>
        {course.description && <p className="mt-1 line-clamp-2 font-body text-[14px] leading-[21px] text-[#7a6655]">{course.description}</p>}
        {meta.length > 0 && (
          <ul className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-2 font-body text-[14px] text-[#7a6655]">
            {meta.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-1.5">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

/** A course in the phone list view: small photo on the left, then title, instructor, level, lessons and length. */
export function CourseMobileRow({ course, priority }: { course: CourseSummary; priority?: boolean }) {
  const meta = [
    course.level && LEVEL_LABELS[course.level],
    course.lessons !== undefined && `${course.lessons} ${course.lessons === 1 ? 'lesson' : 'lessons'}`,
    course.durationMinutes !== undefined && formatDuration(course.durationMinutes),
  ].filter(Boolean);
  return (
    <article className="relative flex gap-3 rounded-2xl border border-[#efe2d0] bg-[#fffdf9] p-2.5 shadow-sm">
      <div className="relative w-[112px] shrink-0 overflow-hidden rounded-xl">
        <Image src={course.image} alt={course.imageAlt} width={224} height={192} priority={priority} unoptimized className="aspect-[112/96] h-full w-full object-cover" />
        {course.badge && (
          <span className={cn('absolute left-1.5 top-1.5 rounded-full px-2 py-px font-body text-[10.5px] font-bold leading-[1.4]', solidBadgeStyles[course.badge])}>{course.badge}</span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <h3 className="line-clamp-2 font-display text-[15px] font-bold leading-5 text-[#1c0e04]">
          <Link href={`/courses/${course.slug}`} className="after:absolute after:inset-0 focus:outline-none">
            {course.title}
          </Link>
        </h3>
        <p className="mt-0.5 truncate font-body text-[13px] text-[#7a6655]">{course.instructor}</p>
        {meta.length > 0 && <p className="mt-auto pt-1.5 font-body text-[12.5px] text-[#7a6655]">{meta.join(' · ')}</p>}
      </div>
    </article>
  );
}

/** A course as a catalogue list row: photo, level and category, title, instructor, description, rating, then price and Enroll. */
export function CourseListItem({ course, categoryLabel, priority }: { course: CourseSummary; categoryLabel?: string; priority?: boolean }) {
  const href = `/courses/${course.slug}`;
  const chip = 'rounded-full bg-[#f3ebe0] px-[11px] py-1 font-body text-[15px] font-semibold text-[#3d2b1f]';
  return (
    <article className="group relative flex flex-col gap-5 rounded-2xl border border-[#e8d5bb] bg-[#fffdf9] p-[17px] shadow-sm transition-shadow hover:shadow-md min-[768px]:flex-row min-[768px]:items-stretch min-[768px]:gap-[25px]">
      <div className="relative shrink-0 overflow-hidden rounded-[15px] min-[768px]:w-[295px]">
        <Image src={course.image} alt={course.imageAlt} width={590} height={376} priority={priority} unoptimized className="aspect-[295/188] w-full object-cover min-[768px]:h-full" />
        {course.badge && (
          <span className={cn('absolute left-3 top-3 rounded-full border px-3 py-[3px] font-body text-[15px] font-bold leading-[1.4]', badgeStyles[course.badge])}>{course.badge}</span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col py-1">
        {(course.level || categoryLabel) && (
          <div className="flex flex-wrap gap-2">
            {course.level && <span className={chip}>{LEVEL_LABELS[course.level]}</span>}
            {categoryLabel && <span className={chip}>{categoryLabel}</span>}
          </div>
        )}
        <h3 className="mt-[10px] font-display text-[22px] font-bold leading-[30px] text-[#1c0e04]">
          <Link href={href} className="after:absolute after:inset-0 focus:outline-none">
            {course.title}
          </Link>
        </h3>
        <p className="mt-1 font-body text-[16px] text-[#7a6655]">{course.instructor}</p>
        {course.description && <p className="mt-2 line-clamp-2 max-w-[700px] font-body text-[17px] leading-[26px] text-[#3d2b1f]">{course.description}</p>}
        <div className="mt-auto flex items-center gap-1.5 pt-3">
          <Stars rating={course.rating} />
          <span className="font-body text-base font-bold text-[#b07708]">{course.rating.toFixed(1)}</span>
          <span className="font-body text-[16px] text-[#7a6655]">· {course.students} students</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 min-[768px]:w-[175px] min-[768px]:flex-col min-[768px]:flex-nowrap min-[768px]:items-end min-[768px]:justify-center">
        <span className={cn('font-display text-[27px] font-bold', course.price === 0 ? 'text-[#0d5c3a]' : 'text-[#1c0e04]')}>{formatPrice(course.price)}</span>
        <div className="flex items-center gap-4 min-[768px]:flex-col min-[768px]:items-end min-[768px]:gap-3">
          <Link
            href={`/checkout/${course.slug}`}
            className="relative z-10 flex h-[50px] w-[165px] items-center justify-center rounded-xl bg-brand-gradient font-body text-[18px] font-semibold text-white shadow-md shadow-brand/30 transition-opacity hover:opacity-90"
          >
            Enroll
          </Link>
          {/* The whole row opens the course; on phones the label is left out to save room. */}
          <span aria-hidden="true" className="hidden font-body text-[17px] font-semibold text-brand underline underline-offset-4 group-hover:text-brand-light min-[768px]:inline">
            View course
          </span>
        </div>
      </div>
    </article>
  );
}
