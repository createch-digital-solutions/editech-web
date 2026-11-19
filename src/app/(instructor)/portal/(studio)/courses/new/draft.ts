import type { CourseDetailsInput, CourseLevel, CourseOutlineSuggestion, LessonType, OutcomeTag } from '@/types/instructor';

/** The fields of the Details step as typed (price and tags stay text until saved). */
export interface DetailsForm {
  title: string;
  description: string;
  category: string;
  level: CourseLevel | '';
  outcomeTag: OutcomeTag | '';
  free: boolean;
  price: string;
  thumbnailUrl: string;
  tags: string;
}

/** `none` = no video yet (or its upload failed), `link` = a pasted link, `uploaded` = a file in storage. */
export type VideoState = 'none' | 'link' | 'uploaded';

export interface DraftLesson {
  id: string;
  title: string;
  type: LessonType;
  seconds: number;
  isPreview: boolean;
  video: VideoState;
}

export interface DraftSection {
  id: string;
  title: string;
  lessons: DraftLesson[];
}

/** A lesson the AI suggested, waiting for the instructor to keep, rename or drop it. `minutes` is its estimate. */
export interface OutlineLesson {
  key: string;
  title: string;
  type: LessonType;
  minutes: number;
  summary: string;
  keep: boolean;
}

/** A suggested section; `createdId` once it exists on the API, so a retry adds to it instead of making another. */
export interface OutlineSection {
  key: string;
  title: string;
  keep: boolean;
  createdId?: string;
  lessons: OutlineLesson[];
}

/**
 * The course being built. The API has no endpoint to read an instructor's draft back yet, so what has
 * been saved to it is kept here (and in the browser) so a refresh doesn't lose the work. `outline` is
 * the AI's suggested curriculum until the instructor adds it or discards it.
 */
export interface Draft {
  courseId?: string;
  slug?: string;
  details: DetailsForm;
  sections: DraftSection[];
  outline?: OutlineSection[];
  submitted?: boolean;
}

export const emptyDraft = (): Draft => ({
  details: { title: '', description: '', category: '', level: '', outcomeTag: '', free: false, price: '', thumbnailUrl: '', tags: '' },
  sections: [],
});

export const CATEGORIES = ['AI & Machine Learning', 'Business & Finance', 'Data Science', 'DevOps & Cloud', 'UI/UX Design', 'Web Development'];

export const LEVELS: { value: CourseLevel; label: string }[] = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

export const OUTCOMES: { value: OutcomeTag; label: string }[] = [
  { value: 'GET_A_JOB', label: 'Get a job' },
  { value: 'GET_PROMOTED', label: 'Get promoted' },
  { value: 'START_FREELANCING', label: 'Start freelancing' },
  { value: 'CHANGE_CAREERS', label: 'Change careers' },
];

export const MIN_PRICE = 1000;

/** The Details form as the API expects it; empty choices are left out. */
export function toCourseInput(d: DetailsForm): CourseDetailsInput {
  return {
    title: d.title.trim(),
    description: d.description.trim() || undefined,
    category: d.category || undefined,
    level: d.level || undefined,
    outcomeTag: d.outcomeTag || undefined,
    price: d.free ? 0 : Number(d.price.replace(/[^\d]/g, '')),
    thumbnailUrl: d.thumbnailUrl.trim() || undefined,
    tags: d.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
  };
}

/** The AI names categories freely ("Backend Development"); this picks the closest one we list, if any. */
function closestCategory(name: string): string | undefined {
  const rules: [RegExp, string][] = [
    [/\b(ai|artificial|machine learning|ml|deep learning|llm|nlp)\b/i, 'AI & Machine Learning'],
    [/data|analytic|sql|statistic|pandas/i, 'Data Science'],
    [/devops|cloud|aws|azure|docker|kubernetes|infrastructure/i, 'DevOps & Cloud'],
    [/design|ui|ux|figma|product design/i, 'UI/UX Design'],
    [/business|finance|marketing|management|entrepreneur|sales|accounting/i, 'Business & Finance'],
    [/web|front|back|full.?stack|javascript|typescript|react|node|software|programming|mobile|development/i, 'Web Development'],
  ];
  return CATEGORIES.find((c) => c.toLowerCase() === name.toLowerCase()) ?? rules.find(([pattern]) => pattern.test(name))?.[1];
}

