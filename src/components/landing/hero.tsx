import Image from 'next/image';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

const stats = [
  { value: '50K+', label: 'Active Learners' },
  { value: '500+', label: 'Expert Courses' },
  { value: '200+', label: 'Instructors' },
  { value: '4.9★', label: 'Avg Rating' },
];

const trianglePattern =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='52' viewBox='0 0 60 52'%3E%3Cpolygon points='30,2 58,50 2,50' fill='none' stroke='white' stroke-opacity='0.08' stroke-width='1.5'/%3E%3C/svg%3E\")";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#241a12] via-[#1e2740] to-[#1a2a52] py-16 sm:py-20 lg:py-28">
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-60 lg:block"
        style={{ backgroundImage: trianglePattern, backgroundSize: '60px 52px' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-medium text-orange-200">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            AI-Powered Learning &middot; 50,000+ Learners across Africa
          </div>

          <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
            Learn.
            <br />
            <span className="text-orange-500">Build.</span>
            <br />
            Elevate.
          </h1>

          <p className="mt-6 max-w-md text-lg text-gray-300">
            Learn in-demand digital skills from Africa&apos;s best instructors and personalized by
            Aria, your AI coach.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="/sign-up"
              className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
            >
              Start Learning Free
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#demo"
              className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              Watch Demo
            </a>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-y-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-2xl font-bold text-white">{stat.value}</dd>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <Image
            src="/Container.png"
            alt="A learner smiling while using a tablet, with an XP Earned Today card showing +320 XP and a 14-day streak card"
            width={876}
            height={678}
            priority
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
