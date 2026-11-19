import { ReactNode } from 'react';
import { heroTrianglePattern } from '@/lib/patterns';
import { DiamondMotif } from '@/components/landing/diamond-motif';
import { Logo } from '@/components/landing/logo';
import { BackButton } from './back-button';
import { FitHeight } from './fit-height';
import { HomeLink } from './home-link';
import { WakeApi } from './wake-api';

interface AuthShellProps {
  leftContent: ReactNode;
  children: ReactNode;
}

/**
 * Split auth layout: dark brand panel (39% on desktop) on the left, cream form panel on the right. It
 * always fills exactly one screen at full size: on shorter laptop screens the empty space around the
 * content gives way first, and only very short ones shrink it (FitHeight). Phones get a slim bar with a
 * back button and the logo instead of the brand panel.
 */
export function AuthShell({ leftContent, children }: AuthShellProps) {
  return (
    <main className="flex min-h-dvh flex-col bg-[#fdf6ec] font-body lg:h-dvh lg:flex-row lg:overflow-hidden">
      <WakeApi />

      {/* Phones */}
      <header className="flex h-14 shrink-0 items-center gap-2 bg-[#1a0e05] px-3 lg:hidden">
        <BackButton />
        <HomeLink>
          <Logo tone="light" size="sm" />
        </HomeLink>
      </header>

      {/* Laptops and desktops: the brand panel. */}
      <div className="relative hidden overflow-hidden bg-brand-night lg:flex lg:w-[39.3%] lg:shrink-0 lg:flex-col lg:pb-[clamp(14px,calc(50vh-303px),55px)]">
        <DiamondMotif className="-left-2 -top-1 h-[55px] w-[55px] opacity-10" />
        {/* Triangle field starts 26px down and fades in from the left, as in the design. */}
        <div
          className="pointer-events-none absolute bottom-0 right-0 top-[26px] w-[200px]"
          style={{
            backgroundImage: heroTrianglePattern,
            backgroundPosition: 'right 8px top 0',
            maskImage: 'linear-gradient(to right, transparent 0, black 110px)',
          }}
          aria-hidden="true"
        />

        <div className="relative min-h-0 flex-1 pb-3">
          {/* pb: keeps the content clear of the © line when it has to shrink. */}
          <FitHeight>{leftContent}</FitHeight>
        </div>

        <p className="relative pl-[48px] text-sm text-white/85">&copy; {new Date().getFullYear()} Createch Elevate</p>
      </div>

      <div className="flex flex-1 justify-center overflow-y-auto px-5 py-5 sm:px-6 lg:items-center lg:py-3">
        <FitHeight className="flex w-full justify-center">{children}</FitHeight>
      </div>
    </main>
  );
}