/** The details form filled from an AI suggestion; price, cover image and anything it can't map stay as they were. */
export function detailsFromSuggestion(s: CourseOutlineSuggestion, current: DetailsForm): DetailsForm {
  return {
    ...current,
    title: s.title,
    description: s.description,
    category: closestCategory(s.category) ?? current.category,
    level: LEVELS.some((l) => l.value === s.level) ? s.level : current.level,
    outcomeTag: OUTCOMES.some((o) => o.value === s.outcomeTag) ? s.outcomeTag : current.outcomeTag,
    tags: s.tags.join(', '),
  };
}

/** The AI's sections and lessons, all kept to start with, ready for the instructor to review. */
export function outlineFromSuggestion(s: CourseOutlineSuggestion): OutlineSection[] {
  return [...s.sections]
    .sort((a, b) => a.position - b.position)
    .map((section, i) => ({
      key: `s${i}`,
      title: section.title,
      keep: true,
      lessons: [...section.lessons]
        .sort((a, b) => a.position - b.position)
        .map((l, j) => ({ key: `s${i}l${j}`, title: l.title, type: l.type, minutes: l.estimatedDuration, summary: l.contentSummary, keep: l.type !== 'QUIZ' })),
    }));
}

/** Quiz lessons can't be saved until the API has quizzes, so only video and text lessons get added. */
export const canAdd = (lesson: OutlineLesson) => lesson.type !== 'QUIZ';

const storageKey = (userId: string) => `createch:course-draft:${userId}`;

export function loadDraft(userId: string): Draft {
  try {
    const saved = localStorage.getItem(storageKey(userId));
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<Draft>;
      const empty = emptyDraft();
      return { ...empty, ...parsed, details: { ...empty.details, ...parsed.details }, sections: parsed.sections ?? [], outline: parsed.outline };
    }
  } catch {
    // Private mode or a damaged entry: start fresh.
  }
  return emptyDraft();
}

export function saveDraft(userId: string, draft: Draft) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(draft));
  } catch {
    // Storage full or blocked: the draft lives only in this tab.
  }
}

export function clearDraft(userId: string) {
  try {
    localStorage.removeItem(storageKey(userId));
  } catch {
    // Nothing to clear.
  }
}

export const lessonCount = (sections: DraftSection[]) => sections.reduce((n, s) => n + s.lessons.length, 0);
export const totalSeconds = (sections: DraftSection[]) => sections.reduce((n, s) => n + s.lessons.reduce((m, l) => m + l.seconds, 0), 0);

/** "1h 05m", "12m", "45s". */
export function formatLength(seconds: number) {
  if (seconds <= 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h) return `${h}h ${String(m).padStart(2, '0')}m`;
  return m ? `${m}m` : `${seconds}s`;
}

/** Shared field styles for the builder's forms. */
export const labelClass = 'block font-body text-[14px] font-semibold text-[#3d2b1f]';
export const inputClass =
  'mt-2 h-11 w-full rounded-xl border border-[#e8d5bb] bg-[#fffdf9] px-4 font-body text-[15px] text-[#1c0e04] placeholder:text-[#a89282] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15';
export const hintClass = 'mt-1.5 font-body text-[13px] text-[#a08a78]';
export const secondaryButton =
  'inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#e8d5bb] bg-white px-4 font-body text-[14px] font-semibold text-[#3d2b1f] transition-colors hover:bg-[#fdf6ec] disabled:cursor-not-allowed disabled:opacity-60';
