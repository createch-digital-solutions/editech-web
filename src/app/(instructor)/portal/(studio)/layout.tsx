import type { Metadata } from 'next';
import { InstructorHeader } from '@/components/instructor/instructor-header';

export const metadata: Metadata = { title: 'Instructor Studio — Createch Elevate' };

/** Instructor studio pages with the top bar (dashboard, revenue, payouts). Onboarding and pending approval sit outside it. */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fdf6ec] font-body">
      <InstructorHeader />
      {children}
    </div>
  );
}
