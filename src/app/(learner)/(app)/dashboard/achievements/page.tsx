import type { Metadata } from 'next';
import { AchievementsView } from './achievements-view';

export const metadata: Metadata = { title: 'Achievements & XP — Createch Elevate' };

/** /dashboard/achievements — XP and streak, badges and certificates. */
export default function AchievementsPage() {
  return <AchievementsView />;
}
