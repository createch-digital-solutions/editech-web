import { LearnerShell } from '@/components/learner/learner-shell';

/** Learner pages with the top bar and menu rail (dashboard, profile, settings, quiz, certificate, checkout). */
export default function LearnerAppLayout({ children }: { children: React.ReactNode }) {
  return <LearnerShell>{children}</LearnerShell>;
}
