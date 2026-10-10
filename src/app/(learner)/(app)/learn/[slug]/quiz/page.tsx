import type { Metadata } from 'next';
import { QuizView } from './quiz-view';

export const metadata: Metadata = { title: 'Quiz — Createch Elevate' };

/**
 * /learn/[slug]/quiz — the quiz for the learner's current lesson.
 * TODO: Load questions from and submit answers to the quizzes module once it exists.
 */
export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <QuizView courseSlug={slug} />;
}
