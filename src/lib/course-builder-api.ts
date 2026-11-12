import { ApiClientError, apiClient } from '@/lib/api-client';
import type {
  CourseDetailsInput,
  CreatedCourse,
  CreatedLesson,
  CreatedSection,
  LessonInput,
  LessonUploadUrl,
  SubmittedCourse,
} from '@/types/instructor';

/** Course authoring calls (instructor role; the browser's Clerk session supplies the token). */
export const courseBuilderApi = {
  createCourse: (details: CourseDetailsInput) => apiClient.post<CreatedCourse>('/instructor/courses', details),
  updateCourse: (courseId: string, details: CourseDetailsInput) => apiClient.patch<CreatedCourse>(`/instructor/courses/${courseId}`, details),
  addSection: (courseId: string, title: string) => apiClient.post<CreatedSection>(`/instructor/courses/${courseId}/sections`, { title }),
  addLesson: (sectionId: string, lesson: LessonInput) => apiClient.post<CreatedLesson>(`/instructor/sections/${sectionId}/lessons`, lesson),
  submitCourse: (courseId: string) => apiClient.post<SubmittedCourse>(`/instructor/courses/${courseId}/submit`),
};

/**
 * Uploads a lesson's video straight to storage: asks the API for a signed upload link, PUTs the file
 * there (reporting progress from 0 to 1), then tells the API the upload is done. Resolves with the
 * stored video's key.
 */
export async function uploadLessonVideo(lessonId: string, file: File, onProgress: (fraction: number) => void): Promise<string> {
  const contentType = file.type || 'video/mp4';
  const { uploadUrl, key } = await apiClient.post<LessonUploadUrl>(`/instructor/lessons/${lessonId}/upload-url`, { contentType });

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(file);
  });

  await apiClient.post(`/instructor/lessons/${lessonId}/upload-complete`, { key });
  return key;
}

/** A video file's length in whole seconds, read in the browser; 0 when it can't be read. */
export function videoFileDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    const done = (seconds: number) => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(seconds) ? Math.round(seconds) : 0);
    };
    video.onloadedmetadata = () => done(video.duration);
    video.onerror = () => done(0);
    video.src = url;
  });
}

/** Plain words for the API's authoring errors. */
export function builderErrorText(err: unknown): string {
  if (err instanceof ApiClientError) {
    switch (err.code) {
      case 'INSTRUCTOR_NOT_APPROVED':
        return 'Your instructor account has not been approved yet. You can create courses once it is.';
      case 'PRICE_BELOW_MINIMUM':
        return 'The price must be at least ₦1,000, or make the course free.';
      case 'COURSE_MISSING_THUMBNAIL':
        return 'Add a cover image before submitting.';
      case 'COURSE_HAS_NO_LESSONS':
        return 'Add at least one lesson before submitting.';
      case 'COURSE_ALREADY_SUBMITTED':
        return 'This course has already been submitted for review.';
      case 'NOT_COURSE_OWNER':
      case 'FORBIDDEN':
        return "You don't have permission to change this course.";
    }
    if (err.status === 401) return 'Your session has ended. Please sign in again.';
    if (err.status >= 500) return 'Our server had a problem. Please try again in a moment.';
    return err.message;
  }
  return err instanceof Error && err.message ? err.message : 'Something went wrong. Please try again.';
}
