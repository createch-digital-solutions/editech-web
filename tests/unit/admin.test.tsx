import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminDashboardPage from '@/app/(admin)/admin/page';

describe('Admin Route Group — DashboardPage', () => {
  it('renders admin dashboard heading and platform overview card', () => {
    render(<AdminDashboardPage />);
    expect(screen.getByText('Admin Management Console')).toBeInTheDocument();
    expect(screen.getByText('Platform Overview')).toBeInTheDocument();
  });
});
