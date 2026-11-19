import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LearnerLayout from '@/app/(learner)/layout';
import { getHomeRoute } from '@/lib/auth-redirect';

const replace = vi.fn();
let pathname = '/dashboard';
let user: { role: string; profileStatus: string } | null = null;

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace, push: vi.fn() }), usePathname: () => pathname }));
vi.mock('@/hooks/auth/use-current-user', () => ({ useCurrentUser: () => ({ user, isLoading: false, isSignedIn: !!user }) }));
vi.mock('@/components/auth/account-loading', () => ({ AccountLoading: () => <p>Loading your account</p> }));

const visit = (path: string, who: typeof user) => {
  pathname = path;
  user = who;
  render(
    <LearnerLayout>
      <p>Learner page</p>
    </LearnerLayout>
  );
};

describe('Where people belong (getHomeRoute)', () => {
  it('sends each role, at each stage, to its own home', () => {
    expect(getHomeRoute('LEARNER', 'PENDING_ONBOARDING')).toBe('/onboarding');
    expect(getHomeRoute('LEARNER', 'ACTIVE')).toBe('/dashboard');
    expect(getHomeRoute('INSTRUCTOR', 'PENDING_ONBOARDING')).toBe('/portal/onboarding');
    expect(getHomeRoute('INSTRUCTOR', 'PENDING_APPROVAL')).toBe('/portal/pending-approval');
    expect(getHomeRoute('INSTRUCTOR', 'ACTIVE')).toBe('/portal');
    expect(getHomeRoute('ADMIN', 'ACTIVE')).toBe('/admin');
  });
});

describe('Learner area gate', () => {
  beforeEach(() => replace.mockReset());

  it('sends a learner who has not picked their goals to onboarding', () => {
    visit('/dashboard', { role: 'LEARNER', profileStatus: 'PENDING_ONBOARDING' });
    expect(replace).toHaveBeenCalledWith('/onboarding');
    expect(screen.queryByText('Learner page')).not.toBeInTheDocument();
  });

  it('shows a set-up learner their dashboard, and sends them on from onboarding', () => {
    visit('/dashboard', { role: 'LEARNER', profileStatus: 'ACTIVE' });
    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByText('Learner page')).toBeInTheDocument();
  });

  it('sends a learner who already did onboarding on to the dashboard', () => {
    visit('/onboarding', { role: 'LEARNER', profileStatus: 'ACTIVE' });
    expect(replace).toHaveBeenCalledWith('/dashboard');
  });

  it('sends an admin from the learner dashboard to the admin portal', () => {
    visit('/dashboard', { role: 'ADMIN', profileStatus: 'ACTIVE' });
    expect(replace).toHaveBeenCalledWith('/admin');
  });

  it('sends an approved instructor to the studio, and a new one to the instructor application, not learner onboarding', () => {
    visit('/dashboard', { role: 'INSTRUCTOR', profileStatus: 'ACTIVE' });
    expect(replace).toHaveBeenCalledWith('/portal');
    replace.mockReset();
    visit('/onboarding', { role: 'INSTRUCTOR', profileStatus: 'PENDING_ONBOARDING' });
    expect(replace).toHaveBeenCalledWith('/portal/onboarding');
  });

  it('lets an approved instructor or admin watch a course in the player', () => {
    visit('/learn/react-for-beginners', { role: 'INSTRUCTOR', profileStatus: 'ACTIVE' });
    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByText('Learner page')).toBeInTheDocument();
  });
});
