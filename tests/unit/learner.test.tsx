import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardView } from '@/app/(learner)/(app)/dashboard/dashboard-view';
import type { CourseSummary } from '@/lib/learner-data';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('@/hooks/auth/use-current-user', () => ({
  useCurrentUser: () => ({
    user: { firstName: 'Ngozi', learnerProfile: { xpTotal: 1250, streakDays: 3 } },
    isLoading: false,
    isSignedIn: true,
  }),
}));

const course: CourseSummary = {
  id: 'c1',
  slug: 'react-for-beginners',
  title: 'React for Beginners',
  instructor: 'Kofi Mensah',
  rating: 4.8,
  students: '2.3k',
  price: 15000,
  image: '/learner/course-placeholder.svg',
  imageAlt: 'Cover image for React for Beginners',
  category: 'web-development',
};

describe('Learner Route Group — Dashboard', () => {
  it('shows the learner, their XP and streak from the API, and the featured courses', () => {
    render(<DashboardView recommended={[course]} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ngozi');
    expect(screen.getByText('1,250')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('No courses in progress')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recommended for You' })).toBeInTheDocument();
    expect(screen.getByText('React for Beginners')).toBeInTheDocument();
  });

  it('hides recommendations when the API has none', () => {
    render(<DashboardView recommended={[]} />);
    expect(screen.queryByRole('heading', { name: 'Recommended for You' })).not.toBeInTheDocument();
  });
});
