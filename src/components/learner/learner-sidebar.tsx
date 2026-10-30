'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SAMPLE_PLAYER } from '@/lib/learner-data';

const ITEMS = [
  { href: '/dashboard', label: 'Dashboard', match: (p: string) => p === '/dashboard' },
  { href: '/dashboard#continue-learning', label: 'My learning', match: () => false },
  { href: '/courses', label: 'Explore', match: (p: string) => p.startsWith('/courses') },
  { href: '/coach', label: 'AI Learning Coach', match: (p: string) => p.startsWith('/coach') },
  { href: '/dashboard/achievements', label: 'Achievements & XP', match: (p: string) => p.startsWith('/dashboard/achievements') },
  { href: `/learn/${SAMPLE_PLAYER.courseSlug}`, label: 'Course Player', match: (p: string) => p.startsWith('/learn') },
  { href: '/settings?section=notifications', label: 'Notifications', match: () => false },
  { href: '/profile', label: 'Profile', match: (p: string) => p.startsWith('/profile') },
  { href: '/settings', label: 'Settings', match: (p: string) => p.startsWith('/settings') },
];

/** Left menu of the learner dashboard (desktop only; the top bar covers smaller screens). */
export function LearnerSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-[248px] shrink-0 border-r border-[#e8d5bb] bg-[#fffdf9] px-4 lg:block">
      {/* Stays in view under the top bar while the page scrolls. */}
      <nav aria-label="Dashboard" className="sticky top-16 space-y-1 pt-8">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-11 items-center rounded-lg px-4 font-body text-[15px] transition-colors',
                active ? 'bg-[#fbece4] font-bold text-brand' : 'text-[#5a4636] hover:bg-[#fdf6ec] hover:text-brand'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
