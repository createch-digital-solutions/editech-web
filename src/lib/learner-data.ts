/**
 * Learner-area types and formatting helpers. Everything shown comes from the API (see courses-api.ts
 * and GET /auth/me); screens whose backend module does not exist yet (quizzes, certificates, badges,
 * the AI coach) show an empty state rather than sample content.
 */

export type CourseBadge = 'Bestseller' | 'New' | 'Free';
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface Lesson {
  id: string;
  title: string;
  /** "14:10" */
  duration: string;
  seconds: number;
  done?: boolean;
  /** Free to watch before enrolling. */
  preview?: boolean;
  /** Not watchable by this viewer (not enrolled). */
  locked?: boolean;
  videoUrl?: string;
}

export interface CurriculumSection {
  title: string;
  /** "3 lessons · 45 min" */
  summary: string;
  lessons: Lesson[];
}

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  instructor: string;
  /** 0–5 */
  rating: number;
  /** "2.3k" */
  students: string;
  /** In NGN; 0 = free. */
  price: number;
  image: string;
  imageAlt: string;
  badge?: CourseBadge;
  category: string;
  level?: CourseLevel;
  /** Short description: catalogue search and list view. */
  description?: string;
  /** ISO date; sorts "Newest". */
  createdAt?: string;
  lessons?: number;
  durationMinutes?: number;
}

/** 150 → "2h 30m", 45 → "45m". */
export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h ? (m ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

/** 850 → "14:10". */
export const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export interface CourseDetail extends CourseSummary {
  fullTitle: string;
  description: string;
  level: CourseLevel;
  originalPrice?: number;
  ratingsCount: string;
  studentsCount: string;
  /** "1h 8m", or empty when unknown. */
  duration: string;
  updated: string;
  instructorTitle: string;
  instructorBio: string;
  instructorRating: number;
  /** Missing when the instructor has no photo the site can load; show their initials instead. */
  instructorImage?: string;
  outcomes: string[];
  curriculum: CurriculumSection[];
  /** The signed-in learner's enrolment, when they have one. */
  enrolment?: { status: string; progress: number; enrolledAt?: string };
}

/** "₦15,000", or "Free". */
export const formatPrice = (naira: number) => (naira === 0 ? 'Free' : `₦${naira.toLocaleString('en-NG')}`);

export const LEVEL_LABELS: Record<CourseLevel, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

/** "Kofi Mensah" → "KM"; titles such as "Dr." are skipped. */
export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^[a-z]/i.test(w) && !w.endsWith('.'))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

// --- Shapes for screens whose API does not exist yet --------------------------------

export interface QuizQuestion {
  prompt: string;
  /** A word in the prompt shown as code. */
  code?: string;
  options: string[];
  answer: number;
}

export interface Quiz {
  title: string;
  seconds: number;
  questions: QuizQuestion[];
}

export interface Certificate {
  id: string;
  courseSlug: string;
  courseTitle: string;
  issued: string;
  completionTime: string;
  quizAverage: string;
  lessonsWatched: string;
  xpEarned: string;
  achievements: { name: string; emoji: string }[];
}
