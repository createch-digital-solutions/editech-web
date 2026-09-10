import { Bot, GraduationCap, Monitor, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Monitor,
    iconBg: 'bg-blue-50 text-blue-500',
    title: 'Built for African Data',
    description:
      'Optimized for intermittent connections. Study on commute, offline, or in low-bandwidth conditions.',
  },
  {
    icon: Bot,
    iconBg: 'bg-orange-50 text-orange-500',
    title: 'Aria AI Coach',
    description:
      'Your personal AI tutor knows where you are and guides the next step in Yoruba, Igbo, or English.',
  },
  {
    icon: Trophy,
    iconBg: 'bg-amber-50 text-amber-500',
    title: 'Earn as You Learn',
    description:
      'XP, badges, streaks, and verifiable certificates — every milestone means something.',
  },
  {
    icon: GraduationCap,
    iconBg: 'bg-green-50 text-green-600',
    title: 'Expert Instructors',
    description:
      'Learn from Nigerian and pan-African professionals with industry-proven experience.',
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-[#fdf6ec] py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-gray-200/70 px-3 py-1 text-xs font-semibold tracking-wider text-gray-600">
            WHY CREATECH ELEVATE
          </span>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900">
            Everything you need to level up
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm"
            >
              <span
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-xl',
                  feature.iconBg
                )}
              >
                <feature.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-bold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
