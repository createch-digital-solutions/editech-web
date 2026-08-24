import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LearnerDashboardPage from '@/app/(learner)/dashboard/page';

describe('Learner Route Group — DashboardPage', () => {
  it('renders learner dashboard heading and placeholder card', () => {
    render(<LearnerDashboardPage />);
    expect(screen.getByText('Learner Dashboard')).toBeInTheDocument();
    expect(screen.getByText('My Enrolled Courses')).toBeInTheDocument();
  });
});
