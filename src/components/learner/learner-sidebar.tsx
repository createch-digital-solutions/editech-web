'use client';

import { useEffect, useState, useSyncExternalStore, type ReactNode, type SVGProps, type SyntheticEvent } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ChevronsLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/landing/logo';

type NavIcon = (props: SVGProps<SVGSVGElement>) => ReactNode;

/**
 * The menu's icons, drawn as a set: a dark rounded outline over a faint fill of the same colour (the fill
 * turns with the icon's colour, so it reads on the orange of the page you are on too).
 */
function twoTone(fill: ReactNode, line: ReactNode): NavIcon {
  return function Icon({ strokeWidth = 1.8, ...props }) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <g fill="currentColor" fillOpacity={0.06} stroke="none">
          {fill}
        </g>
        {line}
      </svg>
    );
  };
}

const HOME = 'M5 9.6V20h4.5v-5.5h5V20H19V9.6';
const BOOK = 'M12 7c-2-1.6-4.6-2.2-8-2.2v12.7c3.4 0 6 .6 8 2.2 2-1.6 4.6-2.2 8-2.2V4.8c-3.4 0-6 .6-8 2.2Z';
const CUP = 'M7 4h10v5.5a5 5 0 0 1-10 0Z';
const GEAR =
  'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z';

const DashboardIcon = twoTone(<path d="M5 9.6 12 4l7 5.6V20h-4.5v-5.5h-5V20H5Z" />, <><path d="M3 11 12 3.5 21 11" /><path d={HOME} /></>);
const LearningIcon = twoTone(<path d={BOOK} />, <><path d={BOOK} /><path d="M12 7v12.7" /></>);
const ExploreIcon = twoTone(<circle cx="12" cy="12" r="9" />, <><circle cx="12" cy="12" r="9" /><path d="m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1Z" /></>);
const AchievementsIcon = twoTone(<path d={CUP} />, <><path d={CUP} /><path d="M7 6.5H4.5A2.5 2.5 0 0 0 7 11M17 6.5h2.5A2.5 2.5 0 0 1 17 11M12 14.5V18M8.5 20.5h7M9.5 18h5" /></>);
const PlayerIcon = twoTone(<rect x="3" y="4" width="18" height="13" rx="2.5" />, <><rect x="3" y="4" width="18" height="13" rx="2.5" /><path d="m10.5 8.2 4.2 2.3-4.2 2.3Z" /><path d="M8.5 21h7M12 17v4" /></>);
const SettingsIcon = twoTone(<path d={GEAR} />, <><path d={GEAR} /><circle cx="12" cy="12" r="3" /></>);

interface NavItem {
  href: string;
  label: string;
  icon: NavIcon;
  match: (pathname: string) => boolean;
}

const MAIN: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon, match: (p) => p === '/dashboard' },
  // The learner's courses; until enrolments are listed that is the dashboard's Continue Learning section.
  { href: '/dashboard#continue-learning', label: 'My learning', icon: LearningIcon, match: () => false },
  { href: '/courses', label: 'Explore', icon: ExploreIcon, match: (p) => p.startsWith('/courses') },
  { href: '/dashboard/achievements', label: 'Achievements & XP', icon: AchievementsIcon, match: (p) => p.startsWith('/dashboard/achievements') },
  // The player needs a course; until enrolments are listed it leads to the learner's courses section.
  { href: '/dashboard#continue-learning', label: 'Course Player', icon: PlayerIcon, match: (p) => p.startsWith('/learn') },
];

const ACCOUNT: NavItem[] = [
  { href: '/settings', label: 'Settings', icon: SettingsIcon, match: (p) => p.startsWith('/settings') },
];

/** Signed-out visitors (public catalogue and course pages) only get the catalogue. */
const PUBLIC_ITEMS: NavItem[] = [{ href: '/courses', label: 'Explore courses', icon: ExploreIcon, match: (p) => p.startsWith('/courses') }];

/**
 * Pages with a sidebar of their own (the catalogue's filters): the menu bar steps aside there and the top
 * bar links back to the dashboard and the catalogue instead.
 */
