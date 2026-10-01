'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';
import { BadgeLogo } from './logo';

const navLinks = [
  { label: 'Courses', href: '/courses' },
  { label: 'Instructors', href: '/portal' },
  { label: 'Pricing', href: '/pricing' },
];

/** Slim navbar (no search) used on standalone auth pages such as forgot-password. */
export function SimpleNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8d5bb] bg-[#fffdf9] font-body">
      <div className="flex h-[60px] items-center px-6 sm:px-10">
        <Link href="/" aria-label="Createch Elevate home">
          <BadgeLogo size="nav" />
        </Link>

        <nav className="ml-auto hidden items-center gap-6 text-[13.5px] text-[#3d2b1f] md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-brand">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center md:flex">
          <Link
            href="/sign-in"
            className="ml-8 flex h-[29px] w-[62px] items-center justify-center rounded-lg border border-brand bg-white text-xs font-semibold text-brand transition-colors hover:bg-orange-50"
          >
            Log In
          </Link>
          <Link
            href="/sign-up"
            className="ml-[33px] flex h-[29px] w-[128px] items-center justify-center gap-0.5 rounded-lg bg-brand-gradient text-xs font-semibold text-white shadow-md shadow-brand/30 transition-opacity hover:opacity-90"
          >
            Get Started Free
            <ArrowRight className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden="true" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="ml-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-[#3d2b1f] hover:bg-[#fdf6ec] md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-[#e8d5bb] bg-[#fffdf9] px-6 py-4 md:hidden">
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
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/sign-in"
              onClick={() => setMenuOpen(false)}
              className="flex h-10 items-center justify-center rounded-lg border border-brand bg-white text-sm font-semibold text-brand"
            >
              Log In
            </Link>
            <Link
              href="/sign-up"
              onClick={() => setMenuOpen(false)}
              className="flex h-10 items-center justify-center gap-1 rounded-lg bg-brand-gradient text-sm font-semibold text-white"
            >
              Get Started Free
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
