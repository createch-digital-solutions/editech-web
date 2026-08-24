import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/(public)/page';

describe('Public Route Group — HomePage', () => {
  it('renders the public homepage title and marketplace placeholder', () => {
    render(<HomePage />);
    expect(
      screen.getByText('Welcome to Createch Learning Platform')
    ).toBeInTheDocument();
    expect(screen.getByText('Marketplace Catalog')).toBeInTheDocument();
  });
});
