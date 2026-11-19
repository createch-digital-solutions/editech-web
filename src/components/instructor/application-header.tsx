'use client';

import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { BadgeLogo } from '@/components/landing/logo';
import { useSignOut } from '@/hooks/auth';

/** Top of the instructor application and waiting pages: the logo (home) and Sign out. */
export function ApplicationHeader() {
  const { signOut } = useSignOut();
  return (
    <header className="flex items-center justify-between px-4 py-5 sm:px-8">
      <Link href="/" aria-label="Createch Elevate home">
        <BadgeLogo size="sm" />
      </Link>
      <button
        type="button"
        onClick={() => signOut()}
        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-[#e8d5bb] bg-[#fffdf9] px-4 font-body text-[14px] font-semibold text-[#3d2b1f] transition-colors hover:border-brand/40"
      >
        <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        Sign out
      </button>
    </header>
  );
}
