import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InstructorDashboardPage from '@/app/(instructor)/portal/(studio)/page';

describe('Instructor Route Group — Dashboard', () => {
  it('renders the greeting, stats and course list', () => {
    render(<InstructorDashboardPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Kofi');
    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'My Courses' })).toBeInTheDocument();
  });
});
