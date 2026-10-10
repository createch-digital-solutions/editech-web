import type { Metadata } from 'next';
import { CoachView } from './coach-view';

export const metadata: Metadata = { title: 'AI Coach — Createch Elevate' };

/** /coach — Aria, the AI learning coach, with the lesson the learner is on. */
export default function CoachPage() {
  return <CoachView />;
}
