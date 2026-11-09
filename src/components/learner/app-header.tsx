'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Bell, Menu, Search, UserRound, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/landing/logo';
import { AccountMenu } from './account-menu';
import { hasOwnSidebar, NavDrawer } from './learner-sidebar';

/** Shown beside the search on pages where the menu rail makes way for the page's own sidebar. */
const TOP_LINKS = [
  { href: '/dashboard', label: 'Dashboard', match: (p: string) => p === '/dashboard' },
  { href: '/courses', label: 'Catalogue', match: (p: string) => p.startsWith('/courses') },
];

/** The logo at the learner header size. */
export function AppLogo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return <Logo tone={tone} size="md" />;
}

/** "Sassera Angel" → "SA"; falls back to the first letter of the email. */
function initialsOf(firstName?: string | null, lastName?: string | null, email?: string | null) {
  const fromName = [firstName, lastName].map((n) => n?.trim().charAt(0) ?? '').join('');
  return (fromName || email?.trim().charAt(0) || '').toUpperCase();
}

/**
 * Round avatar: the photo the learner uploaded (Clerk), else their initials until they add one in
 * Settings (a person icon while the account is still loading).
 */
export function LearnerAvatar({ className, src }: { className?: string; src?: string }) {
  const { user } = useUser();
  const url = src ?? (user?.hasImage ? user.imageUrl : null);
  if (!url) {
    const initials = initialsOf(user?.firstName, user?.lastName, user?.primaryEmailAddress?.emailAddress);
    return (
      // Container units (cqw) size the letters to the circle, from the top bar to the profile header.
      <span className={cn('@container flex items-center justify-center rounded-full bg-[#fbece4] text-brand', className)} aria-hidden="true">
        {initials ? (
          <span className="font-display text-[38cqw] font-bold leading-none">{initials}</span>
        ) : (
          <UserRound className="h-[55%] w-[55%]" strokeWidth={1.8} />
        )}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Clerk avatars come from any CDN host.
    <img src={url} alt="" className={cn('rounded-full object-cover', className)} />
  );
}


/** Search box in the top bar: opens the catalogue filtered by the words typed. */
function HeaderSearch({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  // Shows the catalogue's current search, and follows it when it changes (or is cleared there).
  const current = pathname === '/courses' ? (params.get('q') ?? '') : '';
  const [query, setQuery] = useState(current);
  const [shown, setShown] = useState(current);
  if (current !== shown) {
    setShown(current);
    setQuery(current);
  }
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = query.trim();
        router.push(q ? `/courses?${new URLSearchParams({ q })}` : '/courses');
      }}
      className={cn('relative', className)}
    >
      <label htmlFor={autoFocus ? 'header-search-mobile' : 'header-search'} className="sr-only">
        Search courses
      </label>
      <Search className="pointer-events-none absolute left-[18px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#7a6655]" strokeWidth={1.9} aria-hidden="true" />
      <input
        id={autoFocus ? 'header-search-mobile' : 'header-search'}
        type="search"
        autoFocus={autoFocus}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for courses"
        className="h-12 w-full rounded-xl border border-[#e8dccb] bg-[#f8f2ea] pl-12 pr-4 font-body text-[15px] text-[#1c0e04] placeholder:text-[#9a8574] transition-colors focus:border-brand focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand/10"
      />
    </form>
  );
}

/**
 * Top bar of the learner area: menu button (opens the side menu), logo, course search, then
 * notifications and the account menu. Signed-out visitors (public catalogue and course pages) get
 * Log In / Get Started Free on the right instead.
 */
export function AppHeader() {
  const { isLoaded, isSignedIn } = useUser();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Phones: the search icon opens a search row under the bar.
  const [searching, setSearching] = useState(false);

  return (
    // Plain white with no line under it: with the side menu, one frame around the page.
    <header className="sticky top-0 z-40 bg-white">
      {/* Three columns, so the search sits in the middle. The sides never get narrower than what is in
          them; when space runs short the search shrinks rather than covering the links. */}
      <div className="grid h-16 grid-cols-[1fr_auto] items-center gap-3 px-4 sm:px-6 md:grid-cols-[minmax(max-content,1fr)_minmax(0,600px)_minmax(max-content,1fr)] lg:gap-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href={isSignedIn ? '/dashboard' : '/'} aria-label="Createch Elevate home" className="shrink-0">
            <AppLogo />
          </Link>
          {isSignedIn && hasOwnSidebar(pathname) && (
            <nav aria-label="Main" className="ml-auto hidden items-center gap-1 lg:flex">
              {TOP_LINKS.map((l) => {
                const active = l.match(pathname);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex h-10 items-center rounded-full px-4 font-body text-[15px] font-semibold transition-colors',
                      active ? 'bg-[#fdeee4] text-brand' : 'text-[#5a4636] hover:bg-[#fdf1e7] hover:text-brand'
                    )}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <Suspense>
          <HeaderSearch className="hidden w-full md:block" />
        </Suspense>

        <div className="flex shrink-0 items-center justify-self-end gap-3 lg:gap-5">
          <button
            type="button"
            onClick={() => setSearching((v) => !v)}
            aria-expanded={searching}
            aria-label={searching ? 'Close search' : 'Search courses'}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-[#3d2b1f] md:hidden"
          >
            {searching ? <X className="h-[22px] w-[22px]" /> : <Search className="h-[22px] w-[22px]" strokeWidth={1.8} aria-hidden="true" />}
          </button>
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
                className="hidden h-10 items-center rounded-lg bg-brand-gradient px-5 font-body text-sm font-semibold text-white shadow-md shadow-brand/30 transition-opacity hover:opacity-90 sm:flex"
              >
                Get Started Free
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/settings?section=notifications"
                aria-label="Notifications"
                title="Notifications"
                className="hidden h-11 w-11 items-center justify-center rounded-full border border-[#efe2d0] bg-white text-[#3d2b1f] shadow-sm transition-colors hover:border-brand/40 hover:text-brand sm:flex"
              >
                <Bell className="h-[22px] w-[22px]" strokeWidth={1.7} aria-hidden="true" />
              </Link>
              <AccountMenu />
            </>
          )}
          {/* Phones and tablets: the menu, last on the right after the account picture. */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-label="Open menu"
            className="-mr-2 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#3d2b1f] hover:bg-[#fdf1e7] lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {searching && (
        <div className="border-t border-[#efe2d0] px-4 pb-3 pt-3 md:hidden">
          <Suspense>
            <HeaderSearch autoFocus />
          </Suspense>
        </div>
      )}

      <NavDrawer open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
