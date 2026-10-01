import { ReactNode } from 'react';
import { heroTrianglePattern } from '@/lib/patterns';
import { DiamondMotif } from '@/components/landing/diamond-motif';

interface AuthShellProps {
  leftContent: ReactNode;
  children: ReactNode;
}

/** Split auth layout: dark brand panel (39% on desktop) on the left, cream form panel on the right. */
export function AuthShell({ leftContent, children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen flex-col bg-[#fdf6ec] font-body lg:flex-row">
      <div className="relative flex flex-col overflow-hidden bg-brand-night px-6 pb-10 pt-10 sm:px-10 lg:w-[39.3%] lg:shrink-0 lg:px-0 lg:pb-[55px] lg:pt-0">
        <DiamondMotif className="-left-2 -top-1 h-[55px] w-[55px] opacity-10" />
        {/* Triangle field starts 26px down and fades in from the left, as in the design. */}
        <div
          className="pointer-events-none absolute bottom-0 right-0 top-[26px] hidden w-[200px] lg:block"
          style={{
            backgroundImage: heroTrianglePattern,
            backgroundPosition: 'right 8px top 0',
            maskImage: 'linear-gradient(to right, transparent 0, black 110px)',
          }}
          aria-hidden="true"
        />

        <div className="relative flex-1">{leftContent}</div>

        <p className="relative mt-10 hidden text-sm text-white/85 lg:mt-0 lg:block lg:pl-[48px]">
          &copy; {new Date().getFullYear()} Createch Elevate
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:pl-[10px] lg:pr-0">{children}</div>
    </main>
  );
}
