'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { LogOut, Settings, UserRound } from 'lucide-react';
import { useSignOut } from '@/hooks/auth';
import { LearnerAvatar } from './app-header';

/** The account's own pages only; the learning pages are in the side menu. */
const LINKS = [
  { href: '/profile', label: 'Profile', icon: UserRound },
  { href: '/settings', label: 'Settings', icon: Settings },
];

/**
 * The avatar in the top bar: a menu with who is signed in, their profile and settings, and Sign out. It opens when the mouse (or a pen) rests on the avatar, and on a tap or click (touch screens,
 * keyboard).
 */
export function AccountMenu() {
  const { user } = useUser();
  const { signOut } = useSignOut();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  // The mouse is over the avatar or the menu: a click then keeps the menu open instead of closing it.
  const hovering = useRef(false);
  // Leaving closes the menu after a moment, so a pointer that slips off on the way down does not shut it.
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  function hover(e: React.PointerEvent, on: boolean) {
    if (e.pointerType === 'touch') return;
    hovering.current = on;
    clearTimeout(closeTimer.current);
    if (on) setOpen(true);
    else closeTimer.current = setTimeout(() => setOpen(false), 200);
  }
  useEffect(() => () => clearTimeout(closeTimer.current), []);

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

  const item = 'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-body text-[15px] text-[#3d2b1f] transition-colors hover:bg-[#fdf6ec] hover:text-brand';

  return (
    <div ref={root} className="relative" onPointerEnter={(e) => hover(e, true)} onPointerLeave={(e) => hover(e, false)}>
      <button
        type="button"
        onClick={() => setOpen((o) => hovering.current || !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Your account"
        className="flex cursor-pointer rounded-full"
      >
        <LearnerAvatar className="h-11 w-11 ring-2 ring-[#e8c9a8] ring-offset-1 ring-offset-[#fffdf9]" />
      </button>
      {open && (
        // The padding (not a margin) bridges the gap under the avatar, so the menu stays open on the way down.
        <div className="absolute right-0 top-full z-50 pt-2">
          <div role="menu" aria-label="Your account" className="w-64 rounded-2xl border border-[#efe2d0] bg-[#fffdf9] p-2 shadow-xl shadow-[#1c0e04]/10">
            <div className="flex items-center gap-3 border-b border-[#efe2d0] px-3 pb-3 pt-2">
              <LearnerAvatar className="h-11 w-11 shrink-0" />
              <div className="min-w-0">
                <p className="truncate font-body text-[15px] font-semibold text-[#1c0e04]">{user?.fullName || 'Your account'}</p>
                <p className="truncate text-[13px] text-[#7a6655]">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>
            <div className="py-1">
              {LINKS.map(({ href, label, icon: Icon }) => (
                <Link key={label} href={href} role="menuitem" onClick={() => setOpen(false)} className={item}>
                  <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </div>
            <div className="border-t border-[#efe2d0] pt-1">
              <button type="button" role="menuitem" onClick={() => signOut()} className={`${item} cursor-pointer`}>
                <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
