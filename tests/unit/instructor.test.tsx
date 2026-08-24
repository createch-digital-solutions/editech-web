import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InstructorPortalPage from '@/app/(instructor)/portal/page';

describe('Instructor Route Group — PortalPage', () => {
  it('renders instructor portal heading and course studio card', () => {
    render(<InstructorPortalPage />);
    expect(screen.getByText('Instructor Portal')).toBeInTheDocument();
    expect(screen.getByText('Course Studio')).toBeInTheDocument();
  });
});
