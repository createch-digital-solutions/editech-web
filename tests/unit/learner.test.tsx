import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LearnerDashboardPage from '@/app/(learner)/(app)/dashboard/page';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe('Learner Route Group — DashboardPage', () => {
  it('renders the greeting, progress cards and course sections', () => {
    render(<LearnerDashboardPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Adaeze');
    expect(screen.getByText('Day Streak')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Continue Learning' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recommended for You' })).toBeInTheDocument();
  });
});
