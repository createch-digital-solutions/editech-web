import { describe, expect, it } from 'vitest';
import { hasPreferences, preferenceSummary, recommendFor } from '@/lib/recommendations';
import type { CourseSummary } from '@/lib/learner-data';

const course = (id: string, category: string, level: CourseSummary['level'], rating = 4.5): CourseSummary => ({
  id,
  slug: id,
  title: id,
  instructor: 'Kofi Mensah',
  rating,
  students: '1k',
  price: 15000,
  image: '/learner/course-placeholder.svg',
  imageAlt: id,
  category,
  level,
});

// The live catalogue's categories, as slugs.
const catalogue = [
  course('react-for-beginners', 'web-development', 'BEGINNER', 4.8),
  course('ai-engineering-with-python', 'ai-machine-learning', 'INTERMEDIATE', 4.7),
  course('data-science-101', 'data-science', 'BEGINNER', 4.6),
  course('devops-with-docker', 'devops-cloud', 'ADVANCED', 4.9),
  course('ui-ux-design-systems', 'ui-ux-design', 'BEGINNER', 4.5),
  course('product-management-fundamentals', 'business-finance', 'BEGINNER', 4.4),
];

describe('Recommendations from onboarding choices', () => {
  it('puts the chosen topics first, at the learner’s level', () => {
    const ids = recommendFor(catalogue, { interests: ['Data & AI'], skillLevel: 'BEGINNER', careerGoal: 'Personal growth' }).map((c) => c.id);
    expect(ids.slice(0, 2)).toEqual(['data-science-101', 'ai-engineering-with-python']);
    // Far too hard for a beginner, so it sinks to the bottom.
    expect(ids.at(-1)).toBe('devops-with-docker');
  });

  it('maps Product Management and Marketing to the business courses, and a goal adds its subjects', () => {
    const ids = recommendFor(catalogue, { interests: ['Product Management'], skillLevel: 'BEGINNER', careerGoal: 'Land a tech job, Learn AI & ML' }).map((c) => c.id);
    expect(ids[0]).toBe('product-management-fundamentals');
    expect(ids.slice(1, 3)).toEqual(['data-science-101', 'react-for-beginners']);
  });

  it('leaves out courses the learner is already in', () => {
    const ids = recommendFor(catalogue, { interests: ['Web Development'] }, new Set(['react-for-beginners'])).map((c) => c.id);
    expect(ids).not.toContain('react-for-beginners');
  });

  it('knows when there is nothing to go on, and says what it used', () => {
    expect(hasPreferences(null)).toBe(false);
    expect(hasPreferences({ interests: [], careerGoal: null, skillLevel: null })).toBe(false);
    expect(preferenceSummary({ interests: ['Web Development', 'Data & AI'], skillLevel: 'BEGINNER' })).toBe('Based on your interest in Web Development and Data & AI · Beginner');
    expect(preferenceSummary({ interests: ['Web Development', 'Data & AI', 'Marketing'] })).toBe('Based on your interest in Web Development, Data & AI and 1 more');
  });
});
