import Image from 'next/image';
import { cn } from '@/lib/utils';

/** Height of the mark in px for each place the logo appears. */
const heights = {
  sm: 28, // onboarding header
  nav: 30, // slim auth navbar
  md: 30, // landing navbar
  panel: 36, // auth side panel
  app: 40, // learner top bar
  footer: 43, // landing footer
  lg: 58, // sign-in panel
};

/** The mark (public/brand) is 486 x 510. */
const MARK_RATIO = 486 / 510;

interface LogoProps {
  className?: string;
  /** `light` swaps the navy parts to white for dark backgrounds. */
  tone?: 'dark' | 'light';
  size?: keyof typeof heights;
}

/** Createch Elevate logo: the mark, a divider, then the stacked name. */
export function Logo({ className, tone = 'dark', size = 'md' }: LogoProps) {
  const h = heights[size];
  const light = tone === 'light';

  return (
    <span className={cn('flex items-center', className)} style={{ gap: Math.round(h * 0.17) }}>
      <Image
        src={light ? '/brand/mark-light.png' : '/brand/mark.png'}
        alt=""
        width={Math.round(h * MARK_RATIO)}
        height={h}
        priority
      />
      <span
        className={light ? 'bg-white' : 'bg-[#011c40]'}
        style={{ width: Math.max(1, Math.floor(h / 19)), height: Math.round(h * 0.97) }}
        aria-hidden="true"
      />
      <span
        className="font-body font-bold tracking-[-0.01em]"
        style={{ fontSize: Math.round(h * 0.53), lineHeight: `${Math.round(h * 0.57)}px` }}
      >
        <span className={cn('block', light ? 'text-white' : 'text-[#011c40]')}>Createch</span>
        <span className="block text-[#e75800]">Elevate</span>
      </span>
    </span>
  );
}

interface BadgeLogoProps {
  className?: string;
  tone?: 'dark' | 'light';
  /** sm = onboarding header, nav = slim auth navbar, md = auth side panel. */
  size?: 'sm' | 'nav' | 'md';
}

/** The logo at the auth, onboarding and footer sizes. */
export function BadgeLogo({ className, tone = 'dark', size = 'md' }: BadgeLogoProps) {
  return <Logo className={className} tone={tone} size={size === 'md' ? 'panel' : size} />;
}
