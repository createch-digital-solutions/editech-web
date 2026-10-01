import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  /** `light` swaps the navy parts to white for dark backgrounds. */
  tone?: 'dark' | 'light';
  size?: 'md' | 'lg';
}

/** Createch Elevate wordmark: "C" with a rising orange arrow and kente bars, then the stacked name. */
export function Logo({ className, tone = 'dark', size = 'md' }: LogoProps) {
  const ink = tone === 'light' ? '#ffffff' : '#062551';

  return (
    <span className={cn('flex items-center', size === 'lg' ? 'gap-[9px]' : 'gap-[5px]', className)}>
      <svg
        viewBox="0 0 30 30"
        className={size === 'lg' ? 'h-[58px] w-[58px]' : 'h-[30px] w-[30px]'}
        aria-hidden="true"
      >
        <path d="M24 6.2A12.5 12.5 0 1 0 15 27.5" fill="none" stroke={ink} strokeWidth="5.5" />
        <path d="M13 17.5 23 7.5" stroke="#e65a04" strokeWidth="3.6" strokeLinecap="round" />
        <path d="M16.5 5.5h9v9z" fill="#e65a04" />
        <rect x="15" y="24" width="2.4" height="4" fill="#d4920a" />
        <rect x="18.2" y="22.5" width="2.4" height="5.5" fill="#0d5c3a" />
        <rect x="21.4" y="21" width="2.4" height="7" fill="#d4920a" />
        <rect x="24.6" y="19.5" width="2.4" height="8.5" fill="#0d5c3a" />
      </svg>
      <span
        className={cn(
          'w-px',
          size === 'lg' ? 'h-[56px] w-[3px]' : 'h-[29px]',
          tone === 'light' ? 'bg-white' : 'bg-[#9198a3]'
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          'font-body font-bold tracking-[-0.01em]',
          size === 'lg' ? 'text-[30px] leading-[30px]' : 'text-base leading-[17px]'
        )}
      >
        <span className={cn('block', tone === 'light' ? 'text-white' : 'text-[#011c40]')}>Createch</span>
        <span className="block text-[#e65a04]">Elevate</span>
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

const badgeSizes = {
  sm: { gap: 'gap-2', tile: 'h-[28px] w-[28px] text-[11px]', text: 'text-[13px]' },
  nav: { gap: 'gap-[8px]', tile: 'h-[30px] w-[30px] text-xs', text: 'text-[14px]' },
  md: { gap: 'gap-[10px]', tile: 'h-9 w-9 text-sm', text: 'text-[17px]' },
};

/** Compact "cE" tile + CreatechElevate name, used on auth, onboarding and footer screens. */
export function BadgeLogo({ className, tone = 'dark', size = 'md' }: BadgeLogoProps) {
  const s = badgeSizes[size];
  return (
    <span className={cn('flex items-center', s.gap, className)}>
      <span
        className={cn(
          'flex items-center justify-center rounded-lg bg-brand-gradient font-display font-bold text-white',
          s.tile
        )}
      >
        cE
      </span>
      <span
        className={cn(
          'font-display font-bold tracking-[-0.01em]',
          s.text,
          tone === 'light' ? 'text-white' : 'text-[#1c0e04]'
        )}
      >
        Createch<span className="text-[#cf7d0b]">Elevate</span>
      </span>
    </span>
  );
}
