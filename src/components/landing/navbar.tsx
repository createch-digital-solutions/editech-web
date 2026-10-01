'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { ArrowRight, Menu, Search, X } from 'lucide-react';
import { useSignOut } from '@/hooks/auth';
import { getRoleDashboard } from '@/lib/auth-redirect';
import { cn } from '@/lib/utils';
import { Logo } from './logo';

const navLinks = [
  { label: 'Courses', href: '/courses' },
  { label: 'For Instructors', href: '/portal' },
  { label: 'Pricing', href: '/pricing' },
];

const outlineButton =
  'flex h-7 cursor-pointer items-center justify-center whitespace-nowrap rounded-md border border-brand bg-white px-3 font-body text-xs font-medium text-brand transition-colors hover:bg-orange-50';
const gradientButton =
  'flex h-7 cursor-pointer items-center justify-center gap-0.5 whitespace-nowrap rounded-md bg-brand-gradient px-3 font-body text-xs font-semibold text-white shadow-md shadow-brand/30 transition-opacity hover:opacity-90';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useSignOut();

  const role = user?.publicMetadata?.role as string | undefined;
  const dashboardHref = getRoleDashboard(role);
  const dashboardLabel =
    role === 'ADMIN' ? 'Admin Console' : role === 'INSTRUCTOR' ? 'Instructor Portal' : 'Dashboard';

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8d5bb] bg-[#fffdf9]">
      <div className="mx-auto flex h-[60px] max-w-[1400px] items-center px-6 xl:pl-[68px] xl:pr-[59px]">
        <Link href="/" className="shrink-0" aria-label="Createch Elevate home">
          <Logo />
        </Link>

        <nav className="ml-8 hidden items-center gap-6 font-body text-[13px] font-medium text-[#3d2b1f] md:flex xl:ml-[58px] xl:gap-0">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'whitespace-nowrap transition-colors hover:text-brand',
                i === 1 && 'xl:ml-[47px]',
                i === 2 && 'xl:ml-[25px]'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center md:flex">
          <label className="relative hidden w-[200px] lg:block xl:w-[326px]">
            <span className="sr-only">Search courses</span>
            <Search
              className="pointer-events-none absolute left-[20px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#64748b]"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search"
              className="h-[30px] w-full rounded-lg border-2 border-[#64748b]/80 bg-white pl-[44px] pr-4 font-body text-[13px] text-[#0f172a] placeholder:text-[#0f172a] focus:border-brand focus:outline-none"
            />
          </label>

          {isLoaded && isSignedIn ? (
            <>
              <Link href={dashboardHref} className={cn(gradientButton, 'ml-6 xl:ml-10')}>
                {dashboardLabel}
                <ArrowRight className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => signOut()}
                className={cn(outlineButton, 'ml-[30px]')}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/sign-in" className={cn(outlineButton, 'ml-6 w-[63px] px-0 xl:ml-10')}>
                Log In
              </Link>
              <Link href="/sign-up" className={cn(gradientButton, 'ml-[30px] w-[128px] px-0')}>
                Get Started Free
                <ArrowRight className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden="true" />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="ml-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-[#e8d5bb] bg-[#fffdf9] px-6 py-4 font-body md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm font-medium text-[#3d2b1f] hover:bg-[#fdf6ec]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <label className="relative mt-3 block">
            <span className="sr-only">Search courses</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search"
              className="w-full rounded-lg border-2 border-[#64748b]/80 bg-white py-2 pl-9 pr-4 text-sm text-[#0f172a] placeholder:text-[#0f172a] focus:border-brand focus:outline-none"
            />
          </label>

          <div className="mt-4 flex flex-col gap-2">
            {isLoaded && isSignedIn ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={() => setMenuOpen(false)}
                  className={cn(gradientButton, 'h-10 text-sm')}
                >
                  {dashboardLabel}
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    signOut();
                  }}
                  className={cn(outlineButton, 'h-10 text-sm')}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setMenuOpen(false)}
                  className={cn(outlineButton, 'h-10 text-sm')}
                >
                  Log In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMenuOpen(false)}
                  className={cn(gradientButton, 'h-10 text-sm')}
                >
                  Get Started Free
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
