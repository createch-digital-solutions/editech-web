/**
 * Learner enrolment contracts (createch-api `src/modules/learner`), mirrored locally.
 */

export type EnrolmentStatus = 'ACTIVE' | 'COMPLETED' | 'REFUNDED';

/** The course as it comes with an enrolment. `totalDuration` is in minutes. */
export interface EnrolmentCourse {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  thumbnailUrl: string | null;
  category?: string | null;
  level?: string | null;
  totalLessons: number;
  totalDuration: number;
  averageRating?: number;
  reviewCount?: number;
  instructorName?: string;
  instructorAvatar?: string | null;
}

/** GET /learner/enrolments (newest first) and GET /learner/enrolments/:courseIdOrSlug (or null). */
export interface Enrolment {
  id: string;
  courseId: string;
  status: EnrolmentStatus;
  /** 0–100. */
  progress: number;
  /** `progress`, rounded. */
  progressPercentage: number;
  enrolledAt: string;
  completedAt: string | null;
  course: EnrolmentCourse;
}

/**
 * POST /learner/courses/:courseIdOrSlug/enroll. Free courses enrol at once; paid ones answer 403
 * PAYMENT_REQUIRED until paid for. Enrolling again returns the existing enrolment.
 */
export interface EnrolResult {
  message: string;
  enrolment: Enrolment;
}