export function hasOwnSidebar(pathname: string) {
  return pathname === '/courses';
}

// --- Open / closed state of the rail, remembered in this browser --------------------

const OPEN_KEY = 'createch:sidebar-open';
const OPEN_EVENT = 'createch:sidebar-toggle';

function readOpen() {
  try {
    return localStorage.getItem(OPEN_KEY) === '1';
  } catch {
    return false;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(OPEN_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(OPEN_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

function setOpen(open: boolean) {
  try {
    localStorage.setItem(OPEN_KEY, open ? '1' : '0');
  } catch {
    // Storage unavailable: the rail still toggles for this page view via the event below.
  }
  window.dispatchEvent(new Event(OPEN_EVENT));
}

// --- Rail (desktop) --------------------------------------------------------------

/**
 * Computers: the learner menu docked down the left, from the top bar to the bottom of the screen. Folded,
 * it is a slim bar of icons, and pointing at an icon (or tabbing to it) shows its name beside it; the small
 * › on its edge widens it to show the names, pushing the page across, and ‹ folds it again. The choice is
 * remembered in this browser. If the screen is too short for every item, the list scrolls.
 */
export function SidebarRail() {
  const { isLoaded, isSignedIn } = useUser();
  const pathname = usePathname();
  const open = useSyncExternalStore(subscribe, readOpen, () => false);
  // The name beside an icon: drawn outside the bar (fixed), so the bar can scroll without cutting it off.
  const [tip, setTip] = useState<{ label: string; top: number; left: number } | null>(null);
  const show = (label: string) => (e: SyntheticEvent<HTMLElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    setTip({ label, top: box.top + box.height / 2, left: box.right + 12 });
  };
  const hide = () => setTip(null);
  // Folded only: open, the names are already showing.
  const nameOn = (label: string) => (open ? {} : { onMouseEnter: show(label), onMouseLeave: hide, onFocus: show(label), onBlur: hide });

  // Opening a course (its page or the player) folds the menu away to give the course the room.
  useEffect(() => {
    if (/^\/(courses|learn)\/[^/]+/.test(pathname) && readOpen()) setOpen(false);
  }, [pathname]);

  if (!isLoaded || !isSignedIn || hasOwnSidebar(pathname)) return null;

  return (
    <>
      {/* Docked from just under the top bar to the bottom of the screen; above the page so the › on its edge is
          never covered. Its width eases between the two sizes and the page moves with it. */}
      <aside
        aria-label="Learner menu"
        className={cn(
          'relative z-30 hidden shrink-0 transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:block',
          open ? 'w-[232px]' : 'w-20'
        )}
      >
        {/* The same white as the top bar and no line between them or along the menu's edge: one frame around the page. */}
        <nav aria-label="Learner" className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col bg-white">
          {/* The page's rounded top-left corner where the menu meets the top bar; part of the menu, so it stays put
              while the page scrolls. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-full top-0 h-7 w-7 bg-[radial-gradient(circle_at_100%_100%,transparent_27.5px,#fff_28px)]"
          />
          {/* The icons keep their place as the bar widens (18px in from the edge), so only the names appear. The
              list starts a little way down, not hard against the top bar. */}
          <div onScroll={hide} className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-[18px] py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ul className="mt-4 flex flex-col gap-1">
              {[...MAIN, ...ACCOUNT].map((item, i) => {
                const active = item.match(pathname);
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    {i === MAIN.length && <span aria-hidden="true" className={cn('my-1.5 block h-px bg-[#ece1d3]', open ? 'w-full' : 'mx-auto w-6')} />}
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      onClick={hide}
                      {...nameOn(item.label)}
                      className={cn(
                        'flex h-11 items-center gap-3 whitespace-nowrap rounded-full font-body text-[15px] transition-colors',
                        open ? 'w-full pl-[11px] pr-3' : 'w-11 justify-center',
                        active ? 'bg-brand-gradient font-semibold text-white shadow-sm shadow-brand/30' : 'text-[#3d2b1f] hover:bg-[#fdf1e7] hover:text-brand'
                      )}
                    >
                      <Icon className="h-[22px] w-[22px] shrink-0" strokeWidth={active ? 2 : 1.75} aria-hidden="true" />
                      <span className={open ? 'min-w-0 truncate' : 'sr-only'}>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          {/* The open / close button on the bar's right edge, beside the first item (16px padding + 16px + half a
              44px row). Outside the list, so it is never scrolled away or cut off. */}
          <button
            type="button"
            onClick={() => {
              hide();
              setOpen(!open);
            }}
            aria-label={open ? 'Collapse menu' : 'Expand menu'}
            aria-expanded={open}
            className="group absolute -right-3.5 top-[54px] flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-[#7a6655] shadow-[0_1px_2px_rgba(28,14,4,0.08),0_2px_8px_-2px_rgba(28,14,4,0.12)] outline-none ring-1 ring-[#ece1d3] transition-colors duration-200 hover:bg-[#fdf1e7] hover:text-brand hover:ring-[#f0d6c2] focus-visible:ring-2 focus-visible:ring-brand/60"
          >
            {/* « folds the menu, » widens it; turns over as the menu changes. */}
            <ChevronsLeft
              className={cn('h-4 w-4 transition-transform duration-300 motion-reduce:transition-none', !open && 'rotate-180')}
              strokeWidth={2.2}
              aria-hidden="true"
            />
          </button>
        </nav>
      </aside>

      {tip && (
        <span
          role="tooltip"
          style={{ top: tip.top, left: tip.left }}
          className="pointer-events-none fixed z-40 -translate-y-1/2 whitespace-nowrap rounded-lg border border-[#ece1d3] bg-white px-2.5 py-1 font-body text-sm font-medium text-[#1c0e04] shadow-md"
        >
          {tip.label}
        </span>
      )}
    </>
  );
}

// --- Drawer (phones and tablets) ----------------------------------------------------

function DrawerLink({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const pathname = usePathname();
  const active = item.match(pathname);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex h-12 items-center gap-3 rounded-full px-4 font-body text-[15px] transition-colors',
        active ? 'bg-brand-gradient font-semibold text-white' : 'text-[#3d2b1f] hover:bg-[#fdf1e7] hover:text-brand'
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
      {item.label}
    </Link>
  );
}

/** The same menu sliding in from the right, opened by the menu button at the right of the top bar (below desktop width). */
export function NavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isLoaded, isSignedIn } = useUser();
  const signedOut = isLoaded && !isSignedIn;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  // Rendered into <body>: the top bar's backdrop blur would otherwise trap this fixed panel inside the bar.
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-[#1c0e04]/40" onClick={onClose} aria-hidden="true" />
      <nav aria-label="Learner" className="absolute inset-y-0 right-0 flex w-[290px] max-w-[85vw] flex-col overflow-y-auto bg-[#fffdf9] px-4 pb-6 shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between">
          <Link href={isSignedIn ? '/dashboard' : '/'} onClick={onClose} aria-label="Createch Elevate home">
            <Logo size="md" />
          </Link>
          <button type="button" onClick={onClose} aria-label="Close menu" className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[#3d2b1f] hover:bg-[#fdf1e7]">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="mt-3 space-y-1">
          {(signedOut ? PUBLIC_ITEMS : MAIN).map((item) => (
            <DrawerLink key={item.label} item={item} onNavigate={onClose} />
          ))}
          {!signedOut && (
            <>
              <div className="mx-3 my-3 border-t border-[#efe2d0]" />
              {ACCOUNT.map((item) => (
                <DrawerLink key={item.label} item={item} onNavigate={onClose} />
              ))}
            </>
          )}
        </div>
        {signedOut && (
          <div className="mt-6 space-y-2 border-t border-[#efe2d0] pt-6">
            <Link href="/sign-in" onClick={onClose} className="flex h-11 items-center justify-center rounded-full border border-brand font-body text-sm font-semibold text-brand">
              Log In
            </Link>
            <Link href="/sign-up" onClick={onClose} className="flex h-11 items-center justify-center rounded-full bg-brand-gradient font-body text-sm font-semibold text-white">
              Get Started Free
            </Link>
          </div>
        )}
      </nav>
    </div>,
    document.body
  );
}
