import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ListChecks } from 'lucide-react';
import { EmptyPage } from '@/components/learner/empty-page';
import { getCourse } from '@/lib/courses-api';

export const metadata: Metadata = { title: 'Quiz — Createch Elevate' };

/**
 * /learn/[slug]/quiz — the quiz for the learner's current lesson.
 * TODO: Load questions from the quizzes module once it has endpoints and render them with QuizView.
 */
export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();
  return (
    <EmptyPage
      icon={<ListChecks className="h-9 w-9" strokeWidth={1.8} />}
      title="No quiz yet"
      message={`Quizzes for ${course.title} will appear here once the instructor adds them.`}
      action={{ href: `/learn/${course.slug}`, label: 'Back to the lessons' }}
    />
  );
}
