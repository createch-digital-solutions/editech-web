import { AppHeader } from '@/components/learner/app-header';

/** Catalogue and course pages: public, with the learner top bar (Log In / Get Started when signed out). */
export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fdf6ec] font-body">
      <AppHeader />
      {children}
    </div>
  );
}
