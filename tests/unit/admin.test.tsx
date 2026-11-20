import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminOverviewPage from '@/app/(admin)/admin/page';
import CourseReviewPage from '@/app/(admin)/admin/courses/page';
import UserManagementPage from '@/app/(admin)/admin/users/page';
import { apiClient } from '@/lib/api-client';

let filter: string | null = null;
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(filter ? { filter } : {}) }));
vi.mock('@/lib/api-client', () => ({ apiClient: { get: vi.fn() } }));

// jsdom has no matchMedia; the review queue asks it whether to scroll to the details. Desktop: no scroll.
window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;

describe('Admin — platform overview', () => {
  it('shows the live API status and links pending actions to the pages that handle them', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ status: 'ok', services: { database: 'up' } });
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <AdminOverviewPage />
      </QueryClientProvider>
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Platform Overview' })).toBeInTheDocument();
    expect(await screen.findByText('All systems operational')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Course Reviews\s*5/ })).toHaveAttribute('href', '/admin/courses');
    expect(screen.getByRole('link', { name: /Instructor Verif\.\s*2/ })).toHaveAttribute('href', '/admin/users?filter=pending');
  });
});

describe('Admin — course review queue', () => {
  it('shows the first course, and approving it takes it out of the queue', () => {
    render(<CourseReviewPage />);
    expect(screen.getByRole('heading', { level: 2, name: 'Advanced TypeScript Patterns' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All (5)' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    expect(screen.getByRole('status')).toHaveTextContent('“Advanced TypeScript Patterns” approved');
    expect(screen.getByRole('button', { name: 'All (4)' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Flutter Mobile Dev' })).toBeInTheDocument();
  });

  it('filters to revised submissions and sends one back', () => {
    render(<CourseReviewPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Revised (2)' }));
    fireEvent.click(screen.getByRole('button', { name: /Data Viz with D3/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
    expect(screen.getByRole('status')).toHaveTextContent('“Data Viz with D3” sent back to the instructor');
    expect(screen.getByRole('button', { name: 'Revised (1)' })).toBeInTheDocument();
  });
});

describe('Admin — user management', () => {
  it('opens on instructors awaiting approval from ?filter=pending and approves one', () => {
    filter = 'pending';
    render(<UserManagementPage />);
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(3); // header + Bola + Zainab

    fireEvent.click(screen.getByRole('button', { name: 'Approve Bola James' }));
    expect(within(table).queryByText('Bola James')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Instructors' }));
    const bola = screen.getByRole('rowheader', { name: /Bola James/ }).closest('tr')!;
    expect(within(bola).getByText('Active')).toBeInTheDocument();
    filter = null;
  });

  it('searches by name or email and suspends a user', () => {
    render(<UserManagementPage />);
    fireEvent.change(screen.getByLabelText('Search users'), { target: { value: 'kofi@' } });
    expect(screen.getAllByRole('rowheader')).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: 'Suspend Kofi Mensah' }));
    const kofi = screen.getByRole('rowheader', { name: /Kofi Mensah/ }).closest('tr')!;
    expect(within(kofi).getByText('Suspended')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reactivate Kofi Mensah' })).toBeInTheDocument();
  });
});
