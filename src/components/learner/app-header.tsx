'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Bell, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SAMPLE_LEARNER } from '@/lib/learner-data';

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard#continue-learning', label: 'My Learning' },
  { href: '/courses', label: 'Catalogue' },
  { href: '/coach', label: 'AI Coach' },
  { href: '/profile', label: 'Profile' },
] as const;

/** Which top-level item a path belongs to; everything else in the learner area sits under Dashboard. */
function activeLabel(pathname: string) {
  if (pathname.startsWith('/courses')) return 'Catalogue';
  if (pathname.startsWith('/coach')) return 'AI Coach';
  if (pathname.startsWith('/profile')) return 'Profile';
  return 'Dashboard';
}

/** "cE" tile + CreatechElevate, at the learner header size (40px tile). */
export function AppLogo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    <span className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand-gradient font-display text-[15px] font-bold text-white">
        cE
      </span>
      <span className={cn('font-display text-lg font-bold tracking-[-0.01em]', tone === 'light' ? 'text-white' : 'text-[#1c0e04]')}>
        Createch<span className="text-[#cf7d0b]">Elevate</span>
      </span>
    </span>
  );
}

/** Round avatar: the signed-in learner's photo (Clerk), else the sample learner. */
export function LearnerAvatar({ className, src }: { className?: string; src?: string }) {
  const { user } = useUser();
  const url = src ?? (user?.hasImage ? user.imageUrl : SAMPLE_LEARNER.avatar);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Clerk avatars come from any CDN host.
    <img src={url} alt="" className={cn('rounded-full object-cover', className)} />
  );
}

/**
 * Top bar of the learner area: logo, Dashboard · My Learning · Catalogue · AI Coach · Profile, then
 * notifications and the avatar. Signed-out visitors (public catalogue and course pages) get Log In /
 * Get Started Free on the right instead.
 */
export function AppHeader() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useUser();
  const [open, setOpen] = useState(false);
  const active = activeLabel(pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-[#e8d5bb] bg-[#fffdf9]">
      <div className="flex h-[72px] items-center px-4 sm:px-6 lg:h-[91px] lg:pl-[37px] lg:pr-9">
        <Link href={isSignedIn ? '/dashboard' : '/'} aria-label="Createch Elevate home" className="shrink-0">
          <AppLogo />
        </Link>

        <nav className="ml-[37px] hidden items-center lg:flex" aria-label="Learner">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-current={item.label === active ? 'page' : undefined}
              className={cn(
                'flex h-12 items-center whitespace-nowrap rounded-xl px-[22px] font-body text-[20px] transition-colors',
                item.label === active ? 'bg-[#fbece4] font-semibold text-brand' : 'font-medium text-[#7a6655] hover:text-brand'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:gap-[21px]">
          {isLoaded && !isSignedIn ? (
            <>
              <Link
                href="/sign-in"
                className="hidden h-10 items-center rounded-lg border border-brand bg-white px-5 font-body text-sm font-semibold text-brand transition-colors hover:bg-orange-50 sm:flex"
              >
                Log In
              </Link>
              <Link
                href="/sign-up"
                className="flex h-10 items-center rounded-lg bg-brand-gradient px-5 font-body text-sm font-semibold text-white shadow-md shadow-brand/30 transition-opacity hover:opacity-90"
              >
                Get Started Free
              </Link>
            </>
          ) : (
            <>
              <Link href="/settings?section=notifications" aria-label="Notifications (1 new)" className="relative text-[#7a6655] hover:text-brand">
                <Bell className="h-[26px] w-[26px]" strokeWidth={1.8} aria-hidden="true" />
                <span className="absolute -right-0.5 -top-0.5 h-[10px] w-[10px] rounded-full border-2 border-[#fffdf9] bg-brand" />
              </Link>
              <Link href="/profile" aria-label="Your profile">
                <LearnerAvatar className="h-10 w-10 ring-1 ring-[#e8d5bb] lg:h-[52px] lg:w-[52px]" />
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-[#3d2b1f] lg:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-[#e8d5bb] px-4 pb-4 pt-2 lg:hidden" aria-label="Learner">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={item.label === active ? 'page' : undefined}
              className={cn(
                'block rounded-lg px-3 py-3 font-body text-base',
                item.label === active ? 'bg-[#fbece4] font-semibold text-brand' : 'font-medium text-[#3d2b1f]'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
