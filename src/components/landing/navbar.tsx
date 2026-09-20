'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Menu, Search, X } from 'lucide-react';
import { useSignOut } from '@/hooks/auth';
import { getRoleDashboard } from '@/lib/auth-redirect';

const navLinks = [
  { label: 'Courses', href: '/courses' },
  { label: 'For Instructors', href: '/portal' },
  { label: 'Pricing', href: '/pricing' },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useSignOut();

  const role = user?.publicMetadata?.role as string | undefined;
  const dashboardHref = getRoleDashboard(role);
  const dashboardLabel =
    role === 'ADMIN' ? 'Admin Console' : role === 'INSTRUCTOR' ? 'Instructor Portal' : 'Dashboard';

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a2440] text-sm font-bold text-white">
            cE
          </span>
          <span className="text-lg font-bold text-gray-900">
            Createch<span className="text-orange-500">Elevate</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden flex-1 items-center justify-end gap-3 md:flex">
          <label className="relative hidden max-w-xs flex-1 md:block">
            <span className="sr-only">Search courses</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search"
              className="w-full rounded-full border border-gray-300 py-2 pl-9 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </label>

          {isLoaded && isSignedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href={dashboardHref}
                className="cursor-pointer whitespace-nowrap rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
              >
                {dashboardLabel} &rarr;
              </Link>
              <button
                type="button"
                onClick={() => signOut()}
                className="cursor-pointer whitespace-nowrap rounded-md border border-gray-300 px-3.5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="cursor-pointer whitespace-nowrap rounded-md border border-orange-300 px-4 py-2 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50"
              >
                Log In
              </Link>
              <Link
                href="/sign-up"
                className="cursor-pointer whitespace-nowrap rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
              >
                Get Started Free &rarr;
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
        <div className="border-t border-gray-200 bg-white px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <label className="relative mt-3 block">
            <span className="sr-only">Search courses</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search"
              className="w-full rounded-full border border-gray-300 py-2 pl-9 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </label>

          {isLoaded && isSignedIn ? (
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href={dashboardHref}
                onClick={() => setMenuOpen(false)}
                className="cursor-pointer rounded-md bg-orange-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-orange-600"
              >
                {dashboardLabel} &rarr;
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}
                className="cursor-pointer rounded-md border border-gray-300 px-4 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/sign-in"
                onClick={() => setMenuOpen(false)}
                className="cursor-pointer rounded-md border border-orange-300 px-4 py-2.5 text-center text-sm font-semibold text-orange-600 hover:bg-orange-50"
              >
                Log In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMenuOpen(false)}
                className="cursor-pointer rounded-md bg-orange-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-orange-600"
              >
                Get Started Free &rarr;
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
