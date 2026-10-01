import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StripeDivider } from '@/components/landing/stripe-divider';

interface CenteredCardPageProps {
  header?: ReactNode;
  children: ReactNode;
}

/** Cream full-height page with a centred card and the kente strip pinned to the bottom. */
export function CenteredCardPage({ header, children }: CenteredCardPageProps) {
  return (
    <main className="flex min-h-screen flex-col bg-[#fdf6ec] font-body">
      {header}
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">{children}</div>
      <StripeDivider />
    </main>
  );
}

interface IconCircleProps {
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
}

/** Peach circle with a burnt-orange outline icon, used at the top of auth cards. */
export function IconCircle({ icon: Icon, className, iconClassName }: IconCircleProps) {
  return (
    <span
      className={cn(
        'mx-auto flex items-center justify-center rounded-full border-2 border-[#f5c9a8] bg-[#fdeee4] text-brand',
        className
      )}
    >
      <Icon className={cn('h-7 w-7', iconClassName)} strokeWidth={1.8} aria-hidden="true" />
    </span>
  );
}
