import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardView } from '@/app/(learner)/(app)/dashboard/dashboard-view';
import ProfilePage from '@/app/(learner)/(app)/profile/page';
import { enrolmentsApi } from '@/lib/enrolments-api';
import type { CourseSummary } from '@/lib/learner-data';
import type { Enrolment } from '@/types/enrollment';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('@/hooks/auth/use-current-user', () => ({
  useCurrentUser: () => ({
    user: { firstName: 'Ngozi', learnerProfile: { xpTotal: 1250, streakDays: 3, longestStreak: 9 } },
    isLoading: false,
    isSignedIn: true,
  }),
}));

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: { fullName: 'Ngozi Okafor', createdAt: new Date('2026-10-01') } }),
}));

vi.mock('@/components/learner/app-header', () => ({ LearnerAvatar: () => null }));

vi.mock('@/lib/enrolments-api', () => ({
  enrolmentsApi: { mine: vi.fn(), enrol: vi.fn() },
  enrolErrorText: () => 'error',
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

const uiux: CourseSummary = { ...course, id: 'c2', slug: 'ui-ux-design-systems', title: 'UI/UX Design Systems' };

const enrolment: Enrolment = {
  id: 'e1',
  courseId: 'c2',
  status: 'ACTIVE',
  progress: 40,
  progressPercentage: 40,
  enrolledAt: '2026-11-01T10:00:00Z',
  completedAt: null,
  course: { id: 'c2', title: 'UI/UX Design Systems', slug: 'ui-ux-design-systems', thumbnailUrl: null, totalLessons: 10, totalDuration: 143, instructorName: 'Chidi Eze' },
};

const renderDashboard = (recommended: CourseSummary[]) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <DashboardView recommended={recommended} />
    </QueryClientProvider>
  );

describe('Learner Route Group — Dashboard', () => {
  beforeEach(() => vi.mocked(enrolmentsApi.mine).mockReset());

  it('shows the learner, their XP and streaks, their courses with progress, and other recommendations', async () => {
    vi.mocked(enrolmentsApi.mine).mockResolvedValue([enrolment]);
    renderDashboard([course, uiux]);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ngozi');
    expect(screen.getByText('1,250')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Best: 9 days')).toBeInTheDocument();

    // The enrolled course, with how far along the learner is, opening the player.
    expect(await screen.findByText('40% complete')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'UI/UX Design Systems progress' })).toHaveAttribute('aria-valuenow', '40');
    expect(screen.getByText('Chidi Eze · 10 lessons · 2h 23m')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /UI\/UX Design Systems/ })).toHaveAttribute('href', '/learn/ui-ux-design-systems');

    // Recommendations leave out the course they're already in.
    expect(screen.getByRole('heading', { name: 'Recommended for You' })).toBeInTheDocument();
    expect(screen.getByText('React for Beginners')).toBeInTheDocument();
    expect(screen.getAllByText('UI/UX Design Systems')).toHaveLength(1);
  });

  it('invites a learner with no courses to the catalogue, hides empty recommendations, and leaves Aria to the player', async () => {
    vi.mocked(enrolmentsApi.mine).mockResolvedValue([]);
    renderDashboard([]);
    expect(await screen.findByText('No courses yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explore the catalogue/ })).toHaveAttribute('href', '/courses');
    expect(screen.queryByRole('heading', { name: 'Recommended for You' })).not.toBeInTheDocument();
    expect(screen.queryByText('Ask Aria')).not.toBeInTheDocument();
  });
});

describe('Learner Route Group — Profile', () => {
  beforeEach(() => vi.mocked(enrolmentsApi.mine).mockReset());

  it('counts and lists the courses the learner is enrolled in', async () => {
    vi.mocked(enrolmentsApi.mine).mockResolvedValue([enrolment]);
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <ProfilePage />
      </QueryClientProvider>
    );
    expect(await screen.findByText('40% complete')).toBeInTheDocument();
    expect(screen.getByText('Courses Enrolled').previousSibling).toHaveTextContent('1');
    expect(screen.getByRole('link', { name: /UI\/UX Design Systems/ })).toHaveAttribute('href', '/learn/ui-ux-design-systems');
    expect(screen.queryByText('No courses yet')).not.toBeInTheDocument();
  });
});
