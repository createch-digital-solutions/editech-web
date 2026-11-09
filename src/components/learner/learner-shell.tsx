import { AppHeader } from './app-header';
import { SidebarRail } from './learner-sidebar';

/** The learner area's frame: top bar, the floating menu rail on the left (signed in, desktop) and the page. */
export function LearnerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbf6ef] font-body">
      <AppHeader />
      <div className="flex flex-1">
        <SidebarRail />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
