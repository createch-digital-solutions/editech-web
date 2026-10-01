import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { heroTrianglePattern } from '@/lib/patterns';
import { DiamondMotif } from './diamond-motif';

const stats = [
  { value: '50K+', label: 'Active Learners' },
  { value: '500+', label: 'Expert Courses' },
  { value: '200+', label: 'Instructors' },
  { value: '4.9★', label: 'Avg Rating' },
];

const heroImageAlt =
  'A learner smiling while using a tablet, with an XP Earned Today card showing +320 XP and a 14-day streak card';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-night">
      {/* Triangle field on the right, fading in from the left. */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[480px] lg:block"
        style={{
          backgroundImage: heroTrianglePattern,
          backgroundPosition: 'right -5px top 0',
          maskImage: 'linear-gradient(to right, transparent 0, black 170px)',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1400px] px-6 pb-16 pt-12 lg:grid lg:grid-cols-[470px_1fr] lg:pb-0 lg:pl-[51px] lg:pr-0 lg:pt-[65px]">
        <div className="lg:pb-[88px] lg:pt-[3px]">
          <div className="relative inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-[18px] py-2 font-mono text-[11px] text-brand-light sm:whitespace-nowrap sm:text-[13px]">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            AI-Powered Learning &middot; 50,000+ Learners across Africa
            <DiamondMotif className="-right-[106px] -top-2 hidden h-10 w-10 lg:block" />
          </div>

          <h1 className="mt-[34px] font-display text-[52px] font-extrabold leading-[1.05] tracking-[-0.01em] text-white sm:text-[59px]">
            Learn.
            <br />
            <span className="bg-[linear-gradient(90deg,#c1440e_0%,#d4920a_130%)] bg-clip-text text-transparent">
              Build.
            </span>
            <br />
            Elevate.
          </h1>

          <div className="relative mx-auto my-6 w-full max-w-md lg:hidden">
            <Image
              src="/Container.png"
              alt={heroImageAlt}
              width={876}
              height={678}
              priority
              unoptimized
              className="h-auto w-full"
            />
          </div>

          <p className="mt-6 max-w-[400px] font-body text-[17px] leading-[30px] text-white/90 lg:mt-[22px]">
            Learn in-demand digital skills from Africa&apos;s best instructors and personalized by
            Aria, your AI coach.
          </p>

          <div className="mt-[35px] flex flex-wrap items-center gap-[13px]">
            <Link
              href="/sign-up"
              className="inline-flex h-12 w-[196px] cursor-pointer items-center justify-center gap-1 rounded-md bg-brand-gradient font-body text-[15px] font-semibold text-white shadow-lg shadow-brand/40 transition-opacity hover:opacity-90"
            >
              Start Learning Free
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
            </Link>
            <a
              href="#demo"
              className="inline-flex h-12 w-[181px] cursor-pointer items-center justify-center gap-2 rounded-md border border-white/40 font-body text-[15px] font-semibold text-white/90 transition-colors hover:bg-white/10"
            >
              <span aria-hidden="true" className="text-[13px]">
                ▶
              </span>
              Watch Demo
            </a>
          </div>

          <dl className="mt-[70px] flex flex-wrap gap-x-10 gap-y-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-2xl font-bold leading-8 text-[#e8a33d]">
                  {stat.value}
                </dd>
                <div className="mt-[7px] font-body text-xs text-white/85">{stat.label}</div>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative hidden self-start lg:block">
          <Image
            src="/Container.png"
            alt={heroImageAlt}
            width={876}
            height={678}
            priority
            unoptimized
            className="ml-auto h-auto w-full max-w-[876px]"
          />
        </div>
      </div>
    </section>
  );
}
