import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeaturesSection } from '@/components/landing/features-section';
import { PopularCourses } from '@/components/landing/popular-courses';
import type { CourseSummary } from '@/lib/learner-data';

const course: CourseSummary = {
  id: 'c1',
  slug: 'ui-ux-design-systems',
  title: 'UI/UX Design Systems',
  instructor: 'Chidi Eze',
  rating: 4.9,
  students: '3.2k',
  price: 0,
  image: '/learner/course-placeholder.svg',
  imageAlt: 'Cover image for UI/UX Design Systems',
  badge: 'Free',
  category: 'ui-ux-design',
};

describe('Public Route Group — HomePage sections', () => {
  it('renders the features section', () => {
    render(<FeaturesSection />);
    expect(screen.getByText('Everything you need to level up')).toBeInTheDocument();
  });

  it('lists popular courses from the API, linking to each course', () => {
    render(<PopularCourses courses={[course]} />);
    expect(screen.getByText('Popular Courses')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'UI/UX Design Systems' })).toHaveAttribute('href', '/courses/ui-ux-design-systems');
  });

  it('is hidden when there are no courses', () => {
    const { container } = render(<PopularCourses courses={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
