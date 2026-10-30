/**
 * Sample learner-area content from the Figma designs.
 *
 * The backend has courses (GET /courses…) but no enrolments, progress, XP, badges, certificates, quizzes,
 * AI coach or payments yet, so those screens render this data. Courses fall back to it while the API
 * returns no published courses. Replace each block with its endpoint as the backend ships it.
 */

export type CourseBadge = 'Bestseller' | 'New' | 'Free';
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface Lesson {
  id: string;
  title: string;
  /** "14:10" */
  duration: string;
  done?: boolean;
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

export interface CourseDetail extends CourseSummary {
  fullTitle: string;
  description: string;
  level: CourseLevel;
  originalPrice?: number;
  ratingsCount: string;
  studentsCount: string;
  duration: string;
  updated: string;
  instructorTitle: string;
  instructorBio: string;
  instructorRating: number;
  instructorImage: string;
  outcomes: string[];
  curriculum: CurriculumSection[];
}

/** "₦15,000", or "Free". */
export const formatPrice = (naira: number) => (naira === 0 ? 'Free' : `₦${naira.toLocaleString('en-NG')}`);

export const LEVEL_LABELS: Record<CourseLevel, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

/** Catalogue categories (the sample catalogue counts its courses in each). */
export const CATEGORIES = [
  { slug: 'web-development', label: 'Web Development' },
  { slug: 'ai-machine-learning', label: 'AI & Machine Learning' },
  { slug: 'data-science', label: 'Data Science' },
  { slug: 'ui-ux-design', label: 'UI/UX Design' },
  { slug: 'mobile-development', label: 'Mobile Development' },
  { slug: 'devops-cloud', label: 'DevOps & Cloud' },
  { slug: 'business-finance', label: 'Business & Finance' },
];

const img = {
  react: '/learner/course-react.jpg',
  ai: '/learner/course-ai.png',
  node: '/learner/course-node.jpg',
  uiux: '/learner/course-uiux.jpg',
  dataScience: '/learner/course-data-science.jpg',
};

/** "A hands-on introduction to node.js, taught by Bola James with real projects from African tech teams." */
const intro = (topic: string, instructor: string) =>
  `A hands-on introduction to ${topic}, taught by ${instructor} with real projects from African tech teams.`;

export const SAMPLE_COURSES: CourseSummary[] = [
  { id: 'c-react', slug: 'react-for-beginners', title: 'React for Beginners', instructor: 'Kofi Mensah', rating: 4.7, students: '2.3k', price: 15000, image: img.react, imageAlt: 'Kofi Mensah reacting with delight at his computer', badge: 'Bestseller', category: 'web-development', level: 'INTERMEDIATE', createdAt: '2026-03-02', lessons: 24, durationMinutes: 330, description: 'Master React hooks, components, and state management. Build 5 real projects — including a fintech dashboard and a job board.' },
  { id: 'c-ai', slug: 'ai-engineering-with-python', title: 'AI Engineering with Python', instructor: 'Amara Osei', rating: 4.7, students: '2.3k', price: 25000, image: img.ai, imageAlt: 'Amara Osei smiling at her desk', badge: 'New', category: 'ai-machine-learning', level: 'INTERMEDIATE', createdAt: '2026-09-20', lessons: 18, durationMinutes: 270, description: intro('AI engineering with Python: LLMs, embeddings and production AI pipelines', 'Amara Osei') },
  { id: 'c-node', slug: 'nodejs-fundamentals', title: 'Node.js Fundamentals', instructor: 'Bola James', rating: 4.7, students: '2.3k', price: 18000, image: img.node, imageAlt: 'Bola James helping a student at a laptop', category: 'web-development', level: 'BEGINNER', createdAt: '2026-04-11', lessons: 12, durationMinutes: 150, description: intro('Node.js, Express and REST API design', 'Bola James') },
  { id: 'c-uiux', slug: 'ui-ux-design-systems', title: 'UI/UX Design Systems', instructor: 'Chidi Eze', rating: 4.7, students: '2.3k', price: 0, image: img.uiux, imageAlt: 'A designer working on a laptop in a bright office', badge: 'Free', category: 'ui-ux-design', level: 'ADVANCED', createdAt: '2026-05-08', lessons: 9, durationMinutes: 131, description: intro('design systems: tokens, components and documentation in Figma', 'Chidi Eze') },
  { id: 'c-ds', slug: 'data-science-101', title: 'Data Science 101', instructor: 'Kofi M.', rating: 4.7, students: '2.3k', price: 20000, image: img.dataScience, imageAlt: 'An instructor explaining a concept to a group', category: 'data-science', level: 'BEGINNER', createdAt: '2026-02-14', lessons: 16, durationMinutes: 240, description: intro('data science with Python, pandas and visualisation', 'Kofi Mensah') },
  { id: 'c-devops', slug: 'devops-with-docker', title: 'DevOps with Docker', instructor: 'Amara O.', rating: 4.7, students: '2.3k', price: 22000, image: img.react, imageAlt: 'A developer reacting to a successful deploy', category: 'devops-cloud', level: 'INTERMEDIATE', createdAt: '2026-06-30', lessons: 14, durationMinutes: 200, description: intro('containers, Docker Compose and deploying to the cloud', 'Amara Osei') },
  { id: 'c-python', slug: 'python-mastery', title: 'Python Mastery', instructor: 'Kofi M.', rating: 4.7, students: '2.3k', price: 18000, image: img.react, imageAlt: 'Kofi Mensah at his computer', badge: 'Bestseller', category: 'ai-machine-learning', level: 'INTERMEDIATE', createdAt: '2026-01-19', lessons: 30, durationMinutes: 480, description: intro('Python, from the basics to automation and APIs', 'Kofi Mensah') },
  { id: 'c-figma', slug: 'ui-ux-with-figma', title: 'UI/UX with Figma', instructor: 'Chidi E.', rating: 4.7, students: '2.3k', price: 15000, image: img.uiux, imageAlt: 'A designer working on a laptop', category: 'ui-ux-design', level: 'BEGINNER', createdAt: '2026-08-05', lessons: 10, durationMinutes: 165, description: intro('UI/UX design in Figma: wireframes, prototypes and user testing', 'Chidi Eze') },
];

/** Dashboard "Recommended for You". */
export const SAMPLE_RECOMMENDED: CourseSummary[] = [
  { ...SAMPLE_COURSES[1], title: 'AI Engineering' },
  SAMPLE_COURSES[6],
  { ...SAMPLE_COURSES[4], instructor: 'Bola J.', price: 0, badge: 'Free' },
  SAMPLE_COURSES[7],
];

const reactCurriculum: CurriculumSection[] = [
  {
    title: 'Section 1: Getting Started',
    summary: '3 lessons · 45 min',
    lessons: [
      { id: 'introduction', title: 'Introduction', duration: '3:24', done: true },
      { id: 'setup-and-tools', title: 'Setup & Tools', duration: '8:10', done: true },
      { id: 'first-component', title: 'First Component', duration: '12:45', done: true },
    ],
  },
  {
    title: 'Section 2: Core Hooks',
    summary: '4 lessons · 1h 20m',
    lessons: [
      { id: 'usestate-deep-dive', title: 'useState Deep Dive', duration: '11:20', done: true },
      { id: 'useeffect-patterns', title: 'useEffect Patterns', duration: '14:10' },
      { id: 'usecontext', title: 'useContext', duration: '9:55' },
      { id: 'useref-and-others', title: 'useRef & others', duration: '12:30' },
    ],
  },
  {
    title: 'Section 3: Advanced Patterns',
    summary: '5 lessons · 2h 10m',
    lessons: [
      { id: 'custom-hooks', title: 'Custom Hooks', duration: '24:15' },
      { id: 'performance', title: 'Performance & Memoisation', duration: '27:40' },
      { id: 'data-fetching', title: 'Fetching Data from REST APIs', duration: '26:05' },
      { id: 'component-libraries', title: 'Reusable Component Libraries', duration: '25:30' },
      { id: 'deploying', title: 'Deploying to Vercel & Netlify', duration: '26:30' },
    ],
  },
];

/** Course detail for any sample slug (the designs only show React for Beginners in full). */
export function sampleCourseDetail(slug: string): CourseDetail | null {
  const summary = [...SAMPLE_COURSES, ...SAMPLE_RECOMMENDED].find((c) => c.slug === slug);
  if (!summary) return null;
  const isReact = summary.slug === 'react-for-beginners';
  return {
    ...summary,
    fullTitle: isReact ? 'React for Beginners: Build Real Apps' : summary.title,
    description: summary.description ?? intro(summary.title.toLowerCase(), summary.instructor),
    level: summary.level ?? 'INTERMEDIATE',
    originalPrice: summary.price ? Math.round(summary.price / 0.6 / 1000) * 1000 : undefined,
    rating: isReact ? 4.8 : summary.rating,
    ratingsCount: '2,341',
    studentsCount: '12,450',
    duration: '8h 30m',
    updated: 'Jul 2026',
    instructorTitle: 'Senior Engineer · 8 yrs exp',
    instructorBio:
      'ex-Andela, Flutterwave. 12,000+ students. Kofi teaches engineering the way he wishes someone taught him when he was learning in Accra.',
    instructorRating: 4.8,
    instructorImage: '/learner/instructor-kofi.jpg',
    outcomes: [
      'Build React apps from scratch',
      'Master useState & useEffect',
      'Manage state with Context API',
      'Deploy to Vercel & Netlify',
      'Fetch data from REST APIs',
      'Build reusable component libs',
    ],
    curriculum: reactCurriculum,
  };
}

// --- The learner -----------------------------------------------------------------

export const SAMPLE_LEARNER = {
  firstName: 'Adaeze',
  lastName: 'Okafor',
  email: 'adaeze@example.com',
  username: 'adaeze_o',
  avatar: '/learner/avatar-adaeze.jpg',
  tier: 'Pro Learner',
  location: 'Lagos, Nigeria',
  level: 7,
  levelName: 'Advanced',
  xp: 4250,
  xpToNextLevel: 750,
  levelProgress: 85,
  streak: 14,
  bestStreak: 21,
  badgesEarned: 18,
  badgesThisMonth: 4,
  certificates: 3,
  rank: 42,
  lessonsDueToday: 2,
};

export interface InProgressCourse {
  slug: string;
  title: string;
  currentLesson: string;
  progress: number;
  image: string;
  /** Progress bar colour. */
  tone: 'orange' | 'green' | 'navy';
}

export const SAMPLE_IN_PROGRESS: InProgressCourse[] = [
  { slug: 'react-for-beginners', title: 'React for Beginners', currentLesson: 'useEffect Patterns', progress: 68, image: img.react, tone: 'orange' },
  { slug: 'nodejs-fundamentals', title: 'Node.js Fundamentals', currentLesson: 'REST API Design', progress: 31, image: img.node, tone: 'green' },
  { slug: 'typescript-mastery', title: 'TypeScript Mastery', currentLesson: 'Generics & Utilities', progress: 12, image: img.ai, tone: 'navy' },
];

export interface Badge {
  name: string;
  emoji: string;
  description: string;
  earned: boolean;
  /** Card tint and title colour of an earned badge. */
  tone?: 'gold' | 'orange' | 'navy' | 'green' | 'amber' | 'forest';
}

export const SAMPLE_BADGES: Badge[] = [
  { name: 'Gye Nyame', emoji: '🏆', description: 'Top 5% this month', earned: true, tone: 'gold' },
  { name: 'Aseda', emoji: '🔥', description: '30-day streak', earned: true, tone: 'orange' },
  { name: 'Sankofa', emoji: '⚡', description: 'Course in 1 day', earned: true, tone: 'navy' },
  { name: 'Aya', emoji: '🌿', description: '100% on 5 quizzes', earned: true, tone: 'green' },
  { name: 'First Light', emoji: '🌟', description: 'Completed course 1', earned: true, tone: 'amber' },
  { name: 'Nkosuo', emoji: '🎓', description: 'Earned certificate', earned: true, tone: 'forest' },
  { name: 'Perfection', emoji: '💯', description: '100% on quiz', earned: false },
  { name: 'Pioneer', emoji: '🚀', description: 'Joined early 2026', earned: false },
  { name: 'Agya', emoji: '👑', description: 'Reach rank #1', earned: false },
  { name: 'Diamond', emoji: '💎', description: 'Level 10', earned: false },
  { name: 'Pan-Africa', emoji: '🌍', description: '10 countries', earned: false },
  { name: 'Nana Nyame', emoji: '🤖', description: 'Complete AI path', earned: false },
];

// --- Course player, quiz, certificate ---------------------------------------------

export const SAMPLE_PLAYER = {
  courseSlug: 'react-for-beginners',
  courseTitle: 'React for Beginners',
  sectionTitle: 'Section 2: Core Hooks',
  lessonsCount: 12,
  totalDuration: '8h 30m',
  currentLessonId: 'useeffect-patterns',
  /** Position in the current lesson, seconds. */
  position: 358,
};

export interface QuizQuestion {
  prompt: string;
  /** A word in the prompt shown as code. */
  code?: string;
  options: string[];
  answer: number;
}

export const SAMPLE_QUIZ = {
  title: 'useEffect Patterns — Quiz',
  seconds: 5 * 60,
  questions: [
    { prompt: 'Which hook should hold a value that changes what is rendered?', code: 'useState', options: ['useState', 'useRef', 'useMemo', 'useId'], answer: 0 },
    { prompt: 'When does {code} run relative to the browser paint?', code: 'useEffect', options: ['After the browser paints', 'Before any hooks run', 'Synchronously during render', 'Only on the first mount'], answer: 0 },
    { prompt: 'What does an empty dependency array tell {code}?', code: 'useEffect', options: ['Run after every render', 'Run once, after the first render', 'Never run', 'Run before the first render'], answer: 1 },
    { prompt: 'What is the function returned from an effect used for?', options: ['Rendering children', 'Cleaning up subscriptions and timers', 'Memoising values', 'Catching errors'], answer: 1 },
    { prompt: 'Which hook runs before the browser paints, to measure the DOM?', code: 'useLayoutEffect', options: ['useEffect', 'useLayoutEffect', 'useTransition', 'useDeferredValue'], answer: 1 },
  ] satisfies QuizQuestion[],
};

export const SAMPLE_CERTIFICATE = {
  id: 'CE-2026-A7F3',
  courseSlug: 'react-for-beginners',
  courseTitle: 'React for Beginners: Build Real Apps',
  issued: 'July 24, 2026',
  completionTime: '3 weeks',
  quizAverage: '87%',
  lessonsWatched: '12/12',
  xpEarned: '+1,200 XP',
  achievements: [
    { name: 'Graduate', emoji: '🏆' },
    { name: 'Aseda', emoji: '🔥' },
    { name: 'Sankofa', emoji: '⚡' },
    { name: 'Aya', emoji: '🌿' },
  ],
};

// --- AI coach -------------------------------------------------------------------

export const SAMPLE_COACH = {
  lessonTitle: 'useEffect Patterns',
  lessonMeta: 'Section 2 · 14:10 min',
  watched: 42,
  suggestions: ['What is the cleanup function?', 'What goes in the deps array?', 'When does useEffect fire?', 'Common useEffect mistakes'],
  greeting: (firstName: string) =>
    `Ẹ káàárọ̀, ${firstName}! 👋 I'm Aria, your AI learning coach. I can see you're on Lesson 2 — useEffect Patterns. You're doing amazing — 68% through the course!\n\nWhat would you like help with today?`,
  conversation: [
    { from: 'learner' as const, text: 'When should I use useEffect vs useLayoutEffect?' },
    {
      from: 'aria' as const,
      text: "Great question — this trips a lot of developers! 🎯\n\n**useEffect** (use 95% of the time):\n• Runs after the browser paints\n• Perfect for data fetching, subscriptions, event listeners\n• Non-blocking — won't slow your UI\n\n**useLayoutEffect** (use sparingly):\n• Runs before the browser paints — synchronously\n• Use when you need to read/mutate the DOM before paint (e.g. measuring element dimensions, preventing visual flicker)\n\nSimple rule: start with useEffect. Only switch to useLayoutEffect if you notice a visible flicker.",
    },
  ],
};

// --- Checkout -------------------------------------------------------------------

export const SAMPLE_PROMO = { code: 'CREATECH20', percent: 20 };
