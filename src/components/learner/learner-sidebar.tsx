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
    <aside className="hidden w-[367px] shrink-0 border-r border-[#e8d5bb] bg-[#fffdf9] px-[24px] pt-[71px] lg:block">
      <nav aria-label="Dashboard" className="space-y-[3px]">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-14 items-center rounded-xl px-[19px] font-body text-[20px] transition-colors',
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
