import type { Metadata } from 'next';
import { CourseBuilder } from './course-builder';

export const metadata: Metadata = { title: 'Create a Course — Createch Elevate' };

/** /portal/courses/new — the course builder: details, curriculum, then submit for review. */
export default function NewCoursePage() {
  return <CourseBuilder />;
}
