import { AppHeader } from '@/components/learner/app-header';

/** Learner pages with the top bar (dashboard, profile, settings, coach, quiz, certificate, checkout). */
export default function LearnerAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fdf6ec] font-body">
      <AppHeader />
      {children}
    </div>
  );
}
