import { LearnerShell } from '@/components/learner/learner-shell';

/** Catalogue and course pages: public, in the learner frame (Log In / Get Started and no menu rail when signed out). */
export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <LearnerShell>{children}</LearnerShell>;
}
