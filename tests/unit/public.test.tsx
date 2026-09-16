import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/(public)/page';

describe('Public Route Group — HomePage', () => {
  it('renders the homepage features and popular courses sections', () => {
    render(<HomePage />);
    expect(
      screen.getByText('Everything you need to level up')
    ).toBeInTheDocument();
    expect(screen.getByText('Popular Courses')).toBeInTheDocument();
  });
});
