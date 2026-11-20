import type { CourseSummary } from '@/lib/learner-data';
import type { LearnerProfile } from '@/types/user';

/** The catalogue categories (as slugs) each onboarding topic covers. */
const TOPIC_CATEGORIES: Record<string, string[]> = {
  'Product Management': ['business-finance'],
  'UI/UX Design': ['ui-ux-design'],
  'Web Development': ['web-development'],
  'Data & AI': ['data-science', 'ai-machine-learning'],
  'Business & Strategy': ['business-finance'],
  Marketing: ['business-finance'],
};

/** Goals that point towards particular subjects; the others ("Personal growth") leave it to the topics. */
const GOAL_CATEGORIES: Record<string, string[]> = {
  'Land a tech job': ['web-development', 'data-science', 'devops-cloud'],
  'Learn AI & ML': ['ai-machine-learning', 'data-science'],
  'Build a startup': ['business-finance', 'web-development'],
  'Earn side income': ['web-development', 'ui-ux-design'],
};

const LEVEL_ORDER = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

type Preferences = Pick<LearnerProfile, 'interests' | 'skillLevel' | 'careerGoal'> | null | undefined;

/** The goals picked in onboarding, saved as one comma-separated line. */
const goalsOf = (careerGoal?: string | null) =>
  (careerGoal ?? '')
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean);

/** Whether the learner told us anything in onboarding that recommendations can use. */
export const hasPreferences = (p: Preferences) => !!p && ((p.interests?.length ?? 0) > 0 || goalsOf(p.careerGoal).length > 0 || !!p.skillLevel);

/**
 * Courses for this learner, best first, from the topics, goals and level they picked in onboarding:
 * a course in a chosen topic counts most, then each goal it serves, then being at their level (one level
 * away counts a little; a much harder course counts against it). Ties go to the higher rated course.
 * Courses in `exclude` (already enrolled) are left out.
 */
export function recommendFor(courses: CourseSummary[], prefs: Preferences, exclude: Set<string> = new Set()): CourseSummary[] {
  const topicCats = new Set((prefs?.interests ?? []).flatMap((t) => TOPIC_CATEGORIES[t] ?? []));
  const goals = goalsOf(prefs?.careerGoal).map((g) => GOAL_CATEGORIES[g] ?? []);
  const level = LEVEL_ORDER.indexOf(prefs?.skillLevel ?? '');

  const score = (c: CourseSummary) => {
    let s = 0;
    // A topic they chose outweighs even two goals together.
    if (topicCats.has(c.category)) s += 5;
    // Each goal the course serves adds to it, so one that suits two goals beats one that suits one.
    s += 2 * goals.filter((cats) => cats.includes(c.category)).length;
    const courseLevel = LEVEL_ORDER.indexOf(c.level ?? '');
    if (level >= 0 && courseLevel >= 0) {
      const gap = courseLevel - level;
      s += gap === 0 ? 2 : Math.abs(gap) === 1 ? 1 : gap > 0 ? -2 : 0;
    }
    return s + c.rating / 10;
  };

  return courses
    .filter((c) => !exclude.has(c.id))
    .map((c) => ({ c, s: score(c) }))
    .sort((a, b) => b.s - a.s)
    .map(({ c }) => c);
}

/** "Web Development and Data & AI" — what the recommendations are based on, for the dashboard. */
export function preferenceSummary(p: Preferences): string | null {
  const topics = p?.interests ?? [];
  const level = p?.skillLevel ? p.skillLevel.charAt(0) + p.skillLevel.slice(1).toLowerCase() : null;
  const listed = topics.length > 2 ? `${topics.slice(0, 2).join(', ')} and ${topics.length - 2} more` : topics.join(' and ');
  if (listed && level) return `Based on your interest in ${listed} · ${level}`;
  if (listed) return `Based on your interest in ${listed}`;
  if (level) return `Picked for your level · ${level}`;
  return null;
}
