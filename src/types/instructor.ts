/**
 * Instructor course authoring contracts (createch-api `src/modules/courses/instructor-courses.controller.ts`
 * and `src/modules/instructor`), mirrored locally.
 */

export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type OutcomeTag = 'GET_A_JOB' | 'GET_PROMOTED' | 'START_FREELANCING' | 'CHANGE_CAREERS';
export type LessonType = 'VIDEO' | 'TEXT' | 'QUIZ';
export type AuthoringStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED';

/** POST /instructor/courses and PATCH /instructor/courses/:id. Price is in NGN: 0 (free) or at least 1,000. */
export interface CourseDetailsInput {
  title: string;
  description?: string;
  level?: CourseLevel;
  category?: string;
  outcomeTag?: OutcomeTag;
  price?: number;
  thumbnailUrl?: string;
  tags?: string[];
}

/** POST /instructor/courses → the new draft. */
export interface CreatedCourse {
  id: string;
  slug: string;
  status: AuthoringStatus;
}

/** POST /instructor/courses/:id/sections → the section. */
export interface CreatedSection {
  id: string;
  courseId: string;
  title: string;
  position: number;
}

/** POST /instructor/sections/:id/lessons. `videoDuration` is in seconds. */
export interface LessonInput {
  title: string;
  type?: LessonType;
  videoUrl?: string;
  videoDuration?: number;
  content?: string;
  isPreview?: boolean;
}

/** POST /instructor/sections/:id/lessons → the lesson. */
export interface CreatedLesson {
  id: string;
  sectionId: string;
  title: string;
  position: number;
  type: LessonType;
  videoUrl: string | null;
  videoDuration: number;
  isPreview: boolean;
}

/** POST /instructor/lessons/:id/upload-url → where to PUT the video file (valid for `expiresIn` seconds). */
export interface LessonUploadUrl {
  uploadUrl: string;
  key: string;
  expiresIn: number;
  lessonId: string;
}

/** POST /instructor/courses/:id/submit → the course is now PENDING admin review. */
export interface SubmittedCourse {
  courseId: string;
  status: AuthoringStatus;
  message: string;
}
