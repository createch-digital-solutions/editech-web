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
    descriptionGap: 'sm:mt-[41px]',
  },
  {
    icon: Bot,
    iconStyle: 'bg-[#eeecea] text-[#1b2b6b]',
    title: 'Aria AI Coach',
    description:
      'Your personal AI tutor\nknows where you are and\nguides the next step in\nYoruba, Igbo, or English.',
    descriptionGap: 'sm:mt-[8px]',
  },
  {
    icon: Trophy,
    iconStyle: 'bg-[#fbf4e4] text-brand-light',
    title: 'Earn as You Learn',
    description: 'XP, badges, streaks, and\nverifiable certificates — every\nmilestone means something.',
    descriptionGap: 'sm:mt-[32px]',
  },
  {
    icon: GraduationCap,
    iconStyle: 'bg-[#edf0e7] text-[#0d5c3a]',
    title: 'Expert Instructors',
    description:
      'Learn from Nigerian and\npan-African professionals\nwith industry-proven\nexperience.',
    descriptionGap: 'sm:mt-[32px]',
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

      {/* Two to a row on phones, sized to their text; the design's tall cards from tablet up. */}
      <div className="mx-auto mt-10 grid max-w-[1060px] grid-cols-2 gap-3 sm:mt-[96px] sm:gap-5 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="relative overflow-hidden rounded-2xl border border-[#e8d5bb] border-t-2 bg-[#fffdf9] px-3.5 pb-5 pt-4 sm:min-h-[334px] sm:px-[20px] sm:pb-8 sm:pt-[20px]"
          >
            {/* Two faint stacked tiles in the top-left corner, as in the design. */}
            <span className="absolute left-0 top-0 h-[13px] w-[24px] bg-[#fdf6f0]" aria-hidden="true" />
            <span className="absolute left-[24px] top-[13px] h-[16px] w-[27px] bg-[#f9ecdf]/60" aria-hidden="true" />

            <span
              className={cn(
                'relative flex h-10 w-10 items-center justify-center rounded-xl sm:h-12 sm:w-12',
                feature.iconStyle
              )}
            >
              <feature.icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <h3 className="mt-3 font-display text-[14px] font-bold leading-5 text-[#1c0e04] sm:mt-[16px] sm:text-base sm:leading-6">
              {feature.title}
            </h3>
            <p
              className={cn(
                'mt-1.5 font-body text-[12px] leading-[18px] text-[#7a6655] sm:whitespace-pre-line sm:text-[13px] sm:leading-[21.7px]',
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
