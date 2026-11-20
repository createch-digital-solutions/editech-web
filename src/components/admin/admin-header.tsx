'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppLogo } from '@/components/learner/app-header';
import { AccountMenu } from '@/components/instructor/instructor-header';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/courses', label: 'Courses' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/analytics', label: 'Analytics' },
] as const;

function activeLabel(pathname: string) {
  return NAV.slice(1).find((item) => pathname.startsWith(item.href))?.label ?? 'Dashboard';
}

/** Top bar of the admin portal: logo, Dashboard · Courses · Users · Analytics, notifications and the account menu. */
export function AdminHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = activeLabel(pathname);

  const link = (item: (typeof NAV)[number], mobile = false) => (
    <Link
      key={item.label}
      href={item.href}
      onClick={mobile ? () => setOpen(false) : undefined}
      aria-current={item.label === active ? 'page' : undefined}
      className={cn(
        mobile ? 'block rounded-lg px-3 py-3 text-base' : 'flex h-10 items-center whitespace-nowrap rounded-lg px-4 text-[15px]',
        'font-body transition-colors',
        item.label === active ? 'bg-[#ecedf3] font-semibold text-[#1e2a78]' : mobile ? 'font-medium text-[#3d2b1f]' : 'font-medium text-[#7a6655] hover:text-[#1e2a78]'
      )}
    >
      {item.label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-[#e8d5bb] bg-[#fffdf9]">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link href="/admin" aria-label="Createch Elevate admin" className="shrink-0">
          <AppLogo />
        </Link>

        <nav className="ml-8 hidden items-center gap-1 lg:flex" aria-label="Admin">
          {NAV.map((item) => link(item))}
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:gap-5">
          <span className="relative text-[#7a6655]" role="img" aria-label="Notifications (1 new)">
            <Bell className="h-[22px] w-[22px]" strokeWidth={1.8} aria-hidden="true" />
            <span className="absolute -right-0.5 -top-0.5 h-[10px] w-[10px] rounded-full border-2 border-[#fffdf9] bg-brand" />
          </span>
          <AccountMenu />
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
        <nav className="border-t border-[#e8d5bb] px-4 pb-4 pt-2 lg:hidden" aria-label="Admin">
          {NAV.map((item) => link(item, true))}
        </nav>
      )}
    </header>
  );
}
