import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EnrolButton } from '@/components/learner/enrol-button';
import { enrolmentsApi } from '@/lib/enrolments-api';

const push = vi.fn();
let signedIn = true;

vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace: vi.fn() }) }));
vi.mock('@clerk/nextjs', () => ({ useAuth: () => ({ isSignedIn: signedIn }) }));
vi.mock('@/lib/enrolments-api', () => ({
  enrolmentsApi: { enrol: vi.fn(), mine: vi.fn() },
  enrolErrorText: () => 'This course needs to be paid for first.',
}));

const renderButton = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <EnrolButton slug="ui-ux-design-systems" />
    </QueryClientProvider>
  );

describe('Learner — one-click enrolment (SCRUM-31)', () => {
  beforeEach(() => {
    push.mockReset();
    vi.mocked(enrolmentsApi.enrol).mockReset();
    signedIn = true;
  });

  it('enrols a signed-in learner and opens the course player', async () => {
    vi.mocked(enrolmentsApi.enrol).mockResolvedValue({ message: 'Enrolled successfully', enrolment: {} as never });
    renderButton();
    fireEvent.click(screen.getByRole('button', { name: 'Enroll for Free' }));
    expect(screen.getByRole('button', { name: 'Enrolling…' })).toBeDisabled();
    await waitFor(() => expect(push).toHaveBeenCalledWith('/learn/ui-ux-design-systems'));
    expect(enrolmentsApi.enrol).toHaveBeenCalledWith('ui-ux-design-systems');
  });

  it('sends a signed-out visitor to sign in, then back to the course', () => {
    signedIn = false;
    renderButton();
    fireEvent.click(screen.getByRole('button', { name: 'Enroll for Free' }));
    expect(push).toHaveBeenCalledWith('/sign-in?redirect_url=%2Fcourses%2Fui-ux-design-systems');
    expect(enrolmentsApi.enrol).not.toHaveBeenCalled();
  });

  it('says why when enrolling fails, and lets them try again', async () => {
    vi.mocked(enrolmentsApi.enrol).mockRejectedValue(new Error('403'));
    renderButton();
    fireEvent.click(screen.getByRole('button', { name: 'Enroll for Free' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('This course needs to be paid for first.');
    expect(screen.getByRole('button', { name: 'Enroll for Free' })).toBeEnabled();
    expect(push).not.toHaveBeenCalled();
  });
});
