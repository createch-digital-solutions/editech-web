import Link from 'next/link';
import { Search } from 'lucide-react';

const navLinks = [
  { label: 'Courses', href: '/courses' },
  { label: 'For Instructors', href: '/portal' },
  { label: 'Pricing', href: '/pricing' },
];

export function Navbar() {
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

        <div className="ml-auto hidden flex-1 items-center justify-end gap-3 sm:flex">
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
            Get Started Free →
          </Link>
        </div>
      </div>
    </header>
  );
}
