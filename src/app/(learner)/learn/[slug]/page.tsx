import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCourse } from '@/lib/courses-api';
import { SAMPLE_IN_PROGRESS, SAMPLE_PLAYER, sampleCourseDetail } from '@/lib/learner-data';
import { PlayerView } from './player-view';

export const metadata: Metadata = { title: 'Course Player — Createch Elevate' };

/** /learn/[slug] — watch a course's lessons. */
export default async function CoursePlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let course = (await getCourse(slug))?.course ?? null;

  // Courses in progress on the dashboard that are not in the sample catalogue play the sample lessons.
  if (!course) {
    const inProgress = SAMPLE_IN_PROGRESS.find((c) => c.slug === slug);
    const base = sampleCourseDetail(SAMPLE_PLAYER.courseSlug);
    if (!inProgress || !base) notFound();
    course = { ...base, slug, title: inProgress.title, fullTitle: inProgress.title, image: inProgress.image };
  }
  if (course.curriculum.length === 0) course = { ...course, curriculum: sampleCourseDetail(SAMPLE_PLAYER.courseSlug)!.curriculum };

  const isSampleStart = slug === SAMPLE_PLAYER.courseSlug;
  return (
    <PlayerView
      course={course}
      startLessonId={isSampleStart ? SAMPLE_PLAYER.currentLessonId : (course.curriculum.flatMap((s) => s.lessons).find((l) => !l.done)?.id ?? '')}
      startPosition={isSampleStart ? SAMPLE_PLAYER.position : 0}
    />
  );
}
