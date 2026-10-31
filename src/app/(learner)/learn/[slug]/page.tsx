import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCourse, getPreviewVideos } from '@/lib/courses-api';
import { viewerToken } from '@/lib/viewer-token';
import { PlayerView } from './player-view';

export const metadata: Metadata = { title: 'Course Player — Createch Elevate' };

/**
 * /learn/[slug] — watch a course's lessons. The free preview lessons play their videos
 * (GET /courses/{slug}/preview); the rest unlock with an enrolment.
 * TODO: Play every lesson for enrolled learners once the API serves their video links.
 */
export default async function CoursePlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [course, videos] = await Promise.all([viewerToken().then((token) => getCourse(slug, token)), getPreviewVideos(slug)]);
  if (!course) notFound();

  const withVideos = {
    ...course,
    curriculum: course.curriculum.map((s) => ({ ...s, lessons: s.lessons.map((l) => ({ ...l, videoUrl: videos[l.id] })) })),
  };
  const lessons = withVideos.curriculum.flatMap((s) => s.lessons);
  return <PlayerView course={withVideos} startLessonId={(lessons.find((l) => l.videoUrl) ?? lessons[0])?.id ?? ''} />;
}
