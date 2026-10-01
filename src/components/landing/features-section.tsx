import { Bot, GraduationCap, Monitor, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

// Line breaks and the gap above each description follow the design exactly.
const features = [
  {
    icon: Monitor,
    iconStyle: 'bg-[#faeee4] text-brand',
    title: 'Built for African Data',
    description:
      'Optimized for intermittent\nconnections.\nStudy on commute, offline, or\nin low-bandwidth conditions.',
    descriptionGap: 'mt-[41px]',
  },
  {
    icon: Bot,
    iconStyle: 'bg-[#eeecea] text-[#1b2b6b]',
    title: 'Aria AI Coach',
    description:
      'Your personal AI tutor\nknows where you are and\nguides the next step in\nYoruba, Igbo, or English.',
    descriptionGap: 'mt-[8px]',
  },
  {
    icon: Trophy,
    iconStyle: 'bg-[#fbf4e4] text-brand-light',
    title: 'Earn as You Learn',
    description: 'XP, badges, streaks, and\nverifiable certificates — every\nmilestone means something.',
    descriptionGap: 'mt-[32px]',
  },
  {
    icon: GraduationCap,
    iconStyle: 'bg-[#edf0e7] text-[#0d5c3a]',
    title: 'Expert Instructors',
    description:
      'Learn from Nigerian and\npan-African professionals\nwith industry-proven\nexperience.',
    descriptionGap: 'mt-[32px]',
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-[#fdf6ec] px-6 pb-[42px] pt-[47px]">
      <div className="text-center">
        <span className="inline-flex h-[26px] items-center rounded-full border border-[#c9c8ce] bg-[#ebe9ea] px-[13px] font-body text-[11px] font-bold tracking-[0.02em] text-[#1b2b6b]">
          WHY CREATECH ELEVATE
        </span>
        <h2 className="mt-[12px] font-display text-[34px] font-extrabold leading-[48px] tracking-[-0.01em] text-[#1c0e04] sm:text-[42px]">
          Everything you need to level up
        </h2>
      </div>

      <div className="mx-auto mt-[96px] grid max-w-[1060px] gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="relative min-h-[334px] overflow-hidden rounded-2xl border border-[#e8d5bb] border-t-2 bg-[#fffdf9] px-[20px] pb-8 pt-[20px]"
          >
            {/* Two faint stacked tiles in the top-left corner, as in the design. */}
            <span className="absolute left-0 top-0 h-[13px] w-[24px] bg-[#fdf6f0]" aria-hidden="true" />
            <span className="absolute left-[24px] top-[13px] h-[16px] w-[27px] bg-[#f9ecdf]/60" aria-hidden="true" />

            <span
              className={cn(
                'relative flex h-12 w-12 items-center justify-center rounded-xl',
                feature.iconStyle
              )}
            >
              <feature.icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <h3 className="mt-[16px] font-display text-base font-bold leading-6 text-[#1c0e04]">
              {feature.title}
            </h3>
            <p
              className={cn(
                'whitespace-pre-line font-body text-[13px] leading-[21.7px] text-[#7a6655]',
                feature.descriptionGap
              )}
            >
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
