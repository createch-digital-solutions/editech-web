'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSignOut } from '@/hooks/auth';
import { AppLogo, LearnerAvatar } from '@/components/learner/app-header';

const NAV = [
  { href: '/portal', label: 'Dashboard' },
  { href: '/portal#my-courses', label: 'My Courses' },
  { href: '/portal/revenue', label: 'Revenue' },
  { href: '/portal/payouts', label: 'Payouts' },
] as const;

function activeLabel(pathname: string) {
  if (pathname.startsWith('/portal/revenue')) return 'Revenue';
  if (pathname.startsWith('/portal/payouts')) return 'Payouts';
  return 'Dashboard';
}

/** Avatar that opens a one-item menu to sign out (the studio has no profile or settings page yet). */
function AccountMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const { signOut } = useSignOut();

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu" aria-label="Account" className="flex cursor-pointer rounded-full">
        <LearnerAvatar className="h-9 w-9 ring-1 ring-[#e8d5bb] lg:h-10 lg:w-10" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-40 rounded-xl border border-[#efe2d0] bg-[#fffdf9] p-1 shadow-lg shadow-[#1c0e04]/10">
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut()}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left font-body text-sm text-[#3d2b1f] hover:bg-[#fdf6ec]"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/** Top bar of the instructor studio: logo, Dashboard · My Courses · Revenue · Payouts, notifications and the account menu. */
export function InstructorHeader() {
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
        item.label === active ? 'bg-[#e6f0ea] font-semibold text-[#0d5c3a]' : mobile ? 'font-medium text-[#3d2b1f]' : 'font-medium text-[#7a6655] hover:text-[#0d5c3a]'
      )}
    >
      {item.label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-[#e8d5bb] bg-[#fffdf9]">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link href="/portal" aria-label="Createch Elevate instructor studio" className="shrink-0">
          <AppLogo />
        </Link>

        <nav className="ml-8 hidden items-center gap-1 lg:flex" aria-label="Instructor">
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
        <nav className="border-t border-[#e8d5bb] px-4 pb-4 pt-2 lg:hidden" aria-label="Instructor">
          {NAV.map((item) => link(item, true))}
        </nav>
      )}
    </header>
  );
}
