import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice, type CourseBadge, type CourseSummary } from '@/lib/learner-data';

const badgeStyles: Record<CourseBadge, string> = {
  Bestseller: 'border-brand/30 bg-brand/15 text-brand',
  New: 'border-[#1e2a78]/30 bg-[#1e2a78]/15 text-[#1e2a78]',
  Free: 'border-green-700/30 bg-green-700/15 text-green-700',
};

/** The most-enrolled published courses (GET /courses sorted by enrolments); hidden when there are none. */
export function PopularCourses({ courses }: { courses: CourseSummary[] }) {
  if (courses.length === 0) return null;
  return (
    <section className="bg-[#fdf6ec] px-6 pb-[70px] pt-[75px]">
      <div className="mx-auto max-w-[1058px]">
        <h2 className="text-center font-display text-[32px] font-extrabold leading-10 tracking-[-0.01em] text-[#1c0e04]">
          Popular Courses
        </h2>

        <div className="mx-auto mt-[29px] grid max-w-[248px] gap-[22px] sm:max-w-[518px] sm:grid-cols-2 lg:max-w-none lg:grid-cols-4">
          {courses.map((course) => (
            <article
              key={course.id}
              className="relative flex flex-col overflow-hidden rounded-2xl border border-[#e8d5bb] bg-[#fffdf9] shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative">
                <Image src={course.image} alt={course.imageAlt} width={248} height={140} unoptimized className="aspect-[248/140] w-full object-cover" />
                {/* Left-side tint with a hard edge at 61.3%, matching the design (same pattern as the showcase cards). */}
                <div className="absolute inset-y-0 left-0 w-[61.3%] bg-gradient-to-t from-[#1c1008]/50 to-transparent to-50%" />
                {course.badge && (
                  <span
                    className={cn(
                      'absolute left-3 top-[11px] rounded-full border px-2.5 py-1 font-body text-[10px] font-bold leading-[14px]',
                      badgeStyles[course.badge]
                    )}
                  >
                    {course.badge}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col px-[14px] pb-[13px] pt-[15px]">
                <h3 className="font-display text-[13px] font-bold leading-[17px] text-[#1c0e04]">
                  <Link href={`/courses/${course.slug}`} className="after:absolute after:inset-0 focus:outline-none">
                    {course.title}
                  </Link>
                </h3>
                <p className="mt-[9px] font-body text-[11px] leading-4 text-[#7a6655]">{course.instructor}</p>

                <div className="mt-2 flex items-center justify-between px-[30px]">
                  <div className="flex items-center gap-[5px]">
                    <div className="flex gap-px" aria-label={`Rated ${course.rating.toFixed(1)} out of 5`}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          aria-hidden="true"
                          className={cn('h-[9px] w-[9px] text-brand-light', n <= Math.floor(course.rating) && 'fill-brand-light')}
                        />
                      ))}
                    </div>
                    <span className="font-body text-[11px] font-bold text-brand-light">{course.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-right font-body text-[11px] leading-[18px] text-[#ad9989]">
                    {course.students}
                    <br />
                    students
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between pt-[6px]">
                  <span className={cn('font-display text-base font-bold', course.price === 0 ? 'text-[#0d5c3a]' : 'text-[#1c0e04]')}>{formatPrice(course.price)}</span>
                  <Link
                    href={`/checkout/${course.slug}`}
                    className="relative z-10 flex h-7 w-[58px] items-center justify-center rounded-md bg-brand-gradient font-body text-xs font-semibold text-white shadow-md shadow-brand/30 transition-opacity hover:opacity-90"
                  >
                    Enroll
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
