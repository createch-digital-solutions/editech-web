import { ApiClientError, apiClient } from '@/lib/api-client';
import type { EnrolResult, Enrolment } from '@/types/enrollment';

/** Learner enrolment calls (the browser's Clerk session supplies the token). */
export const enrolmentsApi = {
  /** Enrols the signed-in learner (course id or slug); returns the enrolment, new or existing. */
  enrol: (course: string) => apiClient.post<EnrolResult>(`/learner/courses/${encodeURIComponent(course)}/enroll`),
  /** The signed-in learner's courses with their progress, newest enrolment first. */
  mine: () => apiClient.get<Enrolment[]>('/learner/enrolments'),
};

/** Plain words for the enrol endpoint's errors. */
export function enrolErrorText(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.code === 'PAYMENT_REQUIRED') return 'This course needs to be paid for first.';
    if (err.code === 'COURSE_NOT_PUBLISHED') return "This course isn't open for enrolment yet.";
    if (err.code === 'COURSE_NOT_FOUND') return "We couldn't find this course.";
    if (err.status === 401) return 'Your session has ended. Please sign in again.';
  }
  return "We couldn't enrol you just now. Please try again.";
}
